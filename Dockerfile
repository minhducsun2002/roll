FROM node:16.19.0-alpine3.16 as client
    
RUN mkdir work
COPY client/ work/
WORKDIR work
RUN yarn
RUN yarn build

FROM mcr.microsoft.com/dotnet/sdk:7.0.102-alpine3.17 as server
RUN mkdir work
COPY server/ work/
WORKDIR work
RUN dotnet publish -o dist
COPY --from=client /work/build dist/wwwroot/

FROM mcr.microsoft.com/dotnet/aspnet:7.0.2-alpine3.17
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8
COPY --from=server /work/dist /app
WORKDIR /app
CMD dotnet ./Roll.dll