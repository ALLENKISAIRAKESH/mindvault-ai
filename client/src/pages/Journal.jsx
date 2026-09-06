import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import VoiceRecorder from '../components/VoiceRecorder';
import VoiceNarrationButton from '../components/VoiceNarrationButton';
import ZeroKnowledgeLock from '../components/ZeroKnowledgeLock';
import { formatSessionMarkdown, downloadFile, printFormattedBrief } from '../lib/exportUtils';
import {
  Plus,
  Send,
  MessageSquare,
  Trash2,
  Sparkles,
  Brain,
  Clock,
  User,
  Bot,
  Download,
  Printer,
  ChevronDown,
  Target,
  HelpCircle,
  Zap,
  ShieldAlert,
  Smile,
} from 'lucide-react';

const THINKING_PERSONAS = [
  { id: 'default', label: 'Thinking Companion', icon: Brain, color: 'text-indigo-400', desc: 'Thoughtful, balanced reflection' },
  { id: 'first_principles', label: 'First-Principles', icon: Target, color: 'text-cyan-400', desc: 'Deconstruct to fundamental truths' },
  { id: 'socratic', label: 'Socratic Inquirer', icon: HelpCircle, color: 'text-amber-400', desc: 'Deep probing questions' },
  { id: 'execution', label: 'Execution Coach', icon: Zap, color: 'text-emerald-400', desc: 'Ruthless 80/20 action plans' },
  { id: 'devils_advocate', label: "Devil's Advocate", icon: ShieldAlert, color: 'text-rose-400', desc: 'Stress-test blind spots & risks' },
  { id: 'mindfulness', label: 'Mindfulness Guide', icon: Smile, color: 'text-purple-400', desc: 'Calm perspective & emotional clarity' },
];

function safeDateString(val) {
  try {
    if (!val) return 'Recent';
    const d = new Date(val);
    return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString();
  } catch {
    return 'Recent';
  }
}

function safeDateTimeString(val) {
  try {
    if (!val) return 'Just now';
    const d = new Date(val);
    return isNaN(d.getTime()) ? 'Just now' : d.toLocaleString();
  } catch {
    return 'Just now';
  }
}

