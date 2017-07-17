//homepage controls

function autoLogin(){

	$.get('/api/loggedIn',function(data,status) {
		location.replace('/dash');
	}).fail(function(data,status){
		//unhide login form
		$("#formDiv").removeClass('hidden');
		$("#loginHeader").removeClass('hidden');
	});
};

$("#forgotPass").click(function(event) {
    var email = $("#emailInput").val();
    $("#emailFormGroup").removeClass("has-error");
    $("#errorMessage").html("");

    if (!email || email.length == 0) {
      $("#emailFormGroup").addClass("has-error");
      $("#errorMessage").html("Enter an email address");
      return;
    } else {
      //alrighty lets send that shit to the API
      $.post('/api/forgotPassword', {
        username:email
      },function(data,status) {
        alert("An email has been sent to you to reset your password");
        $('#successMessage').html("Check your email for a password reset link.");
      }).fail(function(data,status) {

      });
    }
});

$("#forgotPassForm").submit(function(event) {

  event.preventDefault();

  if(!QueryString.code) {
    $("#errorMessage").html("Invalid forgot password link");
    return;
  }

  var password = $("#newPassInput").val();
  var password2 = $("#repeat_newPassInput").val();
  if (password=="" || password2 =="") {
    $("#errorMessage").html("Password cannot be blank");
    return;
  }

  if (password != password2) {
    $("#errorMessage").html("Passwords to not match please try again");
    return;
  }

  $.post('/api/executeForgotPass',
    {
        forgotPassCode: QueryString.code,
        newPassword: password
    },
    function(data,status) {
        $("#errorMessage").html("Your password has been reset! <a href='./''>Click Here to Login</a>");
  }).fail(function(data,status) {
        $("#errorMessage").html("Could Not reset password: Reset Link invalid");
  });

  event.preventDefault();
});

$( "#loginForm" ).submit(function( event ) {
		$("#errorMessage").html("");

		if (checkValidation()) {
			var email = $("#emailInput").val();
			var password = $("#passwordInput").val();
		  var stayLoggedIn = $("#rememberMeCheckbox").is(':checked');

			var loginURL = "/api/login";
           $.post(loginURL,
            {
                username: email,
                password: password,
                remember: stayLoggedIn
            },
            function(data,status){
            	window.location.href = '/dash'
            }).fail(function(data,status) {
              console.log(data);
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

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();