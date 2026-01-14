import { type Context, InputFile } from 'grammy'
import { Gemini } from '../services/gemini'
import { ElevenLabs } from '../services/eleven-labs'

export class TextMessageClass {
	constructor(
		private geminiService: Gemini,
		private elabsService: ElevenLabs,
	) {}

	handle = async (ctx: Context) => {
		console.log(ctx.chat)
		if (!ctx.message?.text) {
			return ctx.reply('Nenhuma mensagem pra responder')
		}

		await ctx.replyWithChatAction('typing')

		const modelResponse = await this.geminiService.chat(ctx.message?.text)
		if (modelResponse.isLeft()) {
			return ctx.reply('Erro ao responder sua pergunta')
		}

		// await this.elabsService.createSpeech(modelResponse)

		// const audioPath = path.resolve(process.cwd(), "src", "audios", "audio.mp3")
		// ctx.replyWithVoice(new InputFile(audioPath))
		return ctx.reply(modelResponse.value)
	}
}

export const TextMessageController = new TextMessageClass(
	Gemini.getInstance(),
	ElevenLabs.getInstance(),
)
