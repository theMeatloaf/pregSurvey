
var nextSurveyID = ""
var userID = ""
var username = ""

function loadInData() {
	$.get('/api/loggedIn',function(data,status) {
		if ( !data["next_survey_date"] ) {
			//handle no more surveys here!
			$("#prompt").html("No more surveys to take!<br>Thank you for your participation!");
			return;
		}

		//get dates and show button if survey is due
		var date = new Date();
		var dueDate = new Date(data["next_survey_date"]);

		if (date > dueDate) {
			//gather some things to send to qualtrics later
			nextSurveyID = data["next_survey_id"];
			userID = data["id"];
			username = data["username"];
			$("#surveyButt").removeClass("hidden");
		} else {
			var numDays = daydiff(date,dueDate);
			$("#prompt").html(numDays+" day"+(numDays>1 ? "s" : "")+" until next survey");
		}
	}).fail(function(data,status){
		if (data.responseJSON){
        		$("#errorMessage").html(data.responseJSON['error']);
        		location.replace('/');
        	} else {
        		$("#errorMessage").html(data);
        	}
	});

}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}

$("#surveyButt").click(function(){
	//get survey and show it
	$.get('/api/surveys/'+nextSurveyID,function(data,status){
		if(data["qualtrics_id"]){
			//time to open the survey brah...
			window.location.href = "https://goldpsych.eu.qualtrics.com/jfe/form/"+data["qualtrics_id"]
			+"?ExternalDataReference="+userID+
			"&RecipientEmail="+username;
		}
	}).fail(function(data,status){

	});
});

$("#goSettingsBtn").click(function(){
	window.location.href = "/settings";
});

