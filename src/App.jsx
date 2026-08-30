import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneOff, AlertTriangle, Bell, Volume2, HelpCircle, Settings,
  Menu, X, Plus, Trash2, Play, Pause, Square, Home as HomeIcon,
  Info, RotateCcw, MapPin,
  Heart, ShieldCheck, Check, Sun, Minus,
  CalendarDays, Stethoscope, UserRound, Mic, MicOff
} from 'lucide-react';

/* ---------------------------------------------------------------
   THEME TOKENS
   Two full palettes (normal + high contrast). Every color used in
   the app is driven from these CSS custom properties so that
   High Contrast Mode genuinely restyles the interface rather than
   just inverting a filter.
----------------------------------------------------------------*/
const THEME_VARS = {
  normal: {
    '--bg': '#F5F7F2',
    '--surface': '#FFFFFF',
    '--surface-alt': '#ECF1E8',
    '--ink': '#1E2A22',
    '--ink-soft': '#45564B',
    '--primary': '#3F6650',
    '--primary-dark': '#2E4C3B',
    '--on-primary': '#FFFFFF',
    '--accent': '#E1A83E',
    '--accent-dark': '#B8862B',
    '--on-accent': '#20160A',
    '--danger': '#C1483A',
    '--danger-dark': '#9A392E',
    '--on-danger': '#FFFFFF',
    '--border': '#D8DFD2',
    '--focus': '#2F5D8A',
  },
  contrast: {
    '--bg': '#000000',
    '--surface': '#0A0A0A',
    '--surface-alt': '#161616',
    '--ink': '#FFFFFF',
    '--ink-soft': '#F2F2F2',
    '--primary': '#FFD54A',
    '--primary-dark': '#FFE98A',
    '--on-primary': '#000000',
    '--accent': '#7CF29C',
    '--accent-dark': '#A6FFC1',
    '--on-accent': '#000000',
    '--danger': '#FF6B57',
    '--danger-dark': '#FF9B8C',
    '--on-danger': '#000000',
    '--border': '#FFFFFF',
    '--focus': '#66D9FF',
  },
};

const FONT_SCALES = { normal: 125, large: 145, xlarge: 170 };
const SCALE_ORDER = ['normal', 'large', 'xlarge'];
const SCALE_LABEL = { normal: 'Standard', large: 'Large', xlarge: 'Extra Large' };

