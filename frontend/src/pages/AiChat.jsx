import { useState, useRef, useEffect } from 'react';
import { askAiAPI } from '../api';
import { Send, Bot, User, Sparkles, Loader2, MessageSquare, TrendingUp, Wallet, HelpCircle } from 'lucide-react';

const suggestedQuestions = [
  { icon: Wallet, text: "What's my current account balance?", color: 'var(--primary-400)' },
  { icon: TrendingUp, text: "Show my recent transactions", color: 'var(--accent-400)' },
  { icon: MessageSquare, text: "How much did I spend this month?", color: 'var(--success)' },
  { icon: HelpCircle, text: "When was my last deposit?", color: 'var(--warning)' },
];

const AiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await askAiAPI({ message: text });
      const aiMessage = { role: 'ai', content: res.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage = { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmptyState = messages.length === 0;

  return (
    <div className="ai-chat-page">
      <div className="ai-chat-container">
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-left">
            <div className="ai-chat-avatar-ring">
              <div className="ai-chat-avatar">
                <Sparkles size={22} />
              </div>
            </div>
            <div>
              <h2 className="ai-chat-title">Ask Your Money</h2>
              <p className="ai-chat-subtitle">AI-powered financial assistant</p>
            </div>
          </div>
          <div className="ai-chat-status">
            <span className="ai-chat-status-dot" />
            Online
          </div>
        </div>

        {/* Messages Area */}
        <div className="ai-chat-messages">
          {isEmptyState ? (
            <div className="ai-chat-empty">
              <div className="ai-chat-empty-icon-wrapper">
                <div className="ai-chat-empty-icon">
                  <Bot size={48} />
                </div>
                <div className="ai-chat-empty-ring" />
                <div className="ai-chat-empty-ring ai-chat-empty-ring--2" />
              </div>
              <h3>How can I help you today?</h3>
              <p>Ask me anything about your accounts, transactions, or finances.</p>
              <div className="ai-chat-suggestions">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="ai-chat-suggestion-card"
                    onClick={() => handleSend(q.text)}
                  >
                    <q.icon size={18} style={{ color: q.color, flexShrink: 0 }} />
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`ai-chat-bubble-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  <div className={`ai-chat-bubble-avatar ${msg.role}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                  </div>
                  <div className={`ai-chat-bubble ${msg.role}`}>
                    <div className="ai-chat-bubble-content">{msg.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="ai-chat-bubble-row ai">
                  <div className="ai-chat-bubble-avatar ai">
                    <Sparkles size={16} />
                  </div>
                  <div className="ai-chat-bubble ai">
                    <div className="ai-chat-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="ai-chat-input-area">
          <div className="ai-chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="ai-chat-input"
              placeholder="Ask about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="ai-chat-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              {loading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
            </button>
          </div>
          <p className="ai-chat-disclaimer">AI responses are based on your real account data.</p>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
