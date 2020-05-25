
var courseArray = new Array();
var RelArray =new Array; 
var Courses = new Array; 
var Mod;
var file; 
function parseCookie(name){
	//REFERENCED FROM: https://www.quirksmode.org/js/cookies.html
	var nameEQ = name + "=";
	var cookieInfo = document.cookie.split(';');
	for(var i=0;i < cookieInfo.length;i++) {
		var c = cookieInfo[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
function generateTree() {
var $ = go.GraphObject.make;
var myDiagram =
  $(go.Diagram, "gradTree",
    {
      "undoManager.isEnabled": true // enable Ctrl-Z to undo and Ctrl-Y to redo
    });
myDiagram.nodeTemplate =
	$(go.Node, "Auto",
	$(go.Shape, "Rectangle",
	new go.Binding("fill", "color")),
	$(go.TextBlock,
	{ margin: 5 },
	new go.Binding("text", "key"))
	);

var myModel = $(go.GraphLinksModel);
// in the model data, each node is represented by a JavaScript object:
myModel.nodeDataArray = [
  { key: "Alpha", color: "red"},
  { key: "Beta", color: "blue"}
];
myDiagram.model = myModel;
Mod = myDiagram; 

}

function save(){
 file = Mod.model.toJson(); 
 document.cookie="treedata="+file; 
}
function load(){
var get =parseCookie('treedata');
Mod.model = go.Model.fromJson(get); 
}


class Course {

constructor(code, name, year, season, campus, dist, dep){
	this.code = code;
	this.name = name;
	this.year =year;
	this.season =season;
	this.campus =campus;
	this.dist =dist;
	this.dep = dep; 

}
addCourse(){
	alert(this.name);
	if(this.dep ="CSC"){
		alert(this.name);
		var temp = {key: String(this.code), color:"lime"};
		Mod.model.addNodeData(temp);
	}
	//var temp = {key: String(this.code)};
	
	//Courses.push(this);
	
}

}




function addLink(){
	var courseCode1 = document.getElementById("link1").value;
	var courseCode2 = document.getElementById("link2").value;
	var temp = {to: String(courseCode2), from: String(courseCode1)};
	Mod.model.addLinkData(temp);
}


function addCourse() {
    //var courses = ["CSC108F3", "CSC148F3", "CSC207F3", "CSC209F3", "CSC301F3", "MAT102F2", "MAT153W1", "STA256W4"]; //list of courses to add
	var courseCode = document.getElementById("code").value;
	var course = {};
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
					cName = data["Name"];
					cYear = data["Year"];
					cSeason = data["Season"];
					cCampus = data["Campus"];
					cDist = data["Dist"];
					cDep = data["Dep"];
					/*document.getElementById("courseName").innerHTML = "Name:" + cName;
					document.getElementById("courseYear").innerHTML = "Year:" + cYear;
					document.getElementById("courseSeason").innerHTML = "Season:" + cSeason;
					document.getElementById("courseCampus").innerHTML = "Campus:" + cCampus;
					document.getElementById("courseDist").innerHTML = "Dist:" + cDist;
					document.getElementById("courseDep").innerHTML = "Dep:" + cDep;*/
					var elmt = new Course(courseCode,cName,cYear,cSeason,cCampus,cDist,cDep);
					elmt.addCourse(); 
				});  
			});
			 
	}
	

    
}
