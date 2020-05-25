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

public class Prerequisite implements HttpHandler{
	public Driver driver;
	public Prerequisite(Driver d) {
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
			Map<String, String> queryParams = Utils.URIparams(r.getRequestURI().getQuery());
			
			String courseCode = queryParams.get("course");
			courseCode = courseCode.toUpperCase();
			
			String courseQuery = String.format("MATCH (c:course) WHERE (c.Code = \"%s\") RETURN c.Code", courseCode);
			
			
			String transaction = session.writeTransaction(new TransactionWork<String>() {
				@Override
				public String execute(Transaction tx) {
					JSONObject prerequisiteResponse = new JSONObject();
					StatementResult courseResult = tx.run(courseQuery);
					
				
					try {
						if (!courseResult.hasNext()) {
							prerequisiteResponse.put("PrerequisiteResponse", "Course not found");
						} else {
							// format the information provided back to html
							
							
							
							String info = courseResult.next().toString();
							// remove up to the first set of quotes (our first return in the query is the course name as specified above)
							info = info.substring(info.indexOf("\"",info.indexOf("\""))+1);
							String courseCode = info.split("\"")[0];
							System.out.println(courseCode);
							
							
							String prerequisites = getPrerequisites(courseCode, "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp");
							
							prerequisiteResponse.put("PrerequisiteResponse", "Prerequisites of " + courseCode + ":<br>" + prerequisites);
						}
					} catch (JSONException e) {
						e.printStackTrace();
					}
					return prerequisiteResponse.toString();
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
	
	private String getPrerequisites(String courseCode, String tabs) {
		String courseQuery = String.format("MATCH (c:course),(b:course), a = ((b)-[PreReq]->(c)) WHERE c.Code = \"%s\" RETURN b.Code", courseCode);
		
		
		Session session = driver.session();
		
		String transaction = session.writeTransaction(new TransactionWork<String>() {
			public String execute(Transaction tx) {
				//JSONObject prerequisiteResponse = new JSONObject();
				StatementResult courseResult = tx.run(courseQuery);
				
					String prerequisites = "";
				
				
					if (!courseResult.hasNext()) {
						System.out.println(tabs + "No prerequisites\n");
						prerequisites += tabs + "No prerequisites<br>";
						
					} else {
						while (courseResult.hasNext()) {
							Record next = courseResult.next();
							System.out.println(tabs + next.get("b.Code").asString() + "\n");
							prerequisites += tabs + next.get("b.Code").asString() + "<br>";
							prerequisites += getPrerequisites(next.get("b.Code").asString(), tabs + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp");
							
						}
					}
					return prerequisites;
			}
			
		});
		
		return transaction;
	}

}
