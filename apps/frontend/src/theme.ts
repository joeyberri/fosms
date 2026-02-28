import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import type { Styles } from '@chakra-ui/theme-tools';

// 2. Add your color mode config
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e1f5fe',
    100: '#b3e5fc',
    200: '#81d4fa',
    300: '#4fc3f7',
    400: '#29b6f6',
    500: '#03a9f4',
    600: '#039be5',
    700: '#0288d1',
    800: '#0277bd',
    900: '#01579b',
  },
  accent: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0',
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
  }
};

const styles: Styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? '#0a0b10' : 'gray.50',
      transition: 'background-color 0.2s',
    },
    '::selection': {
      bg: 'brand.200',
      color: 'brand.900',
    },
  }),
};

const components = {
  Card: {
    variants: {
      glass: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'rgba(23, 25, 34, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          boxShadow: 'lg',
          borderRadius: '2xl',
        },
      }),
    },
  },
  Button: {
    baseStyle: {
      borderRadius: 'xl',
      fontWeight: 'bold',
      transition: 'all 0.2s',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
      }),
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  styles,
  components,
});

export default theme;
