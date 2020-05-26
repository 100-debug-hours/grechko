"use strict"

let fs = require('fs-promise');
let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://dbname1:dbname1dbname1@ds261136.mlab.com:61136/notarius_registry', {useMongoClient: true});
let  mongoosePaginate = require('mongoose-paginate');

let registrySchema = new mongoose.Schema({
    fullname: String,
    address: String,
    telephone: String,
    index: String,
    addition_date: Date,
    status: String,
    registration_code: String,
    region: String
}, {collection: "registry"});
registrySchema.plugin(mongoosePaginate);
let db = mongoose.connection;
let registry = mongoose.model('registry', registrySchema, 'registry');

function getById(id) {
    return registry.findOne( { '_id': new mongoose.Types.ObjectId(id)}, {}, function(err, notarius) {
        return new Promise (function (resolve, reject) {
            if (err) reject(err);
            resolve(notarius);
        });
    });
}

function getAll() {
    return registry.paginate({})
    .then(doc => {return Promise.resolve(doc)})
    .catch(err => {return Promise.reject(err)});
}

function addNotarius(req){
    return new Promise(function (resolve, reject) {
        let notarius = new registry({
            fullname: req.body.fullname,
            address: req.body.address,
            telephone: req.body.telephone,
            index: req.body.index,
            addition_date: new Date(),
            status: req.body.status,
            registration_code: req.body.registration_code,
            region: req.body.region
        }); 
        db.collection("registry").insert(notarius, (err, data) => {
			if (err) reject(err);
			else {
                resolve(notarius._id);
            }
		});
	});
}

function editNotarius(req){
    return getById(req.body.id)
    .then(notarius => {
        
        notarius.fullname = req.body.fullname;
        notarius.address = req.body.address;
        notarius.telephone = req.body.telephone;
        notarius.index = req.body.index;
        notarius.status = req.body.status;
        notarius.registration_code = req.body.registration_code;
        notarius.region = req.body.region;

        db.collection("registry").update({'_id': notarius._id}, notarius, {upsert: false})
    })
    .catch(err => {return Promise.reject(err)});
}

function delNotarius(id){
    return new Promise (function (resolve, reject) {
        getById(id).then(notarius => {
            return registry.remove({_id: new mongoose.Types.ObjectId(id)}, function(error, result) {
                if( error ) reject(error);
                else resolve ("Ok!"); 
            });
        });
    }); 
}

let userSchema = new mongoose.Schema({
    username: String,
    passhash: String,
    avatar: String,
    isAdmin: Boolean
}, {collection: "users"});
let users = mongoose.model('users', userSchema, 'users');
userSchema.plugin(mongoosePaginate);

function getUserByLoginAndPasshash(username, hash){
    return users.findOne({username: username, passhash: hash})
    .then (doc => {console.log(doc); return Promise.resolve(doc)})
    .catch (err => {console.log(err); return Promise.reject(err)});
}

function getUserById(id) {
    return users.findOne( { '_id': new mongoose.Types.ObjectId(id)})
        .then (data => {
            return new Promise (function (resolve, reject) {
                resolve(data);
            });
    })
    .catch(err => {console.log(err); return Promise.reject(err)});
}

function checkNull (users){
    return new Promise(function (resolve, reject) {
        if (users.length !== 0){
            reject("logintaken");
        }
        else resolve(users);
    });
}

function createUser (user){
    return new Promise(function (resolve, reject) {
        users.find( {'username': user.username})
            .then (data => {
                checkNull(data)
                .then(() => {
                    let userRecord = new users({
                        username: user.username,
                        passhash: user.passwordHash,
                        isAdmin: user.isAdmin
                    });
                    if(user.id != "default.jpg"){
                        let bufArr = user.avatar.split(".");
                        let imgExt = bufArr.pop();
                        userRecord.avatar = "../images/avatars/" + user.id + '.' + imgExt;
                        let bareFs = require('fs');    
                        bareFs.rename("public/images/avatars/" + user.id, "public/images/avatars/" + user.id + '.' + imgExt, function (err) {
                        if (err) throw err;
                        });    
                    }
                    else
                        userRecord.avatar = "../images/avatars/default.jpg";
                    
                    db.collection("users").insert(userRecord, (err, data) => {
                        if (err) reject("cannnot insert into db");
                        else {
                            resolve(user._id);
                        }
                    });
                })
                .catch (err => reject(err));                 
        })
        .catch(err => reject(err));   
	}); 
}

function getUsers(){
    return users.find({})
    .then(doc => {return Promise.resolve(doc)})
    .catch(err => {return Promise.reject(err)});
}

module.exports = {
    getById,
    addNotarius,
    delNotarius,
    editNotarius,
    getAll,
    getUsers,
    createUser,
    getUserById,
    getUserByLoginAndPasshash,
    checkNull
}