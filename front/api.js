//----------   FRONT  APPICTION 
//----------   CREATE 11 - 2022
//----------   BY BEST 
import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import ejs from 'ejs';
import bodyParser from 'body-parser';  
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from 'fs' 
import session from 'express-session';
const app = express();
const router = express.Router();
import {calldatasaccount
        ,callrequestsendmail
        ,callgroupdatasaccount
        ,callgenpdfbyid
        ,callrequestsendgroupmail
        ,callSingon
        ,calltransactionReconcile
                                    } from './funconPipe.js';

import bcrypt  from 'bcrypt';
import jwt     from 'jsonwebtoken';

app.use(express.json());
app.use(cors());
app.use('/api', router);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'my-secret-key', // กำหนดคีย์สำหรับการเข้ารหัส session
    resave: false,
    saveUninitialized: false,
  }));
// http.createServer(render).listen(3000)

function render(req,res){
    let url = req.url 
    url = (url.endsWith('/')) ? url : url+'/' 
    let fileName = 'html/'
    switch (url) {
        case '/': fileName += 'index.html';  break;
        case '/sendpdf/' : fileName += 'sendpdf.html'; break;
    } 
    let ctype= {'Content-Type': 'text/html' }
    fs.readFile(fileName ,(error,content) =>{
        if(!error){ 
            res.writeHead(200,ctype) 
            res.write(content) 
        }else{
            res.writeHead(404,ctype) 
            res.write(error.message)
        }
        return res.end()
    })
    // res.write("hi")
    // res.end()
}

// const front = express()
// const frontrount= express.Router()

// front.use(express.json());
// front.use(cors());
// front.use('/', frontrount);

app.set('view engine', 'ejs')
app.use(express.static('public'))
// front.use('logo',express.static(__dirname+'/views/layouts/image'))
app.use('/axios',express.static(__dirname+'/node_modules/axios/dist'))

const today = new Date()
let date_ob = new Date(today);
let date = ("0"+date_ob.getDate()).slice(-2); 
let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let date_present = year +  month  + date


app.use('/img',express.static('C:/WR/fundcon/'+date_present))
app.use('/bootstrap',express.static(__dirname+'/node_modules/bootstrap/dist'))

router.use((req,res,next) => {
    console.log('Middleware:WealthDB');!
    next();
});

app.get('/',(req,res)=>{
    res.type('text/html')
    res.send('xxxx')
})

app.get('/listapi',(req,res)=>{
    res.type('text/html')
    res.render('api' ,{title:'API'})
    // res.render('api')
})
app.get('/sendpdf', (req,res)=>{
    let  datarows
    // await getdatacus((datas)=>{datarows = datas})
    calldatasaccount( function(x){ 
        res.type('text/html')
        res.render('sendpdf',{
            datarows :  x 
        })
    } )
    
})
//router.route('/sendmailpdf/:sendmail').get( (req,res)=>{  
app.get('/sendmailpdf',(req,res)=>{
    // console.log(req)
    let cust_code = req.query.sendmail
    let mail = req.query.mail
    let fullname = req.query.fullname
    // console.log(cust_code)
     callrequestsendmail(cust_code ,mail, function(x){
        // res.json(x)
        //setTimeout(() => {
            res.type('text/html')
            res.render('sendmail',{
                sendmail :  x ,
                cust_code : cust_code,
                email : mail,
                fullname : fullname
            })
            // if (x ==='success'){
            //     res.redirect('/sendpdf') 
            // }else{
            //     res.json('not success')
            // }
        //}, 7000);
        
        
    })
    
})
app.get('/groupsend', (req,res)=>{
    let  datarows
    // await getdatacus((datas)=>{datarows = datas})
    callgroupdatasaccount( function(x){ 
        res.type('text/html')
        res.render('groupsend',{
            datarows :  x 
        })
    } )
    
})
app.get('/genpdfbyid',(req,res)=>{
    let cust_code = req.query.id
    // console.log(cust_code)
    callgenpdfbyid(cust_code,function(f){
        res.json(f)
    })
})

app.get('/sendgroupmailpdf',(req,res)=>{
     
    callrequestsendgroupmail(req.query , function(x){
        res.render('groupsendmail',{
            sendmail :  x  
        }) 
    //    if (x ==='success'){ 
    //         res.render('groupsendmail',{
    //         sendmail :  x  
    //     }) 
    //    }else{
    //     res.render('groupsendmail',{
    //         sendmail :  x  
    //     }) 
    //    }
   })
})
app.get('/login',(req,res)=>{
    res.type('text/html')
    res.render('login' ,{title:'Login'})
})

app.post('/singon', async (req,res)=>{
    const { username, password } = req.body;
    // Check if username and password are correct
    const hashedPassword =  await  bcrypt.hash(req.body.password, 10);
      callSingon(req.body ,(result)=>{
        console.log(result)
        if(result==='SUCCESS')
        {
            //generate  sucession
            res.send('Logged in successfully!');
        }else
        {
            res.send('Invalid username or password');
        }
    })


    // if (username === 'admin' && password === 'password') {
    //   res.send('Logged in successfully!');
    // } else {
    //   res.send('Invalid username or password');
    // }
    //  console.log(req.body)
    // try {
        
    //     const hashedPassword =  await  bcrypt.hash(req.body.password, 10);
    //     const user = { username: req.body.username, password: hashedPassword };
    //     console.log(user) 
        
    //     //  usersCollection.insertOne(user);
    //     //res.status(201).send();
    //     res.send('Logged in successfully!');
    //   } catch {
    //     res.status(500).send();
    //     res.send('Invalid username or password');
    //   }
     
});
app.get('/transaction',async (req,res)=>{
    res.type('text/html')
    res.render('transaction' ,{title:'transction Report'})
    calltransactionReconcile((result)=>{

    })

})

app.listen(3001, () => {
    console.log ('Listening front on port 3001');
});



 

