const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@fosms.com' },
        update: {
            role: 1
        },
        create: {
            employeeId: 'ADMIN001',
            name: 'Super Admin',
            email: 'admin@fosms.com',
            password: adminPassword,
            role: 1, // Admin
            department: 'Management',
            currentShift: 'Day',
        },
    });
    console.log('Admin user ready:', admin.email);

    // 2. Create Staff User
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = await prisma.user.upsert({
        where: { email: 'staff@fosms.com' },
        update: {},
        create: {
            employeeId: 'STAFF001',
            name: 'John Doe',
            email: 'staff@fosms.com',
            password: staffPassword,
            role: 0, // Staff
            department: 'Production',
            currentShift: 'Morning',
        },
    });
    console.log('Staff user ready:', staff.email);

    // 3. Create Another Staff User (for swapping)
    const staff2 = await prisma.user.upsert({
        where: { email: 'jane@fosms.com' },
        update: {},
        create: {
            employeeId: 'STAFF002',
            name: 'Jane Smith',
            email: 'jane@fosms.com',
            password: staffPassword,
            role: 0, // Staff
            department: 'Production',
            currentShift: 'Afternoon',
        },
    });
    console.log('Staff user 2 ready:', staff2.email);

    // 4. Assign Shifts to Staff
    // Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Helper to create assignment if not exists
    const upsertAssignment = async (data) => {
        const existing = await prisma.shiftAssignment.findFirst({
            where: { userId: data.userId, date: data.date }
        });
        if (!existing) {
            await prisma.shiftAssignment.create({ data });
            console.log(`Created shift for ${data.userId} on ${data.date}`);
        }
    };

    await upsertAssignment({
        userId: staff.id,
        date: today,
        shiftType: 'Morning',
        startTime: '08:00',
        endTime: '16:00',
        location: 'Factory Floor A',
    });

    await upsertAssignment({
        userId: staff.id,
        date: tomorrow,
        shiftType: 'Morning',
        startTime: '08:00',
        endTime: '16:00',
        location: 'Factory Floor A',
    });

    await upsertAssignment({
        userId: staff2.id,
        date: today,
        shiftType: 'Afternoon',
        startTime: '16:00',
        endTime: '00:00',
        location: 'Factory Floor B',
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
