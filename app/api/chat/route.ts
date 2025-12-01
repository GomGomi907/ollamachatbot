export async function POST(req: Request) {
    try {
        const { messages, systemPrompt } = await req.json();

        const baseURL = process.env.LOCAL_LLM_BASE_URL || "http://localhost:11434/v1";
        const model = process.env.LOCAL_LLM_MODEL || "gpt-oss:20b";

        const defaultSystemPrompt = `You are a helpful, high-vibe coding assistant. 
You are running locally on the user's machine.
Always be concise, friendly, and use emojis where appropriate.`;

        const response = await fetch(`${baseURL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt || defaultSystemPrompt,
                    },
                    ...messages,
                ],
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("LLM API error:", response.status, errorText);
            throw new Error(`LLM API error: ${response.statusText}`);
        }

        // Transform OpenAI-compatible stream to plain text stream for useChat
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                try {
                    let buffer = "";
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split("\n");
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed || !trimmed.startsWith("data: ")) continue;

                            const data = trimmed.slice(6);
                            if (data === "[DONE]") continue;

                            try {
                                const json = JSON.parse(data);
                                const content = json.choices?.[0]?.delta?.content;
                                if (content) {
                                    controller.enqueue(encoder.encode(content));
                                }
                            } catch (e) {
                                // Ignore JSON parse errors
                            }
                        }
                    }
                } catch (error) {
                    console.error("Stream error:", error);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to connect to Local LLM" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
