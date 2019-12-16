"use strict";

var timeOut, messageContentTable;
$(document).ready(function() {
	messageContentTable = $("#messageContentTable").DataTable({
		processing: true,
		serverSide: true,
		ordering: false,
		searching: false,
		ajax: {
			url: "/user/app-message-content",
			type: "GET",
			data: {
				appId: $("#appId").val()
			}
		},
		lengthMenu: [
			[10, 25, 50, 75],
			[10, 25, 50, 75]
		]
	});

	$("#updateAppMessageBtn")
		.unbind("click")
		.bind("click", function(e) {
			$.ajax({
				url: "<%=updateContentUrl%>",
				type: "POST",
				headers: {
					"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
				},
				data: {
					date: date,
					time: time,
					appName: appName,
					message: $("#updateAppMessageContent").val()
				},
				dataType: "json",
				success: function success(res) {
					if (res.success) {
						$("#content-message")
							.html('<div class="alert alert-success" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
						clearMessage("content-message");
						appList.ajax.reload(null, false);
						$("#updateAppMessage").modal("hide");
					} else {
						$("#update-app-message-content")
							.html("<div class='alert alert-warning' role='alert'>" + res.message + "</div>")
							.fadeIn(1000);
						clearMessage("update-app-message-content");
					}
				}
			});
		});
});

function updateAppMessage(date, time, appName) {
	if (date && time && appName) {
		$("#update-app-message-content").fadeOut(0);
		$("#content-message").fadeOut(0);
		$.ajax({
			url: "<%=updateContentUrl%>",
			type: "GET",
			headers: {
				"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
			},
			data: {
				date: date,
				time: time,
				appName: appName
			},
			dataType: "json",
			success: function success(res) {
				if (res.success === true) {
					$("#updateAppMessageContent").val(res.message);
				} else {
					$("#update-app-message-content")
						.html('<div class="alert alert-warning" role="alert">' + res.message + "</div>")
						.fadeIn(1000);
					clearMessage("update-app-message-content");
				}
			}
		});
	}
}

function clearMessage(id) {
	clearTimeout(timeOut);
	timeOut = setTimeout(function() {
		$("#" + id).fadeOut(1000);
	}, 5000);
}
