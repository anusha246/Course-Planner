package ca.utoronto.utm.mcs;

import java.io.IOException;
import java.net.InetSocketAddress;

import org.neo4j.driver.v1.AuthTokens;
import org.neo4j.driver.v1.Driver;
import org.neo4j.driver.v1.GraphDatabase;
import org.neo4j.driver.v1.Session;

import com.sun.net.httpserver.HttpServer;

public class App 	
{
    static int PORT = 8080;
    public static void main(String[] args) throws IOException
    {
    	Driver driver = GraphDatabase.driver("bolt://localhost:7687", AuthTokens.basic("neo4j","1234"));
    	Session session = driver.session();
    	session.run("CREATE CONSTRAINT ON (u:user) ASSERT u.username IS UNIQUE");
    	
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", PORT), 0);
        
        server.createContext("/api/v1/addUser", new User(driver));
        server.createContext("/api/v1/checkUser", new User(driver));
        server.createContext("/api/v1/getUser", new User(driver));
        server.createContext("/api/v1/updateUser", new User(driver));
        server.createContext("/api/v1/searchCourse", new Course(driver));
        server.createContext("/api/v1/searchCourseTree", new Course(driver));
        server.createContext("/api/v1/checkPrerequisite", new Prerequisite(driver));
        server.createContext("/api/v1/checkNoPrerequisite", new NoPrerequisite(driver));
        
        server.start();
        System.out.printf("Server started on port %d...\n", PORT);
    }
}
