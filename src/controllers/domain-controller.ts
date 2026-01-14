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
	private readonly secret: string

	constructor() {
		this.url = env.DOMAIN
		this.botToken = env.BOT_TOKEN
		this.secret = env.SECRET
	}

	handelSetWebhook = async (req: Request, res: Response) => {
		if (this.checkWebhookUrl(req.query.url as string))
			this.url = req.query.url as string
		// console.log(this.url)

		const webHookInfo = await this.getWebHookInfo()
		if (webHookInfo.isLeft())
			return res.status(502).send(webHookInfo.value.message)
		console.log(webHookInfo)
		if (webHookInfo.value.result?.url === `${this.url}/${this.secret}`)
			return res.status(200).send({
				message: 'Nothing changed. Domain already was up to date',
				url: this.url,
			})

		const setWebHookResponse = await this.setWebHookUrl()
		if (setWebHookResponse.isLeft())
			return res.status(502).send(setWebHookResponse.value.message)

		return res.status(201).send({
			message: 'Domain updated',
			url: this.url,
		})
	}
	handleGetWebhookData = async (__req: Request, res: Response) => {
		const webhookData = await this.getWebHookInfo()
		if (webhookData.isLeft())
			return res.status(502).send(webhookData.value.message)

		return res.status(200).send({
			url: webhookData.value.result.url,
		})
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
				`https://api.telegram.org/bot${this.botToken}/setWebhook?url=${this.url}/${this.secret}&drop_pending_updates=true`,
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

			return true
		} catch {
			return false // URL malformada
		}
	}
}

export const DomainController = new DomainControllerClass()
