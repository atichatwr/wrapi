import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cron from 'node-cron'
import {credentUpdateStatus,
        CredentQuestionaire,
        CredentSetQuestionaire,
        sendmailx,
        callFundPerformanceGroup,
        callFundPerformance,
        callFundDataNav,
        sendMailDetail,
        FTFgetFile,
        callUniholderAll,
        calldatadipchip ,
        callupdatedipchip,
        sendmailCs
       } 
        from './credent.js';

dotenv.config();

const app = express();
const router = express.Router();

app.use(express.json());
app.use(cors());
app.use('/api', router);

router.use((req, res, next) => {
    console.log('FunconSrv:Credent');
    next();
}); 

//-- Working area

router.route('/').all((req, res) => {
    res.json({
        route: '/',
        authentication: false
    });
});


router.route('/sendmail').post((req,res) => {
    var xtoken =  req.headers['x-access-token'];
    let email =   req.body.email
    let body =  req.body.body
    if(xtoken){

        // Verify the token
        // const secret_key = process.env['SECRET_KEY_TEST'];
        const secret_key = process.env['SECRET_KEY'];
        //const decoded = jwt.verify(xtoken, secret_key);
        if(secret_key !== xtoken){ 
            return res.status(401).send({ error: false, error: 'Invalid to authenticate token.' });
        }
        if ( body === undefined || email === undefined){
            return res.status(400).send({ error: false, message: 'Invalid input.' });
              
        }else {

            res.status(200).send({ success: true, message: 'success input.' });
            sendmailx(email,body) 
        }
            
    }else{
 
        // Return response with error
        res.status(401).json({
            "success": false,
            "error": "No token provided."            
        });
    }
    // console.log(body)
    
});
router.route('/requestFormToWR').post((req,res) => {
    var xtoken =  req.headers['x-access-token'];
    let email =   req.body.email
    let body =  req.body.body
    if(xtoken){

        // Verify the token
        // const secret_key = process.env['SECRET_KEY_TEST'];
        const secret_key = process.env['SECRET_KEY'];
        //const decoded = jwt.verify(xtoken, secret_key);
        if(secret_key !== xtoken){ 
            return res.status(401).send({ error: false, error: 'Invalid to authenticate token.' });
        }
        if ( body === undefined || email === undefined){
            return res.status(400).send({ error: false, message: 'Invalid input.' });
              
        }else {

            res.status(200).send({ success: true, message: 'success input.' });
            sendmailCs(email,body) 
        }
            
    }else{
 
        // Return response with error
        res.status(401).json({
            "success": false,
            "error": "No token provided."            
        });
    }
    // console.log(body)
    
});
router.route('/sendemailApproved').post((req,res) => {
    var xtoken =  req.headers['x-access-token'];
    let email =   req.body.email
    let body =  req.body.body
    let filename = req.body.filename
    let pathfile = req.body.pathfile
    if(xtoken){

        // Verify the token
        // const secret_key = process.env['SECRET_KEY_TEST'];
        const secret_key = process.env['SECRET_KEY'];
        //const decoded = jwt.verify(xtoken, secret_key);
        if(secret_key !== xtoken){ 
            return res.status(401).send({ error: false, error: 'Invalid to authenticate token.' });
        }
        if ( body === undefined || email === undefined){
            return res.status(400).send({ error: false, message: 'Invalid input.' });
              
        }else {

            res.status(200).send({ success: true, message: 'success input.' });
            FTFgetFile(filename,pathfile, function(result){
               // sendMailDetail(email,body,filename,pathfile) 
            })
            
        }
            
    }else{
 
        // Return response with error
        res.status(401).json({
            "success": false,
            "error": "No token provided."            
        });
    }
    // console.log(body)
    
});

