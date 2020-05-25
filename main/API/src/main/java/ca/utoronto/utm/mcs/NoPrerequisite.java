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

public class NoPrerequisite implements HttpHandler{
	public Driver driver;
	public NoPrerequisite(Driver d) {
		driver = d;
	}

	@Override
	public void handle(HttpExchange r) throws IOException {
		try {
			if(r.getRequestMethod().equals("GET")) {
				handlePrerequisite(r);
			} 
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
		
	private void handlePrerequisite(HttpExchange r) throws IOException, JSONException{
		r.getResponseHeaders().set("Content-Type","application/json");
		r.getResponseHeaders().set("Access-Control-Allow-Origin","*");
		
		try (Session session = driver.session()){
			//Map<String, String> queryParams = Utils.URIparams(r.getRequestURI().getQuery());
			
			//String courseCode = queryParams.get("course");
			//courseCode = courseCode.toUpperCase();
			
			String query = String.format("MATCH (c:course) WHERE NOT ()-[:PreReq]->(c) RETURN c.Code, c.Name");
			
			
			String transaction = session.writeTransaction(new TransactionWork<String>() {
				@Override
				public String execute(Transaction tx) {
					JSONObject noPrerequisiteResponse = new JSONObject();
					StatementResult courseResult = tx.run(query);
					
					String courses = "Courses with no prerequisites:<br><ul>";
				
					try {
						if (!courseResult.hasNext()) {
							noPrerequisiteResponse.put("noPrerequisiteResponse", "No courses");
						} else {
							// format the information provided back to html
							
							while (courseResult.hasNext()) {
								Record record = courseResult.next();
								
								String courseCode = record.get("c.Code").asString();
								
								String courseName = record.get("c.Name").asString();
								
								if (!courseCode.equals("null")) {
									courses += "<li>" + courseCode + ": " + courseName + "</li>";
								}
								
								
								
							}
							
							
							noPrerequisiteResponse.put("noPrerequisiteResponse", courses + "</ul>");
							
						}
					} catch (JSONException e) {
						e.printStackTrace();
					}
					return noPrerequisiteResponse.toString();
					}
				});
			r.sendResponseHeaders(200, transaction.length());
			
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

}
