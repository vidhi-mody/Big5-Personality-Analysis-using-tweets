var express                 = require("express"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    bodyParser              = require("body-parser"),
    User                    = require("../models/user"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose")
const router = new express.Router()

mongoose.connect("mongodb://localhost/auth_demo_app");

router.use(bodyParser.urlencoded({extended:true}));
router.use(require("express-session")({
    secret:"Rusty is the best og in the world",
    resave: false,
    saveUninitialized: false
}));

router.set('view engine','ejs');
//
router.use(passport.initialize());
router.use(passport.session());
// 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


router.get("/",function(req,res){
    res.render("home");
});

router.get("/secret",isLoggedIn, function(req, res){
    res.render("secret");
});

// Auth Routes

router.get("/register", function(req, res){
    res.render("register");
});
//handling user sign up
router.post("/register", function(req, res){
User.register(new User({username:req.body.username}),req.body.password, function(err, user){
       if(err){
            console.log(err);
            return res.render('register');
        } //user stragety
        passport.authenticate("local")(req, res, function(){
            res.redirect("/twitter"); //once the user sign up
       }); 
    });
});

// Login Routes

router.get("/login", function(req, res){
    res.render("login");
})

// middleware
router.post("/login", passport.authenticate("local",{
    successRedirect:"/secret",
    failureRedirect:"/login"
}),function(req, res){
    res.send("User is "+ req.user.id);
});

router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router
