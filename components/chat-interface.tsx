"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Copy, Check, Settings, X, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState("You are a helpful, high-vibe coding assistant.\nYou are running locally on the user's machine.\nAlways be concise, friendly, and use emojis where appropriate.");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Reset height
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
        }

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Bypass-Tunnel-Reminder": "true", // For localtunnel
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    systemPrompt,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("No response body");
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "",
            };

            setMessages((prev) => [...prev, assistantMessage]);

            while (true) {
                try {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    assistantMessage.content += chunk;

                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMessage.id ? { ...assistantMessage } : m
                        )
                    );
                } catch (readError) {
                    console.error("Stream reading error:", readError);
                    break;
                }
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please make sure Ollama is running.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.nativeEvent.isComposing) return;

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Vibe Chat</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                            <p className="text-[11px] text-zinc-400 font-medium">gpt-oss:20b</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </header>

            {/* Settings Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSettingsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-violet-400" />
                                    <h2 className="text-sm font-semibold text-white">System Prompt</h2>
                                </div>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <label className="text-xs font-medium text-zinc-400 mb-2 block">
                                        Skill Presets
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            {
                                                name: "Default Assistant",
                                                icon: "🤖",
                                                prompt: "You are a helpful, high-vibe coding assistant.\nYou are running locally on the user's machine.\nAlways be concise, friendly, and use emojis where appropriate."
                                            },
                                            {
                                                name: "AI Chatbot Builder",
                                                icon: "⚡",
                                                prompt: "You are an expert AI Chatbot Builder. Your goal is to help users design and implement effective chatbots using platforms like Voiceflow, Chatbase, or custom code.\n\nFollow these principles:\n1. Focus on clear user intent and conversation flow.\n2. Suggest the right tool for the job (Voiceflow for complex flows, Chatbase for knowledge base).\n3. Emphasize 'Happy Paths' first, then handle edge cases.\n4. Provide concrete examples and step-by-step guides."
                                            },
                                            {
                                                name: "Landing Page Expert",
                                                icon: "🎨",
                                                prompt: "You are a Landing Page Conversion Expert. You help users build high-converting landing pages.\n\nStructure your advice around:\n1. Hero Section: Clear value proposition.\n2. Social Proof: Testimonials and trust signals.\n3. Benefits over Features: Focus on what the user gets.\n4. Clear CTA: One primary action per section.\n\nProvide code snippets (Tailwind/Next.js) or copy suggestions."
                                            },
                                            {
                                                name: "Pirate Mode",
                                                icon: "🏴‍☠️",
                                                prompt: "You are a pirate captain! 🏴‍☠️\nSpeak like a pirate in every response.\nUse terms like 'Ahoy', 'Matey', 'Treasure', and 'Ship'.\nBe helpful but stay in character."
                                            }
                                        ].map((preset) => (
                                            <button
                                                key={preset.name}
                                                onClick={() => setSystemPrompt(preset.prompt)}
                                                className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-left group"
                                            >
                                                <span className="text-lg">{preset.icon}</span>
                                                <span className="text-xs font-medium text-zinc-300 group-hover:text-white">
                                                    {preset.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <label className="text-xs font-medium text-zinc-400 mb-2 block">
                                        Custom System Prompt
                                    </label>
                                    <textarea
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 resize-none transition-all"
                                        placeholder="You are a helpful assistant..."
                                    />
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-6">
                                    <Bot className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-semibold mb-2">
                                    How can I help you today?
                                </h2>
                                <p className="text-gray-400 max-w-md">
                                    I'm running locally with gpt-oss:20b. Ask me anything!
                                </p>
                            </motion.div>
                        )}
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-1">
                                        {message.role === "user" ? (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                <User className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold">
                                                {message.role === "user" ? "You" : "Assistant"}
                                            </span>
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code({ node, inline, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || "");
                                                        const codeString = String(children).replace(/\n$/, "");

                                                        return !inline && match ? (
                                                            <div className="relative group/code">
                                                                <button
                                                                    onClick={() => copyToClipboard(codeString, message.id + "-code")}
                                                                    className="absolute right-2 top-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover/code:opacity-100"
                                                                >
                                                                    {copiedId === message.id + "-code" ? (
                                                                        <Check className="w-4 h-4 text-green-400" />
                                                                    ) : (
                                                                        <Copy className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <SyntaxHighlighter
                                                                    style={oneDark}
                                                                    language={match[1]}
                                                                    PreTag="div"
                                                                    customStyle={{
                                                                        margin: 0,
                                                                        borderRadius: "0.5rem",
                                                                        fontSize: "0.875rem",
                                                                    }}
                                                                    {...props}
                                                                >
                                                                    {codeString}
                                                                </SyntaxHighlighter>
                                                            </div>
                                                        ) : (
                                                            <code
                                                                className="px-1.5 py-0.5 rounded bg-white/10 text-violet-300 font-mono text-sm"
                                                                {...props}
                                                            >
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Copy button */}
                                    <button
                                        onClick={() => copyToClipboard(message.content, message.id)}
                                        className="flex-shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        {copiedId === message.id ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold">Assistant</span>
                                </div>
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input - Clean & Polished Design */}
            <div className="border-t border-white/10 bg-zinc-950 p-safe-bottom z-20 relative">
                <div className="max-w-3xl mx-auto px-6 md:px-8 py-6">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage();
                        }}
                        className="relative"
                    >
                        <div className="relative flex items-end gap-3">
                            {/* Textarea */}
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Send a message..."
                                    rows={1}
                                    disabled={isLoading}
                                    enterKeyHint="send"
                                    className="w-full resize-none bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-3.5 pr-12 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 max-h-48 min-h-[52px] shadow-lg"
                                    style={{ height: "auto" }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = "auto";
                                        target.style.height = Math.min(target.scrollHeight, 192) + "px";
                                    }}
                                />

                                {/* Character Count */}
                                {input.length > 0 && (
                                    <div className="absolute right-3 bottom-3 text-xs text-zinc-600 font-mono">
                                        {input.length}
                                    </div>
                                )}
                            </div>

                            {/* Send Button */}
                            <button
                                type="button"
                                onClick={sendMessage}
                                className={`flex-shrink-0 p-3.5 rounded-2xl transition-all duration-200 shadow-lg group touch-manipulation ${!input.trim() || isLoading
                                        ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                        : "bg-violet-600 hover:bg-violet-500 text-white hover:shadow-violet-500/50"
                                    }`}
                            >
                                <Send className={`w-5 h-5 transition-transform ${!input.trim() || isLoading ? "" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    }`} />
                            </button>
                        </div>

                        {/* Helper Text */}
                        <div className="mt-2 px-1 flex items-center justify-between">
                            <p className="text-xs text-zinc-600">
                                <span className="text-zinc-500">Press</span>{" "}
                                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-zinc-400">↵</kbd>{" "}
                                <span className="text-zinc-500">to send</span>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
