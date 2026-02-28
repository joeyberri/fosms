import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Button, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    FormControl, FormLabel, Input, Stack, useToast, Spinner, Badge,
    Flex, InputGroup, InputLeftElement, Icon, HStack, Text, useColorModeValue,
    VStack, Heading
} from '@chakra-ui/react';
import { trpc } from '../../utils/trpc';
import { useForm, Controller } from 'react-hook-form';
import { useState, useMemo } from 'react';
import { FiSearch, FiUserPlus, FiUser, FiHash, FiShield, FiBriefcase, FiCheckCircle, FiUsers } from 'react-icons/fi';
import { CustomSelect } from '../../components/UI/CustomSelect';
import { PageHeader } from '../../components/UI/PageHeader';
import { PremiumCard } from '../../components/UI/PremiumCard';

export default function ManageUsers() {
    const { data: users, isLoading, refetch } = trpc.user.list.useQuery();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF'>('ALL');

    // Form handling for the modal
    const { register, handleSubmit, reset, control } = useForm();

    const toast = useToast();

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'ALL' ||
                (roleFilter === 'ADMIN' && u.role === 1) ||
                (roleFilter === 'STAFF' && u.role === 0);
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const createUserMutation = trpc.user.create.useMutation({
        onSuccess: () => {
            toast({ title: 'User created successfully', status: 'success' });
            refetch();
            reset();
            onClose();
        },
        onError: (e: any) => {
            toast({ title: 'Error creating user', description: e.message, status: 'error' });
        }
    });

    if (isLoading) return <Box py={20} textAlign="center"><Spinner size="xl" color="brand.500" thickness="4px" /></Box>;

    return (
        <Box p={6}>
            <PageHeader
                title="User Management"
                subtitle="Manage factory personnel and permissions."
                icon={FiUsers}
                rightElement={
                    <Button leftIcon={<FiUserPlus />} colorScheme="brand" onClick={onOpen} shadow="lg">
                        Add New User
                    </Button>
                }
            />

            <PremiumCard mb={6}>
                <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                    <InputGroup maxW={{ md: 'md' }}>
                        <InputLeftElement pointerEvents="none">
                            <Icon as={FiSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search by name, email, or ID..."
                            borderRadius="xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <Box minW="200px">
                        <CustomSelect
                            options={[
                                { value: 'ALL', label: 'All Roles' },
                                { value: 'ADMIN', label: 'Admins Only' },
                                { value: 'STAFF', label: 'Staff Only' }
                            ]}
                            value={{ value: roleFilter, label: roleFilter === 'ALL' ? 'All Roles' : roleFilter === 'ADMIN' ? 'Admins Only' : 'Staff Only' }}
                            onChange={(val: any) => setRoleFilter(val?.value)}
                            isSearchable={false}
                        />
                    </Box>
                </Stack>
            </PremiumCard>

            <PremiumCard p={0}>
                <Table variant="simple">
                    <Thead bg={useColorModeValue('gray.50', 'whiteAlpha.50')}>
                        <Tr>
                            <Th><HStack spacing={1}><Icon as={FiHash} /> <Text>ID</Text></HStack></Th>
                            <Th><HStack spacing={1}><Icon as={FiUser} /> <Text>Name</Text></HStack></Th>
                            <Th><HStack spacing={1}><Icon as={FiBriefcase} /> <Text>Dept</Text></HStack></Th>
                            <Th><HStack spacing={1}><Icon as={FiShield} /> <Text>Role</Text></HStack></Th>
                            <Th>Status</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredUsers.map((user) => (
                            <Tr key={user.id} _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }} transition="0.2s">
                                <Td><Badge variant="outline" borderRadius="md">{user.employeeId}</Badge></Td>
                                <Td>
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="bold">{user.name}</Text>
                                        <Text fontSize="xs" color="gray.500">{user.email}</Text>
                                    </VStack>
                                </Td>
                                <Td fontSize="sm">{user.department}</Td>
                                <Td>
                                    <Badge colorScheme={user.role === 1 ? 'purple' : 'blue'} borderRadius="full" px={3} variant="subtle">
                                        {user.role === 1 ? 'Admin' : 'Staff'}
                                    </Badge>
                                </Td>
                                <Td>
                                    <HStack spacing={1}>
                                        <Icon as={FiCheckCircle} color="green.500" />
                                        <Text fontSize="xs" fontWeight="bold" color="green.500">{user.status}</Text>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                {filteredUsers.length === 0 && (
                    <Box py={20} textAlign="center">
                        <Icon as={FiSearch} w={12} h={12} color="gray.300" mb={4} />
                        <Heading size="sm" color="gray.500">No users found matching your search.</Heading>
                    </Box>
                )}
            </PremiumCard>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay backdropFilter="blur(5px)" />
                <ModalContent borderRadius="2xl">
                    <ModalHeader borderBottomWidth="1px">Add New Personnel Account</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <form onSubmit={handleSubmit((data: any) => createUserMutation.mutate({ ...data, role: parseInt(data.role), currentShift: 'None' }))}>
                            <Stack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Employee ID</FormLabel>
                                    <Input placeholder="FAB-1234" borderRadius="xl" {...register('employeeId', { required: true })} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Full Name</FormLabel>
                                    <Input placeholder="John Doe" borderRadius="xl" {...register('name', { required: true })} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Email Address</FormLabel>
                                    <Input type="email" placeholder="john@fosms.com" borderRadius="xl" {...register('email', { required: true })} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Password</FormLabel>
                                    <Input type="password" placeholder="••••••••" borderRadius="xl" {...register('password', { required: true, minLength: 6 })} />
                                </FormControl>
                                <HStack spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Role</FormLabel>
                                        <Controller
                                            name="role"
                                            control={control}
                                            defaultValue="0"
                                            render={({ field }) => (
                                                <CustomSelect
                                                    {...field}
                                                    options={[
                                                        { value: '0', label: 'Staff' },
                                                        { value: '1', label: 'Admin' }
                                                    ]}
                                                    placeholder="Select Role"
                                                    onChange={(val: any) => field.onChange(val?.value)}
                                                    value={field.value === '1' ? { value: '1', label: 'Admin' } : { value: '0', label: 'Staff' }}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Department</FormLabel>
                                        <Input placeholder="Assembly" borderRadius="xl" {...register('department', { required: true })} />
                                    </FormControl>
                                </HStack>
                                <Button type="submit" colorScheme="brand" h="12" borderRadius="xl" isLoading={createUserMutation.isLoading} mt={4} shadow="md">
                                    Provision Account
                                </Button>
                            </Stack>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box >
    );
}
