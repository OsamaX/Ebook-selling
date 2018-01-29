window.onload = function () {

	let input = document.querySelector("input[type='file']");
	let notValidate = false;
	let pageNum;

	Array.from(document.querySelectorAll("#profile-img, #upload")).forEach(function (elm, i) {
		elm.onmouseenter = function () {
			doWork("enter");
		}

		elm.onmouseleave = function () {
			doWork("leave");
		}

		if (elm.id == "upload") {
			elm.onclick = function () {
				input.click();

			}
		}

	});

	if (input) {
		input.onchange = function (e) {

			if (e.target.files && $("#imgUpload")[0]) {
				document.querySelector("input[value='Upload']").click();
			}

		}
	}


	function doWork(opt) {
		if (opt == "enter") {
			document.querySelector("#upload").style.display = "inherit";
			document.querySelector("#profile-img").style.opacity = "0.5";
		} else if (opt == "leave") {
			document.querySelector("#upload").style.display = "none";
			document.querySelector("#profile-img").style.opacity = "initial";
		}
	}

	$('#img_update').submit(function (e) {
		e.preventDefault();

		var files = $('#photos-input').get(0).files;
		formData = new FormData();


		formData.append('imgUpload', files[0], files[0].name);

		var options = { url: "/pic_upload", method: "post", data: formData, processData: false, contentType: false };

		sendXHR(options, function (response) {
			if (response == "Invalid File Type") {
				alert(response)
			} else {
				$("#profile-img, #nav-pic").each((i, elm) => {
					$(elm).attr("src", response);
				});
			}
		});

	});


	$("#static").on("submit", "#details", function (e) {
		e.preventDefault();

		var formData = new FormData($(this)[0]);

		var options = { url: "/details", method: "post", data: formData, processData: false, contentType: false };

		sendXHR(options, function (response) {
			if (response == "Not Valid") {
				$(".error").css("display", "block");
				$(".error").animate({ left: '0', opacity: '1' });
			} else {
				localStorage.setItem("input_data", JSON.stringify(response));
				$(".personal").html(`<br><h2 class="favorite-book details">Personal Details<span class="glyphicon glyphicon-edit"> </span></h2>
			<div id="sec1">
			  <div class="first">
				<p>Zip Code</p>
			  </div>
			  <div class="second">
				<p>${response.dob}</p>
			  </div>
			  <div class="first ag">
				<p>Phone</p>
			  </div>
			  <div class="second">
				<p>${response.phone}</p>
			  </div>
			</div>
			<div>
			  <div class="first">
				<p>Address</p>
			  </div>
			  <div class="second">
				<p>${response.addr}</p>
			  </div>
			  <div class="first ag">
				<p>Country</p>
			  </div>
			  <div class="second">
				<p>${response.country}</p>
			  </div>
			</div>`);
			}
		});

	});

	$("#static").on("click", ".glyphicon-edit", function () {
		var input_data = localStorage.getItem("input_data");
		input_data = JSON.parse(input_data);

		$(".personal").html(`<br><div class="alert alert-danger error" style="opacity: 0.5;position:relative; right: 1244px;"><strong>Details can't be Blank</strong></div><h2 class="favorite-book details">Personal Details</h2>
	<form action="/details" method="POST" id="details" class="form-inline">
		<div class="form-group">
			<label for="addr">Address :</label>
			<input type="text" id="addr" name="addr" value="${input_data.addr}" size="58" class="form-control"/>
		</div>
		<div class="form-group">
			<label for="dob">Zip Code :</label>
			<input type="number" id="dob" name="dob" value="${input_data.dob}" class="form-control"/>
		</div>
		<div class="form-group">
			<label for="phone">Phone :</label>
			<input type="text" id="phone" name="phone" value="${input_data.phone}" class="form-control"/>
		</div>
		<div class="form-group">
			<label for="country">County :</label>
			<input type="text" id="country" name="country" value="${input_data.country}" class="form-control"/>
		</div>
		<button type="submit" value="Submit" class="btn btn-primary set">Edit</button>
	</form>`);
	});

	$("#add_book").submit(function (e) {
		e.preventDefault();

		var formData = new FormData($(this)[0]);

		var options = { url: "/add_book", method: "post", data: formData, processData: false, contentType: false };
		sendXHR(options, function (response) {

			if (response == "prof-empt") {
				$(".error2 strong").text("Fill Profile First");
				$(".error2").slideDown("slow");
				$("#myModal").animate({
					scrollTop: 0
				}, 600);
				window.location = "/profile"

			} else if (response == "Invalid Image Type") {

				$(".error2 strong").text("Invalid Image Type");
				$(".error2").slideDown("slow");
				$("#myModal").animate({
					scrollTop: 0
				}, 600);

			}
			else if (response == "Not Valid" || response == "Select an image") {

				$(".error2").slideDown("slow");
				$("#myModal").animate({
					scrollTop: 0
				}, 600);

			}
			else {

				//$(this)[0].reset();

				$(".alert-success").slideDown("slow");

				$("#myModal").animate({
					scrollTop: 0
				}, 600);


				$("#myModal").on('hidden.bs.modal', function () {
					$(".alert").css("display", "none");
				});

				setTimeout(function () {
					$("#myModal").modal("hide");
					genHTML(response);
				}, 1000);


			}


		}.bind($("#add_book")));
	});

	function genHTML(res) {

		let currentEmail = res.splice(res.length - 1);
		let len = res.splice(res.length - 1)[0];


		genBooks(res, currentEmail);

		if (len % 13 == 0 || len % 12 == 0) {

			$("#paginate").remove();
			len = Math.ceil(len / 12);

			let paginate = `<div id="paginate"><ul class="pagination">`

			for (let i = 1; i <= len; i++) {
				paginate += `<li class="pages"><a class="change_page" data-target="/page" data-method="GET" data-disabled="true">${i}</a></li>`;
			}

			paginate += `</ul></div>`;

			$("#daddy").append(paginate);

		}

		if ($(".pagination").children().length <= 1) $(".pagination").css("display", "none");
		else $(".pagination").css("display", "inline-block");

	}

	function genBooks(res, currentEmail) {
		$(".show-books").html("");
		$.each(res, function (i, book) {
			$(".show-books").append(`<div class="col-xs-6 col-sm-3 col-lg-2">
		<div class="books">
			<img class="book-cover" style="background-image: url(${book.image.replace("\\", "/")})">
			<p class="book-title">${book.title}</p>
			<p class="posted-by">Posted by ${currentEmail == book.email ? "You" : book.posted_by}</p>
			<p class="book-desc">${book.description}</p>
			<button data-toggle="modal" class="btn btn-primary details" id="${book._id}">Details</button>
			${currentEmail == book.email ? `<button class="btn btn-danger delete"` + ` id="${book._id}" data-target="/delete_book" data-method="DELETE" data-disabled="true">Delete</button>` : `<button class="btn btn-success buy" ` + `id="${book._id}" data-target="/buy" data-method="POST" data-disabled="true">Buy</button>`}
		</div>`);

		});
	}

	$(".show-books").on("click", ".delete", function () {
		let id = $(this).attr("id");
		let pageNum = +$(".active").text();

		id = { "id": id, pageNum };


		var options = { url: "/delete_book", method: "DELETE", data: id };
		sendXHR(options, function (res) {
			genHTML(res);
		});

	});

	let seller_details;
	let book_details;

	$("#daddy").on("click", ".details", function () {
		let id = $(this).attr("id");

		let options = { url: "/book_details", method: "GET", data: { id } };
		sendXHR(options, function (res) {
			$(".desc-cover").css("background-image", `url('${res[0].image.replace("\\", "/")}')`);
			$(".breif-desc").text(res[0].description);
			$(".price").text(res[0].price);
			$(".category").text(res[0].category);
			$(".mera-title").text(res[0].title);

			seller_details = res[1];
			book_details = res[0];

			seller_details.name = res[0].posted_by;
			seller_details.email = res[0].email;
		});
	});

	$(".seller-info").click(function () {
		if ($(this).text() != "Book Description") {

			$(".book-description").fadeOut(400, function () {
				let html = `<div class="info">
			<span class="glyphicon glyphicon-user"></span> Name: <span id="sel-name">${seller_details.name}</span>
			</div>

						 <div class="info">
			<span class="glyphicon glyphicon-envelope"></span> Email: <span id="sel-email">${seller_details.email}</span>
			</div>

						 <div class="info">
			<span class="glyphicon glyphicon-earphone"></span> Phone: <span id="sel-phone">${seller_details.phone}</span>
			</div>

						 <div class="info">
			<span class="glyphicon glyphicon-globe"></span> Country: <span id="sel-country">${seller_details.country}</span>
			</div>

						 <div class="info">
			<span class=" glyphicon glyphicon-tent"></span> Zip: <span id="sel-zip">${seller_details.dob}</span>
			</div>`;
				$(".book-description").html(html);
				$(".book-description").fadeIn();

				$(".seller-info").text("Book Description");
			});

		} else {
			$(this).text("Seller Info");

			$(".book-description").fadeOut(400, function() {

				$(".book-description").html('<p class="breif-desc"></p>');
				$(".breif-desc").text(book_details.description);
				$(".book-description").fadeIn();
			});
					
		}


	});

	
	$("#myModal2").on('hidden.bs.modal', function () {
		
		if ($(".seller-info").text() == "Book Description") {
			$(".seller-info")[0].click();
		}

	});

	$("#daddy").on("click", ".change_page", function () {

		pageNum = $(this).text();

		let options = { url: "/page", method: "GET", data: { pageNum } };
		sendXHR(options, function (res) {
			let currentEmail = res.splice(res.length - 1);
			let len = res.splice(res.length - 1);
			genBooks(res, currentEmail);
		});

		$(".pages").removeClass("active");
		$(this).parent().addClass("active");
	});

	$("#daddy").on("click", ".buy",function() {
		let id = $(this).attr("id");

		$(".book-nav").css("opacity", "0.5");
		$(".book-container").css("opacity", "0.5");

		$("body").append("<div class='loader'></div>");

		let options = {url: "/buy", method: "POST", data: {id}};

		sendXHR(options, function(res) {
			if (res == "YES") document.write("Book already Sold");
			else window.location = res;
		})
	});

	$("#daddy").on("click", ".delete_cart", function() {
		let id = $(this).attr("id");

		let options = {url: "/delete_cart", method: "DELETE", data: {id}};

		sendXHR(options, function(res) {
			window.location.pathname = res;
		})
	})

	function sendXHR(options, cb) {
		$.ajax(options).done(function (response) {
			cb(response)
		}).fail(function (xhr, status) {
			alert(status);

		});
	}

}

