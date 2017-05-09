var row;

function loadInData() {
    row = $("#searchResult").clone();
    $("#resultContainer").html('');

    $.get('/api/loggedIn',function(data,status) {
        if (data.permission_level == 1) {
            //we've got an admin
        } else {
            location.replace('/');
        }
    }).fail(function(data,status){
        //go to login
        location.replace('/');
    });
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
                thisRow.find('.optOutButton').attr("id",data[i].id);
                if (data[i].permission_level == -1 ) {
                    thisRow.find('.optOutButton').html("OPT IN");
                } else {
                    thisRow.find('.optOutButton').html("OPT OUT");
                }
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


$('#resultContainer').delegate('.optOutButton','click',function(event) {

    if ($(event.target).html() == "OPT IN") {
        //handle opt in
         if (confirm('Are you sure you want to opt in this user?')) {        
            $.post('/api/optIn',{
                id:this.id
            }, function(data,status) {
                location.replace('/admin');
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
        }
    } else {
        //handle opt out
        if (confirm('Are you sure you want to opt out this user?')) {        
            $.post('/api/optOut',{
                id:this.id
            }, function(data,status) {
                location.replace('/admin');
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
        }
    }
});