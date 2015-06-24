//Required dependencies
var http = require("http");
var fs = require("fs");
var url = require("url");
var async = require("async");
var moment = require("moment");

//JSON objects to be read from files
var studJSON = [];
var sub_1 = [];
var sub_2 = [];
var sub_3 = [];
var sub_4 = [];

//ID module
var idModule = require("./IdModule/module.js");

const PORT = 9090;

//Object to read request JSON value
var reqJSON = '';
var resJSON = [];
var start;

//Created simple http server
var server = http.createServer(handleRequest);

//Handler function to handle http request
function handleRequest(req, res) {
	//Moment plug-in to log particular moment time between two steps
	//start = moment();
	
	//Capture request queryString and path name
	var query = url.parse(req.url, true).query;
	var pathName = url.parse(req.url, true).pathname;
	
	//'PUT' method to save new student record
	if(req.method == 'PUT' && pathName == '/api/student') {
		console.log("[INFO] Method: 'PUT' path: /api/student");
		//Read the JSON from request
		readReqJSON(req);
		//Read JSON files from local storage
		readFiles();
		
		//Wait for some time to read JSON object from request
		setTimeout(function() {
			//start = moment();
			//console.log("[INFO] After read JSON: ", moment().diff(start, "seconds", true));
			var jsonval = JSON.parse(reqJSON);
			var qEmail = jsonval.email;
			
			//Call IdModule to get id from JSON for requested email
			//Check if the student with the 'email' is already present
			var qId = idModule.getId(qEmail, studJSON.students);
			
			//Return if the student with email already exist
			if(qId != null) {
				console.log("[INFO] Student already present");
				res.writeHead(500);
				res.end('Student record already present');
				return;
			}
			
			//start = moment();
			//console.log("[INFO] IdModule complete: ", moment().diff(start, "seconds", true));
			
			//Generate new id for student
			var newId = Math.floor(Math.random()*1000);
			var name = jsonval.name;
			//console.log('[INFO] Id: ' + newId + ' Email: ' + qEmail + ' Name: ' + name);
			//Append student record to student JSON
			studJSON.students.push({id: newId, email: qEmail, name: name});
			
			//Save student enrolment data to particular subjects 
			var newEnrollment = jsonval.enrolledSubjects;
			var resEnrollment = [];
			async.forEach(Object.keys(newEnrollment), function(key, next) {
				if(sub_1.subjectId == newEnrollment[key].subjectId) {
					sub_1.enrolledStudents.push({id: newId, score: newEnrollment[key].score});
					resEnrollment.push({subjectId: sub_1.subjectId, subjectName: sub_1.subjectName});
				}
				if(sub_2.subjectId == newEnrollment[key].subjectId) {
					sub_2.enrolledStudents.push({id: newId, score: newEnrollment[key].score});
					resEnrollment.push({subjectId: sub_2.subjectId, subjectName: sub_2.subjectName});
				}
				if(sub_3.subjectId == newEnrollment[key].subjectId) {
					sub_3.enrolledStudents.push({id: newId, score: newEnrollment[key].score});
					resEnrollment.push({subjectId: sub_3.subjectId, subjectName: sub_3.subjectName});
				}
				if(sub_4.subjectId == newEnrollment[key].subjectId) {
					sub_4.enrolledStudents.push({id: newId, score: newEnrollment[key].score});
					resEnrollment.push({subjectId: sub_4.subjectId, subjectName: sub_4.subjectName});
				}
			});
			
			resJSON = [];
			
			//Generate response JSON
			resJSON.push({id: newId, email: qEmail, name: name, enrolledSubjects: resEnrollment});
			console.log(JSON.stringify(resJSON));
			
			//Write the modified JSON files back to local file storage
			writeFiles();
			
			res.writeHead(200, "{content-type: application/json}");
			res.end(JSON.stringify(resJSON));
			return;
			//start = moment();
			//console.log("[INFO] Iterating through enroll complete: ", moment().diff(start, "seconds", true));
		}, 1000);
		console.log("[INFO] Method: 'PUT' path: /api/student Complete");
		
		//'GET' request to return student data for given student id if present
	} else if(req.method == 'GET' && pathName.indexOf('/api/student') != -1) {
		//Read file from local file storage
		readFiles();
		
		//Student id from request
		var retId = pathName.split('/')[3];
		console.log("[INFO] Method: 'GET' path: /api/student/{id}");
		
		//Find student with id
		var student = studJSON.students.filter(function(value) {
			if(retId == value.id) {
				return value;
			}
		});
		
		var enrollData = [];
		
		//If student record found in student JSON then get enrolment record for the same student for all subjects
		//he/she is registered
		if(student[0] != null) {
			
			for(var enroll in sub_1.enrolledStudents) {
				if(sub_1.enrolledStudents[enroll].id == retId) {
					enrollData.push({subjectId: sub_1.subjectId, subjectName: sub_1.subjectName});
				}
			}
			for(var enroll in sub_2.enrolledStudents) {
				if(sub_2.enrolledStudents[enroll].id == retId) {
					enrollData.push({subjectId: sub_2.subjectId, subjectName: sub_2.subjectName});
				}
			}
			for(var enroll in sub_3.enrolledStudents) {
				if(sub_3.enrolledStudents[enroll].id == retId) {
					enrollData.push({subjectId: sub_3.subjectId, subjectName: sub_3.subjectName});
				}
			}
			for(var enroll in sub_4.enrolledStudents) {
				if(sub_4.enrolledStudents[enroll].id == retId) {
					enrollData.push({subjectId: sub_4.subjectId, subjectName: sub_4.subjectName});
				}
			}
			
			//Prepare response JSON with student data
			var result = [{id: retId, email: student[0].email, name: student[0].name, enrollmentSubjects: enrollData}];
			
			res.writeHead(200, "{content-type: application/json}");
			res.end(JSON.stringify(result));
			console.log("[INFO] Get request completed");
			return;
		} else {
			res.writeHead(404);
			res.end("Student not found");
			return;
		}
		console.log("[INFO] Method: 'GET' path: /api/student/{id} Complete");
		
		//'GET' request to return all student records
	} else if(req.method == 'GET' && pathName == '/api/students') {
		console.log("[INFO] Method: 'GET' path: /api/students");
		
		//Process request
		
		console.log("[INFO] Method: 'GET' path: /api/students Complete");
		
		//'POST' request to update a particular student record
	} else if(req.method == 'POST' && pathName.indexOf('/api/student') != -1) {
		console.log("[INFO] Method: 'POST' path: /api/student/{id}");
		var updateId = pathName.split('/')[3];
		
		//Read JSON from request
		readReqJSON(req);
		
		setTimeout(function() {
			var jsonval = JSON.parse(reqJSON);
			
			//Update student record if the student found in Student JSON
			for(var stud in studJSON.students) {
				if(studJSON.students[stud].id == updateId) {
					studJSON.students[stud].email = jsonval.email;
					studJSON.students[stud].name = jsonval.name;
				}
			}
			
			//Update student's enrolment records for all subjects
			for(var inEnroll in jsonval.enrolledSubjects) {
				var removeIndex = -1;
				if(jsonval.enrolledSubjects[inEnroll] == sub_1.subjectId) {
					for(var index in sub_1.enrolledStudents) {
						if(sub_1.enrolledStudents[index].id == jsonval.enrolledSubjects[inEnroll].id) {
							removeIndex = index;
						}
					}
				}
				if(removeIndex != -1) {
					sub_1.enrolledStudents.splice(removeIndex, 1);
					removeIndex = -1;
				}
				
				if(jsonval.enrolledSubjects[inEnroll] == sub_2.subjectId) {
					for(var index in sub_2.enrolledStudents) {
						if(sub_2.enrolledStudents[index].id == jsonval.enrolledSubjects[inEnroll].id) {
							removeIndex = index;
						}
					}
				}
				if(removeIndex != -1) {
					sub_2.enrolledStudents.splice(removeIndex, 1);
					removeIndex = -1;
				}
				
				if(jsonval.enrolledSubjects[inEnroll] == sub_3.subjectId) {
					for(var index in sub_3.enrolledStudents) {
						if(sub_3.enrolledStudents[index].id == jsonval.enrolledSubjects[inEnroll].id) {
							removeIndex = index;
						}
					}
				}
				if(removeIndex != -1) {
					sub_3.enrolledStudents.splice(removeIndex, 1);
					removeIndex = -1;
				}
				
				if(jsonval.enrolledSubjects[inEnroll] == sub_4.subjectId) {
					for(var index in sub_4.enrolledStudents) {
						if(sub_4.enrolledStudents[index].id == jsonval.enrolledSubjects[inEnroll].id) {
							removeIndex = index;
						}
					}
				}
				if(removeIndex != -1) {
					sub_4.enrolledStudents.splice(removeIndex, 1);
					removeIndex = -1;
				}
			}
		}, 1000);
		
		console.log("[INFO] Method: 'POST' path: /api/student/{id} Complete");
		
		//'DELETE' request to delete particular student record along with its enrolment in any subject
	} else if(req.method == 'DELETE' && pathName.indexOf('/api/student') != -1) {
		console.log("[INFO] Method: 'DELETE' path: /api/student/{id}");
		var delId = pathName.split('/')[3];
		//Read Student and subjects files from local storage
		readFiles();
		
		setTimeout(function() {
			var jsonval = studJSON;
			var index = -1;
			
			//Delete record from student JSON if student found with given id
			for(var stud in jsonval.students) {
				if(jsonval.students[stud].id == delId) {
					index = stud;
					//delete jsonval.students[stud];
				}
			}
			jsonval.students.splice(index, 1);
			
			//If student record is not present in Student JSON itself then student is not present discard the request
			//and return proper message
			if(index == -1) {
				res.writeHead(404);
				res.end("No student found !!!");
				return;
			}
			//jsonval.students.splice(index, 1);
			//Continue if student found in Student JSON
			
			for(var stud in sub_1.enrolledStudents) {
				if(sub_1.enrolledStudents[stud].id == delId) {
					index = stud;
					//delete sub_1.enrolledStudents[stud];
				}
			}
			sub_1.enrolledStudents.splice(index, 1);
			
			for(var stud in sub_2.enrolledStudents) {
				if(sub_2.enrolledStudents[stud].id == delId) {
					index = stud;
					//delete sub_2.enrolledStudents[stud];
				}
			}
			sub_2.enrolledStudents.splice(index, 1);
			
			for(var stud in sub_3.enrolledStudents) {
				if(sub_3.enrolledStudents[stud].id == delId) {
					index = stud;
					//delete sub_3.enrolledStudents[stud];
				}
			}
			sub_3.enrolledStudents.splice(index, 1);
			
			for(var stud in sub_4.enrolledStudents) {
				if(sub_4.enrolledStudents[stud].id == delId) {
					index = stud;
					//delete sub_4.enrolledStudents[stud];
				}
			}
			sub_4.enrolledStudents.splice(index, 1);
			
			var result = {id: delId};
			
			//Write updated Students JSON files back to local storage
			writeFiles();
			
			res.writeHead(200, "{content-type: application/json}");
			res.end(JSON.stringify(result));
			
		}, 1000);
		
		console.log("[INFO] Method: 'DELETE' path: /api/student/{id}");
	} else {
		//Discard request if it does not match with the provided request method and request URL
		res.writeHead(400);
		res.end();
	}
}

