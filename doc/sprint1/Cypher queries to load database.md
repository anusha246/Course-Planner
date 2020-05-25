 - Files Needed: 
  - courses.csv
  - prerequisites.csv

 - Delete all data (in case you need to start over)
MATCH (n) DELETE n
 - Import courses
LOAD CSV FROM "file:///courses.csv" AS data CREATE (:Course {Code:data[0],Name:data[1],courseYear: data[2],courseCampus:data[3],courseDistribution: data[4], courseURL: data[5]})
 - Import relationships into temp node
LOAD CSV FROM "file:///prerequisites.csv" AS data CREATE (:preReq {Code1:data[0],Code2:data[1]})
 - Create relationships
MATCH (t:preReq),(c:Course),(d:Course) WHERE (t.Code1=c.Code AND t.Code2 =d.Code) CREATE (d)-[:Prerequisite]->(c)
 - Delete relationships temp node
MATCH (t:preReq) DETACH DELETE t;
