
import express from 'express';
import sql from  'mssql';

import {config}  from './dbconfig.js';
import {qrAPIExcel,
        qrFundExc_Individual,
        qrFundExc_Account_CODE,
        qrBankAccountHeader,
        qrBankAccountItems,
        qrAPILoop, 
        qrIndividualFix, 
        qrSuitability, 
        qrIndividualAddress, 
        qrBankAccount, 
        qrBankAccountFIX ,
        qrAPILoopNull,
        AccountObj,
        AccountObjHeader,
        AccountObjItems  }  from './dbsql.js';
import {IndividualCustomer,Modelx} from './oindividual.js';
import {StatusUpdate,
        setErrorLog,
        fixCardExpiryDate,
        fixZero,
        getExpireNextYear,
        fixLastYear} from './dbutils.js';
import poolPromise from './db.js';


sql.on('error' , err => {
  console.log("dbIndividual:sql.on error");
  console.log( err);
})

// scope variable 
let xdata = [];
let xloop = [];
let oindividual=[];
let oaddress=[];
let ostability=[];
let oresult=[];
let oaccount=[];
let jdata = {};
let bankdata = {};
let bankitems = [];
let xbankdata = [];
let xbankheader = [];
let xbankitems  = [];
let fixExpiryDate = "";

//let redemptionBankAccounts = [];
//let subscriptionBankAccounts = [];

async function getIndividualId_LoopBy( datax , callback ) {
  xloop = [];
  let xSQL = "";

  try {
    
    switch(datax){
      case "FundExc_Individual":
        xSQL = qrFundExc_Individual;
        break;
      case "FundExc_Account_CODE":  
        xSQL = qrFundExc_Account_CODE;
        break;
    }
    
    await poolPromise.then( pool => {
      return pool.request()
      .query(xSQL)})
      .then( result =>{ 
        if(result.rowsAffected >= 1) {
          xloop.push(result.recordset);
          return callback(xloop[0]);
        } else {
          return callback(null);
        } 
      }
    )
    .catch( err => {
      console.log(err);
      return callback(err); 
      }); 


  } catch (error) {
    console.log(error);
    return callback(error);
  }

}


async function getExcelIndividualLoop( callback ) {
  xloop = [];
  try {
    let poolx = await sql.connect(config);
    let data1 = await poolx.request()
      .query(qrAPIExcel)
    //let statusx = data1.statusCode;
    xloop.push(data1.recordset);
    poolx.close();
    sql.close();
    //return callback(statusx);    
    return callback(xloop[0]);  

  } catch (error) {

    console.log(error);
    return callback(error);
  }

}


async function getCardIdLoop( callback ) {
  xloop = [];
  try {
    let pool = await sql.connect(config);
    let data1 = await pool.request()
      .query(qrAPILoopNull)
    
    xloop.push(data1.recordset);
    pool.close();
    sql.close();
    //return callback(xloop);    
    return callback(xloop[0]);  

  } catch (error) {

    console.log(error);
    return callback(error);
  }

}
//----- FIX request from one column bank data

