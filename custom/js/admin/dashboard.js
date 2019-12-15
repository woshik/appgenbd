"use strict";

var timeOut;
$(document).ready(function() {
	$("#profile-setting-message").fadeOut(0);
	$("#application-setting-message").fadeOut(0);
	$.ajax({
		url: "/application-setting",
		type: "GET",
		dataType: "json",
		success: function success(res) {
			$("#maxAppCanInstall").val(res.maxApp);
			$("#costPerMonth").val(res.costPerMonth);
		}
	});

	$("#applicationSettingForm")
		.unbind("submit")
		.bind("submit", function(e) {
			e.preventDefault();
			var form = $(this);
			var button = $("#applicationSettingBtn"),
				btnText = button.text().trim();
			$.ajax({
				url: form.attr("action"),
				type: form.attr("method"),
				headers: {
					"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
				},
				data: form.serialize(),
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
						$("#application-setting-message")
							.html('<div class="alert alert-success alert-dismissible" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
					} else {
						$("#application-setting-message")
							.html('<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
					}

					clearMessage("application-setting-message");
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

	$("#profileSettingForm")
		.unbind("submit")
		.bind("submit", function(e) {
			e.preventDefault();
			var form = $(this);
			var button = $("#profileSettingBtn"),
				btnText = button.text().trim();
			$.ajax({
				url: form.attr("action"),
				type: form.attr("method"),
				headers: {
					"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
				},
				data: form.serialize(),
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
						$("#profile-setting-message")
							.html('<div class="alert alert-success alert-dismissible" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
						$("#adminPassword").val("");
						$("#adminNewPassword").val("");
						$("#adminConfirmPassword").val("");
					} else {
						$("#profile-setting-message")
							.html('<div class="alert alert-warning alert-dismissible" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
					}

					clearMessage("profile-setting-message");
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
});

function clearMessage(id) {
	clearTimeout(timeOut);
	timeOut = setTimeout(function() {
		$("#" + id).fadeOut(1000);
	}, 5000);
}
