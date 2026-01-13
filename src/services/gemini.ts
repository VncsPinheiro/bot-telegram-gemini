import { GoogleGenAI } from '@google/genai'
import { env } from '../env';
let instance: Gemini | null = null

export class Gemini {
  private gemini: GoogleGenAI
  private constructor() {
    this.gemini = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY
    })
  }

  static getInstance() {
    if (!instance) instance = new Gemini()
    return instance
  }

  async chat(message: string) {
    const response = await this.gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    })
    return response.text
  }
}