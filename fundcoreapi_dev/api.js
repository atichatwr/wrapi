
import express from 'express';
import cors from 'cors';
// const http = require("http");
// import fs from 'fs'
// import http from 'http'
// const app = require("./app");
import axios from 'axios';
import bodyParser from 'body-parser';

import {
        runIndividualProfileLoop,
        setIndividualx,
        putIndividualx,
        getLogin,
        setIndividualAccount,
        setIndividualAccountX1,
        putIndividualAccount
        } from './funconsrv.js';

import { setExcelIndividual,
         updateExcelIndividual,
         runIndividualExcelLoop,
         runIdividualUpdateFundCenLoop,
         runIndividualAccountUpdateLoop } from './funconExcel.js';

//import {test1} from './bk/jslab.js';
import {
        getExportZipFile,
        impIndividualAccount,
        getFundConnIndividualProfile,
        getFundConnExportFile,
        callImportjob,
        callImportQueryOrder,
        getFundOrderInquiry,
        getFundCustomer,
        callImportCustomer,
        callImportjobCus,
        getFundOrderInquiry2,
        importCenCustomer,
        selectaccount,
        callImportCustomers,
        callImportCustomerId,
        callImportOrderInquiry,
        callImportUnitBalance,
        callupdateSwitchOut
        } from './funconPipe.js';


import {getDateYesterday,isLogin, getNextDate} from './wealthutil.js';

//-------------------------------------------------------------Dummy Unit Holder by Thanit
import { dummyUnitHolder, dummyUnitHolder2} from './funconExtend.js';

// import {dummy} from './dummy.html';

import cron from 'node-cron'
import schedule from 'node-schedule';

const app = express();
const router = express.Router();

app.use(express.json());
app.use(cors());
app.use('/api', router);

app.use(bodyParser.urlencoded({ extended: false }));

router.use((req,res,next) => {
    console.log('FunconnSrv:Middleware');
    next();
});

router.route('/login').get( (req,res) => {
    getLogin();

    res.json("Login Success");
    
});

router.route('/ExcelIndividual/:id').get( (req,res) => {
        
    setExcelIndividual(req.params.id, function(x){
        res.json(x);
    });
    
});

router.route('/ExcelIndividualPut/:id').get( (req,res) => {
        
    updateExcelIndividual(req.params.id, function(x){
        res.json(x);
    });
    
});


router.route('/individual/:id').get( (req,res) => {
        
    setIndividualx(req.params.id, function(x){
        res.json(x);
    });
    
});

router.route('/individualPut/:id').get( (req,res) => {
        
    putIndividualx(req.params.id, function(x){
        res.json(x);
    });    
});





router.route('/runIdividualUpdateFundCenLoop').get ( (req,res) => {
    isLogin();
    setTimeout(function () {
        runIdividualUpdateFundCenLoop( function(x){
            res.json(x);
        });

    }, 10000);
    
    
});


router.route('/individualExcelLoop').get ( (req,res) => {
    isLogin();
    setTimeout(function () {
        runIndividualExcelLoop( function(x){
            res.json(x);
        });

        }, 12000);
    
    
});


router.route('/runIdividualUpdateAccountLoop').get ( (req,res) => {
    isLogin();
    setTimeout(function () {
        runIndividualAccountUpdateLoop( function(x){
            res.json(x);
        });

        }, 12000);
    
    
});

//---

router.route('/individualAccount/:id').get( (req,res) => {
        
    setIndividualAccountX1(req.params.id, function(x){
        res.json(x);
    });
    
});

router.route('/individualAccountPut/:id').get( (req,res) => {
        
    putIndividualAccount(req.params.id, function(x){
        res.json(x);
    });    
});

router.route('/individualProfileLoop').get ( (req,res) => {
    
    runIndividualProfileLoop( function(x){
        res.json(x);
    });
});

//---
/*
router.route('/chkToken').get ( (req,res) => {
    res.json(funncon.getAccessTocken());
});
*/
   

router.route('/unzipTest').get( (req,res) => {
    getExportZipFile();
    res.json("ok");
    
});

router.route('/getIndividualAccount/:id').get( (req,res) => {
        
    //getIndividualAccount(req.params.id, function(x){
    impIndividualAccount(req.params.id, function(x){
        res.json(x);
    });    
});

router.route('/getFundConnIndividualProfile/:id').get( (req,res) => {
        
    getFundConnIndividualProfile(req.params.id, function(x){
        res.json(x);
    });    
});

