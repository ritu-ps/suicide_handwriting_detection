FROM python:3.11

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file securely into the container
COPY requirements.txt .

# Upgrade pip and install the dependencies completely from requirements
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the models, backend logic, and frontend folders!
# (HuggingFace allows uploading LFS items directly through the builder)
COPY . .

# Expose port exactly 7860 which Hugging Face strictly listens to 
EXPOSE 7860

# Force Uvicorn to run and bind to 0.0.0.0 on 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
