import React, { useState } from 'react';
import { RotateCcw, FileText, Terminal, LayoutDashboard } from 'lucide-react';
import { ViewMode } from '../types/palette';

interface RStudioShellProps {
  children: React.ReactNode;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenPackageModal: () => void;
  activeTabLabel: string;
}

export const RStudioShell: React.FC<RStudioShellProps> = ({
  children,
  viewMode,
  setViewMode,
  onOpenPackageModal,
  activeTabLabel,
}) => {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'R version 4.5.0 (2025-04-24) -- "Spring Cleaning"',
    'Platform: x86_64-w64-mingw32/x64 (64-bit)',
    '> library(ColorLab)',
    '> colorlab()',
    '✔ ColorLab launched in RStudio Viewer Pane.',
    '  Console remains free. Run code below while ColorLab is open!',
  ]);
  const [consoleInput, setConsoleInput] = useState('');

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;
    const cmd = consoleInput.trim();
    let response = '';

    if (cmd === 'colorlab()' || cmd === 'run_colorlab()') {
      response = '✔ ColorLab active in Viewer pane.';
    } else if (cmd === 'colorlab_stop()') {
      response = 'ColorLab background server stopped.';
    } else if (cmd === 'ls()' || cmd === 'ls') {
      response = '[1] "my_palette" "iris" "p"';
    } else if (cmd.includes('packageVersion')) {
      response = '[1] \'0.2.0\'';
    } else {
      response = `[1] "Executed: ${cmd}"`;
    }

    setConsoleLogs(prev => [...prev, `> ${cmd}`, response]);
    setConsoleInput('');
  };

  // Narrow standalone Viewer pane mode
  if (viewMode === 'narrow_pane') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start py-4 px-2">
        <div className="w-full max-w-[440px] bg-white border border-slate-300 rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-2rem)]">
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <LayoutDashboard size={13} className="text-blue-600" />
              <span>ColorLab</span>
              <span className="text-[10px] text-slate-500 font-mono">Viewer Pane (390px)</span>
            </div>
            <button
              onClick={() => setViewMode('split_ide')}
              className="text-[11px] text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Full RStudio View
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 bg-white">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-200 text-slate-800 overflow-hidden font-sans select-none">
      {/* Top Menu Bar (RStudio Theme) */}
      <div className="bg-slate-100 border-b border-slate-300 px-2 py-1 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-bold text-slate-800">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white text-[9px] flex items-center justify-center font-mono">R</span>
            <span>RStudio</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-600 text-[11px]">
            <span className="hover:text-slate-900 cursor-pointer">File</span>
            <span className="hover:text-slate-900 cursor-pointer">Edit</span>
            <span className="hover:text-slate-900 cursor-pointer">Code</span>
            <span className="hover:text-slate-900 cursor-pointer">Plots</span>
            <span className="hover:text-slate-900 cursor-pointer">Session</span>
            <span className="hover:text-slate-900 cursor-pointer">Build</span>
            <span className="hover:text-slate-900 cursor-pointer">Tools</span>
            <span className="hover:text-slate-900 cursor-pointer">Help</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono hidden md:inline">
            Non-Blocking: Console Active
          </span>
          <button
            onClick={onOpenPackageModal}
            className="text-[10px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2 py-0.5 rounded cursor-pointer shadow-2xs font-medium"
          >
            R Package Files
          </button>
        </div>
      </div>

      {/* Main IDE Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side: Source Editor + Interactive Console */}
        <div className="flex-1 hidden lg:flex flex-col border-r border-slate-300 bg-white min-w-0">
          {/* Top-Left: Source Editor tab */}
          <div className="h-1/2 flex flex-col border-b border-slate-300 min-h-0">
            <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-1.5 text-slate-800 font-mono text-[11px] font-medium">
                <FileText size={12} className="text-amber-600" />
                <span>analysis.R</span>
              </div>
              <span className="text-[10px] text-slate-500">R Script</span>
            </div>

            <div className="flex-1 p-3 font-mono text-[11px] leading-relaxed text-slate-700 overflow-y-auto bg-white">
              <span className="text-slate-400"># 1. Load libraries</span>
              <br />
              <span className="text-blue-700">library</span>(ggplot2)
              <br />
              <span className="text-blue-700">library</span>(ColorLab)
              <br />
              <br />
              <span className="text-slate-400"># 2. Launch ColorLab in Viewer pane (does not block console!)</span>
              <br />
              <span className="text-blue-700 font-semibold">colorlab()</span>
              <br />
              <br />
              <span className="text-slate-400"># 3. Use your palette in ggplot2 (paste code copied from ColorLab):</span>
              <br />
              <span className="text-indigo-700">ggplot</span>(iris, <span className="text-indigo-700">aes</span>(x = Petal.Length, y = Petal.Width, color = Species)) +
              <br />
              &nbsp;&nbsp;<span className="text-indigo-700">geom_point</span>(size = 3.5) +
              <br />
              &nbsp;&nbsp;<span className="text-indigo-700 font-semibold">scale_color_discrete</span>(type = <span className="text-indigo-700">palette.colors</span>(palette = <span className="text-emerald-700">"Okabe-Ito"</span>)) +
              <br />
              &nbsp;&nbsp;<span className="text-indigo-700">theme_minimal</span>()
            </div>
          </div>

          {/* Bottom-Left: R Console (Live & Unblocked) */}
          <div className="h-1/2 flex flex-col min-h-0 bg-white">
            <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-1.5 text-slate-800 font-mono text-[11px] font-medium">
                <Terminal size={12} className="text-emerald-600" />
                <span>Console (Unblocked)</span>
              </div>
              <button
                onClick={() => setConsoleLogs(['> Console cleared.'])}
                className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 p-2 font-mono text-[11px] text-slate-700 overflow-y-auto space-y-0.5 bg-white">
              {consoleLogs.map((log, i) => (
                <div key={i} className={log.startsWith('>') ? 'text-blue-700 font-medium' : log.startsWith('✔') ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
                  {log}
                </div>
              ))}
            </div>

            <form onSubmit={handleConsoleSubmit} className="border-t border-slate-200 p-1.5 flex items-center gap-1 bg-slate-50">
              <span className="text-blue-600 font-mono font-bold text-xs pl-1">&gt;</span>
              <input
                type="text"
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                placeholder="Type R expression (e.g. colorlab(), ls())..."
                className="flex-1 bg-transparent text-xs font-mono text-slate-800 focus:outline-none placeholder-slate-400"
              />
            </form>
          </div>
        </div>

        {/* Right Side: RStudio Viewer Pane (400px to 440px wide) */}
        <div className="w-full lg:w-[410px] xl:w-[430px] flex flex-col bg-white border-l border-slate-300 shadow-sm overflow-hidden shrink-0">
          {/* RStudio Pane Tabs */}
          <div className="bg-slate-100 border-b border-slate-200 px-2 py-1 flex items-center justify-between text-xs select-none shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer hidden sm:inline">Files</span>
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer hidden sm:inline">Plots</span>
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer hidden sm:inline">Packages</span>
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer hidden sm:inline">Help</span>
              <span className="px-2.5 py-0.5 bg-white text-blue-700 font-semibold rounded-t border-t border-x border-slate-200 flex items-center gap-1 shadow-2xs">
                <LayoutDashboard size={11} className="text-blue-600" />
                Viewer
              </span>
            </div>

            <span className="font-mono text-[10px] text-emerald-600 font-medium">colorlab()</span>
          </div>

          {/* Subheader Bar */}
          <div className="bg-slate-50/80 border-b border-slate-200 px-3 py-1 flex items-center justify-between text-[11px] shrink-0">
            <span className="font-medium text-slate-700">{activeTabLabel}</span>
            <button
              onClick={() => setConsoleLogs(prev => [...prev, '> colorlab() refreshed.'])}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Refresh Viewer"
            >
              <RotateCcw size={10} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Viewer Pane Content Viewport */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
