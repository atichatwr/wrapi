import express from 'express';
import sql from  'mssql';
import {config}  from './dbconfig.js';
import poolPromise from './db.js';

async function getdataconfirm(confirm_date ,callback){

    try 
    {
      var statement = `SELECT   * FROM fc_opa_confirm 
                        WHERE CreateDate >= '${confirm_date}' 
                        `
      // console.log(statement)
      await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        // .input("CreateDate"          , sql.Date, confirm_date)
        .query(statement);
  
      }).then(result => {
        // console.log(result.recordset)
        sql.close();
        return callback(result.recordset);  
  
      }).catch(err => {
        console.log(err);
        sql.close();
        return callback(err);
      });
    } catch (error) { 
      console.log(error);
      return callback(error);
    }
}
export {getdataconfirm} 