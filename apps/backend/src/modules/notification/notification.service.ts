import { Context } from '../../server/context';
import { markAsReadSchema } from './notification.dtos';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const listMyNotifications = async (userId: string, ctx: Context) => {
    return ctx.prisma.notification.findMany({
        where: {
            userId,
            isRead: false,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const markAsRead = async (
    userId: string,
    input: z.infer<typeof markAsReadSchema>,
    ctx: Context
) => {
    const notification = await ctx.prisma.notification.findUnique({
        where: { id: input.id },
    });

    if (!notification) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification not found',
        });
    }

    if (notification.userId !== userId) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only mark your own notifications as read',
        });
    }

    return ctx.prisma.notification.update({
        where: { id: input.id },
        data: { isRead: true },
    });
};

export const markAllAsRead = async (userId: string, ctx: Context) => {
    return ctx.prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: { isRead: true },
    });
};


export const createNotification = async (
    userId: string,
    type: string,
    message: string,
    ctx: Context,
    shiftId?: string
) => {
    return ctx.prisma.notification.create({
        data: {
            userId,
            type,
            message,
            shiftId,
        },
    });
};

