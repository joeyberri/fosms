import { ReactNode } from 'react';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
} from '@chakra-ui/react';
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { ReactText } from 'react';
import AuthHeader from '../Auth/AuthHeader/AuthHeader';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { useGlobalStateStore } from '../../app/GlobalState';

interface LinkItemProps {
  name: string;
  icon: IconType;
  path: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: FiHome, path: '/' },
  { name: 'Schedule', icon: FiCompass, path: '/schedule' },
  { name: 'Swaps', icon: FiTrendingUp, path: '/swaps' },
];

const AdminLinkItems: Array<LinkItemProps> = [
  ...LinkItems,
  { name: 'Manage Users', icon: FiStar, path: '/admin/users' },
  { name: 'Reports', icon: FiSettings, path: '/admin/reports' },
];

export default function SidebarWithHeader({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { user } = useGlobalStateStore();
  const location = useLocation();
  const items = user?.role === 1 ? AdminLinkItems : LinkItems;

  return (
    <Box
      transition="0.3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="black" bgGradient="linear(to-r, brand.400, brand.600)" bgClip="text" letterSpacing="tight">
          FOSMS
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {items.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <NavItem key={link.name} icon={link.icon} path={link.path} isActive={isActive}>
            {link.name}
          </NavItem>
        );
      })}
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: ReactText;
  path: string;
  isActive?: boolean;
}
const NavItem = ({ icon, children, path, isActive, ...rest }: NavItemProps) => {
  const activeBg = useColorModeValue('brand.500', 'brand.400');
  const activeColor = 'white';

  return (
    <Link
      as={RouterLink}
      to={path}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        my="1"
        borderRadius="xl"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : useColorModeValue('gray.600', 'gray.400')}
        fontWeight={isActive ? 'bold' : 'medium'}
        transition="all 0.2s"
        boxShadow={isActive ? '0 4px 12px rgba(3, 169, 244, 0.3)' : 'none'}
        _hover={{
          bg: isActive ? activeBg : useColorModeValue('gray.50', 'whiteAlpha.100'),
          color: isActive ? activeColor : useColorModeValue('brand.500', 'brand.300'),
          transform: 'translateX(5px)',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="20"
            _groupHover={{
              color: isActive ? activeColor : 'brand.500',
            }}
            as={icon}
            color={isActive ? activeColor : 'inherit'}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Logo
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <AuthHeader />
      </HStack>
    </Flex>
  );
};
