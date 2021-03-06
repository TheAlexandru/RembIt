const express = require('express');
const router = express.Router();

//Bring in Modules

let Article = require('../models/article.js');

//User model
let User = require('../models/user.js');




//edit article form
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
	Article.findById(req.params.id, (err, article)=>{
		if(article.author != req.user._id){
			req.flash('danger', 'Not Authorized');
			res.redirect('/');
		}else{
			res.render('editArticle',{
				title: 'Edit',
				article_data: article
			});
		}
		
	})
})

//save edited article
router.post('/edit/:id',(req,res)=>{
	let article = {}
	article.title = req.body.title;
	article.author = req.user._id;
	article.body = req.body.body;

	let query ={_id:req.params.id}

	Article.update(query,article, (err)=>{
		if(err){
			console.log(err);

			return;
		}else{
			req.flash('success','Article was Edited');
			res.redirect(`/articles/${req.params.id}`);
		}
	});
})


router.get('/add', ensureAuthenticated, (req,res)=>{
	res.render('add_article',{
		title:'Add Article'
	});
})

//ADd submit POST Route
router.post('/add',(req,res)=>{
	req.checkBody('title','Title is required').notEmpty();
	// req.checkBody('author','Author is required').notEmpty();
	req.checkBody('body','Body is required').notEmpty();

	//get errors
	let errors = req.validationErrors();

	if(errors){
		res.render('add_article',{
			title:'Add Article',
			errors:errors
		})
	}else{
		let article = new Article();
			article.title = req.body.title;
			article.author = req.user._id;
			article.body = req.body.body;
			article.save((err)=>{
				if(err){ 
					req.flash('success','Article Added')

					console.log(err);
					return;
				}else{
					req.flash('success','Article Added')
					res.redirect('/');
				}
			});
	}

	
})

//delete article
router.delete('/del/:id',(req,res)=>{
	if(!req.user._id){
		res.status(500).send();
	}

	let query = {_id:req.params.id}
	Article.findById(req.params.id,(err,article)=>{
		if(article.author != req.user._id){
			res.status(500).send();
		}else{
			Article.remove(query,(err)=>{
				if(err){console.log(err)}
				req.flash('info','Article Deleted')
				res.send('Success')
			})
		}
	});

	
})

//get single article
router.get('/:id', (req,res)=>{
	Article.findById(req.params.id, (err, article)=>{
		User.findById(article.author, function(err,user){
			res.render('showarticle',{
				article_data: article,
				author_name: user.name
			});
		})
	})
})

//Access Control
function ensureAuthenticated(req,res,next){
	if(req.isAuthenticated()){ //isAuthenticated() is from passport
		return next();
	}else{
		req.flash('danger','Please Login');
		res.redirect('/user/login');
	}
}


module.exports = router;
