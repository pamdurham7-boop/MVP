package API;

import com.mysql.cj.jdbc.Driver;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.concurrent.Executors;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;
import java.util.Scanner;
import static API_PASS.DB_pass;

public class SimpleRestApi {

    private static final String DB_URL = "jdbc:mysql://db:3306/mydb";
    private static final String DB_USER = "root";
    private static final String DB_PASS;

    public void setDB_PASS(pass){
        this.DB_PASS = finalPassword(pass);
    }

    static class WebSocketHandler extends WebSocketServer {
        private Set<WebSocket> clients = new HashSet<>();
        
    public WebSocketHandler(int port) {
            super(new InetSocketAddress("0.0.0.0", port));
    }


        @Override
        public void onOpen(WebSocket conn, ClientHandshake handshake) {
            clients.add(conn);
            System.out.println("WebSocket connected: " + conn.getRemoteSocketAddress());
        }

        @Override
        public void onClose(WebSocket conn, int code, String reason, boolean remote) {
            clients.remove(conn);
            System.out.println("WebSocket disconnected: " + conn.getRemoteSocketAddress());
        }

        @Override
        public void onMessage(WebSocket conn, String message) {
            try {
                handleWebSocketMessage(conn, message);
            } catch (Exception e) {
                conn.send("{\"error\":\"Server Error: " + e.getMessage() + "\"}");
            }
        }

        @Override
        public void onError(WebSocket conn, Exception ex) {
            System.err.println("WebSocket error: " + ex.getMessage());
        }

        @Override
        public void onStart() {
            System.out.println("WebSocket server started on port 8081");
        }

        private void handleWebSocketMessage(WebSocket conn, String message) throws Exception {
            String name = extractJsonValue(message, "name");
            String email = extractJsonValue(message, "email");
            String password = extractJsonValue(message, "password");
            String action = extractJsonValue(message, "action");

            try (Connection dbConn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
                // Handle login
                if ("login".equals(action) && !email.isEmpty() && !password.isEmpty()) {
                    PreparedStatement userStmt = dbConn.prepareStatement(
                        "SELECT id, name, email FROM users WHERE email = ?"
                    );
                    userStmt.setString(1, email);
                    ResultSet userRs = userStmt.executeQuery();

                    if (userRs.next()) {
                        long userId = userRs.getLong("id");
                        String userName = userRs.getString("name");

                        PreparedStatement pwdStmt = dbConn.prepareStatement(
                            "SELECT password_hash FROM passwords WHERE user_id = ?"
                        );
                        pwdStmt.setLong(1, userId);
                        ResultSet pwdRs = pwdStmt.executeQuery();

                        if (pwdRs.next()) {
                            String storedHash = pwdRs.getString("password_hash");
                            String inputHash = hashPassword(password);

                            if (storedHash.equals(inputHash)) {
                                String json = String.format(
                                    "{\"status\":\"success\",\"id\":%d,\"name\":\"%s\",\"email\":\"%s\"}",
                                    userId, userName, email
                                );
                                conn.send(json);
                            } else {
                                conn.send("{\"status\":\"error\",\"message\":\"Invalid password\"}");
                            }
                        } else {
                            conn.send("{\"status\":\"error\",\"message\":\"Invalid email or password\"}");
                        }
                    } else {
                        conn.send("{\"status\":\"error\",\"message\":\"Invalid email or password\"}");
                    }
                }
                // Handle registration
                else if ("register".equals(action) && !name.isEmpty() && !email.isEmpty() && !password.isEmpty()) {
                    PreparedStatement userStmt = dbConn.prepareStatement(
                        "INSERT INTO users (name, email) VALUES (?, ?)",
                        Statement.RETURN_GENERATED_KEYS
                    );
                    userStmt.setString(1, name);
                    userStmt.setString(2, email);
                    userStmt.executeUpdate();

                    ResultSet keys = userStmt.getGeneratedKeys();
                    keys.next();
                    long userId = keys.getLong(1);

                    String passwordHash = hashPassword(password);
                    PreparedStatement pwdStmt = dbConn.prepareStatement(
                        "INSERT INTO passwords (user_id, password_hash) VALUES (?, ?)"
                    );
                    pwdStmt.setLong(1, userId);
                    pwdStmt.setString(2, passwordHash);
                    pwdStmt.executeUpdate();

                    String json = String.format(
                        "{\"status\":\"success\",\"id\":%d,\"name\":\"%s\",\"email\":\"%s\"}",
                        userId, name, email
                    );
                    conn.send(json);
                } else {
                    conn.send("{\"status\":\"error\",\"message\":\"Invalid request\"}");
                }
            }
        }

        private String extractJsonValue(String json, String key) {
            json = json.replaceAll("[{}\"]", "");
            String[] parts = json.split(",");
            for (String part : parts) {
                String[] pair = part.split(":");
                if (pair.length == 2 && pair[0].trim().equals(key)) {
                    return pair[1].trim();
                }
            }
            return "";
        }

        private static String hashPassword(String password) throws Exception {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        }
    }

    static class UserHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            try {
                // Add CORS headers
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

                String method = exchange.getRequestMethod();
                String path = exchange.getRequestURI().getPath();

                // Handle preflight requests
                if ("OPTIONS".equals(method)) {
                    exchange.sendResponseHeaders(200, -1);
                    exchange.close();
                    return;
                }

