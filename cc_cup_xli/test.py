import os
from dotenv import load_dotenv
from google.cloud import vision

# Load environment variables from .env
load_dotenv()

client = vision.ImageAnnotatorClient()

with open("ktp1.png", "rb") as f:
    content = f.read()

image = vision.Image(content=content)

response = client.text_detection(image=image)

texts = response.text_annotations

if texts:
    print(texts[0].description)
else:
    print("No text detected")