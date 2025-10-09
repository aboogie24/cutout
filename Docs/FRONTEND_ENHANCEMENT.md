# Frontend Enhancement Guide

## Current Status

✅ **Backend:** Fully functional with 15+ AI endpoints
✅ **Frontend:** Working basic UI for background removal
🔧 **Next Step:** Add AI features to the UI

## Quick Start - Test Backend Now

### 1. Run Frontend (Current UI)
```bash
cd cutout-frontend
npm run dev
```
Frontend runs at `http://localhost:5173`

### 2. Run Backend
```bash
cd api
uvicorn main:app --reload
```
Backend runs at `http://localhost:8000`

### 3. Test AI Features via API Docs
While the frontend UI is being enhanced, test all AI features at:
`http://localhost:8000/docs`

## Current Frontend Features

The existing `CutoutUI.tsx` provides:
- ✅ File upload (drag & drop)
- ✅ Background removal
- ✅ Image preview
- ✅ Result download
- ✅ Responsive design

## Adding AI Features to Frontend

Here's how to enhance the existing UI with new AI capabilities:

### Option 1: Quick Add - Single Feature Buttons

Add buttons to the existing UI for common AI operations:

```typescript
// In CutoutUI.tsx, add these functions:

async function handleUpscale() {
  if (!file) return;
  
  setLoading(true);
  const form = new FormData();
  form.append("file", file);
  form.append("scale", "4");
  
  const res = await fetch(`${apiUrl}/ai/upscale`, {
    method: "POST",
    body: form,
  });
  
  const blob = await res.blob();
  setResultUrl(URL.createObjectURL(blob));
  setLoading(false);
}

async function handleDetect() {
  if (!file) return;
  
  setLoading(true);
  const form = new FormData();
  form.append("file", file);
  form.append("visualize", "true");
  
  const res = await fetch(`${apiUrl}/ai/detect`, {
    method: "POST",
    body: form,
  });
  
  const blob = await res.blob();
  setResultUrl(URL.createObjectURL(blob));
  setLoading(false);
}

// Add buttons in the UI:
<button onClick={handleUpscale}>
  🚀 Upscale 4x
</button>

<button onClick={handleDetect}>
  🔍 Detect Objects
</button>
```

### Option 2: Add Feature Tabs

Create tabs for different AI features:

```typescript
const [activeFeature, setActiveFeature] = useState<'cutout' | 'upscale' | 'detect'>('cutout');

// Render different controls based on active tab
{activeFeature === 'upscale' && (
  <div>
    <label>Upscale Factor</label>
    <select value={scale} onChange={(e) => setScale(e.target.value)}>
      <option value="2">2x</option>
      <option value="4">4x</option>
    </select>
    <button onClick={handleUpscale}>Upscale</button>
  </div>
)}
```

### Option 3: All-in-One Processing

Add a comprehensive processing option:

```typescript
async function handleProcessAll() {
  const form = new FormData();
  form.append("file", file);
  form.append("remove_bg", removeBg.toString());
  form.append("upscale", upscale.toString());
  form.append("denoise", denoise.toString());
  
  const res = await fetch(`${apiUrl}/ai/process-all`, {
    method: "POST",
    body: form,
  });
  
  const blob = await res.blob();
  setResultUrl(URL.createObjectURL(blob));
}

// Add checkboxes for each feature:
<label>
  <input type="checkbox" checked={removeBg} onChange={e => setRemoveBg(e.target.checked)} />
  Remove Background
</label>
<label>
  <input type="checkbox" checked={upscale} onChange={e => setUpscale(e.target.checked)} />
  Upscale 4x
</label>
<label>
  <input type="checkbox" checked={denoise} onChange={e => setDenoise(e.target.checked)} />
  Denoise
</label>
```

## Complete Feature List to Add

### Enhancement Features
```typescript
// Add these endpoints to your UI:
- /ai/upscale (scale: 2|4)
- /ai/enhance-face (weight: 0.0-1.0)
- /ai/denoise (strength: 3-20)
- /ai/auto-enhance
- /ai/sharpen (amount: 0.5-3.0)
```

