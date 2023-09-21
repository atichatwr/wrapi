//****************[ Created Date 2022 07 25  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/

import sql  from 'mssql';
import dotenv from 'dotenv';
import { config } from './dbconfig.js';
import poolPromise from './db.js';
import { accessSync } from 'fs';
// import {getdate } from './tranwait.js'
import {InsertMFTS_TRANSACTION} from './dbsql.js';
import {getTranNumber, convertMKTID, InsertMFTSBuy ,UpdateUnitBalance, getRefNoOfAccount, getRef } from './tranwait.js' 
import {getDateYesterday,isLogin} from '../fundconn/wealthutil.js';
import { isModuleNamespaceObject } from 'util/types';
dotenv.config();

async function selctDataOrderQuery(callback){
    try{
        let timestampx
        const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        // timestampx = year +"-"+  month  +"-"+ date + " 00:00:00.000"
        timestampx = year  +  month  + date
        const aDate = getDateYesterday();
        let statement = `SELECT     dbo.Fund_Cen_OrderInquiry.ID, dbo.Fund_Cen_OrderInquiry.transactionId, dbo.Fund_Cen_OrderInquiry.saOrderReferenceNo, dbo.Fund_Cen_OrderInquiry.transactionDateTime, 
                                    dbo.Fund_Cen_OrderInquiry.orderType, dbo.Fund_Cen_OrderInquiry.accountId, dbo.Fund_Cen_OrderInquiry.unitholderId, dbo.Fund_Cen_OrderInquiry.fundCode, 
                                    dbo.Fund_Cen_OrderInquiry.redemptionType, dbo.Fund_Cen_OrderInquiry.amount, dbo.Fund_Cen_OrderInquiry.unit, dbo.Fund_Cen_OrderInquiry.sellAllUnitFlag, 
                                    dbo.Fund_Cen_OrderInquiry.statusx, dbo.Fund_Cen_OrderInquiry.effectiveDate, dbo.Fund_Cen_OrderInquiry.settlementDate, dbo.Fund_Cen_OrderInquiry.amcOrderReferenceNo, 
                                    dbo.Fund_Cen_OrderInquiry.allottedAmount, dbo.Fund_Cen_OrderInquiry.allottedUnit, dbo.Fund_Cen_OrderInquiry.allottedNAV, dbo.Fund_Cen_OrderInquiry.allotmentDate, 
                                    dbo.Fund_Cen_OrderInquiry.fee, dbo.Fund_Cen_OrderInquiry.transactionLastUpdated, dbo.Fund_Cen_OrderInquiry.paymentType, dbo.Fund_Cen_OrderInquiry.bankCode, 
                                    dbo.Fund_Cen_OrderInquiry.bankAccount, dbo.Fund_Cen_OrderInquiry.channel, dbo.Fund_Cen_OrderInquiry.icLicense, dbo.Fund_Cen_OrderInquiry.branchNo, 
                                    dbo.Fund_Cen_OrderInquiry.forceEntry, dbo.Fund_Cen_OrderInquiry.settlementBankCode, dbo.Fund_Cen_OrderInquiry.settlementBankAccount, dbo.Fund_Cen_OrderInquiry.chqBranch, 
                                    dbo.Fund_Cen_OrderInquiry.rejectReason, dbo.Fund_Cen_OrderInquiry.navDate, dbo.Fund_Cen_OrderInquiry.[collateralAccount ], dbo.Fund_Cen_OrderInquiry.accountType, 
                                    dbo.Fund_Cen_OrderInquiry.recurringOrderId, dbo.Fund_Cen_OrderInquiry.paymentStatus, dbo.Fund_Cen_OrderInquiry.paymentProcessingType, 
                                    dbo.Fund_Cen_OrderInquiry.saRecurringOrderRefNo, dbo.Fund_Cen_OrderInquiry.crcApprovalCode, dbo.Fund_Cen_OrderInquiry.timestampx, dbo.Fund_Cen_OrderInquiry.flx, 
                                    dbo.MFTS_Fund.Amc_Id , dbo.MFTS_Fund.Fund_Id
                            FROM         dbo.Fund_Cen_OrderInquiry INNER JOIN
                                    dbo.MFTS_Fund ON dbo.Fund_Cen_OrderInquiry.fundCode = dbo.MFTS_Fund.Fund_Code `
                            // WHERE dbo.Fund_Cen_OrderInquiry.timestampx >=  '${timestampx}' `

        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
      
          }).then(result => {
            //console.log(result);
            let data_row = result.rowsAffected.toString();
            console.log("result OrderInquiry : "+ data_row +" row")
            sql.close();
            // console.log(result.recordset)
            return  callback(result.recordset) 
      
          }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
          });
        } catch (error) {
          result = "ERROR Catch"
          console.log(error);
          return   callback(error);
        }

}
async function checkDataDupOrderInquiry(datarows , callback){
    if(datarows.length == 0){return callback(0)}
    
    for (const [i, v] of datarows.entries()) {
        try{
            let acccoutno       = datarows[i].accountId
            let fund_id         = datarows[i].Fund_Id
            let amount          = datarows[i].amount
            let tranttype       = datarows[i].orderType
            let amc_id          = datarows[i].Amc_Id
            let unitholder      = datarows[i].unitholderId
            let TranSaction_Date = datarows[i].transactionDateTime
            let tranTypecode
            switch (tranttype) {
                case "SUB":
                    tranTypecode = "B"
                    break;
                case "RED":
                    tranTypecode = "S"
                    break;
                case "TRI":
                    tranTypecode = "TI"
                    break;
                case "TRO":
                    tranTypecode = "TO"
                    break;
                case "SWI":
                    tranTypecode = "SI"
                    break;
                case "SWO":
                    tranTypecode = "SO"
                    break;
                case "XSI":
                    tranTypecode = "TI"
                    break;
                case "XSO":
                    tranTypecode = "TO"
                    break;
                default:
                    break;
            }
            let ref_no
            await getrefNoAfterAccount(acccoutno, unitholder ,amc_id, (ref_nox) =>{ref_no = ref_nox }    )
            console.log("ref no :" + ref_no)
            let statement   = `SELECT TRANSACTION_DATE FROM MFTS_TRANSACTION 
                                WHERE  Fund_Id = ${fund_id} 
                                AND    Amount_Baht = ${amount} 
                                AND    TranType_Code = '${tranTypecode}'
                                AND    Ref_No       = '${ref_no}'   `
                                /*IDACCOUNTI = '${cardno}' 
                                ' 
                                AND*/
            // console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
                
            }).then(result => {
                    let rowsAffected = result.rowsAffected.toString()
                // let datetime
                if (rowsAffected > 0){ 
                    ///log
                   // insertlogoderquery(datarows[i])
                }else{
                    //insert
                   importOrderQuery(datarows[i])
                   console.log(ref_no + " XXX " + TranSaction_Date.substring(0,4) + "-" + TranSaction_Date.substring(4,6)  + "-" + TranSaction_Date.substring(6,8))
                   console.log(datarows[i].transactionId)
                }
                sql.close();
                // return callback(result.recordset)
            }).catch(err => {
                console.log(err);
                sql.close();
                // return callback(err)
            });
            
        }catch (error) {
            console.log(error);
            // return callback(error);
        }
    }

}
async function checkDataOrderInquiry(datarows  ,callback){
    if(datarows.length == 0){return callback(0)}
    let transaction = ""
    for (const [i, v] of datarows.entries()) {
        let TRANSACTION_DATE        = datarows[i].transactionDateTime
        // get last data 
        if( i === datarows.length-1){
            transaction += "'"+TRANSACTION_DATE + "'"
        }else{
            transaction += "'"+TRANSACTION_DATE + "',"
        }
    }

    try{
        let TRANSACTION_DATE ="";
        let statement = `SELECT TRANSACTION_DATE FROM MFTS_TRANSACTION WHERE TRANSACTION_DATE IN (${transaction})`

    

    //log 
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            if (rowsAffected > 0){ 
                for (const [i, v] of result.recordset.entries()) {        
                    if( i === result.recordset.length-1){
                        TRANSACTION_DATE += "'"+result.recordset[i].TRANSACTION_DATE +"'"
                    }else{
                        TRANSACTION_DATE += "'"+result.recordset[i].TRANSACTION_DATE +"',"
                    }
                }
            }
            // console.log(TRANSACTION_DATE)
            sql.close();
           
        }).catch(err => {
            console.log(err);
            sql.close();
           
        });
        // console.log(TRANSACTION_DATE)
        let timestampx
        const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        timestampx = year +"-"+  month  +"-"+ date + " 00:00:00.000"
        //console.log(TRANSACTION_DATE.length)
        if(TRANSACTION_DATE.length != 0 ){
            TRANSACTION_DATE = ` AND dbo.Fund_Cen_OrderInquiry.transactionDateTime Not IN (${TRANSACTION_DATE})`
        }else{
            TRANSACTION_DATE = ""
        }
        let sqlx = `SELECT     dbo.Fund_Cen_OrderInquiry.ID, dbo.Fund_Cen_OrderInquiry.transactionId, dbo.Fund_Cen_OrderInquiry.saOrderReferenceNo, dbo.Fund_Cen_OrderInquiry.transactionDateTime, 
                                dbo.Fund_Cen_OrderInquiry.orderType, dbo.Fund_Cen_OrderInquiry.accountId, dbo.Fund_Cen_OrderInquiry.unitholderId, dbo.Fund_Cen_OrderInquiry.fundCode, 
                                dbo.Fund_Cen_OrderInquiry.redemptionType, dbo.Fund_Cen_OrderInquiry.amount, dbo.Fund_Cen_OrderInquiry.unit, dbo.Fund_Cen_OrderInquiry.sellAllUnitFlag, 
                                dbo.Fund_Cen_OrderInquiry.statusx, dbo.Fund_Cen_OrderInquiry.effectiveDate, dbo.Fund_Cen_OrderInquiry.settlementDate, dbo.Fund_Cen_OrderInquiry.amcOrderReferenceNo, 
                                dbo.Fund_Cen_OrderInquiry.allottedAmount, dbo.Fund_Cen_OrderInquiry.allottedUnit, dbo.Fund_Cen_OrderInquiry.allottedNAV, dbo.Fund_Cen_OrderInquiry.allotmentDate, 
                                dbo.Fund_Cen_OrderInquiry.fee, dbo.Fund_Cen_OrderInquiry.transactionLastUpdated, dbo.Fund_Cen_OrderInquiry.paymentType, dbo.Fund_Cen_OrderInquiry.bankCode, 
                                dbo.Fund_Cen_OrderInquiry.bankAccount, dbo.Fund_Cen_OrderInquiry.channel, dbo.Fund_Cen_OrderInquiry.icLicense, dbo.Fund_Cen_OrderInquiry.branchNo, 
                                dbo.Fund_Cen_OrderInquiry.forceEntry, dbo.Fund_Cen_OrderInquiry.settlementBankCode, dbo.Fund_Cen_OrderInquiry.settlementBankAccount, dbo.Fund_Cen_OrderInquiry.chqBranch, 
                                dbo.Fund_Cen_OrderInquiry.rejectReason, dbo.Fund_Cen_OrderInquiry.navDate, dbo.Fund_Cen_OrderInquiry.[collateralAccount ], dbo.Fund_Cen_OrderInquiry.accountType, 
                                dbo.Fund_Cen_OrderInquiry.recurringOrderId, dbo.Fund_Cen_OrderInquiry.paymentStatus, dbo.Fund_Cen_OrderInquiry.paymentProcessingType, 
                                dbo.Fund_Cen_OrderInquiry.saRecurringOrderRefNo, dbo.Fund_Cen_OrderInquiry.crcApprovalCode, dbo.Fund_Cen_OrderInquiry.timestampx, dbo.Fund_Cen_OrderInquiry.flx, 
                                dbo.MFTS_Fund.Amc_Id , dbo.MFTS_Fund.Fund_Id
                            FROM    dbo.Fund_Cen_OrderInquiry INNER JOIN
                                    dbo.MFTS_Fund ON dbo.Fund_Cen_OrderInquiry.fundCode = dbo.MFTS_Fund.Fund_Code
                            WHERE  (dbo.Fund_Cen_OrderInquiry.branchNo = '001'  OR Fund_Cen_OrderInquiry.statusx ='ALLOTTED')
                                    ${TRANSACTION_DATE}`
        // AND dbo.Fund_Cen_OrderInquiry.timestampx >= '${timestampx}'
        //  console.log(TRANSACTION_DATE)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(sqlx);
            
        }).then(result => {
              let rowsAffected = result.rowsAffected.toString()
            // let datetime
            if (rowsAffected > 0){ console.log("Result Insert "+rowsAffected+ "rows")   }
            sql.close();
            return callback(result.recordset)
        }).catch(err => {
            console.log(err);
            sql.close();
            return callback(err)
        });
        
    }catch (error) {
        console.log(error);
        return callback(error);
    }
