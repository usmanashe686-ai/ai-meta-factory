.PHONY: docker-build-gpu
docker-build-gpu:
	docker build -f Dockerfile.gpu -t ai-meta-factory/ai-service:gpu .

.PHONY: docker-run-gpu
docker-run-gpu:
	docker run --gpus all -p 8000:8000 --env CUDA_VISIBLE_DEVICES=0 ai-meta-factory/ai-service:gpu
