import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

export default function VoiceRecorder({ onTranscript, isGenerating }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          currentInterim += transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
      setInterimText(currentInterim);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech Recognition is not supported by your browser. Try Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText('');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  if (!isSupported) {
    return (
      <button
        type="button"
        title="Voice dictation unavailable in this browser"
        className="p-2.5 text-gray-500 rounded-xl hover:bg-white/5 transition-colors cursor-not-allowed"
        disabled
      >
        <MicOff className="w-5 h-5 opacity-40" />
      </button>
    );
  }

  return (
    <div className="relative flex items-center">
      {/* Visualizer Pulsing Ring */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={isGenerating}
        title={isListening ? 'Click to stop voice recording' : 'Click to dictate with voice'}
        className={`relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
          isListening
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/20 animate-pulse'
            : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10'
        }`}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="w-5 h-5 text-red-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          </div>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Floating Live Speech Preview */}
      {isListening && (
        <div className="absolute bottom-full mb-3 left-0 right-0 max-w-sm bg-slate-900/95 border border-red-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md z-50 animate-fade-in text-xs">
          <div className="flex items-center gap-2 text-red-400 font-medium mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Listening to stream of consciousness...
          </div>
          <p className="text-gray-300 italic min-h-[1.5rem]">
            {interimText || 'Speak freely — Gemini will transcribe in real-time...'}
          </p>
        </div>
      )}
    </div>
  );
}
