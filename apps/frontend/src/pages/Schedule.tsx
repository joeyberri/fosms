import {
    Box, Heading, Text, VStack, Spinner, SimpleGrid, Badge, Stack, Button,
    HStack, IconButton, useColorModeValue, Flex, Stat, StatLabel, StatNumber, StatHelpText, Spacer, Icon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { useState, useMemo } from 'react';
import { FiList, FiCalendar, FiClock, FiActivity, FiArrowRight, FiInfo } from 'react-icons/fi';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { PageHeader } from '../components/UI/PageHeader';
import { PremiumCard } from '../components/UI/PremiumCard';

const StatCard = ({ label, number, help, icon, color }: any) => {
    return (
        <PremiumCard h="full">
            <Flex align="center" h="full">
                <Stat>
                    <StatLabel color="gray.500" fontWeight="medium">{label}</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold">{number}</StatNumber>
                    <StatHelpText mb={0}>{help}</StatHelpText>
                </Stat>
                <Spacer />
                <Icon as={icon} w={8} h={8} color={color || 'brand.500'} opacity={0.3} />
            </Flex>
        </PremiumCard>
    );
};

function Schedule() {
    const { data: mySchedule, isLoading, error } = trpc.shift.mySchedule.useQuery();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    // Move all hooks to the top to satisfy Rules of Hooks
    const toggleBg = useColorModeValue('gray.100', 'gray.700');
    const noteBg = useColorModeValue('gray.50', 'whiteAlpha.50');
    const calendarBorder = useColorModeValue('#E2E8F0', '#2D3748');
    const calendarText = useColorModeValue('#2D3748', '#E2E8F0');

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

    const nextShift = useMemo(() => {
        if (!mySchedule || mySchedule.length === 0) return null;
        const now = new Date();
        return mySchedule
            .filter(s => new Date(s.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [mySchedule]);

    const totalHours = useMemo(() => {
        if (!mySchedule) return 0;
        return mySchedule.length * 8; // Assuming 8-hour shifts for summary
    }, [mySchedule]);

    if (isLoading) {
        return (
            <Box textAlign="center" py={20}>
                <Spinner size="xl" color="brand.500" thickness="4px" />
                <Text mt={4} fontWeight="medium" color="gray.500">Loading your schedule...</Text>
            </Box>
        );
    }

    if (error) {
        const isUnauthorized = error.message.includes('Unauthorized') || error.data?.httpStatus === 401;
        return (
            <Box textAlign="center" py={10}>
                <VStack spacing={4}>
                    <Text color="red.500" fontWeight="bold">Error loading schedule: {error.message}</Text>
                    {isUnauthorized && (
                        <Button colorScheme="brand" onClick={() => navigate('/login')}>
                            Sign In Again
                        </Button>
                    )}
                </VStack>
            </Box>
        );
    }

    const viewToggle = (
        <HStack spacing={2} bg={toggleBg} p={1} borderRadius="xl">
            <IconButton
                aria-label="List View"
                icon={<FiList />}
                onClick={() => setViewMode('list')}
                colorScheme={viewMode === 'list' ? 'brand' : 'ghost'}
                variant={viewMode === 'list' ? 'solid' : 'ghost'}
                size="sm"
                borderRadius="lg"
            />
            <IconButton
                aria-label="Calendar View"
                icon={<FiCalendar />}
                onClick={() => setViewMode('calendar')}
                colorScheme={viewMode === 'calendar' ? 'brand' : 'ghost'}
                variant={viewMode === 'calendar' ? 'solid' : 'ghost'}
                size="sm"
                borderRadius="lg"
            />
        </HStack>
    );

    return (
        <Box p={6}>
            <PageHeader
                title="My Schedule"
                subtitle="Manage your shifts and assignments."
                icon={FiCalendar}
                rightElement={viewToggle}
            />

            {/* Summary Section */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                <StatCard
                    label="Total Shifts"
                    number={mySchedule?.length || 0}
                    help="Active assignments"
                    icon={FiActivity}
                />
                <StatCard
                    label="Next Assignment"
                    number={nextShift ? new Date(nextShift.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'None'}
                    help={nextShift ? `${nextShift.shiftType} Shift` : 'No upcoming shifts'}
                    icon={FiClock}
                />
                <StatCard
                    label="Upcoming Hours"
                    number={`${totalHours}h`}
                    help="Projected for this period"
                    icon={FiCalendar}
                />
            </SimpleGrid>

            {viewMode === 'list' ? (
                (!mySchedule || mySchedule.length === 0) ? (
                    <PremiumCard textAlign="center" py={20}>
                        <VStack spacing={4}>
                            <Icon as={FiInfo} w={12} h={12} color="gray.300" />
                            <Box>
                                <Text fontSize="xl" fontWeight="bold" color="gray.600">No shifts assigned</Text>
                                <Text color="gray.400">Your schedule is currently empty.</Text>
                            </Box>
                        </VStack>
                    </PremiumCard>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {mySchedule.map((assignment) => (
                            <PremiumCard key={assignment.id} h="full">
                                <Stack spacing={4} h="full">
                                    <Flex justify="space-between" align="center">
                                        <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500">
                                            {new Date(assignment.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </Heading>
                                        <Badge
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            variant="subtle"
                                            colorScheme={
                                                assignment.shiftType === 'Morning' ? 'yellow' :
                                                    assignment.shiftType === 'Afternoon' ? 'orange' : 'blue'
                                            }
                                        >
                                            {assignment.shiftType}
                                        </Badge>
                                    </Flex>

                                    <VStack align="start" spacing={4} flex={1}>
                                        <VStack align="start" spacing={1}>
                                            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Time Range</Text>
                                            <HStack color="gray.700">
                                                <Icon as={FiClock} w={4} h={4} color="brand.500" />
                                                <Text fontWeight="bold" fontSize="lg">{assignment.startTime} - {assignment.endTime}</Text>
                                            </HStack>
                                        </VStack>

                                        <VStack align="start" spacing={1}>
                                            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Location</Text>
                                            <Text fontWeight="semibold" color="gray.600">{assignment.location}</Text>
                                        </VStack>

                                        {assignment.notes && (
                                            <Box p={3} bg={noteBg} borderRadius="xl" w="full" border="1px dashed" borderColor="gray.200">
                                                <Text fontSize="xs" color="gray.500" fontStyle="italic">"{assignment.notes}"</Text>
                                            </Box>
                                        )}
                                    </VStack>

                                    <Button
                                        size="md"
                                        variant="outline"
                                        rightIcon={<FiArrowRight />}
                                        colorScheme="brand"
                                        onClick={() => navigate(`/swaps?date=${new Date(assignment.date).toISOString().split('T')[0]}`)}
                                        _hover={{ bg: 'brand.50', borderColor: 'brand.200' }}
                                    >
                                        Request Swap
                                    </Button>
                                </Stack>
                            </PremiumCard>
                        ))}
                    </SimpleGrid>
                )
            ) : (
                <PremiumCard p={8} className="custom-calendar">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                        }}
                        events={calendarEvents}
                        height="auto"
                        eventContent={renderEventContent}
                    />
                </PremiumCard>
            )}
            <style>{`
                .custom-calendar .fc {
                    --fc-border-color: ${calendarBorder};
                    font-family: inherit;
                }
                .custom-calendar .fc-toolbar-title {
                    font-size: 1.1rem !important;
                    font-weight: 700;
                }
                .custom-calendar .fc-button-primary {
                    background-color: transparent !important;
                    border: 1px solid ${calendarBorder} !important;
                    color: ${calendarText} !important;
                    text-transform: capitalize;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .custom-calendar .fc-button-active {
                    background-color: #03a9f4 !important;
                    border-color: #03a9f4 !important;
                    color: white !important;
                }
            `}</style>
        </Box>
    );
}

function renderEventContent(eventInfo: any) {
    return (
        <Box p={1} overflow="hidden">
            <Text fontSize="xs" fontWeight="bold" isTruncated color="white">
                {eventInfo.event.title}
            </Text>
        </Box>
    );
}

export default Schedule;
