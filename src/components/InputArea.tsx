import React, { useState, useRef, useEffect } from 'react';
import { Attachment, ApiSettings } from '../types';
import {
  Paperclip,
  Mic,
  MicOff,
  ArrowUp,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Zap,
  Server,
  Layers,
} from 'lucide-react';
import { systemService } from '../services/systemService';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  settings: ApiSettings;
  onChangeRoutingMode: (mode: 'auto' | 'fast_free' | 'claude_complex') => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isLoading,
  settings,
  onChangeRoutingMode,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [text]);

  // Voice dictation initialization (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('La reconnaissance vocale Web Speech API n\'est pas supportée par ce navigateur.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Handle file selection & OCR
  const handleFiles = async (files: FileList | File[]) => {
    const newAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isImage = file.type.startsWith('image/');
      const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv');

      const reader = new FileReader();
      const readPromise = new Promise<void>((resolve) => {
        reader.onload = async (e) => {
          const result = e.target?.result as string;
          let extractedText = '';

          // Client-side text read
          if (isText) {
            extractedText = result;
          }

          // If image, trigger OCR extraction via Tesseract.js / backend OCR
          if (isImage) {
            setIsProcessingOcr(true);
            try {
              // Try client-side Tesseract OCR or server fallback
              const tesseract = await import('tesseract.js');
              const { data: { text: ocrResult } } = await tesseract.recognize(result, 'fra+eng', {
                logger: () => {},
              });
              extractedText = ocrResult?.trim() || '';
            } catch (ocrErr) {
              // Fallback to server OCR
              try {
                extractedText = await systemService.extractOcr(result, file.type);
              } catch {
                extractedText = 'Texte OCR non extrait.';
              }
            } finally {
              setIsProcessingOcr(false);
            }
          }

          newAttachments.push({
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: isImage ? result : undefined,
            extractedText,
            isExtracting: false,
          });
          resolve();
        };

        if (isImage) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });

      await readPromise;
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full px-4 pb-4 pt-1 bg-gradient-to-t from-[#1f1e1d] via-[#1f1e1d] to-transparent">
      <div className="max-w-3xl mx-auto">
        {/* Container with Drag & Drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          className={`relative rounded-2xl bg-[#262523] border transition-all shadow-xl ${
            isDragOver
              ? 'border-[#d97706] ring-2 ring-[#d97706]/30 bg-[#2b2a27]'
              : 'border-[#3d3b37] hover:border-[#4d4a45] focus-within:border-[#d97706]/70'
          }`}
        >
          {/* Active Attachments Preview Bar */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 pb-1 border-b border-[#363430]">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1f1e1d] border border-[#3b3935] text-xs text-[#e8e6df] group shadow-xs"
                >
                  {att.type?.startsWith('image/') ? (
                    <ImageIcon className="w-3.5 h-3.5 text-[#38bdf8]" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-[#d97706]" />
                  )}
                  <span className="font-medium truncate max-w-[150px]">{att.name}</span>
                  {att.extractedText && (
                    <span className="text-[10px] text-emerald-400 font-mono">OCR ✓</span>
                  )}
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="text-[#78716c] hover:text-[#f5f4ef] ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {isProcessingOcr && (
                <div className="flex items-center gap-1.5 text-xs text-[#f59e0b] px-2 py-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Extraction OCR en cours...</span>
                </div>
              )}
            </div>
          )}

          {/* Text Area */}
          <div className="px-4 pt-3.5 pb-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez une question, donnez un ordre au PC ou glissez un fichier..."
              className="w-full bg-transparent text-sm text-[#f5f4ef] placeholder-[#78716c] resize-none focus:outline-none leading-relaxed"
            />
          </div>

          {/* Bottom Toolbar inside Input Box */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-[#33312e]/50">
            {/* Left Controls: Attachments & Engine switcher */}
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Joindre des fichiers ou images (Analyse OCR)"
                className="p-2 text-[#a8a29e] hover:text-[#f5f4ef] rounded-lg hover:bg-[#33312e] transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Dictation Button */}
              <button
                type="button"
                onClick={toggleRecording}
                title={isRecording ? 'Arrêter la dictée vocale' : 'Activer la dictée vocale (Web Speech)'}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'text-[#a8a29e] hover:text-[#f5f4ef] hover:bg-[#33312e]'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording && <span className="text-[10px] font-semibold">Écoute...</span>}
              </button>

              {/* Engine Quick Selector */}
              <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-[#33312e]">
                <button
                  type="button"
                  onClick={() => onChangeRoutingMode('auto')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    settings.routingMode === 'auto'
                      ? 'bg-[#d97706]/15 text-[#f59e0b]'
                      : 'text-[#78716c] hover:text-[#a8a29e]'
                  }`}
                  title="Aiguillage intelligent automatique"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeRoutingMode('fast_free')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    settings.routingMode === 'fast_free'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-[#78716c] hover:text-[#a8a29e]'
                  }`}
                  title="Forcer Groq Gratuit"
                >
                  <Zap className="w-3 h-3" />
                  <span>Rapide</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeRoutingMode('claude_complex')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    settings.routingMode === 'claude_complex'
                      ? 'bg-[#d97706]/15 text-[#f59e0b]'
                      : 'text-[#78716c] hover:text-[#a8a29e]'
                  }`}
                  title="Forcer Claude Sonnet"
                >
                  <Server className="w-3 h-3" />
                  <span>Claude</span>
                </button>
              </div>
            </div>

            {/* Right Control: Send Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={(!text.trim() && attachments.length === 0) || isLoading}
                className={`p-2 rounded-xl transition-all shadow-md flex items-center justify-center ${
                  (text.trim() || attachments.length > 0) && !isLoading
                    ? 'bg-[#d97706] hover:bg-[#b45309] text-white active:scale-95'
                    : 'bg-[#33312e] text-[#78716c] cursor-not-allowed'
                }`}
                title="Envoyer la commande"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Subtext */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-[#78716c]">
            OmniPC Assistant peut exécuter des commandes système locales et aiguiller vers Claude 3.5/3.7.
          </p>
        </div>
      </div>
    </div>
  );
};
