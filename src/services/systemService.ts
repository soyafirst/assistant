import { SystemStatus, ApiSettings, Message, Artifact, Attachment } from '../types';

export const systemService = {
  // Fetch real-time system metrics (CPU, RAM, Disk, Ping)
  async getStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/system/status');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erreur statut système');
    return json.data;
  },

  // Trigger RAM cleaning
  async cleanRam(): Promise<{
    message: string;
    freedMb: number;
    before: { usedPercentage: number; freeFormatted: string };
    after: { usedPercentage: number; freeFormatted: string };
  }> {
    const res = await fetch('/api/system/clean-ram', { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erreur purge RAM');
    return json;
  },

  // Trigger DNS flush and network boost
  async boostNetwork(): Promise<{
    message: string;
    details: {
      dnsFlushed: boolean;
      routesOptimized: number;
      beforePingMs: number;
      afterPingMs: number;
      improvementPercent: number;
      dnsServers: string[];
    };
  }> {
    const res = await fetch('/api/system/network-boost', { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erreur boost réseau');
    return json;
  },

  // Trigger tidy downloads
  async cleanDownloads(): Promise<{
    message: string;
    count: number;
    files: Array<{ fileName: string; category: string; extension: string }>;
    directoryPath: string;
    breakdown?: Record<string, number>;
  }> {
    const res = await fetch('/api/system/clean-downloads', { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erreur rangement téléchargements');
    return json;
  },

  // Trigger screenshot capture
  async takeScreenshot(): Promise<{
    imageUrl: string;
    resolution: string;
    message: string;
    windowsCaptured: string[];
    timestamp: number;
  }> {
    const res = await fetch('/api/system/screenshot', { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erreur capture écran');
    return json;
  },

  // Schedule or execute PC shutdown/sleep
  async scheduleShutdown(params: {
    timerMinutes: number;
    action: 'shutdown' | 'restart' | 'sleep' | 'cancel';
  }): Promise<{
    message: string;
    isCancelled?: boolean;
    targetTimestamp?: number;
    action?: string;
  }> {
    const res = await fetch('/api/system/shutdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erreur programmation extinction');
    return json;
  },

  // Send message to intelligent bi-engine router
  async sendChat(params: {
    prompt: string;
    conversationHistory: Message[];
    settings: ApiSettings;
    attachments?: Attachment[];
  }): Promise<{
    reply: string;
    engine: 'fast_free' | 'claude_complex' | 'system_local';
    engineLabel: string;
    modelUsed?: string;
    artifact?: Artifact;
    actionExecuted?: any;
  }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: params.prompt,
        conversationHistory: params.conversationHistory.map(m => ({
          role: m.role,
          content: m.content,
        })),
        groqApiKey: params.settings.groqApiKey,
        claudeApiKey: params.settings.claudeApiKey,
        claudeBaseUrl: params.settings.claudeBaseUrl,
        preferredEngine: params.settings.routingMode,
        attachments: params.attachments || [],
      }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erreur communication avec le routeur IA');
    return json;
  },

  // Extract OCR text from image fallback
  async extractOcr(imageBase64: string, mimeType = 'image/png'): Promise<string> {
    const res = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erreur OCR');
    return json.extractedText || '';
  },
};
