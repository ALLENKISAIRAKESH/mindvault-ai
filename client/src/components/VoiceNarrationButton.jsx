import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking, isSpeechSupported } from '../lib/speechSynthesis';

export default function VoiceNarrationButton({ text, className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const supported = isSpeechSupported();

  useEffect(() => {
    return () => {
      if (isPlaying) {
        stopSpeaking();
      }
    };
  }, [isPlaying]);

  if (!supported || !text) return null;

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(text, {
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      title={isPlaying ? 'Stop Voice Narration' : 'Read Aloud with Gemini Voice'}
      className={`p-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
        isPlaying
          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm animate-pulse'
          : 'text-gray-400 hover:text-white hover:bg-white/10'
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-indigo-400" />
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </>
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
