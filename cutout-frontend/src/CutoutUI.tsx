import React, { useMemo, useRef, useState, useEffect } from "react";

/**
 * Drop this component into any React app (Vite/CRA/Next.js client page).
 * Tailwind is used for styling; if you don't have it, replace classes or add your own CSS.
 *
 * API: set the endpoint in `API_URL` or via the input field.
 */

const DEFAULT_API = import.meta?.env?.VITE_API_URL || "http://localhost:8000";

export default function CutoutUI() {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API);
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [mode, setMode] = useState<"contain" | "cover">("contain");
  const [alphaMatting, setAlphaMatting] = useState<boolean>(false);
  const [feather, setFeather] = useState<string>("2");
  const [pad, setPad] = useState<string>("0");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [imageInfo, setImageInfo] = useState<{width: number, height: number, size: string} | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  // Get image dimensions and size when file changes
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

  function onBrowse() {
    inputRef.current?.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultUrl(null);
    if (!file) {
      setError("Please choose an image file first.");
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("file", file);
      if (width) form.append("width", width);
      if (height) form.append("height", height);
      form.append("mode", mode);
      form.append("alpha_matting", alphaMatting ? "true" : "false");
      if (feather) form.append("feather", feather);
      if (pad) form.append("pad", pad);

      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/cutout`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        // try to parse JSON error
        let detail = `${res.status} ${res.statusText}`;
        try {
          const j = await res.json();
          if (j?.detail) detail = j.detail;
        } catch (_) {}
        throw new Error(detail);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 text-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-block mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Cutout Studio
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            Remove backgrounds instantly with AI-powered precision. Upload your image and get a transparent PNG in seconds.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <form onSubmit={handleSubmit} className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-5 space-y-5 sticky top-6">
              <div className="pb-4 border-b border-slate-200">
                <details className="group">
                  <summary className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center justify-between hover:text-indigo-600 transition-colors">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      API Settings
                    </span>
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-3 space-y-2">
                    <input
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="http://localhost:8000"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                    <p className="text-[11px] text-slate-500">Backend API endpoint for image processing</p>
                  </div>
                </details>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-slate-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Image
                </label>
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50 scale-105' 
                      : file 
                        ? 'border-emerald-400 bg-emerald-50' 
                        : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                  onClick={onBrowse}
                >
                  {file ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-slate-700 truncate">{file.name}</div>
                      {imageInfo && (
                        <div className="text-xs text-slate-500 space-y-0.5">
                          <div>{imageInfo.width} × {imageInfo.height} px</div>
                          <div>{imageInfo.size} MB</div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Change image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="text-sm text-slate-700 font-medium">
                        {isDragging ? 'Drop your image here' : 'Drag & drop or click to browse'}
                      </div>
                      <div className="text-xs text-slate-500">PNG, JPG, WebP up to 10MB</div>
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

              <div>
                <label className="block text-xs font-semibold mb-2 text-slate-700">Output Dimensions</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="Auto"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Width (px)</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Auto"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Height (px)</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1">
                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Leave empty to keep original size
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-slate-700">Resize Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="contain">Contain (fit within, no crop)</option>
                  <option value="cover">Cover (fill completely, may crop)</option>
                </select>
              </div>

              {/* Advanced Options */}
              <div className="border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Advanced Options
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showAdvanced && (
                  <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <input
                        id="alphaMatting"
                        type="checkbox"
                        checked={alphaMatting}
                        onChange={(e) => setAlphaMatting(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="alphaMatting" className="text-sm font-medium text-slate-700 cursor-pointer">
                          Alpha Matting
                        </label>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Refine edges for smoother transparency (slower)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1.5 text-slate-700">Feather</label>
                        <input
                          type="number"
                          min={0}
                          value={feather}
                          onChange={(e) => setFeather(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Edge softness</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5 text-slate-700">Padding</label>
                        <input
                          type="number"
                          min={0}
                          value={pad}
                          onChange={(e) => setPad(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Border space (px)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                      <span>Remove Background</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          </form>

          {/* Preview & Result */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Original Image
                  </h2>
                  {imageInfo && (
                    <span className="text-xs text-slate-600 font-medium bg-white px-3 py-1 rounded-full shadow-sm">
                      {imageInfo.width} × {imageInfo.height} px
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5">
                <div className="min-h-[350px] max-h-[55vh] bg-[repeating-conic-gradient(#f8fafc_0_25%,#e2e8f0_0_50%)] bg-[length:20px_20px] rounded-xl flex items-center justify-center overflow-auto p-4 border-2 border-slate-200">
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="max-w-full h-auto rounded-lg shadow-lg" />
                  ) : (
                    <div className="text-center space-y-3">
                      <svg className="w-16 h-16 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-slate-500 text-sm">No image selected</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Result Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Background Removed
                  </h2>
                  {resultUrl && (
                    <span className="text-xs text-emerald-700 font-medium bg-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ready
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5">
                <div className="min-h-[350px] max-h-[55vh] bg-[repeating-conic-gradient(#f8fafc_0_25%,#e2e8f0_0_50%)] bg-[length:20px_20px] rounded-xl flex items-center justify-center overflow-auto p-4 border-2 border-slate-200">
                  {loading ? (
                    <div className="text-center space-y-4">
                      <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <div className="text-slate-600 font-medium">Processing your image...</div>
                      <div className="text-xs text-slate-500">This may take a few seconds</div>
                    </div>
                  ) : resultUrl ? (
                    <img src={resultUrl} alt="result" className="max-w-full h-auto rounded-lg shadow-lg" />
                  ) : (
                    <div className="text-center space-y-3">
                      <svg className="w-16 h-16 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <div className="text-slate-500 text-sm">Upload an image and click "Remove Background"</div>
                    </div>
                  )}
                </div>

                {resultUrl && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={resultUrl}
                      download="cutout.png"
                      className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PNG
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(resultUrl);
                        // You could add a toast notification here
                      }}
                      className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-2"
                      title="Copy blob URL to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy URL
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center">
          <div className="inline-block p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 text-xs text-slate-600">
            <p className="flex items-center gap-2 justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>For production, configure <code className="px-1.5 py-0.5 bg-slate-100 rounded text-indigo-600 font-mono">VITE_API_URL</code> and enable CORS in your FastAPI backend</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
