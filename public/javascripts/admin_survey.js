
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
            thisRow.find('#qualtricksInput').val(data[i].qualtrics_id);
            
            thisRow.find('.btnUp').attr("id",data[i].position);
            thisRow.find('.btnDwn').attr("id",data[i].position);
            thisRow.find('.btnUp').removeClass('disabled');
            thisRow.find('.btnDwn').removeClass('disabled');

            //handle hiding those buttons now
            if (i == 0) {
                thisRow.find('.btnUp').addClass('disabled');
            }
            if (i == data.length - 1 ) {
                 thisRow.find('.btnDwn').addClass('disabled');
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