//    return callback(TRANSACTION_DATE)
}
async function importOrderQuery(datarows , callback){ 
    // console.log(datarows.transactionId)
    try{
        // const cardNumber            = datarows[0].accountId
        // const HolderNo              = datarows[0].unitholderId
        // const AMCID                 = datarows[0].Amc_Id
        // let tranTypeCode_db         = datarows[0].orderType //"SWI"
        // // let TRANSACTION_DATE        = datarows[0].transactionDateTime
        // let amountbaht              = datarows[0].amount
        // let amountunit              = datarows[0].unit
        // let Alloted_Amount        = datarows[0].allottedAmount
        // // let fundCode                = datarows[0].fundCode
        // let TranStatus                  = datarows[0].statusx
        // let effectiveDate           = datarows[0].effectiveDate
        // let MKTIID                   = datarows[0].icLicense
        // let Create_By               ="146"
        // // let TranStatus              = datarows[0].status
        // let Modify_Date
        // let FUNDCODEI               = datarows[0].fundCode
        // let UNITHOLDERI             = datarows[0].unitholderId
        // let IDACCOUNTI              = datarows[0].accountId
        // let AMCCODEI                = datarows[0].Amc_Code
        // let TranSaction_Date        = datarows[0].transactionDateTime
        // let transactionId           = datarows[0].transactionId
        // let Fund_Id                 = datarows[0].Fund_Id
        // let amcOrderReferenceNo     = datarows[0].amcOrderReferenceNo
        // let branchNo                = datarows[0].branchNo   
        // let allottedUnit            = datarows[0].allottedUnit
        // let allottedNAV            = datarows[0].allottedNAV
        // let redemptionType          = datarows[0].redemptionType
        // // let MKTIID                  = datarows[0].icLicense
        // let executedate             = effectiveDate.substring(0,4) + "-" + effectiveDate.substring(4,6)  + "-" + effectiveDate.substring(6,8)
        // let statusApprov            = TranStatus === "WAITING" ?  5 : 7 ;
        // Modify_Date                 = executedate
        // let CustomerInput //=  datarows[0].sellAllUnitFlag = "Y" ? datarows[0].sellAllUnitFlag  : null ;
        // if(datarows[0].sellAllUnitFlag = "Y" && amountunit > 0   && TranStatus === "ALLOTTED" && Alloted_Amount > 0){CustomerInput = "Y"}
        // let price                   //= TranStatus === "APPROVED" ? Alloted_Amount : amountbaht
        // // price                       = TranStatus === "ALLOTTED" ? Alloted_Amount : amountbaht
        // if(TranStatus === "ALLOTTED"){ price = Alloted_Amount}
        // if(TranStatus === "APPROVED"){ price = amountbaht }
        // if(TranStatus === "WAITING") { price = amountbaht}
        // if(TranStatus === "APPROVED"){ allottedUnit = amountunit }    
        // let unit                    = TranStatus === "APPROVED" ? amountunit : 0.000000
        // statusApprov                = TranStatus === "CANCELLED" ? 9 : statusApprov
        // if(TranStatus === "WAITING" && price == 0){  unit = datarows[0].UNIT }
        // if(TranStatus === "APPROVED" && allottedNAV != 0){  statusApprov = 5 }
        // if(amountbaht == 0 && TranStatus === "ALLOTTED") {amountbaht = Alloted_Amount }
        // let Source_Flag             = "F"
        // let tranNo , seqno ,tranTypecode
        // let APIstatus ="I"
        // let zero = 0.000000
        // if(allottedNAV === undefined ) {allottedNAV = zero}
        // if(allottedUnit === undefined ) {allottedUnit = zero}
        // if(redemptionType !== undefined && amountunit !== undefined ) {amountunit = allottedUnit  }
        
        // // if (allottedNAV > 0 && allottedUnit > 0  && TranStatus === "ALLOTTED" ){CustomerInput ="Y"}
        // // console.log(allottedNAV+" xxx " + allottedUnit +" yyy "+ TranStatus)
        // let Modify_By               = '95' // ห้ามหลุด
        // let trandate_db     =TranSaction_Date.substring(0,4) + "-" + TranSaction_Date.substring(4,6)  + "-" + TranSaction_Date.substring(6,8)
        // await  getTranNumber(1,(no)=>{ tranNo =no })
        // // console.log(tranNo)
        // let Amc_Id
        // await getAmcId(FUNDCODEI , (amc_id)=> {Amc_Id = amc_id})
        // // console.log("amc id : "+Amc_Id)
        // let RefNo = null
        // // await getRefNoOfAccount(IDACCOUNTI,HolderNo , (refno)=> {RefNo = refno }) 
        // await getRefNo(IDACCOUNTI,HolderNo ,Amc_Id, (refno)=> { RefNo = refno }) 
        // if(RefNo === null){  await getrefNoAfterAccount(IDACCOUNTI, HolderNo ,Amc_Id, (ref_nox) =>{RefNo = ref_nox }    )}
        // if(RefNo === null){  await insertMFtsAcccount  (IDACCOUNTI, HolderNo ,Amc_Id, (ref)     =>{RefNo = ref}         )}
        // if(RefNo === null){ await getRefx("Ref_No",1 , (ref)=>{RefNo = ref })}
        // // console.log("finally :"+RefNo)
        // await getMaxSeqNo(RefNo,Fund_Id,(maxseq)=>{ seqno = maxseq})
        // // console.log("max : "+ max)
        // let mkktid , tranflag = "OrderInQuiry"
        // await convertMKTID(MKTIID , (id)=>{ mkktid = id })
        // switch (tranTypeCode_db) {
        //     case "SUB":
        //         tranTypecode = "B"
        //         break;
        //     case "RED":
        //         tranTypecode = "S"
        //         break;
        //     case "TRI":
        //         tranTypecode = "TI"
        //         break;
        //     case "TRO":
        //         tranTypecode = "TO"
        //         break;
        //     case "SWI":
        //         tranTypecode = "SI"
        //         break;
        //     case "SWO":
        //         tranTypecode = "SO"
        //         break;
        //     case "XSI":
        //         tranTypecode = "TI"
        //         break;
        //     case "XSO":
        //         tranTypecode = "TO"
        //         break;
        //     default:
        //         break;
        // }
        // await poolPromise.then(pool => {
        //     return pool.request()
        //         .input("Tran_No",       sql.VarChar(12),    tranNo)
        //         .input("Ref_No",        sql.VarChar(12),    RefNo)
        //         .input("TranType_Code", sql.VarChar(2),     tranTypecode)
        //         .input("Fund_Id",       sql.Int,            Fund_Id )
        //         .input("Tran_Date",     sql.Date,           trandate_db)
        //         .input("Status_Id",     sql.TinyInt,        statusApprov)
        //         .input("Source_Flag",   sql.Char(1),        Source_Flag)
        //         .input("Amount_Baht",   sql.Numeric(18,2),  price)
        //         .input("Amount_Unit",   sql.Numeric(18,4),  allottedUnit)
        //         .input("APIstatus",     sql.NChar(10),      APIstatus)
        //         .input("NAV_PRICE",     sql.Numeric(18,4),  allottedNAV)
        //         .input("ExecuteDate",   sql.Date,           executedate)
        //         .input("Act_ExecDate",  sql.Date,           executedate)
        //         .input("Seq_No",        sql.Int,            seqno)
        //         .input("Mktid",         sql.Int,            mkktid )
        //         .input("Create_by",     sql.VarChar(20),    Create_By)
        //         .input("Create_date",   sql.DateTime,       dateserver) 
        //         .input("Unit_Balance",  sql.Decimal(18,4),  zero)
        //         .input("AVG_Cost",      sql.Float,          zero)
        //         .input("Total_Cost",    sql.Decimal(18,4),  zero)
        //         .input("Modify_By",     sql.VarChar(20),    Modify_By)
        //         .input("FeeRate_Group", sql.Int,              1 )
        //         .input("Modify_Date",   sql.DateTime,       Modify_Date)
        //         .input("RGL",           sql.Decimal(20,6),  zero)
        //         .input("FUNDCODEI",     sql.NChar(30),      FUNDCODEI)
        //         .input("UNITHOLDERI",   sql.NChar(30),      UNITHOLDERI)
        //         .input("IDACCOUNTI",    sql.NChar(30),      IDACCOUNTI)
        //         .input("AMCCODEI",      sql.NChar(30),      AMCCODEI)
        //         .input("TranSaction_Date", sql.NChar(14),   TranSaction_Date)
        //         .input("TRANTYPECODEX", sql.NChar(5),       tranTypeCode_db)
        //         .input("TranTypeFLAG",  sql.VarChar(30),    tranflag)
        //         .input("CustomerInput",  sql.Char(1),       CustomerInput)
        //         .input("transactionId",  sql.VarChar(20),   transactionId)
        //         .query(InsertMFTS_TRANSACTION)
        //     }).then(result => {

        //         let row = result.rowsAffected
        //         let respx = " OrderInQuiry to  MFTS TRANSACTION   RefNo :" + RefNo + "  ";
        //         if (row > 0 ){console.log(respx)}
        //         // console.log(result);
        //         sql.close();
        //     }).catch(err => {
        //         console.log(err);
        //         sql.close();
        //         // return callback(err);
        //     });
        
        
}catch (error) {
    console.log(error);
    // return callback(error);

}
}


