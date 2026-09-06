import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Target,
  GitBranch,
  Zap,
  TrendingUp,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function SessionSummary() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const sessionRes = await api.getSession(id);
        setSession(sessionRes.session);

        // Load insights
        const insightsRes = await api.getInsights();
        const sessionInsight = (insightsRes.insights || []).find((i) => i.sessionId === id);
        setInsight(sessionInsight || null);
      } catch (err) {
        setError('Failed to load session summary');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" text="Loading summary..." />;
  if (error) return <div className="text-center py-16" style={{ color: 'var(--color-danger)' }}>{error}</div>;
  if (!session) return <div className="text-center py-16" style={{ color: 'var(--color-soft)' }}>Session not found</div>;

  const sections = [
    { key: 'goals', label: 'Goals Identified', icon: Target, color: 'var(--color-accent-5)', items: insight?.goals },
    { key: 'decisions', label: 'Decisions Made', icon: GitBranch, color: 'var(--color-accent-3)', items: insight?.decisions },
    { key: 'actions', label: 'Action Items', icon: Zap, color: 'var(--color-warning)', items: insight?.actions },
    { key: 'patterns', label: 'Patterns Observed', icon: TrendingUp, color: 'var(--color-accent-1)', items: insight?.patterns },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/journal" className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--color-soft)' }}>
        <ArrowLeft size={16} /> Back to Journal
      </Link>

      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, var(--color-accent-1), var(--color-accent-3))' }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-white)' }}>Session Insights</h1>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{session.title}</p>
          </div>
        </div>

        {/* Summary */}
        {(session.summary || insight?.summary) && (
          <div className="rounded-xl p-4" style={{ background: 'var(--color-deep)', border: '1px solid var(--color-subtle)' }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} style={{ color: 'var(--color-accent-4)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent-4)' }}>Summary</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
              {insight?.summary || session.summary}
            </p>
          </div>
        )}
      </div>

      {/* Insight Sections */}
      {insight ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map(({ key, label, icon: Icon, color, items }) => (
            <div key={key} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon size={18} style={{ color }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-white)' }}>{label}</h3>
                <span className="badge badge-info text-[10px] ml-auto">{items?.length || 0}</span>
              </div>
              {!items || items.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>None identified</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: 'var(--color-deep)' }}>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium" style={{ color: 'var(--color-bright)' }}>
                          {item.title}
                        </h4>
                        {item.priority && (
                          <span className={`badge text-[10px] ${
                            item.priority === 'high' ? 'badge-danger' :
                            item.priority === 'medium' ? 'badge-warning' : 'badge-info'
                          }`}>
                            {item.priority}
                          </span>
                        )}
                      </div>
                      {(item.description || item.evidence) && (
                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-soft)' }}>
                          {item.description || item.evidence}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p style={{ color: 'var(--color-soft)' }}>No insights generated yet for this session.</p>
          <Link to={`/journal?session=${id}`} className="btn-primary mt-4 inline-flex">
            <Sparkles size={16} /> Go to Session
          </Link>
        </div>
      )}
    </div>
  );
}
