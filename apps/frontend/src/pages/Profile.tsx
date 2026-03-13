import {
    Box,
    Heading,
    Text,
    VStack,
    Stack,
    FormControl,
    FormLabel,
    Input,
    Button,
    useToast,
    Spinner,
    Card,
    CardBody,
    CardHeader,
    HStack,
    Icon,
    useColorModeValue,
    Divider
} from '@chakra-ui/react';
import { useGlobalStateStore } from '../app/GlobalState';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiEdit2 } from 'react-icons/fi';
import { trpc } from '../utils/trpc';
import { PageHeader } from '../components/UI/PageHeader';
import { PremiumCard } from '../components/UI/PremiumCard';

export default function Profile() {
    const { user, setUser } = useGlobalStateStore();
    const [isEditing, setIsEditing] = useState(false);
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
        defaultValues: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
        }
    });
    const toast = useToast();

    const updateProfileMutation = trpc.user.updateProfile.useMutation({
        onSuccess: (updatedUser) => {
            setUser(updatedUser as any);
            toast({ title: 'Profile updated successfully', status: 'success' });
            setIsEditing(false);
            reset({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email });
        },
        onError: (e: any) => {
            toast({ title: 'Error updating profile', description: e.message, status: 'error' });
        }
    });

    useEffect(() => {
        reset({
            id: user?.id,
            name: user?.name,
            email: user?.email,
        });
    }, [user, reset]);

    const onSubmit = (data: any) => {
        updateProfileMutation.mutate(data);
    };

    if (!user) return null;

    return (
        <Box p={6}>
            <PageHeader
                title="My Profile"
                subtitle="View and manage your account information."
                icon={FiUser}
            />

            <VStack spacing={8} maxW="2xl">
                <PremiumCard w="full">
                    <VStack spacing={6} align="stretch">
                        <HStack justify="space-between" align="center">
                            <Heading size="md">Account Information</Heading>
                            {!isEditing && (
                                <Button
                                    leftIcon={<FiEdit2 />}
                                    variant="outline"
                                    colorScheme="brand"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </HStack>

                        <Divider />

                        {!isEditing ? (
                            <VStack spacing={4} align="start" w="full">
                                <Box w="full">
                                    <Text fontSize="sm" color="gray.500" mb={1}>
                                        Name
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold">
                                        {user.name}
                                    </Text>
                                </Box>

                                <Box w="full">
                                    <Text fontSize="sm" color="gray.500" mb={1}>
                                        Email
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold">
                                        {user.email}
                                    </Text>
                                </Box>

                                <Box w="full">
                                    <Text fontSize="sm" color="gray.500" mb={1}>
                                        Employee ID
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold">
                                        {user.employeeId}
                                    </Text>
                                </Box>

                                <Box w="full">
                                    <Text fontSize="sm" color="gray.500" mb={1}>
                                        Department
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold">
                                        {user.department}
                                    </Text>
                                </Box>

                                <Box w="full">
                                    <Text fontSize="sm" color="gray.500" mb={1}>
                                        Current Shift
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold">
                                        {user.currentShift}
                                    </Text>
                                </Box>

                                <Box w="full">
                                    <Text fontSize="sm" color="gray.500" mb={1}>
                                        Account Status
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold" color="green.500">
                                        {user.status}
                                    </Text>
                                </Box>
                            </VStack>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                                <Stack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Full Name</FormLabel>
                                        <Input
                                            placeholder="Your name"
                                            borderRadius="xl"
                                            {...register('name', { required: true })}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Email Address</FormLabel>
                                        <Input
                                            type="email"
                                            placeholder="your@email.com"
                                            borderRadius="xl"
                                            {...register('email', { required: true })}
                                        />
                                    </FormControl>

                                    <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} pt={4}>
                                        <Button
                                            type="submit"
                                            colorScheme="brand"
                                            isLoading={updateProfileMutation.isLoading}
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false);
                                                reset({
                                                    id: user?.id,
                                                    name: user?.name,
                                                    email: user?.email,
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </Stack>
                                </Stack>
                            </form>
                        )}
                    </VStack>
                </PremiumCard>
            </VStack>
        </Box>
    );
}
