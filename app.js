const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash= require('connect-flash');
const session = require('express-session');
mongoose.connect('mongodb://localhost/nodekb');
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

//Home route
app.get('/',(req,res)=>{
	Article.find( {}, (err,articles)=>{ // {} empty is for find all articles
		if(err){ 
			console.log(err) 
		}else{
			res.render('index',{
				title:'hello',
				articles: articles
			});
		}
		
	});
	
});


//Router Files
let articles = require('./routes/articles.js');
app.use('/articles', articles);


//start server
app.listen(3000, ()=>{
	console.log('Server started on port 3000');
});