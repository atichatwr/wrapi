import express from 'express';
import cors from 'cors';
import fs from 'fs'
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
    importCenCustomerId,
    checkunibalanceupdate ,
    updateDipchipForAccount 
    ,selectdataprepareunitbalance
    ,setdataprepareunitbalance
    ,setmtfsaccountamcnull
    ,findRefNoToAdd
    ,reportOutstanding
    ,importMFTSDividendNews
    ,getDivedend
    ,DataFundPerformance
    ,dataNCLFundPerformance
    ,getDataSentReportUnitBalance
    ,UpdateStatusSendReportUnitBalance
    ,getDataTexSaving
} from './dbCenterImport.js';
//*******[Best 2020 06 20] */
import {
    
    SelectTransactionWaiting,
    ImportTransactionWaiting,
    UpdateUnitBalance
} from './tranwait.js'
//****[Best 2022 06 22 ] */
import { SelectTransactionAllot,ImportTransactionAllot} from './tranallot.js'
//****[Best 2022 06 22] */
import { SelectFundProfile,ImportFund,checkfundid ,selectDataAmcToFund ,prepareFundprofile} from './FundProfile.js'
//--------
import {ImportDataSuit, selectDataSuit,GetDataSuit} from './kyc.js'
import {SelectDataAccount,selectDataAccountaddr ,checkAccountinfo ,importDataAccountaddr ,SelectDataAccountbyID ,selectDataAccountaddrbyID ,getdataaccoutngroup ,selectaccouttomail ,callsendmail ,updatesendmail , callgroupsendmail,migrateAccountNdid } from './accountinfo.js'
import {getDataTransaction ,importDataTransaction, checktounitholder,UpdateUnitBalancenull, checkseqnotoupdate, importDataTransaction_manul,traansctionkeymanual
        ,getDataWaitingForUnitbalance, selectUnitbalance ,getDataTransactiondate,logDataTransactiondate,getDataReconcile ,sendmailReconcile ,dataTrantolog,fixDatatranavg,datareconcileavg, averagCostdiff ,totalcostdev ,prepaireAccount ,callUSP_MFTS_RECAL_COSTAVG, DailyImportSumAllot,cusHolderLevel ,TranpaymentType ,updateTranIDForKeyManul} from './transaction.js'
import {selctDataOrderQuery ,impoertOrderQuery ,checkDataOrderInquiry,SelectSwitchOut ,updataSwitchOut , checkDataDupOrderInquiry ,checkRefno,importmftsaccount,chkCenOrderdup} from './orderquery.js'
import {selectDataHoliday ,checkDataHoliday, selectDataTrandCalendar ,selectREFHoliday,importAllHoliday} from './fundholiday.js'
import {genpdf ,selectaccountToPdf,pdfshowDataform , pdfgroupshowDataform, selectaccountToPdfbyid,DeleteFileHoldingReport} from './genpdf.js'
import cron from 'node-cron'
import { exec } from 'child_process';
import { error } from 'console';
import { stderr, stdout } from 'process'; 
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
    // console.dir(req.body.result);
    var datajs = req.body.result;
    importOrderInquiry(datajs, function(x){
        res.json(x);
    });
});

/* 2022-09-26 Fix caldata orderinqury */
router.route('/calltruncateTable').post( (req,res) => {
    // console.log("check data->");
    // console.log(req.body.dataFile);
    var datajs = req.body.dataFile;
    truncateTable(datajs, function(x){
        // res.json(x);
    });
});


