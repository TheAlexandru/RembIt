const mongoose = require('mongoose');

//Use Schema
const UserSchema = mongoose.Schema({
	name:{
	type: string,
	require:true
	}
})