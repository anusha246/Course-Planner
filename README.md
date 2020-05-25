## Repository Format

- All code is in the main/ folder of the repository.

  - The API/ folder contains all of the Java APIs
  
  - The css/ folder contains all css for the application
  
  - The html/ folder contains all html code for the application
  
  - The js/ folder contains all JavaScript code for the application

- All other deliverables are in the doc/ folder, including the Datafiles for the Neo4j database, system design plans, CRC cards, and Product Backlogs for each sprint. 


## Run the _Course Planner_ Application

How to Run _Course Planner_:

1. Clone the repo

2. Setup a Neo4j database (Name: neo4j, Password: 1234) with the CSV files in doc/sprint4/Datafiles/ as described in Commands.txt in the same folder.

3. Run the Neo4j database

4. Run main/API/src/main/java/ca/utoronto/utm/mcs/App.java

5. Open main/html/'Course Search'.html in the Firefox browser

You can now use _Course Planner_'s features on the website you opened in Step 5.


## My Contributions

I wrote all code for the _Prerequisite Checker_ feature of the webpage, and worked with my team on all the deliverables in the doc/ folder.

My part in _Course Planner_'s _Prerequisite Checker_ are the following files:

- main/API/src/main/java/ca/utoronto/utm/mcs/Prerequisite.java

- main/API/src/main/java/ca/utoronto/utm/mcs/NoPrerequisite.java

- main/js/prerequisite.js

- main/js/no_prerequisite.js

- All html related to the _Prerequisite Checker_ feature on the webpage, on main/html/'Course Search'.html.
