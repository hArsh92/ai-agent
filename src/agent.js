import OpenAI from 'openai'
import 'dotenv/config'
import readlineSync from 'readline-sync'
import { readFileAsync } from './file-reader.js'
import { WeatherClient } from './weather-provider.js'

export class ChatClient {
    constructor() {
        this.weatherClient = new WeatherClient();
        this.client = new OpenAI({ apiKey: process.env['OPEN_AI_API_KEY'] })
        this.messages = []
        this.availableTools = {
            'getWeatherDetails': this.weatherClient.getTemperature
        }
    }

    async initialize() {
        const prompt = await readFileAsync('prompt.txt')
        this.messages = [{ role: 'system', content: prompt }]
    }

    async processUserInput(query) {
        const userQuery = { type: 'user', user: query }
        this.messages.push({ role: 'user', content: JSON.stringify(userQuery) })
    }

    async getCompletion() {
        const chat = await this.client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: this.messages,
            response_format: { type: 'json_object' },
        })
        const result = chat.choices[0].message.content
        this.messages.push({ role: 'assistant', content: result })
        return JSON.parse(result)
    }

    async handleAction(call) {
        const fn = this.availableTools[call.function]
        const observation = await fn(call.input)
        const obs = { type: 'observation', observation: observation }
        this.messages.push({ role: 'developer', content: JSON.stringify(obs) })
    }

    async processResponse(response) {
        if (response.type === 'output') {
            console.log(`🤖 ${response.output}`)
            return true
        } else if (response.type === 'action') {
            await this.handleAction(response)
            return false
        }
        return false
    }

    /**
     * Starts the AI-Agent to consume user inputs with city and 
     * console.logs the current temperature for that city
     */
    async start() {
        await this.initialize()

        while (true) {
            const query = readlineSync.question('>> ')
            await this.processUserInput(query)

            while (true) {
                const response = await this.getCompletion()
                const isDone = await this.processResponse(response)
                if (isDone) break
            }
        }
    }
}
