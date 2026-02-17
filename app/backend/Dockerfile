FROM eclipse-temurin:21-jdk as builder

WORKDIR /build

# Install wget
RUN apt-get update && apt-get install -y wget

# Download dependencies
RUN wget https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.0.33/mysql-connector-j-8.0.33.jar && \
    wget https://repo1.maven.org/maven2/org/java-websocket/Java-WebSocket/1.5.4/Java-WebSocket-1.5.4.jar && \
    wget https://repo1.maven.org/maven2/org/slf4j/slf4j-api/2.0.9/slf4j-api-2.0.9.jar && \
    wget https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/2.0.9/slf4j-simple-2.0.9.jar

# Copy source
COPY SimpleRestApi.java .

# Compile properly with ALL dependencies
RUN javac -cp "mysql-connector-j-8.0.33.jar:Java-WebSocket-1.5.4.jar:slf4j-api-2.0.9.jar:slf4j-simple-2.0.9.jar" -d . SimpleRestApi.java

# Create manifest
RUN echo "Manifest-Version: 1.0" > manifest.txt && \
    echo "Main-Class: API.SimpleRestApi" >> manifest.txt

# Package compiled classes
RUN jar cfm app.jar manifest.txt API

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /build/app.jar .
COPY --from=builder /build/mysql-connector-j-8.0.33.jar .
COPY --from=builder /build/Java-WebSocket-1.5.4.jar .
COPY --from=builder /build/slf4j-api-2.0.9.jar .
COPY --from=builder /build/slf4j-simple-2.0.9.jar .

EXPOSE 8080 8081

ENTRYPOINT ["java", "-cp", "app.jar:mysql-connector-j-8.0.33.jar:Java-WebSocket-1.5.4.jar:slf4j-api-2.0.9.jar:slf4j-simple-2.0.9.jar", "API.SimpleRestApi"]
