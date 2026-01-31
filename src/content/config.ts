import { defineCollection, z } from 'astro:content';

const courseCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedTime: z.number(), // in minutes
    topics: z.array(z.string()),
    prerequisites: z.array(z.string()).optional(),
  }),
});

export const collections = {
  course: courseCollection,
};
