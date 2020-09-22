const passport = require('passport');
const express = require ("express");
require('dotenv').config();
const router = express.Router();
const Nexmo = require('nexmo');
const dbManger = require('./dbManager');
const bcrypt = require('bcryptjs');
const redis = require('redis');
const redisUrl = "redis://127.0.0.1:6379";
const util = require("util");
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
const debug = require('debug')('auth');


const nexmo = new Nexmo({
  apiKey: process.env.apiKey,
  apiSecret: process.env.apiSecret,
});

router.post('/login', passport.authenticate('local',{failureRedirect: '/login',successRedirect:'/abc'}));

router.post('/logout',(req,res)=>{
  req.logout();
  res.status(200).json({message:"Logged out successfully"})
})

router.post('/register', checkNotAuthenticated, async (req, res) => {
      if(!req.body.email || !req.body.password || !req.body.gender || !req.body.name || !req.body.phoneNo || !req.body.age){
        return res.status(400).json({error:"Payload missing"});  
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let result = await dbManger.findUser({email:req.body.email} , 1);
      if(result.users != null) 
        return res.status(400).json({error:`email already used`});
      result = (await dbManger.findUser({phoneNo: req.body.phoneNo},1)).success; 
      if(result.users == null){
        const randomCode =Math.random().toString().substring(2,6);
        const newAcc = {name : req.body.name ,
                        email :  req.body.email ,
                        password : hashedPassword ,
                        gneder:req.body.gender ,
                        phoneNo:req.body.phoneNo,
                        age:req.body.age }
        client.set( 'confirm' + randomCode , JSON.stringify(newAcc) , 'EX', 60 * 60 );
        console.log(req.body.phoneNo);
        send_sms(req.body.phoneNo , randomCode);
        return res.status(201).json({message:"Created successfully"});
      }
      return res.status(400).json({error:`phone number already used`});
  })

  router.post('/confirm',async(req,res)=>{
    if(!req.body.randomCode)
      return res.status(400).json({error:"Payload missing"});
    const acc = await client.get( 'confirm' + req.body.randomCode );
    if(!acc){
      return res.status(400).json({error:"Account request expired"})
    }
    const result = await dbManger.saveUser(JSON.parse(acc));
    if(result.success)
      res.header(200).json({message:"Account activated"});
    res.header(400).json({message:"Account already activated"});
  })

  router.get('/login',async(req,res)=>{
    res.status(200).send("Login Here");
  })

  router.get('/' , checkAuthenticated  , (req,res)=>{
    res.status(200).json("Home page")
  })
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

function send_sms(to , code){
  const from = 'Market Microservices';
  const text = 'Confirmation code' + code;
   nexmo.message.sendSms(from, to, text , (err,res)=>{
     console.log(err);
     console.log(res);
   });
}
  module.exports = router;
