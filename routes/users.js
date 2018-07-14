const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport =require('passport');

//Bring in User Module
let user = require('../models/user.js');

//Register Form

router.get('/register',(req,res)=>{
	res.render('register')
})

//Register Proccess
router.post('/register',(req,res)=>{
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;

	req.checkBody('name','Name is required').notEmpty();
	req.checkBody('name','Min 3 charracters').len({ min: 3 });
	req.checkBody('Name','Max 20 charracters').len({ max: 20 });
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('username','Username is required').notEmpty();
	req.checkBody('password','Password is required').notEmpty();
	req.checkBody('password2','Passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	}else{
		let newUser = new user({
			name:name,
			email:email,
			username:username,
			password:password
		});

		bcrypt.genSalt(10, (err,salt)=>{
			bcrypt.hash(newUser.password,salt, (err,hash)=>{
				if(err){ console.log(error) }
					newUser.password = hash;
					newUser.save((err)=>{
						if(err){
							console.log(err);
							return;
						}else{
							req.flash('success','You are now registered');
							res.redirect('/user/login');
						}
					})
			});
		})
	}
});


//Login Form
router.get('/login',(req,res)=>{
	res.render('login');
})


//Login Process
router.post('/login',(req,res,next)=>{
	passport.authenticate('local',{
		//local is strattegy witch mean the way user login, it can be google, fb and others
		successRedirect:'/',
		failureRedirect:'/user/login',
		failureFlash:true
	})(req,res,next);
});


router.get('/profile/:id',(req,res)=>{
	res.render('profile', {userData:user} );
})

router.get('/logout',(req,res)=>{
	req.logout();
	req.flash('secondary', 'Logged out');
	res.redirect('/user/login');
})

module.exports = router;