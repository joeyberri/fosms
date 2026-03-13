import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel,
    FormControl, FormLabel, Input, Button, Stack,
    Table, Thead, Tbody, Tr, Th, Td, Badge,
    useToast, Spinner, Flex, Icon, HStack, useColorModeValue,
    IconButton, Collapse, Divider, Center, useBoolean, VStack
} from '@chakra-ui/react';
import { useGlobalStateStore } from '../app/GlobalState';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { useForm, Controller } from 'react-hook-form';
import { 
    FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, 
    FiInfo, FiCalendar, FiUser, FiArchive, 
    FiChevronDown, FiChevronUp, FiArrowRight 
} from 'react-icons/fi';

// Internal UI Components
import { CustomSelect } from '../components/UI/CustomSelect';
import { PageHeader } from '../components/UI/PageHeader';
import { PremiumCard } from '../components/UI/PremiumCard';

/**
 * Shared Helper: Status Badge
 */
const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { color: string; icon: any }> = {
        'PENDING': { color: 'yellow', icon: FiClock },
        'APPROVED': { color: 'green', icon: FiCheckCircle },
        'REJECTED': { color: 'red', icon: FiXCircle }
    };
    const item = config[status] || { color: 'gray', icon: FiInfo };

    return (
        <HStack spacing={1}>
            <Icon as={item.icon} color={`${item.color}.500`} boxSize={3} />
            <Badge colorScheme={item.color} borderRadius="full" px={2} variant="subtle" fontSize="2xs">
                {status}
            </Badge>
        </HStack>
    );
};

export default function Swaps() {
    const { user } = useGlobalStateStore();
    if (!user) return null;

    return (
        <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
            <PageHeader
                title="Shift Swaps"
                subtitle="Coordinate and approve shift trades with the team."
                icon={FiRefreshCw}
            />
            <Box mt={6}>
                {user.role === 1 ? <AdminSwapView /> : <StaffSwapView userId={user.id} />}
            </Box>
        </Box>
    );
}

/**
 * ADMIN VIEW: Manage incoming requests
 */
