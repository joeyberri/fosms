import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  HStack,
  SimpleGrid,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Container,
  Flex,
  Spacer
} from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { useGlobalStateStore } from '../app/GlobalState';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiRefreshCw, FiUsers, FiBarChart2, FiClock, FiSettings } from 'react-icons/fi';
import { PageHeader } from '../components/UI/PageHeader';
import { PremiumCard } from '../components/UI/PremiumCard';
import ReminderAlert from '../components/Notifications/ReminderAlert';
import { trpc } from '../utils/trpc';


const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Home = () => {
  const { user } = useGlobalStateStore();
  const navigate = useNavigate();
  const accentColor = useColorModeValue('brand.500', 'brand.300');

  // Fetch real data
  const { data: mySchedule } = trpc.shift.mySchedule.useQuery();
  const { data: mySwapRequests } = trpc.shift.mySwapRequests.useQuery();
  const { data: colleagues } = trpc.user.listColleagues.useQuery();
  const { data: unreadNotifications } = trpc.notification.getUnread.useQuery(undefined, {
    enabled: !!user,
  });


  // Calculate next shift
  const nextShift = useMemo(() => {
    if (!mySchedule || mySchedule.length === 0) return null;
    const now = new Date();
    return mySchedule
      .filter(s => new Date(s.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [mySchedule]);

  // Calculate pending swaps
  const pendingSwaps = useMemo(() => {
    if (!mySwapRequests) return 0;
    return mySwapRequests.filter(r => r.status === 'PENDING').length;
  }, [mySwapRequests]);

  // Calculate team members count
  const teamMembersCount = useMemo(() => {
    if (!colleagues) return 0;
    return colleagues.length;
  }, [colleagues]);

  // Get unique departments
  const departmentsCount = useMemo(() => {
    if (!colleagues) return 0;
    const uniqueDepts = new Set(colleagues.map(c => c.department));
    return uniqueDepts.size;
  }, [colleagues]);

  // Format next shift date
  const nextShiftDisplay = useMemo(() => {
    if (!nextShift) return 'No upcoming shifts';
    const date = new Date(nextShift.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dayName}, ${monthDay}`;
  }, [nextShift]);

  const nextShiftTime = nextShift ? `${nextShift.shiftType} (${nextShift.startTime} - ${nextShift.endTime})` : '';

  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  if (!user) {
    return (
      <Container maxW="container.lg" py={20}>
        <VStack spacing={10} textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 } as any}
          >
            <Heading as="h1" size="4xl" mb={4} bgGradient="linear(to-r, brand.400, accent.400)" bgClip="text">
              Precision in Every Shift
            </Heading>
            <Text fontSize="xl" color={secondaryTextColor} maxW="2xl" mx="auto">
              FOSMS streamlines your factory operations, from seamless shift scheduling to instant swap requests.
            </Text>
          </MotionBox>

          <MotionFlex
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 } as any}
            justify="center"
            gap={6}
          >
            <Button
              size="lg"
              colorScheme="brand"
              px={10}
              fontSize="md"
              onClick={() => navigate('/login')}
              _hover={{ transform: 'scale(1.05)' }}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              px={10}
              fontSize="md"
              onClick={() => navigate('/sign-up')}
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              Join the Team
            </Button>
          </MotionFlex>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full" pt={20}>
            {[
              { icon: FiClock, title: 'Real-time Scheduling', text: 'Instantly view and manage your shifts.' },
              { icon: FiRefreshCw, title: 'Smart Swaps', text: 'Effortless shift trade requests with colleagues.' },
              { icon: FiBarChart2, title: 'Admin Insights', text: 'Powerful reporting and user management.' },
            ].map((item, i) => (
              <PremiumCard
                key={i}
                p={8}
                textAlign="left"
              >
                <Icon as={item.icon} w={10} h={10} color="brand.500" mb={4} />
                <Heading size="md" mb={2}>{item.title}</Heading>
                <Text color="gray.500">{item.text}</Text>
              </PremiumCard>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  return (
    <Box p={6}>
      <PageHeader
        title={`Welcome back, ${user.name} 👋`}
        subtitle="Here's what's happening in the factory today."
        icon={FiUsers}
      />

      <ReminderAlert notifications={unreadNotifications || []} />


      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={10}>
        <StatCard label="My Next Shift" number={nextShiftDisplay} help={nextShiftTime || 'Loading...'} icon={FiCalendar} />
        <StatCard label="Pending Swaps" number={pendingSwaps.toString()} help={pendingSwaps === 1 ? '1 swap request' : `${pendingSwaps} swap requests`} icon={FiRefreshCw} />
        <StatCard label="Team Members" number={teamMembersCount.toString()} help={departmentsCount === 1 ? `${departmentsCount} department` : `${departmentsCount} departments`} icon={FiUsers} />
        {user.role === 1 && <StatCard label="System Alerts" number="0" help="All systems operational" icon={FiBarChart2} color="green.500" />}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <ActionCard
          title="Manage Your Schedule"
          description="View your upcoming assignments and mark attendance."
          buttonText="View Full Schedule"
          onClick={() => navigate('/schedule')}
          color="brand.500"
          icon={FiCalendar}
        />
        {user.role === 1 && (
          <ActionCard
            title="Administration"
            description="Full control over user accounts and system reports."
            buttonText="Admin Panel"
            onClick={() => navigate('/admin/users')}
            color="purple.500"
            icon={FiSettings}
          />
        )}
      </SimpleGrid>
    </Box>
  );
};

const StatCard = ({ label, number, help, icon, color }: any) => {
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  return (
    <PremiumCard h="full">
      <Flex align="center" h="full">
        <Stat>
          <StatLabel color={secondaryTextColor} fontWeight="medium">{label}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">{number}</StatNumber>
          <StatHelpText mb={0} color={secondaryTextColor}>{help}</StatHelpText>
        </Stat>
        <Spacer />
        <Icon as={icon} w={8} h={8} color={color || 'brand.500'} opacity={0.3} />
      </Flex>
    </PremiumCard>
  );
};

const ActionCard = ({ title, description, buttonText, onClick, color, icon }: any) => {
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  return (
    <PremiumCard
      whileHover={{ y: -5 }}
      p={8}
      position="relative"
      overflow="hidden"
    >
      <VStack align="start" spacing={4}>
        <Icon as={icon} w={12} h={12} color={color} mb={2} />
        <Box>
          <Heading size="md" mb={2}>{title}</Heading>
          <Text color={secondaryTextColor}>{description}</Text>
        </Box>
        <Button colorScheme="brand" variant="outline" size="md" onClick={onClick}>
          {buttonText}
        </Button>
      </VStack>
      <Box position="absolute" top="-10%" right="-5%" opacity={0.05}>
        <Icon as={icon} w={40} h={40} color={color} />
      </Box>
    </PremiumCard>
  );
};

export default Home;
