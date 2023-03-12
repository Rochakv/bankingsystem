//initial setup
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//connection and schema
mongoose.connect("mongodb://localhost:27017/banking",{UseNewUrlParser: true});
const userinfoSchema=new mongoose.Schema({
      to:String,
      by:String,
      amt:Number,
      balance:Number
});
const userSchema=new mongoose.Schema({
  usern:String,
  passwor:String,
  details:[userinfoSchema]
});
const User=mongoose.model("user",userSchema);


//variables
var arr2;
var arr;
var user;
var tot;
var tot2;

//get routes
app.get("/",function(req,res){
  res.render("home");
});
app.get("/create",function(req,res){
  res.render("create");
});
app.get("/existing",function(req,res){
  res.render("existing");
});
app.get("/sendmoney",function(req,res){
  res.render("sendmoney");
});
app.get("/passbook",async function(req,res){
  try{
    const check=await User.findOne({usern:user});
    res.render("passbook",{ele:check});

  }
  catch(err){
    res.send(err);
  }
});
app.get("/success",function(req,res){
  res.render("success");
});





//create post request
app.post("/create",async function(req,res){
  const usrname=req.body.username;
  const pword=req.body.password;
  const bal=req.body.bal;
  user=usrname;
  const data=new User({
    usern:usrname,
    passwor:pword,
    details:[{
          to:usrname,
          by:"Cash",
          amt:bal,
          balance:bal
        }
    ]
  });
  try{
    const check=await User.findOne({usern:usrname});
    if(check){
      res.send("User already exists");
    }else{
      await data.save();
      res.render("welcome",{welcomeusername:usrname,balnce:bal});
    }
  }
  catch(err){
    res.send(err);


  }
});



//existing post request
app.post("/existing",async function(req,res){
  const logun=req.body.logusern;
  const logpassw=req.body.logpw;
  try{
    const check=await User.findOne({usern:logun})
    if(check){
      var x=check.details.length;
      user=check.usern;
      if(check.passwor===logpassw){
        const ballance=check.details[x-1].balance;
        tot=ballance;
        res.render("welcome",{welcomeusername:logun,balnce:ballance});
      }
      else{
        res.send("wrongpassword");
      }
    }else{
      res.redirect("/create");
    }

  }
  catch(err){
    res.send(err);

  }
});




//send money post request
app.post("/sendmoney",async function(req,res){
  const person=req.body.towhom;
  const money=Number(req.body.amount);
  const yun=req.body.your;

  try{
    const check=await User.findOne({usern:person});
    if(check){
      if(check.usern===person){

        tot=tot-money;
        arr2={
            to:person,
            by:yun,
            amt:money,
            balance:tot
        }
        const checkw=await User.findOne({usern:yun});
        checkw.details.push(arr2);
        await checkw.save();



        var x=check.details.length;
        const ballance=Number(check.details[x-1].balance);
        tot2=ballance;
        tot2=tot2+money;
        arr={
            to:person,
            by:yun,
            amt:money,
            balance:tot2
        }
        check.details.push(arr);
        await check.save();
        res.redirect("/success");
      }
    }else{
      res.send("Username doesn't exists");
    }
  }
  catch(err){
    res.send(err);
  }
});












//connected succesfully
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
