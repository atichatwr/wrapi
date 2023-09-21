
import express from 'express';
import sql from  'mssql';
import {config}  from './dbconfig.js';
import poolPromise from './db.js';


sql.on('error' , err => {
  console.log("dbIndividual:sql.on error");
  console.log( err);
})
/*
async function StatusUpdateExcel( cardNumber, resultCode, desc, callback ) {
  let result = "ok";
  try 
  {
    var statement = `
    UPDATE FundExc_Individual_FIX 
	  SET StatusAPI = @iresult , StatusFundConn = @idesc
	  WHERE Card_Number = @icardNumber;
    `;
    let pool = await sql.connect(config);
    let data = await pool.request()
    .input("icardNumber", sql.NVarChar, cardNumber)
    .input("iresult"    , sql.NVarChar, resultCode)
    .input("idesc"      , sql.NVarChar, desc)
    .query(statement);
    
    pool.close();
    sql.close();
    return callback(data);  
  
  } catch (error) {
    result = "nook"
    console.log(error);
    return callback(error);
  }
 
  
}
*/

async function StatusUpdateExcel( cardNumber, resultCode, desc, callback ) {
  let result = "ok";
  try 
  {
    var statement = `
    UPDATE FundExc_Individual_FIX 
    SET StatusAPI = @iresult , StatusFundConn = @idesc
    WHERE Card_Number = @icardNumber;
    `;
    await new sql.ConnectionPool(config).connect().then(pool => {
      return pool.request()
      .input("icardNumber", sql.NVarChar, cardNumber)
      .input("iresult"    , sql.NVarChar, resultCode)
      .input("idesc"      , sql.NVarChar, desc)
      .query(statement);

    }).then(result => {
      sql.close();
      return callback(result);  

    }).catch(err => {
      console.log(err);
      sql.close();
      return callback(err);
    });
  } catch (error) {
    result = "nook"
    console.log(error);
    return callback(error);
  }
  
}

/**
 * new sql.ConnectionPool(config).connect().then(pool => {
    return pool.query`select * from mytable where id = ${value}`
}).then(result => {
    console.dir(result)
}).catch(err => {
    // ... error checks
})
 * 
 */
async function setUpdateIndividualAccoutCODE( apiRef, apiDesc, callback){
  try {
    var statement = `UPDATE FundExc_Account_CODE 
    SET StatusFundConn = @iresult 
    WHERE Card_Number = @icardNumber ;
    `;
    await poolPromise.then( pool => {
      return pool.request()
      .input("iresult", sql.NVarChar, apiDesc)
      .input("icardNumber", sql.NVarChar, apiRef)
      .query(statement)})
      .then( result =>{        
        return callback(result);     
      }
    )
  } catch (error){
    
    console.log(error);
    return callback(error);
  }
}



async function StatusUpdate( cardNumber, resultCode, desc, callback ) {
  let result = "ok";
  try 
  {
    var statement = `UPDATE Account_Info 
    SET StatusApi = @iresult , rejectDesc = @idesc , DateApi = @idate
    WHERE Account_Info.Cust_Code = @icardNumber ;
    `;
    await new sql.ConnectionPool(config).connect().then(pool => { 
      return pool.request()
      .input("icardNumber", sql.NVarChar, cardNumber)
      .input("iresult"    , sql.NVarChar, resultCode)
      .input("idesc"      , sql.NVarChar, desc)
      .input("idate"      , sql.DateTime, new Date())
      .query(statement);

    }).then(result => { 
      sql.close();
      return callback(result);
    }).catch(err => {
      console.log(err);
      sql.close();
      return callback(err); 
    });
  
  } catch (error) {
    result = "nook"
    console.log(error);
    return callback(error);
  }
 
  
}


