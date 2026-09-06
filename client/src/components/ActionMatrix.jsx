import { useState } from 'react';
import { CheckCircle2, Circle, Zap, AlertTriangle, ArrowRight, Download, Filter } from 'lucide-react';
import { downloadFile } from '../lib/exportUtils';

export default function ActionMatrix({ actions = [] }) {
  const [completedMap, setCompletedMap] = useState({});

  const toggleComplete = (id) => {
    setCompletedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categorized = {
    high: [],
    medium: [],
    low: [],
    completed: [],
  };

  actions.forEach((act, idx) => {
    const actionId = act.id || `action-${idx}`;
    const item = { ...act, id: actionId };
    if (completedMap[actionId]) {
      categorized.completed.push(item);
    } else if (act.priority === 'high') {
      categorized.high.push(item);
    } else if (act.priority === 'low') {
      categorized.low.push(item);
    } else {
      categorized.medium.push(item);
    }
  });

  const totalActions = actions.length;
  const completedCount = categorized.completed.length;
  const progressPercent = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  const exportActionList = () => {
    let md = `# ⚡ MindVault AI — Execution Action Queue\n\n`;
    md += `**Progress:** ${completedCount} / ${totalActions} (${progressPercent}% Completed)\n\n---\n\n`;

    if (categorized.high.length > 0) {
      md += `## 🚨 High Urgency & Critical\n\n`;
      categorized.high.forEach((a) => (md += `- [ ] ${a.title}\n`));
      md += `\n`;
    }
    if (categorized.medium.length > 0) {
      md += `## 🎯 Strategic Momentum\n\n`;
      categorized.medium.forEach((a) => (md += `- [ ] ${a.title}\n`));
      md += `\n`;
    }
    if (categorized.low.length > 0) {
      md += `## ⚡ Quick Wins & Maintenance\n\n`;
      categorized.low.forEach((a) => (md += `- [ ] ${a.title}\n`));
      md += `\n`;
    }
    if (categorized.completed.length > 0) {
      md += `## ✅ Completed Milestones\n\n`;
      categorized.completed.forEach((a) => (md += `- [x] ${a.title}\n`));
      md += `\n`;
    }

    downloadFile('mindvault-action-queue.md', md);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress & Header */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Execution & Momentum Matrix
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Turn extracted conversation insights into concrete, trackable execution milestones.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-white">
              {completedCount} of {totalActions} Done
            </div>
            <div className="w-32 h-2 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={exportActionList}
            className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 shrink-0"
            title="Export actionable checklist"
          >
            <Download size={13} /> Export Tasks
          </button>
        </div>
      </div>

      {/* 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Column 1: Critical */}
        <div className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Critical Priority
            </span>
            <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-semibold">
              {categorized.high.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {categorized.high.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center py-6">No critical blockers</p>
            ) : (
              categorized.high.map((act) => (
                <div
                  key={act.id}
                  onClick={() => toggleComplete(act.id)}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-white/5 hover:border-red-500/30 p-3 rounded-xl cursor-pointer transition-all duration-200 group flex items-start gap-2.5 shadow-sm"
                >
                  <Circle className="w-4 h-4 text-gray-500 group-hover:text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-200 group-hover:text-white font-medium leading-relaxed">
                    {act.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Strategic */}
        <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Strategic Focus
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold">
              {categorized.medium.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {categorized.medium.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center py-6">Queue clear</p>
            ) : (
              categorized.medium.map((act) => (
                <div
                  key={act.id}
                  onClick={() => toggleComplete(act.id)}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-white/5 hover:border-amber-500/30 p-3 rounded-xl cursor-pointer transition-all duration-200 group flex items-start gap-2.5 shadow-sm"
                >
                  <Circle className="w-4 h-4 text-gray-500 group-hover:text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-200 group-hover:text-white font-medium leading-relaxed">
                    {act.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Quick Wins */}
        <div className="bg-slate-950/60 border border-blue-500/20 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Quick Wins
            </span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-semibold">
              {categorized.low.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {categorized.low.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center py-6">No quick tasks</p>
            ) : (
              categorized.low.map((act) => (
                <div
                  key={act.id}
                  onClick={() => toggleComplete(act.id)}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-white/5 hover:border-blue-500/30 p-3 rounded-xl cursor-pointer transition-all duration-200 group flex items-start gap-2.5 shadow-sm"
                >
                  <Circle className="w-4 h-4 text-gray-500 group-hover:text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-200 group-hover:text-white font-medium leading-relaxed">
                    {act.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 4: Completed */}
        <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
              {categorized.completed.length}
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {categorized.completed.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center py-6">Click tasks to mark done</p>
            ) : (
              categorized.completed.map((act) => (
                <div
                  key={act.id}
                  onClick={() => toggleComplete(act.id)}
                  className="bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl cursor-pointer transition-all duration-200 group flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-400 line-through font-medium leading-relaxed">
                    {act.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
