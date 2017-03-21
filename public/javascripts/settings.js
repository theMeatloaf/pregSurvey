//homepage controls

function loadInuser(){

	$.get('/api/loggedIn',function(data,status) {
		console.log(data);
		$("#emailInput").val(data["username"]);
		$("#phoneInput").val(data["phone"]);
	}).fail(function(data,status){
		if (data.responseJSON){
        		$("#errorMessage").html(data.responseJSON['error']);
        		location.replace('/');
        	} else {
        		$("#errorMessage").html(data);
        	}
	});

};

$( "#editForm" ).submit(function( event ) {

		if (checkValidation()) {
			var phonenum = $("#phoneInput").val();
		
			var loginURL = "/api/updateUser";
           $.post(loginURL,
            {
                phone: phonenum,
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

	/*if (email.length <= 0) {
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
	}*/

	return true;

}