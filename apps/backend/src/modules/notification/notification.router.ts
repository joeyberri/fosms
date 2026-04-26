import { router, procedure } from '../../server/trpc';
import { listMyNotifications, markAsRead, markAllAsRead } from './notification.service';
import { markAsReadSchema } from './notification.dtos';

export const notificationRouter = router({
    getUnread: procedure.query(async ({ ctx }) => {
        return listMyNotifications(ctx.user.id, ctx);
    }),
    markAsRead: procedure
        .input(markAsReadSchema)
        .mutation(async ({ input, ctx }) => {
            return markAsRead(ctx.user.id, input, ctx);
        }),
    markAllAsRead: procedure.mutation(async ({ ctx }) => {
        return markAllAsRead(ctx.user.id, ctx);
    }),
});


