import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { buildFullContext } from '@/lib/buildHealthContext';
import { computeCorrelations } from '@/lib/correlationEngine';
import ChatMessage from '@/components/coach/ChatMessage';
import TypingIndicator from '@/components/coach/TypingIndicator';
import SuggestedPrompts from '@/components/coach/SuggestedPrompts';
import CoachHeader from '@/components/coach/CoachHeader';
import { cn } from '@/lib/utils';

const SYSTEM_PROMPT = `You are a world-class personal health coach embedded in a wellness app. Your role is to analyze the user's real health data and provide warm, insightful, and actionable guidance — like a knowledgeable friend who happens to be a sports scientist and sleep specialist.

TONE & STYLE:
- Be conversational, warm, and encouraging — never clinical or robotic
- Lead with the most important insight, then give context
- Use bold text and bullet points for clarity when helpful
- Proactively flag concerning trends (e.g. HRV drops, sleep debt, overtraining)
- Give specific, actionable recommendations tied to their actual data
- Reference their actual numbers to make insights feel personalized
- Keep responses focused and concise — quality over quantity

EXPERTISE AREAS:
- Recovery science (HRV, resting HR, sleep architecture)
- Training load management and periodization
- Sleep optimization
- Fatigue and overtraining detection
- Energy level interpretation

Always respond based on the health data context provided. If data is limited, acknowledge it and give general guidance.`;

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `Hey! I'm your **Health Coach** 👋

I've reviewed your recent health data and I'm ready to help you understand what your body is telling you. I can analyze your recovery trends, sleep patterns, training load, and more.

**Here's what I can help with:**
- 💚 Recovery score interpretation
- 🌙 Sleep quality analysis  
- 🏋️ Training readiness assessment
- 📈 Trend spotting and anomaly detection
- 🧪 Interpreting your lab results and medical records
- ❓ Answering any health questions based on your data

What would you like to explore?`,
  timestamp: format(new Date(), 'h:mm a'),
};

export default function HealthCoach() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { data: logs = [] } = useQuery({
    queryKey: ['healthLogs', 'all'],
    queryFn: () => base44.entities.HealthLog.list('-date', 60),
  });

  const { data: labResults = [] } = useQuery({
    queryKey: ['labResults'],
    queryFn: () => base44.entities.LabResult.list('-date', 200),
  });

  const { data: rawJournalEntries } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => base44.entities.JournalEntry.list('-date', 120),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    const userMessage = {
      role: 'user',
      content: userText,
      timestamp: format(new Date(), 'h:mm a'),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const journalEntries = Array.isArray(rawJournalEntries) ? rawJournalEntries : [];
    const correlations = computeCorrelations(journalEntries, logs);
    const healthContext = buildFullContext(logs, labResults, correlations);

    const fullPrompt = `${SYSTEM_PROMPT}

${healthContext}

CONVERSATION HISTORY:
${messages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`).join('\n\n')}

User: ${userText}

Coach:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'claude_sonnet_4_6',
    });

    const assistantMessage = {
      role: 'assistant',
      content: response,
      timestamp: format(new Date(), 'h:mm a'),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length <= 1 && !isLoading;

  // Height: full viewport minus top nav (desktop sidebar offset handled by layout)
  // On mobile we subtract the bottom nav (~64px) + safe area
  return (
    <div className="fixed inset-0 md:left-64 flex flex-col bg-background z-10">
      <div className="flex flex-col h-full max-w-3xl mx-auto w-full">

        {/* Fixed header */}
        <div className="flex-shrink-0 px-4 sm:px-6 pt-16 md:pt-6 pb-2">
          <CoachHeader logsCount={logs.length} labCount={labResults.length} />
        </div>

        {/* Scrollable messages only */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 space-y-2">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} index={i} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed bottom: suggestions + input */}
        <div
          className="flex-shrink-0 px-4 sm:px-6 pt-3 space-y-2 border-t border-border/40 bg-background"
          style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' }}
        >
          {showSuggestions && (
            <SuggestedPrompts onSelect={sendMessage} disabled={isLoading} />
          )}

          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your Health Coach anything…"
              rows={1}
              className={cn(
                "resize-none flex-1 bg-card border-border/50 rounded-xl text-sm placeholder:text-muted-foreground",
                "focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30",
                "min-h-[44px] max-h-[120px] py-3 px-4 transition-all"
              )}
              style={{ height: 'auto', overflowY: 'auto' }}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex-shrink-0 transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center pb-1">
            Uses advanced AI · responses based on your logged health data
          </p>
        </div>
      </div>
    </div>
  );
}