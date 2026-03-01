import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  FormErrorMessage,
  Image,
  Icon,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { FiUserPlus, FiUser, FiMail, FiLock, FiLogOut } from 'react-icons/fi';
import bgImage from '../../../assets/auth-bg.jpg';

export type SignUpFormValues = {
  name: string;
  employeeId: string;
  email: string;
  password: string;
};

type SignUpCardProps = {
  onSubmit(values: SignUpFormValues): void;
};

function SignUpCardUI({ onSubmit }: SignUpCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>();

  const bgColor = useColorModeValue('white', 'gray.800');
  const secondaryBg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* Visual Side */}
      <Flex
        flex={1}
        bg="brand.500"
        position="relative"
        display={{ base: 'none', lg: 'flex' }}
        align="center"
        justify="center"
        overflow="hidden"
      >
        <Image
          src={bgImage}
          objectFit="cover"
          w="full"
          h="full"
          position="absolute"
        />
        <VStack spacing={6} px={20} zIndex={1} color="white" textAlign="center">
          <Icon as={FiUserPlus} w={20} h={20} mb={4} filter="drop-shadow(0 0 20px rgba(0,0,0,0.5))" />
          <Heading size="3xl" fontWeight="black" letterSpacing="tight">
            Join FOSMS
          </Heading>
          <Text fontSize="2xl" fontWeight="medium" maxW="500px">
            Start managing your professional industrial journey with a modern twist.
          </Text>
        </VStack>
      </Flex>

      {/* Form Side */}
      <Flex
        flex={1}
        align="center"
        justify="center"
        bg={secondaryBg}
        px={{ base: 4, md: 10 }}
        py={10}
      >
        <Stack
          spacing={8}
          w="full"
          maxW="md"
          bg={bgColor}
          p={10}
          borderRadius="2xl"
          boxShadow="2xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Stack spacing={2}>
            <Heading size="xl" fontWeight="bold">
              Create Account
            </Heading>
            <Text color="gray.500">
              Fill in your details to get started on the platform
            </Text>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Full Name</FormLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  h="12"
                  borderRadius="xl"
                  bg={secondaryBg}
                  border="none"
                  _focus={{ bg: bgColor, boxShadow: '0 0 0 2px #03a9f4' }}
                  {...register('name', { required: 'Name is required' })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.employeeId}>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Employee ID</FormLabel>
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="EMP-001"
                  h="12"
                  borderRadius="xl"
                  bg={secondaryBg}
                  border="none"
                  _focus={{ bg: bgColor, boxShadow: '0 0 0 2px #03a9f4' }}
                  {...register('employeeId', { required: 'Employee ID is required' })}
                />
                <FormErrorMessage>{errors.employeeId?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Email address</FormLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@fosms.com"
                  h="12"
                  borderRadius="xl"
                  bg={secondaryBg}
                  border="none"
                  _focus={{ bg: bgColor, boxShadow: '0 0 0 2px #03a9f4' }}
                  {...register('email', {
                    required: 'Email is required',
                  })}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.password}>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">Password</FormLabel>
                <InputGroup>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    h="12"
                    borderRadius="xl"
                    bg={secondaryBg}
                    border="none"
                    _focus={{ bg: bgColor, boxShadow: '0 0 0 2px #03a9f4' }}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Minimum length should be 6',
                      },
                    })}
                  />
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <Button
                isLoading={isSubmitting}
                loadingText="Creating account..."
                size="lg"
                h="14"
                bg={'brand.500'}
                color={'white'}
                type={'submit'}
                mt={4}
                borderRadius="xl"
                fontWeight="bold"
                _hover={{
                  bg: 'brand.600',
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s"
              >
                Create Account
              </Button>

              <HStack justify="center" pt={4}>
                <Text fontSize="sm" color="gray.500">
                  Already have an account?
                </Text>
                <Link
                  as={RouterLink}
                  to="/login"
                  color="brand.500"
                  fontWeight="bold"
                  fontSize="sm"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Sign In
                </Link>
              </HStack>
            </Stack>
          </form>
        </Stack>
      </Flex>
    </Flex>
  );
}

export default SignUpCardUI;
