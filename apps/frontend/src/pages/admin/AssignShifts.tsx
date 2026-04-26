import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Button, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
    ModalCloseButton, FormControl, FormLabel, Input, Stack,
    useToast, Spinner, Badge, Flex, InputGroup, InputLeftElement,
    Icon, HStack, Text, useColorModeValue, VStack, Heading, Select,
    IconButton, Collapse, Divider, Center, useBoolean, Tooltip
} from '@chakra-ui/react';

import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { 
    FiSearch, FiCalendar, FiClock, FiMapPin, 
    FiPlus, FiUser, FiX, FiArchive, 
    FiChevronDown, FiChevronUp, FiBell 
} from 'react-icons/fi';


// Internal Utils & Components
import { trpc } from '../../utils/trpc';
import { PageHeader } from '../../components/UI/PageHeader';
import { PremiumCard } from '../../components/UI/PremiumCard';

/**
 * Types & Constants
 */
interface User {
    id?: string;
    name: string;
    email?: string;
    employeeId?: string;
    department: string;
}

interface Shift {
    id: string;
    date: string | Date;
    shiftType: string;
    startTime: string;
    endTime: string;
    location: string;
    notes?: string | null;
    user?: User;
}

interface ShiftFormValues {
    userId: string;
    shiftType: 'Morning' | 'Afternoon' | 'Night' | 'OFF_DAY' | 'Custom';
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    notes: string;
}

const SHIFT_PRESETS = {
    Morning: { start: '06:00', end: '14:00' },
    Afternoon: { start: '14:00', end: '22:00' },
    Night: { start: '22:00', end: '06:00' },
    OFF_DAY: { start: '00:00', end: '00:00' },
    Custom: { start: '', end: '' }
};


/**
 * Sub-component: Shift Table Group
 */
