
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

function loadSurveys() {
	$.get('/api/getSurveys',function(data,status) {
		for (var i = 0; i < data.length; i++) {
			var thisRow = row.clone();
			 thisRow.find('.value').html("Survey #"+(i+1));
			 $("#resultContainer").append(thisRow);
			 thisRow.find('#nextInput').val(data[i].next_id);
		} 
    });
}