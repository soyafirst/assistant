import React, { useRef, useEffect } from 'react';
import { Message, Artifact, ApiSettings } from '../types';
import { MessageItem } from './MessageItem';
import { QuickActionsBar } from './QuickActionsBar';
import {
  Sparkles,
  Camera,
  Zap,
  FolderSync,
  Code2,
  PanelRight,
  Shield,
  Loader2,
  Terminal,
} from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onOpenArtifact: (artifact: Artifact) => void;
  onOpenShutdownModal: () => void;
  onCleanRam: () => void;
  onBoostNetwork: () => void;
  onTakeScreenshot: () => void;
  onCleanDownloads: () => void;
  isPerformingAction: string | null;
  settings: ApiSettings;
  activeArtifact: Artifact | null;
  onToggleArtifactPanel: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onOpenArtifact,
  onOpenShutdownModal,
  onCleanRam,
  onBoostNetwork,
  onTakeScreenshot,
  onCleanDownloads,
  isPerformingAction,
  settings,
  activeArtifact,
  onToggleArtifactPanel,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const starterPrompts = [
    {
      title: "Prendre une capture d'écran",
      desc: "Capture l'écran du PC et l'affiche dans les Artefacts",
      prompt: "Prends une capture d'écran de mon PC et analyse l'état du système",
      icon: Camera,
      color: 'text-cyan-400',
    },
    {
      title: 'Optimiser la mémoire vive (RAM)',
      desc: 'Purge les caches et libère les allocations inutiles',
      prompt: 'Vide la RAM de mon PC et indique-moi combien de mémoire a été libérée',
      icon: Zap,
      color: 'text-amber-400',
    },
    {
      title: 'Ranger les Téléchargements',
      desc: 'Classe automatiquement par Documents, Images, Archives, etc.',
      prompt: 'Range mon dossier de téléchargements par type de fichier',
      icon: FolderSync,
      color: 'text-indigo-400',
    },
    {
      title: 'Créer une interface HTML interactive',
      desc: 'Génère du code interactif prévisualisé en direct dans Artefacts',
      prompt: "Crée un dashboard interactif de monitoring PC moderne en HTML avec Tailwind et JavaScript complet pour l'artefact",
      icon: Code2,
      color: 'text-[#d97706]',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#1f1e1d]">
      {/* Top Bar */}
      <header className="h-13 px-4 border-b border-[#33312e] bg-[#22211f] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#f5f4ef]">
            OmniPC Assistant
          </span>
          <span className="text-xs text-[#78716c]">/</span>
          <span className="text-xs text-[#a8a29e] hidden sm:inline">
            Contrôle Système &amp; Aiguillage IA
          </span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1b1a] border border-[#33312e] text-[11px] text-[#a8a29e]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">
              {settings.routingMode === 'auto'
                ? 'Mode Auto (Bi-moteur)'
                : settings.routingMode === 'fast_free'
                ? 'Mode Rapide'
                : 'Mode Claude Sonnet'}
            </span>
          </div>

          <button
            onClick={onToggleArtifactPanel}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeArtifact
                ? 'bg-[#d97706]/15 border-[#d97706] text-[#f59e0b]'
                : 'bg-[#2b2a27] border-[#383632] text-[#a8a29e] hover:text-[#f5f4ef]'
            }`}
            title="Afficher/Masquer le panneau Artefacts"
          >
            <PanelRight className="w-4 h-4" />
            <span className="hidden sm:inline">Artefacts</span>
          </button>
        </div>
      </header>

      {/* Quick Actions Bar */}
      <QuickActionsBar
        onOpenShutdownModal={onOpenShutdownModal}
        onCleanRam={onCleanRam}
        onBoostNetwork={onBoostNetwork}
        onTakeScreenshot={onTakeScreenshot}
        onCleanDownloads={onCleanDownloads}
        isPerformingAction={isPerformingAction}
      />

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Claude-Style Welcome Screen */
          <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center text-center">
            {/* Claude-style warm monogram */}
            <div className="w-12 h-12 rounded-2xl bg-[#d97706]/15 border border-[#d97706]/40 flex items-center justify-center text-[#f59e0b] font-serif-claude font-bold text-2xl shadow-lg mb-4">
              Ω
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif-claude font-semibold text-[#f5f4ef] tracking-tight mb-2">
              Bonjour. Comment puis-je vous aider avec votre PC aujourd'hui ?
            </h2>
            <p className="text-sm text-[#a8a29e] max-w-lg mb-8 leading-relaxed">
              Assistant local connecté à votre machine avec système d'aiguillage à deux API : gratuit ultra-rapide pour les tâches courantes et Claude pour la réflexion complexe.
            </p>

            {/* 4 Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {starterPrompts.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onSendMessage(card.prompt)}
                    className="p-3.5 rounded-xl bg-[#242321] hover:bg-[#2b2a27] border border-[#363430] hover:border-[#4d4a45] transition-all group flex flex-col justify-between shadow-xs text-left"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${card.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs font-semibold text-[#f5f4ef]">
                        {card.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a8a29e] leading-snug">
                      {card.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="pb-6">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onOpenArtifact={onOpenArtifact}
              />
            ))}

            {/* Assistant typing loader */}
            {isLoading && (
              <div className="py-5 px-4 md:px-8 bg-transparent">
                <div className="max-w-3xl mx-auto flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-lg bg-[#d97706]/15 border border-[#d97706]/40 flex items-center justify-center text-[#f59e0b] font-serif-claude font-bold text-sm shadow-xs shrink-0">
                    Ω
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#a8a29e] pt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-[#d97706]" />
                    <span>OmniPC Assistant réfléchit et interagit avec le système...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
