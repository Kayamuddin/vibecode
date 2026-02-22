import { type NextRequest, NextResponse } from "next/server"

interface ChatMessage {
    role: "user" | "assistant"
    content: string
}

interface EnhancePromptRequest {
    prompt: string
    context?: {
        fileName?: string
        language?: string
        codeContent?: string
    }
}

async function generateAIResponse(messages: ChatMessage[]) {
    const systemPrompt = `You are an expert AI coding assistant. Give short, clear answers with code.`

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 300,
            }),
            signal: controller.signal
        })

        clearTimeout(timeout)

        if (!response.ok) {
            const error = await response.text()
            throw new Error(error)
        }

        const data = await response.json()
        return data.choices?.[0]?.message?.content || "No response"

    } catch (error) {
        console.error("OpenRouter error:", error)
        throw error
    }
}

async function enhancePrompt(request: EnhancePromptRequest) {
    const enhancementPrompt = `
Rewrite this coding prompt to be clearer and more detailed.

Prompt: "${request.prompt}"

Return only improved prompt.
`

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat", // ⚡ FAST + FREE
                messages: [
                    { role: "user", content: enhancementPrompt }
                ],
                temperature: 0.3,
                max_tokens: 200,
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(error)
        }

        const data = await response.json()
        return data.choices?.[0]?.message?.content?.trim() || request.prompt

    } catch (error) {
        console.error("Prompt enhancement error:", error)
        return request.prompt
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Handle prompt enhancement
        if (body.action === "enhance") {
            const enhancedPrompt = await enhancePrompt(body as EnhancePromptRequest)
            return NextResponse.json({ enhancedPrompt })
        }

        const { message, history } = body;


        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
        }

        const validHistory = Array.isArray(history)
            ? history.filter(
                (msg) =>
                    msg &&
                    typeof msg === "object" &&
                    typeof msg.role === "string" &&
                    typeof msg.content === "string" &&
                    ["user", "assistant"].includes(msg.role),
            )
            : []
        const recentHistory = validHistory.slice(-10)
        const messages: ChatMessage[] = [...recentHistory, { role: "user", content: message }]

        const aiResponse = await generateAIResponse(messages)
        if (!aiResponse) {
            throw new Error("Empty response from AI model")
        }

        return NextResponse.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error("Error in AI chat route:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        return NextResponse.json(
            {
                error: "Failed to generate AI response",
                details: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 },
        )
    }
}

export async function GET() {
    return NextResponse.json({
        status: "AI Chat API is running",
        timestamp: new Date().toISOString(),
        info: "Use POST method to send chat messages or enhance prompts",
    })
}