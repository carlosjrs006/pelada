# ── Etapa 1: build ────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copia o pom.xml e baixa dependências (cache de camadas)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código-fonte e gera o JAR
COPY src ./src
RUN mvn package -DskipTests -B

# ── Etapa 2: imagem final (só JRE) ────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
