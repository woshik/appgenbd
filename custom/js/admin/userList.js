"use strict";

var userList, timeOut;
$(document).ready(function() {
	userList = $("#userList").DataTable({
		processing: true,
		serverSide: true,
		order: [],
		ajax: {
			url: "/user-list/get",
			type: "GET"
		},
		columnDefs: [
			{
				targets: [0, 1, 2, 3, 4],
				orderable: false
			}
		],
		lengthMenu: [
			[5, 10, 25, 50, 75, 100, -1],
			[5, 10, 25, 50, 75, 100, "All"]
		]
	});

	$("#message").fadeOut(0);
	$("#payment-message").fadeOut(0);
	$("#status-change-message").fadeOut(0);
	$("account-delete-message").fadeOut(0);
});

function payment(id) {
	$("#paymentForm")
		.unbind("submit")
		.bind("submit", function(e) {
			e.preventDefault();
			var form = $(this);
			var button = $("#paymentBtn"),
				btnText = button.text().trim();
			$.ajax({
				url: form.attr("action"),
				type: form.attr("method"),
				headers: {
					"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
				},
				data: form.serialize() + "&id=" + id,
				beforeSend: function beforeSend() {
					button
						.text(btnText + "...")
						.append('<img src="/images/icons/loading.svg" alt="loading" style="margin-left:10px">')
						.attr("disabled", "disabled")
						.css("cursor", "no-drop");
				},
				dataType: "json",
				success: function success(res) {
					if (res.success) {
						userList.ajax.reload(null, false);
						$("#paymentModal").modal("hide");
						$("#message")
							.html('<div class="alert alert-success" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
					} else {
						$("#payment-message")
							.html('<div class="alert alert-warning" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
						clearMessage("payment-message");
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

function accountStatusChange(id) {
	$("#accountStatusChangeForm")
		.unbind("submit")
		.bind("submit", function(e) {
			e.preventDefault();
			var form = $(this);
			var button = $("#accountStatusChangeBtn"),
				btnText = button.text().trim();
			$.ajax({
				url: form.attr("action"),
				type: form.attr("method"),
				headers: {
					"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
				},
				data: {
					id: id
				},
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
						userList.ajax.reload(null, false);
						$("#accountStatusChangeModal").modal("hide");
						$("#message")
							.html('<div class="alert alert-success alert-dismissible" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
					} else {
						$("#status-change-message")
							.html('<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
						clearMessage("status-change-message");
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

function accountDelete(id) {
	$("#accountDeleteForm")
		.unbind("submit")
		.bind("submit", function(e) {
			e.preventDefault();
			var form = $(this);
			var button = $("#accountDeleteBtn"),
				btnText = button.text().trim();
			$.ajax({
				url: form.attr("action"),
				type: form.attr("method"),
				headers: {
					"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
				},
				data: {
					id: id
				},
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
						userList.ajax.reload(null, false);
						$("#accountDeleteModal").modal("hide");
						$("#message")
							.html('<div class="alert alert-success alert-dismissible" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
					} else {
						$("#account-delete-message")
							.html('<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
						clearMessage("account-delete-message");
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
