import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';
import { motion, HTMLMotionProps } from 'framer-motion';

const MotionBox = motion(Box);

type CombinedProps = BoxProps & HTMLMotionProps<'div'>;

interface PremiumCardProps extends CombinedProps {
    animate?: boolean;
}

export const PremiumCard = ({ children, animate = true, ...rest }: PremiumCardProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    // Use default padding if none provided
    const cardPadding = rest.p !== undefined ? rest.p : 8;

    if (animate) {
        return (
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 } as any}
                w="full"
                bg={bg}
                borderRadius="2xl"
                shadow="lg"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
                {...rest}
                p={cardPadding}
            >
                {children}
            </MotionBox>
        );
    }

    return (
        <Box
            bg={bg}
            borderRadius="2xl"
            shadow="lg"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            {...rest}
            p={cardPadding}
        >
            {children}
        </Box>
    );
};