async function impoertOrderQuery(datarows , callback){ 
    let dateserver 
    await getdatetime( (dt) =>{dateserver = dt  })
    for (const key in datarows) {

        try{
                const cardNumber            = datarows[key].accountId
                const HolderNo              = datarows[key].unitholderId
                const AMCID                 = datarows[key].Amc_Id
                let tranTypeCode_db         = datarows[key].orderType //"SWI"
                // let TRANSACTION_DATE        = datarows[key].transactionDateTime
                let amountbaht              = datarows[key].amount
                let amountunit              = datarows[key].unit
                let Alloted_Amount        = datarows[key].allottedAmount
                // let fundCode                = datarows[key].fundCode
                let TranStatus                  = datarows[key].statusx
                let effectiveDate           = datarows[key].effectiveDate
                let MKTIID                   = datarows[key].icLicense
                let Create_By               ="146"
                // let TranStatus              = datarows[key].status
                let Modify_Date
                let FUNDCODEI               = datarows[key].fundCode
                let UNITHOLDERI             = datarows[key].unitholderId
                let IDACCOUNTI              = datarows[key].accountId
                let AMCCODEI                = datarows[key].Amc_Code
                let TranSaction_Date        = datarows[key].transactionDateTime
                let transactionId           = datarows[key].transactionId
                let Fund_Id                 = datarows[key].Fund_Id
                let amcOrderReferenceNo     = datarows[key].amcOrderReferenceNo
                let branchNo                = datarows[key].branchNo   
                let allottedUnit            = datarows[key].allottedUnit
                let allottedNAV            = datarows[key].allottedNAV
                let redemptionType          = datarows[key].redemptionType
                // let MKTIID                  = datarows[key].icLicense
                let executedate             = effectiveDate.substring(0,4) + "-" + effectiveDate.substring(4,6)  + "-" + effectiveDate.substring(6,8)
                let statusApprov            = TranStatus === "WAITING" ?  5 : 7 ;
                Modify_Date                 = executedate
                let CustomerInput //=  datarows[key].sellAllUnitFlag = "Y" ? datarows[key].sellAllUnitFlag  : null ;
                if(datarows[key].sellAllUnitFlag = "Y" && amountunit > 0   && TranStatus === "ALLOTTED" && Alloted_Amount > 0){CustomerInput = "Y"}
                let price                   //= TranStatus === "APPROVED" ? Alloted_Amount : amountbaht
                // price                       = TranStatus === "ALLOTTED" ? Alloted_Amount : amountbaht
                if(TranStatus === "ALLOTTED"){ price = Alloted_Amount}
                if(TranStatus === "APPROVED"){ price = amountbaht }
                if(TranStatus === "WAITING") { price = amountbaht}
                if(TranStatus === "APPROVED"){ allottedUnit = amountunit }    
                let unit                    = TranStatus === "APPROVED" ? amountunit : 0.000000
                statusApprov                = TranStatus === "CANCELLED" ? 9 : statusApprov
                if(TranStatus === "WAITING" && price == 0){  unit = datarows[key].UNIT }
                if(TranStatus === "APPROVED" && allottedNAV != 0){  statusApprov = 5 }
                if(amountbaht == 0 && TranStatus === "ALLOTTED") {amountbaht = Alloted_Amount }
                let Source_Flag             = "F"
                let tranNo , seqno ,tranTypecode
                let APIstatus ="I"
                let zero = 0.000000
                if(allottedNAV === undefined ) {allottedNAV = zero}
                if(allottedUnit === undefined ) {allottedUnit = zero}
                if(redemptionType !== undefined && amountunit !== undefined ) {amountunit = allottedUnit  }
                
                // if (allottedNAV > 0 && allottedUnit > 0  && TranStatus === "ALLOTTED" ){CustomerInput ="Y"}
                // console.log(allottedNAV+" xxx " + allottedUnit +" yyy "+ TranStatus)
                let Modify_By               = '95' // ห้ามหลุด
                let trandate_db     =TranSaction_Date.substring(0,4) + "-" + TranSaction_Date.substring(4,6)  + "-" + TranSaction_Date.substring(6,8)
                await  getTranNumber(1,(no)=>{ tranNo =no })
                // console.log(tranNo)
                let Amc_Id
                await getAmcId(FUNDCODEI , (amc_id)=> {Amc_Id = amc_id})
                // console.log("amc id : "+Amc_Id)
                let RefNo = null
                // await getRefNoOfAccount(IDACCOUNTI,HolderNo , (refno)=> {RefNo = refno }) 
                await getRefNo(IDACCOUNTI,HolderNo ,Amc_Id, (refno)=> { RefNo = refno }) 
                if(RefNo === null){  await getrefNoAfterAccount(IDACCOUNTI, HolderNo ,Amc_Id, (ref_nox) =>{RefNo = ref_nox }    )}
                if(RefNo === null){  await insertMFtsAcccount  (IDACCOUNTI, HolderNo ,Amc_Id, (ref)     =>{RefNo = ref}         )}
                if(RefNo === null){ await getRefx("Ref_No",1 , (ref)=>{RefNo = ref })}
                // console.log("finally :"+RefNo)
                await getMaxSeqNo(RefNo,Fund_Id,(maxseq)=>{ seqno = maxseq})
                // console.log("max : "+ max)
                let mkktid , tranflag = "OrderInQuiry"
                await convertMKTID(MKTIID , (id)=>{ mkktid = id })
                switch (tranTypeCode_db) {
                    case "SUB":
                        tranTypecode = "B"
                        break;
                    case "RED":
                        tranTypecode = "S"
                        break;
                    case "TRI":
                        tranTypecode = "TI"
                        break;
                    case "TRO":
                        tranTypecode = "TO"
                        break;
                    case "SWI":
                        tranTypecode = "SI"
                        break;
                    case "SWO":
                        tranTypecode = "SO"
                        break;
                    case "XSI":
                        tranTypecode = "TI"
                        break;
                    case "XSO":
                        tranTypecode = "TO"
                        break;
                    default:
                        break;
                }
                await poolPromise.then(pool => {
                    return pool.request()
                        .input("Tran_No",       sql.VarChar(12),    tranNo)
                        .input("Ref_No",        sql.VarChar(12),    RefNo)
                        .input("TranType_Code", sql.VarChar(2),     tranTypecode)
                        .input("Fund_Id",       sql.Int,            Fund_Id )
                        .input("Tran_Date",     sql.Date,           trandate_db)
                        .input("Status_Id",     sql.TinyInt,        statusApprov)
                        .input("Source_Flag",   sql.Char(1),        Source_Flag)
                        .input("Amount_Baht",   sql.Numeric(18,2),  price)
                        .input("Amount_Unit",   sql.Numeric(18,4),  allottedUnit)
                        .input("APIstatus",     sql.NChar(10),      APIstatus)
                        .input("NAV_PRICE",     sql.Numeric(18,4),  allottedNAV)
                        .input("ExecuteDate",   sql.Date,           executedate)
                        .input("Act_ExecDate",  sql.Date,           executedate)
                        .input("Seq_No",        sql.Int,            seqno)
                        .input("Mktid",         sql.Int,            mkktid )
                        .input("Create_by",     sql.VarChar(20),    Create_By)
                        .input("Create_date",   sql.DateTime,       dateserver) 
                        .input("Unit_Balance",  sql.Decimal(18,4),  zero)
                        .input("AVG_Cost",      sql.Float,          zero)
                        .input("Total_Cost",    sql.Decimal(18,4),  zero)
                        .input("Modify_By",     sql.VarChar(20),    Modify_By)
                        .input("FeeRate_Group", sql.Int,              1 )
                        .input("Modify_Date",   sql.DateTime,       Modify_Date)
                        .input("RGL",           sql.Decimal(20,6),  zero)
                        .input("FUNDCODEI",     sql.NChar(30),      FUNDCODEI)
                        .input("UNITHOLDERI",   sql.NChar(30),      UNITHOLDERI)
                        .input("IDACCOUNTI",    sql.NChar(30),      IDACCOUNTI)
                        .input("AMCCODEI",      sql.NChar(30),      AMCCODEI)
                        .input("TranSaction_Date", sql.NChar(14),   TranSaction_Date)
                        .input("TRANTYPECODEX", sql.NChar(5),       tranTypeCode_db)
                        .input("TranTypeFLAG",  sql.VarChar(30),    tranflag)
                        .input("CustomerInput",  sql.Char(1),       CustomerInput)
                        .input("transactionId",  sql.VarChar(20),   transactionId)
                        .query(InsertMFTS_TRANSACTION)
                    }).then(result => {

                        let row = result.rowsAffected
                        let respx = " OrderInQuiry to  MFTS TRANSACTION   RefNo :" + RefNo + "  ";
                        if (row > 0 ){console.log(respx)}
                        // console.log(result);
                        sql.close();
                    }).catch(err => {
                        console.log(err);
                        sql.close();
                        // return callback(err);
                    });
                
                
        }catch (error) {
            console.log(error);
            // return callback(error);

        }
    }

}
async function getdatetime(callback){
    let statement = `SELECT GETDATE() as datetime ;`  
              //console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          let datetime
          if (rowsAffected > 0){  datetime = result.recordset[0].datetime }
          sql.close();
          return callback(datetime)
      }).catch(err => {
          console.log(err);
          sql.close();
          return callback(err)
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      return callback(error)
  }
}

