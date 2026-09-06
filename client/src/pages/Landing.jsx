import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Brain, Shield, Sparkles, Lock, ArrowRight, Zap, Eye, Target } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-void)' }}>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
             style={{ background: 'radial-gradient(circle, var(--color-accent-1), transparent 70%)' }} />
        <div className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
             style={{ background: 'radial-gradient(circle, var(--color-accent-3), transparent 70%)' }} />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, var(--color-accent-1), var(--color-accent-3))' }}>
              <Brain size={22} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--color-white)' }}>MindVault AI</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Sign In</Link>
                <Link to="/login" className="btn-primary">Get Started <ArrowRight size={16} /></Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-20 pb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-wide uppercase"
               style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--color-accent-1)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <Lock size={12} /> Privacy-First AI Thinking
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span style={{ color: 'var(--color-white)' }}>Think privately.</span>
            <br />
            <span className="gradient-text">Understand deeply.</span>
          </h1>

          <p className="text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--color-soft)' }}>
            MindVault AI is your personal AI thinking space. Have meaningful conversations with Gemini,
            extract structured insights, and build a private knowledge system that grows with you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="btn-primary text-lg px-8 py-3 animate-pulse-glow">
              <Sparkles size={20} /> Start Thinking
            </Link>
            <a href="#features" className="btn-ghost text-lg px-8 py-3">
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 lg:px-12" style={{ borderTop: '1px solid var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--color-white)' }}>
            Not just another chatbot.
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-soft)' }}>
            MindVault converts conversations into structured personal knowledge.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {[
            { icon: '💭', label: 'Think' },
            { icon: '🗣️', label: 'Talk' },
            { icon: '🧠', label: 'Remember' },
            { icon: '🔍', label: 'Understand' },
            { icon: '⚡', label: 'Act' },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl mb-1">{step.icon}</div>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-bright)' }}>{step.label}</span>
              {i < 4 && <div className="hidden md:block text-lg" style={{ color: 'var(--color-muted)' }}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 lg:px-12" style={{ backgroundColor: 'var(--color-abyss)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--color-white)' }}>
              Powered by Intelligence. Protected by Design.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Gemini Conversations',
                desc: 'Multi-turn conversations with Google Gemini that remember context across your entire session.',
                color: 'var(--color-accent-1)',
              },
              {
                icon: Target,
                title: 'Insight Extraction',
                desc: 'Automatically extract goals, decisions, action items, and patterns from your thinking sessions.',
                color: 'var(--color-accent-3)',
              },
              {
                icon: Brain,
                title: 'Private AI Memory',
                desc: 'Your AI remembers what matters to you — your goals, preferences, projects — all under your control.',
                color: 'var(--color-accent-4)',
              },
              {
                icon: Shield,
                title: 'Security-First Architecture',
                desc: 'Firebase Auth, server-side AI, Secret Manager, user-scoped data, prompt injection defenses.',
                color: 'var(--color-accent-5)',
              },
              {
                icon: Eye,
                title: 'Full Transparency',
                desc: 'Security Center shows exactly how your data is protected. No black boxes.',
                color: 'var(--color-warning)',
              },
              {
                icon: Zap,
                title: 'Your Data, Your Control',
                desc: 'View, manage, and delete your data anytime. Complete data sovereignty.',
                color: 'var(--color-danger)',
              },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={i}
                className="glass glass-hover rounded-2xl p-6 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: `${color}15` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-white)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-soft)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 lg:px-12 text-center" style={{ borderTop: '1px solid var(--color-surface)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: 'var(--color-white)' }}>
            Ready to think deeper?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--color-soft)' }}>
            Your private AI thinking space awaits. Sign in and start your first session.
          </p>
          <Link to="/login" className="btn-primary text-lg px-10 py-3.5">
            <Brain size={20} /> Launch MindVault AI
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 text-center text-xs" style={{ color: 'var(--color-muted)', borderTop: '1px solid var(--color-surface)' }}>
        <p>MindVault AI — Built for the Google Cloud Run Gen AI Academy Challenge</p>
        <p className="mt-1">Powered by Google Gemini · Firebase · Cloud Run</p>
      </footer>
    </div>
  );
}
