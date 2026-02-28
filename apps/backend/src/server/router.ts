import { authRouter } from '../modules/auth/auth.router';
import { userRouter } from '../modules/user/user.router';
import { shiftRouter } from '../modules/shift/shift.router';
import { router } from './trpc';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  shift: shiftRouter,
});

export type AppRouter = typeof appRouter;
