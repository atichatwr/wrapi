//****************[ Created Date 2022 08 10  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/
import express from 'express';
import sql  from 'mssql';
import dotenv from 'dotenv';
import { config } from './dbconfig.js';
import poolPromise from './db.js';

import {Update_MFTS_FUND ,Insert_MFTS_FUND} from './dbsql.js';
 
 import {getdate ,getRef} from './tranwait.js'
dotenv.config();

async function selctDataFundMapping(callback){

    try{
        let statement ="SELECT * FROM Fund_Cen_FundMapping"

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