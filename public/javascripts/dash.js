

var nextSurveyID = ""
var userID = ""
var username = ""
var beforeBirth = true

var startDate = new Date();
var ap;
var spinner;

function loadInData() {
	$.get('/api/loggedIn',function(data,status) {
		//setup music if should
		if (data.music_enabled && data.birth_date == null) {
			$("#musicPrompt").removeClass("hidden");
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
					$("#latePrompt").html(numDaysLeft+" DAY"+(numDaysLeft>1 ? "S" : "")+" LEFT UNTIL NEXT SURVEY");
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

function toggleLoading(loading) {
	var mainBody = $("#mainBody");
	var spinBody = $("musicBody");

	if (loading) {
		var opts = {
		  lines: 10 // The number of lines to draw
		, length: 18 // The length of each line
		, width: 10 // The line thickness
		, radius: 25 // The radius of the inner circle
		, scale: 1 // Scales overall size of the spinner
		, corners: 1.0 // Corner roundness (0..1)
		, color: '#000' // #rgb or #rrggbb or array of colors
		, opacity: 0.25 // Opacity of the lines
		}
		mainBody.addClass("loading");
		spinner = new Spinner(opts).spin();
		spinBody.append(spinner.el);
	} else {
		spinner.stop();
		mainBody.removeClass("loading");
	}
}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}

$("#play").click(function() {
  $("#play").slideUp(400);

  $("#listenPrompt").removeAttr("hidden");
  $(".sess").animate({
    width:'50px',
    height:'50px'
  }, 500, function() {
  	$(".sess").removeClass("zero");
    // Animation complete.
  });
});

$(".sess").click(function() {
  //show loading
  toggleLoading(true);

  $(".sess").slideUp(400);
  $("#listenPrompt").attr("hidden","true");
  $(".aplayer").animate({
      width:'100%',
      height:'100%'
    }, 500, function() {
      // Animation complete.
  });
  $("#back").show();
   $("#back").animate({
    width:'90px'
  }, 500, function() {
  	$("#back").removeClass("zero");
  });

    //get filename:
    var path = "https://s3.eu-west-2.amazonaws.com/maternalments/"+this.id+".m4a";

  	setupMusicPlayer({                                                           // Required, music info, see: ###With playlist
        title: 'Listening Session '+this.id,                                          // Required, music title
        author: 'Maternal Moments',                          // Required, music author
        pic: 'https://maternalmomentsstudy.com/images/logo_circle.png',  // Required, music url
        url: path  // Optional, music picture
    });
  ap.play();
});


$(".back").click(function(){
	ap.pause();
	$(".sess").slideDown(400);
  	$("#listenPrompt").removeAttr("hidden");
	$(".back").addClass("zero");
	$(".back").animate({
		width:'0px'
	},500);
	$(".aplayer").animate({
      width:'0%',
      height:'0px'
    }, 500, function() {
      // Animation complete.
  });
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

$("#playAgain").click(function(){
  $("#listenPrompt").removeAttr("hidden");
   $("#listenPrompt").html("Pick a Session:");

  $(".sess").animate({
    width:'50px',
    height:'50px'
  }, 500, function() {
  	$(".sess").removeClass("zero");
    // Animation complete.
  });
});


//////------MUSIC PLAYER CODE
function setupMusicPlayer(music) {
	if (ap) {
	ap.destroy();
	}
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
    music: [music]
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

	ap.on("ended",function() {
	  $(".aplayer").animate({
	      width:'0%',
		  height:'0px'
	  }, 500, function() {
		   // Animation complete.
	  });
	  $("#back").hide();
	  $("#playAgain").animate({
	    width:'150px'
	  }, 500, function() {
	  	$("#playAgain").removeClass("zero");
	  });
	  $("#listenPrompt").html("Thank You For Listening!");
	  $("#listenPrompt").removeAttr("hidden");
	});

	ap.on("playing",function(){
		if (ap.audio.currentTime > 0) {
			toggleLoading(false);
		}
	});

	ap.on("play",function() {
		startDate = new Date();
	});
}