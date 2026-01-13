import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { env } from "../env"

let instance: ElevenLabs | null = null
export class ElevenLabs {
  private elabs: ElevenLabsClient
  private constructor() {
    this.elabs = new ElevenLabsClient({
      apiKey: env.ELEVENLABS_API_KEY
    })
  }

  static getInstance() {
    if (!instance) instance = new ElevenLabs()
    return instance
  }

  async createSpeech(text: string) {
    const audio = await this.elabs.textToSpeech.convert(
      '7i7dgyCkKt4c16dLtwT3', 
      {
        text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      }
    )

    const chunks = []
    for await (const chunk of audio) {
      chunks.push(chunk)
    }

    const content = Buffer.concat(chunks)
    
    await saveAudioService('audio.mp3', content)
  }
}


const saveAudioService = async (filename: string, buffer: Buffer) => {
  const targetFolder = path.resolve(process.cwd(), 'src', 'audios');
  const filePath = path.join(targetFolder, filename);

  try {
    await mkdir(targetFolder, { recursive: true });

    await writeFile(filePath, buffer);
  } catch (error) {
    console.error("Erro ao salvar áudio:", error);
    throw error;
  }
}