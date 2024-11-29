import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import generateFile from 'vite-plugin-generate-file';
import sassDts from 'vite-plugin-sass-dts';
import makeManifest from './manifest.js';

// It'd be really nice to have polyfills actually working in Vite,
// but Vite can't polyfill the code in web workers so why bother
// https://github.com/vitejs/vite/issues/15990
/*
import browserslist from 'browserslist';
import legacy from '@vitejs/plugin-legacy';
import packageJson from './package.json';


const polyfills = legacy({
    modernTargets: browserslist(packageJson.browserslist),
    modernPolyfills: true,
    renderLegacyChunks: false,
});
*/

export default defineConfig(({ mode }) => {
    const baseUrl = mode === 'production' ? '/SS-Randomizer-Tracker' : '/';
    return {
        base: baseUrl,
        build: {
            outDir: 'build',
        },
        define: {
            $PUBLIC_URL: JSON.stringify(baseUrl),
        },
        plugins: [
            sassDts(),
            react(),
            generateFile({
                output: 'manifest.json',
                type: 'json',
                data: makeManifest(baseUrl),
            }),
        ],
        test: {
            globals: true,
            environment: 'jsdom',
        },
    };
});
