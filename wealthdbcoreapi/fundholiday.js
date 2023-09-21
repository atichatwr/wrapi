//****************[ Created Date 2022 08 15  ]********************************/
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
import exp from 'constants';
// import { json } from 'body-parser';
dotenv.config();  

async function selectDataHoliday(callback){
    try{
        let datenow
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year +'-'+ month +'-'+ date
        let statement =`SELECT dbo.MFTS_Fund.Fund_Id,dbo.Fund_Cen_Fund_Holiday_Date.* 
                        FROM dbo.Fund_Cen_Fund_Holiday_Date INNER JOIN dbo.MFTS_Fund ON dbo.Fund_Cen_Fund_Holiday_Date.FUND_CODE = dbo.MFTS_Fund.Fund_Code 
                        WHERE timestampx >= '2022-12-20' AND dbo.MFTS_Fund.Fund_Id Between 1000 and 1300
                        ORDER BY Fund_Id `
        
        // console.log(statement)
    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
      
          }).then(result => {
            //console.log(result);
            let data_row = result.rowsAffected.toString();
            console.log("result Data Holiday : "+ data_row +" row")
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
async function checkDataHoliday(datarows, callback){
    // if(datarows.length == 0){return callback(0)} 
    // let statement , FundHolidayDate , FundId
    for (const item of datarows) {
        // console.log(item.Fund_Id)
        let statement
        let FundHolidayDate = item.FUND_HOLIDAY_DATE
        let FundId = item.Fund_Id
        let Fundcode = item.FUND_CODE
        statement = `SELECT Notworking_Date FROM MFTS_Fund_Notworking WHERE Notworking_Date = '${FundHolidayDate}' AND Fund_Id = '${FundId}'`
        let flag_con 
       try{

            await new sql.ConnectionPool(config).connect().then(pool => {
                    return pool.request()
                    .query(statement);
                    
                }).then(result => {
                    let rowsAffected = result.rowsAffected.toString()
                    
                    if (rowsAffected > 0 ){
                        //  notting
                        flag_con = "C"
                    }else{
                        //insert
                        flag_con = "N" 
                    }
                    // console.log(TRANSACTION_DATE)
                    sql.close();
                
                }).catch(err => {
                    console.log(err);
                    sql.close(); 
                
                });
            if (flag_con === "C") {continue;}  
                //console.log(flag_con + " action " + FundId + " Fundcode" +Fundcode + "date " + FundHolidayDate ) 
           await importDataHoliday(item) 

        }catch (error) {
            console.log(error);
            // return callback(error);
        }
    }
    //console.log("END")
    const console_time = new Date(Date.now());  
    console.log(" ================ Import Data Holiday Completed On :" + console_time)
    // return callback("Import Data Holiday Completed")
}

async function importDataHoliday(datas, callback){ 
    // console.log(datas) 
    // for (let index = 0; index < datas.length; index++) {
    //     const element = datas[index];
    //     console.log("tran type coed : "+element) 
    // } 
    let datenow 
    await getdatetime( (dt) =>{datenow = dt  })
    let datarow = [datas] 
    for (const item of datarow) {
     //  console.log(item)  
        try{
            let notworkingday       =item.FUND_HOLIDAY_DATE
            const Fund_Id             = item.Fund_Id
            let TranTypeCode        =["B","S","SI","SO","TI","TO"] //,"TI","TO"
            let notworkingday_db     =notworkingday.substring(0,4) + "-" + notworkingday.substring(4,6)  + "-" + notworkingday.substring(6,8)
            
            let usercreated = "146" 
            let statement
            let Status_inext = null
            for (let index = 0; index < TranTypeCode.length; index++) { 
                // const element = TranTypeCode[index];
                //console.log("tran type coed : "+element + " Fund_Id: " + Fund_Id + "notworkingday :"+ notworkingday)
                statement = `INSERT INTO MFTS_Fund_Notworking (Fund_Id, TranType_Code, Notworking_Date, Create_By, Create_Date, Modify_By, Modify_Date, Status_inext)
                             VALUES(@Fund_Id, @TranType_Code, @Notworking_Date, @Create_By, @Create_Date, @Modify_By, @Modify_Date, @Status_inext)   `
                             await poolPromise.then(pool => {
                                return pool.request()
                                    .input("Fund_Id",           sql.Int,            Fund_Id )
                                    .input("TranType_Code",     sql.VarChar(20),    TranTypeCode[index])
                                    .input("Notworking_Date",   sql.Date,           notworkingday_db)
                                    .input("Create_by",         sql.VarChar(20),    usercreated)
                                    .input("Create_date",       sql.DateTime,       datenow) 
                                    .input("Modify_Date",       sql.DateTime,       datenow)
                                    .input("Modify_By",         sql.VarChar(20),    usercreated)
                                    .input("Status_inext",      sql.NChar(1),       Status_inext)  
                                    .query(statement)
                                }).then(result => {
            
                                    let row = result.rowsAffected
                                    let respx = " Holiday_Date to    MFTS_Fund_Notworking   Fund_Id :" + Fund_Id + " TranType_Code :"+ TranTypeCode[index];
                                    if (row > 0 ){console.log(respx)}
                                    sql.close();
                                }).catch(err => {
                                    console.log(err);
                                    sql.close();
                                });
                
            }

        }catch (error) {
            console.log(error); 

        }
    }
    // return callback("import")
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

async function selectDataTrandCalendar(callback){
    try{
        let datenow
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year + month + date
        let statement =`SELECT dbo.MFTS_Fund.Fund_Id,dbo. Fund_Cen_Trade_Calendar.* 
                        FROM dbo. Fund_Cen_Trade_Calendar INNER JOIN dbo.MFTS_Fund ON dbo. Fund_Cen_Trade_Calendar.FUND_CODE = dbo.MFTS_Fund.Fund_Code 
                        WHERE timestampx >= '${datenow}' AND dbo.MFTS_Fund.Fund_Id = 1 and 500
                        ORDER BY Fund_Id `
        

    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
      
          }).then(result => {
            //console.log(result);
            let data_row = result.rowsAffected.toString();
            console.log("result Data Holiday : "+ data_row +" row")
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
async function checkDataTradeCalendar(datas ,callback){

}
async function selectREFHoliday(callback){
    let datas = []
    await ImportDataWeekend()
    return callback(datas)
}
async function ImportDataWeekend(callback){
    const start = new Date("01/01/2023");
    const end = new Date("12/31/2023");
    let loop = new Date(start);
    while (loop <= end) {
    // console.log(loop);
        if(loop.getDay() == 0 || loop.getDay() == 1){ 
            // console.log(loop)
            // console.log(loop.getFullYear() +"-"+("0"+ (loop.getMonth() + 1)).slice(-2)+"-" +("0"+loop.getDate()).slice(-2))
            let date_db = loop.getFullYear() +"-"+("0"+ (loop.getMonth() + 1)).slice(-2)+"-" +("0"+loop.getDate()).slice(-2)
            // if(loop.getFullYear() +"-"+(loop.getMonth() + 1)+"-" +loop.getDate()  ==='2022-12-31'){console.log(loop + "  skip") }
            try{
                let desc = (loop.getDay() == 0 ? "วันเสาร์" : "วันอาทิตย์")
                let statement = `INSERT INTO REF_Holiday ( hdate, hdescription)
                                VALUES( @hdate, @hdescription)   `
                await poolPromise.then(pool => {
                return pool.request()
                    .input("hdate",              sql.Date,             date_db)
                    .input("hdescription",         sql.NVarChar(80),    desc)
                    .query(statement)
                }).then(result => {

                    let row = result.rowsAffected
                    let respx = " Holiday_Date to    MFTS_Fund_Notworking  Date :" +date_db
                    if (row > 0 ){console.log(respx)}
                    sql.close();
                }).catch(err => {
                    console.log(err);
                    sql.close();
                });

            }catch (error) {
                console.log(error); 

            }
    
    
        }
    let newDate = loop.setDate(loop.getDate() + 1);
    loop = new Date(newDate);   
    }
}
async function importAllHoliday(callback){
        let Data_CEN_HOLIDAY
        let datenow
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year +'-'+ month +'-'+ date
        // console.log(datenow)
        let datadate = year + month + date
        let countrow
        try{
            
            let statement =`SELECT dbo.MFTS_Fund.Fund_Id,dbo.Fund_Cen_Fund_Holiday_Date.* 
                            FROM dbo.Fund_Cen_Fund_Holiday_Date INNER JOIN dbo.MFTS_Fund ON dbo.Fund_Cen_Fund_Holiday_Date.FUND_CODE = dbo.MFTS_Fund.Fund_Code 
                            WHERE FUND_HOLIDAY_DATE >= '${datadate}'  
                            ORDER BY Fund_Id `
            
            // console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
          
              }).then(result => {
                //console.log(result);
                let data_row = result.rowsAffected.toString();
                console.log("result Data Holiday : "+ data_row +" row")
                countrow = data_row
                sql.close();
                // console.log(result.recordset)
                // return  callback(result.recordset) 
                Data_CEN_HOLIDAY = result.recordset
              }).catch(err => {
                console.log(err);
                sql.close();
                // return   callback(err);
              });
            } catch (error) {
              result = "ERROR Catch"
              console.log(error);
            //   return   callback(error);
            }
    
    // console.log(Data_CEN_HOLIDAY)        
    let datrows = Data_CEN_HOLIDAY

    let datarows =[]       
    
    for (const key in datrows) {
        // if(key>1){continue;}
        let notworkingday       =datrows[key].FUND_HOLIDAY_DATE
        let Fund_Id             = datrows[key].Fund_Id
        let usercreated = "146"  
        let Status_inext = null 
        let notworkingday_db     =notworkingday.substring(0,4) + "-" + notworkingday.substring(4,6)  + "-" + notworkingday.substring(6,8)
        let TranTypeCode        =["B","S","SI","SO","TI","TO"] 
        
        for (const key in TranTypeCode) { 
            let data_set =[] 
               
            data_set.push(Fund_Id)
            data_set.push(TranTypeCode[key])
            data_set.push(notworkingday_db)
            data_set.push(usercreated)
            data_set.push(datenow)
            data_set.push(datenow)
            data_set.push(usercreated)
            data_set.push(Status_inext)
            datarows.push(data_set)
            // console.log(data_set)
        }
   
    }
     
    let table = new sql.Table('MFTS_Fund_Notworking');

    table.columns.add('Fund_Id',            sql.Int,            { nullable: false });
    table.columns.add('TranType_Code',      sql.VarChar(20),    { nullable: false });
    table.columns.add('Notworking_Date',    sql.Date,           { nullable: false });
    table.columns.add('Create_By',          sql.VarChar(20),    { nullable: true });
    table.columns.add('Create_Date',        sql.DateTime,       { nullable: true });
    table.columns.add('Modify_Date',        sql.DateTime,       { nullable: true });
    table.columns.add('Modify_By',          sql.VarChar(20),    { nullable: true });
    table.columns.add('Status_inext',       sql.Char(1),        { nullable: true });
    
    datarows.forEach(datarow => {table.rows.add.apply(table.rows, datarow)});

    let pool = await sql.connect(config);
    // console.log(statement)
        await pool.request().query(`DELETE FROM MFTS_Fund_Notworking WHERE Notworking_Date >='${datenow}' `); //
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);

            } else {
                

            }

            pool.close();
            sql.close();
    });


    return callback("insert into MFTS_Fund_Notworking  " +countrow + " rows")
}
 
export {selectDataHoliday,checkDataHoliday, importDataHoliday, selectDataTrandCalendar ,selectREFHoliday ,importAllHoliday}