export default function Journal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('default');
  const [zkEnabled, setZkEnabled] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const loadedSessionId = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  // Handle URL param session selection once
  useEffect(() => {
    const sessionId = searchParams.get('session');
    if (sessionId && sessions.length > 0 && loadedSessionId.current !== sessionId) {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        selectSession(session);
      }
    }
  }, [searchParams, sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadSessions() {
    try {
      const res = await api.getSessions();
      const list = res.sessions || [];
      setSessions(list);
      // Auto-select first session if present and none selected
      const urlSession = searchParams.get('session');
      if (!urlSession && list.length > 0 && !activeSession) {
        selectSession(list[0]);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function createNewSession() {
    try {
      const res = await api.createSession();
      const newSession = res.session;
      setSessions((prev) => [newSession, ...prev]);
      selectSession(newSession);
    } catch (err) {
      setError('Failed to create session');
    }
  }

  async function selectSession(session) {
    if (!session?.id) return;
    loadedSessionId.current = session.id;
    setActiveSession(session);
    setMessages([]);
    setLoadingMessages(true);
    setError('');

    if (searchParams.get('session') !== session.id) {
      setSearchParams({ session: session.id }, { replace: true });
    }

    try {
      const res = await api.getSession(session.id);
      const fetched = res.session || {};
      setMessages(fetched.messages || []);
      setActiveSession((prev) => ({ ...prev, ...fetched }));
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load session messages');
    } finally {
      setLoadingMessages(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  async function handleSend(e) {
    if (e) e.preventDefault();
    if (!input.trim() || sending || !activeSession) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);
    setError('');

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.sendMessage(activeSession.id, userMessage, selectedPersona);
      const assistantMsg = res.message || {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: res.response || 'Thought recorded.',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messageCount: (s.messageCount || 0) + 2,
                title:
                  s.title === 'New Session'
                    ? userMessage.substring(0, 80)
                    : s.title,
              }
            : s
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function handleSummarize() {
    if (!activeSession || summarizing) return;
    setSummarizing(true);
    setError('');

    try {
      await api.summarizeSession(activeSession.id);
      navigate(`/session/${activeSession.id}/summary`);
    } catch (err) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  }

  async function handleDeleteSession(sessionId) {
    if (!confirm('Delete this session and all its messages?')) return;
    try {
      await api.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
        setMessages([]);
        loadedSessionId.current = null;
        setSearchParams({}, { replace: true });
      }
    } catch (err) {
      setError('Failed to delete session');
    }
  }

  const handleVoiceTranscript = (text) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleExportMarkdown = () => {
    if (!activeSession) return;
    const md = formatSessionMarkdown({ ...activeSession, messages });
    const filename = `mindvault-session-${activeSession.id?.substring(0, 8) || 'export'}.md`;
    downloadFile(filename, md);
    setExportMenuOpen(false);
  };

  const handlePrintPdf = () => {
    if (!activeSession) return;
    const md = formatSessionMarkdown({ ...activeSession, messages });
    printFormattedBrief(md, activeSession.title || 'Journal Session');
    setExportMenuOpen(false);
  };

  return (
    <div
      className="flex h-[calc(100vh-73px)] -m-4 lg:-m-6"
      style={{ backgroundColor: 'var(--color-abyss)' }}
    >
      {/* ── Sessions Sidebar ── */}
      <div
        className={`w-72 shrink-0 flex flex-col transition-all duration-300 ${
          sidebarOpen ? '' : 'w-0 overflow-hidden'
        }`}
        style={{
          borderRight: '1px solid var(--color-surface)',
          backgroundColor: 'var(--color-void)',
        }}
      >
        <div className="p-3">
          <button
            onClick={createNewSession}
            className="btn-primary w-full justify-center py-2.5"
          >
            <Plus size={16} /> New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {loadingSessions ? (
            <LoadingSpinner size="sm" />
          ) : sessions.length === 0 ? (
            <p
              className="text-xs text-center py-8"
              style={{ color: 'var(--color-muted)' }}
            >
              No sessions yet
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => selectSession(session)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeSession?.id === session.id
                    ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-xs font-medium truncate">{session.title || 'Untitled Session'}</p>
                  <p className="text-[10px] text-gray-500">
                    {safeDateString(session.updatedAt || session.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 rounded transition-opacity"
                  title="Delete session"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeSession ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              icon={Brain}
              title="Welcome to your MindVault"
              description="Select an existing session from the sidebar or start a new thinking journey."
              action={{
                label: 'Create New Session',
                onClick: createNewSession,
              }}
            />
          </div>
        ) : (
          <>
            {/* Session Header */}
            <div
              className="flex items-center justify-between px-5 py-3 gap-4"
              style={{ borderBottom: '1px solid var(--color-surface)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <MessageSquare
                    size={14}
                    style={{ color: 'var(--color-accent-1)' }}
                  />
                </div>
                <div className="min-w-0">
                  <h2
                    className="text-sm font-semibold truncate"
                    style={{ color: 'var(--color-white)' }}
                  >
                    {activeSession.title || 'Untitled Session'}
                  </h2>
                  <p
                    className="text-[10px]"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    <Clock size={9} className="inline mr-1" />
                    {safeDateTimeString(activeSession.updatedAt || activeSession.createdAt)}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                {/* Zero-Knowledge Vault Locker */}
                <ZeroKnowledgeLock
                  isEnabled={zkEnabled}
                  onToggle={setZkEnabled}
                  passphrase={passphrase}
                  setPassphrase={setPassphrase}
                />

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setExportMenuOpen((prev) => !prev)}
                    className="btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1.5"
                    title="Export Session"
                  >
                    <Download size={14} /> Export <ChevronDown size={12} />
                  </button>
                  {exportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-30 animate-fade-in text-xs">
                      <button
                        onClick={handleExportMarkdown}
                        className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                      >
                        <Download size={13} /> Markdown (.md)
                      </button>
                      <button
                        onClick={handlePrintPdf}
                        className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                      >
                        <Printer size={13} /> Printable / PDF
                      </button>
                    </div>
                  )}
                </div>

                {/* Summarize Button */}
                <button
                  onClick={handleSummarize}
                  disabled={summarizing || messages.length < 2}
                  className="btn-ghost text-xs"
                  title="Generate structured insights"
                >
                  {summarizing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Sparkles size={14} /> Summarize
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── AI Thought Partner Persona Bar ── */}
            <div className="px-5 py-2.5 bg-slate-950/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
                <Brain size={12} className="text-indigo-400" /> Mode:
              </span>
              {THINKING_PERSONAS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    title={p.desc}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-600/30 text-white border border-indigo-500/50 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon size={12} className={p.color} />
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 space-y-4">
              {loadingMessages ? (
                <LoadingSpinner size="md" text="Loading conversation..." />
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-accent-1), var(--color-accent-3))',
                      }}
                    >
                      <Brain size={28} color="white" />
                    </div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: 'var(--color-white)' }}
                    >
                      What's on your mind?
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--color-soft)' }}
                    >
                      Type or speak your thoughts. MindVault will challenge assumptions, synthesize patterns, and maintain private memory.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={`flex gap-3 animate-fade-in ${
                      msg.role === 'user' ? 'justify-end' : ''
                    }`}
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--color-accent-1), var(--color-accent-3))',
                        }}
                      >
                        <Bot size={14} color="white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 relative group/msg ${
                        msg.role === 'user' ? '' : 'prose-ai'
                      }`}
                      style={{
                        background:
                          msg.role === 'user'
                            ? 'linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2))'
                            : 'var(--color-surface)',
                        color:
                          msg.role === 'user' ? 'white' : 'var(--color-text)',
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                      {msg.role === 'assistant' && (
                        <div className="mt-2 flex items-center justify-end border-t border-white/5 pt-1">
                          <VoiceNarrationButton text={msg.content} />
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1"
                        style={{ background: 'var(--color-surface)' }}
                      >
                        <User
                          size={14}
                          style={{ color: 'var(--color-accent-4)' }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}

              {sending && (
                <div className="flex gap-3 animate-fade-in">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-accent-1), var(--color-accent-3))',
                    }}
                  >
                    <Bot size={14} color="white" />
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{ background: 'var(--color-surface)' }}
                  >
                    <div className="flex gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          background: 'var(--color-accent-1)',
                          animationDelay: '0ms',
                        }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          background: 'var(--color-accent-2)',
                          animationDelay: '150ms',
                        }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          background: 'var(--color-accent-3)',
                          animationDelay: '300ms',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error Banner */}
            {error && (
              <div
                className="mx-4 lg:mx-8 mb-2 px-4 py-2 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: 'var(--color-danger)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {error}
              </div>
            )}

            {/* Input Bar with Voice Dictation */}
            <div
              className="px-4 lg:px-8 py-4"
              style={{ borderTop: '1px solid var(--color-surface)' }}
            >
              <form onSubmit={handleSend} className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder={`Speak or write in ${THINKING_PERSONAS.find((p) => p.id === selectedPersona)?.label} mode...`}
                    className="input-field resize-none min-h-[46px] max-h-[160px] py-3 pr-4"
                    rows={1}
                    style={{
                      height: 'auto',
                      overflow: input.split('\n').length > 4 ? 'auto' : 'hidden',
                    }}
                    disabled={sending}
                  />
                </div>

                {/* Real-time Voice Dictation */}
                <VoiceRecorder
                  onTranscript={handleVoiceTranscript}
                  isGenerating={sending}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="btn-primary py-3 px-4 shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
              <p
                className="text-[10px] mt-2 text-center"
                style={{ color: 'var(--color-muted)' }}
              >
                Press Enter to send · Shift+Enter for new line · Click mic to dictate stream of consciousness
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
