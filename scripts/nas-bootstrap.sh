#!/bin/sh
# 시놀로지 작업 스케줄러 또는 SSH에서 한 번 실행합니다.
# 인터넷에 SSH(22)를 상시로 열지는 마세요.
set -eu
DIR="${NAS_APP_DIR:-/volume1/docker/ne1-tech-mall}"
cd "$DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Container Manager(Docker)가 없습니다. 패키지 센터에서 설치한 뒤 이 폴더로 프로젝트를 만드세요."
  exit 1
fi

docker compose up -d --build
docker compose ps
echo "다음: DSM 역방향 프록시 ne1-tech.co.kr / www → 127.0.0.1:43177, Let's Encrypt 인증서."
