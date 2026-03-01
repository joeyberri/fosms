import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Image,
  Icon,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { FiMail, FiLock, FiLogOut } from 'react-icons/fi';
import bgImage from '../../../assets/auth-bg.jpg';

export type SignInFormValues = {
  email: string;
  password: string;
};

type SignInCardProps = {
  rememberMe: boolean;
  onSubmit(values: SignInFormValues): void;
  handleRememberMe(value: boolean): void;
};

function SignInCardUI({
  onSubmit,
  rememberMe,
  handleRememberMe,
}: SignInCardProps) {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>();

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
          <Icon as={FiLogOut} w={20} h={20} mb={4} filter="drop-shadow(0 0 20px rgba(0,0,0,0.5))" />
          <Heading size="3xl" fontWeight="black" letterSpacing="tight">
            FOSMS
          </Heading>
          <Text fontSize="2xl" fontWeight="medium" maxW="500px">
            Powering industrial efficiency through intelligent shift synchronization.
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
              Welcome back
            </Heading>
            <Text color="gray.500">
              Enter your credentials to access your dashboard
            </Text>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={5}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  Email Address
                </FormLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@fosms.com"
                  h="12"
                  borderRadius="xl"
                  bg={secondaryBg}
                  border="none"
                  _focus={{
                    bg: bgColor,
                    boxShadow: '0 0 0 2px #03a9f4',
                  }}
                  {...register('email', {
                    required: 'Email is required',
                  })}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                  Password
                </FormLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  h="12"
                  borderRadius="xl"
                  bg={secondaryBg}
                  border="none"
                  _focus={{
                    bg: bgColor,
                    boxShadow: '0 0 0 2px #03a9f4',
                  }}
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />
              </FormControl>

              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align="start"
                justify="space-between"
              >
                <Checkbox
                  isChecked={rememberMe}
                  onChange={(e) => handleRememberMe(e.target.checked)}
                  colorScheme="brand"
                  size="md"
                >
                  <Text fontSize="sm">Stay signed in</Text>
                </Checkbox>
              </Stack>

              <Button
                bg="brand.500"
                color="white"
                h="14"
                fontSize="md"
                fontWeight="bold"
                borderRadius="xl"
                isLoading={isSubmitting}
                type="submit"
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
                Sign In
              </Button>

              <HStack justify="center" pt={4}>
                <Text fontSize="sm" color="gray.500">
                  Don't have an account?
                </Text>
                <Link
                  as={RouterLink}
                  to="/sign-up"
                  color="brand.500"
                  fontWeight="bold"
                  fontSize="sm"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Create one now
                </Link>
              </HStack>
            </Stack>
          </form>
        </Stack>
      </Flex>
    </Flex>
  );
}

export default SignInCardUI;