                if ("GET".equals(method)) {
                    handleGet(exchange, path);
                } else if ("POST".equals(method)) {
                    handlePost(exchange);
                } else if ("DELETE".equals(method)) {
                    handleDelete(exchange, path);
                } else {
                    sendResponse(exchange, 405, "Method Not Allowed");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "Server Error: " + e.getMessage());
            }
        }

        private void handleGet(HttpExchange exchange, String path) throws Exception {
            String[] parts = path.split("/");
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
                if (parts.length == 2) {
                    Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery("SELECT * FROM users");
                    StringBuilder json = new StringBuilder("[");
                    while (rs.next()) {
                        json.append(String.format(
                            "{\"id\":%d,\"name\":\"%s\",\"email\":\"%s\"},",
                            rs.getLong("id"),
                            rs.getString("name"),
                            rs.getString("email")
                        ));
                    }
                    if (json.length() > 1) json.setLength(json.length() - 1);
                    json.append("]");
                    sendResponse(exchange, 200, json.toString());
                }
                else if (parts.length == 3) {
                    long id = Long.parseLong(parts[2]);
                    PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
                    stmt.setLong(1, id);
                    ResultSet rs = stmt.executeQuery();

                    if (rs.next()) {
                        String json = String.format(
                            "{\"id\":%d,\"name\":\"%s\",\"email\":\"%s\"}",
                            rs.getLong("id"),
                            rs.getString("name"),
                            rs.getString("email")
                        );
                        sendResponse(exchange, 200, json);
                    } else {
                        sendResponse(exchange, 404, "User not found");
                    }
                }
            }
        }

        private void handlePost(HttpExchange exchange) throws Exception {
            String body = new String(
                exchange.getRequestBody().readAllBytes(),
                StandardCharsets.UTF_8
            );

            String name = extractJsonValue(body, "name");
            String email = extractJsonValue(body, "email");
            String password = extractJsonValue(body, "password");

            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
                if (!email.isEmpty() && !password.isEmpty() && name.isEmpty()) {
                    PreparedStatement userStmt = conn.prepareStatement("SELECT id, name, email FROM users WHERE email = ?");
                    userStmt.setString(1, email);
                    ResultSet userRs = userStmt.executeQuery();

                    if (userRs.next()) {
                        long userId = userRs.getLong("id");
                        String userName = userRs.getString("name");
                        PreparedStatement pwdStmt = conn.prepareStatement("SELECT password_hash FROM passwords WHERE user_id = ?");
                        pwdStmt.setLong(1, userId);
                        ResultSet pwdRs = pwdStmt.executeQuery();

                        if (pwdRs.next()) {
                            String storedHash = pwdRs.getString("password_hash");
                            String inputHash = hashPassword(password);

                            if (storedHash.equals(inputHash)) {
                                String json = String.format(
                                    "{\"id\":%d,\"name\":\"%s\",\"email\":\"%s\"}",
                                    userId, userName, email
                                );
                                sendResponse(exchange, 200, json);
                            } else {
                                sendResponse(exchange, 401, "Invalid password");
                            }
                        } else {
                            sendResponse(exchange, 401, "Invalid email or password");
                        }
                    } else {
                        sendResponse(exchange, 401, "Invalid email or password");
                    }
                }
                else if (!name.isEmpty() && !email.isEmpty() && !password.isEmpty()) {
                    PreparedStatement userStmt = conn.prepareStatement(
                        "INSERT INTO users (name, email) VALUES (?, ?)",
                        Statement.RETURN_GENERATED_KEYS
                    );
                    userStmt.setString(1, name);
                    userStmt.setString(2, email);
                    userStmt.executeUpdate();

                    ResultSet keys = userStmt.getGeneratedKeys();
                    keys.next();
                    long userId = keys.getLong(1);

                    String passwordHash = hashPassword(password);
                    PreparedStatement pwdStmt = conn.prepareStatement(
                        "INSERT INTO passwords (user_id, password_hash) VALUES (?, ?)"
                    );
                    pwdStmt.setLong(1, userId);
                    pwdStmt.setString(2, passwordHash);
                    pwdStmt.executeUpdate();

                    String json = String.format(
                        "{\"id\":%d,\"name\":\"%s\",\"email\":\"%s\"}",
                        userId, name, email
                    );
                    sendResponse(exchange, 201, json);
                } else {
                    sendResponse(exchange, 400, "Invalid request");
                }
            }
        }

        private void handleDelete(HttpExchange exchange, String path) throws Exception {
            String[] parts = path.split("/");
            if (parts.length == 3) {
                long id = Long.parseLong(parts[2]);
                try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
                    PreparedStatement stmt = conn.prepareStatement("DELETE FROM users WHERE id = ?");
                    stmt.setLong(1, id);
                    stmt.executeUpdate();
                    sendResponse(exchange, 204, "");
                }
            }
        }

        private void sendResponse(HttpExchange exchange, int status, String response) throws IOException {
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, response.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }

        private String extractJsonValue(String json, String key) {
            json = json.replaceAll("[{}\"]", "");
            String[] parts = json.split(",");
            for (String part : parts) {
                String[] pair = part.split(":");
                if (pair.length == 2 && pair[0].trim().equals(key)) {
                    return pair[1].trim();
                }
            }
            return "";
        }

        private static String hashPassword(String password) throws Exception {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        }
    }

    public static void main(String[] args) throws Exception {
        Scanner scan = new Scanner(System.in);
        System.out.println("PUT IN THE PASSWORD TO ACCESS THE DB!")
        String pass = scan.nextLine();
        setDB_PASS(pass);
        System.out.println("Starting HTTP...");
        HttpServer httpServer = HttpServer.create(new InetSocketAddress(8080), 0);
        httpServer.createContext("/users", new UserHandler());
        httpServer.setExecutor(Executors.newCachedThreadPool());
        httpServer.start();
        System.out.println("HTTP server running at http://localhost:8080");
        System.out.println("Starting WebSocket...");
        WebSocketHandler wsServer = new WebSocketHandler(8081);
        wsServer.start();
        System.out.println("WebSocket start() called");
    }

}
