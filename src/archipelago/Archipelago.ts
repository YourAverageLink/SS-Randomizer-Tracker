import { Client, type ConnectedPacket, type MessageNode } from 'archipelago.js';
import { invert } from 'es-toolkit';
import type { ReactNode } from 'react';
import React from 'react';
import type { ColorScheme } from '../customization/ColorScheme';
import { setStoredArchipelagoServer } from '../LocalStorage';
import { isItem, type InventoryItem } from '../logic/Inventory';
import {
    sothItemReplacement,
    triforceItemReplacement,
} from '../logic/TrackerModifications';
import { defaultSettings } from '../permalink/Settings';
import type {
    AllTypedOptions,
    OptionDefs,
    OptionsCommand,
    OptionValue,
} from '../permalink/SettingsTypes';
import type { TrackerState } from '../tracker/Slice';
import { convertError } from '../utils/Errors';

function kebabToSnake(input: string): string {
    return input.replace(/-/g, '_');
}

function optionIndicesToOptions(
    optionDefs: OptionDefs,
    loadedOptions: Record<string, number | string[]>,
): AllTypedOptions {
    const settings: Partial<Record<OptionsCommand, OptionValue>> =
        defaultSettings(optionDefs);
    // Excluded locations are handled differently, and starting items are just manually sent by AP
    settings['excluded-locations'] = [];
    settings['starting-items'] = [];
    for (const option of optionDefs) {
        const loadedVal = loadedOptions[kebabToSnake(option.command)];
        if (option.permalink !== false && loadedVal !== undefined) {
            if (option.command === 'excluded-locations') {
                settings[option.command] = loadedVal;
            } else if (option.type === 'boolean') {
                settings[option.command] = loadedVal === 1;
            } else if (option.type === 'int') {
                settings[option.command] = loadedVal;
            } else if (option.type === 'multichoice') {
                // shouldn't be possible
            } else if (option.type === 'singlechoice') {
                settings[option.command] = option.choices[loadedVal as number];
            }
        }
    }
    // console.log(settings);
    return settings as AllTypedOptions;
}

export type ClientConnectionState =
    | {
          state: 'loggedOut';
          error?: string;
      }
    | {
          state: 'loggingIn';
      }
    | {
          state: 'loggedIn';
          serverName: string;
          slotName: string;
      };

export class ColoredText {
    constructor(
        public text: string,
        public color?: keyof ColorScheme,
        public customColor?: string, // for color nodes
        public tooltip?: ReactNode,
    ) {}
}

export type ClientMessage = ColoredText[];

const MAX_MESSAGES = 1000;

export class APClientManager {
    client?: Client;
    loadedSettings?: AllTypedOptions;
    idToLocation?: Record<number, string>;
    idToItem?: Record<number, string>;
    connectedData?: ConnectedPacket;
    inventory: TrackerState['inventory'] = {};
    checkedLocations: string[] = [];
    checkedCubes: number = 0;
    messages: ClientMessage[] = [];
    requiredDungeons: string[] = [];
    cubeDataKey?: string;
    resolveLocations?: (locs: string[]) => void;
    resolveItems?: (items: TrackerState['inventory']) => void;
    changeStage?: (stage: string) => void;
    resolveCubes?: (cubeflags: number) => void;
    onMessage?: (messages: ClientMessage[]) => void;

    status: ClientConnectionState = { state: 'loggedOut' };
    statusSubscriptions: Set<() => void> = new Set();

    add(item: InventoryItem, count: number = 1) {
        this.inventory[item] ??= 0;
        this.inventory[item] += count;
    }

    isHooked(): boolean {
        return this.client !== undefined && this.client.socket.connected;
    }

    getLoadedSettings(): AllTypedOptions | undefined {
        return this.loadedSettings;
    }

    setLocationCallback(func: (locs: string[]) => void) {
        this.resolveLocations = func;
        this.resolveLocations(this.checkedLocations);
    }

