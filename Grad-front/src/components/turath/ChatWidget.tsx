import { useEffect, useRef, useState } from "react";
import { BookOpen, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTurath } from "@/lib/turath/store";

type ChatMessage = { 
  id: string; 
  from: "bot" | "user"; 
  text: string; 
};

export function ChatWidget() {
  const { isAuthenticated, activeUser } = useTurath();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      from: "bot",
      text: "Salam! I'm Jalis, your Turath reading companion. Tell me what kind of books, authors, or genres you enjoy, and I'll find recommendations from our catalog.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, from: "user", text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
      const response = await fetch(`${apiBaseUrl}/api/chatbot/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendation");
      }

      const data = await response.json();
      const botReply = data.reply || data.message || "I couldn't find a matching recommendation right now.";

      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, from: "bot", text: botReply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          from: "bot",
          text: "Sorry, I'm having trouble searching the catalog right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        aria-label={open ? "Close Jalis" : "Open Jalis book assistant"}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full p-0 shadow-lg"
      >
        {open ? <X className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-2xl">
          <div className="border-b bg-accent/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="font-display text-sm tracking-wide">Jalis — Book Companion</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated ? `Curated picks for ${activeUser.name}` : "Discover your next read"}
            </p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  m.from === "bot"
                    ? "bg-muted text-foreground"
                    : "ml-auto bg-primary text-primary-foreground"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 bg-muted text-muted-foreground max-w-[85%] rounded-lg px-3 py-2 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Jalis is searching the catalog...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t p-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask Jalis for a book recommendation..."
              disabled={loading}
              className="h-9"
            />
            <Button 
              size="icon" 
              className="h-9 w-9 shrink-0" 
              onClick={send} 
              disabled={loading || !input.trim()} 
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}