async function getIndividualBankAccountX1(cardNumber , callback){
  try{
    console.log("run ... getIndividualBankAccountX1");
    let r_bankCode = "";
    let r_bankBranchCode = "";
    let r_bankAccountNo = "";
    let s_bankCode = "";
    let s_bankBranchCode = "";
    let s_bankAccountNo = "";
    let s_isdefault = "";

    let b_dataisOk = true;
    //let b_itemisOk = true;
    //let b_red = true;
    //let b_sub = true;
    let redemptionBankAccounts = [];
    let subscriptionBankAccounts = [];
    
    bankdata  = JSON.parse(AccountObjHeader); // default format
    bankitems = JSON.parse(AccountObjItems); // default format
    let result = getIndividuaBankX1(cardNumber,function(bankdb , ret){
      if ( ret != true ) {        
        console.log("Data is not complete for customer: "+cardNumber);          
        return false;
        //return callback (false);

      } else {
        
        
        try {
          //console.log("--- in try -----");
          //----Start header-------
          if (bankdb[0][0].Cust_Code != null){
            bankdata.cardNumber = bankdb[0][0].Cust_Code.trim();
            bankdata.accountId = bankdb[0][0].Cust_Code.trim();
          } else {
            b_dataisOk = false;
          } 
          
          bankdata.icLicense = bankdb[0][0].LicenseCode;
          bankdata.accountOpenDate = bankdb[0][0].CreateDate;
          bankdata.investmentObjective = bankdb[0][0].investmentObjective.trim();
          
          if (bankdata.investmentObjective == "PleaseSpecify") {
            bankdata.investmentObjectiveOther = "_";
          }

          if (bankdata.icLicense == null){
            bankdata.icLicense = "";
            setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ไม่มีข้อมูล icLicense", function (x){      
                console.log("ไม่มีข้อมูล icLicense");
            });
          }
          
          if (bankdata.accountOpenDate == null) {
            bankdata.accountOpenDate = fixLastYear();
            setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ไม่มีข้อมูล วันที่เปิดบัญชี ใส่ fake data แทน", function (x){      
              console.log("ไม่มีข้อมูล วันที่เปิดบัญชี ธนาคาร");
            });
          }
          //----END header-------
          //----Start Bank items---
          
          //console.log(bankdb[1]);
          //console.log(bankdb[1].length);
          if( bankdb[1].length > 0){
            //console.log("ok bankdb[1]>0");  
            
            for (let i=0;i<bankdb[1].length;i++){
              //console.log("i:");
              //console.log(i);
              bankitems[i] = JSON.parse(AccountObjItems);
              //--- reset bank items data
              bankitems[i].bankCode = null;
              bankitems[i].bankBranchCode = null;
              bankitems[i].bankAccountNo = null;
              bankitems[i].default = false;
              bankitems[i].finnetCustomerNo = false;  
                          
              //--- check bank id
              if(bankdb[1][i].Bank_Id == null || bankdb[1][i].Bank_Id == 0 ){
                s_bankCode = "";
                
                setErrorLog( bankdata.cardNumber, "5050/api/bankAccout", "E713", "ไม่มีข้อมูล ธนาคาร "+bankdb[1][i].Purpose.trim(), function (x){      
                  console.log("ไม่มีข้อมูล ธนาคาร "+bankdb[1][i].Purpose.trim());  
                });
                
              } else {
                s_bankCode = fixZero(bankdb[1][i].Bank_Id.trim(),3);              
              }
              
              //--- check bank branch
              if(bankdb[1][i].Bank_Branch == null || bankdb[1][i].Bank_Branch == 0 ){
                s_bankBranchCode = "";
                
                setErrorLog( bankdata.cardNumber, "5050/api/bankAccout", "E713", "ไม่มีข้อมูล สาขาธนาคาร "+bankdb[1][i].Purpose.trim(), function (x){      
                  console.log("ไม่มีข้อมูล สาขาธนาคาร "+bankdb[1][i].Purpose.trim());  
                });
                
              } else {
                s_bankBranchCode = fixZero(bankdb[1][i].Bank_Branch.trim(),4);              
              }
              
              //--- check bank number
              if(bankdb[1][i].Bank_Account == null || bankdb[1][i].Bank_Account == 0 ){
                s_bankAccountNo = "";
                
                setErrorLog( bankdata.cardNumber, "5050/api/bankAccout", "E713", "ไม่มีข้อมูล เลขบัญชี ธนาคาร "+bankdb[1][i].Purpose.trim(), function (x){      
                  console.log("ไม่มีข้อมูล เลขบัญชี ธนาคาร "+bankdb[1][i].Purpose.trim());  
                });
                
              } else {
                s_bankAccountNo = bankdb[1][i].Bank_Account.trim();              
              }
              s_isdefault = bankdb[1][i].Is_Default_Account.trim();
              
              bankitems[i].bankCode        = s_bankCode;
              bankitems[i].bankBranchCode  = s_bankBranchCode;
              bankitems[i].bankAccountNo   = s_bankAccountNo;
              
              
              //console.log(bankdb[1][i].Purpose.trim());
              if( bankitems[i].bankCode != "" && bankitems[i].bankBranchCode != "" && bankitems[i].bankAccountNo != "" ){ 

                if(bankdb[1][i].Purpose.trim() == "Redemption"){
                
                  redemptionBankAccounts.push(bankitems[i]);
                  //console.log("add redemptionBankAccounts");
                  //console.log(redemptionBankAccounts);
                }else if(bankdb[1][i].Purpose.trim() == "Subscription"){
                  subscriptionBankAccounts.push(bankitems[i]);
                  //console.log("add subscriptionBankAccounts");
                  //console.log(subscriptionBankAccounts);
                }
              
              }
            } // end for
            //console.log("redemptionBankAccounts----")
            //console.log(redemptionBankAccounts);
            //--issue require 2 side bank account
            
            if (redemptionBankAccounts.length > 0){
              bankdata["redemptionBankAccounts"] = redemptionBankAccounts;
              //console.log("redemptionBankAccounts");
            } else {
              //console.log("fuck..");
            }
  
            //console.log("subscriptionBankAccounts----")
            //console.log(subscriptionBankAccounts);
            if (subscriptionBankAccounts.length > 0){
              bankdata["subscriptionBankAccounts"] = subscriptionBankAccounts;
              //console.log("subscriptionBankAccounts");
            } else {
              //console.log("fuck........");
            }
            
            //--FIX require 2 side bank account by copy cross the missing one by 1 account
            if ( redemptionBankAccounts.length > 0 && subscriptionBankAccounts.length == 0 ){
              bankdata["subscriptionBankAccounts"] = [redemptionBankAccounts[0]];
            }

            if ( redemptionBankAccounts.length == 0 && subscriptionBankAccounts.length > 0 ){
              bankdata["redemptionBankAccounts"] = [subscriptionBankAccounts[0]];
            }
            bankdata["subscriptionBankAccounts"][0].default = true;
            bankdata["redemptionBankAccounts"][0].default = true;

            //bankdata["redemptionBankAccounts"] = redemptionBankAccounts;
            //bankdata["subscriptionBankAccounts"] = subscriptionBankAccounts;
          } //----End   Bank items---

          console.log(bankdata);
          return callback (bankdata);
            
        } // end try
        catch (erro){
          return callback (false);
        }
      }
    });
    
  }
  catch (error){
    console.log(error);
  }
}



