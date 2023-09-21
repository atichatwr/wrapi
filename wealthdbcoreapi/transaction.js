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
import nodemailer from 'nodemailer'; 
dotenv.config();

async function getDataTransaction(callback){
    try 
    {
    let data_row = 0
    let statement = `SELECT *  from  V_TRANSACTION_ALLOT_DAILY 
                   
                        ORDER BY  dbo.V_TRANSACTION_ALLOT_DAILY.Fund_Id 
                         `
                    // WHERE dbo.V_TRANSACTION_ALLOT_DAILY.TRANSACTION_ID = '1412302070003673' = '1412302150014130'
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
            let cardNumber            = datarows[key].FILTER01
            const HolderNo              = datarows[key].UNITHOLDER_ID
            const AMCID                 = datarows[key].Amc_Id
            let TranDate                = datarows[key].TRANS_DATE
            const TranStatus            = datarows[key].STATUS
            let amountbaht              = datarows[key].AMOUNT
            let amountunit              = datarows[key].ALLOTED_UNIT
            let navprice                = datarows[key].ALLOTED_NAV
            let EFFECTIVEDATEx          = datarows[key].EFFECTIVE_DATE
            let MKTIID                  = datarows[key].mktid
            let average_cost            = null
            let  unitbalance            = 0.0000 //datarows[key].UNIT_BALANCE
            // let unit_balance_last       = datarows[key].unitbalance
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
            let balanceNav , balanceAvg, realizeGi ,  c 
            let statusApprov
            if(cardNumber ==="SINK"){
                await getAccountIdSINK(HolderNo ,(id)=>{cardNumber = id})
                if(cardNumber===null){continue;}
            }
            if (TranStatus === "WAITING") {statusApprov = 5}
            if (TranStatus === "ALLOTTED") {statusApprov = 7}
            if (TranStatus === "REJECTED") {statusApprov = 8}

            //AVG = Amount_Baht / Unit_Balance
            //Totalcost = Unit_Balance  * AVG 
            if (tranTypeCode_db === "SUB") {
                tranTypecode            = "B"  // trancode
                if(amountbaht > 0 && average_cost > 0 ){
                    amountunit_db    =  amountbaht / average_cost
                    
                    totalCost = (unitbalance > 0)? unitbalance * average_cost : 0.0000
                }
                
            }else if(tranTypeCode_db === "RED"){
                balanceNav              = allottedUnit * allottedNAV
                balanceAvg              = allottedUnit * average_cost
                tranTypecode            = "S"
                if(allottedNAV > 0 && average_cost >0){ realizeGi_db = (balanceNav - balanceAvg)}
                if(amountbaht > 0 && average_cost > 0 ){
                    amountunit_db = (amountbaht / average_cost); unitbalance = amountunit_db
                    totalCost = (unitbalance > 0)? unitbalance * average_cost : 0.0000
                }
                 
            }else if (tranTypeCode_db === "TRI" ){
                if (amountbaht > 0 ) {amountunit_db = (amountbaht/average_cost)}
                tranTypecode = "TI"
            
            }else if (tranTypeCode_db === "TRO"){
                tranTypecode = "TO"
                balanceNav = allottedUnit * allottedNAV
                balanceAvg = allottedUnit * average_cost
                if (allottedNAV > 0 && average_cost >0){realizeGi_db = balanceNav - balanceAvg;}
                if (amountbaht > 0 && average_cost >0 ){ 
                    amountunit_db = (amountbaht / average_cost);
                    totalCost = (unitbalance > 0)? unitbalance * average_cost : 0.0000;
                }
            }else if (tranTypeCode_db === "SWI" ){
                if(amountbaht > 0 && average_cost > 0 ){amountunit_db = (amountbaht / average_cost); } //totalCost = (unitbalance > 0)? unitbalance * average_cost : 0.0000;
                tranTypecode = "SI"
            }else if (tranTypeCode_db === "SWO" ){
                balanceNav = allottedUnit * allottedNAV
                balanceAvg = allottedUnit * average_cost
                if (allottedNAV > 0 && average_cost >0){realizeGi_db = balanceNav - balanceAvg ;} //totalCost = (unitbalance > 0)? unitbalance * average_cost : 0.0000;
                //statusApprov = 8
                tranTypecode = "SO"
            }else if( tranTypeCode_db === "XSI"){
                // if (amountbaht > 0 ) {amountunit_db = (amountbaht/average_cost); totalCost = (unitbalance > 0)? unitbalance * average_cost : 0.0000;}
                if (amountbaht > 0 ) {amountunit_db = (amountbaht/average_cost)}
                tranTypecode = "TI"
            }else if( tranTypeCode_db === "XSO"){
                balanceNav = allottedUnit * allottedNAV
                balanceAvg = allottedUnit * average_cost
                if (allottedNAV > 0 && average_cost >0){realizeGi_db = balanceNav - balanceAvg}
                if (amountbaht > 0 && average_cost >0 ){ amountunit_db = (amountbaht / average_cost); } //totalCost = (unitbalance > 0)? unitbalance * average_cost : 0.0000;
                tranTypecode = "TO"
            }
            // console.log("TranType_Code : " +tranTypecode + "    >>>>>transactionId : "+transactionId )
            if (TranStatus === "ALLOTTED"){
                average_cost            =  Alloted_Amount / amountunit 
                navprice                =  datarows[key].ALLOTED_NAV
                 
                await getUnitBalance(RefNo , Fund_Id ,( unibal)=>{ unitbalance = unibal }) 
            }
            
            
            let dateserver
            await getdatetime((dt=>{dateserver = dt}))
            if(realizeGi        === undefined)  {realizeGi = 0.000000}
            if(navprice         === undefined)  {navprice = 0.000000}
            if(amountunit       === undefined || amountunit.toString.length == 0 )  {amountunit = 0.000000}
            if(Amount_U         === undefined )  {Amount_U = 0.000000}
            if(Amount_U.toString().length == 0 )  {Amount_U = 0.000000}
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
                await checkseqnull(RefNo,Fund_Id,TranDate_chk,tranTypecode , (seqNo)=>{ seq_number = seqNo })
                if(seq_number === null){
                    await getSeqNo(RefNo, Fund_Id, (sq_no)=> {  seq_number = sq_no  })
                }
                
                if(amountbaht.toString().length == 0){amountbaht = 0.0000}
                // console.log(seq_number)
                statement = `SELECT REF_NO FROM MFTS_TRANSACTION 
                                WHERE  transactionId              = '${transactionId}' 
                                AND    TranType_Code              = '${tranTypecode}'
                             `
            let query , flag_db ,APIstatus 
            // console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
                }).then(result => {
                let data_row = result.rowsAffected;
                // console.log("key " + key )
                  console.log( data_row )
                if (data_row == 1){
                    //update
                    // if (transactionId === null || transactionId === undefined){
                        query = `UPDATE MFTS_Transaction
                        SET APIstatus           = @APIstatus,
                        RGL                     = @RGL,
                        Amount_Unit             = @Amount_Unit,
                        Amount_Baht             = @Amount_Baht,
                        Unit_balance            = @Unit_balance,
                        NAV_PRICE               = @NAV_PRICE,
                        Status_Id               = @Status_Id,
                        Modify_Date             = @Modify_Date,
                        Total_Cost              = @Total_Cost,
                        AVG_Cost                = @AVG_Cost,
                        Seq_No                  = @Seq_No,
                        Act_ExecDate            = @Act_ExecDate,
                        Mktid                   = @Mktid,
                        FUNDCODEI               = @FUNDCODEI,
                        UNITHOLDERI             = @UNITHOLDERI,
                        IDACCOUNTI              = @IDACCOUNTI,
                        AMCCODEI                = @AMCCODEI,
                        TranSaction_Date        = @TranSaction_Date,
                        TRANTYPECODEX           = @TRANTYPECODEX,
                        transactionId           = @transactionId,
                        Source_Flag             = @Source_Flag
                        WHERE  transactionId    = '${transactionId}' 
                        AND    TranType_Code    = '${tranTypecode}'  
                        `
                    APIstatus = "U"
                    flag_db = "Update"
                    // seq_number = seq_number - 1
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
                //******* */ k. krit order  not  get ref no  2022-09-16///////************* */
                // if(RefNo === null){ await getRefx("Ref_No",1 , (ref)=>{RefNo = ref })}
                // await getMaxSeqNo(RefNo,Fund_Id,(maxseq)=>{ seqno = maxseq})
                // console.log("max : "+ max)
            }
            
            let trandate_db     =TranDate.substring(0,4) + "-" + TranDate.substring(4,6)  + "-" + TranDate.substring(6,8)    
            let Source_Flag     = "F"
            
            let mkktid =    MKTIID
            // await convertMKTID(MKTIID , (id)=>{ mkktid = id })
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
                    .input("Seq_No",        sql.Int,            seq_number)
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
                    let respx = flag_db + " to TRANSACTION RefNo :" + RefNo + " fundId : "+Fund_Id;
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
            // if (flag_db === "Insert"){
            //    await InsertMFTSBuy(tranNo,"Moblie","C","0","OD")
            //    await UpdateUnitBalance(RefNo,HolderNo,cardNumber,Fundcode,Fund_Id)
            // }
        }catch(error) {
            console.log(error);
            // return   callback(error);
          
        }
       
    }
    
    // return   callback("");
}
async function importDataTransaction_manul(datarows, callback){
    for (const key in datarows) {

        try{
            let cardNumber            = datarows[key].FILTER01
            const HolderNo              = datarows[key].UNITHOLDER_ID
            const AMCID                 = datarows[key].Amc_Id
            let TranDate                = datarows[key].TRANS_DATE
            const TranStatus            = datarows[key].STATUS
            let amountbaht              = datarows[key].AMOUNT
            let amountunit              = datarows[key].ALLOTED_UNIT
            let navprice                = datarows[key].ALLOTED_NAV
            let EFFECTIVEDATEx          = datarows[key].EFFECTIVE_DATE
            let MKTIID                  = datarows[key].mktid
            let average_cost            = null
            let  unitbalance            = 0.0000// datarows[key].UNIT_BALANCE
            let totalCost               = 0.0000
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
            let statusApprov ,average_cost_Diff       = null
            if(cardNumber ==="SINK"){
                await getAccountIdSINK(HolderNo ,(id)=>{cardNumber = id})
                if(cardNumber===null){continue;}
            }
            //IT Request 230208
            // if(cardNumber === '3100201406474'){
            //     await cusHolderLevel(cardNumber,Fundcode,HolderNo ,(newRefno)=>{
            //         RefNo = newRefno
            //     })
            // }
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
                // if(RefNo ==='M00000002488' ){console.log("amountbaht "+amountbaht.toString())}
            }else if (tranTypeCode_db === "TRI" ){
                if (amountbaht > 0 ) {amountunit_db = (amountbaht/average_cost)}
                tranTypecode = "TI"
            
            }else if (tranTypeCode_db === "TRO"){
                balanceNav = allottedUnit * allottedNAV
                balanceAvg = allottedUnit * average_cost
                if (allottedNAV > 0 && average_cost >0){realizeGi_db = balanceNav - balanceAvg}
                if (amountbaht > 0 && average_cost >0 ){ amountunit_db = (amountbaht / average_cost)}
                tranTypecode = "TO"
            }else if (tranTypeCode_db === "SWI" ){
                if(amountbaht > 0 && average_cost > 0 ){amountunit_db = (amountbaht / average_cost)}
                tranTypecode = "SI"
            }else if (tranTypeCode_db === "SWO" ){
                balanceNav = allottedUnit * allottedNAV
                balanceAvg = allottedUnit * average_cost
                if (allottedNAV > 0 && average_cost >0){realizeGi_db = balanceNav - balanceAvg}
                //statusApprov = 8
                tranTypecode = "SO"
            }else if( tranTypeCode_db === "XSI"){
                if (amountbaht > 0 ) {amountunit_db = (amountbaht/average_cost)}
                tranTypecode = "TI"
            }else if( tranTypeCode_db === "XSO"){
                balanceNav = allottedUnit * allottedNAV
                balanceAvg = allottedUnit * average_cost
                if (allottedNAV > 0 && average_cost >0){realizeGi_db = balanceNav - balanceAvg}
                if (amountbaht > 0 && average_cost >0 ){ amountunit_db = (amountbaht / average_cost)}
                tranTypecode = "TO"
            }
            // console.log("TranType_Code : " +tranTypecode + "    >>>>>transactionId : "+transactionId )
            let avg_cost_dev = 0.00000000
            let total_cost    = 0.00000000
            let dateToday  ,total_costdev = 0.00000000,total_averag = 0.00000000
            if (TranStatus === "ALLOTTED"){
                average_cost            = Alloted_Amount / amountunit 
                navprice                =  datarows[key].ALLOTED_NAV
                average_cost_Diff       =0.0000
                
                await getdatetime((dt=>{dateToday = dt}))       
                await  averagCostdiff(RefNo ,Fund_Id ,(total_avg)=>{total_averag = total_avg })
                await totalcostdev(RefNo ,Fund_Id ,(total_c)=>{total_costdev = total_c}) 
                total_costdev = parseFloat(total_costdev) 
                avg_cost_dev    = total_averag
                average_cost_Diff = average_cost - total_averag
                //---  renew for uninbalance 2023 -01 - 05  -- ////////
                //--- comment getUnitBalance
                        //await getUnitBalance(RefNo , Fund_Id ,( unibal)=>{ unitbalance = unibal })
                //-- get last tranasction 
                let unitBalance_last = 0.000000
                await getlastbalance(RefNo , Fund_Id ,TranDate,( unibal)=>{
                   unitBalance_last = unibal 
                })
                // console.log(parseFloat(unitBalance_last) + parseFloat(allottedUnit) )
                console.log("unitBalance_last  " +unitBalance_last+ "Ref No : "+RefNo + "Fund id : " +Fund_Id)
                 
                switch (tranTypeCode_db) {
                    case "SUB" :
                        unitbalance = parseFloat(unitBalance_last) + parseFloat(allottedUnit)  
                        break;
                    case "SWI":
                        unitbalance = parseFloat(unitBalance_last) + parseFloat(allottedUnit)  
                        break;
                    case "XSI":
                        unitbalance = parseFloat(unitBalance_last) + parseFloat(allottedUnit)  
                        break;
                    case "RED" :
                        unitbalance = parseFloat(unitBalance_last) - parseFloat(allottedUnit)
                        break;
                    case "SWO" :
                        unitbalance = parseFloat(unitBalance_last) - parseFloat(allottedUnit)
                        break;
                    case "XSO":
                        unitbalance = parseFloat(unitBalance_last) - parseFloat(allottedUnit)
                        break;
                
                    default:
                        break;
                }
                // console.log("unitbalance " +unitbalance)
                let flag_db
                if(unitbalance < 0){unitbalance = 0.0000}
                
                // ซื้อมา Sub  100   Seq = 1
                // ขาย   Red  50   Seq  = 2 = Bal   100-50 =50 
                // Swi   SWI  30   Seq  = 3 = Bal   50+30               Check Confrim MFTS_UNITBALANCE = 80 =0
                // Tro   TRO  15   Seq  = 4 = Bal = 80-15 = 65          Check Confrim MFTS_UNITBALANCE = 65 =0

                await checkunitbalance(RefNo , Fund_Id ,unitbalance ,(flag_unitbalance =>{
                    // console.log("status unitbalace"+flag_unitbalance)
                    flag_db = flag_unitbalance
                }))
                await setMFTSUnitbalance(RefNo , Fund_Id ,unitbalance ,flag_db,Fundcode,HolderNo,(flag_unitbalance)=>{
                      console.log("status unitbalace "+flag_unitbalance + "Ref No: "+RefNo + "fund id :"+ Fund_Id)
                })
                
            } //TranStatus === "ALLOTTED"
            // continue;
            //AVG = Amount_Baht / Unit_Balance
            //Totalcost = Unit_Balance  * AVG
            // fix 2023-01-24 after 6 mounts!!!!!! 
            totalCost               = unitbalance * average_cost
            let dateserver
            await getdatetime((dt=>{dateserver = dt}))
            if(realizeGi        === undefined)  {realizeGi = 0.000000}
            if(navprice         === undefined)  {navprice = 0.000000}
            if(amountunit       === undefined || amountunit.toString.length == 0 )  {amountunit = 0.000000}
            if(Amount_U         === undefined )  {Amount_U = 0.000000}
            if(Amount_U.toString().length == 0 )  {Amount_U = 0.000000}
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
                await checkseqnull(RefNo,Fund_Id,TranDate_chk,tranTypecode , (seqNo)=>{ seq_number = seqNo })
                if(seq_number === null){
                    await getSeqNo(RefNo, Fund_Id, (sq_no)=> {  seq_number = sq_no  })
                }
                
                if(amountbaht.toString().length == 0){amountbaht = 0.0000}
                // console.log(seq_number)
                statement = `SELECT REF_NO ,Unit_balance FROM MFTS_TRANSACTION 
                             WHERE transactionId = '${transactionId}'
                             AND    TranType_Code    = '${tranTypecode}'
                             `
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
                        SET APIstatus           = @APIstatus,
                        RGL                     = @RGL,
                        Amount_Unit             = @Amount_Unit,
                        Amount_Baht             = @Amount_Baht,
                        Unit_balance            = @Unit_balance,
                        NAV_PRICE               = @NAV_PRICE,
                        Status_Id               = @Status_Id,
                        Modify_Date             = @Modify_Date,
                        Total_Cost              = @Total_Cost,
                        AVG_Cost                = @AVG_Cost,
                        Seq_No                  = @Seq_No,
                        Act_ExecDate            = @Act_ExecDate,
                        Mktid                   = @Mktid,
                        FUNDCODEI               = @FUNDCODEI,
                        UNITHOLDERI             = @UNITHOLDERI,
                        IDACCOUNTI              = @IDACCOUNTI,
                        AMCCODEI                = @AMCCODEI,
                        TranSaction_Date        = @TranSaction_Date,
                        TRANTYPECODEX           = @TRANTYPECODEX,
                        transactionId           = @transactionId,
                        Source_Flag             = @Source_Flag,
                        Avg_Cost_Diff           = @Avg_Cost_Diff,
                        Avg_Cost_Dev            = @Avg_Cost_Dev,
                        Total_Cost_Dev          = @Total_Cost_Dev
                        WHERE transactionId = '${transactionId}'
                        AND    TranType_Code    = '${tranTypecode}'  
                        ` //
                    APIstatus = "U"
                    flag_db = "Update"
                    // seq_number = seq_number - 1
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
                //******* */ k. krit order  not  get ref no  2022-09-16///////************* */
                // if(RefNo === null){ await getRefx("Ref_No",1 , (ref)=>{RefNo = ref })}
                // await getMaxSeqNo(RefNo,Fund_Id,(maxseq)=>{ seqno = maxseq})
                // console.log("max : "+ max)
            }
            
            let trandate_db     =TranDate.substring(0,4) + "-" + TranDate.substring(4,6)  + "-" + TranDate.substring(6,8)    
            let Source_Flag     = "F"
            
            let mkktid =    MKTIID
            // await convertMKTID(MKTIID , (id)=>{ mkktid = id })
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
                    .input("Seq_No",        sql.Int,            seq_number)
                    .input("Mktid",         sql.Int,            mkktid )
                    .input("Create_by",     sql.VarChar(20),    Create_By)
                    .input("Create_date",   sql.DateTime,       dateserver) 
                    .input("Unit_Balance",  sql.Decimal(18,4),  unitbalance)
                    .input("AVG_Cost",      sql.Float,          average_cost)
                    .input("Total_Cost",    sql.Decimal(18,4),  totalCost  )
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
                    .input("Total_Cost_Dev",  sql.Decimal(18,9), total_costdev) 
                    .input("Avg_Cost_Diff",  sql.Decimal(18,9), average_cost_Diff) 
                    .input("Avg_Cost_Dev",  sql.Decimal(25,8),  avg_cost_dev) 
                    .query(query)
                }).then(result => {
                    let row = result.rowsAffected
                    let respx = flag_db + " to  MFTS TRANSACTION   RefNo :" + RefNo + " record(s)";
                    console.log(respx);
                    sql.close();
                    // IT Request 230202
                    callUpsCostAvg(RefNo,Fund_Id,dateserver,seq_number)
                }).catch(err => {
                    console.log(err);
                    sql.close();
                    // return callback(err);
                    // IT Request 230205
                    // TransactionLogerror()
                });
            
            // console.log("navprice :"+ navprice.toString()+ " :")
            // console.log(statement)
            // console.log(amountunit_db)
            // if (flag_db === "Insert"){
            //    await InsertMFTSBuy(tranNo,"Moblie","C","0","OD")
            //    await UpdateUnitBalance(RefNo,HolderNo,cardNumber,Fundcode,Fund_Id)
            // }
        }catch(error) {
            console.log(error);
            // return   callback(error);
          
        }
       
    }
    //--- log unibalance
    // await selectDataTologUnitbalance((datas)=>{
    //     logDataUnitbalance(datas,function(x){
    //         if(x == 1){
    //             //update mfts_unitbalace ให้เท่ากัน
    //             //setUnitbalanceMftsUnitbalance(datas)
    //             console.log(x)
    //         }
    //     })
        
    // })
    //--- log allottransaction
    await getDataTransactiondate((datas)=>{
        // logErrorTransaction(datas ,function(x){
        //     if(x== 1){
        //         console.log(x)
        //     }
        // })
    })
    // return   callback("");
}
 
async function logErrorTransaction(datarows, callback){
    let count_row = datarows.length;
    let flag_db = 0
    if(count_row ==0){return flag_db}
    for (const key in datarows) {
         let status_wr  = null ,status_api  = null,Ref_No  = null, Fund_Id  = null,FUND_CODE  = null,Confirm_Unit = null,Unit_Balance = null ,status_id= null ,TRANSACTION_ID=null ,comment='',UNITHOLDER_ID
         let Account_no
         status_api             = datarows[key].statur_api
         status_wr              = datarows[key].status_wr
         Ref_No                 = datarows[key].Ref_No
         Fund_Id                = datarows[key].Fund_Id
         FUND_CODE              = datarows[key].FUND_CODE
         Confirm_Unit           = datarows[key].Confirm_Unit
         Unit_Balance           = datarows[key].Unit_Balance
         TRANSACTION_ID         = datarows[key].TRANSACTION_ID
         UNITHOLDER_ID          = datarows[key].UNITHOLDER_ID
         status_id              = datarows[key].Status_Id
         Account_no             = datarows[key].id_card

         
         if(Ref_No === null || Ref_No === undefined){
            comment= 'ไม่มี Ref No'
            inputlogtranasction(TRANSACTION_ID,Ref_No,Fund_Id,FUND_CODE,Confirm_Unit,Unit_Balance,comment,UNITHOLDER_ID,Account_no)
            continue;
        }
         if(Fund_Id=== null || Ref_No === undefined){
            comment= 'ไม่มี Fund_id'
            inputlogtranasction(TRANSACTION_ID,Ref_No,Fund_Id,FUND_CODE,Confirm_Unit,Unit_Balance,comment,UNITHOLDER_ID,Account_no)
            continue;
        }
         if(status_id != 7 && (Confirm_Unit != Unit_Balance) ){
            comment= 'Unitbalance ไม่ตรงกัน'
            inputlogtranasction(TRANSACTION_ID,Ref_No,Fund_Id,FUND_CODE,Confirm_Unit,Unit_Balance,comment,UNITHOLDER_ID,Account_no)
            continue;
        }
        if(status_api ==='ALLOTTED' && status_wr ==='Waiting' ){
            comment= 'ทำรายการ Allot ไม่สำเร็จ'
            inputlogtranasction(TRANSACTION_ID,Ref_No,Fund_Id,FUND_CODE,Confirm_Unit,Unit_Balance,comment,UNITHOLDER_ID,Account_no)
            continue;
        }
    }
}
async function inputlogtranasction(TRANSACTION_ID,Ref_No,Fund_Id,FUND_CODE,Confirm_Unit,Unit_Balance,comment,UNITHOLDER_ID,Account_no){
    try{
        let TimeLines 
        if(Ref_No === undefined){Ref_No = null}
        await getdatetime((dt=>{TimeLines = dt}))
        let statement =`INSERT INTO Fund_Errlog_TransferData
                    ( Descriptions, TimeLines, Status,   AccountNo, HolderId, TRANSACTION_ID, Ref_No, Fund_Id,   FUND_CODE, Confirm_Unit, Unit_Balance)
                    VALUES( @Descriptions, @TimeLines, @Status,   @AccountNo, @HolderId, @TRANSACTION_ID, @Ref_No, @Fund_Id,   @FUND_CODE, @Confirm_Unit, @Unit_Balance)`
                    
        await poolPromise.then(pool => {
            return pool.request()
                .input("Descriptions",       sql.NVarChar(100),         comment)
                .input("TimeLines",         sql.DateTime,               TimeLines)
                .input("Status",            sql.VarChar(10),            "Transa")
                .input("AccountNo",         sql.NVarChar(15),            Account_no )
                .input("HolderId",          sql.NVarChar(20),           UNITHOLDER_ID)
                .input("TRANSACTION_ID",     sql.NVarChar(30),          TRANSACTION_ID)
                .input("Ref_No",            sql.NChar(10),              Ref_No)
                .input("Fund_Id",           sql.NChar(10),              Fund_Id)
                .input("FUND_CODE",         sql.NVarChar(50),           FUND_CODE)
                .input("Confirm_Unit",     sql.Numeric(18,4),          parseFloat(Confirm_Unit))
                .input("Unit_Balance",     sql.NChar(50),               Unit_Balance)
                .query(statement)
            }).then(result => {
                // let row = result.rowsAffected
                let respx =  "Insert to  Fund_Errlog_TransferData   RefNo :" + Ref_No + "  ";
                console.log(respx);
                sql.close();
                
    
            }).catch(err => {
                console.log(err);
                sql.close();
                // return callback(err);
            });
        }catch(error) {
            console.log(error);
            // return   callback(error);
            
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
    
    let statement = `SELECT isnull(max(Seq_No),0) +1 as Seq_No FROM MFTS_TRANSACTION WHERE REF_NO = '${RefNo}' AND Fund_ID = ${Fund_Id}  ;`  
            //   console.log(statement)
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
            //  if(seq_no === null){ seq_no =   1}
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
async function updateholderAccount(Amc_Id,RefNo,cardNumber,HolderNo ){
    try{
        let statement = "UPDATE MFTS_ACCOUNT SET \
                        Holder_Id =@HolderNo , \
                        Modify_Date = @modify \
                        WHERE  Ref_No=@RefNo AND  Account_No= @cardNumber AND  Amc_Id=@Amc_id "
        
        let dateserver
        await getdatetime((dt=>{dateserver = dt}))
        await poolPromise.then(pool => {
        return pool.request()
            .input("RefNo",             sql.VarChar(12),    RefNo)
            .input("cardNumber",        sql.VarChar(20),    cardNumber)
            .input("Amc_Id",            sql.Int,            Amc_Id)
            .input("HolderNo",         sql.VarChar(30),    HolderNo)
            .input("modify",            sql.DateTime,       dateserver)
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            let hoderId 
            if (rowsAffected > 0){  
                console.log("Update Holder ID ON MFTS ACCOUNT "+ rowsAffected+" Row  Holder No is "+ HolderNo)
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
async function checktounitholder(callback){
    try 
    {
    let data_row = 0
    let statement = `SELECT     TOP (100) PERCENT dbo.MFTS_Account.Ref_No, dbo.Fund_Cen_AllottedTransactions.FILTER01 AS accountId, dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID, dbo.MFTS_Amc.Amc_Id, 
                            dbo.MFTS_Account.Holder_Id
                        FROM         dbo.Fund_Cen_AllottedTransactions INNER JOIN
                            dbo.MFTS_Amc ON dbo.Fund_Cen_AllottedTransactions.AMC_CODE = dbo.MFTS_Amc.Amc_Code INNER JOIN
                            dbo.MFTS_Fund ON dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.MFTS_Fund.Fund_Code LEFT OUTER JOIN
                            dbo.Fund_Cen_UnitholderBalance ON dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID = dbo.Fund_Cen_UnitholderBalance.UNITHOLDER_ID AND 
                            dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.Fund_Cen_UnitholderBalance.FUND_CODE LEFT OUTER JOIN
                            dbo.MFTS_Account ON dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID = dbo.MFTS_Account.Holder_Id AND 
                            dbo.Fund_Cen_AllottedTransactions.FILTER01 = dbo.MFTS_Account.Account_No
                        GROUP BY dbo.MFTS_Account.Ref_No, dbo.Fund_Cen_AllottedTransactions.FILTER01, dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID, dbo.MFTS_Amc.Amc_Id, dbo.MFTS_Account.Holder_Id
                        HAVING      (dbo.MFTS_Account.Ref_No IS NULL)`

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
async function UpdateUnitBalancenull(datarows){

    for (const [i, v] of datarows.entries()) {
        let RefNo = datarows[i].Ref_no
        const HolderNo              = datarows[i].UNITHOLDER_ID
        let accountID               = datarows[i].accountId
        let Amc_Id                  = datarows[i].Amc_Id
        let holder_null             = datarows[i].Holder_Id

        try{
            let statement = "UPDATE MFTS_ACCOUNT SET Holder_Id = @Holder_Id , Modify_Date = @modify ,Status_API =@Status_API  WHERE Account_No = @accountID AND  Amc_Id=@amcID "
            //   statement = "UPDATE MFTS_ACCOUNT SET \
            // Holder_Id =@HolderNo  \
            // Modify_Date = @modify \
            // WHERE WHERE Ref_No=@RefNo AND  Account_No= @cardNumber AND  Amc_Id=@Amc_id "

            let dateserver
            await getdatetime((dt=>{dateserver = dt}))
            await poolPromise.then(pool => {
            return pool.request()
            .input("accountID",        sql.VarChar(20),    accountID)
            .input("amcID",            sql.Int,            Amc_Id)
            .input("Holder_Id",         sql.VarChar(30),    HolderNo)
            .input("Status_API",         sql.VarChar(10),    "U")

            .input("modify",         sql.DateTime,    dateserver)
            .query(statement);

            }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            let hoderId 
            if (rowsAffected > 0){  
            console.log("Update Holder ID ON MFTS ACCOUNT "+ rowsAffected+" Row  Holder No is "+ HolderNo)
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
        // if(RefNo === null){ 
        //     // select mtfs accout 
        //     await  CheckMftsaccount(IDACCOUNTI, HolderNo ,Amc_Id,(refNo)=>{
        //         RefNo = refNo
        //     })

        //     if (RefNo === null){  // ถ้าไม่พบ ref ให้ทำการค้นที orderquery 
        //             await  getRefx("Ref_No",1 , (refx)=>{
        //                 RefNo =  refx
        //             })
        //             await insertMFtsAcccount(IDACCOUNTI, HolderNo ,Amc_Id, RefNo)
        //     }

        // }

    }

}

async function checkseqnull(RefNo,Fund_Id,TranDate_chk,tranTypecode ,callback){
    try{
       let statement = `SELECT isnull(max(Seq_No),0) +1 AS Seq_No FROM MFTS_TRANSACTION  
                             WHERE  REF_NO              = '${RefNo}' 
                             AND    Fund_Id             =  ${Fund_Id} 
                             `
        
        await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
    
        }).then(result => {
        //console.log(result);
        let seqNo
        let row = result.rowsAffected.toString();
        if( row > 0 ){
            // console.log(RefNo)
            // console.log(result.recordset[0])
            seqNo = result.recordset[0].Seq_No
        }
        
        sql.close();
        // console.log(result.recordset)
        return  callback(seqNo)
    
        }).catch(err => {
        console.log(err);
        sql.close();
        return   callback(err);
        });
    } catch (error) {
     let   result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }
}
async function checkseqnotoupdate(datarows, callback){
    for (const key in datarows) {
        try{
            let TranDate                = datarows[key].TRANS_DATE
            const tranTypeCode_db       = datarows[key].TRANS_CODE
            let RefNo                   = datarows[key].Ref_No
            let Fund_Id                 = datarows[key].Fund_Id
            let TranDate_chk ,tranTypecode
            TranDate_chk        = TranDate.substring(0,4) + "-" + TranDate.substring(4,6)  + "-" + TranDate.substring(6,8)
            switch (tranTypeCode_db) {
                case "SUB":
                    tranTypecode            = "B" 
                    break;
                case "RED":
                    tranTypecode            = "S" 
                    break;
                case "TRI":
                    tranTypecode            = "TI" 
                    break;
                case "TRO":
                    tranTypecode            = "TO" 
                    break;
                case "SWI":
                    tranTypecode            = "SI" 
                    break;
                case "SWO":
                    tranTypecode            = "SO" 
                    break;
                case  "XSI":
                    tranTypecode            = "TI" 
                    break;
                case  "XSO":
                    tranTypecode            = "TO" 
                    break;

                default:
                    break;
            }
            let seq_number = 0
            await checkseqnull(RefNo,Fund_Id,TranDate_chk,tranTypecode , (seqNo)=>{ seq_number = seqNo })

            if(seq_number === null){
                await getSeqNo(RefNo, Fund_Id, (sq_no)=> {  seq_number = sq_no  })
            }else{
                continue;
            }
            let statement = `UPDATE MFTS_Transaction
                            SET  Seq_No              = @Seq_No
                            WHERE  REF_NO              = '${RefNo}' 
                            AND    Fund_Id             =  ${Fund_Id} 
                            AND    Tran_Date           = '${TranDate_chk}'
                            AND    TranType_Code       = '${tranTypecode}`
            await poolPromise.then(pool => {
                return pool.request()
                    .input("Seq_No",        sql.Int,            seq_number)
                    .query(statement)
                }).then(result => {
                    let row = result.rowsAffected
                    let respx =  "UPDATE to  Seq_No from Null REF_No "+RefNo;
                    if(row > 0){console.log(respx);}
                    sql.close();

                }).catch(err => {
                    console.log(err);
                    sql.close();
                    // return callback(err);
                });
             
        }catch(error) {
            console.log(error);
            // return   callback(error);
            
        }

    }

}
async function getAccountIdSINK(HolderNo ,callback){
    try{
        let statement = ''
    }catch{

    }
}
async function traansctionkeymanual(callback){
    // let dateserver
    // await getdatetime((dt=>{dateserver = dt}))
    try{
        let datenow
        const today = new Date()
        const yesterday = new Date(today)
        let yt
        var chek_day = today.getDay();
        if (chek_day === 1){ 
            yt = yesterday.setDate(yesterday.getDate()-3) 
        }else{
            yt = yesterday.setDate(yesterday.getDate()-1) 
        }
        let today_date = ""
        let date_yt = new Date(yt)
        let dateyt = ("0"+date_yt.getDate()).slice(-2);
        let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
        let year_yt = date_yt.getFullYear();
        let dateyesterday = year_yt  +"-"+ month_yt  +"-"+ dateyt

        // const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        datenow = year +"-"+  month +"-"+  date
        
        // let dateyesterday = getDateYesterday()
        let statement = `UPDATE  MFTS_Transaction  
                         SET Status_Id  = @Status_Id, 
                         Modify_Date    = @Modify_Date  
                        WHERE transactionId  IS NULL 
                        AND ( Create_Date >  '${dateyesterday}' AND Create_Date < '${datenow}' )
                        `
        // console.log(statement)
        let dateserver
        await getdatetime((dt=>{dateserver = dt}))
        await poolPromise.then(pool => {
        return pool.request() 
            .input("Status_Id",            sql.Int,             9) 
            .input("Modify_Date",          sql.DateTime,        dateserver) 
            .query(statement);
            
        }).then(result => {
            // console.log()
            let rowsAffected = result.rowsAffected.toString()
            // let hoderId 
            if (rowsAffected > 0){  
                console.log("Update MFTS_TRANSCATION User Key Manual  "+ rowsAffected+" Row  ")
            }
            sql.close();
            return callback(result)
        }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err)
        });
  
    }catch (error) {
        // result = "ERROR Catch"
         console.log(error);
        return callback(error)
    }
         
    return  callback("")
}
async function    CountUnibalance(RefNo,Fund_Id ,unit_balance_last ,tranTypecode  ,  callback){
    let unit_balance
    switch (tranTypecode) {
        case "B":
            unit_balance
            break;
        case "S":
            unit_balance
            break;
        case "SO":
            unit_balance
            break;
        case "SI":
            unit_balance
            break;
        case "TI":
            unit_balance
            break;
        case "TO":
            unit_balance
            break;
        
        default:
            unit_balance = 0.0000
            break;
    }

    return callback(unit_balance)
}
async function getDataWaitingForUnitbalance(callback){
    try 
    {
    let data_row = 0
    let statement = `SELECT        TOP (100) PERCENT dbo.MFTS_Fund.Fund_Id, dbo.Fund_Cen_AllottedTransactions.TRANS_DATE, dbo.Fund_Cen_AllottedTransactions.AMC_CODE, dbo.Fund_Cen_AllottedTransactions.FILTER01, 
    dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID, dbo.Fund_Cen_AllottedTransactions.TRANS_CODE, dbo.Fund_Cen_AllottedTransactions.FUND_CODE, dbo.Fund_Cen_AllottedTransactions.AMOUNT, 
    dbo.Fund_Cen_AllottedTransactions.UNIT, dbo.Fund_Cen_AllottedTransactions.EFFECTIVE_DATE, dbo.Fund_Cen_AllottedTransactions.ALLOTED_AMOUNT, dbo.Fund_Cen_AllottedTransactions.ALLOTED_UNIT, 
    dbo.Fund_Cen_AllottedTransactions.ALLOTED_NAV, dbo.Fund_Cen_AllottedTransactions.ALLOTMENT_DATE, dbo.Fund_Cen_AllottedTransactions.NAV_DATE, dbo.Fund_Cen_AllottedTransactions.IC_CODE, 
    dbo.Fund_Cen_AllottedTransactions.timestampx, dbo.Fund_Cen_AllottedTransactions.flx, dbo.Fund_Cen_AllottedTransactions.APPROVAL_CODE, dbo.Fund_Cen_AllottedTransactions.STATUS, 
    dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID, dbo.MFTS_Amc.Amc_Id, dbo.Fund_Cen_AllottedTransactions.NET_UNITHOLDER_REF_NO, dbo.Fund_Cen_AllottedTransactions.OVERRIDE_RISK_FLAG, 
    dbo.Fund_Cen_AllottedTransactions.OVERRIDE_FX_RISK_FLAG, dbo.Fund_Cen_AllottedTransactions.REDEMPTION_TYPE, dbo.Fund_Cen_AllottedTransactions.FILTER02, dbo.Fund_Cen_AllottedTransactions.FILTER03, 
    dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE, dbo.Fund_Cen_AllottedTransactions.BANK_CODE, dbo.Fund_Cen_AllottedTransactions.BANK_ACCOUNT, dbo.Fund_Cen_AllottedTransactions.CHEQUE_NO, 
    dbo.Fund_Cen_AllottedTransactions.CHEQUE_DATE, dbo.Fund_Cen_AllottedTransactions.IC_LICENSE, dbo.Fund_Cen_AllottedTransactions.BRANCH_NO, dbo.Fund_Cen_AllottedTransactions.CHANNEL, 
    dbo.Fund_Cen_AllottedTransactions.FORCE_ENTRY, dbo.Fund_Cen_AllottedTransactions.LTF_CONDITION, dbo.Fund_Cen_AllottedTransactions.REASON_TOSELL_LTF_RMF, 
    dbo.Fund_Cen_AllottedTransactions.RMF_CAPITAL_WHTAX_CHOICE, dbo.Fund_Cen_AllottedTransactions.RMF_CAPITAL_REDEEM_CHOICE, dbo.Fund_Cen_AllottedTransactions.AUTO_REDEEM_CODE, 
    dbo.Fund_Cen_AllottedTransactions.AMC_ORDER_REF, dbo.Fund_Cen_AllottedTransactions.FEE, dbo.Fund_Cen_AllottedTransactions.WH_TAX, dbo.Fund_Cen_AllottedTransactions.VAT, 
    dbo.Fund_Cen_AllottedTransactions.BROKERAGE_FEE, dbo.Fund_Cen_AllottedTransactions.WH_TAX_LTF_RTF, dbo.Fund_Cen_AllottedTransactions.AMC_PAY_DATE, 
    dbo.Fund_Cen_AllottedTransactions.REGISTER_TRANS_FLAG, dbo.Fund_Cen_AllottedTransactions.SALE_ALL_UNIT_FLAG, dbo.Fund_Cen_AllottedTransactions.SETTLE_BANK_CODE, 
    dbo.Fund_Cen_AllottedTransactions.SETTLE_BANK_ACCOUNT, dbo.Fund_Cen_AllottedTransactions.REJECT_REASON, dbo.Fund_Cen_AllottedTransactions.CHQ_BRANCH, dbo.Fund_Cen_AllottedTransactions.TAX_INVOICE_NO, 
    dbo.Fund_Cen_AllottedTransactions.AMC_SWITCHING_ORDER_NO, dbo.Fund_Cen_AllottedTransactions.BROKERAGE_FEE_VAT, dbo.Fund_Cen_AllottedTransactions.CREDIT_CARD_ISSUER, 
    dbo.Fund_Cen_AllottedTransactions.COLLATERAL_AMT, dbo.Fund_Cen_AllottedTransactions.FILTER05, dbo.Fund_Cen_AllottedTransactions.FILTER06, dbo.Fund_Cen_AllottedTransactions.FILTER04, dbo.MFTS_Account.Ref_No, 
    dbo.MFTS_Account.Holder_Id,
        (SELECT        TOP (1) Id
          FROM            dbo.MFTS_SalesCode
          WHERE        (License_Codenew = dbo.Fund_Cen_AllottedTransactions.IC_CODE) OR
                                    (License_Code = dbo.Fund_Cen_AllottedTransactions.IC_LICENSE)) AS mktid
FROM            dbo.Fund_Cen_AllottedTransactions INNER JOIN
    dbo.MFTS_Amc ON dbo.Fund_Cen_AllottedTransactions.AMC_CODE = dbo.MFTS_Amc.Amc_Code INNER JOIN
    dbo.MFTS_Fund ON dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.MFTS_Fund.Fund_Code INNER JOIN
    dbo.MFTS_Account ON dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID = dbo.MFTS_Account.Holder_Id AND dbo.Fund_Cen_AllottedTransactions.FILTER01 = dbo.MFTS_Account.Account_No
WHERE        (dbo.Fund_Cen_AllottedTransactions.STATUS = 'WAITING')
ORDER BY dbo.MFTS_Fund.Fund_Id
`
                    //WHERE dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID = '1412209280001634'
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
async function selectUnitbalance(datarows , callback){
    for (const key in datarows) {
        try{
            
            let RefNo                   = datarows[key].Ref_No
            let Fund_Id                 = datarows[key].Fund_Id
            if(RefNo === undefined || RefNo === null) {continue;}
            let statement = `SELECT   Fund_Id, Ref_No, Submit_Unit, Confirm_Unit, NotClearing_Unit, Pledge_Unit, Modify_Date, IT_UPDATE, APIstatus, FUNDCODEI, UNITHOLDERI
                            FROM MFTS_UnitBalance  WHERE Fund_Id =${Fund_Id} AND Ref_No =${RefNo}`

            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
            
                }).then(result => {
                //console.log(result);
                let data_row = result.rowsAffected.toString();
                if(data_row == 0 ){
                    console.log("data not found unitbalance  ref_no : "+ RefNo +"  fund id :"+ Fund_Id)
                    insertunitbalance(RefNo,Fund_Id)
                }
                
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
}
async function insertunitbalance(RefNo,Fund_Id){
    let statement = `INSERT INTO MFTS_UnitBalance(Fund_Id ,Ref_No) VALUES(@Fund_Id ,@Ref_No)`
    try{

        let dateserver
        await getdatetime((dt=>{dateserver = dt}))
        await poolPromise.then(pool => {
        return pool.request() 
            .input("Fund_Id",            sql.Int,             Fund_Id) 
            .input("Ref_No",            sql.VarChar(12),        RefNo) 
            .query(statement);
            
        }).then(result => {
            // console.log()
            let rowsAffected = result.rowsAffected.toString()
            // let hoderId 
            if (rowsAffected > 0){  
                console.log("Insert MFTS_UnitBalance  Manual  "+ rowsAffected+" Row  ")
            }
            sql.close();
            // return callback(result)
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
async function getDataTransactiondate (callback){
    try 
    {
    let data_row = 0
    let statement = `SELECT TOP (100) PERCENT dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID, 
                        dbo.Fund_Cen_AllottedTransactions.FILTER01 AS id_card, 
                        dbo.Fund_Cen_AllottedTransactions.STATUS AS status_api, 
                        CASE WHEN Status_Id = 5 THEN 'Waiting' WHEN Status_Id = 7 THEN 'Allot'
                        END AS status_wr, dbo.MFTS_Transaction.Fund_Id,
                        dbo.MFTS_Transaction.Ref_No, dbo.Account_Info.Title_Name_T,
                        dbo.Account_Info.First_Name_T, dbo.Account_Info.Last_Name_T, 
                        dbo.MFTS_UnitBalance.Confirm_Unit,dbo.MFTS_Transaction.Unit_Balance, 
                        dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID, 
                        dbo.Fund_Cen_AllottedTransactions.AMC_CODE, 
                        dbo.Fund_Cen_AllottedTransactions.FUND_CODE,dbo.Fund_Cen_AllottedTransactions.TRANS_CODE,
                            (SELECT TOP (1) Id
                        FROM dbo.MFTS_SalesCode
                        WHERE (License_Codenew = dbo.Fund_Cen_AllottedTransactions.IC_CODE)
                                OR
                            (License_Code = dbo.Fund_Cen_AllottedTransactions.IC_LICENSE))
                        AS mktid
                        ,dbo.MFTS_Transaction.Status_Id
                    FROM dbo.Account_Info RIGHT OUTER JOIN
                        dbo.MFTS_UnitBalance RIGHT OUTER JOIN
                        dbo.Fund_Cen_AllottedTransactions LEFT OUTER JOIN
                        dbo.MFTS_Transaction ON 
                        dbo.Fund_Cen_AllottedTransactions.TRANS_CODE = dbo.MFTS_Transaction.TRANTYPECODEX
                        AND 
                        dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID = dbo.MFTS_Transaction.transactionId
                        ON 
                        dbo.MFTS_UnitBalance.Fund_Id = dbo.MFTS_Transaction.Fund_Id AND 
                        dbo.MFTS_UnitBalance.Ref_No = dbo.MFTS_Transaction.Ref_No ON 
                        dbo.Account_Info.Cust_Code = dbo.Fund_Cen_AllottedTransactions.FILTER01
                    ORDER BY dbo.MFTS_Transaction.transactionId
                    `
                     
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
async function BatUpdateUnitBalance (callback){
    try 
    {
    let data_row = 0
    let statement = `SELECT TOP (100) 
                        PERCENT dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID, 
                        dbo.Fund_Cen_AllottedTransactions.STATUS, 
                        dbo.Fund_Cen_UnitholderBalance.UNIT_BALANCE, 
                        dbo.Fund_Cen_AllottedTransactions.TRANS_CODE, 
                        dbo.Fund_Cen_AllottedTransactions.FUND_CODE,
                        dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID, 
                        dbo.Fund_Cen_UnitholderBalance.ACCOUNT_ID
                    FROM dbo.Fund_Cen_AllottedTransactions INNER JOIN
                        dbo.Fund_Cen_UnitholderBalance ON 
                        dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.Fund_Cen_UnitholderBalance.FUND_CODE
                        AND 
                        dbo.Fund_Cen_AllottedTransactions.FILTER01 = dbo.Fund_Cen_UnitholderBalance.ACCOUNT_ID
                        AND 
                        dbo.Fund_Cen_AllottedTransactions.AMC_CODE = dbo.Fund_Cen_UnitholderBalance.AMC_CODE
                        AND 
                        dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID = dbo.Fund_Cen_UnitholderBalance.UNITHOLDER_ID
                    WHERE (dbo.Fund_Cen_AllottedTransactions.TRANS_CODE <> 'SWO') AND 
                        (dbo.Fund_Cen_AllottedTransactions.STATUS = 'ALLOTTED')
                    ORDER BY dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID
                    `
                     
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //console.log(result);
        data_row = result.rowsAffected.toString();
        console.log("result data update unitblance : "+ data_row +" row")
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
async function updataUnintbalaceTransaction(datarows){
    for (const key in datarows) {
        try{
            
            let TRANSACTION_ID              = datarows[key].TRANSACTION_ID
            let UNIT_BALANCE                 = datarows[key].UNIT_BALANCE
            let TRANS_CODE                 = datarows[key].TRANS_CODE
           
             if(TRANS_CODE === null){continue;}
            let statement = `Update MFTS_TRANSACTION SET Unit_Balance = ${UNIT_BALANCE} WHERE transactionId = '${TRANSACTION_ID}' AND TRANTYPECODEX = '${TRANS_CODE}' `
            console.log(statement)
            // await new sql.ConnectionPool(config).connect().then(pool => {
            //     return pool.request()
            //     .query(statement);
            
            //     }).then(result => {
            //     //console.log(result);
            //     let data_row = result.rowsAffected.toString();
            //     sql.close();
            //     // console.log(result.recordset)
            //     return  callback(result.recordset) 
            
            //     }).catch(err => {
            //     console.log(err);
            //     sql.close();
            //     return   callback(err);
            //     });
            } catch (error) {
                result = "ERROR Catch"
                console.log(error);
                return   callback(error);
            }
    }
}
async function logDataTransactiondate(datarows){
    for (const key in datarows) {
        try{
            let continue_                   = ""
            let TRANSACTION_ID              = null
            let UNIT_BALANCE                = null
            let TRANS_CODE                  = null
            let status_api                  = null
            let Status_Id                   = null
            let Fund_Id                     = null
            let Ref_No                      = null
            let Confirm_Unit                = null
             TRANSACTION_ID              = datarows[key].TRANSACTION_ID
             UNIT_BALANCE                = datarows[key].UNIT_BALANCE
             TRANS_CODE                  = datarows[key].TRANS_CODE
             status_api                  = datarows[key].status_api
             Status_Id                   = datarows[key].Status_Id
             Fund_Id                     = datarows[key].Fund_Id
             Ref_No                      = datarows[key].Ref_No
             Confirm_Unit                = datarows[key].Confirm_Unit

            if(status_api === 'ALLOTTED' && status_wr == 7){continue_ = 1}
            if(status_api === 'WAITING' && status_wr == 5){continue_ = 1}
            if (Ref_No !== null){continue_ = 1}
            if (Fund_Id !== null){continue_ = 1} 
            if (Confirm_Unit !== null){continue_ = 1}
            if (continue_==1){continue;} 
            let statement = `INSERT MFTS_TRANSACTION_Logapi  (TRANSACTION_ID, ,Status_fundconn , Status_id ,Fund_Id ,Ref_No ,Confirm_Unit) 
                             VALUES 
                             (@TRANSACTION_ID ,@status_fundconn ,@status_id,@Fund_Id,@Ref_No,@Confirm_Unit)
                             `
            // console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .input("TRANSACTION_ID",            sql.VarChar(20),            TRANSACTION_ID) 
                .input("status_fundconn",           sql.VarChar(50),            status_api) 
                .input("status_id",                 sql.Int,                    Status_Id) 
                .input("Fund_Id",                   sql.Int,                    Fund_Id) 
                .input("Ref_No",                    sql.VarChar(12),            Ref_No) 
                .input("Confirm_Unit",              sql.Numeric(18,4),          Confirm_Unit) 
                .query(statement);
            
                }).then(result => {
                //console.log(result);
                let data_row = result.rowsAffected.toString();
                sql.close();
                // console.log(result.recordset)
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
    }
}
async function getlastbalance(ref_id,fund_id ,TranDate,callback){
    try 
        {
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let datenow = year +"-"+  month +"-"+  date
        let data_row = 0
        let TranDate_chk        = TranDate.substring(0,4) + "-" + TranDate.substring(4,6)  + "-" + TranDate.substring(6,8)
        let statement = `SELECT top(1) Unit_Balance  FROM MFTS_Transaction
                            WHERE (Ref_No = '${ref_id}') AND (Fund_Id = ${fund_id}) AND 
                                (Status_Id = 7) 
                            ORDER BY Seq_No DESC
                        `
        // console.log(statement)             AND (TRAN_DATE < '${TranDate_chk}')  
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //console.log(result);
        let unitbalace = 0.0000
        data_row = result.rowsAffected.toString();
        if (data_row > 0){unitbalace = result.recordset[0].Unit_Balance} //result.recordset[0].Seq_No
        sql.close();
        // console.log(result.recordset)
        return  callback(unitbalace) 
  
      }).catch(err => {
        console.log(err);
        sql.close();
        return   callback(err);
      });
    } catch (error) {
    //   result = "ERROR Catch"
      console.log(error);
      return   callback(error);
    }
}
async function checkunitbalance(ref_id,fund_id,unit_balance ,callback){
    try 
        {
        let data_row = 0
        let statement_unit = "" , flag_db
        let statement = `SELECT   Fund_Id, Ref_No, Submit_Unit, Confirm_Unit, 
                            NotClearing_Unit, Pledge_Unit, Modify_Date, IT_UPDATE, APIstatus, 
                            FUNDCODEI, UNITHOLDERI, UNIT_BALANCE
                        FROM MFTS_UnitBalance
                        WHERE (Ref_No = '${ref_id}') AND (Fund_Id = ${fund_id})
                        `
                     
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //console.log(result);
        let unitbalace = 0.0000
        data_row = result.rowsAffected.toString();
        if (data_row > 0){
             // update
             flag_db = "U"
             //statement_unit =`UPDATE MFTS_UnitBalance SET Confirm_Unit WHERE (Ref_No = @reref_id) AND (Fund_Id = @Fund_Id) `
        }else{
            // insert
            flag_db = "I"
            //statement_unit = `INSERT INTO MFTS_UnitBalance (Ref_No,Fund_Id ,Confirm_Unit) VALUES (@reref_id ,@Fund_Id ,@Confirm_Unit)`
        }  
        sql.close();
        // console.log(result.recordset)
        return  callback(flag_db) 
  
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

async function setMFTSUnitbalance(ref_id,fund_id,unit_balance ,flag_db,FUND_CODE,UNITHOLDER_ID,callback){
    let statement
    let dateserver
    await getdatetime((dt=>{dateserver = dt}))
    //IT Request 230206
    let UnitBalnaceDiff=0.0000 ,cenUnitbalnce=0.0000
    await getCenUnitbalancce(FUND_CODE,UNITHOLDER_ID ,(cenunit=>{cenUnitbalnce =cenunit }))
    // console.log("cen unit: "+cenUnitbalnce)
    // console.log("unit: "+ unit_balance)
    let unitblance_or = unit_balance
    if(cenUnitbalnce > 0){
        UnitBalnaceDiff =  unit_balance - cenUnitbalnce
        if(unit_balance > cenUnitbalnce){UnitBalnaceDiff = unit_balance - cenUnitbalnce}
        if(unit_balance < cenUnitbalnce){UnitBalnaceDiff =  cenUnitbalnce - unit_balance}
        unit_balance = cenUnitbalnce
    }
    if(UnitBalnaceDiff != 0){ await unitbalaceDiffToLog ("UnitBalance diff : "+UnitBalnaceDiff+" Ref No "+ref_id+" ","Unit Diff",UNITHOLDER_ID,FUND_CODE,cenUnitbalnce,unitblance_or, fund_id) }
    try{
        if (flag_db ==="U"){
            // update
            statement =`UPDATE MFTS_UnitBalance SET Confirm_Unit=@unit_balance 
                        ,Modify_Date=@Modify_Date
                        ,APIstatus =@APIstatus
                        ,FUNDCODEI=@FUNDCODEI ,UNITHOLDERI=@UNITHOLDERI
                        ,UNIT_BALANCE_DIFF=@UNIT_BALANCE_DIFF
                        WHERE (Ref_No = @ref_id) AND (Fund_Id = @Fund_Id) `
                        //,UNIT_BALANCE=@UNITBALANCE 
        }else{
            // insert
            statement = `INSERT INTO MFTS_UnitBalance (Ref_No,Fund_Id ,Confirm_Unit,UNIT_BALANCE,Modify_Date,APIstatus,FUNDCODEI,UNITHOLDERI,UNIT_BALANCE_DIFF) 
                            VALUES (@ref_id ,@Fund_Id ,@unit_balance,@unit_balance , @Modify_Date, @APIstatus,@FUNDCODEI,@UNITHOLDERI,@UNIT_BALANCE_DIFF)`
                            //@UNITBALANCE
        }

        await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .input("ref_id" ,           sql.NVarChar(12) ,          ref_id)
        .input("Fund_Id" ,          sql.Int  ,                  fund_id)
        .input("unit_balance" ,     sql.Numeric(18,4) ,         unit_balance)
        .input("Modify_Date"        , sql.DateTime,             dateserver)
        //.input("UNITBALANCE"       , sql.NVarChar(30),         unit_balance)
        .input("APIstatus"         , sql.NVarChar(10),           flag_db)
        .input("FUNDCODEI"         , sql.NVarChar(50),           FUND_CODE)
        .input("UNITHOLDERI"        , sql.NVarChar(30),          UNITHOLDER_ID) //UNIT_BALANCE_DIFF
        .input("UNIT_BALANCE_DIFF" ,     sql.Numeric(18,4) ,    UnitBalnaceDiff)
        .query(statement);
    
        }).then(result => {
        //console.log(result);
        let statement_unit = ""
        let data_row = result.rowsAffected.toString(); 
        if (data_row > 0){
                // update
                statement_unit = flag_db+ "  mfts_unitbalance Success"
        }  
        sql.close();
        // console.log(result.recordset)
        return  callback(statement_unit) 

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
async function setUnitbalanceMftsUnitbalance(datarows){
    let count_row = datarows.length;
    // console.log("result : " +count_row)
    if(count_row == 0 ){return 0} 
    for (const key in datarows) {
        try{
            let ref_id                              =datarows[key].Ref_no
            let fund_id                             =datarows[key].Fund_Id
            let Confirm_Unit                        =datarows[key].UNIT_BALANCE
            let dateserver
            await getdatetime((dt=>{dateserver = dt}))                          
            let flag_db                             ="U"
            let FUND_CODE                           =datarows[key].FUND_CODE
            let UNITHOLDER_ID                       =datarows[key].UNITHOLDER_ID
            let statement =`UPDATE MFTS_UnitBalance SET Confirm_Unit=@Confirm_Unit 
                            ,Modify_Date=@Modify_Date
                            ,APIstatus =@APIstatus
                            ,FUNDCODEI=@FUNDCODEI ,UNITHOLDERI=@UNITHOLDERI 
                            WHERE (Ref_No = @ref_id) AND (Fund_Id = @Fund_Id)`

            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .input("ref_id" ,           sql.NVarChar(12) ,          ref_id)
                .input("Fund_Id" ,          sql.Int  ,                  fund_id)
                .input("Confirm_Unit" ,     sql.Numeric(18,4) ,         Confirm_Unit)
                .input("Modify_Date"        , sql.DateTime,             dateserver) 
                .input("APIstatus"         , sql.NVarChar(10),           flag_db)
                .input("FUNDCODEI"         , sql.NVarChar(50),           FUND_CODE)
                .input("UNITHOLDERI"        , sql.NVarChar(30),          UNITHOLDER_ID) 
                .query(statement);
            
                }).then(result => {
                //console.log(result);
                let statement_unit = ""
                let data_row = result.rowsAffected.toString(); 
                if (data_row > 0){
                        // update
                        statement_unit = flag_db+ "  mfts_unitbalance Sucess"
                }  
                sql.close();
                // console.log(result.recordset)
                return  callback(statement_unit) 
        
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

}
async function selectDataTologUnitbalance(callback){
    let statement = `SELECT dbo.V_PREPARE_UNITBALANCE.TRANSACTION_ID, 
                        dbo.V_PREPARE_UNITBALANCE.STATUS, 
                        dbo.V_PREPARE_UNITBALANCE.UNIT_BALANCE, 
                        dbo.V_PREPARE_UNITBALANCE.TRANS_CODE, 
                        dbo.V_PREPARE_UNITBALANCE.FUND_CODE, 
                        dbo.V_PREPARE_UNITBALANCE.UNITHOLDER_ID, 
                        dbo.V_PREPARE_UNITBALANCE.ACCOUNT_ID, 
                        dbo.V_PREPARE_UNITBALANCE.Fund_Id, 
                        dbo.V_PREPARE_UNITBALANCE.Amc_Id, 
                        dbo.V_PREPARE_UNITBALANCE.Ref_no, 
                        dbo.MFTS_UnitBalance.Confirm_Unit
                    FROM dbo.V_PREPARE_UNITBALANCE LEFT OUTER JOIN
                        dbo.MFTS_UnitBalance ON 
                        dbo.V_PREPARE_UNITBALANCE.Fund_Id = dbo.MFTS_UnitBalance.Fund_Id
                        AND 
                        dbo.V_PREPARE_UNITBALANCE.Ref_no = dbo.MFTS_UnitBalance.Ref_No
                    WHERE (dbo.V_PREPARE_UNITBALANCE.STATUS = 'ALLOTTED')  `  
              //console.log(statement) AND dbo.V_PREPARE_UNITBALANCE.TRANSACTION_ID ='1412301050004568'
  try
  { 
    await new sql.ConnectionPool(config).connect().then(pool => { 
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //  console.log("DATA NAV " +result.rowsAffected);
        // data_nav = result.recordset;
        sql.close();
         
        return   callback(result.recordset);  
  
      }).catch(err => {
        console.log(err);
       sql.close();
        return   callback(err);
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      return callback(error)
  }

}
async function logDataUnitbalance(datarows ,callback){
    let count_row = datarows.length;
    console.log("result : " +count_row)
    let flag_unit= 0
    for (const key in datarows) {
        try{
            
            let RefNo                       = datarows[key].Ref_no
            let Fund_Id                     = datarows[key].Fund_Id
            let UNIT_BALANCE                = datarows[key].UNIT_BALANCE
            let FUND_CODE                   = datarows[key].FUND_CODE
            let UNITHOLDER_ID               = datarows[key].UNITHOLDER_ID
            let Confirm_Unit                = datarows[key].Confirm_Unit
            let TRANSACTION_ID              = datarows[key].TRANSACTION_ID
            let TRANS_CODE                  = datarows[key].TRANS_CODE
            let STATUS                      = datarows[key].STATUS
            let ACCOUNT_ID                  = datarows[key].ACCOUNT_ID
            let Amc_Id                      = datarows[key].Amc_Id
            let modify_date
            if(Confirm_Unit == UNIT_BALANCE){continue;}
            await getdatetime( (dt) =>{modify_date = dt  })
           
            let  statement = `INSERT INTO MFTS_UnitBalance_LogDataDiff (TRANSACTION_ID, STATUS,  UNIT_BALANCE, Confirm_Unit, Ref_no, Fund_Id, TRANS_CODE, 
                                FUND_CODE, UNITHOLDER_ID, ACCOUNT_ID, Amc_Id, Created_Date)
                              VALUES (@TRANSACTION_ID, @STATUS,  @UNIT_BALANCE, @Confirm_Unit, @Ref_no, @Fund_Id, @TRANS_CODE, 
                                @FUND_CODE, @UNITHOLDER_ID, @ACCOUNT_ID, @Amc_Id, @Created_Date)`
            // console.log(statement) 
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .input("Ref_no"             , sql.NVarChar(50),             RefNo)
                .input("Fund_Id"            , sql.Int,                      Fund_Id)
                .input("Confirm_Unit"       , sql.Decimal(18,4),            Confirm_Unit)
                .input("UNIT_BALANCE"       , sql.NVarChar(50),             UNIT_BALANCE)
                .input("Created_Date"       , sql.DateTime,                 modify_date)
                .input("TRANSACTION_ID"     , sql.NVarChar(20),             TRANSACTION_ID)
                .input("FUND_CODE"          , sql.NVarChar(50),             FUND_CODE)
                .input("UNITHOLDER_ID"      , sql.NVarChar(50),             UNITHOLDER_ID)
                .input("STATUS"             , sql.NVarChar(10),             STATUS)
                .input("TRANS_CODE"         , sql.NVarChar(10),             TRANS_CODE)
                .input("ACCOUNT_ID"        , sql.NVarChar(20),              ACCOUNT_ID)
                .input("Amc_Id"             , sql.Int,                      Amc_Id)
                .query(statement);
            
                }).then(result => {
                
                let data_row = result.rowsAffected.toString();
                if(data_row > 0 ){
                    console.log("INSERT MFTS_UnitBalance_LogDataDiff =>  ref no : "+ RefNo+" Fund_Id: "+Fund_Id + " TRANSACTION ID: "+ TRANSACTION_ID)
                    flag_unit = 1
                }
                
                sql.close();
                // console.log(result.recordset)
                // return  callback(result.recordset) 
            
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
    return callback(flag_unit)
}
async function getDataReconcile(callback){
    // get data api transaction
    let txtapi = ""
    try{
        
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let datenow = year +"-"+  month +"-"+  date

        let statement =`SELECT COUNT(*) as TOTAL 
                        ,(SELECT COUNT(*) as row FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE STATUS= 'ALLOTTED') as ALLOTTED 
                        ,(SELECT COUNT(*) as row FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE STATUS= 'WAITING')as WAITING 
                        ,(SELECT COUNT(*) as row FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE (STATUS <> 'WAITING') AND (STATUS <> 'ALLOTTED')) AS REJECT
                        ,(SELECT timestampx   FROM FUND_CEN_ALLOTTEDTRANSACTIONS GROUP BY timestampx) as timestamp   
                        FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE timestampx >='${datenow}'`
                         //SELECT * FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE timestampx >='2023-01-24'
        let datacountApi = 0
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            let txt = ""
            if(row > 0){
                let date_ob = new Date(result.recordset[0].timestamp)
                let date = ("0"+date_ob.getDate()).slice(-2); 
                let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
                let year = date_ob.getFullYear();
                let timestampx =   date +" - "+month +" - "+ year 
                let title = "ข้อมูล API" 
                // let timestampx = result.recordset[0].timestamp.substring(6,8) +'/' + EFFECTIVEDATEx.substring(4,6) +'/' + result.recordset[0].timestamp.substring(0,4) 
                txtapi = `<tr>
                          <td> ${title} </td> 
                          <td align="right"> ${result.recordset[0].ALLOTTED} </td>
                          <td align="right"> ${result.recordset[0].WAITING} </td>
                          <td align="right"> ${result.recordset[0].REJECT} </td> 
                          <td align="right">${result.recordset[0].TOTAL}</td>
                          <td></td>
                          <td></td>
                         </tr>
                            `
            }else{
                txtapi = `<tr><td>${title}</td><td> - </td><td> - </td><td> -</td><td> - </td></tr>`
            }
            //  console.log("DATA NAV " +result.rowsAffected);
            console.log("ข้อมูล APi Transaction  " +result.recordset[0].TOTAL);
            // data_nav = result.recordset;
            sql.close();
        //  txtapi.push(txt)   
          
    
        }).catch(err => {
            console.log(err);
        sql.close();
        // return   callback(err);
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
    // get data tran
    let tranid = ''
    let data_FUND_CEN_ALLOTTEDTRANSACTIONS 
    try{
        
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let datenow = year +"-"+  month +"-"+  date

        let statement =`SELECT  TRANSACTION_ID ,TRANS_CODE FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE timestampx  >='${datenow}'`
                         //SELECT * FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE timestampx >='2023-01-24'
        let datacountApi = 0
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            let txt = ""
            if(row > 0){
                data_FUND_CEN_ALLOTTEDTRANSACTIONS = result.recordset
            }
             
            // data_nav = result.recordset;
            sql.close();
        //  txtapi.push(txt)   
          
    
        }).catch(err => {
            console.log(err);
        sql.close();
        // return   callback(err);
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
     
    await datatransidcen(data_FUND_CEN_ALLOTTEDTRANSACTIONS ,(tran)=>tranid = tran)
    // console.log(tranid)
    let txttran='' ,txtlog ='' ,txtnav='' ,txtdatareconcile ,datatran ,datatranx
    await dataMftsTranForReconcile(tranid ,(txt)=>{txttran= txt})
    await datalogTranReport((txterr)=>{txtlog = txterr})
    await getDataTransactiondate((result)=>{ datatran= result})
    // await dataTrantolog(datatran,(datastran)=>{datatranx = datastran})
    // console.log(datatranx)
    await datatranconciletotxt(datatran,(x)=>{txtdatareconcile = x})
    // console.log(txtdatareconcile)
    let tableReconcile = `<h1>รายการเปรียบเทียบข้อมูลคำสั่งซื้อเข้าระบบ (Reconcile) </h1>
                    <table border="1" >
                    <tr> 
                        <td>          </td>
                        <td width="50"> อนุมัติ </td>
                        <td width="50"> รออนุมัติ </td>
                        <td width="50"> ยกเลิก </td>
                        <td width="50"> รวมทั้งสิ้น   </td>
                        <td width="50"> Nav เข้าระบบ   </td>
                        <td width="50"> Nav ปรับปรุง   </td>
                    </tr>
                    ${txtapi}
                    ${txttran}
                </table> 
                ${txtnav}
                <br><br><br>
                ${txtlog}
                <br>
                ${txtdatareconcile}
                `
    return   callback(tableReconcile); 
}
async function datalogTranReport(callback){
    let datasError = ""
    let txt = ""
   
    try{
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let datenow = year +"-"+  month +"-"+  date
        let statement = `SELECT * FROM Fund_Errlog_TransferData WHERE TimeLines >= '${datenow}'`
        console.log(statement)
    await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
        
        }).then(result => {
            let row = result.rowsAffected
            let txt = ""
            if(row > 0){
                datasError = result.recordset
            }else{
                return callback("<p>  </p>")
            }
             
            // data_nav = result.recordset;
            sql.close();
        //  txtapi.push(txt)   
          
    
        }).catch(err => {
            console.log(err);
        sql.close();
        // return   callback(err);
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
    if(datasError.length == 0 ){
        return callback("<h1> ไม่พบ Error </h1>")
    }
    let i = 1
    for (const key in datasError) {
        txt += `<tr>
                    <td>${i} </td>
                    <td>${datasError[key].TRANSACTION_ID} </td>
                    <td>${datasError[key].FUND_CODE} </td>
                    <td>${datasError[key].HolderId} </td>
                    <td>${datasError[key].Unit_Balance} </td>
                    <td>${datasError[key].Descriptions} </td>
                    <td>${datasError[key].Status} </td>
                    
                </tr> `
        i ++;
    }
    let table =`    <h1> รายการคำสั่งซื้อที่ยังไม่เข้าระบบ </h1><br>
                    <table border="1">
                    <tr>
                    <td> No. </td>
                    <td> Transaction ID </td>
                    <td> FUND_CODE </td>
                    <td> HolderId </td>
                    <td> Unit_Balance </td>
                    <td> Descriptions </td>
                    <td> Status </td>
                    </tr>
                    ${txt}
                </table>`
    
    return callback(table)
}
async function dataMftsTranForReconcile(tranid ,callback){
    let txttran = ""
    try{
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let datenow = year +"-"+  month +"-"+  date
        let statement = `SELECT  COUNT(*) as TOTAL 
                                    ,(SELECT COUNT(*) FROM MFTS_Transaction WHERE Status_Id = 7 AND (${tranid})) AS ALLOTTED
                                    ,(SELECT COUNT(*) FROM MFTS_Transaction WHERE Status_Id = 5 AND (${tranid})) AS WAITING
                                    ,(SELECT COUNT(*) FROM MFTS_NavTable WHERE CreateDate >= '${datenow}') AS Nav_create_no 
									,(SELECT COUNT(*)  FROM MFTS_NavTable WHERE Modify_Date >= '${datenow}') AS Nav_update_no 
                                    FROM MFTS_Transaction WHERE ${tranid} `
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            //let txt = ""
            if(row > 0){
                txttran = `<tr> <td> ข้อมูลคำสั่งซื้อ นำเข้าระบบ </td>
                            <td  align="right"> ${result.recordset[0].ALLOTTED} </td> 
                            <td  align="right"> ${result.recordset[0].WAITING} </td> 
                            <td ></td> 
                            <td  align="right"> ${result.recordset[0].TOTAL} </td>
                            <td  align="right"> <h3> ${result.recordset[0].Nav_create_no} </h3></td>
                            <td  align="right"> <h3>${result.recordset[0].Nav_update_no} </h3> </td> 
                            </tr>
                  `
            }
             
            // data_nav = result.recordset;
            sql.close();
        //  txtapi.push(txt)   
          
    
        }).catch(err => {
            console.log(err);
        sql.close();
        // return   callback(err);
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
    return callback(txttran)
}
async function datatransidcen(data_FUND_CEN_ALLOTTEDTRANSACTIONS,callback){
    let i = 1
    let txtcondition = ''
    for (const key in data_FUND_CEN_ALLOTTEDTRANSACTIONS) {
        if (data_FUND_CEN_ALLOTTEDTRANSACTIONS.length == i){
            txtcondition += ` ( transactionId = '${data_FUND_CEN_ALLOTTEDTRANSACTIONS[key].TRANSACTION_ID}' AND TRANTYPECODEX ='${data_FUND_CEN_ALLOTTEDTRANSACTIONS[key].TRANS_CODE}') `
        }else{
            txtcondition += `  ( transactionId = '${data_FUND_CEN_ALLOTTEDTRANSACTIONS[key].TRANSACTION_ID}' AND TRANTYPECODEX ='${data_FUND_CEN_ALLOTTEDTRANSACTIONS[key].TRANS_CODE}') OR `
        }
         
       i ++;
    }
    return callback(txtcondition)
}
 
async function sendmailReconcile(txtapi , callback){
    const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let datenow = year +"-"+  month +"-"+  date
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            return process.exit(1);
        }
    
        console.log('Credentials obtained, sending message...');
    
        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            host: 'smtp.wealthrepublic.co.th',
            port: 25,
            secure: false, //use SSL
            auth: {
                user: 'it@wealthrepublic.co.th',
                pass: 'Wealth@2023'
            },
            tls:{ 
                rejectUnauthorized: false 
                }
        });
    
        // Message object
        let message = {
            from: 'it@wealthrepublic.co.th',
            to: 'atichat@wealthrepublic.co.th',
            //cc: 'komkrit@wealthrepublic.co.th ,sittichai@wealthrepublic.co.th,janjira@wealthrepublic.co.th', //'komkrit@wealthrepublic.co.th'
            subject: 'Auto mail Reconcile '+ datenow,
            text: `${txtapi} `,
            html:  `${txtapi}` 
        };
    
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }
    
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
}
//It Request 230205
async function dataTrantolog(datarows,callback){
    let dateserver
    await getdatetime((dt=>{dateserver = dt}))
    // console.log(datarows) 
    for (const key in datarows) {
        try{
            let status                      =""
            let desc                        =""
            let continue_                   = ""
            let TRANSACTION_ID              = null
            let UNIT_BALANCE                = null
            let TRANS_CODE                  = null
            let status_api                  = null
            let Status_Id                   = null
            let Fund_Id                     = null
            let Ref_No                      = null
            let Confirm_Unit                = null
             TRANSACTION_ID              = datarows[key].TRANSACTION_ID
             UNIT_BALANCE                = datarows[key].Unit_Balance
             TRANS_CODE                  = datarows[key].TRANS_CODE
             status_api                  = datarows[key].status_api
             let status_wr                   = datarows[key].Status_Id
             Fund_Id                     = datarows[key].Fund_Id
             Ref_No                      = datarows[key].Ref_No
             Confirm_Unit                = datarows[key].Confirm_Unit
            let id_card                  = datarows[key].id_card
            let HolderId                 = datarows[key].UNITHOLDER_ID
            let FUND_CODE                 = datarows[key].FUND_CODE
            // status = "Tran Error" ; desc = "tran id :  "+TRANSACTION_ID+" => Fund_Id มีค่าเป็น Null " +Ref_No
            desc = "tran id :  "+TRANSACTION_ID
            status = "Tran Error"
            let score = 0 ;
            // if(Ref_No === null){Ref_No = " "}
            if(status_api === 'ALLOTTED' && status_wr == 7) {continue_ = 1}
            if(status_api === 'WAITING' && status_wr == 5)  {continue_ = 1}
            if (Ref_No === null  )            {  desc += " : Ref No มีค่าเป็น Null" ;continue_ = 0;score++;}
            if (Fund_Id === null)           { desc += " : Fund_Id มีค่าเป็น Null "   ;continue_ = 0;score++;} 
            if (Confirm_Unit === null && status_api === 'ALLOTTED')      { desc += " : Unit balance มีค่าเป็น Null "  ;continue_ = 0;score++;}
            if (HolderId === null)      { desc = "tran id :  "+TRANSACTION_ID+" => HolderId มีค่าเป็น Null "  ;continue_ = 0;score++;}
            if (score == 3) { desc = "tran id :  "+TRANSACTION_ID+" : Trans ไม่เข้าระบบ "          ;continue_ = 0 ;}
            if (continue_==1){continue;}
            // console.log(score) 
            let statement = `INSERT INTO Fund_Errlog_TransferData  (Descriptions ,TimeLines , Status ,AccountNo ,HolderId ,TRANSACTION_ID, Fund_Id ,FUND_CODE ,Confirm_Unit ,Unit_Balance) 
                             VALUES 
                             (@Descriptions ,@TimeLines , @Status ,@AccountNo ,@HolderId ,@TRANSACTION_ID, @Fund_Id ,@FUND_CODE ,@Confirm_Unit ,@Unit_Balance)
                             `
            // let statement = `INSERT INTO MFTS_UnitBalance(Fund_Id ,Ref_No) VALUES(@Fund_Id ,@Ref_No)`
            // console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .input("TRANSACTION_ID",            sql.VarChar(30),            TRANSACTION_ID) 
                .input("TimeLines",                 sql.DateTime,               dateserver)  
                .input("Fund_Id",                   sql.NChar(10),              Fund_Id) 
                // .input("Ref_No",                    sql.NChar(10),              Ref_No) 
                .input("Confirm_Unit",              sql.Numeric(18,4),          Confirm_Unit)
                .input("status"     ,                sql.NChar(20),             status) 
                .input("Descriptions"     ,         sql.NChar(100),             desc) 
                .input("AccountNo"     ,         sql.NChar(15),                 id_card) 
                .input("HolderId"     ,         sql.NChar(20),                  HolderId) 
                .input("FUND_CODE"     ,         sql.NChar(50),                 FUND_CODE) 
                .input("Unit_Balance"     ,         sql.NChar(50),                 UNIT_BALANCE) 
                .query(statement);
            
                }).then(result => {
                //console.log(result);
                let data_row = result.rowsAffected.toString();
                sql.close();
                // console.log(result.recordset)
                // return  callback(result.recordset) 
            
                }).catch(err => {
                console.log(err);
                sql.close();
                // return   callback(err);
                });
            } catch (error) {
            //    result = "ERROR Catch"
               console.log(error);
                // return   callback(error);
            }
    }
}
async function fixDatatranavg(callback){
    let condition_avg = ['1100200478815',
    '1100400369351',
    '1100400672429',
    '1100400900936',
    '1100600281300',
    '1100600352274',
    '1100699006667',
    '1100700313033',
    '1100701769251',
    '1100702018551',
    '1100702207371',
    '1100702294877',
    '1100800459501',
    '1100900394924',
    '1100900397168',
    '1100900436015',
    '1101200003222',
    '1101200020968',
    '1101400431473',
    '1101401086591',
    '1101401383847',
    '1101401708444',
    '1101401921181',
    '1101402008896',
    '1101500163543',
    '1101700094341',
    '1101700125793',
    '1102000261601',
    '1102099001232',
    '1102100081648',
    '1103000053244',
    '1103300071311',
    '1103300154739',
    '1103300158505',
    '1103701072776',
    '1103701830751',
    '1103701875895',
    '1103702304191',
    '1129700188806',
    '1129900031099',
    '1321000204877',
    '1361000028939',
    '1409900376174',
    '1449900174725',
    '1470100065532',
    '1529900303621',
    '1539900077389',
    '1550500071903',
    '1629900140284',
    '1640100029771',
    '1659900520745',
    '1760500002055',
    '1769900062550',
    '1769900135972',
    '1769900140275',
    '1769900176121',
    '1800700107496',
    '1801300083159',
    '1909800699431',
    '2320100042027',
    '3100100144199',
    '3100100233086',
    '3100100233094',
    '3100100441193',
    '3100100622139',
    '3100100723695',
    '3100100786662',
    '3100100788924',
    '3100100867166',
    '3100100931166',
    '3100100971532',
    '3100101024162',
    '3100200496097',
    '3100200695863',
    '3100200769972',
    '3100200899906',
    '3100201028810',
    '3100201406466',
    '3100201406474',
    '3100201578291',
    '3100202175671',
    '3100202259238',
    '3100202849451',
    '3100203336040',
    '3100400033651',
    '3100400069834',
    '3100400221237',
    '3100400304370',
    '3100400406482',
    '3100400714683',
    '3100500231676',
    '3100500361731',
    '3100500414436',
    '3100500416064',
    '3100500423991',
    '3100500709878',
    '3100501578432',
    '3100501794739',
    '3100502355372',
    '3100502720496',
    '3100502756075',
    '3100502787116',
    '3100503137280',
    '3100503694111',
    '3100503838881',
    '3100504359189',
    '3100601105617',
    '3100601713072',
    '3100602093060',
    '3100602380948',
    '3100602554717',
    '3100602692681',
    '3100602893660',
    '3100602936091',
    '3100603233922',
    '3100603271051',
    '3100603574321',
    '3100700076798',
    '3100700096055',
    '3100700206527',
    '3100700249030',
    '3100700638338',
    '3100700674113',
    '3100700712384',
    '3100701220396',
    '3100800447461',
    '3100800467829',
    '3100800851700',
    '3100800861187',
    '3100900294047',
    '3100900304433',
    '3100901096672',
    '3100901127608',
    '3100901341898',
    '3100901951343',
    '3100902147157',
    '3100902730600',
    '3100902845491',
    '3100902906252',
    '3100902906279',
    '3100902933781',
    '3100903090507',
    '3100903140610',
    '3100903940781',
    '3100903944921',
    '3100904152131',
    '3100904455711',
    '3100904455720',
    '3100904500571',
    '3100904500580',
    '3100904504909',
    '3100904573595',
    '3100904644280',
    '3100904687558',
    '3100904949129',
    '3101000443071',
    '3101000619439',
    '3101200014956',
    '3101200143152',
    '3101200143179',
    '3101200412374',
    '3101200886414',
    '3101200886422',
    '3101200995469',
    '3101201209955',
    '3101201322956',
    '3101201397298',
    '3101201485197',
    '3101201720587',
    '3101201738915',
    '3101202016816',
    '3101202154577',
    '3101202297220',
    '3101202635222',
    '3101202710984',
    '3101202718403',
    '3101202718420',
    '3101202741961',
    '3101202820526',
    '3101203246963',
    '3101203447896',
    '3101300168742',
    '3101300344991',
    '3101300745146',
    '3101400335101',
    '3101400518427',
    '3101400518451',
    '3101400702139',
    '3101400935028',
    '3101400938591',
    '3101401892951',
    '3101402089311',
    '3101402218072',
    '3101403120777',
    '3101403186727',
    '3101500118421',
    '3101500306421',
    '3101500673220',
    '3101500992210',
    '3101501064618',
    '3101501111136',
    '3101501483289',
    '3101501569655',
    '3101501569663',
    '3101600051786',
    '3101600234261',
    '3101600340079',
    '3101600542666',
    '3101600663862',
    '3101700052491',
    '3101700253569',
    '3101701134652',
    '3101701698033',
    '3101702108001',
    '3101702403665',
    '3101800148325',
    '3101800255521',
    '3101800489556',
    '3101801448969',
    '3101900368050',
    '3102000324693',
    '3102000328346',
    '3102001038414',
    '3102001180881',
    '3102001237743',
    '3102002137483',
    '3102002383875',
    '3102100226227',
    '3102100720230',
    '3102101511570',
    '3102101712109',
    '3102200036284',
    '3102200318689',
    '3102200564906',
    '3102200844062',
    '3102201393986',
    '3102201483110',
    '3102201726411',
    '3102201887385',
    '3102300185575',
    '3102300359832',
    '3102400051317',
    '3102401082291',
    '3102401238836',
    '3110100667469',
    '3110101022925',
    '3110101336024',
    '3110300030090',
    '3110400101134',
    '3110400672140',
    '3119800097132',
    '3119900257280',
    '3120100173130',
    '3120100345607',
    '3120100974752',
    '3120101665133',
    '3120101805962',
    '3120101806012',
    '3120300002649',
    '3120300055424',
    '3120600033264',
    '3120600893123',
    '3129900009103',
    '3129900369932',
    '3130200094517',
    '3190100208791',
    '3190100266448',
    '3199700070488',
    '3200100181395',
    '3200101110181',
    '3200200524898',
    '3209900231263',
    '3210200136782',
    '3210500070311',
    '3240100053923',
    '3250200046724',
    '3259900183587',
    '3269900025965',
    '3349900819260',
    '3400101467410',
    '3400900608537',
    '3409700014984',
    '3409900359063',
    '3409900843551',
    '3410100078649',
    '3430100286951',
    '3430200079647',
    '3461300120755',
    '3509900042450',
    '3509900284925',
    '3509900506766',
    '3509900670370',
    '3509901498007',
    '3510200098128',
    '3520100614337',
    '3529900423194',
    '3529900432096',
    '3540400118599',
    '3540400492580',
    '3549900047711',
    '3549900147154',
    '3570100023495',
    '3570100900372',
    '3570500090483',
    '3570500090491',
    '3579900024818',
    '3609700255254',
    '3609800099483',
    '3609900496069',
    '3640400163241',
    '3640600581186',
    '3660100511731',
    '3660100760511',
    '3720900441711',
    '3729800048799',
    '3729800110729',
    '3739900444297',
    '3760500219701',
    '3760500954010',
    '3760500954028',
    '3760500954036',
    '3760500954079',
    '3769900318453',
    '3809900595693',
    '3840700219037',
    '3840900018167',
    '3841200241328',
    '3850100312206',
    '3869800041653',
    '3901100273286',
    '3901100331065',
    '3909800439524',
    '3909800707901',
    '3920600198363',
    '3929800035407',
    '3950100612161',
    '4100500020819',
    '4100500021149',
    '4102200015153',
    '4120100027328',
    '5101200113781',
    '5102400003319',
    '5102400004889',
    '5339990002876',
    '5489900002862',
    '5609990024974',
    '5620500016084',
    '8570885000057']

        //"UNITHOLDERI ='072000123000002' AND FUNDCODEI ='ONE-CHINATOP10M2' ",
        // let statement =` SELECT  top(1) transactionId , Unit_Balance ,Total_Cost ,Avg_Cost FROM MFTS_Transaction  WHERE UNITHOLDERI ='072000121000048' AND FUNDCODEI ='ONE-ALLCHINA-RA' AND STATUS_ID = 7  AND Tran_Date >='2022-09-01' ORDER BY Tran_id desc  `
        let i=1
        let dateserver
        await getdatetime((dt=>{dateserver = dt}))
        condition_avg.forEach(async(condition_st) => {
            let data_row ,data_update 
            // await selectDataUnitholdertoFix(condition_st,(datas=>{data_row = datas}))
            await selectDataAccounttoFix(condition_st,(datas=>{data_row = datas}))
            // let count_row = data_row.length;
            // console.log(count_row)
           // if (count_row > 0){
                // await selectcenuniholder(data_row,(datax=>{data_update =datax}))
                //             console.log( " ref  " +data_row[0].Ref_No +" ,  " +data_row[0].Fund_Id)
                // await updatetranAvg(data_update,data_row[0].transactionId ,data_row[0].TranType_Code,data_row[0].Ref_No,data_row[0].Fund_Id, data_row[0].Total_Cost ,data_row[0].Avg_Cost ,(result=>{
                //             // console.log(result)
                // }))
            //await    callUpsCostAvg(data_row[0].Ref_No,data_row[0].Fund_Id,null,null )
                // console.log(data_row)
           // }
            // if(data_row.length > 0 ){
            //    console.log(data_row)  
            // }
            // console.log("data_row: " +data_row)
            
            i ++
        });
        return callback("done")
}
async function selectDataUnitholdertoFix(condition_st,callback){
    try{
        let statement =` SELECT  top(1) * FROM MFTS_Transaction  WHERE ${condition_st} AND STATUS_ID = 7  AND Tran_Date >='2022-09-01' ORDER BY Seq_No desc  `
        console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            let txt = ""
            // if(row > 0){
            //     data_FUND_CEN_ALLOTTEDTRANSACTIONS = result.recordset
            // }
            return callback(result.recordset)
            // data_nav = result.recordset;
            sql.close();
        //  txtapi.push(txt)   
          
    
        }).catch(err => {
            console.log(err);
        sql.close();
        // return   callback(err);
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
     
}
async function selectcenuniholder(datarows, callback){
    let count_row = datarows.length;
    // console.log("result : " +count_row)
    let data_FUND_CEN_UNITBALANCE
    
    // console.log(datarows) 
    for (const key in datarows) {
        let transactionId       =   datarows[key].transactionId
        let UNITHOLDERI         =   datarows[key].UNITHOLDERI
        let FUNDCODEI           =   datarows[key].FUNDCODEI
        let  Ref_No             =   datarows[key].Ref_No
        let  Fund_Id             =   datarows[key].Fund_Id
        try{
            let statement =` SELECT  UNIT_BALANCE ,AVERAGE_COST,UNITHOLDER_ID ,FUND_CODE FROM Fund_Cen_UnitholderBalance  WHERE  (UNITHOLDER_ID = '${UNITHOLDERI.trim()}') AND ( FUND_CODE = '${FUNDCODEI.trim()}') `
            // console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => { 
                return pool.request()
                .query(statement);
        
            }).then(result => {
                let row = result.rowsAffected
                let txt = ""
                // console.log(result.recordset) 
                data_FUND_CEN_UNITBALANCE = result.recordset
                 
                sql.close();
            //  txtapi.push(txt)   
              
        
            }).catch(err => {
                console.log(err);
            sql.close();
            // return   callback(err);
            });
    
        }catch (error) {
            // result = "ERROR Catch"
            console.log(error);
            // return callback(error)
        }
    }
    return callback(data_FUND_CEN_UNITBALANCE)
}
async function updatetranAvg(datarow,tranid ,trantypeCode,ref_no,fund_id,Total_Costx,Avg_Costx,callback){ 
    try{
        let dateserver  = '2023-02-05'
        await getdatetime((dt=>{dateserver = dt}))
        let unibalance      = datarow[0].UNIT_BALANCE
        let avg_cost ,avg_cost_diff         
        let Total_Cost  ,total_cost_diff ,AmountUnitBalance = 0.0000
        if(Total_Costx === undefined ){Total_Costx= 0.0000}   
        if(Avg_Costx === undefined ){Avg_Cost= 0.0000}   
        await averagCostdiff(ref_no, fund_id ,(avg_costx)=>{avg_cost = avg_costx})
        await totalcostdev(ref_no, fund_id ,(Total_Costx ,AmountUnitBalancex )=>{Total_Cost = Total_Costx ; AmountUnitBalance = AmountUnitBalancex})
        // console.log(AmountUnitBalance)
        if(AmountUnitBalance === null){AmountUnitBalance = 0.0000}
        if(AmountUnitBalance === undefined){AmountUnitBalance = 0.0000}
        // console.log(ref_no+"  "+fund_id)
        // console.log(AmountUnitBalance)
        avg_cost_diff = Avg_Costx - avg_cost
        total_cost_diff = Total_Costx - Total_Cost
        // console.log("total cost : "+ Total_Cost)
        let statement =`UPDATE MFTS_Transaction
                    SET Net_UnitBalance          = @Net_UnitBalance,
                    date_fix                     =   @date_fix
                    WHERE transactionId             ='${tranid}'  
                    AND STATUS_ID = 7
                    AND TranType_Code               = '${trantypeCode}'  
                    AND Tran_Date >='2022-09-01'
                    `
         //,
        //  Avg_Cost_Dev                = ${avg_cost},
        //  Total_Cost_Diff             =${total_cost_diff},
        //  Avg_Cost_Diff                = ${avg_cost_diff},           
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .input("Net_UnitBalance",           sql.Decimal(18,9),          AmountUnitBalance)
            .input("date_fix",                 sql.DateTime,                dateserver)  
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            sql.close(); 
           return callback("Update data avg and totalcost id  " + tranid)
    
        }).catch(err => {
            console.log(err);
        sql.close();
        // return   callback(err);
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
}
async function averagCostdiff( RefNo , Fund_id  , callback){
    // console.log(averageCost)
    const today = new Date()
    let date_ob = new Date(today)
    let date = ("0"+date_ob.getDate()).slice(-2); 
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let datenow = year +"-"+  month +"-"+  date
    try
    { //ALTER FUNCTION [dbo].[MIT_AverageCostPerUnit](@Ref_No  VARCHAR(50), @Fund_ID  int, @EndOfDataDate  datetime)
        let statement =`SELECT * from MIT_AverageCostPerUnit('${RefNo}',${Fund_id},'${datenow}')` 
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            sql.close();
        //    console.log(result )
           return callback(result.recordset[0].AvgCostPerUnit)
          //   return callback(result.returnValue)
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
async function totalcostdev( RefNo , Fund_id  , callback){
    // console.log(averageCost)  MIT_SumTotalAmountBahtX
    const today = new Date()
    let date_ob = new Date(today)
    let date = ("0"+date_ob.getDate()).slice(-2); 
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let datenow = year +"-"+  month +"-"+  date
    try
    { //ALTER FUNCTION [dbo].[MIT_AverageCostPerUnit](@Ref_No  VARCHAR(50), @Fund_ID  int, @EndOfDataDate  datetime) SELECT * from MIT_SumTotalCost('M00000000977',362,'2023-02-03')  AmountBahtForFund
        let statement =`SELECT  * from MIT_SumTotalCost('${RefNo}',${Fund_id},'${datenow}')` 
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            sql.close();
        //    console.log(result )
           return callback(result.recordset[0].AmountBahtTotalcost ,result.recordset[0].AmountUnitBalance)
          //   return callback(result.returnValue)
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
async function DatafundcenAllot(callback){
    let data_FUND_CEN_ALLOTTEDTRANSACTIONS 
    try{
        
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let datenow = year +"-"+  month +"-"+  date

        let statement =`SELECT  * FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE timestampx  >='${datenow}'`
                         //SELECT * FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE timestampx >='2023-01-24'
        let datacountApi = 0
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            let txt = ""
            if(row > 0){
                data_FUND_CEN_ALLOTTEDTRANSACTIONS = result.recordset
            }
             return callback(result.recordset)
            // data_nav = result.recordset;
            sql.close();
        //  txtapi.push(txt)   
          
    
        }).catch(err => {
            console.log(err);
        sql.close();
        // return   callback(err);
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
}

async function prepaireAccount(callback){
let data_row
await DatafundcenAllot((datas)=>{data_row = datas})
console.log(data_row)
for (const key in data_row) {
    let holderid = data_row[key].UNITHOLDER_ID
    let AccountID = data_row[key].FILTER01
    let Amc_Name = data_row[key].AMC_CODE
    let amc_id
    let Holder_Id ,RefNo
    await getamc_id(Amc_Name,(amc)=>{amc_id = amc})
    // console.log(amc_id)
    try{
        let statement =`SELECT * FROM MFTS_Account WHERE Account_No = '${AccountID}'  AND Amc_Id = ${amc_id} `
        //AND Holder_Id = '${holderid}'
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
            }).then(result => {
                let row = result.rowsAffected
                if(row > 0 ){
                    Holder_Id               = result.recordset[0].Holder_Id
                    RefNo                   = result.recordset[0].Ref_No
                    // console.log(result.recordset[0].Holder_Id)
                    if(Holder_Id === null || Holder_Id.trim === ''){
                        // console.log(RefNo)
                        // console.log(holderid)
                        updateholderAccount(amc_id,RefNo,AccountID,holderid)
                    }
                  

                }
               //sql.close(); 
                //return callback(result.recordset)
            
            }).catch(err => {
                console.log(err);
                sql.close();
    
            });
    
        }catch (error) {
            // result = "ERROR Catch"
            console.log(error);
            // return callback(error)
            sql.close();
        }
    
}
//    return callback("done")
}
async function getamc_id(amc_name ,callback){
    try{let statement =`SELECT  Amc_Id FROM MFTS_Amc WHERE Amc_Code  ='${amc_name}' `
     
        await new sql.ConnectionPool(config).connect().then(pool => { 
        return pool.request()
        .query(statement);

        }).then(result => {
            sql.close(); 
            return callback(result.recordset[0].Amc_Id)
        
        }).catch(err => {
            console.log(err);
            sql.close();

        });

        }catch (error) {
            // result = "ERROR Catch"
            console.log(error);
            // return callback(error)
            sql.close();
    }
}
async function datatranconciletotxt(datarows , callback){
    let tagtable = "" 
        let tagtd = ""
        let transactionId = null ,id_card = null , status_api = null , status_wr = null ,Fund_Id = null , Ref_No = null , Title_Name_T = null ,First_Name_T = null
        let Last_Name_T = null , Confirm_Unit = null , UNITHOLDER_ID = null, AMC_CODE = null , FUND_CODE =null ,mktid =null
        let i =1
        for (const key in datarows) {
            transactionId           = datarows[key].TRANSACTION_ID
            id_card                 = datarows[key].id_card 
            status_api              = datarows[key].status_api 
            status_wr               = datarows[key].status_wr 
            Fund_Id                 = datarows[key].Fund_Id 
            Ref_No                  = datarows[key].Ref_No 
            Title_Name_T            = datarows[key].Title_Name_T 
            First_Name_T            = datarows[key].First_Name_T 
            Last_Name_T             = datarows[key].Last_Name_T 
            Confirm_Unit            = datarows[key].Confirm_Unit
            UNITHOLDER_ID           = datarows[key].UNITHOLDER_ID
            AMC_CODE                = datarows[key].AMC_CODE
            FUND_CODE               = datarows[key].FUND_CODE
            mktid                   = datarows[key].mktid
            tagtd                   += `<tr>
                                    <td> ${i } </td> 
                                    <td> ${transactionId}</td>
                                    <td> ${id_card}</td>
                                    <td> <h3> ${status_api} </h3></td>
                                    <td> <h3> ${status_wr} </h3></td>
                                    <td> ${Fund_Id}</td>
                                    <td> ${Ref_No}</td>
                                    <td> ${Title_Name_T}</td>
                                    <td> ${First_Name_T}</td>
                                    <td> ${Last_Name_T}</td>
                                    <td> ${Confirm_Unit}</td>
                                    <td> ${UNITHOLDER_ID}</td>
                                    <td> ${AMC_CODE}</td>
                                    <td> ${FUND_CODE}</td>
                                    <td> ${mktid}</td>
                                    </tr>
                               `
                               i++;
        }
        tagtable = `<h1>รายการ ReconCile </h1>
                    <table  border="1" >
                        <tr>
                                <td> No </td>
                                <td> Transaction Id</td>
                                <td> Card No</td>
                                <td> <h3>Status API </h3></td>
                                <td> <h3>Status WR </h3></td>
                                <td> Fund Id  </td>
                                <td> Ref No </td>
                                <td> Title Name </td>
                                <td> First Name </td>
                                <td> Last Name  </td>
                                <td> Unit Balance</td>
                                <td> UNITHOLDER ID</td>
                                <td> AMC CODE </td>
                                <td> FUND CODE </td>
                                <td> Marketing Code </td>
                        </tr> 
                        ${tagtd}
                    </table>`
        // console.log(tagtable)
        // res.json(datarows)
        return callback(tagtable)
}
async function callUpsCostAvg(RefNo,Fund_Id,dateserver,seq_number ,callback){
    try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .input('ref_no'       ,sql.VarChar(30),       RefNo)
          .input('fund_id'      , sql.Int,              Fund_Id)
          .input('date'      , sql.DateTime,            dateserver)
          .input('seq_no'      , sql.Int,               seq_number)
          .execute(`[dbo].[USP_MFTS_Recal_CostAvg]`);
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          sql.close();
        //  console.log(result )
        //  return callback(result.recordset[0].Ref_No)
        //   return callback(result.returnValue)
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
//IT Request 230202
async  function callUSP_MFTS_RECAL_COSTAVG(datarows,callback){
    let DATA_TRANSACTION_ALL
    try{
            let statement = `SELECT TOP (100) PERCENT dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID, 
                                    dbo.Fund_Cen_AllottedTransactions.STATUS AS status_api, 
                                    CASE WHEN Status_Id = 5 THEN 'Waiting' WHEN Status_Id = 7 THEN 'Alloted'
                                    END AS status_wr
                                    , dbo.MFTS_Transaction.Fund_Id,
                                    dbo.MFTS_UnitBalance.Confirm_Unit, 
                                    dbo.MFTS_Transaction.Unit_Balance,
                                    dbo.MFTS_Transaction.Status_Id
                                    , dbo.MFTS_Transaction.Seq_No
                                    ,dbo.MFTS_Transaction.Ref_No
                                FROM dbo.Account_Info RIGHT OUTER JOIN
                                    dbo.MFTS_UnitBalance RIGHT OUTER JOIN
                                    dbo.Fund_Cen_AllottedTransactions LEFT OUTER JOIN
                                    dbo.MFTS_Transaction ON 
                                    dbo.Fund_Cen_AllottedTransactions.TRANS_CODE = dbo.MFTS_Transaction.TRANTYPECODEX
                                    AND 
                                    dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID = dbo.MFTS_Transaction.transactionId
                                    ON 
                                    dbo.MFTS_UnitBalance.Fund_Id = dbo.MFTS_Transaction.Fund_Id AND 
                                    dbo.MFTS_UnitBalance.Ref_No = dbo.MFTS_Transaction.Ref_No ON 
                                    dbo.Account_Info.Cust_Code = dbo.Fund_Cen_AllottedTransactions.FILTER01
                                ORDER BY dbo.MFTS_Transaction.transactionId`
                                // WHERE dbo.MFTS_Transaction.transactionId ='1412302080005641'
            await new sql.ConnectionPool(config).connect().then(pool => { 
                return pool.request()
                .query(statement);
        
                }).then(result => {
                    DATA_TRANSACTION_ALL = result.recordset
                    sql.close(); 
                    //return callback(result.recordset[0].Amc_Id)
                
                }).catch(err => {
                    console.log(err);
                    sql.close();
        
                });
        
                }catch (error) {
                    // result = "ERROR Catch"
                    console.log(error);
                    // return callback(error)
                    sql.close();
            }
    //console.log(DATA_TRANSACTION_ALL)        
    // let dateserver
    // await getdatetime((dt=>{dateserver = dt}))
    let datenow
    const today = new Date()
    let date_ob = new Date(today)
    let date = ("0"+date_ob.getDate()).slice(-2); 
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    datenow = year +"-"+  month +"-"+  date
    for (const key in DATA_TRANSACTION_ALL) {
        try{
            let RefNo           = DATA_TRANSACTION_ALL[key].Ref_No
            let Fund_Id         = DATA_TRANSACTION_ALL[key].Fund_Id 
            let seq_number      = DATA_TRANSACTION_ALL[key].Seq_No

             console.log(RefNo + " "+ Fund_Id + "  "+ datenow + " "+ seq_number)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .input('ref_no'       ,sql.VarChar(30),       RefNo)
                .input('fund_id'      , sql.Int,              Fund_Id)
                .input('date'           , sql.DateTime,         datenow)
                .input('seq_no'      , sql.Int,               seq_number)
                .execute(`[dbo].[USP_MFTS_Recal_CostAvg2]`);
            }).then(result => {
                let rowsAffected = result.rowsAffected.toString()
                console.log(result.recordsets)
                sql.close();
                //  console.log(result )
                //  return callback(result.recordset[0].Ref_No)
                //   return callback(result.returnValue)
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
    // return callback("done")
}
async function getCenUnitbalancce(FUND_CODE,UNITHOLDER_ID ,callback){

    try{
        let statement =`SELECT AVAILABLE_UNIT_BALANCE FROM Fund_Cen_UnitholderBalance WHERE FUND_CODE = '${FUND_CODE}' AND UNITHOLDER_ID = '${UNITHOLDER_ID}'`
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => { 
        return pool.request()
        .query(statement);

        }).then(result => {
            let ret =""
            let row = result.rowsAffected
            if(row > 0 ){
                ret = result.recordset[0].AVAILABLE_UNIT_BALANCE
            }
            // DATA_TRANSACTION_ALL = result.recordset
            sql.close(); 
            return callback(ret) 
        
        }).catch(err => {
            console.log(err);
            sql.close();

        });
    
    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
        sql.close();
    }
}
async function unitbalaceDiffToLog (txt,status,HolderId,FUND_CODE,Confirm_Unit,UNIT_BALANCE,Fund_Id)
{ 
    try{
        let dateserver
        await getdatetime((dt=>{dateserver = dt}))
        let statement = `INSERT INTO Fund_Errlog_TransferData  (Descriptions ,TimeLines , Status ,Fund_Id  ,HolderId   ,FUND_CODE ,Confirm_Unit ,Unit_Balance) 
                             VALUES 
                             (@Descriptions ,@TimeLines , @Status  ,@Fund_Id  ,@HolderId  ,@FUND_CODE ,@Confirm_Unit ,@Unit_Balance)
                             `
            // let statement = `INSERT INTO MFTS_UnitBalance(Fund_Id ,Ref_No) VALUES(@Fund_Id ,@Ref_No)`
            // console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request() 
                .input("TimeLines",                 sql.DateTime,               dateserver)  
                .input("Fund_Id",                   sql.NChar(10),              Fund_Id)  
                .input("Confirm_Unit",              sql.Numeric(18,4),          Confirm_Unit)
                .input("status"     ,                sql.NChar(20),             status) 
                .input("Descriptions"     ,         sql.NChar(100),             txt)  
                .input("HolderId"     ,         sql.NChar(20),                  HolderId) 
                .input("FUND_CODE"     ,         sql.NChar(50),                 FUND_CODE) 
                .input("Unit_Balance"     ,         sql.NChar(50),              UNIT_BALANCE) 
                .query(statement);
            
                }).then(result => {
                //console.log(result);
                let data_row = result.rowsAffected.toString();
                sql.close();
                // console.log(result.recordset)
                //   return  callback("insert done") 
            
                }).catch(err => {
                console.log(err);
                sql.close();
                // return   callback(err);
                });
            } catch (error) {
            //    result = "ERROR Catch"
               console.log(error);
                // return   callback(error);
            }
}
async function DailyImportSumAllot(callback){
    let Total_Allot
    let Alloted
    let UnAlloted
    try{
        
        // const today = new Date()
        // let date_ob = new Date(today)
        // let date = ("0"+date_ob.getDate()).slice(-2); 
        // let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        // let year = date_ob.getFullYear();
        // let datenow = year +"-"+  month +"-"+  date

        let statement =`SELECT count(*) as Alloted 
                                    ,(SELECT COUNT(*) as row FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE STATUS= 'ALLOTTED') as Total_Allot 
                        FROM  dbo.Fund_Cen_AllottedTransactions LEFT OUTER JOIN
                            dbo.MFTS_Transaction ON 
                            dbo.Fund_Cen_AllottedTransactions.TRANS_CODE = dbo.MFTS_Transaction.TRANTYPECODEX
                            AND 
                            dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID = dbo.MFTS_Transaction.transactionId
                        WHERE dbo.MFTS_Transaction.Status_Id = 7`
                         //SELECT * FROM FUND_CEN_ALLOTTEDTRANSACTIONS WHERE timestampx >='2023-01-24'
        let datacountApi = 0
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            // let txt = ""
            Total_Allot = result.recordset[0].Total_Allot
            Alloted     = result.recordset[0].Alloted
            sql.close();
            
          
    
        }).catch(err => {
            console.log(err);
        sql.close();
        // return   callback(err);
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
    
    UnAlloted = Total_Allot - Alloted
    try{
        let statement =`INSERT  INTO Daily_ALLOTED_REPORT( TotalAllot, Alloted, UnAlloted)
                        VALUES (@TotalAllot,@Alloted,@UnAlloted) `
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() 
            .input("TotalAllot",                 sql.Int,              Total_Allot)  
            .input("Alloted",                   sql.Int,              Alloted)  
            .input("UnAlloted",              sql.Int,          UnAlloted)
            .query(statement);
        
            }).then(result => {
            //console.log(result);
            let data_row = result.rowsAffected.toString();
            sql.close();
            // console.log(result.recordset)
            //   return  callback("insert done") 
        
            }).catch(err => {
            console.log(err);
            sql.close();
            // return   callback(err);
            });
        } catch (error) {
        //    result = "ERROR Catch"
            // console.log("Total Allot "+Total_Allot);
            // return   callback(error);
        }
        return callback("Total Allot "+Total_Allot)
}
//IT Request 230208
async function cusHolderLevel(datarows ,callback){ //cardNumber,Fundcode,HolderNo
    
    for (const key in datarows) {
        let cardNumber              = datarows[key].id_card
        let Fundcode                = datarows[key].FUND_CODE
        let HolderNo                = datarows[key].UNITHOLDER_ID
        let AMC_CODE                = datarows[key].AMC_CODE
        let TRANSACTION_ID          = datarows[key].TRANSACTION_ID
        let TRANS_CODE              = datarows[key].TRANS_CODE
        if(cardNumber !== '3100201406474'){continue;}
        let amcID
        await getamc_id(AMC_CODE,(x)=>{amcID = x})
        // console.log(amcID)
        let data_Account
        // try{
        //     // console.log(cardNumber)
        //     let statement =`SELECT * FROM ACCOUNT_INFO WHERE Cust_Code like '%${cardNumber}%'`
        //     // console.log(statement)
        //     await new sql.ConnectionPool(config).connect().then(pool => {
        //         return pool.request() 
        //         .query(statement);
        //         }).then(result => {
        //         //console.log(result);
        //         let  row = result.rowsAffected.toString();
        //         sql.close();
        //         data_Account = result.recordsets    
        //         // console.log(row)
                
        //         }).catch(err => {
        //         console.log(err);
        //         sql.close();
             
        //     });

        // } catch (error) {}
        //console.log(data_Account)
        let data_fund ,fundRow
        try{
            let statement =`SELECT * FROM MFTS_FUND WHERE Fund_Code = '${Fundcode}' AND status_lv3 ='x' ` 
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request() 
                .query(statement);
                }).then(result => {
                //console.log(result);
                fundRow = result.rowsAffected.toString();
                sql.close();
                // console.log(result.recordsets) 
                data_fund = result.recordsets    
                }).catch(err => {
                console.log(err);
                sql.close();
            
            });
        } catch (error) { }
         // console.log(data_fund)
         if(fundRow>0 ){
            let data_Account , accountNew = "" , refNoNew = "" ,hoderIdNew = ""
            try{ 
                let statement =`SELECT * FROM MFTS_Account WHERE (Account_No = '${cardNumber}-3' AND Amc_Id =${amcID} ) `//OR (Account_No = '${cardNumber}-2' AND Amc_Id =${amcID} )
                // console.log(statement)
                await new sql.ConnectionPool(config).connect().then(pool => {
                    return pool.request() 
                    .query(statement);
                    }).then(result => {
                    // console.log(result);
                    let  row = result.rowsAffected.toString();
                    if(row>0){
                        accountNew = result.recordset[0].Account_No
                        hoderIdNew = result.recordset[0].Holder_Id
                    }
                    sql.close();
                    // data_Account = result.recordsets
                    // console.log(row)
                    
                    }).catch(err => {
                    console.log(err);
                    sql.close();
                 
                });
    
            } catch (error) {}
            if(accountNew === null || accountNew === undefined){continue;}
            try{
                let statement = `UPDATE Fund_Cen_AllottedTransactions SET FILTER01 ='${accountNew}' ,UNITHOLDER_ID = '${hoderIdNew}' 
                                WHERE TRANS_CODE ='${TRANS_CODE}' AND TRANSACTION_ID = '${TRANSACTION_ID}' `
                // console.log(statement)
                await new sql.ConnectionPool(config).connect().then(pool => {
                    return pool.request() 
                    .query(statement);
                    }).then(result => {
                    // console.log(result);
                    let  row = result.rowsAffected.toString();
                    console.log("update tran Allot card Id "+accountNew)
                    sql.close();
                    // data_Account = result.recordsets
                    // console.log(row)
                    
                    }).catch(err => {
                    console.log(err);
                    sql.close();
                 
                });    
            }catch{
                sql.close();
            }
        }

    }
}
async function datareconcileavg(callback){
    let dataavg
    try{
        let statement =`SELECT  dbo.VW_RECONCILE_DATA_AVG.Ref_No, 
                                dbo.VW_RECONCILE_DATA_AVG.Fund_Id, 
                                dbo.VW_RECONCILE_DATA_AVG.Tran_Date, 
                                dbo.VW_RECONCILE_DATA_AVG.Seq_No
                            FROM dbo.VW_RECONCILE_DATA_AVG  
                            ORDER BY dbo.VW_RECONCILE_DATA_AVG.Ref_No, 
                                dbo.VW_RECONCILE_DATA_AVG.Seq_No
     ` 

            await new sql.ConnectionPool(config).connect().then(pool => {
                    return pool.request() 
                    .query(statement);
                    }).then(result => {
                    // console.log(result);
                    let  row = result.rowsAffected.toString();
                    // console.log("update tran Allot card Id "+accountNew)
                    sql.close();
                    // data_Account = result.recordsets
                    // console.log(row)
                    dataavg = result.recordset
                    
                    }).catch(err => {
                    console.log(err);
                    sql.close();
                 
                });    
            }catch{
                sql.close();
            }
    // console.log(dataavg)
    for (const key in dataavg) { 
        let Ref_No = dataavg[key].Ref_No
        let Fund_Id = dataavg[key].Fund_Id
        let TranDate = dataavg[key].Tran_Date
        let Seq_No = dataavg[key].Seq_No
        let ExecuteDate = dataavg[key].ExecuteDate
        let date_ob = new Date(TranDate)
                let date = ("0"+date_ob.getDate()).slice(-2);
                let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
                let year = date_ob.getFullYear();
                let Tran_Date =  "'"+year +'-'+month +"-"+date+"'"
         console.log(Ref_No +'  '+Fund_Id  +'  '+ Seq_No)
         
         callUpsCostAvg(Ref_No,Fund_Id,null,null ,function(x){
            console.log(x)
         })
    }
     
    return callback(dataavg)
}
async function selectDataAccounttoFix(condition_st,callback){
    let data_TransactiontoFix
    try{
        let statement =` SELECT dbo.VW_RECONCILE_DATA_AVG.Ref_No, 
                                dbo.VW_RECONCILE_DATA_AVG.Fund_Id, 
                                dbo.VW_RECONCILE_DATA_AVG.Tran_Date, 
                                dbo.VW_RECONCILE_DATA_AVG.Seq_No
                         FROM dbo.VW_RECONCILE_DATA_AVG   WHERE dbo.VW_RECONCILE_DATA_AVG.Account_No ='${condition_st}'`
        console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            let txt = ""
            if(row > 0){
                data_TransactiontoFix = result.recordset
            }
            // return callback(result.recordset)
            // data_nav = result.recordset;
            sql.close();
        //  txtapi.push(txt)   
          
    
        }).catch(err => {
            console.log(err);
        sql.close();
        // return   callback(err);
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }

    for (const key in data_TransactiontoFix) {
        console.log(data_TransactiontoFix[key])
    }
    return callback("done")
}
async function TranpaymentType (callback){
    let data_TransactionPayment
    try{
        let statement = `SELECT   dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID,
                            dbo.MFTS_Transaction.Tran_No, 
                            dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE,
                            CASE
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'ATS_SA'		THEN 'C'
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'EATS_SA'		THEN '0'
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'TRN_SA'		THEN 'T'
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'CHQ_SA'		THEN 'Q'
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'CRC_SA'		THEN 'C'
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'COL_SA'		THEN '0'
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'ATS_AMC'	THEN 'C' 
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'TRN_AMC'	THEN 'T'  
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'CHQ_AMC'	THEN 'Q' 
                                WHEN dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE = 'CRC_AMC'	THEN 'C'   END AS type_payment_wr,
                                (SELECT TOP (1) Bank_ID  FROM REF_Banks WHERE Bank_IDNew = dbo.Fund_Cen_AllottedTransactions.BANK_CODE)as BANK_CODE, 
                            dbo.Fund_Cen_AllottedTransactions.BANK_ACCOUNT,
                            dbo.Fund_Cen_AllottedTransactions.CHEQUE_NO,
                            dbo.Fund_Cen_AllottedTransactions.ALLOTED_AMOUNT,
                            dbo.MFTS_Transaction.Seq_No 
                            ,dbo.Fund_Cen_AllottedTransactions.timestampx
                        FROM dbo.MFTS_PaymentInfo RIGHT JOIN 
                            dbo.Account_Info RIGHT OUTER JOIN
                            dbo.MFTS_UnitBalance RIGHT OUTER JOIN
                            dbo.Fund_Cen_AllottedTransactions LEFT OUTER JOIN
                            dbo.MFTS_Transaction ON 
                            dbo.Fund_Cen_AllottedTransactions.TRANS_CODE = dbo.MFTS_Transaction.TRANTYPECODEX
                            AND 
                            dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID = dbo.MFTS_Transaction.transactionId
                            ON 
                            dbo.MFTS_UnitBalance.Fund_Id = dbo.MFTS_Transaction.Fund_Id AND 
                            dbo.MFTS_UnitBalance.Ref_No = dbo.MFTS_Transaction.Ref_No ON 
                            dbo.Account_Info.Cust_Code = dbo.Fund_Cen_AllottedTransactions.FILTER01
                            ON dbo.MFTS_Transaction.Tran_No = dbo.MFTS_PaymentInfo.Tran_No
                                WHERE (dbo.Fund_Cen_AllottedTransactions.PAYMENT_TYPE <> '') AND (dbo.Fund_Cen_AllottedTransactions.STATUS ='ALLOTTED')  AND (Status_Id = 7)
                        `
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            let txt = ""
            if(row > 0){
                data_TransactionPayment = result.recordset
            }

            sql.close();
    
        }).catch(err => {  console.log(err);  sql.close();

        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
    let datarows = []
   
    for (const key in data_TransactionPayment) {
        let data_value =[]
        //  console.log(data_TransactionPayment[key].Tran_No)
        data_value.push(data_TransactionPayment[key].Tran_No)
        data_value.push(1)
        data_value.push(data_TransactionPayment[key].type_payment_wr)
        data_value.push(data_TransactionPayment[key].ALLOTED_AMOUNT)
        if(data_TransactionPayment[key].BANK_ACCOUNT.length <= 10){
            data_value.push(data_TransactionPayment[key].BANK_ACCOUNT)
        }else{
            // data_value.push(null)
            if(data_TransactionPayment[key].BANK_ACCOUNT.length == 11){ data_value.push(data_TransactionPayment[key].BANK_ACCOUNT.substring(1,14))}
            if(data_TransactionPayment[key].BANK_ACCOUNT.length == 12){ data_value.push(data_TransactionPayment[key].BANK_ACCOUNT.substring(2,14))}
            if(data_TransactionPayment[key].BANK_ACCOUNT.length == 13){ data_value.push(data_TransactionPayment[key].BANK_ACCOUNT.substring(3,14))}
            if(data_TransactionPayment[key].BANK_ACCOUNT.length == 14){ data_value.push(data_TransactionPayment[key].BANK_ACCOUNT.substring(4,14))}
        } 
        data_value.push(data_TransactionPayment[key].BANK_CODE)
        data_value.push(data_TransactionPayment[key].CHEQUE_NO)
        data_value.push("146")
        data_value.push(data_TransactionPayment[key].timestampx)
        data_value.push("146")
        data_value.push(data_TransactionPayment[key].timestampx)
        datarows.push(data_value)
    }
    // console.log(datarows)    
    try {

        let table = new sql.Table('MFTS_PaymentInfo');

        table.columns.add('Tran_No',            sql.VarChar(12)     , { nullable: false });
        table.columns.add('Seq_No',             sql.TinyInt         , { nullable: false });
        table.columns.add('Pay_Type',           sql.VarChar(1)      , { nullable: true });
        table.columns.add('Amount_Baht',        sql.Decimal(18,2)   , { nullable: true });
        table.columns.add('Bank_AccNo',         sql.VarChar(10)     , { nullable: true });
        table.columns.add('Bank_Id',            sql.Int             , { nullable: true });
        // table.columns.add('Bank_Branch_Id',     sql.Int             , { nullable: true });
        table.columns.add('Bank_ChequeNo',      sql.VarChar(20)     , { nullable: true });
        table.columns.add('Create_By',          sql.VarChar(20)     , { nullable: true });
        table.columns.add('Create_Date',        sql.DateTime        , { nullable: true });
        table.columns.add('Modify_By',          sql.VarChar(20)     , { nullable: true });
        table.columns.add('Modify_Date',        sql.DateTime        , { nullable: true });
        
        
        datarows.forEach(datarow => {
             
                table.rows.add.apply(table.rows, datarow)  
             
        });

        //console.dir(table);


        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);

            } else {
                // console.log(result);
                //** Best */
                 
                console.log("Number of records inserted MFTS_PaymentInfo :" + result.rowsAffected);
            }

           
            pool.close();
            sql.close();
        });

    //     return callback("Import data to Unitblance  is completed.");
    } catch (error) {
        console.log(error);
        return
        callback(error);
    }

    return callback("done")
}
async function updateTranIDForKeyManul(callback){
    try{
        //let yesterday ='2023-03-21'
        let datenow
        const today = new Date()
        const yesterday = new Date(today)
        let yt
        var chek_day = today.getDay();
        if (chek_day === 1){ 
            yt = yesterday.setDate(yesterday.getDate()-3) 
        }else{
            yt = yesterday.setDate(yesterday.getDate()-1) 
        }
        let today_date = ""
        let date_yt = new Date(yt)
        let dateyt = ("0"+date_yt.getDate()).slice(-2);
        let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
        let year_yt = date_yt.getFullYear();
        let dateyesterday = year_yt  +"-"+ month_yt  +"-"+ dateyt
        dateyesterday ='2023-03-21' //test 
        // const today = new Date()
        // let date_ob = new Date(today)
        // let date = ("0"+date_ob.getDate()).slice(-2); 
        // let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        // let year = date_ob.getFullYear();
        // datenow = year +"-"+  month +"-"+  date
        // console.log(dateyesterday)
        let statement =`BEGIN 
        DECLARE @TRAN_ID INT
        DECLARE @AMOUNT_BAHT DECIMAL(18,2)
        DECLARE @TRANSACTION_ID VARCHAR(30)
        DECLARE @REF_NO VARCHAR(20)
        DECLARE @TRAN_DATE DATE = '${dateyesterday}'
        DECLARE @CHK_TRANID VARCHAR(30) = ''
        DECLARE @temp table(TRAN_ID INT )
                
    
            DECLARE Update_tranid_cursor CURSOR LOCAL FOR
    
            SELECT TOP (100) PERCENT dbo.MFTS_Transaction.Tran_Id, 
        dbo.MFTS_Transaction.Ref_No, dbo.MFTS_Transaction.Amount_Baht, 
        dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID
    FROM dbo.Fund_Cen_AllottedTransactions RIGHT OUTER JOIN
        dbo.MFTS_Account ON 
        dbo.Fund_Cen_AllottedTransactions.UNITHOLDER_ID = dbo.MFTS_Account.Holder_Id
         RIGHT OUTER JOIN
        dbo.MFTS_Fund ON 
        dbo.Fund_Cen_AllottedTransactions.FUND_CODE = dbo.MFTS_Fund.Fund_Code
         RIGHT OUTER JOIN
        dbo.MFTS_Transaction ON 
        dbo.MFTS_Account.Ref_No = dbo.MFTS_Transaction.Ref_No AND 
        dbo.MFTS_Transaction.Fund_Id = dbo.MFTS_Fund.Fund_Id AND 
        dbo.Fund_Cen_AllottedTransactions.ALLOTED_AMOUNT = dbo.MFTS_Transaction.Amount_Baht
    WHERE (dbo.MFTS_Transaction.transactionId IS NULL) AND 
        (dbo.MFTS_Transaction.Status_Id = 5) AND 
        (dbo.MFTS_Transaction.Tran_Date = @TRAN_DATE)
    ORDER BY dbo.Fund_Cen_AllottedTransactions.TRANSACTION_ID
    
            OPEN Update_tranid_cursor
    
            FETCH NEXT FROM Update_tranid_cursor  INTO @TRAN_ID,@REF_NO,@AMOUNT_BAHT,@TRANSACTION_ID
                 WHILE @@FETCH_STATUS = 0
                      BEGIN
                            IF @TRANSACTION_ID = @CHK_TRANID
                            FETCH NEXT FROM Update_tranid_cursor  INTO @TRAN_ID,@REF_NO,@AMOUNT_BAHT,@TRANSACTION_ID
    
                             IF @TRANSACTION_ID != @CHK_TRANID
                                SET @CHK_TRANID = @TRANSACTION_ID
    
    
                            UPDATE MFTS_Transaction	SET transactionId  = @TRANSACTION_ID WHERE Tran_Id = @TRAN_ID
                            
                            INSERT INTO @temp
                            values(@TRAN_ID)
                            FETCH NEXT FROM Update_tranid_cursor  INTO @TRAN_ID,@REF_NO,@AMOUNT_BAHT,@TRANSACTION_ID
                      END
        
            CLOSE Update_tranid_cursor
            DEALLOCATE Update_tranid_cursor
    
            SELECT COUNT(*) as rows FROM @temp 
    END`

     await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
    
        }).then(result => {
            let row = result.rowsAffected
            console.log(result.recordset[0].rows)
            let txt = ""
            if(row > 0){
               // data_TransactionPayment = result.recordset
               console.log("update data manul "+result.recordset[0].rows + " rows")
            }
            // console.log(result)
            sql.close();
            return callback(result)
        }).catch(err => {  console.log(err);  sql.close();

        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
    
}
export {getDataTransaction ,importDataTransaction,checktounitholder, UpdateUnitBalancenull 
       ,checkseqnotoupdate, importDataTransaction_manul ,traansctionkeymanual ,getDataWaitingForUnitbalance
       , selectUnitbalance,getDataTransactiondate
       ,BatUpdateUnitBalance ,logDataTransactiondate,getDataReconcile ,sendmailReconcile ,dataTrantolog,fixDatatranavg ,averagCostdiff,totalcostdev,prepaireAccount
        ,callUSP_MFTS_RECAL_COSTAVG ,DailyImportSumAllot, cusHolderLevel,datareconcileavg,TranpaymentType ,updateTranIDForKeyManul }