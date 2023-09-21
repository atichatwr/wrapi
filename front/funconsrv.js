
//const { emit } = require('nodemon');

import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import request from 'request';
import {data1 , importCustNo} from './dataTest.js';

import {getLogin,setErrorLog,setUpdateStatus,getTocken,isLogin} from './wealthutil.js';
dotenv.config();



var gtoken = [];


async  function runIndividualProfileLoop( callback ){ 
    let NumJobs = [];
    let dummy = [];
    let xrow = 0;
    try{
        getIndividualJobs().then( result => {
            NumJobs = result;
            //dummy = result;
            //NumJobs = importCustNo;
            NumJobs.forEach((job, i) => {
                setTimeout(() => {
                  console.log(job.cardNumber);
                  setIndividualx(job.cardNumber, function (x){
                    xrow++
                    if (xrow >= 100){
                        getLogin();
                        xrow = 0;        
                    }          
                  })  
                }, i * 5000);
              });
        
        });
        return callback("finish job");
    } catch (error) {
        console.error(error);
    }

}

//-----
async  function runIndividualLoop( callback ){ 
    let NumJobs = [];
    let dummy = [];
    let xrow = 0;
    try{
        getIndividualJobs().then( result => {
            NumJobs = result;
            //dummy = result;
            //NumJobs = importCustNo;
            NumJobs.forEach((job, i) => {
                setTimeout(() => {
                  console.log(job.cardNumber);
                  setIndividualx(job.cardNumber, function (x){
                    xrow++
                    if (xrow >= 100){
                        getLogin();
                        xrow = 0;        
                    }          
                  })  
                }, i * 5000);
              });
        
        });
        return callback("finish job");
    } catch (error) {
        console.error(error);
    }

}

async function setIndividualxx ( cardNumber , callback){
    let result = true;

    let tdata = JSON.parse(data1);
    //console.log(tdata);
    try{
        let cur_token = gtoken[0].access_token;   
        //let cur_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAyMjMsInVzZXJuYW1lIjoiQVBJX1dSMDEiLCJzZWxsaW5nQWdlbnRJZCI6MTQxLCJzZWxsaW5nQWdlbnRDb2RlIjoiV1IiLCJpc1Bhc3N0aHJvdWdoIjpmYWxzZSwicm9sZXMiOlsxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyMywyNCwyNSwyNiwyNywyOCwyOSwzMCwzMV0sImlhdCI6MTYzMDk4MzQyNCwiZXhwIjoxNjMwOTg1MjI0fQ.-_S_s_Swe65l7V3EzN5d631-MBoiPDm5loFqbHkQFSg"
        

        await getWealthIndividual( cardNumber, function(wealthdata){
            
            axios({
                    method: 'post',
                    url: 'https://stage.fundconnext.com/api/customer/individual/v4',
                    headers : {
                        'content-type': 'application/json',
                        'cache-control': 'no-cache',
                        'x-auth-token': cur_token
                      },
                    data: tdata,
                    responseType: 'json'                    
            })
                .then(res => {
                    console.log("complete job: from error from setIndividualxx");
                    finishJobStatus(cardNumber, res.response.status , "ok 9999");
                })
                .catch(err => {
                    console.log("error from setIndividualxx:");
                    console.log(err);
                    
                         
                });                
        });
        

        console.log(cardNumber);
        return callback(result);    
    } catch (error){
        console.error(error);
        return callback(false);    
    }

}


