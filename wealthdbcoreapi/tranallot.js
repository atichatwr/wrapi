import express from 'express';
import sql  from 'mssql';
import dotenv from 'dotenv';
// import axios from 'axios';
// import fs from 'fs';
//import cors from 'cors';

// import { parse } from 'csv-parse';
// import unzipper from 'unzipper';
import { config } from './dbconfig.js';
import poolPromise from './db.js';

import {update_MFTS_TRANSACTION, InsertMFTS_TRANSACTION} from './dbsql.js';
import { AllottedTransactions } from './impsql.js';
import { constants } from 'buffer';
import { resolve } from 'path';
import { exit } from 'process';
import { cardNumber } from '../fundconn/dataTest.js';
// import { getFundConnIndividualProfile } from '../fundconn/funconPipe.js';
import {getdate 
    ,logData
    ,getRefNoOfAccount
    ,getTranNumber
    ,convertMKTID
    ,getFundID} from './tranwait.js'
dotenv.config();

async function SelectTransactionAllot(callback){
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
  
    let date_yesterday = year_yt  + month_yt  + dateyt
    //-----[test ]
    // date_yesterday = '20220621'
    //let statement = "effective_date >= '"+date_yesterday+"' AND effective_date <='"+date_present+ "'" 
  
    try 
    {
    let data_row = 0
    let statement = `SELECT   dbo.MFTS_Fund.Fund_Id, dbo.Fund_Cen_AllottedTransactions.TRANS_DATE, dbo.Fund_Cen_AllottedTransactions.AMC_CODE, dbo.Fund_Cen_AllottedTransactions.FILTER01, 
                        dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID, dbo.Fund_Cen_AllottedTransactions.TRANS_CODE, dbo.Fund_Cen_AllottedTransactions.FUND_CODE, 
                        dbo.Fund_Cen_AllottedTransactions.AMOUNT, dbo.Fund_Cen_AllottedTransactions.UNIT, dbo.Fund_Cen_AllottedTransactions.EFFECTIVE_DATE, 
                        dbo.Fund_Cen_AllottedTransactions.ALLOTED_AMOUNT, dbo.Fund_Cen_AllottedTransactions.ALLOTED_UNIT, dbo.Fund_Cen_AllottedTransactions.ALLOTED_NAV, 
                        dbo.Fund_Cen_AllottedTransactions.ALLOTMENT_DATE, dbo.Fund_Cen_AllottedTransactions.NAV_DATE, dbo.Fund_Cen_AllottedTransactions.IC_CODE, 
                        dbo.Fund_Cen_AllottedTransactions.timestampx, dbo.Fund_Cen_AllottedTransactions.flx, dbo.Fund_Cen_AllottedTransactions.APPROVAL_CODE, dbo.Fund_Cen_AllottedTransactions.STATUS, 
                        dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID, dbo.Fund_Cen_UnitholderBalance.UNIT_BALANCE, dbo.Fund_Cen_UnitholderBalance.AMOUNT AS AMOUNT_U, 
                        dbo.Fund_Cen_UnitholderBalance.AVAILABLE_UNIT_BALANCE, dbo.Fund_Cen_UnitholderBalance.AVAILABLE_AMOUNT, dbo.Fund_Cen_UnitholderBalance.PENDING_UNIT, 
                        dbo.Fund_Cen_UnitholderBalance.PENDING_AMOUNT, dbo.Fund_Cen_UnitholderBalance.PLEDGE_UNIT, dbo.Fund_Cen_UnitholderBalance.AVERAGE_COST, 
                        dbo.Fund_Cen_UnitholderBalance.NAV, dbo.Fund_Cen_UnitholderBalance.NAV_DATE AS NAVDATE, dbo.MFTS_Amc.Amc_Id, dbo.Fund_Cen_AllottedTransactions.NET_UNITHOLDER_REF_NO, 
                        dbo.Fund_Cen_AllottedTransactions.OVERRIDE_RISK_FLAG, dbo.Fund_Cen_AllottedTransactions.OVERRIDE_FX_RISK_FLAG, dbo.Fund_Cen_AllottedTransactions.REDEMPTION_TYPE, 
                        dbo.Fund_Cen_AllottedTransactions.FILTER02, dbo.Fund_Cen_AllottedTransactions.FILTER03, dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE, 
                        dbo.Fund_Cen_AllottedTransactions.BANK_CODE, dbo.Fund_Cen_AllottedTransactions.BANK_ACCOUNT, dbo.Fund_Cen_AllottedTransactions.CHEQUE_NO, 
                        dbo.Fund_Cen_AllottedTransactions.CHEQUE_DATE, dbo.Fund_Cen_AllottedTransactions.IC_LICENSE, dbo.Fund_Cen_AllottedTransactions.BRANCH_NO, 
                        dbo.Fund_Cen_AllottedTransactions.CHANNEL, dbo.Fund_Cen_AllottedTransactions.FORCE_ENTRY, dbo.Fund_Cen_AllottedTransactions.LTF_CONDITION, 
                        dbo.Fund_Cen_AllottedTransactions.REASON_TOSELL_LTF_RMF, dbo.Fund_Cen_AllottedTransactions.RMF_CAPITAL_WHTAX_CHOICE, 
                        dbo.Fund_Cen_AllottedTransactions.RMF_CAPITAL_REDEEM_CHOICE, dbo.Fund_Cen_AllottedTransactions.AUTO_REDEEM_CODE, dbo.Fund_Cen_AllottedTransactions.AMC_ORDER_REF, 
                        dbo.Fund_Cen_AllottedTransactions.FEE, dbo.Fund_Cen_AllottedTransactions.WH_TAX, dbo.Fund_Cen_AllottedTransactions.VAT, dbo.Fund_Cen_AllottedTransactions.BROKERAGE_FEE, 
                        dbo.Fund_Cen_AllottedTransactions.WH_TAX_LTF_RTF, dbo.Fund_Cen_AllottedTransactions.AMC_PAY_DATE, dbo.Fund_Cen_AllottedTransactions.REGISTER_TRANS_FLAG, 
                        dbo.Fund_Cen_AllottedTransactions.SALE_ALL_UNIT_FLAG, dbo.Fund_Cen_AllottedTransactions.SETTLE_BANK_CODE, dbo.Fund_Cen_AllottedTransactions.SETTLE_BANK_ACCOUNT, 
                        dbo.Fund_Cen_AllottedTransactions.REJECT_REASON, dbo.Fund_Cen_AllottedTransactions.CHQ_BRANCH, dbo.Fund_Cen_AllottedTransactions.TAX_INVOICE_NO, 
                        dbo.Fund_Cen_AllottedTransactions.AMC_SWITCHING_ORDER_NO, dbo.Fund_Cen_AllottedTransactions.BROKERAGE_FEE_VAT, dbo.Fund_Cen_AllottedTransactions.CREDIT_CARD_ISSUER, 
                        dbo.Fund_Cen_AllottedTransactions.COLLATERAL_AMT, dbo.Fund_Cen_AllottedTransactions.FILTER05, dbo.Fund_Cen_AllottedTransactions.FILTER06, 
                        dbo.Fund_Cen_AllottedTransactions.FILTER04
                    FROM         dbo.Fund_Cen_AllottedTransactions INNER JOIN
                        dbo.MFTS_Amc ON dbo.Fund_Cen_AllottedTransactions.AMC_CODE = dbo.MFTS_Amc.Amc_Code INNER JOIN
                        dbo.MFTS_Fund ON dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.MFTS_Fund.Fund_Code LEFT OUTER JOIN
                        dbo.Fund_Cen_UnitholderBalance ON dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID = dbo.Fund_Cen_UnitholderBalance.UNITHOLDER_ID AND 
                        dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.Fund_Cen_UnitholderBalance.FUND_CODE
                    WHERE     (dbo.Fund_Cen_AllottedTransactions.STATUS = 'ALLOTTED')
                    ORDER BY dbo.Fund_Cen_AllottedTransactions.AMC_CODE `

    //console.log(statement)
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //console.log(result);
        data_row = result.rowsAffected.toString();
        console.log("result Tran Allot: "+ data_row +" row")
        sql.close();
        //if ()
        return  callback(result.recordsets) 
  
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
async function ImportTransactionAllot(datarows,callback){
    let Create_By               = '157'
    let Modify_By               = '95' // ห้ามหลุด
    let APIstatus               = "U"
    let Modify_Date             
    let modify_time             = '15:30'
    //console.log(datarows[0])
    for ( let key in datarows[0]) {
        try
        { 
            let cardNumber          = datarows[0][key].FILTER01
            let HolderNo            = datarows[0][key].UNITHOLDER_ID
            let AMCID               = datarows[0][key].Amc_Id
            let TranDate            = datarows[0][key].TRANS_DATE
            let Allow               = datarows[0][key].STATUS
            let AmountBaht          = datarows[0][key].AMOUNT
            let AmountUnit          = datarows[0][key].ALLOTED_UNIT
            let NavPrice            = datarows[0][key].ALLOTED_NAV
            let EFFECTIVEDATEx       = datarows[0][key].EFFECTIVE_DATE
            let MKTIID              = datarows[0][key].IC_CODE
            let average_cost        = datarows[0][key].AVERAGE_COST
            let unit_balance        = datarows[0][key].UNIT_BALANCE
            let Fundcode            = datarows[0][key].FUND_CODE
            let Alloted_Amount      = datarows[0][key].ALLOTED_AMOUNT
            let Alloted_Nav         = datarows[0][key].ALLOTED_NAV
            let Alloted_Unit        = datarows[0][key].ALLOTED_UNIT
            let tranTypecode        = datarows[0][key].TRANS_CODE
            let RefNo
            let FundNumber 
            await GetFundCode(Fundcode , AMCID ,(fno)=>{FundNumber = fno})
            // console.log(Fundcode + " : "+ HolderNo)
            if (FundNumber === 0){ await logData("AllotedTransaction " ,cardNumber, HolderNo )}

            let executedate_db          = EFFECTIVEDATEx.substring(0,4) + "/" + EFFECTIVEDATEx.substring(4,6)  + "/" + EFFECTIVEDATEx.substring(6,8)
            let trandate_db             = TranDate.substring(0,4) + "/" + TranDate.substring(4,6)  + "/" + TranDate.substring(6,8)
                       
            let createdate
            await getdate((crdate)=>{createdate = crdate})
            
            let status_db
            if(Allow === "ALLOTTED"){ status_db = 7}else{status_db = 5}

            let trancode_db , balanceNav , balanceAvg, realizeGi
            if       (tranTypecode === "SUB"){  trancode_db = "B"
            }else if (tranTypecode === "RED"){  trancode_db = "S"
                        balanceNav = Alloted_Unit * Alloted_Nav
                        balanceAvg = Alloted_Unit * average_cost
                        if(Alloted_Nav > 0 && average_cost >0 ){realizeGi = balanceNav - balanceAvg }
            }else if (tranTypecode === "TRI"  ){  trancode_db = "TI"
            }else if (tranTypecode === "TRO"  ){
                        balanceNav = Alloted_Unit * Alloted_Nav
                        balanceAvg = Alloted_Unit * average_cost
                        if(Alloted_Nav > 0 && average_cost >0 ){realizeGi = balanceNav - balanceAvg }
                        tranTypecode_db = "TO"
            }else if (tranTypecode === "SWI"){  trancode_db = "SI"
            }else if (tranTypecode === "SWO"){  trancode_db = "SO"
                        balanceNav = Alloted_Unit * Alloted_Nav
                        balanceAvg = Alloted_Unit * average_cost
                        if(Alloted_Nav > 0 && average_cost >0 ){realizeGi = balanceNav - balanceAvg }
            }else if (tranTypecode === "XSO"){
                trancode_db = "TO"
                await insertTransactionAllot(datarows[0][key])
            }
            else if (tranTypecode === "XSI"){
                trancode_db = "TI"
                console.log(tranTypecode)
                await    insertTransactionAllot(datarows[0][key])
            }
            //console.log("tranTypecode "+ tranTypecode)

            await getRefNoOfAccount(cardNumber,HolderNo ,(result)=>{ RefNo = result })
            if(realizeGi === undefined || realizeGi ===""){realizeGi = 0.000000}
            // console.log(Fundcode)
            let maxx
            await getMaxSeqNo(Fundcode,HolderNo,(maxseq)=>{maxx = maxseq})
            //console.log(maxx + "status_db "+ status_db)
            if (maxx > 0 && status_db === 7){
                let statementx = ` UPDATE MFTS_Transaction
                                    SET APIstatus        ='${APIstatus}',
                                    RGL              =${realizeGi},
                                    Amount_Unit      =${Alloted_Unit},
                                    Amount_Baht      =${Alloted_Amount},
                                    Unit_balance     =${Alloted_Unit},
                                    NAV_PRICE        = ${Alloted_Nav},
                                    Status_Id        = ${status_db} 
                                    WHERE MFTS_Transaction.FUNDCODEI ='${Fundcode}'  AND UNITHOLDERI  ='${HolderNo}'  `
                //console.log(statementx)
                await new sql.ConnectionPool(config).connect().then(pool => {   
                    return pool.request()
                    .input("APIstatus"          , sql.NChar(10),     APIstatus)
                    .input("RGL"                , sql.Decimal(20,6), realizeGi)
                    .input("Amount_Unit"        , sql.Numeric(18,4), Alloted_Unit)
                    .input("Amount_Baht"        , sql.Numeric(25,2), Alloted_Amount)
                    .input("Unit_balance"       , sql.Numeric(18,4), Alloted_Unit)
                    .input("NAV_PRICE"          , sql.Numeric(18,4), Alloted_Nav)
                    .input("Status_Id"          , sql.TinyInt,      status_db)
                    .input("Modify_Date"        , sql.DateTime,     createdate)
                    .input("FUNDCODEI"          , sql.NChar(30),    Fundcode)
                    .input("UNITHOLDERI"        , sql.NChar(30),    HolderNo)
                    .query(update_MFTS_TRANSACTION);
                
                }).then(result => {
                    sql.close();
                   // console.log(result);
                    let complete = result.rowsAffected
                    // console.log("Number of records inserted:" + result.rowsAffected);
                    if (complete > 0){
                        console.log("ALLOT Fund ID: " +FundNumber +" Update MFTS_TRANSACTION Complete");
                        logData("AllotedTransaction" +Fundcode+ "Complete" ,cardNumber, HolderNo )
                    }
                    
                   
                    // return callback(result);
                    
                }).catch(err => {
                    // console.log("ERROR =>>>>"+Fundcode)
                    console.log(err);
                    sql.close();
                    // return callback(err);
                    logData("AllotedTransaction" +Fundcode+ "Not Complete" ,cardNumber, HolderNo )
                });
            }
           if (status_db === 7){ await unitBalanceUpdate(RefNo,HolderNo,cardNumber,Fundcode,FundNumber ,(x)=>{ }) }
        }catch{

        }
    }
    
    return callback(datarows)
}
async function GetFundCode(fundcode ,amcid , callback){
    let statement = `SELECT Fund_Id  FROM MFTS_Fund  WHERE Fund_Code = '${fundcode}' AND AMC_id = ${amcid} `  
    //console.log(statement)
     try
     { 
         await new sql.ConnectionPool(config).connect().then(pool => {
             return pool.request()
             .query(statement);
             
         }).then(result => {
             let rowsAffected = result.rowsAffected.toString()
             let fund_id = 0
             if (rowsAffected > 0){  fund_id = result.recordset[0].Fund_Id.toString()  }
             sql.close();
             //console.log(fund_id)
             return callback(fund_id)
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
async function getMaxSeqNo(fundcode,unitholder , callback){
    let statement = `SELECT isnull(max(Seq_No),0) +1 AS maxx  FROM MFTS_Transaction  WHERE FUNDCODEI = '${fundcode}' AND UNITHOLDERI = '${unitholder}'`
    // console.log(statement)
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
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
async function unitBalanceUpdate(RefNo,HolderNo,cardNumber,Fundcode,fundNo ,callback){
    let statementNAVDate     = `Select Max(NAV_DATE)  AS maxx  FROM Fund_Cen_UnitholderBalance  WHERE ACCOUNT_ID = '${cardNumber}' AND UNITHOLDER_ID = '${HolderNo}' AND FUND_CODE ='${Fundcode}'`    
    let statementUnitBalance = `Select Max(NAV_DATE)  AS maxx  FROM Fund_Cen_UnitholderBalance  WHERE ACCOUNT_ID = '${cardNumber}' AND UNITHOLDER_ID = '${HolderNo}' AND FUND_CODE ='${Fundcode}'`    
    let max_date
    await getNavDateUnitholder(statementNAVDate ,(maxx)=>{max_date = maxx})
    //console.log("maxx + max_date" + max_date)
    let unitbalance
    await getUnitBalanceUnitholder(statementUnitBalance , (unit)=>{unitbalance = unit})
    //console.log("unitbalance : " + unitbalance)
    if(unitbalance === undefined || unitbalance ===""){unitbalance = 0}
    if(unitbalance > 0 ){
        let Stratus = "U"
        let dateserver
        await getdate((dateserv)=>{dateserver = dateserv}) 

        try{
            let statement = `Update MFTS_UnitBalance
                                SET  Confirm_Unit       = ${unitbalance},
                                     APIstatus          = '${Stratus}' ,
                                     Modify_Date        = @Modify_Date
                                Where Fund_ID =${fundNo}  AND Ref_No ='${RefNo}'`
            //console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Modify_Date",       sql.DateTime,       dateserver)
            .query(statement);
            }).then(result => {
                let rowsAffected = result.rowsAffected.toString()
                sql.close();
                if (rowsAffected> 0){ console.log("Update UnitBalance Sueccess")}
                return callback("Update UnitBalance Sueccess")
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
}
async function getNavDateUnitholder(statement ,callback){
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            // let fund_id = 0
            let max
            if (rowsAffected > 0){   max = result.recordset[0].maxx  }
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
async function getUnitBalanceUnitholder(statement ,callback){
    try
    { 
       // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            // let fund_id = 0
            let unitbalancee
            if (rowsAffected > 0){   unitbalancee = result.recordset[0].maxx  }
            sql.close();
            //console.log(unitbalancee)
            return callback(unitbalancee)
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
async function insertTransactionAllot(datarows ,callback){
    //console.log(datarows)
    try{
        let cardNumber          = datarows.FILTER01
        let HolderNo            = datarows.UNITHOLDER_ID
        let AMCID               = datarows.Amc_Id
        let TranDate            = datarows.TRANS_DATE
        let Allow               = datarows.STATUS
        let AmountBaht          = datarows.AMOUNT
        let AmountUnit          = datarows.ALLOTED_UNIT
        let NavPrice            = datarows.ALLOTED_NAV
        let EFFECTIVEDATEx      = datarows.EFFECTIVE_DATE
        let MKTIID              = datarows.IC_CODE
        let average_cost        = datarows.AVERAGE_COST
        let unit_balance        = datarows.UNIT_BALANCE
        let Fundcode            = datarows.FUND_CODE
        let Alloted_Amount      = datarows.ALLOTED_AMOUNT
        let Alloted_Nav         = datarows.ALLOTED_NAV
        let Alloted_Unit        = datarows.ALLOTED_UNIT
        let tranTypecode        = datarows.TRANS_CODE
        let AccountInfo             = datarows.FILTER01
        let unitholder              = datarows.UNITHOLDER_ID
        let tranTypeCode_db         = datarows.TRANS_CODE
        let amountbaht              = datarows.AMOUNT
        let amountunit              = datarows.ALLOTED_UNIT
        let unitbalance             = datarows.UNIT_BALANCE
        let allottedUnit            = datarows.ALLOTED_UNIT
        let allottedNAV             = datarows.ALLOTED_NAV
        let Cardnumber              = datarows.FILTER01
        let navprice                = datarows.ALLOTED_NAV
        let Mktid                   = datarows.IC_CODE
        let RefNo
        let fundId
        let seqno
        let mkktid
        let statusApprov
        let Create_By               = '157'
        let Modify_By               = '95' // ห้ามหลุด
        let API                     ='U'
        let Modify_Date             
        let modify_time             = '15:30'
        let Source_Flag = "F"
          await convertMKTID(Mktid , (id)=>{ mkktid = id })

          await getFundID(datarows.FUND_CODE ,(id) =>{ fundId =id })
            let FundNumber 
            await   GetFundCode(Fundcode , AMCID ,(fno)=>{FundNumber = fno})
            if (FundNumber === 0){  logData("AllotedTransaction " ,Cardnumber, HolderNo )}
            let executedate             = datarows.EFFECTIVE_DATE.substring(0,4) + "/" + datarows.EFFECTIVE_DATE.substring(4,6)  + "/" + datarows.EFFECTIVE_DATE.substring(6,8) 
            let trandate                =datarows.TRANS_DATE.substring(0,4) + "/" + datarows.TRANS_DATE.substring(4,6)  + "/" + datarows.TRANS_DATE.substring(6,8) 
            let executedate_db          = EFFECTIVEDATEx.substring(0,4) + "/" + EFFECTIVEDATEx.substring(4,6)  + "/" + EFFECTIVEDATEx.substring(6,8)
            let trandate_db             = TranDate.substring(0,4) + "/" + TranDate.substring(4,6)  + "/" + TranDate.substring(6,8)
        //console.log("FundNumber  :"+FundNumber) 
            let createdate
            await getdate((crdate)=>{createdate = crdate})
            
            let status_db
            if(Allow === "ALLOTTED"){ status_db = 7}else{status_db = 5}

            let trancode_db , balanceNav , balanceAvg, realizeGi
            if       (tranTypecode === "SUB"){  trancode_db = "B"
            }else if (tranTypecode === "RED"){  trancode_db = "S"
                        balanceNav = Alloted_Unit * Alloted_Nav
                        balanceAvg = Alloted_Unit * average_cost
                        if(Alloted_Nav > 0 && average_cost >0 ){realizeGi = balanceNav - balanceAvg }
            }else if (tranTypecode === "TRI"){  trancode_db = "TI"
            }else if (tranTypecode === "TRO"){
                        balanceNav = Alloted_Unit * Alloted_Nav
                        balanceAvg = Alloted_Unit * average_cost
                        if(Alloted_Nav > 0 && average_cost >0 ){realizeGi = balanceNav - balanceAvg }
                        trancode_db = "TO"
            }else if (tranTypecode === "SWI"){  trancode_db = "SI"
            }else if (tranTypecode === "SWO"){  trancode_db = "SO"
                        balanceNav = Alloted_Unit * Alloted_Nav
                        balanceAvg = Alloted_Unit * average_cost
                        if(Alloted_Nav > 0 && average_cost >0 ){realizeGi = balanceNav - balanceAvg }
            }else if (tranTypecode === "XSI"){ trancode_db = "TI"
            }else if (tranTypecode === "XSO"){
                        balanceNav = Alloted_Unit * Alloted_Nav
                        balanceAvg = Alloted_Unit * average_cost
                        if(Alloted_Nav > 0 && average_cost >0 ){realizeGi = balanceNav - balanceAvg }
                        trancode_db = "TO"
            }
            //   console.log(Cardnumber + " xxx  "+HolderNo)
            await getRefNoOfAccount(cardNumber,HolderNo ,(result)=>{ RefNo = result })
            if(realizeGi === undefined || realizeGi ===""){realizeGi = 0.000000}
            if(amountbaht === undefined || amountbaht ===""){amountbaht = 0.000000}
            if(amountunit === undefined || amountunit ===""){amountunit = 0.000000}
            if(navprice === undefined || navprice ===""){navprice = 0.000000}
            // console.log("realizeGi  ="+realizeGi)
            let maxx
            await getMaxSeqNo(Fundcode,HolderNo,(maxseq)=>{maxx = maxseq}) 
            let tranNo
            await getTranNumber(1,(no)=>{tranNo =no })
            if (datarows.STATUS === "WAITING") {statusApprov = 5}
            if (datarows.STATUS === "ALLOTTED") {statusApprov = 7}
        await poolPromise.then(pool => {
            return pool.request()
                .input("Tran_No",       sql.VarChar(12),    tranNo)
                .input("Ref_No",        sql.VarChar(12),    RefNo)
                .input("TranType_Code", sql.VarChar(2),     trancode_db)
                .input("Fund_Id",       sql.Int,            fundId )
                .input("Tran_Date",     sql.Date,         trandate)
                .input("Status_Id",     sql.TinyInt,        statusApprov)
                .input("Source_Flag",   sql.Char(1),        Source_Flag)
                .input("Amount_Baht",   sql.Numeric(18,2),  amountbaht)
                .input("Amount_Unit",   sql.Numeric(18,4),  amountunit)
                .input("APIstatus",     sql.NChar(10),      'I')
                .input("NAV_PRICE",     sql.Numeric(18,4),  navprice)
                .input("ExecuteDate",   sql.Date,       executedate)
                .input("Act_ExecDate",  sql.Date,       executedate)
                .input("Seq_No",        sql.Int,            maxx)
                .input("Mktid",         sql.Int,            mkktid )
                .input("Create_by",     sql.VarChar(20),    Create_By)
                .input("Create_date",   sql.DateTime,       createdate)
                .input("Unit_Balance",  sql.Decimal(18,4),  unitbalance)
                .input("AVG_Cost",      sql.Float,          average_cost)
                .input("Total_Cost",    sql.Decimal(18,4),   amountbaht  )
                .input("Modify_By",     sql.VarChar(20),    Modify_By)
                .input("FeeRate_Group", sql.Int,              1 )
                .input("Modify_Date",   sql.DateTime,           executedate)
                .input("RGL",           sql.Decimal(20,6),  realizeGi)
                .input("FUNDCODEI",     sql.NChar(30),    datarows.FUND_CODE)
                .input("UNITHOLDERI",   sql.NChar(30),    unitholder)
                .input("IDACCOUNTI",    sql.NChar(30),    AccountInfo)
                .input("AMCCODEI",      sql.NChar(30),    datarows.AMC_CODE)
                .input("TranSaction_Date", sql.NChar(14), datarows.TRANS_DATE)
                .input("TRANTYPECODEX", sql.NChar(5),     tranTypecode)
                .query(InsertMFTS_TRANSACTION)
          }).then(result => {
              let row = result.rowsAffected
              let respx = " MFTS TRANSACTION  INSERT :" + result.rowsAffected + " record(s)";
              if(row > 0){console.log(respx);}
              
              sql.close();
             
          }).catch(err => {
              console.log(err);
              sql.close();
             // return callback(err);
          });
    }catch (error) {
    result = "ERROR Catch"
    console.log(error);
    // return callback(error)
    }
}
export {
    SelectTransactionAllot,
    ImportTransactionAllot
  }

//****************[ Created Date 2022 06 24  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/