//------
async function getIndividualBankAccount(cardNumber , callback){
  try{
    let r_bankCode = "";
    let r_bankBranchCode = "";
    let r_bankAccountNo = "";
    let s_bankCode = "";
    let s_bankBranchCode = "";
    let s_bankAccountNo = "";

    let b_dataisOk = true;

    bankdata = JSON.parse(AccountObj); // default format
    let result = getIndividuaBank(cardNumber,function(bankdb , ret){
      if ( ret != true ) {        
        return false;
      } else {
        

        try {
          
          //----Start header-------
          if (bankdb[0].Cust_Code != null){
            bankdata.cardNumber = bankdb[0].Cust_Code.trim();
            bankdata.accountId = bankdb[0].Cust_Code.trim();
          } else {
            b_dataisOk = false;
          } 
          
          bankdata.icLicense = bankdb[0].LicenseCode;
          bankdata.accountOpenDate = bankdb[0].CreateDate;
          bankdata.investmentObjective = bankdb[0].investmentObjective.trim();
          
          if (bankdata.investmentObjective == "PleaseSpecify") {
            bankdata.investmentObjectiveOther = "_";
          }

          if (bankdata.icLicense == null){
            bankdata.icLicense = "";
            setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ไม่มีข้อมูล icLicense", function (x){      
                console.log("ไม่มีข้อมูล icLicense");
            });
          }
          
          if (bankdata.accountOpenDate == null) {
            bankdata.accountOpenDate = fixLastYear();
            setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ไม่มีข้อมูล วันที่เปิดบัญชี ใส่ fake data แทน", function (x){      
              console.log("ไม่มีข้อมูล วันที่เปิดบัญชี ธนาคาร");
            });
          }
          //----END header-------



          if(bankdb[0].Bank_Id == null || bankdb[0].Bank_Id == 0 ){
            s_bankCode = "";
            setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ไม่มีข้อมูล ธนาคาร Subscript", function (x){      
              console.log("ไม่มีข้อมูล ธนาคาร Subscript");  
            });
          } else {
            s_bankCode = fixZero(bankdb[0].Bank_Id,3);              
          }

          
          if(bankdb[0].Bank_Branch == null || bankdb[0].Bank_Branch == 0) {
            s_bankBranchCode = "";
            setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ไม่มีข้อมูล สาขาธนาคาร Subscript", function (x){      
              console.log("ไม่มีข้อมูล สาขาธนาคาร Subscript");  
            });
          } else {
            s_bankBranchCode = fixZero(bankdb[0].Bank_Branch,4);

          }
          
          
          bankdata.subscriptionBankAccounts[0].bankCode = s_bankCode;          
          bankdata.subscriptionBankAccounts[0].bankBranchCode = s_bankBranchCode;
          
          //--- check ACC Subscript bank invalid
          if( bankdb[0].Bank_Account == null ) {
            //[713] ไม่ใส่ Bank Account
            bankdata.subscriptionBankAccounts[0].bankAccountNo = "";
            setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ACC Subscript ไม่มีเลขบัญชีธนาคาร", function (x){      
              console.log("ACC Subscript ไม่มีเลขบัญชีธนาคาร");
            });
                        
          } else {
            bankdata.subscriptionBankAccounts[0].bankAccountNo = bankdb[0].Bank_Account.trim();
          }
          
          
          if (bankdb[0].Bank_IdReturn == null || bankdb[0].Bank_IdReturn == 0 ){ 
            r_bankCode = "";
            setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ไม่มีข้อมูล ธนาคาร Subscript", function (x){      
              console.log("ไม่มีข้อมูล ธนาคาร Redemption");  
            });
          } else {
            
            r_bankCode = fixZero(bankdb[0].Bank_IdReturn,3);  
            
          }
          
          if (bankdb[0].Bank_BranchReturn == null || bankdb[0].Bank_BranchReturn == 0){
              r_bankBranchCode = "";
              setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ไม่มีข้อมูล สาขาธนาคาร Subscript", function (x){      
                console.log("ไม่มีข้อมูล สาขาธนาคาร Redemption");  
              });
          } else {
            r_bankBranchCode = fixZero(bankdb[0].Bank_BranchReturn,4);  
          }
          
          bankdata.redemptionBankAccounts[0].bankCode = r_bankCode;
          bankdata.redemptionBankAccounts[0].bankBranchCode = r_bankBranchCode;
         
          //--- check bank invalid
          if( bankdb[0].Bank_AccountReturn == null ) {
            //[713] ไม่ใส่ Bank Account
            bankdata.redemptionBankAccounts[0].bankAccountNo = "";
            setErrorLog( bankdata.cardNumber, "5050/api/individualAccout", "E713", "ACC Redemption ไม่มีเลขบัญชีธนาคาร", function (x){      
              console.log("ACC Redemption ไม่มีเลขบัญชีธนาคาร");
            });
            
          } else {
            bankdata.redemptionBankAccounts[0].bankAccountNo = bankdb[0].Bank_AccountReturn.trim();
          } 
          //console.log(bankdb[0]);
          //console.log("LicenseCode:"+bankdb[0].LicenseCode);
          //console.log("License_Code:"+bankdb[0].License_Code);
          //console.log(bankdata);
          return callback (bankdata);
            
        }
        catch (erro){
          return callback (false);
        }
      }
    });
    
  }
  catch (error){
    console.log(error);
  }
}


