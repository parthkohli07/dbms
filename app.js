const express = require("express");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
const mongoose=require("mongoose");
const auth = require('passport-local-authenticate');


const app = express();

app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/airlineDB",{useNewUrlParser: true})

const userSchema=new mongoose.Schema({
  name:String,
  email:String,
  password: String,
  booked: Boolean

})
const bookingSchema= new mongoose.Schema({
    email:String,
    start: String,
    destination: String,
    noofseats: Number,
    time: String,
})
const flightSchema= new mongoose.Schema({
    flightID: String,
    source: String,
    destination: String,
    seats: Number,
    price: Number,
    time: String,
})
userSchema.plugin(passportLocalMongoose);

const User=mongoose.model("User",userSchema);
const Booking=mongoose.model("Booking",bookingSchema);
const Flight=mongoose.model("Flight",flightSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

const add= 1;
app.get("/",function(req,res){
  res.render("login", {message:"",
  email:"",
  password:""
});
})

app.get("/home",function(req,res){
  Flight.find({},function(err,flight){
    res.render("home",{add: add, flight: flight})
  })
})
app.get("/admin",function(req,res){
    
      res.render("admin")
    
  })
  app.get("/register", function(req, res){
    res.render("register", {
      message:"",
      name:"",
      email:"",
      password:""
    });
  });
  app.post("/register", function(req, res){
    
    User.register({name:req.body.regname,email: req.body.username , password: req.body.password}, function(err){
      if (err) {
        console.log(err);
        res.render("register", {
                  message:"User with this Email already Exists!",
                  name:req.body.regname,
                  email:req.body.username,
                  password:req.body.password
                } )
      } else {
        
passport.authenticate("local")(req, res, function(){
          res.redirect("/");
        });
      }
    });
    
  
 });
  app.post("/admin",function(req,res){
    
    const flight=new Flight({
        flightID:req.body.flightID,
        source:req.body.source,
        destination: req.body.destination,
        time: req.body.time,
        price: req.body.price,
        seats: req.body.seats
      })
      flight.save(function(err){
        if(!err){
          res.redirect("/")
        }
      });
  
})
app.post("/", function(req, res){
   
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
   

  
        passport.authenticate('local', function (err, user, info) { 
       if(err){
         res.json({success: false, message: err})
       } else{
        if (! user) {
          console.log("User not matched")
          console.log(req.body.username)
          console.log(user.password)

          res.render('login' ,{
              message: 'username or password incorrect',
              email: req.body.username,
              password:req.body.password
          })
        } else{
          req.login(user, function(err){
            if(err){
             
            }else{
               res.redirect("/home")
            }
          })
        }
       }
    })(req, res);
  })
  app.listen(3000,function(){
    console.log("server runnning on port 3000");

})