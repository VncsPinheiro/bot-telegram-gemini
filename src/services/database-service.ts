import { PrismaPg } from '@prisma/adapter-pg'
import { boolean } from 'zod'
import { type Either, left, right } from '../core/Result'
import { env } from '../env'
import { PrismaClient } from '../generated/prisma/client'
import type { History } from '../types/History'

const adapter = new PrismaPg({ connectionString: `${env.DATABASE_URL}` })

let instance: Database | null = null

export class Database {
	private prisma: PrismaClient
	private constructor() {
		this.prisma = new PrismaClient({ adapter })
	}

	static getInstance() {
		if (!instance) {
			instance = new Database()
		}
		return instance
	}

	async createUser(
		id: string,
		name: string,
		text: string,
		role: 'MODEL' | 'USER',
	): Promise<Either<Error, true>> {
		try {
			const user = await this.prisma.user.upsert({
				where: {
					id,
				},
				update: {
					messages: {
						create: {
							text,
							role,
						},
					},
				},
				create: {
					id,
					name,
					messages: {
						create: {
							text,
							role,
						},
					},
				},
			})
			if (!user) return left(new Error('Error creating user'))
			return right(true)
		
		} catch (err: any) {
			return left(new Error(`Erro: ${err}`))
		}
	}

	async getUserMessages(id: string): Promise<Either<Error, History[]>> {
		try {
			const queryResponse = (await this.prisma.user.findFirst({
				where: {
					id,
				},
				include: { messages: true },
			})) as PrismaResponse

			if (!queryResponse) {
				return right([])
			}

			const result = queryResponse.messages.map((message) => ({
				role: message.role.toLowerCase() as 'user' | 'model',
				parts: [{ text: message.text }],
			}))

			console.log(`UserHistory: ${JSON.stringify(result, null, 2)}`)

			return right(result as History[])
		} catch (err: any) {
			return left(new Error(`Prisma query failed. Error: ${err}`))
		}
	}
}

interface PrismaResponse {
	id: string
	name: string
	messages: {
		id: string
		text: string
		role: 'USER' | 'MODEL'
		date: Date
		userId: string
	}[]
}
