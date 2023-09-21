//****************[ Created Date 2022 07 25  ]********************************/
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
import {getDateYesterday,isLogin} from '../fundconn/wealthutil.js';
// import { isModuleNamespaceObject } from 'util/types';
dotenv.config();

async function selctDataOrderQuery(callback){
    try{
        let timestampx
        const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        // timestampx = year +"-"+  month  +"-"+ date + " 00:00:00.000"
        timestampx = year  +  month  + date
        const aDate = getDateYesterday();
        let statement = `SELECT dbo.MFTS_Fund.Fund_Id ,dbo.MFTS_Fund.Amc_Id  ,
                                (SELECT  Ref_No FROM MFTS_Account  WHERE  Account_No = Fund_Cen_OrderInquiry.accountId AND Amc_Id = MFTS_Fund.Amc_Id AND Holder_Id = Fund_Cen_OrderInquiry.unitholderId ) as Ref_no ,
                                dbo.Fund_Cen_OrderInquiry.ID, dbo.Fund_Cen_OrderInquiry.transactionId, dbo.Fund_Cen_OrderInquiry.saOrderReferenceNo, dbo.Fund_Cen_OrderInquiry.transactionDateTime, 
                                dbo.Fund_Cen_OrderInquiry.orderType, dbo.Fund_Cen_OrderInquiry.accountId, dbo.Fund_Cen_OrderInquiry.unitholderId, dbo.Fund_Cen_OrderInquiry.fundCode, 
                                dbo.Fund_Cen_OrderInquiry.redemptionType, dbo.Fund_Cen_OrderInquiry.amount, dbo.Fund_Cen_OrderInquiry.unit, dbo.Fund_Cen_OrderInquiry.sellAllUnitFlag, 
                                dbo.Fund_Cen_OrderInquiry.statusx, dbo.Fund_Cen_OrderInquiry.effectiveDate, dbo.Fund_Cen_OrderInquiry.settlementDate, dbo.Fund_Cen_OrderInquiry.amcOrderReferenceNo, 
                                dbo.Fund_Cen_OrderInquiry.allottedAmount, dbo.Fund_Cen_OrderInquiry.allottedUnit, dbo.Fund_Cen_OrderInquiry.allottedNAV, dbo.Fund_Cen_OrderInquiry.allotmentDate, 
                                dbo.Fund_Cen_OrderInquiry.fee, dbo.Fund_Cen_OrderInquiry.transactionLastUpdated, dbo.Fund_Cen_OrderInquiry.paymentType, dbo.Fund_Cen_OrderInquiry.bankCode, 
                                dbo.Fund_Cen_OrderInquiry.bankAccount, dbo.Fund_Cen_OrderInquiry.channel, dbo.Fund_Cen_OrderInquiry.icLicense, dbo.Fund_Cen_OrderInquiry.branchNo, 
                                dbo.Fund_Cen_OrderInquiry.forceEntry, dbo.Fund_Cen_OrderInquiry.settlementBankCode, dbo.Fund_Cen_OrderInquiry.settlementBankAccount, dbo.Fund_Cen_OrderInquiry.chqBranch, 
                                dbo.Fund_Cen_OrderInquiry.rejectReason, dbo.Fund_Cen_OrderInquiry.navDate, dbo.Fund_Cen_OrderInquiry.[collateralAccount ], dbo.Fund_Cen_OrderInquiry.accountType, 
                                dbo.Fund_Cen_OrderInquiry.recurringOrderId, dbo.Fund_Cen_OrderInquiry.paymentStatus, dbo.Fund_Cen_OrderInquiry.paymentProcessingType, 
                                dbo.Fund_Cen_OrderInquiry.saRecurringOrderRefNo, dbo.Fund_Cen_OrderInquiry.crcApprovalCode, dbo.Fund_Cen_OrderInquiry.timestampx, dbo.Fund_Cen_OrderInquiry.flx,
                                dbo.MFTS_Amc.Amc_Code
                                FROM        dbo.Fund_Cen_OrderInquiry INNER JOIN
                                            dbo.MFTS_Fund ON dbo.Fund_Cen_OrderInquiry.fundCode = dbo.MFTS_Fund.Fund_Code INNER JOIN
                                            dbo.MFTS_Amc ON dbo.MFTS_Fund.Amc_Id = dbo.MFTS_Amc.Amc_Id 
                                         
                                            `  
                                                        // WHERE dbo.Fund_Cen_OrderInquiry.transactionId = '1412212280005546'

        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
      
          }).then(result => {
            //console.log(result);
            let data_row = result.rowsAffected.toString();
            console.log("result OrderInquiry : "+ data_row +" row")
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
async function checkRefno(callback){ 
    try{
        let datarows
        let statement = `SELECT TOP (100) PERCENT dbo.MFTS_Fund.Amc_Id,
                        (SELECT TOP (1) Ref_No  FROM dbo.MFTS_Account  WHERE (Account_No = dbo.Fund_Cen_OrderInquiry.accountId) AND   (Amc_Id = dbo.MFTS_Fund.Amc_Id)) AS Ref_no, 
                        dbo.Fund_Cen_OrderInquiry.accountId, 
                        dbo.Fund_Cen_OrderInquiry.unitholderId
                    FROM dbo.Fund_Cen_OrderInquiry LEFT OUTER JOIN
                         dbo.MFTS_Fund ON 
                         dbo.Fund_Cen_OrderInquiry.fundCode = dbo.MFTS_Fund.Fund_Code
                    GROUP BY dbo.MFTS_Fund.Amc_Id,   dbo.Fund_Cen_OrderInquiry.accountId,  dbo.Fund_Cen_OrderInquiry.unitholderId`
    // WHERE dbo.Fund_Cen_OrderInquiry.timestampx >=  '${timestampx}' `

        await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);

        }).then(result => {
        //console.log(result);
        let row = result.rowsAffected.toString();
        //console.log("result OrderInquiry : "+ data_row +" row")
        sql.close();
        // console.log(result.recordset)
        if (row > 0 ){
            return  callback(result.recordset) 
            //importmftsaccount(result.recordset)
        }

        // return  callback(result.recordset)

        }).catch(err => {
        console.log(err);
        sql.close();
        // return   callback(err);
        });
        } catch (error) {
        result = "ERROR Catch"
        console.log(error);
        // return   callback(error);
        }
        // console.log(datarows)
        // if(datarows.length == 0){return }
           
    // for (const [i, v] of datarows.entries()) {
        
    
   
    // }
    
}
async function importmftsaccount(datarows){
    for (const [i, v] of datarows.entries()) {
        let RefNo = datarows[i].Ref_no
        const HolderNo              = datarows[i].unitholderId
        let IDACCOUNTI              = datarows[i].accountId
        let Amc_Id                  = datarows[i].Amc_Id
        let chk_Amc               
        if(Amc_Id === null){continue;}
        if(RefNo === null){ 
            // select mtfs accout 
            await  CheckMftsaccount(IDACCOUNTI, HolderNo ,Amc_Id,(refNo)=>{
                RefNo = refNo
            })

            if (RefNo === null){  // ถ้าไม่พบ ref ให้ทำการค้นที orderquery 
                    await  getRefx("Ref_No",1 , (refx)=>{
                        RefNo =  refx
                    })
                    // console.log("RefNo  "+ RefNo)
                    //2022-09-28 15.39
                    await insertMFtsAcccount(IDACCOUNTI, HolderNo ,Amc_Id, RefNo)
            }

        }

    }
}
async function checkDataDupOrderInquiry(datarows , callback){
    if(datarows.length == 0){return callback(0)}
    // console.log(datarows[0].accountId)
    let DATA_ORDERQUERY = []
    for (const [i, v] of datarows.entries()) {
        try{
            let acccoutno       = datarows[i].accountId
            let fund_id         = datarows[i].Fund_Id
            let amount          = datarows[i].amount
            let tranttype       = datarows[i].orderType
            let amc_id          = datarows[i].Amc_Id
            let unitholder      = datarows[i].unitholderId
            let TranSaction_Date = datarows[i].transactionDateTime
            let TranStatus       = datarows[i].statusx
            let transactionId    = datarows[i].transactionId  
            let statusApprov            = TranStatus === "WAITING" ?  5 : 7 ;
            let tranTypecode
            let trantDate =     TranSaction_Date.substring(0,4) + "-" + TranSaction_Date.substring(4,6)  + "-" + TranSaction_Date.substring(6,8)
            switch (tranttype) {
                case "SUB":
                    tranTypecode = "B"
                    break;
                case "RED":
                    tranTypecode = "S"
                    break;
                case "TRI":
                    tranTypecode = "TI"
                    break;
                case "TRO":
                    tranTypecode = "TO"
                    break;
                case "SWI":
                    tranTypecode = "SI"
                    break;
                case "SWO":
                    tranTypecode = "SO"
                    break;
                case "XSI":
                    tranTypecode = "TI"
                    break;
                case "XSO":
                    tranTypecode = "TO"
                    break;
                default:
                    break;
            }
            let ref_no = datarows[i].Ref_no
            if(TranStatus === "CANCELLED"){  continue;}
            let statement   = `SELECT TRANSACTION_DATE FROM MFTS_TRANSACTION 
                                WHERE  transactionId    = '${transactionId}'
                                AND    TranType_Code    = '${tranTypecode}'     
                                ` 
            // console.log(statement)
            // console.log(datarows[i].transactionId)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
                
            }).then(result => {
                    let rowsAffected = result.rowsAffected.toString()
                // let datetime
                if (rowsAffected > 0){ 
                    ///log
                   insertlogoderquery(datarows[i])
                   console.log('Insert log order inquiry')
                }else{
                    //insert
                //    importOrderQuery(datarows[i])
                //    console.log(ref_no + " XXX " + TranSaction_Date.substring(0,4) + "-" + TranSaction_Date.substring(4,6)  + "-" + TranSaction_Date.substring(6,8))
                    // console.log(datarows[i].transactionId)
                    DATA_ORDERQUERY.push(datarows[i])
                }
                sql.close();
                // return callback(result.recordset)
            }).catch(err => {
                console.log(err);
                sql.close();
                // return callback(err)
            });
            
        }catch (error) {
            console.log(error);
            // return callback(error);
        }
    }

    // console.log(DATA_ORDERQUERY)
    await OrderinquryInsert(DATA_ORDERQUERY,(s)=>{})
    let Data_Switch
    await  SelectSwitchOut(  (datarows)=>{
        Data_Switch = datarows
    })
    // console.log(Data_Switch)
    await updataSwitchOut(Data_Switch)
}
async function checkDataOrderInquiry(datarows  ,callback){
    if(datarows.length == 0){return callback(0)}
    let transaction = ""
    for (const [i, v] of datarows.entries()) {
        let TRANSACTION_DATE        = datarows[i].transactionDateTime
        // get last data 
        if( i === datarows.length-1){
            transaction += "'"+TRANSACTION_DATE + "'"
        }else{
            transaction += "'"+TRANSACTION_DATE + "',"
        }
    }

    try{
        let TRANSACTION_DATE ="";
        let statement = `SELECT TRANSACTION_DATE FROM MFTS_TRANSACTION WHERE TRANSACTION_DATE IN (${transaction})`

    

    //log 
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            if (rowsAffected > 0){ 
                for (const [i, v] of result.recordset.entries()) {        
                    if( i === result.recordset.length-1){
                        TRANSACTION_DATE += "'"+result.recordset[i].TRANSACTION_DATE +"'"
                    }else{
                        TRANSACTION_DATE += "'"+result.recordset[i].TRANSACTION_DATE +"',"
                    }
                }
            }
            // console.log(TRANSACTION_DATE)
            sql.close();
           
        }).catch(err => {
            console.log(err);
            sql.close();
           
        });
        // console.log(TRANSACTION_DATE)
        let timestampx
        const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        timestampx = year +"-"+  month  +"-"+ date + " 00:00:00.000"
        //console.log(TRANSACTION_DATE.length)
        if(TRANSACTION_DATE.length != 0 ){
            TRANSACTION_DATE = ` AND dbo.Fund_Cen_OrderInquiry.transactionDateTime Not IN (${TRANSACTION_DATE})`
        }else{
            TRANSACTION_DATE = ""
        }
        let sqlx = `SELECT     dbo.Fund_Cen_OrderInquiry.ID, dbo.Fund_Cen_OrderInquiry.transactionId, dbo.Fund_Cen_OrderInquiry.saOrderReferenceNo, dbo.Fund_Cen_OrderInquiry.transactionDateTime, 
                                dbo.Fund_Cen_OrderInquiry.orderType, dbo.Fund_Cen_OrderInquiry.accountId, dbo.Fund_Cen_OrderInquiry.unitholderId, dbo.Fund_Cen_OrderInquiry.fundCode, 
                                dbo.Fund_Cen_OrderInquiry.redemptionType, dbo.Fund_Cen_OrderInquiry.amount, dbo.Fund_Cen_OrderInquiry.unit, dbo.Fund_Cen_OrderInquiry.sellAllUnitFlag, 
                                dbo.Fund_Cen_OrderInquiry.statusx, dbo.Fund_Cen_OrderInquiry.effectiveDate, dbo.Fund_Cen_OrderInquiry.settlementDate, dbo.Fund_Cen_OrderInquiry.amcOrderReferenceNo, 
                                dbo.Fund_Cen_OrderInquiry.allottedAmount, dbo.Fund_Cen_OrderInquiry.allottedUnit, dbo.Fund_Cen_OrderInquiry.allottedNAV, dbo.Fund_Cen_OrderInquiry.allotmentDate, 
                                dbo.Fund_Cen_OrderInquiry.fee, dbo.Fund_Cen_OrderInquiry.transactionLastUpdated, dbo.Fund_Cen_OrderInquiry.paymentType, dbo.Fund_Cen_OrderInquiry.bankCode, 
                                dbo.Fund_Cen_OrderInquiry.bankAccount, dbo.Fund_Cen_OrderInquiry.channel, dbo.Fund_Cen_OrderInquiry.icLicense, dbo.Fund_Cen_OrderInquiry.branchNo, 
                                dbo.Fund_Cen_OrderInquiry.forceEntry, dbo.Fund_Cen_OrderInquiry.settlementBankCode, dbo.Fund_Cen_OrderInquiry.settlementBankAccount, dbo.Fund_Cen_OrderInquiry.chqBranch, 
                                dbo.Fund_Cen_OrderInquiry.rejectReason, dbo.Fund_Cen_OrderInquiry.navDate, dbo.Fund_Cen_OrderInquiry.[collateralAccount ], dbo.Fund_Cen_OrderInquiry.accountType, 
                                dbo.Fund_Cen_OrderInquiry.recurringOrderId, dbo.Fund_Cen_OrderInquiry.paymentStatus, dbo.Fund_Cen_OrderInquiry.paymentProcessingType, 
                                dbo.Fund_Cen_OrderInquiry.saRecurringOrderRefNo, dbo.Fund_Cen_OrderInquiry.crcApprovalCode, dbo.Fund_Cen_OrderInquiry.timestampx, dbo.Fund_Cen_OrderInquiry.flx, 
                                dbo.MFTS_Fund.Amc_Id , dbo.MFTS_Fund.Fund_Id
                            FROM    dbo.Fund_Cen_OrderInquiry INNER JOIN
                                    dbo.MFTS_Fund ON dbo.Fund_Cen_OrderInquiry.fundCode = dbo.MFTS_Fund.Fund_Code
                            WHERE  (dbo.Fund_Cen_OrderInquiry.branchNo = '001'  OR Fund_Cen_OrderInquiry.statusx ='ALLOTTED')
                                    ${TRANSACTION_DATE}`
        // AND dbo.Fund_Cen_OrderInquiry.timestampx >= '${timestampx}'
        //  console.log(TRANSACTION_DATE)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(sqlx);
            
        }).then(result => {
              let rowsAffected = result.rowsAffected.toString()
            // let datetime
            if (rowsAffected > 0){ console.log("Result Insert "+rowsAffected+ "rows")   }
            sql.close();
            return callback(result.recordset)
        }).catch(err => {
            console.log(err);
            sql.close();
            return callback(err)
        });
        
    }catch (error) {
        console.log(error);
        return callback(error);
    }
