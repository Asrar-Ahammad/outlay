import OpenAI from 'openai'

// Check API key availability
const getOpenAiKey = (): string => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('OPENAI_API_KEY environment variable is required in production')
    }
    // Return empty placeholder for dev environment building
    return 'sk-placeholder'
  }
  return apiKey
}

export const openai = new OpenAI({
  apiKey: getOpenAiKey(),
})
