# ------------------------
# Java build stage
# ------------------------
FROM maven:3.9.10-eclipse-temurin-17 AS java-builder
WORKDIR /build/java-app

# Copy pom and pre-download dependencies
COPY java-app/pom.xml . 
RUN mvn dependency:go-offline

# Copy source and build JAR
COPY java-app . 
RUN mvn clean package -DskipTests

# ------------------------
# Node build stage
# ------------------------
FROM node:20 AS node-builder
WORKDIR /build/nodejs-app

COPY nodejs-app/package*.json . 
RUN npm install

COPY nodejs-app . 
RUN npx tsc

# ------------------------
# Java runtime (jlink custom JRE)
# ------------------------
FROM eclipse-temurin:17-jdk AS jre-builder

# Build a custom Java runtime including modules likely needed
RUN jlink \
    --add-modules java.base,java.compiler,java.desktop,java.instrument,java.logging,java.management,java.naming,java.net.http,java.scripting,java.sql,java.xml \
    --strip-debug \
    --no-man-pages \
    --no-header-files \
    --compress=2 \
    --output /jre

# ------------------------
# Runtime image (Node + custom Java runtime)
# ------------------------
FROM node:20-slim

# ------------------------
# Metadata & Environment
# ------------------------
LABEL maintainer="ddanan@opentext.com"
LABEL version="1.0"
LABEL description="Node.js + Java app for integrating LRE test into Harness pipeline"

ENV JAVA_HOME=/opt/jre
ENV PATH="$JAVA_HOME/bin:$PATH"
ENV NODE_ENV=production
ENV HOME=/home/appuser

WORKDIR /app

# ------------------------
# Copy Java and Node artifacts
# ------------------------
COPY --from=jre-builder /jre /opt/jre
COPY --from=node-builder /build/nodejs-app/dist /app/dist
COPY --from=java-builder /build/java-app/target/*-jar-with-dependencies.jar /app/dist

# ------------------------
# Harness defaults
# ------------------------
ENV PLUGIN_LRE_OUTPUT_DIR="/harness/output"
ENV PLUGIN_LRE_WORKSPACE_DIR="/harness/workspace"

# ------------------------
# Run as non-root user
# ------------------------
RUN useradd -m appuser
USER appuser

# ------------------------
# Entrypoint
# ------------------------
ENTRYPOINT ["node", "/app/dist/app.js"]