// Verify route
router.route('/credentUpdateStatus').post((req, res) => {
 
    // Get token value to the json body
    var xtoken =  req.headers['x-access-token'];
 
    // If the token is present
    if(xtoken){

        // Verify the token
        // const secret_key = process.env['SECRET_KEY_TEST'];
        const secret_key = process.env['SECRET_KEY'];
        //const decoded = jwt.verify(xtoken, secret_key);
        if(secret_key !== xtoken){ 
            res.status(401).send({ success: false, error: 'Invalid to authenticate token.' });
        } else {

            const txid = req.body.txid ; 
            const new_status = req.body.new_status ;
            const email  = req.body.email ;
            const cardno = req.body.cardNo ;
            // const docNo = req.body.docNo ;
            // console.log(req.body) 
            if (txid === undefined || new_status === undefined || email === undefined){
                res.status(400).send({ success: false, message: 'Invalid input.' });
            } else {
                
                credentUpdateStatus(txid,new_status,email,cardno,  function(x){
                    console.dir(x);
                    if(x == "200") {
                        res.status(200).json({
                        "success": true,
                        "error": ""            
                        });
                    } else {
                        res.json({
                        "success": false,
                        "error": x.status + " " + x.data
                        });
                    }            
                });
            }   
        }
        
    }else{
 
        // Return response with error
        res.status(401).json({
            "success": false,
            "error": "No token provided."            
        });
    }
});



router.route('/credentUpdateStatus1').post( (req,res) => {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    const secret_key = process.env['SECRET_KEY_TEST'];
    const decoded = jwt.verify(token, secret_key);

    const txid = req.body.txid; 
    const new_status = req.body.new_status;
    const email  = req.body.email;
    
    //getIndividualAccount(req.params.id, function(x){
    credentUpdateStatus(txid,new_status,email, function(x){
        res.json(x);
    });    
});


//----------------- best by 
router.route('/credentgetquestionaire/:email').get((req,res) => {
    CredentQuestionaire(req.params.email, function(x){
        //console.log("return xxxxx")
        if (x.status == 200){
            res.json(x.data);
           CredentSetQuestionaire(x ,(y)=>{

           });
        }
       
    });

});
router.route('/callfundPerformanceGroup').post((req,res)=>{
    var xtoken =  req.headers['x-access-token'];
    let fundgroup =   req.body.fundgroup
    if(xtoken){

        // Verify the token
        // const secret_key = process.env['SECRET_KEY_TEST'];
        const secret_key = process.env['SECRET_KEY'];
        //const decoded = jwt.verify(xtoken, secret_key);
        if(secret_key !== xtoken){ 
            return res.status(401).send({ error: false, error: 'Invalid to authenticate token.' });
        }
        if ( fundgroup === undefined ){
            return res.status(400).send({ error: false, message: 'Invalid input.' });
              
        }else {

            //res.status(200).send({ success: true, message: 'success input.' });
            // console.log(fundcode)
            callFundPerformanceGroup(fundgroup, function(result) {
                // res.json(result.status)
                res.json(result.data)
            })
        }
            
    }else{
 
        // Return response with error
        res.status(401).json({
            "success": false,
            "error": "No token provided."            
        });
    }
    // callFundPerformance(req.params.fundcode, function(result) {
    //     if(result !== false){
    //         res.json(result)
    //     }
    // })

})