async function getMaxSeqNo(RefNo,Fundid , callback){
    if (RefNo === undefined || RefNo === null ){return callback(1)}
    let statement = `SELECT isnull(max(Seq_No),0) +1 AS maxx  FROM MFTS_Transaction  WHERE Ref_no = '${RefNo}' AND Fund_Id = '${Fundid}'`
    //console.log(statement)
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            let rowsAffected            = result.rowsAffected.toString()
            // let fund_id = 0
            let max
            if (rowsAffected > 0){   max = result.recordset[0].maxx.toString()  }
            sql.close();
            //console.log(max)
            return callback(max)
        }).catch(err => {
            console.log(err);
            sql.close();
            return  callback(err)
        });
    }catch (error) {
        // result = "ERROR Catch"
        // console.log(error);
        return callback(error)
    }
  
}
async function getRefNo(accountno, unitholder ,Amc_Id, callback){
    let ref_no = null
    let rowsAffected
    let Status_Id
    let statement = `SELECT Ref_No ,Holder_Id   FROM MFTS_Account  WHERE Account_No = '${accountno}' AND Amc_Id = ${Amc_Id} `
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            rowsAffected = result.rowsAffected.toString()
            if (rowsAffected > 0){  
                //  console.log(result.recordset[0])
                ref_no = result.recordset[0].Ref_No.toString()
                if (result.recordset[0].Holder_Id.toString().trim() === ""){
                    updateMftsAccount(accountno, unitholder,Amc_Id)
                }  
            }
            
            sql.close();
           return callback(ref_no)
        }).catch(err => {
            console.log(err);
            sql.close();
            //return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }
    
    //return callback(ref_no)
}
async function updateMftsAccount(acccoutno, unitholder,AMC_id ){
    try{
        
       let statement = ` UPDATE MFTS_Account SET Holder_Id = @Holder_Id , Status_Id = @Status_Id WHERE Account_No = @Account_No AND Amc_ID =@Amc_Id `
       await poolPromise.then(pool => {
        return pool.request()
            .input("Holder_Id",         sql.VarChar(30),    unitholder)
            .input("Account_No",        sql.VarChar(20),    acccoutno)
            .input("Amc_Id",            sql.Int,            AMC_id)
            .input("Status_Id",         sql.Int,            7)
            .query(statement)
        }).then(result => {
            // console.log(result)
            let row = result.rowsAffected
            let respx = " Update Holder_Id , Status_Id  to  MFTS_Account acccoutno :" + acccoutno + "  ";
            if (row > 0 ){console.log(respx)}
            sql.close();
           
            return row
        }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
        });
    
    
    }catch (error) {
    console.log(error);
    return 1;

    }
}
async function getAmcId(fundcode , callback){
    let rowsAffected
    let statement = `SELECT Amc_Id FROM  MFTS_Fund WHERE Fund_Code = '${fundcode}'`
    // console.log(statement)
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            rowsAffected = result.rowsAffected.toString()
            let amc_id = 0
            if (rowsAffected > 0){  
                //  console.log(result.recordset[0])
                amc_id = result.recordset[0].Amc_Id
                // if(result.recordset[0].Holder_Id === '') {
                //     insertHolderId(accountno, unitholder , (ref)=>ref_no = ref)
                // }
            }
            
            sql.close();
            // console.log(amc_id)
            return callback(amc_id)
        }).catch(err => {
            console.log(err);
            sql.close();
            //return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }

}
async function getrefNoAfterAccount(acccoutno,unitholder,amc_id ,callback){
    try{
        // console.log("amc_id : "+ amc_id)
        let ref_no = null
        let query = `SELECT Ref_No ,Holder_Id   FROM MFTS_Account  WHERE Account_No = '${acccoutno}' AND Amc_Id = ${amc_id} `
        console.log(query)
        new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(query);
        }).then(resultt => {
           let row = resultt.rowsAffected.toString()
           //console.log("getrefNoAfterAccount :"+row)
           if( row > 0 ){
             ref_no = resultt.recordset[0].Ref_No
             return callback(ref_no)
           }
            sql.close();
            //console.log("getrefNoAfterAccount  refno: " +ref_no)
            return callback(ref_no)
    }).catch(err => {
        console.log(err);
        sql.close();
        //return  callback(err)
    });
        }catch (error) {
            result = "ERROR Catch"
            console.log(error);
            return callback(error)
        }
    
}
async function SetRefno(accountno, callback){
    let statement = `SELECT Ref_No  FROM MFTS_Account  WHERE Account_No = '${accountno}'  `
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            rowsAffected = result.rowsAffected
            // console.log("rows :"+ rowsAffected)
            if (rowsAffected > 0){   
                ref_no = result.recordset[0].Ref_No 
            }
            sql.close();
            // console.log(ref_no)
            return callback(ref_no)
        }).catch(err => {
            console.log(err);
            sql.close();
            return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }
}
async function insertMFtsAcccount(accountno, unitholder ,Amc_Id,   callback){
    let  ref_no
    let  statement = `SELECT * FROM  Account_Info WHERE (Cust_Code = '${accountno}')`
    let datenow 
    await getdatetime( (dt) =>{datenow = dt  })
    let usercreated = "146"
    //console.log(statement)
    await getRefx("Ref_No",1 , (ref)=>{ref_no = ref })
    // console.log("Amc_Id :" + Amc_Id)
    // console.log("unitholder :" + unitholder)
    if(unitholder.substring(0,2)=== "DM"){unitholder = null}
try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
           let rowsAffected = result.rowsAffected
            //   console.log("result Account_Info :"+ rowsAffected)
            if (rowsAffected > 0){
                let Title_Name_T            = result.recordset[0].Title_Name_T
                let First_Name_T            = result.recordset[0].First_Name_T
                let Last_Name_T             = result.recordset[0].Last_Name_T
                let Birth_Day               = result.recordset[0].Birth_Day
                let Title_Name_E            = result.recordset[0].Title_Name_E
                let First_Name_E            = result.recordset[0].First_Name_E
                let Last_Name_E             = result.recordset[0].Last_Name_E
                let Nation_Code             = result.recordset[0].Nation_Code
                let Sex                     = result.recordset[0].Sex
                let Mobile_no               = result.recordset[0].Mobile
                let Email                   = result.recordset[0].Email
                let Married_Status          = null
                let OpenDate                = result.recordset[0].Create_Date
                let Create_By               = "146"
                let typeaccount             = "RED"
                
                let insertMFtsAcccount = `INSERT INTO MFTS_ACCOUNT(Ref_No, Account_No ,First_Name_T, Last_Name_T, Birth_Day, Holder_Id ,Create_By
                                            ,Create_Date ,Modify_By, Modify_Date, Amc_Id, Open_Date	,Title_Name_E, First_Name_E
                                            ,Last_Name_E, Nation_Code, Title_Name_T, Sex, Mobile_no, Email, Married_Status
                                            ,PID_Type, PID_No, Tax_No, PayRedemption_Type, Detuct_Tax, PresentAddr_Flag, OfficeAddr_Flag
                                            ,HaveFixedIncome, HaveEquity, HaveFund, Corp_Type_Id, Marketing_Code, Client_Acc_Type
                                            ,Status_Id, Submit_By, Submit_Date, Completed_By, Completed_Date, FeeRate_Group, Input_Type
                                            ,Status_API, Occupation_Code)
                                            VALUES(@Ref_No, @Account_No, @First_Name_T, @Last_Name_T, @Birth_Day, @Holder_Id ,@Create_By
                                            ,@Create_Date ,@Modify_By, @Modify_Date, @Amc_Id, @Open_Date ,@Title_Name_E, @First_Name_E,
                                            @Last_Name_E, @Nation_Code, @Title_Name_T, @Sex, @Mobile_no, @Email, @Married_Status
                                            ,@PID_Type, @PID_No, @Tax_No, @PayRedemption_Type ,@Detuct_Tax, @PresentAddr_Flag, @OfficeAddr_Flag
                                            ,@HaveFixedIncome, @HaveEquity, @HaveFund, @Corp_Type_Id, @Marketing_Code, @Client_Acc_Type
                                            ,@Status_Id, @Submit_By, @Submit_Date, @Completed_By, @Completed_Date, @FeeRate_Group, @Input_Type
                                            ,@Status_API, @Occupation_Code)`
                new sql.ConnectionPool(config).connect().then(pool => {
                    return pool.request()
                    .input("Ref_No",                            sql.VarChar(12),                ref_no)
                    .input("Account_No",                        sql.VarChar(20),                accountno)
                    .input("Title_Name_T",                      sql.NVarChar(20),                Title_Name_T)
                    .input("First_Name_T",                      sql.NVarChar(200),              First_Name_T)
                    .input("Last_Name_T",                      sql.NVarChar(200),              Last_Name_T)
                    .input("Birth_Day",                         sql.DateTime,                   Birth_Day)
                    .input("Holder_Id",                         sql.VarChar(30),                unitholder)
                    .input("Create_By",                         sql.VarChar(20),                Create_By)
                    .input("Modify_By",                         sql.VarChar(20),                Create_By)
                    .input("Create_Date",                       sql.DateTime,                   datenow)
                    .input("Modify_Date",                       sql.DateTime,                   datenow)
                    .input("Amc_Id",                            sql.Int,                        Amc_Id)
                    .input("Open_Date",                         sql.DateTime,                   OpenDate)
                    .input("Title_Name_E",                      sql.VarChar(20),                Title_Name_E)
                    .input("First_Name_E",                      sql.NVarChar(200),              First_Name_E)
                    .input("Last_Name_E",                       sql.NVarChar(200),              Last_Name_E)
                    .input("Nation_Code",                       sql.NVarChar(200),              Nation_Code)
                    .input("Sex",                               sql.Char(1),                    Sex)
                    .input("Mobile_No",                         sql.VarChar(20),                Mobile_no)
                    .input("Email",                             sql.NVarChar(100),              Email)
                    .input("Married_Status",                    sql.Char(1),                    Married_Status)
                    .input("PID_Type",                          sql.Char(1),                    "C")
                    .input("PID_No",                            sql.VarChar(20),                accountno)
                    .input("Tax_No",                            sql.VarChar(20),                accountno)
                    .input("PayRedemption_Type",                sql.Char(1),                    "A")
                    .input("Detuct_Tax",                        sql.Char(1),                    "1")
                    .input("PresentAddr_Flag",                  sql.Char(1),                    "P")
                    .input("OfficeAddr_Flag",                   sql.Char(1),                    "O")
                    .input("HaveFixedIncome",                   sql.Char(1),                    "0")
                    .input("HaveEquity",                        sql.Char(1),                    "0")
                    .input("HaveFund",                          sql.Char(1),                    "0")
                    .input("Corp_Type_Id",                      sql.Char(1),                    "0")
                    .input("Marketing_Code",                    sql.Int,                        95)
                    .input("Client_Acc_Type",                   sql.Char(1),                    "1")
                    .input("Status_Id",                         sql.Int,                          7)
                    .input("Submit_By",                         sql.VarChar(20),                 95)
                    .input("Submit_Date",                       sql.DateTime,                   datenow)
                    .input("Completed_By",                      sql.VarChar(20),                95)
                    .input("Completed_Date",                    sql.DateTime,                   datenow)
                    .input("FeeRate_Group",                     sql.Int,                        1)
                    .input("Input_Type",                        sql.VarChar(10),                "key")
                    .input("Status_API",                        sql.NChar(10),                  "I")
                    .input("Occupation_Code",                   sql.NChar(10),                  null)
                    .query(insertMFtsAcccount);
                }).then(result =>{
                    if(result.rowsAffected > 0 ){
                        console.log("****Insert MFTS_ACCOUNT ref_no  :" + ref_no)
                        return callback(ref_no)
                    }
                }).catch(err => {
                    console.log(err);
                    sql.close();
                    //return  callback(err)
                });
            }
            sql.close();
            // console.log(ref_no)
            return callback(ref_no)
        }).catch(err => {
            console.log("insert error")
            console.log(err);
            sql.close();
            return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }
    return callback(ref_no)
}
async function getRefx(typeno,flag , callback){
    let refno ,turnRef
    await getrefnumber(typeno,flag, (x)=>{refno = x})
    // console.log("ref no " + refno + " ... "+ refno.toString().length)
    switch (refno.toString().length) {
        case 4:
            turnRef = "M0000000"
            break;
        case 5:
            turnRef = "M000000"
            break;
        case 6:
            turnRef = "M00000"
            break;
        case 7:
            turnRef = "M0000"
            break;
        case 8:
            turnRef = "M000"
            break;
    }
    // console.log(turnRef+refno)
    return callback(turnRef+refno)
}
async function getrefnumber(refcode,segno, callback){
    let RefNo
    try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .input('centercode' , sql.Char(15), refcode)
          .input('transeq' ,sql.Int, segno)
          .execute(`[dbo].[usp_gettranidref]`);
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          sql.close();
         // console.log(result.returnValue)
          return callback(result.returnValue)
      }).catch(err => {
          console.log(err);
          sql.close();
          return  callback(err)
      });
  }catch (error) {
      // result = "ERROR Catch"
      // console.log(error);
      return callback(error)
  }


}

