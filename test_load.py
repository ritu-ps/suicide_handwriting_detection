import torch
import warnings
warnings.filterwarnings('ignore')

try:
    model1 = torch.load('text_suicide_model (1).pth', map_location='cpu')
    print(f"TEXT LOADED. Type: {type(model1)}")
    if isinstance(model1, dict):
        print(f"TEXT is a state_dict. Keys: {list(model1.keys())[:5]}")
except Exception as e:
    print(f"TEXT ERROR: {e}")

try:
    model2 = torch.load('typing_suicide_model (1).pth', map_location='cpu')
    print(f"TYPING LOADED. Type: {type(model2)}")
    if isinstance(model2, dict):
        print(f"TYPING is a state_dict. Keys: {list(model2.keys())[:5]}")
except Exception as e:
    print(f"TYPING ERROR: {e}")
