import { router, procedure, adminProcedure } from '../../server/trpc';
import { createShiftAssignmentSchema, requestSwapSchema, processSwapSchema } from './shift.dtos';
import { assignShift, getMySchedule, getAllShifts, requestSwap, listSwapRequests, getMySwapRequests, processSwap } from './shift.service';
import { z } from 'zod';

export const shiftRouter = router({
    assign: adminProcedure
        .input(createShiftAssignmentSchema)
        .mutation(async ({ input, ctx }) => {
            return assignShift(input, ctx);
        }),

    mySchedule: procedure
        .query(async ({ ctx }) => {
            return getMySchedule(ctx.user.id, ctx);
        }),

    list: procedure
        .query(async ({ ctx }) => {
            // Ideally filtered by date range, department etc.
            return getAllShifts(ctx);
        }),

    requestSwap: procedure
        .input(requestSwapSchema)
        .mutation(async ({ input, ctx }) => {
            return requestSwap(ctx.user.id, input, ctx);
        }),

    mySwapRequests: procedure
        .query(async ({ ctx }) => {
            return getMySwapRequests(ctx.user.id, ctx);
        }),

    listSwapRequests: adminProcedure
        .query(async ({ ctx }) => {
            return listSwapRequests(ctx);
        }),

    processSwap: adminProcedure
        .input(processSwapSchema)
        .mutation(async ({ input, ctx }) => {
            return processSwap(input, ctx);
        }),
});
