const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@fosms.com' }
    });
    console.log('Admin user:', user);
}

check().catch(console.error).finally(() => prisma.$disconnect());
