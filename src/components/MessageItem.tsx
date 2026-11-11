import React, { useState } from 'react';
import { Message, Artifact } from '../types';
import {
  Copy,
  Check,
  Zap,
  Cpu,
  Server,
  Code,
  Camera,
  ExternalLink,
  FolderCheck,
  Activity,
  FileText,
  User,
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onOpenArtifact: (artifact: Artifact) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onOpenArtifact,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const isUser = message.role === 'user';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Helper to parse Markdown text with code blocks and styling
  const renderFormattedContent = (content: string) => {
    // Split content by code blocks ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }

      // Code block
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        code: match[2].trim(),
        index: blockIndex++,
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts.map((part, i) => {
      if (part.type === 'code') {
        const isHtmlOrJs = ['html', 'jsx', 'tsx', 'javascript', 'typescript', 'css', 'svg'].includes(
          part.language?.toLowerCase() || ''
        );

        return (
          <div
            key={i}
            className="my-3.5 rounded-xl border border-[#383632] bg-[#161514] overflow-hidden shadow-md"
          >
            {/* Code Block Header */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#201f1d] border-b border-[#302e2b] text-xs">
              <span className="font-mono text-[11px] text-[#a8a29e] uppercase font-semibold">
                {part.language || 'Code'}
              </span>
              <div className="flex items-center gap-2">
                {isHtmlOrJs && (
                  <button
                    onClick={() =>
                      onOpenArtifact({
                        id: `artifact-inline-${Date.now()}`,
                        title: `Composant ${part.language?.toUpperCase()}`,
                        type: 'code',
                        content: part.code!,
                        meta: { language: part.language },
                      })
                    }
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-[#f59e0b] hover:bg-[#2b2a27] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Voir dans l'Artefact</span>
                  </button>
                )}
                <button
                  onClick={() => handleCopyCode(part.code!, part.index!)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-[#a8a29e] hover:text-[#f5f4ef] hover:bg-[#2b2a27] transition-colors"
                >
                  {copiedCodeIndex === part.index ? (
                    <>
                      <Check className="w-3 h-3 text-[#10b981]" />
                      <span className="text-[#10b981]">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="p-3.5 overflow-x-auto font-mono-code text-xs text-[#e6e2da] leading-relaxed">
              <pre className="select-text whitespace-pre">{part.code}</pre>
            </div>
          </div>
        );
      }

      // Render standard markdown prose
      return (
        <div key={i} className="prose-container space-y-2.5">
          {part.content?.split('\n\n').map((paragraph, pIdx) => {
            if (!paragraph.trim()) return null;

            // Headers
            if (paragraph.startsWith('### ')) {
              return (
                <h4 key={pIdx} className="text-base font-semibold text-[#f5f4ef] pt-2">
                  {paragraph.replace('### ', '')}
                </h4>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h3 key={pIdx} className="text-lg font-semibold text-[#f5f4ef] pt-2">
                  {paragraph.replace('## ', '')}
                </h3>
              );
            }

            // Bullet lists
            if (paragraph.includes('\n* ') || paragraph.startsWith('* ') || paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
              const lines = paragraph.split('\n');
              return (
                <ul key={pIdx} className="list-disc list-inside space-y-1 my-1.5 pl-1 text-[#dedacf]">
                  {lines.map((l, lIdx) => {
                    const cleanLine = l.replace(/^(\*|-)\s+/, '');
                    return (
                      <li key={lIdx} className="leading-relaxed">
                        <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cleanLine) }} />
                      </li>
                    );
                  })}
                </ul>
              );
            }

            // Standard paragraph
            return (
              <p
                key={pIdx}
                className="leading-relaxed text-[#dedacf]"
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(paragraph) }}
              />
            );
          })}
        </div>
      );
    });
  };

  // Helper for inline bold, italic, inline code
  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#f5f4ef]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-[#f5f4ef]">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[#181716] border border-[#33312e] text-[#f59e0b] font-mono text-[11px]">$1</code>');
  };

  return (
    <div
      className={`py-5 px-4 md:px-8 border-b border-[#2b2a28]/40 transition-colors ${
        isUser ? 'bg-[#22211f]/40' : 'bg-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-3.5">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-7 h-7 rounded-full bg-[#343330] border border-[#44423e] flex items-center justify-center text-[#d6d3cd]">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[#d97706]/15 border border-[#d97706]/40 flex items-center justify-center text-[#f59e0b] font-serif-claude font-bold text-sm shadow-xs">
              Ω
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#f5f4ef]">
                {isUser ? 'Vous' : 'OmniPC Assistant'}
              </span>

              {/* Engine Badge for Assistant */}
              {!isUser && message.engineLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2b2a27] border border-[#383632] text-[#a8a29e]">
                  {message.engine === 'claude_complex' && (
                    <Server className="w-3 h-3 text-[#f59e0b]" />
                  )}
                  {message.engine === 'fast_free' && <Zap className="w-3 h-3 text-[#10b981]" />}
                  {message.engine === 'system_local' && (
                    <Activity className="w-3 h-3 text-cyan-400" />
                  )}
                  <span>{message.engineLabel}</span>
                </span>
              )}
            </div>

            <span className="text-[10px] text-[#78716c] font-mono">
              {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* User Attachments Preview */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 my-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#282725] border border-[#383632] text-xs text-[#d6d3cd]"
                >
                  {att.type?.startsWith('image/') && att.dataUrl ? (
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-8 h-8 rounded object-cover border border-[#44423e]"
                    />
                  ) : (
                    <FileText className="w-4 h-4 text-[#d97706]" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[140px]">{att.name}</span>
                    <span className="text-[10px] text-[#78716c]">
                      {(att.size / 1024).toFixed(0)} Ko
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System Action confirmation card */}
          {message.actionExecuted && (
            <div className="p-3 my-2 rounded-lg bg-[#242321] border border-[#383632] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {message.actionExecuted.type === 'ram_clean' && (
                  <Zap className="w-4 h-4 text-[#f59e0b]" />
                )}
                {message.actionExecuted.type === 'screenshot' && (
                  <Camera className="w-4 h-4 text-cyan-400" />
                )}
                {message.actionExecuted.type === 'network_boost' && (
                  <Activity className="w-4 h-4 text-emerald-400" />
                )}
                {message.actionExecuted.type === 'clean_downloads' && (
                  <FolderCheck className="w-4 h-4 text-indigo-400" />
                )}
                <span className="font-medium text-[#f5f4ef]">
                  {message.actionExecuted.title}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Exécuté ✓
              </span>
            </div>
          )}

          {/* Formatted Markdown Content */}
          <div className="text-sm leading-relaxed text-[#e8e6df]">
            {renderFormattedContent(message.content)}
          </div>

          {/* Interactive Artifact Callout Card */}
          {message.artifact && (
            <div
              onClick={() => onOpenArtifact(message.artifact!)}
              className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-[#2a2926] to-[#242321] border border-[#44413c] hover:border-[#d97706] cursor-pointer transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#d97706]/15 text-[#f59e0b] group-hover:scale-105 transition-transform">
                  {message.artifact.type === 'code' ? (
                    <Code className="w-4 h-4" />
                  ) : message.artifact.type === 'screenshot' ? (
                    <Camera className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#f5f4ef] group-hover:text-[#f59e0b] transition-colors">
                    {message.artifact.title}
                  </h4>
                  <p className="text-[11px] text-[#a8a29e]">
                    Cliquez pour ouvrir dans le panneau Artefacts à droite
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-[#d97706]">
                <span>Ouvrir</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Copy Message Footer */}
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleCopyMessage}
              className="text-[11px] text-[#78716c] hover:text-[#d6d3cd] flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#10b981]" />
                  <span className="text-[#10b981]">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copier le texte</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
