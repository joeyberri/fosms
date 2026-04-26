import React from 'react';
import {
    IconButton,
    Box,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    VStack,
    HStack,
    Text,
    Badge,
    Button,
    Divider,
    useColorModeValue,
    Flex,
    Icon,
} from '@chakra-ui/react';
import { FiBell, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { trpc } from '../../utils/trpc';
import { useQueryClient } from '@tanstack/react-query';

const NotificationBell = () => {
    const queryClient = useQueryClient();
    const { data: notifications = [] } = trpc.notification.getUnread.useQuery(undefined, {
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const markAsRead = trpc.notification.markAsRead.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [['notification', 'getUnread']] });
        },
    });

    const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [['notification', 'getUnread']] });
        },
    });

    const unreadCount = notifications.length;


    const popoverBg = useColorModeValue('white', 'gray.800');
    const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    const getIcon = (type: string) => {
        switch (type) {
            case 'SHIFT_REMINDER':
                return FiClock;
            case 'ADMIN_ALERT':
                return FiAlertCircle;
            default:
                return FiBell;
        }
    };

    const getColorScheme = (type: string) => {
        switch (type) {
            case 'SHIFT_REMINDER':
                return 'blue';
            case 'ADMIN_ALERT':
                return 'orange';
            default:
                return 'gray';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <Popover placement="bottom-end" isLazy>
            <PopoverTrigger>
                <Box position="relative" display="inline-block">
                    <IconButton
                        aria-label="Notifications"
                        icon={<FiBell />}
                        variant="ghost"
                        fontSize="20px"
                        borderRadius="full"
                        color={useColorModeValue('gray.600', 'gray.300')}
                        _hover={{
                            bg: useColorModeValue('gray.100', 'whiteAlpha.200'),
                            color: 'brand.500',
                        }}
                    />
                    {unreadCount > 0 && (
                        <Box
                            position="absolute"
                            top="6px"
                            right="6px"
                            bg="red.500"
                            color="white"
                            borderRadius="full"
                            w={unreadCount > 9 ? '20px' : '18px'}
                            h="18px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="10px"
                            fontWeight="bold"
                            lineHeight="1"
                            border="2px solid"
                            borderColor={useColorModeValue('white', 'gray.900')}
                            pointerEvents="none"
                            animation={unreadCount > 0 ? 'pulse 2s infinite' : undefined}
                            sx={{
                                '@keyframes pulse': {
                                    '0%': { boxShadow: '0 0 0 0 rgba(229, 62, 62, 0.5)' },
                                    '70%': { boxShadow: '0 0 0 8px rgba(229, 62, 62, 0)' },
                                    '100%': { boxShadow: '0 0 0 0 rgba(229, 62, 62, 0)' },
                                },
                            }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Box>
                    )}
                </Box>
            </PopoverTrigger>
            <PopoverContent
                bg={popoverBg}
                borderRadius="xl"
                shadow="2xl"
                border="1px solid"
                borderColor={borderColor}
                w="380px"
                maxH="480px"
                overflow="hidden"
            >
                <PopoverArrow bg={popoverBg} />
                <PopoverHeader
                    borderBottomWidth="1px"
                    fontWeight="bold"
                    py={3}
                    px={4}
                >
                    <Flex justify="space-between" align="center">
                        <HStack spacing={2}>
                            <Text fontSize="md">Notifications</Text>
                            {unreadCount > 0 && (
                                <Badge
                                    colorScheme="red"
                                    borderRadius="full"
                                    px={2}
                                    fontSize="xs"
                                >
                                    {unreadCount} new
                                </Badge>
                            )}
                        </HStack>
                        {unreadCount > 0 && (
                            <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="brand"
                                fontWeight="bold"
                                onClick={() => markAllAsRead.mutate()}
                                isLoading={markAllAsRead.isLoading}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </Flex>

                </PopoverHeader>
                <PopoverBody p={0} overflowY="auto" maxH="380px">
                    {notifications.length === 0 ? (
                        <VStack py={8} spacing={3}>
                            <Icon as={FiBell} fontSize="3xl" color="gray.300" />
                            <Text color="gray.400" fontSize="sm">
                                No new notifications
                            </Text>
                        </VStack>
                    ) : (
                        <VStack spacing={0} align="stretch">
                            {notifications.map((n: any, idx: number) => (
                                <Box key={n.id}>
                                    <Flex
                                        px={4}
                                        py={3}
                                        _hover={{ bg: hoverBg }}
                                        transition="background 0.15s"
                                        align="flex-start"
                                        gap={3}
                                    >
                                        <Box
                                            mt={1}
                                            p={2}
                                            borderRadius="lg"
                                            bg={`${getColorScheme(n.type)}.50`}
                                            color={`${getColorScheme(n.type)}.500`}
                                            flexShrink={0}
                                        >
                                            <Icon as={getIcon(n.type)} />
                                        </Box>
                                        <Box flex={1} minW={0}>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                noOfLines={1}
                                            >
                                                {n.type === 'SHIFT_REMINDER'
                                                    ? 'Shift Reminder'
                                                    : 'Admin Alert'}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="gray.500"
                                                noOfLines={2}
                                                mt={0.5}
                                            >
                                                {n.message}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="gray.400"
                                                mt={1}
                                            >
                                                {formatTime(n.createdAt)}
                                            </Text>
                                        </Box>
                                        <IconButton
                                            aria-label="Dismiss"
                                            icon={<FiCheckCircle />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="green"
                                            borderRadius="full"
                                            mt={1}
                                            flexShrink={0}
                                            onClick={() =>
                                                markAsRead.mutate({ id: n.id })
                                            }
                                            isLoading={markAsRead.isLoading}
                                        />
                                    </Flex>
                                    {idx < notifications.length - 1 && (
                                        <Divider />
                                    )}
                                </Box>
                            ))}
                        </VStack>
                    )}
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
