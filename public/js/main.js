$.ajax({
    type: "GET",
    url: "http://localhost:8080/testing",

}).done(function(data) {
    console.log(data);
})
