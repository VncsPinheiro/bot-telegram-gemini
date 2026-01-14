import { z } from 'zod'
import { config } from 'dotenv'
config()

const envSchema = z.object({
	PORT: z.coerce.number().default(3000),
	SECRET: z.string(),
	BOT_TOKEN: z.string(),
	DOMAIN: z.string(),
	GEMINI_API_KEY: z.string(),
	GEMINI_MODEL: z
		.enum(['gemini-2.5-flash', 'gemini-2.5-flash-lite'])
		.default('gemini-2.5-flash-lite'),
	ELEVENLABS_API_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
