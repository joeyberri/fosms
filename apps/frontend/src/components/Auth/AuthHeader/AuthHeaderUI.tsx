import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  VStack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiChevronDown, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { User } from '../../../app/GlobalState';

export type AuthHeaderProps = {
  user?: User;
  handleSignOut: () => void;
};

const AuthHeaderUI = (props: AuthHeaderProps) => {
  const navigate = useNavigate();
  const menuBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  return (
    <HStack position={'relative'} spacing={{ base: '0', md: '6' }}>
      <Flex alignItems={'center'}>
        {props.user ? (
          <Menu gutter={8} autoSelect={false}>
            <MenuButton
              as={Button}
              variant="ghost"
              py={4}
              h="auto"
              transition="all 0.3s"
              _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
              _active={{ bg: 'transparent' }}
              _expanded={{ bg: 'transparent' }}
              _focus={{ boxShadow: 'none' }}
              bg={'transparent'}
              borderRadius="full"
            >
              <HStack spacing={3}>
                <Avatar
                  size={'sm'}
                  name={props.user.name}
                  border="2px solid"
                  borderColor="brand.400"
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="0"
                  ml="1"
                >
                  <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('gray.700', 'white')}>{props.user.name}</Text>
                  <Text fontSize="xs" fontWeight="medium" color="gray.500">
                    {props.user.role === 1 ? 'Administrator' : 'Factory Staff'}
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }} color="gray.400">
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={menuBg}
              shadow="2xl"
              borderRadius="xl"
              p={2}
              border="1px solid"
              borderColor={useColorModeValue('gray.100', 'gray.700')}
              zIndex={10}
            >
              <MenuItem
                borderRadius="lg"
                icon={<Icon as={FiUser} />}
                bg={'transparent'}
                _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
                _focus={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
                _active={{ bg: 'transparent' }}
                fontWeight="medium"
                mb={1}
              >
                Profile
              </MenuItem>
              <MenuItem
                borderRadius="lg"
                icon={<Icon as={FiSettings} />}
                bg={'transparent'}
                _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
                _focus={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
                _active={{ bg: 'transparent' }}
                fontWeight="medium"
                mb={1}
              >
                Settings
              </MenuItem>
              <MenuDivider mx={2} my={2} />
              <MenuItem
                borderRadius="lg"
                icon={<Icon as={FiLogOut} />}
                color="red.400"
                bg={'transparent'}
                _hover={{ bg: 'red.500', color: 'white' }}
                _focus={{ bg: 'red.500', color: 'white' }}
                _active={{ bg: 'transparent' }}
                fontWeight="bold"
                onClick={props.handleSignOut}
              >
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Flex gap={2}>
            <Button onClick={() => navigate('/sign-up')}>Sign up</Button>
            <Button onClick={() => navigate('/login')}>Sign in</Button>
          </Flex>
        )}
      </Flex>
    </HStack>
  );
};

export default AuthHeaderUI;
