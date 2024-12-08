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
            'react/jsx-filename-extension': [
                'error',
                {
                    extensions: ['.jsx', 'tsx'],
                },
            ],

            'max-len': 0,

            'no-param-reassign': ['error'],
            'no-bitwise': ['off'],
            'react/require-default-props': ['off'],
            'react/react-in-jsx-scope': 'off',

            '@eslint-react/prefer-read-only-props': 'off',
            '@eslint-react/no-array-index-key': 'off',
            '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'off',

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
            'sonarjs/prefer-read-only-props': 'off',
            'sonarjs/prefer-regexp-exec': 'off',
            'sonarjs/max-params': 'off',
            'sonarjs/different-types-comparison': 'off',
            'sonarjs/no-nested-assignment': 'off',
            'sonarjs/no-unused-expressions': 'off',
            'sonarjs/todo-tag': 'off',
        },
    },
);
