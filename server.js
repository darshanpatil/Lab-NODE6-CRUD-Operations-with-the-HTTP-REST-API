var http = require("http");
var fs = require("fs");
var url = require("url");
var async = require("async");
var moment = require("moment");

var studJSON = [];
var sub_1 = [];
var sub_2 = [];
var sub_3 = [];
var sub_4 = [];

var idModule = require("./IdModule/module.js");

const PORT = 9090;
var reqJSON = '';
var resJSON = [];
var start;

var server = http.createServer(handleRequest);

function handleRequest(req, res) {
	start = moment();
	var query = url.parse(req.url, true).query;
	var pathName = url.parse(req.url, true).pathname;
	//console.log(req.method);
	//console.log(pathName);

	if(req.method == 'PUT' && pathName == '/api/student') {
		console.log("[INFO] Method: 'PUT' path: /api/student");
		readReqJSON(req);
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
			
			if(qId != null) {
				console.log("[INFO] Student already present");
				res.writeHead(500);
				res.end('Student record already present');
				return;
			}
			
			//start = moment();
			//console.log("[INFO] IdModule complete: ", moment().diff(start, "seconds", true));
			
			var newId = Math.floor(Math.random()*1000);
			var name = jsonval.name;
			//console.log('[INFO] Id: ' + newId + ' Email: ' + qEmail + ' Name: ' + name);
			//Append student record to student JSON
			studJSON.students.push({id: newId, email: qEmail, name: name});
			
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
			
			resJSON.push({id: newId, email: qEmail, name: name, enrolledSubjects: resEnrollment});
			console.log(JSON.stringify(resJSON));
			
			writeFiles();
			
			res.writeHead(200, "{content-type: application/json}");
			res.end(JSON.stringify(resJSON));
			return;
			//start = moment();
			//console.log("[INFO] Iterating through enroll complete: ", moment().diff(start, "seconds", true));
		}, 1000);
		console.log("[INFO] Method: 'PUT' path: /api/student Complete");
		
	} else if(req.method == 'GET' && pathName.indexOf('/api/student') != -1) {
		
		readFiles();
		var retId = pathName.split('/')[3];
		console.log("[INFO] Method: 'GET' path: /api/student/{id}");
		
		var student = studJSON.students.filter(function(value) {
			if(retId == value.id) {
				return value;
			}
		});
		
		var enrollData = [];
		
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
		
	} else if(req.method == 'GET' && pathName == '/api/students') {
		console.log("[INFO] Method: 'GET' path: /api/students");
		
		
		
		console.log("[INFO] Method: 'GET' path: /api/students Complete");
	} else if(req.method == 'POST' && pathName.indexOf('/api/student') != -1) {
		console.log("[INFO] Method: 'POST' path: /api/student/{id}");
		var updateId = pathName.split('/')[3];
		
		readReqJSON(req);
		setTimeout(function() {
			var jsonval = JSON.parse(reqJSON);
			
			for(var stud in studJSON.students) {
				if(studJSON.students[stud].id == updateId) {
					studJSON.students[stud].email = jsonval.email;
					studJSON.students[stud].name = jsonval.name;
				}
			}
			
			for(var inEnroll in jsonval.enrolledSubjects) {
				var removeIndex;
				if(jsonval.enrolledSubjects[inEnroll] == sub_1.subjectId) {
					for(var index in sub_1.enrolledStudents) {
						if(sub_1.enrolledStudents[index].id == jsonval.enrolledSubjects[inEnroll].id) {
							removeIndex = index;
						}
					}
				}
				sub_1.enrolledStudents.splice(removeIndex, 1);
				
				if(jsonval.enrolledSubjects[inEnroll] == sub_2.subjectId) {
					
				}
				if(jsonval.enrolledSubjects[inEnroll] == sub_3.subjectId) {
					
				}
				if(jsonval.enrolledSubjects[inEnroll] == sub_4.subjectId) {
					
				}
			}
		}, 1000);
		
		console.log("[INFO] Method: 'POST' path: /api/student/{id} Complete");
	} else if(req.method == 'DELETE' && pathName.indexOf('/api/student') != -1) {
		console.log("[INFO] Method: 'DELETE' path: /api/student/{id}");
		var delId = pathName.split('/')[3];
		readFiles();
		
		setTimeout(function() {
			var jsonval = studJSON;
			var index = -1;
			
			for(var stud in jsonval.students) {
				if(jsonval.students[stud].id == delId) {
					index = stud;
					//delete jsonval.students[stud];
				}
			}
			jsonval.students.splice(index, 1);
			
			if(index == -1) {
				res.writeHead(404);
				res.end("No student found !!!");
				return;
			}
			//jsonval.students.splice(index, 1);
			
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
			
			writeFiles();
			
			res.writeHead(200, "{content-type: application/json}");
			res.end(JSON.stringify(result));
			
		}, 1000);
		
		console.log("[INFO] Method: 'DELETE' path: /api/student/{id}");
	} else {
		res.writeHead(400);
		res.end();
	}
}

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

function readFiles() {
	//console.log("readFiles()");
	studJSON = readJSON('./Source/student.json');
	sub_1 = readJSON('./Source/sub_1.json');
	sub_2 = readJSON('./Source/sub_2.json');
	sub_3 = readJSON('./Source/sub_3.json');
	sub_4 = readJSON('./Source/sub_4.json');
}

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

server.listen(PORT, function(err) {
	console.log("[INFO] Server started on " + PORT);
});