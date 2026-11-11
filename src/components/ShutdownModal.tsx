import React, { useState, useEffect } from 'react';
import { Moon, Power, RotateCcw, AlertTriangle, X, Check, Clock } from 'lucide-react';
import { SystemStatus } from '../types';

interface ShutdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (timerMinutes: number, action: 'shutdown' | 'restart' | 'sleep') => void;
  onCancelShutdown: () => void;
  activeShutdownTimer: SystemStatus['activeShutdownTimer'];
}

export const ShutdownModal: React.FC<ShutdownModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  onCancelShutdown,
  activeShutdownTimer,
}) => {
  const [selectedAction, setSelectedAction] = useState<'shutdown' | 'restart' | 'sleep'>('shutdown');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<string>('45');
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Sync remaining countdown
  useEffect(() => {
    if (activeShutdownTimer?.targetTimestamp) {
      const updateTime = () => {
        const diff = Math.max(0, Math.round((activeShutdownTimer.targetTimestamp - Date.now()) / 1000));
        setRemainingTime(diff);
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    } else {
      setRemainingTime(0);
    }
  }, [activeShutdownTimer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = selectedMinutes === -1 ? Math.max(1, parseInt(customMinutes, 10) || 1) : selectedMinutes;
    onSchedule(minutes, selectedAction);
    onClose();
  };

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#262523] border border-[#3d3b37] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#363430]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-500/15 text-indigo-400">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f5f4ef]">Gestion de l'Alimentation PC</h2>
              <p className="text-xs text-[#a8a29e]">Mode Nuit, minuterie d'extinction &amp; mise en veille</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#a8a29e] hover:text-[#f5f4ef] rounded-md hover:bg-[#33312e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Active Countdown Running */}
        {activeShutdownTimer && remainingTime > 0 && (
          <div className="p-4 mx-6 mt-4 rounded-lg bg-red-950/30 border border-red-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Extinction programmée en cours</span>
              </div>
              <span className="font-mono text-sm font-bold text-red-300 tabular-nums">
                {formatCountdown(remainingTime)}
              </span>
            </div>
            <p className="text-[11px] text-[#d6d3cd]">
              Votre ordinateur s'éteindra automatiquement à l'échéance du compte à rebours.
            </p>
            <button
              type="button"
              onClick={() => {
                onCancelShutdown();
                onClose();
              }}
              className="w-full py-1.5 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
            >
              Annuler l'extinction programmée
            </button>
          </div>
        )}

        {/* Schedule Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Action Choice */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#d4cfc5]">
              Action système souhaitée
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAction('shutdown')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-all ${
                  selectedAction === 'shutdown'
                    ? 'bg-red-500/15 border-red-500 text-red-400'
                    : 'bg-[#201f1d] border-[#383632] text-[#a8a29e] hover:border-[#4d4a45]'
                }`}
              >
                <Power className="w-4 h-4 mb-1" />
                <span className="font-medium">Éteindre</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('sleep')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-all ${
                  selectedAction === 'sleep'
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300'
                    : 'bg-[#201f1d] border-[#383632] text-[#a8a29e] hover:border-[#4d4a45]'
                }`}
              >
                <Moon className="w-4 h-4 mb-1" />
                <span className="font-medium">Veille</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('restart')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-all ${
                  selectedAction === 'restart'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                    : 'bg-[#201f1d] border-[#383632] text-[#a8a29e] hover:border-[#4d4a45]'
                }`}
              >
                <RotateCcw className="w-4 h-4 mb-1" />
                <span className="font-medium">Redémarrer</span>
              </button>
            </div>
          </div>

          {/* Delay / Timer selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#d4cfc5]">
              Délai avant exécution
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Immédiat', mins: 0 },
                { label: '15 min', mins: 15 },
                { label: '30 min', mins: 30 },
                { label: '60 min', mins: 60 },
              ].map((opt) => (
                <button
                  key={opt.mins}
                  type="button"
                  onClick={() => setSelectedMinutes(opt.mins)}
                  className={`py-2 px-1 text-xs rounded-lg border font-medium transition-all ${
                    selectedMinutes === opt.mins
                      ? 'bg-[#d97706]/15 border-[#d97706] text-[#f59e0b]'
                      : 'bg-[#201f1d] border-[#383632] text-[#a8a29e] hover:border-[#4d4a45]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom option */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedMinutes(-1)}
                className={`py-1.5 px-3 text-xs rounded-lg border font-medium transition-all ${
                  selectedMinutes === -1
                    ? 'bg-[#d97706]/15 border-[#d97706] text-[#f59e0b]'
                    : 'bg-[#201f1d] border-[#383632] text-[#a8a29e]'
                }`}
              >
                Personnalisé :
              </button>
              <input
                type="number"
                min="1"
                max="720"
                value={customMinutes}
                onChange={(e) => {
                  setCustomMinutes(e.target.value);
                  setSelectedMinutes(-1);
                }}
                className="w-24 px-2 py-1 text-xs bg-[#181716] border border-[#383632] rounded text-[#e8e6df] focus:outline-none focus:border-[#d97706] font-mono"
              />
              <span className="text-xs text-[#78716c]">minutes</span>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 rounded-lg bg-[#201f1d] border border-[#33312e] flex items-start gap-2.5 text-xs text-[#a8a29e]">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Pensez à sauvegarder vos travaux en cours. Vous recevrez une notification de rappel avant l'arrêt effectif.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#a8a29e] hover:text-[#f5f4ef] rounded-lg hover:bg-[#33312e] transition-colors"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#d97706] hover:bg-[#b45309] rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Valider la programmation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
