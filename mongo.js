const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/DriveUSafe",{useNewUrlParser: true,
useUnifiedTopology:true})
.then(()=>{
    console.log("Mongo connected");
})
.catch((err)=>{
    console.log(err);
})

var db = mongoose.connection;

//User model
const User = mongoose.model('User',{
    name : {type: String},
    email : {type:String},
    phone: {type:String},
    password: {type:String}
})

//Driver Model
const Driver = mongoose.model('Driver',{
    name : {type:String},
    email : {type: String},
    password : {type:String},
    phone : {type:String},
    age : {type:Number},
    address: {type:String},
    experience: {type:Number},
    capability : {type:String},
    profilePhoto: {type:String},
    aadharnumber: {type:String},
    aadharPhoto: {type:String},
    licensenumber: {type:String},
    licensePhoto: {type:String},
    locations: {type:String}
})

//Driver trip Model 
const Drivertrip = mongoose.model('Drivertrip',{
    drivername : {type:String},
    driveremail : {type:String},
    fromdate : [String],
    todate : [String]
})

//Userbookings model 
const Userbookings = mongoose.model('Userbookings',{
    username : {type:String},
    drivername : {type:String},
    fromdate : {type:String},
    todate : {type:String},
    status : {type:String},
    vehiclenumber : {type:String},
    fromloc : {type:String},
    toloc : {type:String},
    accomodation : {type:Boolean},
    food : {type:Boolean}
})

module.exports = {
    User,
    Driver,
    Drivertrip,
    Userbookings
  };