function AdminSwapView() {
    const toast = useToast();
    const [showHistory, { toggle: toggleHistory }] = useBoolean(false);
    const { data: requests, isLoading, refetch } = trpc.shift.listSwapRequests.useQuery();
    
    const processSwapMutation = trpc.shift.processSwap.useMutation({
        onSuccess: () => {
            toast({ title: 'Request updated', status: 'success' });
            refetch();
        }
    });

    const { pendingRequests, resolvedRequests } = useMemo(() => {
        if (!requests) return { pendingRequests: [], resolvedRequests: [] };
        return {
            pendingRequests: requests.filter(r => r.status === 'PENDING'),
            resolvedRequests: requests.filter(r => r.status !== 'PENDING')
                .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime())
        };
    }, [requests]);

    const handleAction = async (swapId: string, action: 'APPROVED' | 'REJECTED') => {
        processSwapMutation.mutate({ swapId, action });
    };

    if (isLoading) return <Center py={20}><Spinner size="xl" color="brand.500" /></Center>;

    return (
        <VStack spacing={8} align="stretch">
            {/* Active/Pending Requests */}
            <Box>
                <Heading size="xs" mb={4} color="orange.500" textTransform="uppercase" letterSpacing="widest">
                    Action Required ({pendingRequests.length})
                </Heading>
                <PremiumCard p={0}>
                    <Table variant="simple" size="sm">
                        <Thead bg={useColorModeValue('gray.50', 'whiteAlpha.50')}>
                            <Tr>
                                <Th py={4}>Date</Th>
                                <Th>Requester</Th>
                                <Th>Trade Details</Th>
                                <Th>Colleague</Th>
                                <Th textAlign="right">Decision</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {pendingRequests.map((req) => (
                                <Tr key={req.id}>
                                    <Td fontWeight="bold">{new Date(req.requestedDate).toLocaleDateString()}</Td>
                                    <Td>
                                        <Text fontSize="sm" fontWeight="medium">{req.user.name}</Text>
                                        <Text fontSize="2xs" color={useColorModeValue('gray.500', 'gray.400')}>{req.user.department}</Text>
                                    </Td>
                                    <Td>
                                        <HStack fontSize="xs" fontWeight="bold">
                                            <Badge colorScheme="blue">{req.currentShift}</Badge>
                                            <FiArrowRight />
                                            <Badge colorScheme="purple">{req.requestedShift}</Badge>
                                        </HStack>
                                        <Text fontSize="2xs" mt={1} color={useColorModeValue('gray.500', 'gray.400')} noOfLines={1}>{req.reason || 'No reason provided'}</Text>
                                    </Td>
                                    <Td fontSize="sm">{req.colleague?.name || 'Open Request'}</Td>
                                    <Td textAlign="right">
                                        <HStack spacing={2} justify="end">
                                            <Button 
                                                size="xs" colorScheme="green" variant="ghost" leftIcon={<FiCheckCircle />}
                                                onClick={() => handleAction(req.id, 'APPROVED')}
                                                isLoading={processSwapMutation.isLoading}
                                            >Approve</Button>
                                            <Button 
                                                size="xs" colorScheme="red" variant="ghost" leftIcon={<FiXCircle />}
                                                onClick={() => handleAction(req.id, 'REJECTED')}
                                                isLoading={processSwapMutation.isLoading}
                                            >Reject</Button>
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                    {pendingRequests.length === 0 && (
                        <Center py={10} color="gray.400"><Text fontSize="sm">No pending requests at this time.</Text></Center>
                    )}
                </PremiumCard>
            </Box>

            {/* Resolved History */}
            {resolvedRequests.length > 0 && (
                <Box>
                    <Divider mb={6} />
                    <Center mb={6}>
                        <Button 
                            variant="ghost" size="sm" leftIcon={<FiArchive />} 
                            rightIcon={showHistory ? <FiChevronUp /> : <FiChevronDown />}
                            onClick={toggleHistory} borderRadius="full"
                        >
                            {showHistory ? "Hide Decision History" : `View Resolved History (${resolvedRequests.length})`}
                        </Button>
                    </Center>
                    <Collapse in={showHistory} animateOpacity>
                        <PremiumCard p={0} opacity={0.8} borderStyle="dashed">
                            <Table variant="simple" size="sm">
                                <Tbody>
                                    {resolvedRequests.map(req => (
                                        <Tr key={req.id}>
                                            <Td fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>{new Date(req.requestedDate).toLocaleDateString()}</Td>
                                            <Td fontSize="xs" fontWeight="bold">{req.user.name}</Td>
                                            <Td fontSize="2xs">{req.currentShift} → {req.requestedShift}</Td>
                                            <Td><StatusBadge status={req.status} /></Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </PremiumCard>
                    </Collapse>
                </Box>
            )}
        </VStack>
    );
}

/**
 * STAFF VIEW: Request and Track own swaps
 */
function StaffSwapView({ userId }: { userId: string }) {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('date') ? 0 : 1; // Default to History unless coming from Schedule

    return (
        <PremiumCard p={0}>
            <Tabs variant="line" colorScheme="brand" defaultIndex={initialTab}>
                <TabList px={6} pt={4}>
                    <Tab fontWeight="bold" fontSize="sm">New Request</Tab>
                    <Tab fontWeight="bold" fontSize="sm">My Swap History</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel p={8}>
                        <RequestSwapForm />
                    </TabPanel>
                    <TabPanel p={0}>
                        <MyRequestsList />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </PremiumCard>
    );
}

function RequestSwapForm() {
    const [searchParams] = useSearchParams();
    const { register, handleSubmit, reset, setValue, control } = useForm();
    const toast = useToast();
    const utils = trpc.useContext();
    const { data: colleagues } = trpc.user.listColleagues.useQuery();

    useEffect(() => {
        const prefilledDate = searchParams.get('date');
        if (prefilledDate) setValue('requestedDate', prefilledDate);
    }, [searchParams, setValue]);

    const requestSwapMutation = trpc.shift.requestSwap.useMutation({
        onSuccess: () => {
            toast({ title: 'Request submitted', status: 'success' });
            utils.shift.mySwapRequests.invalidate();
            reset();
        }
    });

    const onSubmit = (data: any) => {
        requestSwapMutation.mutate({ ...data, colleagueId: data.colleagueId || undefined });
    };

    return (
        <Box maxW="2xl" mx="auto">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={6}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired>
                            <FormLabel fontSize="xs" textTransform="uppercase" color={useColorModeValue('gray.500', 'gray.400')}>Date of Shift</FormLabel>
                            <Input type="date" size="lg" borderRadius="xl" {...register('requestedDate', { required: true })} />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="xs" textTransform="uppercase" color={useColorModeValue('gray.500', 'gray.400')}>Target Colleague (Optional)</FormLabel>
                            <Controller
                                name="colleagueId"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        placeholder="Direct trade with..."
                                        options={colleagues?.map(c => ({ value: c.id, label: c.name }))}
                                        onChange={(val: any) => field.onChange(val?.value)}
                                        value={colleagues?.find(c => c.id === field.value) ? { value: field.value, label: colleagues.find(c => c.id === field.value)?.name || '' } : null}
                                    />
                                )}
                            />
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired>
                            <FormLabel fontSize="xs" textTransform="uppercase" color={useColorModeValue('gray.500', 'gray.400')}>Current Shift</FormLabel>
                            <Controller
                                name="currentShift"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        options={[{ value: 'Morning', label: 'Morning' }, { value: 'Afternoon', label: 'Afternoon' }, { value: 'Night', label: 'Night' }]}
                                        onChange={(val: any) => field.onChange(val?.value)}
                                        value={field.value ? { value: field.value, label: field.value } : null}
                                    />
                                )}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel fontSize="xs" textTransform="uppercase" color={useColorModeValue('gray.500', 'gray.400')}>Desired Status</FormLabel>
                            <Controller
                                name="requestedShift"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        options={[{ value: 'Morning', label: 'Morning' }, { value: 'Afternoon', label: 'Afternoon' }, { value: 'Night', label: 'Night' }, { value: 'Off', label: 'Day Off' }]}
                                        onChange={(val: any) => field.onChange(val?.value)}
                                        value={field.value ? { value: field.value, label: field.value } : null}
                                    />
                                )}
                            />
                        </FormControl>
                    </SimpleGrid>

                    <FormControl>
                        <FormLabel fontSize="xs" textTransform="uppercase" color="gray.500">Reason for Request</FormLabel>
                        <Input placeholder="Describe why you need this trade..." size="lg" borderRadius="xl" {...register('reason')} />
                    </FormControl>

                    <Button type="submit" colorScheme="brand" size="lg" h="14" borderRadius="xl" isLoading={requestSwapMutation.isLoading}>
                        Broadcast Swap Request
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}

