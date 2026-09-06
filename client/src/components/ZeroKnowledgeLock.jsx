import { useState } from 'react';
import { Lock, Unlock, Key, ShieldCheck, X } from 'lucide-react';

export default function ZeroKnowledgeLock({ isEnabled, onToggle, passphrase, setPassphrase }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tempPass, setTempPass] = useState('');

  const handleActivate = (e) => {
    e.preventDefault();
    if (!tempPass.trim()) return;
    setPassphrase(tempPass.trim());
    onToggle(true);
    setModalOpen(false);
  };

  const handleDeactivate = () => {
    setPassphrase('');
    onToggle(false);
    setModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        title={isEnabled ? 'Zero-Knowledge AES-256 Encryption Active' : 'Enable Client-Side Encryption'}
        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
          isEnabled
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
            : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
        }`}
      >
        {isEnabled ? <Lock size={13} className="text-emerald-400" /> : <Unlock size={13} />}
        <span>{isEnabled ? 'Vault Locked (AES-256)' : 'Zero-Knowledge Lock'}</span>
      </button>

      {/* Passphrase Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Client-Side Encryption</h3>
                  <p className="text-[11px] text-gray-400">AES-256-GCM Zero-Knowledge</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              When enabled, your thoughts are encrypted directly in your browser with PBKDF2 & AES-256 before transmission. Only someone with your passphrase can decrypt it.
            </p>

            {isEnabled ? (
              <div className="space-y-3">
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <Lock size={14} /> Active encryption key in memory
                </div>
                <button
                  onClick={handleDeactivate}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors"
                >
                  Disable Zero-Knowledge Encryption
                </button>
              </div>
            ) : (
              <form onSubmit={handleActivate} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Set Private Vault Passphrase
                  </label>
                  <input
                    type="password"
                    value={tempPass}
                    onChange={(e) => setTempPass(e.target.value)}
                    placeholder="Enter your secret passphrase..."
                    className="input-field text-xs py-2.5"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!tempPass.trim()}
                  className="btn-primary w-full justify-center py-2.5 text-xs"
                >
                  <Key size={14} /> Enable & Lock Vault
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