async function getIndividualAccount(cardNumber , callback){
  try{
    //--- reset variable
    xdata = [];
    oindividual=[];
    oaddress=[];
    ostability=[];
    oresult=[];    
    oaccount=[];
    jdata = {};
    fixExpiryDate = "";

    let result = getIndividuaData(cardNumber,function(mftsdb , ret){
      
      //console.log("=====data from getIndividualDataz ===============");
      console.log(mftsdb); 
      //console.log("=====end  from getIndividualDataz ===============");
      if ( ret != true ) {
        
        return false;
      } else {
      //console.log(mftsdb);
      //console.log('cycleChk', JSON.safeStringify(mftsdb));

      try{
        
        const text = '{"suitNo1":1, "suitNo2":1, "suitNo3":1,"suitNo4":1, "suitNo5":1, "suitNo6":1,"suitNo7":1, "suitNo8":1, "suitNo9":1,"suitNo10":1, "suitNo11":1, "suitNo12":1}';
        const suitNo = JSON.parse(text);
        
      
        var idAddress1 = null;
        var idAddress2 = null;
        var idAddress3 = null; 
        
        var idBase     = null;
        var sutibility = null; 
        var idAccount  = null;
        let addlen = null;
        
        //--- check address 
      
        addlen =  mftsdb[1].length;
        console.log("number of address group:" + mftsdb[1].length );
        if (addlen >= 3) {
          idAddress1 = mftsdb[1][0];
          idAddress2 = mftsdb[1][1];
          idAddress3 = mftsdb[1][2];
        
        } else if (addlen == 2) {
          idAddress1 = mftsdb[1][0];
          idAddress2 = mftsdb[1][1];
          idAddress3 = mftsdb[1][0]; 
        
        } else if (addlen == 1) {
          idAddress1 = mftsdb[1][0];
          idAddress2 = mftsdb[1][0];
          idAddress3 = mftsdb[1][0];  
        }
       
        idBase = mftsdb[2][0];
        sutibility = mftsdb[0];
        idAccount  = mftsdb[3];
      

        //--- makeup data for suitablilty 
        //--- loop for suitablilty
        let y = 1;
        let s = ``;   
        let sx = sutibility.length;
        let xx = 0;
     
        var errorList = [];
        var ei = 0;
        var errorLength = 0;
        var hasErro = false;
        //--- ใส่ข้อมูลเทียม suit No. ให้ครบ 12
        if ( sx < 12) {
          setErrorLog( cardNumber, "5050/api/individualAccout", "E702", "suit No มีไม่ครบ 12 รายการ ระบบใส่ข้อมูลเทียม เทียม", function (x){      
          });    
      
          let ix = 0;
          if (sx > 0) {
            ix = sx-1;
          } else {
            ix = 0;
          } 
      
          for (let i=ix;i<12;i++ ){
            sutibility.push({ "suitNo": 1});
            //console.log(sutibility[i]["suitNo"]);  
          }
        } //---- เสร็จการซ่อม
        //---- mode data กรณี = 0 แก้เป็น 1
        //--- แก้ปัญหา ระบบไม่ support block coding
        for (let i=0;i<12;i++){
          s = "suitNo"+y;
          xx = sutibility[i]["suitNo"];
        
          if (xx == 0) {
            //-- ให้ใส่ค่าที่ไม่มี ลงไปก่อน
            hasErro = true;
            suitNo[s] = 1; 
            //-- input dynamic data into array
            errorList[ei] = s + " มีค่า=0 ระบบ fake เป็น 1";
            ei++;
            
          } else {
            suitNo[s] = xx;  
          }
          y++;
        }
        //--- update error log with array
        errorLength = errorList.length;
        if (hasErro) {
          for (var ix = 0; ix < errorLength; ix++) {
            console.log(errorList[ix]);
            setErrorLog( cardNumber, "5050/api/individualAccout", "E702", errorList[ix], function (x){      
                         
            });
          }    
        } 


        //==========================================================================================================
        // Mandatory Check
        // No Data available by sapi
        //----------------------------------------------------------------------------------------------------------

        //---[801] identificationCardType = CITIZEN_CARD -> 
        if ( idBase["cardNumber"] != null ) {
          idBase["identificationCardType"] = "CITIZEN_CARD";
          idBase["accompanyingDocument"] = "CITIZEN_CARD";
        } else if ( idBase["cardNumber"] == null  ) {
          idBase["cardNumber"] = cardNumber;
          idBase["identificationCardType"] = "CITIZEN_CARD";
          idBase["accompanyingDocument"] = "CITIZEN_CARD";
          setErrorLog( cardNumber, "5050/api/individualAccout", "E700", "ไม่มีข้อมูล เลขบัตรประชาชน", function (x){
            console.log("ไม่มีข้อมูล cardNumber "); 
          });
        } else {
          idBase["identificationCardType"] = "PASSPORT";
          idBase["accompanyingDocument"] = "ALIEN_CARD"; //บัตรต่างด้าว
        }

        //---[802] occupationId -> ตารางอาชีพ ถ้าใส่ อื่นๆ ( 170 ) ต้องระบุเพิ่มใน occupationOther ว่าคืออะไร         
        //---[803] businessTypeId -> ตารางประเภทธุรกิจ ถ้าใส่ อื่นๆ ( 180 ) ต้องระบุเพิ่มใน businessTypeOther ว่าคืออะไร
        //---[804] incomeSource  -> ตารางประเภทแหล่งรายได้  ถ้าใส่ อื่นๆ ( OTHER ) ต้องระบุเพิ่มใน incomeSourceOther ว่าคืออะไร
        //---[805] companyName / workPosition -> ชื่อสถานที่ทำงาน / ตำแหน่งงาน  เป็น mandatory กรณี occupationId =30,40,50,60,70,110,130,150,160,170)
        //---[806] canAcceptFxRisk / canAcceptDerivativeInvestment  -> true/false   [5]
        //---[807] suitabilityRiskLevel  -> ระดับความเสี่ยง -> 1,2,3,4,5
        //---[808] fatca, fatcaDeclarationDate
        //---[809] openFundConnextFormFlag -> Y/N/S
        //---[810] monthlyIncomeLevel  -> ตารางรายได้ 9 ระดับ 
        //---[701] ไม่มีชื่อภรรยา กรณี มีข้อมูลแต่งงาน
        //---[702] suitNo มี บาง accout ที่ไม่มี ข้อมูล suitNo -> row = 0 ให้ manul ใส่ หนึ่งเข้าไปก่อน แล้ว update status ว่า 'NO suitno'
        //---[710] ไม่ใส่ Bank Account

        //---[704] suitabilityRiskLevel ต้องมีข้อมูล
        if (idBase["suitabilityRiskLevel"] == null || idBase["suitabilityRiskLevel"] == ""  ) {
          idBase["suitabilityRiskLevel"] = "1"  

          setErrorLog( cardNumber, "5050/api/individualAccout", "E704", "suitabilityRiskLevel ไม่ได้เลือกไว้!", function (x){
            console.log("suitabilityRiskLevel must not null "); 
          });
        }

        //---[705] mobileNumber ต้องมี FORMAT เป็นตัวเลข 10 หลัก ไม่มีขึด 
        let chkMobile = "";
        let mobileMsg = "";
        let mobileError = false;
        chkMobile = idBase["mobileNumber"];

        if (chkMobile == null){
          mobileError = true;
          mobileMsg = "ไม่มีเบอร์โทรศัทพ์มือถือ";
        } else if (chkMobile.length < 10) {
          mobileError = true;
          mobileMsg = "เบอร์โทรศัทพ์มือถือมีไม่ครบ 10ตัว"; 
        } else if ( chkMobile.search("-") > 0) {
          mobileError = true;
          mobileMsg =  mobileMsg + " เบอร์โทรศัทพ์มือถือต้องไม่มีขีด";
        }

        if ( mobileError ) {
          idBase["mobileNumber"] = "0899999999";
          setErrorLog( cardNumber, "5050/api/individualAccout", "E705", mobileMsg, function (x){
            console.log(mobileMsg); 
          });
        }



        //--- "maritalStatus": "Married/Single" // ถ้าไม่มี เต๊ะออก -> update ที่ FLAG = marrier name
        var isMarit = ""; 
        var cwift = "xxx";
        var ecwife = "xxx";
        isMarit = idBase["maritalStatus"];

        if (isMarit == null){
          idBase["maritalStatus"] = "Single";
          setErrorLog( cardNumber, "5050/api/individualAccout", "E701", "ไม่มีข้อมูล MaritalStatus ระบบ fake ข้อมูลเป็น Single", function (x){
            console.log("ไม่มีข้อมูล MaritalStatus ระบบ fake ข้อมูลเป็น Single"); 
          });

        } else if ( isMarit.trim() == "Married" ) {
                  
          const wifetext = `
                          {
                            "thFirstName": "null",
                            "thLastName": null,
                            "enFirstName": null,
                            "enLastName": null
                          }`;
          const spouse = JSON.parse(wifetext);
          cwift = idAccount["My_wife"];                
          ecwife = idAccount["Wife_English"];                
          if (cwift != null) {
            
            let sept = cwift.search(" ");
            //let sep = cwife.indexOf(" ");    
            spouse["thFirstName"] = cwife.substring(0,sept);
            spouse["thLastName"]  = cwife.substring( sept + 1 );

          } else {
            setErrorLog( cardNumber, "5050/api/individualAccout", "E701", "ไม่มีชื่อภรรยา ภาษาไทย ระบบใส่ชื่อ เทียม", function (x){
            
            });
          spouse["thFirstName"] = "กขค";
          spouse["thLastName"]  = "งจฉ";

        }
        
        if ( ecwife != null ) {
          
          let esep = ecwife.search(" ");
          spouse["enFirstName"] = ecwife.substring(0,esep);
          spouse["enLastName"]  = ecwife.substring( esep + 1 );
        } else {
          setErrorLog( cardNumber, "5050/api/individualAccout", "E701", "ไม่มีชื่อภรรยา ภาษาอังกฤษ ระบบใส่ชื่อเทียม", function (x){
            
          });
          spouse["enFirstName"] = "ABC";
          spouse["enLastName"]  = "XYZ";

        }                   
        idBase["spouse"] = spouse;
      } 
      
      //LastUpdate 19-08-2021 time      
      //---- Address coutry ต้องเป็นตัวย่อ สองหนัก ใส่ชั่วคราว
      //---[811] country  -> ตาราง ประเทศ ชื่อย่อ สองหลัก
      
      idAddress3["country"] = "TH";
      idAddress2["country"] = "TH";
      idAddress1["country"] = "TH";
      
      //=========================      
      //--- add sub1 for address
      //=========================
            

      idBase["identificationDocument"] = idAddress1;           
      idBase["current"] = idAddress2;
      idBase["work"] = idAddress3;
      idBase["suitabilityForm"] = suitNo; 
      
      
      //========================================================================================================
      // FIX DATA
      //========================================================================================================
      if (idBase["titlexOther"] == "OTHER") {
        idBase["title"] = "OTHER";
        idBase["titleOther"] = idBase["titlexOther"];  
      } else {
        idBase["title"] = idBase["titlexOther"];
        idBase["titleOther"] = null;
      }

      if (idBase["occupationIdx"] == "170"){
        idBase["occupationId"] = "170";
        idBase["occupationOther"] = idBase["occupationOtherx"];
      } else {
        idBase["occupationId"] = idBase["occupationIdx"];
        idBase["occupationOther"] = null;
      }

      
      idBase["incomeSource"] = idBase["incomeSourcex"].trim();
      if (idBase["incomeSource"] == "OTHER") {
        idBase["incomeSourceOther"] = "OTHER";
      } 
      
      //idBase["businessTypeId"] = "30";  // การเงิน การธนาคาร
      if (idBase["businessTypeId"] == "180"){
        idBase["businessTypeOther"] = idBase["businessTypeName"];
      }

      if (idBase["monthlyIncomeLevel"] == null){
        idBase["monthlyIncomeLevel"] = "LEVEL5";
        setErrorLog( cardNumber, "5050/api/individualAccout", "E810", "monthlyIncomeLevel มีค่าเป็น null ระบบ แก้เป็น level5", function (x){
            console.log("monthlyIncomeLevel มีค่าเป็น null ระบบ แก้เป็น level5");
        });
      } else {
        idBase["monthlyIncomeLevel"] = idBase["monthlyIncomeLevelx"].trim();
      }
      //--- fix CarExpiryDate null
      //---[703] cardExpiryDate	ต้องมีข้อมูล
      if (idBase["cardExpiryDate"] == null){
        idBase["cardExpiryDate"] = getExpireNextYear();
        setErrorLog( cardNumber, "5050/api/individualAccout", "E703", "ข้อมูล CarExpireDate ไม่มีข้อมู fake data เป็น "+ idBase["cardExpiryDate"], function (x){
          console.log("cardExpiryDate is null system fixed " + idBase["cardExpiryDate"]);  
        });
      }
      
         
      

      //--- fix CarExpiryDate 
      fixExpiryDate = fixCardExpiryDate(idBase["cardExpiryDate"]);

      if ( fixExpiryDate != idBase["cardExpiryDate"] ) {
        idBase["cardExpiryDate"] = fixExpiryDate;
        setErrorLog( cardNumber, "5050/api/individualAccout", "E703", "ข้อมูล CarExpireDate fake data เป็น "+fixExpiryDate, function (x){
            
        });
      }


      // --- order to hardcode
      idBase["incomeSourceCountry"] = "TH";
      idBase["canAcceptFxRisk"] = true;
      idBase["canAcceptDerivativeInvestment"] = true;
      idBase["fatca"] = false;

      idBase["nationality"] = "TH";
      idBase["referralPerson"] = "สุจารี";
      
      idBase["fax"] = "0299999999";
      
      idBase["openChannel"] = "2";   // 1,2 -> ONLINE / OFFLINE
      idBase["investorClass"] = "1";  // 1,2,3 -> UI / HNW / Retail
      idBase["phone"] = "0299999999";

      idBase["workPosition"] = "_"; 
      
      if (idBase["companyName"] == null || idBase["companyName"] == ""){
        idBase["companyName"] = "_";
      }

      //idBase["businessTypeId"] = "30";  // การเงิน การธนาคาร
      //idBase["openFundConnextFormFlag"] = "Y"; //Open From document
      idBase["approved"] = true; //ได้ตรวจสอบแล้ว
      //========================================================================================================
      // No Data available 
      // Input junk data for testing only
      //--------------------------------------------------------------------------------------------------------
      

      //---[802] occupationId -> ตารางอาชีพ ถ้าใส่ อื่นๆ ( 170 ) ต้องระบุเพิ่มใน occupationOther ว่าคืออะไร         
      //idBase["occupationId"] = "170";    // นักลงทุน จะได้ไม่ต้องระบุ companyName , workPosition
      //idBase["occupationOther"] = "OTHER"; //170
      
      //---[805] companyName / workPosition -> ชื่อสถานที่ทำงาน / ตำแหน่งงาน  เป็น mandatory กรณี occupationId =30,40,50,60,70,110,130,150,160,170)
      //idBase["workPosition"] = "MD"; 
      //idBase["companyName"] = "XYZ";
      
      //---[803] businessTypeId -> ตารางประเภทธุรกิจ ถ้าใส่ อื่นๆ ( 180 ) ต้องระบุเพิ่มใน businessTypeOther ว่าคืออะไร
      //idBase["businessTypeId"] = "30";  // การเงิน การธนาคาร
      
      //---[804] incomeSource  -> ตารางประเภทแหล่งรายได้  ถ้าใส่ อื่นๆ ( OTHER ) ต้องระบุเพิ่มใน incomeSourceOther ว่าคืออะไร
      //idBase["incomeSource"] = "OTHER";
      //idBase["incomeSourceOther"] = "OTHER";
      
      //idBase["incomeSourceCountry"] = "TH";
      //---[806] canAcceptFxRisk / canAcceptDerivativeInvestment  -> true/false   [5]
      //idBase["canAcceptFxRisk"] = true;
      //idBase["canAcceptDerivativeInvestment"] = true;
      //---[808] fatca, fatcaDeclarationDate
      //idBase["fatca"] = false;
      //---[809] openFundConnextFormFlag -> Y/N/S
      //idBase["openFundConnextFormFlag"] = "Y"; //Open From document
      

      
      //idBase["approved"] = true; //ได้ตรวจสอบแล้ว
      
      //idBase["title"] = "OTHER";
      //idBase["titleOther"] = "OTHER";

      //idBase["nationality"] = "TH";
      //idBase["referralPerson"] = "Developer";
      
      //idBase["fax"] = "0299999999";
      
      //idBase["openChannel"] = "2";   // 1,2 -> ONLINE / OFFLINE
      //idBase["investorClass"] = "1";  // 1,2,3 -> UI / HNW / Retail
      //idBase["phone"] = "0299999999";
      //---[810] monthlyIncomeLevel  -> ตารางรายได้ 9 ระดับ 
      //idBase["monthlyIncomeLevel"] = "LEVEL5";
      //console.log("chek idBase data..");
      //console.log(idBase);
      
//==============
//Final Return
//==============
      //console.log("getIndividualAccount: "+cardNumber +" ok");  
      //jdata = new IndividualCustomer(idBase);
      //console.log(jdata.toJJ());
      //return callback( jdata.toJJ() );  
      return callback(idBase);
      
      
      } catch (error){
        console.log(error);

      }   
    } // end if  
  });   //****** */ end getIndividuaData()


    return result; 

  }
  catch (error) {
      console.log(error);
      return callback( error);
  }

}