//    return callback(TRANSACTION_DATE)
}

async function importOrderQuery(datarows , callback){
    //  console.log(datarows.transactionId)
    try{
        const cardNumber            = datarows.accountId
        const HolderNo              = datarows.unitholderId
        const AMCID                 = datarows.Amc_Id
        // const Amc_code                 = datarows.Amc_Code
        let tranTypeCode_db         = datarows.orderType //"SWI"
        // let TRANSACTION_DATE        = datarows[0].transactionDateTime
        let amountbaht              = datarows.amount
        let amountunit              = datarows.unit
        let Alloted_Amount          = datarows.allottedAmount
        // let fundCode                = datarows[0].fundCode
        let TranStatus                  = datarows.statusx
        let effectiveDate           = datarows.effectiveDate
        let MKTIID                   = datarows.icLicense
        let Create_By               ="146"
        let RefNo = null
        RefNo                       = datarows.Ref_no
        let Modify_Date
        let FUNDCODEI               = datarows.fundCode
        let UNITHOLDERI             = datarows.unitholderId
        let IDACCOUNTI              = datarows.accountId
        let AMCCODEI                = datarows.Amc_Code
        let TranSaction_Date        = datarows.transactionDateTime
        let transactionId           = datarows.transactionId
        let Fund_Id                 = datarows.Fund_Id
        let amcOrderReferenceNo     = datarows.amcOrderReferenceNo
        let branchNo                = datarows.branchNo   
        let allottedUnit            = datarows.allottedUnit
        let allottedNAV            = datarows.allottedNAV
        let redemptionType          = datarows.redemptionType
        // let MKTIID                  = datarows[0].icLicense
        let executedate             = effectiveDate.substring(0,4) + "-" + effectiveDate.substring(4,6)  + "-" + effectiveDate.substring(6,8)
        let statusApprov            = TranStatus === "WAITING" ?  5 : 7 ;
        Modify_Date                 = executedate
        let CustomerInput //=  datarows[0].sellAllUnitFlag = "Y" ? datarows[0].sellAllUnitFlag  : null ;
        if(datarows.sellAllUnitFlag = "Y" && amountunit > 0   && TranStatus === "ALLOTTED" && Alloted_Amount > 0){CustomerInput = "Y"}
        let price                   //= TranStatus === "APPROVED" ? Alloted_Amount : amountbaht
        // price                       = TranStatus === "ALLOTTED" ? Alloted_Amount : amountbaht
        if(TranStatus === "ALLOTTED"){ price = Alloted_Amount}
        if(TranStatus === "APPROVED"){ price = amountbaht }
        if(TranStatus === "WAITING") { price = amountbaht}
        if(TranStatus === "APPROVED"){ allottedUnit = amountunit }    
        let unit                    = TranStatus === "APPROVED" ? amountunit : 0.000000
        statusApprov                = TranStatus === "CANCELLED" ? 9 : statusApprov
        if(TranStatus === "WAITING" && price == 0){  unit = datarows.UNIT }
        
        if(amountbaht == 0 && TranStatus === "ALLOTTED") {amountbaht = Alloted_Amount }
        let Source_Flag             = "F"
        let tranNo , seqno ,tranTypecode
        let APIstatus ="I"
        let zero = 0.000000
        if(allottedNAV === undefined || allottedNAV === null) {allottedNAV = zero}
        if(allottedUnit === undefined ) {allottedUnit = zero}
        if(redemptionType !== undefined && amountunit !== undefined ) {amountunit = allottedUnit  }
        
        // if (allottedNAV > 0 && allottedUnit > 0  && TranStatus === "ALLOTTED" ){CustomerInput ="Y"}
        // console.log(allottedNAV+" xxx " + allottedUnit +" yyy "+ TranStatus)
        let Modify_By               = '95' // ห้ามหลุด
        let trandate_db     =TranSaction_Date.substring(0,4) + "-" + TranSaction_Date.substring(4,6)  + "-" + TranSaction_Date.substring(6,8)
        await  getTranNumber(1,(no)=>{ tranNo =no })
        // console.log(tranNo)
        let Amc_Id = AMCID
        let dateserver 
        await getdatetime( (dt) =>{dateserver = dt  })
        // order inquiry gen  ref no 
        if(RefNo === null){ 
            // select mtfs accout 
            // if(Amc_Id === null){continue;}
            await  CheckMftsaccount(IDACCOUNTI, HolderNo ,Amc_Id,(refNo)=>{
                RefNo = refNo
            })
            // 2023-02-03 8:53 ไม่พบ amc id ไม่ต้องทำ
            if (RefNo === null && Amc_Id !== null){  // ถ้าไม่พบ ref ให้ทำการค้นที orderquery && ไม่พบ amc id ไม่ต้องทำ
                    await  getRefx("Ref_No",1 , (refx)=>{
                        RefNo =  refx
                    })

                    await insertMFtsAcccount(IDACCOUNTI, HolderNo ,Amc_Id, RefNo)
            }

        }

        // if(RefNo === null){  await insertMFtsAcccount  (IDACCOUNTI, HolderNo ,Amc_Id, (ref)     =>{RefNo = ref}         )}


        // 1 กรณีไม่พบ Accountid และ RefNo และ AMCid ใน -> MFTS ACCOUNT ให้เพิ่ม รายการ Open Account
        // โดยการ Gen Ref มาใส่ ใน Account โดยมี Key ดังนี้ Ref+AcccountNumber+AmcId 
        // ได้้รายการ Open แล้ว ให้ค้นรายการ จาก Order ไม่พบ INser   Wehre  holder + AccountId+ AMCID 
        // Insert ใน Transaction  ตามลำดับรายการ

        
        // console.log("finally :"+RefNo)
        await getMaxSeqNo(RefNo,Fund_Id,(maxseq)=>{ seqno = maxseq})
        // console.log("max : "+ max)
        let mkktid , tranflag = "OrderInQuiry"
        if(price === null){price = 0.0000}
        if(allottedUnit === null){allottedUnit= 0.0000}
        await convertMKTID(MKTIID , (id)=>{ mkktid = id })
        switch (tranTypeCode_db) {
            case "SUB":
                tranTypecode = "B"
                break;
            case "RED":
                tranTypecode = "S"
                break;
            case "TRI":
                tranTypecode = "TI"
                break;
            case "TRO":
                tranTypecode = "TO"
                break;
            case "SWI":
                tranTypecode = "SI"
                break;
            case "SWO":
                tranTypecode = "SO"
                break;
            case "XSI":
                tranTypecode = "TI"
                break;
            case "XSO":
                tranTypecode = "TO"
                break;
            default:
                break;
        }
        if(TranStatus === "APPROVED" && allottedNAV == 0){  statusApprov = 5 }
        await poolPromise.then(pool => {
            return pool.request()
                .input("Tran_No",       sql.VarChar(12),    tranNo)
                .input("Ref_No",        sql.VarChar(12),    RefNo)
                .input("TranType_Code", sql.VarChar(2),     tranTypecode)
                .input("Fund_Id",       sql.Int,            Fund_Id )
                .input("Tran_Date",     sql.Date,           trandate_db)
                .input("Status_Id",     sql.TinyInt,        5)
                .input("Source_Flag",   sql.Char(1),        Source_Flag)
                .input("Amount_Baht",   sql.Numeric(18,2),  price)
                .input("Amount_Unit",   sql.Numeric(18,4),  allottedUnit)
                .input("APIstatus",     sql.NChar(10),      APIstatus)
                .input("NAV_PRICE",     sql.Numeric(18,4),  allottedNAV)
                .input("ExecuteDate",   sql.Date,           executedate)
                .input("Act_ExecDate",  sql.Date,           executedate)
                .input("Seq_No",        sql.Int,            null)
                .input("Mktid",         sql.Int,            mkktid )
                .input("Create_by",     sql.VarChar(20),    Create_By)
                .input("Create_date",   sql.DateTime,       dateserver) 
                .input("Unit_Balance",  sql.Decimal(18,4),  zero)
                .input("AVG_Cost",      sql.Float,          zero)
                .input("Total_Cost",    sql.Decimal(18,4),  zero)
                .input("Modify_By",     sql.VarChar(20),    Modify_By)
                .input("FeeRate_Group", sql.Int,              1 )
                .input("Modify_Date",   sql.DateTime,       Modify_Date)
                .input("RGL",           sql.Decimal(20,6),  zero)
                .input("FUNDCODEI",     sql.NChar(30),      FUNDCODEI)
                .input("UNITHOLDERI",   sql.NChar(30),      UNITHOLDERI)
                .input("IDACCOUNTI",    sql.NChar(30),      IDACCOUNTI)
                .input("AMCCODEI",      sql.NChar(30),      AMCCODEI)
                .input("TranSaction_Date", sql.NChar(14),   TranSaction_Date)
                .input("TRANTYPECODEX", sql.NChar(5),       tranTypeCode_db)
                .input("TranTypeFLAG",  sql.VarChar(30),    tranflag)
                .input("CustomerInput",  sql.Char(1),       CustomerInput)
                .input("transactionId",  sql.VarChar(20),   transactionId)
                .input("Avg_Cost_Diff",   sql.Decimal(18,9), null )
                .input("Total_Cost_Dev",   sql.Decimal(18,9), null )
                .input("Avg_Cost_Dev",   sql.Decimal(25,8),     null )
                .query(InsertMFTS_TRANSACTION)
            }).then(result => {

                let row = result.rowsAffected
                let respx = " Insert    Order InQuiry to  MFTS TRANSACTION   RefNo :" + RefNo + "  ";
                if (row > 0 ){console.log(respx)}
                // console.log(result);
                sql.close();
            }).catch(err => {
                console.log(err);
                sql.close();
                // return callback(err);
            });
        
        
    }catch (error) {
        console.log(error);
        // return callback(error);

    }
}

