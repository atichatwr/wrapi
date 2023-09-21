
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

import {
    setExcelIndividual,
    updateExcelIndividual,
    runIndividualExcelLoop,
    runIdividualUpdateFundCenLoop,
    runIndividualAccountUpdateLoop
} from './funconExcel.js';

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
    callupdateSwitchOut,
    callImportTransaction,
    calltruncateTable,
    callcheckunibalanceupdate
    , calldatatransaction
    , callprepareunitbalance
    , callImportTransactionAllot
    , callImportFundbycode
    , callImportGetAllFund
    , callImportTransactionMannul
    , callFuncReconcileTran
    , callgetDatatrantolog
    , callclonetranallot
    , callImportFundProfile
    , callPrepareFundProfile
    , callSumAllotDaliy
    , callApiSms
    ,callGenReportTexSavingBuyMobile
} from './funconPipe.js';


import { getDateYesterday, isLogin, getNextDate } from './wealthutil.js';

//-------------------------------------------------------------Dummy Unit Holder by Thanit
import { dummyUnitHolder, dummyUnitHolder2 } from './funconExtend.js';

// import {dummy} from './dummy.html';

import cron from 'node-cron'
import schedule from 'node-schedule';

const app = express();
const router = express.Router();

app.use(express.json());
app.use(cors());
app.use('/api', router);

app.use(bodyParser.urlencoded({ extended: false }));

router.use((req, res, next) => {
    console.log('FunconnSrv:Middleware');
    next();
});

router.route('/login').get((req, res) => {
    getLogin();

    res.json("Login Success");

});

router.route('/ExcelIndividual/:id').get((req, res) => {

    setExcelIndividual(req.params.id, function (x) {
        res.json(x);
    });

});

router.route('/ExcelIndividualPut/:id').get((req, res) => {

    updateExcelIndividual(req.params.id, function (x) {
        res.json(x);
    });

});


router.route('/individual/:id').get((req, res) => {

    setIndividualx(req.params.id, function (x) {
        res.json(x);
    });

});

router.route('/individualPut/:id').get((req, res) => {

    putIndividualx(req.params.id, function (x) {
        res.json(x);
    });
});





router.route('/runIdividualUpdateFundCenLoop').get((req, res) => {
    isLogin();
    setTimeout(function () {
        runIdividualUpdateFundCenLoop(function (x) {
            res.json(x);
        });

    }, 10000);


});


router.route('/individualExcelLoop').get((req, res) => {
    isLogin();
    setTimeout(function () {
        runIndividualExcelLoop(function (x) {
            res.json(x);
        });

    }, 12000);


});


router.route('/runIdividualUpdateAccountLoop').get((req, res) => {
    isLogin();
    setTimeout(function () {
        runIndividualAccountUpdateLoop(function (x) {
            res.json(x);
        });

    }, 12000);


});

//---

router.route('/individualAccount/:id').get((req, res) => {

    setIndividualAccountX1(req.params.id, function (x) {
        res.json(x);
    });

});

router.route('/individualAccountPut/:id').get((req, res) => {

    putIndividualAccount(req.params.id, function (x) {
        res.json(x);
    });
});

router.route('/individualProfileLoop').get((req, res) => {

    runIndividualProfileLoop(function (x) {
        res.json(x);
    });
});

//---
/*
router.route('/chkToken').get ( (req,res) => {
    res.json(funncon.getAccessTocken());
});
*/


router.route('/unzipTest').get((req, res) => {
    getExportZipFile();
    res.json("ok");

});

router.route('/getIndividualAccount/:id').get((req, res) => {

    //getIndividualAccount(req.params.id, function(x){
    impIndividualAccount(req.params.id, function (x) {
        res.json(x);
    });
});

router.route('/getFundConnIndividualProfile/:id').get((req, res) => {

    getFundConnIndividualProfile(req.params.id, function (x) {
        res.json(x);
    });
});

router.route('/getFundConnFundMapping').get((req, res) => {
    const afileType = 'FundMapping';
    const aDate = getDateYesterday();


    getFundConnExportFile(aDate, afileType, function (x) {
        res.json(x);
    });
});

router.route('/getFundConnFundProfile').get((req, res) => {
    const afileType = 'FundProfile';
    const aDate = getDateYesterday();


    getFundConnExportFile(aDate, afileType, function (x) {
        res.json(x);
    });
});

