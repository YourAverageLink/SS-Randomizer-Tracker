import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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

export default defineConfig(() => {
    return {
        base: '/SS-Randomizer-Tracker/',
        build: {
            outDir: 'build',
        },
        plugins: [react()],
        test: {
            globals: true,
            environment: 'jsdom',
        },
    };
});
