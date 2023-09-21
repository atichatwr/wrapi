//****************[ Created Date 2022 07 08  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/
//****************2022-09-09*************************************************** */

import sql  from 'mssql';
import dotenv from 'dotenv';
import { config } from './dbconfig.js';
import poolPromise from './db.js';
import {InsertMFTS_TRANSACTION} from './dbsql.js';
import {getTranNumber, convertMKTID, InsertMFTSBuy ,UpdateUnitBalance } from './tranwait.js' 
dotenv.config();

async function getDataTransaction(callback){
    try 
    {
    let data_row = 0
    let statement = `SELECT     TOP (100) PERCENT dbo.MFTS_Fund.Fund_Id, dbo.Fund_Cen_AllottedTransactions.TRANS_DATE, dbo.Fund_Cen_AllottedTransactions.AMC_CODE, dbo.Fund_Cen_AllottedTransactions.FILTER01, 
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
                    dbo.Fund_Cen_AllottedTransactions.FILTER04, dbo.MFTS_Account.Ref_No , dbo.MFTS_Account.Holder_Id
                FROM         dbo.Fund_Cen_AllottedTransactions INNER JOIN
                    dbo.MFTS_Amc ON dbo.Fund_Cen_AllottedTransactions.AMC_CODE = dbo.MFTS_Amc.Amc_Code INNER JOIN
                    dbo.MFTS_Fund ON dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.MFTS_Fund.Fund_Code LEFT OUTER JOIN
                    dbo.Fund_Cen_UnitholderBalance ON dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID = dbo.Fund_Cen_UnitholderBalance.UNITHOLDER_ID AND 
                    dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.Fund_Cen_UnitholderBalance.FUND_CODE LEFT OUTER JOIN
                    dbo.MFTS_Account ON dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID = dbo.MFTS_Account.Holder_Id AND 
                    dbo.Fund_Cen_AllottedTransactions.FILTER01 = dbo.MFTS_Account.Account_No
                ORDER BY dbo.MFTS_Fund.Fund_Id`

    //console.log(statement)
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //console.log(result);
        data_row = result.rowsAffected.toString();
        console.log("result Transaction : "+ data_row +" row")
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
async function importDataTransaction(datarows, callback){
    for (const key in datarows) {

        try{
            const cardNumber            = datarows[key].FILTER01
            const HolderNo              = datarows[key].UNITHOLDER_ID
            const AMCID                 = datarows[key].Amc_Id
            let TranDate                = datarows[key].TRANS_DATE
            const TranStatus            = datarows[key].STATUS
            let amountbaht              = datarows[key].AMOUNT
            let amountunit              = datarows[key].ALLOTED_UNIT
            let navprice                = datarows[key].ALLOTED_NAV
            let EFFECTIVEDATEx          = datarows[key].EFFECTIVE_DATE
            let MKTIID                  = datarows[key].IC_CODE
            let average_cost            = null
            let  unitbalance            = datarows[key].UNIT_BALANCE
            const Fundcode              = datarows[key].FUND_CODE
            let Alloted_Amount          = datarows[key].ALLOTED_AMOUNT
            let allottedNAV             = datarows[key].ALLOTED_NAV
            const allottedUnit          = datarows[key].ALLOTED_UNIT
            const tranTypeCode_db       = datarows[key].TRANS_CODE
            let RefNo                   = datarows[key].Ref_No
            let Fund_Id                 = datarows[key].Fund_Id
            const AMC_CODE              = datarows[key].AMC_CODE
            let Amount_U                = datarows[key].UNIT
            let transactionId           = datarows[key].TRANSACTION_ID
            // console.log("Amount_U "+ Amount_U )
            let tranTypecode ,amountunit_db ,realizeGi_db
            let balanceNav , balanceAvg, realizeGi
            let statusApprov
            if (TranStatus === "WAITING") {statusApprov = 5}
            if (TranStatus === "ALLOTTED") {statusApprov = 7}
            if (TranStatus === "REJECTED") {statusApprov = 8}
            if (tranTypeCode_db === "SUB") {
                if(amountbaht > 0 && average_cost > 0 ){
                    amountunit_db    =  amountbaht / average_cost
                }
                tranTypecode            = "B"  // trancode
            }else if(tranTypeCode_db === "RED"){
                balanceNav              = allottedUnit * allottedNAV
                balanceAvg              = allottedUnit * average_cost
                if(allottedNAV > 0 && average_cost >0){ realizeGi_db = (balanceNav - balanceAvg)}
                if(amountbaht > 0 && average_cost > 0 ){amountunit_db = (amountbaht / average_cost); unitbalance = amountunit_db}
                tranTypecode            = "S" 
                // console.log(realizeGi.toString())
            }else if (tranTypeCode_db === "TRI" || tranTypeCode_db === "XSI"){
                if (amountbaht > 0 ) {amountunit_db = (amountbaht/average_cost)}
                tranTypecode = "TI"
            }else if (tranTypeCode_db === "TRO"  || tranTypeCode_db === "XSO"){
                balanceNav = allottedUnit * allottedNAV
                balanceAvg = allottedUnit * average_cost
                if (allottedNAV > 0 && average_cost >0){realizeGi_db = balanceNav - balanceAvg}
                if (amountbaht > 0 && average_cost >0 ){ amountunit_db = (amountbaht / average_cost)}
                tranTypecode === "TO"
            }else if (tranTypeCode_db === "SWI" ){
                if(amountbaht > 0 && average_cost > 0 ){amountunit_db = (amountbaht / average_cost)}
                tranTypecode = "SI"
            }else if (tranTypeCode_db === "SWO" ){
                balanceNav = allottedUnit * allottedNAV
                balanceAvg = allottedUnit * average_cost
                if (allottedNAV > 0 && average_cost >0){realizeGi_db = balanceNav - balanceAvg}
                //statusApprov = 8
                tranTypecode = "SO"
            }
            if (TranStatus === "ALLOTTED"){
                average_cost            = Alloted_Amount / amountunit
                // navprice                = null
                navprice                =  datarows[key].ALLOTED_NAV
                // navprice                = parseInt(navprice)
                // console.log(navprice)
                await getUnitBalance(RefNo , Fund_Id ,( unibal)=>{ unitbalance = unibal })
            }
            let dateserver
            await getdatetime((dt=>{dateserver = dt}))
            if(realizeGi        === undefined)  {realizeGi = 0.000000}
            if(navprice         === undefined)  {navprice = 0.000000}
            if(amountunit       === undefined || amountunit.toString.length == 0 )  {amountunit = 0.000000}
            if(Amount_U         === undefined )  {Amount_U = 0.000000}
            if(average_cost     === undefined)  {average_cost = 0.000000}
            if(unitbalance      === undefined)  {unitbalance = 0.000000}
            if(amountbaht       === undefined )  {amountbaht = 0.000000}
            if(amountunit_db    === undefined){amountunit_db = amountunit}
            if(realizeGi_db     === undefined ){realizeGi_db = realizeGi}
            let executedate     = EFFECTIVEDATEx.substring(0,4) + "-" + EFFECTIVEDATEx.substring(4,6)  + "-" + EFFECTIVEDATEx.substring(6,8)
            let statement ,TranDate_chk
            TranDate_chk        = TranDate.substring(0,4) + "-" + TranDate.substring(4,6)  + "-" + TranDate.substring(6,8)
            //if (transactionId === null || transactionId === undefined){
                let seq_number = 0
                await getSeqNo(RefNo, Fund_Id, (sq_no)=> {  seq_number = sq_no  })
                statement = `SELECT REF_NO FROM MFTS_TRANSACTION 
                             WHERE  REF_NO          = '${RefNo}' 
                             AND    Fund_Id         = ${Fund_Id} 
                             AND    Tran_Date       ='${TranDate_chk}'
                             AND    ExecuteDate     = '${executedate}'
                             `
                             
                            //} AND    seq_no          = ${seq_number}
            //}
            // else{
                // statement = `SELECT REF_NO, FUNDCODEI , UNITHOLDERI
                //                 FROM  MFTS_TRANSACTION
                //                 WHERE TRANTYPE_CODE     = '${tranTypecode}'
                //                 AND   UNITHOLDERI       = '${HolderNo}'
                //                 AND   FUNDCODEI         = '${Fundcode}' 
                //                 AND   TRANSACTION_DATE  = '${TranDate}'`
            // }
                
            let query , flag_db ,APIstatus
            // console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
                }).then(result => {
                let data_row = result.rowsAffected;
                // console.log("key " + key )
                //  console.log( result )
                if (data_row == 1){
                    //update
                    // if (transactionId === null || transactionId === undefined){
                        query = `UPDATE MFTS_Transaction
                        SET APIstatus       = @APIstatus,
                        RGL                 = @RGL,
                        Amount_Unit         = @Amount_Unit,
                        Amount_Baht         = @Amount_Baht,
                        Unit_balance        = @Unit_balance,
                        NAV_PRICE           = @NAV_PRICE,
                        Status_Id           = @Status_Id,
                        Modify_Date         = @Modify_Date,
                        Total_Cost          = @Total_Cost,
                        AVG_Cost            = @AVG_Cost,
                        Seq_No              = @Seq_No,
                        Act_ExecDate        = @Act_ExecDate,
                        Mktid               = @Mktid,
                        FUNDCODEI           = @FUNDCODEI,
                        UNITHOLDERI         = @UNITHOLDERI,
                        IDACCOUNTI          = @IDACCOUNTI,
                        AMCCODEI            = @AMCCODEI,
                        TranSaction_Date    = @TranSaction_Date,
                        TRANTYPECODEX       = @TRANTYPECODEX,
                        transactionId       = @transactionId,
                        Source_Flag         = @Source_Flag
                        WHERE  REF_NO          = '${RefNo}' 
                        AND    Fund_Id         = ${Fund_Id} 
                        AND    Tran_Date       ='${TranDate_chk}'
                        AND    ExecuteDate     = '${executedate}'  
                        `
                    // }else{ 
                    //     query = `UPDATE MFTS_Transaction
                    //     SET APIstatus       = @APIstatus,
                    //     RGL                 = @RGL,
                    //     Amount_Unit         = @Amount_Unit,
                    //     Amount_Baht         = @Amount_Baht,
                    //     Unit_balance        = @Unit_balance,
                    //     NAV_PRICE           = @NAV_PRICE,
                    //     Status_Id           = @Status_Id,
                    //     Modify_Date         = @Modify_Date
                    //     WHERE  transactionId     =  '${transactionId}'`
                    // }   AND    Seq_No          = ${seq_number}

                    APIstatus = "U"
                    flag_db = "Update"
                }else{
                    //Insert
                    query = InsertMFTS_TRANSACTION
                    flag_db = "Insert"
                    APIstatus ="I"
                    // if (TranStatus === "REJECTED") {  continue ; }
                    
                }
            })
            let tranNo , seqno
            if (flag_db === "Insert"){
                if (TranStatus === "REJECTED") {  continue ; }
                await  getTranNumber(1,(no)=>{ tranNo =no })
                // console.log(tranNo)
                if(RefNo === null){ await getRefx("Ref_No",1 , (ref)=>{RefNo = ref })}

                await getMaxSeqNo(RefNo,Fund_Id,(maxseq)=>{ seqno = maxseq})
                // console.log("max : "+ max)
            }
            let trandate_db     =TranDate.substring(0,4) + "-" + TranDate.substring(4,6)  + "-" + TranDate.substring(6,8)    
            let Source_Flag     = "F"
            
            let mkktid
            await convertMKTID(MKTIID , (id)=>{ mkktid = id })
            let Create_By               = '146'
            let Modify_By               = '95' // ห้ามหลุด
            let API                     ='U'
            let Modify_Date             = TranStatus === "ALLOTTED" ? dateserver: executedate +  ' 15:30:00.000'         
            let modify_time             = '15:30'
            // console.log("ref no :"+ RefNo)
            let price                   = TranStatus === "ALLOTTED" ? Alloted_Amount : amountbaht
            // let unit                   = TranStatus === "ALLOTTED" ? amountunit : 0.000000
            let unit                   = TranStatus === "ALLOTTED" ?  allottedUnit :  0.000000 
            if(TranStatus === "WAITING" && price == 0){  unit = Amount_U ;}
            let tranflag = null;
            await checkUnitHolder(AMCID,RefNo,cardNumber,HolderNo)
            let result
            await poolPromise.then(pool => {
                return pool.request()
                    .input("Tran_No",       sql.VarChar(12),    tranNo)
                    .input("Ref_No",        sql.VarChar(12),    RefNo)
                    .input("TranType_Code", sql.VarChar(2),     tranTypecode)
                    .input("Fund_Id",       sql.Int,            Fund_Id )
                    .input("Tran_Date",     sql.Date,           trandate_db)
                    .input("Status_Id",     sql.TinyInt,        statusApprov)
                    .input("Source_Flag",   sql.Char(1),        Source_Flag)
                    .input("Amount_Baht",   sql.Numeric(18,2),  price)
                    .input("Amount_Unit",   sql.Numeric(18,4),  unit)
                    .input("APIstatus",     sql.NChar(10),      APIstatus)
                    .input("NAV_PRICE",     sql.Numeric(18,4),  parseFloat(navprice))
                    .input("ExecuteDate",   sql.Date,           executedate)
                    .input("Act_ExecDate",  sql.Date,           executedate)
                    .input("Seq_No",        sql.Int,            seqno)
                    .input("Mktid",         sql.Int,            mkktid )
                    .input("Create_by",     sql.VarChar(20),    Create_By)
                    .input("Create_date",   sql.DateTime,       dateserver)
                    // .input("Modify_Date",   sql.DateTime,       dateserver)
                    .input("Unit_Balance",  sql.Decimal(18,4),  unitbalance)
                    .input("AVG_Cost",      sql.Float,          average_cost)
                    .input("Total_Cost",    sql.Decimal(18,4),  amountbaht  )
                    .input("Modify_By",     sql.VarChar(20),    Modify_By)
                    .input("FeeRate_Group", sql.Int,              1 )
                    .input("Modify_Date",   sql.DateTime,       Modify_Date)
                    .input("RGL",           sql.Decimal(20,6),  realizeGi)
                    .input("FUNDCODEI",     sql.NChar(30),      Fundcode)
                    .input("UNITHOLDERI",   sql.NChar(30),      HolderNo)
                    .input("IDACCOUNTI",    sql.NChar(30),      cardNumber)
                    .input("AMCCODEI",      sql.NChar(30),      AMC_CODE)
                    .input("TranSaction_Date", sql.NChar(14),   TranDate)
                    .input("TRANTYPECODEX", sql.NChar(5),       tranTypeCode_db)
                    .input("TranTypeFLAG",  sql.VarChar(30),    tranflag)
                    .input("CustomerInput",  sql.Char(1),       null)
                    .input("transactionId",  sql.VarChar(20),   transactionId) 
                    .query(query)
                }).then(result => {
                    let row = result.rowsAffected
                    let respx = flag_db + " to  MFTS TRANSACTION   RefNo :" + RefNo + " record(s)";
                    console.log(respx);
                    sql.close();
                   
        
                }).catch(err => {
                    console.log(err);
                    sql.close();
                    // return callback(err);
                });
            // console.log("navprice :"+ navprice.toString()+ " :")
            // console.log(statement)
            // console.log(amountunit_db)
            if (flag_db === "Insert"){
               await InsertMFTSBuy(tranNo,"Moblie","C","0","OD")
            //    await UpdateUnitBalance(RefNo,HolderNo,cardNumber,Fundcode,Fund_Id)
            }
        }catch(error) {
            console.log(error);
            return   callback(error);
          
        }
       
    }
    

}
async function getRefx(typeno,flag , callback){
    let refno ,turnRef
    await getrefnumber(typeno,flag, (x)=>{refno = x})
    // console.log("ref no " + refno + " ... "+ refno.toString().length)
    switch (refno.toString().length) {
        case 4:
            turnRef = "M0000000"
            break;
        case 5:
            turnRef = "M000000"
            break;
        case 6:
            turnRef = "M00000"
            break;
        case 7:
            turnRef = "M0000"
            break;
        case 8:
            turnRef = "M000"
            break;
    }
    // console.log(turnRef+refno)
    return callback(turnRef+refno)
}
async function getrefnumber(refcode,segno, callback){
    let RefNo
    try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .input('centercode' , sql.Char(15), refcode)
          .input('transeq' ,sql.Int, segno)
          .execute(`[dbo].[usp_gettranidref]`);
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
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
    if (RefNo === undefined){return callback(1)}
    let statement = `SELECT isnull(max(Seq_No),0) +1 AS maxx  FROM MFTS_Transaction  WHERE Ref_no = '${RefNo}' AND Fund_Id = '${Fundid}'`
    //console.log(statement)
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
async function getSeqNo(RefNo, Fund_Id, callback){
    let statement = `SELECT TOP(1) Seq_No FROM MFTS_TRANSACTION WHERE REF_NO = '${RefNo}' AND Fund_ID = ${Fund_Id} ORDER BY Seq_no DESC ;`  
              //console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          let seq_no = 1
          if (rowsAffected > 0){  
              seq_no = result.recordset[0].Seq_No
             if(seq_no === null){ seq_no =   1}
        }
          sql.close();
          return callback(seq_no)
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
async function getUnitBalance(RefNo , Fund_Id , callback ){
try{
    let statement = ` SELECT Confirm_Unit FROM MFTS_UnitBalance WHERE Ref_No = '${RefNo}' AND Fund_Id = ${Fund_Id} `
    // console.log(statement);
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
        
    }).then(result => {
        let rowsAffected = result.rowsAffected.toString()
        let Confirm_Unit = null
        if (rowsAffected > 0){  
            Confirm_Unit = result.recordset[0].Confirm_Unit
          //  if(seq_no === null)
      }
        sql.close();
        return callback(Confirm_Unit)
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

//Waiting form data Fundconnex On Monday 2022-09-12
async function checkUnitHolder(Amc_Id,RefNo,cardNumber,HolderNo){
    try{
        let statement = "SELECT Holder_Id FROM MFTS_ACCOUNT WHERE Ref_No=@RefNo AND  Account_No= @cardNumber AND  Amc_Id=@Amc_id "
        
        await poolPromise.then(pool => {
        return pool.request()
            .input("RefNo",             sql.VarChar(12),    RefNo)
            .input("cardNumber",        sql.VarChar(20),    cardNumber)
            .input("Amc_Id",            sql.Int,            Amc_Id)
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            let hoderId 
            if (rowsAffected > 0){  
                hoderId = result.recordset[0].Holder_Id
               if(hoderId === null || hoderId.toString().trim() ===""){ 
                    updateholderAccount(Amc_Id,RefNo,cardNumber,HolderNo)
               }
          }
            sql.close();
            // return callback(seq_no)
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
async function updateholderAccount(Amc_Id,RefNo,cardNumber,HolderNo){
    try{
        let statement = "UPDATE MFTS_ACCOUNT SET \
                        Holder_Id =@HolderNo  \
                        Modify_Date = @modify \
                        WHERE WHERE Ref_No=@RefNo AND  Account_No= @cardNumber AND  Amc_Id=@Amc_id "
        
        let dateserver
        await getdatetime((dt=>{dateserver = dt}))
        await poolPromise.then(pool => {
        return pool.request()
            .input("RefNo",             sql.VarChar(12),    RefNo)
            .input("cardNumber",        sql.VarChar(20),    cardNumber)
            .input("Amc_Id",            sql.Int,            Amc_Id)
            .input("Holder_Id",         sql.VarChar(30),    HolderNo)
            .input("Modify_Date",         sql.DateTime,    dateserver)
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            let hoderId 
            if (rowsAffected > 0){  
                console.log("Update Holder ID ON MFTS ACCOUNT "+ rowsAffected+" Row  Holder No is "+ HolderNo)
            }
            sql.close();
            return callback(seq_no)
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
export {getDataTransaction ,importDataTransaction}