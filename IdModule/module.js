var exports = module.exports = {};

//getId method to return id of student for email
exports.getId = function(qEmail, student) {
	try {
		function filterJSON(value) {
			var email = value.email;
			//Case insensitive email match
			if(email.toUpperCase() == qEmail.toUpperCase()) {
				console.log("[INFO] Email match found");
				return value;
			}
		}
		
		var qId = student.filter(filterJSON);
		
		return qId[0].id;
	} catch(ex) {
	}
};