    setItemCallback(func: (items: TrackerState['inventory']) => void) {
        this.resolveItems = func;
        this.resolveItems(this.inventory);
    }

    setNewStageCallback(func: (stage: string) => void) {
        this.changeStage = func;
    }

    setCubeCallback(func: (cubeflags: number) => void) {
        this.resolveCubes = func;
        this.resolveCubes(this.checkedCubes);
    }

    setOnMessage(func: (messages: ClientMessage[]) => void) {
        this.onMessage = func;
        this.onMessage(this.messages);
    }

    sendMessage(message: string) {
        if (this.isHooked()) {
            this.client!.messages.say(message);
        }
    }

    resetClient() {
        if (this.isHooked()) {
            this.client!.socket.disconnect();
            this.client = undefined;
            this.loadedSettings = undefined;
            this.connectedData = undefined;
            this.inventory = {};
            this.checkedLocations = [];
            this.checkedCubes = 0;
            this.messages = [];
            this.cubeDataKey = undefined;
            this.resolveLocations = undefined;
            this.resolveItems = undefined;
            this.changeStage = undefined;
            this.resolveCubes = undefined;

            this.status = { state: 'loggedOut' };
            this.notifyStatusSubscribers();
        }
    }

    getStatusString(): string {
        switch (this.status.state) {
            case 'loggedOut':
                if (this.status.error) {
                    return `Error: ${this.status.error}`;
                } else {
                    return 'Disconnected, please connect.';
                }
            case 'loggingIn':
                return 'Connecting...';
            case 'loggedIn':
                return `Connected to ${this.status.serverName} as ${this.status.slotName}`;
        }
    }

    getStatus(): ClientConnectionState {
        return this.status;
    }

    subscribeToStatus(callback: () => void): () => void {
        this.statusSubscriptions.add(callback);
        return () => {
            this.statusSubscriptions.delete(callback);
        };
    }

    private notifyStatusSubscribers() {
        for (const subscriber of this.statusSubscriptions) {
            subscriber();
        }
    }

