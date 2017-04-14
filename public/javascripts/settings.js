//homepage controls

function loadInuser(){
	if (QueryString.setupEmail) {
		$.get('/api/findUser',{
			setupEmail:QueryString.setupEmail
		},function(data,status) {
			$("#title").html("Set up Account");
			$("#emailInput").val(QueryString.setupEmail);
		}).fail(function(data,status){

		});

		return;
	} else {

	}


	$.get('/api/loggedIn',function(data,status) {

		$("#emailInput").val(data["username"]);
		$("#phoneInput").val(data["phone"]);
		if(data["notifications_email"] == true) {
			$('#emailcheckbox').attr("checked","checked");
		}
		if(data["notifications_sms"] == true) {
			$('#smsCheckbox').attr("checked","checked");
		}

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

        var emailNotifications = $("#emailcheckbox").val() == "on"
        var smsNotification = $("#smsCheckbox").val() == "on"

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