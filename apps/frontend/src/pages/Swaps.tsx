import {
    Box, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel,
    FormControl, FormLabel, Input, Button, Stack,
    Table, Thead, Tbody, Tr, Th, Td, Badge,
    useToast, Spinner, Flex, Icon, HStack, useColorModeValue,
    IconButton
} from '@chakra-ui/react';
import { useGlobalStateStore } from '../app/GlobalState';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiInfo, FiCalendar } from 'react-icons/fi';
import { CustomSelect } from '../components/UI/CustomSelect';
import { PageHeader } from '../components/UI/PageHeader';
import { PremiumCard } from '../components/UI/PremiumCard';

export default function Swaps() {
    const { user } = useGlobalStateStore();

    if (!user) return null;

    return (
        <Box p={6}>
            <PageHeader
                title="Shift Swaps"
                subtitle="Coordinate shift trades with your colleagues."
                icon={FiRefreshCw}
            />

            <Box>
                {user.role === 1 ? <AdminSwapView /> : <StaffSwapView userId={user.id} />}
            </Box>
        </Box>
    );
}

function AdminSwapView() {
    const { data: requests, isLoading, refetch } = trpc.shift.listSwapRequests.useQuery();
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');

    const filteredRequests = useMemo(() => {
        if (!requests) return [];
        if (filter === 'ALL') return requests;
        if (filter === 'PENDING') return requests.filter(r => r.status === 'PENDING');
        return requests.filter(r => r.status !== 'PENDING');
    }, [requests, filter]);

    const processSwapMutation = trpc.shift.processSwap.useMutation({
        onSuccess: () => {
            refetch();
        }
    });
    const toast = useToast();

    const handleProcess = async (swapId: string, action: 'APPROVED' | 'REJECTED') => {
        try {
            await processSwapMutation.mutateAsync({ swapId, action });
            toast({ title: `Request ${action.toLowerCase()}`, status: 'success' });
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, status: 'error' });
        }
    };

    if (isLoading) return <Box py={20} textAlign="center"><Spinner size="xl" color="brand.500" /></Box>;

    return (
        <PremiumCard>
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md">Incoming Requests</Heading>
                <HStack spacing={2}>
                    <Button size="xs" onClick={() => setFilter('ALL')} variant={filter === 'ALL' ? 'brand' : 'ghost'} colorScheme={filter === 'ALL' ? 'brand' : undefined}>All</Button>
                    <Button size="xs" onClick={() => setFilter('PENDING')} variant={filter === 'PENDING' ? 'brand' : 'ghost'} colorScheme={filter === 'PENDING' ? 'brand' : undefined}>Pending</Button>
                    <Button size="xs" onClick={() => setFilter('RESOLVED')} variant={filter === 'RESOLVED' ? 'brand' : 'ghost'} colorScheme={filter === 'RESOLVED' ? 'brand' : undefined}>Resolved</Button>
                </HStack>
            </Flex>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Date</Th>
                        <Th>Requester</Th>
                        <Th>Type</Th>
                        <Th>Colleague</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {filteredRequests?.map((req) => (
                        <Tr key={req.id}>
                            <Td fontWeight="medium">{new Date(req.requestedDate).toLocaleDateString()}</Td>
                            <Td>{req.user.name}</Td>
                            <Td>
                                <Text fontSize="xs" color="gray.500">{req.currentShift} → {req.requestedShift}</Text>
                            </Td>
                            <Td>{req.colleague?.name || 'Open Request'}</Td>
                            <Td>
                                <StatusBadge status={req.status} />
                            </Td>
                            <Td>
                                {req.status === 'PENDING' && (
                                    <HStack spacing={2}>
                                        <IconButton size="sm" icon={<FiCheckCircle />} colorScheme="green" variant="ghost" aria-label="Approve" onClick={() => handleProcess(req.id, 'APPROVED')} />
                                        <IconButton size="sm" icon={<FiXCircle />} colorScheme="red" variant="ghost" aria-label="Reject" onClick={() => handleProcess(req.id, 'REJECTED')} />
                                    </HStack>
                                )}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            {filteredRequests.length === 0 && (
                <Box py={10} textAlign="center" color="gray.400">No requests matching filter.</Box>
            )}
        </PremiumCard>
    );
}

function StaffSwapView({ userId }: { userId: string }) {
    return (
        <PremiumCard p={0}>
            <Tabs variant="enclosed" colorScheme="brand">
                <TabList px={6} pt={4}>
                    <Tab fontWeight="bold">Request Swap</Tab>
                    <Tab fontWeight="bold">My History</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel p={6}>
                        <RequestSwapForm />
                    </TabPanel>
                    <TabPanel p={0}>
                        <MyRequestsList userId={userId} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </PremiumCard>
    );
}

function RequestSwapForm() {
    const [searchParams] = useSearchParams();
    const prefilledDate = searchParams.get('date');

    const { register, handleSubmit, reset, setValue, control } = useForm();
    const toast = useToast();
    const utils = trpc.useContext();
    const { data: colleagues } = trpc.user.listColleagues.useQuery();

    useEffect(() => {
        if (prefilledDate) {
            setValue('requestedDate', prefilledDate);
        }
    }, [prefilledDate, setValue]);

    const requestSwapMutation = trpc.shift.requestSwap.useMutation({
        onSuccess: () => {
            toast({ title: 'Request submitted', status: 'success', position: 'top' });
            utils.shift.mySwapRequests.invalidate();
            reset();
        },
        onError: (e) => {
            toast({ title: 'Error', description: e.message, status: 'error' });
        }
    });

    const onSubmit = (data: any) => {
        requestSwapMutation.mutate({
            ...data,
            colleagueId: data.colleagueId || undefined
        });
    };

    return (
        <Box maxW="2xl">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={6}>
                    <HStack spacing={6} align="start">
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="gray.500">Shift Date</FormLabel>
                            <Input
                                type="date"
                                size="lg"
                                borderRadius="0.75rem"
                                bg={useColorModeValue('white', 'rgba(255, 255, 255, 0.05)')}
                                borderColor={useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)')}
                                _hover={{ borderColor: '#03a9f4' }}
                                {...register('requestedDate', { required: true })}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="gray.500">Swap With</FormLabel>
                            <Controller
                                name="colleagueId"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        options={colleagues?.map(c => ({ value: c.id, label: `${c.name} (${c.department})` }))}
                                        placeholder="Select Colleague"
                                        onChange={(val: any) => field.onChange(val?.value)}
                                        value={colleagues?.find(c => c.id === field.value) ? { value: field.value, label: colleagues.find(c => c.id === field.value)?.name } : null}
                                    />
                                )}
                            />
                        </FormControl>
                    </HStack>

                    <HStack spacing={6}>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="gray.500">Current Shift</FormLabel>
                            <Controller
                                name="currentShift"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        options={[
                                            { value: 'Morning', label: 'Morning' },
                                            { value: 'Afternoon', label: 'Afternoon' },
                                            { value: 'Night', label: 'Night' }
                                        ]}
                                        placeholder="Select Current Shift"
                                        onChange={(val: any) => field.onChange(val?.value)}
                                        value={field.value ? { value: field.value, label: field.value } : null}
                                    />
                                )}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="gray.500">Requested Shift</FormLabel>
                            <Controller
                                name="requestedShift"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        options={[
                                            { value: 'Morning', label: 'Morning' },
                                            { value: 'Afternoon', label: 'Afternoon' },
                                            { value: 'Night', label: 'Night' },
                                            { value: 'Off', label: 'Day Off' }
                                        ]}
                                        placeholder="Select Target Shift"
                                        onChange={(val: any) => field.onChange(val?.value)}
                                        value={field.value ? { value: field.value, label: field.value } : null}
                                    />
                                )}
                            />
                        </FormControl>
                    </HStack>

                    <FormControl>
                        <FormLabel fontSize="sm" color="gray.500">Reason / Note</FormLabel>
                        <Input placeholder="Why do you need a swap?" size="lg" borderRadius="xl" {...register('reason')} />
                    </FormControl>

                    <Button type="submit" colorScheme="brand" size="lg" h="14" shadow="lg" isLoading={requestSwapMutation.isLoading}>
                        Submit Swap Request
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}

