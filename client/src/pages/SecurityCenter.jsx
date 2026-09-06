import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Shield,
  CheckCircle,
  Lock,
  Server,
  Key,
  Database,
  Eye,
  AlertTriangle,
  Fingerprint,
  Gauge,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

const ICON_MAP = {
  'Firebase Authentication': Fingerprint,
  'Server-side Gemini': Server,
  'Secret Manager Integration': Key,
  'User-scoped Firestore': Database,
  'Backend Token Verification': Lock,
  'HTTPS Enforcement': ShieldCheck,
  'Prompt Injection Defenses': AlertTriangle,
  'Sensitive Data Logging Protection': Eye,
  'Rate Limiting': Gauge,
  'Input Validation': FileCheck,
  'Safe Error Handling': Shield,
  'Request Size Limits': FileCheck,
};

export default function SecurityCenter() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getSecurityStatus();
        setStatus(res);
      } catch (err) {
        console.error('Failed to load security status:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading security status..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-[80px]"
             style={{ background: 'var(--color-accent-5)' }} />

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, var(--color-accent-5), var(--color-accent-4))' }}>
            <Shield size={28} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-white)' }}>Security Center</h1>
            <p className="text-sm" style={{ color: 'var(--color-soft)' }}>
              Real-time application security posture
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                 style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
                {status?.overall === 'secure' ? 'All Checks Passed' : 'Review Required'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-white)' }}>Security Architecture</h2>
        <div className="rounded-xl p-4 font-mono text-xs leading-relaxed" style={{ background: 'var(--color-deep)', color: 'var(--color-accent-4)' }}>
          <pre>{`Browser (React)
   │
   │ Firebase ID Token (Authorization: Bearer ...)
   ▼
Cloud Run (Express.js)
   ├── Helmet (Security Headers)
   ├── Rate Limiter (express-rate-limit)
   ├── Auth Middleware (Firebase Admin SDK → verifyIdToken)
   │      └── req.user.uid = VERIFIED identity
   ├── Zod Validation (all inputs + Gemini outputs)
   ├── Route Handlers
   │      └── All Firestore ops scoped to users/{verified_uid}/...
   ├── Gemini Service
   │      ├── API Key from Secret Manager (never in browser)
   │      ├── System prompts separated from user content
   │      └── Prompt injection defenses
   └── Structured Logging (pino, secrets redacted)`}</pre>
        </div>
      </div>

      {/* Security Checks Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-white)' }}>Security Checks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(status?.checks || []).map((check, i) => {
            const IconComponent = ICON_MAP[check.name] || Shield;
            return (
              <div
                key={i}
                className="glass glass-hover rounded-xl p-4 flex items-start gap-3 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                     style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <IconComponent size={18} style={{ color: 'var(--color-success)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-bright)' }}>{check.name}</h3>
                    <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-soft)' }}>{check.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Firestore Data Model */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-white)' }}>Data Isolation Model</h2>
        <div className="rounded-xl p-4 font-mono text-xs leading-loose" style={{ background: 'var(--color-deep)', color: 'var(--color-text)' }}>
          <span style={{ color: 'var(--color-accent-5)' }}>users/</span><span style={{ color: 'var(--color-accent-1)' }}>{'{'}<span style={{ color: 'var(--color-warning)' }}>verified_uid</span>{'}'}</span><br/>
          <span className="pl-4">├── <span style={{ color: 'var(--color-accent-4)' }}>profile</span></span><br/>
          <span className="pl-4">├── <span style={{ color: 'var(--color-accent-4)' }}>settings</span></span><br/>
          <span className="pl-4">├── <span style={{ color: 'var(--color-accent-4)' }}>sessions/</span><span style={{ color: 'var(--color-muted)' }}>{'{'}</span>sessionId<span style={{ color: 'var(--color-muted)' }}>{'}'}</span></span><br/>
          <span className="pl-8">└── <span style={{ color: 'var(--color-accent-4)' }}>messages/</span><span style={{ color: 'var(--color-muted)' }}>{'{'}</span>messageId<span style={{ color: 'var(--color-muted)' }}>{'}'}</span></span><br/>
          <span className="pl-4">├── <span style={{ color: 'var(--color-accent-4)' }}>insights/</span><span style={{ color: 'var(--color-muted)' }}>{'{'}</span>insightId<span style={{ color: 'var(--color-muted)' }}>{'}'}</span></span><br/>
          <span className="pl-4">├── <span style={{ color: 'var(--color-accent-4)' }}>memories/</span><span style={{ color: 'var(--color-muted)' }}>{'{'}</span>memoryId<span style={{ color: 'var(--color-muted)' }}>{'}'}</span></span><br/>
          <span className="pl-4">└── <span style={{ color: 'var(--color-accent-4)' }}>securityEvents/</span><span style={{ color: 'var(--color-muted)' }}>{'{'}</span>eventId<span style={{ color: 'var(--color-muted)' }}>{'}'}</span></span>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--color-muted)' }}>
          Every document path is derived from the Firebase-verified UID. Cross-user access is impossible by construction.
        </p>
      </div>

      {/* Timestamp */}
      {status?.timestamp && (
        <p className="text-xs text-center" style={{ color: 'var(--color-muted)' }}>
          Last checked: {new Date(status.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}
