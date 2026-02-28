import Select, { Props as SelectProps } from 'react-select';
import { useColorModeValue } from '@chakra-ui/react';

export interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps extends SelectProps<Option, false> {
    // Add any custom props here if needed
}

export const CustomSelect = (props: CustomSelectProps) => {
    const isDark = useColorModeValue(false, true);

    const selectStyles = {
        control: (base: any) => ({
            ...base,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'white',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: '0.75rem',
            padding: '4px',
            '&:hover': {
                borderColor: '#03a9f4',
            },
            ...props.styles?.control?.(base, {} as any)
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: isDark ? '#171923' : 'white',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
            ...props.styles?.menu?.(base, {} as any)
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected
                ? '#03a9f4'
                : state.isFocused
                    ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')
                    : 'transparent',
            color: state.isSelected ? 'white' : (isDark ? 'white' : 'black'),
            padding: '12px',
            ...props.styles?.option?.(base, state)
        }),
        singleValue: (base: any) => ({
            ...base,
            color: isDark ? 'white' : 'black',
            ...props.styles?.singleValue?.(base, {} as any)
        }),
        placeholder: (base: any) => ({
            ...base,
            color: 'gray.500',
            ...props.styles?.placeholder?.(base, {} as any)
        }),
    };

    return (
        <Select
            {...props}
            styles={selectStyles}
        />
    );
};
