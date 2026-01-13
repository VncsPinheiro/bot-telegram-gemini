import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  BOT_TOKEN: z.string(),
  GEMINI_API_KEY: z.string()
})

export const env = envSchema.parse(process.env)