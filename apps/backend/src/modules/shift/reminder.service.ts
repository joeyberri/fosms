import { prisma } from '../../server/context';
import { createNotification } from '../notification/notification.service';
import { Context } from '../../server/context';


export const checkAndTriggerReminders = async () => {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    console.log(`[ReminderJob] Checking for shifts between ${twentyFourHoursFromNow.toISOString()} and ${twentyFiveHoursFromNow.toISOString()}`);

    // We look for shifts that fall within the window of exactly 24 to 25 hours from now
    // This ensures that as the job runs hourly, it catches every shift exactly once.
    const shifts = await prisma.shiftAssignment.findMany({
        where: {
            date: {
                gte: twentyFourHoursFromNow,
                lt: twentyFiveHoursFromNow,
            },
        },
        include: {
            user: true,
        },
    });

    for (const shift of shifts) {
        // Check if notification already exists
        const existing = await prisma.notification.findFirst({
            where: {
                userId: shift.userId,
                shiftId: shift.id,
                type: 'SHIFT_REMINDER',
            },
        });

        if (!existing) {
            const message = `Reminder: You have a ${shift.shiftType} shift tomorrow at ${shift.startTime} in ${shift.location}.`;
            await createNotification(
                shift.userId,
                'SHIFT_REMINDER',
                message,
                { prisma } as Context,
                shift.id
            );
            console.log(`[ReminderJob] Created reminder for ${shift.user.name} (Shift: ${shift.id})`);
        }
    }
};

export const startReminderJob = () => {
    // Run every hour
    setInterval(async () => {
        try {
            await checkAndTriggerReminders();
        } catch (error) {
            console.error('[ReminderJob] Error:', error);
        }
    }, 60 * 60 * 1000);

    // Run once immediately on start
    checkAndTriggerReminders().catch(console.error);
};
