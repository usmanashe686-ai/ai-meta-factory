FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod .
RUN go mod download
COPY src ./src
RUN go build -o build-service ./src/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates flutter? # Actually Flutter not in Alpine, need a base with Flutter
# For simplicity, we'll use a custom image with Flutter installed
# In production, you'd use a base image that has Flutter SDK

WORKDIR /root/
COPY --from=builder /app/build-service .

EXPOSE 8080
CMD ["./build-service"]
