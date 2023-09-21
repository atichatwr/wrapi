import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import request from 'request';
import {data1 , importCustNo} from './dataTest.js';
import {getFundConnIndividualProfile, impIndividualAccount,hasIndividualProfile,getFundConnIndividualResponse} from './funconPipe.js';

import {getLoginCallBack,setErrorLog,setUpdateStatus,isLogin,getLogin,setUpdateStatusExcel,setUpdateIndividualAccoutCODE} from './wealthutil.js';
dotenv.config();


async function getIndividualExcel(){
    try{
        const response = await axios({
            method: 'GET',
            url: 'http://localhost:5050/api/getExcelIndividualLoop', 
        });
        return response.data;
    }
    catch(error){
        console.error(error);
    }            
}

async function getIndividualIds_LoopBy( datax ){
    try{
        const response = await axios({
            method: 'GET',
            url: 'http://localhost:5050/api/getIndividualIds_LoopBy/'+datax, 
        });
        return response.data;
    }
    catch(error){
        console.error(error);
    }            
}

async function runJobFunConnext( callback ){
    let  jobs = ['bob','joe','sue'];
    const aDate = getDateYesterday();
    try{

        jobs.forEach((job, i) => {
            setTimeout(() => {
                console.log(job);
                getFundConnExportFile( aDate,job, function(x){
                    console.log(x);
                });  
            }, i * 4000); // end setTimeout
        }); // end for each
        return callback("finish job");



    } catch (error) {
        console.error(error);
    }
    return callback("finish job");

}


async function runIndividualAccountUpdateLoop( callback){
    let NumJobs = [];
    let dummy = [];
    let xrow = 0;
    try{
        getIndividualIds_LoopBy("FundExc_Account_CODE").then( result => {
            console.log("FundExc_Account_CODE");
            console.log("result: ");
            console.dir(result);
            NumJobs = result;
            //dummy = result;
            //NumJobs = importCustNo;
            NumJobs.forEach((job, i) => {
                setTimeout(() => {
                  
                  console.log("----------Account Data--------------"); 
                  console.log(job.Card_Number);
                  console.log(job.Account_ID);
                  console.log(job.IC_License);
                  console.log(job.Account_Open_Date);
                  console.log(job.Mailing_Address_Same_as_Flag);
                  console.log(job.Mailing_Method);
                  console.log(job.InvestmentObjetive);
                  console.log(job.InvestmentOther);
                  console.log(job.Omibus);      
                  
                  //console.log('------------------');
                  //console.dir(job);
                  
                  updateIndividualAccountProfile( job , function(x){
                    xrow++
                    if (xrow >= 100){
                        getLogin();
                        xrow = 0;        
                    }
                  });
                                    
                }, i * 5000);
              });
        
        });
        return callback("finish job");
    } catch (error) {
        console.error(error);
    }


} 


async function updateIndividualAccountProfile( accountData, callback ){
    try{
        await  getFundConnIndividualResponse( accountData.Account_ID, function (datax,statusx){
            console.log("------------------------");
          
            
            let statusxx = statusx;
            let jdata = datax;
            //let jdata = JSON.parse(datax);
          
            console.log("retrieve Individual status: "+statusxx);
           
            if (jdata.hasOwnProperty('accounts')){
                if (statusxx == 200){
                    jdata.accounts[0].approved = true;
                    jdata.accounts[0].mailingAddressSameAsFlag = accountData.Mailing_Address_Same_as_Flag;
                    jdata.accounts[0].mailingMethod = accountData.Mailing_Method;
                    
                    if (accountData.InvestmentOther == null) {
                        accountData.InvestmentOther = "";
                    }
                    jdata.accounts[0].investmentObjective = accountData.InvestmentObjetive;
                    jdata.accounts[0].investmentObjectiveOther = accountData.InvestmentOther;
                    //console.log("------------------------");                
                    console.log("Individual has accounts data:for update");
                    console.dir(jdata.accounts[0]);
                    
                    updateIndividualAccount ( jdata , function(x){                        
                        
                        if ( x == '200'){
                            setUpdateIndividualAccoutCODE( accountData.Card_Number,x,function(y){
                                //console.log(y);
                                return callback(y);
                            } );
                        } else {
                            setUpdateIndividualAccoutCODE( accountData.Card_Number,x,function(y){
                                console.log(x);
                                return callback(y);
                            } );
                        }
                    });
                    
                }
            }    
        
        });


        return callback("result");
    } catch (error) {
        console.error(error);
        return callback("error");
    }            
   
}
//-----------------------------------------------------
async function updateIndividualAccount( jdata, callback ){
    try{
        isLogin();
        const URL = process.env['URL_INDIV_CUST_ACCOUT_V4'];
        let cur_token = process.env['ROOT_TOKEN'];
        jdata.accounts[0].approved = true;
        var myObjJSON = JSON.stringify(jdata.accounts[0]);
        console.log("URL: "+URL);
        console.log("Token: "+cur_token);
        console.log("json data");
        console.dir(myObjJSON);
        await axios({
			method: 'PUT',
            url: URL,      
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'x-auth-token': cur_token
            },
            data: myObjJSON,
            responseType: 'json'  
		})
        .then(function (response) {
            console.log("updateIndividualProfile==================");
            console.dir(response.data);
            if (response.data.hasOwnProperty('errMsg')){               
                return callback(response.data.errMsg.message);
            } else {
                return callback(response.status);
            }
        })
        .catch(function (error) {
            // handle error
            if (error.response) {
                console.log(error.response.data);
                if (error.response.data.hasOwnProperty('errMsg')){               
                    return callback(error.response.data.errMsg.message);
                } else {
                    return callback(error.response.status);
                }
            }
            //console.log(error);
            //return callback(error);
        });
        //return callback("finish job");
    } catch (error) {
        //console.error(error);
        if (error.response) {
            console.dir(error.response.data);
            console.log(error.response.status);
            //console.log(error.response.headers);
            return callback(error.response.status + " " + error.response.data);
          }
    }            
   
}



