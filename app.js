const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const { User, Driver, Drivertrip, Userbookings } = require('./mongo');
const app = express();
const port = 3000; 
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');

//Multer Storage
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'uploads/');
    },
    filename: (req,file,cb) =>{
        cb(null,Date.now()+path.extname(file.originalname));
    },
});
const upload = multer({storage:storage});

//Global Variables for User Register
let otp;
let name;
let email;
let name2;
//Global variables for Driver Register
let drivername;
let driveremail;
let driverotp;
// Driver lists
let searchdrivers=[];
let glocation;
//viewdetails variable
let viewdriver;
//Dates and idriver
let pickup;
let drop;
let idriver;
let iemail,mainuserdb=[],tables=[];

//Important functions
function otpGenerator(){
    let x = Math.floor((Math.random() * 9999) + 1000);
    return x;
}

function MatchLocation(substr,str){
    if(str.includes(substr)){
        return true;
    }
    else{
        return false;
    }
}

function CheckDates(dfrom,dto,ufrom,uto)
{
    const parseDate = (dateString) => new Date(dateString.replace(/-/g, '/'));

    const startDate =  parseDate(dfrom);
    const endDate =  parseDate(dto);
    const check1 =  parseDate(ufrom);
    const check2 =  parseDate(uto);

    let t1 = check1 >= startDate && check1 <= endDate;
    let t2 = check2 >= startDate && check2 <= endDate;
    if(t1 === false && t2 === false)
    {
        return true;
    }
    else{
        return false;
    }
}

app.use('/static', express.static('static'));
app.use('/uploads',express.static('uploads'));
app.use(express.urlencoded(extended=true));
app.use(express.json());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'));

app.use(session({
    secret: 'viratroman',
    cookie: {maxAge : 60000},
    resave: true,
    saveUninitialized: true
}));
app.use(flash());


app.get('/',(req,res)=>{
    res.render('index',{message : req.flash('message')});
})

app.get('/index1',(req,res)=>{
    res.render('index1',{ message : req.flash('message')});
})

app.get('/home',(req,res)=>{
    res.render('landing',{title:'Drive U Safe',message:name2,message2:req.flash('message2')});
})

app.get('/driverindex',(req,res)=>{
    res.render('driverindex',{message:req.flash('message')});
})

app.get('/driverindex1',(req,res)=>{
    res.render('driverindex1',{message:req.flash('message')});
})


app.get('/driverlanding',async (req,res)=>{
    console.log(driveremail);
    try{
        const data = await Driver.find({email : driveremail}).exec();
        console.log(data);
        res.render('driverlanding',{message:req.flash('message'),data:data});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error....');
    }
});

app.get('/driverreq', async(req,res)=>{
    console.log("Inside pomabala sooku");
    console.log(drivername);
    const requests = await Userbookings.find({drivername : drivername});
    console.log(requests);
    const filteredRequests = requests.filter(item => item.status !== "Accepted" && item.status !== "Rejected");
    console.log(filteredRequests);
    res.render('driverreq',{requests : filteredRequests});
})

app.get('/aftersearch',(req,res)=>{
    res.render('aftersearch',{searchdrivers : searchdrivers,location:glocation})
})

app.get('/viewdetails',(req,res)=>{
    res.render('viewdetails',{viewdriver : viewdriver});
})
  
app.get('/afterbook',(req,res)=>{
    if(mainuserdb.length === 0)
    {
        const collection = {
            status : ' '
        }
        mainuserdb.push(collection);
    }
    res.render('afterbook',{pickup:pickup,drop:drop,mainuserdb:mainuserdb});
})



app.post('/otpsend', async (req,res)=>{
    otp = otpGenerator();
    name = req.body.name;
    email = req.body.email;
    let checkmail = await User.find({email:email});
    if(checkmail.length === 0)
    { 
        let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user : "21204013@rmd.ac.in",
                pass:"Headofthetable181713153roman"
            }
        }) 
        
        let details = {
            from:"21204013@rmd.ac.in",
            to:email,
            subject:"Welcome To Drive U Safe",
            text:`Your otp is : ${otp}`
        }
        
        mailTransporter.sendMail(details,(err)=>{
            if(err){
                console.log(err);
            }
            else {
                console.log("Mail sent successfully");
            }
        })
        res.status(204).send();
    }
    else{
        console.log("User already exists....");
        req.flash('message','User already exists...');
        res.redirect('/');
    }
   
})