/* ---------------------------------------------------------------
   SMALL HELPERS
----------------------------------------------------------------*/
function formatReminderWhen(dateStr, timeStr) {
  if (!dateStr || !timeStr) return '';
  const d = new Date(`${dateStr}T${timeStr}`);
  if (isNaN(d.getTime())) return '';
  const dateText = d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const timeText = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${dateText} at ${timeText}`;
}

function useReducedMotionPreference() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefers(mq.matches);
    const handler = (e) => setPrefers(e.matches);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
    };
  }, []);
  return prefers;
}

/* ---------------------------------------------------------------
   PRIMITIVE UI PIECES
----------------------------------------------------------------*/
function Button({
  as: Comp = motion.button,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  reducedMotion,
  style,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-3 rounded-2xl font-bold border-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    md: 'text-2xl px-8 py-6 min-h-[76px]',
    lg: 'text-3xl px-10 py-7 min-h-[88px]',
    sm: 'text-xl px-6 py-5 min-h-[64px]',
  };
  const variants = {
    primary:
      'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] hover:bg-[var(--primary-dark)] hover:border-[var(--primary-dark)]',
    accent:
      'bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)] hover:bg-[var(--accent-dark)] hover:border-[var(--accent-dark)]',
    danger:
      'bg-[var(--danger)] text-[var(--on-danger)] border-[var(--danger)] hover:bg-[var(--danger-dark)] hover:border-[var(--danger-dark)]',
    outline:
      'bg-[var(--surface)] text-[var(--ink)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]',
    ghost:
      'bg-transparent text-[var(--ink)] border-transparent hover:bg-[var(--surface-alt)]',
  };
  const motionProps = reducedMotion
    ? {}
    : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } };
  return (
    <Comp
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={{ outlineColor: 'var(--focus)', ...style }}
      {...motionProps}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" size={size === 'lg' ? 30 : size === 'sm' ? 24 : 26} strokeWidth={2.3} /> : null}
      <span>{children}</span>
    </Comp>
  );
}

function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-[var(--surface)] border-2 border-[var(--border)] rounded-3xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle, center }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <p className="font-body font-bold tracking-wide uppercase text-[var(--primary)] text-lg mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display font-bold text-[var(--ink)] text-4xl sm:text-5xl leading-tight mb-5">
        {title}
      </h2>
      {subtitle && (
        <p className={`font-body text-[var(--ink-soft)] text-2xl leading-relaxed ${center ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full gap-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] px-6 py-6 min-h-[72px] focus-visible:outline focus-visible:outline-4"
      style={{ outlineColor: 'var(--focus)' }}
    >
      <span className="font-body font-bold text-xl text-[var(--ink)] text-left">{label}</span>
      <span
        className="relative inline-flex h-11 w-20 shrink-0 items-center rounded-full border-2 transition-colors"
        style={{
          backgroundColor: checked ? 'var(--primary)' : 'var(--surface-alt)',
          borderColor: checked ? 'var(--primary)' : 'var(--border)',
        }}
      >
        <span
          className="inline-block h-9 w-9 transform rounded-full bg-[var(--surface)] shadow transition-transform flex items-center justify-center text-[10px] font-bold"
          style={{ transform: checked ? 'translateX(34px)' : 'translateX(2px)' }}
        >
          {checked ? <Check size={18} color="var(--primary)" /> : null}
        </span>
      </span>
      <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      <span aria-hidden="true" className="font-body font-bold text-lg w-12 text-right text-[var(--ink-soft)]">
        {checked ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}

function LeaveBar({ onLeave, reducedMotion, label = 'Leave' }) {
  const motionProps = reducedMotion ? {} : { whileHover: { scale: 1.01 }, whileTap: { scale: 0.98 } };
  return (
    <motion.button
      onClick={onLeave}
      aria-label={`${label} this page and go back to Home`}
      className="w-full flex items-center justify-center gap-4 rounded-2xl mb-8 min-h-[100px] font-body font-extrabold text-3xl sm:text-4xl border-2 focus-visible:outline focus-visible:outline-4"
      style={{
        backgroundColor: 'var(--danger)',
        borderColor: 'var(--danger)',
        color: 'var(--on-danger)',
        outlineColor: 'var(--focus)',
      }}
      {...motionProps}
    >
      <HomeIcon size={40} aria-hidden="true" />
      <span>{label}</span>
    </motion.button>
  );
}

function PrototypeBanner({ text }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border-2 px-6 py-5 font-body font-bold text-lg"
      style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--surface-alt)', color: 'var(--ink)' }}
      role="note"
    >
      <Info size={22} style={{ color: 'var(--accent-dark)' }} aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

/* ---------------------------------------------------------------
   ACCESSIBILITY SETTINGS PANEL
----------------------------------------------------------------*/
function AccessibilityPanel({ settings, updateSettings, resetSettings, reducedMotion, goHome }) {
  const scaleIndex = SCALE_ORDER.indexOf(settings.fontScale);
  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <h3 className="font-display font-bold text-2xl text-[var(--ink)] mb-1">Text Size</h3>
        <p className="font-body text-[var(--ink-soft)] text-xl mb-5">
          Current size: <span className="font-bold text-[var(--ink)]">{SCALE_LABEL[settings.fontScale]}</span>
        </p>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            icon={Minus}
            reducedMotion={reducedMotion}
            aria-label="Decrease text size"
            disabled={scaleIndex === 0}
            onClick={() => updateSettings({ fontScale: SCALE_ORDER[Math.max(0, scaleIndex - 1)] })}
          >
            Smaller
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            reducedMotion={reducedMotion}
            aria-label="Increase text size"
            disabled={scaleIndex === SCALE_ORDER.length - 1}
            onClick={() =>
              updateSettings({ fontScale: SCALE_ORDER[Math.min(SCALE_ORDER.length - 1, scaleIndex + 1)] })
            }
          >
            Bigger
          </Button>
        </div>
      </Card>

      <Card className="p-6 sm:p-8 space-y-4">
        <h3 className="font-display font-bold text-2xl text-[var(--ink)] mb-1">Display</h3>
        <Toggle
          id="toggle-contrast"
          checked={settings.highContrast}
          onChange={(v) => updateSettings({ highContrast: v })}
          label="High Contrast Mode"
        />
        <Toggle
          id="toggle-motion"
          checked={settings.reducedMotion}
          onChange={(v) => updateSettings({ reducedMotion: v })}
          label="Reduce Motion"
        />
      </Card>

      <Button variant="ghost" icon={RotateCcw} reducedMotion={reducedMotion} onClick={resetSettings} className="w-full">
        Reset to Default Settings
      </Button>

      <LeaveBar onLeave={goHome} reducedMotion={reducedMotion} />
    </div>
  );
}

