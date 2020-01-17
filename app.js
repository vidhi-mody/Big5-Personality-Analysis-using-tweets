var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var session = require('express-session');
const bot = require('./bot')
var plotly = require('plotly')('plotly_username', 'plotlycredentials');
var fs = require('fs');
// const publicDirPath = path.join(__dirname, '../public')
// const viewsPath = path.join(__dirname, '../views')

passport.use(new Strategy({
    consumerKey: 'ENTER CONSUMER KEY',
    consumerSecret: 'ENTER CONSUMER SECRET',
    callbackURL: 'http://localhost:3000/twitter/return'
}, function(token, tokenSecret, profile, callback) {
    return callback(null, profile);
}));

passport.serializeUser(function(user, callback) {
    callback(null, user);
})

passport.deserializeUser(function(obj, callback) {
    callback(null, obj);
})

var app = express();
app.use(express.static(__dirname))

// app.set('views', viewsPath)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'whatever', resave: true, saveUninitialized: true}))

app.use(passport.initialize())
app.use(passport.session())

// 

app.get('/', function(req, res) {
    res.render('twitter', {user: req.user})
})
app.get('/quiz', function(req, res) {
    res.render('quiz')
})

app.get('/twitter/login', passport.authenticate('twitter'))

app.get('/twitter/return', passport.authenticate('twitter', {
    failureRedirect: '/login'
}), function(req, res) {
   handle = req.user.username
   bot.getUserTimeLine(handle, function(err, response) {
    if(err)
        console.error(err);
    console.log(response);
    openess = response.openess
    conscientiousness = response.conscientiousness
    extraversion = response.extraversion
    agreeableness = response.agreeableness
    neuroticism = response.neuroticism

    var trace1 = {
        x: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"],
        y: [openess, conscientiousness, extraversion, agreeableness, neuroticism],
      type: "bar"
    };
    var figure = { 'data': [trace1] };

    var imgOpts = {
        format: 'png',
        width: 1000,
        height: 500
    };

    plotly.getImage(figure, imgOpts, function (error, imageStream) {
        if (error) return console.log (error);

        var fileStream = fs.createWriteStream('1.png');
        imageStream.pipe(fileStream);
    });
});
    res.json({ "msg": "ok" });
})

// module.exports = app;$  
app.listen(3000, function() {
    console.log('App runining on port 3000!');
  });