//homepage controls

$( "#loginForm" ).submit(function( event ) {

		if (checkValidation()) {
			var email = $("#emailInput").val();
			var password = $("#passwordInput").val();
		
		var loginURL = "/api/login";
           $.post(loginURL,
            {
                username: email,
                password: password
            },
            function(data,status){
            	window.location.href = '/dash.html'
            }).fail(function(data,status) {
            	$("#errorMessage").html(data.responseJSON['error']);
  			});
		}

  		event.preventDefault();
});

function checkValidation() {

	var email = $("#emailInput").val();
	var password = $("#passwordInput").val();

	if (email.length <= 0) {
		$("#emailFormGroup").addClass("has-error");
		$("#errorMessage").html("Please enter an Email Address");
		return false;
	} else {
		$("#emailFormGroup").removeClass("has-error");
	}

	if (password.length <=0) {
		$("#passwordFormGroup").addClass("has-error");
		$("#errorMessage").html("Please enter your password");
		return false;
	} else {
		$("#passwordFormGroup").removeClass("has-error");
	}

	return true;

}