async function setErrorLog( apiRef, endPoint, apiError, apiDesc, callback) {
  try 
  {
    var statement = `INSERT INTO API_error_log ( API_REF, API_ENDPOINT, API_ERROR, API_DESC ) 
    VALUES (@iapiRef, @iendPoint , @iapiError, @iapiDesc );`
    
    await new sql.ConnectionPool(config).connect().then(pool => {
      return pool.request()
      .input("iapiRef"    , sql.NVarChar, apiRef)
      .input("iendPoint"  , sql.NVarChar, endPoint)
      .input("iapiError"  , sql.NVarChar, apiError)
      .input("iapiDesc"   , sql.NVarChar, apiDesc)
      .query(statement);
    }).then(result => {
      sql.close();
      return callback(result);
    }).catch(err => {
      console.log(err);
      sql.close();
      return callback(err);
    });
   
  } catch (error) {
    result = "nook"
    console.log(error);
    return callback(error);
  }


}

function zwait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fixcircular ( data ) {

  var cache = [];
  JSON.stringify( data, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      // Duplicate reference found, discard key
      if (cache.includes(value)) {
        console.log("Duplicate found:");
        console.log(value);
        return;
      } 
  
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // Enable garbage collection

}

function fixZero ( cdata, digit) {
  
  var xdata = new String(cdata);
  var xret = "";
  var zeor = new String("0");
  
  if (xdata.length < digit) {
    xret = zeor.repeat(digit - xdata.length)+xdata;
  } else {
    xret = xdata;
  }
  return xret;
}

function fixCardExpiryDate( cyyyymmdd ) {
  //--- tempolary fix card expire date to year 2022.
  var fizdate = "";
  var olddate = new String("");
  var chkyear = "";
  olddate = cyyyymmdd;
  chkyear = olddate.substr(0,4);

  if ( chkyear <= '2021' ){
    fizdate = '2022'+olddate.substr(4,4);
  } else {
    fizdate = olddate;
  }
  return fizdate;
}

function getTodayYYYYMMDD(){
  var d = new Date(date),
    xmonth = '' + (d.getMonth() ),
    xday = '' + d.getDate(),
    year = d.getFullYear();

    if (xmonth.length < 2) 
        xmonth = '0' + month;
    if (xday.length < 2) 
        xday = '0' + day;  
  //return [year, month, day].join('-');
  return year + month + day;
}

function getExpireNextYear(){
  var d = new Date(),
    xmonth = '' + (d.getMonth() ),
    xday = '' + d.getDate(),
    year = (d.getFullYear() + 8);

    if (xmonth.length < 2) 
        xmonth = '0' + xmonth;
    if (xday.length < 2) 
        xday = '0' + xday;  
  //return [year, month, day].join('-');
  return year + xmonth + xday;
}
function fixLastYear(){
  var d = new Date(),
    xmonth = '' + (d.getMonth() ),
    xday = '' + d.getDate(),
    year = (d.getFullYear() - 1);

    if (xmonth.length < 2) 
        xmonth = '0' + xmonth;
    if (xday.length < 2) 
        xday = '0' + xday;  
  //return [year, month, day].join('-');
  return year + xmonth + xday;
}

// This should work in node.js and other ES5 compliant implementations.
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

function getDateYesterday(){
  var d = new Date(); // Today!
  d.setDate(d.getDate() - 1); // Yesterday!
  
  let xmonth = '' + (d.getMonth() );
  let xday = '' + d.getDate();
  let year = (d.getFullYear());
  
  if (xmonth.length < 2) 
    xmonth = '0' + xmonth;
  if (xday.length < 2) 
    xday = '0' + xday;  
  return year + xmonth + xday;
 
}

export {
  
  StatusUpdate,
  setErrorLog,
  fixZero,
  fixCardExpiryDate,
  fixLastYear,
  getTodayYYYYMMDD,
  getExpireNextYear,
  getDateYesterday,
  isEmptyObject,
  StatusUpdateExcel,
  setUpdateIndividualAccoutCODE
};