    async login(
        server: string,
        slot: string,
        password: string,
        optionDefs: OptionDefs,
    ): Promise<boolean> {
        if (this.status.state === 'loggingIn') {
            return false;
        } else if (this.status.state === 'loggedIn') {
            this.resetClient();
        }

        const client = new Client();

        client.socket.on('connected', (content) => {
            this.connectedData = content;
            setStoredArchipelagoServer(server);
            const slotData = content.slot_data as Record<
                string,
                number | string[]
            >;
            this.checkedLocations = [
                ...this.connectedData.checked_locations.map(
                    (location_id) => this.idToLocation![location_id],
                ),
            ];
            this.loadedSettings = optionIndicesToOptions(optionDefs, slotData);
            this.resolveLocations?.(this.checkedLocations);
            this.requiredDungeons =
                (slotData['required_dungeons'] as string[]) ?? [];
            client.socket.send({
                cmd: 'GetDataPackage',
                games: ['Skyward Sword'],
            });
            this.cubeDataKey = `skyward_sword_cubes_${content.team}_${content.slot}`;
            client.socket.send({
                cmd: 'SetNotify',
                keys: [this.cubeDataKey],
            });
            client.socket.send({
                cmd: 'Get',
                keys: [this.cubeDataKey],
            });
        });

        client.socket.on('dataPackage', (content) => {
            const ssData = content.data.games['Skyward Sword'];
            console.log(ssData);
            if (ssData !== undefined) {
                this.idToLocation = invert<string, number>(
                    ssData.location_name_to_id,
                );
                this.idToItem = invert<string, number>(ssData.item_name_to_id);
            }
        });

        client.messages.on('message', (_, messageData) => {
            const convertNode = (node: MessageNode): ColoredText => {
                switch (node.type) {
                    case 'item': {
                        let item_color: keyof ColorScheme = 'apFiller';
                        let item_class = 'normal';
                        if (node.item.progression) {
                            item_color = 'apProgression';
                            item_class = 'progression';
                        } else if (node.item.trap) {
                            item_color = 'apTrap';
                            item_class = 'trap';
                        } else if (node.item.useful) {
                            item_color = 'apUseful';
                            item_class = 'useful';
                        } else if (node.item.filler) {
                            item_class = 'filler';
                        }
                        return {
                            text: node.text,
                            color: item_color,
                            tooltip: `Item Class: ${item_class}`,
                        };
                    }
                    case 'location':
                        return {
                            text: node.text,
                            color: 'apLocation',
                        };
                    case 'color':
                        return {
                            text: node.text,
                            customColor: node.color,
                        };
                    case 'text':
                        return {
                            text: node.text,
                        };
                    case 'entrance':
                        return {
                            text: node.text,
                            color: 'apEntrance',
                        };
                    case 'player': {
                        const player_color =
                            this.connectedData?.slot === node.player.slot
                                ? 'apThisPlayer'
                                : 'apOtherPlayer';
                        let player_type = 'player';
                        switch (node.player.type) {
                            case 0:
                                player_type = 'spectator';
                                break;
                            case 2:
                                player_type = 'group';
                                break;
                            default:
                                break;
                        }
                        const player_tooltip: React.ReactNode = [
                            `Game: ${node.player.game}`,
                            React.createElement('br', { key: 'break' }),
                            `Type: ${player_type}`,
                        ];
                        return {
                            text: node.text,
                            color: player_color,
                            tooltip: player_tooltip,
                        };
                    }
                }
            };
            const msg = messageData.map((node) => convertNode(node));
            this.messages.push(msg);
            // Don't keep track of too many messages at a time
            if (this.messages.length > MAX_MESSAGES) {
                this.messages.shift();
            }
            this.onMessage?.(this.messages);
        });

        client.socket.on('receivedItems', (content) => {
            for (const netItem of content.items) {
                const item = this.idToItem![netItem.item];
                if (item.includes(sothItemReplacement)) {
                    this.add(sothItemReplacement);
                } else if (item.includes(triforceItemReplacement)) {
                    this.add(triforceItemReplacement);
                } else if (
                    isItem(item) &&
                    (!item.includes('Pouch') ||
                        !this.inventory['Progressive Pouch'])
                ) {
                    this.add(item);
                }
            }
            this.resolveItems?.(this.inventory);
        });

        client.socket.on('roomUpdate', (content) => {
            if (content.checked_locations) {
                this.checkedLocations.push(
                    ...content.checked_locations.map(
                        (location_id) => this.idToLocation![location_id],
                    ),
                );
            }
            this.resolveLocations?.(this.checkedLocations);
        });

        client.socket.on('bounced', (content) => {
            const stage = content.data?.ss_stage_name;
            if (stage !== undefined) {
                this.changeStage?.(stage as string);
            }
        });

        client.socket.on('retrieved', (content) => {
            if (this.cubeDataKey !== undefined) {
                const new_cubes = content.keys[this.cubeDataKey];
                if (new_cubes !== undefined) {
                    this.checkedCubes = new_cubes as number;
                    this.resolveCubes?.(new_cubes as number);
                }
            }
        });

        client.socket.on('setReply', (content) => {
            if (this.cubeDataKey === content.key) {
                const new_cubes = content.value;
                if (new_cubes !== undefined) {
                    this.checkedCubes = new_cubes as number;
                    this.resolveCubes?.(new_cubes as number);
                }
            }
        });

        try {
            this.status = { state: 'loggingIn' };
            this.notifyStatusSubscribers();
            await client.login(server, slot, 'Skyward Sword', {
                tags: ['Tracker'],
                password: password,
                version: {
                    major: 0,
                    minor: 6,
                    build: 7,
                },
            });
            this.client = client;
            this.status = {
                state: 'loggedIn',
                serverName: server,
                slotName: slot,
            };
            this.notifyStatusSubscribers();
            return true;
        } catch (error: unknown) {
            this.status = { state: 'loggedOut', error: convertError(error) };
            this.notifyStatusSubscribers();
            return false;
        }
    }
}
