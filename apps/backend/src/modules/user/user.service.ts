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
