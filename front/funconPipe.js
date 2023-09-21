import express, { response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import request from 'request';
//import yauzl from 'yauzl';
import fs from 'fs';

import unzipper from 'unzipper';
import {cardNumber} from './dataTest.js';
import {isLogin,setErrorLog,setUpdateStatus,getTocken,getLogin} from './wealthutil.js';
dotenv.config();

async function impIndividualAccount ( cardNumber , callback){
  try{
    let result = await  getFundConnIndividualProfile( cardNumber, function (resp){
      //const Params = JSON.parse(data);
      //
      let jdata = resp.data;
      let statusx = resp.status;
      let individual_status = "";
    
      //console.log("status: "+statusx);
      //console.dir(jdata);
      
      if (statusx == 200){
       
        console.log("status: "+statusx + " found customer profile");
      
        const responsex =   axios({
        method: 'post',
        url: 'http://localhost:5050/api/setIndividualProfile',
        headers : {
            'content-type': 'application/json',
            'cache-control': 'no-cache'
          },
        //body: jdata,
        data: jdata,  
        responseType: 'json'  
      });
      const string1 = responsex.data;
      console.log("setIndividualProfile status:"+string1);
      console.dir(responsex.then.result);

      }
      return response.status;
    });

      
    return callback(result);
  } catch (error){
    console.log(error);    
    return callback(false);
  }
}


async function getFundConnIndividualResponse(cardNumber, callback){
  try{           
    isLogin();
    
    let cur_token = process.env['ROOT_TOKEN'];
    /*
    identificationCardType: "CITIZEN_CARD",
    cardNumber : "1234567891011",
    accountId : "3-100123",
    */
    //const URL = process.env['URL_CUST_INDIV_ACCOU_V4']+"?identificationCardType=CITIZEN_CARD&"+ "cardNumber="+cardNumber+"&accountId="+cardNumber;
    const URL = process.env['URL_CUST_ACCOUNT']+"?accountId="+cardNumber;
    //const URL = process.env['URL_CUST_INDIV_ACCOU_V4']+"?cardNumber="+cardNumber;
    //console.log("URL:"+URL);
    await axios({
			method: 'get',
      url: URL,
      
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache',
          'x-auth-token': cur_token
        },
      responseType: 'json'  
		})
    .then(function (response) {
      // handle success
      //console.log("==================================");
      //console.log("status: "+response.status);
      console.dir(response.data);
      return callback(response.data, response.status);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      return callback(error, error.response.status);
    });
		

  } catch (error) {
    console.log('Error', error.message);
    return callback(error,error.message);  
    
  }

}


