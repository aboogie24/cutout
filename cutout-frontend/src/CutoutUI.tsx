import React, { useMemo, useRef, useState } from "react";

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
  const [width, setWidth] = useState<string>("1920");
  const [height, setHeight] = useState<string>("900");
  const [mode, setMode] = useState<"contain" | "cover">("contain");
  const [alphaMatting, setAlphaMatting] = useState<boolean>(false);
  const [feather, setFeather] = useState<string>("2");
  const [pad, setPad] = useState<string>("0");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Cutout Studio</h1>
          <p className="text-sm text-slate-600">Upload a photo, remove the background, and export a transparent PNG at your target size.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <form onSubmit={handleSubmit} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">API URL</label>
                <input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Point this to your FastAPI instance (CORS must allow this origin).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Image</label>
                <div
                  onDrop={onDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400"
                  onClick={onBrowse}
                >
                  {file ? (
                    <div className="text-sm">{file.name}</div>
                  ) : (
                    <div className="text-sm text-slate-500">Drag & drop or click to browse</div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Width (px)</label>
                  <input
                    type="number"
                    min={1}
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Height (px)</label>
                  <input
                    type="number"
                    min={1}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="contain">contain (no crop)</option>
                    <option value="cover">cover (fill, may crop)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="alphaMatting"
                    type="checkbox"
                    checked={alphaMatting}
                    onChange={(e) => setAlphaMatting(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <label htmlFor="alphaMatting" className="text-sm">Alpha-matting (finer edges)</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Feather</label>
                  <input
                    type="number"
                    min={0}
                    value={feather}
                    onChange={(e) => setFeather(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Pad (px)</label>
                  <input
                    type="number"
                    min={0}
                    value={pad}
                    onChange={(e) => setPad(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-2">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Generate PNG"}
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>

          {/* Preview & Result */}
          <div className="lg:col-span-2 grid gap-6">
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-semibold mb-3">Preview</h2>
              <div className="aspect-[16/9] bg-[repeating-conic-gradient(#f8fafc_0_25%,#e2e8f0_0_50%)] rounded-xl flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="object-contain max-h-[60vh]" />
                ) : (
                  <div className="text-slate-500 text-sm">No image selected</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-semibold mb-3">Result</h2>
              <div className="aspect-[16/9] bg-[repeating-conic-gradient(#f8fafc_0_25%,#e2e8f0_0_50%)] rounded-xl flex items-center justify-center overflow-hidden">
                {resultUrl ? (
                  <img src={resultUrl} alt="result" className="object-contain max-h-[60vh]" />
                ) : (
                  <div className="text-slate-500 text-sm">Run a cutout to see the output here</div>
                )}
              </div>

              <div className="mt-3 flex gap-3">
                {resultUrl && (
                  <a
                    href={resultUrl}
                    download="cutout.png"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Download PNG
                  </a>
                )}
                {resultUrl && (
                  <button
                    onClick={() => navigator.clipboard.writeText(resultUrl)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                  >Copy Blob URL</button>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 text-xs text-slate-500">
          <p>
            Tip: For production, set <code>VITE_API_URL</code> (or replace the API field) and configure CORS in your FastAPI app to your exact domain.
          </p>
        </footer>
      </div>
    </div>
  );
}
