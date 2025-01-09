import { type StylesConfig } from 'react-select';

export function selectStyles<IsMulti extends boolean, Option>(): StylesConfig<
    Option,
    IsMulti
> {
    return {
        control: (baseStyles) => ({
            ...baseStyles,
            color: 'var(--scheme-text)',
            backgroundColor: 'var(--scheme-background)',
        }),
        menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: 'var(--scheme-background)',
            boxShadow:
                '0 0 0 1px color-mix(in srgb, var(--scheme-text) 20%, transparent), 0 4px 11px color-mix(in srgb, var(--scheme-text) 20%, transparent)',
        }),
        option: (baseStyles, state) => ({
            ...baseStyles,
            color: state.isFocused
                ? 'var(--scheme-background)'
                : 'var(--scheme-text)',
            backgroundColor: state.isFocused
                ? '#0d6efd'
                : 'var(--scheme-background)',
        }),
        singleValue: (baseStyles) => ({
            ...baseStyles,
            color: `color-mix(in srgb, var(--scheme-text) 90%, transparent)`,
        }),
    };
}
