import type { Request, Response } from 'express'
import { type Either, left, right } from '../core/Result'
import { env } from '../env'

interface Result {
	url: string
	has_custom_certificate: boolean
	pending_update_count: number
	max_connections: number
	ip_address: string
}

interface TelegramApiResponse {
	ok: boolean
	result: Result
}

interface TelegramSetWebHookResponsePositive {
	ok: true
	result: true
	description: string
}

interface TelegramSetWebHookResponseNegative {
	ok: false
	error_code: 400 | 401
	description:
		| 'Bad Request: unsupported port'
		| 'Unauthorized'
		| 'Bad Request: unsupported port'
}

type TelegramSetWebHookResponse =
	| TelegramSetWebHookResponsePositive
	| TelegramSetWebHookResponseNegative

export class DomainControllerClass {
	private url: string
	private readonly botToken: string

	constructor() {
		this.url = env.DOMAIN
		this.botToken = env.BOT_TOKEN
	}

	handle = async (req: Request, res: Response) => {
		// if (this.checkWebhookUrl(req.query.url as string))
		// 	this.url = req.query.url as string

		const webHookInfo = await this.getWebHookInfo()
		if (webHookInfo.isLeft())
			return res.status(502).send(webHookInfo.value.message)

		if (webHookInfo.value.result.url === this.url)
			return res.status(200).send('Url was already in date')

		const setWebHookResponse = await this.setWebHookUrl()
		if (setWebHookResponse.isLeft())
			return res.status(502).send(setWebHookResponse.value.message)

		return res.status(201).send('Url up to date')
	}

	private async getWebHookInfo(): Promise<Either<Error, TelegramApiResponse>> {
		try {
			const response = await fetch(
				`https://api.telegram.org/bot${this.botToken}/getWebhookInfo`,
			).then((res) => res.json() as Promise<TelegramApiResponse>)

			return right(response)
		} catch (err: any) {
			console.error(`Error getting webhook data. Message: ${err}`)
			return left(new Error('Error getting webhook data'))
		}
	}

	private async setWebHookUrl(): Promise<
		Either<Error, TelegramSetWebHookResponse>
	> {
		try {
			const response = await fetch(
				`https://api.telegram.org/bot${this.botToken}/setWebhook?url=https://${this.url}/${this.botToken}&drop_pending_updates=true`,
			).then((res) => res.json() as Promise<TelegramSetWebHookResponse>)

			if (!response.ok || !response.result)
				return left(
					new Error(
						`Error setting new domain to webhook. Description: ${response.description}`,
					),
				)

			return right(response)
		} catch (err: any) {
			console.error('Error setting webhook domain')
			return left(new Error(`Error setting webhokk domain. Message: ${err}`))
		}
	}

	private checkWebhookUrl(url: string): boolean {
		try {
			// 1. Tenta transformar em um objeto URL (valida se é um link real)
			const parsedUrl = new URL(url)

			// 2. Verifica se é HTTPS (Obrigatório pelo Telegram)
			if (parsedUrl.protocol !== 'https:') return false

			// 3. Verifica se o TOKEN está exatamente no final do caminho
			// Isso evita que 'meusite.com/token-falso' passe na validação
			if (!parsedUrl.pathname.endsWith(this.botToken)) return false

			return true
		} catch {
			return false // URL malformada
		}
	}
}

export const DomainController = new DomainControllerClass()
