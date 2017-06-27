var row;

$("#goSurveyEdit").click(function(event) {
    location.replace("/admin_survey");
});

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
        event.preventDefault();

		$("#errorMessage").html("");
        $("#successMessage").html("");

		var email = $("#inviteEmailInput").val();
        var phone = $("#invitePhoneInput").val();

        if (!email) {
            $("#errorMessage").html("Cannot create user without email address");
            return;
        }

		var inviteURL = "/api/inviteUser";
           $.post(inviteURL,
            {
                username: email,
                phoneNumber:phone
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
                var dueDate = new Date(data[i].next_survey_date);
                thisRow.find('.value').append("&nbsp;&nbsp;&nbsp; Next Survey Date: "+dueDate.toDateString());
                thisRow.find('#phoneNumberInput').val(data[i].phone);
                if (data[i].birth_date) {
                    var birthDate = new Date(data[i].birth_date);
                    thisRow.find('#birthDateInput').val(birthDate.toISOString().substr(0,10));
                }
                thisRow.find('.optOutButton').attr("id",data[i].id);
                thisRow.find('.userEditForm').attr("id",data[i].id);
                if(data[i].notifications_email == true) {
                    thisRow.find('#emailCheckbox').attr("checked","checked");
                }
                if(data[i].notifications_sms == true) {
                    thisRow.find('#smsCheckbox').attr("checked","checked");
                }

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


$('#resultContainer').delegate('.userEditForm','submit',function(event){
    $("#errorMessage").html("");
    $("#successMessage").html("");

    var form = $(event.target);
    var emailNotifications = form.find("#emailCheckbox").is(':checked'); 
    var smsNotification = form.find("#smsCheckbox").is(':checked'); 
    var phoneValue = form.find("#phoneNumberInput").val();
    var birthValue = form.find("#birthDateInput").val();
    var loginURL = "/api/updateUser";
   $.post(loginURL,
    {
        phone: phoneValue,
        emailNotifications: emailNotifications,
        smsNotifications: smsNotification,
        id:this.id,
        birth_date:birthValue
    },
    function(data,status){
        $("#searchForm").submit();
        $("#successMessage").html("Info saved Successfully");        
    }).fail(function(data,status) {
        if (data.responseJSON){
            $("#errorMessage").html(data.responseJSON['error']);
        } else {
            $("#errorMessage").html(data);
        }
    });

    event.preventDefault();
});

$('#resultContainer').delegate('.optOutButton','click',function(event) {
    $("#errorMessage").html("");
    $("#successMessage").html("");

    if ($(event.target).html() == "OPT IN") {
        //handle opt in
         if (confirm('Are you sure you want to opt in this user?')) {        
            $.post('/api/optIn',{
                id:this.id
            }, function(data,status) {
                $("#successMessage").html("User Opted in Successfully");
                $("#searchForm").submit();
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
                $("#successMessage").html("User opted out Successfully");
                $("#searchForm").submit();
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