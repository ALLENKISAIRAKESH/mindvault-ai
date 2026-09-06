import { useState } from 'react';
import { Sparkles, Sun, Moon, Volume2, X, Brain, Target, Zap, CheckCircle } from 'lucide-react';
import VoiceNarrationButton from './VoiceNarrationButton';

export default function DailyDigestModal({ isOpen, onClose, insights, memories = [], userName = 'Thinker' }) {
  const [timeOfDay, setTimeOfDay] = useState('morning'); // 'morning' | 'evening'

  if (!isOpen) return null;

  const topGoal = insights?.goals?.[0]?.title || 'Advance core technical & strategic priorities';
  const topDecision = insights?.decisions?.[0]?.title || 'Maintain high velocity on critical architecture';
  const topAction = insights?.actions?.[0]?.title || 'Review roadmap milestones and eliminate friction';
  const activeMemory = memories.find((m) => m.active)?.text || 'Focus on high-leverage execution';

  const briefingText =
    timeOfDay === 'morning'
      ? `Good morning, ${userName}. Here is your MindVault cognitive briefing for today. Your primary strategic goal is "${topGoal}". Keep in mind your active conviction: "${activeMemory}". Your highest urgency action item today is "${topAction}". Remember: eliminate unnecessary complexity and execute with clarity.`
      : `Good evening, ${userName}. Reflecting on today's momentum. You solidified the decision on "${topDecision}". Your active trajectory remains aligned with "${topGoal}". Take a moment to wind down, acknowledge your decision velocity, and prepare a calm foundation for tomorrow.`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden space-y-5">
        {/* Background glow orb */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily Cognitive Briefing</h3>
              <p className="text-xs text-gray-400">AI-synthesized morning & evening focus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Time of Day Switcher */}
        <div className="flex bg-slate-950/80 border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setTimeOfDay('morning')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              timeOfDay === 'morning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sun size={13} className="text-amber-400" /> Morning Clarity
          </button>
          <button
            onClick={() => setTimeOfDay('evening')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              timeOfDay === 'evening'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Moon size={13} className="text-indigo-400" /> Evening Reflection
          </button>
        </div>

        {/* Synthesized Briefing Card */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4.5 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1">
              <Brain size={12} /> Gemini Audio Synthesis
            </span>
            <VoiceNarrationButton text={briefingText} />
          </div>
          <p className="text-xs text-gray-200 leading-relaxed italic">
            "{briefingText}"
          </p>
        </div>

        {/* Key Anchor Highlights */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
            <span className="text-[10px] text-emerald-400 font-semibold block uppercase">Core Goal</span>
            <p className="text-white font-medium truncate mt-0.5">{topGoal}</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
            <span className="text-[10px] text-amber-400 font-semibold block uppercase">Urgent Action</span>
            <p className="text-white font-medium truncate mt-0.5">{topAction}</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="btn-primary w-full justify-center py-2.5 text-xs"
        >
          <CheckCircle size={14} /> Ready to Execute
        </button>
      </div>
    </div>
  );
}
