function handlePrerequisite(){
	var course = document.getElementById("prerequisiteSearchBar").value;
	var courseResponse = "";
	
	var url = "http://localhost:8080/api/v1/checkPrerequisite?course="+course;
	
	fetch(url, {
		method: 'GET', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'omit', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		}
	}).then(  
        function(response) {  
            if (response.status !== 200) {  
                console.log("Error:"+response.status);  
                return;  
            }

            // Examine the text in the response  
            response.json().then(function(data) {  
				courseResponse = data["PrerequisiteResponse"];
				if (courseResponse == "Course not found"){
					document.getElementById("prerequisiteSearchError").innerHTML = "<p>Course does not exist</p>";
				} else {
					document.getElementById("prerequisiteSearchError").innerHTML = courseResponse;
	}
            });  
        }  
    )
    .catch(function(err) {  
        document.write('Fetch Error :-S', err);  
    });
}