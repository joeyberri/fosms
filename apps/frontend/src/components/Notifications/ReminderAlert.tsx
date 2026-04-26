import React from 'react';
import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Box,
    VStack,
    HStack,
    useColorModeValue,
    IconButton,
    Flex,
    Button
} from '@chakra-ui/react';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import { trpc } from '../../utils/trpc';
import { useQueryClient } from '@tanstack/react-query';

interface ReminderAlertProps {
    notifications: any[];
}

const ReminderAlert = ({ notifications }: ReminderAlertProps) => {
    const queryClient = useQueryClient();
    const markAsRead = trpc.notification.markAsRead.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [['notification', 'getUnread']] });
        }
    });

    const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [['notification', 'getUnread']] });
        }
    });

    // All hooks must be called before any conditional returns
    const bg = useColorModeValue('brand.50', 'brand.900');
    const borderColor = useColorModeValue('brand.200', 'brand.700');

    if (notifications.length === 0) return null;

    return (
        <VStack spacing={4} align="stretch" mb={8}>
            {notifications.length > 1 && (
                <Flex justify="flex-end" px={2}>
                    <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="brand"
                        onClick={() => markAllAsRead.mutate()}
                        isLoading={markAllAsRead.isLoading}
                        leftIcon={<FiCheckCircle />}
                    >
                        Mark all as read
                    </Button>
                </Flex>
            )}
            {notifications.map((n) => (

                <Alert
                    key={n.id}
                    status="info"
                    variant="subtle"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    borderRadius="2xl"
                    py={4}
                    px={6}
                    bg={bg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    boxShadow="sm"
                >
                    <HStack spacing={4}>
                        <AlertIcon as={FiBell} color="brand.500" boxSize={5} />
                        <Box>
                            <AlertTitle fontSize="md" fontWeight="bold">
                                {n.type === 'SHIFT_REMINDER' ? 'Shift Reminder' : 'Important Alert'}
                            </AlertTitle>
                            <AlertDescription fontSize="sm" opacity={0.8}>
                                {n.message}
                            </AlertDescription>
                        </Box>
                    </HStack>
                    <IconButton
                        aria-label="Mark as read"
                        icon={<FiCheckCircle />}
                        variant="ghost"
                        colorScheme="brand"
                        borderRadius="full"
                        onClick={() => markAsRead.mutate({ id: n.id })}
                        isLoading={markAsRead.isLoading}
                    />
                </Alert>
            ))}
        </VStack>
    );
};

export default ReminderAlert;
