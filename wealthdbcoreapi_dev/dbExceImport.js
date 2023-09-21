import express from 'express';
import sql from  'mssql';

import {config}  from './dbconfig.js';
import {spouseObj,AddressObj,excelIndividual,excelIndividual4,qrAPILoop, qrIndividualFix, qrSuitability, qrIndividualAddress, qrBankAccount, qrBankAccountFIX ,qrAPILoopNull,AccountObj  }  from './dbsql.js';
import {IndividualCustomer,Modelx} from './oindividual.js';
import {StatusUpdate,setErrorLog,fixCardExpiryDate,fixZero,getExpireNextYear,fixLastYear} from './dbutils.js';

/*
sql.on('error' , err => {
  console.log("dbIndividual:sql.on error");
  console.log( err);
})
*/

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
let xbankdata = [];
let fixExpiryDate = "";
let identificationDocument = {};
let current = {};
let work = {};
let spouse = {};


async function getExcelIndividual(cardNumber , callback){
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
  
      identificationDocument = JSON.parse(AddressObj);
      current                = JSON.parse(AddressObj);
      work                   = JSON.parse(AddressObj);
      spouse                 = JSON.parse(spouseObj);

      let result = getExcelIndividualData(cardNumber,function(mftsdb , ret){
        //console.log("---------------------------------");
        //console.log(mftsdb[0]); 
        //console.log("---------------------------------");
        if ( ret != true ) {
          
          return false;
        } else {
        
          try {
            //--- Job list
            //-----------------------------
            // 1. Make Address & fix address code
            //-----------------------------
            
            var idBase     = {};
            var sutibility = null; 
            var idAccount  = null;
            let addlen = null;
            
            idBase = mftsdb[0][0];
            //console.log("-------------------------------");
            //console.log(idBase);
            //console.log("-------------------------------");
            
            //--- Address:identificationDocument
            if (idBase.noA != null){
              identificationDocument.no = idBase.noA ; 
            }
            
            if(idBase["roomNoA"] != null){
              identificationDocument["roomNo"] = idBase["roomNoA"];
            }
            
            if(idBase["floorsA"] != null){
              identificationDocument["floors"] = idBase["floorsA"];
            }
            if(idBase["buildingA"] != null){
              identificationDocument["building"] = idBase["buildingA"];
            }
            if(idBase["soiA"] != null){
              identificationDocument["soi"] = idBase["soiA"];
            }
            if(idBase["roadA"] != null){
              identificationDocument["road"] = idBase["roadA"];
            }
            if(idBase["mooA"] != null){
              identificationDocument["moo"] = idBase["mooA"];
            }
            if(idBase["postalCodeA"] != null){
              identificationDocument["postalCode"] = idBase["postalCodeA"].trim();
            }
            if(idBase["subDistrictA"] != null){
              identificationDocument["subDistrict"] = idBase["subDistrictA"];
            }
            if(idBase["districtA"] != null){
              identificationDocument["district"] = idBase["districtA"];
            }
            if(idBase["provinceA"] != null){
              identificationDocument["province"] = idBase["provinceA"];
            }
            if(idBase["countryA"] != null){
              identificationDocument["country"] = idBase["countryA"];
            }
            console.log("Address:identificationDocument");
            console.log(identificationDocument);


            //--- Address:current
            if (idBase.noB != null){
              current.no = idBase.noB ; 
            }
            
            if(idBase["roomNoB"] != null){
              current["roomNo"] = idBase["roomNoB"];
            }
            
            if(idBase["floorsB"] != null){
              current["floors"] = idBase["floorsB"];
            }
            if(idBase["buildingB"] != null){
              current["building"] = idBase["buildingB"];
            }
            if(idBase["soiB"] != null){
              current["soi"] = idBase["soiB"];
            }
            if(idBase["roadB"] != null){
              current["road"] = idBase["roadB"];
            }
            if(idBase["mooB"] != null){
              current["moo"] = idBase["mooB"];
            }
            if(idBase["postalCodeB"] != null){
              current["postalCode"] = idBase["postalCodeB"].trim();
            }
            if(idBase["subDistrictB"] != null){
              current["subDistrict"] = idBase["subDistrictB"];
            }
            if(idBase["districtB"] != null){
              current["district"] = idBase["districtB"];
            }
            if(idBase["provinceB"] != null){
              current["province"] = idBase["provinceB"];
            }
            if(idBase["countryB"] != null){
              current["country"] = idBase["countryB"];
            }
            console.log("Address:current");
            console.log(current);
            
            //--- Address:work
            if (idBase.noC != null){
              work.no = idBase.noC ; 
            }
            
            if(idBase["roomNoC"] != null){
              work["roomNo"] = idBase["roomNoC"];
            }
            
            if(idBase["floorsC"] != null){
              work["floors"] = idBase["floorsC"];
            }
            if(idBase["buildingC"] != null){
              work["building"] = idBase["buildingC"];
            }
            if(idBase["soiC"] != null){
              work["soi"] = idBase["soiC"];
            }
            if(idBase["roadC"] != null){
              work["road"] = idBase["roadC"];
            }
            if(idBase["mooC"] != null){
              work["moo"] = idBase["mooC"];
            }
            if(idBase["postalCodeC"] != null){
              work["postalCode"] = idBase["postalCodeC"].trim();
            }
            if(idBase["subDistrictC"] != null){
              work["subDistrict"] = idBase["subDistrictC"];
            }
            if(idBase["districtC"] != null){
              work["district"] = idBase["districtC"];
            }
            if(idBase["provinceC"] != null){
              work["province"] = idBase["provinceC"];
            }
            if(idBase["countryC"] != null){
              work["country"] = idBase["countryC"];
            }
            console.log("Address:work");
            console.log(work);
            
            //----------------------
            // 2. Make spone
            //----------------------
            if( idBase["maritalStatus"] == "Married") {
              spouse["thFirstName"]   = idBase["sp_thFirstName"] ;
              spouse["thLastName"]    = idBase["sp_thLastName"] ;
              spouse["enFirstName"]   = idBase["sp_enFirstName"] ;
              spouse["enLastName"]    = idBase["sp_enLastName"] ;

              idBase["spouse"] = spouse;
            }
            //---------------------
            // 3. Make suit No
            //---------------------
            const text = '{"suitNo1":1, "suitNo2":1, "suitNo3":1,"suitNo4":1, "suitNo5":1, "suitNo6":1,"suitNo7":1, "suitNo8":1, "suitNo9":1,"suitNo10":1, "suitNo11":1, "suitNo12":1}';
            const suitNo = JSON.parse(text);  
            var sutibility = [];
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
                setErrorLog( cardNumber, "5050/api/individualAccout", "E702", "suit No มีไม่ครบ 12 รายการ", function (x){      
                });    
        
              let ix = 0;
              if (sx > 0) {
                ix = sx-1;
              } else {
                ix = 0;
              } 
        
              for (let i=ix;i<12;i++ ){
                sutibility.push({ "suitNo": 1});
                console.log(sutibility[i]["suitNo"]);  
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
                errorList[ei] = s + " มีค่า=0 ระบบ ใส่ค่าเป็น 1";
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

            console.log("sutibility:");
            console.log(suitNo);
            
            //-------------------
            // 4. fix bug
            //-------------------
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
  
  
          if (idBase["suitabilityRiskLevel"] == null || idBase["suitabilityRiskLevel"] == ""  ) {
            idBase["suitabilityRiskLevel"] = "1"  
  
            setErrorLog( cardNumber, "5050/api/individualAccout", "E704", "suitabilityRiskLevel ไม่ได้เลือกไว้!", function (x){
              console.log("suitabilityRiskLevel must not null "); 
            });
          }
  
          // REMOVE THIS OUT  FUCK 8YEARS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
          
          //var chkExpireDate = idBase["cardExpiryDate"];
          //if (chkExpireDate <= '20220228') {
          //  idBase["cardExpiryDate"] = getExpireNextYear();
          //  setErrorLog( cardNumber, "5050/api/individualAccout", "E703", "ข้อมูล CarExpireDate แก้ไขจาก"+ chkExpireDate +"เป็น "+ idBase["cardExpiryDate"], function (x){
          //    console.log("cardExpiryDate is expired " + chkExpireDate);  
          //  });
          //}
          



          //---[705] mobileNumber ต้องมี FORMAT เป็นตัวเลข 10 หลัก ไม่มีขึด 
          var olddate = new String("");
          var chkMobile = "";
          let mobileMsg = "";
          let mobileError = false;
          chkMobile = idBase["mobileNumber"];
  
          if (chkMobile == null){
            mobileError = true;
            mobileMsg = "ไม่มีเบอร์โทรศัทพ์มือถือ";
          } else if (chkMobile.length < 10) {
            mobileError = true;
            mobileMsg = "เบอร์โทรศัทพ์มือถือมีไม่ครบ 10ตัว"; 
          } 
          /*
          else if ( chkMobile.search("-") > 0) {
            
            mobileError = true;
            mobileMsg =  mobileMsg + " เบอร์โทรศัทพ์มือถือต้องไม่มีขีด";
          }
          */
          if ( mobileError ) {
            idBase["mobileNumber"] = "0899999999";
            setErrorLog( cardNumber, "5050/api/individualAccout", "E705", mobileMsg, function (x){
              console.log(mobileMsg); 
            });
          }
  
          //=========================      
          //--- add sub1 for address
          //=========================
              
  
          idBase["identificationDocument"] = identificationDocument;           
          idBase["current"] = current;
          idBase["work"] = work;
          idBase["suitabilityForm"] = suitNo;

          //========================================================================================================
          // FIX DATA
          //========================================================================================================
          var address_flag = '';

          address_flag = idBase["currentAddressSameAsFlag"];
          if (address_flag == null || address_flag == '') {
            console.log( "currentAddressSameAsFlag is empty");
          } else {
            console.log( "currentAddressSameAsFlag is " + address_flag);
          }
          
          var isMarit = ""; 
        
          isMarit = idBase["maritalStatus"];

          if ( isMarit.trim() != "Married" ) {
            idBase["maritalStatus"] = "Single";
          }
          
          idBase["vulnerableFlag"] = false;
          idBase["relatedPoliticalPerson"] = false
          
          idBase["canAcceptFxRisk"] = true;
          idBase["canAcceptDerivativeInvestment"] = true;
          idBase["fatca"] = false;
  
          idBase["nationality"] = "TH";
          //idBase["referralPerson"] = "สุจารี";
          var open_form = "";
          open_form = idBase["openFundConnextFormFlag"];
          
          //--- remove it for production
          //if ( open_form == "N" ) {
          //  idBase["openFundConnextFormFlag"] = "Y"; 
          //}
          //--- remove it

        
          if (open_form == null || open_form == '') { 
            idBase["openFundConnextFormFlag"] = "N"; 
            
          }
          
          console.log( "openFundConnextFormFlag is "+ idBase["openFundConnextFormFlag"]);  
          

          //idBase["openFundConnextFormFlag"] = "N"; //Open From document
          
          
          idBase["approved"] = true; //ได้ตรวจสอบแล้ว
          //========================================================================================================
          // No Data available 
          // Input junk data for testing only
          //--------------------------------------------------------------------------------------------------------
          
          delete idBase["assetValue"];
          delete idBase["ndidFlag"];
          
          
          delete idBase["sp_thFirstName"];
          delete idBase["sp_thLastName"];
          delete idBase["sp_enFirstName"];
          delete idBase["sp_enLastName"];
          
          delete idBase["noA"];
          delete idBase["floorsA"];
          delete idBase["buildingA"];
          delete idBase["roomNoA"];
          delete idBase["soiA"];
          delete idBase["roadA"];
          delete idBase["mooA"];
          delete idBase["subDistrictA"];
          delete idBase["districtA"];
          delete idBase["provinceA"];
          delete idBase["postalCodeA"];
          delete idBase["countryA"];

          delete idBase["noB"];
          delete idBase["floorsB"];
          delete idBase["buildingB"];
          delete idBase["roomNoB"];
          delete idBase["soiB"];
          delete idBase["roadB"];
          delete idBase["mooB"];
          delete idBase["subDistrictB"];
          delete idBase["districtB"];
          delete idBase["provinceB"];
          delete idBase["postalCodeB"];
          delete idBase["countryB"];

          delete idBase["noC"];
          delete idBase["floorsC"];
          delete idBase["buildingC"];
          delete idBase["roomNoC"];
          delete idBase["soiC"];
          delete idBase["roadC"];
          delete idBase["mooC"];
          delete idBase["subDistrictC"];
          delete idBase["districtC"];
          delete idBase["provinceC"];
          delete idBase["postalCodeC"];
          delete idBase["countryC"];
          
          
          //console.log("chek idBase data..");
          //console.log(idBase);  





            //--- FINAL
            return callback(idBase);
          }
          catch (error)  {
            console.log(error);      
          }          
        } // end if  (44)
      
        //-----------------
        
    });   //-- end getExcelIndividualData()
  
  
      return result; 
  
    }
    catch (error) {
        console.log(error);
        return callback( error);
    }
  
  }

  async function getExcelIndividualData(cardNumber , callback) {
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
          .query(excelIndividual4);
          
        if ( data1.rowsAffected >= 1 ) {
          for (let i=0;i<data1.rowsAffected;i++){
            oindividual.push(data1.recordset[i]);            
          }  
          xdata.push(oindividual);
        } else {
          //hasdata = false;
          xdata.push(oindividual);
          //console.log("No sutibility data , system input data");
        }
      
      
      xdata.push(oindividual);
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
  

  async function test3json(){
  
  
    try{
      let iBase = [];
      iBase["identificationCardType"] = "CITIZEN_CARD"; 
      iBase["cardNumber"] = "12343333333";
      iBase["cardExpiryDate"] = "20290101";
      var myClass = new IndividualCustomer(iBase);
      let data = myClass.toJJ();
      //console.log(JSON.stringify(data));
    
      return data;
  
  
    } catch (err) {
      console.error(err);
  
    }
    
  }


  export{
    test3json,
    getExcelIndividual

  }