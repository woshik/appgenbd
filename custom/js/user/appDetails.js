"use strict";

var timeOut, messageContentTable;
$(document).ready(function() {
	messageContentTable = $("#messageContentTable").DataTable({
		processing: true,
		serverSide: true,
		ajax: {
			url: "/user/app-message-content",
			type: "GET",
			data: {
				appId: $("#appId").val()
			}
		},
		columnDefs: [
			{
				targets: [1, 2, 4],
				orderable: false
			}
		],
		lengthMenu: [
			[5, 10, 25, 50, 75],
			[5, 10, 25, 50, 75]
		]
	});
	$("#update-app-content-message").fadeOut(0);
	$("#content-message").fadeOut(0);
});

function updateAppMessage(appContentId) {
	$.ajax({
		url: "/user/get-content",
		type: "GET",
		headers: {
			"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
		},
		data: {
			appContentId: appContentId,
			appId: $("#appId").val()
		},
		dataType: "json",
		success: function success(res) {
			if (res.success === true) {
				$("#updateAppContent").val(res.message);
			} else {
				$("#update-app-content-message")
					.html('<div class="alert alert-warning" role="alert">' + res.message + "</div>")
					.fadeIn(1000);
				clearMessage("update-app-content-message");
			}
		}
	});
	$("#updateContentForm")
		.unbind("submit")
		.bind("submit", function(e) {
			e.preventDefault();
			var button = $("#updateAppContentBtn"),
				btnText = button.text().trim(),
				form = $(this);
			$.ajax({
				url: form.attr("action"),
				type: form.attr("method"),
				headers: {
					"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
				},
				data: form.serialize() + "&appContentId=" + appContentId + "&appId=" + $("#appId").val(),
				dataType: "json",
				beforeSend: function beforeSend() {
					button
						.text(btnText + "...")
						.append('<img src="/images/icons/loading.svg" alt="loading" style="margin-left:10px">')
						.attr("disabled", "disabled")
						.css("cursor", "no-drop");
				},
				success: function success(res) {
					if (res.success) {
						messageContentTable.ajax.reload(null, false);
						$("#updateAppContentModel").modal("hide");
						$("#content-message")
							.html('<div class="alert alert-success" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
						clearMessage("content-message");
					} else {
						$("#update-app-content-message")
							.html("<div class='alert alert-warning' role='alert'>" + res.message + "</div>")
							.fadeIn(1000);
						clearMessage("update-app-content-message");
					}
				},
				complete: function complete(jqXHR, textStatus) {
					if (textStatus === "success") {
						button
							.removeAttr("disabled")
							.css("cursor", "")
							.text(btnText)
							.children()
							.remove();
					}
				}
			});
		});
}

function clearMessage(id) {
	clearTimeout(timeOut);
	timeOut = setTimeout(function() {
		$("#" + id).fadeOut(1000);
	}, 5000);
}