router.route('/getFundConnFundHoliday').get((req, res) => {
    const afileType = 'FundHoliday';
    const aDate = getDateYesterday();


    getFundConnExportFile(aDate, afileType, function (x) {
        res.json(x);
    });
});

router.route('/getFundConnSwitchingMatrix').get((req, res) => {
    const afileType = 'SwitchingMatrix';
    const aDate = getDateYesterday();


    getFundConnExportFile(aDate, afileType, function (x) {
        res.json(x);
    });
});

router.route('/getFundConnData/:dataType').get((req, res) => {
    const aDate = getDateYesterday();
    const aDataType = req.params.dataType;
    isLogin();
    getFundConnExportFile(aDate, aDataType, function (afileData) {

        console.log("afileData:" + afileData);
        console.log("aDataType:" + aDataType);
        callImportjob(aDataType, afileData, function (x) {
            res.json(x);
        });

    });

});

router.route('/getFundOrderInquiry').get((req, res) => {
    let aDate = getDateYesterday();
    // console.log("aDate:"+aDate);
    aDate = '20220222'
    getFundOrderInquiry(aDate, function (x) {

        callImportQueryOrder(x, function (y) {
            res.json(y);
        });


    });
});

//** 19 08 2022 */
router.route('.callImportNotWorkingday').get((req, res) => {
    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())

    });
    promise.then(function () {
        let datenow
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year + month + date
        setTimeout(function () {
            let aDate = getDateYesterday();
            // console.log("aDate:"+aDate);
            //aDate =  datenow// '20220809'
            const aDataType = "FundHoliday"// req.params.dataType;
            getFundConnExportFile(aDate, aDataType, function (afileData) {
                //res.json(afileData);  
                console.log("afileData:" + afileData);
                if (afileData != false) {
                    callImportjob(aDataType, afileData, function (x) {
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
router.route('/callImportOrderInquiry').get((req, res) => {
    const d = new Date();
    let hour = d.getHours();
    let minutes = d.getMinutes();
    // if(hour >  10 && hour < 14){
    //     res.json("ระบบกำลังประมวลผลอยู่ Order ช่วงเวลา 10.30 - 14.00 น" ); 
    //     return   
    // }
    // if(hour == 10){
    //     if(minutes > 30){
    //     res.json("ระบบกำลังประมวลผลอยู่ Order ช่วงเวลา 10.30 - 14.00 น" );
    //     return  
    //     } 
    // } 


    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())

    });
    promise.then(function () {
        let datenow
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year + month + date
        let nextday1 = getNextDate(1);
        let nextday2 = getNextDate(2);
        let nextday3 = getNextDate(3);
        let nextday4 = getNextDate(4);
        //service get เฉพาะ Effective Date
        //กรณีที่ วันปัจจุบันทำเสร็จแล้ว วน Loop ไปจะลบข้อมูลเก่าออกก่อนทุกครั้งเริ่มวันใหม่
        let loop_date = [datenow, nextday1, nextday2, nextday3, nextday4]
        //   loop_date =  ['20221202']
        //let aDate  = getDateYesterday();
        // call truncate data
        calltruncateTable('Fund_Cen_OrderInquiry')

        loop_date.forEach(async (date) => {
            setTimeout(function () {
                // console.log("aDate:"+date);
                //aDate = date //'20220822'
                getFundOrderInquiry(date, function (x) {

                    callImportQueryOrder(x, function (y) {
                        console.log(y)
                    });

                });
                //  res.json("sucess"); 

            }, 5000);
        });
        setTimeout(() => {
            callImportOrderInquiry()
        }, 15000);

        res.json(" Order inquiry   Imported  ON " + datenow);



    });


});

router.route('/callImportTransaction').get((req, res) => {

    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())

    });
    promise.then(function () {

        //---- if today = monday must get File of Friday     
        let datenow
        const today = new Date()
        const yesterday = new Date(today)
        let yt
        var chek_day = today.getDay();
        if (chek_day === 1) {
            yt = yesterday.setDate(yesterday.getDate() - 3)
        } else {
            yt = yesterday.setDate(yesterday.getDate() - 1)
        }

        let date_yt = new Date(yt)
        let dateyt = ("0" + date_yt.getDate()).slice(-2);
        let month_yt = ("0" + (date_yt.getMonth() + 1)).slice(-2);
        let year_yt = date_yt.getFullYear();
        let date_yesterday = year_yt + month_yt + dateyt


        let date_ob = new Date(today)
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year + month + date
        // fix user allot before uniholder not update 

        const d = new Date();
        let hour = d.getHours();
        let minutes = d.getMinutes();
        if (hour > 10 && hour < 14) {
            res.json("ระบบกำลังประมวลผลอยู่ Transction Allot ช่วงเวลา 10.30 - 14.00 น");
            return
        }
        if (hour == 10) {
            if (minutes > 30) {
                res.json("ระบบกำลังประมวลผลอยู่ Transction Allot ช่วงเวลา 10.30 - 14.00 น");
                return
            }
        }


        setTimeout(function () {
            // let aDate = getDateYesterday();
            let aDate = (chek_day === 1 ? date_yesterday : getDateYesterday())
            //aDate =  datenow// '20220809'
            const aDataType = "AllottedTransactions"// req.params.dataType;
            getFundConnExportFile(aDate, aDataType, function (afileData) {
                //res.json(afileData);  
                console.log("afileData:" + afileData);
                if (afileData != false) {
                    callImportjob(aDataType, afileData, function (x) {
                        // res.json("Import Transaction on Date "+ aDate + " ");

                    });
                    //res.json(afileData);
                } else {
                    res.json("no data on Date " + aDate);
                }
            });
            //  res.json("sucess"); 

        }, 1000);

        //-------- call select to import 
        setTimeout(() => {
            callImportTransaction()
        }, 2000);


    });
    setTimeout(() => {
        calldatatransaction(function (datarows) {
            let tagtable = ""
            let tagtd = ""
            let transactionId = null, id_card = null, status_api = null, status_wr = null, Fund_Id = null, Ref_No = null, Title_Name_T = null, First_Name_T = null
            let Last_Name_T = null, Confirm_Unit = null, UNITHOLDER_ID = null, AMC_CODE = null, FUND_CODE = null, mktid = null
            let i = 1
            for (const key in datarows) {
                transactionId = datarows[key].TRANSACTION_ID
                id_card = datarows[key].id_card
                status_api = datarows[key].status_api
                status_wr = datarows[key].status_wr
                Fund_Id = datarows[key].Fund_Id
                Ref_No = datarows[key].Ref_No
                Title_Name_T = datarows[key].Title_Name_T
                First_Name_T = datarows[key].First_Name_T
                Last_Name_T = datarows[key].Last_Name_T
                Confirm_Unit = datarows[key].Confirm_Unit
                UNITHOLDER_ID = datarows[key].UNITHOLDER_ID
                AMC_CODE = datarows[key].AMC_CODE
                FUND_CODE = datarows[key].FUND_CODE
                mktid = datarows[key].mktid
                tagtd += `<tr>
                                            <td> ${i} </td> 
                                            <td> ${transactionId}</td>
                                            <td> ${id_card}</td>
                                            <td> ${status_api}</td>
                                            <td> ${status_wr}</td>
                                            <td> ${Fund_Id}</td>
                                            <td> ${Ref_No}</td>
                                            <td> ${Title_Name_T}</td>
                                            <td> ${First_Name_T}</td>
                                            <td> ${Last_Name_T}</td>
                                            <td> ${Confirm_Unit}</td>
                                            <td> ${UNITHOLDER_ID}</td>
                                            <td> ${AMC_CODE}</td>
                                            <td> ${FUND_CODE}</td>
                                            <td> ${mktid}</td>
                                            </tr>
                                    `
                i++;
            }
            tagtable = `<table style="width:100%">
                                <tr>
                                        <td> No </td>
                                        <td> Transaction Id</td>
                                        <td> Card No</td>
                                        <td> Status API </td>
                                        <td> Reconcile </td>
                                        <td> Fund Id  </td>
                                        <td> Ref No </td>
                                        <td> Title Name </td>
                                        <td> First Name </td>
                                        <td> Last Name  </td>
                                        <td> Unit Balance Confirm Unit </td>
                                        <td> UNITHOLDER ID</td>
                                        <td> AMC CODE </td>
                                        <td> FUND CODE </td>
                                        <td> Marketing Code </td>
                                </tr> 
                                ${tagtd}
                            </table>`
            // console.log(tagtable)
            res.json(tagtable)
        })
    }, 30000);
});

router.route('/datatransaction').get((req, res) => {
    calldatatransaction(function (datarows) {
        let tagtable = ""
        let tagtd = ""
        let transactionId = null, id_card = null, status_api = null, status_wr = null, Fund_Id = null, Ref_No = null, Title_Name_T = null, First_Name_T = null
        let Last_Name_T = null, Confirm_Unit = null, UNITHOLDER_ID = null, AMC_CODE = null, FUND_CODE = null, mktid = null
        let i = 1
        for (const key in datarows) {
            transactionId = datarows[key].transactionId
            id_card = datarows[key].id_card
            status_api = datarows[key].status_api
            status_wr = datarows[key].status_wr
            Fund_Id = datarows[key].Fund_Id
            Ref_No = datarows[key].Ref_No
            Title_Name_T = datarows[key].Title_Name_T
            First_Name_T = datarows[key].First_Name_T
            Last_Name_T = datarows[key].Last_Name_T
            Confirm_Unit = datarows[key].Confirm_Unit
            UNITHOLDER_ID = datarows[key].UNITHOLDER_ID
            AMC_CODE = datarows[key].AMC_CODE
            FUND_CODE = datarows[key].FUND_CODE
            mktid = datarows[key].mktid
            tagtd += `<tr>
                                    <td> ${i} </td> 
                                    <td> ${transactionId}</td>
                                    <td> ${id_card}</td>
                                    <td> ${status_api}</td>
                                    <td> ${status_wr}</td>
                                    <td> ${Fund_Id}</td>
                                    <td> ${Ref_No}</td>
                                    <td> ${Title_Name_T}</td>
                                    <td> ${First_Name_T}</td>
                                    <td> ${Last_Name_T}</td>
                                    <td> ${Confirm_Unit}</td>
                                    <td> ${UNITHOLDER_ID}</td>
                                    <td> ${AMC_CODE}</td>
                                    <td> ${FUND_CODE}</td>
                                    <td> ${mktid}</td>
                                    </tr>
                               `
            i++;
        }
        tagtable = `<table style="width:100%">
                        <tr>
                                <td> No </td>
                                <td> Transaction Id</td>
                                <td> Card No</td>
                                <td> Status API </td>
                                <td> Status WR </td>
                                <td> Fund Id  </td>
                                <td> Ref No </td>
                                <td> Title Name </td>
                                <td> First Name </td>
                                <td> Last Name  </td>
                                <td> Unit Balance Confirm Unit </td>
                                <td> UNITHOLDER ID</td>
                                <td> AMC CODE </td>
                                <td> FUND CODE </td>
                                <td> Marketing Code </td>
                        </tr> 
                        ${tagtd}
                    </table>`
        console.log(tagtable)
        res.json(datarows)
    })
})

//----- 17052022
router.route('/getFundCustomer/:id').get((req, res) => {
    const aDate = getDateYesterday();
    console.log("aDate:" + aDate);

    getFundCustomer(req.params.id, function (x) {
        callImportCustomer(x, function (y) {
            //res.json(y);   
        });
        res.json(x);

    });
});

router.route('/callFundCustomer/:id').get((req, res) => {
    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())

    });
    promise.then(function () {
        setTimeout(function () {
            getFundCustomer(req.params.id, function (x) {
                callImportCustomerId(x, function (y) {
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
router.route('/getFundConnDataByCus/:id/:dataType').get((req, res) => {
    const aDate = req.params.aDate;
    const aDataType = req.params.dataType;
    const aId = req.params.id;
    isLogin();
    getFundCustomer(aId, function (x) {
        //res.json(afileData);  
        // console.log("jason data :"+x);
        if (x != false) {
            callImportjobCus(aDataType, x, function (y) {

            });
            // res.json(x);
            // console.log("jason data :" );
        } else {
            res.json("no data Customer Import1");
        }
    });


});




//----------------------------------------------------------------

router.route('/getFundOrderInquiryBy/:datex').get((req, res) => {
    console.log("datex:" + req.params.datex);

    const aDate = req.params.datex;
    getFundOrderInquiry(aDate, function (x) {
        callImportQueryOrder(x, function (y) {
            res.json(y);
        });

    });

});

//-------------------------------2rd--------------------------
router.route('/importCenCustomer/:id').get((req, res) => {
    //console.log("datex:"+req.params.id);
    //isLogin();
    //const aDate = req.params.id;
    const aid = req.params.id;
    getFundOrderInquiry2(aid, function (x, status) {
        //console.log(result)
        if (x != false) {
            if (status == 200) {
                importCenCustomer(x, function (y) {
                    res.json(y);

                });
            } else {
                res.json("Not found Data ID " + req.params.id)
                // res.json("no data");
            }

            //console.log("status 200") 
        }


    });

});


router.route('/getFundConnDataBy2/:aDate/:dataType').get((req, res) => {
    const aDate = req.params.aDate;
    const aDataType = req.params.dataType;
    isLogin();
    getFundConnExportFile(aDate, aDataType, function (afileData) {
        //res.json(afileData);  
        console.log("afileData:" + afileData);
        if (afileData != false) {
            callImportjob(aDataType, afileData, function (x) {
                res.json(x);
            });
            //res.json(afileData);
        } else {
            res.json("no data");
        }
    });


});
//---------------------------------------------------------------
router.route('/getFundConnDataBy/:aDate/:dataType').get((req, res) => {
    const aDate = req.params.aDate;
    const aDataType = req.params.dataType;
    isLogin();
    getFundConnExportFile(aDate, aDataType, function (afileData) {
        // res.json(afileData);  
        console.log("afileData:" + afileData);
        if (afileData != false) {
            callImportjob(aDataType, afileData, function (x) {
                res.json(x);
            });
            //res.json(afileData);
        } else {
            res.json("no data");
        }
    });


});

//--------------


router.route('/getLogin').get((req, res) => {
    isLogin();
    setTimeout(function () {

        res.json("Login Success");


    }, 10000);


});


//---- unitholder dummy
router.route('/dummyUnitHolder').post((req, res) => {

    const amcCode = req.body.amcCode;
    const accountId = req.body.accountId;
    const unitholderType = req.body.unitholderType;
    //dummyUnitHolder
    dummyUnitHolder(amcCode, accountId, unitholderType, function (x) {
        res.json(x);
    });
    // res.json('xxxxxxxxx')
    // dummyUnitHolder2(amcCode,accountId,unitholderType, function(x){
    //     res.json(x);
    // });
});
router.route('/getAccountCustomers').post((req, res) => {
    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())
    });
    promise.then(function () {
        setTimeout(function () {
            selectaccount(function (x) {
                res.json(x);
            });

        }, 1000);
    });


})

//-------------------------------3rd-------------------------- Promise incould
router.route('/getFundConnDataNologin/:aDate/:dataType').get((req, res) => {
    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())

    });
    promise.then(function () {
        //res.json('success');
        setTimeout(function () {
            const aDate = req.params.aDate;
            const aDataType = req.params.dataType;
            //isLogin();
            getFundConnExportFile(aDate, aDataType, function (afileData) {
                //res.json(afileData);  
                console.log("afileData:" + afileData);
                if (afileData != false) {
                    callImportjob(aDataType, afileData, function (x) {
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

router.route('/getFundConnDataType/:dataType').get((req, res) => {
    const DataType = req.params.dataType;
    const d = new Date();
    let hour = d.getHours();
    let minutes = d.getMinutes();

    // if (DataType === 'UnitholderBalance'){
    //     if(hour >  10 && hour < 14){
    //         res.json("ระบบกำลังประมวลผลอยู่ unit balance ช่วงเวลา 10.30 - 14.00 น" ); 
    //         return   
    //     }
    //     if(hour == 10){
    //         if(minutes > 30){
    //         res.json("ระบบกำลังประมวลผลอยู่ unit balance ช่วงเวลา 10.30 - 14.00 น" );
    //         return  
    //         } 
    //     } 
    // }


    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())

    });
    let datenow
    const today = new Date()
    const yesterday = new Date(today)
    let yt
    var chek_day = today.getDay();
    if (chek_day === 1) {
        yt = yesterday.setDate(yesterday.getDate() - 3)
    } else {
        yt = yesterday.setDate(yesterday.getDate() - 1)
    }

    let date_yt = new Date(yt)
    let dateyt = ("0" + date_yt.getDate()).slice(-2);
    let month_yt = ("0" + (date_yt.getMonth() + 1)).slice(-2);
    let year_yt = date_yt.getFullYear();
    let date_yesterday = year_yt + month_yt + dateyt


    let date_ob = new Date(today)
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    datenow = year + month + date
    promise.then(function () {
        //res.json('success');
        setTimeout(function () {
            let aDate = (chek_day === 1 ? date_yesterday : getDateYesterday())
            //  aDate = '20221230'
            const aDataType = req.params.dataType;
            getFundConnExportFile(aDate, aDataType, function (afileData) {

                console.log("afileData:" + afileData);
                console.log("aDataType:" + aDataType);
                callImportjob(aDataType, afileData, function (x) {
                    res.json("Import Data " + aDataType + " on " + aDate);
                    //   res.json(x) 
                    console.log(x)
                });

            });

        }, 2000);

    });


    // const aDate = getDateYesterday();

})

// prepaire unibalance  2023 - 01 - 04  did evevy 9.20
router.route('/prepareunitbalance').get((req, res) => {
    //cen_alllottransaction
    // callImportTransactionAllot()

    // setTimeout(() => {

    //     callImportUnitBalance()
    // }, 20000);
    // res.json("done")
    // setTimeout(() => {
    callprepareunitbalance(function (x) {
        res.json(x)
    })
    // }, 30000);

})
// add fundcode
router.route('/getimportfund/:fundcode').get((req, res) => {
    const fundcode = req.params.fundcode;
    if (fundcode.length == 0) {
        return res.json('fundcode incorrect ' + fundcode.length)
    }
    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())

    });
    let datenow
    const today = new Date()
    let date_ob = new Date(today)
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    datenow = year + month + date
    promise.then(function () {
        //res.json('success');
        setTimeout(function () {
            let aDate = datenow
            const aDataType = "FundProfile";
            getFundConnExportFile(aDate, aDataType, function (afileData) {

                //     console.log("afileData:"+afileData);
                //     console.log("aDataType:"+aDataType);
                callImportjob(aDataType, afileData, function (x) {
                    //         // res.json("Import Data "+aDataType+" on "+aDate);  
                    callImportFundbycode(fundcode, function (y) {
                        res.json(y)
                    })
                });

            });

        }, 2000);

    });

    res.json("Open " + fundcode + " ")
})
//add fund by amc code 2023-01-19
router.route('/callToGetAllFund').get((req, res) => {
    //call fund profile
    // const promise = new Promise(function(myResolve, myReject) {
    //     myResolve(isLogin())

    // });
    // let datenow
    // const today = new Date()
    // let date_ob = new Date(today)
    // let date = ("0"+date_ob.getDate()).slice(-2); 
    // let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    // let year = date_ob.getFullYear();
    // datenow = year + month + date 
    // promise.then(function() { 
    //     let aDate = datenow
    //     const aDataType = "FundProfile";  
    //     getFundConnExportFile( aDate, aDataType, function(afileData){
    //         callImportjob( aDataType,afileData, function(x){

    //         }); 
    //     });  
    // });
    let amcCode = null
    let loop_amc = ["KTAM"]
    //["ASSETFUND","KTAM" ,"DAOLINV","EASTSPRING","KSAM","LHFUND","PRINCIPAL","ONEAM","SCBAM"]
    loop_amc.forEach(async (amc) => {
        amcCode = amc
        //   setTimeout(() => {
        callImportGetAllFund(amc, (x) => {

        })
        //   }, 30000);

    })
    res.json("Open " + amcCode)
})
router.route('/callImporttxtallot').get((req, res) => {
    let loop_date = []
    let file_name = ["../../pipe/unzipfile/20220908_WR_ALLOTTEDTRANSACTIONS.txt"]
    // let filetype = "AllottedTransactions"
    const aDataType = "CloneAllottedTransactions";
    file_name.forEach(async (afileData) => {
        callImportjob(aDataType, afileData, function (x) {

        })

    })

})

// call send mail Reconcile 
router.route('/callDataReconcileTran').get((req, res) => {
    callFuncReconcileTran(function (result) {
        res.json(result)
    })
})

router.route('/clonetranallot').get((req, res) => {
    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())

    });
    promise.then(function () {

        //---- if today = monday must get File of Friday     
        let datenow
        const today = new Date()
        const yesterday = new Date(today)
        let yt
        var chek_day = today.getDay();
        if (chek_day === 1) {
            yt = yesterday.setDate(yesterday.getDate() - 3)
        } else {
            yt = yesterday.setDate(yesterday.getDate() - 1)
        }

        let date_yt = new Date(yt)
        let dateyt = ("0" + date_yt.getDate()).slice(-2);
        let month_yt = ("0" + (date_yt.getMonth() + 1)).slice(-2);
        let year_yt = date_yt.getFullYear();
        let date_yesterday = year_yt + month_yt + dateyt


        let date_ob = new Date(today)
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year + month + date
        // fix user allot before uniholder not update 
        setTimeout(function () {
            // let aDate = getDateYesterday();
            let aDate = (chek_day === 1 ? date_yesterday : getDateYesterday())
            //aDate =  datenow// '20220809'
            const aDataType = "AllottedTransactions"// req.params.dataType;
            getFundConnExportFile(aDate, aDataType, function (afileData) {
                //res.json(afileData);  
                console.log("afileData:" + afileData);
                if (afileData != false) {
                    callImportjob("CloneAllottedTransactions", afileData, function (x) {
                        // res.json("Import Transaction on Date "+ aDate + " ");                     
                    });
                    //res.json(afileData);
                } else {
                    res.json("no data on Date " + aDate);
                }
            });
            //  res.json("sucess"); 

        }, 1000);

    });

})
//IT request 230203
router.route('/FundProfileDaily').get((req, res) => {
    const promise = new Promise(function (myResolve, myReject) {
        myResolve(isLogin())

    });
    let datenow
    const today = new Date()
    let date_ob = new Date(today)
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    datenow = year + month + date
    promise.then(function () {
        //res.json('success');
        let aDate = datenow
        const aDataType = "FundProfile";
        console.log(aDataType)
        getFundConnExportFile(aDate, aDataType, function (afileData) {

            callImportjob(aDataType, afileData, function (x) {
                //         // res.json("Import Data "+aDataType+" on "+aDate);  

            });

        });
    });

})
//IT request 230203
router.route('/PrepareFundProfile').get((req, res) => {
    callPrepareFundProfile(function (x) {
        res.json(x)
    })
})
//IT request 230207
router.route('/sumAllotDaily').get((req, res) => {
    callSumAllotDaliy(function (x) {
        res.json(x)
    })
})
router.route('/sms').post((req, res) => {
    callApiSms(async (x) => {
        res.json(x)
    })
    // res.json("x")
});

router.route('/divedendInquiry').post((req,res)=>{
    getDivedend( (x)=>{
        res.json(x);
    })
})

router.route('/navDataFundPerformance').get((req,res)=>{
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
            let date_yt = new Date(yt)
            let dateyt = ("0"+date_yt.getDate()).slice(-2);
            let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
            let year_yt = date_yt.getFullYear();

            let date_yesterday = year_yt  + month_yt  + dateyt
            let aDate =  date_yesterday 
            const aDataType = 'Nav'
            //    aDate = '20230303' //20220812
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
          //  res.json("sucess"); 
        
        }, 1000);
        
    });

});
// router.route('/reportTexSaving').post((req,res)=>{
//     callGenReportTexSavingMobile((x)=>{
//         res.json(x)
//     })
// })
router.route('/reportTexSavingBuy').post((req,res)=>{
    callGenReportTexSavingBuyMobile((x)=>{
        res.json(x)
    })
})
// cron.schedule('00 16 * * 1-5', () => {
//     // chang time  9.00 => 8.30 : 2022/09/20
//     callImportUnitBalance()  
// });
// cron.schedule('55 10 * * 1-5', () => {
//     // call api tran 2023-01-23
//     callImportTransactionAllot()  
// });
// cron.schedule('57 10 * * 1-5', () => {
//     // call api unibalance
//     callImportUnitBalance()   
// });
// cron.schedule('58 10 * * 1-5', () => {
//     // call api unibalance fix update data alfter fix
//     callImportUnitBalance()   
// });
// cron.schedule('59 08 * * 1-5', () => {
//     // prepare mfts account
//     callprepareAccount()   
// });
// cron.schedule('00 11 * * 1-5', () => {
//     // prepare unibalance 
//     callprepareunitbalance()
// });
// cron.schedule('01 11 * * 1-5', () => {
//     // transaction allot
//     callImportTransactionMannul()
// });
// cron.schedule('56 08 * * 1-5', () => {
//     // transaction allot
//     callgetDatatrantolog()
// });
// cron.schedule('57 08 * * 1-5', () => {
//     // transaction allot
//     callFuncReconcileTran()
// });
// cron.schedule('59 08 * * 1-5', () => {
//     // transaction allot
//     callclonetranallot()
// });
// cron.schedule('45 17 * * 1-5', () => {
//     // transaction allot
//     callImportFundProfile()
// });

app.listen(5500, () => {
    console.log('Listening fundconn on port 5500');
});


