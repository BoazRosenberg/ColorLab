import React, { useState } from 'react';
import { RotateCcw, FileText, Terminal, BookOpen } from 'lucide-react';

interface RStudioShellProps {
  children: React.ReactNode;
  viewMode: 'split_ide' | 'narrow_pane' | 'package_inspector';
  setViewMode: (mode: 'split_ide' | 'narrow_pane' | 'package_inspector') => void;
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
    'R version 4.4.1 (2024-06-14) -- "Race for Your Life"',
    'Platform: x86_64-pc-linux-gnu',
    '> library(ColorLab)',
    '> run_colorlab()',
    'Running learnr tutorial in Tutorial Pane...',
  ]);
  const [consoleInput, setConsoleInput] = useState('');

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;
    const cmd = consoleInput.trim();
    let response = '';

    if (cmd === 'ls()' || cmd === 'ls') {
      response = '[1] "custom_palette" "iris" "my_shapes"';
    } else if (cmd.includes('packageVersion')) {
      response = '[1] \'0.1.0\'';
    } else {
      response = `[1] "Executed: ${cmd}"`;
    }

    setConsoleLogs(prev => [...prev, `> ${cmd}`, response]);
    setConsoleInput('');
  };

  // Narrow Pane only mode
  if (viewMode === 'narrow_pane') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start py-4 px-2">
        <div className="w-full max-w-[420px] bg-white border border-slate-300 rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-2rem)]">
          {/* Tutorial Pane Header Tab Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <BookOpen size={13} className="text-blue-600" />
              <span>Tutorial Pane</span>
              <span className="text-[10px] text-slate-500 font-mono">390px</span>
            </div>
            <button
              onClick={() => setViewMode('split_ide')}
              className="text-[11px] text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Show RStudio IDE
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col bg-white">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Classic Light RStudio IDE Theme
  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      {/* RStudio Menu Bar */}
      <div className="bg-slate-200/80 border-b border-slate-300 px-3 py-1 flex items-center justify-between text-[11px] text-slate-700 select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-sm bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">R</span>
            RStudio
          </span>
          <div className="hidden md:flex items-center gap-2.5 text-slate-600">
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

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 hidden sm:inline">Project: ColorLab</span>
          <button
            onClick={onOpenPackageModal}
            className="text-[10px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2 py-0.5 rounded cursor-pointer shadow-2xs"
          >
            Inspect R Package Files
          </button>
        </div>
      </div>

      {/* Main IDE Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side: Source Editor + Console (RStudio Light Aesthetic) */}
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
              <span className="text-slate-400"># Interactive Palette Design Script</span>
              <br />
              <span className="text-blue-700">library</span>(ggplot2)
              <br />
              <span className="text-blue-700">library</span>(ggpaletter)
              <br />
              <br />
              <span className="text-slate-400"># 1. Custom palette vector</span>
              <br />
              <span className="text-slate-800">my_colors</span> &lt;- <span className="text-emerald-700">c("#1F77B4", "#FF7F0E", "#2CA02C")</span>
              <br />
              <br />
              <span className="text-slate-400"># 2. Render plot with custom scale</span>
              <br />
              <span className="text-indigo-700">ggplot</span>(iris, <span className="text-indigo-700">aes</span>(x = Petal.Length, y = Petal.Width, color = Species)) +
              <br />
              &nbsp;&nbsp;<span className="text-indigo-700">geom_point</span>(size = 3.5) +
              <br />
              &nbsp;&nbsp;<span className="text-indigo-700">scale_color_manual</span>(values = my_colors) +
              <br />
              &nbsp;&nbsp;<span className="text-indigo-700">theme_minimal</span>()
            </div>
          </div>

          {/* Bottom-Left: R Console */}
          <div className="h-1/2 flex flex-col min-h-0 bg-white">
            <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-1.5 text-slate-800 font-mono text-[11px] font-medium">
                <Terminal size={12} className="text-emerald-600" />
                <span>Console</span>
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
                <div key={i} className={log.startsWith('>') ? 'text-blue-700 font-medium' : 'text-slate-600'}>
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
                placeholder="Type R expression..."
                className="flex-1 bg-transparent text-xs font-mono text-slate-800 focus:outline-none placeholder-slate-400"
              />
            </form>
          </div>
        </div>

        {/* Right Side: RStudio Tutorial Pane (Narrow-optimized: 380px to 420px wide) */}
        <div className="w-full lg:w-[400px] xl:w-[420px] flex flex-col bg-white border-l border-slate-300 shadow-sm overflow-hidden shrink-0">
          {/* RStudio Pane Tabs */}
          <div className="bg-slate-100 border-b border-slate-200 px-2 py-1 flex items-center justify-between text-xs select-none shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer hidden sm:inline">Files</span>
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer hidden sm:inline">Plots</span>
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer hidden sm:inline">Packages</span>
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer hidden sm:inline">Help</span>
              <span className="px-2.5 py-0.5 bg-white text-blue-700 font-semibold rounded-t border-t border-x border-slate-200 flex items-center gap-1 shadow-2xs">
                <BookOpen size={11} />
                Tutorial
              </span>
            </div>

            <span className="font-mono text-[10px] text-slate-500">learnr</span>
          </div>

          {/* learnr Progress & Topic Bar */}
          <div className="bg-slate-50/80 border-b border-slate-200 px-3 py-1 flex items-center justify-between text-[11px] shrink-0">
            <span className="font-medium text-slate-700">{activeTabLabel}</span>
            <button
              onClick={() => setConsoleLogs(prev => [...prev, '> Tutorial reset.'])}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Restart session"
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          </div>

          {/* Tutorial Pane Content Viewport (White Background) */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
