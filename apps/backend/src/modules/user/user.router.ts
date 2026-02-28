import { router, procedure, adminProcedure } from '../../server/trpc';
import { createUserSchema, updateUserSchema } from './user.dtos';
import { createUser, getUser, listUsers, updateUser } from './user.service';
import { z } from 'zod';

export const userRouter = router({
    create: adminProcedure
        .input(createUserSchema)
        .mutation(async ({ input, ctx }) => {
            return createUser(input, ctx);
        }),

    get: procedure
        .input(z.string())
        .query(async ({ input, ctx }) => {
            return getUser(input, ctx);
        }),

    list: adminProcedure
        .query(async ({ ctx }) => {
            return listUsers(ctx);
        }),

    listColleagues: procedure
        .query(async ({ ctx }) => {
            return listUsers(ctx);
        }),

    update: adminProcedure
        .input(updateUserSchema)
        .mutation(async ({ input, ctx }) => {
            return updateUser(input, ctx);
        }),
});
