function generateTable2() {
    for (var i = 1; i < 6; i++){
        for (var j = 0; j < 8; j++){
            var cell = document.getElementById(""+i+j);
            cell.value = 0;
            cell.innerHTML = "--------";
        }
    }
}

function removeCourse(id){
    var cell = document.getElementById(id)
    cell.removeAttribute("title");
    cell.onmouseover = function(){this.style.backgroundColor = "azure";};
    cell.innerHTML = "--------";
    cell.value = 0;
}

function addCourseToTable() {
    var courseCode = document.getElementById("code").value;
	var cName = "";
	var cYear = "";
	var cSeason = "";
	var cCampus = "";
    var cDist = "";
    var cDep = "";
	var url = "http://localhost:8080/api/v1/searchCourseTree?course="+courseCode;
	if (courseCode.length==0){
		document.getElementById("courseError").innerHTML = "<p>Course blank/missing</p>";
		return;
	} else {
		//document.getElementById("courseError").innerHTML = "<p></p>";
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
					alert("ERROR"); 
					console.log("Error:"+response.status);  
					return;  
				}
				// Examine the text in the response  
				response.json().then(function(data) {  
                    //document.getElementById("11").innerHTML = courseCode;
                    //console.log(document.getElementById("11").innerHTML);
//                    console.log("Data: " );
                    console.log("Response: " + response.json());
                    cName = data["Name"];
                    //console.log("name: " + cName);
                    cYear = data["Year"];
                    //console.log("year: " + cYear);
					cSeason = data["Season"];
					cCampus = data["Campus"];
                    cDist = data["Dist"];
//                    cDep = data["Dep"];
                    var inserted = false;
                    var index;
                    if (cYear == "1"){
                        if (cSeason == "Fall"){
                        index = 0;
                        }
                        else if (cSeason == "Winter"){
                            index = 1;
                        }
                    }
                    else if(cYear == "2"){
                        if (cSeason == "Fall"){
                            index = 2;
                        }
                        else if (cSeason == "Winter"){
                            index = 3;
                        }
                    }
                    else if(cYear == "3"){
                        if (cSeason == "Fall"){
                            index = 4;
                        }
                        else if (cSeason == "Winter"){
                            index = 5;
                        }
                    }
                    else if(cYear == "4"){
                        if (cSeason == "Fall"){
                            index = 6;
                        }
                        else if (cSeason == "Winter"){
                            index = 7;
                        }
                    }
                    var row = 1;
                    //console.log("index: " + index);
                    if (dupCourse2(courseCode) == false){ // ADDING TO TABLE
                        while (inserted == false){
                            if(row > 5){
                                alert("Semester full cannot add: " + courseCode + " to year " + cYear + " and semester " + cSeason);
                                inserted = true;
                            }
                            else if(document.getElementById(row).cells[index].value == 1){
                                row++;
                            }
                            else{
                                document.getElementById(row).cells[index].innerHTML = courseCode;
                                document.getElementById(row).cells[index].value = 1;
                                document.getElementById(row).cells[index].setAttribute("title", "SCI\n" + cName + "\n" + cSeason + " Semester and year " + cYear + " of study\nat " + cCampus + " campus");
                                document.getElementById(row).cells[index].onmouseover = function(){this.style.backgroundColor = "pink";};
                                document.getElementById(row).cells[index].onmouseout = function(){this.style.backgroundColor = "azure";};
                                inserted = true;
                            }
                        }
                    }
                    //cName = data["Name"];
					//cYear = data["Year"];
					//cSeason = data["Season"];
					//cCampus = data["Campus"];
                    //cDist = data["Dist"];
					//document.getElementById("12").innerHTML = "Year:" + data["Year"];
					//document.getElementById("13").innerHTML = "Season:" + data["Season"];
					//document.getElementById("14").innerHTML = "Campus:" + data["Campus"];
                    //document.getElementById("15").innerHTML = "Dist:" + data["Dist"];
                    //console.log(courseCode+" "+cName+" "+cYear+" "+cSeason+" "+cCampus+" "+cDist);
					//document.getElementById("loginError").innerHTML = "<p>"+data["Name"]+"</p>";
					
				});  
			});
            //alert(courseCode+" "+cName+" "+cYear+" "+cSeason+" "+cCampus+" "+cDist); 
	}
    
}

function dupCourse2(courseCode) {
    for (var i = 1; i < 6; i++){
        for (var j = 0; j < 8; j++){
            if(document.getElementById(""+i+j).innerHTML === courseCode){
                alert("Course: " + courseCode + " already in the slot");
                return true;
            }
        }
    }
    return false;
}