async function OrderinquryInsert(datarows,callback){
    let Data_Order = []
    let dateserver 
        await getdatetime( (dt) =>{dateserver = dt  })
    for (const key in datarows) {
        let tranNo
        await  getTranNumber(1,(no)=>{ tranNo =no })
        
        let RefNo                   = datarows[key].Ref_no
        let IDACCOUNTI              = datarows[key].accountId
        const HolderNo              = datarows[key].unitholderId
        const Amc_Id                 = datarows[key].Amc_Id 
        // console.log("IDACCOUNTI "+ IDACCOUNTI)
        // console.log(HolderNo)
        if (RefNo === undefined){RefNo = null}
        if(RefNo === null){ 
            await  CheckMftsaccount(IDACCOUNTI, HolderNo ,Amc_Id,(refNo)=>{  RefNo = refNo })
            // 2023-02-03 8:53 ไม่พบ amc id ไม่ต้องทำ
            if (RefNo === null && Amc_Id !== null){  // ถ้าไม่พบ ref ให้ทำการค้นที orderquery && ไม่พบ amc id ไม่ต้องทำ
                await  getRefx("Ref_No",1 , (refx)=>{
                    RefNo =  refx
                })
                await insertMFtsAcccount(IDACCOUNTI, HolderNo ,Amc_Id, RefNo)
            }

        }
        // console.log(datarows)
        let tranTypeCode_db         = datarows[key].orderType 
        let tranTypecode
        switch (tranTypeCode_db) {
            case "SUB":
                tranTypecode = "B"
                break;
            case "RED":
                tranTypecode = "S"
                break;
            case "TRI":
                tranTypecode = "TI"
                break;
            case "TRO":
                tranTypecode = "TO"
                break;
            case "SWI":
                tranTypecode = "SI"
                break;
            case "SWO":
                tranTypecode = "SO"
                break;
            case "XSI":
                tranTypecode = "TI"
                break;
            case "XSO":
                tranTypecode = "TO"
                break;
            default:
                break;
        }
        let Fund_Id                 = datarows[key].Fund_Id
        let TranSaction_Date        = datarows[key].transactionDateTime
        let trandate_db             =TranSaction_Date.substring(0,4) + "-" + TranSaction_Date.substring(4,6)  + "-" + TranSaction_Date.substring(6,8)
        let effectiveDate           = datarows[key].effectiveDate
        let executedate             = effectiveDate.substring(0,4) + "-" + effectiveDate.substring(4,6)  + "-" + effectiveDate.substring(6,8)
        let mkktid , tranflag = "OrderInQuiry"
        let MKTIID                   = datarows[key].icLicense 
        await convertMKTID(MKTIID , (id)=>{ mkktid = id })
        let FUNDCODEI               = datarows[key].fundCode
        let UNITHOLDERI             = datarows[key].unitholderId 
        let AMCCODEI                = datarows[key].Amc_Code 
        let transactionId           = datarows[key].transactionId
        let CustomerInput           =   null
        let amountunit              = datarows[key].unit
        let Alloted_Amount          = datarows[key].allottedAmount 
        let TranStatus              = datarows[key].statusx
        let amountbaht              = datarows[key].amount
        let allottedUnit            = datarows[key].allottedUnit
        let allottedNAV            = datarows[key].allottedNAV
        let price                    
        if(TranStatus === "ALLOTTED")   { price = Alloted_Amount}
        if(TranStatus === "APPROVED")   { price = amountbaht }
        if(TranStatus === "WAITING")    { price = amountbaht}
        if(TranStatus === "APPROVED")   { allottedUnit = amountunit }
        if(allottedUnit === null)       {allottedUnit= 0.0000}
        if(price === null)              {price= 0.0000}
        if(datarows[key].sellAllUnitFlag = "Y" && amountunit > 0   && TranStatus === "ALLOTTED" && Alloted_Amount > 0){CustomerInput = "Y"}
        let data_orderIn =[]
        data_orderIn.push(tranNo)
        data_orderIn.push(RefNo)
        data_orderIn.push(tranTypecode)
        data_orderIn.push(Fund_Id)
        data_orderIn.push(trandate_db)
        data_orderIn.push(5)
        data_orderIn.push("F")
        data_orderIn.push(price) //Amount_Baht
        data_orderIn.push(allottedUnit) //allottedUnit 
        data_orderIn.push("I") //APIstatus 
        data_orderIn.push(allottedNAV) //NAV_PRICE 
        data_orderIn.push(executedate) //ExecuteDate
        data_orderIn.push(executedate) //Act_ExecDate
        data_orderIn.push(null) //Seq_No
        data_orderIn.push(mkktid) //Mktid
        data_orderIn.push('146') //Create_by
        data_orderIn.push(dateserver) //Create_date
        data_orderIn.push(0.000000) //Unit_Balance
        data_orderIn.push(0.000000) //AVG_Cost
        data_orderIn.push(0.000000) //Total_Cost
        data_orderIn.push('146') //Modify_By
        data_orderIn.push(1) //FeeRate_Group
        data_orderIn.push(executedate) //Modify_Date
        data_orderIn.push(0.000000) //RGL
        data_orderIn.push(FUNDCODEI) //FUNDCODEI
        data_orderIn.push(UNITHOLDERI) //UNITHOLDERI
        data_orderIn.push(IDACCOUNTI) //IDACCOUNTI
        data_orderIn.push(AMCCODEI) //AMCCODEI
        data_orderIn.push(TranSaction_Date) //TranSaction_Date
        data_orderIn.push(tranTypeCode_db) //TRANTYPECODEX
        data_orderIn.push(tranflag) //TranTypeFLAG
        data_orderIn.push(CustomerInput) //CustomerInput
        data_orderIn.push(transactionId) //transactionId 
        Data_Order.push(data_orderIn)
    }
    // console.log(Data_Order)
    
    let table = new sql.Table('MFTS_Transaction');

    table.columns.add('Tran_No',        sql.VarChar(12), { nullable: false });
    table.columns.add('Ref_No',         sql.VarChar(12), { nullable: false });
    table.columns.add('TranType_Code',  sql.VarChar(2), { nullable: false });
    table.columns.add('Fund_Id',        sql.Int, { nullable: false });
    table.columns.add('Tran_Date',      sql.Date, { nullable: false });
    table.columns.add('Status_Id',      sql.TinyInt, { nullable: true });
    table.columns.add('Source_Flag',    sql.Char(1), { nullable: true });
    table.columns.add('Amount_Baht',    sql.Numeric(18,2), { nullable: true });
    table.columns.add('Amount_Unit',    sql.Numeric(18,4), { nullable: true });
    table.columns.add('APIstatus',      sql.NChar(10), { nullable: true });
    table.columns.add('NAV_PRICE',      sql.Numeric(18,4), { nullable: true });
    table.columns.add('ExecuteDate',    sql.Date, { nullable: true });
    table.columns.add('Act_ExecDate',   sql.Date, { nullable: true });
    table.columns.add('Seq_No',         sql.Int, { nullable: true });
    table.columns.add('Mktid',          sql.Int, { nullable: true });
    table.columns.add('Create_by',      sql.VarChar(20), { nullable: true });
    table.columns.add('Create_date',    sql.DateTime, { nullable: true });
    table.columns.add('Unit_Balance',   sql.Decimal(18,4), { nullable: true });
    table.columns.add('AVG_Cost',       sql.Float, { nullable: true });
    table.columns.add('Total_Cost',     sql.Decimal(18,4), { nullable: true });
    table.columns.add('Modify_By',      sql.VarChar(20), { nullable: true });
    table.columns.add('FeeRate_Group',  sql.Int, { nullable: true });
    table.columns.add('Modify_Date',    sql.DateTime, { nullable: true });
    table.columns.add('RGL',            sql.Decimal(20,6), { nullable: true });
    table.columns.add('FUNDCODEI',      sql.NChar(30), { nullable: true });
    table.columns.add('UNITHOLDERI',    sql.NChar(30), { nullable: true });
    table.columns.add('IDACCOUNTI',     sql.NChar(30), { nullable: true });
    table.columns.add('AMCCODEI',       sql.NChar(30), { nullable: true });
    table.columns.add('TranSaction_Date', sql.NChar(14), { nullable: true });
    table.columns.add('TRANTYPECODEX',  sql.NChar(5), { nullable: true });
    table.columns.add('TranTypeFLAG',   sql.VarChar(30), { nullable: true });
    table.columns.add('CustomerInput',  sql.Char(1), { nullable: true });
    table.columns.add('transactionId',  sql.VarChar(20), { nullable: true }); 

    Data_Order.forEach(datarow => table.rows.add.apply(table.rows, datarow));
    let pool = await sql.connect(config);
        // await pool.request().query("DELETE FROM Report_Outstanding_Daily");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);

            } else {
                

            }

            pool.close();
            sql.close();
        });
    return callback("done")
                  
}
async function CheckMftsaccount(IDACCOUNTI, HolderNo ,Amc_Id,  callback){

    try{
        let statement = "SELECT Ref_No FROM MFTS_ACCOUNT WHERE  Account_No = @idaccount AND  Amc_Id = @amcid "
        await poolPromise.then(pool => {
            return pool.request()
                .input("idaccount",         sql.VarChar(20),    IDACCOUNTI)
                .input("amcid",             sql.Int,            Amc_Id)
                .query(statement)
            }).then(result => {

                let row = result.rowsAffected
                // let respx = " Insert    Order InQuiry to  MFTS TRANSACTION   RefNo :" + RefNo + "  ";
                let refno = null
                if (row > 0 ){
                    console.log(result.recordset[0].Ref_No)
                    refno = result.recordset[0].Ref_No
                }
                // console.log(result);
                sql.close();
                return callback(refno) 
            }).catch(err => {
                console.log(err);
                sql.close();
                return callback(err);
            });
        
        
        }catch (error) {
            console.log(error);
            return callback(error);

        }


}
async function checkaccountIdorderquery(IDACCOUNTI, HolderNo ,Amc_Id,  callback){
    try{
        let statement = "SELECT Ref_No FROM MFTS_ACCOUNT WHERE  Account_No = @idaccount AND  Amc_Id = @amcid AND Holder_Id = @holderid"
        await poolPromise.then(pool => {
            return pool.request()
                .input("idaccount",         sql.VarChar(20),    IDACCOUNTI)
                .input("amcid",             sql.Int,            Amc_Id)
                .input("holderid",          sql.VarChar(30),     HolderNo)
                .query(statement)
            }).then(result => {

                let row = result.rowsAffected
                // let respx = " Insert    Order InQuiry to  MFTS TRANSACTION   RefNo :" + RefNo + "  ";
                let refno
                if (row > 0 ){
                    console.log(result.recordset[0].Ref_No)
                    refno = result.recordset[0].Ref_No
                }
                // console.log(result);
                sql.close();
                return callback(refno) 
            }).catch(err => {
                console.log(err);
                sql.close();
                return callback(err);
            });
        
        
        }catch (error) {
            console.log(error);
            return callback(error);

        }

}
async function impoertOrderQuery(datarows , callback){ 
    let dateserver 
    await getdatetime( (dt) =>{dateserver = dt  })
    for (const key in datarows) {

        try{
                const cardNumber            = datarows[key].accountId
                const HolderNo              = datarows[key].unitholderId
                const AMCID                 = datarows[key].Amc_Id
                let tranTypeCode_db         = datarows[key].orderType //"SWI"
                // let TRANSACTION_DATE        = datarows[key].transactionDateTime
                let amountbaht              = datarows[key].amount
                let amountunit              = datarows[key].unit
                let Alloted_Amount        = datarows[key].allottedAmount
                // let fundCode                = datarows[key].fundCode
                let TranStatus                  = datarows[key].statusx
                let effectiveDate           = datarows[key].effectiveDate
                let MKTIID                   = datarows[key].icLicense
                let Create_By               ="146"
                // let TranStatus              = datarows[key].status
                let Modify_Date
                let FUNDCODEI               = datarows[key].fundCode
                let UNITHOLDERI             = datarows[key].unitholderId
                let IDACCOUNTI              = datarows[key].accountId
                let AMCCODEI                = datarows[key].Amc_Code
                let TranSaction_Date        = datarows[key].transactionDateTime
                let transactionId           = datarows[key].transactionId
                let Fund_Id                 = datarows[key].Fund_Id
                let amcOrderReferenceNo     = datarows[key].amcOrderReferenceNo
                let branchNo                = datarows[key].branchNo   
                let allottedUnit            = datarows[key].allottedUnit
                let allottedNAV            = datarows[key].allottedNAV
                let redemptionType          = datarows[key].redemptionType
                // let MKTIID                  = datarows[key].icLicense
                let executedate             = effectiveDate.substring(0,4) + "-" + effectiveDate.substring(4,6)  + "-" + effectiveDate.substring(6,8)
                let statusApprov            = TranStatus === "WAITING" ?  5 : 7 ;
                Modify_Date                 = executedate
                let CustomerInput //=  datarows[key].sellAllUnitFlag = "Y" ? datarows[key].sellAllUnitFlag  : null ;
                if(datarows[key].sellAllUnitFlag = "Y" && amountunit > 0   && TranStatus === "ALLOTTED" && Alloted_Amount > 0){CustomerInput = "Y"}
                let price                   //= TranStatus === "APPROVED" ? Alloted_Amount : amountbaht
                // price                       = TranStatus === "ALLOTTED" ? Alloted_Amount : amountbaht
                if(TranStatus === "ALLOTTED"){ price = Alloted_Amount}
                if(TranStatus === "APPROVED"){ price = amountbaht }
                if(TranStatus === "WAITING") { price = amountbaht}
                if(TranStatus === "APPROVED"){ allottedUnit = amountunit }    
                let unit                    = TranStatus === "APPROVED" ? amountunit : 0.000000
                statusApprov                = TranStatus === "CANCELLED" ? 9 : statusApprov
                if(TranStatus === "WAITING" && price == 0){  unit = datarows[key].UNIT }
                if(TranStatus === "APPROVED" && allottedNAV != 0){  statusApprov = 5 }
                if(amountbaht == 0 && TranStatus === "ALLOTTED") {amountbaht = Alloted_Amount }
                let Source_Flag             = "F"
                let tranNo , seqno ,tranTypecode
                let APIstatus ="I"
                let zero = 0.000000
                if(allottedNAV === undefined ) {allottedNAV = zero}
                if(allottedUnit === undefined ) {allottedUnit = zero}
                if(redemptionType !== undefined && amountunit !== undefined ) {amountunit = allottedUnit  }
                
                // if (allottedNAV > 0 && allottedUnit > 0  && TranStatus === "ALLOTTED" ){CustomerInput ="Y"}
                // console.log(allottedNAV+" xxx " + allottedUnit +" yyy "+ TranStatus)
                let Modify_By               = '95' // ห้ามหลุด
                let trandate_db     =TranSaction_Date.substring(0,4) + "-" + TranSaction_Date.substring(4,6)  + "-" + TranSaction_Date.substring(6,8)
                await  getTranNumber(1,(no)=>{ tranNo =no })
                // console.log(tranNo)
                let Amc_Id
                await getAmcId(FUNDCODEI , (amc_id)=> {Amc_Id = amc_id})
                // console.log("amc id : "+Amc_Id)
                let RefNo = null
                // await getRefNoOfAccount(IDACCOUNTI,HolderNo , (refno)=> {RefNo = refno }) 
                await getRefNo(IDACCOUNTI,HolderNo ,Amc_Id, (refno)=> { RefNo = refno }) 
                if(RefNo === null){  await getrefNoAfterAccount(IDACCOUNTI, HolderNo ,Amc_Id, (ref_nox) =>{RefNo = ref_nox }    )}
                if(RefNo === null){  await insertMFtsAcccount  (IDACCOUNTI, HolderNo ,Amc_Id, (ref)     =>{RefNo = ref}         )}
                if(RefNo === null){  await getRefx("Ref_No",1 , (ref)=>{RefNo = ref })}
                // console.log("finally :"+RefNo)
                await getMaxSeqNo(RefNo,Fund_Id,(maxseq)=>{ seqno = maxseq})
                // console.log("max : "+ max)
                let mkktid , tranflag = "OrderInQuiry"
                await convertMKTID(MKTIID , (id)=>{ mkktid = id })
                if(price === null){price = 0.0000}
                if(allottedUnit === null){allottedUnit= 0.0000}
                switch (tranTypeCode_db) {
                    case "SUB":
                        tranTypecode = "B"
                        break;
                    case "RED":
                        tranTypecode = "S"
                        break;
                    case "TRI":
                        tranTypecode = "TI"
                        break;
                    case "TRO":
                        tranTypecode = "TO"
                        break;
                    case "SWI":
                        tranTypecode = "SI"
                        break;
                    case "SWO":
                        tranTypecode = "SO"
                        break;
                    case "XSI":
                        tranTypecode = "TI"
                        break;
                    case "XSO":
                        tranTypecode = "TO"
                        break;
                    default:
                        break;
                }
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
                        .input("Amount_Unit",   sql.Numeric(18,4),  allottedUnit)
                        .input("APIstatus",     sql.NChar(10),      APIstatus)
                        .input("NAV_PRICE",     sql.Numeric(18,4),  allottedNAV)
                        .input("ExecuteDate",   sql.Date,           executedate)
                        .input("Act_ExecDate",  sql.Date,           executedate)
                        .input("Seq_No",        sql.Int,            null)
                        .input("Mktid",         sql.Int,            mkktid )
                        .input("Create_by",     sql.VarChar(20),    Create_By)
                        .input("Create_date",   sql.DateTime,       dateserver) 
                        .input("Unit_Balance",  sql.Decimal(18,4),  zero)
                        .input("AVG_Cost",      sql.Float,          zero)
                        .input("Total_Cost",    sql.Decimal(18,4),  zero)
                        .input("Modify_By",     sql.VarChar(20),    Modify_By)
                        .input("FeeRate_Group", sql.Int,              1 )
                        .input("Modify_Date",   sql.DateTime,       Modify_Date)
                        .input("RGL",           sql.Decimal(20,6),  zero)
                        .input("FUNDCODEI",     sql.NChar(30),      FUNDCODEI)
                        .input("UNITHOLDERI",   sql.NChar(30),      UNITHOLDERI)
                        .input("IDACCOUNTI",    sql.NChar(30),      IDACCOUNTI)
                        .input("AMCCODEI",      sql.NChar(30),      AMCCODEI)
                        .input("TranSaction_Date", sql.NChar(14),   TranSaction_Date)
                        .input("TRANTYPECODEX", sql.NChar(5),       tranTypeCode_db)
                        .input("TranTypeFLAG",  sql.VarChar(30),    tranflag)
                        .input("CustomerInput",  sql.Char(1),       CustomerInput)
                        .input("transactionId",  sql.VarChar(20),   transactionId)
                        .input("Avg_Cost_Diff",   sql.Decimal(18,9), null )
                        .query(InsertMFTS_TRANSACTION)
                    }).then(result => {

                        let row = result.rowsAffected
                        let respx = " OrderInQuiry to  MFTS TRANSACTION   RefNo :" + RefNo + "  ";
                        if (row > 0 ){console.log(respx)}
                        // console.log(result);
                        sql.close();
                    }).catch(err => {
                        console.log(err);
                        sql.close();
                        // return callback(err);
                    });
                
                
        }catch (error) {
            console.log(error);
            // return callback(error);

        }
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

