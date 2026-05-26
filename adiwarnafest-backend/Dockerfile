FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY AdiwarnaBackend/AdiwarnaBackend.csproj ./
RUN dotnet restore

COPY AdiwarnaBackend/ ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5190
ENTRYPOINT ["dotnet", "AdiwarnaBackend.dll"]