function MyRequestsList({ userId }: { userId: string }) {
    const { data: myRequests, isLoading } = trpc.shift.mySwapRequests.useQuery();

    if (isLoading) return <Box py={10} textAlign="center"><Spinner color="brand.500" /></Box>;

    return (
        <Box p={6}>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Date</Th>
                        <Th>Details</Th>
                        <Th>Target Person</Th>
                        <Th>Status</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {myRequests?.map((req) => (
                        <Tr key={req.id}>
                            <Td fontWeight="bold">{new Date(req.requestedDate).toLocaleDateString()}</Td>
                            <Td>
                                <Text fontSize="sm">{req.currentShift} → {req.requestedShift}</Text>
                            </Td>
                            <Td>{req.colleague?.name || 'General Request'}</Td>
                            <Td>
                                <StatusBadge status={req.status} />
                            </Td>
                        </Tr>
                    ))}
                    {(!myRequests || myRequests.length === 0) && (
                        <Tr><Td colSpan={4} textAlign="center" py={10} color="gray.500">No requests found.</Td></Tr>
                    )}
                </Tbody>
            </Table>
        </Box>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: any = {
        'PENDING': { color: 'yellow', icon: FiClock },
        'APPROVED': { color: 'green', icon: FiCheckCircle },
        'REJECTED': { color: 'red', icon: FiXCircle }
    };
    const item = config[status] || { color: 'gray', icon: FiInfo };

    return (
        <HStack spacing={1}>
            <Icon as={item.icon} color={`${item.color}.500`} />
            <Badge colorScheme={item.color} borderRadius="full" px={2} variant="subtle">
                {status}
            </Badge>
        </HStack>
    );
}
