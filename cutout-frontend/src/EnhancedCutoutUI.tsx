import React, { useMemo, useRef, useState, useEffect } from "react";

const DEFAULT_API = import.meta?.env?.VITE_API_URL || "http://localhost:8000";

type TabType = "cutout" | "enhance" | "detect" | "combined";

export default function EnhancedCutoutUI() {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("cutout");
  
  // Cutout settings
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [alphaMatting, setAlphaMatting] = useState<boolean>(false);

  // Enhancement settings
  const [enhanceType, setEnhanceType] = useState<string>("upscale");
  const [upscaleFactor, setUpscaleFactor] = useState<number>(4);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(10);

  // Detection settings
  const [detectConfidence, setDetectConfidence] = useState<number>(0.25);

  // Combined processing
  const [removeBg, setRemoveBg] = useState<boolean>(true);
  const [upscale, setUpscale] = useState<boolean>(false);
  const [denoise, setDenoise] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageInfo, setImageInfo] = useState<{width: number, height: number, size: string} | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (file && previewUrl) {
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.width,
          height: img.height,
          size: (file.size / 1024 / 1024).toFixed(2)
        });
      };
      img.src = previewUrl;
    } else {
      setImageInfo(null);
    }
  }, [file, previewUrl]);

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) {
      setFile(f);
      setError(null);
    } else {
      setError("Please upload a valid image file");
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleProcess() {
    if (!file) {
      setError("Please upload an image first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResultUrl(null);

      const form = new FormData();
      form.append("file", file);

      let endpoint = "";

      if (activeTab === "cutout") {
        endpoint = "/cutout";
        if (width) form.append("width", width);
        if (height) form.append("height", height);
        form.append("alpha_matting", alphaMatting.toString());
      } else if (activeTab === "enhance") {
        if (enhanceType === "upscale") {
          endpoint = "/ai/upscale";
          form.append("scale", upscaleFactor.toString());
        } else if (enhanceType === "denoise") {
          endpoint = "/ai/denoise";
          form.append("strength", denoiseStrength.toString());
        } else if (enhanceType === "auto") {
          endpoint = "/ai/auto-enhance";
        } else if (enhanceType === "sharpen") {
          endpoint = "/ai/sharpen";
          form.append("amount", "1.0");
        }
      } else if (activeTab === "detect") {
        endpoint = "/ai/detect";
        form.append("confidence", detectConfidence.toString());
        form.append("visualize", "true");
      } else if (activeTab === "combined") {
        endpoint = "/ai/process-all";
        form.append("remove_bg", removeBg.toString());
        form.append("upscale", upscale.toString());
        form.append("denoise", denoise.toString());
        form.append("upscale_factor", upscaleFactor.toString());
      }

      const res = await fetch(`${apiUrl.replace(/\/$/, "")}${endpoint}`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let detail = `${res.status} ${res.statusText}`;
        try {
          const j = await res.json();
          if (j?.detail) detail = j.detail;
        } catch (_) {}
        throw new Error(detail);
      }

      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setFile(null);
    setResultUrl(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-block mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Cutout AI Studio
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            AI-powered image processing: background removal, enhancement, object detection, and more
          </p>
        </header>

        {/* Feature Tabs */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => setActiveTab("cutout")}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "cutout"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🎨 Background</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab("enhance")}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "enhance"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>✨ Enhance</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab("detect")}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "detect"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🔍 Detect</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab("combined")}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "combined"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>⚡ All-in-One</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-5 space-y-5 sticky top-6">
              {/* File Upload */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-slate-700">Upload Image</label>
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : file 
                        ? 'border-emerald-400 bg-emerald-50' 
                        : 'border-slate-300 hover:border-indigo-400'
                  }`}
                  onClick={() => inputRef.current?.click()}
                >
                  {file ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-slate-700 truncate">{file.name}</div>
                      {imageInfo && (
                        <div className="text-xs text-slate-500">
                          {imageInfo.width} × {imageInfo.height} px • {imageInfo.size} MB
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-slate-700 font-medium">
                        {isDragging ? 'Drop here' : 'Drag & drop or click'}
                      </div>
                      <div className="text-xs text-slate-500">PNG, JPG, WebP</div>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Tab-specific Settings */}
              <div className="space-y-4">
                {activeTab === "cutout" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-700">Width</label>
                        <input
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          placeholder="Auto"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-700">Height</label>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="Auto"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={alphaMatting}
                        onChange={(e) => setAlphaMatting(e.target.checked)}
                        className="rounded"
                      />
                      Alpha Matting (better edges, slower)
                    </label>
                  </>
                )}

                {activeTab === "enhance" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-slate-700">Enhancement Type</label>
                      <select
                        value={enhanceType}
                        onChange={(e) => setEnhanceType(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="upscale">AI Upscale</option>
                        <option value="denoise">Denoise</option>
                        <option value="auto">Auto Enhance</option>
                        <option value="sharpen">Sharpen</option>
                      </select>
                    </div>
                    
                    {enhanceType === "upscale" && (
                      <div>
                        <label className="block text-xs font-semibold mb-2 text-slate-700">Scale Factor</label>
                        <select
                          value={upscaleFactor}
                          onChange={(e) => setUpscaleFactor(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value={2}>2x (Double)</option>
                          <option value={4}>4x (Quadruple)</option>
                        </select>
                      </div>
                    )}
                    
                    {enhanceType === "denoise" && (
                      <div>
                        <label className="block text-xs font-semibold mb-2 text-slate-700">Strength: {denoiseStrength}</label>
                        <input
                          type="range"
                          min="3"
                          max="20"
                          value={denoiseStrength}
                          onChange={(e) => setDenoiseStrength(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                  </>
                )}

                {activeTab === "detect" && (
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-700">
                      Confidence: {detectConfidence.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={detectConfidence}
                      onChange={(e) => setDetectConfidence(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Detects 80+ object classes with YOLO v8
                    </p>
                  </div>
                )}

                {activeTab === "combined" && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-700">Select Features:</p>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={removeBg}
                        onChange={(e) => setRemoveBg(e.target.checked)}
                        className="rounded"
                      />
                      Remove Background
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={upscale}
                        onChange={(e) => setUpscale(e.target.checked)}
                        className="rounded"
                      />
                      Upscale {upscaleFactor}x
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={denoise}
                        onChange={(e) => setDenoise(e.target.checked)}
                        className="rounded"
                      />
                      Denoise
                    </label>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleProcess}
                  disabled={loading || !file}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-lg"
                >
                  {loading ? "Processing..." : "Process Image"}
                </button>
                <button
                  onClick={resetAll}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Preview & Result */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <h2 className="font-semibold text-slate-800">Original Image</h2>
              </div>
              <div className="p-5">
                <div className="min-h-[350px] max-h-[55vh] bg-[repeating-conic-gradient(#f8fafc_0_25%,#e2e8f0_0_50%)] bg-[length:20px_20px] rounded-xl flex items-center justify-center overflow-auto p-4 border-2 border-slate-200">
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="max-w-full h-auto rounded-lg shadow-lg" />
                  ) : (
                    <div className="text-center text-slate-500 text-sm">No image selected</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                <h2 className="font-semibold text-slate-800">Processed Result</h2>
              </div>
              <div className="p-5">
                <div className="min-h-[350px] max-h-[55vh] bg-[repeating-conic-gradient(#f8fafc_0_25%,#e2e8f0_0_50%)] bg-[length:20px_20px] rounded-xl flex items-center justify-center overflow-auto p-4 border-2 border-slate-200">
                  {loading ? (
                    <div className="text-center">
                      <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <div className="text-slate-600 font-medium">Processing...</div>
                    </div>
                  ) : resultUrl ? (
                    <img src={resultUrl} alt="result" className="max-w-full h-auto rounded-lg shadow-lg" />
                  ) : (
                    <div className="text-center text-slate-500 text-sm">Process an image to see results</div>
                  )}
                </div>

                {resultUrl && (
                  <div className="mt-5">
                    <a
                      href={resultUrl}
                      download="result.png"
                      className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 shadow-lg inline-block text-center"
                    >
                      📥 Download Result
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-slate-600">
          <p>Powered by AI: YOLO v8 • SAM • RealESRGAN • Rembg</p>
        </footer>
      </div>
    </div>
  );
}