async function setIndividualAccountX1 ( cardNumber , callback){
    let result = true;
    let tdata = {};
    try{
        let cur_token = gtoken[0].access_token;
        await getWealthIndividualAccountX1( cardNumber, function(wealthdata){
           
            //console.log(wealthdata);
            tdata = JSON.parse(wealthdata);
            console.log(wealthdata);
            console.log(tdata);
            
            let options2 = {
                'method': 'POST',
                'url': 'https://stage.fundconnext.com/api/customer/individual/account/v4',
                'headers': {
                  'X-Auth-Token': cur_token,
                  'Content-Type': 'application/json'                  
                },
                body: tdata,
                json: true 
              };
            
            request(options2, function (error, response) {
                if (error) { 
                    throw new Error(error); 
                    console.log(error);
                }
                
                let status = response.statusCode;
                let xMsg = response.body; 
                let xxMsg = "";
                console.dir(xxMsg);
                console.dir(status);

                 if (status == '200' || xMsg == ""  ){
                    console.log("complete job: status 200");
                    finishJobStatus(cardNumber, "200" , "completed job");

                 }else{
                    if (xMsg.hasOwnProperty('errMsg')){
                        xxMsg = xMsg.errMsg.message;
                        console.log("in condition");
                        if (xxMsg == "Customer is duplicated."){
                            console.log("job completed");
                            finishJobStatus(cardNumber, "200" , "completed job");    
                        } else {
                            console.log(response.body);    
                            finishErrorStatus(cardNumber, "5000:LoopInput", xMsg.errMsg.code, xMsg.errMsg.message);    
                        }
                                                
                    }else{
                        console.log("out condition");
                        console.log(response.body);
                        finishErrorStatus(cardNumber, "5000:LoopInput", "xxx", "cannot read error");

                    }
                    
                 }
                
                return(response.body);
            });        
                
        });
        
        return callback(result);    
    } catch (error){
        console.error(error);
        return callback(false);    
    }

};




async function setIndividualAccount ( cardNumber , callback){
    let result = true;
    let tdata = {};
    try{
        let cur_token = gtoken[0].access_token;
        await getWealthIndividualAccount( cardNumber, function(wealthdata){
           
            //console.log(wealthdata);
            tdata = JSON.parse(wealthdata);
            console.log(wealthdata);
            console.log(tdata);
            
            let options2 = {
                'method': 'POST',
                'url': 'https://stage.fundconnext.com/api/customer/individual/account/v4',
                'headers': {
                  'X-Auth-Token': cur_token,
                  'Content-Type': 'application/json'                  
                },
                body: tdata,
                json: true 
              };
            
            request(options2, function (error, response) {
                if (error) { 
                    throw new Error(error); 
                    console.log(error);
                }
                
                let status = response.statusCode;
                let xMsg = response.body; 
                let xxMsg = "";
                console.dir(xxMsg);
                console.dir(status);

                 if (status == '200' || xMsg == ""  ){
                    console.log("complete job: status 200");
                    finishJobStatus(cardNumber, "200" , "completed job");

                 }else{
                    if (xMsg.hasOwnProperty('errMsg')){
                        xxMsg = xMsg.errMsg.message;
                        console.log("in condition");
                        if (xxMsg == "Customer is duplicated."){
                            console.log("job completed");
                            finishJobStatus(cardNumber, "200" , "completed job");    
                        } else {
                            console.log(response.body);    
                            finishErrorStatus(cardNumber, "5000:LoopInput", xMsg.errMsg.code, xMsg.errMsg.message);    
                        }
                                                
                    }else{
                        console.log("out condition");
                        console.log(response.body);
                        finishErrorStatus(cardNumber, "5000:LoopInput", "xxx", "cannot read error");

                    }
                    
                 }
                
                return(response.body);
            });        
                
        });
        
        return callback(result);    
    } catch (error){
        console.error(error);
        return callback(false);    
    }

};


