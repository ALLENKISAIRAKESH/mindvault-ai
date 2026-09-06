import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) return action;
    if (typeof action === 'object' && action.label && action.onClick) {
      return (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
             style={{ background: 'var(--color-surface)' }}>
          <Icon size={28} style={{ color: 'var(--color-muted)' }} />
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-bright)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm max-w-md mb-6" style={{ color: 'var(--color-soft)' }}>
          {description}
        </p>
      )}
      {renderAction()}
    </div>
  );
}
