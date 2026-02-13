# Stage 1: Build the Go binary
FROM golang:1.21-alpine AS go-builder

WORKDIR /app
COPY go.mod .
RUN go mod download
COPY src ./src
RUN go build -o build-service ./src/main.go

# Stage 2: Final image with all build tools
FROM ubuntu:20.04

# Avoid timezone prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    unzip \
    wget \
    xz-utils \
    openjdk-17-jdk-headless \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18.x
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn

# Install Android SDK command line tools
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=${ANDROID_HOME}
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && cd ${ANDROID_HOME}/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip \
    && unzip commandlinetools-linux-*.zip \
    && mv cmdline-tools latest \
    && rm commandlinetools-linux-*.zip

# Set PATH for Android tools
ENV PATH=${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}

# Accept Android licenses (non-interactive)
RUN yes | sdkmanager --licenses || true

# Install required Android SDK components
RUN sdkmanager \
    "platform-tools" \
    "platforms;android-33" \
    "build-tools;33.0.2" \
    "extras;android;m2repository" \
    "extras;google;m2repository"

# Install Flutter SDK
ENV FLUTTER_HOME=/opt/flutter
ENV PATH=${FLUTTER_HOME}/bin:${PATH}
RUN git clone https://github.com/flutter/flutter.git ${FLUTTER_HOME} --depth 1 -b stable \
    && flutter precache \
    && flutter config --no-analytics

# Accept Android licenses for Flutter
RUN yes | flutter doctor --android-licenses || true

# Copy the Go binary from the builder stage
COPY --from=go-builder /app/build-service /usr/local/bin/build-service

# Create a directory for builds
RUN mkdir /builds
WORKDIR /builds

# Expose the service port
EXPOSE 8080

# Run the build service
ENTRYPOINT ["build-service"]