router.route('/getFundConnFundMapping').get( (req,res) => {
    const afileType = 'FundMapping' ;
    const aDate = getDateYesterday();
    
    
    getFundConnExportFile( aDate,afileType, function(x){
        res.json(x);
    });  
});

router.route('/getFundConnFundProfile').get( (req,res) => {
    const afileType = 'FundProfile' ;
    const aDate = getDateYesterday();
    
    
    getFundConnExportFile( aDate,afileType, function(x){
        res.json(x);
    });  
});

router.route('/getFundConnFundHoliday').get( (req,res) => {
    const afileType = 'FundHoliday' ;
    const aDate = getDateYesterday();
    
    
    getFundConnExportFile( aDate,afileType, function(x){
        res.json(x);
    });  
});

router.route('/getFundConnSwitchingMatrix').get( (req,res) => {
    const afileType = 'SwitchingMatrix' ;
    const aDate = getDateYesterday();
    
    
    getFundConnExportFile( aDate,afileType, function(x){
        res.json(x);
    });  
});

router.route('/getFundConnData/:dataType').get( (req,res)=>{
    const aDate = getDateYesterday();
    const aDataType = req.params.dataType;    
    isLogin();
    getFundConnExportFile( aDate, aDataType, function(afileData){
        
        console.log("afileData:"+afileData);
        console.log("aDataType:"+aDataType);
        callImportjob( aDataType,afileData, function(x){
            res.json(x);    
        }); 
        
    }); 

});

router.route('/getFundOrderInquiry').get( (req,res)=>{
    let aDate = getDateYesterday();
    // console.log("aDate:"+aDate);
     aDate = '20220810'
    getFundOrderInquiry( aDate,function(x){      
        
        callImportQueryOrder(x, function(y){  
            res.json(y);            
        });
    
        
    });
});

//** 19 08 2022 */
router.route('.callImportNotWorkingday').get((req,res)=>{
    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
        
    });
    promise.then(function() {
        let datenow
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year + month + date  
        setTimeout(function(){ 
            let aDate = getDateYesterday();
            // console.log("aDate:"+aDate);
            //aDate =  datenow// '20220809'
            const aDataType = "FundHoliday"// req.params.dataType;
            getFundConnExportFile( aDate, aDataType, function(afileData){
                //res.json(afileData);  
                console.log("afileData:"+afileData);
                if (afileData != false) {
                        callImportjob( aDataType,afileData, function(x){
                            res.json("Import Transaction success ");    
                        });
                    //res.json(afileData);
                } else { 
                    res.json("no data");
                } 
            });
          //  res.json("sucess"); 
        
        }, 1000);
        
      });

})

//** 04 08 2022  BEST  */
router.route('/callImportOrderInquiry').get((req,res)=>{
    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
        
    });
    promise.then(function() {
        let datenow
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year + month + date  
        let nextday1 = getNextDate(1); 
        let nextday2 = getNextDate(2);
        let nextday3 = getNextDate(3);
        let nextday4 = getNextDate(4);
        let loop_date =  [datenow,nextday1 ,nextday2,nextday3,nextday4]
        //let aDate  = getDateYesterday();
        loop_date.forEach(async(date) => { 
            setTimeout(function(){ 
                // console.log("aDate:"+date);
                //aDate = date //'20220822'
                getFundOrderInquiry( date,function(x){      
                    
                    callImportQueryOrder(x, function(y){  
                        console.log(y)
                    });
 
                });
              //  res.json("sucess"); 
            
            }, 5000);
        });
        setTimeout(() => {
           callImportOrderInquiry() 
        }, 5000);
        res.json( " Order inquiry Transaction Imported  ON " + datenow)  ; 
        
        setTimeout(()=>{
            callupdateSwitchOut()
        },2000);
        
      }); 


});
router.route('/callImportTransaction').get((req,res)=>{
    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
        
    });
    promise.then(function() {
        // const today = new Date()
            //const yesterday = new Date(today)
            
            //---- if today = monday must get File of Friday     
        let datenow
        const today = new Date()
        const yesterday = new Date(today)
        let yt
        var chek_day = today.getDay();
        if (chek_day === 1){ 
            yt = yesterday.setDate(yesterday.getDate()-3) 
        }else{
            yt = yesterday.setDate(yesterday.getDate()-1) 
        }
        
        let date_yt = new Date(yt)
        let dateyt = ("0"+date_yt.getDate()).slice(-2);
        let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
        let year_yt = date_yt.getFullYear();
        let date_yesterday = year_yt  + month_yt  + dateyt


        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year + month + date  
        setTimeout(function(){ 
            // let aDate = getDateYesterday();
            let aDate = (chek_day === 1 ? date_yesterday : getDateYesterday())
            //aDate =  datenow// '20220809'
            const aDataType = "AllottedTransactions"// req.params.dataType;
            getFundConnExportFile( aDate, aDataType, function(afileData){
                //res.json(afileData);  
                console.log("afileData:"+afileData);
                if (afileData != false) {
                        callImportjob( aDataType,afileData, function(x){
                            res.json("Import Transaction success on Date "+ aDate);    
                        });
                    //res.json(afileData);
                } else { 
                    res.json("no data on Date "+ aDate );
                } 
            });
          //  res.json("sucess"); 
        
        }, 1000);
        
      }); 
});



