import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, Bug } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedRun, setCopiedRun] = useState(false);

  if (!isOpen) return null;

  const installCode = `remotes::install_github("BoazRosenberg/ColorLab")`;
  const runCode = `library(ColorLab)\n# Or:\ncolorlab()`;

  const copyToClipboard = (text: string, type: 'install' | 'run') => {
    navigator.clipboard.writeText(text);
    if (type === 'install') {
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2000);
    } else {
      setCopiedRun(true);
      setTimeout(() => setCopiedRun(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-900">ColorLab</h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium border border-slate-200">
                v0.2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Boaz Rosenberg © 2026
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 text-xs text-slate-600">
          {/* Minimal description */}
          <p className="text-slate-700 leading-relaxed text-[12px]">
            ColorLab is an interactive color palette, shape, and ggplot theme designer for R, aimed to help users manage their color palletes and plot designs.
          </p>

          {/* Installation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <Terminal size={12} className="text-slate-500" />
                Install
              </span>
              <button
                onClick={() => copyToClipboard(installCode, 'install')}
                className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                {copiedInstall ? (
                  <>
                    <Check size={11} className="text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-900 text-slate-100 rounded-md px-2.5 py-2 font-mono text-[11px] overflow-x-auto">
              <span className="text-emerald-400">remotes::install_github(&quot;BoazRosenberg/ColorLab&quot;)</span>
            </div>
          </div>

          {/* How to Run */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">
                Run
              </span>
              <button
                onClick={() => copyToClipboard(runCode, 'run')}
                className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                {copiedRun ? (
                  <>
                    <Check size={11} className="text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-900 text-slate-100 rounded-md px-2.5 py-2 font-mono text-[11px] space-y-0.5 overflow-x-auto">
              <div><span className="text-blue-300">library(ColorLab)</span> <span className="text-slate-500 text-[10px]"># launches directly</span></div>
              <div><span className="text-amber-300">colorlab()</span> <span className="text-slate-500 text-[10px]"># or run explicitly</span></div>
            </div>
          </div>

          {/* Feedback & Bug Reporting */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <a
              href="https://github.com/BoazRosenberg/ColorLab/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-blue-600 inline-flex items-center gap-1.5 transition-colors font-medium"
            >
              <Bug size={12} className="text-rose-500" />
              <span>Found a bug or something broken? Report on GitHub</span>
              <ExternalLink size={10} className="text-slate-400" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md text-xs cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
