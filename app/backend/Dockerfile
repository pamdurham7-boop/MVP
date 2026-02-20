FROM eclipse-temurin:21-jdk AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends wget g++ && rm -rf /var/lib/apt/lists/*

RUN wget -q https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.0.33/mysql-connector-j-8.0.33.jar && \
    wget -q https://repo1.maven.org/maven2/org/java-websocket/Java-WebSocket/1.5.4/Java-WebSocket-1.5.4.jar && \
    wget -q https://repo1.maven.org/maven2/org/slf4j/slf4j-api/2.0.9/slf4j-api-2.0.9.jar && \
    wget -q https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/2.0.9/slf4j-simple-2.0.9.jar

COPY . .

RUN javac -h . -d . MAIN_pass.java DB_pass.java

RUN g++ -shared -fPIC -o libpassword_validator.so \
    -I"$JAVA_HOME/include" \
    -I"$JAVA_HOME/include/linux" \
    API_PASS_SECRET_MAIN_pass.cpp

RUN javac -cp "mysql-connector-j-8.0.33.jar:Java-WebSocket-1.5.4.jar:slf4j-api-2.0.9.jar:slf4j-simple-2.0.9.jar:." -d . SimpleRestApi.java

RUN echo "Main-Class: API.SimpleRestApi" > manifest.txt && \
    jar cfm app.jar manifest.txt API API_PASS API_PASS_SECRET

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /build/*.jar .
COPY --from=builder /build/libpassword_validator.so .

ENV LD_LIBRARY_PATH=/app

EXPOSE 8080 8081

ENTRYPOINT ["java", "-Djava.library.path=/app", "-cp", "app.jar:mysql-connector-j-8.0.33.jar:Java-WebSocket-1.5.4.jar:slf4j-api-2.0.9.jar:slf4j-simple-2.0.9.jar", "API.SimpleRestApi"]