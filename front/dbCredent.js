import express from 'express';
import sql from  'mssql';
import {config}  from './dbconfig.js';
import poolPromise from './db.js';


async function setCredentUpdate(  txid, new_status, xemail, callback ) {
    let result = "ok";
    try 
    {
      var statement = `INSERT INTO Fund_Credent_Update ( txid, new_status, xemail ) 
      VALUES (@itxid, @inew_status , @iemail );`
      
      await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .input("itxid"      , sql.NVarChar, txid)
        .input("inew_status", sql.NVarChar, new_status)
        .input("iemail"     , sql.NVarChar, xemail)
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

  export{
    setCredentUpdate
  }
  