app.post('/register',async (req,res)=>{
    console.log(name);
    console.log(email);
    console.log(otp);
    console.log(req.body.otp);
    console.log(req.body.phoneNumber);
    let temp = Number(req.body.otp);
    if(otp === temp){
        const data ={
            name:name,
            email:email,
            phone:req.body.phoneNumber,
            password:req.body.password
        }
        await User.insertMany([data]).then(function(){
            req.flash('message2','Successfully Account created!!...');
        }).catch(function(err){
            console.log(err);
        })
        res.redirect('/home');
    }
    else{
        req.flash('Please enter the correct otp....');
        res.redirect('/');
    }
})

app.post('/login', async(req,res)=>{
    let mail = req.body.email;
    let pass = req.body.password;
    console.log(mail);
    console.log(pass);
    const results = await User.find({email: mail});
    console.log(results);
    if(results.length !== 0)
    {
        let flag = results[0].password;
        if(flag === pass)
        {
            name2 = results[0].name;
            req.flash('message2',`Welcome ${name2}`);
            res.redirect('/home');
        }
        else{
            req.flash('message','Incorrect Password');
            res.redirect('/index1');
        }
    }
    else{
        req.flash('message','Account not found');
        res.redirect('/index1');
    }
})

app.post('/driveregister',async (req,res)=>{
    drivername = req.body.name;
    driveremail = req.body.email;
    console.log(driveremail);
    driverotp = otpGenerator();
    try{
        let driverresult = await Driver.find({email:driveremail});
        console.log(driverresult);
        if(driverresult.length === 0)
        {
            let mailTransporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user : "21204013@rmd.ac.in",
                    pass:"Headofthetable1817134"
                }
            })
            
            let details = {
                from:"21204013@rmd.ac.in",
                to:driveremail,
                subject:"Welcome To Drive U Safe",
                text:`Your otp is : ${driverotp}`
            }
            
            mailTransporter.sendMail(details,(err)=>{
                    if(err){
                        console.log(err);
                    }
                    else {
                        console.log("Mail sent successfully");
                    }
            });
            res.status(204).send();
        }
        else{
            req.flash('message','Account already exists....');
            res.redirect('/driverindex');
        }
    }
    catch(err)
    {
        console.log('Error occured.....');
    }
})

app.post('/driverotp', upload.fields([
    { name: 'aadharPhoto', maxCount: 1 },
    { name: 'licensePhoto', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 },
]), async (req, res) => {
    let tempotp = req.body.otp;
    console.log(driverotp);
    console.log(tempotp);
    let modifiedloc = req.body.locations.toLowerCase();
    if(driverotp === Number(tempotp))
    {
            try {
                const data1 = {
                    name: drivername,
                    email: driveremail,
                    password: req.body.password,
                    phone: req.body.phoneNumber,
                    age: req.body.age,
                    address: req.body.address,
                    experience: req.body.experience,
                    capability: req.body.capability,
                    profilePhoto: req.files['profilePhoto'][0].filename,
                    aadharnumber: req.body.aadharNumber,
                    aadharPhoto: req.files['aadharPhoto'][0].filename,
                    licensenumber: req.body.licenseNumber,
                    licensePhoto: req.files['licensePhoto'][0].filename,
                    locations: modifiedloc 
            }
            const data2 ={
                drivername : drivername,
                driveremail : driveremail,
                fromdate : [],
                todate : []
            }
            await Driver.insertMany([data1]);
            await Drivertrip.insertMany([data2]);
            console.log("Mission Success!!");
            req.flash('message2',`Welcome ${drivername}!!!`);
            res.redirect('/driverlanding');
        } catch (error) {
            console.log(error);
            res.send("Error...");
        }
    }
    else{
        req.flash('message','Please enter the correct otp...');
        res.redirect('/driverindex');
    }
    
});


