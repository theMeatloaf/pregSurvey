function markCompleted() {
	$.get('/api/completeSurvey',function(data,status){
		location.replace('/dash');
	}).fail(function(data,status){
		//someone was trying to cheat...just push them along
		if (status == 428) {
			location.replace('/dash');
		}
		//handle error state...possibly show login?
	});

}