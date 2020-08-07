FROM node AS build

RUN mkdir /wick

WORKDIR /wick

COPY package.json package-lock.json /wick/

run npm install

COPY .env CNAME CNAME_editor CNAME_test /wick/

COPY src/ /wick/src/
COPY public/ /wick/public/

RUN ls src/

RUN npm run build

FROM httpd:2.4 AS deploy

COPY --from=build /wick/build/ /usr/local/apache2/htdocs/