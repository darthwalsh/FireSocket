FROM node:18-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-jre \
        git \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["npm"]
