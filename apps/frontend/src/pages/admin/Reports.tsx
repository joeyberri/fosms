import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, Text,
    Flex, Button, Icon, SimpleGrid, useColorModeValue, Stack, Heading
} from '@chakra-ui/react';
import { trpc } from '../../utils/trpc';
import { FiDownload, FiBarChart2, FiFileText, FiPrinter } from 'react-icons/fi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useMemo, useRef } from 'react';
import { PageHeader } from '../../components/UI/PageHeader';
import { PremiumCard } from '../../components/UI/PremiumCard';

export default function Reports() {
    const { data: shifts, isLoading } = trpc.shift.list.useQuery();
    const printRef = useRef<HTMLDivElement>(null);

    const chartData = useMemo(() => {
        if (!shifts) return [];
        const distribution = shifts.reduce((acc: any, shift) => {
            acc[shift.shiftType] = (acc[shift.shiftType] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(distribution).map(type => ({
            name: type,
            count: distribution[type]
        }));
    }, [shifts]);

    const downloadCSV = () => {
        if (!shifts) return;
        const headers = ['Date', 'Staff', 'Type', 'Start', 'End', 'Location'];
        const rows = shifts.map(s => [
            new Date(s.date).toLocaleDateString(),
            s.user?.name || s.userId,
            s.shiftType,
            s.startTime,
            s.endTime,
            s.location
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FOSMS_Shift_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const downloadPDF = () => {
        if (!printRef.current) return;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const headers = ['Date', 'Staff', 'Type', 'Start', 'End', 'Location'];
        const rows = shifts ? shifts.map(s => [
            new Date(s.date).toLocaleDateString(),
            s.user?.name || s.userId,
            s.shiftType,
            s.startTime,
            s.endTime,
            s.location
        ]) : [];
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>FOSMS Shift Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; }
                    p { color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #4299E1; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>FOSMS Operational Report</h1>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Total Shifts:</strong> ${shifts?.length || 0}</p>
                
                <h2>Shift Distribution</h2>
                <p>Morning: ${chartData.find(d => d.name === 'Morning')?.count || 0}, Afternoon: ${chartData.find(d => d.name === 'Afternoon')?.count || 0}, Night: ${chartData.find(d => d.name === 'Night')?.count || 0}</p>
                
                <h2>Detailed Shift Logs</h2>
                <table>
                    <thead>
                        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Delay to ensure content loads
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    if (isLoading) return <Box py={20} textAlign="center"><Spinner size="xl" color="brand.500" thickness="4px" /></Box>;

    const COLORS = ['#ECC94B', '#ED8936', '#4299E1'];

    return (
        <Box p={6}>
            <PageHeader
                title="Operational Reports"
                subtitle="Analyze shift distribution and export data."
                icon={FiBarChart2}
                rightElement={
                    <Flex gap={3}>
                        <Button leftIcon={<FiDownload />} colorScheme="brand" onClick={downloadCSV} shadow="lg">
                            Export to CSV
                        </Button>
                        <Button leftIcon={<FiPrinter />} colorScheme="brand" variant="outline" onClick={downloadPDF} shadow="lg">
                            Export to PDF
                        </Button>
                    </Flex>
                }
            />

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} mb={10}>
                <PremiumCard gridColumn={{ lg: 'span 2' }}>
                    <Flex align="center" mb={6}>
                        <Icon as={FiBarChart2} w={5} h={5} color="brand.500" mr={2} />
                        <Heading size="md">Shift Distribution</Heading>
                    </Flex>
                    <Box h="300px" w="full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </PremiumCard>

                <PremiumCard>
                    <Flex align="center" mb={6}>
                        <Icon as={FiFileText} w={5} h={5} color="brand.500" mr={2} />
                        <Heading size="md">Quick Stats</Heading>
                    </Flex>
                    <Stack spacing={4}>
                        <StatItem label="Total Shifts Logged" value={shifts?.length || 0} />
                        <StatItem label="Active Departments" value="4" />
                        <StatItem label="Next Download" value="Weekly Scheduled" />
                    </Stack>
                </PremiumCard>
            </SimpleGrid>

            <PremiumCard p={0}>
                <Box p={6} borderBottomWidth="1px">
                    <Heading size="sm">Detailed Shift Logs</Heading>
                </Box>
                <Table variant="simple">
                    <Thead bg={useColorModeValue('gray.50', 'whiteAlpha.50')}>
                        <Tr>
                            <Th>Date</Th>
                            <Th>Personnel</Th>
                            <Th>Shift</Th>
                            <Th>Timing</Th>
                            <Th>Location</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {shifts?.map((shift) => (
                            <Tr key={shift.id} _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}>
                                <Td fontWeight="medium">{new Date(shift.date).toLocaleDateString()}</Td>
                                <Td>{shift.user?.name || 'Unassigned'}</Td>
                                <Td>
                                    <Badge colorScheme={
                                        shift.shiftType === 'Morning' ? 'yellow' :
                                            shift.shiftType === 'Afternoon' ? 'orange' : 'blue'
                                    } borderRadius="full" px={2}>
                                        {shift.shiftType}
                                    </Badge>
                                </Td>
                                <Td fontSize="sm" color="gray.500">{shift.startTime} - {shift.endTime}</Td>
                                <Td fontSize="sm">{shift.location}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </PremiumCard>
        </Box>
    );
}

const StatItem = ({ label, value }: { label: string, value: string | number }) => (
    <Box p={4} bg={useColorModeValue('gray.50', 'whiteAlpha.50')} borderRadius="xl">
        <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
        <Text fontSize="xl" fontWeight="bold">{value}</Text>
    </Box>
);
