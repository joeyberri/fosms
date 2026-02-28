import { Box, Heading, Text, Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: IconType;
    rightElement?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, icon, rightElement }: PageHeaderProps) => {
    return (
        <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'start', md: 'center' }}
            mb={10}
            as={MotionBox}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 } as any}
        >
            <Flex align="center">
                {icon && (
                    <Box p={3} bg={useColorModeValue('brand.50', 'whiteAlpha.100')} borderRadius="2xl" mr={4}>
                        <Icon as={icon} w={8} h={8} color="brand.500" />
                    </Box>
                )}
                <Box>
                    <Heading size="lg" fontWeight="extrabold">{title}</Heading>
                    {subtitle && <Text color="gray.500" mt={1}>{subtitle}</Text>}
                </Box>
            </Flex>
            {rightElement && (
                <Box mt={{ base: 4, md: 0 }}>
                    {rightElement}
                </Box>
            )}
        </Flex>
    );
};
