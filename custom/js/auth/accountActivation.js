"use strict";

var timeOut;

$(document).ready(function() {
	$("#message").fadeOut(0);

	var button = $("#buttonload"),
		btnText = button.text().trim();

	$("#activationForm")
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
					if (res.success === true) {
						window.location = res.url;
					} else {
						$("#message")
							.html('<div class="alert alert-warning" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
						clearMessage("message");
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
	$("#mailSending").click(function(e) {
		e.preventDefault();
		$.ajax({
			url: e.target.href,
			type: "POST",
			headers: {
				"CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
			},
			data: {
				email: $("#email").val(),
				rd: $("#rd").val()
			},
			dataType: "json",
			success: function success(res) {
				$("#message")
					.html('<div class="alert alert-info" role="alert">' + res.message + "</div>")
					.fadeIn(1000);
				clearMessage("message");
			}
		});
	});
	clearMessage("flashMessage");
});

function clearMessage(id) {
	clearTimeout(timeOut);
	timeOut = setTimeout(function() {
		$("#" + id).fadeOut(1000);
	}, 5000);
}
