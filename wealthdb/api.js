
import express from 'express';
import cors from 'cors';

import {
        StatusUpdate,
        setErrorLog,
        getDateYesterday,
        StatusUpdateExcel,
        setUpdateIndividualAccoutCODE
        }    
        from './dbutils.js';

import {
        test2json,
        getIndividualAccount,
        getIndividualBankAccount,
        getIndividualBankAccountX1,
        getCardIdLoop,
        getExcelIndividualLoop,
        getIndividualId_LoopBy
        } from './dbsrv.js';



import {

        test3json,
        getExcelIndividual
    } from './dbExceImport.js';

import {
    setIndividualProfile,
    callImportJobs,
    importOrderInquiry,
    callImportJobs2,
    callImportQueryOrder2,
    importOrderInquiry2
    
} from './dbCenterImport.js';

import {
    setCredentUpdate,
    setCredentQuestionaire,
    getUnitholderAll
} from './dbCredent.js';

//------ 17 - 05 -22
import {
    importcustomer,
    selectNavTable,
    SelectFundId,
    importError,
    CheckNavTable,
    importNavTable,
    truncateTable,
    selectParmFundcode,
    selectParmFundcodeGroup,
    getFundPerformanceGroup,
    getFundPerformance,
    selectFundidtoNav,
    getAPIDataNav
    ,DataNavLog  
} from './dbCenterImport.js';

//--------
import cron from 'node-cron'

const app = express();
const router = express.Router();

app.use(express.json());
app.use(cors());
app.use('/api', router);


router.use((req,res,next) => {
    console.log('Middleware:WealthDB');!
    next();
});


router.route('/individualAccout/:id').get( (req,res) => {
    
    getIndividualAccount(req.params.id, function( data ){
        //JSON.stringify("");
        //res.json("");
        res.json(data);
    });
    
});


router.route('/individualBankAccout/:id').get( (req,res) => {
    getIndividualBankAccount(req.params.id, function( data ){
        res.json(data);
    });

});

router.route('/individualBankAccoutX1/:id').get( (req,res) => {
    getIndividualBankAccountX1(req.params.id, function( data ){
        res.json(data);
    });

});


router.route('/getIndividualIds_LoopBy/:sqlx').get( (req,res) => {
  
    getIndividualId_LoopBy( req.params.sqlx, function(data) {
        res.json(data);
        
    } );     

});
 

router.route('/getExcelIndividualLoop').get( (req,res) => {
  
    getExcelIndividualLoop( function(data) {
        res.json(data);
        
    } );

});


router.route('/getCardNoLoop').get( (req,res) => {
  
    getCardIdLoop( function(data) {
        res.json(data);
        
    } );

});

router.route('/setUpdateIndividualAccoutCODE').post( (req,res) => {
    const apiRef = req.body.apiRef;
    const apiDesc = req.body.apiDesc;
    setUpdateIndividualAccoutCODE(apiRef, apiDesc, function(result){
        console.log(result);
        res.json(result);
    });
});


router.route('/setStatusExcel').post( ( req,res) => {

    const  cardNumber = req.body.cardNumber;
    const  returnCode = req.body.returnCode;
    const  apiDesc    = req.body.apiDesc;
    StatusUpdateExcel(cardNumber,returnCode,apiDesc, function(result) {
        //console.log("result->api/setStatus")
        console.log(result);
        
        res.json(result);
    });
    
});

router.route('/setStatus').post( ( req,res) => {

    const  cardNumber = req.body.cardNumber;
    const  returnCode = req.body.returnCode;
    const  apiDesc    = req.body.apiDesc;
    StatusUpdate(cardNumber,returnCode,apiDesc, function(result) {
        console.log("result->api/setStatus")
        console.log(result);
        
        res.json(result);
    });
    
});

router.route('/setIndividualProfile').post( (req,res) => {
    const jdata = req.body;
    
 
    setIndividualProfile(jdata, function(result){
        console.log(" setIndividualProfile "+result);
        res.json(result);
    });
    

});

//callImportQueryOrder
router.route('/callImportQueryOrder').post( (req,res) => {
    //console.log("check data->");
    //console.dir(req.body.result);
    var datajs = req.body.result;
    importOrderInquiry(datajs, function(x){
        res.json(x);
    });
    
});

//------------------------------------2rd----------
router.route('/callImportQueryOrder2').post( (req,res) => {
    //console.log("check data->");
    //console.time()
    console.dir(req.body.result);
    var datajs = req.body;
    importOrderInquiry2(datajs, function(x){
        res.json(x);
    });
    //console.timeEnd()
});
//-----------------------------------[BEST 220615 ]-----------------
router.route('/callImportError').post( (req,res)=>{
    const cardNumber    = req.body.cardNumber
    const job           = req.body.job
    const db            = job
    importError(db,cardNumber,job)


})

router.route('/callImportJobs').post( (req,res) => {
    
    //console.dir(req);
    const dataFile = req.body.dataFile;
    const jobName  = req.body.jobName;
    console.log("api_datafil:"+dataFile);
    console.log("api_jobName:"+jobName);

    callImportJobs(jobName,dataFile, function(x){
        res.json(x);
    });
    
});