//----- 17052022
router.route('/getFundCustomer/:id').get( (req,res) => {
    const aDate = getDateYesterday();
    console.log("aDate:"+aDate);
        
    getFundCustomer(req.params.id, function(x){
        callImportCustomer(x,function(y){
            //res.json(y);   
        });
      res.json(x);
        
    });    
});

router.route('/callFundCustomer/:id').get((req,res)=>{
    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
        
    });
    promise.then(function() {
        setTimeout(function(){
            getFundCustomer(req.params.id, function(x){
                callImportCustomerId(x,function(y){
                    res.json(y);   
                });
                // res.json(x);
           // res.redirect("http://192.168.2.28/api.html")    
            });
        }, 2000); 

        // const new_location =  'http://192.168.2.28/api.html'
        // const new_url = new URL(new_location) 
        // //new_url.searchParams('param1','value')
        // location = new_url 
        //window.location.href = "http://192.168.2.28/api.html";
    }); 

    // let btn = document.createElement("button");
    // btn.innerHTML = "Save";
    // // btn.addEventListener("click", function () {
    // // alert("Button is clicked");
    // // });
    // btn.setAttribute('onclick' ,'history.back()')
    // document.body.appendChild(btn); 
});

//--------------------------------------------------------------------------------xxx
router.route('/getFundConnDataByCus/:id/:dataType').get( (req,res)=>{
    const aDate = req.params.aDate;
    const aDataType = req.params.dataType;
    const aId = req.params.id;
    isLogin();
    getFundCustomer(aId, function(x){
        //res.json(afileData);  
        // console.log("jason data :"+x);
        if (x != false) {
           callImportjobCus( aDataType,x, function(y){
                
             });
           // res.json(x);
          // console.log("jason data :" );
        } else { 
            res.json("no data Customer Import1");
        } 
    });


});




//----------------------------------------------------------------

router.route('/getFundOrderInquiryBy/:datex').get( (req,res)=>{
    console.log("datex:"+req.params.datex);

    const aDate = req.params.datex;
    getFundOrderInquiry( aDate,function(x){        
        callImportQueryOrder(x, function(y){  
            res.json(y);            
        }); 
            
    }); 

});
 
//-------------------------------2rd--------------------------
router.route('/importCenCustomer/:id').get( (req,res)=>{
    //console.log("datex:"+req.params.id);
    //isLogin();
    //const aDate = req.params.id;
    const aid = req.params.id;
    getFundOrderInquiry2( aid,function(x,status){ 
        //console.log(result)
        if (x != false) {
            if (status == 200){
                importCenCustomer(x, function(y){  
                 res.json(y); 
      
              });
            }else{
                 res.json("Not found Data ID "+ req.params.id)
                 // res.json("no data");
             }  
              
             //console.log("status 200") 
         }     
          
             
     }); 

});


router.route('/getFundConnDataBy2/:aDate/:dataType').get( (req,res)=>{
    const aDate = req.params.aDate;
    const aDataType = req.params.dataType;
    isLogin();
    getFundConnExportFile( aDate, aDataType, function(afileData){
        //res.json(afileData);  
        console.log("afileData:"+afileData);
        if (afileData != false) {
            callImportjob( aDataType,afileData, function(x){
                res.json(x);    
            });
            //res.json(afileData);
        } else { 
            res.json("no data");
        } 
    });


});
//---------------------------------------------------------------
router.route('/getFundConnDataBy/:aDate/:dataType').get( (req,res)=>{
    const aDate = req.params.aDate;
    const aDataType = req.params.dataType;
    isLogin();
    getFundConnExportFile( aDate, aDataType, function(afileData){
        // res.json(afileData);  
        console.log("afileData:"+afileData);
        if (afileData != false) {
            callImportjob( aDataType,afileData, function(x){
               res.json(x);    
            });
            //res.json(afileData);
        } else { 
            res.json("no data");
        } 
    });


});

