import eslint from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import { defineConfig } from "eslint/config";
import tseslint from 'typescript-eslint';

export default defineConfig(
    {
        ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/*.min.js', '**/*.js.map', '**/*.d.ts'],
    },
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    eslintPluginPrettier,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            // Style Rules
            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                {
                    accessibility: 'explicit',
                    overrides: {
                        constructors: 'no-public',
                    },
                },
            ],
            '@typescript-eslint/member-ordering': 'off',
            '@typescript-eslint/naming-convention': [
                'error',
                // Variables
                {
                    selector: 'variable',
                    modifiers: ['const'],
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                },
                // Parameters
                {
                    selector: 'parameter',
                    format: ['camelCase', 'PascalCase'],
                    leadingUnderscore: 'allow',
                },
                // Object properties (constants like DomEvent.MOUSE_DOWN)
                {
                    selector: 'objectLiteralProperty',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                },
                // Public members (instance or static) : camelCase or PascalCase
                {
                    selector: ['method', 'property'],
                    modifiers: ['public'],
                    format: ['camelCase', 'PascalCase'],
                    leadingUnderscore: 'forbid',
                },
                // Private static members : _PascalCase or _UPPER_CASE
                {
                    selector: ['method', 'property'],
                    modifiers: ['private', 'static'],
                    format: ['PascalCase', 'UPPER_CASE'],
                    leadingUnderscore: 'require',
                },
                // Protected static members : _PascalCase or _UPPER_CASE
                {
                    selector: ['method', 'property'],
                    modifiers: ['protected', 'static'],
                    format: ['PascalCase', 'UPPER_CASE'],
                    leadingUnderscore: 'require',
                },
                // Private instance members : _camelCase or _UPPER_CASE
                {
                    selector: ['method', 'property'],
                    modifiers: ['private'],
                    format: ['camelCase', 'UPPER_CASE'],
                    leadingUnderscore: 'require',
                },
                // Protected instance members : _camelCase or _UPPER_CASE
                {
                    selector: ['method', 'property'],
                    modifiers: ['protected'],
                    format: ['camelCase', 'UPPER_CASE'],
                    leadingUnderscore: 'require',
                },
                // Types
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],

            // Best Practices
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/require-await': 'warn',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                {
                    allowExpressions: false,
                    allowTypedFunctionExpressions: true,
                    allowHigherOrderFunctions: true,
                },
            ],

            // Prettier integration
            'prettier/prettier': 'warn',
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts', 'public/**'],
    }
);