router.route('/callfundPerformance').post((req,res) =>{
    var xtoken =  req.headers['x-access-token'];
    let fundcode =   req.body.fundcode
    let Amccode = req.body.Amccode
    // let body =  req.body.body
    if(xtoken){

        // Verify the token
        // const secret_key = process.env['SECRET_KEY_TEST'];
        const secret_key = process.env['SECRET_KEY'];
        //const decoded = jwt.verify(xtoken, secret_key);
        if(secret_key !== xtoken){ 
            return res.status(401).send({ error: false, error: 'Invalid to authenticate token.' });
        }
        if ( fundcode === undefined ){
            return res.status(400).send({ error: false, message: 'Invalid input.' });
              
        }else {

            //res.status(200).send({ success: true, message: 'success input.' });
            // console.log(fundcode)
            callFundPerformance(fundcode,Amccode, function(result) {
                // res.json(result.status)
                res.json(result.data)
            })
        }
            
    }else{
 
        // Return response with error
        res.status(401).json({
            "success": false,
            "error": "No token provided."            
        });
    }
   
})
router.route('/callDataNav').post((req,res) =>{
    var xtoken =  req.headers['x-access-token'];
    let fundcode =   req.body.fundcode
    let Amccode = req.body.Amccode
    // let body =  req.body.body
    if(xtoken){

        // Verify the token
        // const secret_key = process.env['SECRET_KEY_TEST'];
        const secret_key = process.env['SECRET_KEY'];
        //const decoded = jwt.verify(xtoken, secret_key);
        if(secret_key !== xtoken){ 
            return res.status(401).send({ error: false, error: 'Invalid to authenticate token.' });
        }
        if ( fundcode === undefined ){
            return res.status(400).send({ error: false, message: 'Invalid input.' });
              
        }else {

            //res.status(200).send({ success: true, message: 'success input.' });
            // console.log(fundcode)
            callFundDataNav(fundcode,Amccode, function(result) {
                // res.json(result.status)
                res.json(result.data)
            })
        }
            
    }else{
 
        // Return response with error
        res.status(401).json({
            "success": false,
            "error": "No token provided."            
        });
    }
   
})
router.route('/uniholderInquiry' ).post((req,res) =>{
    var xtoken =  req.headers['x-access-token'];
    let accountId =   req.body.accountID
    console.log(req.body.accountID)
    if(xtoken){
        const secret_key = process.env['SECRET_KEY'];
        if(secret_key !== xtoken){ 
            return res.status(401).send({ error: false, error: 'Invalid to authenticate token.' });
        }
        if(accountId === undefined){ return res.status(401).send({error:false, error: 'Invalid Account ID. '})}

        callUniholderAll(accountId,function(result){
            res.json(result)
        })
        
    }else{
 
        // Return response with error
        res.status(401).json({
            "success": false,
            "error": "No token provided."            
        });
    }
})

router.route('/getdatadipchipconfirm').post((req,res)=>{
    const today = new Date()
    let date_ob = new Date(today);
    let date = ("0"+date_ob.getDate()).slice(-2);
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let date_present = year +"-"+  month  +"-"+ date
    // console.log(date_present)
    calldatadipchip(date_present , (result)=>{
        res.json(result)
        // res.json(result.IDCard)
       callupdatedipchip(result ,(resul)=>{
        // console.log(resul)
       })
    })

})

cron.schedule('00 09 * * 1-5', () => {
    const today = new Date()
    let date_ob = new Date(today);
    let date = ("0"+date_ob.getDate()).slice(-2);
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let date_present = year +"-"+  month  +"-"+ date
    // console.log(date_present)
    calldatadipchip(date_present , (result)=>{
        // res.json(result)
        // res.json(result.IDCard)
       callupdatedipchip(result ,(resul)=>{
        // console.log(resul)
       })
    })
})
cron.schedule('00 12 * * 1-5', () => {
    const today = new Date()
    let date_ob = new Date(today);
    let date = ("0"+date_ob.getDate()).slice(-2);
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let date_present = year +"-"+  month  +"-"+ date
    // console.log(date_present)
    calldatadipchip(date_present , (result)=>{
        // res.json(result)
        // res.json(result.IDCard)
       callupdatedipchip(result ,(resul)=>{
        // console.log(resul)
       })
    })
})
cron.schedule('00 15 * * 1-5', () => {
    const today = new Date()
    let date_ob = new Date(today);
    let date = ("0"+date_ob.getDate()).slice(-2);
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let date_present = year +"-"+  month  +"-"+ date
    // console.log(date_present)
    calldatadipchip(date_present , (result)=>{
        // res.json(result)
        // res.json(result.IDCard)
       callupdatedipchip(result ,(resul)=>{
        // console.log(resul)
       })
    })
})
cron.schedule('00 18 * * 1-5', () => {
    const today = new Date()
    let date_ob = new Date(today);
    let date = ("0"+date_ob.getDate()).slice(-2);
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let date_present = year +"-"+  month  +"-"+ date
    // console.log(date_present)
    calldatadipchip(date_present , (result)=>{
        // res.json(result)
        // res.json(result.IDCard)
       callupdatedipchip(result ,(resul)=>{
        // console.log(resul)
       })
    })
})
//-- End of working area
app.listen(5600, () => {
    console.log('FunconSrv:Credent on port 5600');
});