async function getMaxSeqNo(RefNo,Fundid , callback){
    if (RefNo === undefined || RefNo === null ){return callback(1)}
    let statement = `SELECT isnull(max(Seq_No),0) +1 AS maxx  FROM MFTS_Transaction  WHERE Ref_no = '${RefNo}' AND Fund_Id = '${Fundid}'`
    //console.log(statement)
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            let rowsAffected            = result.rowsAffected.toString()
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
async function getRefNo(accountno, unitholder ,Amc_Id, callback){
    let ref_no = null
    let rowsAffected
    let Status_Id
    let statement = `SELECT Ref_No ,Holder_Id   FROM MFTS_Account  WHERE Account_No = '${accountno}' AND Amc_Id = ${Amc_Id} AND Holder_Id = '${unitholder}'  `
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            rowsAffected = result.rowsAffected.toString()
            if (rowsAffected > 0){  
                //  console.log(result.recordset[0])
                ref_no = result.recordset[0].Ref_No.toString()
                if (result.recordset[0].Holder_Id.toString().trim() === ""){
                    updateMftsAccount(accountno, unitholder,Amc_Id)
                }  
            }
            
            sql.close();
           return callback(ref_no)
        }).catch(err => {
            console.log(err);
            sql.close();
            //return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }
    
    //return callback(ref_no)
}
async function updateMftsAccount(acccoutno, unitholder,AMC_id ){
    try{
        
       let statement = ` UPDATE MFTS_Account SET Holder_Id = @Holder_Id , Status_Id = @Status_Id WHERE Account_No = @Account_No AND Amc_ID =@Amc_Id `
       await poolPromise.then(pool => {
        return pool.request()
            .input("Holder_Id",         sql.VarChar(30),    unitholder)
            .input("Account_No",        sql.VarChar(20),    acccoutno)
            .input("Amc_Id",            sql.Int,            AMC_id)
            .input("Status_Id",         sql.Int,            7)
            .query(statement)
        }).then(result => {
            // console.log(result)
            let row = result.rowsAffected
            let respx = " Update Holder_Id , Status_Id  to  MFTS_Account acccoutno :" + acccoutno + "  ";
            if (row > 0 ){console.log(respx)}
            sql.close();
           
            return row
        }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
        });
    
    
    }catch (error) {
    console.log(error);
    return 1;

    }
}
async function getAmcId(fundcode , callback){
    let rowsAffected
    let statement = `SELECT Amc_Id FROM  MFTS_Fund WHERE Fund_Code = '${fundcode}'`
    // console.log(statement)
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            rowsAffected = result.rowsAffected.toString()
            let amc_id = 0
            if (rowsAffected > 0){  
                //  console.log(result.recordset[0])
                amc_id = result.recordset[0].Amc_Id
                // if(result.recordset[0].Holder_Id === '') {
                //     insertHolderId(accountno, unitholder , (ref)=>ref_no = ref)
                // }
            }
            if(amc_id === null){amc_id = 0}
            if(amc_id === undefined){amc_id = 0}
            sql.close();
            // console.log(amc_id)
            return callback(amc_id)
        }).catch(err => {
            console.log(err);
            sql.close();
            //return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }

}
async function getrefNoAfterAccount(acccoutno,unitholder,amc_id ,callback){
    try{
        // console.log("amc_id : "+ amc_id)
        let ref_no = null
        let query = `SELECT Ref_No ,Holder_Id   FROM MFTS_Account  WHERE Account_No = '${acccoutno}' AND Amc_Id = ${amc_id} AND Holder_Id = '${unitholder}'`
        console.log(query)
        new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(query);
        }).then(resultt => {
           let row = resultt.rowsAffected.toString()
           //console.log("getrefNoAfterAccount :"+row)
           if( row > 0 ){
             ref_no = resultt.recordset[0].Ref_No
             return callback(ref_no)
           }
            sql.close();
            //console.log("getrefNoAfterAccount  refno: " +ref_no)
            return callback(ref_no)
    }).catch(err => {
        console.log(err);
        sql.close();
        //return  callback(err)
    });
        }catch (error) {
            result = "ERROR Catch"
            console.log(error);
            return callback(error)
        }
    
}
async function SetRefno(accountno, callback){
    let statement = `SELECT Ref_No  FROM MFTS_Account  WHERE Account_No = '${accountno}'   `
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            rowsAffected = result.rowsAffected
            // console.log("rows :"+ rowsAffected)
            if (rowsAffected > 0){   
                ref_no = result.recordset[0].Ref_No 
            }
            sql.close();
            // console.log(ref_no)
            return callback(ref_no)
        }).catch(err => {
            console.log(err);
            sql.close();
            return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }
}
async function insertMFtsAcccount(accountno, unitholder ,Amc_Id, ref_no){
    // let  ref_no
    let  statement = `SELECT * FROM  Account_Info WHERE Cust_Code ='${accountno}'  ` //AND Amc_Id = '${Amc_Id}'
    let datenow 
    await getdatetime( (dt) =>{datenow = dt  })
    let usercreated = "146"
    // console.log(statement)
    // await getRefx("Ref_No",1 , (ref)=>{ref_no = ref })
    // console.log("accountno :" + accountno)
    // console.log("unitholder :" + unitholder)
    if(unitholder.substring(0,2)=== "DM"){unitholder = null}
    // let MktId
    // await convertMKTID(mktId , (id)=>{ MktId = id })
try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
           let rowsAffected = result.rowsAffected
              console.log("result mtfs  Account :"+ rowsAffected)
            
            if (rowsAffected > 0){
                let Title_Name_T            = result.recordset[0].Title_Name_T
                let First_Name_T            = result.recordset[0].First_Name_T
                let Last_Name_T             = result.recordset[0].Last_Name_T
                let Birth_Day               = result.recordset[0].Birth_Day
                let Title_Name_E            = result.recordset[0].Title_Name_E
                let First_Name_E            = result.recordset[0].First_Name_E
                let Last_Name_E             = result.recordset[0].Last_Name_E
                let Nation_Code             = result.recordset[0].Nation_Code
                let Sex                     = result.recordset[0].Sex
                let Mobile_no               = result.recordset[0].Mobile
                let Email                   = result.recordset[0].Email
                let Married_Status          = null
                let OpenDate                = result.recordset[0].Create_Date
                let Create_By               = "146"
                let typeaccount             = "RED"
                // แก้ไข หน้า คอนเน็ก  customer report  marketing code  is parichart 2022-09-22
                let MktId                   = result.recordset[0].MktId

                let insertMFtsAcccount = `INSERT INTO MFTS_ACCOUNT(Ref_No, Account_No ,First_Name_T, Last_Name_T, Birth_Day, Holder_Id ,Create_By
                                            ,Create_Date ,Modify_By, Modify_Date, Amc_Id, Open_Date	,Title_Name_E, First_Name_E
                                            ,Last_Name_E, Nation_Code, Title_Name_T, Sex, Mobile_no, Email, Married_Status
                                            ,PID_Type, PID_No, Tax_No, PayRedemption_Type, Detuct_Tax, PresentAddr_Flag, OfficeAddr_Flag
                                            ,HaveFixedIncome, HaveEquity, HaveFund, Corp_Type_Id, Marketing_Code, Client_Acc_Type
                                            ,Status_Id, Submit_By, Submit_Date, Completed_By, Completed_Date, FeeRate_Group, Input_Type
                                            ,Status_API, Occupation_Code)
                                            VALUES(@Ref_No, @Account_No, @First_Name_T, @Last_Name_T, @Birth_Day, @Holder_Id ,@Create_By
                                            ,@Create_Date ,@Modify_By, @Modify_Date, @Amc_Id, @Open_Date ,@Title_Name_E, @First_Name_E,
                                            @Last_Name_E, @Nation_Code, @Title_Name_T, @Sex, @Mobile_no, @Email, @Married_Status
                                            ,@PID_Type, @PID_No, @Tax_No, @PayRedemption_Type ,@Detuct_Tax, @PresentAddr_Flag, @OfficeAddr_Flag
                                            ,@HaveFixedIncome, @HaveEquity, @HaveFund, @Corp_Type_Id, @Marketing_Code, @Client_Acc_Type
                                            ,@Status_Id, @Submit_By, @Submit_Date, @Completed_By, @Completed_Date, @FeeRate_Group, @Input_Type
                                            ,@Status_API, @Occupation_Code)`
                new sql.ConnectionPool(config).connect().then(pool => {
                    return pool.request()
                    .input("Ref_No",                            sql.VarChar(12),                ref_no)
                    .input("Account_No",                        sql.VarChar(20),                accountno)
                    .input("Title_Name_T",                      sql.NVarChar(20),                Title_Name_T)
                    .input("First_Name_T",                      sql.NVarChar(200),              First_Name_T)
                    .input("Last_Name_T",                      sql.NVarChar(200),              Last_Name_T)
                    .input("Birth_Day",                         sql.DateTime,                   Birth_Day)
                    .input("Holder_Id",                         sql.VarChar(30),                unitholder)
                    .input("Create_By",                         sql.VarChar(20),                Create_By)
                    .input("Modify_By",                         sql.VarChar(20),                Create_By)
                    .input("Create_Date",                       sql.DateTime,                   datenow)
                    .input("Modify_Date",                       sql.DateTime,                   datenow)
                    .input("Amc_Id",                            sql.Int,                        Amc_Id)
                    .input("Open_Date",                         sql.DateTime,                   OpenDate)
                    .input("Title_Name_E",                      sql.VarChar(20),                Title_Name_E)
                    .input("First_Name_E",                      sql.NVarChar(200),              First_Name_E)
                    .input("Last_Name_E",                       sql.NVarChar(200),              Last_Name_E)
                    .input("Nation_Code",                       sql.NVarChar(200),              Nation_Code)
                    .input("Sex",                               sql.Char(1),                    Sex)
                    .input("Mobile_No",                         sql.VarChar(20),                Mobile_no)
                    .input("Email",                             sql.NVarChar(100),              Email)
                    .input("Married_Status",                    sql.Char(1),                    Married_Status)
                    .input("PID_Type",                          sql.Char(1),                    "C")
                    .input("PID_No",                            sql.VarChar(20),                accountno)
                    .input("Tax_No",                            sql.VarChar(20),                accountno)
                    .input("PayRedemption_Type",                sql.Char(1),                    "A")
                    .input("Detuct_Tax",                        sql.Char(1),                    "1")
                    .input("PresentAddr_Flag",                  sql.Char(1),                    "P")
                    .input("OfficeAddr_Flag",                   sql.Char(1),                    "O")
                    .input("HaveFixedIncome",                   sql.Char(1),                    "0")
                    .input("HaveEquity",                        sql.Char(1),                    "0")
                    .input("HaveFund",                          sql.Char(1),                    "0")
                    .input("Corp_Type_Id",                      sql.Char(1),                    "0")
                    .input("Marketing_Code",                    sql.Int,                        MktId)
                    .input("Client_Acc_Type",                   sql.Char(1),                    "1")
                    .input("Status_Id",                         sql.Int,                          7)
                    .input("Submit_By",                         sql.VarChar(20),                 MktId)
                    .input("Submit_Date",                       sql.DateTime,                   datenow)
                    .input("Completed_By",                      sql.VarChar(20),                MktId)
                    .input("Completed_Date",                    sql.DateTime,                   datenow)
                    .input("FeeRate_Group",                     sql.Int,                        1)
                    .input("Input_Type",                        sql.VarChar(10),                "key")
                    .input("Status_API",                        sql.NChar(10),                  "I")
                    .input("Occupation_Code",                   sql.NChar(10),                  null)
                    .query(insertMFtsAcccount);
                }).then(result =>{
                    if(result.rowsAffected > 0 ){
                        console.log("****Insert MFTS_ACCOUNT ref_no  :" + ref_no)
                        // return callback(ref_no)
                    }
                }).catch(err => {
                    console.log(err);
                    sql.close();
                    //return  callback(err)
                });
            }
            sql.close();
            // console.log(ref_no)
            // return callback(ref_no)
        }).catch(err => {
            console.log("insert error")
            console.log(err);
            sql.close();
            // return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
    // return callback(ref_no)
}
//Get Ref No From Connex 
async function getRefx(typeno,flag , callback){
    let refno ,turnRef
    await getrefnumber(typeno,flag, (x)=>{refno = x})
   
    return callback(refno)
}
async function getrefnumber(refcode,segno, callback){
    let RefNo
    try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .input('Amc_Id' ,sql.Int, 1)
          .input('GRef_No' , sql.Char(12), refcode)
          .execute(`[dbo].[USP_MFTS_Gen_Ref_No_2]`);
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          sql.close();
        //  console.log(result )
         return callback(result.recordset[0].Ref_No)
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

async function SelectSwitchOut(callback){
    let timestampx
        const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
          timestampx = year +"-"+  month  +"-"+ date + " 00:00:00.000"
        //timestampx = year  +  month  + date
 
    let statement = `SELECT Tran_No ,TRANSACTION_DATE,transactionId ,TRANTYPECODEX  FROM MFTS_Transaction 
                        WHERE    Create_date >= '${timestampx}' 
                        AND     TRANTYPECODEX IN('SWO','SWI','TRI','TRO','XSI','XSO') 
                        Order by transactionId`
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            sql.close();
            // console.log(ref_no)
            let row = result.rowsAffected
            if( row > 0 ){console.log("Find row for switch tran no : "+ row)}
            return  callback(result.recordset) 
        }).catch(err => {
            console.log(err);
            sql.close();
            return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }
}

async function updataSwitchOut(datarows){
    if(datarows == false){return }
    // console.log(datarows)
    let transactionId_old = null ,Tran_No_old = null

    for (let key = 0; key < datarows.length; key++) {
        // const element = array[index];
        let Tran_No                = datarows[key].Tran_No
        let TRANTYPECODE       = datarows[key].TRANTYPECODEX
        let transactionId          = datarows[key].transactionId
        // console.log("transaction : " + transactionId)
        // console.log("transactionold : " + transactionId_old)
        if (transactionId === transactionId_old){
            // console.log(transactionId +" <<== new <><> old =>> "+transactionId_old)
            let statement = `UPDATE MFTS_Transaction SET Tran_No = '${Tran_No_old}' WHERE   transactionId ='${transactionId}' `
            try
            { 
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
            }).then(result => {
                sql.close();
                  console.log('Update Tran no Switch Out Id: ' +transactionId)
                //return  callback(result.recordset) 
            }).catch(err => {
                console.log(err);
                sql.close();
               // return  callback(err)
            });
            }catch (error) {
                result = "ERROR Catch"
                console.log(error);
                //return callback(error)
            }
        }

        transactionId_old   = transactionId
        Tran_No_old         = Tran_No

        
    }
    

}
async function insertlogoderquery(datarows ,callback){
    let dateserver 
    await getdatetime( (dt) =>{dateserver = dt  })
   try{ 
          
        const cardNumber            = datarows.accountId
        const HolderNo              = datarows.unitholderId
        const AMCID                 = datarows.Amc_Id
        let tranTypeCode            = datarows.orderType //"SWI" 
        let amountbaht              = datarows.amount
        let TranStatus              = datarows.statusx
        let transactionId           = datarows.transactionId
        let fund_id                 = datarows.Fund_Id
        let desc        = "ข้อมูล Order inquriy  transaction    Fund ID  "+fund_id + "  transactionId "+ transactionId
        let statement   = "INSERT INTO Fund_Errlog_TransferData(Descriptions, TimeLines, Status, AccountNo, HolderId) \
                            VALUES (@Descriptions, @TimeLines, @Status, @AccountNo, @HolderId)   "
        // console.log(statement)
        new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
            .input("Descriptions",              sql.NChar(100),                 desc)
            .input("TimeLines",                 sql.DateTime,                   dateserver)
            .input("Status",                    sql.NChar(10),                  "Dup")
            .input("AccountNo",                 sql.NChar(15),                   cardNumber)
            .input("HolderId",                  sql.VarChar(20),                HolderNo)
            .query(statement);
        }).then(result =>{
            if(result.rowsAffected > 0 ){
            console.log("****Insert Fund_Errlog_TransferData Account No Is  :" + cardNumber)
            // return callback(ref_no)
            }
        }).catch(err => {
            console.log(err);
            sql.close();
        //return  callback(err)
        });
   }catch (error) {
    //result = "ERROR Catch"
    // console.log(error);
    //return callback(error)
    }

}
async function callAPICustomer(accountno ,callback){
    try{             
        const URL = 'http://localhost:5500/api/callFundCustomer/'+accountno// process.env['URL_PROF_INDIV_V4']+"?cardNumber="+cardNumber;
        //console.log("URL:"+URL);
        await axios({
          method: 'get',
          url: URL,
          data: accountno 
        })
        .then(function (response) {
          return callback(response);
        })
        .catch(function (error) {
          // handle error
          console.log(error);
          return callback(error);
        });
            
    
      } catch (error) {
        console.log('Error', error.message);
        return callback(error.message);  
        
      }
}
async function chkCenOrderdup(datarows ,callback){
    if(datarows.length == 0){return callback(0)}
    // console.log(datarows[0].accountId)
    let flag_del = 0 ,rowaff = 0
    let tranid , tranorder
    for (const [i, v] of datarows.entries()) {
        try
        {
            let tranttype               = datarows[i].orderType
            let amc_id                  = datarows[i].Amc_Id
            let unitholder              = datarows[i].unitholderId
            let TranSaction_Date        = datarows[i].transactionDateTime
            let TranStatus              = datarows[i].statusx
            let transactionId           = datarows[i].transactionId
            tranid =   transactionId
            tranorder = tranttype
            if(TranStatus === "CANCELLED"){  continue;}
            let statement   = `SELECT      transactionId, orderType
                                FROM         Fund_Cen_OrderInquiry
                                WHERE     (transactionId = '${transactionId}') AND (orderType = '${tranttype}')    
                               ` 
            // console.log(statement)
            flag_del = 0 ,rowaff = 0
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
                
            }).then(result => {
                    let rowsAffected = result.rowsAffected.toString() 
                if (rowsAffected >= 2){ 
                    // console.log(statement)
                    flag_del = 1
                    rowaff = rowsAffected - 1
                    // delDupCenOrder(transactionId,tranttype,rowsAffected-1)
                }
                sql.close(); 
            }).catch(err => {
                console.log(err);
                sql.close();
                // return callback(err)
            });
            
        }catch (error) {
            console.log(error);
            // return callback(error);
        }
        if(flag_del == 1){
            await delDupCenOrder(tranid,tranorder,rowaff)
        }
    }
}
async function delDupCenOrder(transactionId,tranttype,findRow){
    try{

        let statement   = `DELETE      top(${findRow})   
                            FROM       Fund_Cen_OrderInquiry
                            WHERE     (transactionId = '${transactionId}') AND (orderType = '${tranttype}')   
                            ` 
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);

        }).then(result => {
        let rowsAffected = result.rowsAffected.toString() 
        if (rowsAffected > 0){  
            console.log("DELETE FUND_CEN_ORDER DUP ID:"+transactionId +" Tran Order :"+ tranttype)
        }
        sql.close(); 
        }).catch(err => {
            console.log(err);
            sql.close(); 
        });

    }catch (error) {
    console.log(error); 
    }
}
async function updatebulk (datarows,callback){
    let Data_Order = []
    let dateserver 
        await getdatetime( (dt) =>{dateserver = dt  })
    for (const key in datarows) {
        let tranNo
        await  getTranNumber(1,(no)=>{ tranNo =no })
        
        let RefNo                   = datarows[key].Ref_no
        let IDACCOUNTI              = datarows[key].accountId
        const HolderNo              = datarows[key].unitholderId
        const Amc_Id                 = datarows[key].Amc_Id 

        if (RefNo === undefined){RefNo = null}
        if (RefNo === null){ 
            await  CheckMftsaccount(IDACCOUNTI, HolderNo ,Amc_Id,(refNo)=>{  RefNo = refNo })
            // 2023-02-03 8:53 ไม่พบ amc id ไม่ต้องทำ
            if (RefNo === null && Amc_Id !== null){  // ถ้าไม่พบ ref ให้ทำการค้นที orderquery && ไม่พบ amc id ไม่ต้องทำ
                await  getRefx("Ref_No",1 , (refx)=>{
                    RefNo =  refx
                })
                await insertMFtsAcccount(IDACCOUNTI, HolderNo ,Amc_Id, RefNo)
            }

        }
        // console.log(datarows)
        let tranTypeCode_db         = datarows[key].orderType 
        let tranTypecode
        switch (tranTypeCode_db) {
            case "SUB":
                tranTypecode = "B"
                break;
            case "RED":
                tranTypecode = "S"
                break;
            case "TRI":
                tranTypecode = "TI"
                break;
            case "TRO":
                tranTypecode = "TO"
                break;
            case "SWI":
                tranTypecode = "SI"
                break;
            case "SWO":
                tranTypecode = "SO"
                break;
            case "XSI":
                tranTypecode = "TI"
                break;
            case "XSO":
                tranTypecode = "TO"
                break;
            default:
                break;
        }
        let Fund_Id                 = datarows[key].Fund_Id
        let TranSaction_Date        = datarows[key].transactionDateTime
        let trandate_db             =TranSaction_Date.substring(0,4) + "-" + TranSaction_Date.substring(4,6)  + "-" + TranSaction_Date.substring(6,8)
        let effectiveDate           = datarows[key].effectiveDate
        let executedate             = effectiveDate.substring(0,4) + "-" + effectiveDate.substring(4,6)  + "-" + effectiveDate.substring(6,8)
        let mkktid , tranflag = "OrderInQuiry"
        let MKTIID                   = datarows[key].icLicense 
        await convertMKTID(MKTIID , (id)=>{ mkktid = id })
        let FUNDCODEI               = datarows[key].fundCode
        let UNITHOLDERI             = datarows[key].unitholderId 
        let AMCCODEI                = datarows[key].Amc_Code 
        let transactionId           = datarows[key].transactionId
        let CustomerInput           =   null
        let amountunit              = datarows[key].unit
        let Alloted_Amount          = datarows[key].allottedAmount 
        let TranStatus              = datarows[key].statusx
        let amountbaht              = datarows[key].amount
        let allottedUnit            = datarows[key].allottedUnit
        let allottedNAV            = datarows[key].allottedNAV
        let paymentType             = datarows[key].paymentType
        let bankCode                = datarows[key].settlementBankCode //bankCode //settlementBankCode
        let bankAccount             = datarows[key].settlementBankAccount //bankAccount  //settlementBankAccount
        let price                    
        if(TranStatus === "ALLOTTED")   { price = Alloted_Amount}
        if(TranStatus === "APPROVED")   { price = amountbaht }
        if(TranStatus === "WAITING")    { price = amountbaht}
        if(TranStatus === "APPROVED")   { allottedUnit = amountunit }
        if(allottedUnit === null)       {allottedUnit= 0.0000}
        if(price === null)              {price= 0.0000}
        if(datarows[key].sellAllUnitFlag = "Y" && amountunit > 0   && TranStatus === "ALLOTTED" && Alloted_Amount > 0){CustomerInput = "Y"}
        if(tranTypeCode_db !=="SUB"){
            paymentType = null
            bankCode    = null
            bankAccount = null
        }
        let data_orderIn =[]
        data_orderIn.push(tranNo)
        data_orderIn.push(RefNo)
        data_orderIn.push(tranTypecode)
        data_orderIn.push(Fund_Id)
        data_orderIn.push(trandate_db)
        data_orderIn.push(5)
        data_orderIn.push("F")
        data_orderIn.push(price) //Amount_Baht
        data_orderIn.push(allottedUnit) //allottedUnit 
        data_orderIn.push("I") //APIstatus 
        data_orderIn.push(allottedNAV) //NAV_PRICE 
        data_orderIn.push(executedate) //ExecuteDate
        data_orderIn.push(executedate) //Act_ExecDate
        data_orderIn.push(null) //Seq_No
        data_orderIn.push(mkktid) //Mktid
        data_orderIn.push('146') //Create_by
        data_orderIn.push(dateserver) //Create_date
        data_orderIn.push(0.000000) //Unit_Balance
        data_orderIn.push(0.000000) //AVG_Cost
        data_orderIn.push(0.000000) //Total_Cost
        data_orderIn.push('146') //Modify_By
        data_orderIn.push(1) //FeeRate_Group
        data_orderIn.push(executedate) //Modify_Date
        data_orderIn.push(0.000000) //RGL
        data_orderIn.push(FUNDCODEI) //FUNDCODEI
        data_orderIn.push(UNITHOLDERI) //UNITHOLDERI
        data_orderIn.push(IDACCOUNTI) //IDACCOUNTI
        data_orderIn.push(AMCCODEI) //AMCCODEI
        data_orderIn.push(TranSaction_Date) //TranSaction_Date
        data_orderIn.push(tranTypeCode_db) //TRANTYPECODEX
        data_orderIn.push(tranflag) //TranTypeFLAG
        data_orderIn.push(CustomerInput) //CustomerInput
        data_orderIn.push(transactionId) //transactionId 
        data_orderIn.push(paymentType)
        data_orderIn.push(bankCode)
        data_orderIn.push(bankAccount)
        Data_Order.push(data_orderIn)
    }
    // console.log(Data_Order)
    
    let table = new sql.Table('MFTS_Transaction');

    table.columns.add('Tran_No',        sql.VarChar(12),    { nullable: false });
    table.columns.add('Ref_No',         sql.VarChar(12),    { nullable: false });
    table.columns.add('TranType_Code',  sql.VarChar(2),     { nullable: false });
    table.columns.add('Fund_Id',        sql.Int,            { nullable: false });
    table.columns.add('Tran_Date',      sql.Date,           { nullable: false });
    table.columns.add('Status_Id',      sql.TinyInt,        { nullable: true });
    table.columns.add('Source_Flag',    sql.Char(1),        { nullable: true });
    table.columns.add('Amount_Baht',    sql.Numeric(18,2),  { nullable: true });
    table.columns.add('Amount_Unit',    sql.Numeric(18,4),  { nullable: true });
    table.columns.add('APIstatus',      sql.NChar(10),      { nullable: true });
    table.columns.add('NAV_PRICE',      sql.Numeric(18,4),  { nullable: true });
    table.columns.add('ExecuteDate',    sql.Date,           { nullable: true });
    table.columns.add('Act_ExecDate',   sql.Date,           { nullable: true });
    table.columns.add('Seq_No',         sql.Int,            { nullable: true });
    table.columns.add('Mktid',          sql.Int,            { nullable: true });
    table.columns.add('Create_by',      sql.VarChar(20),    { nullable: true });
    table.columns.add('Create_date',    sql.DateTime,       { nullable: true });
    table.columns.add('Unit_Balance',   sql.Decimal(18,4),  { nullable: true });
    table.columns.add('AVG_Cost',       sql.Float,          { nullable: true });
    table.columns.add('Total_Cost',     sql.Decimal(18,4),  { nullable: true });
    table.columns.add('Modify_By',      sql.VarChar(20),    { nullable: true });
    table.columns.add('FeeRate_Group',  sql.Int,            { nullable: true });
    table.columns.add('Modify_Date',    sql.DateTime,       { nullable: true });
    table.columns.add('RGL',            sql.Decimal(20,6),  { nullable: true });
    table.columns.add('FUNDCODEI',      sql.NChar(30),      { nullable: true });
    table.columns.add('UNITHOLDERI',    sql.NChar(30),      { nullable: true });
    table.columns.add('IDACCOUNTI',     sql.NChar(30),      { nullable: true });
    table.columns.add('AMCCODEI',       sql.NChar(30),      { nullable: true });
    table.columns.add('TranSaction_Date', sql.NChar(14),    { nullable: true });
    table.columns.add('TRANTYPECODEX',  sql.NChar(5),       { nullable: true });
    table.columns.add('TranTypeFLAG',   sql.VarChar(30),    { nullable: true });
    table.columns.add('CustomerInput',  sql.Char(1),        { nullable: true });
    table.columns.add('transactionId',  sql.VarChar(20),    { nullable: true }); 
    table.columns.add('TypePayMent',    sql.VarChar(10),    { nullable: true }); 
    table.columns.add('BankCode',       sql.VarChar(5),     { nullable: true }); 
    table.columns.add('AccountBankNo',  sql.VarChar(20),    { nullable: true });  

    // Data_Order.forEach(datarow => table.rows.add.apply(table.rows, datarow));
    Data_Order.forEach(datarow => table.rows.add.bind(table.rows, datarow));
    let pool = await sql.connect(config); 
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);

            } else {
                

            }

            pool.close();
            sql.close();
        });
    return callback("done")
}
export {selctDataOrderQuery ,impoertOrderQuery ,checkDataOrderInquiry ,SelectSwitchOut ,updataSwitchOut ,checkDataDupOrderInquiry , checkRefno ,importmftsaccount,chkCenOrderdup}