router.route('/callupdateSwitchOut').post((req,res)=>{
    console.log("call switch out")
// setTimeout(function() {
    // SelectSwitchOut(  (datarowsx)=>{
    //     // console.dir("data switch " + datarows)
    //       updataSwitchOut(datarowsx) 
    // }) 
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
            res.json(result)  
            checkAccountinfo(data ,function(text){
                // res.json(text)
                //console.log(text)
                selectDataAccountaddrbyID(cardNo ,function(dataid){
                    //console.log('xxxx')
                    setTimeout(() => {
                            importDataAccountaddr(dataid)
                    }, 6000);
               
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
    
    // console.dir(req);
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
        // res.json(result)
        
        if (result != false){
            ImportFund(result,function(x){
               res.json(x)
             });
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
    // console.log("Account info")
    // res.json("Account Info")
    SelectDataAccount((result)=>{   
        res.json(result)  
        checkAccountinfo(result ,(x=>{
            // res.json(result)
        }))
    })
})


router.route('/ImportTransaction').post((req,res)=>{
    
    checktounitholder((resut)=>{
        UpdateUnitBalancenull(resut)
    })
    // setTimeout(() => {
    //     getDataWaitingForUnitbalance( function(datas){
    //          selectUnitbalance(datas)
    //     })
    // }, 2000);
    setTimeout(() => {
        getDataTransaction((result)=>{
            res.json(result)
            importDataTransaction(result)
        }) 
    }, 5000);

    // check null seq 2022-09-19
    setTimeout(() => {
        getDataTransaction((resultx)=>{
            // res.json(result)
            checkseqnotoupdate(resultx)
        }) 
       
    }, 20000);
    
})
// ซ่อมข้อมูล เวลา ทรานไม่เข้า
router.route('/ImportTransactionMannul').post((req,res)=>{

    // setTimeout(() => {
        getDataTransaction((result)=>{
            res.json(result)
            importDataTransaction_manul(result)
        }) 
    // }, 5000);

    // check null seq 2022-09-19
    
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
    // check api dup data 
    setTimeout(() => {
        selctDataOrderQuery((result)=>{
            chkCenOrderdup(result)
        }) 
    }, 2000);

    checkRefno((resultx)=>{
        importmftsaccount(resultx)
    }) 
    // check ref no null and insert mtfs account
    //---- 2022-09-28
    setTimeout(() => {
        selctDataOrderQuery((result)=>{
            // fix for switchin 
            checkDataDupOrderInquiry(result, (datas)=>{ // ส่วนที่นำเข้า transaction
                res.json(datas)
            })
        })
    }, 5000);
       
    // setTimeout(() => {
    //     SelectSwitchOut(  (datarows)=>{
    //         updataSwitchOut(datarows)
    //     }) 
    // }, 7000);
})
router.route('/ImportDataHoliday').post((req,res)=>{
    // selectDataHoliday((result)=>{ 
    //     res.json(result) 
    //      checkDataHoliday(result) 
    // })
    importAllHoliday(function(x){
        res.json(x)
    })
})
cron.schedule('30 08 * * 1-5', () => {
    // update key manul to status 9  2022-10-06
    traansctionkeymanual((result)=>{
        // res.json(result)
    })
  });

//TEST by best
cron.schedule('04 14 * * 1-5', () => {
    // undate key manul to status 9  2022-10-06
    // getdataaccoutngroup(function(result){
    //     selectaccouttomail(result)
    // })
    // }) 
  });
  router.route('/GenPDFCustomer').post((req,res)=>{
    selectaccountToPdf((result)=>{
        genpdf(result)
         res.json(result)
    })
    

})
router.route('/callaccountmail').post((req,res)=>{
    pdfshowDataform((result)=>{ 
        res.json(result)
    })

})

// open account pdf
router.route('/callsendmailpdf').post((req,res)=>{
    const data = req.body.dataFile
    const mail = req.body.mail
    // res.json (mail+ data)
    callsendmail(mail,data , (x)=>{
        
        if(x === 'success'){
            // setTimeout(() => {
            //   updatesendmail(data)  
            // }, 12000);
            updatesendmail(data)  
            res.json(x)
        }
    }) 

})
// consent  mail 
router.route('/emailacount').post((req,res)=>{
    getdataaccoutngroup(function(result){
        res.json(result)
        // console.log(result)
        selectaccouttomail(result)
    })
})

router.route('/callgrouppdf').post((req,res)=>{
    pdfgroupshowDataform((result)=>{ 
        res.json(result)
    })

})
router.route('/callcheckunibalanceupdate').post((req,res)=>{
    checkunibalanceupdate((result)=>{ 
        res.json(result)
    })

})
router.route('/getdatatransactiondate').post((req,res)=>{
    getDataTransactiondate((result)=>{
        res.json(result)
        //logDataTransactiondate(result)
    })
})
router.route('/callgenpdfbyid').post((req,res)=>{
    const data = req.body.custcode
    // console.log(data)
    const today                 = new Date()
    let date_ob                 = new Date(today);
    let date                    = ("0"+date_ob.getDate()).slice(-2); 
    let month                   = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year                    = date_ob.getFullYear();
    let timestampx = year +"-"+  month  +"-"+ date //+ "00:00:00.000"
    selectaccountToPdfbyid(data,(result)=>{
        // console.log(result)
        genpdf(result,(filename)=>{
            // console.log(filename)
            res.json(filename)
            // res.sendFile('C:\\WR\\fundcon\\'+timestampx +'\\'+ filename+'.pdf')
            // var options = {
            //     root: 'C:\\WR\\fundcon\\'+timestampx +'\\'
            // };
            // filename = filename+'.pdf'
            // console.log(filename)
            // res.sendFile(filename, options, function (err) {
            //     if (err) {
            //         next(err);
            //     } else {
            //         console.log('Sent:', filename);
            //     }
            // });
        })
         
    })
})
router.route('/callsendgroupmailpdf').post((req,res)=>{
    const datarows = req.body 

    callgroupsendmail(datarows ,(x)=>{
        res.json(x)
    })

})
router.route('/callupdatedipchip').post((req,res)=>{
    
    
    updateDipchipForAccount(req.body , function(result){
        // res.json(res.data)
    })   
})
router.route('/prepareaccount').post((req,res)=>{
    //prepare account   , update unitholder id
    
})

//---- 2023-01-06 เตรียม Data ก่อน allot 
router.route('/prepareunitbalance').post((req,res)=>{
    //prepare account  , update unitholder id
        //get data cen_ allot , cen_unitbalace
    // selectdataprepareunitbalance(function(data){
    //     //update account
    //     setdatapreparmftsaccount(data,function(x){
    //         res.json(x)
    //     })
    // })
    //prepare unit balance  
    // setTimeout(() => {
        //Case Ref_no null
        selectdataprepareunitbalance(function(datas){
            //find ref_no null => inset ref_no  mfts_account
             findRefNoToAdd(datas, function(x){
                if(x== 1){
                    // console.log("ddsdsdsd")
                    selectdataprepareunitbalance(function(datarows){
            
                        setdataprepareunitbalance(datarows,function(x){
                            res.json(x)
                        })
                    })
                }else{
                    // console.log("ddsdsdsd")
                    // selectdataprepareunitbalance(function(datas){
            
                        setdataprepareunitbalance(datas,function(x){
                            res.json(x)
                        })
                    // })
                }
             })
        })
        //
        
    //   }, 7000);
    
})
// add fund by code 2023-01-12
router.route('/callImportFundcode').post((req,res)=>{
    const fundcode = req.body.fundcode 
     
    //  res.json(fundcode)
     setTimeout(() => {
        checkfundid(fundcode,(x,datas)=>{
            console.log(x)
            // console.log(datas)
            if(x == 1){
               //insert
            //    console.log(datas)
              ImportFund(datas, function(text){
                res.json(text)
              })
              
           }else{
            res.json(fundcode)
           } 
        })
     }, 3000);
})
// add fund by AMC 2023-01-12
router.route('/callImportGetAllFund').post((req,res)=>{
    const amcCode = req.body.fundcode 
    console.log(amcCode)
    selectDataAmcToFund(amcCode ,(datas)=>{
        ImportFund(datas, function(text){
            res.json(text)
          })
    })
})
router.route('/callReconciletran').post((req,res)=>{
    // data api  transaction
    // data tran allot
    getDataReconcile(function(txtapi){
        sendmailReconcile(txtapi)
        //console.log(txtapi)
        res.json(txtapi)
    })

})
router.route('/getDatatrantolog').post((req,res)=>{
    getDataTransactiondate((result)=>{
        dataTrantolog(result)
    })
})
router.route('/fixDatatranavg').post((req,res)=>{
    fixDatatranavg((datas=>{
        // console.log(datas)
        res.json(datas)
    }))
    // datareconcileavg((datas=>{
    //     res.json(datas)
    // }))
})
router.route('/averagCostdiff').post((req,res)=>{
    // averagCostdiff(1000,"M00000000285",236,(x)=>{
    //     res.json(x)
    // })
    totalcostdev("M00000000285",236,(x)=>{
        res.json(x)
    })
    //totalcostdev
})
router.route('/prepaireAccount').post((req,res)=>{
    prepaireAccount((x)=>{
        res.json("done")
    })
})
//request 230202
router.route('/recal_costavg').post((req,res)=>{
    callUSP_MFTS_RECAL_COSTAVG(function(x){
        res.json("done")
    })
})
//IT request 230209
router.route('/prepareFundprofile').post((req,res)=>{
    
        prepareFundprofile( function(x){
            res.json(x)
            // run nav table
            getNavTable(function(y){

            })
        })
})
//IT Request 230207
router.route('/ImportSumAllotDaliy').post((req,res)=>{
    DailyImportSumAllot(function(x){  
        res.json(x)
     })
})
//IT Request 230208
router.route('/cusHolderLevel').post((req,res)=>{
    getDataTransactiondate((result)=>{
        cusHolderLevel(result,function(x){
            res.json(x)
        })
    })
    
})
router.route('/insertAccount_manul').post((req,res)=>{
    let cardNo = '1909802410632'
    SelectDataAccountbyID(cardNo , function(data){   
        res.json(data)  
        checkAccountinfo(data ,function(text){
            // res.json(text)
            //console.log(text)
            // selectDataAccountaddrbyID(cardNo ,function(dataid){
            //     //console.log('xxxx')
            //     setTimeout(() => {
            //             importDataAccountaddr(dataid)
            //     }, 6000);
           
            // })

            
        })
    })
})
router.route('/reportOutstanding').post((req,res)=>{
    reportOutstanding(function(x){
        res.json(x)
    })

})
router.route('/calltransactionreconcile').post((req,res)=>{
    getDataReconcile(function(txtapi){
        res.json(txtapi)
    })
})
router.route('/TranpaymentType').post((req,res)=>{
    TranpaymentType(function(result){
        res.json(result)
    })
})

router.route('/updateTranIDForKeyManul').post((req,res)=>{
    //console.log("updateTranIDForKeyManul")
    updateTranIDForKeyManul(function(result){
        res.json(result)
    })
})

router.route('/migrateAccountNdid').post((req,res)=>{
    migrateAccountNdid(function(result){
        res.json(result)
    })
})
router.route('/importMFTSDividendNews').post((req,res)=>{

    importMFTSDividendNews((result)=>{
        res.json(result)
    })
})
router.route('/divedendInquiry').post((req,res)=>{
    getDivedend( (x)=>{
        res.json(x);
    })
})
router.route('/GenReportTexSaving').post( async(req,res)=>{
    let DATA_ROW = ''
    await getDataSentReportTexSaving((DATAS)=>{
        DATA_ROW = DATAS
    })

    if(DATA_ROW){
        
    }
})
router.route('/GenReportUnitBalance').post( async(req,res)=>{
     //=  req.body.cardNo
      //=  req.body.email
     let DATA_ROW = ''
     await getDataSentReportUnitBalance( (DATAS)=>{
        DATA_ROW = DATAS
        // console.log(DATAS)
     })
     
     if(DATA_ROW){
        for (const key in DATA_ROW) {
            let cardNo           = DATA_ROW[key].accountId
            let email            = DATA_ROW[key].Email

            exec(`node reportUnitbalance.js ${cardNo} ${email}`,(error,stdout,stderr)=>{
                if(error){
                    console.log('reportUnitbalance Error')
                    return res.status(500).json('Report Unit balance Error GenPdf')
                }else{
                    console.log('reportUnitbalance SUCESS')
                   // return res.status(200).json('Report Unit balance GenPdf SUCESS')
                }
            })
        }
        //console.log(cardNo + " "+ email)
        return res.status(200).json('Report Unit balance GenPdf SUCESS')
    }
    return res.status(200).json('Report Unit balance Job Not Fund')
})
router.route('/genReportTexSavingBuy').post( async(req,res)=>{
    let DATA_ROW = ''
    await getDataTexSaving( (DATAS)=>{
        DATA_ROW =DATAS
    })
      console.log(DATA_ROW)
    if(DATA_ROW){
        for (const key in DATA_ROW) {
            let cardNo      = DATA_ROW[key].accountId
            let email       = DATA_ROW[key].Email
            let edate     = DATA_ROW[key].EndDate
            let sdate     = DATA_ROW[key].StartDate
            let year
            let bdate = new Date(edate);
            let bday = bdate.getDate().toString().padStart(2, '0');
            let bmonth = (bdate.getMonth() + 1).toString().padStart(2, '0');
            let byear = bdate.getFullYear().toString();
            edate = `${byear}-${bmonth}-${bday}`;

            bdate = new Date(sdate);
            bday = bdate.getDate().toString().padStart(2, '0');
            bmonth = (bdate.getMonth() + 1).toString().padStart(2, '0');
            byear = bdate.getFullYear().toString();
            year = byear
            sdate = `${byear}-${bmonth}-${bday}`;
            console.log(year +sdate+edate)
            exec(`node texSavingBuy.js ${cardNo} ${edate} ${sdate} ${email} ${year}`,(error,stdout,stderr)=>{
                if(error){
                    console.log('report tex Saving Error')
                    return res.status(500).json('report tex Saving Error GenPdf')
                }else{
                    console.log('report tex Saving SUCESS')
                    // return res.status(200).json('Report Unit balance GenPdf SUCESS')
                }
            })
        }
        //console.log(cardNo + " "+ email)
        return res.status(200).json('Report tex Saving GenPdf SUCESS')
    }
    return res.status(200).json('Report tex Saving Not Fund')

});

router.route('/DeleteFileHoldingReport').post( (req,res)=>{
    DeleteFileHoldingReport() 
     
} )
router.route('/DataFundPerformance').post((req,res)=>{
    DataFundPerformance(function(x){
        res.json(x)
    })
})
router.route('/dataNCLFundPerformance').post((req,res)=>{
    dataNCLFundPerformance(function(x){
        res.json(x)
    })
    // res.json('dataNCLFundPerformance')
})

// cron.schedule('00 19 * * 1-5', () => {
//     // update mfts_account amc null  2023-01-5
    
//         setmtfsaccountamcnull(result)
    
//     // }) 
//   });
// cron.schedule('00 06 * * 1-5',()=>{
//     prepaireAccount()
// })
app.listen(5055, () => {
    console.log ('Listening Wealth Core DB on port 5055');
});
