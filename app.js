const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash= require('connect-flash');
const session = require('express-session');
const passport =require('passport');
const config = require('./config/database.js');

mongoose.connect(config.database);
let db = mongoose.connection;

//check db connection
db.once('open', ()=>{
	console.log('Connected to MongoDB');
})

//check db errors
db.on('error',(err)=>{
	console.log(err);
})

//Init app
const app = express();

//Bring in Modules

let Article = require('./models/article.js');



//Lod view engine

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');


//Body parser middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Set public folder

app.use(express.static(path.join(__dirname, 'public')))

//Express session Middleware
app.use(session({
	secret:'keyboard cat',
	resave: true,
	saveUninitialize:true,
	

}))

// Express messages Middleware
app.use(require('connect-flash')());
app.use((req,res,next)=>{
	res.locals.messages=require('express-messages')(req,res);
	next(); 
})

// Express validator
app.use(expressValidator({
	errorFormatter: function(param,msg,value){
		var namespace = param.split('.')
		, root	=namespace.shift()
		, formParam = root;
	
		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param: formParam,
			msg:msg,
			value:value
		};
	}
}));

//Pasport Config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
	res.locals.user = req.user || null;
	next();
});




//Home route
app.get('/',(req,res)=>{
	Article.find( {}, (err,articles)=>{ // {} empty is for find all articles
		if(err){ 
			console.log(err) 
		}else{
			res.render('index',{
				title:"Don't forget your Ideas",
				articles: articles
			});
		}
		
	});
	
});


//Router Files
let articles = require('./routes/articles.js');
app.use('/articles', articles);
let users = require('./routes/users.js');
app.use('/user', users);


//start server
app.listen(3000, ()=>{
	console.log('Server started on port 3000');
});