async function getIndividuaBank(cardNumber , callback) {
    let bankdata = true;

    xbankdata = null;
    xbankdata = [];
    let pool = await sql.connect(config);
    try{
        let data1 = await pool.request()
        .input('input_cardNumber', sql.NChar, cardNumber)
        .query(qrBankAccountFIX);
        
        if ( data1.rowsAffected >= 1 ) {
          for (let i=0;i<data1.rowsAffected;i++){
            xbankdata.push(data1.recordset[i]);
          }  
          bankdata = true;
          
        } else {
          bankdata = false;
          console.log("No Bank Account data , for :"+cardNumber);
        }
        pool.close();
        sql.close();
        return callback(xbankdata, bankdata);
    }
    catch(error){
      console.log(error);
      return callback(error , false);
    }
   
  }

  async function getIndividuaBankX1(cardNumber , callback) {
    let bankdata = true;

    xbankdata   = null;
    xbankheader = null;
    xbankitems  = null;
    
    xbankdata   = [];
    xbankheader = [];
    xbankitems  = [];


    let pool = await sql.connect(config);
    try{
        let data1 = await pool.request()
        .input('input_cardNumber', sql.NChar, cardNumber)
        .query(qrBankAccountHeader);
        
        if ( data1.rowsAffected >= 1 ) {
          for (let i=0;i<data1.rowsAffected;i++){
            xbankheader.push(data1.recordset[i]);
          }  
          xbankdata.push(xbankheader);
          bankdata = true;
          
        } else {
          bankdata = false;
          xbankdata.push(xbankheader);
          console.log("No Bank Account Header data , for :"+cardNumber);
        }
        
        let data2 = await pool.request()
        .input('input_cardNumber', sql.NChar, cardNumber)
        .query(qrBankAccountItems);
        if ( data2.rowsAffected >= 1 ) {
          for (let i=0;i<data2.rowsAffected;i++){
            xbankitems.push(data2.recordset[i]);
          }  
          xbankdata.push(xbankitems);
          bankdata = true;
          
        } else {
          bankdata = false;
          xbankdata.push(xbankitems);
          console.log("No Bank Account Item data , for :"+cardNumber);
        }


        
        pool.close();
        sql.close();
        //console.log("getIndividuaBankX1:xbankdata")
        //console.log(xbankdata[1]);
        return callback(xbankdata, bankdata);
    }
    catch(error){
      console.log(error);
      return callback(error , false);
    }
   
  }


