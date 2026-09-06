import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import KnowledgeGraph from '../components/KnowledgeGraph';
import CognitiveAnalytics from '../components/CognitiveAnalytics';
import ActionMatrix from '../components/ActionMatrix';
import VoiceNarrationButton from '../components/VoiceNarrationButton';
import { formatExecutiveBrief, downloadFile, printFormattedBrief } from '../lib/exportUtils';
import {
  Lightbulb,
  Target,
  GitBranch,
  Zap,
  TrendingUp,
  Calendar,
  LayoutGrid,
  Network,
  BarChart3,
  Download,
  Printer,
  ChevronDown,
} from 'lucide-react';

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'graph' | 'analytics'
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [resInsights, resSessions, resMemories] = await Promise.all([
          api.getInsights().catch(() => ({ insights: [] })),
          api.getSessions().catch(() => ({ sessions: [] })),
          api.getMemories().catch(() => ({ memories: [] })),
        ]);
        setInsights(resInsights.insights || []);
        setSessions(resSessions.sessions || []);
        setMemories(resMemories.memories || []);
      } catch (err) {
        console.error('Failed to load insights data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Synthesizing intelligence..." />;

  // Aggregate items across all insight records
  const allGoals = insights.flatMap((i) =>
    (i.goals || []).map((g) => ({ ...g, date: i.createdAt }))
  );
  const allDecisions = insights.flatMap((i) =>
    (i.decisions || []).map((d) => ({ ...d, date: i.createdAt }))
  );
  const allActions = insights.flatMap((i) =>
    (i.actions || []).map((a) => ({ ...a, date: i.createdAt }))
  );
  const allPatterns = insights.flatMap((i) =>
    (i.patterns || []).map((p) => ({ ...p, date: i.createdAt }))
  );

  const aggregatedInsights = {
    goals: allGoals,
    decisions: allDecisions,
    actions: allActions,
    patterns: allPatterns,
  };

  const tabs = [
    {
      key: 'all',
      label: 'All',
      count:
        allGoals.length +
        allDecisions.length +
        allActions.length +
        allPatterns.length,
    },
    {
      key: 'goals',
      label: 'Goals',
      icon: Target,
      count: allGoals.length,
      color: 'var(--color-accent-5)',
    },
    {
      key: 'decisions',
      label: 'Decisions',
      icon: GitBranch,
      count: allDecisions.length,
      color: 'var(--color-accent-3)',
    },
    {
      key: 'actions',
      label: 'Actions',
      icon: Zap,
      count: allActions.length,
      color: 'var(--color-warning)',
    },
    {
      key: 'patterns',
      label: 'Patterns',
      icon: TrendingUp,
      count: allPatterns.length,
      color: 'var(--color-accent-1)',
    },
  ];

  const handleExportBrief = () => {
    const md = formatExecutiveBrief(aggregatedInsights);
    downloadFile('mindvault-executive-brief.md', md);
    setExportOpen(false);
  };

  const handlePrintBrief = () => {
    const md = formatExecutiveBrief(aggregatedInsights);
    printFormattedBrief(md, 'MindVault Executive Brief');
    setExportOpen(false);
  };

  function renderItems(items, type) {
    if (items.length === 0)
      return (
        <p className="text-sm py-4" style={{ color: 'var(--color-muted)' }}>
          None found yet
        </p>
      );
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="glass rounded-xl p-4 animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <h4
                className="text-sm font-semibold"
                style={{ color: 'var(--color-bright)' }}
              >
                {item.title}
              </h4>
              {item.priority && (
                <span
                  className={`badge text-[10px] shrink-0 ${
                    item.priority === 'high'
                      ? 'badge-danger'
                      : item.priority === 'medium'
                      ? 'badge-warning'
                      : 'badge-info'
                  }`}
                >
                  {item.priority}
                </span>
              )}
            </div>
            {(item.description || item.evidence) && (
              <p
                className="text-xs mt-2 leading-relaxed"
                style={{ color: 'var(--color-soft)' }}
              >
                {item.description || item.evidence}
              </p>
            )}
            {item.date && (
              <p
                className="text-[10px] mt-2 flex items-center gap-1"
                style={{ color: 'var(--color-muted)' }}
              >
                <Calendar size={9} /> {new Date(item.date).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--color-white)' }}
          >
            Cognitive Insights & Mind Graph
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-soft)' }}>
            Structured knowledge, relational maps, and clarity analytics extracted from your thinking sessions
          </p>
        </div>

        {/* View Switcher & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={13} /> Cards
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Zap size={13} /> Action Matrix
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'graph'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Network size={13} /> Mind Graph
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'analytics'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 size={13} /> Analytics
            </button>
          </div>

          {/* Executive Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Download size={13} /> Brief <ChevronDown size={11} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1.5 z-30 animate-fade-in text-xs">
                <button
                  onClick={handleExportBrief}
                  className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <Download size={13} /> Markdown Brief (.md)
                </button>
                <button
                  onClick={handlePrintBrief}
                  className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <Printer size={13} /> Printable / PDF Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No insights yet"
          description="Start a journal session and use the Summarize button to extract goals, decisions, actions, and patterns."
        />
      ) : (
        <>
          {/* VIEW 1: INTERACTIVE MIND GRAPH */}
          {viewMode === 'graph' && (
            <KnowledgeGraph
              insights={aggregatedInsights}
              sessions={sessions}
              memories={memories}
            />
          )}

          {/* VIEW 2: ACTION MATRIX (KANBAN) */}
          {viewMode === 'matrix' && (
            <ActionMatrix actions={allActions} />
          )}

          {/* VIEW 3: COGNITIVE ANALYTICS */}
          {viewMode === 'analytics' && (
            <CognitiveAnalytics
              insights={aggregatedInsights}
              sessions={sessions}
              memories={memories}
            />
          )}

          {/* VIEW 3: CATEGORIZED CARDS */}
          {viewMode === 'cards' && (
            <div className="space-y-6">
              {/* Category Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      background:
                        activeTab === tab.key
                          ? 'var(--color-surface)'
                          : 'transparent',
                      color:
                        activeTab === tab.key
                          ? 'var(--color-white)'
                          : 'var(--color-soft)',
                      border: `1px solid ${
                        activeTab === tab.key
                          ? 'var(--color-subtle)'
                          : 'transparent'
                      }`,
                    }}
                  >
                    {tab.icon && (
                      <tab.icon size={14} style={{ color: tab.color }} />
                    )}
                    {tab.label}
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: 'var(--color-deep)',
                        color: 'var(--color-muted)',
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sections */}
              {(activeTab === 'all' || activeTab === 'goals') &&
                allGoals.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h2
                        className="text-sm font-semibold mb-3 flex items-center gap-2"
                        style={{ color: 'var(--color-accent-5)' }}
                      >
                        <Target size={16} /> Goals
                      </h2>
                    )}
                    {renderItems(allGoals, 'goal')}
                  </div>
                )}
              {(activeTab === 'all' || activeTab === 'decisions') &&
                allDecisions.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h2
                        className="text-sm font-semibold mb-3 flex items-center gap-2"
                        style={{ color: 'var(--color-accent-3)' }}
                      >
                        <GitBranch size={16} /> Decisions
                      </h2>
                    )}
                    {renderItems(allDecisions, 'decision')}
                  </div>
                )}
              {(activeTab === 'all' || activeTab === 'actions') &&
                allActions.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h2
                        className="text-sm font-semibold mb-3 flex items-center gap-2"
                        style={{ color: 'var(--color-warning)' }}
                      >
                        <Zap size={16} /> Actions
                      </h2>
                    )}
                    {renderItems(allActions, 'action')}
                  </div>
                )}
              {(activeTab === 'all' || activeTab === 'patterns') &&
                allPatterns.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h2
                        className="text-sm font-semibold mb-3 flex items-center gap-2"
                        style={{ color: 'var(--color-accent-1)' }}
                      >
                        <TrendingUp size={16} /> Patterns
                      </h2>
                    )}
                    {renderItems(allPatterns, 'pattern')}
                  </div>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
