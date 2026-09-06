import { useAuth } from '../hooks/useAuth';
import { Shield, User, Trash2, Download } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-white)' }}>Settings</h1>

      {/* Profile */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-white)' }}>
          <User size={18} /> Profile
        </h2>
        <div className="flex items-center gap-4 mb-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-16 h-16 rounded-2xl" />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                 style={{ background: 'var(--color-surface)', color: 'var(--color-accent-1)' }}>
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-bright)' }}>{user?.displayName || 'User'}</p>
            <p className="text-sm" style={{ color: 'var(--color-soft)' }}>{user?.email}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              UID: {user?.uid?.substring(0, 12)}...
            </p>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-white)' }}>
          <Shield size={18} /> Account
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-surface)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-bright)' }}>Authentication Provider</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-surface)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-bright)' }}>Email Verified</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {user?.emailVerified ? 'Yes' : 'No'}
              </p>
            </div>
            <span className={`badge text-[10px] ${user?.emailVerified ? 'badge-success' : 'badge-warning'}`}>
              {user?.emailVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-bright)' }}>Account Created</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Controls */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-white)' }}>
          <Trash2 size={18} /> Data Controls
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-soft)' }}>
          All your data is stored under your user ID and can be managed from the respective pages.
        </p>
        <div className="space-y-2">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            • Sessions and messages: Manage from <strong>AI Journal</strong>
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            • Memories: Manage from <strong>Memory</strong> page
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            • Insights: Generated from sessions, deletable with session
          </p>
        </div>
      </div>

      {/* Sign Out */}
      <div className="glass rounded-2xl p-6">
        <button onClick={logout} className="btn-danger">
          Sign Out
        </button>
      </div>
    </div>
  );
}