### Detection Features
```typescript
// Detection with visualization:
- /ai/detect (visualize: true, confidence: 0.0-1.0)
- /ai/detect-people
```

### Combined Processing
```typescript
// Multi-step pipeline:
- /ai/process-all (remove_bg, upscale, enhance_face, denoise, auto_enhance)
```

## Example: Adding Upscale Feature

### Step 1: Add State
```typescript
const [scale, setScale] = useState<number>(4);
const [showUpscaleOptions, setShowUpscaleOptions] = useState(false);
```

### Step 2: Add UI Controls
```typescript
<button 
  onClick={() => setShowUpscaleOptions(!showUpscaleOptions)}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  ✨ AI Upscale
</button>

{showUpscaleOptions && (
  <div className="mt-4 p-4 bg-gray-50 rounded">
    <label className="block mb-2">Scale Factor:</label>
    <select 
      value={scale} 
      onChange={(e) => setScale(Number(e.target.value))}
      className="w-full p-2 border rounded"
    >
      <option value={2}>2x (Double Size)</option>
      <option value={4}>4x (Quadruple Size)</option>
    </select>
    <button 
      onClick={handleUpscale}
      className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded"
    >
      Start Upscaling
    </button>
  </div>
)}
```

### Step 3: Add Handler Function
```typescript
async function handleUpscale() {
  if (!file) {
    setError("Please upload an image first");
    return;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    const form = new FormData();
    form.append("file", file);
    form.append("scale", scale.toString());
    
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/ai/upscale`, {
      method: "POST",
      body: form,
    });
    
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    
    const blob = await res.blob();
    setResultUrl(URL.createObjectURL(blob));
  } catch (err: any) {
    setError(err.message || "Upscaling failed");
  } finally {
    setLoading(false);
  }
}
```

## Testing Your Changes

1. **Make changes** to `CutoutUI.tsx`
2. **Save the file** - Vite will hot-reload automatically
3. **Test in browser** at `http://localhost:5173`
4. **Check console** for any errors (F12)

## Recommended Approach

### Phase 1: Add Quick Buttons (Today)
- Add 2-3 buttons for most-used features
- Test with simple onclick handlers
- No complex UI changes needed

### Phase 2: Add Feature Tabs (This Week)
- Create tab system for feature categories
- Background, Enhancement, Detection, Combined
- More organized but still manageable

### Phase 3: Advanced UI (Later)
- Real-time previews
- Before/after comparison sliders
- Batch processing interface
- Advanced parameter controls

## Current Working Example

Right now your UI works perfectly for:
1. Upload image
2. Remove background
3. Download result

To add AI upscaling:
1. Add one button: "Upscale 4x"
2. Add one function: `handleUpscale()`
3. Call `/ai/upscale` endpoint
4. Done! ✅

## Next Steps

### Immediate (5 minutes)
1. Keep using current UI for background removal
2. Test AI features via `http://localhost:8000/docs`
3. Plan which features to add to UI first

### Short Term (1 hour)
1. Add 2-3 quick action buttons for common features
2. Test each one individually
3. Deploy and use

### Long Term (1 day)
1. Create tabbed interface
2. Add all AI features
3. Polish UI/UX

## Support

- **API Docs**: `http://localhost:8000/docs` (test all features now)
- **AI Features Guide**: `Docs/AI_Features.md` (all API details)
- **Testing Guide**: `Docs/TESTING_GUIDE.md` (examples)
- **Quick Start**: `Docs/QUICKSTART.md` (setup)

## Summary

✅ **Backend is 100% ready** - All 15+ AI endpoints work perfectly
✅ **Frontend works** - Current UI handles background removal
🔧 **Enhancement is optional** - Add AI features gradually as needed

**You can start using all AI features RIGHT NOW via the API docs while enhancing the UI at your own pace!**
