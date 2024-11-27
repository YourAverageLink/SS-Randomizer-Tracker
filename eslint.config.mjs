import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import sonarjs from 'eslint-plugin-sonarjs';
import vitestGlobals from 'eslint-plugin-vitest-globals';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ['scripts/*'],
    },
    ...compat.extends(
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
        'plugin:vitest-globals/recommended',
    ),
    sonarjs.configs.recommended,
    {
        plugins: {
            react,
            'react-hooks': fixupPluginRules(reactHooks),
            '@typescript-eslint': typescriptEslint,
            'vitest-globals': vitestGlobals,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...vitestGlobals.environments.env.globals,
            },

            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },

                project: './tsconfig.json',
            },
        },

        settings: {
            react: {
                version: 'detect',
            },
        },

        rules: {
            'react/jsx-filename-extension': [
                'error',
                {
                    extensions: ['.jsx', 'tsx'],
                },
            ],

            'max-len': 0,
            'no-plusplus': ['off'],

            'no-param-reassign': ['error'],
            'no-mixed-operators': ['off'],
            'no-bitwise': ['off'],
            'react/require-default-props': ['off'],

            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/unbound-method': 'off',
            'no-unused-vars': 'off',
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/rules-of-hooks': 'error',
            'sonarjs/cognitive-complexity': 'off',
            'sonarjs/function-return-type': 'off',
            'sonarjs/no-array-index-key': 'off',
            'sonarjs/no-duplicate-string': 'off',
            'sonarjs/no-nested-conditional': 'off',
            'sonarjs/no-nested-template-literals': 'off',
            'sonarjs/slow-regex': 'off',
            'sonarjs/sonar-prefer-read-only-props': 'off',
            'sonarjs/sonar-prefer-regexp-exec': 'off',
            'sonarjs/sonar-max-params': 'off',
            'sonarjs/different-types-comparison': 'off',
            'sonarjs/no-nested-assignment': 'off',
            'sonarjs/no-unused-expressions': 'off',
            'sonarjs/todo-tag': 'off',
        },
    },
];
