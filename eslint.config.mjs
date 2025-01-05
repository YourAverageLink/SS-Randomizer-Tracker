import react from '@eslint-react/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import sonarjs from 'eslint-plugin-sonarjs';
import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { name: 'eslint/recommended', ...eslint.configs.recommended },
    reactPlugin.configs.flat['jsx-runtime'],
    {
        name: 'typescript-eslint/parser-options',
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    ...tseslint.configs.recommendedTypeChecked,
    { name: 'sonarjs/recommended', ...sonarjs.configs.recommended },
    {
        name: 'react',
        ...reactPlugin.configs.flat.recommended,
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        name: 'react-hooks',
        plugins: {
            'react-hooks': fixupPluginRules(reactHooks),
        },
        rules: reactHooks.configs.recommended.rules,
    },
    {
        name: 'jsx-a11y',
        files: ['**/*.tsx'],
        plugins: {
            'jsx-a11y': fixupPluginRules(jsxA11y),
        },
        rules: {
            'jsx-a11y/aria-props': 'error',
            'jsx-a11y/aria-proptypes': 'error',
            'jsx-a11y/aria-role': 'error',
            'jsx-a11y/aria-unsupported-elements': 'error',
            'jsx-a11y/autocomplete-valid': 'error',
            'jsx-a11y/label-has-associated-control': 'error',
            'jsx-a11y/no-noninteractive-element-interactions': 'error',
            'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
            'jsx-a11y/no-noninteractive-tabindex': 'error',
            'jsx-a11y/no-redundant-roles': 'error',
            'jsx-a11y/role-has-required-aria-props': 'error',
            'jsx-a11y/role-supports-aria-props': 'error',
        },
    },
    {
        name: 'eslint-react',
        ...react.configs['recommended-type-checked'],
    },
    {
        name: 'ss-randomizer-tracker-custom',
        rules: {
            'max-len': 0,
            'no-unused-vars': 'off',
            'no-param-reassign': ['error'],
            'no-bitwise': ['off'],
            eqeqeq: ['error', 'always'],
            'no-debugger': 'error',
            'no-implicit-coercion': 'error',
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['testing/*'],
                            message:
                                'You cannot use test helpers in regular code.',
                        },
                    ],
                    paths: [
                        {
                            name: 'es-toolkit',
                            importNames: [
                                'mapValues',
                                'isEmpty',
                                'noop',
                                'stubTrue',
                                'stubFalse',
                            ],
                            message: 'Please use functions from utils instead.',
                        },
                        {
                            name: 'es-toolkit',
                            importNames: [
                                'sortBy',
                            ],
                            message: 'Please use .sort with functions from utils/Compare',
                        },
                    ],
                },
            ],
            'no-restricted-globals': [
                'error',
                'alert',
                'confirm',
                'prompt',
                'name',
                'location',
                'history',
                'menubar',
                'scrollbars',
                'statusbar',
                'toolbar',
                'status',
                'closed',
                'frames',
                'length',
                'top',
                'opener',
                'parent',
                'origin',
                'external',
                'screen',
                'defaultstatus',
                'crypto',
                'close',
                'find',
                'focus',
                'open',
                'print',
                'scroll',
                'stop',
                'chrome',
                'caches',
                'scheduler',
            ],

            'react/require-default-props': ['off'],
            'react/react-in-jsx-scope': 'off',
            'react/jsx-filename-extension': [
                'error',
                {
                    extensions: ['.jsx', 'tsx'],
                },
            ],

            '@eslint-react/prefer-read-only-props': 'off',
            '@eslint-react/no-array-index-key': 'off',
            '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect':
                'off',

            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/unbound-method': 'off',

            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/rules-of-hooks': 'error',

            'sonarjs/cognitive-complexity': 'off',
            'sonarjs/function-return-type': 'off',
            'sonarjs/no-array-index-key': 'off',
            'sonarjs/no-duplicate-string': 'off',
            'sonarjs/no-nested-conditional': 'off',
            'sonarjs/no-nested-template-literals': 'off',
            'sonarjs/slow-regex': 'off',
            'sonarjs/prefer-read-only-props': 'off',
            'sonarjs/prefer-regexp-exec': 'off',
            'sonarjs/max-params': 'off',
            'sonarjs/different-types-comparison': 'off',
            'sonarjs/no-nested-assignment': 'off',
            'sonarjs/no-unused-expressions': 'off',
            'sonarjs/todo-tag': 'off',
        },
    },
    {
        name: 'tests',
        files: ['**/*.test.ts'],
        rules: {
            // We don't want to allow importing test modules in app modules, but of course you can do it in other test modules.
            'no-restricted-imports': 'off',
        },
    },
);
