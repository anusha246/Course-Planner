function handleLogin(){
	var userid = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	var userResponse = "";
	var passResponse = "";
	
	var url = "http://localhost:8080/api/v1/checkUser?username="+userid+"&password="+password;
	if (userid.length==0){
		document.getElementById("loginError").innerHTML = "Username blank/missing";
		return;
	} else if (password.length==0){
		document.getElementById("loginError").innerHTML = "Password blank/missing";
		return;
	} else {
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
					userResponse = data["UserResponse"];
					passResponse = data["PassResponse"];
					if (userResponse == "incorrect"){
						document.getElementById("loginError").innerHTML = "User does not exist";
					} else if (userResponse == "correct" && passResponse == "incorrect"){
						document.getElementById("loginError").innerHTML = "Incorrect Password";
					} else if (userResponse == "correct" && passResponse == "correct"){
						document.cookie = "username="+userid;
						window.location.href = "Course Search.html";
					}
				});  
			});
	}
}
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
function getUserInfo(){
	var username = parseCookie('username');
	var url = "http://localhost:8080/api/v1/getUser?username="+username;
	fetch(url, {
			method: 'GET', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'omit', // include, *same-origin, omit
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			}
	}).then(function(response) {  
				if (response.status !== 200) {  
					console.log("Error:"+response.status);  
					return;  
				}

				// Examine the text in the response  
				response.json().then(function(data) {
					document.getElementById("fname").innerHTML = "First Name:" + data["fname"];
					document.getElementById("lname").innerHTML = "Last Name:" + data["lname"];
					document.getElementById("program").innerHTML = "Program:" + data["program"];
					document.getElementById("year").innerHTML = "Year:" + data["year"];
					document.getElementById("username").innerHTML = "Username:" + username;
					document.getElementById("email").value = data["email"];
					document.cookie="email="+data["email"];
				});
			});
	
}
function updateUser(){
	var username = parseCookie('username');
	var email = document.getElementById("email").value;
	var newPassword = document.getElementById("newPass").value;
	var cnewPassword = document.getElementById("cnewPass").value;
	
	if (newPassword.length==0 && cnewPassword.length==0 && email== parseCookie("email")){
		document.getElementById("updateError").innerHTML = "No changes made";
		return;
	}
	if (email.length==0){
		document.getElementById("updateError").innerHTML = "Email cannot be empty";
		return;
	} else if (email == parseCookie("email")){
		email="noChange";
	}
	if (newPassword.length!=0 && cnewPassword.length!=0 && newPassword.length < 6){
		document.getElementById("updateError").innerHTML = "Password must longer than 6 characters";
		return;
	}
	
	if (newPassword != cnewPassword){
		document.getElementById("updateError").innerHTML = "Passwords do not match";
		return;
	} else {
		var url = "http://localhost:8080/api/v1/updateUser"
		var data = {
			"username": username,
			"email": email,
			"password": newPassword
		};
		fetch(url, {
				method: 'POST', // *GET, POST, PUT, DELETE, etc.
				mode: 'cors', // no-cors, *cors, same-origin
				cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				credentials: 'omit', // include, *same-origin, omit
				body: JSON.stringify(data),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).then((data) => {
				document.getElementById("updateError").innerHTML = "Update successful";
		}).catch((error)=>{
				document.getElementById("updateError").innerHTML = "Update Error: Please try again";
		});
	}
}
function handleRegister(){
	var fname = document.getElementById("firstname").value;
	var lname = document.getElementById("lastname").value;
	var email = document.getElementById("email").value;
	var program = document.getElementById("program").value;
	var age = parseInt(document.getElementById("age").value);
	var year = parseInt(document.getElementById("year").value);
	
	var userid = document.getElementById("rusername").value;
	var password = document.getElementById("rpassword").value;
	var cPassword = document.getElementById("confirmPass").value;
	
	var gender = "";
	if (document.querySelector('input[name="gender"]:checked').value == "other"){
		if ((document.getElementById("optgender").value).length == 0){
			gender = "Not Specified";
		} else {
			gender = document.getElementById("optgender").value;
		}
	} else {
		gender = document.querySelector('input[name="gender"]:checked').value;
	}
	
	if (fname.length==0 || lname.length==0 || email.length==0 || age.isNaN || year.isNaN){
		document.getElementById("registerError").innerHTML = "<p>Unable to Register: Missing/Blank Information</p>";
		return;
	} else if (userExists() == true){
		document.getElementById("registerError").innerHTML = "<p>Username already exists</p>";
		return;
	} else {
		if (password != cPassword){
			document.getElementById("registerError").innerHTML = "<p>Passwords do not match</p>";
			return;
		} else if (password.length < 0){
			document.getElementById("registerError").innerHTML = "<p>Password must be longer than 6 characters</p>";
			return;
		} else {
			var url = "http://localhost:8080/api/v1/addUser";
			var data = {
						"fname": fname,
						"lname": lname,
						"email": email,
						"username": userid,
						"password": password,
						"gender": gender,
						"age": age,
						"year": year,
						"program": program
						};
			fetch(url, {
				method: 'POST', // *GET, POST, PUT, DELETE, etc.
				mode: 'cors', // no-cors, *cors, same-origin
				cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				credentials: 'omit', // include, *same-origin, omit
				body: JSON.stringify(data),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).then((data) => {
				document.getElementById("registerError").innerHTML = "Registration successful";
			}).catch((error)=>{
				document.getElementById("registerError").innerHTML = "Registration Error: Please try again";
			});
		}
	}
}
function userExists(){
	var userid = document.getElementById("rusername").value;
	var password = "checker";
	var userResponse = "";
	var passResponse = "";
	
	var url = "http://localhost:8080/api/v1/checkUser?username="+userid+"&password="+password;
	
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
				userResponse = data["UserResponse"];
				if (userResponse == "correct"){
					return true;
				} else {
					return false;
				}
            });  
        }  
    )
}

function customGender(){
	if (document.querySelector('input[name="gender"]:checked').value == "other"){
		document.getElementById("customGender").innerHTML = "<input type=\"text\" id=\"optgender\" placeholder=\"Gender(Optional)\"/>";
		return true;
	} else {
		document.getElementById("customGender").innerHTML = "";
		return false;
	}
}

function selectLogin(){
	$("#Login").show();
	$("#Register").hide();
	
	var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
function selectRegister(){
	$("#Login").hide();
	$("#Register").show();
}