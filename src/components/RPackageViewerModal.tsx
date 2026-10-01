import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Folder, Terminal } from 'lucide-react';
import { R_PACKAGE_FILES, downloadRPackageZip } from '../utils/rPackageGenerator';

interface RPackageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RPackageViewerModal: React.FC<RPackageViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    'inst/tutorials/palette_designer/palette_designer.Rmd'
  );
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const currentFile = R_PACKAGE_FILES.find(f => f.path === selectedFilePath) || R_PACKAGE_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      await downloadRPackageZip();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-100">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
              R
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-900">
                R Package Sources (ColorLab)
              </h2>
              <p className="text-[10px] text-slate-500">
                github.com/BoazRosenberg/ColorLab · runtime: shiny_prerendered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Download size={12} />
              <span>{downloading ? 'Exporting...' : 'Download .zip'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex min-h-0">
          {/* File sidebar */}
          <div className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-2 border-b border-slate-200 text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Folder size={12} className="text-blue-600" />
              <span>Package Files</span>
            </div>
            <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
              {R_PACKAGE_FILES.map(file => {
                const isSelected = file.path === selectedFilePath;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <FileCode size={12} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="truncate font-mono text-[10px]">{file.path}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-2 border-t border-slate-200 bg-white text-[10px] text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Terminal size={11} className="text-emerald-600" />
                Install via R
              </span>
              <p className="font-mono text-[9px] bg-slate-50 p-1 rounded border border-slate-200 text-slate-800 select-all leading-tight">
                remotes::install_github("BoazRosenberg/ColorLab")
              </p>
              <p className="font-mono text-[9px] bg-slate-50 p-1 rounded border border-slate-200 text-slate-800 select-all leading-tight">
                ColorLab::run_colorlab()
              </p>
            </div>
          </div>

          {/* Code viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-800 font-medium truncate">
                {currentFile.path}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-3 font-mono text-[11px] text-slate-800 leading-relaxed bg-white">
              <pre className="select-all whitespace-pre-wrap">{currentFile.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
