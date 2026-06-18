# Stage 1: Build the React SPA Frontend
FROM node:18-slim AS frontend-builder
WORKDIR /app/client

# Copy package descriptors and lockfiles
COPY ai_attendance_system/client/package*.json ./
RUN npm ci

# Copy the frontend code and build it
COPY ai_attendance_system/client/ ./
RUN npm run build

# Stage 2: Setup Python & run Flask server
FROM python:3.10-slim
WORKDIR /app

# Install system compiler and OpenCV window dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    g++ \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY ai_attendance_system/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Flask backend code
COPY ai_attendance_system/ ./ai_attendance_system/

# Copy built React frontend assets from Stage 1 builder
COPY --from=frontend-builder /app/app/static/dist/ /app/ai_attendance_system/app/static/dist/
COPY --from=frontend-builder /app/app/templates/dashboard.html /app/ai_attendance_system/app/templates/dashboard.html

# Expose server port (Render injects PORT, but default is 5001)
EXPOSE 5001

# Set active directory to app folder
WORKDIR /app/ai_attendance_system

# Launch server
CMD ["python", "run.py"]
