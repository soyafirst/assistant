import React, { useState } from 'react';
import { ApiSettings } from '../types';
import { X, Key, ShieldCheck, Zap, Cpu, Server, Check, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSave: (updated: ApiSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<ApiSettings>(settings);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#262523] border border-[#3d3b37] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#363430]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#d97706]/15 text-[#f59e0b]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f5f4ef]">Configuration des Moteurs &amp; Clés API</h2>
              <p className="text-xs text-[#a8a29e]">Aiguillage bi-moteur : Gratuit ultra-rapide + Claude pour la réflexion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#a8a29e] hover:text-[#f5f4ef] rounded-md hover:bg-[#33312e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mode d'aiguillage */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#d4cfc5]">
              Mode d'aiguillage IA
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, routingMode: 'auto' })}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-all ${
                  formData.routingMode === 'auto'
                    ? 'bg-[#d97706]/15 border-[#d97706] text-[#f59e0b]'
                    : 'bg-[#21201e] border-[#383632] text-[#a8a29e] hover:border-[#4d4a45]'
                }`}
              >
                <Zap className="w-4 h-4 mb-1" />
                <span className="font-medium">Automatique</span>
                <span className="text-[10px] text-[#78716c] text-center mt-0.5">Routeur IA intelligent</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, routingMode: 'fast_free' })}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-all ${
                  formData.routingMode === 'fast_free'
                    ? 'bg-[#10b981]/15 border-[#10b981] text-[#34d399]'
                    : 'bg-[#21201e] border-[#383632] text-[#a8a29e] hover:border-[#4d4a45]'
                }`}
              >
                <Cpu className="w-4 h-4 mb-1" />
                <span className="font-medium">100% Rapide</span>
                <span className="text-[10px] text-[#78716c] text-center mt-0.5">Groq / Gemini Flash</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, routingMode: 'claude_complex' })}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-all ${
                  formData.routingMode === 'claude_complex'
                    ? 'bg-[#d97706]/15 border-[#d97706] text-[#f59e0b]'
                    : 'bg-[#21201e] border-[#383632] text-[#a8a29e] hover:border-[#4d4a45]'
                }`}
              >
                <Server className="w-4 h-4 mb-1" />
                <span className="font-medium">100% Claude</span>
                <span className="text-[10px] text-[#78716c] text-center mt-0.5">Sonnet &amp; Raisonnement</span>
              </button>
            </div>
            <p className="text-[11px] text-[#78716c]">
              En mode Automatique, le routeur détecte vos actions système et requêtes simples pour une exécution gratuite instantanée, et bascule vers Claude pour le code complexe et l'analyse fine.
            </p>
          </div>

          {/* Section 1: Groq API Key (Free tier) */}
          <div className="p-4 rounded-lg bg-[#201f1d] border border-[#33312e] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                  GRATUIT
                </span>
                <h3 className="text-sm font-semibold text-[#f5f4ef]">Moteur Rapide (Groq Cloud)</h3>
              </div>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#d97706] hover:underline flex items-center gap-1"
              >
                Obtenir une clé <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-xs text-[#a8a29e] mb-1">Clé API Groq</label>
              <div className="relative">
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  placeholder="gsk_..."
                  value={formData.groqApiKey}
                  onChange={(e) => setFormData({ ...formData, groqApiKey: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#181716] border border-[#3b3935] rounded-md text-[#e8e6df] focus:outline-none focus:border-[#d97706] pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  className="absolute right-2 top-2 text-[#78716c] hover:text-[#d6d3cd]"
                >
                  {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-[#78716c] mt-1 block">
                Modèle utilisé : <code>llama-3.3-70b-versatile</code> (latence &lt; 200 ms).
              </span>
            </div>
          </div>

          {/* Section 2: Claude API (Anthropic / Custom Proxy) */}
          <div className="p-4 rounded-lg bg-[#201f1d] border border-[#33312e] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#d97706]/20 text-[#f59e0b]">
                  RÉFLEXION COMPLEXE
                </span>
                <h3 className="text-sm font-semibold text-[#f5f4ef]">Moteur Claude (Anthropic / Proxy)</h3>
              </div>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#d97706] hover:underline flex items-center gap-1"
              >
                Console Anthropic <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#a8a29e] mb-1">Clé API Claude (Anthropic)</label>
                <div className="relative">
                  <input
                    type={showClaudeKey ? 'text' : 'password'}
                    placeholder="sk-ant-api03-..."
                    value={formData.claudeApiKey}
                    onChange={(e) => setFormData({ ...formData, claudeApiKey: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#181716] border border-[#3b3935] rounded-md text-[#e8e6df] focus:outline-none focus:border-[#d97706] pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClaudeKey(!showClaudeKey)}
                    className="absolute right-2 top-2 text-[#78716c] hover:text-[#d6d3cd]"
                  >
                    {showClaudeKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#a8a29e] mb-1">
                  Custom Base URL (Proxy / OpenRouter / Anthropic Direct)
                </label>
                <input
                  type="text"
                  placeholder="https://api.anthropic.com/v1"
                  value={formData.claudeBaseUrl}
                  onChange={(e) => setFormData({ ...formData, claudeBaseUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#181716] border border-[#3b3935] rounded-md text-[#e8e6df] focus:outline-none focus:border-[#d97706]"
                />
                <span className="text-[11px] text-[#78716c] mt-1 block">
                  Exemples : <code>https://api.anthropic.com/v1</code> ou <code>https://openrouter.ai/api/v1</code>
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 text-xs text-[#78716c]">
            <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
            <span>
              Vos clés API sont stockées uniquement dans le stockage local sécurisé de votre navigateur et ne sont jamais partagées à des tiers.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#a8a29e] hover:text-[#f5f4ef] rounded-lg hover:bg-[#33312e] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#d97706] hover:bg-[#b45309] rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Enregistré !
                </>
              ) : (
                'Enregistrer les paramètres'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
