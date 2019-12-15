"use strict";

var timeOut;
$(document).ready(function() {
	$("#error-message").fadeOut(0);
	$("#contentUploadForm")
		.unbind("submit")
		.bind("submit", function(e) {
			e.preventDefault();
			var form = $(this),
				button = $("#contentUploadBtn"),
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
					if (res.length) {
						res.forEach(function(alert) {
							if (alert.success) {
								$("#card-" + alert.position).remove();
							} else {
								$("#card-" + alert.position).css("border", "3px red solid");
								$("#message-" + alert.position)
									.html('<div class="alert alert-warning alert-dismissible" role="alert">' + alert.message + "</div>")
									.fadeIn(1000);
							}
						});
					} else {
						$("#error-message")
							.html('<div class="alert alert-danger alert-dismissible" role="alert">' + res.message + "</div>")
							.fadeIn(1000);
						clearTimeout(timeOut);
						timeOut = setTimeout(function() {
							$("#error-message").fadeOut(1000);
						}, 5000);
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

	$("#addCardBtn")
		.unbind("click")
		.bind("click", function(e) {
			var count = null;
			try {
				count =
					parseInt(
						$(".card")
							.last()[0]
							.id.slice(5)
					) + 1;
			} catch (err) {
				count = 1;
			}

			var content =
				'<div class="card" id="card-' +
				count +
				'">' +
				'<div class="card-header" id="heading-' +
				count +
				'">' +
				'<h2 class="mb-0">' +
				'<div class="container-fluid">' +
				'<div class="row">' +
				'<div class="col-10">' +
				'<button class="btn btn-link" style="color: black; text-decoration: none; width: 100%" type="button" data-toggle="collapse" data-target="#collapse-' +
				count +
				'" aria-expanded="true" aria-controls="collapse-' +
				count +
				'">' +
				'<span class="d-block float-left" id="head-text-' +
				count +
				'">' +
				count +
				". </span>" +
				"</button>" +
				"</div>" +
				'<div class="col-2">' +
				'<button class="btn btn-danger float-right" onclick="deleteCard(' +
				count +
				')"><i class="fas fa-trash-alt"></i></button>' +
				"</div>" +
				"</div>" +
				"</div>" +
				"</h2>" +
				"</div>" +
				'<div id="collapse-' +
				count +
				'" class="collapse" aria-labelledby="heading-' +
				count +
				'" data-parent="#contentUploadFormBlock">' +
				'<div class="card-body">' +
				'<div id="formField">' +
				'<div id="message-' +
				count +
				'"></div>' +
				'<div class="form-row">' +
				'<div class="form-group col-md-12">' +
				'<label for="messageDate">Date &amp; Time</label>' +
				'<input type="text" class="form-control dateTimepicker" name="dateTime" id="dateTime-' +
				count +
				'" readonly>' +
				"</div>" +
				"</div>" +
				'<div class="form-group row">' +
				'<div class="form-group col-md-12">' +
				'<label for="messageContent">Message</label>' +
				'<textarea class="form-control" name="messageContent" rows="3"></textarea>' +
				"</div>" +
				"</div>" +
				'<input type="hidden" name="position" value="' +
				count +
				'">' +
				"</div>" +
				"</div>" +
				"</div>" +
				"</div>";

			$("#contentUploadFormBlock").append(content);
			inputDetect(count);
			calanderInit();
			count++;
		});

	calanderInit();
	inputDetect(1);
});

function calanderInit() {
	$(".dateTimepicker").datetimepicker({
		autoclose: true,
		minuteStep: 65,
		showMeridian: true,
		fontAwesome: true,
		startDate: new Date(),
		format: "dd-mm-yyyy HH:ii p"
	});
}

function deleteCard(id) {
	if (id) {
		$("#card-" + id).remove();
	}
}

function inputDetect(count) {
	$("#dateTime-" + count).on("change", function(e) {
		$("#head-text-" + count).text("");
		$("#head-text-" + count).append(count + ". Date - " + e.target.value);
	});
}
