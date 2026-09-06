import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search as SearchIcon, MessageSquare, Database, Lightbulb } from 'lucide-react';

const TYPE_CONFIG = {
  session: { icon: MessageSquare, color: 'var(--color-accent-1)', label: 'Session' },
  memory: { icon: Database, color: 'var(--color-accent-4)', label: 'Memory' },
  insight: { icon: Lightbulb, color: 'var(--color-accent-3)', label: 'Insight' },
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api
      .search(query)
      .then((res) => setResults(res.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  const allResults = results
    ? [...(results.sessions || []), ...(results.memories || []), ...(results.insights || [])]
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-white)' }}>
        Search Results
      </h1>
      {query && (
        <p className="text-sm" style={{ color: 'var(--color-soft)' }}>
          Showing results for "<span style={{ color: 'var(--color-accent-1)' }}>{query}</span>"
        </p>
      )}

      {loading ? (
        <LoadingSpinner size="md" text="Searching your vault..." />
      ) : !query ? (
        <EmptyState icon={SearchIcon} title="Enter a search query" description="Use the search bar above to find sessions, memories, and insights." />
      ) : allResults.length === 0 ? (
        <EmptyState icon={SearchIcon} title="No results found" description={`No matches for "${query}" in your sessions, memories, or insights.`} />
      ) : (
        <div className="space-y-3">
          {allResults.map((item, i) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.session;
            const Icon = config.icon;
            return (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.type === 'session' ? `/journal?session=${item.id}` : item.type === 'insight' ? `/session/${item.sessionId}/summary` : '/memory'}
                className="glass glass-hover rounded-xl p-4 flex items-center gap-3 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${i * 40}ms`, display: 'flex' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                     style={{ background: `${config.color}15` }}>
                  <Icon size={16} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-bright)' }}>
                    {item.title || item.text || item.summary?.substring(0, 100) || 'Untitled'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {config.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
