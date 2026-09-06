import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DailyDigestModal from '../components/DailyDigestModal';
import {
  MessageSquare,
  Lightbulb,
  Database,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Brain,
  Target,
  HelpCircle,
  Zap,
  ShieldAlert,
  Smile,
  Network,
  Sun,
  Flame,
} from 'lucide-react';

const PERSONA_LAUNCHERS = [
  { id: 'first_principles', label: 'First-Principles', icon: Target, color: 'from-cyan-500 to-blue-600', text: 'Break down complex assumptions' },
  { id: 'socratic', label: 'Socratic Inquirer', icon: HelpCircle, color: 'from-amber-500 to-yellow-600', text: 'Deep probing inquiry' },
  { id: 'execution', label: 'Execution Coach', icon: Zap, color: 'from-emerald-500 to-teal-600', text: 'Milestones & 80/20 momentum' },
  { id: 'devils_advocate', label: "Devil's Advocate", icon: ShieldAlert, color: 'from-rose-500 to-red-600', text: 'Stress-test blind spots & risks' },
  { id: 'mindfulness', label: 'Mindfulness Guide', icon: Smile, color: 'from-purple-500 to-indigo-600', text: 'Emotional balance & calm' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [digestOpen, setDigestOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sessionsRes, insightsRes, memoriesRes] = await Promise.all([
          api.getSessions().catch(() => ({ sessions: [] })),
          api.getInsights().catch(() => ({ insights: [] })),
          api.getMemories().catch(() => ({ memories: [] })),
        ]);
        setSessions(sessionsRes.sessions || []);
        setInsights(insightsRes.insights || []);
        setMemories(memoriesRes.memories || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading your vault..." />;

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const startPersonaSession = async (personaId) => {
    try {
      const res = await api.createSession();
      navigate(`/journal?session=${res.session.id}`);
    } catch {
      navigate('/journal');
    }
  };

  // Generate a dynamic autonomous thought spark
  const topGoal = insights?.[0]?.goals?.[0]?.title;
  const topDecision = insights?.[0]?.decisions?.[0]?.title;
  const sparkPrompt = topGoal
    ? `You recently outlined the goal "${topGoal}". What is the single highest-leverage decision you can make today to accelerate this?`
    : topDecision
    ? `Following your decision on "${topDecision}", what unexpected second-order consequences should you prepare for?`
    : "What is an assumption you are currently taking for granted in your major project that could be completely wrong?";

  const handleLaunchSpark = async () => {
    try {
      const res = await api.createSession('Daily Reflection Spark');
      navigate(`/journal?session=${res.session.id}`);
    } catch {
      navigate('/journal');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* ── Daily Digest Modal ── */}
      <DailyDigestModal
        isOpen={digestOpen}
        onClose={() => setDigestOpen(false)}
        insights={insights?.[0] || {}}
        memories={memories}
        userName={firstName}
      />

      {/* ── Greeting & Daily Briefing Trigger ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-white)' }}>
            Hello, {firstName} 👋
          </h1>
          <p style={{ color: 'var(--color-soft)' }}>
            Your private cognitive operating system & AI thinking space.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDigestOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Sun size={14} className="text-amber-400" /> Daily Cognitive Briefing
          </button>

          <Link
            to="/insights"
            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Network size={14} /> Mind Graph
          </Link>
        </div>
      </div>

      {/* ── Autonomous Daily Thought Spark ── */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Flame size={14} className="text-orange-400 animate-pulse" /> Autonomous Daily Thought Spark
          </div>
          <p className="text-sm font-medium text-white italic">
            "{sparkPrompt}"
          </p>
        </div>
        <button
          onClick={handleLaunchSpark}
          className="btn-primary py-2.5 px-4 text-xs shrink-0 flex items-center gap-1.5"
        >
          <Sparkles size={14} /> Reflect on this
        </button>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/journal"
          className="glass glass-hover rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2))' }}>
            <Plus size={22} color="white" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-white)' }}>New Thinking Session</h3>
            <p className="text-xs" style={{ color: 'var(--color-soft)' }}>Start reflecting with Gemini</p>
          </div>
          <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-accent-1)' }} />
        </Link>

        <Link
          to="/insights"
          className="glass glass-hover rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, var(--color-accent-3), var(--color-accent-4))' }}>
            <Lightbulb size={22} color="white" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-white)' }}>Insights & Mind Graph</h3>
            <p className="text-xs" style={{ color: 'var(--color-soft)' }}>{insights.length} insight{insights.length !== 1 ? 's' : ''} extracted</p>
          </div>
          <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-accent-3)' }} />
        </Link>

        <Link
          to="/memory"
          className="glass glass-hover rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, var(--color-accent-4), var(--color-accent-5))' }}>
            <Database size={22} color="white" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-white)' }}>AI Knowledge Vault</h3>
            <p className="text-xs" style={{ color: 'var(--color-soft)' }}>{memories.filter(m => m.active).length} active memor{memories.filter(m => m.active).length !== 1 ? 'ies' : 'y'}</p>
          </div>
          <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-accent-4)' }} />
        </Link>
      </div>

      {/* ── AI Thought Partner Launchers ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Brain size={14} className="text-indigo-400" /> Choose Your AI Thought Partner
          </h2>
          <span className="text-xs text-indigo-400 font-medium">5 Cognitive Frameworks</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PERSONA_LAUNCHERS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => startPersonaSession(p.id)}
                className="bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-white/20 rounded-xl p-3.5 text-left transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center mb-2.5 text-white shadow-md`}>
                    <Icon size={16} />
                  </div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {p.label}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                    {p.text}
                  </p>
                </div>
                <span className="text-[10px] text-indigo-400 font-semibold mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Launch <ArrowRight size={10} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Journal Sessions', value: sessions.length, icon: MessageSquare, color: 'var(--color-accent-1)' },
          { label: 'Structured Insights', value: insights.length, icon: Lightbulb, color: 'var(--color-accent-3)' },
          { label: 'Vault Memories', value: memories.length, icon: Database, color: 'var(--color-accent-4)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-5 text-center">
            <Icon size={20} className="mx-auto mb-2" style={{ color }} />
            <p className="text-3xl font-bold" style={{ color: 'var(--color-white)' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-soft)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Recent Sessions ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-white)' }}>Recent Thinking Sessions</h2>
          <Link to="/journal" className="text-sm font-medium" style={{ color: 'var(--color-accent-1)' }}>
            View all
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Sparkles size={32} className="mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--color-bright)' }}>No sessions yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-soft)' }}>Start your first thinking session with Gemini</p>
            <Link to="/journal" className="btn-primary">
              <Plus size={16} /> New Session
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session, i) => (
              <Link
                key={session.id}
                to={`/journal?session=${session.id}`}
                className="glass glass-hover rounded-xl p-4 flex items-center gap-4 transition-all duration-200 animate-slide-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                     style={{ background: 'var(--color-surface)' }}>
                  <MessageSquare size={16} style={{ color: 'var(--color-accent-1)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-bright)' }}>
                    {session.title}
                  </p>
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                    <Clock size={10} />
                    {new Date(session.updatedAt || session.createdAt).toLocaleDateString()} · {session.messageCount || 0} messages
                  </p>
                </div>
                {session.summary && (
                  <span className="badge badge-success text-[10px]">Summarized</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
