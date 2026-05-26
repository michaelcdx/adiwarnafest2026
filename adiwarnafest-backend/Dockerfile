FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY AdiwarnaBackend/AdiwarnaBackend.csproj ./
RUN dotnet restore

COPY AdiwarnaBackend/ ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* && \
    adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

EXPOSE 5190
ENTRYPOINT ["dotnet", "AdiwarnaBackend.dll"]
