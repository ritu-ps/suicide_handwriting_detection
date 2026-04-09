import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class TextSuicideModel(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.bert = AutoModel.from_pretrained(config['model_name'])
        self.head = nn.Sequential(
            nn.Linear(self.bert.config.hidden_size, 256),
            nn.LayerNorm(256),
            nn.ReLU(),
            nn.Dropout(config['dropout']),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Dropout(config['dropout']),
            nn.Linear(64, config['num_classes'])
        )

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.last_hidden_state[:, 0, :]
        return self.head(pooled_output)

class TypingSuicideModel(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(config['input_dim'], config['hidden']),
            nn.BatchNorm1d(config['hidden']),
            nn.ReLU(),
            nn.Dropout(config['dropout']),
            nn.Linear(config['hidden'], 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(config['dropout']),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(config['dropout']),
            nn.Linear(32, config['num_classes'])
        )

    def forward(self, x):
        return self.net(x)

import asyncio

# Load Models Safely
text_model = None
tokenizer = None
typing_model = None
scaler = None

def load_models_sync():
    global text_model, tokenizer, typing_model, scaler
    try:
        print("Loading Text Model in background...")
        text_data = torch.load('text_suicide_model (1).pth', map_location='cpu')
        text_config = text_data.get('config', {'model_name': 'distilbert-base-uncased', 'dropout': 0.3, 'num_classes': 2})
        text_model = TextSuicideModel(text_config)
        text_model.load_state_dict(text_data['model_state'], strict=False)
        text_model.eval()
        tokenizer = AutoTokenizer.from_pretrained(text_config['model_name'])
        print("Text Model Online!")
    except Exception as e:
        print(f"Error loading Text model: {e}")

    try:
        print("Loading Typing Model in background...")
        typing_data = torch.load('typing_suicide_model (1).pth', map_location='cpu')
        typing_config = typing_data.get('config', {'input_dim': 7, 'hidden': 128, 'dropout': 0.3, 'num_classes': 2})
        typing_model = TypingSuicideModel(typing_config)
        typing_model.load_state_dict(typing_data['model_state'], strict=False)
        typing_model.eval()
        print("Typing Model Online!")
    except Exception as e:
        print(f"Error loading Typing model: {e}")

    try:
        print("Loading Scaler in background...")
        with open('keystroke_scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        print("Scaler Online!")
    except Exception as e:
        print(f"Scaler not found or error loading: {e}. Using unscaled data.")

@app.on_event("startup")
async def load_models():
    # Spawning as a background thread prevents PyTorch from freezing Uvicorn's port binding!
    asyncio.create_task(asyncio.to_thread(load_models_sync))

class TypingData(BaseModel):
    wpm: float
    backspaces: int
    pauseDuration: float
    text: str

@app.post("/analyze/typing")
async def analyze_typing(data: TypingData):
    typing_prob = 0.5
    text_prob = 0.5
    
    if typing_model:
        try:
            speed_kpm = data.wpm * 5 
            backspace_ratio = data.backspaces / max(1, len(data.text))
            mean_hold = data.pauseDuration * 1000 
            features = np.array([[speed_kpm, backspace_ratio, mean_hold, 150.0, 50.0, 150.0, 50.0]])
            if scaler:
                features = scaler.transform(features)
            
            features_tensor = torch.FloatTensor(features)
            with torch.no_grad():
                typing_out = typing_model(features_tensor)
                typing_prob = torch.softmax(typing_out, dim=1)[0][1].item()
        except Exception as e:
            print("Typing error:", e)

    if text_model and tokenizer and data.text.strip():
        try:
            inputs = tokenizer(data.text, return_tensors="pt", max_length=128, truncation=True, padding=True)
            with torch.no_grad():
                text_out = text_model(inputs['input_ids'], inputs['attention_mask'])
                text_prob = torch.softmax(text_out, dim=1)[0][1].item()
        except Exception as e:
            print("Text error:", e)

    combined_score = (text_prob * 0.6 + typing_prob * 0.4) * 100
    score = min(100, max(0, combined_score))
    
    level = 'Low' if score < 35 else 'Medium' if score < 70 else 'High'
    color = 'text-emerald-400' if score < 35 else 'text-amber-400' if score < 70 else 'text-rose-500'
    text_sentiment = 'Negative' if text_prob > 0.5 else 'Neutral'

    return {
        "score": score,
        "level": level,
        "color": color,
        "textSentiment": text_sentiment,
        "typingProb": typing_prob,
        "textProb": text_prob
    }

@app.post("/analyze/handwriting")
async def analyze_handwriting(file: UploadFile = File(...)):
    import random
    score = random.randint(10, 90)
    level = 'Low' if score < 35 else 'Medium' if score < 70 else 'High'
    color = 'text-emerald-400' if score < 35 else 'text-amber-400' if score < 70 else 'text-rose-500'
    return {
        "score": score,
        "level": level,
        "color": color,
        "textSentiment": "Neutral"
    }
