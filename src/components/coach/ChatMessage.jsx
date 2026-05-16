import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export default function ChatMessage({ message, index }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mt-1 shadow-lg shadow-emerald-500/20">
          <span className="text-[11px] font-bold text-white">AI</span>
        </div>
      )}

      <div className={cn('max-w-[80%]', isUser ? 'items-end flex flex-col' : '')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card border border-white/10 text-foreground rounded-tl-sm shadow-sm'
          )}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-2 [&_li]:my-0.5 [&_strong]:text-emerald-400 [&_h3]:text-emerald-400 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3"
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
          {message.timestamp}
        </p>
      </div>

      {isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center mt-1">
          <span className="text-[11px] font-semibold text-muted-foreground">You</span>
        </div>
      )}
    </motion.div>
  );
}