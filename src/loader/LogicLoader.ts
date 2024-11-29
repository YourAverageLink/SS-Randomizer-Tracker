import { load } from 'js-yaml';
import { RawLogic, RawPresets } from '../logic/UpstreamTypes';
import { MultiChoiceOption, OptionDefs } from '../permalink/SettingsTypes';
import { getLatestRelease } from './ReleasesLoader';

export const LATEST_STRING = 'Latest';

export type RemoteReference =
    | {
          type: 'latestRelease';
      }
    | {
          type: 'releaseVersion';
          versionTag: string;
      }
    | {
          type: 'forkBranch';
          author: string;
          repoName: string | undefined;
          branch: string;
      };

async function resolveRemote(ref: RemoteReference): Promise<[url: string, name: string]> {
    switch (ref.type) {
        case 'latestRelease':
            try {
                const latest = await getLatestRelease();
                return [`https://raw.githubusercontent.com/ssrando/ssrando/${latest}`, latest];
            } catch (e) {
                throw new Error(
                    'Could not retrieve latest release from GitHub: ' +
                        (e
                            ? typeof e === 'object' && 'message' in e
                                ? (e.message as string)
                                : JSON.stringify(e)
                            : 'Unknown error'),
                );
            }
        case 'releaseVersion':
            // Hack: This is a custom logic dump backported to 2.1.1
            if (ref.versionTag === 'v2.1.1') {
                return [`https://raw.githubusercontent.com/robojumper/ssrando/logic-v2.1.1`, formatRemote(ref)];
            }
            return [`https://raw.githubusercontent.com/ssrando/ssrando/${ref.versionTag}`, formatRemote(ref)];
        case 'forkBranch':
            return [
                `https://raw.githubusercontent.com/${ref.author}/${
                    ref.repoName ?? 'ssrando'
                }/${ref.branch}`,
                formatRemote(ref),
            ];
    }
}

export function formatRemote(ref: RemoteReference) {
    switch (ref.type) {
        case 'latestRelease':
            return LATEST_STRING;
        case 'releaseVersion':
            return ref.versionTag;
        case 'forkBranch':
            if (ref.repoName) {
                return `https://github.com/${ref.author}/${ref.repoName}/tree/${ref.branch}`;
            } else {
                return `${ref.author}/${ref.branch}`;
            }
    }
}

const prBranchPattern = /^https:\/\/github.com\/([^/]+)\/ssrando\/tree\/([^/]+)$/;
const extendedPrBranchPattern = /^https:\/\/github.com\/([^/]+)\/([^/]+)\/(?:tree|releases\/tag)\/([^/]+)$/;
const branchPattern = /^([^/]+)(?:[/|:])([^/]+)$/;
const versionPattern = /^v\d+\.\d+\.\d+$/;

export function parseRemote(remote: string): RemoteReference | undefined {
    // eslint-disable-next-line no-param-reassign
    remote = remote.trim();
    if (remote === LATEST_STRING) {
        return { type: 'latestRelease' };
    }
    if (remote.match(versionPattern)) {
        return { type: 'releaseVersion', versionTag: remote };
    }

    const prBranchMatch =
        remote.match(prBranchPattern) ?? remote.match(branchPattern);
    if (prBranchMatch) {
        return {
            type: 'forkBranch',
            author: prBranchMatch[1],
            branch: prBranchMatch[2],
            repoName: undefined,
        };
    }

    const extendedPrBranchMatch = remote.match(extendedPrBranchPattern);
    if (extendedPrBranchMatch) {
        return {
            type: 'forkBranch',
            author: extendedPrBranchMatch[1],
            branch: extendedPrBranchMatch[3],
            repoName: extendedPrBranchMatch[2],
        };
    }
}

const baseFileUrl = (remoteUrl: string, file: string) =>
    `${remoteUrl}/${file}`;

const loadFileFromUrl = async (url: string) => {
    const response = await fetch(url);
    if (response.status === 200) {
        return response.text();
    } else {
        throw new Error(`failed to fetch ${url}`);
    }
};

const loadFile = async (baseUrl: string, file: string) => {
    const fileUrl = baseFileUrl(baseUrl, file);
    return await loadFileFromUrl(fileUrl);
};

export async function loadRemoteLogic(
    remote: RemoteReference,
): Promise<[RawLogic, OptionDefs, RawPresets, string]> {
    const [baseUrl, remoteName] = await resolveRemote(remote);
    const loader = (file: string) => loadFile(baseUrl, file);

    return [
        ...(await getAndPatchLogic(loader)),
        remoteName,
    ];
}

export async function getAndPatchLogic(loader: (fileName: string) => Promise<string>) {
    const parseYaml = async <T, >(file: string) => {
        const text = await loader(file);
        return load(text) as T;
    }

    const parseJson = async <T, >(file: string) => {
        const text = await loader(file);
        return JSON.parse(text) as T;
    }

    const [logic, options, presets] = await Promise.all([
        parseYaml<RawLogic>('dump.yaml'),
        parseYaml<OptionDefs>('options.yaml'),
        parseJson<RawPresets>('gui/presets/default_presets.json'),
    ]);

    // We need to patch the "excluded locations" option with the actual checks from logic.
    const excludedLocsIndex = options.findIndex(
        (x) => x.command === 'excluded-locations' && x.type === 'multichoice',
    );

    const choices = Object.values(logic.checks).map((c) => c.short_name);

    const patchedOptions = options.slice();
    patchedOptions[excludedLocsIndex] = {
        ...(options[excludedLocsIndex] as MultiChoiceOption),
        choices,
    };

    return [
        logic,
        patchedOptions,
        presets,
    ] as const;
}