async function putIndividualAccount ( cardNumber , callback){
    let result = true;
    let tdata = {};
    try{
        isLogin();
        //let cur_token = gtoken[0].access_token;
        let cur_token = process.env['ROOT_TOKEN'];
        await getWealthIndividualAccount( cardNumber, function(wealthdata){
            //console.log(wealthdata);
            tdata = JSON.parse(wealthdata);
            //console.log(tdata);
            let options2 = {
                'method': 'PUT',
                'url': 'https://stage.fundconnext.com/api/customer/individual/account/v4',
                'headers': {
                  'X-Auth-Token': cur_token,
                  'Content-Type': 'application/json'                  
                },
                body: tdata,
                json: true 
              };
            
            request(options2, function (error, response) {
                if (error) { 
                    throw new Error(error); 
                    console.log(error);
                }
                
                let status = response.statusCode;
                let xMsg = response.body; 
                let xxMsg = "";
                console.dir(xxMsg);
                console.dir(status);

                 if (status == '200' || xMsg == ""  ){
                    console.log("complete job: status 200");
                    finishJobStatus(cardNumber, "200" , "completed job");

                 }else{
                    if (xMsg.hasOwnProperty('errMsg')){
                        xxMsg = xMsg.errMsg.message;
                        console.log("in condition");
                        if (xxMsg == "Customer is duplicated."){
                            console.log("job completed");
                            finishJobStatus(cardNumber, "200" , "completed job");    
                        } else {
                            console.log(response.body);    
                            finishErrorStatus(cardNumber, "5000:LoopInput", xMsg.errMsg.code, xMsg.errMsg.message);    
                        }
                                                
                    }else{
                        console.log("out condition");
                        console.log(response.body);
                        finishErrorStatus(cardNumber, "5000:LoopInput", "xxx", "cannot read error");

                    }
                    
                 }
                
                return(response.body);
            });        
            
        });
        return callback(result);    
    } catch (error){
        console.error(error);
        return callback(false);    
    }

};


async function setIndividualx ( cardNumber , callback){
    let result = true;
    //let tdata = JSON.parse(data1);
    //console.log(tdata);
    
    let tdata = {};
    //tdata = JSON.parse(data1);
    try{
        isLogin();
        //let cur_token = gtoken[0].access_token;
        let cur_token = process.env['ROOT_TOKEN'];
        await getWealthIndividual( cardNumber, function(wealthdata){
            //console.log(wealthdata);
            tdata = JSON.parse(wealthdata);
            //console.log(tdata);
            let options2 = {
                'method': 'POST',
                'url': 'https://stage.fundconnext.com/api/customer/individual/v4',
                'headers': {
                  'X-Auth-Token': cur_token,
                  'Content-Type': 'application/json'                  
                },
                body: tdata,
                json: true 
              };
            
            
            
            request(options2, function (error, response) {
                if (error) { 
                    throw new Error(error); 
                    console.log(error);
                }
                
                let status = response.statusCode;
                let xMsg = response.body; 
                let xxMsg = "";
                console.dir(xxMsg);
                console.dir(status);

                 if (status == '200' || xMsg == ""  ){
                    console.log("complete job: status 200");
                    finishJobStatus(cardNumber, "200" , "completed job");

                 }else{
                    if (xMsg.hasOwnProperty('errMsg')){
                        xxMsg = xMsg.errMsg.message;
                        console.log("in condition");
                        if (xxMsg == "Customer is duplicated."){
                            console.log("job completed");
                            finishJobStatus(cardNumber, "200" , "completed job");    
                        } else {
                            console.log(response.body);    
                            finishErrorStatus(cardNumber, "5000:LoopInput", xMsg.errMsg.code, xMsg.errMsg.message);    
                        }
                                                
                    }else{
                        console.log("out condition");
                        console.log(response.body);
                        finishErrorStatus(cardNumber, "5000:LoopInput", "xxx", "cannot read error");

                    }
                    
                 }
                
                return(response.body);
            });        
            
        });
        return callback(result);    
    } catch (error){
        console.error(error);
        return callback(false);    
    }

}
//----
async function putIndividualx ( cardNumber , callback){
    let result = true;
    //let tdata = JSON.parse(data1);
    //console.log(tdata);
    
    let tdata = {};
    //tdata = JSON.parse(data1);
    try{
        isLogin();
        let cur_token = process.env['ROOT_TOKEN'];
        //let cur_token = gtoken[0].access_token;
        await getWealthIndividual( cardNumber, function(wealthdata){
            //console.log(wealthdata);
            tdata = JSON.parse(wealthdata);
            //console.log(tdata);
            let options2 = {
                'method': 'PUT',
                'url': 'https://stage.fundconnext.com/api/customer/individual/v4',
                'headers': {
                  'X-Auth-Token': cur_token,
                  'Content-Type': 'application/json'                  
                },
                body: tdata,
                json: true 
              };
            
            
            
            request(options2, function (error, response) {
                if (error) { 
                    throw new Error(error); 
                    console.log(error);
                }
                
                let status = response.statusCode;
                let xMsg = response.body; 
                let xxMsg = "";
                console.dir(xxMsg);
                console.dir(status);

                 if (status == '200' || xMsg == ""  ){
                    console.log("complete job: status 200");
                    finishJobStatus(cardNumber, "200" , "completed job");

                 }else{
                    if (xMsg.hasOwnProperty('errMsg')){
                        xxMsg = xMsg.errMsg.message;
                        console.log("in condition");
                        if (xxMsg == "Customer is duplicated."){
                            console.log("job completed");
                            finishJobStatus(cardNumber, "200" , "completed job");    
                        } else {
                            console.log(response.body);    
                            finishErrorStatus(cardNumber, "5000:LoopInput", xMsg.errMsg.code, xMsg.errMsg.message);    
                        }
                                                
                    }else{
                        console.log("out condition");
                        console.log(response.body);
                        finishErrorStatus(cardNumber, "5000:LoopInput", "xxx", "cannot read error");

                    }
                    
                 }
                
                return(response.body);
            });        
            
        });
        return callback(result);    
    } catch (error){
        console.error(error);
        return callback(false);    
    }

}