//-------------------------------------------------------------------
router.route('/callImportJobs2').post( (req,res) => {
    
    //console.dir(req);
    const dataFile = req.body.dataFile;
    const jobName  = req.body.jobName;
    console.log("api_datafil:"+dataFile);
    console.log("api_jobName:"+jobName);
    callImportJobs2(jobName,dataFile, function(x){
        res.json(x);
    });
    
});

router.route('/setErrorLog').post( (req,res) => {
    const endPoint = req.body.endPoint;
    const apiError = req.body.apiError;
    const apiDesc  = req.body.apiDesc;
    const apiRef   = req.body.apiRef;

    setErrorLog(apiRef, endPoint, apiError, apiDesc, function(result) {
        console.log("result->api/setErrorLog")
        console.log(result);
        res.json(result);

    });

});

router.route('/test1').get( (req,res) => {
    //console.log("/test111");
    test2json().then ( result => {
        res.json(result);    
    })
    
});


router.route('/test3').get( (req,res) => {
    
    test3json().then ( result => {
        res.json(result);    
    });
    
});

router.route('/getExcelIndividual/:id').get( (req,res) => {
    
    getExcelIndividual(req.params.id, function( data ){
        
        res.json(data);
    });
    
});

router.route('/setCredentUpdate').post( ( req,res) => {

    const txid          = req.body.txid;
    const new_status    = req.body.new_status;
    const email         = req.body.email;
    const cardId        = req.body.cardno;
    setCredentUpdate(txid, new_status, email, cardId, function(result) {
        //StatusUpdateExcel(cardNumber,returnCode,apiDesc, function(result) {
        //console.log("result->api/setStatus")
        console.log(result);
        
        res.json(result);
    });
    
});

//---------------------------best 
router.route('/setCredentupdateQuestionaire').post( (req,res) => {
    const data = req.body
    //console.log(req.body);
    setCredentQuestionaire(data , function(result){
        
    }); 
    
});

router.route('/dummyuniholder').post( (req,res) => {

});

router.route('/NavTable').post((req,res) =>{
    //----Check table Fund_Cen_NAV  after api import
    selectNavTable(function(result){
        // res.json(result);
        // SelectFundId(result,function(datas){
          //   res.json(datas);
            // CheckNavTable(datas , function(datarows){
                importNavTable(result , function(x){res.json(x)});
            // });     
        // });
    });
});
router.route('/getFundPerformance').post( (req,res) => {
    // req.body.fund_code
    // console.log(req.body)
    const fundconde = req.body.fund_code
    const Amccode   = req.body.Amccode
    selectParmFundcode(fundconde,Amccode ,(rest)=>{
        res.json(rest)
        // getFundPerformance(rest ,  (result)=>{
        //     // res.json(JSON.parse('{"status": "200" ,"datas" :"dataa"}'))
        //     res.json(result)
        // }) 
    })
    
    
})
router.route('/getFundPerformanceGroup').post( (req,res) => {
    // req.body.fund_code
    // console.log(req.body)
    const fundGroup = req.body.fundGroup
    // const Amccode   = req.body.Amccode
    selectParmFundcodeGroup(fundGroup ,(result)=>{
        res.json(result)
        // console.log(fundGroup)
        // getFundPerformanceGroup(rest ,  (result)=>{
        //     // res.json(JSON.parse('{"status": "200" ,"datas" :"dataa"}'))
        //     res.json(result)
        // })
    })
    
    
})
router.route('/getFundDataNav').post( (req,res) => {
    // req.body.fund_code
    // console.log(req.body)
    const fundCode = req.body.fund_code
    const Amccode   = req.body.Amccode
//    console.log(Amccode)
    selectFundidtoNav(fundCode,Amccode, (datarows) =>{
        // console.log(amcid)
        // getAPIDataNav(fundid,amcid, (datarows) =>{
           res.json(datarows)
        // })

    })
})
//  NCL CALL  data unitholder all  10 - 11 - 2022
router.route('/getUnitholderAll').post(  (req,res) => { 
    const accountid = req.body.accountid
        getUnitholderAll(accountid, (datarows) =>{ 
            res.json(datarows)
        })

})

// IT Request 230204
router.route('/DataNavLog').post((req,res)=>{
    DataNavLog(function(x){
        res.json(x)
    })
})

router.route('/callSingon').post((req,res)=>{
    // console.log(req.body)
    GetSingon(req.body , ()=>{

    })
    res.json('SUCCESS')
})

router.route('/calltransactionreconcile').post((req,res)=>{
    
})
//DataNavLog

//------------------------------------2rd----------
// router.route('/callImportCustomers').post( (req,res) => {
//     //console.log("check data->");
//     console.log(req.body);
//     //var datajs = req.body;
//     // ImportCustomers(datajs, function(x){
//     //     res.json(x);
//     // });
    
// });

//cron.schedule('50 21 * * 5', () => {
   // console.time()
     //----Check table Fund_Cen_NAV  after api import
    // selectNavTable(function(result){
    //     // res.json(result);
    //     SelectFundId(result,function(datas){
    //       //   res.json(datas);
    //         CheckNavTable(datas , function(datarows){
    //             importNavTable(datarows , function(x){ 
    //                // res.json(x)
    //             });
    //         });
    //     });
    // });
   // console.timeEnd()
// });


app.listen(5050, () => {
    console.log ('Listening Wealth DB on port 5050');
});
