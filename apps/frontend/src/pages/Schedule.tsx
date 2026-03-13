import React, { useState, useMemo } from 'react';
import {
    Box, Heading, Text, VStack, Spinner, SimpleGrid, Badge, Stack, Button,
    HStack, IconButton, useColorModeValue, Flex, Stat, StatLabel, StatNumber, 
    StatHelpText, Spacer, Icon, Table, Thead, Tbody, Tr, Th, Td, Collapse, 
    Divider, Center, useBoolean, Tooltip
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
    FiList, FiCalendar, FiClock, FiActivity, 
    FiArrowRight, FiInfo, FiArchive, FiChevronDown, FiChevronUp, FiMapPin 
} from 'react-icons/fi';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// Internal Utils & Components
import { trpc } from '../utils/trpc';
import { PageHeader } from '../components/UI/PageHeader';
import { PremiumCard } from '../components/UI/PremiumCard';

/**
 * Types
 */
interface MyShift {
    id: string;
    date: string;
    shiftType: string;
    startTime: string;
    endTime: string;
    location: string;
    notes?: string;
}

/**
 * Sub-component: Stat Card
 */
const StatCard = ({ label, number, help, icon, colorScheme = "brand" }: any) => {
    const iconColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.200`);
    const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
    return (
        <PremiumCard h="full">
            <Flex align="center" h="full">
                <Stat>
                    <StatLabel color={secondaryTextColor} fontWeight="medium" fontSize="xs" textTransform="uppercase">{label}</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold">{number}</StatNumber>
                    <StatHelpText mb={0} fontSize="xs" color={secondaryTextColor}>{help}</StatHelpText>
                </Stat>
                <Spacer />
                <Center p={3} bg={useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`)} borderRadius="xl">
                    <Icon as={icon} w={6} h={6} color={iconColor} />
                </Center>
            </Flex>
        </PremiumCard>
    );
};

/**
 * Sub-component: Schedule List Group
 */
