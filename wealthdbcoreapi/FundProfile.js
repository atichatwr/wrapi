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

import {Update_MFTS_FUND ,Insert_MFTS_FUND} from './dbsql.js';
 
 import {getdate} from './tranwait.js'
import {selectNavTable, CheckNavTable, updateTableNav, insertTableNavNew} from './dbCenterImport.js'
dotenv.config();

async function SelectFundProfile(callback){
    const today = new Date()
    const yesterday = new Date(today)
    const yt = yesterday.setDate(yesterday.getDate()-1)     
    
    let date_ob = new Date(today);
    let date = ("0"+date_ob.getDate()).slice(-2);
    // if (date.toString().length = 1) {date = "0"+ date ;}
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let date_stamp = year +"-"+  month  +"-"+ date
  
    let date_yt = new Date(yt)
    let dateyt = ("0"+date_yt.getDate()).slice(-2);
    let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
    let year_yt = date_yt.getFullYear();
  
    let start_date = year_yt  +"/"+ month_yt  +"/"+ dateyt
    //--- Test  
    //start_date ='2022/06/10'

    let statement = `SELECT TOP (100) PERCENT dbo.MFTS_Fund.Fund_Id , dbo.Fund_Cen_FundProfile.*
                      FROM dbo.MFTS_Fund RIGHT OUTER JOIN
                          dbo.Fund_Cen_FundProfile ON 
                          dbo.MFTS_Fund.Fund_Code = dbo.Fund_Cen_FundProfile.FUND_CODE
                      ORDER BY dbo.MFTS_Fund.Fund_Id ` 
      // console.log(statement) 
    try{

        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
            // console.log(result.recordset);
            let data_row = result.rowsAffected.toString();
             console.log("result: "+ data_row +" row")
            sql.close();
            //if ()
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
        //return callback(statement)
}
async function ImportFund (datarows, callback){
   // let i = 1
  //  console.log(datarows)
  let flag_query = null
    for ( let key in datarows) {
        try{  
            let statement ,fundId  = null
            fundId                    =  datarows[key].Fund_Id
            let registerDate          = datarows[key].REGISTRATION_DATE
            let FST_LOWBUY_VAL          = datarows[key].FST_LOWBUY_VAL
            let  startDate            = null
            let  fund_sub1             = datarows[key].FIF_FLAG
            let F_fund_sub1
            console.log(fund_sub1)
            if(fund_sub1 === 'Y'){
              F_fund_sub1 = 'FIF'
            }else{
              F_fund_sub1 = 'Local'
            }
            console.log(fund_sub1)
            if(registerDate.length  == 0){ continue; }
            startDate   = registerDate.substring(0,4) + "-" + registerDate.substring(4,6)  + "-" + registerDate.substring(6,8)
            //await getVerifyFund(datarows[key].FUND_CODE, (flag_fund)=>{ fundId = flag_fund   })
            // console.log(fundId)
            let TAX_TYPE            = datarows[key].TAX_TYPE 
            console.log(TAX_TYPE)
            if(TAX_TYPE.length == 0){TAX_TYPE = "Mutual Fund"}
            console.log(TAX_TYPE)
            let APIupdate = null
            if(fundId === undefined ||fundId === null ){
               await getRef("Fund_Id",2 ,(result)=> {fundId = result})
              //  console.log(fundId)
               statement = Insert_MFTS_FUND
               APIupdate = "I"
              
            }else{
                  //update
                  statement = Update_MFTS_FUND
                  APIupdate = "U"
                  continue;
            }
            // console.log(fundId + " " + APIupdate)
            let createUser = '146'
            let Fund_Type = "1"
            
            let createdate
            await getdate((crdate)=>{createdate = crdate})
            let TimeOf = "15:30"
            let Cutoff_Buy  = datarows[key].BUY_CUT_OFF_TIME.substring(0,2) +":"+  datarows[key].BUY_CUT_OFF_TIME.substring(2,4)
            let Cutoff_Sell = datarows[key].SELL_CUT_OFF_TIME.substring(0,2)+":"+  datarows[key].SELL_CUT_OFF_TIME.substring(2,4)
            let Tax_type    = datarows[key].TAX_TYPE
            let Selecttype  = 2
            if(Tax_type.length == 0){Selecttype = 1}
            
              await new sql.ConnectionPool(config).connect().then(pool => {
              return pool.request()
              .input("Fund_Id"              , sql.Int,            fundId)
              .input("Amc_Id"               , sql.Int,            datarows[key].Amc_Id )
              .input("Fund_Code"            , sql.VarChar(30),    datarows[key].FUND_CODE.trim())
              .input("Thai_Name"            , sql.NVarChar(200),  datarows[key].FUND_NAME_TH)
              .input("Eng_Name"            , sql.NVarChar(200),   datarows[key].FUND_NAME_EN)
              .input("Fund_Type"            , sql.Char(1),        Fund_Type)
              .input("Start_Date"           , sql.Date,           startDate) 
              .input("Create_By"            , sql.VarChar(20),    createUser)
              .input("Create_Date"         , sql.DateTime,        createdate) 
              .input("Modify_By"            , sql.VarChar(20),    createUser)
              .input("Modify_Date"          , sql.DateTime,       createdate)
              .input("Cutoff_Buy"           , sql.VarChar(5),     Cutoff_Buy)
              .input("Cutoff_Sell"         , sql.VarChar(5),      Cutoff_Sell)
              .input("Cutoff_SwitchOut"     , sql.VarChar(5),     Cutoff_Buy)
              .input("Cutoff_SwitchIn"      , sql.VarChar(5),     Cutoff_Buy)
              .input("Cutoff_Transfer"      , sql.VarChar(5),     Cutoff_Buy) 
              .input("APIstatus"          , sql.NChar(10),        APIupdate)
              .input("FGroup_Code"        , sql.NVarChar(15),     "")
              .input("FundRisk"           , sql.Int,              datarows[key].FUND_RISK_LEVEL) 
              .input("amccodex"           , sql.NVarChar(15),     datarows[key].AMC_CODE) 
              .input("End_Date_Flag"      , sql.Char(1),          "0")
              .input("Settlement_Code"    , sql.VarChar(2),       "0")  
              .input("NavPeriod_Id"       , sql.Int,              1) 
              .input("Yield"              , sql.VarChar(20),      "Absolube") 
              .input("Rollover_Period"    , sql.Int,              0) 
              .input("IsDividend"         , sql.NChar(1),         "0") 
              .input("IsAutoRedeem"       , sql.NChar(1),         "0")
              .input("Selecttype"       , sql.Int,                Selecttype)
              .input("F_fund_sub1"       , sql.NChar(20),         "")
              .input("NewFundType"       , sql.NChar(20),         TAX_TYPE)
              .query(statement);
            }).then(result => {
                //console.log(result);
                let data_row = result.rowsAffected.toString();
                // console.log("result: "+ data_row +" row")
                //flag_query = APIupdate === 'I' ? "insert" : "update"
              //let fundid //= result.recordset.Fund_Id.toString()
              if (data_row > 0 ){  
                console.log("  MFTS_FUND  CODE " + datarows[key].FUND_CODE + " SUCEESS") 
                // insert trade condition
                insertTradeCondition(fundId,Cutoff_Buy,Cutoff_Sell,FST_LOWBUY_VAL)
              } 
               
              sql.close(); 
        
            }).catch(err => {
              console.log(err);
              sql.close();  
            });
           
            // console.log("flag fund :"+ flag_fundId) 
        }catch (error) {
          let  result = "ERROR Catch"
            console.log(error); 
        }
    } 


    return callback(" SUCEESS")
}
async function insertTradeCondition(fundId,Cutoff_Buy,Cutoff_Sell,FST_LOWBUY_VAL, callback){
  let loop_type=  ["S","B","SO","SI","T"]
  let createdate
  await getdate((crdate)=>{createdate = crdate})
  loop_type.forEach(async(trantype) => { 
      try{
            let statement =`INSERT INTO MFTS_Trade_Condition(Fund_Id, Effective_Date, TranType_Code, 
                              Start_Time, End_Time, FirstTrade_Baht , Create_By, Create_Date )
                            VALUES (@Fund_Id, @Effective_Date, @TranType_Code, @Start_Time, @End_Time, @FirstTrade_Baht, @Create_By ,@Create_Date)`

            let startTime = "08:30"
            let End_Time = Cutoff_Buy
            if(trantype=== "S" ||trantype=== "SO"){
              End_Time = Cutoff_Sell
            }
            await new sql.ConnectionPool(config).connect().then(pool => {
              return pool.request()
              .input("Fund_Id"              , sql.Int,            fundId)
              .input("Effective_Date"       , sql.DateTime,       createdate )
              .input("TranType_Code"      , sql.VarChar(2),       trantype)
              .input("Start_Time"         , sql.NVarChar(5),    startTime)
              .input("End_Time"            , sql.NVarChar(5),   End_Time)
              .input("FirstTrade_Baht"    , sql.Numeric(18,2),    FST_LOWBUY_VAL)
              // .input("Start_Date"           , sql.Date,           startDate) 
              .input("Create_By"            , sql.VarChar(20),    "146")
              .input("Create_Date"         , sql.DateTime,        createdate) 
              .query(statement);
            }).then(result => {
                let data_row = result.rowsAffected.toString();
              if (data_row > 0){  
                 //console.log("MFTS_Trade_Condition " +trantype + "Fund ID: "+fundId)
              } 
              sql.close(); 
        
            }).catch(err => {
              console.log(err);
              sql.close();  
            })
        }catch (error) {
          let  result = "ERROR Catch"
            console.log(error); 
        }
  })
}
async function getVerifyFund(fundcode , callback){
    let statement = `SELECT Fund_Id  FROM MFTS_Fund  WHERE  Fund_Code = '${fundcode}' ` 
    try{

        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
             //console.log(fundid);
              let data_row = result.rowsAffected.toString();
              // console.log("result: "+ data_row +" row")
            
            let fundid //= result.recordset.Fund_Id.toString()
            if (data_row > 0){ fundid  = result.recordset[0].Fund_Id} 
            //console.log(result.recordset[0].Fund_Id);    
            // let flag_id = 0 
            // if (fundid == 0 ){  flag_id = 1  }  
            sql.close();
            return  callback(fundid)  
      
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
async function CheckDupFund(Fund_Code, Amc_Id , callback){
  let  statement  
  try{
        statement = `SELECT Fund_Code  FROM MFTS_Fund  WHERE Fund_Code = '${Fund_Code}' `//and Amc_Id =${Amc_Id}
    //  console.log(statement)

     await new sql.ConnectionPool(config).connect().then(pool => {
      return pool.request()
      .query(statement);
    }).then(result => {
       //console.log(fundid);
        let data_row = result.rowsAffected.toString();
        // console.log("result: "+ data_row +" row")
      
      let fundcode  //= result.recordset.Fund_Id.toString()
      if (data_row > 0){
         fundcode  = result.recordset[0].Fund_Code
      } 
      //console.log(result.recordset[0].Fund_Id);    
      // let flag_id = 0 
      // if (fundid == 0 ){  flag_id = 1  }  
      sql.close();
      return  callback(fundcode)  

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
 
async function DataFundProfile (callback){
  let statement = `SELECT dbo.MFTS_Fund.Fund_Id , dbo.Fundconnex_not_fundCodeIn_Connex.*  FROM   dbo.Fundconnex_not_fundCodeIn_Connex LEFT OUTER JOIN
                                      dbo.MFTS_Fund ON dbo.Fundconnex_not_fundCodeIn_Connex.FUND_CODE = dbo.MFTS_Fund.Fund_Code
                                      ORDER BY dbo.MFTS_Fund.Fund_Id `
      // console.log(statement)
    try{

        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
            // console.log(result.recordset);
            let data_row = result.rowsAffected.toString();
             console.log("result: "+ data_row +" row")
            sql.close();
            //if ()
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
async function checkfundid(fundcode , callback){
  let flag_db = 0
  try{
    let statement =`SELECT dbo.MFTS_Fund.Fund_Id, dbo.Fund_Cen_FundProfile.*,  dbo.MFTS_Amc.Amc_Id
                  FROM dbo.MFTS_Amc INNER JOIN
                      dbo.Fund_Cen_FundProfile ON 
                      dbo.MFTS_Amc.Amc_Code = dbo.Fund_Cen_FundProfile.AMC_CODE LEFT
                      OUTER JOIN
                      dbo.MFTS_Fund ON 
                      dbo.Fund_Cen_FundProfile.FUND_CODE = dbo.MFTS_Fund.Fund_Code
                    WHERE Fund_Cen_FundProfile.FUND_CODE = '${fundcode}'
                     `
    // console.log(statement)
    await new sql.ConnectionPool(config).connect().then(pool => {
      return pool.request()
      .query(statement);
    }).then(result => {
      //console.log(result.recordset);
      let data_row = result.rowsAffected.toString();
       console.log("result: "+ data_row +" row")
      //  console.log(result.recordset[0])
      //let fund_id = result.recordset[0]?.Fund_Id
      console.log(fund_id)
      //if(fund_id === null){flag_db = 1}
      sql.close();
      //if ()
      return  callback(flag_db,result.recordset ) 

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
async function getRef(refcode,segno,callback){
  // let statement = `EXEC  usp_gettranidref @centercode = '${refcode}' , @transeq = ${segno} ;`
  // console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(`declare @li_id integer  ,@centercode char(15)='${refcode}'
                  declare @li_id_new integer
                  select @li_id=genValue from
                      dbo.MFTS_GenNumber where
                          genName=@centercode
                        if(@li_id is null)
                            Begin
                              set @li_id=0
                            End

                            set @li_id_new=@li_id+1
                  
                          update  dbo.MFTS_GenNumber set
                            genValue=@li_id_new 
                            where genName=@centercode
                            
                            select @li_id as fundId`)
          // .execute(`[dbo].[usp_gettranidref]`);
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          // if (rowsAffected > 0){   tranNo = result.returnValue  }
          sql.close();
         // console.log(result.returnValue)
          return callback(result.recordset[0].fundId)
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
async function selectDataAmcToFund(amc,callback){
  try{
    console.log(amc)
    let statement =`SELECT top(1) dbo.MFTS_Fund.Fund_Id, dbo.Fund_Cen_FundProfile.*,  dbo.MFTS_Amc.Amc_Id
                    FROM dbo.MFTS_Amc INNER JOIN
                      dbo.Fund_Cen_FundProfile ON 
                      dbo.MFTS_Amc.Amc_Code = dbo.Fund_Cen_FundProfile.AMC_CODE LEFT
                      OUTER JOIN
                      dbo.MFTS_Fund ON 
                      dbo.Fund_Cen_FundProfile.FUND_CODE = dbo.MFTS_Fund.Fund_Code
                      WHERE Fund_Cen_FundProfile.AMC_CODE = '${amc}' AND dbo.MFTS_Fund.Fund_Id is null
                     `
    // console.log(statement)
    await new sql.ConnectionPool(config).connect().then(pool => {
      return pool.request()
      .query(statement);
    }).then(result => {
      //console.log(result.recordset);
      let data_row = result.rowsAffected.toString();
       console.log("result amc : "+ data_row +" row")
      //  console.log(result.recordset)
      // let fund_id = result.recordsets
      // console.log(fund_id)
      // if(fund_id === null){flag_db = 1}
      sql.close();
      //if ()
      return  callback(result.recordset ) 

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
// IT Request 230209
async function prepareFundprofile(callback){
  let Data_Import_FUND_PROFILE
   try{
      let statement = `SELECT TOP (100)   PERCENT dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID, 
                        dbo.Fund_Cen_AllottedTransactions.FILTER01 AS id_card, 
                        dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID,  
                        dbo.Fund_Cen_AllottedTransactions.FUND_CODE AS TA_Fund, 
                        dbo.MFTS_Fund.Fund_Code AS MF_Fund, 
                        dbo.Fund_Cen_FundProfile.FUND_CODE AS FC_Fund
                        ,dbo.Fund_Cen_FundProfile.*
                    FROM dbo.Fund_Cen_AllottedTransactions LEFT OUTER JOIN
                        dbo.Fund_Cen_FundProfile ON 
                        dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.Fund_Cen_FundProfile.FUND_CODE
                        LEFT OUTER JOIN
                        dbo.MFTS_Fund ON 
                        dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.MFTS_Fund.Fund_Code
                    WHERE  (dbo.MFTS_Fund.Fund_Code IS NULL)   AND NOT ( dbo.Fund_Cen_FundProfile.FUND_CODE IS NULL)
      `
    
        await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
        }).then(result => {
          //console.log(result.recordset);
          let data_row = result.rowsAffected.toString();
          let fund_code_cen = result.recordsets
          if (data_row > 0 ){
            // ImportFund(result.recordset)
            Data_Import_FUND_PROFILE = result.recordset
          }
          sql.close(); 
          // return  callback(result.recordset ) 
    
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

// console.log(Data_Import_FUND_PROFILE)

let callbage 
await ImportFund(Data_Import_FUND_PROFILE ,(x)=>{callbage = x})

//---- insert nav for new fund id
if(callbage === ' SUCEESS'){
  let DataNav
  await selectNavTable((datas_nav)=>{DataNav = datas_nav})
  await CheckNavTable(DataNav)
}

return callback(callbage)
}
 
export {SelectFundProfile,ImportFund ,DataFundProfile,checkfundid, selectDataAmcToFund , prepareFundprofile}
//****************[ Created Date 2022 06 24  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/