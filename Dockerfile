# FROM node:20-slim

# WORKDIR /app

# RUN apt-get update && apt-get install -y \
#     ffmpeg \
#     python3 \
#     curl \
#     ca-certificates \
#   && rm -rf /var/lib/apt/lists/*

# RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
#     -o /usr/local/bin/yt-dlp \
#   && chmod a+rx /usr/local/bin/yt-dlp \
#   && ffmpeg -version \
#   && ffprobe -version \
#   && yt-dlp --version

# COPY package*.json ./

# RUN npm ci --omit=dev

# COPY . .

# RUN mkdir -p downloads previews

# ENV NODE_ENV=production
# ENV FFMPEG_PATH=ffmpeg
# ENV FFPROBE_PATH=ffprobe
# ENV YTDLP_PATH=/usr/local/bin/yt-dlp

# EXPOSE 3030

# CMD ["npm", "start"]

FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3030
ENV YTDLP_PATH=/usr/local/bin/yt-dlp
ENV FFMPEG_PATH=ffmpeg

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp using pip, then also place a stable executable path.
# This is more reliable on Azure than only downloading a single binary.
RUN python3 -m pip install --no-cache-dir --break-system-packages -U yt-dlp \
    && python3 -m yt_dlp --version \
    && printf '#!/bin/sh\nexec python3 -m yt_dlp "$@"\n' > /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp \
    && /usr/local/bin/yt-dlp --version

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN mkdir -p downloads previews

EXPOSE 3030

CMD ["npm", "start"]
