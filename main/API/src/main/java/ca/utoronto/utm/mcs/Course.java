package ca.utoronto.utm.mcs;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
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

public class Course implements HttpHandler{
	public Driver driver;
	public Course(Driver d) {
		driver = d;
	}

	@Override
	public void handle(HttpExchange r) throws IOException {
		try {
			if(r.getRequestMethod().equals("GET")) {
				if(r.getRequestURI().getPath().equals("/api/v1/searchCourseTree")) {
				handleTree(r);} else {
				handleSearch(r);}
				}
			else if(r.getRequestMethod().equals("PUT")) {
				addCourseToUser(r);
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
		
	private void handleSearch(HttpExchange r) throws IOException, JSONException{
		r.getResponseHeaders().set("Access-Control-Allow-Origin","*");
		try (Session session = driver.session()){
			Map<String, String> queryParams = Utils.URIparams(r.getRequestURI().getQuery());
			
			String courseCode = queryParams.get("course");
			courseCode = courseCode.toUpperCase();
			if (!courseCode.substring(courseCode.length() - 2).equals("H5")) {
				courseCode = courseCode + "H5";
			}
			// Right here is the query that returns the information desired using the course code provided by the user on the webpage.
			// Any other info that might be needed can be added by adding c.[fieldname]
			String courseQuery = String.format("MATCH (c:course) WHERE (c.Code = \"%s\") RETURN c.Name, c.Year, c.Season", courseCode);
			String lectureQuery = String.format("MATCH (c:course),(l:lecture),( (c)-[:At]-(l) ) WHERE (c.Code=\"%s\" AND l.Code= \"%s\") RETURN l.Room, l.day, l.timeS, l.timeF, l.prof, l.section", courseCode, courseCode);

			
			String transaction = session.writeTransaction(new TransactionWork<String>() {
			JSONObject searchResponse = new JSONObject();
				@Override
				public String execute(Transaction tx) {
					StatementResult courseResult = tx.run(courseQuery);
					try {
						if (!courseResult.hasNext()) {
							searchResponse.put("SearchResponse", "Course not found");
						} else {
							// this is where i format the information provided back to html
							
							// info is the part of the statement result with the query results
							// looks like this: Record<{c.Name: "Operating Systems", c.Year: "3", c.Semester: "Fall"}>
							String info = courseResult.next().toString();
							// remove up to the first set of quotes (our first return in the query is the course name as specified above)
							info = info.substring(info.indexOf("\"",info.indexOf("\""))+1);
							String name = info.split("\"")[0];
							// remove up to the third set of quotes notice the extra +1 for our substring function (our second query return is year)
							info = info.substring(info.indexOf("\"",info.indexOf("\"")+1)+1);
							String year = info.split("\"")[0];
							// remove up to the fifth set of quotes (our third query return is semester)
							// you get the idea
							info = info.substring(info.indexOf("\"",info.indexOf("\"")+1)+1);
							String season = info.split("\"")[0];
							searchResponse.put("Name", name);
							searchResponse.put("Year", year);
							searchResponse.put("Semester", season);
							
							StatementResult lectureResult = tx.run(lectureQuery);
							if (!lectureResult.hasNext()) {
								searchResponse.put("SearchResponse", "Lecture not found");
							}
							else {
								List<JSONObject> lectures = new ArrayList<JSONObject>();
								while (lectureResult.hasNext()) {
									String lectureInfo = lectureResult.next().toString();
									JSONObject lecture = new JSONObject();
									
									lectureInfo = lectureInfo.substring(lectureInfo.indexOf("\"",lectureInfo.indexOf("\""))+1);
									String room = lectureInfo.split("\"")[0];
									lectureInfo = lectureInfo.substring(lectureInfo.indexOf("\"",lectureInfo.indexOf("\"")+1)+1);
									String day = lectureInfo.split("\"")[0];
									lectureInfo = lectureInfo.substring(lectureInfo.indexOf("\"",lectureInfo.indexOf("\"")+1)+1);
									String timeS = lectureInfo.split("\"")[0];
									lectureInfo = lectureInfo.substring(lectureInfo.indexOf("\"",lectureInfo.indexOf("\"")+1)+1);
									String timeF = lectureInfo.split("\"")[0];
									lectureInfo = lectureInfo.substring(lectureInfo.indexOf("\"",lectureInfo.indexOf("\"")+1)+1);
									String prof = lectureInfo.split("\"")[0];
									lectureInfo = lectureInfo.substring(lectureInfo.indexOf("\"",lectureInfo.indexOf("\"")+1)+1);
									String section = lectureInfo.split("\"")[0];

									lecture.put("Room", room);
									lecture.put("Day", day);
									lecture.put("Prof", prof);
									lecture.put("Section", section);
									lecture.put("TimeS", timeS);
									lecture.put("TimeF", timeF);
									
									lectures.add(lecture);
								}
								searchResponse.put("Lectures", lectures);
								searchResponse.put("SearchResponse", "Everything went fine");
							}
						}
					} catch (JSONException e) {
						e.printStackTrace();
					}
				return searchResponse.toString();
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

	private void handleTree(HttpExchange r) throws IOException, JSONException{
		r.getResponseHeaders().set("Content-Type","application/json");
		r.getResponseHeaders().set("Access-Control-Allow-Origin","*");
		try (Session session = driver.session()){
			Map<String, String> queryParams = Utils.URIparams(r.getRequestURI().getQuery());
			String course = queryParams.get("course");
			String query = String.format("MATCH (c:course) WHERE (c.Code = \"%s\") RETURN c.Name, c.Year, c.Season, c.Campus, c.Dist, c.Dep", course);
			
			String transaction = session.writeTransaction(new TransactionWork<String>() {
				@Override
				public String execute(Transaction tx) {
					JSONObject getResponse = new JSONObject();
					StatementResult result = tx.run(query);
					
					try {
						if (result.hasNext()) {
							Record courseRecord = result.next();
							getResponse.put("Name", courseRecord.get("c.Name").asString());
							getResponse.put("Year", courseRecord.get("c.Year").asString());
							getResponse.put("Season", courseRecord.get("c.Season").asString());
							getResponse.put("Campus", courseRecord.get("c.Campus").asString());
							getResponse.put("Dist", courseRecord.get("c.Dist").asString());
							getResponse.put("Dep", courseRecord.get("c.Dep").asString());
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
	
	private void addCourseToUser(HttpExchange r) throws IOException, JSONException{
		r.getResponseHeaders().set("Access-Control-Allow-Origin","*");
		
		try (Session session = driver.session()){
			Map<String, String> queryParams = Utils.URIparams(r.getRequestURI().getQuery());
			
			String courseCode = queryParams.get("course");
			courseCode = courseCode.toUpperCase();
			if (!courseCode.substring(0, courseCode.length() - 2).equals("H5")) {
				courseCode = courseCode + "H5";
			}
			final String c = courseCode;
			String user = "";
			user = queryParams.get("user");
			user = user.toUpperCase();       
	        
	    	String query = String.format("MATCH(a: startNodeLabel {attributes to match start node}) MATCH(m:endNodeLabel {attributes to match end node}) MERGE(a)-[:relationshipName]->(m);", courseCode, user);;
			
			String transaction = session.writeTransaction(new TransactionWork<String>() {
				@Override
				public String execute(Transaction tx) {
					JSONObject response = new JSONObject();
					
					StatementResult result = tx.run(query);
					try {
						response.put("response", "You are now enrolled in " + c);
					} catch (JSONException e) {
						e.printStackTrace();
					}
					
					return response.toString();
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
}

