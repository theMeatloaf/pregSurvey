function loadInData() {

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