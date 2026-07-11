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
  Zap
} from 'lucide-react';
import { sendChatMessage } from '../../api/chatbot';
import { useAuth } from '../../context/AuthContext';

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

// Enhanced Property Card
function PropertyMiniCard({ p }) {
  const img = p.images?.[0] ? `${BASE}${p.images[0].path}` : null;
  
  return (
    <Link
      to={`/properties/${p.id}`}
      className="group block bg-white border border-gray-200 rounded-xl p-3 hover:border-primary-400 hover:shadow-md transition-all duration-300"
    >
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
          {img ? (
            <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <Home className="w-6 h-6 text-gray-400 m-3" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
            {p.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {p.city}
            </span>
            {p.bedrooms > 0 && (
              <span className="flex items-center gap-0.5">
                <Bed className="w-3 h-3" />
                {p.bedrooms}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Square className="w-3 h-3" />
              {p.area}{p.areaUnit}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm font-bold text-primary-600">
              ₹{p.price?.toLocaleString('en-IN')}
            </p>
            {p.isApproved && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

// Typing Animation Component
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-bl-sm shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

// Message Component
function ChatMessage({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : ''}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 ml-1">
            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
              <Bot className="w-3 h-3 text-primary-600" />
            </div>
            <span className="text-[10px] font-medium text-gray-500">Assistant</span>
          </div>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
            isUser
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-br-sm shadow-md shadow-primary-500/20'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}

// Suggestion Button
function SuggestionButton({ icon: Icon, text, onClick }) {
  return (
    <button
      onClick={() => onClick(text)}
      className="group flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 hover:from-primary-100 hover:to-primary-200 transition-all duration-300 text-xs font-medium hover:scale-105 hover:shadow-md"
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="truncate max-w-[120px]">{text}</span>
    </button>
  );
}

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const suggestions = SUGGESTIONS_BY_ROLE[user?.role] || SUGGESTIONS_BY_ROLE.buyer;
  const welcomeText = `Hi! I'm the PropEstate Assistant 🤖 I can help you find properties, answer questions about buying, selling, or renting, and guide you through the process. How can I assist you today?`;
  
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
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      const { data } = await sendChatMessage(trimmed);
      setIsTyping(false);
      setMessages((m) => [...m, { 
        role: 'bot', 
        text: data.data.text, 
        properties: data.data.properties,
        timestamp: new Date()
      }]);
    } catch {
      setIsTyping(false);
      setMessages((m) => [...m, { 
        role: 'bot', 
        text: "I'm sorry, I couldn't process your request. Please try again in a moment. 🤔",
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
      {/* Launcher Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-40"></div>
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white flex items-center justify-center shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-110 active:scale-95 transition-all duration-300">
              <Bot className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className={`fixed bottom-5 right-5 z-40 transition-all duration-300 ease-in-out ${
          expanded ? 'w-[95vw] max-w-3xl h-[85vh] max-h-[700px]' : 'w-[92vw] max-w-sm h-[70vh] max-h-[560px]'
        } bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-primary-600"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight flex items-center gap-2">
                PropEstate Assistant
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal">
                  AI
                </span>
              </p>
              <p className="text-[11px] text-primary-100 leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Online • Ready to help
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={resetChat} 
                title="Start a new chat" 
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setExpanded(!expanded)} 
                title={expanded ? 'Minimize' : 'Maximize'}
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setOpen(false)} 
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((m, i) => (
              <div key={i} className="space-y-1">
                <ChatMessage message={m.text} isUser={m.role === 'user'} />
                {m.properties?.length > 0 && (
                  <div className="ml-11 space-y-1.5">
                    {m.properties.map((p) => (
                      <PropertyMiniCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
                <div className={`text-[10px] text-gray-400 ${m.role === 'user' ? 'text-right pr-2' : 'pl-11'}`}>
                  {formatTime(m.timestamp)}
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Suggestions */}
          {getMessageCount() < 2 && (
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0 scrollbar-thin scrollbar-thumb-gray-300">
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

          {/* Quick Actions */}
          {getMessageCount() < 2 && (
            <div className="px-3 pb-2 flex gap-2 flex-shrink-0 border-b border-gray-100">
              <button className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <MessageCircle className="w-3.5 h-3.5" />
                Quick Help
              </button>
              <button className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <Shield className="w-3.5 h-3.5" />
                FAQ
              </button>
              <button className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <Phone className="w-3.5 h-3.5" />
                Contact Support
              </button>
            </div>
          )}

          {/* Input */}
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
                placeholder="Type your message..."
                rows="1"
                className="w-full resize-none rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all duration-300 px-4 py-2.5 text-sm min-h-[44px] max-h-[100px]"
                style={{ height: 'auto' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="h-[44px] w-[44px] rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            <p className="text-[10px] text-gray-400">
              <span className="font-medium">🔒 Secure</span> • AI-powered assistant
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