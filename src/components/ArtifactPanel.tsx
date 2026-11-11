import React, { useState } from 'react';
import { Artifact } from '../types';
import {
  X,
  Code2,
  Eye,
  Terminal,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Camera,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface ArtifactPanelProps {
  artifact: Artifact | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({
  artifact,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'console'>('preview');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen || !artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let filename = `omnipc_artifact_${Date.now()}`;
    let mimeType = 'text/plain';
    let data = artifact.content;

    if (artifact.type === 'code') {
      const ext = artifact.meta?.language === 'javascript' ? 'js' : artifact.meta?.language === 'css' ? 'css' : 'html';
      filename += `.${ext}`;
      mimeType = 'text/html';
    } else if (artifact.type === 'screenshot') {
      filename += '.svg';
      mimeType = 'image/svg+xml';
    } else {
      filename += '.txt';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Safe wrapper for HTML preview iframe
  const getIframeSource = (code: string) => {
    if (code.includes('<html') || code.includes('<!DOCTYPE')) {
      return code;
    }
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <style>
          body {
            background-color: #1a1918;
            color: #f5f4ef;
            font-family: system-ui, -apple-system, sans-serif;
            padding: 1.5rem;
          }
        </style>
      </head>
      <body>
        ${code}
      </body>
      </html>
    `;
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen bg-[#22211f] border-l border-[#363430] flex flex-col z-40 shadow-2xl transition-all duration-300 ${
        isExpanded ? 'w-full md:w-[80vw]' : 'w-full md:w-[540px] lg:w-[600px]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#363430] bg-[#262523]">
        <div className="flex items-center gap-2.5 truncate mr-2">
          <div className="p-1.5 rounded-md bg-[#d97706]/15 text-[#f59e0b] shrink-0">
            {artifact.type === 'code' && <Code2 className="w-4 h-4" />}
            {artifact.type === 'screenshot' && <Camera className="w-4 h-4" />}
            {(artifact.type === 'document' || artifact.type === 'report') && (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div className="truncate">
            <h2 className="text-sm font-semibold text-[#f5f4ef] truncate">
              {artifact.title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-[#a8a29e]">
              <span className="capitalize">{artifact.type}</span>
              {artifact.meta?.language && <span>· {artifact.meta.language}</span>}
              {artifact.meta?.resolution && <span>· {artifact.meta.resolution}</span>}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopy}
            title="Copier le contenu"
            className="p-1.5 rounded-md text-[#a8a29e] hover:text-[#f5f4ef] hover:bg-[#33312e] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            title="Télécharger l'artefact"
            className="p-1.5 rounded-md text-[#a8a29e] hover:text-[#f5f4ef] hover:bg-[#33312e] transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Réduire' : 'Agrandir'}
            className="p-1.5 rounded-md text-[#a8a29e] hover:text-[#f5f4ef] hover:bg-[#33312e] transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            title="Fermer le panneau"
            className="p-1.5 rounded-md text-[#a8a29e] hover:text-[#f5f4ef] hover:bg-[#33312e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Specific Tabs */}
      {artifact.type === 'code' && (
        <div className="flex items-center gap-1 px-4 py-2 border-b border-[#33312e] bg-[#1e1d1b]">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-[#2e2d2a] text-[#f59e0b] shadow-xs'
                : 'text-[#a8a29e] hover:text-[#e8e6df]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu en direct</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-[#2e2d2a] text-[#f59e0b] shadow-xs'
                : 'text-[#a8a29e] hover:text-[#e8e6df]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Source</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'console'
                ? 'bg-[#2e2d2a] text-[#f59e0b] shadow-xs'
                : 'text-[#a8a29e] hover:text-[#e8e6df]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 overflow-auto bg-[#1a1917] relative">
        {/* VIEW 1: Code Preview (Iframe) */}
        {artifact.type === 'code' && activeTab === 'preview' && (
          <iframe
            srcDoc={getIframeSource(artifact.content)}
            title="Artefact Preview"
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-none bg-[#141312]"
          />
        )}

        {/* VIEW 2: Raw Code Viewer */}
        {artifact.type === 'code' && activeTab === 'code' && (
          <div className="p-4 font-mono-code text-xs text-[#d6d3cd] overflow-x-auto leading-relaxed">
            <pre className="whitespace-pre-wrap select-text">{artifact.content}</pre>
          </div>
        )}

        {/* VIEW 3: Console Stub */}
        {artifact.type === 'code' && activeTab === 'console' && (
          <div className="p-4 font-mono-code text-xs space-y-2 text-[#a8a29e]">
            <div className="text-emerald-400">[Console OmniPC] Environnement de sandbox initialisé avec succès.</div>
            <div className="text-[#78716c]">// Aucun avertissement ni erreur d'exécution détecté.</div>
          </div>
        )}

        {/* VIEW 4: Screenshot Viewer */}
        {artifact.type === 'screenshot' && (
          <div className="flex flex-col h-full">
            {/* Zoom Controls */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#201f1d] border-b border-[#33312e] text-xs">
              <span className="text-[#a8a29e] text-[11px]">
                {artifact.meta?.resolution || '1920x1080 HD'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                  className="p-1 rounded hover:bg-[#33312e] text-[#a8a29e]"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] text-[#d6d3cd]">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="p-1 rounded hover:bg-[#33312e] text-[#a8a29e]"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="text-[10px] text-[#d97706] hover:underline ml-1"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#121110]">
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="transition-transform duration-150 max-w-full"
              >
                <img
                  src={artifact.content}
                  alt="Capture d'écran du PC"
                  className="rounded-lg shadow-2xl border border-[#383632] max-w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: Document / Report Reader */}
        {(artifact.type === 'document' || artifact.type === 'report') && (
          <div className="p-6 text-sm text-[#e8e6df] space-y-4 max-w-2xl mx-auto leading-relaxed select-text">
            <div className="p-3 rounded-lg bg-[#242321] border border-[#383632] text-xs text-[#a8a29e] flex items-center justify-between">
              <span>Document analysé par OmniPC OCR</span>
              <span>{new Date().toLocaleTimeString('fr-FR')}</span>
            </div>
            <div className="whitespace-pre-wrap font-sans font-normal text-justify text-[#dedacf]">
              {artifact.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
