import { z } from 'zod';

export const createShiftAssignmentSchema = z.object({
    userId: z.string(),
    shiftType: z.string(),
    date: z.string(), // ISO date string
    startTime: z.string(),
    endTime: z.string(),
    location: z.string(),
    notes: z.string().optional(),
});

export const requestSwapSchema = z.object({
    requestedDate: z.string(), // ISO date string
    currentShift: z.string(),
    requestedShift: z.string(),
    reason: z.string().optional(),
    colleagueId: z.string().optional(),
});

export const processSwapSchema = z.object({
    swapId: z.string(),
    action: z.enum(['APPROVED', 'REJECTED']),
    adminNotes: z.string().optional(),
});
