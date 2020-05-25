package ca.utoronto.utm.mcs;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Map;

import org.json.*;
import org.neo4j.driver.v1.Driver;
import org.neo4j.driver.v1.Record;
import org.neo4j.driver.v1.Session;
import org.neo4j.driver.v1.StatementResult;
import org.neo4j.driver.v1.Transaction;
import org.neo4j.driver.v1.TransactionWork;
import org.neo4j.driver.v1.exceptions.ClientException;
import org.neo4j.driver.v1.exceptions.NoSuchRecordException;

import static org.neo4j.driver.v1.Values.parameters;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class User implements HttpHandler{
	public Driver driver;
	public User(Driver d) {
		driver = d;
	}

	@Override
	public void handle(HttpExchange r) throws IOException {
		try {
			if(r.getRequestMethod().equals("POST")) {
				if (r.getRequestURI().getPath().equals("/api/v1/addUser")) {
					handleRegister(r);
				} else {
					handleUpdate(r);
				}
			} else if(r.getRequestMethod().equals("GET")) {
				if(r.getRequestURI().getPath().equals("/api/v1/checkUser")) {
					handleLogin(r);	
				} else {
					handleGet(r);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	private void handleGet(HttpExchange r) throws IOException, JSONException{
		r.getResponseHeaders().set("Content-Type","application/json");
		r.getResponseHeaders().set("Access-Control-Allow-Origin","*");
		try (Session session = driver.session()){
			Map<String, String> queryParams = Utils.URIparams(r.getRequestURI().getQuery());
			String username = queryParams.get("username");
			String query = String.format("MATCH (u:user) WHERE (u.username = \"%s\") RETURN u.fname, u.lname, u.email, u.year, u.program", username);
			
			String transaction = session.writeTransaction(new TransactionWork<String>() {
				@Override
				public String execute(Transaction tx) {
					JSONObject getResponse = new JSONObject();
					StatementResult result = tx.run(query);
					try {
						if (result.hasNext()) {
							Record userRecord = result.next();
							getResponse.put("fname", userRecord.get("u.fname").asString());
							getResponse.put("lname", userRecord.get("u.lname").asString());
							getResponse.put("email", userRecord.get("u.email").asString());
							getResponse.put("year", userRecord.get("u.year").asInt());
							getResponse.put("program", userRecord.get("u.program").asString());
						}
					} catch (JSONException e) {
						e.printStackTrace();
					}
					return getResponse.toString();
					}
				});
			r.sendResponseHeaders(200, transaction.length());
			System.out.print("200");
			OutputStream os = r.getResponseBody();
			os.write(transaction.getBytes());
			os.close(); 	
		} catch (NoSuchRecordException e) {
			System.out.print("404");
			r.sendResponseHeaders(404, -1);
			e.printStackTrace();
		} catch (Exception e) {
			r.sendResponseHeaders(400, -1);
			System.out.print("400");
			e.printStackTrace();
		}
	}

	private void handleRegister(HttpExchange r) throws IOException, JSONException, NoSuchAlgorithmException{
		r.getResponseHeaders().set("Access-Control-Allow-Origin","*");
		String body = Utils.convert(r.getRequestBody());
		JSONObject deserialized = new JSONObject(body);
		String fname = "";
		String lname = "";
		String email = "";
		String username = "";
		String password = "";
		String gender = "";
		String program = "";
		int age = 0;
		int year = 0;
		
		if (deserialized.has("fname")) {
			fname = deserialized.getString("fname");
		}
		if (deserialized.has("lname")) {
			lname = deserialized.getString("lname");
		}
		if (deserialized.has("email")) {
			email = deserialized.getString("email");
		}
		if (deserialized.has("username")) {
			username = deserialized.getString("username");
		}
		if (deserialized.has("program")) {
			program = deserialized.getString("program");
		}
		if (deserialized.has("password")) {
			password = hashPassword(deserialized.getString("password"));
		}
		if (deserialized.has("gender")) {
			gender = deserialized.getString("gender");
		}
		if (deserialized.has("age")) {
			age = deserialized.getInt("age");
		}
		if (deserialized.has("year")) {
			year = deserialized.getInt("year");
		}
		String insert = String.format("CREATE (u:user { fname: \"%s\", lname: \"%s\", email: \"%s\", "
				+ "username: \"%s\", password: \"%s\", gender: \"%s\", age: %d, year: %d, program: \"%s\"})", fname, lname, email, username, password, gender, age, year, program);
		
		try (Session session = driver.session()){
			String transaction = session.writeTransaction(new TransactionWork<String>() {
				@Override
				public String execute(Transaction tx) {
					tx.run(insert);
					return "";
				}
			});
			r.sendResponseHeaders(200, 0);
			OutputStream os = r.getResponseBody();
			os.write("".getBytes());
			os.close();
		} catch (IOException e) {
			r.sendResponseHeaders(500, -1);
			e.printStackTrace();
		} catch (Exception e) {
			r.sendResponseHeaders(400, -1);
			e.printStackTrace();
		}
	}
	
	private void handleLogin(HttpExchange r) throws IOException, JSONException{
		r.getResponseHeaders().set("Content-Type","application/json");
		r.getResponseHeaders().set("Access-Control-Allow-Origin","*");
		try (Session session = driver.session()){
			Map<String, String> queryParams = Utils.URIparams(r.getRequestURI().getQuery());
			String username = queryParams.get("username");
			String password = hashPassword(queryParams.get("password"));
			String userQuery = String.format("MATCH (u:user) WHERE (u.username = \"%s\") RETURN u.username", username);
			String passQuery = String.format("MATCH (u:user) WHERE (u.username = \"%s\" AND u.password = \"%s\") RETURN u.password", username, password);
			
			String transaction = session.writeTransaction(new TransactionWork<String>() {
				@Override
				public String execute(Transaction tx) {
					JSONObject loginResponse = new JSONObject();
					StatementResult userResult = tx.run(userQuery);
					StatementResult passResult = tx.run(passQuery);
		
					try {
						if (!userResult.hasNext()) {
							loginResponse.put("UserResponse", "incorrect");
						} else {
							loginResponse.put("UserResponse", "correct");
						}
						
						if (!passResult.hasNext()) {
							loginResponse.put("PassResponse", "incorrect");
						} else {
							loginResponse.put("PassResponse", "correct");
						}
					} catch (JSONException e) {
						e.printStackTrace();
					}
					return loginResponse.toString();
					}
				});
			r.sendResponseHeaders(200, transaction.length());
			System.out.print("200");
			OutputStream os = r.getResponseBody();
			os.write(transaction.getBytes());
			os.close(); 		
		} catch (NoSuchRecordException e) {
			System.out.print("404");
			r.sendResponseHeaders(404, -1);
			e.printStackTrace();
		} catch (Exception e) {
			r.sendResponseHeaders(400, -1);
			System.out.print("400");
			e.printStackTrace();
		}
	}
	
	private void handleUpdate(HttpExchange r) throws IOException, JSONException, NoSuchAlgorithmException{
		r.getResponseHeaders().set("Access-Control-Allow-Origin","*");
		String body = Utils.convert(r.getRequestBody());
		JSONObject deserialized = new JSONObject(body);
		
		String username = "";
		String email = "";
		String password = "";
		if (deserialized.has("email")) {
			email = deserialized.getString("email");
		}
		if (deserialized.has("username")) {
			username = deserialized.getString("username");
		}
		if (deserialized.has("password")) {
			if (deserialized.getString("password").equals("")) {
				password = "";
			} else {
				password = hashPassword(deserialized.getString("password"));
			}
		}
		
		if (email.equals("noChange") && !password.equals("")) {
			String query = String.format("MATCH (u:user) WHERE (u.username = \"%s\") SET u.password = \"%s\"", username, password);
			try (Session session = driver.session()){
				String transaction = session.writeTransaction(new TransactionWork<String>() {
					@Override
					public String execute(Transaction tx) {
						tx.run(query);
						return "";
					}
				});
				r.sendResponseHeaders(200, 0);
				OutputStream os = r.getResponseBody();
				os.write("".getBytes());
				os.close();
			} catch (IOException e) {
				r.sendResponseHeaders(500, -1);
				e.printStackTrace();
			} catch (Exception e) {
				r.sendResponseHeaders(400, -1);
				e.printStackTrace();
			}
		} else if (password.equals("") && !email.equals("noChange")) {
			String query = String.format("MATCH (u:user) WHERE (u.username = \"%s\") SET u.email = \"%s\"", username, email);
			try (Session session = driver.session()){
				String transaction = session.writeTransaction(new TransactionWork<String>() {
					@Override
					public String execute(Transaction tx) {
						tx.run(query);
						return "";
					}
				});
				r.sendResponseHeaders(200, 0);
				OutputStream os = r.getResponseBody();
				os.write("".getBytes());
				os.close();
			} catch (IOException e) {
				r.sendResponseHeaders(500, -1);
				e.printStackTrace();
			} catch (Exception e) {
				r.sendResponseHeaders(400, -1);
				e.printStackTrace();
			}
		} else {
			String query = String.format("MATCH (u:user) WHERE (u.username = \"%s\") SET u.email = \"%s\", u.password = \"%s\"", username, email, password);
			try (Session session = driver.session()){
				String transaction = session.writeTransaction(new TransactionWork<String>() {
					@Override
					public String execute(Transaction tx) {
						tx.run(query);
						return "";
					}
				});
				r.sendResponseHeaders(200, 0);
				OutputStream os = r.getResponseBody();
				os.write("".getBytes());
				os.close();
			} catch (IOException e) {
				r.sendResponseHeaders(500, -1);
				e.printStackTrace();
			} catch (Exception e) {
				r.sendResponseHeaders(400, -1);
				e.printStackTrace();
			}
		}
	}
	
/*	private byte[] generateSalt() throws NoSuchAlgorithmException {
		SecureRandom sr = SecureRandom.getInstance("SHA1PRNG");
        byte[] salt = new byte[16];
        sr.nextBytes(salt);
        return salt;
	}*/
	
	private static String hashPassword(String originalPass) throws NoSuchAlgorithmException {
		MessageDigest md = MessageDigest.getInstance("SHA-256");
        //md.update(salt);
        byte[] bPassword = md.digest(originalPass.getBytes(StandardCharsets.UTF_8));
        StringBuilder HashedPassword = new StringBuilder();
        for (byte b : bPassword) {
        	HashedPassword.append(String.format("%02x", b));
        }
		return HashedPassword.toString();
	}
}
