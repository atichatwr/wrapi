
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
    callImportQueryOrder,
    importCenCustomer
    
} from './dbCenterImport.js';

import {
    setCredentUpdate,
    setCredentQuestionaire
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
    putDataFileApi,
    importCenCustomerId  
} from './dbCenterImport.js';
//*******[Best 2020 06 20] */
import {
    
    SelectTransactionWaiting,
    ImportTransactionWaiting
} from './tranwait.js'
//****[Best 2022 06 22 ] */
import { SelectTransactionAllot,ImportTransactionAllot} from './tranallot.js'
//****[Best 2022 06 22] */
import { SelectFundProfile,ImportFund} from './FundProfile.js'
//--------
import {ImportDataSuit, selectDataSuit,GetDataSuit} from './kyc.js'
import {SelectDataAccount,selectDataAccountaddr ,checkAccountinfo ,importDataAccountaddr ,SelectDataAccountbyID ,selectDataAccountaddrbyID} from './accountInfo.js'
import {getDataTransaction ,importDataTransaction} from './transaction.js'
import {selctDataOrderQuery ,impoertOrderQuery ,checkDataOrderInquiry,SelectSwitchOut ,updataSwitchOut , checkDataDupOrderInquiry} from './orderquery.js'
import {selectDataHoliday ,checkDataHoliday, selectDataTrandCalendar ,selectREFHoliday} from './fundholiday.js'
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
router.route('/callupdateSwitchOut').post((req,res)=>{
// setTimeout(function() {
    SelectSwitchOut(  (datarowsx)=>{
        // console.dir("data switch " + datarows)
          updataSwitchOut(datarowsx) 
    }) 
    // }, 4000);
})
//------------------------------------2rd----------
router.route('/callImportCustomer').post( (req,res) => {
    //console.log("check data->");
    //console.time()
    // console.dir(req.body.result);
    var datajs = req.body;
    importCenCustomer(datajs, function(x){
        res.json(x);
    });
    //console.timeEnd()
});
router.route('/callImportCustomerId').post( (req,res) => {

    var datajs = req.body;
    importCenCustomerId(datajs, function(x ,cardNo  ){

        SelectDataAccountbyID(cardNo , function(data){   
            // res.json(result)  
            checkAccountinfo(data ,function(text){
                res.json(text)
                //console.log(text)
                selectDataAccountaddrbyID(cardNo ,function(dataid){
                    setTimeout(() => {
                            importDataAccountaddr(dataid)
                    }, 2000);
               
                })

                
            })
        })
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
    // setTimeout(function(){ 
        callImportJobs(jobName,dataFile,  (x)=>{
                res.json(x);
        });

        if(jobName === "AllottedTransactions"){
            setTimeout(() => {
                SelectSwitchOut(  (datarows)=>{
                    updataSwitchOut(datarows) 
                }) 
            }, 6000);
        }
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

//**[Best] */
router.route('/callputDataFileApi').post((req,res) => {
    const data = req.body
    putDataFileApi(data, (x)=>{
        res.json(x)
    })

})
// router.route('/test1').get( (req,res) => {
//     //console.log("/test111");
//     test2json().then ( result => {
//         res.json(result);    
//     })
    
// });


// router.route('/test3').get( (req,res) => {
    
//     test3json().then ( result => {
//         res.json(result);    
//     });
    
// });

router.route('/getExcelIndividual/:id').get( (req,res) => {
    
    getExcelIndividual(req.params.id, function( data ){
        
        res.json(data);
    });
    
});

router.route('/setCredentUpdate').post( ( req,res) => {

    const txid = req.body.txid;
    const new_status = req.body.new_status;
    const email = req.body.email;
    const cardId = req.body.cardno

    setCredentUpdate(txid, new_status, email,cardId, function(result) {
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
        //res.json(result);
       // SelectFundId(result,function(datas){
            res.json(datas);
            CheckNavTable(datas , function(datarows){
             //   importNavTable(datarows , function(x){res.json(x)}); 
            });      
       // });
    });
});

router.route('/ImportTransactionWaiting').post((req,res)=>{
    SelectTransactionWaiting((result)=>{
       res.json(result)
        //setTimeout(() => {
            ImportTransactionWaiting(result ,function(x){
                 res.json(x)
            })
        //}, 3000);
       
    })
   
})
router.route('/ImportTransactionAllot').post((req,res) =>{
    SelectTransactionAllot((result)=>{
        
        if (result != false){
            ImportTransactionAllot(result,function(x){
                res.json(x)

            });
        }else{
            res.json("not found Transacction Allot")
        }
       
    })

})

router.route('/ImportFundProfile').post((req,res) =>{
   
    SelectFundProfile((result)=>{
        res.json(result)
        
        if (result != false){
            // ImportFund(result,function(x){
            //    // res.json(x)
            //  });
        }
    })

})

router.route('/ImportKYCSuit').post((req,res)=> {

    selectDataSuit((result)=>{
        //res.json(result)
        GetDataSuit(result ,function(datas){
            res.json(datas);
            ImportDataSuit(datas ,function(x){
               // res.json(x)
            })
        })
    })


})

router.route('/ImportAccoutInfo').post((req,res)=>{
    //console.log("Account info")
    // res.json("Account Info")
    SelectDataAccount((result)=>{   
        res.json(result)  
        checkAccountinfo(result ,(x=>{
            // res.json(result)
        }))
    })
})

router.route('/ImportTransaction').post((req,res)=>{
    getDataTransaction((result)=>{
        res.json(result)
        importDataTransaction(result)
    })
})
router.route('/ImportAccountAddr').post((req,res)=>{
    selectDataAccountaddr((result)=>{
        res.json(result)
        importDataAccountaddr(result)
    })
})
router.route('/ImportAccountAddrbyID').post((req,res)=>{
    let id = res.body.cardNumber
    selectDataAccountaddrbyID(id , (result)=>{
        res.json(result)
        importDataAccountaddr(result)
    })
})

router.route('/ImportDataQuery').post((req,res)=>{ 
    selctDataOrderQuery((result)=>{
        // res.json(result)
         checkDataOrderInquiry(result, (datas)=>{
        //checkDataDupOrderInquiry(result, (datas)=>{
            // res.json("xxxxx")
            // console.log(datas)
           impoertOrderQuery(datas)
        })
        
    })
})
router.route('/ImportDataHoliday').post((req,res)=>{
    selectDataHoliday((result)=>{ 
        res.json(result) 
        checkDataHoliday(result)
    })
})
cron.schedule('53 13 * * *', () => {
   // console.time()
     //----Check table Fund_Cen_NAV  after api import
    // selectNavTable(function(result){
    //     // res.json(result);
    //     SelectFundId(result,function(datas){
    //       //   res.json(datas);
    //         CheckNavTable(datas , function(datarows){
    //             importNavTable(datarows , function(x){res.json(x)});
    //         });
    //     });
    // });
   // console.timeEnd()
  });


app.listen(5055, () => {
    console.log ('Listening Wealth Core DB on port 5055');
});