async function getIndividuaData(cardNumber , callback) {
  let hasdata = true;
  try{
  //--- Suitability
    xdata = null;
    ostability = null;
    oaddress = null;
    oindividual = null;
    oaccount = null;
    
    xdata = []; 
    ostability = [];
    oaddress = [];
    oindividual = [];
    oaccount = [];


    let pool = await sql.connect(config);
    try {
  
      let data1 = await pool.request()
        .input('input_cardNumber', sql.NChar, cardNumber)
        .query(qrSuitability);
        
      if ( data1.rowsAffected >= 1 ) {
        for (let i=0;i<data1.rowsAffected;i++){
          ostability.push(data1.recordset[i]);
        }  
        xdata.push(ostability);
      } else {
        //hasdata = false;
        xdata.push(ostability);
        console.log("No sutibility data , system input fake data");
      }
  
    } catch (error) {
      console.log(error);
      return callback(error , false);
    }  
    
  //--- Address
  try{
  
    let data2 = await pool.request()
    .input('input_cardNumber', sql.NChar, cardNumber)
    .query(qrIndividualAddress);
    
    if ( data2.rowsAffected >= 1 ) {
      for (let i=0;i<data2.rowsAffected;i++){
        oaddress.push(data2.recordset[i]);
      }
      xdata.push(oaddress);
    } else {
      xdata.push(oaddress);
      setErrorLog( cardNumber, "5050/api/individualAccout", "E703", "ไม่มี ข้อมูล Address", function (x){
        console.log("cardNumber " +cardNumber+  " ไม่มีข้อมูล Address");      
      });
      hasdata = false;
    }  
  } catch (error) {
    console.log(error);
    return callback(error , false);
  }  


  //--- Individual
  try{
  
    let data3 = await pool.request()
    .input('input_cardNumber', sql.NChar, cardNumber)
    .query(qrIndividualFix);
  
    if ( data3.rowsAffected >= 1 ) {
      for (let i=0;i<data3.rowsAffected;i++){
        oindividual.push(data3.recordset[i]);
      }
      xdata.push(oindividual);
    } else {
      setErrorLog( cardNumber, "5050/api/individualAccout", "E710", "ไม่มี ข้อมูล Individual", function (x){
        console.log("cardNumber " +cardNumber+  " ไม่มีข้อมูล Individual");      
      });
      hasdata = false;

    }
  } catch (error) {
      console.log(error);
      return callback(error , false);
  }
    
  //--- Account
  try {
    let data4 = await pool.request()
    .input('input_cardNumber', sql.NChar, cardNumber)
    .query(qrBankAccount)
    if ( data4.rowsAffected >= 1 ) {
      for (let i=0;i<data4.rowsAffected;i++){
        oaccount.push(data4.recordset[i]);
      }
      xdata.push(oaccount);
    } else {
      setErrorLog( cardNumber, "5050/api/individualAccout", "E711", "ไม่มี ข้อมูล Account", function (x){
        console.log("cardNumber " +cardNumber+  " ไม่มีข้อมูล Account");      
      });
      hasdata = false;
    }
  } catch (error) {
    console.log(error);
    return callback(error , false);
  }  




  pool.close();
  sql.close();    
  
  return callback(xdata , hasdata);

  
  } catch (error) {
      console.log(error);
  }
  return true;
}



