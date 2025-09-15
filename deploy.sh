docker build -t zulkarnen/maset-vue-be:latest -f .docker/Dockerfile --target production . && \
docker push zulkarnen/maset-vue-be:latest && \
ssh developer@103.181.182.81 "cd /home/developer/app/api  && docker compose pull app && docker compose up app -d"