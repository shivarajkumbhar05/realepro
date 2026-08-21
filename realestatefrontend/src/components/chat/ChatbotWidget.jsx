import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MapPin, 
  Bed, 
  Square, 
  RotateCcw, 
  Minus,
  Maximize2,
  Minimize2,
  MessageCircle,
  Home,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Menu,
  HelpCircle,
  Paperclip
} from 'lucide-react';
import { sendChatMessage } from '../../api/chatbot';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../utils/imageUtils';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

const SUGGESTIONS_BY_ROLE = {
  buyer: [
    { icon: Home, text: '2 BHK apartment for rent in Pune' },
    { icon: DollarSign, text: 'How do I make an offer on a property?' },
    { icon: MapPin, text: 'How does the map location work?' },
    { icon: Calendar, text: 'Schedule a property visit' },
    { icon: TrendingUp, text: 'Best areas for investment' },
  ],
  agent: [
    { icon: Home, text: 'How do I list a new property?' },
    { icon: Clock, text: 'How long does admin approval take?' },
    { icon: Shield, text: 'How does document verification work?' },
    { icon: TrendingUp, text: 'View my listing analytics' },
    { icon: DollarSign, text: 'Pricing strategies' },
  ],
  admin: [
    { icon: Shield, text: 'How do I approve a pending listing?' },
    { icon: User, text: 'How do I manage users?' },
    { icon: CheckCircle, text: 'How does document verification work?' },
    { icon: TrendingUp, text: 'View platform analytics' },
    { icon: AlertCircle, text: 'Report & compliance' },
  ],
};

// Enhanced Property Card - Minimal Style
function PropertyMiniCard({ p }) {
  const img = p.images?.[0] ? resolveImageUrl(p.images[0]) : null;
  
  return (
    <Link
      to={`/properties/${p.id}`}
      className="group block bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
          {img ? (
            <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <Home className="w-6 h-6 text-gray-300 m-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {p.title}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {p.city}
            </span>
            {p.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-3 h-3" />
                {p.bedrooms}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm font-semibold text-gray-900">
              ₹{p.price?.toLocaleString('en-IN')}
            </p>
            {p.isApproved && (
              <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Typing Animation
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="px-4 py-3 bg-gray-50 rounded-2xl rounded-bl-none">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

// Message Component - Clean Design
function ChatMessage({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : ''}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5 ml-1">
            <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-600">Assistant</span>
          </div>
        )}
        <div
          className={`px-4 py-2.5 text-sm whitespace-pre-wrap ${
            isUser
              ? 'bg-gray-900 text-white rounded-2xl rounded-br-none'
              : 'bg-gray-50 text-gray-800 rounded-2xl rounded-bl-none'
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}

// Suggestion Button - Minimal
function SuggestionButton({ icon: Icon, text, onClick }) {
  return (
    <button
      onClick={() => onClick(text)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-xs text-gray-700 whitespace-nowrap flex-shrink-0"
    >
      <Icon className="w-3.5 h-3.5 text-gray-500" />
      <span className="truncate max-w-[140px]">{text}</span>
    </button>
  );
}

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const role = user?.role || 'buyer';
  const suggestions = SUGGESTIONS_BY_ROLE[role] || SUGGESTIONS_BY_ROLE.buyer;
  const welcomeText = `Hi! I'm the PropEstate Assistant 🤖 I can help you find properties, answer role-based questions, and guide you through approvals, listings, and support. How can I assist you today?`;
  
  const [messages, setMessages] = useState([
    { role: 'bot', text: welcomeText, properties: [], timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;
    
    setMessages((m) => [...m, { role: 'user', text: trimmed, timestamp: new Date() }]);
    setInput('');
    setLoading(true);
    setIsTyping(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      const { data } = await sendChatMessage(trimmed, role);
      setIsTyping(false);
      const payload = data?.data || {};
      setMessages((m) => [...m, {
        role: 'bot',
        text: payload.text || payload.message || "I'm here to help. Try asking about listings, approvals, or documents.",
        properties: payload.properties || [],
        suggestions: payload.suggestions || [],
        timestamp: new Date()
      }]);
    } catch {
      setIsTyping(false);
      setMessages((m) => [...m, { 
        role: 'bot', 
        text: "Sorry, I couldn't process your request. Please try again. 🤔",
        properties: [],
        timestamp: new Date()
      }]);
    }
    setLoading(false);
  };

  const resetChat = () => {
    setMessages([{ 
      role: 'bot', 
      text: welcomeText, 
      properties: [],
      timestamp: new Date()
    }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const getMessageCount = () => {
    return messages.filter(m => m.role === 'user').length;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Launcher Button - Minimal */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 group"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
              <Bot className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </button>
      )}

      {/* Chat Panel - Minimal Design */}
      {open && (
        <div className={`fixed bottom-5 right-5 z-40 transition-all duration-300 ease-in-out ${
          expanded ? 'w-[95vw] max-w-3xl h-[85vh] max-h-[700px]' : 'w-[92vw] max-w-sm h-[70vh] max-h-[560px]'
        } bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden`}>
          
          {/* Header - Clean */}
          <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0 bg-white">
            <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                PropEstate Assistant
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Online
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={resetChat} 
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setExpanded(!expanded)} 
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setOpen(false)} 
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages - Clean */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className="space-y-2">
                <ChatMessage message={m.text} isUser={m.role === 'user'} />
                {m.properties?.length > 0 && (
                  <div className="ml-9 space-y-2">
                    {m.properties.map((p) => (
                      <PropertyMiniCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
                {m.suggestions?.length > 0 && m.role === 'bot' && (
                  <div className="ml-9 flex flex-wrap gap-1.5">
                    {m.suggestions.slice(0,3).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => send(item)}
                        className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
                <div className={`text-[10px] text-gray-400 ${m.role === 'user' ? 'text-right pr-2' : 'pl-9'}`}>
                  {formatTime(m.timestamp)}
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Suggestions - Clean */}
          {getMessageCount() < 2 && (
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-thin scrollbar-thumb-gray-300">
              {suggestions.slice(0, 4).map((s, index) => (
                <SuggestionButton 
                  key={index} 
                  icon={s.icon} 
                  text={s.text} 
                  onClick={send} 
                />
              ))}
            </div>
          )}

          {/* Input - Minimal */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-3 border-t border-gray-100 flex items-end gap-2 flex-shrink-0 bg-white"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows="1"
                className="w-full resize-none rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none transition-all duration-200 px-4 py-2.5 text-sm min-h-[44px] max-h-[100px] bg-gray-50"
                style={{ height: 'auto' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="h-[44px] w-[44px] rounded-xl bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer - Minimal */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            <p className="text-[10px] text-gray-400">
              AI-powered assistant
            </p>
            <p className="text-[10px] text-gray-400">
              {getMessageCount()} messages
            </p>
          </div>
        </div>
      )}
    </>
  );
}