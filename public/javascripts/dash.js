
var nextSurveyID = ""
var userID = ""
var username = ""


function loadInData() {
	var ap = new APlayer({
    element: document.getElementById('player1'),                       // Optional, player element
    narrow: false,                                                     // Optional, narrow style
    autoplay: false,                                                    // Optional, autoplay song(s), not supported by mobile browsers
    showlrc: 0,                                                        // Optional, show lrc, can be 0, 1, 2, see: ###With lrc
    mutex: true,                                                       // Optional, pause other players when this player playing
    theme: '#e6d0b2',                                                  // Optional, theme color, default: #b7daff
    mode: 'order',                                                    // Optional, play mode, can be `random` `single` `circulation`(loop) `order`(no loop), default: `circulation`
    preload: 'metadata',                                               // Optional, the way to load music, can be 'none' 'metadata' 'auto', default: 'auto'
    listmaxheight: '513px',                                             // Optional, max height of play list
    music: [{                                                           // Required, music info, see: ###With playlist
        title: 'Civil War',                                          // Required, music title
        author: 'Grumpy cat',                          // Required, music author
        url: 'http://www.noiseaddicts.com/samples_1w72b820/2540.mp3',  // Required, music url
        pic: 'https://www.grumpycats.com/images/about/tardar.jpg',  // Optional, music picture
        lrc: '[00:00.00]lrc here\n[00:01.00]aplayer'                   // Optional, lrc, see: ###With lrc
    },{                                                           // Required, music info, see: ###With playlist
        title: 'Civil War',                                          // Required, music title
        author: 'Grumpy cat',                          // Required, music author
        url: 'http://www.noiseaddicts.com/samples_1w72b820/2540.mp3',  // Required, music url
        pic: 'https://www.grumpycats.com/images/about/tardar.jpg',  // Optional, music picture
        lrc: '[00:00.00]lrc here\n[00:01.00]aplayer'                   // Optional, lrc, see: ###With lrc
    }]
});


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
			nextSurveyID = data["next_survey_position"];
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

