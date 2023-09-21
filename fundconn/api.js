
import express from 'express';
import cors from 'cors';
// const http = require("http");
// import fs from 'fs'
// import http from 'http'
// const app = require("./app");
import bodyParser from 'body-parser';
import cron from 'node-cron'

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
        callImportQueryOrder2,
        selectaccount,
        callImportCustomers
        ,callDataNavLog
        ,getFileZipExportFile
        } from './funconPipe.js';


import {getDateYesterday,isLogin} from './wealthutil.js';

//-------------------------------------------------------------Dummy Unit Holder by Thanit
import { dummyUnitHolder, dummyUnitHolder2} from './funconExtend.js';

// import {dummy} from './dummy.html';


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
    // getExportZipFile();
    // getFileZipExportFile((afileData)=>{
    //     callImportjob( 'Nav',afileData, function(x){
    //         //res.json(x);    
    //     });
    // })
    let afileData = "../../pipe/unzipfile/20230630_WR_DIVIDEND.txt"
    callImportjob( 'DividendNewsX',afileData, function(x){
        //res.json(x);    
    });
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
    const aDate = getDateYesterday();
    console.log("aDate:"+aDate);
    getFundOrderInquiry( aDate,function(x){      
        
        callImportQueryOrder(x, function(y){  
            res.json(y);            
        });
    
        
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

//--------------------------------------------------------------------------------xxx
router.route('/getFundConnDataByCus/:id/:dataType').get( async (req,res)=>{
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
router.route('/getFundOrderInquiryBy2/:id').get( (req,res)=>{
    //console.log("datex:"+req.params.id);
    //isLogin();
    //const aDate = req.params.id;
    const aid = req.params.id;
    getFundOrderInquiry2( aid,function(x,status){ 
        //console.log(result)
        if (x != false) {
            if (status == 200){
             callImportQueryOrder2(x, function(y){  
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
    isLogin();
    setTimeout(function () {
        selectaccount(function(x){  
            res.json(x);
        });

    }, 1000);
        

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
router.route('/callimportNav').get((req,res)=>{
    const d = new Date();
    let hour = d.getHours();
    let minutes = d.getMinutes();
    if(hour >  10 && hour < 14){
        res.json("ระบบกำลังประมวลผลอยู่   ช่วงเวลา 10.30 - 14.00 น" );
        return   
    }
    if(hour = 10){
        if(minutes > 30){
        res.json("ระบบกำลังประมวลผลอยู่   ช่วงเวลา 10.30 - 14.00 น" );
        return  
        } 
    }

    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
    });

    promise.then(function() {
        //res.json('success');
        setTimeout(function(){ 
            const today = new Date()
            const yesterday = new Date(today)
            let yt
            //---- if today = monday must get File of Friday     
            var chek_day = today.getDay();
            if (chek_day === 1){ 
                yt = yesterday.setDate(yesterday.getDate()-3) 
            }else{
                yt = yesterday.setDate(yesterday.getDate()-1) 
            }             
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

            let date_yesterday = year_yt  + month_yt  + dateyt
            let aDate =  date_yesterday 
            const aDataType = 'Nav'
            console.log(aDate)
            //  aDate = '20220811' //20220812
            getFundConnExportFile( aDate, aDataType, function(afileData){
                //res.json(afileData);  
                console.log("afileData:"+afileData);
                if (afileData != false) {
                        callImportjob( aDataType,afileData, function(x){
                            //res.json(x);    
                        });
                    //res.json(afileData);
                } else { 
                        //res.json("no data");
                } 
            });
          //  res.json("sucess"); 
        
        }, 1000);
        
    });
})
router.route('/callDatatNavLog').get((req,res)=>{
    callDataNavLog()
})
/* 
cron.schedule('45 00 * * 2-6', () => {
    // follow up time by NCL 2022-10-03 
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
            let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            let date_present = year +  month  + date

            let date_yt = new Date(yt)
            let dateyt = ("0"+date_yt.getDate()).slice(-2);
            let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
            let year_yt = date_yt.getFullYear();

            let date_yesterday = year  + month  + dateyt
            const aDate = date_present
            const aDataType = 'Nav'

            getFundConnExportFile( aDate, aDataType, function(afileData){
                //res.json(afileData);  
                console.log("afileData:"+afileData);
                if (afileData != false) {
                        callImportjob( aDataType,afileData, function(x){
                            //res.json(x);    
                        });
                    //res.json(afileData);
                } else { 
                        //res.json("no data");
                } 
            });
          //  res.json("sucess"); 
        
        }, 1000);
        
    });
});
*/
cron.schedule('14 09 * * 1-5', () => { 
    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
    });

    promise.then(function() {
        //res.json('success');
        setTimeout(function(){ 
            const today = new Date()
            const yesterday = new Date(today)
            let yt
            //---- if today = monday must get File of Friday     
            var chek_day = today.getDay();
            if (chek_day === 1){ 
                yt = yesterday.setDate(yesterday.getDate()-3) 
            }else{
                yt = yesterday.setDate(yesterday.getDate()-1) 
            }             
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

            let date_yesterday = year_yt  + month_yt  + dateyt
            let aDate =  date_yesterday 
            const aDataType = 'Nav'
            console.log(aDate)
            //  aDate = '20220811' //20220812
            getFundConnExportFile( aDate, aDataType, function(afileData){
                //res.json(afileData);  
                console.log("afileData:"+afileData);
                if (afileData != false) {
                        callImportjob( aDataType,afileData, function(x){
                            //res.json(x);    
                        });
                    //res.json(afileData);
                } else { 
                        //res.json("no data");
                } 
            });
          //  res.json("sucess"); 
        
        }, 1000);
        
    });
});
// cron.schedule('45 11 * * 1-5', () => { 
//     const promise = new Promise(function(myResolve, myReject) {
//         myResolve(isLogin())
//     });

//     promise.then(function() {
//         //res.json('success');
//         setTimeout(function(){ 
//             const today = new Date()
//             const yesterday = new Date(today)
//             let yt
//             //---- if today = monday must get File of Friday     
//             var chek_day = today.getDay();
//             if (chek_day === 1){ 
//                 yt = yesterday.setDate(yesterday.getDate()-3) 
//             }else{
//                 yt = yesterday.setDate(yesterday.getDate()-1) 
//             }             
//             let date_ob = new Date(today);
//             let date = ("0"+date_ob.getDate()).slice(-2);
//             // if (date.toString().length = 1) {date = "0"+ date ;}
//             let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
//             let year = date_ob.getFullYear();
//             let date_present = year +  month  + date

//             let date_yt = new Date(yt)
//             let dateyt = ("0"+date_yt.getDate()).slice(-2);
//             let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
//             let year_yt = date_yt.getFullYear();

//             let date_yesterday = year_yt  + month_yt  + dateyt
//             let aDate =  date_yesterday 
//             const aDataType = 'Nav'
//             console.log(aDate)
//             // aDate = '20220811' //20220812
//             getFundConnExportFile( aDate, aDataType, function(afileData){
//                 //res.json(afileData);  
//                 console.log("afileData:"+afileData);
//                 if (afileData != false) {
//                         callImportjob( aDataType,afileData, function(x){
//                             //res.json(x);    
//                         });
//                     //res.json(afileData);
//                 } else { 
//                         //res.json("no data");
//                 } 
//             });
//           //  res.json("sucess"); 
        
//         }, 1000);
        
//     });
// });
// cron.schedule('50 15 * * 1-5', () => {
//     // follow up by NCL 2022-10-03 
//     const promise = new Promise(function(myResolve, myReject) {
//         myResolve(isLogin())
//     });

//     promise.then(function() {
//         //res.json('success');
//         setTimeout(function(){ 
//             const today = new Date()
//             const yesterday = new Date(today)
//             let yt
//             //---- if today = monday must get File of Friday     
//             var chek_day = today.getDay();
//             if (chek_day === 1){ 
//                 yt = yesterday.setDate(yesterday.getDate()-3) 
//             }else{
//                 yt = yesterday.setDate(yesterday.getDate()-1) 
//             }             
//             let date_ob = new Date(today);
//             let date = ("0"+date_ob.getDate()).slice(-2);
//             // if (date.toString().length = 1) {date = "0"+ date ;}
//             let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
//             let year = date_ob.getFullYear();
//             let date_present = year +  month  + date

//             let date_yt = new Date(yt)
//             let dateyt = ("0"+date_yt.getDate()).slice(-2);
//             let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
//             let year_yt = date_yt.getFullYear();

//             let date_yesterday = year_yt  + month_yt  + dateyt
//             let aDate =  date_yesterday 
//             const aDataType = 'Nav'
//             console.log(aDate)
//             // aDate = '20220811' //20220812
//             getFundConnExportFile( aDate, aDataType, function(afileData){
//                 //res.json(afileData);  
//                 console.log("afileData:"+afileData);
//                 if (afileData != false) {
//                         callImportjob( aDataType,afileData, function(x){
//                             //res.json(x);    
//                         });
//                     //res.json(afileData);
//                 } else { 
                    
//                     //res.json("no data");
//                 } 
//             });
//           //  res.json("sucess"); 
        
//         }, 1000);
        
//     });
// });

cron.schedule('00 21 * * 1-5', () => {
    // follow up by NCL 2022-10-03 
    const promise = new Promise(function(myResolve, myReject) {
        myResolve(isLogin())
    });

    promise.then(function() {
        //res.json('success');
        setTimeout(function(){ 
            const today = new Date()
            const yesterday = new Date(today)
            let yt
            //---- if today = monday must get File of Friday     
            var chek_day = today.getDay();
            if (chek_day === 1){ 
                yt = yesterday.setDate(yesterday.getDate()-3) 
            }else{
                yt = yesterday.setDate(yesterday.getDate()-1) 
            }             
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

            let date_yesterday = year_yt  + month_yt  + dateyt
            let aDate =  date_yesterday 
            const aDataType = 'Nav'
            console.log(aDate)
            // aDate = '20220811' //20220812
            getFundConnExportFile( aDate, aDataType, function(afileData){
                //res.json(afileData);  
                console.log("afileData:"+afileData);
                if (afileData != false) {
                        callImportjob( aDataType,afileData, function(x){
                            //res.json(x);    
                        });
                    //res.json(afileData);
                } else { 
                        //res.json("no data");
                } 
            });
          //  res.json("sucess"); 
        
        }, 1000);
        
    });
});

app.listen(5000, () => {
    console.log('Listening fundconn on port 5000');
});