const ScheduleListGroup = ({ date, shifts, isArchived = false }: { date: string, shifts: MyShift[], isArchived?: boolean }) => {
    const navigate = useNavigate();
    const headerBg = useColorModeValue('gray.50', 'whiteAlpha.100');

    return (
        <Box mb={4}>
            <Heading size="xs" mb={3} color={isArchived ? "gray.400" : "gray.600"} display="flex" alignItems="center">
                <Icon as={FiCalendar} mr={2} /> {date}
                {isArchived && <Badge ml={2} size="sm" variant="subtle">Past</Badge>}
            </Heading>
            <PremiumCard p={0} overflow="hidden" borderStyle={isArchived ? "dashed" : "solid"} opacity={isArchived ? 0.8 : 1}>
                <Table variant="simple" size="sm">
                    <Thead bg={headerBg}>
                        <Tr>
                            <Th py={4}>Shift Type</Th>
                            <Th><FiClock style={{ display: 'inline', marginRight: '4px' }} /> Time</Th>
                            <Th><FiMapPin style={{ display: 'inline', marginRight: '4px' }} /> Location</Th>
                            <Th>Notes</Th>
                            <Th textAlign="right">Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {shifts.map((s) => (
                            <Tr key={s.id} _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}>
                                <Td>
                                    <Badge 
                                        colorScheme={s.shiftType === 'Morning' ? 'yellow' : s.shiftType === 'Afternoon' ? 'orange' : 'blue'} 
                                        borderRadius="full" px={2}
                                    >
                                        {s.shiftType}
                                    </Badge>
                                </Td>
                                <Td fontWeight="medium">{s.startTime} - {s.endTime}</Td>
                                <Td fontSize="xs">{s.location}</Td>
                                <Td fontSize="xs" color="gray.400" isTruncated maxW="150px">{s.notes || '-'}</Td>
                                <Td textAlign="right">
                                    {isArchived ? (
                                        <Tooltip label="Past shifts cannot be swapped" hasArrow>
                                            <Box display="inline-block">
                                                <Button size="xs" variant="ghost" isDisabled rightIcon={<FiArrowRight />}>
                                                    Swap
                                                </Button>
                                            </Box>
                                        </Tooltip>
                                    ) : (
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            rightIcon={<FiArrowRight />}
                                            colorScheme="brand"
                                            onClick={() => navigate(`/swaps?date=${s.date.split('T')[0]}`)}
                                        >
                                            Swap
                                        </Button>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </PremiumCard>
        </Box>
    );
};

function Schedule() {
    const navigate = useNavigate();
    const { data: mySchedule, isLoading, error } = trpc.shift.mySchedule.useQuery();
    
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [showHistory, { toggle: toggleHistory }] = useBoolean(false);

    // Theme values
    const toggleBg = useColorModeValue('gray.100', 'gray.700');
    const calendarBorder = useColorModeValue('#E2E8F0', '#2D3748');
    const calendarText = useColorModeValue('#2D3748', '#E2E8F0');

    // Logic: Grouping and Archiving
    const { activeGroups, archivedGroups, stats } = useMemo(() => {
        if (!mySchedule) return { activeGroups: [], archivedGroups: [], stats: { total: 0, next: null, hours: 0 } };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const grouped: Record<string, { dateStr: string, timestamp: number, shifts: MyShift[] }> = {};
        let upcomingHours = 0;

        mySchedule.forEach((s) => {
            const d = new Date(s.date);
            const dateKey = d.toLocaleDateString(undefined, { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
            });

            if (!grouped[dateKey]) {
                grouped[dateKey] = { dateStr: dateKey, timestamp: d.getTime(), shifts: [] };
            }
            grouped[dateKey].shifts.push(s as any);

            // Calculate hours for future shifts (assuming 8h standard)
            if (d >= today) upcomingHours += 8;
        });

        const active: { dateStr: string, timestamp: number, shifts: MyShift[] }[] = [];
        const archived: { dateStr: string, timestamp: number, shifts: MyShift[] }[] = [];

        Object.values(grouped).forEach(group => {
            if (group.timestamp < today.getTime()) {
                archived.push(group);
            } else {
                active.push(group);
            }
        });

        const sortedActive = active.sort((a, b) => a.timestamp - b.timestamp);
        
        return {
            activeGroups: sortedActive,
            archivedGroups: archived.sort((a, b) => b.timestamp - a.timestamp),
            stats: {
                total: mySchedule.length,
                next: sortedActive[0]?.shifts[0] || null,
                hours: upcomingHours
            }
        };
    }, [mySchedule]);

    // Calendar Events
    const calendarEvents = useMemo(() => {
        if (!mySchedule) return [];
        return mySchedule.map(s => ({
            id: s.id,
            title: `${s.shiftType} (${s.startTime})`,
            start: s.date,
            allDay: true,
            backgroundColor: s.shiftType === 'Morning' ? '#ECC94B' : s.shiftType === 'Afternoon' ? '#ED8936' : '#4299E1',
            borderColor: 'transparent',
            extendedProps: { ...s }
        }));
    }, [mySchedule]);

    if (isLoading) return <Box textAlign="center" py={20}><Spinner size="xl" color="brand.500" thickness="4px" /><Text mt={4} color="gray.500">Loading your schedule...</Text></Box>;

    if (error) return (
        <Center py={20} flexDirection="column">
            <Text color="red.500" mb={4}>Error: {error.message}</Text>
            <Button onClick={() => navigate('/login')} colorScheme="brand">Return to Login</Button>
        </Center>
    );

    return (
        <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
            <PageHeader
                title="My Schedule"
                subtitle="Track your upcoming rotations and past history."
                icon={FiCalendar}
                rightElement={
                    <HStack spacing={2} bg={toggleBg} p={1} borderRadius="xl">
                        <IconButton
                            aria-label="List" icon={<FiList />}
                            onClick={() => setViewMode('list')}
                            variant={viewMode === 'list' ? 'solid' : 'ghost'}
                            colorScheme={viewMode === 'list' ? 'brand' : 'gray'}
                            size="sm" borderRadius="lg"
                        />
                        <IconButton
                            aria-label="Calendar" icon={<FiCalendar />}
                            onClick={() => setViewMode('calendar')}
                            variant={viewMode === 'calendar' ? 'solid' : 'ghost'}
                            colorScheme={viewMode === 'calendar' ? 'brand' : 'gray'}
                            size="sm" borderRadius="lg"
                        />
                    </HStack>
                }
            />

            {/* Summary Statistics */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
                <StatCard 
                    label="Total Assignments" 
                    number={stats.total} 
                    help="Lifetime shifts" 
                    icon={FiActivity} 
                    colorScheme="blue"
                />
                <StatCard 
                    label="Next Shift" 
                    number={stats.next ? new Date(stats.next.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'None'} 
                    help={stats.next ? `${stats.next.shiftType} Profile` : 'No upcoming shifts'} 
                    icon={FiClock} 
                    colorScheme="orange"
                />
                <StatCard 
                    label="Upcoming Hours" 
                    number={`${stats.hours}h`} 
                    help="Projected workload" 
                    icon={FiCalendar} 
                    colorScheme="green"
                />
            </SimpleGrid>

            {viewMode === 'list' ? (
                <VStack spacing={8} align="stretch">
                    {/* Active Section */}
                    <Box>
                        <Heading size="xs" mb={5} color="brand.500" textTransform="uppercase" letterSpacing="widest">
                            Upcoming Shifts
                        </Heading>
                        {activeGroups.map((group: any) => (
                            <ScheduleListGroup key={group.dateStr} date={group.dateStr} shifts={group.shifts} />
                        ))}
                        {activeGroups.length === 0 && (
                            <PremiumCard py={12} textAlign="center">
                                <Icon as={FiInfo} fontSize="3xl" color="gray.300" mb={3} />
                                <Text fontWeight="bold" color={useColorModeValue('gray.600', 'gray.400')}>All clear!</Text>
                                <Text color="gray.400" fontSize="sm">No upcoming shifts assigned to you.</Text>
                            </PremiumCard>
                        )}
                    </Box>

                    {/* Archived Section */}
                    {archivedGroups.length > 0 && (
                        <Box>
                            <Divider mb={6} />
                            <Center mb={6}>
                                <Button 
                                    variant="ghost" size="sm" leftIcon={<FiArchive />} 
                                    rightIcon={showHistory ? <FiChevronUp /> : <FiChevronDown />}
                                    onClick={toggleHistory} borderRadius="full"
                                >
                                    {showHistory ? "Hide Past History" : `View Work History (${archivedGroups.length} days)`}
                                </Button>
                            </Center>
                            <Collapse in={showHistory} animateOpacity>
                                <VStack spacing={6} align="stretch">
                                    {archivedGroups.map((group: any) => (
                                        <ScheduleListGroup key={group.dateStr} date={group.dateStr} shifts={group.shifts} isArchived />
                                    ))}
                                </VStack>
                            </Collapse>
                        </Box>
                    )}
                </VStack>
            ) : (
                <PremiumCard p={6} className="custom-calendar">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={calendarEvents}
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
                        height="auto"
                        eventContent={(info) => (
                            <Box p={1} overflow="hidden">
                                <Text fontSize="2xs" fontWeight="bold" isTruncated color="white">{info.event.title}</Text>
                            </Box>
                        )}
                    />
                </PremiumCard>
            )}

            <style>{`
                .custom-calendar .fc { --fc-border-color: ${calendarBorder}; font-family: inherit; }
                .custom-calendar .fc-toolbar-title { font-size: 1.1rem !important; font-weight: 700; }
                .custom-calendar .fc-button-primary { 
                    background-color: transparent !important; 
                    border: 1px solid ${calendarBorder} !important; 
                    color: ${calendarText} !important; 
                    font-size: 0.8rem; font-weight: 600;
                }
                .custom-calendar .fc-button-active { background-color: #3182ce !important; border-color: #3182ce !important; color: white !important; }
            `}</style>
        </Box>
    );
}

export default Schedule;