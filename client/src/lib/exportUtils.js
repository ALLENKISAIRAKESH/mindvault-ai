/**
 * MindVault AI — Executive Export & Report Generator
 */

/**
 * Trigger browser file download for text/markdown content.
 */
export function downloadFile(filename, content, mimeType = 'text/markdown') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format a journal session as clean Markdown.
 */
export function formatSessionMarkdown(session) {
  if (!session) return '';

  const dateStr = session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Recent';
  let md = `# 🧠 MindVault AI — Journal Session: ${session.title || 'Untitled Session'}\n\n`;
  md += `**Date:** ${dateStr}  \n`;
  md += `**Total Messages:** ${session.messages?.length || 0}  \n\n`;
  md += `---\n\n`;

  if (session.summary) {
    md += `## 📋 Session Summary\n\n${session.summary}\n\n---\n\n`;
  }

  md += `## 💬 Transcript\n\n`;

  (session.messages || []).forEach((msg) => {
    const speaker = msg.role === 'user' ? '👤 **You**' : '🤖 **MindVault AI (Gemini)**';
    const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : '';
    md += `### ${speaker} *(${time})*\n\n${msg.content}\n\n`;
  });

  md += `\n---\n*Exported securely from MindVault AI — Privacy-First Cognitive Space*\n`;
  return md;
}

/**
 * Format structured insights into an Executive Brief report.
 */
export function formatExecutiveBrief(insights, userName = 'User') {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `# 🏛️ MindVault AI — Executive Intelligence Brief\n\n`;
  md += `**Author / Thinker:** ${userName}  \n`;
  md += `**Generated Date:** ${today}  \n`;
  md += `**Classification:** Confidential & Private  \n\n`;
  md += `---\n\n`;

  // Goals
  if (insights?.goals?.length > 0) {
    md += `## 🎯 Strategic Goals & Objectives\n\n`;
    insights.goals.forEach((goal, i) => {
      md += `### ${i + 1}. ${goal.title}\n`;
      md += `${goal.description || 'No detailed description provided.'}\n\n`;
    });
    md += `---\n\n`;
  }

  // Decisions
  if (insights?.decisions?.length > 0) {
    md += `## ⚖️ Key Decisions & Rationales\n\n`;
    insights.decisions.forEach((dec, i) => {
      md += `### ${i + 1}. ${dec.title}\n`;
      md += `> **Rationale:** ${dec.description || 'Not specified'}\n\n`;
    });
    md += `---\n\n`;
  }

  // Actions
  if (insights?.actions?.length > 0) {
    md += `## ⚡ Action Items & Execution Queue\n\n`;
    insights.actions.forEach((act, i) => {
      const priorityBadge = (act.priority || 'medium').toUpperCase();
      md += `- [ ] **[${priorityBadge}]** ${act.title}\n`;
    });
    md += `\n---\n\n`;
  }

  // Patterns
  if (insights?.patterns?.length > 0) {
    md += `## 🔍 Behavioral & Strategic Patterns Observed\n\n`;
    insights.patterns.forEach((pat, i) => {
      md += `### ${i + 1}. ${pat.title}\n`;
      md += `*Evidence:* ${pat.evidence || 'Observed across thinking sessions'}\n\n`;
    });
    md += `---\n\n`;
  }

  md += `*Report compiled automatically by MindVault AI with Gemini 2.0 Flash.*  \n`;
  return md;
}

/**
 * Trigger print dialog for formatted PDF output.
 */
export function printFormattedBrief(markdownContent, title = 'Executive Brief') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate printable PDF reports.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1a202c;
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
          }
          h1 { color: #2b6cb0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
          h2 { color: #2d3748; margin-top: 24px; border-bottom: 1px solid #edf2f7; padding-bottom: 6px; }
          h3 { color: #4a5568; margin-top: 16px; }
          blockquote { border-left: 4px solid #4299e1; margin: 0; padding-left: 16px; color: #4a5568; background: #ebf8ff; padding: 8px 12px; border-radius: 4px; }
          hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
          pre { background: #f7fafc; padding: 12px; border-radius: 6px; overflow-x: auto; }
          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div style="white-space: pre-wrap; font-family: inherit;">${markdownContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
