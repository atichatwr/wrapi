import express, { response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import request from 'request';
//import yauzl from 'yauzl';
import fs, { WriteStream } from 'fs';

import unzipper from 'unzipper';
import { cardNumber, bankred } from './dataTest.js';
import { isLogin, setErrorLog, setUpdateStatus, getTocken, getLogin } from './wealthutil.js'; 
dotenv.config();

async function impIndividualAccount(cardNumber, callback) {
  try {
    let result = await getFundConnIndividualProfile(cardNumber, function (resp) {
      //const Params = JSON.parse(data);
      //
      let jdata = resp.data;
      let statusx = resp.status;
      let individual_status = "";

      //console.log("status: "+statusx);
      //console.dir(jdata);

      if (statusx == 200) {

        console.log("status: " + statusx + " found customer profile");

        const responsex = axios({
          method: 'post',
          url: 'http://localhost:5055/api/setIndividualProfile',
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-cache'
          },
          //body: jdata,
          data: jdata,
          responseType: 'json'
        });
        const string1 = responsex.data;
        console.log("setIndividualProfile status:" + string1);
        console.dir(responsex.then.result);

      }
      return response.status;
    });


    return callback(result);
  } catch (error) {
    console.log(error);
    return callback(false);
  }
}


async function getFundConnIndividualResponse(cardNumber, callback) {
  try {
    isLogin();

    let cur_token = process.env['ROOT_TOKEN'];
    /*
    identificationCardType: "CITIZEN_CARD",
    cardNumber : "1234567891011",
    accountId : "3-100123",
    */
    //const URL = process.env['URL_CUST_INDIV_ACCOU_V4']+"?identificationCardType=CITIZEN_CARD&"+ "cardNumber="+cardNumber+"&accountId="+cardNumber;
    const URL = process.env['URL_CUST_ACCOUNT'] + "?accountId=" + cardNumber;
    //const URL = process.env['URL_CUST_INDIV_ACCOU_V4']+"?cardNumber="+cardNumber;
    //console.log("URL:"+URL);
    await axios({
      method: 'get',
      url: URL,

      headers: {
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
    return callback(error, error.message);

  }

}


async function getFundConnIndividualProfile(cardNumber, callback) {
  try {
    isLogin();
    // url: 'https://stage.fundconnext.com/api/customer/individual/investor/profile/v4?cardNumber='+cardNumber,

    let cur_token = process.env['ROOT_TOKEN'];
    const URL = process.env['URL_PROF_INDIV_V4'] + "?cardNumber=" + cardNumber;
    //console.log("URL:"+URL);
    await axios({
      method: 'get',
      url: URL,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'x-auth-token': cur_token
      },
      responseType: 'json'
    })
      .then(function (response) {
        // handle success
        console.log("==================================");
        console.log("status: " + response.status);
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
async function hasIndividualProfile(cardNumber, callback) {
  //url: 'https://stage.fundconnext.com/api/customer/individual/investor/profile/v4?cardNumber='+cardNumber,
  try {
    isLogin();

    let cur_token = process.env['ROOT_TOKEN'];
    const URL = process.env['URL_PROF_INDIV_V4'] + "?cardNumber=" + cardNumber;
    await axios({
      method: 'get',
      url: URL,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'x-auth-token': cur_token
      },
      responseType: 'json'
    })
      .then(function (response) {
        // handle success
        console.log("==================================");
        console.log("status: " + response.status);

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
        // console.log("response zip")
        // console.log(zip)
        // console.log("response END")
        let datajson 
        for await (const entry of zip) {
            //entry.pipe(fs.createWriteStream(fileImp));    
            const fileName = entry.path;
            retFile = filePath+fileName;
            const type = entry.type; // 'Directory' or 'File'
            const size = entry.vars.uncompressedSize; // There is also compressedSize;
            console.log("File name:"+fileName+" uncompress size "+size);
            //entry.pipe(fs.createWriteStream(fileImp));
            // console.log(fs.createWriteStream(retFile).Writable)
            // if(fs.WriteStream.Writable.length > 0 ){
            //   fs.WriteStream.;
            // }
            // console.log(WriteStream.Writable.length)
            entry.pipe(fs.createWriteStream(retFile));
            // entry.pipe(fs.createWriteStream(retFile));
            // entry.pipe(fs.createWriteStream(retFile));
            // console.log(entry.pipe(fs.createWriteStream(retFile).Writable))
            // entry.pipe(fs.createWriteStream(retFile).end()); 
            return callback(retFile);
            //console.log(entry)
            // return callback(retFile);
            //**[Best] get Fund_Cen_File_detial****[2022 06 22]*******/
            // const vars_compressedSize       = entry.compressedSize
            // const vars_lastModifiedDate     = entry.lastModifiedDate
            // const vars_lastModifiedTime     = entry.lastModifiedTime
            // const vars_lastModifiedDateTime = entry.lastModifiedDateTime
            // const vars_uncompressedSize     = entry.uncompressedSize
            //const data_rows = [fileName ,vars_compressedSize ,vars_uncompressedSize,vars_lastModifiedDate,vars_lastModifiedTime,vars_lastModifiedDateTime]
            //JSON PUSH
            // var myObj = { "fileName": fileName, "compressedSize": vars_compressedSize, "lastModifiedDate": vars_lastModifiedDate, "lastModifiedTime": vars_lastModifiedTime, "lastModifiedDateTime": vars_lastModifiedDateTime };
            //   datajson = JSON.parse(myObj); 
           //
        }
        // await callputDataFileApi(datajson)
        return callback(retFile);
      } else {
        return callback(false);
      }
  }catch(error) {
      //console.log(error.response.status);
      // console.log(error);
      return callback(false);
  }

}

async function Importtxtallot(aDate, aFileType, callback) {

}

/*
1.delay 5 min after request token login_service
*/

async function getExportZipFile() {
  //----D:\DATA\Projects\Wealth\pipe\import\data-transfer-test-report.zip
  //----D:\DATA\Projects\Wealth\pipe\import\data-transfer-test-report.zip
  const fileExp = "../../pipe/import/xx12345.zip";
  const fileImp = "../../pipe/unzipfile/xx1234_output.txt";

  const zip = fs.createReadStream(fileExp).pipe(unzipper.Parse({ forceStream: true }));
  for await (const entry of zip) {
    const fileName = entry.path;
    const type = entry.type; // 'Directory' or 'File'
    const size = entry.vars.uncompressedSize; // There is also compressedSize;
    console.log("File name:" + fileName + " uncompress size " + size);
    if (fileName === "xx12345.csv") {
      entry.pipe(fs.createWriteStream(fileImp));
    } else {
      entry.autodrain();
      console.log("autodrain");
    }
  }
}

async function getFundOrderInquiry(datex, callback) {
  try {
    await isLogin();
    let cur_token = process.env['ROOT_TOKEN'];
    const URL = process.env['URL_ORDER_QUERY'] + "?effectiveDate=" + datex;
    await axios({
      method: 'get',
      url: URL,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'x-auth-token': cur_token
      },
      responseType: 'json'
    })
      .then(function (response) {
        // handle success
        console.log("==================================");
        console.log("status: " + response.status);
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
// >= and <= 
//----------------------------------- 2rd
async function getFundOrderInquiry2(idnox, callback) {
  try {
    await isLogin();
    let cur_token = process.env['ROOT_TOKEN'];
    //console.log(cur_token);
    //const URL = process.env['URL_ORDER_QUERY']+"?effectiveDate="+datex;
    //cur_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjEzMSwidXNlcm5hbWUiOiJBUElfV1IwMiIsInNlbGxpbmdBZ2VudElkIjoxNDEsInNlbGxpbmdBZ2VudENvZGUiOiJXUiIsImlzUGFzc3Rocm91Z2giOmZhbHNlLCJyb2xlcyI6WzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyXSwiaWF0IjoxNjU0NzYyNTA0LCJleHAiOjE2NTQ3NjQzMDR9.eDkOqZUPtCnUDpeuUafIAtZpTSx7g0F3fzTQPJcFxTY'
    const URL = process.env['URL_PROF_INDIV_V4'] + "?cardNumber=" + idnox;
    await axios({
      method: 'get',
      url: URL,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'x-auth-token': cur_token
      },
      responseType: 'json'
    })
      .then(function (response) {
        // handle success
        console.log("==================================");
        console.log("status: " + response.status);
        // console.dir(response.data);
        return callback(response.data, response.status);
      })
      .catch(function (error) {
        // handle error
        //console.log(error);
        return callback(error);
      });


  } catch (error) {
    console.log('Error', error.message);
    return callback(error.message);

  }

}
//--------------------------------------------------------------------17052022
async function getFundCustomer(idnox, callback) {
  try {
    isLogin();
    let cur_token = process.env['ROOT_TOKEN'];
    const URL = process.env['URL_PROF_INDIV_V4'] + "?cardNumber=" + idnox;
    await axios({
      method: 'get',
      url: URL,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'x-auth-token': cur_token
      },
      responseType: 'json'
    })
      .then(function (response) {
        // handle success
        console.log("==================================");
        console.log("status: " + response.status);
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
async function calltruncateTable(xData) {
  try {
    let string1 = "Import complete ";
    const text = '{"dataFile": ""}';
    const sParams = JSON.parse(text);
    sParams["dataFile"] = xData;
    // console.log(sParams); 
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/calltruncateTable',
      headers: {
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
//------------------------------------------------------------
async function callImportQueryOrder(xData, callback) {
  let string1 = "";
  //const text = '{"dataFile": "","jobName": ""}';
  const sParams = xData;
  //const sParams = JSON.parse(xData);
  //sParams["dataFile"] = aFileData;
  //sParams["jobName"]  = jobName;
  console.log(sParams);
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callImportQueryOrder',
      headers: {
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
async function importCenCustomer(xid, callback) {
  let string1 = "";
  //const text = '{"dataFile": "","jobName": ""}';
  const sParams = xid;
  //const sParams = JSON.parse(xData);
  //sParams["dataFile"] = aFileData;
  //sParams["jobName"]  = jobName;
  // console.log(sParams);
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/importCenCustomer',
      headers: {
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
async function callImportCustomer(xData, callback) {
  let string1 = "";
  //const text = '{"dataFile": "","jobName": ""}';
  const sParams = xData;
  //const sParams = JSON.parse(xData);
  //sParams["dataFile"] = aFileData;
  //sParams["jobName"]  = jobName;
  console.log(sParams);
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callImportCustomer',
      headers: {
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
//  async function callImportCustomer ( xData, callback){
//   let string1 = "";
//   //const text = '{"dataFile": "","jobName": ""}';
//   const sParams = xData;
//   //const sParams = JSON.parse(xData);
//   //sParams["dataFile"] = aFileData;
//   //sParams["jobName"]  = jobName;
//   console.log(sParams);
//   try{           

//      const response = await axios({
//        method: 'POST',
//        url: 'http://localhost:5055/api/callImportCustomer',
//        headers : {
//            'content-type': 'application/json',
//            'cache-control': 'no-cache'
//          },
//        body: sParams,
//        data: xData,
//        json: true  

//      });
//      string1 = response.data;
//      return callback(string1);


//    } catch (error) {
//      console.log("error:callImportjob");
//      console.error(error);
//    }          

//  }
async function callImportCustomerId(xData, callback) {
  let string1 = "";
  //const text = '{"dataFile": "","jobName": ""}';
  const sParams = xData;
  //const sParams = JSON.parse(xData);
  //sParams["dataFile"] = aFileData;
  //sParams["jobName"]  = jobName;
  // console.log(sParams);
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callImportCustomerId',
      headers: {
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
async function callImportjob(jobName, aFileData, callback) {
  let string1 = "Import complete ";
  const text = '{"dataFile": "","jobName": ""}';
  const sParams = JSON.parse(text);
  sParams["dataFile"] = aFileData;
  sParams["jobName"] = jobName;
  console.log(sParams);
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callImportJobs',
      headers: {
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
async function callImportjobCus(jobName, aFileData, callback) {
  let string1 = "";
  const text = '{"dataFile": "","jobName": ""}';
  const sParams = JSON.parse(text);
  sParams["dataFile"] = aFileData;
  sParams["jobName"] = jobName;
  //console.log(sParams);
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callImportJobs2',
      headers: {
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


async function getFundConnQueryOrder(aDate, callback) {

  const URL = process.env['URL_ORDER_QUERY'] + "effectiveDate=" + aDate;


  let retFile = "";

  try {
    // 1. get file from server
    let cur_token = process.env['ROOT_TOKEN'];
    const response = await axios({
      method: 'GET',
      url: URL,
      headers: {
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
  } catch (error) {
    console.log(error);
    return callback(error);
  }

}

//-------------------------------------------------------------------------------
async function getFundConnQueryOrder2(aDate, callback) {

  const URL = process.env['URL_ORDER_QUERY'] + "effectiveDate=" + aDate;


  let retFile = "";

  try {
    // 1. get file from server
    let cur_token = process.env['ROOT_TOKEN'];
    const response = await axios({
      method: 'GET',
      url: URL,
      headers: {
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
  } catch (error) {
    console.log(error);
    return callback(error);
  }

}

//********************[Best ] 20220601*/
async function selectaccount(callback) {
  // isLogin();
  // let jdata = []
  //let txtdata 
  try {
    const keys = Object.keys(cardNumber);
    for (let i = 0; i < keys.length; i++) {

      if (cardNumber[i].cardNumber.length != 13) { continue; }
      setTimeout(() => {

        if (i === 300 || i === 500 || i === 800 || i === 1000) { isLogin(); }

        getApiAccountByNumber(cardNumber[i].cardNumber, function (status, x) {
          // txtdata =+ x.data
          if (status === 200) {
            importCenCustomer(x, function (y) {
              // res.json(y); 
            });
          } else {
            // insert log ----- รอเทส 2022-06 -15
            callImportError(cardNumber[i].cardNumber, "AccountInfo")
          }
        });
        console.log("********************************************* row now :" + i)
      }, i * 4500); // end setTimeout


    }
    //console.log(txtdata)
    return callback(cardNumber);
  } catch (error) {
    console.log(error);
    return callback(error);
  }

}

async function getApiAccountByNumber(idnox, callback) {

  try {
    // isLogin();
    let cur_token = process.env['ROOT_TOKEN'];
    const URL = process.env['URL_PROF_INDIV_V4'] + "?cardNumber=" + idnox;
    await axios({
      method: 'get',
      url: URL,
      headers: {
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
        return callback(response.status, jdata);
      })
      .catch(function (error) {
        // handle error
        console.log("not found: " + idnox);
        return callback(error);
      });


  } catch (error) {
    // console.log('Error', error.message);
    console.log("error api: " + idnox);
    return callback(error.message);

  }

}

async function callImportCustomers(xData, callback) {
  let string1 = "";
  //const text = '{"dataFile": "","jobName": ""}';
  const sParams = xData;
  //const sParams = JSON.parse(xData);
  //sParams["dataFile"] = aFileData;
  //sParams["jobName"]  = jobName;
  //console.log(sParams);
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callImportCustomers',
      headers: {
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
async function callImportError(no, job) {
  try {
    //JSON PUSH
    var myObj = { "cardNumber": no, "job": job };
    let datajson = JSON.parse(myObj);
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callImportError',
      headers: {
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

async function callputDataFileApi(datarow, callback) {
  try {
    //JSON PUSH
    // var myObj = { "cardNumber": no, "job": job };
    // let datajson = JSON.parse(myObj); 
    //console.log(datarow) 
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callputDataFileApi',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      body: datarow,
      data: datarow,
      json: true

    });
    //string1 = response.data;
    return callback("save log data file");


  } catch (error) {
    console.log("error:callImport data file api Error");
    // console.error(error);
  }
}
async function callImportTransaction() {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/ImportTransaction'

    });
  } catch (error) {
    console.log("error:UnitholderBalance");
    console.error(error);
  }

}
async function callImportTransactionMannul() {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/ImportTransactionMannul'

    });
  } catch (error) {
    console.log("error:UnitholderBalance");
    console.error(error);
  }

}
async function callImportOrderInquiry() {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/ImportDataQuery'

    });
  } catch (error) {
    console.log("error:UnitholderBalance");
    console.error(error);
  }
}
async function callImportUnitBalance() {
  try {

    const response = await axios({
      method: 'GET',
      url: 'http://localhost:5500/api/getFundConnDataType/UnitholderBalance'

    });
  } catch (error) {
    console.log("error:UnitholderBalance");
    console.error(error);
  }

}
async function callImportTransactionAllot() {
  try {

    const response = await axios({
      method: 'GET',
      url: 'http://localhost:5500/api/getFundConnDataType/AllottedTransactions'

    });
  } catch (error) {
    console.log("error:UnitholderBalance");
    console.error(error);
  }

}
async function callupdateSwitchOut() {
  try {

    const response = await axios({
      method: 'GET',
      url: 'http://localhost:5055/api/callupdateSwitchOut'

    });
  } catch (error) {
    console.log("error:UnitholderBalance");
    console.error(error);
  }

}
async function callcheckunibalanceupdate(callback) {
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callcheckunibalanceupdate',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      json: true

    });
    let string1 = response.data;
    console.log(string1)
    return callback(string1);


  } catch (error) {
    console.log("error:callImportError");
    // console.error(error);
  }
}
async function calldatatransaction(callback) {
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/getDataTransactiondate',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      json: true

    });
    let string1 = response.data;
    console.log(string1)
    return callback(string1);


  } catch (error) {
    console.log("error:callImportError");
    // console.error(error);
  }

}
async function callprepareunitbalance(callback) {
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/prepareunitbalance',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      json: true

    });
    let string1 = response.data;
    console.log(string1)
    return callback(string1);


  } catch (error) {
    console.log("error:callImportError");
    // console.error(error);
  }

}
async function callImportFundbycode(data, callback) {
  let string1 = "";
  const text = '{"fundcode": ""  }';
  const sParams = JSON.parse(text);
  sParams["fundcode"] = data;
  //  console.log(mail)
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callImportFundcode',
      headers: {
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
    console.log("error:call fundcode" + data);
    console.error(error);
  }
}
async function callImportGetAllFund(data, callback) {
  let string1 = "";
  const text = '{"fundcode": ""  }';
  const sParams = JSON.parse(text);
  sParams["fundcode"] = data;
  //  console.log(mail)
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callImportGetAllFund',
      headers: {
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
    console.log("error:call fundcode" + data);
    console.error(error);
  }
}
async function callFuncReconcileTran(callback) {
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/callReconciletran',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      json: true

    });
    let string1 = response.data;
    console.log(string1)
    return callback(string1);


  } catch (error) {
    console.log("error:call Reconcile transaction fund ");
    // console.error(error);
  }
}
async function callgetDatatrantolog(callback) {
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/getDatatrantolog',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      json: true

    });
    let string1 = response.data;
    console.log(string1)
    return callback(string1);


  } catch (error) {
    console.log("error:call Reconcile transaction fund ");
    // console.error(error);
  }
}
async function callclonetranallot(callback) {
  try {

    const response = await axios({
      method: 'GET',
      url: 'http://localhost:5500/api/clonetranallot'

    });
  } catch (error) {
    console.log("error:UnitholderBalance");
    console.error(error);
  }
}
async function callImportFundProfile(callback) {
  try {

    const response = await axios({
      method: 'GET',
      url: 'http://localhost:5500/api/FundProfileDaily'

    });
  } catch (error) {
    console.log("error:FundProfileDaily");
    console.error(error);
  }

}
async function callPrepareFundProfile(callback) {
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/prepareFundprofile',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      json: true

    });
    let string1 = response.data;
    console.log(string1)
    return callback(string1);


  } catch (error) {
    console.log("error:call Reconcile transaction fund ");
    // console.error(error);
  }
}
async function callSumAllotDaliy(callback) {
  try {

    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/ImportSumAllotDaliy',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      json: true

    });
    let string1 = response.data;
    console.log(string1)
    return callback(string1);


  } catch (error) {
    console.log("error:call Reconcile transaction fund ");
    // console.error(error);
  }
}
async function callApiSms(callback) {
  // var axios = require('axios');
// var config = {
//     method: 'post',
//     url: 'https://portal-otp.smsmkt.com/api/otp-send',
//     headers: {
//         "Content-Type":"application/json",
//         "api_key":"50ee95243c89f7c6b17b84aa618ab00a",
//         "secret_key":"iDGHMpPCIdPQrXHw",
//     },
//     data:JSON.stringify({
//         "phone":"0899695517",
//         "ref_code":"123456",
//         "project_key":"11111",
//     })
// };
const response = await axios({
  method: 'POST',
  url: 'https://portal-otp.smsmkt.com/api/otp-send',
  headers: {
    "Content-Type":"application/json",
        "api_key":"50ee95243c89f7c6b17b84aa618ab00a",
        "secret_key":"iDGHMpPCIdPQrXHw",
  },
  data:JSON.stringify({
    "phone":"0899695517", 
    "project_key":"30f50592cb",
})

});
let string1 = response.data;
console.log(string1)
return callback(string1);
 
}
async function callGenReportTexSavingBuyMobile(callback){
  try{           
      
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5055/api/genReportTexSavingBuy',
      headers : {
          'content-type': 'application/json',
          'cache-control': 'no-cache'
        },
     //  body: sParams,
     //  data: sParams,
      json: true  
     
    });
    let string1 = response.data;
    //return callback(string1);
  } catch (error) {
     console.log("error: call Gen Report Unitbalance Mobile");
     console.error(error);
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
  importCenCustomer,
  getFundOrderInquiry2,
  selectaccount,
  callImportCustomers,
  callImportCustomerId,
  callImportOrderInquiry,
  callupdateSwitchOut,
  callImportUnitBalance,
  callImportTransaction,
  calltruncateTable,
  callcheckunibalanceupdate,
  calldatatransaction
  , callprepareunitbalance
  , callImportTransactionAllot
  , callImportFundbycode
  , callImportGetAllFund
  , callImportTransactionMannul
  , callFuncReconcileTran
  , callgetDatatrantolog
  , callclonetranallot
  , callImportFundProfile
  , callPrepareFundProfile
  , callSumAllotDaliy
  ,callApiSms
  ,callGenReportTexSavingBuyMobile
}
