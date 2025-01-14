'use strict';

var path = require('path');
var http = require('http');
var cors = require('cors');
var fs=require('fs')
var {Validator, ValidationError} = require('express-json-validator-middleware');
var writer = require(path.join(__dirname, 'utils/writer.js'));

var oas3Tools = require('oas3-tools');
var serverPort = 3001;

var passport= require('passport')
var session= require('express-session')


var corsOptions ={
    origin: 'http://localhost:3000',
    credentials:true,
};

passport.serializeUser((user,cb)=>{
    cb(null,user);

});

passport.deserializeUser((user,cb)=>{
    cb(null,user)
});


const isLoggedIn = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
    return res.status(401).json({error: 'Unhautorized'})
}

//Validators

var filmschema= JSON.parse(fs.readFileSync(path.join(__dirname,'json_schemas', 'film_schema.json')).toString());
var reviewschema= JSON.parse(fs.readFileSync(path.join(__dirname,'json_schemas', 'review_schema.json')).toString());
var userschema= JSON.parse(fs.readFileSync(path.join(__dirname,'json_schemas', 'user_schema.json')).toString());
var reviewmodificationschema= JSON.parse(fs.readFileSync(path.join(__dirname,'json_schemas', 'review_modification_schema.json')).toString());
var validator= new Validator({allErrors: true});
validator.ajv.addSchema([filmschema,reviewschema,userschema,reviewmodificationschema]);
const addFormats= require('ajv-formats').default;
addFormats(validator.ajv);
var validate =validator.validate


// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();

//Session
app.use(cors(corsOptions));
app.use(session({
    secret: "shhhhh... it's a secret!",
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:300000}
}));
app.use(passport.authenticate('session'));

var filmManager = require(path.join(__dirname, 'components/FilmManager'));
var filmController= require(path.join(__dirname, 'controllers/FilmsController'));
var userController = require(path.join(__dirname, 'controllers/UsersController'))
var reviewsController= require(path.join(__dirname,'controllers/ReviewsController'))
var reviewsModificationsController=require(path.join(__dirname,'controllers/ReviewModificationsController'))

//NEWS

app.post('/api/films/public/:filmId/reviews/:reviewerId/modifications',isLoggedIn,validate({body:reviewmodificationschema}),reviewsModificationsController.requestModification);
app.get('/api/films/public/:filmId/reviews/:reviewerId/modifications',isLoggedIn,reviewsModificationsController.getSingleFilmReviewModificationRequests)
app.get("/api/films/public/reviews/modifications/received",isLoggedIn,reviewsModificationsController.getReviewsModificationRequestsReceived);
app.get("/api/films/public/reviews/modifications/status",isLoggedIn,reviewsModificationsController.getReviewModificationRequestsStatus);
app.get('/api/films/public/reviews/modifications/:mId',isLoggedIn,reviewsModificationsController.getSingleModificationRequest);
app.put('/api/films/public/reviews/modifications/:mId/accept',isLoggedIn,reviewsModificationsController.acceptModificationRequest);
app.put('/api/films/public/reviews/modifications/:mId/reject',isLoggedIn,reviewsModificationsController.rejectModificationRequest);
app.delete('/api/films/public/reviews/modifications/:mId',isLoggedIn,reviewsModificationsController.deleteSingleReviewModificationRequest);

////////
app.get('/api', function(req, res, next) {writer.writeJson(res, new filmManager());});
app.post('/api/films/public/:filmId/reviews',isLoggedIn,reviewsController.issueFilmReviews)
app.post('/api/films',isLoggedIn,validate({body:filmschema}),filmController.createFilm);
app.get('/api/films',isLoggedIn,filmController.getOwnedFilms);
app.get('/api/films/public/invited',isLoggedIn,filmController.getInvited);
app.get('/api/films/public', filmController.getPublicFilms);
app.get('/api/films/public/:filmId', filmController.getSinglePublicFilm)
app.get('/api/users',isLoggedIn, userController.getUsers);
app.get('/api/users/:userId',isLoggedIn, userController.getSingleUser);
app.post('/api/users/authenticator', userController.authenticateUser)
app.get('/api/films/private',isLoggedIn, filmController.getPrivateFilms);
app.get('/api/films/private/:filmId',isLoggedIn, filmController.getSinglePrivateFilm);
app.put('/api/films/private/:filmId',isLoggedIn,validate({body:filmschema}),filmController.updateSinglePrivateFilm);
app.delete('/api/films/private/:filmId',isLoggedIn,filmController.deleteSinglePrivateFilm);
app.put('/api/films/public/:filmId',isLoggedIn,validate({body:filmschema}),filmController.updateSinglePublicFilm);
app.delete('/api/films/public/:filmId/reviews/:reviewerId',isLoggedIn,reviewsController.deleteIncompleteReview);
app.delete('/api/films/public/:filmId',isLoggedIn,filmController.deleteSinglePublicFilm);
app.get('/api/films/public/:filmId/reviews',reviewsController.getFilmReviews);
app.get('/api/films/public/:filmId/reviews/:reviewerId',reviewsController.getSingleReview);
app.put('/api/films/public/:filmId/reviews/:reviewerId',isLoggedIn,validate({body:reviewschema}),reviewsController.completeSingleReview);



app.use(function(err, req, res, next) {
    if (err instanceof ValidationError) {
        res.status(400).send(err);
    } else next(err);
});

app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        var authErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Authorization error' }] };
        res.status(401).json(authErrorObj);
    } else next(err);
});


// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

