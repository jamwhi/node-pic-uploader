
var querystring = require("querystring"),
	fs = require("fs"),
	formidable = require("formidable");

function start(response, postData) {
	console.log("Request handler 'start' was called.");
	
	var body = '<html>'+
		'<head>'+
		'<meta http-equiv="Content-Type" '+
		'content="text/html; charset=UTF-8" />' +
		'</head>' +
		'<body>' +
		'<form action="/upload" enctype="multipart/form-data" '+
		'method="post">' +
		'<input type="file" name="upload">' +
		'<input type="submit" value="Upload file" />' +
		'</form>' +
		'<br />' +
		'<a href=\'show\'>Show current picture</a>' +
		'</body>' +
		'</html>';
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(body);
		response.end();
}

function upload(response, request) {
	console.log("Request handler 'upload' was called.");
	
	var form = new formidable.IncomingForm();
	form.uploadDir = "tmp";

	// If 'tmp' folder doesn't exist, create it
	if (!fs.existsSync("tmp")) {
		fs.mkdirSync("tmp");
	}

	console.log("about to parse");
	form.parse(request, function(error, fields, files) {
		console.log("parsing done");

		
		
		/* Possible error on Windows systems:
			tried to rename to an already existing file */
		fs.rename(files.upload.path, "tmp/test.png", function(error) {
			if (error) {
				fs.unlink("tmp/test.png");
				fs.rename(files.upload.path, "tmp/test.png");
			}
		});

		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("received image: <br/>");
		response.write("<img src='/show' />");
		response.end();
	});
}

function show(response) {
	console.log("Request handler for 'show' was called.");

	// Check if file exists
	fs.stat("tmp/test.png", function(err, stat) {
		if(err == null) {

			console.log('File exists');
			response.writeHead(200, {"Content-Type": "image/png"});
			fs.createReadStream("tmp/test.png").pipe(response);

		} else if(err.code == 'ENOENT') {

			console.log('File does not exist');
			var body = '<html>'+
				'<head>'+
				'<meta http-equiv="Content-Type" '+
				'content="text/html; charset=UTF-8" />' +
				'</head>' +
				'<body>' +
				'No picture here right now' +
				'<br /><br />' +
				'<a href=\'start\'>Back</a>' +
				'</body>' +
				'</html>';
			
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write(body);
			response.end();

		} else {
			console.log('Some other error: ', err.code);
		}
	});

}

exports.start = start;
exports.upload = upload;
exports.show = show;