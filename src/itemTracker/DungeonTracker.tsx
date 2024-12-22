import { CSSProperties } from 'react';

import Item from './Item';
import g1 from '../assets/bosses/g1.png';
import scaldera from '../assets/bosses/scaldera.png';
import moldarach from '../assets/bosses/moldarach.png';
import koloktos from '../assets/bosses/koloktos.png';
import tentalus from '../assets/bosses/tentalus.png';
import g2 from '../assets/bosses/g2.png';
import dreadfuse from '../assets/bosses/dreadfuse.png';

import noSmallKey from '../assets/dungeons/noSmallKey.png';
import oneSmallKey from '../assets/dungeons/1_smallKey.png';
import twoSmallKey from '../assets/dungeons/2_smallKey.png';
import threeSmallKey from '../assets/dungeons/3_smallKey.png';
import trialGate from '../assets/bosses/trialGate.png';
import faronTrialGate from '../assets/bosses/faronTrialGate.png';
import lanayruTrialGate from '../assets/bosses/lanayruTrialGate.png';
import eldinTrialGate from '../assets/bosses/eldinTrialGate.png';
import DungeonName from './items/dungeons/DungeonName';
import DungeonIcon from './items/dungeons/DungeonIcon';
import React from 'react';
import AreaCounters from '../locationTracker/AreaCounters';
import HintMarker from '../hints/HintMarker';
import { useSelector } from 'react-redux';
import { areasSelector, settingSelector } from '../tracker/selectors';
import {
    HintRegion,
    DungeonName as DungeonNameType,
    isDungeon,
} from '../logic/Locations';
import styles from './DungeonTracker.module.css';
import clsx from 'clsx';

const silentRealmData: Record<string, string> = {
    'Faron Silent Realm': faronTrialGate,
    'Eldin Silent Realm': eldinTrialGate,
    'Lanayru Silent Realm': lanayruTrialGate,
    'Skyloft Silent Realm': trialGate,
};

const dungeonData = {
    Skyview: {
        dungeonAbbr: 'SV',
        dungeonName: 'Skyview',
        bossIcon: g1,
    },
    'Earth Temple': {
        dungeonAbbr: 'ET',
        dungeonName: 'Earth Temple',
        bossIcon: scaldera,
    },
    'Lanayru Mining Facility': {
        dungeonAbbr: 'LMF',
        dungeonName: 'Lanayru Mining Facility',
        bossIcon: moldarach,
    },
    'Ancient Cistern': {
        dungeonAbbr: 'AC',
        dungeonName: 'Ancient Cistern',
        bossIcon: koloktos,
    },
    Sandship: {
        dungeonAbbr: 'SSH',
        dungeonName: 'Sandship',
        bossIcon: tentalus,
    },
    'Fire Sanctuary': {
        dungeonAbbr: 'FS',
        dungeonName: 'Fire Sanctuary',
        bossIcon: g2,
    },
    'Sky Keep': {
        dungeonAbbr: 'SK',
        dungeonName: 'Sky Keep',
        bossIcon: dreadfuse,
    },
} as const;

const smallKeyImages = [noSmallKey, oneSmallKey, twoSmallKey, threeSmallKey];

export default function DungeonTracker({
    setActiveArea,
    compact,
}: {
    setActiveArea: (area: string) => void;
    compact?: boolean;
}) {
    const areas = useSelector(areasSelector);
    const dungeons = areas.filter((a) =>
        isDungeon(a.name) && !a.hidden,
    ) as HintRegion<DungeonNameType>[];
    const silentRealms = areas.filter((a) => a.name.includes('Silent Realm'));

    const hideEtKeyPieces = useSelector(settingSelector('open-et'));

    const colspan2 = (atCol: number): CSSProperties => ({
        gridColumn: `${atCol + 1} / span 2`,
    });

    return (
        <div>
            <div
                className={clsx(styles.dungeons, {
                    [styles.sixDungeons]: dungeons.length === 6,
                    [styles.compact]: compact,
                })}
            >
                {dungeons.map((d, index) => {
                    const isSmallKeyHidden =
                        d.name === 'Earth Temple' && hideEtKeyPieces;
                    return (
                    <React.Fragment key={d.name}>
                        {!isSmallKeyHidden && (
                            <div className={styles.keyItem}>
                                <Item
                                    itemName={
                                        d.name !== 'Earth Temple'
                                            ? `${d.name} Small Key`
                                            : 'Key Piece'
                                    }
                                    images={
                                        d.name !== 'Earth Temple'
                                            ? smallKeyImages
                                            : undefined
                                    }
                                />
                            </div>
                        )}
                        <div
                            style={
                                isSmallKeyHidden
                                    ? colspan2(index * 2)
                                    : undefined
                            }
                            className={clsx(styles.keyItem, {[styles.wide]: isSmallKeyHidden})}
                        >
                            <Item
                                itemName={
                                    d.name !== 'Sky Keep'
                                        ? `${d.name} Boss Key`
                                        : 'Stone of Trials'
                                }
                            />
                        </div>
                    </React.Fragment>
                ); })}
                {dungeons.map((d, index) => (
                    <div style={colspan2(index * 2)} key={d.name}>
                        <DungeonName
                            setActiveArea={setActiveArea}
                            dungeonAbbr={dungeonData[d.name].dungeonAbbr}
                            dungeonName={d.name}
                        />
                    </div>
                ))}
                {!compact && (
                    <>
                        {dungeons.map((d, index) => (
                            <div key={d.name} style={colspan2(index * 2)}>
                                <DungeonIcon
                                    area={d.name}
                                    image={dungeonData[d.name].bossIcon}
                                    iconLabel={d.name}
                                    groupClicked={() => setActiveArea(d.name)}
                                />
                            </div>
                        ))}
                        {dungeons.map((d, index) => (
                            <div key={d.name} style={colspan2(index * 2)}>
                                <AreaCounters
                                    totalChecksLeftInArea={d.numChecksRemaining}
                                    totalChecksAccessible={
                                        d.numChecksAccessible
                                    }
                                />
                            </div>
                        ))}
                    </>
                )}
            </div>
            {!compact && (
                <div className={styles.trials}>
                    {silentRealms.map((a) => (
                        <div
                            className={styles.hintsMarker}
                            key={`hint-${a.name}`}
                        >
                            <HintMarker />
                        </div>
                    ))}
                    {silentRealms.map((a) => (
                        <DungeonIcon
                            key={`icon-${a.name}`}
                            image={silentRealmData[a.name]}
                            iconLabel={a.name}
                            area={a.name}
                            groupClicked={() => setActiveArea(a.name)}
                        />
                    ))}
                    {silentRealms.map((a) => (
                        <AreaCounters
                            key={`counters-${a.name}`}
                            totalChecksLeftInArea={a.numChecksRemaining}
                            totalChecksAccessible={a.numChecksAccessible}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
