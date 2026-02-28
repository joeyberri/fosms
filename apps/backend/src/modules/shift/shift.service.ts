import { Context } from '../../server/context';
import { createShiftAssignmentSchema, requestSwapSchema, processSwapSchema } from './shift.dtos';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const assignShift = async (
    input: z.infer<typeof createShiftAssignmentSchema>,
    ctx: Context
) => {
    const date = new Date(input.date);

    const existing = await ctx.prisma.shiftAssignment.findFirst({
        where: {
            userId: input.userId,
            date: date,
        },
    });

    if (existing) {
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'User already has a shift assigned on this date',
        });
    }

    return ctx.prisma.shiftAssignment.create({
        data: {
            ...input,
            date: date,
        },
    });
};

export const getMySchedule = async (userId: string, ctx: Context) => {
    return ctx.prisma.shiftAssignment.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            date: 'asc',
        },
        include: {
            user: {
                select: {
                    name: true,
                    employeeId: true
                }
            }
        }
    });
};

export const getAllShifts = async (ctx: Context) => {
    return ctx.prisma.shiftAssignment.findMany({
        orderBy: {
            date: 'desc',
        },
        include: {
            user: {
                select: {
                    name: true,
                    department: true,
                },
            },
        },
    });
};

export const requestSwap = async (
    userId: string,
    input: z.infer<typeof requestSwapSchema>,
    ctx: Context
) => {
    return ctx.prisma.shiftSwap.create({
        data: {
            userId,
            colleagueId: input.colleagueId,
            requestedDate: new Date(input.requestedDate),
            currentShift: input.currentShift,
            requestedShift: input.requestedShift,
            reason: input.reason,
            status: 'PENDING',
        },
    });
};

export const listSwapRequests = async (ctx: Context) => {
    return ctx.prisma.shiftSwap.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            user: {
                select: { name: true, employeeId: true },
            },
            colleague: {
                select: { name: true, employeeId: true },
            },
        },
    });
};

export const getMySwapRequests = async (userId: string, ctx: Context) => {
    return ctx.prisma.shiftSwap.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            user: {
                select: { name: true, employeeId: true },
            },
            colleague: {
                select: { name: true, employeeId: true },
            },
        },
    });
};

export const processSwap = async (
    input: z.infer<typeof processSwapSchema>,
    ctx: Context
) => {
    const { swapId, action, adminNotes } = input;

    const swap = await ctx.prisma.shiftSwap.findUnique({
        where: { id: swapId },
    });

    if (!swap) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Swap request not found',
        });
    }

    return ctx.prisma.shiftSwap.update({
        where: { id: swapId },
        data: {
            status: action,
            adminNotes,
            resolvedAt: new Date(),
        },
    });

    // Note: Actual logic to swap assignments would go here if APPROVED,
    // potentially involving transactions to update ShiftAssignments.
    // For now, we update the status.
};