//----

async function getWealthIndividualAccountX1( cardNumber, callback ){
    try{
        const response = await axios({
            method: 'GET',            
            url: 'http://localhost:5050/api/individualBankAccoutX1/'+cardNumber,
            json: true
         
        });

        let string1 = JSON.stringify(response.data);
        return callback(string1);
        
    } catch (error) {
        console.log("error:getWealthIndividual");
        console.error(error);
    }            
   
}
async function getWealthIndividualAccount( cardNumber, callback ){
    try{
        const response = await axios({
            method: 'GET',            
            url: 'http://localhost:5050/api/individualBankAccout/'+cardNumber,
            json: true
         
        });

        let string1 = JSON.stringify(response.data);
        return callback(string1);
        
    } catch (error) {
        console.log("error:getWealthIndividual");
        console.error(error);
    }            
   
}

//----
async function getWealthIndividual( cardNumber, callback ){
    try{
        const response = await axios({
            method: 'GET',
            url: 'http://localhost:5050/api/individualAccout/'+cardNumber,
            json: true
         
        });

        let string1 = JSON.stringify(response.data);
        return callback(string1);
        
    } catch (error) {
        console.log("error:getWealthIndividual");
        console.error(error);
    }            
   
}


async function getIndividualJobs(){
    try{
        const response = await axios({
            method: 'GET',
            url: 'http://localhost:5050/api/getCardNoLoop', 
        });
        return response.data;
    }
    catch(error){
        console.error(error);
    }            
}


async function finishJobStatus(cardNumber, eCode, xMsg){
    
    setUpdateStatus( cardNumber, eCode, xMsg, function(x){
        console.log(x);        
    })
}

async function finishErrorStatus(cardNumber, endPoint, eCode, xMsg){
    setErrorLog( cardNumber, endPoint,eCode,xMsg, function(x){

    })
}



export {
  getIndividualJobs,
  runIndividualProfileLoop,  
  setIndividualxx,
  setIndividualx,
  putIndividualx,
  putIndividualAccount,
  setIndividualAccount,
  setIndividualAccountX1,
  getLogin
};