async function getFundConnIndividualProfile ( cardNumber , callback){
  try{           
    isLogin();
    // url: 'https://stage.fundconnext.com/api/customer/individual/investor/profile/v4?cardNumber='+cardNumber,

    let cur_token = process.env['ROOT_TOKEN'];
    const URL = process.env['URL_PROF_INDIV_V4']+"?cardNumber="+cardNumber;
    //console.log("URL:"+URL);
    await axios({
			method: 'get',
      url: URL,
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache',
          'x-auth-token': cur_token
        },
      responseType: 'json'  
		})
    .then(function (response) {
      // handle success
      console.log("==================================");
      console.log("status: "+response.status);
      console.dir(response.data);
      return callback(response.data);
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


//------------------------------------------------------------
async function hasIndividualProfile ( cardNumber , callback){
  //url: 'https://stage.fundconnext.com/api/customer/individual/investor/profile/v4?cardNumber='+cardNumber,
  try{           
     isLogin();
     
     let cur_token = process.env['ROOT_TOKEN'];
     const URL = process.env['URL_PROF_INDIV_V4']+"?cardNumber="+cardNumber; 
     await axios({
       method: 'get',
       url: URL,
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache',
           'x-auth-token': cur_token
         },
       responseType: 'json'  
     })
     .then(function (response) {
        // handle success
        console.log("==================================");
        console.log("status: "+response.status);
        
        return callback(response.status);
     })
     .catch(function (error) {
        // handle error
        console.log(error);
        return callback(error.response.status);
     });
     
 
   } catch (error) {
    
       return callback(error.response.status);
       
   }          
 
}


//-------------------------------------------------------------

async function getFundConnExportFile( aDate ,aFileType , callback ) {

  const URL = process.env['URL_UPLOAD_FILE']+aDate+'/'+aFileType+'.zip';
  const fileName = aFileType+aDate+".txt";
  const filePath = "../../pipe/unzipfile/";
  const fileImp = filePath+fileName;
  var check = "";

  try {
      // 1. get file from server
      let cur_token = process.env['ROOT_TOKEN'];
      let retFile = "";
      const response = await axios({
          method: 'GET',
          url: URL,
          headers : {
              'content-type': 'application/zip',
              'cache-control': 'no-cache',
              'x-auth-token': cur_token
          },
          responseType: 'stream'

      });
        
      console.log("status: "+response.status);
      if (response.status == 200){
        // 2. unzip file
        const zip = response.data.pipe(unzipper.Parse({forceStream: true}));

        for await (const entry of zip) {
            //entry.pipe(fs.createWriteStream(fileImp));    
            const fileName = entry.path;
            retFile = filePath+fileName;
            const type = entry.type; // 'Directory' or 'File'
            const size = entry.vars.uncompressedSize; // There is also compressedSize;
            console.log("File name:"+fileName+" uncompress size "+size);
            //entry.pipe(fs.createWriteStream(fileImp));
            entry.pipe(fs.createWriteStream(retFile));
       }
        return callback(retFile);
      } else {
        return callback(false);
      }
  }catch(error) {
      //console.log(error.response.status);
      //console.log(error);
      return callback(false);
  }

}



/*
1.delay 5 min after request token login_service
*/

async function getExportZipFile() {
    //----D:\DATA\Projects\Wealth\pipe\import\data-transfer-test-report.zip
    //----D:\DATA\Projects\Wealth\pipe\import\data-transfer-test-report.zip
    const fileExp = "../../pipe/import/xx12345.zip";
    const fileImp = "../../pipe/unzipfile/xx1234_output.txt";
    
    const zip = fs.createReadStream(fileExp).pipe(unzipper.Parse({forceStream: true}));
    for await (const entry of zip) {
      const fileName = entry.path;
      const type = entry.type; // 'Directory' or 'File'
      const size = entry.vars.uncompressedSize; // There is also compressedSize;
      console.log("File name:"+fileName+" uncompress size "+size);
      if (fileName === "xx12345.csv") {
        entry.pipe(fs.createWriteStream(fileImp));
      } else {
        entry.autodrain();
        console.log("autodrain");
      }
    }
}

async function getFundOrderInquiry( datex, callback){
  try{           
    isLogin();
    let cur_token = process.env['ROOT_TOKEN'];
    const URL = process.env['URL_ORDER_QUERY']+"?effectiveDate="+datex;
    await axios({
      method: 'get',
      url: URL,
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache',
          'x-auth-token': cur_token
        },
      responseType: 'json'  
    })
    .then(function (response) {
      // handle success
      console.log("==================================");
      console.log("status: "+response.status);
      console.dir(response.data);
      return callback(response.data);
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
//----------------------------------- 2rd
async function getFundOrderInquiry2( idnox, callback){
  try{           
    await isLogin();
    let cur_token = process.env['ROOT_TOKEN'];
    //console.log(cur_token);
    //const URL = process.env['URL_ORDER_QUERY']+"?effectiveDate="+datex;
    //cur_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjEzMSwidXNlcm5hbWUiOiJBUElfV1IwMiIsInNlbGxpbmdBZ2VudElkIjoxNDEsInNlbGxpbmdBZ2VudENvZGUiOiJXUiIsImlzUGFzc3Rocm91Z2giOmZhbHNlLCJyb2xlcyI6WzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyXSwiaWF0IjoxNjU0NzYyNTA0LCJleHAiOjE2NTQ3NjQzMDR9.eDkOqZUPtCnUDpeuUafIAtZpTSx7g0F3fzTQPJcFxTY'
    const URL = process.env['URL_PROF_INDIV_V4']+"?cardNumber="+idnox;
    await axios({
      method: 'get',
      url: URL,
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache',
          'x-auth-token': cur_token
        },
      responseType: 'json'  
    })
    .then(function (response) {
      // handle success
      console.log("==================================");
      console.log("status: "+response.status);
      // console.dir(response.data);
      return callback(response.data , response.status );
    })
    .catch(function (error) {
      // handle error
      //console.log(error);
       return  callback(error);
    });
    

  } catch (error) {
    console.log('Error', error.message);
    return callback(error.message);  
    
  }

}
//--------------------------------------------------------------------17052022
async function getFundCustomer( idnox, callback){
  try{           
    isLogin();
    let cur_token = process.env['ROOT_TOKEN'];
    const URL = process.env['URL_PROF_INDIV_V4']+"?cardNumber="+idnox;
    await axios({
      method: 'get',
      url: URL,
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache',
          'x-auth-token': cur_token
        },
      responseType: 'json'  
    })
    .then(function (response) {
      // handle success
      console.log("==================================");
      console.log("status: "+response.status);
      console.dir(response.data);
      return callback(response.data);
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

//------------------------------------------------------------
async function 
callImportQueryOrder ( xData, callback){
  let string1 = "";
  //const text = '{"dataFile": "","jobName": ""}';
  const sParams = xData;
  //const sParams = JSON.parse(xData);
  //sParams["dataFile"] = aFileData;
  //sParams["jobName"]  = jobName;
  console.log(sParams);
  try{           
      
     const response = await axios({
       method: 'POST',
       url: 'http://localhost:5050/api/callImportQueryOrder',
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache'
         },
       body: sParams,
       data: xData,
       json: true  
      
     });
     string1 = response.data;
     return callback(string1);
     
 
   } catch (error) {
     console.log("error:callImportjob");
     console.error(error);
   }          
 
 }
//-------------------------------2rd-------
async function callImportQueryOrder2 ( xid, callback){
  let string1 = "";
  //const text = '{"dataFile": "","jobName": ""}';
  const sParams = xid;
  //const sParams = JSON.parse(xData);
  //sParams["dataFile"] = aFileData;
  //sParams["jobName"]  = jobName;
  console.log(sParams);
  try{           
      
     const response = await axios({
       method: 'POST',
       url: 'http://localhost:5050/api/callImportQueryOrder2',
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache'
         },
       body: sParams,
       data: xid,
       json: true  
      
     });
     string1 = response.data;
     return callback(string1);
     
 
   } catch (error) {
     console.log("error:callImportjob");
     console.error(error);

   }          
 
 }

 //--- 17 05 2022
 async function callImportCustomer ( xData, callback){
  let string1 = "";
  //const text = '{"dataFile": "","jobName": ""}';
  const sParams = xData;
  //const sParams = JSON.parse(xData);
  //sParams["dataFile"] = aFileData;
  //sParams["jobName"]  = jobName;
  console.log(sParams);
  try{           
      
     const response = await axios({
       method: 'POST',
       url: 'http://localhost:5050/api/callImportCustomer',
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache'
         },
       body: sParams,
       data: xData,
       json: true  
      
     });
     string1 = response.data;
     return callback(string1);
     
 
   } catch (error) {
     console.log("error:callImportjob");
     console.error(error);
   }          
 
 }
//------------------------------------------------------------
async function callImportjob ( jobName , aFileData, callback){
  let string1 = "Import complete ";
  const text = '{"dataFile": "","jobName": ""}';
  const sParams = JSON.parse(text);
  sParams["dataFile"] = aFileData;
  sParams["jobName"]  = jobName;
  console.log(sParams);
  try{           
      
     const response = await axios({
       method: 'POST',
       url: 'http://localhost:5050/api/callImportJobs',
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache'
         },
       body: sParams,
       data: sParams,
       json: true  
      
     });
     string1 = response.data;
     return callback(string1);
     
 
   } catch (error) {
     console.log("error:callImportjob");
     console.error(error);
   }          
 
 }
 
 //--------------------------------------------------------------------------------------------------------
 async function callImportjobCus ( jobName , aFileData, callback){
  let string1 = "";
  const text = '{"dataFile": "","jobName": ""}';
  const sParams = JSON.parse(text);
  sParams["dataFile"] = aFileData;
  sParams["jobName"]  = jobName;
  //console.log(sParams);
  try{           
      
     const response = await axios({
       method: 'POST',
       url: 'http://localhost:5050/api/callImportJobs2',
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache'
         },
       body: sParams,
       data: sParams,
       json: true  
      
     });
     string1 = response.data;
     return callback(string1);
     
 
   } catch (error) {
     console.log("error:callImportjobCus");
     console.error(error);
   }          
 
 }


 async function getFundConnQueryOrder( aDate , callback ) {

  const URL = process.env['URL_ORDER_QUERY']+"effectiveDate="+aDate;
  

  let   retFile = "";

  try {
      // 1. get file from server
      let cur_token = process.env['ROOT_TOKEN'];
      const response = await axios({
          method: 'GET',
          url: URL,
          headers : {
              'content-type': 'application/zip',
              'cache-control': 'no-cache',
              'x-auth-token': cur_token
          },
          responseType: 'json'

      });
      const string1 = response.data;
      //return callback(fileImp);
      //console.log(string1);
      return callback(string1);
  }catch(error) {
      console.log(error);
      return callback(error);
  }

}

//-------------------------------------------------------------------------------
async function getFundConnQueryOrder2( aDate , callback ) {

  const URL = process.env['URL_ORDER_QUERY']+"effectiveDate="+aDate;
  

  let   retFile = "";

  try {
      // 1. get file from server
      let cur_token = process.env['ROOT_TOKEN'];
      const response = await axios({
          method: 'GET',
          url: URL,
          headers : {
              'content-type': 'application/zip',
              'cache-control': 'no-cache',
              'x-auth-token': cur_token
          },
          responseType: 'json'

      });
      const string1 = response.data;
      //return callback(fileImp);
      //console.log(string1);
      return callback(string1);
  }catch(error) {
      console.log(error);
      return callback(error);
  }

}

async function selectaccount(callback){
   isLogin();
  // let jdata = []
  let txtdata 
  try
  {
    const keys = Object.keys(cardNumber);
    for (let i = 0; i < keys.length; i++) {
     
      if (cardNumber[i].cardNumber.length != 13){ continue;}
      
       setTimeout(() => {
         getApiAccountByNumber(cardNumber[i].cardNumber,function(status,x){
              txtdata =+ x.data
              if(status === 200 ){
                callImportQueryOrder2(x, function(y){  
                 // res.json(y); 
                });
              }else{
                  // insert log ----- รอเทส 2022-06 -15
                  //callImportError(cardNumber[i].cardNumber,"AccountInfo")
              }
         });
       }, i* 4500); // end setTimeout

       
    }
    console.log(txtdata)
    return callback(cardNumber);
  }catch(error) {
    console.log(error);
    return callback(error);
  }

}

async function getApiAccountByNumber(idnox ,callback) {

  try{           
   // isLogin();
    let cur_token = process.env['ROOT_TOKEN'];
    const URL = process.env['URL_PROF_INDIV_V4']+"?cardNumber="+idnox;
    await axios({
      method: 'get',
      url: URL,
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache',
          'x-auth-token': cur_token
        },
      responseType: 'json'  
    })
    .then(function (response) {
      // handle success
      // console.log("==================================");
      // console.log("status: "+response.status);
      // console.dir(response.data);
     let jdata = response.data
     // console.log(jdata);
      //  return jdata;
      return callback(response.status,jdata );
    })
    .catch(function (error) {
      // handle error
      console.log("not found: " +idnox);
      return callback(error);
    });
    

  } catch (error) {
   // console.log('Error', error.message);
   console.log("error api: " +idnox);
    return callback(error.message);  
    
  }

}

async function callImportCustomers ( xData, callback){
  let string1 = "";
  //const text = '{"dataFile": "","jobName": ""}';
  const sParams = xData;
  //const sParams = JSON.parse(xData);
  //sParams["dataFile"] = aFileData;
  //sParams["jobName"]  = jobName;
  //console.log(sParams);
  try{           
      
     const response = await axios({
       method: 'POST',
       url: 'http://localhost:5050/api/callImportCustomers',
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache'
         },
       body: sParams,
       data: xData,
       json: true  
      
     });
     string1 = response.data;
     return callback(string1);
     
 
   } catch (error) {
     console.log("error:callImportCustomers");
     console.error(error);
   }          
 
 }
