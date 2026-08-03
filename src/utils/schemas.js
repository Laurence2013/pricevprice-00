import { z } from 'zod';

export const skuSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(1, 'Title cannot be empty'),
  price: z.number({ required_error: 'Price is required' }).positive('Price must be positive'),
  category: z.string().optional(),
  description: z.string().optional(),
  platform: z.string().optional()
});

export const skuUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  platform: z.string().optional()
}).passthrough();

export const scrapeRequestSchema = z.object({
  platform: z.string().optional().default('ebay'),
  url: z.string().url('Invalid URL provided').optional(),
  actorId: z.string().optional(),
  runInput: z.record(z.any()).optional()
});

export const geminiExtractionSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  textContent: z.string().optional(),
  systemInstruction: z.string().optional()
});

export const ebaySearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().int().min(1).max(200).optional().default(10)
});

export const pipelineRequestSchema = z.object({
  url: z.string().url().optional(),
  query: z.string().optional(),
  saveToDb: z.boolean().optional().default(false)
});
