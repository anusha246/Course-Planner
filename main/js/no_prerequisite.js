function handleNoPrerequisite(){
	var getResponse = "";
	
	var url = "http://localhost:8080/api/v1/checkNoPrerequisite";
	
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
				getResponse = data["noPrerequisiteResponse"];
				if (getResponse == "No courses"){
					document.getElementById("noPrerequisiteSearchError").innerHTML = "<p>There are no courses with no prerequisites</p>";
				} else {
					document.getElementById("noPrerequisiteSearchError").innerHTML = getResponse;
	}
            });  
        }  
    )
    .catch(function(err) {  
        document.write('Fetch Error :-S', err);  
    });
}