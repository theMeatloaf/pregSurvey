//homepage controls

function autoLogin(){

	$.get('/api/loggedIn',function(data,status) {
		location.replace('/settings.html');
	}).fail(function(data,status){
		//unhide login form
		$("#formDiv").removeClass('hidden');
		$("#loginHeader").removeClass('hidden');
	});

};

$( "#loginForm" ).submit(function( event ) {
		$("#errorMessage").html("");

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
            	window.location.href = '/settings.html'
            }).fail(function(data,status) {
            	if (data.responseJSON){
            		$("#errorMessage").html(data.responseJSON['error']);
            	} else {
            		$("#errorMessage").html(data);
            	}
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