async function callImportError(no,job){
  try{           
    //JSON PUSH
    var myObj = { "cardNumber": no, "job": job };
    let datajson = JSON.parse(myObj);  
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5050/api/callImportError',
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache'
        },
      body: datajson,
      data: datajson,
      json: true  
     
    });
    string1 = response.data;
    //return callback(string1);
    

  } catch (error) {
    console.log("error:callImportError");
   // console.error(error);
  }          

}
async function calldatasaccount(callback){
  try{           
    //JSON PUSH
    // var myObj = { "cardNumber": no, "job": job };
    // let datajson = JSON.parse(myObj); 
    //console.log(datarow) 
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callaccountmail',
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache'
        },
        
     
    });
    //string1 = response.data;
    // console.log(response)
    return callback(response.data);
    

  } catch (error) {
    console.log("error:callImport data file api Error");
   // console.error(error);
  }   
}
async function callrequestsendmail(data ,mail,callback){
  
  let string1 = "";
  const text = '{"dataFile": "" ,"mail": ""}';
  const sParams = JSON.parse(text);
  sParams["dataFile"] = data; 
  sParams["mail"] = mail; 
//  console.log(mail)
  try{           
      
     const response = await axios({
       method: 'POST',
       url: 'http://localhost:5055/api/callsendmailpdf',
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache'
         },
       body: sParams,
       data: sParams,
       json: true  
      
     });
     string1 = response.data;
     return callback(string1);
     
 
   } catch (error) {
     console.log("error:callImportCustomers");
     console.error(error);
   }   
  
}

