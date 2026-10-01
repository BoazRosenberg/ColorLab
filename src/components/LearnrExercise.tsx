import React, { useState } from 'react';
import { Play, CheckCircle2, Terminal } from 'lucide-react';

interface LearnrExerciseProps {
  currentPaletteCode: string;
}

export const LearnrExercise: React.FC<LearnrExerciseProps> = ({ currentPaletteCode }) => {
  const [code, setCode] = useState(
    `ggplot(iris, aes(Petal.Length, Petal.Width, color = Species)) +\n  geom_point(size = 3) +\n  ${currentPaletteCode || 'scale_color_viridis_d()'}`
  );
  const [outputMessage, setOutputMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setOutputMessage(null);
    setTimeout(() => {
      setIsRunning(false);
      setOutputMessage('✓ Executed in RStudio session');
    }, 350);
  };

  const handleSyncCode = () => {
    setCode(
      `ggplot(iris, aes(Petal.Length, Petal.Width, color = Species)) +\n  geom_point(size = 3) +\n  ${currentPaletteCode}`
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5 shadow-2xs">
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <Terminal size={12} className="text-slate-500" />
          <span>Exercise</span>
        </div>
        <button
          onClick={handleSyncCode}
          className="text-[10px] text-blue-600 hover:text-blue-800 cursor-pointer"
          title="Insert current active scale into code"
        >
          Sync Scale
        </button>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={3}
        className="w-full bg-slate-50 text-slate-900 font-mono text-[11px] p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
      />

      <div className="flex items-center justify-between">
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1 rounded transition-colors cursor-pointer"
        >
          <Play size={10} className={isRunning ? 'animate-spin' : ''} />
          <span>{isRunning ? 'Running...' : 'Run Code'}</span>
        </button>

        {outputMessage && (
          <span className="text-[10px] text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={11} />
            {outputMessage}
          </span>
        )}
      </div>
    </div>
  );
};