function MyRequestsList() {
    const [showHistory, { toggle: toggleHistory }] = useBoolean(false);
    const { data: myRequests, isLoading } = trpc.shift.mySwapRequests.useQuery();

    const { active, archived } = useMemo(() => {
        if (!myRequests) return { active: [], archived: [] };
        const today = new Date();
        today.setHours(0,0,0,0);
        
        return {
            active: myRequests.filter(r => r.status === 'PENDING' || new Date(r.requestedDate) >= today),
            archived: myRequests.filter(r => r.status !== 'PENDING' && new Date(r.requestedDate) < today)
                .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime())
        };
    }, [myRequests]);

    if (isLoading) return <Center py={10}><Spinner color="brand.500" /></Center>;

    return (
        <VStack spacing={0} align="stretch" p={6}>
            <Heading size="xs" mb={4} color="gray.500" textTransform="uppercase" letterSpacing="widest">Active Requests</Heading>
            <Table variant="simple" size="sm">
                <Thead bg={useColorModeValue('gray.50', 'whiteAlpha.50')}>
                    <Tr>
                        <Th py={4}>Shift Date</Th>
                        <Th>Details</Th>
                        <Th>Colleague</Th>
                        <Th>Status</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {active.map((req) => (
                        <Tr key={req.id}>
                            <Td fontWeight="bold">{new Date(req.requestedDate).toLocaleDateString()}</Td>
                            <Td fontSize="xs">{req.currentShift} → {req.requestedShift}</Td>
                            <Td fontSize="xs">{req.colleague?.name || 'Public'}</Td>
                            <Td><StatusBadge status={req.status} /></Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            {active.length === 0 && <Center py={10} color="gray.400">No active swap requests.</Center>}

            {archived.length > 0 && (
                <Box mt={8}>
                    <Center mb={4}>
                        <Button variant="ghost" size="xs" onClick={toggleHistory} rightIcon={showHistory ? <FiChevronUp /> : <FiChevronDown />}>
                            {showHistory ? "Hide Past Requests" : `View History (${archived.length})`}
                        </Button>
                    </Center>
                    <Collapse in={showHistory}>
                        <Table variant="simple" size="sm" opacity={0.6}>
                            <Tbody>
                                {archived.map(req => (
                                    <Tr key={req.id}>
                                        <Td fontSize="2xs">{new Date(req.requestedDate).toLocaleDateString()}</Td>
                                        <Td fontSize="2xs">{req.currentShift} → {req.requestedShift}</Td>
                                        <Td><StatusBadge status={req.status} /></Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Collapse>
                </Box>
            )}
        </VStack>
    );
}

// Internal Styled Grid for the Form
const SimpleGrid = ({ children, columns, spacing }: any) => (
    <Flex wrap="wrap" gap={spacing} m={-(spacing/2)}>
        {React.Children.map(children, child => (
            <Box p={spacing/2} flexBasis={{ base: '100%', md: `calc(${100/columns.md}% - 0px)` }} flexGrow={1}>
                {child}
            </Box>
        ))}
    </Flex>
);