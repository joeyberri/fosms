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
import React from 'react';
import { useGlobalStateStore } from '../app/GlobalState';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiRefreshCw, FiUsers, FiBarChart2, FiClock, FiSettings } from 'react-icons/fi';
import { PageHeader } from '../components/UI/PageHeader';
import { PremiumCard } from '../components/UI/PremiumCard';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Home = () => {
  const { user } = useGlobalStateStore();
  const navigate = useNavigate();
  const accentColor = useColorModeValue('brand.500', 'brand.300');

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
            <Text fontSize="xl" color="gray.500" maxW="2xl" mx="auto">
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

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={10}>
        <StatCard label="My Next Shift" number="Mon, Oct 24" help="Morning (08:00 - 16:00)" icon={FiCalendar} />
        <StatCard label="Pending Swaps" number="3" help="2 outgoing, 1 incoming" icon={FiRefreshCw} />
        <StatCard label="Team Members" number="24" help="Across 4 departments" icon={FiUsers} />
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
        <ActionCard
          title="Shift Swap Center"
          description="Request a trade or respond to pending swap invites."
          buttonText="Manage Swaps"
          onClick={() => navigate('/swaps')}
          color="orange.400"
          icon={FiRefreshCw}
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

const ActionCard = ({ title, description, buttonText, onClick, color, icon }: any) => {
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
          <Text color="gray.500">{description}</Text>
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
