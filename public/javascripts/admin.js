var row;

function loadInData() {
    row = $("#searchResult").clone();
    $("#resultContainer").html('');
}

$( "#inviteForm" ).submit(function( event ) {
		$("#errorMessage").html("");
        $("#successMessage").html("");

		var email = $("#inviteEmailInput").val();
		
		var inviteURL = "/api/inviteUser";
           $.post(inviteURL,
            {
                username: email
            },
            function(data,status){
            	$("#successMessage").html("User invited Successfully");
            }).fail(function(data,status) {
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

  		event.preventDefault();
});

$("#searchForm").submit(function(event){

    $("#errorMessage").html("");
    $("#successMessage").html("");

    var email = $("#searchEmailInput").val();
    
    $("#resultContainer").html('');

    var searchURL = "/api/findUser";
       $.get(searchURL,
        {
            email: email
        },
        function(data,status){
            for (var i = data.length - 1; i >= 0; i--) {
                var email = data[i].username;
                var thisRow = row.clone();
                thisRow.find('.value').html(email);
                $("#resultContainer").append(thisRow);
            };
        }).fail(function(data,status) {
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

    
    
    event.preventDefault();
});