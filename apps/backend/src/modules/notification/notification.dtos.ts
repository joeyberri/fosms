import { z } from 'zod';

export const markAsReadSchema = z.object({
    id: z.string(),
});
