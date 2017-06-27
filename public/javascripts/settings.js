//homepage controls

function loadInuser(){
	if (QueryString.inviteCode) {
		//initial setup of invited user...
		$.get('/api/findInvitation',{
			inviteCode:QueryString.inviteCode
		},function(data,status) {
			setupLoadedData(data[0]);
			$("#title").html("Create Account");
			$("#oldPasswordInput").val(null);
			$("#oldPassGroup").addClass("hidden");
			$("#saveBtn").addClass("hidden");
			$("#passFormTitle").html("Create Password:");
			$("#updatePasswordButton").html("Create Account");

			
		}).fail(function(data,status){
			handleInitialError(data)
		});
	} else {
		$.get('/api/loggedIn',function(data,status) {
			setupLoadedData(data);
		}).fail(function(data,status){
			handleInitialError(data)
		});
	}
};

function handleInitialError(data){
	if (data.responseJSON){
		$("#errorMessage").html(data.responseJSON['error']);
		location.replace('/');
	} else {
		$("#errorMessage").html(data);
		location.replace('/');
	}
}

function setupLoadedData(data) {
		$("#emailInput").val(data["username"]);
		$("#phoneInput").val(data["phone"]);
		if(data["notifications_email"] == true) {
			$('#emailcheckbox').attr("checked","checked");
		}
		if(data["notifications_sms"] == true) {
			$('#smsCheckbox').attr("checked","checked");
		}
}

$( "#editForm" ).submit(function( event ) {
	    $("#successMessage").html("");
        $("#errorMessage").html("");

        var emailNotifications = $("#emailcheckbox").is(':checked'); 
        var smsNotification = $("#smsCheckbox").is(':checked'); 

		if (checkValidation()) {
			var phonenum = $("#phoneInput").val();
		
			var loginURL = "/api/updateUser";
           $.post(loginURL,
            {
                phone: phonenum,
                emailNotifications: emailNotifications,
                smsNotifications: smsNotification
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

$("#optOut").click(function(){
	if (confirm('Are you sure you want to opt out of the study?')) {
		if (confirm('Are you positive? Your account will be disabled.')) {
			$.get('/api/optOutSelf',null,function(){
				$.get('/api/logout',null,function(){
					window.location.href = '/';
				}).fail(function(data,status){
		
				});
			}).fail(function(data,status){
		
			});
		}
	} 
});

$("#logOut").click(function(){
	if (confirm('Are you sure you want to log out?')) {
		$.get('/api/logout',null,function(){
			window.location.href = '/';
		}).fail(function(data,status){
		
		});
	} 
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
		//lets save everything and  create it
		if (QueryString.inviteCode) {
			createPass(newpass1)
		} else {
			//just change it
			updatePass(oldPassword,newpass1)
		}
	}
	 event.preventDefault();
});

//this function hits the endpoint that sets up the initial account and removes the invite token...
function createPass(newpass1) {
	var passURL = "/api/createPassword";
    var emailNotifications = $("#emailcheckbox").val() == "on"
    var smsNotification = $("#smsCheckbox").val() == "on"
	var phonenum = $("#phoneInput").val();

	$.post(passURL,{
		password:newpass1,
        phone: phonenum,
        emailNotifications: emailNotifications,
        smsNotifications: smsNotification,
		invite_token:QueryString.inviteCode
	},function(data,status) {
		$("#oldPasswordInput").val('');
		$("#newPasswordInput2").val('');
		$("#newPasswordInput1").val('');
        $("#passSuccessMessage").html("Account created successfully!");
        //lets do some login
    	var email = $("#emailInput").val();
	
		var loginURL = "/api/login";
       $.post(loginURL,
        {
            username: email,
            password: newpass1
        },
        function(data,status){
        	window.location.href = '/dash'
        }).fail(function(data,status) {
        	if (data.responseJSON){
        		$("#passErrorMessage").html(data.responseJSON['error']);
        	} else {
        		$("#passErrorMessage").html(data);
        	}
		});

	}).fail(function(data,status) {
		if (data.responseJSON){
    		$("#passErrorMessage").html(data.responseJSON['message']);
    	} else {
    		$("#passErrorMessage").html(data);
    	}
	});

}

function updatePass(oldPassword,newpass1) {
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
			if (data.responseJSON){
	    		$("#passErrorMessage").html(data.responseJSON['message']);
	    	} else {
	    		$("#passErrorMessage").html(data);
	    	}
		});
}

function checkValidation() {
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