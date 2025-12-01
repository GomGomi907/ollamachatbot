import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Main Chat Area - Full Width */}
      <main className="flex-1 flex flex-col">
        <ChatInterface />
      </main>
    </div>
  );
}
