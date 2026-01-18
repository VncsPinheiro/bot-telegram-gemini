export interface History {
	role: 'user' | 'model'
	parts: {
		text: string
	}[]
}