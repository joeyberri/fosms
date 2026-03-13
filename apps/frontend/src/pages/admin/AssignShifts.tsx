import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Stack,
    useToast,
    Spinner,
    Badge,
    Flex,
    InputGroup,
    InputLeftElement,
    Icon,
    HStack,
    Text,
    useColorModeValue,
    VStack,
    Heading,
    Select
} from '@chakra-ui/react';
import { trpc } from '../../utils/trpc';
import { useForm, Controller } from 'react-hook-form';
import { useState, useMemo } from 'react';
import { FiSearch, FiCalendar, FiClock, FiMapPin, FiPlus } from 'react-icons/fi';
import { CustomSelect } from '../../components/UI/CustomSelect';
import { PageHeader } from '../../components/UI/PageHeader';
import { PremiumCard } from '../../components/UI/PremiumCard';

export default function AssignShifts() {
    const { data: users, isLoading: usersLoading } = trpc.user.list.useQuery();
    const { data: allShifts } = trpc.shift.list.useQuery();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { register, handleSubmit, reset, control, watch } = useForm({
        defaultValues: {
            userId: '',
            shiftType: 'Morning',
            date: new Date().toISOString().split('T')[0],
            startTime: '06:00',
            endTime: '14:00',
            location: '',
            notes: '',
        }
    });

    const toast = useToast();

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const assignShiftMutation = trpc.shift.assign.useMutation({
        onSuccess: () => {
            toast({ title: 'Shift assigned successfully', status: 'success' });
            reset();
            setSelectedUser(null);
            onClose();
        },
        onError: (e: any) => {
            toast({ title: 'Error assigning shift', description: e.message, status: 'error' });
        }
    });

    const shiftType = watch('shiftType');

    // Update times based on shift type
    const handleShiftTypeChange = (type: string) => {
        const times: any = {
            'Morning': { start: '06:00', end: '14:00' },
            'Afternoon': { start: '14:00', end: '22:00' },
            'Night': { start: '22:00', end: '06:00' }
        };
        const timeRange = times[type] || { start: '06:00', end: '14:00' };
        // Note: We can't directly set form values this way, but the user can manually adjust
    };

    const onSubmit = (data: any) => {
        if (!selectedUser) {
            toast({ title: 'Please select a user', status: 'warning' });
            return;
        }
        assignShiftMutation.mutate({
            ...data,
            userId: selectedUser.id,
            startTime: data.startTime,
            endTime: data.endTime,
        });
    };

    // Group shifts by date for the table view
    const shiftsGroupedByDate = useMemo(() => {
        if (!allShifts) return [];
        const grouped: any = {};
        allShifts.forEach(shift => {
            const dateKey = new Date(shift.date).toLocaleDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(shift);
        });
        return Object.entries(grouped)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, shifts]) => ({ date, shifts }));
    }, [allShifts]);

    if (usersLoading) return <Box py={20} textAlign="center"><Spinner size="xl" color="brand.500" /></Box>;

    return (
        <Box p={6}>
            <PageHeader
                title="Assign Shifts"
                subtitle="Manage shift assignments for your team."
                icon={FiCalendar}
                rightElement={
                    <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onOpen} shadow="lg">
                        Assign New Shift
                    </Button>
                }
            />

            <PremiumCard mb={6}>
                <InputGroup>
                    <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search personnel by name or ID..."
                        borderRadius="xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </PremiumCard>

            <VStack spacing={6} align="stretch">
                {shiftsGroupedByDate.map(({ date, shifts }: any) => (
                    <PremiumCard key={date} p={0}>
                        <Box p={6} borderBottomWidth="1px">
                            <Heading size="sm">{date}</Heading>
                        </Box>
                        <Table variant="simple">
                            <Thead bg={useColorModeValue('gray.50', 'whiteAlpha.50')}>
                                <Tr>
                                    <Th>Personnel</Th>
                                    <Th>Shift Type</Th>
                                    <Th>Time</Th>
                                    <Th>Location</Th>
                                    <Th>Notes</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {shifts.map((shift: any) => (
                                    <Tr key={shift.id} _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}>
                                        <Td>
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="bold">{shift.user?.name}</Text>
                                                <Text fontSize="xs" color="gray.500">{shift.user?.department}</Text>
                                            </VStack>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={
                                                shift.shiftType === 'Morning' ? 'yellow' :
                                                    shift.shiftType === 'Afternoon' ? 'orange' : 'blue'
                                            } borderRadius="full" px={2}>
                                                {shift.shiftType}
                                            </Badge>
                                        </Td>
                                        <Td fontSize="sm">{shift.startTime} - {shift.endTime}</Td>
                                        <Td fontSize="sm">{shift.location}</Td>
                                        <Td fontSize="xs" color="gray.500">{shift.notes || '-'}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </PremiumCard>
                ))}

                {shiftsGroupedByDate.length === 0 && (
                    <PremiumCard p={20} textAlign="center">
                        <Icon as={FiCalendar} w={12} h={12} color="gray.300" mb={4} />
                        <Heading size="sm" color="gray.500">No shifts assigned yet</Heading>
                    </PremiumCard>
                )}
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent borderRadius="2xl">
                    <ModalHeader borderBottomWidth="1px">Assign Shift to Personnel</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Select Personnel</FormLabel>
                                    <Box maxH="200px" overflowY="auto" borderWidth="1px" borderRadius="xl" p={2}>
                                        <VStack spacing={2} align="start" p={2}>
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map(user => (
                                                    <Button
                                                        key={user.id}
                                                        w="full"
                                                        justifyContent="start"
                                                        variant={selectedUser?.id === user.id ? 'solid' : 'ghost'}
                                                        colorScheme={selectedUser?.id === user.id ? 'brand' : 'gray'}
                                                        onClick={() => setSelectedUser(user)}
                                                        fontSize="sm"
                                                    >
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="bold">{user.name}</Text>
                                                            <Text fontSize="xs">{user.employeeId} • {user.department}</Text>
                                                        </VStack>
                                                    </Button>
                                                ))
                                            ) : (
                                                <Text color="gray.500" fontSize="sm" p={4}>No personnel found</Text>
                                            )}
                                        </VStack>
                                    </Box>
                                </FormControl>

                                <HStack spacing={4} align="start">
                                    <FormControl isRequired>
                                        <FormLabel>Date</FormLabel>
                                        <Input
                                            type="date"
                                            borderRadius="xl"
                                            {...register('date', { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Shift Type</FormLabel>
                                        <Select borderRadius="xl" {...register('shiftType')}>
                                            <option value="Morning">Morning (06:00 - 14:00)</option>
                                            <option value="Afternoon">Afternoon (14:00 - 22:00)</option>
                                            <option value="Night">Night (22:00 - 06:00)</option>
                                        </Select>
                                    </FormControl>
                                </HStack>

                                <HStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Start Time</FormLabel>
                                        <Input
                                            type="time"
                                            borderRadius="xl"
                                            {...register('startTime', { required: true })}
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>End Time</FormLabel>
                                        <Input
                                            type="time"
                                            borderRadius="xl"
                                            {...register('endTime', { required: true })}
                                        />
                                    </FormControl>
                                </HStack>

                                <FormControl isRequired>
                                    <FormLabel>Location</FormLabel>
                                    <Input
                                        placeholder="e.g., Assembly Line A"
                                        borderRadius="xl"
                                        {...register('location', { required: true })}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <Input
                                        placeholder="Any additional notes..."
                                        borderRadius="xl"
                                        {...register('notes')}
                                    />
                                </FormControl>

                                <Button
                                    type="submit"
                                    colorScheme="brand"
                                    h="12"
                                    borderRadius="xl"
                                    isLoading={assignShiftMutation.isLoading}
                                    mt={4}
                                    shadow="md"
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
