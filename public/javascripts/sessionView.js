var row;

function loadInData() {
    row = $("#searchResult").clone();
    $("#resultContainer").html('');

    $.get('/api/loggedIn',function(data,status) {
        if (data.permission_level == 1) {
            //we've got an admin
            $("#mainContainer").removeAttr("hidden");
            loadSessions($.urlParam('userID'));

            //setup Buttons
            if (($.urlParam('limit') == null && $.urlParam('offset') == null)) {
                $("#left").addClass('disabled');
                $("#right").addClass('disabled');
                $("#right").attr("disabled","disabled");
                $("#left").attr("disabled","disabled");
            } else if ($.urlParam('offset') == 0) {
               $("#left").addClass('disabled');
               $("#left").attr("disabled","disabled");
            }

        } else {
            location.replace('/');
        }
    }).fail(function(data,status){
        //go to login
        location.replace('/');
    });
}

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.href);

    if (results) {
        return results[1] || 0;
    }
    return null;
}


$("#right").click(function(event){
    var nextVal = parseInt($.urlParam('offset'))+parseInt($.urlParam('limit'));
    location.replace('/listenSessionViewer?userID='+$.urlParam('userID')+'&limit='+$.urlParam('limit')+'&offset='+nextVal);
});

$("#left").click(function(event){
    var nextVal = parseInt($.urlParam('offset'))-parseInt($.urlParam('limit'));
    location.replace('/listenSessionViewer?userID='+$.urlParam('userID')+'&limit='+$.urlParam('limit')+'&offset='+nextVal);
});

$("#goAdmin").click(function(event){
    location.replace('/admin');
});



function loadSessions(user) {

       var searchURL = "/api/findSessions";
       $.get(searchURL,
        {
            userID: user,
            limit:parseInt($.urlParam('limit')),
            offset:parseInt($.urlParam('offset'))
        },
        function(data,status){
            for (var i = 0; i < data.length; i++) {
                var thisRow = row.clone();
                var date = new Date(data[i].date)
                thisRow.find('.value').append("Date: "+date.toLocaleDateString());
                thisRow.find('.value').append(" Length: "+data[i].length+" Seconds");
                $("#resultContainer").append(thisRow);
            };
        }).fail(function(data,status) {
            $("#resultContainer").append("NO RESULTS FOUND");
            if (data.responseJSON){
                if (data.responseJSON['error']) {
                    $("#errorMessage").html(data.responseJSON['error']);
                }
                if (data.responseJSON['detail']){
                $("#errorMessage").html(data.responseJSON['detail']);
                }
            } else {
                $("#errorMessage").html(data);
            }
        });

}