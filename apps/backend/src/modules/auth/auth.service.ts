import { User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { SignInDto, SignUpDto } from './auth.dtos';
import { sign } from 'jsonwebtoken';
import { authConfig } from '../../configs/auth.config';
import { hash, compare } from 'bcryptjs';
import { Context } from '../../server/context';

type UserResponse = Omit<User, 'password'>;
type SignInResult = UserResponse & { accessToken: string };

export const signUp = async (
  input: SignUpDto,
  ctx: Context
): Promise<UserResponse> => {
  const existingUser = await ctx.prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { employeeId: input.employeeId }],
    },
  });

  if (existingUser) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'User already exists',
    });
  }

  const bcryptHash = await hash(input.password, 10);

  const user = await ctx.prisma.user.create({
    data: {
      name: input.name,
      employeeId: input.employeeId,
      email: input.email,
      password: bcryptHash,
      role: 0, // Default to Staff
      department: 'General', // Default department
      currentShift: 'None', // Default shift
      status: 'ACTIVE',
    },
  });

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const signIn = async (
  input: SignInDto,
  ctx: Context
): Promise<SignInResult> => {
  const user = await ctx.prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  const error = new TRPCError({
    message: 'Incorrect email or password',
    code: 'UNAUTHORIZED',
  });

  if (!user) {
    throw error;
  }

  const result = await compare(input.password, user.password);

  if (!result) {
    throw error;
  }

  const token = sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    authConfig.secretKey,
    { expiresIn: authConfig.jwtExpiresIn }
  );

  const { password, ...userWithoutPassword } = user;

  return {
    ...userWithoutPassword,
    accessToken: token,
  };
};