//Function to read JSON from request
var readReqJSON = function(req) {
	//start = moment();
	//console.log("[INFO] Read JSON: ", moment().diff(start, "seconds", true));
	reqJSON = '';
	console.log('[INFO] Reading JSON object from request');
	req.on('data', function(data) {
		reqJSON += data;
	});
	
	req.on('end', function() {
		//start = moment();
		//console.log("[INFO] Complete read JSON: ", moment().diff(start, "seconds", true));
		console.log('[INFO] Reading JSON object from request completed');
		//console.log(JSON.parse(reqJSON));
	});
}

//Function to read JSON files from local storage
function readFiles() {
	//console.log("readFiles()");
	studJSON = readJSON('./Source/student.json');
	sub_1 = readJSON('./Source/sub_1.json');
	sub_2 = readJSON('./Source/sub_2.json');
	sub_3 = readJSON('./Source/sub_3.json');
	sub_4 = readJSON('./Source/sub_4.json');
}

//Function to write JSON files to local storage
function writeFiles() {
	writeJSON('./Source/student.json', studJSON);
	writeJSON('./Source/sub_1.json', sub_1);
	writeJSON('./Source/sub_2.json', sub_2);
	writeJSON('./Source/sub_3.json', sub_3);
	writeJSON('./Source/sub_4.json', sub_4);
}

var readJSON = function(path) {
	//console.log("readJSON: " + path);
	var file = fs.readFileSync(path);
	//console.log("file: " + file);
	return JSON.parse(file);
}

var writeJSON = function(path, data) {
	fs.writeFile(path, JSON.stringify(data), function (err) {
	if (err) throw err;
	  //console.log('It\'s saved!');
	});
}

//Start server on specified PORT variable
server.listen(PORT, function(err) {
	console.log("[INFO] Server started on " + PORT);
});