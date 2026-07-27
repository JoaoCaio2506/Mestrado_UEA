FROM python:3.11-slim
WORKDIR /app

# opencv-python-headless still links against these at import time even
# though it skips the GUI/X11 stack itself — python:3.11-slim has none of
# them by default.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxext6 libxrender1 libxcb1 \
    && rm -rf /var/lib/apt/lists/*

# CPU-only torch build first — the default PyPI wheel bundles CUDA and is
# multiple GB larger, which this VPS (no GPU) doesn't need.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main_gradcam.py .

EXPOSE 8002
CMD ["uvicorn", "main_gradcam:app", "--host", "0.0.0.0", "--port", "8002"]