app.post('/driverlogin',async(req,res)=>{
    let mail = req.body.email;
    let pass = req.body.password;
    console.log(mail);
    console.log(pass);
    let fetched = await Driver.find({email: mail});
    console.log(fetched);
    if(fetched.length !== 0)
    {
        let flag = fetched[0].password;
        if(flag === pass)
        {
            drivername = fetched[0].name;
            driveremail = fetched[0].email;
            req.flash('message2',`Welcome ${drivername}`);
            res.redirect('/driverlanding');
        }
        else{
            req.flash('message','Incorrect Password');
            res.redirect('/driverindex1');
        }
    }
    else{
        req.flash('message','Account not found');
        res.redirect('/driverindex1');
    }
})


app.post('/search',async (req,res)=>{
    let userlocation = req.body.location.toLowerCase();
    let from = req.body.fromdate;
    let to = req.body.todate;
    pickup = from;
    drop = to;
    glocation = userlocation;
    console.log(userlocation);
    let temp = await Driver.find({});
    let k = await Drivertrip.find({});
    for(let i=0;i<temp.length;i++)
    {
        let checking = MatchLocation(userlocation,temp[i].locations);
        if(checking === true)
        {
            let dfrom = k[i].fromdate;
            let dto = k[i].todate;
            console.log(dfrom);
            console.log(dto);
            let counter = 0;
            for(let j=0;j<dfrom.length;j++)
            {
                let flag = CheckDates(dfrom[j],dto[j],from,to);
                if(flag === true){
                    counter+=1;
                }
                else{
                    break;
                }
            }
            if(counter===dfrom.length && counter===dto.length)
            {
                console.log('Driver inserted...');
                searchdrivers.push(temp[i]);
            }
        }
        else{
            continue;
        }
    }
    console.log(searchdrivers.length);
    res.redirect('/aftersearch');
})

app.post('/viewdetails',async(req,res)=>{
    let id = req.body.clicked;
    console.log(id);
    let driver = await Driver.find({_id : id});
    idriver = driver[0].name;
    iemail = driver[0].email;
    viewdriver = driver;
    console.log(viewdriver);
    res.redirect('/viewdetails');
})

app.post('/book',(req,res)=>{
    res.redirect('/afterbook');
})

app.post('/authentication',async(req,res)=>{
    let uname = name2;
    let flag1,flag2;
    let dname = idriver;
    let from = pickup;
    let to = drop;
    let accomodation = req.body.accomodation === 'on';
    let food = req.body.food === 'on';
    if(accomodation)
    {
        flag1 = true;
    }
    else{
        flag1 = false;
    }
    if(food)
    {
        flag2 = true;
    }
    else{
        flag2=false;
    }
    const field = {
        username : uname,
        drivername : dname,
        fromdate : from,
        todate : to,
        status : 'Pending',
        vehiclenumber : req.body.vehiclenumber,
        fromloc : req.body.pickUpAddress,
        toloc : req.body.dropAddress,
        accomodation : flag1,
        food : flag2
    }
    let u = await Userbookings.insertMany([field]);
    console.log(typeof(u));
    mainuserdb.shift();
    mainuserdb.push(u[0]);
    res.redirect('/afterbook');
})

app.post('/requests', async(req,res)=>{
    const confirmation = req.body.clicked;
    const fromdate = req.query.from;
    const todate = req.query.to;
    console.log(confirmation);
    console.log(fromdate);
    console.log(todate);
    if(confirmation === 'accept')
    {
        console.log(driveremail);      
        console.log(fromdate);
        console.log(todate);
        try{
            console.log('Mission Started');
            const update = {
                $push: { fromdate: fromdate, todate: todate }
              };
            const result=await Drivertrip.updateOne({driveremail:driveremail},update);
            if(result.n === 0)
            {
                return res.status(404).json({ message: 'Document not found' });
            }
        }
        catch(error)
        {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
        console.log("Mission success");
        try {
            const res2 = await Userbookings.updateOne(
              { $and: [{ fromdate: fromdate }, { todate: todate }] },
              { status: "Accepted" }
            );
            console.log("Update Docs: ", res2);
          } catch (err) {
            console.error(err);
          }
    }
    else{
        try {
            const res2 = await Userbookings.updateOne(
              { $and: [{ fromdate: fromdate }, { todate: todate }] },
              { status: "Rejected" }
            );
            console.log("Update Docs: ", res2);
          } catch (err) {
            console.error(err);
          }
    }
    console.log("End");
    res.redirect('/driverreq');
})

app.listen(port,()=>{
    console.log(`The application is running successfully on port ${port}`);
})
