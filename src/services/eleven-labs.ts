import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { type Either, left, right } from '../core/Result'
import { env } from '../env'

let instance: ElevenLabs | null = null
export class ElevenLabs {
	private elabs: ElevenLabsClient
	private constructor() {
		this.elabs = new ElevenLabsClient({
			apiKey: env.ELEVENLABS_API_KEY,
		})
	}

	static getInstance() {
		if (!instance) instance = new ElevenLabs()
		return instance
	}

	async createSpeech(text: string) {
		try {
			const audio = await this.elabs.textToSpeech.convert(
				'7i7dgyCkKt4c16dLtwT3',
				{
					text,
					modelId: 'eleven_multilingual_v2',
					outputFormat: 'mp3_44100_128',
				},
			)
			const chunks = []
			for await (const chunk of audio) {
				chunks.push(chunk)
			}

			return right(await saveAudioService('audio.mp3', Buffer.concat(chunks)))
			// biome-ignore lint/suspicious/noExplicitAny: <it's necessary>
		} catch (err: any) {
			console.error(`Eleven labs server returned an error. Message: ${err}`)
			return left(new Error('Eleven Labs server error'))
		}
	}
}

const saveAudioService = async (
	filename: string,
	buffer: Buffer,
): Promise<Either<Error, string>> => {
	const targetFolder = path.resolve(process.cwd(), 'src', 'audios')
	const filePath = path.join(targetFolder, filename)

	try {
		await mkdir(targetFolder, { recursive: true })
		await writeFile(filePath, buffer)
		return right(filePath)
	} catch (err: any) {
		console.error('Erro ao salvar áudio:', err)
		return left(new Error())
	}
}