async function SelectSwitchOut(callback){
    let timestampx
        const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
          timestampx = year +"-"+  month  +"-"+ date + " 00:00:00.000"
        //timestampx = year  +  month  + date
 
    let statement = `SELECT Tran_No ,TRANSACTION_DATE,transactionId ,TRANTYPECODEX  FROM MFTS_Transaction 
                        WHERE    Create_date >= '${timestampx}' 
                        AND     TRANTYPECODEX IN('SWO','SWI','TRI','TRO','XSI','XSO') 
                        Order by transactionId`
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            sql.close();
            // console.log(ref_no)
            let row = result.rowsAffected
            if( row > 0 ){console.log("Find row for switch tran no : "+ row)}
            return  callback(result.recordset) 
        }).catch(err => {
            console.log(err);
            sql.close();
            return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }
}

async function updataSwitchOut(datarows){
    if(datarows == false){return }
    // console.log(datarows)
    let transactionId_old = null ,Tran_No_old = null

    for (let key = 0; key < datarows.length; key++) {
        // const element = array[index];
        let Tran_No                = datarows[key].Tran_No
        let TRANTYPECODE       = datarows[key].TRANTYPECODEX
        let transactionId          = datarows[key].transactionId
        // console.log("transaction : " + transactionId)
        // console.log("transactionold : " + transactionId_old)
        if (transactionId === transactionId_old){
            console.log(transactionId +" <<== new <><> old =>> "+transactionId_old)
            let statement = `UPDATE MFTS_Transaction SET Tran_No = '${Tran_No_old}' WHERE   transactionId ='${transactionId}' `
            try
            { 
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
            }).then(result => {
                sql.close();
                  console.log('Update Tran no MFTS_Transaction ')
                //return  callback(result.recordset) 
            }).catch(err => {
                console.log(err);
                sql.close();
               // return  callback(err)
            });
            }catch (error) {
                result = "ERROR Catch"
                console.log(error);
                //return callback(error)
            }
        }

        transactionId_old   = transactionId
        Tran_No_old         = Tran_No

        
    }
    

}
async function insertlogoderquery(datarows ,callback){
    let dateserver 
    await getdatetime( (dt) =>{dateserver = dt  })
   try{     
        const cardNumber            = datarows[0].accountId
        const HolderNo              = datarows[0].unitholderId
        const AMCID                 = datarows[0].Amc_Id
        let tranTypeCode            = datarows[0].orderType //"SWI" 
        let amountbaht              = datarows[0].amount
        let TranStatus              = datarows[0].statusx
        let transactionId           = datarows[0].transactionId
        let desc        = "ข้อมูล Order transaction  ซ้ำ รหัสบัตประชาชน "+ cardNumber + " และ Fund ID  "+fund_id + "| transactionId "+ transactionId
        let statement   = "INSERT INTO Fund_Errlog_TransferData (Descriptions, TimeLines, Status, AccountNo, HolderId) \
                            VALUES (@Descriptions, @TimeLines, @Status, @AccountNo, @HolderId)   "
        
        new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
            .input("Descriptions",              sql.NVarChar(100),              desc)
            .input("TimeLines",                 sql.DateTime,                   dateserver)
            .input("Status",                    sql.NChar(10),                  "")
            .input("AccountNo",                 sql.Char(1),                    cardNumber)
            .input("Status_Id",                 sql.Int,                        TranStatus)
            .input("HolderId",                  sql.VarChar(20),                HolderNo)
            .query(statement);
        }).then(result =>{
            if(result.rowsAffected > 0 ){
            console.log("****Insert Fund_Errlog_TransferData Account No Is  :" + cardNumber)
            // return callback(ref_no)
            }
        }).catch(err => {
            console.log(err);
            sql.close();
        //return  callback(err)
        });
   }catch (error) {
    result = "ERROR Catch"
    // console.log(error);
    //return callback(error)
}

}
export {selctDataOrderQuery ,impoertOrderQuery ,checkDataOrderInquiry ,SelectSwitchOut ,updataSwitchOut ,checkDataDupOrderInquiry}