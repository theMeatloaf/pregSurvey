
$("#goAdminButton").click(function(event) {
	location.replace("/admin");
});

var row = $("#searchResult").clone();

function loadInData() { 
    $("#resultContainer").html('');
    $("#afterResultContainer").html('');

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
        url:'/api/surveys/'+this.id+'/true',
        method:'DELETE'})
    .done(function() {
        loadInData();
    })
    .fail(function() {

    });
});

$('#afterResultContainer').delegate('.delButton','click',function(event){    
    $.ajax({
        url:'/api/surveys/'+this.id+'/false',
        method:'DELETE'})
    .done(function() {
        loadInData();
    })
    .fail(function() {

    });
});


$('#afterResultContainer').delegate('.saveBtn','click',function(event){    
    //get params...
    var position = parseInt(this.id)
    var daysTil = $("#afterResultContainer #"+position+".daysText").val()
    var qualID = $("#afterResultContainer #"+position+".qualtricsText").val();

    $.post('/api/updateSurvey',{
        qualtrics_id:qualID,
        position:position,
        daysTill:daysTil,
        before:false
    },function(data,status) {
        $("#successMessage").html("Saved Survey!");
        loadInData();
    }).fail(function(data,status) {
        $("#errorMessage").html(data);
    });
});

$('#resultContainer').delegate('.saveBtn','click',function(event){    
    //get params...
    var position = parseInt(this.id)
    var daysTil = $("#resultContainer #"+position+".daysText").val()
    var qualID = $("#resultContainer #"+position+".qualtricsText").val();

    $.post('/api/updateSurvey',{
        qualtrics_id:qualID,
        position:position,
        daysTill:daysTil,
        before:true
    },function(data,status) {
        $("#successMessage").html("Saved Survey!");
        loadInData();
    }).fail(function(data,status) {
        $("#errorMessage").html(data);
    });
});

$('#resultContainer').delegate('.qualtricsText,.daysText','change paste keyup',function(event){    
    var position = parseInt(this.id);
    var saveButton = $("#resultContainer #"+position+".saveBtn");

    saveButton.removeClass('hidden');
});

$('#afterResultContainer').delegate('.qualtricsText,.daysText','change paste keyup',function(event){    
    var position = parseInt(this.id);
    var saveButton = $("#afterResultContainer #"+position+".saveBtn");

    saveButton.removeClass('hidden');
});

$("#newBeforeButton").click(function(event) {
    //need to save first?

    $.get('api/newSurvey',{isBefore:true},function(data,status) {
        //got a survey back...reload that ish
        loadInData();
    }).fail(function(data,status) {
        $("#errorMessage").html(data);
    });
});

$("#newAfterButton").click(function(event) {
    //need to save first?

    $.get('api/newSurvey',{isBefore:false},function(data,status) {
        //got a survey back...reload that ish
        loadInData();
    }).fail(function(data,status) {
        $("#errorMessage").html(data);
    });
});


function loadSurveys() {
	$.get('/api/getSurveys',{isBefore:true},function(data,status) {
        handleRows(data);
    }).fail(function(data,status) {
        $("#errorMessage").html(data);
    });

    $.get('/api/getSurveys',{isBefore:false},function(data,status) {
        handleRows(data);
    }).fail(function(data,status) {
        $("#errorMessage").html(data);
    });
}

function handleRows(data) {
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
                thisRow.find('.daysText').attr("disabled","disabled");
            } else {
                thisRow.find('.delButton').addClass('hidden');
            }

            if (data[i].beforebirth) {
                $("#resultContainer").append(thisRow);
            } else {
                $("#afterResultContainer").append(thisRow);
            }
    }
}

$('#afterResultContainer').delegate('.btnDwn','click',function(event){
    //move this survey up in position....
    $.get('api/surveys/shiftUp/'+this.id+'/false',function(data,status) {
        loadInData();
    });
});

$('#afterResultContainer').delegate('.btnUp','click',function(event){
    //move this survey up in position....
    $.get('api/surveys/shiftDown/'+this.id+'/false',function(data,status) {
        loadInData();
    });
});

$('#resultContainer').delegate('.btnDwn','click',function(event){
    //move this survey up in position....
    $.get('api/surveys/shiftUp/'+this.id+'/true',function(data,status) {
        loadInData();
    });
});

$('#resultContainer').delegate('.btnUp','click',function(event){
    //move this survey up in position....
    $.get('api/surveys/shiftDown/'+this.id+'/true',function(data,status) {
        loadInData();
    });
});