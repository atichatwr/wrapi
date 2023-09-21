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

import {InsertMFTS_TRANSACTION} from './dbsql.js';
import { AllottedTransactions } from './impsql.js';
import { constants } from 'buffer';
import { resolve } from 'path';
import { exit } from 'process';
import { cardNumber } from '../fundconn/dataTest.js';
// import { getFundConnIndividualProfile } from '../fundconn/funconPipe.js';

dotenv.config();


async function SelectTransactionWaiting(callback){
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
  //date_yesterday = '20220616'
  //let statement = "effective_date >= '"+date_yesterday+"' AND effective_date <='"+date_present+ "'" 

  try 
  {
  let data_row = 0
//   let statement = `SELECT *  FROM VW_TRANSACTION_WAITING  WHERE  effective_date >= '${date_yesterday}'  AND effective_date <= '${date_present}'`
  let statement = `SELECT *  FROM VW_TRANSACTION_WAITING `
  //console.log(statement)
  await new sql.ConnectionPool(config).connect().then(pool => {
      return pool.request()
      .query(statement);

    }).then(result => {
      //console.log(result);
      data_row = result.rowsAffected.toString();
      console.log("result: "+ data_row)
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
async function ImportTransactionWaiting(datarows, callback){
  const today                 = new Date()
  const yesterday             = new Date(today)
  const yt                    = yesterday.setDate(yesterday.getDate()-1)     
  
  let date_ob                 = new Date(today);
  let date                    = ("0"+date_ob.getDate()).slice(-2); 
  let month                   = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
  let year                    = date_ob.getFullYear();
  let today_hours             = date_ob.getHours +":"
  let today_minutes           = date_ob.getMinutes + ":"
  let today_seconds           =  date_ob.getSeconds
  let date_present            = year +  month  + date
  let dateserver              //= new Date().toLocaleString("en-Us")//new Date().toISOString().slice(0, 19).replace('T', ' ');
  let Create_By               = '157'
  let Modify_By               = '95' // ห้ามหลุด
  let API                     ='U'
  let Modify_Date             
  let modify_time             = '15:30'
  
  await getdate( (dt) =>{dateserver = dt  })
  //console.log(dateserver)
  Modify_Date = date_present + today_hours +today_minutes +today_seconds
  

  for ( let key in datarows[0]) {
      try
      {   //setTimeout(() => {
          let executedate             = datarows[0][key].EFFECTIVE_DATE.substring(0,4) + "/" + datarows[0][key].EFFECTIVE_DATE.substring(4,6)  + "/" + datarows[0][key].EFFECTIVE_DATE.substring(6,8)
          //console.log(datarows[0][key].EFFECTIVE_DATE) //datas[0][key].fund_code
          let trandate                =datarows[0][key].TRANS_DATE.substring(0,4) + "/" + datarows[0][key].TRANS_DATE.substring(4,6)  + "/" + datarows[0][key].TRANS_DATE.substring(6,8) 
          let statusApprov
          if (datarows[0][key].STATUS === "WAITING") {statusApprov = 5}
          if (datarows[0][key].STATUS === "ALLOTTED") {statusApprov = 7}
          let AccountInfo             = datarows[0][key].FILTER01
          let unitholder              = datarows[0][key].UNITHOLDER_ID
          let tranTypeCode_db         = datarows[0][key].TRANS_CODE
          let amountbaht              = datarows[0][key].AMOUNT
          let average_cost            = datarows[0][key].AVERAGE_COST
          let amountunit              = datarows[0][key].ALLOTED_UNIT
          let tranTypecode
          let balanceNav , balanceAvg, realizeGi
          let unitbalance             = datarows[0][key].UNIT_BALANCE
          let allottedUnit            = datarows[0][key].ALLOTED_UNIT
          let allottedNAV             = datarows[0][key].ALLOTED_NAV
          let Cardnumber              = datarows[0][key].FILTER01
          let navprice                = datarows[0][key].ALLOTED_NAV
          let Mktid                   = datarows[0][key].IC_CODE
          if (tranTypeCode_db === "SUB") {
              if(amountbaht > 0 && average_cost > 0 ){amountunit = (amountbaht / average_cost)}
              tranTypecode            = "B"  // trancode
          }else if(tranTypeCode_db === "RED"){
              balanceNav              = allottedUnit * allottedNAV
              balanceAvg              = allottedUnit * average_cost
              if(allottedNAV > 0 && average_cost >0){ realizeGi = (balanceNav - balanceAvg)}
              if(amountbaht > 0 && average_cost > 0 ){amountunit = (amountbaht / average_cost); unitbalance = amountunit}
              tranTypecode            = "S" 
          }else if (tranTypeCode_db === "TRI" || tranTypeCode_db === "XSI"){
              if (amountbaht > 0 ) {amountunit = (amountbaht/average_cost)}
              tranTypecode = "TI"
          }else if (tranTypeCode_db === "TRO"  || tranTypeCode_db === "XSO"){
              balanceNav = allottedUnit * allottedNAV
              balanceAvg = allottedUnit * average_cost
              if (allottedNAV > 0 && average_cost >0){realizeGi = balanceNav - balanceAvg}
              if (amountbaht > 0 && average_cost >0 ){ amountunit = (amountbaht / average_cost)}
              tranTypecode === "TO"
          }else if (tranTypeCode_db === "SWI" ){
              if(amountbaht > 0 && average_cost > 0 ){amountunit = (amountbaht / average_cost)}
              tranTypecode = "SI"
          }else if (tranTypeCode_db === "SWO" ){
              balanceNav = allottedUnit * allottedNAV
              balanceAvg = allottedUnit * average_cost
              if (allottedNAV > 0 && average_cost >0){realizeGi = balanceNav - balanceAvg}
              statusApprov = 8
              tranTypecode = "SO"
          }
          if(realizeGi === undefined || realizeGi ===""|| realizeGi === null){realizeGi = 0.000000}
          if(navprice === undefined || navprice ===""|| navprice ===null){navprice = 0.000000}
          if(amountunit === undefined || amountunit ===""|| amountunit === null){amountunit = 0.000000}
          if(average_cost === undefined || average_cost ===""|| average_cost === null){average_cost = 0.000000}
          if(unitbalance === undefined || unitbalance ===""|| unitbalance === null){unitbalance = 0.000000}
          if(amountbaht === undefined || amountbaht ==="" ||amountbaht === null){amountbaht = 0.000000}
          // console.log("tranTypecode DB : " + tranTypeCode_db)
          // console.log("tranTypecode : " + tranTypecode)
          
          let fundId
          let RefNo
          let seqno
          let tranNo
          let Source_Flag = "F"
          await convertMKTID(datarows[0][key].IC_CODE , (id)=>{ Mktid = id })
          await getFundID(datarows[0][key].FUND_CODE ,(id) =>{ fundId =id })

         // console.log(fundId)
          if (fundId > 0){
             // await    logData("พบข้อมูลกองทุน "+ datarows[0][key].FUND_CODE+ "X" +fundId.toString() ,Cardnumber, unitholder)
          }else{
             // await    logData("ไม่พบกองทุน " + datarows[0][key].FUND_CODE  ,Cardnumber, unitholder)
          }
          
          if (fundId == 0){
            //   await    logData("ไม่สามารถนำข้อมูลเข้าระบบได้ " + tranTypecode + ":" + unitholder + datarows[0][key].FUND_CODE ,Cardnumber, unitholder)
          }else{
                 
              await getRefNoOfAccount(AccountInfo,unitholder ,(result)=>{ RefNo = result })    
              //console.log(RefNo)
              
              if (RefNo.length > 0 ){  await getMaxSeqNo(RefNo,fundId , (max)=>{seqno = max})}

              if(seqno > 0 && RefNo.length > 0){
                  
                  await getTranNumber(1,(no)=>{tranNo =no })
                  //console.log("tranno " +tranNo)
                  let rowFlag
                  //Check data for insert taansactiion
                  await getRefNoFundcodeUnitholder(tranTypecode,unitholder,datarows[0][key].FUND_CODE ,datarows[0][key].TRANS_DATE ,(row)=>{rowFlag = row })
                  // console.log(rowFlag)
                  if (rowFlag == 0){
                    //  console.log("insert mfts tranTypecode "+ tranTypecode)
                    await poolPromise.then(pool => {
                      return pool.request()
                          .input("Tran_No",       sql.VarChar(12),    tranNo)
                          .input("Ref_No",        sql.VarChar(12),    RefNo)
                          .input("TranType_Code", sql.VarChar(2),     tranTypecode)
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
                          .input("Seq_No",        sql.Int,            seqno)
                          .input("Mktid",         sql.Int,            Mktid )
                          .input("Create_by",     sql.VarChar(20),    Create_By)
                          .input("Create_date",   sql.DateTime,       dateserver)
                          .input("Unit_Balance",  sql.Decimal(18,4),  unitbalance)
                          .input("AVG_Cost",      sql.Float,          average_cost)
                          .input("Total_Cost",    sql.Decimal(18,4),   amountbaht  )
                          .input("Modify_By",     sql.VarChar(20),    Modify_By)
                          .input("FeeRate_Group", sql.Int,              1 )
                          .input("Modify_Date",   sql.Date,       executedate)
                          .input("RGL",           sql.Decimal(20,6), realizeGi)
                          .input("FUNDCODEI",     sql.NChar(30),    datarows[0][key].FUND_CODE)
                          .input("UNITHOLDERI",   sql.NChar(30),    unitholder)
                          .input("IDACCOUNTI",    sql.NChar(30),    AccountInfo)
                          .input("AMCCODEI",      sql.NChar(30),    datarows[0][key].AMC_CODE)
                          .input("TranSaction_Date", sql.NChar(14), datarows[0][key].TRANS_DATE)
                          .input("TRANTYPECODEX", sql.NChar(5),     tranTypeCode_db)
                          .query(InsertMFTS_TRANSACTION)
                    }).then(result => {
                        let row = result.rowsAffected
                        let respx = " MFTS TRANSACTION  INSERT :" + result.rowsAffected + " record(s)";
                        console.log(respx);
                        sql.close();
                        if (row > 0){
                             InsertMFTSBuy(tranNo,"Moblie","C","0","OD")
                             UpdateUnitBalance(RefNo,unitholder,Cardnumber,datarows[0][key].FUND_CODE,fundId)
                        }
            
                    }).catch(err => {
                        console.log(err);
                        sql.close();
                       // return callback(err);
                    });

                  }
              }
          }
           
      }catch (error) {
          // result = "ERROR Catch"
          // console.log(error);

      }
   }
  // return callback("INSERT MFTS TRANSACTION") 
}
async function getFundID(id ,callback){
  let statement = `SELECT Fund_Id  FROM MFTS_Fund  WHERE Fund_Code = '${id}' `  
 // console.log(statement)
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
async function getTranNumber(param ,callback){
  let tranno 
  await getRef("Tran_No",param ,(result)=> {tranno = result})
//   console.log("00000000"+tranno.toString())
  let returntext
  if(tranno.toString().length == 8){
    returntext = "00000000"+tranno.toString()
    // console.log(returntext)
  }
  if(tranno.toString().length == 5){
    returntext ="0000000"+tranno.toString()
    // console.log(returntext)
  }
  if(tranno.toString().length == 6){
    returntext="000000"+tranno.toString()
    // console.log(returntext)
  }
  if(tranno.toString().length == 4){
    returntext="00000000"+tranno.toString()
    // console.log(returntext)
  }
  //console.log(returntext)
 return callback(returntext)
}
async function getRef(refcode,segno,callback){
  // let statement = `EXEC  usp_gettranidref @centercode = '${refcode}' , @transeq = ${segno} ;`
  // console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .input('centercode' , sql.Char(15), refcode)
          .input('transeq' ,sql.Int, segno)
          .execute(`[dbo].[usp_gettranidref]`);
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          // if (rowsAffected > 0){   tranNo = result.returnValue  }
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
async function getMaxSeqNo(RefNo,Fundid , callback){
  let statement = `SELECT isnull(max(Seq_No),0) +1 AS maxx  FROM MFTS_Transaction  WHERE Ref_no = '${RefNo}' AND Fund_Id = '${Fundid}'`
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
async function getRefNoOfAccount(accountno, unitholder , callback){
  let ref_no = null
  let statement = `SELECT Ref_No  FROM MFTS_Account  WHERE Account_No = '${accountno}' AND Holder_Id = '${unitholder}'`
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          // let fund_id = 0
          if (rowsAffected > 0){  ref_no = result.recordset[0].Ref_No.toString()  }
          sql.close();
          //console.log(ref_no)
          return callback(ref_no)
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
async function logData(desc,accountno,Holder){
let serverdate
await serverdatex((date)=>{serverdate = date})

let statement = `INSERT INTO Fund_Errlog_TransferData (Descriptions,TimeLines,Status,AccountNo,HolderId)
                Values ('${desc}','${serverdate}','E','${accountno}', '${Holder}' ) `  
               //console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          
          if (rowsAffected > 0){ console.log("Insert Log  Success ")   }
          sql.close();
          //console.log(fund_id)
          //return callback(fund_id)
      }).catch(err => {
          console.log(err);
          sql.close();
          //return  callback(err)
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      //return callback(error)
  }
}
async function serverdatex(callback){
  const today                 = new Date()
  let date_ob                 = new Date(today);
  let date                    = ("0"+date_ob.getDate()).slice(-2); 
  let month                   = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
  let year                    = date_ob.getFullYear();
  let date_now                = year +"/"+  month  +"/"+ date
  return callback(date_now)
}
async function getRefNoFundcodeUnitholder(trancode, unitholder,fundcode, trandate,  callback){
  let statement = `SELECT REF_NO, FUNDCODEI , UNITHOLDERI
                    FROM  MFTS_TRANSACTION
                    WHERE TRANTYPE_CODE     = '${trancode}'
                    AND   UNITHOLDERI       = '${unitholder}'
                    AND   FUNDCODEI         = '${fundcode}' 
                    AND   TRANSACTION_DATE  = '${trandate}'`  
              //console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          
          if (rowsAffected > 0){ console.log("Check mfts_transaction ")   }
          sql.close();
          //console.log(fund_id)
          return callback(rowsAffected)
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
async function convertMKTID(id ,callback){
    let statement = `SELECT Id  FROM  MFTS_SalesCode  WHERE License_Codenew     = '${id}' OR License_Code = '${id}' `  
              //console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          let mktid = 0
          if (rowsAffected > 0){  mktid = result.recordset[0].Id }
          sql.close();
          //console.log( "MKTIID = "+mktid)
          return callback(mktid)
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

async function getdate(callback){
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
          //console.log( "MKTIID = "+mktid)
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

async function InsertMFTSBuy(TranNo, Tel, Paytype, ColdCalling, DecideReason){

    let createUser ='157'
    let createdate 
    await getdate(datex =>{createdate = datex})
    try{
      let  statement = `INSERT INTO MFTS_BUY (Tran_No ,Tel_Number  ,Pay_Type  ,Cold_Calling  ,Decide_Reason ,Create_By  ,Create_Date )
                    VALUES  (@Tran_No, @Tel_Number, @Pay_Type, @Cold_Calling, @Decide_Reason, @Create_By, @Create_Date)`


        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Tran_No",           sql.VarChar(12),    TranNo)
            .input("Tel_Number",        sql.NVarChar(100),    Tel)
            .input("Pay_Type",          sql.Char(1),     Paytype)
            .input("Cold_Calling",      sql.Char(1),     ColdCalling)
            .input("Decide_Reason",     sql.Char(2),     DecideReason)
            .input("Create_By",         sql.VarChar(20),     createUser)
            .input("Create_Date",       sql.DateTime,       createdate)
            .query(statement);
            
        }).then(result => {
            // let rowsAffected = result.rowsAffected.toString()
            // let datetime
            // if (rowsAffected > 0){  datetime = result.recordset[0].datetime }
            sql.close();
             //console.log("INSERT MFTS_BUY "+ rowsAffected +" row  is complete")
            //return callback("Buy Suceess")
        }).catch(err => {
            console.log(err);
            sql.close();
            //return callback(err)
        });
    
    }catch (error) {
        // result = "ERROR Catch"
            console.log(error);
        return callback(error)
    }

}
async function UpdateUnitBalance(RefNo,unitholder,idno,fundcode,fundId){
   let maxnav 
   await getMaxNav(idno,unitholder,fundcode, (maxN)=>{maxnav = maxN})
   let unitbalance
   //console.log(idno)
   await getUnitBlance(idno, unitholder, fundcode, (unitH)=> {unitbalance = unitH})
   if (unitbalance === undefined || unitbalance === null || unitbalance === ''){unitbalance = 0}
    // console.log("UpdateUnitBalance : "+unitbalance)
   if (unitbalance.length > 0 ){  unitbalance}
  
   if (fundId > 0 ){
        let comfirmUnit , rowComfirm
        await getComfirmUnit(fundcode,unitholder,(comfirmU,rowcon)=>{comfirmUnit = comfirmU; rowComfirm = rowcon;})
        if (comfirmUnit === undefined || comfirmUnit === null || comfirmUnit === ''){comfirmUnit = 0}
        // console.log("comfirmunint : "+comfirmUnit)
        // console.log("rowcon :  "+rowComfirm)
        if(rowComfirm > 0 ){
                //update
                 UpdateMFTSUnitBalance(comfirmUnit,fundcode,unitholder)
                 console.log("Update unit balance")
        }else{
                //insert
                if (unitbalance > 0 ){
                    insertUnitBalance(fundId,RefNo,unitbalance,fundcode,unitholder)
                    console.log("insert unit balance")
                }
        }
         
        
   }

}
async function UpdateMFTSUnitBalance(comfirmUnit,fundcode,unitholder){
    try{
      let  statement = `    Update MFTS_UnitBalance
                            Set  Confirm_Unit =@Confirm_Unit
                            Where FUNDCODEI=@FUNDCODEI AND UNITHOLDERI =@UNITHOLDERI`


        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Confirm_Unit",           sql.Numeric(18,4),    comfirmUnit)
            .input("FUNDCODEI",        sql.NChar(50),    fundcode)
            .input("UNITHOLDERI",          sql.NChar(30),     unitholder)
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            // let datetime
            // if (rowsAffected > 0){  datetime = result.recordset[0].datetime }
            sql.close();
             console.log("Update MFTS_UnitBalance "+ rowsAffected +" row  is complete")
            //return callback("UnitBalance Suceess")
        }).catch(err => {
            console.log(err);
            sql.close();
           // return callback(err)
        });
    
    }catch (error) {
        // result = "ERROR Catch"
            console.log(error);
        //return callback(error)
    }
}
async function insertUnitBalance(fundId,RefNo,unitbalance,fundcode,unitholder){
    let  statement = `Insert INTO MFTS_UnitBalance(Fund_Id,Ref_No,Confirm_Unit,Modify_Date,FUNDCODEI,UNITHOLDERI)
                        VALUES(@Fund_Id,@Ref_No,@Confirm_Unit,@Modify_Date,@FUNDCODEI,@UNITHOLDERI) `
    let Modify_Date 
    await getdate((gatd) =>{Modify_Date = gatd})
    try{
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Fund_Id",           sql.Int,    fundId)
            .input("Ref_No",            sql.VarChar(12),  RefNo)
            .input("Confirm_Unit",      sql.Numeric(18,4),        unitbalance)
            .input("Modify_Date",       sql.DateTime,        Modify_Date)
            .input("FUNDCODEI",         sql.NChar(50),        fundcode)
            .input("UNITHOLDERI",       sql.NChar(30),        unitholder)
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            // let datetime
            // if (rowsAffected > 0){  datetime = result.recordset[0].datetime }
            sql.close();
            console.log("Insert MFTS_UnitBalance "+ rowsAffected +" row  is complete")
            //return callback("UnitBalance Suceess")
        }).catch(err => {
            console.log(err);
            sql.close();
           // return callback(err)
        });

    }catch (error) {
        // result = "ERROR Catch"
            console.log(error);
       // return callback(error)
    }
}
async function getMaxNav (idno, unitholder, fundcode ,callback){
    let statement = `SELECT Max(NAV_DATE) as maxnav 
                                FROM Fund_Cen_UnitholderBalance 
                                WHERE ACCOUNT_ID = '${idno}' 
                                AND UNITHOLDER_ID = '${unitholder}' 
                                AND FUND_CODE = '${fundcode}'`
    try{
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            let maxnav
            if (rowsAffected > 0){  maxnav = result.recordset[0].maxnav }
            sql.close();
            return callback(maxnav)
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
async function getUnitBlance (idno, unitholder, fundcode,  callback){
    let statement = `SELECT  UNIT_BALANCE
                    FROM Fund_Cen_UnitholderBalance
                    WHERE ACCOUNT_ID =  '${idno}' 
                    And  UNITHOLDER_ID ='${unitholder}' 
                    And FUND_CODE =     '${fundcode}'`
                   // console.log(statement)
    try{
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            let UNIT_BALANCE
            if (rowsAffected > 0){  UNIT_BALANCE = result.recordset[0].UNIT_BALANCE }
            sql.close();
            //console.log( "MKTIID = "+mktid)
            return callback(UNIT_BALANCE)
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
async function getComfirmUnit(fundcode,unitholder, callback){
    let statement = `Select Confirm_Unit  
                        From MFTS_UnitBalance
                        Where FUNDCODEI='${fundcode}' AND UNITHOLDERI ='${unitholder}'`	 
        try{
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
                
            }).then(result => {
                let rowsAffected = result.rowsAffected.toString()
                let Confirm_Unit
                if (rowsAffected > 0){  Confirm_Unit = result.recordset[0].Confirm_Unit }
                sql.close();
                //console.log( "MKTIID = "+mktid)
                return callback(Confirm_Unit,rowsAffected)
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
export {
  SelectTransactionWaiting,
  ImportTransactionWaiting,
  getdate,
  logData,
  getRefNoOfAccount,
  getTranNumber,
  convertMKTID,
  getFundID,
  InsertMFTSBuy,
  UpdateUnitBalance,
  getRef
}
//****************[ Created Date 2022 06 21  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1]             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/