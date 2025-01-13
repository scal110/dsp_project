'use strict'

var passport = require('passport');
var localStrategy= require('passport-local');
var writer=require('../utils/writer');
var Users = require ('../service/UsersService')

passport.use(new localStrategy({
    usernameField:'email',
    passwordField: 'password'
}, async function verify(username,password,done){
    Users.getUserByEmail(username)
        .then((user)=>{
            if (!user){
                return done(null,false, {message: 'Unauthorized acces'});
            }
            else{
                if(!Users.checkPassword(user,password)){
                    return done(null, false, {message: 'Unauthorized acces'});
                }
                else{
                    return done (null,user);
                }
            }
        }).catch(err=> done(err))



}));


module.exports.authenticateUser = function authenticateUser (req, res, next) {

    if (req.isAuthenticated()) {
        //If user is already autheticated the logout opertion is performed
      req.logout((err) => {
        if (err) {
          return next(err); 
        }
        console.log("logout");
      });
    }
  
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
      if (!user) {
        return res.status(401).json(info);
      }
      req.login(user, (err) => {
        if (err)
          return next(err);
        return res.json({ id: user.id, name: user.name, email: req.body.email});
        
      });
    })(req, res, next);
  
  };

  module.exports.getUsers = function getUsers (req, res, next) {
    Users.getUsers()
      .then(function (response) {
        if(!response){
          writer.writeJson(res, response, 404);
       } else {
         writer.writeJson(res, response);
      }
      })
      .catch(function (response) {
        writer.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
      });
  };

  module.exports.getSingleUser = function getSingleUser (req, res, next) {
    Users.getUserById(req.params.userId)
      .then(function (response) {
        if(!response){
          writer.writeJson(res, response, 404);
       } else {
         writer.writeJson(res, response);
      }
      })
      .catch(function (response) {
        writer.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
      });
  };