FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN mkdir -p downloads previews

EXPOSE 3030

CMD ["npm", "start"]