# FastAPI app: cutout_api/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.rt import router
from routes.ai_routes import router as ai_router

app = FastAPI(
    title="Cutout API with AI", 
    version="2.0.0", 
    description="Advanced image processing with AI: background removal, upscaling, enhancement, object detection, and more."
)

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
app.include_router(ai_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
