import { Context } from '../../server/context';
import { createUserSchema, updateUserSchema } from './user.dtos';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { hash } from 'bcryptjs';

export const createUser = async (
    input: z.infer<typeof createUserSchema>,
    ctx: Context
) => {
    const existingUser = await ctx.prisma.user.findFirst({
        where: {
            OR: [{ email: input.email }, { employeeId: input.employeeId }],
        },
    });

    if (existingUser) {
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email or employee ID already exists',
        });
    }

    const hashedPassword = await hash(input.password, 10);

    return ctx.prisma.user.create({
        data: {
            ...input,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            employeeId: true,
            department: true,
            currentShift: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

export const getUser = async (id: string, ctx: Context) => {
    const user = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            employeeId: true,
            department: true,
            currentShift: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
        });
    }

    return user;
};

export const listUsers = async (ctx: Context) => {
    return ctx.prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            employeeId: true,
            department: true,
            currentShift: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const updateUser = async (
    input: z.infer<typeof updateUserSchema>,
    ctx: Context
) => {
    const { id, ...data } = input;

    const user = await ctx.prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
        });
    }

    return ctx.prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            employeeId: true,
            department: true,
            currentShift: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

export const deleteUser = async (id: string, ctx: Context) => {
    const user = await ctx.prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
        });
    }

    return ctx.prisma.user.delete({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
        },
    });
};

export const updateOwnProfile = async (
    input: z.infer<typeof updateUserSchema>,
    ctx: Context
) => {
    // Ensure user can only update their own profile
    if (input.id !== ctx.user.id) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only update your own profile',
        });
    }

    const { id, ...data } = input;

    // Remove role and status fields for security - users shouldn't be able to change these
    const { role, status, employeeId, ...safeData } = data;

    return ctx.prisma.user.update({
        where: { id },
        data: safeData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            employeeId: true,
            department: true,
            currentShift: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
