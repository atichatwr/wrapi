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

import {Insert_MFTS_SUIT, Update_MFTS_SUIT} from './dbsql.js';
import {getdate ,logData,getRefNoOfAccount} from './tranwait.js'
// import { AllottedTransactions } from './impsql.js';
// import { constants } from 'buffer';
// import { resolve } from 'path';
// import { exit } from 'process';
// import { cardNumber } from '../fundconn/dataTest.js';
// import { getFundConnIndividualProfile } from '../fundconn/funconPipe.js';
// import {getdate ,logData,getRefNoOfAccount} from './tranwait.js'
dotenv.config();

async function selectDataSuit(callback){
    let statement = `SELECT *  FROM Fund_Cen_Suitability  Where timestampx >= '2022/06/21' AND  timestampx <=  '2022/06/22'`
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

async function GetDataSuit(datarows, callback){

    const today = new Date()
    let date_ob = new Date(today);
    let date = ("0"+date_ob.getDate()).slice(-2);
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let date_present = year +"/"+  month  +"/"+ date
    let jdata =[]
    for ( let key in datarows) {
        try{   
            //  console.log(datarows[key].cardNumber)
             let AccountNo = datarows[key].cardNumber
             let data_row = 0
             let statement = `SELECT Suit_id  FROM MFTS_Suit  WHERE Account_No = '${AccountNo}' AND Document_Date >= '${date_present}'`
              //console.log(statement)
             await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
          
              }).then(result => {
                
                let rowsAffected = result.rowsAffected.toString()
                sql.close();
                let Suit_id = 0 
                var myObj
                let datarowsx = datarows[key]
                let dataparam
                
                     if (rowsAffected > 0){ 
                        myObj = { "state": rowsAffected , "Suit_id" :Suit_id}; 
                        dataparam = Object.assign(myObj, datarowsx)
                        // console.log(datarowsx)    
                     }else{
                        myObj = { "state": rowsAffected , "Suit_id" :Suit_id}; 
                        dataparam = Object.assign(myObj, datarowsx)
                        // console.log(dataparam)   
                        
                     }
                     jdata.push(dataparam) 
                   
              }).catch(err => {
                //console.log(err);
                sql.close();
               // return   callback(0);
              });
        }catch (error) {
            result = "ERROR Catch"
            console.log(error);
          //  return   callback(error);
        }
   
    } 
    return callback (jdata)
}
async function ImportDataSuit(datarows, callback){
    
    let Createdate 
    await getdate((datenow)=>{Createdate = datenow})
    let Series_Id 
    await getSerie((series) =>{Series_Id = series}) 
    for ( let key in datarows) {
        try{
            //console.log(datarows[key].cardNumber)
            let Account_No              = datarows[key].cardNumber  
            let score                   = 0
            let Risk_Level              = ""
            let Risk_Level_Desc         = ""
            let File_Path               = ""
            let Active_Flag             ="A"
            let Create_By ,Modify_By    = "157"
            let Modify_Date             = Createdate
            let SuitID                  = datarows[key].Suit_id 

            let level ,datesuit
            await setRiskLevel(Account_No, (res,dateS)=> {
              level = res
              datesuit = dateS
            })
            await setRiskDesc (level, (risk ,riskdesc)=> {
              Risk_Level      = risk
              Risk_Level_Desc = riskdesc 
            })
            //console.log("level risk : "+ Risk_Level)
            //await setScoreSuit(Series_Id , datarows[key] , (totalScore)=> {score = totalScore})
            let CID = datarows[key] 
            await poolPromise.then(pool => {
                return pool.request()
                    .input("Suit_Id",           sql.Int,            SuitID)
                    .input("Account_No",        sql.VarChar(30),    Account_No)
                    .input("Series_Id",         sql.Int,            Series_Id)
                    .input("Score",             sql.Int,            score)
                    .input("Risk_Level",        sql.NVarChar(30),    Risk_Level)
                    .input("Risk_Level_Desc",   sql.NVarChar(500),  Risk_Level_Desc)
                    .input("File_Path",         sql.NVarChar(1000), File_Path)
                    .input("Active_Flag",       sql.Char(1),       Active_Flag)
                    .input("Create_By",         sql.VarChar(20),    Create_By)
                    .input("Modify_By",         sql.VarChar(20),    Modify_By)
                    .execute(`[dbo].[USP_MFTS_Save_Suit]`);
            }).then(result => {
                let respx = " MTFS_SUIT update:" + result.rowsAffected + " record(s)";
                //console.log(result.recordset[0] );
                for (var key in result.recordset[0]) {
                    if (result.recordset[0].hasOwnProperty(key)) {
                        //console.log(key); // 'a'
                       // console.log(result.recordset[0][key]); // 'hello' 
                        let lastID = result.recordset[0][key]
                        setSuitDetail(lastID, CID ,Series_Id)
                        setDateCreate(lastID ,datesuit) 
                    }
                  }  
                 sql.close();
            }).catch(err => {
                console.log(err);
                //sql.close();
               // return callback(err); 
            });


          }catch (error) {
            result = "ERROR Catch"
            console.log(error);
          //  return   callback(error);
          }
    }
}
async function setRiskDesc(level, callback){
   
  try{   
    
    let statement //= `SELECT Id  FROM MFTS_Suit_Series  WHERE Active_Flag ='A' `
    if(level == 1){statement =`SELECT Risk_Level,Type_Investor  FROM MFTS_Suit_Score  WHERE ( 0 >= Min_Value AND (14 <=Max_Value) )`}
    if(level == 2){statement =`SELECT Risk_Level,Type_Investor  FROM MFTS_Suit_Score  WHERE ( 15 >= Min_Value AND (21 <=Max_Value) )`}
    if(level == 3){statement =`SELECT Risk_Level,Type_Investor  FROM MFTS_Suit_Score  WHERE ( 22 >= Min_Value AND (29 <=Max_Value) )`}
    if(level == 4){statement =`SELECT Risk_Level,Type_Investor  FROM MFTS_Suit_Score  WHERE ( 30 >= Min_Value AND (36 <=Max_Value))`}
    if(level == 5){statement =`SELECT Risk_Level,Type_Investor  FROM MFTS_Suit_Score  WHERE ( 37 = Min_Value )`}


     //console.log(statement)
    await new sql.ConnectionPool(config).connect().then(pool => {
       return pool.request()
       .query(statement);
 
     }).then(result => {
       
       let rowsAffected = result.rowsAffected
       //console.log("result series : "+rowsAffected)
       sql.close();
       let risklevel  ,Type_Investor 
       if (rowsAffected > 0){  risklevel = result.recordset[0].Risk_Level }
       if (rowsAffected > 0){  Type_Investor = result.recordset[0].Type_Investor }
      // console.log("series  is : "+series)
       return callback(risklevel,Type_Investor)        
     }).catch(err => {
       console.log(err);
       sql.close();
      // return   callback(0);
     });
  }catch (error) {
    result = "ERROR Catch"
    console.log(error);
  //  return   callback(error);
  }

}

