import edge_tts
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


VOICES = {
    "en": {
        "female": "en-IN-NeerjaNeural",
        "male": "en-IN-PrabhatNeural",
    },
    "te": {
        "female": "te-IN-ShrutiNeural",
        "male": "te-IN-MohanNeural",
    },
    "hi": {
        "female": "hi-IN-SwaraNeural",
        "male": "hi-IN-MadhurNeural",
    },
    "ta": {
        "female": "ta-IN-PallaviNeural",
        "male": "ta-IN-ValluvarNeural",
    },
    "kn": {
        "female": "kn-IN-SapnaNeural",
        "male": "kn-IN-GaganNeural",
    },
    "ml": {
        "female": "ml-IN-SobhanaNeural",
        "male": "ml-IN-MidhunNeural",
    },
}


class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    gender: str = "female"


@app.get("/")
async def root():
    return {"message": "WeatherGPT TTS backend is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    language = request.language.lower()
    gender = request.gender.lower()

    if language not in VOICES:
        language = "en"

    if gender not in VOICES[language]:
        gender = "female"

    voice = VOICES[language][gender]

    communicate = edge_tts.Communicate(
        request.text,
        voice,
    )

    audio = bytearray()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])

    return Response(
        content=bytes(audio),
        media_type="audio/mpeg",
    )
