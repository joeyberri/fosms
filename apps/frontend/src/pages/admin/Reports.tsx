import React, { useMemo, useState } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, Text,
    Flex, Button, Icon, SimpleGrid, useColorModeValue, Stack, Heading, 
    Menu, MenuButton, MenuList, MenuItem, Input, InputGroup, 
    InputLeftElement, HStack, Stat, StatLabel, StatNumber, StatHelpText,
    VStack
} from '@chakra-ui/react';
import { 
    FiDownload, FiBarChart2, FiFileText, FiPrinter, 
    FiSearch, FiCalendar, FiFilter, FiUser 
} from 'react-icons/fi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell, Legend
} from 'recharts';

// Internal Utils & Components
import { trpc } from '../../utils/trpc';
import { PageHeader } from '../../components/UI/PageHeader';
import { PremiumCard } from '../../components/UI/PremiumCard';

export default function Reports() {
    const { data: shifts, isLoading } = trpc.shift.list.useQuery();
    
    // Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const COLORS = ['#ECC94B', '#ED8936', '#4299E1'];

    /**
     * Data Transformation: Filter shifts based on UI controls
     */
    const filteredShifts = useMemo(() => {
        if (!shifts) return [];
        return shifts.filter(s => {
            const matchesSearch = 
                s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.location.toLowerCase().includes(searchTerm.toLowerCase());
            
            const shiftDate = new Date(s.date);
            const matchesStart = startDate ? shiftDate >= new Date(startDate) : true;
            const matchesEnd = endDate ? shiftDate <= new Date(endDate) : true;

            return matchesSearch && matchesStart && matchesEnd;
        });
    }, [shifts, searchTerm, startDate, endDate]);

    /**
     * Chart Data: Aggregated based on filtered results
     */
    const chartData = useMemo(() => {
        const distribution = filteredShifts.reduce((acc: any, shift) => {
            acc[shift.shiftType] = (acc[shift.shiftType] || 0) + 1;
            return acc;
        }, {});
        
        return Object.keys(distribution).map(type => ({
            name: type,
            count: distribution[type]
        }));
    }, [filteredShifts]);

    /**
     * Export Logic: Respects current filters
     */
    const downloadCSV = () => {
        const headers = ['Date', 'Staff', 'Type', 'Start', 'End', 'Location'];
        const rows = filteredShifts.map(s => [
            new Date(s.date).toLocaleDateString(),
            s.user?.name || 'Unassigned',
            s.shiftType,
            s.startTime,
            s.endTime,
            s.location
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Filtered_Report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const downloadPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>FOSMS Operational Report</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 14px; word-wrap: break-word; }
                        th { background: #f7fafc; color: #4a5568; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
                        .header { border-bottom: 2px solid #3182ce; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { margin: 0; color: #2d3748; font-size: 24px; }
                        p { margin: 5px 0; color: #718096; font-size: 14px; }
                        .footer { margin-top: 30px; font-size: 12px; color: #a0aec0; text-align: center; }
                        @media print {
                            body { padding: 0; }
                            button { display: none; }
                            @page { margin: 2cm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Operational Shift Report</h1>
                        <p>Generated on ${new Date().toLocaleString()}</p>
                        <p>Total Records: ${filteredShifts.length}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 20%">Date</th>
                                <th style="width: 25%">Staff</th>
                                <th style="width: 15%">Type</th>
                                <th style="width: 20%">Timing</th>
                                <th style="width: 20%">Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredShifts.map(s => `
                                <tr>
                                    <td>${new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                    <td>${s.user?.name || 'Unassigned'}</td>
                                    <td>${s.shiftType}</td>
                                    <td>${s.startTime} - ${s.endTime}</td>
                                    <td>${s.location}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        Powered by FOSMS Operational Intelligence &copy; ${new Date().getFullYear()}
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to be parsed
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            // Optional: close the window after printing
            // printWindow.onafterprint = () => printWindow.close();
        };

        // Fallback for browsers where onload might not fire as expected for document.write
        setTimeout(() => {
            if (printWindow.document.readyState === 'complete') {
                printWindow.focus();
                printWindow.print();
            }
        }, 1000);
    };

    if (isLoading) return <Box py={20} textAlign="center"><Spinner size="xl" color="brand.500" thickness="4px" /></Box>;

    return (
        <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto">
            <PageHeader
                title="Operational Intelligence"
                subtitle="High-level shift analytics and data exports."
                icon={FiBarChart2}
                rightElement={
                    <Menu>
                        <MenuButton as={Button} leftIcon={<FiDownload />} colorScheme="brand" shadow="md">
                            Export Filtered Data
                        </MenuButton>
                        <MenuList>
                            <MenuItem icon={<FiDownload />} onClick={downloadCSV}>Excel / CSV</MenuItem>
                            <MenuItem icon={<FiPrinter />} onClick={downloadPDF}>Printable PDF</MenuItem>
                        </MenuList>
                    </Menu>
                }
            />

            {/* Filter Bar */}
            <PremiumCard mb={8}>
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} alignItems="end">
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={2} color={useColorModeValue('gray.500', 'gray.400')} textTransform="uppercase">Search Personnel</Text>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none"><FiSearch color="gray.300" /></InputLeftElement>
                            <Input 
                                placeholder="Name or location..." 
                                borderRadius="xl" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={2} color={useColorModeValue('gray.500', 'gray.400')} textTransform="uppercase">From Date</Text>
                        <Input type="date" borderRadius="xl" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={2} color={useColorModeValue('gray.500', 'gray.400')} textTransform="uppercase">To Date</Text>
                        <Input type="date" borderRadius="xl" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </Box>
                    <Button 
                        leftIcon={<FiFilter />} 
                        variant="ghost" 
                        onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                    >
                        Clear Filters
                    </Button>
                </SimpleGrid>
            </PremiumCard>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} mb={10}>
                {/* Distribution Chart */}
                <PremiumCard gridColumn={{ lg: 'span 2' }}>
                    <Flex justify="space-between" align="center" mb={6}>
                        <HStack>
                            <Icon as={FiBarChart2} color="brand.500" />
                            <Heading size="md">Shift Distribution</Heading>
                        </HStack>
                    </Flex>
                    <Box h="300px" w="full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: useColorModeValue('gray.100', 'whiteAlpha.100') }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </PremiumCard>

                {/* KPI Sidebar */}
                <VStack spacing={6} align="stretch">
                    <StatItem 
                        label="Filtered Total" 
                        value={filteredShifts.length} 
                        help={`${shifts?.length || 0} lifetime entries`}
                        icon={FiFileText}
                    />
                    <StatItem 
                        label="Filtered Personnel" 
                        value={new Set(filteredShifts.map(s => s.userId)).size} 
                        help="Active in current view"
                        icon={FiUser}
                    />
                    <StatItem 
                        label="Morning Coverage" 
                        value={`${((chartData.find(d => d.name === 'Morning')?.count || 0) / (filteredShifts.length || 1) * 100).toFixed(0)}%`} 
                        help="Share of current filter"
                        icon={FiCalendar}
                    />
                </VStack>
            </SimpleGrid>

            {/* Detailed Table */}
            <PremiumCard p={0} overflow="hidden">
                <Box p={6} borderBottomWidth="1px" bg={useColorModeValue('gray.50', 'whiteAlpha.50')}>
                    <Heading size="sm">Detailed Logs</Heading>
                </Box>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Date</Th>
                            <Th>Personnel</Th>
                            <Th>Shift Profile</Th>
                            <Th>Timing</Th>
                            <Th>Location</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredShifts.map((shift) => (
                            <Tr key={shift.id} _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}>
                                <Td fontWeight="bold" fontSize="sm">{new Date(shift.date).toLocaleDateString()}</Td>
                                <Td fontSize="sm">{shift.user?.name || 'Unassigned'}</Td>
                                <Td>
                                    <Badge 
                                        colorScheme={shift.shiftType === 'Morning' ? 'yellow' : shift.shiftType === 'Afternoon' ? 'orange' : 'blue'} 
                                        variant="subtle" borderRadius="full" px={2}
                                    >
                                        {shift.shiftType}
                                    </Badge>
                                </Td>
                                <Td fontSize="xs" color="gray.500" fontWeight="medium">{shift.startTime} - {shift.endTime}</Td>
                                <Td fontSize="xs" fontWeight="bold">{shift.location}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                {filteredShifts.length === 0 && (
                    <Center py={20} flexDirection="column">
                        <Icon as={FiSearch} boxSize={10} color="gray.300" mb={4} />
                        <Text color="gray.500">No shifts match your current filters.</Text>
                    </Center>
                )}
            </PremiumCard>
        </Box>
    );
}

/**
 * Modern Stat Component
 */
const StatItem = ({ label, value, help, icon }: any) => {
    const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
    return (
        <PremiumCard>
            <Stat>
                <Flex justify="space-between" align="start">
                    <Box>
                        <StatLabel color={secondaryTextColor} fontWeight="bold" fontSize="xs" textTransform="uppercase">{label}</StatLabel>
                        <StatNumber fontSize="3xl" fontWeight="black" my={1}>{value}</StatNumber>
                    </Box>
                    <Icon as={icon} boxSize={5} color="brand.500" opacity={0.4} />
                </Flex>
                <StatHelpText fontSize="xs" m={0} color={secondaryTextColor}>{help}</StatHelpText>
            </Stat>
        </PremiumCard>
    );
};

const Center = ({ children, ...props }: any) => (
    <Flex justify="center" align="center" {...props}>{children}</Flex>
);