async function test2json(){
  
  
  try{
    let iBase = [];
    iBase["identificationCardType"] = "CITIZEN_CARD"; 
    iBase["cardNumber"] = "12343333333";
    iBase["cardExpiryDate"] = "20290101";
    var myClass = new IndividualCustomer(iBase);
    let data = myClass.toJJ();
    console.log(JSON.stringify(data));
  
    return data;


  } catch (err) {
    console.error(err);

  }
  
}


async function testdbjson(){
  
  console.log("testdbjson");
  let pool = await sql.connect(dbConfig);

    try {
        
        let result = await pool.request()
          .input('input_cardNumber', sql.NChar, "3100203336040")
          .query(dbsql.qrIndividualAddress);
        
          if ( result.rowsAffected >= 1 ) {
          //let data = JSON.parse(result.recordset);
          console.log(result.recordset.length);
          let d1 = result.recordset[0]; 
          console.log(d1);
          let d2 = JSON.stringify(d1);    
          console.log(d2);
          let d3 = JSON.parse(d2);
          console.log(d3);
          //console.log(data);
           
        } else {
          console.log("no data");
        }
    } catch (err) {
        // ... error checks
    }
  

}


export  {
    test2json,
    getIndividualAccount,
    getIndividuaData,
    getCardIdLoop,
    getIndividualBankAccount,
    getIndividualBankAccountX1,
    testdbjson,
    getExcelIndividualLoop,
    getIndividualId_LoopBy
};