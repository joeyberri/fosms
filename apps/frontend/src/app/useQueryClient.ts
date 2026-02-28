import SuperJSON from 'superjson';
import { useMemo } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';
import { trpc } from '../utils/trpc';
import { useGlobalStateStore } from './GlobalState';

export const useQueryTrpcClient = () => {
  const APP_URL = import.meta.env.VITE_APP_URL || '/trpc';

  const user = useGlobalStateStore((state) => state.user);
  const accessToken = user?.accessToken;

  const queryClient = useMemo(() => new QueryClient(), []);
  const trpcClient = useMemo(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: APP_URL,
          headers() {
            if (accessToken) {
              return {
                authorization: `Bearer ${accessToken}`,
              };
            }
            return {};
          },
        }),
      ],
      transformer: SuperJSON,
    }),
    [APP_URL, accessToken]
  );

  return { queryClient, trpcClient };
};