//-----------------------------------------------------
async function updateIndividualProfile( jdata, callback ){
    try{
        isLogin();
        const URL = process.env['URL_CUST_INDIV_V4'];
        let cur_token = process.env['ROOT_TOKEN'];
        var myObjJSON = JSON.stringify(jdata);
        console.log("URL: "+URL);
        console.log("Token: "+cur_token);
        console.log("json data");
        console.dir(myObjJSON);
        await axios({
			method: 'PUT',
            url: URL,      
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'x-auth-token': cur_token
            },
            data: myObjJSON,
            responseType: 'json'  
		})
        .then(function (response) {
            console.log("updateIndividualProfile==================");
            console.dir(response.data);
            return callback(response.status);
        })
        .catch(function (error) {
            // handle error
            if (error.response) {
                console.dir(error.response.data);
                console.log(error.response.status);
                //console.log(error.response.headers);
              }

            //console.log(error);
            return callback(error);
        });
        //return callback("finish job");
    } catch (error) {
        //console.error(error);
        if (error.response) {
            console.dir(error.response.data);
            console.log(error.response.status);
            //console.log(error.response.headers);
          }
    }            
   
}


async function runIdividualUpdateFundCenLoop( callback ) {
    let NumJobs = [];
    let dummy = [];
    let xrow = 0;

    try{
        getIndividualIds_LoopBy("FundExc_Individual").then( result => {
            NumJobs = result;
            //console.log(NumJobs);
            //dummy = result;
            //NumJobs = importCustNo;
            
            NumJobs.forEach((job, i) => {
                setTimeout(() => {
                  console.log(job.cardNumber);
                               
                        console.log("status:->Locate Individual Profile "+job.cardNumber);
                        impIndividualAccount ( job.cardNumber , function(x){
                            console.log("import/update data to individual cen account");
                            console.log(x);
                        });
              
                            
                }, i * 4000); // end setTimeout
                
                xrow++
                if (xrow >= 50){
                    //getLogin();
                    isLogin();    
                    xrow = 0;        
                } 
              
                
            }); // end for each
              
        }); // end getIndividualExcel
        return callback("finish job");
    } catch (error) {
        console.error(error);
    }


}

async  function runIndividualExcelLoop( callback ){ 
    let NumJobs = [];
    let dummy = [];
    let xrow = 0;
    try{
        getIndividualExcel().then( result => {
            NumJobs = result;
            //console.log(NumJobs);
            //dummy = result;
            //NumJobs = importCustNo;
            
            NumJobs.forEach((job, i) => {
                setTimeout(() => {
                  console.log("runIndividualExcelLoop "+job.cardNumber);
                  
                  hasIndividualProfile( job.cardNumber, function (statusx){
                    //let status = jdata.statusCode;
                    console.log("status:->"+statusx);
                    if (statusx == "200"){
                        
                        setExcelIndividual ( job.cardNumber, "PUT", function(x){
                            console.log("PUT");
                        });
                    } else {
                        //console.log("run POST job");
                        setExcelIndividual ( job.cardNumber, "POST", function(x){
                            console.log("POST");
                        });
                    }

                  });
               
                  
                }, i * 7000); // end setTimeout
                /*
                xrow++
                if (xrow >= 50){
                    getLogin();
                    xrow = 0;        
                } 
                */    
            }); // end for each
              
        }); // end getIndividualExcel
        return callback("finish job");
    } catch (error) {
        console.error(error);
    }

}


