FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && ffmpeg -version \
  && ffprobe -version \
  && yt-dlp --version

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN mkdir -p downloads previews

ENV NODE_ENV=production
ENV FFMPEG_PATH=ffmpeg
ENV FFPROBE_PATH=ffprobe
ENV YTDLP_PATH=/usr/local/bin/yt-dlp

EXPOSE 3030

CMD ["npm", "start"]