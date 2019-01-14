const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
//const session = require('express-session')({ secret: '5b79c06ed7ad4034109bee9b', resave: true, saveUninitialized: true});
//const flash    = require('connect-flash');
//app.use(session); 
//app.use(flash()); 
const bodyParser = require('body-parser');
const formidable = require('formidable');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static('public_static'));
//
//require('./app/routes.js')(app);
app.listen(port, () => {
	// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
	//app.connection();
	console.log("Express Listening at http://localhost:" + port);
});
//
//
app.post('/admin/fileupload/:name?', (req, res) => {
	var file_name = req.params.name || "error";
	console.log("fileUpload name: "+file_name)
	//
	var form = new formidable.IncomingForm();
	form.maxFileSize = 100 * 1024 * 1024;//1M
	form.errorCode = 0;
	form.uploadDir = "public_static/uploads/";
	form.on('fileBegin', function(name, file) {console.log("**** fileBegin ****:"+name);
		if(!file.name.match(/\.(jpg|jpeg|png)$/i))this.errorCode = 1,form.maxFileSize = 1;
		file.path = form.uploadDir+file_name;
	});
	form.on('file', function(name, file) {console.log("**** file ****");
	});
	form.on('error', function(err) {console.log("**** error ****:"+err+", xx:"+this.xx);
	});
	form.on('aborted', function() {console.log("**** aborted ****");
	});
	form.on('end', function() {console.log("**** end ****, xx:"+this.xx);
	});
	form.parse(req, function(err, fields, files) {console.log("**** parse ****");
		res.send('File uploaded:'+JSON.stringify(fields));
	});
});
