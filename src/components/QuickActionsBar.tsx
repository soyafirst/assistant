import React from 'react';
import { Moon, Zap, Wifi, Camera, FolderSync, Loader2 } from 'lucide-react';

interface QuickActionsBarProps {
  onOpenShutdownModal: () => void;
  onCleanRam: () => void;
  onBoostNetwork: () => void;
  onTakeScreenshot: () => void;
  onCleanDownloads: () => void;
  isPerformingAction: string | null;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onOpenShutdownModal,
  onCleanRam,
  onBoostNetwork,
  onTakeScreenshot,
  onCleanDownloads,
  isPerformingAction,
}) => {
  return (
    <div className="w-full px-4 py-2 bg-[#232220]/90 backdrop-blur-md border-b border-[#33312e] flex items-center justify-between overflow-x-auto gap-2 no-scrollbar">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#8c857b] uppercase tracking-wider whitespace-nowrap pl-1">
          Actions Rapides PC
        </span>

        {/* 1. Mode Nuit / Éteindre le PC */}
        <button
          onClick={onOpenShutdownModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2a27] hover:bg-[#343330] border border-[#3b3935] hover:border-[#4d4a45] text-xs font-medium text-[#e2ded6] transition-all whitespace-nowrap shadow-xs active:scale-95"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Mode Nuit / Éteindre</span>
        </button>

        {/* 2. Vider la RAM */}
        <button
          onClick={onCleanRam}
          disabled={isPerformingAction === 'ram'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2a27] hover:bg-[#343330] border border-[#3b3935] hover:border-[#4d4a45] text-xs font-medium text-[#e2ded6] transition-all whitespace-nowrap shadow-xs active:scale-95 disabled:opacity-50"
        >
          {isPerformingAction === 'ram' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d97706]" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
          )}
          <span>Vider la RAM</span>
        </button>

        {/* 3. Boost Réseau / Flush DNS */}
        <button
          onClick={onBoostNetwork}
          disabled={isPerformingAction === 'network'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2a27] hover:bg-[#343330] border border-[#3b3935] hover:border-[#4d4a45] text-xs font-medium text-[#e2ded6] transition-all whitespace-nowrap shadow-xs active:scale-95 disabled:opacity-50"
        >
          {isPerformingAction === 'network' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#10b981]" />
          ) : (
            <Wifi className="w-3.5 h-3.5 text-[#10b981]" />
          )}
          <span>Boost Réseau / DNS</span>
        </button>

        {/* 4. Capture d'écran */}
        <button
          onClick={onTakeScreenshot}
          disabled={isPerformingAction === 'screenshot'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2a27] hover:bg-[#343330] border border-[#3b3935] hover:border-[#4d4a45] text-xs font-medium text-[#e2ded6] transition-all whitespace-nowrap shadow-xs active:scale-95 disabled:opacity-50"
        >
          {isPerformingAction === 'screenshot' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />
          ) : (
            <Camera className="w-3.5 h-3.5 text-[#38bdf8]" />
          )}
          <span>Capture d'écran</span>
        </button>

        {/* 5. Ranger les Téléchargements */}
        <button
          onClick={onCleanDownloads}
          disabled={isPerformingAction === 'downloads'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2a27] hover:bg-[#343330] border border-[#3b3935] hover:border-[#4d4a45] text-xs font-medium text-[#e2ded6] transition-all whitespace-nowrap shadow-xs active:scale-95 disabled:opacity-50"
        >
          {isPerformingAction === 'downloads' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#a78bfa]" />
          ) : (
            <FolderSync className="w-3.5 h-3.5 text-[#a78bfa]" />
          )}
          <span>Ranger Téléchargements</span>
        </button>
      </div>
    </div>
  );
};
