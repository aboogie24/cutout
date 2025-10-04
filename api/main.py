# FastAPI app: cutout_api/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.rt import router

app = FastAPI(title="Cutout API", version="1.0.0", description="Remove background from a person, optionally resize/canvas, and return transparent PNG.")

# ----- CORS (customize in production) -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set to your frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

# README (deployment & usage)
# ---------------------------
# Local run
#   python -m venv .venv && . .venv/bin/activate
#   pip install -r requirements.txt
#   uvicorn cutout_api.main:app --reload
#   Open docs at: http://localhost:8000/docs
#
# Docker build & run
#   docker build -t cutout-api:latest .
#   docker run --rm -p 8000:8000 cutout-api:latest
#
# cURL example (multipart form)
#   curl -X POST \
#     -F "file=@./photo.jpg" \
#     -F "width=1920" -F "height=900" \
#     -F "mode=contain" -F "alpha_matting=true" \
#     http://localhost:8000/cutout \
#     --output output.png
#
# JavaScript fetch example
#   const form = new FormData();
#   form.append('file', myFile); // File from <input type="file">
#   form.append('width', '1920');
#   form.append('height', '900');
#   form.append('mode', 'contain'); // or 'cover'
#   const res = await fetch('http://localhost:8000/cutout', { method: 'POST', body: form });
#   const blob = await res.blob();
#   const url = URL.createObjectURL(blob);
#   // set <img src={url}> or trigger download
#
# Notes
# - Allowed modes: contain (keep full subject), cover (fill box by cropping overflow).
# - Returns image/png with transparency preserved.
# - Adjust CORS in main.py for your frontend domain before production.
