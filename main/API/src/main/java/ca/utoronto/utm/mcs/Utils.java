package ca.utoronto.utm.mcs;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.neo4j.driver.v1.Record;
import org.neo4j.driver.v1.StatementResult;
import org.neo4j.driver.v1.exceptions.ClientException;
import org.neo4j.driver.v1.exceptions.NoSuchRecordException;

public class Utils {
    public static String convert(InputStream inputStream) throws IOException {
 
        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
            return br.lines().collect(Collectors.joining(System.lineSeparator()));
            
        }
    }
    
    public static Map<String, String> URIparams(String URIquery){
    	String[] params = URIquery.split("&");
    	Map<String, String> inputInfo = new HashMap<String, String>();
    	for (String p : params) {
    		String pKey = p.split("=")[0];
    		String pVal = p.split("=")[1];
    		inputInfo.put(pKey, pVal);
    	}
		return inputInfo;	
    }
    
}
