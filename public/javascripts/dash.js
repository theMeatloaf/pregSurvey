
var nextSurveyID = ""
var userID = ""
var username = ""
var beforeBirth = true

var startDate = new Date();

function loadInData() {
	$.get('/api/loggedIn',function(data,status) {
		//setup music if should
		if (data.music_enabled) {
			$("#musicPrompt").removeClass("hidden");
			setupMusicPlayer();
		} else {
			$("#musicPrompt").addClass("hidden");
		}

		if ( !data["next_survey_date"] ) {
			//handle no more surveys here!
			$("#prompt").html("No survey to take at this time!<br>Thank you for your participation!");
			$("#prompt").removeClass('dayText');
			return;
		}

		//get dates and show button if survey is due
		var date = new Date();
		var dueDate = new Date(data["next_survey_date"]);
		var numDays = 0;
		if (date > dueDate) {
			//gather some things to send to qualtrics later
			nextSurveyID = data["next_survey_position"];
			userID = data["id"];
			username = data["username"];
			if (data["birth_date"] != null) {
				beforeBirth = false
			}
			$("#surveyButt").removeClass("hidden");
			$("#radialIndicator").addClass("hidden");

			//try and get the next survey to show the number of days before late...
			$.get('/api/surveys/'+nextSurveyID+"&isBefore="+beforeBirth,function(data,status){
				if(data.days_till_next) {
					//calculate the date...
					var lastDate = new Date(dueDate);
					lastDate = lastDate.setDate(lastDate.getDate() + data.days_till_next);
					var numDaysLeft = daydiff(date,lastDate);
					$("#latePrompt").html(numDaysLeft+" DAY"+(numDaysLeft>1 ? "S" : "")+" LEFT TO COMPLETE SURVEY");
				}

			}).fail(function(data,status){

			});

			//$("#latePrompt").html(numDays+" DAY"+(numDays>1 ? "S" : "")+" LEFT TO COMPLETE SURVEY");
		} else {
			numDays = daydiff(date,dueDate);
			$("#prompt").html("DAY"+(numDays>1 ? "S" : "")+" UNTIL NEXT SURVEY");
		}

		$("#radialIndicator").radialIndicator({
        barColor: 'rgb(69,186,170)',
        fontFamily:'HelveticaNeue-Light',
        barWidth: 5,
        roundCorner : false,
        radius:30,
        initValue:0,
        percentage: false,
        fontSize:30,
        maxValue:60,
        frameNum:60,
        frameTime:40
        });
		var radialObj = $("#radialIndicator").data('radialIndicator');
		if (numDays > 60) {
			radialObj.option('format','#+');
			radialObj.option('fontSize',30);
		}
		radialObj.animate(numDays);

	}).fail(function(data,status){
		if (data.responseJSON){
        		$("#errorMessage").html(data.responseJSON['error']);
        		location.replace('/');
        	} else {
        		$("#errorMessage").html(data);
        	}
	});

}
var ap;
function setupMusicPlayer() {
	ap = new APlayer({
    element: document.getElementById('musicPlayer'),                       // Optional, player element
    narrow: false,                                                     // Optional, narrow style
    autoplay: false,                                                    // Optional, autoplay song(s), not supported by mobile browsers
    showlrc: 0,                                                        // Optional, show lrc, can be 0, 1, 2, see: ###With lrc
    mutex: true,                                                       // Optional, pause other players when this player playing
    theme: '#e6d0b2',                                                  // Optional, theme color, default: #b7daff
    mode: 'order',                                                    // Optional, play mode, can be `random` `single` `circulation`(loop) `order`(no loop), default: `circulation`
    preload: 'auto',                                               // Optional, the way to load music, can be 'none' 'metadata' 'auto', default: 'auto'
    listmaxheight: '513px',                                             // Optional, max height of play list
    music: [{                                                           // Required, music info, see: ###With playlist
        title: 'Civil War',                                          // Required, music title
        author: 'Grumpy cat',                          // Required, music author
        url: 'http://www.noiseaddicts.com/samples_1w72b820/2540.mp3',  // Required, music url
        pic: 'https://www.grumpycats.com/images/about/tardar.jpg'  // Optional, music picture
    },{                                                           // Required, music info, see: ###With playlist
        title: 'Civil War',                                          // Required, music title
        author: 'Grumpy cat',                          // Required, music author
        url: 'http://www.noiseaddicts.com/samples_1w72b820/2540.mp3',  // Required, music url
        pic: 'https://www.grumpycats.com/images/about/tardar.jpg'  // Optional, music picture
    }]
});

	ap.on("pause",function() {
		var now = new Date();
		var difference = (now - startDate)/1000;
		//need to send up that time...
		$.post('/api/addListeningTime',{seconds:difference},
			function(data,status) {
				console.log("added time");
		})
	});

	ap.on("play",function() {
		startDate = new Date();
	});
}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}

$("#play").click(function() {
  $("#play").slideUp(400);

  $(".aplayer").animate({
    width:'100%',
    height:'100%'
  }, 500, function() {
    // Animation complete.
  });
  
  ap.play();
});

$("#surveyButt").click(function(){
	//get survey and show it
	$.get('/api/surveys/'+nextSurveyID+"&isBefore="+beforeBirth,function(data,status){
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

