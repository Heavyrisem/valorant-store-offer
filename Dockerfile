FROM node:19-alpine3.17

WORKDIR /app

RUN apk add --no-cache udev ttf-freefont chromium

# npm 설치 시 chromium 다운하지 않도록 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# 설치된 위치를 환경 변수로 설정(node에서 사용)
ENV CHROMIUM_PATH /usr/bin/chromium-browser

RUN npm i -g pnpm

COPY ./package.json /app/
COPY ./pnpm-lock.yaml /app/

# RUN yarn install
RUN pnpm install --frozen-lockfile

COPY . /app
RUN pnpm build

CMD [ "pnpm", "start" ]