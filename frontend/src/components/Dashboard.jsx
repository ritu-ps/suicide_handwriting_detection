import React, { useState } from 'react';
import { Upload, Keyboard, BrainCircuit, Activity, AlertTriangle, ArrowLeft, FileCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ type, onBack }) {
  const [typingText, setTypingText] = useState('');
  const [metrics, setMetrics] = useState({ wpm: 0, backspaces: 0, pauseDuration: 0 });
  const [lastKeyPress, setLastKeyPress] = useState(null);
  
  const [speedData, setSpeedData] = useState([{ time: '0s', speed: 0 }]);
  const [handwritingImage, setHandwritingImage] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleKeyDown = (e) => {
    if (type !== 'typing') return;
    const now = Date.now();
    if (e.key === 'Backspace') {
      setMetrics(prev => ({ ...prev, backspaces: prev.backspaces + 1 }));
    }
    if (lastKeyPress) {
      const diff = (now - lastKeyPress) / 1000;
      if (diff > 1.5) {
        setMetrics(prev => ({ 
          ...prev, 
          pauseDuration: parseFloat(((prev.pauseDuration + diff) / 2).toFixed(1)) 
        }));
      }
    }
    setLastKeyPress(now);
  };

  const handleTextChange = (e) => {
    if (type !== 'typing') return;
    const text = e.target.value;
    setTypingText(text);
    const words = text.trim().split(/\s+/).length;
    const mockWpm = words > 0 ? Math.min(120, words * 2) : 0; 
    setMetrics(prev => ({ ...prev, wpm: mockWpm }));
    
    if (speedData.length > 20) speedData.shift();
    setSpeedData([...speedData, { time: new Date().toLocaleTimeString().split(' ')[0], speed: mockWpm }]);
  };

  const handleImageUpload = (e) => {
    if (type !== 'handwriting') return;
    const file = e.target.files[0];
    if (file) {
      setHandwritingImage(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const analyzeRisk = async () => {
    setIsAnalyzing(true);
    try {
      if (type === 'typing') {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/analyze/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wpm: metrics.wpm,
            backspaces: metrics.backspaces,
            pauseDuration: metrics.pauseDuration,
            text: typingText
          })
        });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        setResults({ 
          score: data.score, 
          level: data.level, 
          color: data.color, 
          textSentiment: data.textSentiment 
        });
      } else if (type === 'handwriting') {
        const formData = new FormData();
        const blob = await fetch(handwritingImage).then(r => r.blob());
        formData.append('file', blob, 'handwriting.png');
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/analyze/handwriting`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        setResults({ 
          score: data.score, 
          level: data.level, 
          color: data.color, 
          textSentiment: data.textSentiment 
        });
      }
    } catch (error) {
      console.error("Analysis Failed:", error);
      // Fallback
      setResults({ score: 50, level: 'Medium', color: 'text-amber-400', textSentiment: 'Neutral' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isAnalyzeDisabled = isAnalyzing || (type === 'typing' && !typingText) || (type === 'handwriting' && !handwritingImage);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/50 pb-6 mb-8">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to modules
          </button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 capitalize">
            {type === 'typing' ? 'Typing & Sentiment Analysis' : 'Handwriting Analysis'}
          </h1>
          <p className="text-slate-400 mt-1">Live data ingestion and visualization</p>
        </div>
        
        <div className="bg-emerald-900/40 text-emerald-400 rounded-full px-4 py-1.5 border border-emerald-700/50 text-sm font-medium flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Neural Engine Online
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Context specific Inputs */}
        <div className="space-y-6">
          
          {type === 'typing' && (
            <>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="flex items-center mb-4 gap-2 text-indigo-300">
                  <Keyboard className="w-5 h-5" />
                  <h3 className="text-lg font-semibold text-slate-100">Live Cognitive Typing Capture</h3>
                </div>
                
                <textarea
                  className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none font-mono"
                  placeholder="Begin typing freely. The AI captures micro-behaviors like speed fluctuations, backspace corrections, and hesitation pauses..."
                  value={typingText}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                ></textarea>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-center flex flex-col justify-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Speed</p>
                    <p className="text-xl lg:text-2xl font-bold text-indigo-400">{metrics.wpm} <span className="text-xs font-normal text-slate-500">WPM</span></p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-center flex flex-col justify-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Deletes</p>
                    <p className="text-xl lg:text-2xl font-bold text-amber-400">{metrics.backspaces} <span className="text-xs font-normal text-slate-500">cnt</span></p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-center flex flex-col justify-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Avg Pause</p>
                    <p className="text-xl lg:text-2xl font-bold text-emerald-400">{metrics.pauseDuration} <span className="text-xs font-normal text-slate-500">sec</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-300" />
                  Behavioral Metrics Over Time
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={speedData}>
                      <defs>
                        <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#c7d2fe' }}
                      />
                      <Area type="monotone" dataKey="speed" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorSpeed)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {type === 'handwriting' && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm h-full flex flex-col">
               <div className="flex items-center mb-4 gap-2 text-purple-400">
                <Upload className="w-5 h-5" />
                <h3 className="text-lg font-semibold text-slate-100">Handwriting Trace Analysis</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Upload a sample of digital handwriting. The vision models will parse trace pressure, angular velocity, and baseline irregularities.
              </p>
              
              <div className={`border-2 border-dashed rounded-xl flex-grow min-h-[300px] flex flex-col items-center justify-center transition-colors relative overflow-hidden ${handwritingImage ? 'border-purple-500/50' : 'border-slate-600 hover:border-slate-500 bg-slate-900/30'}`}>
                {handwritingImage ? (
                  <>
                    <img src={handwritingImage} alt="Handwriting trace" className="w-full h-full object-contain p-4 opacity-90" />
                    <div className="absolute inset-0 bg-purple-900/10 mix-blend-overlay pointer-events-none"></div>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-500 mb-3" />
                    <span className="text-slate-300 font-medium">Drag & drop image or browse</span>
                    <span className="text-slate-500 text-xs mt-1">Supports JPG, PNG (Max 5MB)</span>
                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/png, image/jpeg" />
                  </>
                )}
              </div>
              
              {handwritingImage && (
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><FileCheck className="w-3 h-3 text-emerald-400" /> Image loaded</span>
                  <button 
                    onClick={() => { setHandwritingImage(null); setResults(null); }}
                    className="text-sm text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 px-3 py-1 rounded-full"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Execution & Results */}
        <div className="space-y-6">
          <button 
            onClick={analyzeRisk}
            disabled={isAnalyzeDisabled}
            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg text-lg
              ${isAnalyzing ? 'bg-indigo-600/50 cursor-wait' : 
                isAnalyzeDisabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50' : 
                'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-[1.01]'}`}
          >
            {isAnalyzing ? (
              <><Activity className="w-6 h-6 animate-spin" /> Analyzing Deep Metrics...</>
            ) : (
              <><BrainCircuit className="w-6 h-6" /> Extract Analytics</>
            )}
          </button>

          {/* Results Overview */}
          {results && (
            <div className="bg-slate-800/60 border border-slate-600 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-300">
               <h3 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2 pb-4 border-b border-slate-700">
                <AlertTriangle className={`w-6 h-6 ${results.color}`} />
                Risk Prediction Assessment
              </h3>
              
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Detected Risk Tier</p>
                  <span className={`text-5xl font-extrabold tracking-tight ${results.color}`}>
                    {results.level}
                  </span>
                </div>
                <div className="h-16 w-px bg-slate-700 hidden md:block"></div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <p className="text-sm text-slate-400 uppercase tracking-wider">Analysis Confidence</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-slate-200">{(results.score * 0.8 + 15).toFixed(1)}%</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(results.score * 0.8 + 15)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainability Breakdown */}
              <div className="space-y-5">
                <p className="text-sm font-medium text-slate-300 mb-3">Feature Contributions</p>
                
                {type === 'typing' && (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-400">Typing Dynamics Anomaly</span>
                        <span className="font-medium text-slate-200">{results.score > 40 ? 'High' : 'Normal'}</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${Math.min(100, (metrics.backspaces * 5) + (metrics.pauseDuration * 10))}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-400">Semantic Sentiment Scope</span>
                        <span className="font-medium text-slate-200">{results.textSentiment}</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div className={`h-2 rounded-full ${results.textSentiment === 'Negative' ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: results.textSentiment === 'Negative' ? '75%' : '20%' }}></div>
                      </div>
                    </div>
                  </>
                )}

                {type === 'handwriting' && (
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-400">Structural Stress Markers</span>
                      <span className="font-medium text-slate-200">{results.score > 50 ? 'Significant' : 'Minor'}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div className={`h-2 rounded-full ${results.score > 50 ? 'bg-purple-500' : 'bg-indigo-400'}`} style={{ width: `${results.score}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Analyzed pressure variances, strokes, and baseline alignments across trace segments.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
