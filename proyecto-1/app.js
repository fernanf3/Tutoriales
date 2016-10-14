var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;
var cookieSession = require("cookie-session");
var router_app = require("./router_app");
var session_middleware = require("./middlewares/session");
var formidable = require("express-formidable");

var methodOverride = require("method-override");

var app = express();

// Para Utilizar Archivos estaticos del lado del Servidor (CSS,JS)
/*app.use("/estatico",express.static('public'));*/
// Para darle un prefico al public en la url

app.use("/public",express.static('public'));

app.use(bodyParser.json()); // para peticiones application/json
app.use(bodyParser.urlencoded({extended: true})); // para pasar informacion con arreglos

app.use(methodOverride("_method"));

app.use(cookieSession({
	name: "session",
	keys: ["llave-1","llave-2"]
}));

app.use(formidable.parse({ keepExtensions: true}));

app.set("view engine","jade");

app.get("/",function (req,res) {
	console.log(req.session.user_id);
	res.render("index");
})

app.get("/signup",function(req,res){
	User.find(function(err,doc){
		console.log(doc);
		res.render("signup");
	});
});
app.get("/login",function(req,res){
	User.find(function(err,doc){
		res.render("login");
	});
});

app.post("/users",function(req,res){

	var user = new User({
		email: req.body.email, 
		password: req.body.password,
		password_confirmation: req.body.password_confirmation,
		username: req.body.username,
		name: req.body.name,
		last_name: req.body.lastname,
		age: req.body.age,
		date_of_birth: req.body.date_of_birth,
		sex: req.body.sex
	});

/*	console.log(user.password_confirmation);
	console.log(user.sex);*/
	//Sin Utilizar Promise
	/*user.save(function(err){
		if (err) {
			console.log(String(err));
		}
		res.send("Guardamos tus datos");
	});*/

	user.save().then(function (us) {
		res.send("Guardamos el usuario exitosamente");
	}),function (err) {
		if (err) {
			console.log(String(err));
			res.send("Hubo un error al guardar el usuario");
		}
	}
});

app.post("/sessions",function(req,res){

	User.findOne({email:req.body.email,password:req.body.password},function(err,user){
		req.session.user_id = user._id;
		res.redirect("/app");
	});

});

app.use("/app",session_middleware);
app.use("/app",router_app);

app.listen(8080);