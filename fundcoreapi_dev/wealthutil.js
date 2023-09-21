import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import request from 'request';
dotenv.config();
var gtoken = [];

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
// when using JSON.stringify(circularReference, getCircularReplacer());


async function isLogin() {
  let token = process.env['ROOT_TOKEN'];
  let getdate = new Date(process.env['ROOT_TOKEN_TIME'])

  if (token == undefined || token == 'nokey'){
      console.log("token is undefined");
      //await getLogin();
      getLoginCallBack(function(x){
        token = x;
        console.log(x);
      });
      
  }
  if (getdate < new Date()){
      console.log("token time out ... reLogin");
      getLoginCallBack(function(x){
        token = x;
        console.log(x);
      });
  }
  return token;
}



async function getTocken(callback ){

  axios({
      method: 'post',
      url: process.env.ISSUER_BASE_URL,
      headers:{            
          "Content-Type": 'application/json'
      },
      data:{
          username: process.env.CLIENT_ID,
          password: process.env.CLIENT_PASS
      },
      json: true
  })
      .then(res => callback(res.data))
      .catch(err => console.error(err));
 
}

async function getLogin(){
    
  try {
          gtoken = [];
          //let result = await getTocken1( function(token) {
          let result = await getTocken( function(token) {
              gtoken.push(token);
              let token_time = new Date(Date.now() + (10 * 60 * 1000)); // 10 minutes from now
              process.env['ROOT_TOKEN'] = gtoken[0].access_token;    
              process.env['ROOT_TOKEN_TIME'] = token_time;    
              console.log('==ROOT_TOKEN====');
              console.log("TOKEN:"+process.env['ROOT_TOKEN']);
              console.log('==TIMEOUT_TOKEN====');
              console.log(process.env['ROOT_TOKEN_TIME']);
              return gtoken;        
          });
      return result;
  }
  catch (error){
      console.error(error);    
      //return error;
  }    
}

async function getLoginCallBack (callback){

  try{
    gtoken = [];
    //let result = await getTocken1( function(token) {
    let result = await getTocken( function(token) {
        gtoken.push(token);
        let token_time = new Date(Date.now() + (10 * 60 * 1000)); // 10 minutes from now
        process.env['ROOT_TOKEN'] = gtoken[0].access_token;    
        process.env['ROOT_TOKEN_TIME'] = token_time;    
        console.log('==ROOT_TOKEN====');
        console.log("TOKEN:"+process.env['ROOT_TOKEN']);
        console.log('==TIMEOUT_TOKEN====');
        console.log(process.env['ROOT_TOKEN_TIME']);
        return process.env['ROOT_TOKEN'];        
    });
    //return result;
    return callback(result);
  }
  
  catch (error){
      console.error(error);    
      //return error;
  }
}


async function setErrorLog( apiRef, endPoint, apiError, apiDesc, callback ) {

    
    const text = '{"apiRef": "","endPoint": "","apiError": "","apiDesc": ""}';
    const errParams = JSON.parse(text);
    errParams["apiRef"] = apiRef;
    errParams["endPoint"] = endPoint;
    errParams["apiError"] = apiError;
    errParams["apiDesc"] = apiDesc;

  try{
    
    let options2 = {
      'method': 'POST',
      'url': 'http://localhost:5050/api/setErrorLog',
      'headers': {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
        },
      body: errParams,
      json: true 
    };
    //console.log(options2);
    request(options2, function (error, response) {
      if (error) throw new Error(error);
      //console.log(response.body);
      return callback (response.body);
    });
  
  } catch (error) {
    
    console.log(error);
    return callback (error);
  }
  return true;
  
} 

async function setUpdateIndividualAccoutCODE( apiRef, apiDesc, callback ) {

    
    const text = '{"apiRef": "","apiDesc": ""}';
    const errParams = JSON.parse(text);
    errParams["apiRef"] = apiRef;
    errParams["apiDesc"] = apiDesc;

  try{
    await axios({
			method: 'POST',
            url: 'http://localhost:5050/api/setUpdateIndividualAccoutCODE',      
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },
            data: errParams,
            responseType: 'json'  
		})
        .then(function (response) {
        return callback(response.status);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            return callback(error);
        });
    
  } catch (error) {
    
    console.log(error);
    return callback (error);
  }
  return true;
  
}

async function setUpdateStatusExcel(cardNumber, returnCode, apiDesc, callback) {
  
  const text = '{"cardNumber": "","returnCode": "","apiDesc": ""}';
  const sParams = JSON.parse(text);
  sParams["cardNumber"] = cardNumber;
  sParams["returnCode"] = returnCode;
  sParams["apiDesc"] = apiDesc;
  //console.log("setUpdateStatus:");
  //console.log(sParams);

  try{
  
    let options2 = {
      'method': 'POST',
      'url': 'http://localhost:5050/api/setStatusExcel',
      'headers': {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
        },
      body: sParams,
      json: true 
    };
  
    request(options2, function (error, response) {
      if (error) throw new Error(error);
      //console.log(response.body);
      return callback (response.body)
    });

  } catch (error) {
  
    console.log(error);
    return callback (error)
  }
return true;

}

async function setUpdateStatus(cardNumber, returnCode, apiDesc, callback) {
  
  const text = '{"cardNumber": "","returnCode": "","apiDesc": ""}';
  const sParams = JSON.parse(text);
  sParams["cardNumber"] = cardNumber;
  sParams["returnCode"] = returnCode;
  sParams["apiDesc"] = apiDesc;
  //console.log("setUpdateStatus:");
  //console.log(sParams);

  try{
  
    let options2 = {
      'method': 'POST',
      'url': 'http://localhost:5050/api/setStatus',
      'headers': {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
        },
      body: sParams,
      json: true 
    };
  
    request(options2, function (error, response) {
      if (error){
        //throw new Error(error);
        console.dir(error);
 
      }    
      return callback (response.body)
    });

  } catch (error) {
  
    console.log(error);
    return callback (error)
  }
return true;

}

function getDateYesterday(){
  //console.log("today date:"+ new Date());
  var d = new Date(); // Today!
  
  
  d.setDate(d.getDate() - 1); // Yesterday!
  
  console.log("yesterday date:"+ d);

  let xmonth = '' + (d.getMonth()+1);
  let xday = '' + d.getDate();
  let year = (d.getFullYear());
  
  

  if (xmonth.length < 2) 
    xmonth = '0' + xmonth;
  if (xday.length < 2) 
    xday = '0' + xday;  
  return year + xmonth + xday;
 
}
function getNextDate(count){
  //console.log("today date:"+ new Date());
  var d = new Date(); // Today!
  
  
  d.setDate(d.getDate() + count); // Yesterday!
  
  console.log("Next day date:"+ d);

  let xmonth = '' + (d.getMonth()+1);
  let xday = '' + d.getDate();
  let year = (d.getFullYear());
  
  

  if (xmonth.length < 2) 
    xmonth = '0' + xmonth;
  if (xday.length < 2) 
    xday = '0' + xday;  
  return year + xmonth + xday;
 
}


export {
  getTocken,
  setErrorLog,
  setUpdateStatus,
  setUpdateIndividualAccoutCODE,
  getLogin,
  isLogin,
  getDateYesterday,
  getLoginCallBack,
  setUpdateStatusExcel,
  getCircularReplacer,
  getNextDate
      
};