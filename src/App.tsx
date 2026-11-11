import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { ArtifactPanel } from './components/ArtifactPanel';
import { SettingsModal } from './components/SettingsModal';
import { ShutdownModal } from './components/ShutdownModal';
import { Toast, ToastMessage } from './components/Toast';
import {
  ChatSession,
  Message,
  Artifact,
  SystemStatus,
  ApiSettings,
  Attachment,
} from './types';
import { systemService } from './services/systemService';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  SESSIONS: 'omnipc_sessions_v1',
  SETTINGS: 'omnipc_settings_v1',
  ACTIVE_SESSION: 'omnipc_active_session_v1',
  SIDEBAR_COLLAPSED: 'omnipc_sidebar_collapsed_v1',
};

const DEFAULT_SETTINGS: ApiSettings = {
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile',
  claudeApiKey: '',
  claudeBaseUrl: 'https://api.anthropic.com/v1',
  claudeModel: 'claude-3-5-sonnet-20241022',
  routingMode: 'auto',
  metricsRefreshInterval: 5,
};

export default function App() {
  // 1. Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'session-default',
        title: 'Session Principale',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (saved) return saved;
    } catch {}
    return 'session-default';
  });

  // 2. Settings State
  const [settings, setSettings] = useState<ApiSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // 3. UI Toggles
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
    } catch {}
    return false;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShutdownOpen, setIsShutdownOpen] = useState(false);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);

  // 4. System Status & Loading States
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const addToast = (type: 'success' | 'info' | 'error', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Active Session Reference
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Poll System Status
  const fetchStatus = useCallback(async () => {
    try {
      setIsLoadingStatus(true);
      const data = await systemService.getStatus();
      setSystemStatus(data);
    } catch (err: any) {
      console.warn('Could not fetch system status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, settings.metricsRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus, settings.metricsRefreshInterval]);

  // Session Management Handlers
  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'Nouvelle conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      // Clear current messages instead of deleting the only session
      setSessions([
        {
          id: 'session-default',
          title: 'Session Principale',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        },
      ]);
      setActiveSessionId('session-default');
      return;
    }
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0]?.id || 'session-default');
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Quick Action: Clean RAM
  const handleCleanRam = async () => {
    try {
      setIsPerformingAction('ram');
      const result = await systemService.cleanRam();
      addToast(
        'success',
        '⚡ Mémoire RAM optimisée',
        `${result.freedMb} Mo libérés. RAM passée à ${result.after.usedPercentage}%.`
      );

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.15, x: 0.5 },
          colors: ['#d97706', '#f59e0b', '#10b981'],
        });
      } catch {}

      // Append assistant message in active chat
      const msg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `### ⚡ Purge de la mémoire vive effectuée\n\n* **Gain net** : **${result.freedMb} Mo** libérés avec succès.\n* **Mémoire disponible** : ${result.after.freeFormatted}\n* **État système** : Cache d'allocations vidé, performances réactives rétablies.`,
        timestamp: Date.now(),
        engine: 'system_local',
        engineLabel: 'Exécution Système Locale',
        actionExecuted: {
          type: 'ram_clean',
          title: 'Purge RAM',
          freedMb: result.freedMb,
        },
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, msg], updatedAt: Date.now() }
            : s
        )
      );

      fetchStatus();
    } catch (err: any) {
      addToast('error', 'Échec de la purge RAM', err.message);
    } finally {
      setIsPerformingAction(null);
    }
  };

  // Quick Action: Boost Network & DNS
  const handleBoostNetwork = async () => {
    try {
      setIsPerformingAction('network');
      const result = await systemService.boostNetwork();
      addToast(
        'success',
        '📶 Cache DNS purgé & Réseau optimisé',
        `Latence réduite de ${result.details.beforePingMs}ms à ${result.details.afterPingMs}ms (-${result.details.improvementPercent}%).`
      );

      const msg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `### 📶 Optimisation Réseau & Flush DNS\n\n* **Cache DNS** : Entrées résolues et rafraîchies.\n* **Passerelles prioritaires** : ${result.details.dnsServers.join(', ')}\n* **Latence** : ${result.details.beforePingMs}ms ➔ **${result.details.afterPingMs}ms** (${result.details.improvementPercent}% d'accélération).`,
        timestamp: Date.now(),
        engine: 'system_local',
        engineLabel: 'Exécution Système Locale',
        actionExecuted: {
          type: 'network_boost',
          title: 'Flush DNS & Boost Réseau',
        },
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, msg], updatedAt: Date.now() }
            : s
        )
      );

      fetchStatus();
    } catch (err: any) {
      addToast('error', 'Erreur réseau', err.message);
    } finally {
      setIsPerformingAction(null);
    }
  };

  // Quick Action: Screenshot
  const handleTakeScreenshot = async () => {
    try {
      setIsPerformingAction('screenshot');
      const result = await systemService.takeScreenshot();
      addToast('success', "📸 Capture d'écran effectuée", 'Affichée dans le volet Artefacts.');

      const artifact: Artifact = {
        id: `artifact-screenshot-${Date.now()}`,
        title: `Capture d'écran - ${new Date().toLocaleTimeString('fr-FR')}`,
        type: 'screenshot',
        content: result.imageUrl,
        meta: { resolution: result.resolution, timestamp: new Date().toLocaleTimeString() },
      };

      setActiveArtifact(artifact);
      setIsArtifactOpen(true);

      const msg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `J'ai effectué une capture instantanée haute résolution (${result.resolution}) de votre écran.\n\nVous pouvez l'examiner en détail, la zoomer et l'exporter directement dans le panneau latéral **Artefacts** ouvert à droite.`,
        timestamp: Date.now(),
        engine: 'system_local',
        engineLabel: 'Exécution Système Locale',
        artifact,
        actionExecuted: {
          type: 'screenshot',
          title: "Capture d'écran du PC",
        },
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, msg], updatedAt: Date.now() }
            : s
        )
      );
    } catch (err: any) {
      addToast('error', 'Erreur capture', err.message);
    } finally {
      setIsPerformingAction(null);
    }
  };

  // Quick Action: Clean Downloads
  const handleCleanDownloads = async () => {
    try {
      setIsPerformingAction('downloads');
      const result = await systemService.cleanDownloads();
      addToast(
        'success',
        '🧹 Dossier Téléchargements rangé',
        `${result.count} fichiers classés par type de document.`
      );

      const formattedList = result.files
        .slice(0, 8)
        .map((f) => `* \`${f.fileName}\` ➔ **${f.category}**`)
        .join('\n');

      const msg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `### 🧹 Rangement des Téléchargements achevé\n\n${result.message}\n\n${formattedList}\n\n*Tous les fichiers ont été triés dans \`${result.directoryPath}\`.*`,
        timestamp: Date.now(),
        engine: 'system_local',
        engineLabel: 'Exécution Système Locale',
        actionExecuted: {
          type: 'clean_downloads',
          title: 'Rangement Téléchargements',
          count: result.count,
        },
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, msg], updatedAt: Date.now() }
            : s
        )
      );
    } catch (err: any) {
      addToast('error', 'Erreur rangement', err.message);
    } finally {
      setIsPerformingAction(null);
    }
  };

  // Shutdown Schedule Handlers
  const handleScheduleShutdown = async (
    timerMinutes: number,
    action: 'shutdown' | 'restart' | 'sleep'
  ) => {
    try {
      const result = await systemService.scheduleShutdown({ timerMinutes, action });
      addToast('info', 'Alimentation PC', result.message);

      const msg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `### 🕒 Commande Système d'Alimentation\n\n${result.message}\n\n*Action ciblée :* **${action.toUpperCase()}** ${
          timerMinutes > 0 ? `dans ${timerMinutes} minute(s)` : 'immédiate'
        }.`,
        timestamp: Date.now(),
        engine: 'system_local',
        engineLabel: 'Exécution Système Locale',
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, msg], updatedAt: Date.now() }
            : s
        )
      );

      fetchStatus();
    } catch (err: any) {
      addToast('error', 'Erreur alimentation', err.message);
    }
  };

  const handleCancelShutdown = async () => {
    try {
      const result = await systemService.scheduleShutdown({ timerMinutes: 0, action: 'cancel' });
      addToast('success', 'Annulation réussie', result.message);

      const msg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `L'extinction ou la mise en veille programmée a été **annulée**. Votre ordinateur restera allumé.`,
        timestamp: Date.now(),
        engine: 'system_local',
        engineLabel: 'Exécution Système Locale',
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, msg], updatedAt: Date.now() }
            : s
        )
      );

      fetchStatus();
    } catch (err: any) {
      addToast('error', 'Erreur annulation', err.message);
    }
  };

  // Main Chat Send Handler
  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    if (!text.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments,
    };

    // Update session title dynamically if first message
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const isFirstMessage = !currentSession || currentSession.messages.length === 0;
    const newTitle = isFirstMessage ? text.slice(0, 32) || 'Analyse de document' : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: newTitle,
              messages: [...s.messages, userMessage],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsLoadingChat(true);

    try {
      const response = await systemService.sendChat({
        prompt: text,
        conversationHistory: currentSession ? [...currentSession.messages, userMessage] : [userMessage],
        settings,
        attachments,
      });

      const assistantMessage: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        engine: response.engine,
        engineLabel: response.engineLabel,
        modelUsed: response.modelUsed,
        artifact: response.artifact,
        actionExecuted: response.actionExecuted,
      };

      // If response includes an artifact, open panel automatically!
      if (response.artifact) {
        setActiveArtifact(response.artifact);
        setIsArtifactOpen(true);
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...s.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );

      // If an action was executed by the router, refresh PC stats!
      if (response.actionExecuted) {
        fetchStatus();
      }
    } catch (err: any) {
      addToast('error', 'Erreur de réponse', err.message);

      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Une erreur est survenue lors de la communication avec le moteur IA : **${err.message}**.\n\nVérifiez vos clés API dans le menu Paramètres ou réessayez.`,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, errorMessage], updatedAt: Date.now() }
            : s
        )
      );
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1f1e1d] text-[#e8e6df]">
      {/* 1. Collapsible Left Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        systemStatus={systemStatus}
        isLoadingStatus={isLoadingStatus}
        onRefreshStatus={fetchStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Central Workspace */}
      <main className="flex-1 flex flex-col h-screen min-w-0 relative">
        <ChatArea
          messages={activeSession?.messages || []}
          isLoading={isLoadingChat}
          onSendMessage={(prompt) => handleSendMessage(prompt, [])}
          onOpenArtifact={(art) => {
            setActiveArtifact(art);
            setIsArtifactOpen(true);
          }}
          onOpenShutdownModal={() => setIsShutdownOpen(true)}
          onCleanRam={handleCleanRam}
          onBoostNetwork={handleBoostNetwork}
          onTakeScreenshot={handleTakeScreenshot}
          onCleanDownloads={handleCleanDownloads}
          isPerformingAction={isPerformingAction}
          settings={settings}
          activeArtifact={activeArtifact}
          onToggleArtifactPanel={() => setIsArtifactOpen(!isArtifactOpen)}
        />

        {/* Bottom Input Area */}
        <InputArea
          onSendMessage={handleSendMessage}
          isLoading={isLoadingChat}
          settings={settings}
          onChangeRoutingMode={(mode) => setSettings((s) => ({ ...s, routingMode: mode }))}
        />
      </main>

      {/* 3. Right Sliding Artifact Panel */}
      <ArtifactPanel
        artifact={activeArtifact}
        isOpen={isArtifactOpen}
        onClose={() => setIsArtifactOpen(false)}
      />

      {/* 4. Settings Modal (Groq + Claude API Keys) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(updated) => {
          setSettings(updated);
          addToast('success', 'Paramètres enregistrés', 'Configuration des moteurs mise à jour.');
        }}
      />

      {/* 5. Shutdown & Sleep Modal */}
      <ShutdownModal
        isOpen={isShutdownOpen}
        onClose={() => setIsShutdownOpen(false)}
        onSchedule={handleScheduleShutdown}
        onCancelShutdown={handleCancelShutdown}
        activeShutdownTimer={systemStatus?.activeShutdownTimer || null}
      />

      {/* 6. Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
