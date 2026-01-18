import { GoogleGenAI } from '@google/genai'
import { type Either, left, right } from '../core/Result'
import { env } from '../env'
import type { History } from '../types/History'

let instance: Gemini | null = null

export class Gemini {
	private gemini: GoogleGenAI
	private constructor() {
		this.gemini = new GoogleGenAI({
			apiKey: env.GEMINI_API_KEY,
		})
	}

	static getInstance() {
		if (!instance) instance = new Gemini()
		return instance
	}

	async chat(
		contents: History[],
	): Promise<Either<Error, string>> {
		try {
			const result = await this.gemini.models.generateContent({
				model: env.GEMINI_MODEL,
				contents,
			})

			const candidate = result.candidates?.[0]

			if (!candidate || !candidate.content) {
				return left(
					new Error(
						'A IA não conseguiu gerar uma resposta (possivelmente bloqueada)',
					),
				)
			}

			const textResponse = candidate.content.parts?.[0]?.text

			if (!textResponse) {
				return left(new Error('Resposta vazia do modelo'))
			}

			return right(textResponse)

			// biome-ignore lint/suspicious/noExplicitAny: <it is necessary>
		} catch (err: any) {
			// Tratamento de Erros de Rede ou API
			console.error('Erro na API Gemini:', err)

			if (err.message?.includes('429')) {
				return left(
					new Error('Limite de mensagens atingido. Tente em 1 minuto.'),
				)
			}

			return left(new Error('Falha crítica no serviço de chat'))
		}
	}
}
