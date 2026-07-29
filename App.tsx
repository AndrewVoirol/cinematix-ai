
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { GeminiService } from './services/geminiService';
import { AspectRatio, ImageSize, GeneratedImage, AppState } from './types';


const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    prompt: "Photorealistic cinematic shot, street level view of a dense city midday, heavy rainstorm, volumetric clouds, dark overcast sky with bright zenith diffusion, ultra-realistic wet asphalt with puddles and mirror reflections, rain splashes on ground, high humidity haze, Mie scattering, cool color grade (6500k), shot on 35mm lens, f/2.8, deep shadows, high contrast, 8k resolution, Unreal Engine 5.4 render style.",
    images: [],
    isGenerating: false,
    isRefining: false,
    error: null,
    selectedModel: "gemini-2.5-flash-image",
    aspectRatio: AspectRatio.LANDSCAPE,
    imageSize: ImageSize.K1,
  });

  const handleRefine = async () => {
    if (!state.prompt.trim() || state.isRefining) return;
    
    setState(prev => ({ ...prev, isRefining: true, error: null }));
    try {
      const refined = await GeminiService.refinePrompt(state.prompt);
      setState(prev => ({ ...prev, prompt: refined, isRefining: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isRefining: false, 
        error: `Refinement failed: ${err.message}` 
      }));
    }
  };

  const handleGenerate = async () => {
    if (!state.prompt.trim() || state.isGenerating) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const imageUrl = await GeminiService.generateImage(
        state.prompt,
        state.selectedModel,
        state.aspectRatio,
        state.selectedModel === "gemini-3-pro-image-preview" ? state.imageSize : undefined
      );

      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substring(2, 11),
        url: imageUrl,
        prompt: state.prompt,
        timestamp: Date.now(),
        config: {
          aspectRatio: state.aspectRatio,
          imageSize: state.selectedModel === "gemini-3-pro-image-preview" ? state.imageSize : undefined,
          model: state.selectedModel,
        },
      };

      setState(prev => ({
        ...prev,
        images: [newImage, ...prev.images],
        isGenerating: false,
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: `Generation failed: ${err.message}` 
      }));
    }
  };

  const deleteImage = (id: string) => {
    setState(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };

  return (
    <Layout>
      <div className="h-full flex flex-col md:flex-row">
        {/* Left Control Panel */}
        <div className="w-full md:w-[400px] border-r border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Model Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Engine Model</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setState(prev => ({ ...prev, selectedModel: "gemini-2.5-flash-image" }))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    state.selectedModel === "gemini-2.5-flash-image" 
                    ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" 
                    : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600"
                  }`}
                >
                  Flash 2.5
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, selectedModel: "gemini-3-pro-image-preview" }))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    state.selectedModel === "gemini-3-pro-image-preview" 
                    ? "bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]" 
                    : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600"
                  }`}
                >
                  Pro 3 (Paid Key)
                </button>
              </div>
            </div>

            {/* Prompt Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cinematic Prompt</label>
                <button 
                  onClick={handleRefine}
                  disabled={state.isRefining || !state.prompt}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 disabled:opacity-50 flex items-center gap-1"
                >
                  <i className={`fas fa-wand-magic-sparkles ${state.isRefining ? 'animate-spin' : ''}`}></i>
                  {state.isRefining ? 'Refining...' : 'AI Refine'}
                </button>
              </div>
              <textarea
                value={state.prompt}
                onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Describe your scene..."
                className="w-full h-48 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Config Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aspect Ratio</label>
                <select 
                  value={state.aspectRatio}
                  onChange={(e) => setState(prev => ({ ...prev, aspectRatio: e.target.value as AspectRatio }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                >
                  {Object.values(AspectRatio).map(ratio => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-semibold uppercase tracking-wider ${state.selectedModel === 'gemini-2.5-flash-image' ? 'text-slate-600' : 'text-slate-400'}`}>Resolution</label>
                <select 
                  disabled={state.selectedModel === 'gemini-2.5-flash-image'}
                  value={state.imageSize}
                  onChange={(e) => setState(prev => ({ ...prev, imageSize: e.target.value as ImageSize }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {Object.values(ImageSize).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            {state.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-[10px] text-red-400 flex gap-2">
                <i className="fas fa-exclamation-circle mt-0.5"></i>
                <span>{state.error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={state.isGenerating || !state.prompt}
              className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 
                bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_30px_rgba(79,70,229,0.5)]"
            >
              {state.isGenerating ? (
                <>
                  <i className="fas fa-circle-notch animate-spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-play"></i>
                  Render Masterpiece
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview/Gallery Area */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
          {state.images.length === 0 && !state.isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center text-3xl">
                <i className="fas fa-mountain"></i>
              </div>
              <p className="text-sm font-medium">Your generated masterpieces will appear here</p>
              <p className="text-xs text-slate-700 max-w-xs text-center leading-relaxed">
                Use the AI Refine tool to enhance simple prompts into professional cinematic descriptions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
              {state.isGenerating && (
                <div className="aspect-[16/9] w-full bg-slate-900 rounded-2xl border border-indigo-500/30 overflow-hidden flex flex-col items-center justify-center space-y-4 animate-pulse">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <i className="fas fa-camera absolute inset-0 flex items-center justify-center text-indigo-500/40 text-xs"></i>
                  </div>
                  <div className="text-center">
                    <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.2em]">Capturing Light</p>
                    <p className="text-[10px] text-slate-500 mt-1 italic">Synthesizing cinematic atmosphere...</p>
                  </div>
                </div>
              )}
              {state.images.map((img) => (
                <div key={img.id} className="group relative glass rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all">
                  <img 
                    src={img.url} 
                    alt={img.prompt} 
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded text-slate-300 border border-slate-700">
                          {img.config.aspectRatio}
                        </span>
                        <span className={`text-[10px] px-2 py-1 rounded border ${
                          img.config.model.includes('pro') 
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                            : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        }`}>
                          {img.config.model.includes('pro') ? 'PRO 3' : 'FLASH 2.5'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = img.url;
                            link.download = `cinematix-${img.id}.png`;
                            link.click();
                          }}
                          className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-white hover:text-slate-950 transition-colors flex items-center justify-center"
                        >
                          <i className="fas fa-download text-xs"></i>
                        </button>
                        <button 
                          onClick={() => deleteImage(img.id)}
                          className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors flex items-center justify-center"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] text-slate-400 line-clamp-2 leading-relaxed italic">
                      "{img.prompt}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
