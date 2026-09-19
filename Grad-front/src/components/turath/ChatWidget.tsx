import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Loader2, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTurath } from "@/lib/turath/store";

type ChatMessage = { 
  id: string; 
  from: "bot" | "user"; 
  text: string; 
};

function renderInline(text: string): React.ReactNode {
  // Regex to split on **bold**, *italic*, `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="italic text-muted-foreground font-serif">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-primary">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts.length > 0 ? parts : text;
}

function FormattedBotMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushTable = (key: string) => {
    if (tableRows.length === 0) return;
    // Filter out separator rows like |---|---|
    const validRows = tableRows.filter((row) => !row.every((cell) => /^[-:| ]+$/.test(cell)));
    if (validRows.length > 0) {
      // If table has header and data rows
      const [header, ...data] = validRows;
      blocks.push(
        <div key={key} className="my-2 space-y-2">
          {data.length > 0 ? (
            data.map((row, rIdx) => {
              // Extract fields
              const cells = row.filter((c) => c.trim().length > 0);
              return (
                <div
                  key={`tbl-${rIdx}`}
                  className="rounded-lg border border-border/70 bg-background/80 p-2.5 shadow-xs text-xs space-y-1"
                >
                  <div className="flex items-start gap-1.5 font-medium text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <div>{renderInline(cells.slice(0, 2).join(" — "))}</div>
                  </div>
                  {cells.length > 2 && (
                    <div className="text-muted-foreground pl-5 text-[11px] leading-relaxed">
                      {renderInline(cells.slice(2).join(" • "))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-border bg-background p-2 text-xs">
              {header.join(" | ")}
            </div>
          )}
        </div>
      );
    }
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    // Check if line is a markdown table row
    if (rawLine.startsWith("|") && rawLine.endsWith("|")) {
      inTable = true;
      const cells = rawLine
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(`tbl-flush-${i}`);
    }

    if (!rawLine) {
      blocks.push(<div key={`empty-${i}`} className="h-1.5" />);
      continue;
    }

    // Markdown headers
    if (rawLine.startsWith("### ")) {
      blocks.push(
        <h4 key={`h3-${i}`} className="font-semibold text-xs tracking-wide text-foreground mt-2 mb-1">
          {renderInline(rawLine.replace(/^###\s+/, ""))}
        </h4>
      );
    } else if (rawLine.startsWith("## ")) {
      blocks.push(
        <h3 key={`h2-${i}`} className="font-semibold text-sm tracking-wide text-foreground mt-2.5 mb-1">
          {renderInline(rawLine.replace(/^##\s+/, ""))}
        </h3>
      );
    } else if (rawLine.startsWith("# ")) {
      blocks.push(
        <h2 key={`h1-${i}`} className="font-bold text-sm tracking-wide text-foreground mt-3 mb-1">
          {renderInline(rawLine.replace(/^#\s+/, ""))}
        </h2>
      );
    }
    // Bullet / numbered list
    else if (/^(\*|-|•|\d+\.)\s+/.test(rawLine)) {
      const content = rawLine.replace(/^(\*|-|•|\d+\.)\s+/, "");
      blocks.push(
        <div key={`li-${i}`} className="flex items-start gap-1.5 text-xs leading-relaxed my-0.5 pl-1">
          <span className="text-primary font-bold select-none">•</span>
          <span className="flex-1">{renderInline(content)}</span>
        </div>
      );
    } else {
      // Normal paragraph
      blocks.push(
        <p key={`p-${i}`} className="text-xs leading-relaxed">
          {renderInline(rawLine)}
        </p>
      );
    }
  }

  if (inTable) {
    flushTable("tbl-flush-end");
  }

  return <div className="space-y-1">{blocks}</div>;
}

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
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full p-0 shadow-lg cursor-pointer"
      >
        {open ? <X className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[24rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-2xl">
          <div className="border-b bg-accent/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="font-display text-sm tracking-wide font-medium">Jalis — Book Companion</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated && activeUser ? `Curated picks for ${activeUser.name}` : "Discover your next read"}
            </p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] rounded-lg px-3.5 py-2.5 text-sm ${
                  m.from === "bot"
                    ? "bg-muted/80 text-foreground border border-border/40 shadow-2xs"
                    : "ml-auto bg-primary text-primary-foreground shadow-2xs whitespace-pre-wrap"
                }`}
              >
                {m.from === "bot" ? <FormattedBotMessage text={m.text} /> : m.text}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 bg-muted/80 text-muted-foreground max-w-[85%] rounded-lg px-3 py-2 text-xs border border-border/40">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Jalis is searching the catalog...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t p-2.5 bg-background">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask Jalis for recommendations..."
              disabled={loading}
              className="h-9 text-xs"
            />
            <Button 
              size="icon" 
              className="h-9 w-9 shrink-0 cursor-pointer" 
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