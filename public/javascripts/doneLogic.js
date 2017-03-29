function markCompleted() {
	$.get('/api/completeSurvey',function(data,status){
		location.replace('/dash');
	}).fail(function(data,status){
		//handle error state...possibly show login?
	});

}