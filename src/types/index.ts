export interface SystemStatus {
  timestamp: number;
  os: {
    platform: string;
    release: string;
    type: string;
    arch: string;
    hostname: string;
    uptimeSeconds: number;
  };
  cpu: {
    cores: number;
    model: string;
    usagePercentage: number;
  };
  ram: {
    totalBytes: number;
    freeBytes: number;
    usedBytes: number;
    usagePercentage: number;
    totalFormatted: string;
    usedFormatted: string;
    freeFormatted: string;
  };
  disk: {
    totalBytes: number;
    freeBytes: number;
    usedBytes: number;
    usagePercentage: number;
    totalFormatted: string;
    freeFormatted: string;
  };
  network: {
    pingMs: number;
    status: 'optimal' | 'moyen' | 'lent';
  };
  activeShutdownTimer: {
    action: 'shutdown' | 'restart' | 'sleep';
    targetTimestamp: number;
    remainingSeconds: number;
  } | null;
}

export interface Artifact {
  id: string;
  title: string;
  type: 'code' | 'screenshot' | 'document' | 'report';
  content: string; // HTML/code string, SVG/image data URL, or Markdown text
  meta?: {
    language?: string;
    resolution?: string;
    timestamp?: string;
    fileCount?: number;
    freedMb?: number;
    [key: string]: any;
  };
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  extractedText?: string;
  isExtracting?: boolean;
}

export interface ActionExecuted {
  type: 'screenshot' | 'ram_clean' | 'network_boost' | 'clean_downloads' | 'shutdown' | 'shutdown_prompt';
  title: string;
  timestamp?: number;
  freedMb?: number;
  count?: number;
  action?: string;
  minutes?: number;
  details?: any;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  engine?: 'fast_free' | 'claude_complex' | 'system_local';
  engineLabel?: string;
  modelUsed?: string;
  attachments?: Attachment[];
  artifact?: Artifact;
  actionExecuted?: ActionExecuted;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface ApiSettings {
  groqApiKey: string;
  groqModel: string;
  claudeApiKey: string;
  claudeBaseUrl: string;
  claudeModel: string;
  routingMode: 'auto' | 'fast_free' | 'claude_complex';
  metricsRefreshInterval: number; // in seconds, default 5
}