//--------------


router.route('/getLogin').get ( (req,res) => {
    isLogin();
    setTimeout(function () {
       
            res.json("Login Success");
      

        }, 10000);
    
    
});


//---- unitholder dummy
router.route('/dummyUnitHolder').post ( (req,res) => {
        
    const amcCode = req.body.amcCode; 
    const accountId = req.body.accountId;
    const unitholderType  = req.body.unitholderType;
    //dummyUnitHolder
    dummyUnitHolder(amcCode,accountId,unitholderType, function(x){
        res.json(x);
    });
    // res.json('xxxxxxxxx')
    // dummyUnitHolder2(amcCode,accountId,unitholderType, function(x){
    //     res.json(x);
    // });
});    
router.route('/getAccountCustomers').post ((req,res) =>{
    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
    });
    promise.then(function() {
        setTimeout(function () {  
            selectaccount(function(x){  
                res.json(x);
            });

        }, 1000);
    });
        

})

//-------------------------------3rd-------------------------- Promise incould
router.route('/getFundConnDataNologin/:aDate/:dataType').get( (req,res)=>{ 
    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
        
    });
    promise.then(function() {
        //res.json('success');
        setTimeout(function(){ 
            const aDate = req.params.aDate;
            const aDataType = req.params.dataType;
            //isLogin();
            getFundConnExportFile( aDate, aDataType, function(afileData){
                //res.json(afileData);  
                console.log("afileData:"+afileData);
                if (afileData != false) {
                        callImportjob( aDataType,afileData, function(x){
                            res.json(x);    
                        });
                    //res.json(afileData);
                } else { 
                    res.json("no data");
                } 
            });
          //  res.json("sucess"); 
        
        }, 1000);
        
      });

});

router.route('/getFundConnDataType/:dataType').get( (req,res)=>{ 
    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
        
    });
    let datenow
        const today = new Date()
        const yesterday = new Date(today)
        let yt
        var chek_day = today.getDay();
        if (chek_day === 1){ 
            yt = yesterday.setDate(yesterday.getDate()-3) 
        }else{
            yt = yesterday.setDate(yesterday.getDate()-1) 
        }
        
        let date_yt = new Date(yt)
        let dateyt = ("0"+date_yt.getDate()).slice(-2);
        let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
        let year_yt = date_yt.getFullYear();
        let date_yesterday = year_yt  + month_yt  + dateyt


        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year + month + date 
        promise.then(function() {
            //res.json('success');
            setTimeout(function(){ 
                let aDate = (chek_day === 1 ? date_yesterday : getDateYesterday())
                const aDataType = req.params.dataType;  
                getFundConnExportFile( aDate, aDataType, function(afileData){
                    
                    console.log("afileData:"+afileData);
                    console.log("aDataType:"+aDataType);
                    callImportjob( aDataType,afileData, function(x){
                        // res.json("Import Data "+aDataType+" on "+aDate);  
                          res.json(x) 
                    }); 
            
                }); 

            }, 2000);
        
        });
                
                
    // const aDate = getDateYesterday();
    
})

cron.schedule('00 18 * * 1-5', () => {
    

    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
    });

    promise.then(function() {
        //res.json('success');
        setTimeout(function(){ 
            const today = new Date()
            const yesterday = new Date(today)
            const yt = yesterday.setDate(yesterday.getDate()-1)     
            
            let date_ob = new Date(today);
            let date = ("0"+date_ob.getDate()).slice(-2);
            // if (date.toString().length = 1) {date = "0"+ date ;}
            let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            let date_present = year +  month  + date

            let date_yt = new Date(yt)
            let dateyt = ("0"+date_yt.getDate()).slice(-2);
            let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
            let year_yt = date_yt.getFullYear();

            let date_yesterday = year  + month  + dateyt
            const aDate = date_yesterday
            const aDataType = 'AllottedTransactions'
            //isLogin();
            console.log(date_present)
            // getFundConnExportFile( aDate, aDataType, function(afileData){
            //     //res.json(afileData);  
            //     console.log("afileData:"+afileData);
            //     if (afileData != false) {
            //             callImportjob( aDataType,afileData, function(x){
            //                 //res.json(x);    
            //             });
            //         //res.json(afileData);
            //     } else { 
            //             //res.json("no data");
            //     } 
            // });
          //  res.json("sucess"); 
        
        }, 1000);
        
    });
});
cron.schedule('00 09 * * 1-5', () => {
    callImportUnitBalance()  
});

app.listen(5500, () => {
    console.log('Listening fundconn on port 5500');
});


