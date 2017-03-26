//homepage controls

function loadInuser(){

	$.get('/api/loggedIn',function(data,status) {
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
	     $("#successMessage").html("");
        $("#errorMessage").html("");

		if (checkValidation()) {
			var phonenum = $("#phoneInput").val();
		
			var loginURL = "/api/updateUser";
           $.post(loginURL,
            {
                phone: phonenum
            },
            function(data,status){
        		$("#successMessage").html("Info saved Successfully");
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

$("#passForm").submit(function(event) {
	$("#passErrorMessage").html('');
	$(".passFormGroup").removeClass("has-error");

	var oldPassword = $("#oldPasswordInput").val();
	var newpass1 = $("#newPasswordInput1").val();
	var newpass2 = $("#newPasswordInput2").val();

	//validate a bit
	if (newpass1 != newpass2 || !newpass1 || !newpass2) {
		$("#passErrorMessage").html('New passwords dont match');
		$(".passFormGroup").addClass("has-error");
	} else if(newpass1 == oldPassword) {
		$("#passErrorMessage").html('Password entered is not new');
		$(".passFormGroup").addClass("has-error");
	} else {
		//lets change it
		var passURL = '/api/changePassword';
		$.post(passURL,{
			oldPassword:oldPassword,
			newPassword:newpass1
		},function(data,status){
			$("#oldPasswordInput").val('');
			$("#newPasswordInput2").val('');
			$("#newPasswordInput1").val('');

        	$("#passSuccessMessage").html("Password changed successfully!");
		}).fail(function(data,status) {
			console.log(data);
			if (data.responseJSON){
	    		$("#passErrorMessage").html(data.responseJSON['message']);
	    	} else {
	    		$("#passErrorMessage").html(data);
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