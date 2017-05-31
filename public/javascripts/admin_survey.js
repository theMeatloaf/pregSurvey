
$("#goAdminButton").click(function(event) {
	location.replace("/admin");
});

var row;

function loadInData() {
	row = $("#searchResult").clone();
    $("#resultContainer").html('');

    $.get('/api/loggedIn',function(data,status) {
    if (data.permission_level == 1) {
        //we've got an admin
        loadSurveys();
    } else {
        location.replace('/');
    }
    }).fail(function(data,status){
        //go to login
        location.replace('/');
    });
}

$('#resultContainer').delegate('.delButton','click',function(event){    
    $.ajax({
        url:'/api/surveys/'+this.id,
        method:'DELETE'})
    .done(function() {
        loadInData();
    })
    .fail(function() {

    });
});


$('#resultContainer').delegate('.saveBtn','click',function(event){    
    //get params...
    var position = parseInt(this.id)
    var daysTil = $("#"+position+".daysText").val()
    var qualID = $("#"+position+".qualtricsText").val();

    console.log({
        qualtrics_id:qualID,
        position:position,
        daysTill:daysTil
    });

    $.post('/api/updateSurvey',{
        qualtrics_id:qualID,
        position:position,
        daysTill:daysTil
    },function(data,status) {
        $("#successMessage").html("Saved Survey!");
        loadInData();
    }).fail(function(data,status) {
        $("#errorMessage").html(data);
    });
});

$("#newButton").click(function(event) {
    //need to save first?

    $.get('api/newSurvey',{},function(data,status) {
        //got a survey back...reload that ish
        loadInData();
    }).fail(function(data,status) {
        $("#errorMessage").html(data);
    });
});

function loadSurveys() {
	$.get('/api/getSurveys',function(data,status) {
		for (var i = 0; i < data.length; i++) {
			var thisRow = row.clone();
			thisRow.find('.value').html("Survey #"+(data[i].position));
            thisRow.find('.qualtricsText').val(data[i].qualtrics_id);
            thisRow.find('.daysText').val(data[i].days_till_next);
            
            thisRow.find('.daysText').attr("id",data[i].position);
            thisRow.find('.qualtricsText').attr("id",data[i].position);
            thisRow.find('.btnUp').attr("id",data[i].position);
            thisRow.find('.btnDwn').attr("id",data[i].position);
            thisRow.find('.delButton').attr("id",data[i].position);
            thisRow.find('.saveBtn').attr("id",data[i].position);
            thisRow.find('.btnUp').removeClass('disabled');
            thisRow.find('.btnDwn').removeClass('disabled');
            thisRow.find('.btnUp').attr("disabled",null);
            thisRow.find('.btnDwn').attr("disabled",null);

            //handle hiding those buttons now
            if (i == 0) {
                thisRow.find('.btnUp').attr("disabled","disabled");
                thisRow.find('.btnUp').addClass('disabled');
            }
            if (i == data.length - 1 ) {
                thisRow.find('.delButton').removeClass('hidden');
                thisRow.find('.btnDwn').addClass('disabled');
                thisRow.find('.btnDwn').attr("disabled","disabled");
            } else {
                thisRow.find('.delButton').addClass('hidden');
            }

		    $("#resultContainer").append(thisRow);
		} 
    }).fail(function(data,status) {
        $("#errorMessage").html(data);
    });
}

$('#resultContainer').delegate('.btnDwn','click',function(event){
    //move this survey up in position....
    $.get('api/surveys/shiftUp/'+this.id,function(data,status) {
        loadInData();
    });
});

$('#resultContainer').delegate('.btnUp','click',function(event){
    //move this survey up in position....
    $.get('api/surveys/shiftDown/'+this.id,function(data,status) {
        loadInData();
    });
});