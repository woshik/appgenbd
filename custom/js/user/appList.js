$(document).ready(function(){

	var appList = $('#appList').DataTable({
		"processing": true,
		"serverSide": true,
		"order": [],
		"ajax" : {
			url:"/userAppList",
			type: "Get"
		},
		"columnDefs": [
			{
				"targets": [0,1,2,3],
				"orderable": false
			}
		],
        "lengthMenu": [ [25, 50, 75, 100, -1], [25, 50, 75, 100, "All"] ],
	});
});