async function setExcelIndividual ( cardNumber,jobs , callback){
    let result = true;
   // jobs : POST , PUT 
    
    let tdata = {};
    //tdata = JSON.parse(data1);
    try{
        const URL = process.env['URL_CUST_INDIV_V4'];
        let cur_token = await isLogin();
        //console.log("chk ROOT_TOKEN");
        //console.log(cur_token);
        //'url': 'https://stage.fundconnext.com/api/customer/individual/v4',
        await getWealthExcelIndividual( cardNumber, function(wealthdata){
            //console.log(wealthdata);
            tdata = JSON.parse(wealthdata);
            
            
            
            //console.log(tdata);
            let options2 = {
                'method': jobs,
                'url': URL,
                'headers': {
                  'X-Auth-Token': cur_token,
                  'Content-Type': 'application/json'                  
                },
                body: tdata,
                json: true 
              };
            
            
            
            request(options2, function (error, response) {
                if (error) { 
                    //throw new Error(error); 
                    console.log(error);
                }
                
                let status = response.statusCode;
                let xMsg = response.body; 
                let xxMsg = "";
                //console.dir(xxMsg);
                //console.dir(status);

                 if (status == '200'){
                    console.log(cardNumber+"complete job: status 200");
                    //finishJobStatus(cardNumber, "200" , "completed job");
                    
                
                    finishUpdateStatusExcel(cardNumber, "200" , "completed job");
                    
                    //--- auto insert Individual Cen Account
                    impIndividualAccount ( cardNumber , function(x){
                        console.log("import data to individual cen account");
                        console.dir(x);
                    });
                    

                 }else{
                    //console.log("-----------------------------");
                    //console.dir(xMsg);
                    //console.log(tdata);
                    
                    if (xMsg.hasOwnProperty('errMsg')){
                        xxMsg = xMsg.errMsg.message;
                        console.log(cardNumber+" status "+status + " errMsg: "+xxMsg);
                        //console.log("in condition");
                        finishUpdateStatusExcel(cardNumber, status , xxMsg);
                        //finishJobStatus(cardNumber, status , xxMsg);
                       
                    }else{
                        console.log("out condition");
                        console.log(response.body);
                        finishUpdateStatusExcel(cardNumber, "XXX" , "completed job");

                    }
                    
                 }
                return("ok");
                //return(response.body);
            });        
            
        });
        return callback(result);    
    } catch (error){
        console.error(error);
        return callback(false);    
    }

}

async function getWealthExcelIndividual( cardNumber, callback ){
    try{
        const response = await axios({
            method: 'GET',
            url: 'http://localhost:5050/api/getExcelIndividual/'+cardNumber,
            json: true
         
        });

        let string1 = JSON.stringify(response.data);
        return callback(string1);
        
    } catch (error) {
        console.log("error:getWealthIndividual");
        console.error(error);
    }            
   
}

async function finishErrorStatus(cardNumber, endPoint, eCode, xMsg){
    setErrorLog( cardNumber, endPoint,eCode,xMsg, function(x){
  
    })
}
  
async function finishJobStatus(cardNumber, eCode, xMsg){
    
    setUpdateStatus( cardNumber, eCode, xMsg, function(x){
        console.log(x);        
    })
}



async function finishUpdateStatusExcel(cardNumber, eCode, xMsg){
    
    setUpdateStatusExcel( cardNumber, eCode, xMsg, function(x){
        console.log(x);        
    })
}

async function updateExcelIndividual ( cardNumber , callback){
    let result = true;
  

    
    let tdata = {};
    //tdata = JSON.parse(data1);
    //'url': 'https://stage.fundconnext.com/api/customer/individual/v4',
    try{
        //let cur_token = gtoken[0].access_token;
        const URL = process.env['URL_CUST_INDIV_V4'];
        let cur_token = process.env['ROOT_TOKEN'];
        console.log("chk ROOT_TOKEN");
        console.log(cur_token);
        
        await getWealthExcelIndividual( cardNumber, function(wealthdata){
            //console.log(wealthdata);
            tdata = JSON.parse(wealthdata);
            console.log(tdata);
            let options2 = {
                'method': 'PUT',
                'url': URL,
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

                 if (status == '200'){
                    console.log("complete job: status 200");
                    finishJobStatus(cardNumber, "200" , "completed job");

                 }else{
                    if (xMsg.hasOwnProperty('errMsg')){
                        xxMsg = xMsg.errMsg.message;
                        console.log(cardNumber +":"+ xxMsg);
                        finishJobStatus(cardNumber, status , xxMsg);
                      
                                                
                    }else{
                        console.log("out condition");
                        finishJobStatus(cardNumber, "XXX" , "cannot read error");

                        
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



export {
    setExcelIndividual,
    updateExcelIndividual,
    runIndividualExcelLoop,
    runIdividualUpdateFundCenLoop,
    runIndividualAccountUpdateLoop    
}
