window.addEventListener("load", function(){

    const searchbarcontainer = document.querySelector('#searchcontainer');
    const searchForm = document.querySelector('#searchbar');
    const searchField = document.querySelector('#searchfield');
    const courses = document.createElement('table');
    courses.className = "lectureTable";
//Add to CSS file after

    const coursesbody = document.createElement('tbody');
    coursesbody.className = "lectureTableBody";
    
    searchForm.addEventListener("submit",function(e) {
    e.preventDefault(); // before the code
    /* do what you want with the form */

    // Should be triggered on form submit
    window.courseSearched = searchfield.value;
    console.log("Course searched is "+courseSearched);
    clearPage(searchbarcontainer,courses,coursesbody);
    handleSearch(courseSearched);
    window.courseData = parseCookie("courseResponse");
    //console.log("Data found: "+courseSearchResponse['Lectures']);
    console.log(window.courseData);
   
    if(courseExists(window.courseData)){
        var semester;
        insertLectureHeader(coursesbody);

        //var semester = function(){
            if (window.courseData['Semester']=='Fall'){
                semester = insertFallSemester(coursesbody);
            }
            else{
                semester = insertWinterSemester(coursesbody);
            }
                //return insertFallSemester(coursesbody);
           // return insertWinterSemester(coursesbody);
        //}
        //console.log(semester.children)
        insertCourseCode(semester);
        //insertCourseDetails(prerequisites,corequisites,orderExclusions,semester);
       // insertLectureHeader(semester);
        insertTableHeaders(semester);
        insertLectures(semester);
        // insertLecture(section,time,location,instructor,semester);
        // insertLecture(section,time,location,instructor,semester);
        //addToTableBody(coursesbody,semester);
        
    }
    else{
        (function(){
            if (window.courseData==null){
                message="Cookie not found";
            }
            else{
                message="COURSE "+courseSearched+" NOT FOUND";
            }
            alert(message);
            const errorMessage = coursesbody.insertRow(0);
            const errorMessageText = document.createElement("H6");
            errorMessageText.className = 'errormessage';
            errorMessageText.innerText = message;
            errorMessage.appendChild(errorMessageText);
     })();
   }
    addToTable(courses,coursesbody);
        if(searchbarcontainer!==null){
            addToContainer(searchbarcontainer,courses);
        }
        else{
            console.log("Couldnt load searchbarcontainer");
        }
    });
    //addToTableBody(coursesbody,semester)
//     addToTable(courses,coursesbody);
//     addToContainer(searchbarcontainer,courses);

    function insertLectureHeader(coursesbody){
        const currentcoursesheader = document.createElement("tr");
        const currentcoursesheadertext = document.createElement("H2");
        currentcoursesheadertext.innerText="Courses currently offered";
        currentcoursesheader.appendChild(currentcoursesheadertext);
        addToTableBody(coursesbody,currentcoursesheader);
//currentcoursesheader.style="1px solid red";
//coursesbody.appendChild(currentcoursesheader);
//courses.appendChild(coursesbody);
    }
    function insertFallSemester(coursesbody){
        const fallSemester = document.createElement('div');
        fallSemester.className = 'fall';
        const fallheader = document.createElement('tr');
        const fallheadertext = document.createElement("H3");
        fallheadertext.className = 'semesterHeader';
        fallheadertext.innerHTML='FALL';
        fallheader.appendChild(fallheadertext);
        addToSemester(fallSemester,fallheader);
        addToTableBody(coursesbody,fallSemester);
        return fallSemester;
    }
    function insertWinterSemester(coursesbody){
        const winterSemester =  document.createElement('div');
        winterSemester.className = 'winter';
        const winterheader = document.createElement('tr');
        const winterheadertext = document.createElement("H3");
        winterheadertext.innerHTML='WINTER';
        winterheader.appendChild(winterheadertext);
        addToSemester(winterSemester,winterheader);
        addToTableBody(coursesbody,winterSemester);
        return winterSemester;
    }
//fallheader.setAttribute('border', '1');
    //If course is found
     function insertCourseCode(semester){
        const coursecode = document.createElement('tr');
        const coursecodetext = document.createElement("H6");
        coursecodetext.className = "courseCode";
        coursecodetext.innerHTML=courseSearched;
        coursecode.appendChild(coursecodetext);
        console.log(semester.children)
        addToSemester(semester,coursecode);
     }

     function insertCourseDetails(prerequisites,corequisites,orderExclusions,semester){     
         const coursedetails = document.createElement('tr');
         coursedetails.class,coursedetails.id = "courseRelations";
         const par = document.createElement('p');
         par.innerHTML = 'Prerequisites: \n\nCorequisites: \n\nOrder Exclusions: '
         //par.innerText = `Prerequisites: ${prerequisites} \n\nCorequisites: ${corequisites} \n\nOrder Exclusions: ${orderExclusions}`
         coursedetails.appendChild(par);
         addToSemester(semester,coursedetails);
     }
//fallheader.setAttribute('border', '1');
     function insertLectureHeader(semester){
         const lectureheader = document.createElement('tr');
         lectureheader.className = 'lecturesHeader';
         const lectureheadertext = document.createElement("H4");
         lectureheadertext.innerHTML='Lectures';
         lectureheader.appendChild(lectureheadertext);
         addToSemester(semester,lectureheader);
        }

     function insertTableHeaders(semester){
         const lecturedetailsheaders = document.createElement('tr');
         lecturedetailsheaders.className='tableHeader'
         insertSectionHeader(lecturedetailsheaders);
         insertTimeHeader(lecturedetailsheaders);
         insertLocationHeader(lecturedetailsheaders);
         insertInstructorHeader(lecturedetailsheaders);
         insertEmptyHeader(lecturedetailsheaders);
         addToSemester(semester,lecturedetailsheaders);
//const sectionheadertext = document.createElement('div');
//sectionheadertext.innerText = 'Section';
         function insertSectionHeader(lecturedetailsheaders){
             const sectionheader = lecturedetailsheaders.insertCell();
             sectionheader.className = 'tableHeaders';
             sectionheader.appendChild(document.createTextNode("Section"));
          };
          function insertTimeHeader(lecturedetailsheaders){ 
             const timeheader = lecturedetailsheaders.insertCell();
             timeheader.className = 'tableHeaders'
             const timeheadertext = document.createElement('H5');
             timeheadertext.innerText = 'Time'; 
             timeheader.appendChild(timeheadertext);
          };
           function insertLocationHeader(lecturedetailsheaders){
              const locationheader = lecturedetailsheaders.insertCell();
              locationheader.className = 'tableHeaders'

              const locationheadertext = document.createElement('H5');
              locationheadertext.innerText = 'Location'; 
              locationheader.appendChild(locationheadertext);
           };
           function insertInstructorHeader(lecturedetailsheaders){
                const instructorheader = lecturedetailsheaders.insertCell();
                instructorheader.className = 'tableHeaders'
                const instructorheadertext = document.createElement('H5');
                instructorheadertext.innerText = 'Instructor'; 
                instructorheader.appendChild(instructorheadertext);
            };
            function insertEmptyHeader(lecturedetailsheaders){
                const emptyheader = lecturedetailsheaders.insertCell();
                emptyheader.className = 'tableHeaders';
                const emptyheadertext = document.createElement('H5');
                emptyheadertext.innerText = '';
                emptyheader.appendChild(emptyheadertext);
            };
        };
//lectureheader.appendChild(lecturedetailsheaders);
        function insertLecture(section,time,location,instructor,semester){
            const lecture = document.createElement('tr');
            lecture.className = 'lectures';
            
            insertSection(lecture,section);
            insertTime(lecture,time);
            insertLocation(lecture,location);
            insertInstructor(lecture,instructor);
            insertAddLectureButton(lecture);
            addToSemester(semester,lecture);

            function insertSection(lecture,section){
                const lecturesection = lecture.insertCell();
                lecturesection.className = 'lecture'
// lecture1section.appendChild(lecture1sectiontext);
                lecturesection.appendChild(document.createTextNode(section));
            };
            function insertTime(lecture,time){
                const lecturetimetext = document.createElement("p")
                //lecturetimetext.innerText = "Monday:12:00PM-1:00PM\n\nWednesday:2:00PM-3:00PM\n\nFriday:11:00AM-12:00PM";
                lecturetimetext.innerText = time;
                const lecturetime = lecture.insertCell();
                lecturetime.className = 'lecture';
                lecturetime.appendChild(lecturetimetext);
            };
            function insertLocation(lecture,location){
                const lecturelocation = lecture.insertCell();
                lecturelocation.className = 'lecture';
                lecturelocation.appendChild(document.createTextNode(location));
            };
            function insertInstructor(lecture,instructor){
                const lectureinstructor = lecture.insertCell();
                lectureinstructor.className = 'lecture';
                lectureinstructor.appendChild(document.createTextNode(instructor));
            };
            function insertAddLectureButton(lecture){
                const addlecture = lecture.insertCell();
                addlecture.className = 'lecture';
                const addlecturebutton = document.createElement("button");
                addlecturebutton.innerText = "Add Lecture";
                addlecturebutton.addEventListener ("click", function() {
                    alert("Course Added");
                });
                addlecture.appendChild(addlecturebutton);
                
            };
        };

// const lecture2 = document.createElement('tr');
// lecture2sectiontext = document.createElement('p');
// lecture2sectiontext.innerText = "LEC0102";
// const lecture2section = lecture2.insertCell();
// lecture2section.appendChild(lecture2sectiontext);
// //lecture1section.appendChild(document.createTextNode("LEC0101"));
// const time2= document.createElement("p")
// time2.innerText = "Monday: 4:00PM - 5:00PM\nWednesday: 4:00PM - 5:00PM\nFriday: 10:00AM - 12:00PM"
// const lecture2time = lecture2.insertCell();
// lecture2time.appendChild(time2);
// const lecture2location = lecture2.insertCell();
// lecture2location.appendChild(document.createTextNode("DH 2020"));
// const lecture2instructor = lecture2.insertCell();
// lecture2instructor.appendChild(document.createTextNode("Andrew Peterson"));
// const lecture2addcourse = lecture2.insertCell();
// const addcoursebutton2 = document.createElement("button");
// addcoursebutton2.innerHTML = "Add course";
// addcoursebutton2.addEventListener ("click", function() {
//   alert("did something");
// });
// lecture2addcourse.appendChild(addcoursebutton2);

    
    function addToSemester(semester,row){
        semester.appendChild(row)
    }
    function addToTableBody(body,semester){
        body.appendChild(semester);
    }

    function addToTable(table,body){
        table.appendChild(body);
    }
    function addToContainer(container,table){
        container.appendChild(table);
    }
    function clearPage(container,courses,coursesbody){
        coursesbody.innerHTML='';
        addToTable(courses,coursesbody);
        addToContainer(container,courses);
    }
    function courseExists(json){
        if (json['SearchResponse'] == "Everything went fine") { return true; }
        if (json['SearchResponse'] == "Course not found") {return false;}
    }
    function getSemester(){
        console.log(window.courseData['Semester'].toLowerCase())
        console.log("children: "+fall.children);
        if(window.courseData['Semester'].toLowerCase()=='fall'){
            return fall;
        }
        return fall;
    }
    function insertLectures(semester){
        const lectures = window.courseData['Lectures'];
        for (let i = 0; i<lectures.length; i++){
            (function(){
                const time = `${lectures[i]['Day']}:${lectures[i]['TimeS']}-${lectures[i]['TimeF']}`
                const section = lectures[i]['Section'];
                const instructor = lectures[i]['Prof'];
                const room = lectures[i]['Room'];
                insertLecture(section,time,room,instructor,semester);
            }())
        }
        }
    
    function parseCookie(name){
	//REFERENCED FROM: https://www.quirksmode.org/js/cookies.html
	var nameEQ = name + "=";
	var cookieInfo = document.cookie.split(';');
	for(var i=0;i < cookieInfo.length;i++) {
		var c = cookieInfo[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0){
            var jsonCookie = c.substring(nameEQ.length,c.length);
            var json = JSON.parse(jsonCookie);
            console.log("Json in course search.js is "+json)
            //var jsonStr = JSON.stringify(json, null, 2);
            console.log(json['Lectures']);
            return json;
        }
	}
	return null;
}
});
// coursesbody.appendChild(currentcoursesheader);
// coursesbody.appendChild(fallheader);
// coursesbody.appendChild(coursecode);
// coursesbody.appendChild(coursedetails);
// coursesbody.appendChild(lectureheader);
// coursesbody.appendChild(lecturedetailsheaders);
// coursesbody.appendChild(lecture1);
// coursesbody.appendChild(lecture2);
// coursesbody.appendChild(winterheader);

// courses.appendChild(coursesbody);
// searchbarcontainer.appendChild(courses);

