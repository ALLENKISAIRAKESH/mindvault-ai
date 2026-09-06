import { useEffect, useRef, useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Target, GitBranch, Zap, TrendingUp, Database, MessageSquare } from 'lucide-react';

const NODE_COLORS = {
  root: '#6366f1', // Indigo
  session: '#3b82f6', // Blue
  goal: '#10b981', // Emerald
  decision: '#f59e0b', // Amber
  action: '#a855f7', // Purple
  pattern: '#ec4899', // Rose
  memory: '#06b6d4', // Cyan
};

export default function KnowledgeGraph({ insights, sessions = [], memories = [] }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDraggingCanvas = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const draggedNode = useRef(null);
  const animationFrameId = useRef(null);

  // Construct graph nodes & links from all user data
  const { nodes, links } = useMemo(() => {
    const nodeList = [
      { id: 'root', label: 'MindVault Core', type: 'root', radius: 24, x: 0, y: 0, vx: 0, vy: 0 },
    ];
    const linkList = [];

    // Add sessions
    (sessions || []).slice(0, 6).forEach((s, idx) => {
      const angle = (idx / 6) * Math.PI * 2;
      const dist = 140;
      const nodeId = `session-${s.id}`;
      nodeList.push({
        id: nodeId,
        label: s.title?.substring(0, 24) || 'Session',
        fullText: s.title,
        type: 'session',
        radius: 16,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
      });
      linkList.push({ source: 'root', target: nodeId });
    });

    // Add goals
    (insights?.goals || []).forEach((g, idx) => {
      const angle = ((idx + 0.5) / Math.max(insights.goals.length, 1)) * Math.PI * 2;
      const dist = 240;
      const nodeId = `goal-${idx}`;
      nodeList.push({
        id: nodeId,
        label: g.title?.substring(0, 22) || 'Goal',
        description: g.description,
        type: 'goal',
        radius: 14,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
      });
      linkList.push({ source: 'root', target: nodeId });
    });

    // Add decisions
    (insights?.decisions || []).forEach((d, idx) => {
      const angle = ((idx + 2) / Math.max(insights.decisions.length, 1)) * Math.PI * 2;
      const dist = 280;
      const nodeId = `dec-${idx}`;
      nodeList.push({
        id: nodeId,
        label: d.title?.substring(0, 22) || 'Decision',
        description: d.description,
        type: 'decision',
        radius: 13,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
      });
      linkList.push({ source: 'root', target: nodeId });
    });

    // Add memories
    (memories || []).slice(0, 8).forEach((m, idx) => {
      const angle = ((idx + 4) / 8) * Math.PI * 2;
      const dist = 320;
      const nodeId = `mem-${m.id || idx}`;
      nodeList.push({
        id: nodeId,
        label: m.text?.substring(0, 22) || 'Memory',
        fullText: m.text,
        type: 'memory',
        radius: 12,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
      });
      linkList.push({ source: 'root', target: nodeId });
    });

    return { nodes: nodeList, links: linkList };
  }, [insights, sessions, memories]);

  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Physics animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updatePhysicsAndRender = () => {
      const currentNodes = nodesRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Force-directed repulsion between nodes
      for (let i = 0; i < currentNodes.length; i++) {
        for (let j = i + 1; j < currentNodes.length; j++) {
          const a = currentNodes[i];
          const b = currentNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = a.radius + b.radius + 35;

          if (dist < 350) {
            const force = (minDist * 40) / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (a !== draggedNode.current && a.id !== 'root') {
              a.x -= fx;
              a.y -= fy;
            }
            if (b !== draggedNode.current && b.id !== 'root') {
              b.x += fx;
              b.y += fy;
            }
          }
        }
      }

      // Spring attraction along links
      links.forEach((link) => {
        const source = currentNodes.find((n) => n.id === link.source);
        const target = currentNodes.find((n) => n.id === link.target);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 180;
        const spring = (dist - targetDist) * 0.008;

        const fx = (dx / dist) * spring;
        const fy = (dy / dist) * spring;

        if (target !== draggedNode.current && target.id !== 'root') {
          target.x -= fx;
          target.y -= fy;
        }
      });

      // Render scene
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
      ctx.scale(zoom, zoom);

      // Draw links
      links.forEach((link) => {
        const source = currentNodes.find((n) => n.id === link.source);
        const target = currentNodes.find((n) => n.id === link.target);
        if (!source || !target) return;

        const grad = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
        grad.addColorStop(0, NODE_COLORS[source.type] + '66');
        grad.addColorStop(1, NODE_COLORS[target.type] + '22');

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw nodes
      currentNodes.forEach((node) => {
        const color = NODE_COLORS[node.type] || '#6366f1';
        const isSelected = selectedNode?.id === node.id;

        // Glow ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected ? 8 : 4), 0, Math.PI * 2);
        ctx.fillStyle = color + (isSelected ? '55' : '22');
        ctx.fill();

        // Solid Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = isSelected ? 15 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Label
        ctx.font = node.id === 'root' ? 'bold 12px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 14);
      });

      ctx.restore();
      animationFrameId.current = requestAnimationFrame(updatePhysicsAndRender);
    };

    animationFrameId.current = requestAnimationFrame(updatePhysicsAndRender);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [links, zoom, offset, selectedNode]);

  // Canvas Mouse Interactions (Pan & Node Drag)
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - canvas.width / 2 - offset.x) / zoom;
    const mouseY = (e.clientY - rect.top - canvas.height / 2 - offset.y) / zoom;

    // Check if clicked a node
    const clicked = nodesRef.current.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clicked) {
      draggedNode.current = clicked;
      setSelectedNode(clicked);
    } else {
      isDraggingCanvas.current = true;
      dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
      setSelectedNode(null);
    }
  };

  const handleMouseMove = (e) => {
    if (draggedNode.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      draggedNode.current.x = (e.clientX - rect.left - canvas.width / 2 - offset.x) / zoom;
      draggedNode.current.y = (e.clientY - rect.top - canvas.height / 2 - offset.y) / zoom;
    } else if (isDraggingCanvas.current) {
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    draggedNode.current = null;
    isDraggingCanvas.current = false;
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  return (
    <div className="relative w-full h-[580px] bg-slate-950/70 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col">
      {/* Top Legend Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-gray-300">Sessions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-gray-300">Goals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-gray-300">Decisions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span className="text-gray-300">Memories</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/90 border border-white/10 p-1.5 rounded-xl backdrop-blur-md">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
          title="Zoom In"
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
          title="Zoom Out"
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          title="Reset Position"
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={580}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-white/15 p-4 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in flex items-start justify-between gap-4 z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}
              />
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                {selectedNode.type}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white">
              {selectedNode.fullText || selectedNode.label}
            </h4>
            {selectedNode.description && (
              <p className="text-xs text-gray-300 max-w-2xl">{selectedNode.description}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-white/5 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
