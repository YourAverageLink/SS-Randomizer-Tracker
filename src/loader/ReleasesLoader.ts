import _ from 'lodash';
import { useCallback, useId, useSyncExternalStore } from 'react';
import { dedupePromise } from '../utils/Promises';

/*
 * This module implements a small GitHub releases API caching layer.
 * GitHub's REST API has a very low rate limit (60/hour/IP address),
 * shared across all requests behind this IP. As a result, we try
 * very hard to make as few requests as possible:
 *   * Not make more than 1 request/hour
 *   * Store response in localstorage
 */

const ONE_HOUR = 1000 * 60 * 60;

const listeners: { [id: string]: () => void } = {};

function subscribe(id: string, callback: () => void) {
    listeners[id] = callback;
    void checkForUpdates();
    return () => delete listeners[id];
}

function notify() {
    for (const cb of Object.values(listeners)) {
        cb();
    }
}

export function useReleases() {
    const id = useId();
    const doSubscribe = useCallback(
        (callback: () => void) => subscribe(id, callback),
        [id],
    );
    return useSyncExternalStore(doSubscribe, getStoredData);
}


function getStoredRelease(): { isOutdated: boolean, releases: string[] | undefined } {
    const storedTime = localStorage.getItem('githubReleasesDataTime');
    if (storedTime !== null) {
        const lastFetch = parseInt(storedTime, 10);
        const storedReleases = localStorage.getItem('githubReleasesData');
        if (storedReleases !== null) {
            const isOutdated = !lastFetch || lastFetch + ONE_HOUR < Date.now();
            const releases = JSON.parse(storedReleases) as string[];
            return { releases, isOutdated };
        }
    }

    return { releases: undefined, isOutdated: true };
}

/**
 * React expects stores to return memoized objects
 */
const mapReleases = _.memoize(
    (releases: string[]) => ({
        latest: releases[0],
        releases,
    }),
    (x) => JSON.stringify(x),
);

function getStoredData() {
    const { releases } = getStoredRelease();
    return releases && mapReleases(releases);
}

/**
 * Get the latest release. Tries to fetch, so this will always
 * either return the latest release or throw an error.
 */
export async function getLatestRelease() {
    const { releases, isOutdated } = getStoredRelease();
    if (releases && !isOutdated) {
        return releases[0];
    }

    return (await fetchGithubReleases())[0];
}

async function checkForUpdates() {
    const { isOutdated } = getStoredRelease();
    if (isOutdated) {
        await fetchGithubReleases();
    }
}


interface GithubRelease {
    tag_name: string;
}

const fetchGithubReleases = dedupePromise(async () => {
    const response = await fetch(
        'https://api.github.com/repos/ssrando/ssrando/releases',
    );
    if (response.status !== 200) {
        throw new Error('Unknown error: ' + (await response.text()));
    }
    // drop excess data
    const data: string[] = ((await response.json()) as GithubRelease[]).map(
        (release) => release['tag_name'],
    );
    localStorage.setItem('githubReleasesData', JSON.stringify(data));
    localStorage.setItem('githubReleasesDataTime', Date.now().toString(10));
    notify();

    return data;
});