async function callgroupdatasaccount(callback){
  try{
      const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callgrouppdf',
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache'
        },
        
    });
    //string1 = response.data;
    // console.log(response)
    return callback(response.data);
    

  } catch (error) {
    console.log("error:callgroupdatasaccount api Error");
  // console.error(error);
  }   
}
async function callgenpdfbyid(data,callback){
  let string1 = "";
  const text = '{"custcode": ""  }';
  const sParams = JSON.parse(text);
  sParams["custcode"] = data;   
//  console.log(mail)
  try{           
      
     const response = await axios({
       method: 'POST',
       url: 'http://localhost:5055/api/callgenpdfbyid',
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache'
         },
       body: sParams,
       data: sParams,
       json: true  
      
     });
     string1 = response.data;
     return callback(string1);
     
 
   } catch (error) {
     console.log("error:callgenpdfbyid ");
     console.error(error);
   }
}
async function callrequestsendgroupmail(data ,callback){
  // console.log(data)
  let string1 = "";
  try{           
      
     const response = await axios({
       method: 'POST',
       url: 'http://localhost:5055/api/callsendgroupmailpdf',
       headers : {
           'content-type': 'application/json',
           'cache-control': 'no-cache'
         },
       body: data,
       data: data,
       json: true  
      
     });
     string1 = response.data;
     return callback(string1);
     
 
   } catch (error) {
     console.log("error:callrequestsendgroupmail");
     console.error(error);
   }   
  
}
async function callSingon (datas,callback){
  const { username, password } = datas;
  let string1 = "";
  const text = '{"username": "" ,"password": ""  }';
  const sParams = JSON.parse(text);
  sParams["username"] = username;   
  sParams["password"] = password;   
  try{           
      
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5050/api/callSingon',
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache'
        },
      body: sParams,
      data: sParams,
      json: true  
     
    });
    string1 = response.data;
    return callback(string1);
    

  } catch (error) {
    console.log("error: callSingon ");
    console.error(error);
  }

  return callback("x")
}
async function calltransactionReconcile(callback){
  try{
    const response = await axios({
    method: 'POST',
    url: 'http://localhost:5055/api/calltransactionreconcile',
    headers : {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      
  });
  //string1 = response.data;
  // console.log(response)
  return callback(response.data);
  

} catch (error) {
  console.log("error:callgroupdatasaccount api Error");
// console.error(error);
}   
}
export {
    getExportZipFile,
    getFundConnIndividualProfile,
    getFundConnIndividualResponse,
    impIndividualAccount,
    getFundConnExportFile,
    callImportjob,
    callImportQueryOrder,
    getFundOrderInquiry,
    hasIndividualProfile,
    callImportCustomer,
    getFundCustomer,
    callImportjobCus,
    callImportQueryOrder2,
    getFundOrderInquiry2,
    selectaccount,
    callImportCustomers,
    calldatasaccount,
    callrequestsendmail,
    callgroupdatasaccount,
    callgenpdfbyid,
    callrequestsendgroupmail,
    callSingon
    ,calltransactionReconcile
    
}