/* ---------------------------------------------------------------
   DEMO CALL MODAL (used by Family + Emergency)
----------------------------------------------------------------*/
function CallModal({ contact, onClose, reducedMotion }) {
  const [phase, setPhase] = useState('calling'); // calling -> connected -> ended
  useEffect(() => {
    if (phase === 'calling') {
      const t = setTimeout(() => setPhase('connected'), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Demo call with ${contact.name}`}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        className="w-full max-w-sm rounded-3xl border-2 p-8 text-center"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div
          className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-display font-bold"
          style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--primary)' }}
          aria-hidden="true"
        >
          {contact.initials}
        </div>
        <h3 className="font-display font-bold text-2xl text-[var(--ink)]">{contact.name}</h3>
        <p className="font-body text-[var(--ink-soft)] text-xl mb-1">{contact.relation}</p>
        <p aria-live="polite" className="font-body font-bold text-xl mb-6" style={{ color: 'var(--primary)' }}>
          {phase === 'calling' && 'Calling…'}
          {phase === 'connected' && 'Connected'}
          {phase === 'ended' && 'Call ended'}
        </p>

        {phase !== 'ended' ? (
          <Button
            variant="danger"
            size="lg"
            icon={PhoneOff}
            reducedMotion={reducedMotion}
            className="w-full"
            onClick={() => setPhase('ended')}
          >
            {phase === 'calling' ? 'Cancel Call' : 'End Call'}
          </Button>
        ) : (
          <Button variant="primary" size="lg" reducedMotion={reducedMotion} className="w-full" onClick={onClose}>
            Close
          </Button>
        )}
        <p className="font-body text-sm text-[var(--ink-soft)] mt-5">
          This is a prototype demo. No real phone call is happening.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------
   VOICE MODAL ("Speak to EasyLife" prototype)
----------------------------------------------------------------*/
function VoiceModal({ onClose, reducedMotion }) {
  const SpeechRecognitionClass =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const supported = Boolean(SpeechRecognitionClass);

  const [status, setStatus] = useState(supported ? 'listening' : 'unsupported'); // listening | done | error | unsupported
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (!supported) return undefined;

    let recognition;
    try {
      recognition = new SpeechRecognitionClass();
    } catch (err) {
      setStatus('error');
      return undefined;
    }

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onerror = () => {
      setStatus('error');
    };
    recognition.onend = () => {
      if (statusRef.current === 'listening') setStatus('done');
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      setStatus('error');
    }

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch (err) {
        /* no-op: recognition may already be stopped */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  const handleStop = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        /* no-op */
      }
    }
    setStatus('done');
  };

  const handleTryAgain = () => {
    setTranscript('');
    setStatus('listening');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setStatus('error');
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Speak to EasyLife, voice assistant prototype"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        className="w-full max-w-sm rounded-3xl border-2 p-8 text-center"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div
          className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'var(--surface-alt)',
            color: status === 'error' || status === 'unsupported' ? 'var(--danger)' : 'var(--primary)',
          }}
          aria-hidden="true"
        >
          {status === 'error' || status === 'unsupported' ? <MicOff size={40} /> : <Mic size={40} />}
        </div>

        <h3 className="font-display font-bold text-2xl text-[var(--ink)] mb-1">Speak to EasyLife</h3>

        {status === 'unsupported' && (
          <p className="font-body text-xl text-[var(--ink-soft)] mb-6">
            Voice input is not supported in this browser yet. Please try a recent version of Chrome or Edge.
          </p>
        )}

        {status === 'error' && (
          <p className="font-body text-xl text-[var(--ink-soft)] mb-6">
            We could not hear you. Please check your microphone permission and try again.
          </p>
        )}

        {(status === 'listening' || status === 'done') && (
          <>
            <p aria-live="polite" className="font-body font-bold text-xl mb-4" style={{ color: 'var(--primary)' }}>
              {status === 'listening' ? 'Listening…' : 'Got it'}
            </p>
            <div
              aria-live="polite"
              className="min-h-[64px] rounded-2xl border-2 p-4 mb-6 font-body text-xl text-[var(--ink)] flex items-center justify-center"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
            >
              {transcript ? transcript : <span className="text-[var(--ink-soft)]">Say something…</span>}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3">
          {status === 'listening' && (
            <Button variant="danger" size="lg" icon={Square} reducedMotion={reducedMotion} className="w-full" onClick={handleStop}>
              Stop Listening
            </Button>
          )}
          {status === 'done' && (
            <Button variant="primary" size="lg" icon={Mic} reducedMotion={reducedMotion} className="w-full" onClick={handleTryAgain}>
              Try Again
            </Button>
          )}
          {(status === 'error' || status === 'unsupported') && supported && (
            <Button variant="primary" size="lg" icon={Mic} reducedMotion={reducedMotion} className="w-full" onClick={handleTryAgain}>
              Try Again
            </Button>
          )}
          <Button variant="outline" size="lg" reducedMotion={reducedMotion} className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>

        <p className="font-body text-sm text-[var(--ink-soft)] mt-5">
          This is a prototype demo. Voice commands are not yet connected to real actions in EasyLife.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------
   HOME VIEW — only the essential actions
----------------------------------------------------------------*/
function Home({ go, reducedMotion, quickActions, highContrast }) {
  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
      <SectionHeading center title="What would you like to do?" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.key}
            onClick={() => go(action.view)}
            aria-label={action.label}
            className="flex flex-col items-center justify-center gap-4 rounded-3xl p-6 sm:p-8 text-center min-h-[160px] sm:min-h-[180px] focus-visible:outline focus-visible:outline-4"
            style={
              highContrast
                ? {
                    backgroundColor: 'var(--surface)',
                    border: `3px solid ${action.color}`,
                    outlineColor: 'var(--focus)',
                  }
                : {
                    backgroundColor: action.color,
                    border: 'none',
                    outlineColor: 'var(--focus)',
                  }
            }
            whileHover={reducedMotion ? {} : { scale: 1.03 }}
            whileTap={reducedMotion ? {} : { scale: 0.96 }}
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reducedMotion ? 0 : i * 0.05 }}
          >
            <span
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center"
              style={{ color: highContrast ? action.color : '#FFFFFF' }}
              aria-hidden="true"
            >
              <action.icon size={44} strokeWidth={2.2} />
            </span>
            <span
              className="font-body font-bold text-lg sm:text-xl"
              style={{ color: highContrast ? 'var(--ink)' : '#FFFFFF' }}
            >
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   READ ALOUD VIEW
----------------------------------------------------------------*/
const SAMPLE_TEXTS = [
  {
    label: "Today's Weather",
    text: 'Good morning. Today will be mostly sunny with a gentle breeze. The high will be seventy-eight degrees, and it is a good day for a short walk outside.',
  },
  {
    label: 'Message from Priya',
    text: 'Hi Dad, just checking in. We will come by on Sunday around noon for lunch. Let me know if you need anything from the store before then.',
  },
  {
    label: 'Medicine Reminder',
    text: 'This is a reminder to take your morning medicine with breakfast. Your next appointment with Dr. Rao is on Thursday at ten in the morning.',
  },
];

function ReadAloudView({ reducedMotion, go }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [text, setText] = useState(SAMPLE_TEXTS[0].text);
  const [status, setStatus] = useState('idle'); // idle | speaking | paused
  const utteranceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const handleStart = () => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 1;
    utter.onend = () => setStatus('idle');
    utter.onerror = () => setStatus('idle');
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    setStatus('speaking');
  };

  const handlePauseResume = () => {
    if (!supported) return;
    if (status === 'speaking') {
      window.speechSynthesis.pause();
      setStatus('paused');
    } else if (status === 'paused') {
      window.speechSynthesis.resume();
      setStatus('speaking');
    }
  };

  const handleStop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setStatus('idle');
  };

  return (
    <ViewShell
      title="Have text read out loud to you."
      go={go}
      reducedMotion={reducedMotion}
      icon={Volume2}
      color="#2E6FBE"
    >
      {!supported && (
        <div className="mb-6">
          <PrototypeBanner text="Read Aloud is not supported in this browser. Try a recent version of Chrome, Edge, or Safari." />
        </div>
      )}

      <Card className="p-6 sm:p-8 mb-6">
        <label htmlFor="sample-select" className="sr-only">
          Choose something to read
        </label>
        <div className="flex flex-wrap gap-3 mb-6" id="sample-select">
          {SAMPLE_TEXTS.map((s) => (
            <button
              key={s.label}
              onClick={() => setText(s.text)}
              className="rounded-full border-2 px-6 py-4 font-body font-bold text-lg focus-visible:outline focus-visible:outline-4"
              style={{
                borderColor: text === s.text ? 'var(--primary)' : 'var(--border)',
                backgroundColor: text === s.text ? 'var(--surface-alt)' : 'var(--surface)',
                color: 'var(--ink)',
                outlineColor: 'var(--focus)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <label htmlFor="read-aloud-text" className="font-body font-bold text-xl text-[var(--ink)] mb-3 block">
          Or type your own text
        </label>
        <textarea
          id="read-aloud-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full rounded-2xl border-2 p-4 font-body text-xl leading-relaxed focus-visible:outline focus-visible:outline-4"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--ink)', outlineColor: 'var(--focus)' }}
        />

        <p aria-live="polite" className="font-body font-bold text-xl mt-5 mb-2" style={{ color: 'var(--primary)' }}>
          {status === 'idle' && 'Ready to read.'}
          {status === 'speaking' && 'Reading aloud…'}
          {status === 'paused' && 'Paused.'}
        </p>

        <div className="flex flex-wrap gap-4 mt-3">
          <Button
            variant="primary"
            size="lg"
            icon={Play}
            reducedMotion={reducedMotion}
            disabled={!supported || status === 'speaking'}
            onClick={handleStart}
            style={{ backgroundColor: '#2E6FBE', borderColor: '#2E6FBE', color: '#FFFFFF' }}
          >
            Read Aloud
          </Button>
          <Button
            variant="outline"
            size="lg"
            icon={status === 'paused' ? Play : Pause}
            reducedMotion={reducedMotion}
            disabled={!supported || status === 'idle'}
            onClick={handlePauseResume}
          >
            {status === 'paused' ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            icon={Square}
            reducedMotion={reducedMotion}
            disabled={!supported || status === 'idle'}
            onClick={handleStop}
          >
            Stop
          </Button>
        </div>
      </Card>
    </ViewShell>
  );
}

/* ---------------------------------------------------------------
   REMINDERS VIEW
----------------------------------------------------------------*/
const REMINDER_COLORS = ['#2F8F4E', '#2E6FBE', '#E0932B', '#8151C7', '#C1483A', '#1E9E92'];

function RemindersView({ reducedMotion, go }) {
  const [reminders, setReminders] = useState([
    { id: 'r1', title: 'Take morning medicine', date: nextDate(1), time: '08:00' },
    { id: 'r2', title: 'Call Dr. Rao for check-up', date: nextDate(3), time: '10:30' },
  ]);
  const [form, setForm] = useState({ title: '', date: '', time: '' });
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  function nextDate(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().slice(0, 10);
  }

  const sorted = useMemo(
    () =>
      [...reminders].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)),
    [reminders]
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time) {
      setError('Please fill in a title, date, and time.');
      return;
    }
    setError('');
    setReminders((prev) => [...prev, { id: `r${Date.now()}`, ...form, title: form.title.trim() }]);
    setForm({ title: '', date: '', time: '' });
  };

  return (
    <ViewShell
      title="Never miss what matters."
      go={go}
      reducedMotion={reducedMotion}
      icon={Bell}
      color="#E0932B"
    >
      <Card className="p-6 sm:p-8 mb-8">
        <h3 className="font-display font-bold text-2xl text-[var(--ink)] mb-5">Add a Reminder</h3>
        <form onSubmit={handleAdd} className="space-y-5" noValidate>
          <div>
            <label htmlFor="rem-title" className="font-body font-bold text-xl text-[var(--ink)] mb-2 block">
              Reminder title
            </label>
            <input
              id="rem-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Take blood pressure medicine"
              className="w-full rounded-2xl border-2 p-4 font-body text-xl focus-visible:outline focus-visible:outline-4"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--ink)', outlineColor: 'var(--focus)' }}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="rem-date" className="font-body font-bold text-xl text-[var(--ink)] mb-2 block">
                Date
              </label>
              <input
                id="rem-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-2xl border-2 p-4 font-body text-xl focus-visible:outline focus-visible:outline-4"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--ink)', outlineColor: 'var(--focus)' }}
              />
            </div>
            <div>
              <label htmlFor="rem-time" className="font-body font-bold text-xl text-[var(--ink)] mb-2 block">
                Time
              </label>
              <input
                id="rem-time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-2xl border-2 p-4 font-body text-xl focus-visible:outline focus-visible:outline-4"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--ink)', outlineColor: 'var(--focus)' }}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="font-body font-bold text-lg" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" icon={Plus} reducedMotion={reducedMotion}>
            Add Reminder
          </Button>
        </form>
      </Card>

      <h3 className="font-display font-bold text-2xl text-[var(--ink)] mb-5">Your Reminders</h3>
      {sorted.length === 0 ? (
        <Card className="p-8 text-center">
          <CalendarDays size={36} className="mx-auto mb-3" style={{ color: 'var(--ink-soft)' }} aria-hidden="true" />
          <p className="font-body text-xl text-[var(--ink-soft)]">
            You have no reminders yet. Add one above to get started.
          </p>
        </Card>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {sorted.map((r, idx) => {
              const reminderColor = REMINDER_COLORS[idx % REMINDER_COLORS.length];
              return (
                <motion.li
                  key={r.id}
                  layout={!reducedMotion}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? {} : { opacity: 0, x: -20 }}
                >
                  <Card
                    className="p-6 flex items-center justify-between gap-4 flex-wrap"
                    style={{ borderLeft: `8px solid ${reminderColor}` }}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: reminderColor, color: '#FFFFFF' }}
                        aria-hidden="true"
                      >
                        <Bell size={22} />
                      </span>
                      <div>
                        <p className="font-body font-bold text-xl text-[var(--ink)]">{r.title}</p>
                        <p className="font-body text-xl text-[var(--ink-soft)]">{formatReminderWhen(r.date, r.time)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      reducedMotion={reducedMotion}
                      aria-label={`Delete reminder: ${r.title}`}
                      onClick={() => setConfirmId(r.id)}
                    >
                      Delete
                    </Button>
                  </Card>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <AnimatePresence>
        {confirmId && (
          <ConfirmModal
            reducedMotion={reducedMotion}
            title="Delete this reminder?"
            body="This cannot be undone."
            onCancel={() => setConfirmId(null)}
            onConfirm={() => {
              setReminders((prev) => prev.filter((x) => x.id !== confirmId));
              setConfirmId(null);
            }}
          />
        )}
      </AnimatePresence>
    </ViewShell>
  );
}

function ConfirmModal({ title, body, onCancel, onConfirm, reducedMotion }) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-3xl border-2 p-7 text-center"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h3 className="font-display font-bold text-2xl text-[var(--ink)] mb-2">{title}</h3>
        <p className="font-body text-xl text-[var(--ink-soft)] mb-6">{body}</p>
        <div className="flex gap-3">
          <Button variant="outline" reducedMotion={reducedMotion} className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" reducedMotion={reducedMotion} className="flex-1" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------
   EMERGENCY VIEW
----------------------------------------------------------------*/
function EmergencyView({ reducedMotion, onCall, go }) {
  const emergencyContact = { name: 'Emergency Line', relation: 'Demo emergency number', initials: 'EL' };
  return (
    <ViewShell
      title="Get help right away."
      go={go}
      reducedMotion={reducedMotion}
      icon={AlertTriangle}
      color="var(--danger)"
    >
      <div className="mb-6">
        <PrototypeBanner text="Demo only — pressing Call does not dial a real emergency service." />
      </div>

      <Card className="p-8 sm:p-12 text-center mb-8" style={{ borderColor: 'var(--danger)', borderWidth: '4px' }}>
        <motion.div
          animate={
            reducedMotion
              ? {}
              : { boxShadow: ['0 0 0 0 rgba(193,72,58,0.55)', '0 0 0 20px rgba(193,72,58,0)'] }
          }
          transition={reducedMotion ? {} : { duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          className="block rounded-3xl"
        >
          <Button
            variant="danger"
            size="lg"
            icon={Phone}
            reducedMotion={reducedMotion}
            className="w-full text-3xl sm:text-4xl px-10 py-10 min-h-[140px]"
            onClick={() => onCall(emergencyContact)}
            style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)', color: 'var(--on-danger)' }}
          >
            Call for Emergency Help
          </Button>
        </motion.div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <MapPin size={24} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h4 className="font-display font-bold text-xl text-[var(--ink)]">Your Saved Location</h4>
          </div>
          <p className="font-body text-lg text-[var(--ink-soft)]">
            12 Maple Street, Home Address (demo information for this prototype).
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck size={24} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <h4 className="font-display font-bold text-xl text-[var(--ink)]">What Happens Next</h4>
          </div>
          <p className="font-body text-lg text-[var(--ink-soft)]">
            In a real version of EasyLife, this would call your chosen contact and share your location with them.
          </p>
        </Card>
      </div>
    </ViewShell>
  );
}

/* ---------------------------------------------------------------
   FAMILY CONTACTS VIEW
----------------------------------------------------------------*/
const FAMILY_CONTACTS = [
  { id: 'son', name: 'Michael', relation: 'Son', initials: 'M', icon: UserRound, color: '#2F6FBE' },
  { id: 'daughter', name: 'Priya', relation: 'Daughter', initials: 'P', icon: UserRound, color: '#C1483A' },
  { id: 'doctor', name: 'Dr. Anjali Rao', relation: 'Doctor', initials: 'AR', icon: Stethoscope, color: '#3F6650' },
  { id: 'caregiver', name: 'Grace', relation: 'Caregiver', initials: 'G', icon: Heart, color: '#B8862B' },
];

function FamilyView({ reducedMotion, onCall, go }) {
  return (
    <ViewShell
      title="The people you call most."
      go={go}
      reducedMotion={reducedMotion}
      icon={Phone}
      color="#2F8F4E"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        {FAMILY_CONTACTS.map((c) => (
          <Card key={c.id} className="p-7 flex items-center justify-between gap-5 flex-wrap">
            <div className="flex items-center gap-4">
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full font-display font-bold text-2xl"
                style={{ backgroundColor: 'var(--surface-alt)', color: c.color }}
                aria-hidden="true"
              >
                {c.initials}
              </span>
              <div>
                <p className="font-display font-bold text-2xl" style={{ color: c.color }}>{c.name}</p>
                <p className="font-body text-xl text-[var(--ink-soft)]">{c.relation}</p>
              </div>
            </div>
            <Button variant="primary" icon={Phone} reducedMotion={reducedMotion} onClick={() => onCall(c)}>
              Call
            </Button>
          </Card>
        ))}
      </div>
    </ViewShell>
  );
}

/* ---------------------------------------------------------------
   HELP VIEW
----------------------------------------------------------------*/
const HELP_TOPICS = [
  {
    icon: Phone,
    title: 'How to place a call',
    steps: [
      'Open Family Contacts from the menu.',
      'Find the person you want to call.',
      'Press the green Call button on their card.',
      'Press End Call when you are finished.',
    ],
  },
  {
    icon: Volume2,
    title: 'How to read something aloud',
    steps: [
      'Open Read Aloud from the menu.',
      'Choose a sample or type your own text.',
      'Press Read Aloud to start listening.',
      'Use Pause or Stop any time.',
    ],
  },
  {
    icon: Bell,
    title: 'How to set a reminder',
    steps: [
      'Open Reminders from the menu.',
      'Type a title for your reminder.',
      'Choose a date and time.',
      'Press Add Reminder to save it.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'How to get emergency help',
    steps: [
      'Open Emergency Help from the menu, or press I NEED HELP on the Home screen.',
      'Press the red Call for Emergency Help button.',
      'Stay on the screen until help responds.',
      'This prototype does not contact real services.',
    ],
  },
  {
    icon: Mic,
    title: 'How to speak to EasyLife',
    steps: [
      'Press the "Speak to EasyLife" button, visible on every screen.',
      'Allow microphone access if your browser asks.',
      'Speak clearly after you see "Listening…"',
      'This voice feature is a prototype and is not yet connected to real actions.',
    ],
  },
];

function HelpView({ go, reducedMotion }) {
  return (
    <ViewShell
      title="Simple instructions for every feature."
      go={go}
      reducedMotion={reducedMotion}
      icon={HelpCircle}
      color="#8151C7"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        {HELP_TOPICS.map((topic) => (
          <Card key={topic.title} className="p-7">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--primary)' }}
                aria-hidden="true"
              >
                <topic.icon size={24} />
              </span>
              <h3 className="font-display font-bold text-2xl text-[var(--ink)]">{topic.title}</h3>
            </div>
            <ol className="space-y-3">
              {topic.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 font-body text-xl text-[var(--ink-soft)]">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold text-sm mt-0.5"
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
    </ViewShell>
  );
}

/* ---------------------------------------------------------------
   SHARED VIEW WRAPPER
----------------------------------------------------------------*/
function ViewShell({ title, subtitle, children, go, reducedMotion, icon: Icon, color = 'var(--primary)' }) {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8 sm:py-10">
      <LeaveBar onLeave={() => go('home')} reducedMotion={reducedMotion} />

      <div className="flex flex-col items-center text-center mb-10">
        {Icon && (
          <span
            className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full mb-5"
            style={{ backgroundColor: color, color: '#FFFFFF' }}
            aria-hidden="true"
          >
            <Icon size={44} strokeWidth={2.2} />
          </span>
        )}
        <h2 className="font-display font-bold text-[var(--ink)] text-4xl sm:text-5xl leading-tight mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="font-body text-[var(--ink-soft)] text-2xl leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}

/* ---------------------------------------------------------------
   NAVIGATION
----------------------------------------------------------------*/
const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'family', label: 'Call Family', icon: Phone },
  { key: 'emergency', label: 'Emergency Help', icon: AlertTriangle },
  { key: 'reminders', label: 'Reminders', icon: Bell },
  { key: 'readaloud', label: 'Read Aloud', icon: Volume2 },
  { key: 'help', label: 'Help Me', icon: HelpCircle },
];

function Header({ view, go, onOpenSettings, reducedMotion }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleGo = (key) => {
    go(key);
    setMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b-2"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 min-h-[96px] flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => handleGo('home')}
          className="flex items-center gap-3 font-display font-bold text-2xl sm:text-3xl text-[var(--ink)] focus-visible:outline focus-visible:outline-4 rounded-xl px-2 py-1"
          style={{ outlineColor: 'var(--focus)' }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
            aria-hidden="true"
          >
            <Sun size={28} />
          </span>
          <span>EasyLife</span>
        </button>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => handleGo(item.key)}
              aria-current={view === item.key ? 'page' : undefined}
              className="flex items-center gap-2 rounded-xl px-4 py-3.5 font-body font-bold text-lg focus-visible:outline focus-visible:outline-4"
              style={{
                color: view === item.key ? 'var(--primary)' : 'var(--ink)',
                backgroundColor: view === item.key ? 'var(--surface-alt)' : 'transparent',
                outlineColor: 'var(--focus)',
              }}
            >
              <item.icon size={22} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenSettings}
            aria-label="Open accessibility settings"
            className="flex items-center gap-2 rounded-2xl border-2 px-4 py-3 sm:px-5 min-h-[64px] font-body font-bold text-base sm:text-lg focus-visible:outline focus-visible:outline-4"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)', outlineColor: 'var(--focus)' }}
          >
            <Settings size={26} aria-hidden="true" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex items-center gap-2 rounded-2xl border-2 px-4 py-3 sm:px-5 min-h-[64px] font-body font-bold text-base sm:text-lg lg:hidden focus-visible:outline focus-visible:outline-4"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)', outlineColor: 'var(--focus)' }}
          >
            <Menu size={26} aria-hidden="true" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            style={{ backgroundColor: 'var(--bg)' }}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="max-w-md mx-auto px-6 py-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <p className="font-display font-bold text-3xl text-[var(--ink)]">Menu</p>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex items-center gap-2 rounded-2xl border-2 px-4 py-3 min-h-[64px] font-body font-bold text-lg focus-visible:outline focus-visible:outline-4"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink)', outlineColor: 'var(--focus)' }}
                >
                  <X size={26} aria-hidden="true" />
                  <span>Close</span>
                </button>
              </div>
              <nav aria-label="Mobile" className="flex-1 space-y-4 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleGo(item.key)}
                    aria-current={view === item.key ? 'page' : undefined}
                    className="w-full flex items-center gap-5 rounded-2xl border-2 px-6 py-6 font-body font-bold text-2xl min-h-[72px] focus-visible:outline focus-visible:outline-4"
                    style={{
                      borderColor: view === item.key ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: view === item.key ? 'var(--surface-alt)' : 'var(--surface)',
                      color: 'var(--ink)',
                      outlineColor: 'var(--focus)',
                    }}
                  >
                    <item.icon size={30} aria-hidden="true" style={{ color: 'var(--primary)' }} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
----------------------------------------------------------------*/
export default function App() {
  const systemReducedMotion = useReducedMotionPreference();
  const [settings, setSettings] = useState({
    fontScale: 'normal',
    highContrast: false,
    reducedMotion: false,
  });
  const [view, setView] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    setSettings((s) => ({ ...s, reducedMotion: systemReducedMotion }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_SCALES[settings.fontScale]}%`;
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [settings.fontScale]);

  const updateSettings = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const resetSettings = useCallback(
    () => setSettings({ fontScale: 'normal', highContrast: false, reducedMotion: systemReducedMotion }),
    [systemReducedMotion]
  );

  const go = useCallback((key) => {
    if (key === 'settings') {
      setSettingsOpen(true);
      return;
    }
    setSettingsOpen(false);
    setView(key);
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const reducedMotion = settings.reducedMotion;

  const quickActions = useMemo(
    () => [
      { key: 'call', label: 'Call Family', icon: Phone, view: 'family', color: '#2F8F4E' },
      { key: 'emergency', label: 'Emergency Help', icon: AlertTriangle, view: 'emergency', color: '#D9463A' },
      { key: 'reminders', label: 'Reminders', icon: Bell, view: 'reminders', color: '#E0932B' },
      { key: 'read', label: 'Read Aloud', icon: Volume2, view: 'readaloud', color: '#2E6FBE' },
      { key: 'helpme', label: 'Help Me', icon: HelpCircle, view: 'help', color: '#8151C7' },
      { key: 'settings', label: 'Accessibility', icon: Settings, view: 'settings', color: '#1E9E92' },
    ],
    []
  );

  const themeVars = settings.highContrast ? THEME_VARS.contrast : THEME_VARS.normal;

  const pageTransition = reducedMotion
    ? { initial: {}, animate: {}, exit: {}, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25 } };

  return (
    <div
      style={{ ...themeVars, backgroundColor: 'var(--bg)', color: 'var(--ink)', minHeight: '100%' }}
      className="font-body"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Source+Serif+4:opsz,wght@8..60,600..800&display=swap');
        .font-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-body { font-family: 'Atkinson Hyperlegible', -apple-system, sans-serif; }
        html { scroll-behavior: ${reducedMotion ? 'auto' : 'smooth'}; }
        body { line-height: 1.6; }
        *:focus-visible { outline-offset: 3px; }
        ::selection { background: var(--accent); color: var(--on-accent); }
        button, a, input, textarea { line-height: 1.5; }
      `}</style>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:px-4 focus:py-3 font-body font-bold"
        style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
      >
        Skip to main content
      </a>

      <Header view={view} go={go} onOpenSettings={() => setSettingsOpen(true)} reducedMotion={reducedMotion} />

      <main id="main-content" ref={mainRef}>
        <AnimatePresence mode="wait">
          <motion.div key={view} {...pageTransition}>
            {view === 'home' && <Home go={go} reducedMotion={reducedMotion} quickActions={quickActions} highContrast={settings.highContrast} />}
            {view === 'readaloud' && <ReadAloudView reducedMotion={reducedMotion} go={go} />}
            {view === 'reminders' && <RemindersView reducedMotion={reducedMotion} go={go} />}
            {view === 'emergency' && <EmergencyView reducedMotion={reducedMotion} onCall={setActiveCall} go={go} />}
            {view === 'family' && <FamilyView reducedMotion={reducedMotion} onCall={setActiveCall} go={go} />}
            {view === 'help' && <HelpView go={go} reducedMotion={reducedMotion} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating "Speak to EasyLife" voice trigger — available on every screen */}
      <motion.button
        onClick={() => setVoiceOpen(true)}
        whileHover={reducedMotion ? {} : { scale: 1.03 }}
        whileTap={reducedMotion ? {} : { scale: 0.96 }}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex items-center gap-3 rounded-full px-6 py-5 min-h-[64px] font-body font-bold text-lg shadow-lg border-2 focus-visible:outline focus-visible:outline-4"
        style={{
          backgroundColor: 'var(--accent)',
          borderColor: 'var(--accent)',
          color: 'var(--on-accent)',
          outlineColor: 'var(--focus)',
        }}
        aria-label="Speak to EasyLife. Voice assistant prototype."
      >
        <Mic size={24} aria-hidden="true" />
        <span>Speak to EasyLife</span>
      </motion.button>

      {/* Accessibility Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Accessibility settings"
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={reducedMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border-2 p-6 sm:p-8"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-3xl text-[var(--ink)]">Accessibility Settings</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  aria-label="Close settings"
                  className="flex items-center gap-2 rounded-xl border-2 px-3 py-2 min-h-[48px] font-body font-bold text-base focus-visible:outline focus-visible:outline-4"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink)', outlineColor: 'var(--focus)' }}
                >
                  <X size={22} aria-hidden="true" />
                  <span>Close</span>
                </button>
              </div>
              <AccessibilityPanel
                settings={settings}
                updateSettings={updateSettings}
                resetSettings={resetSettings}
                reducedMotion={reducedMotion}
                goHome={() => {
                  setSettingsOpen(false);
                  go('home');
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCall && (
          <CallModal contact={activeCall} onClose={() => setActiveCall(null)} reducedMotion={reducedMotion} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {voiceOpen && <VoiceModal onClose={() => setVoiceOpen(false)} reducedMotion={reducedMotion} />}
      </AnimatePresence>
    </div>
  );
}
