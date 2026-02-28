import { noAuthProcedure, router } from '../../server/trpc';
import { signInSchema, signUpSchema } from './auth.dtos';
import { signIn, signUp } from './auth.service';

export const authRouter = router({
  signUp: noAuthProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => signUp(input, ctx)),

  signIn: noAuthProcedure
    .input(signInSchema)
    .mutation(async ({ input, ctx }) => signIn(input, ctx)),
});