const ShiftDateGroup = ({ 
    date, 
    shifts, 
    isArchived = false, 
    onTriggerReminder 
}: { 
    date: string, 
    shifts: Shift[], 
    isArchived?: boolean, 
    onTriggerReminder: (id: string) => void 
}) => {

    const headerBg = useColorModeValue('gray.50', 'whiteAlpha.100');
    const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
    
    return (
        <Box mb={4}>
            <Heading size="sm" mb={3} color={isArchived ? "gray.400" : "gray.600"} display="flex" alignItems="center">
                <Icon as={FiCalendar} mr={2} /> {date}
                {isArchived && <Badge ml={2} variant="outline" colorScheme="gray">Archived</Badge>}
            </Heading>
            <PremiumCard p={0} overflow="hidden" borderStyle={isArchived ? "dashed" : "solid"} opacity={isArchived ? 0.8 : 1}>
                <Table variant="simple" size="sm">
                    <Thead bg={headerBg}>
                        <Tr>
                            <Th py={4}>Personnel</Th>
                            <Th>Shift</Th>
                            <Th><FiClock style={{ display: 'inline', marginRight: '4px' }} /> Time</Th>
                            <Th><FiMapPin style={{ display: 'inline', marginRight: '4px' }} /> Location</Th>
                            <Th>Notes</Th>
                            <Th textAlign="right">Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {shifts.map((shift) => (
                            <Tr key={shift.id} _hover={{ bg: hoverBg }}>

                                <Td py={4}>
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="bold" fontSize="sm">{shift.user?.name}</Text>
                                        <Text fontSize="xs" color="gray.500">{shift.user?.department}</Text>
                                    </VStack>
                                </Td>
                                <Td>
                                    <Badge 
                                        colorScheme={shift.shiftType === 'Morning' ? 'yellow' : shift.shiftType === 'Afternoon' ? 'orange' : shift.shiftType === 'OFF_DAY' ? 'green' : 'blue'} 
                                        borderRadius="full" px={2}
                                    >
                                        {shift.shiftType}
                                    </Badge>
                                </Td>
                                <Td fontWeight="medium" fontSize="xs">{shift.startTime} - {shift.endTime}</Td>
                                <Td fontSize="xs">{shift.location}</Td>
                                <Td fontSize="xs" color="gray.400" maxW="150px" isTruncated>{shift.notes || '-'}</Td>
                                <Td textAlign="right">
                                    <Tooltip label="Send Manual Reminder" hasArrow>
                                        <IconButton
                                            aria-label="Send Reminder"
                                            icon={<FiBell />}
                                            size="xs"
                                            variant="outline"
                                            colorScheme="orange"
                                            borderRadius="full"
                                            onClick={() => onTriggerReminder(shift.id)}
                                        />
                                    </Tooltip>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>

                </Table>
            </PremiumCard>
        </Box>
    );
};

/**
 * Main Page Component
 */
export default function AssignShifts() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [showHistory, { toggle: toggleHistory }] = useBoolean(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Queries
    const { data: users, isLoading: usersLoading } = trpc.user.list.useQuery();
    const { data: allShifts } = trpc.shift.list.useQuery();

    // Form Setup
    const { register, handleSubmit, reset, watch, setValue } = useForm<ShiftFormValues>({
        defaultValues: {
            shiftType: 'Morning',
            date: new Date().toISOString().split('T')[0],
            startTime: '06:00',
            endTime: '14:00',
        }
    });

    const currentShiftType = watch('shiftType');

    // Auto-fill times when shift profile changes
    useEffect(() => {
        if (currentShiftType && currentShiftType !== 'Custom') {
            const { start, end } = SHIFT_PRESETS[currentShiftType];
            setValue('startTime', start);
            setValue('endTime', end);
        }
    }, [currentShiftType, setValue]);

    // Data Transformation: Filter Users
    const filteredUsers = useMemo(() => {
        if (!users) return [];
        const term = searchTerm.toLowerCase();
        return users.filter(u =>
            u.name.toLowerCase().includes(term) ||
            u.employeeId.toLowerCase().includes(term) ||
            u.department.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    // Data Transformation: Group & Archive Logic
    type ShiftGroup = { dateStr: string; timestamp: number; shifts: Shift[] };

    const { activeGroups, archivedGroups } = useMemo<{
        activeGroups: ShiftGroup[];
        archivedGroups: ShiftGroup[];
    }>(() => {
        if (!allShifts) return { activeGroups: [], archivedGroups: [] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const grouped: Record<string, ShiftGroup> = {};
        
        allShifts.forEach((shift) => {
            const d = new Date(shift.date);
            const dateKey = d.toLocaleDateString(undefined, { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = { dateStr: dateKey, timestamp: d.getTime(), shifts: [] };
            }
            grouped[dateKey].shifts.push(shift);
        });

        const active: ShiftGroup[] = [];
        const archived: ShiftGroup[] = [];

        Object.values(grouped).forEach((group) => {
            if (group.timestamp < today.getTime()) {
                archived.push(group);
            } else {
                active.push(group);
            }
        });

        return {
            activeGroups: active.sort((a, b) => a.timestamp - b.timestamp), // Soonest first
            archivedGroups: archived.sort((a, b) => b.timestamp - a.timestamp) // Recent history first
        };
    }, [allShifts]);

    // Mutation
    const assignShiftMutation = trpc.shift.assign.useMutation({
        onSuccess: () => {
            toast({ title: 'Shift assigned successfully', status: 'success' });
            handleClose();
            queryClient.invalidateQueries({ queryKey: trpc.shift.list.getQueryKey() });
        },
        onError: (e) => {
            toast({ title: 'Error', description: e.message, status: 'error' });
        }
    });

    const triggerReminderMutation = trpc.shift.triggerReminder.useMutation({
        onSuccess: () => {
            toast({ title: 'Reminder sent to personnel', status: 'success' });
        },
        onError: (e) => {
            toast({ title: 'Error', description: e.message, status: 'error' });
        }
    });

    const handleTriggerReminder = (shiftId: string) => {
        triggerReminderMutation.mutate({ shiftId });
    };


    const handleClose = () => {
        reset();
        setSelectedUser(null);
        setSearchTerm('');
        onClose();
    };

    const onSubmit = (data: ShiftFormValues) => {
        if (!selectedUser) {
            toast({ title: 'Please select a user', status: 'warning' });
            return;
        }
        assignShiftMutation.mutate({ ...data, userId: selectedUser.id! });
    };

    if (usersLoading) return <Flex justify="center" py={20}><Spinner size="xl" color="brand.500" /></Flex>;

    return (
        <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
            <PageHeader
                title="Shift Assignment"
                subtitle="Manage and archive team working hours."
                icon={FiCalendar}
                rightElement={
                    <HStack spacing={3}>
                        <Button 
                            leftIcon={<FiBell />} 
                            variant="outline" 
                            colorScheme="orange" 
                            onClick={() => {
                                // Trigger reminders for all upcoming shifts
                                if (activeGroups.length === 0) {
                                    toast({ title: 'No upcoming shifts to remind', status: 'info' });
                                    return;
                                }
                                const allShiftIds = activeGroups.flatMap(g => g.shifts.map(s => s.id));
                                allShiftIds.forEach(id => triggerReminderMutation.mutate({ shiftId: id }));
                            }}
                            isLoading={triggerReminderMutation.isLoading}
                            shadow="sm"
                        >
                            Send All Reminders
                        </Button>
                        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onOpen} shadow="md">
                            Assign New Shift
                        </Button>
                    </HStack>
                }
            />

            <PremiumCard mb={8}>
                <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search by personnel name, ID, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        borderRadius="xl"
                    />
                    {searchTerm && (
                        <IconButton 
                            aria-label="Clear" 
                            icon={<FiX />} 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSearchTerm('')} 
                            mr={2} mt={1}
                        />
                    )}
                </InputGroup>
            </PremiumCard>

            <VStack spacing={8} align="stretch">
                {/* Active Section */}
                <Box>
                    <Heading size="xs" mb={5} color="brand.500" textTransform="uppercase" letterSpacing="widest">
                        Current & Upcoming
                    </Heading>
                    {activeGroups.map(group => (
                        <ShiftDateGroup 
                            key={group.dateStr} 
                            date={group.dateStr} 
                            shifts={group.shifts} 
                            onTriggerReminder={handleTriggerReminder}
                        />
                    ))}

                    {activeGroups.length === 0 && (
                        <Center py={10} flexDirection="column" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                            <Icon as={FiCalendar} fontSize="3xl" color="gray.300" mb={2} />
                            <Text color="gray.500">No upcoming shifts scheduled.</Text>
                        </Center>
                    )}
                </Box>

                {/* Archive Section */}
                {archivedGroups.length > 0 && (
                    <Box>
                        <Divider mb={6} />
                        <Center mb={6}>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                leftIcon={<FiArchive />} 
                                rightIcon={showHistory ? <FiChevronUp /> : <FiChevronDown />}
                                onClick={toggleHistory}
                                borderRadius="full"
                            >
                                {showHistory ? "Hide Past Shifts" : `Show Archive (${archivedGroups.length} days)`}
                            </Button>
                        </Center>
                        <Collapse in={showHistory} animateOpacity>
                            <VStack spacing={6} align="stretch">
                                {archivedGroups.map(group => (
                                    <ShiftDateGroup 
                                        key={group.dateStr} 
                                        date={group.dateStr} 
                                        shifts={group.shifts} 
                                        isArchived 
                                        onTriggerReminder={handleTriggerReminder}
                                    />
                                ))}
                            </VStack>
                        </Collapse>

                    </Box>
                )}
            </VStack>

            {/* Assignment Modal */}
            <Modal isOpen={isOpen} onClose={handleClose} size="xl">
                <ModalOverlay backdropFilter="blur(10px)" />
                <ModalContent borderRadius="2xl">
                    <ModalHeader borderBottomWidth="1px">New Shift Assignment</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack spacing={5}>
                                <FormControl isRequired>
                                    <FormLabel>Select Personnel</FormLabel>
                                    <Box borderWidth="1px" borderRadius="xl" maxH="200px" overflowY="auto">
                                        <VStack spacing={0} align="stretch">
                                            {filteredUsers.map(user => (
                                                <Flex 
                                                    key={user.id} p={3} cursor="pointer" align="center" justify="space-between"
                                                    bg={selectedUser?.id === user.id ? "brand.50" : "transparent"}
                                                    _hover={{ bg: selectedUser?.id === user.id ? "brand.100" : "gray.50" }}
                                                    onClick={() => setSelectedUser(user)}
                                                    borderBottomWidth="1px"
                                                >
                                                    <Box>
                                                        <Text fontSize="sm" fontWeight="bold">{user.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">{user.department} • {user.employeeId}</Text>
                                                    </Box>
                                                    {selectedUser?.id === user.id && <Icon as={FiPlus} color="brand.500" />}
                                                </Flex>
                                            ))}
                                        </VStack>
                                    </Box>
                                </FormControl>

                                <HStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Date</FormLabel>
                                        <Input type="date" borderRadius="xl" {...register('date')} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Shift Profile</FormLabel>
                                        <Select borderRadius="xl" {...register('shiftType')}>
                                            <option value="Morning">Morning (6am-2pm)</option>
                                            <option value="Afternoon">Afternoon (2pm-10pm)</option>
                                            <option value="Night">Night (10pm-6am)</option>
                                            <option value="OFF_DAY">Off Day</option>
                                            <option value="Custom">Custom Range</option>
                                        </Select>

                                    </FormControl>
                                </HStack>

                                <HStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Start Time</FormLabel>
                                        <Input type="time" borderRadius="xl" {...register('startTime')} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>End Time</FormLabel>
                                        <Input type="time" borderRadius="xl" {...register('endTime')} />
                                    </FormControl>
                                </HStack>

                                <FormControl isRequired>
                                    <FormLabel>Work Location</FormLabel>
                                    <Input placeholder="e.g. Loading Dock A" borderRadius="xl" {...register('location')} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <Input placeholder="Specific tasks or instructions..." borderRadius="xl" {...register('notes')} />
                                </FormControl>

                                <Button 
                                    type="submit" colorScheme="brand" size="lg" borderRadius="xl"
                                    isLoading={assignShiftMutation.isLoading} isDisabled={!selectedUser}
                                >
                                    Assign Shift
                                </Button>
                            </Stack>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}