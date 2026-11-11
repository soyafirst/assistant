import React, { useState } from 'react';
import { ChatSession, SystemStatus } from '../types';
import { CircularGauge } from './CircularGauge';
import {
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  Edit2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Cpu,
  Activity,
  Search,
} from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  systemStatus: SystemStatus | null;
  isLoadingStatus: boolean;
  onRefreshStatus: () => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  systemStatus,
  isLoadingStatus,
  onRefreshStatus,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const handleRenameSubmit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  if (isCollapsed) {
    return (
      <aside className="w-16 h-screen bg-[#242321] border-r border-[#33312e] flex flex-col items-center py-4 justify-between shrink-0 select-none z-30 transition-all duration-200">
        <div className="flex flex-col items-center gap-4">
          {/* Logo mark */}
          <div className="w-10 h-10 rounded-xl bg-[#d97706]/15 border border-[#d97706]/30 flex items-center justify-center text-[#f59e0b] font-serif-claude font-bold text-lg shadow-sm">
            Ω
          </div>

          <button
            onClick={onToggleCollapse}
            title="Agrandir la barre latérale"
            className="p-2 text-[#a8a29e] hover:text-[#f5f4ef] rounded-lg hover:bg-[#2e2d2a] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={onNewSession}
            title="Nouveau chat"
            className="p-2.5 rounded-lg bg-[#2e2d2a] hover:bg-[#383632] text-[#f59e0b] border border-[#3d3b37] transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Minimized Live Metrics preview */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {systemStatus && (
            <div
              onClick={onToggleCollapse}
              className="cursor-pointer flex flex-col items-center gap-1 p-1.5 rounded-lg bg-[#1c1b1a] border border-[#33312e] text-[10px] font-mono text-[#a8a29e] hover:border-[#d97706] transition-colors"
              title={`RAM: ${systemStatus.ram.usagePercentage}% | CPU: ${systemStatus.cpu.usagePercentage}%`}
            >
              <Activity className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="tabular-nums font-semibold text-[#10b981]">
                {systemStatus.ram.usagePercentage}%
              </span>
            </div>
          )}

          <button
            onClick={onOpenSettings}
            title="Paramètres API & Moteurs"
            className="p-2 text-[#a8a29e] hover:text-[#f5f4ef] rounded-lg hover:bg-[#2e2d2a] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 h-screen bg-[#242321] border-r border-[#33312e] flex flex-col justify-between shrink-0 select-none z-30 transition-all duration-200">
      {/* Top Brand & Actions */}
      <div className="p-3.5 border-b border-[#33312e] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#d97706]/15 border border-[#d97706]/40 flex items-center justify-center text-[#f59e0b] font-serif-claude font-bold text-base shadow-xs">
            Ω
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#f5f4ef] tracking-tight leading-none">
              OmniPC Assistant
            </h1>
            <span className="text-[10px] text-[#a8a29e] font-mono mt-0.5 block">
              Style Claude.ai · v2.4
            </span>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          title="Réduire la barre"
          className="p-1.5 text-[#a8a29e] hover:text-[#f5f4ef] rounded-md hover:bg-[#2e2d2a] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button & Search */}
      <div className="p-3 space-y-2 border-b border-[#2e2d2a]">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#2b2a27] hover:bg-[#343330] border border-[#3d3b37] text-xs font-semibold text-[#f5f4ef] transition-all hover:border-[#4d4a45] shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#d97706]" />
          <span>Nouveau chat</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#78716c]" />
          <input
            type="text"
            placeholder="Rechercher des sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1c1b1a] border border-[#33312e] rounded-md text-[#d6d3cd] placeholder-[#78716c] focus:outline-none focus:border-[#d97706]"
          />
        </div>
      </div>

      {/* Chat Sessions History */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#78716c]">
          Conversations récentes
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#78716c]">
            {searchQuery ? 'Aucune session trouvée' : 'Aucune session active'}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#2e2d2a] text-[#f5f4ef] font-medium border border-[#3f3d38]'
                    : 'text-[#a8a29e] hover:bg-[#282725] hover:text-[#e8e6df]'
                }`}
              >
                <div className="flex items-center gap-2 truncate mr-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-[#d97706]' : 'text-[#78716c]'
                    }`}
                  />
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleRenameSubmit(session.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleRenameSubmit(session.id, { preventDefault: () => {} } as any)}
                        className="w-full bg-[#181716] text-xs px-1.5 py-0.5 rounded border border-[#d97706] text-[#f5f4ef] focus:outline-none"
                      />
                    </form>
                  ) : (
                    <span className="truncate">{session.title}</span>
                  )}
                </div>

                {/* Session Actions (Rename / Delete) */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                  <button
                    onClick={(e) => startRename(session, e)}
                    title="Renommer"
                    className="p-1 text-[#78716c] hover:text-[#d6d3cd] rounded hover:bg-[#383632]"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    title="Supprimer"
                    className="p-1 text-[#78716c] hover:text-red-400 rounded hover:bg-[#383632]"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PC Live Status Widget */}
      <div className="p-3 border-t border-[#33312e] bg-[#1e1d1b]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[11px] font-semibold text-[#d4cfc5] tracking-tight">
              Moniteur PC Local
            </span>
          </div>
          <button
            onClick={onRefreshStatus}
            disabled={isLoadingStatus}
            title="Actualiser les métriques système"
            className="p-1 text-[#a8a29e] hover:text-[#f5f4ef] rounded hover:bg-[#282725] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin text-[#d97706]' : ''}`} />
          </button>
        </div>

        {/* 4 Circular Dials for RAM, CPU, Disk, Ping */}
        <div className="grid grid-cols-4 gap-1.5">
          <CircularGauge
            label="RAM"
            value={systemStatus?.ram.usagePercentage ?? 42}
            displayValue={`${systemStatus?.ram.usagePercentage ?? 42}%`}
            subValue={systemStatus?.ram.usedFormatted ?? '6.8 Go'}
            size={52}
          />

          <CircularGauge
            label="CPU"
            value={systemStatus?.cpu.usagePercentage ?? 18}
            displayValue={`${systemStatus?.cpu.usagePercentage ?? 18}%`}
            subValue={`${systemStatus?.cpu.cores ?? 8} cœurs`}
            size={52}
          />

          <CircularGauge
            label="Disque"
            value={systemStatus?.disk.usagePercentage ?? 36}
            displayValue={`${systemStatus?.disk.usagePercentage ?? 36}%`}
            subValue={systemStatus?.disk.freeFormatted ?? '240 Go'}
            size={52}
          />

          <CircularGauge
            label="Ping"
            value={systemStatus?.network.pingMs ?? 14}
            displayValue={`${systemStatus?.network.pingMs ?? 14}ms`}
            subValue={systemStatus?.network.status ?? 'optimal'}
            isPing={true}
            size={52}
          />
        </div>
      </div>

      {/* Footer Settings & Engine Info */}
      <div className="p-3 border-t border-[#33312e] bg-[#22211f] flex items-center justify-between">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-xs font-medium text-[#a8a29e] hover:text-[#f5f4ef] transition-colors p-1.5 rounded-lg hover:bg-[#2c2b28]"
        >
          <Settings className="w-4 h-4 text-[#d97706]" />
          <span>Clés API &amp; Moteurs</span>
        </button>

        <span className="text-[10px] font-mono text-[#78716c] px-2 py-0.5 rounded bg-[#181716] border border-[#33312e]">
          Double-Routeur
        </span>
      </div>
    </aside>
  );
};
