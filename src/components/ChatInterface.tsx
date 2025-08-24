import { useState, useRef, useEffect } from "react";
import { Send, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { mockChatResponse } from "@/lib/api";
import { GridBackground } from "@/components/GridBackground";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Source {
  id: number;
  content: string;
  metadata: { page?: number; source?: string };
  similarity: number;
}

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const playSound = (type: 'send' | 'receive') => {
    if (!isSoundEnabled) return;
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    if (type === 'send') {
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.1);
    } else {
      oscillator.frequency.setValueAtTime(400, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.1);
    }
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setIsTyping(true);
    
    playSound('send');

    try {
      // For now, using mock response. Replace with actual Supabase integration
      const data = await mockChatResponse(userMessage);
      
      setIsTyping(false);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
        setSources(data.sources || []);
        playSound('receive');
      }, 500);

    } catch (error) {
      setIsTyping(false);
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCitationNumber = (sourceId: number) => {
    return sources.findIndex(s => s.id === sourceId) + 1;
  };

  const renderMessageWithCitations = (content: string) => {
    // Simple citation replacement - look for [1], [2], etc.
    const citationRegex = /\[(\d+)\]/g;
    const parts = content.split(citationRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 0) {
        return <span key={index}>{part}</span>;
      } else {
        const citationIndex = parseInt(part) - 1;
        const source = sources[citationIndex];
        if (source) {
          return (
            <Popover key={index}>
              <PopoverTrigger asChild>
                <span className="citation-link ml-1 mr-1">
                  {part}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Page {source.metadata?.page || "?"}</Badge>
                    <Badge variant="outline">
                      {(source.similarity * 100).toFixed(1)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {source.content.length > 200 
                      ? source.content.substring(0, 200) + "..." 
                      : source.content}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          );
        }
        return <span key={index}>[{part}]</span>;
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      <GridBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                RAG Nutritional Chatbot: Build from Scratch
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Presented by Aman Kesarwani
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative z-10">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <div className="grid-background w-32 h-32 mx-auto rounded-lg mb-4 opacity-20"></div>
                <h3 className="text-lg font-medium mb-2">Ask me about nutrition!</h3>
                <p className="text-sm">I can help you with questions about the nutrition PDF document.</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} message-enter`}
              >
                <Card
                  className={`max-w-[80%] px-4 py-3 ${
                    message.role === "user"
                      ? "bg-chat-user text-primary-foreground"
                      : "bg-chat-assistant border-chat-border"
                  }`}
                >
                  <div className="text-sm">
                    {message.role === "assistant" 
                      ? renderMessageWithCitations(message.content)
                      : message.content
                    }
                  </div>
                </Card>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start message-enter">
                <Card className="bg-chat-assistant border-chat-border px-4 py-3">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6 relative z-10">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about nutrition, vitamins, minerals, or any health-related topic..."
                disabled={isLoading}
                className="flex-1 bg-input border-border focus:ring-primary"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Panel */}
      {sources.length > 0 && (
        <div className="border-t border-border bg-card/30 backdrop-blur-sm relative z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Sources Referenced</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sources.map((source, index) => (
                <Card key={source.id} className="p-3 bg-muted/50 border-muted">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      [{index + 1}] Page {source.metadata?.page || "?"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {(source.similarity * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {source.content.substring(0, 120)}...
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}