async function getSerie(callback){
    try{   

         let statement = `SELECT Id  FROM MFTS_Suit_Series  WHERE Active_Flag ='A' `
          //console.log(statement)
         await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
      
          }).then(result => {
            
            let rowsAffected = result.rowsAffected.toString()
            //console.log("result series : "+rowsAffected)
            sql.close();
            let series = 0 
            if (rowsAffected > 0){  series = result.recordset[0].Id }
           // console.log("series  is : "+series)
            return callback(series)        
          }).catch(err => {
            console.log(err);
            sql.close();
           // return   callback(0);
          });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
      //  return   callback(error);
    }

}
async function setRiskLevel(cardNo, callback){
    try{

        let statement = `SELECT suitabilityRiskLevel ,suitabilityEvaluationDate FROM Fund_cen_Customer WHERE CardNumber = '${cardNo}' `
       
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
    
        }).then(result => {
            
            let rowsAffected = result.rowsAffected.toString()
            //console.log("result series : "+rowsAffected)
            sql.close();
            let risklevel = 0 , datesuit
            if (rowsAffected > 0){  risklevel = result.recordset[0].suitabilityRiskLevel.toString() }
            if (rowsAffected > 0){  datesuit = result.recordset[0].suitabilityEvaluationDate.toString() }
        // console.log("series  is : "+series)
            return callback(risklevel, datesuit)
        }).catch(err => {
            console.log(err);
            sql.close();
        return   callback("0");
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
     return   callback(error);
    }
    // return callback(statement)
}
async function setScoreSuit (serie,datarows, callback){

   
        let suitNo1     =datarows.suitNo1.substring(0,1)
        let suitNo2     =datarows.suitNo2.substring(0,1)
        let suitNo3     =datarows.suitNo3.substring(0,1)
        let suitNo4     =datarows.suitNo4.substring(0,1)
        let suitNo5     =datarows.suitNo5.substring(0,1)
        let suitNo6     =datarows.suitNo6.substring(0,1)
        let suitNo7     =datarows.suitNo7.substring(0,1)
        let suitNo8     =datarows.suitNo8.substring(0,1)
        let suitNo9     =datarows.suitNo9.substring(0,1)
        let suitNo10    =datarows.suitNo10.substring(0,1)
        let suitNo11    =datarows.suitNo11.substring(0,1)
        let suitNo12    =datarows.suitNo12.substring(0,1) 

        let score, total
        if (suitNo1 == 1){ score = 1;}else if (suitNo1 == 2){score = 2;}else if (suitNo1 == 3){score = 3;}else if (suitNo1 == 4){score = 4;}
        total = score
        if (suitNo2 == 1){ score = 1;}else if (suitNo2 == 2){score = 2;}else if (suitNo2 == 3){score = 3;}else if (suitNo2 == 4){score = 4;}
        total = total+score
        if (suitNo3 == 1){ score = 1;}else if (suitNo3 == 2){score = 2;}else if (suitNo3 == 3){score = 3;}else if (suitNo3 == 4){score = 4;}
        total = total+score
        if (suitNo4 == 1){ score = 1;}else if (suitNo4 == 2){score = 2;}else if (suitNo4 == 3){score = 3;}else if (suitNo4 == 4){score = 4;}
        total = total+score
        if (suitNo5 == 1){ score = 1;}else if (suitNo5 == 2){score = 2;}else if (suitNo5 == 3){score = 3;}else if (suitNo5 == 4){score = 4;}
        total = total+score
        if (suitNo6 == 1){ score = 1;}else if (suitNo6 == 2){score = 2;}else if (suitNo6 == 3){score = 3;}else if (suitNo6 == 4){score = 4;}
        total = total+score
        if (suitNo7 == 1){ score = 1;}else if (suitNo7 == 2){score = 2;}else if (suitNo7 == 3){score = 3;}else if (suitNo7 == 4){score = 4;}
        total = total+score
        if (suitNo8 == 1){ score = 1;}else if (suitNo8 == 2){score = 2;}else if (suitNo8 == 3){score = 3;}else if (suitNo8 == 4){score = 4;}
        total = total+score
        if (suitNo9 == 1){ score = 1;}else if (suitNo9 == 2){score = 2;}else if (suitNo9 == 3){score = 3;}else if (suitNo9 == 4){score = 4;}
        total = total+score
        if (suitNo10 == 1){ score = 1;}else if (suitNo10 == 2){score = 2;}else if (suitNo10 == 3){score = 3;}else if (suitNo10 == 4){score = 4;}
        total = total+score
        if (suitNo11 == 1){ score = 1;}else if (suitNo11 == 2){score = 2;}else if (suitNo11 == 3){score = 3;}else if (suitNo11 == 4){score = 4;}
        total = total+score
        if (suitNo12 == 1){ score = 1;}else if (suitNo12 == 2){score = 2;}else if (suitNo12 == 3){score = 3;}else if (suitNo12 == 4){score = 4;}
        total = total+score
       
 
        //let sumScore = Number(suitNo1) + Number(suitNo2)+ Number(suitNo3)+ Number(suitNo4)+ Number(suitNo5)+ Number(suitNo6)+ Number(suitNo7)+ Number(suitNo8)+ Number(suitNo9)+ Number(suitNo10)+ Number(suitNo11)+ Number(suitNo12)
        
        return callback(total)
}
async function setSuitDetail(Suit_Id,datarows,Series_Id){
  try{
      let suitNo1     =datarows.suitNo1.substring(0,1) 
      let suitNo2     =datarows.suitNo2.substring(0,1)
      let suitNo3     =datarows.suitNo3.substring(0,1)
      let suitNo4     =datarows.suitNo4.substring(0,1)
      let suitNo5     =datarows.suitNo5.substring(0,1)
      let suitNo6     =datarows.suitNo6.substring(0,1)
      let suitNo7     =datarows.suitNo7.substring(0,1)
      let suitNo8     =datarows.suitNo8.substring(0,1)
      let suitNo9     =datarows.suitNo9.substring(0,1)
      let suitNo10    =datarows.suitNo10.substring(0,1)
      let suitNo11    =datarows.suitNo11.substring(0,1)
      let suitNo12    =datarows.suitNo12.substring(0,1)

      let CID =[]
      if (suitNo1 == 1){ CID[0] = 285;}else if (suitNo1 == 2){CID[0] = 286;}else if (suitNo1 == 3){CID[0] = 287;}else if (suitNo1 == 4){CID[0] = 288;}
      if (suitNo2 == 1){ CID[1] = 289;}else if (suitNo2 == 2){ CID[1] = 290;}else if (suitNo2 == 3){ CID[1] = 291;}else if (suitNo2 == 4){ CID[1] = 292;}
      if (suitNo3 == 1){ CID[2] = 293;}else if (suitNo3 == 2){CID[2] = 294;}else if (suitNo3 == 3){CID[2] = 295;}else if (suitNo3 == 4){CID[2] = 296;}
      if (suitNo4 == 1){ CID[3] = 316;}else if (suitNo4 == 2){CID[3] = 317;}else if (suitNo4 == 3){CID[3] = 318;}else if (suitNo4 == 4){CID[3] = 319;}
      if (suitNo5 == 1){ CID[4] = 301;}else if (suitNo5 == 2){CID[4] = 302;}else if (suitNo5 == 3){CID[4] = 303;}else if (suitNo5 == 4){CID[4] = 304;}
      if (suitNo6 == 1){ CID[5] = 305;}else if (suitNo6 == 2){CID[5] = 306;}else if (suitNo6 == 3){CID[5] = 307;}else if (suitNo6 == 4){CID[5] = 308;}
      if (suitNo7 == 1){ CID[6] = 312;}else if (suitNo7 == 2){CID[6] = 313;}else if (suitNo7 == 3){CID[6] = 314;}else if (suitNo7 == 4){CID[6] = 315;}
      if (suitNo8 == 1){ CID[7] = 261;}else if (suitNo8 == 2){CID[7] = 262;}else if (suitNo8 == 3){CID[7] = 263;}else if (suitNo8 == 4){CID[7] = 264;}
      if (suitNo9 == 1){ CID[8] = 265;}else if (suitNo9 == 2){CID[8] = 266;}else if (suitNo9 == 3){CID[8] = 267;}else if (suitNo9 == 4){CID[8] = 268;}
      if (suitNo10 == 1){ CID[9] = 269;}else if (suitNo10 == 2){CID[9] = 270;}else if (suitNo10 == 3){CID[9] = 271;}else if (suitNo10 == 4){CID[9] = 272;}
      if (suitNo11 == 1){ CID[10] = 309;}else if (suitNo11 == 2){CID[10] = 310;}else if (suitNo11 == 3){CID[10] = 311;}else if (suitNo11 == 4){CID[10] = 0;}
      if (suitNo12 == 1){ CID[11] = 282;}else if (suitNo12 == 2){CID[11] = 283;}else if (suitNo12 == 3){CID[11] = 284;}else if (suitNo12 == 4){CID[11] = 0;}
      
    // console.log(CID)    
    let statement = `SELECT QId FROM MFTS_Suit_Question WHERE id = ${Series_Id} `
    await new sql.ConnectionPool(config).connect().then(pool => {
      return pool.request()
      .query(statement);

    }).then(result => {
      
      let rowsAffected = result.rowsAffected.toString() 
      //console.log("result series : "+rowsAffected)
      sql.close();
      
      if (rowsAffected > 0){   
      let  Qid = result.recordset 
        //console.log(result.recordset)
        ImportSuitDetail(Suit_Id,Qid,CID) 
      } 
  
    }).catch(err => {
        console.log(err); 
        sql.close();
    });

  }catch (error) {
    result = "ERROR Catch"
    console.log(error);
  }
}
async function setDateCreate(lastID,datesuit){
  try{  
    let suitdatet = datesuit.substring(0,4) + "/" +datesuit.substring(4,6)  + "/" +  datesuit.substring(6,8) 
    let statement = `UPDATE MFTS_Suit
                      SET Document_Date  = '${suitdatet}'
                      WHERE Suit_Id = ${lastID} `
    //console.log(statement)
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);

    }).then(result => {
        
        let rowsAffected = result.rowsAffected.toString() 
        //console.log("result series : "+rowsAffected)
        sql.close();
        // let risklevel = 0 
        // if (rowsAffected > 0){  risklevel = result.recordset[0].suitabilityRiskLevel.toString() } 
      console.log("update create date  ID : "+lastID)
       // return callback(risklevel)
    }).catch(err => {
        console.log(err);
        sql.close();
    //return   callback("0");
    });
  }catch (error) {
      result = "ERROR Catch"
      console.log(error);
  //return   callback(error);
  }
}
async function ImportSuitDetail(id,QID,CId){
  for ( let key in QID) {
    try{ 
        // console.log("QQQ "+ QID[key].QId)
        // console.log("CCCC "+ CId[key]) 
        await poolPromise.then(pool => {
          return pool.request()
              .input("Suit_Id",     sql.Int,      id)
              .input("Qid",         sql.Int,      QID[key].QId)
              .input("CId",         sql.Int,      CId[key])
              .execute(`[dbo].[USP_MFTS_Save_Suit_Detail]`);
        }).then(result => {
          // let respx = " MTFS_SUIT Insert Qid :" + QID[key].QId + " "; 
          //console.log(respx); 
          sql.close();
        }).catch(err => {
            console.log(err);
            //sql.close();
          // return callback(err); 
        });


    }catch (error) {
      result = "ERROR Catch"
      console.log(error);
    //  return   callback(error);
    }


    
  }

}
export {selectDataSuit,GetDataSuit,ImportDataSuit}



//****************[ Created Date 2022 06 27  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/