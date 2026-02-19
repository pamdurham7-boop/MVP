# --- BUILDER STAGE ---
FROM eclipse-temurin:21-jdk as builder

WORKDIR /build

# 1. Install build tools for JNI (g++ is required)
RUN apt-get update && apt-get install -y wget g++

# Download dependencies (same as before)
RUN wget https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.0.33/mysql-connector-j-8.0.33.jar && \
    wget https://repo1.maven.org/maven2/org/java-websocket/Java-WebSocket/1.5.4/Java-WebSocket-1.5.4.jar && \
    wget https://repo1.maven.org/maven2/org/slf4j/slf4j-api/2.0.9/slf4j-api-2.0.9.jar && \
    wget https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/2.0.9/slf4j-simple-2.0.9.jar

# 2. Copy Java source AND C++ source
COPY SimpleRestApi.java .
COPY SecretProvider.cpp .

# 3. Generate JNI Header and Compile Java
RUN javac -h . -cp "mysql-connector-j-8.0.33.jar:Java-WebSocket-1.5.4.jar:slf4j-api-2.0.9.jar:slf4j-simple-2.0.9.jar" -d . SimpleRestApi.java

# 4. Compile C++ into a Shared Object (.so)
# Note: We include the JDK headers for Linux
RUN g++ -shared -fPIC -o libsecretlib.so \
    -I"$JAVA_HOME/include" \
    -I"$JAVA_HOME/include/linux" \
    SecretProvider.cpp

# Package JAR
RUN echo "Main-Class: API.SimpleRestApi" > manifest.txt && \
    jar cfm app.jar manifest.txt API

# --- RUNTIME STAGE ---
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy JAR, Jars, and the NATIVE LIBRARY (.so)
COPY --from=builder /build/*.jar .
COPY --from=builder /build/libsecretlib.so .

EXPOSE 8080 8081

# 5. Tell Java where to find the .so file using -Djava.library.path
ENTRYPOINT ["java", \
    "-Djava.library.path=.", \
    "-cp", "app.jar:mysql-connector-j-8.0.33.jar:Java-WebSocket-1.5.4.jar:slf4j-api-2.0.9.jar:slf4j-simple-2.0.9.jar", \
    "API.SimpleRestApi"]