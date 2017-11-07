var row;
var didAddDOB = false;

$("#goSurveyEdit").click(function(event) {
    location.replace("/admin_survey");
});

function loadInData() {
    row = $("#searchResult").clone();
    $("#resultContainer").html('');

    $.get('/api/loggedIn',function(data,status) {
        if (data.permission_level == 1) {
            //we've got an admin
            $("#mainContainer").removeAttr("hidden");
        } else {
            location.replace('/');
        }
    }).fail(function(data,status){
        //go to login
        location.replace('/');
    });
}

function dateChanged(e) {
    didAddDOB = true;
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

$("#pastDueBtn").click(function(event) {
    $("#searchEmailInput").val('past due');
    $("#searchForm").submit();
});

$("#searchForm").submit(function(event){

    $("#errorMessage").html("");
    $("#successMessage").html("");

    var email = $("#searchEmailInput").val();
    
    var searchingPastDue = false;
    //handle searching for past due
    if (email == "past due") {
        email = "@";
        searchingPastDue = true;
    }

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
                thisRow.find('.value').html("<b>"+email+"</b>");
                if (data[i].music_enabled === true) {
                    thisRow.find('.value').append("&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon glyphicon-music' aria-hidden='true'></span>")
                }
                //lets calculate if their sruvey is are past due...
                var now = new Date();
                var dueDate = new Date(data[i].next_survey_date);
                var lastDate = new Date(dueDate);
                lastDate = lastDate.setDate(lastDate.getDate() + data[i].days_till_next);
                var numDaysLeft = daydiff(now,lastDate);
                if (data[i].next_survey_position) {
                   if (numDaysLeft < 0) {
                        //past due!
                        thisRow.find('.value').append("&nbsp;&nbsp;&nbsp;SURVEY "+ -numDaysLeft +" DAYS PAST DUE!");
                    } else if (searchingPastDue) {
                        //skip this row we're just earching for past due
                        continue;
                    } else {
                        //lets just show how many days they have left
                        thisRow.find('.value').append("&nbsp;&nbsp;&nbsp;"+numDaysLeft+" days left to fill our current survey");
                    }
                }


                thisRow.find('#phoneNumberInput').val(data[i].phone);
                if (data[i].birth_date) {
                    var birthDate = new Date(data[i].birth_date);
                    thisRow.find('#birthDateInput').val(birthDate.toISOString().substr(0,10));
                    thisRow.find('#birthDateInput').on('change',dateChanged);
                }
                thisRow.find('.optOutButton').attr("id",data[i].id);
                thisRow.find('.userEditForm').attr("id",data[i].id);
                thisRow.find('.inviteButton').attr("id",data[i].id);
                
                if(data[i].notifications_email == true) {
                    thisRow.find('#emailCheckbox').attr("checked","checked");
                }
                if(data[i].notifications_sms == true) {
                    thisRow.find('#smsCheckbox').attr("checked","checked");
                }

                if (!data[i].invite_token) {
                    thisRow.find('.inviteButton').hide();
                } else {
                    thisRow.find('.inviteButton').removeAttr("hidden");
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

$('#resultContainer').delegate('.inviteButton','click',function(event) {
    $("#errorMessage").html("");
    $("#successMessage").html("");

    $.post('/api/sendInvite',{toUser:this.id},function(data,status) {
        $("#successMessage").html("Successfully re-sent invitation email to user");
    }).fail(function(data,status) {
       if (data.responseJSON){
            $("#errorMessage").html(data.responseJSON['error']);
        } else {
            $("#errorMessage").html(data);
        }
    });
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

    if (didAddDOB) {
        if (confirm("You have changed a date of birth. Are you sure you want to save?")) {
            //do less
        } else {
            //bail!
            event.preventDefault();
            return;
        }
    }

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

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
}