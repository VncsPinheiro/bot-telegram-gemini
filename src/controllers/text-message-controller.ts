import { type Context, InputFile } from 'grammy'
import { Database } from '../services/database-service'
import { ElevenLabs } from '../services/eleven-labs'
import { Gemini } from '../services/gemini'

export class TextMessageClass {
	constructor(
		private geminiService: Gemini,
		private elabsService: ElevenLabs,
		private prisma: Database,
	) {}

	handle = async (ctx: Context) => {
		console.log(ctx.chat)
		if (ctx.message?.text) {
			await ctx.replyWithChatAction('typing')
			const userHistory = await this.prisma.getUserMessages(String(ctx.chat?.id))

			if (userHistory.isLeft()) {
				console.log(userHistory.value)
				return ctx.reply('Erro ao responder sua pergunta')
			}

			userHistory.value.push({
				role: 'user',
				parts: [{ text: ctx.message.text}]
			})

			const modelResponse = await this.geminiService.chat(userHistory.value)

			if (modelResponse.isLeft()) return ctx.reply("Could'nt generate an answer")

			const saveUserMessage = await this.prisma.createUser(String(ctx.chat?.id), String(ctx.chat?.first_name), ctx.message.text, 'USER')

			const saveModelMessage = await this.prisma.createUser(String(ctx.chat?.id), String(ctx.chat?.first_name), modelResponse.value, 'MODEL')

			if (saveModelMessage.isLeft() || saveUserMessage.isLeft()) return ctx.reply("Could'nt create user!")

			// await this.elabsService.createSpeech(modelResponse)

			// const audioPath = path.resolve(process.cwd(), "src", "audios", "audio.mp3")
			// ctx.replyWithVoice(new InputFile(audioPath))
			return ctx.reply(modelResponse.value)
		}

		return ctx.reply('Nenhuma mensagem pra responder')
	}
}

export const TextMessageController = new TextMessageClass(
	Gemini.getInstance(),
	ElevenLabs.getInstance(),
	Database.getInstance(),
)
