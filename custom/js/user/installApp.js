"use strict";

$(document).ready(function() {
	$("#message").fadeOut(0);
	var check = 1,
		timeOut,
		button = $("#buttonload"),
		btnText = button.text().trim();
	$("#installAppForm")
		.unbind("submit")
		.bind("submit", function(e) {
			e.preventDefault();
			var form = $(this);
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
						if (check === 1) {
							$("#smsUrl").val(res.info.sms);
							$("#ussdUrl").val(res.info.ussd);
							$("#sectionHidden").slideDown();
							form.attr("action", res.info.url);
							$("#appName").attr("readonly", "readonly");
							$("#appId").val(res.info.appId);
							check++;
						} else {
							$("#sectionHidden").slideUp();
							form[0].reset();
							$("#appName").removeAttr("readonly", "readonly");
							form.attr("action", res.info.url);
							$("#message")
								.html('<div class="alert alert-success" role="alert">' + res.info.message + "</div>")
								.fadeIn(1000);
							check = 1;
						}
					} else {
						$("#message")
							.html('<div class="alert alert-warning" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
					}

					clearTimeout(timeOut);
					timeOut = setTimeout(function() {
						$("#message").fadeOut(1000);
					}, 5000);
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
