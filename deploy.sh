docker build -t zulkarnen/maset-vue-be -f .docker/Dockerfile --target prod .
docker push zulkarnen/maset-vue-be
ssh developer@103.181.182.81 "cd /home/developer/app/api  && docker compose pull && docker compose up app -d"