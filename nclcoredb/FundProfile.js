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
 
 import {getdate ,getRef} from './tranwait.js'
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
    start_date ='2022/06/10'

    let statement = `SELECT dbo.MFTS_Fund.Fund_Id , dbo.Fundconnex_not_fundCodeIn_Connex.*  FROM   dbo.Fundconnex_not_fundCodeIn_Connex LEFT OUTER JOIN
                                      dbo.MFTS_Fund ON dbo.Fundconnex_not_fundCodeIn_Connex.FUND_CODE = dbo.MFTS_Fund.Fund_Code
                                      WHERE  timestampx >= '${date_stamp}' 
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
    for ( let key in datarows) {
        try{   
             // console.log("fund code : "+datarows[key].FUND_CODE+ "  amd ID  "+datarows[key].AMC_CODE + " :" + i)
            let statement 
            let fundId              =  datarows[key].Fund_Id
            //await getVerifyFund(datarows[key].FUND_CODE, (flag_fund)=>{ fundId = flag_fund   })
            let APIupdate = "U"
            if(fundId === null ){
               await getRef("Fund_Id",2 ,(result)=> {fundId = result})
               await CheckDupFund(datarows[key].FUND_CODE, datarows[key].Amc_Id , (result) =>{
                if (result !== undefined) {
                  let cCout = result.length;
                  if (cCout == 0) {
                    //Insert
                    statement = Insert_MFTS_FUND
                    APIupdate = "I"
                  }
                }
               })
            }else{
                  //update
                  statement = Update_MFTS_FUND
                  APIupdate = "U"
            }
            
            let createUser = '146'
            let Fund_Type = "1"
            let startDate = null
            if (datarows[key].REGISTRATION_DATE != ""){
              startDate   = datarows[key].REGISTRATION_DATE.substring(0,4) + "-" + datarows[key].REGISTRATION_DATE.substring(4,6)  + "-" + datarows[key].REGISTRATION_DATE.substring(6,8)
            }
            
            let createdate
            await getdate((crdate)=>{createdate = crdate})
            let TimeOf = "15:30"
            if (statement != undefined){ 
                // console.log(startDate)
                // console.log(datarows[key].FUND_CODE ) 
                // console.log(datarows[key].Amc_Id )
                // console.log(statement)
              await new sql.ConnectionPool(config).connect().then(pool => {
              return pool.request()
              .input("Fund_Id"              , sql.Int,            fundId)
              .input("Amc_Id"               , sql.Int,            datarows[key].Amc_Id )
              .input("Fund_Code"            , sql.VarChar(30),    datarows[key].FUND_CODE)
              .input("Thai_Name"            , sql.NVarChar(200),  datarows[key].FUND_NAME_TH)
              .input("Eng_Name"            , sql.NVarChar(200),   datarows[key].FUND_NAME_EN)
              .input("Fund_Type"            , sql.Char(1),        Fund_Type)
              .input("Start_Date"           , sql.Date,           startDate) 
              .input("Create_By"            , sql.VarChar(20),    createUser)
              .input("Create_Date"         , sql.DateTime,        createdate) 
              .input("Modify_By"            , sql.VarChar(20),    createUser)
              .input("Modify_Date"          , sql.DateTime,       createdate)
              .input("Cutoff_Buy"           , sql.VarChar(5),     TimeOf)
              .input("Cutoff_Sell"         , sql.VarChar(5),      TimeOf)
              .input("Cutoff_SwitchOut"     , sql.VarChar(5),     TimeOf)
              .input("Cutoff_SwitchIn"      , sql.VarChar(5),     TimeOf)
              .input("Cutoff_Transfer"      , sql.VarChar(5),     TimeOf) 
              .input("APIstatus"          , sql.NChar(10),        APIupdate)
              .input("FGroup_Code"        , sql.NVarChar(15),     datarows[key].TAX_TYPE)
              .input("FundRisk"           , sql.Int,              datarows[key].FUND_RISK_LEVEL) 
              .input("amccodex"           , sql.NVarChar(15),     datarows[key].AMC_CODE) 
              .input("End_Date_Flag"      , sql.Char(1),          "0")
              .input("Settlement_Code"    , sql.VarChar(2),       "0")  
              .input("NavPeriod_Id"       , sql.Int,              1) 
              .query(statement);
            }).then(result => {
                //console.log(result);
                let data_row = result.rowsAffected.toString();
                // console.log("result: "+ data_row +" row")
              let flag_query = APIupdate === 'I' ? "insert" : "update"
              //let fundid //= result.recordset.Fund_Id.toString()
              if (data_row > 0){  console.log(flag_query +"  MFTS_FUND  CODE " + datarows[key].FUND_CODE + " SUCEESS") } 
              //console.log(result.recordset[0].Fund_Id);    
              // let flag_id = 0 
              // if (fundid == 0 ){  flag_id = 1  }  
              sql.close();
             // return  callback("SUCEESS")   
        
            }).catch(err => {
              console.log(err);
              sql.close();
             // return   callback(err);  
            });
            } 
            

            // console.log("flag fund :"+ flag_fundId) 
        }catch (error) {
          let  result = "ERROR Catch"
            console.log(error);
           // return   callback(error);
        }
    } 


    return callback("SUCEESS")
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
        statement = `SELECT Fund_Code  FROM MFTS_Fund  WHERE Fund_Code = '${Fund_Code}' and Amc_Id =${Amc_Id}`
     // console.log(statement)

     await new sql.ConnectionPool(config).connect().then(pool => {
      return pool.request()
      .query(statement);
    }).then(result => {
       //console.log(fundid);
        let data_row = result.rowsAffected.toString();
        // console.log("result: "+ data_row +" row")
      
      let fundcode //= result.recordset.Fund_Id.toString()
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
async function genfundId(callback){



}
export {SelectFundProfile,ImportFund}
//****************[ Created Date 2022 06 24  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/