
import dotenv from 'dotenv';
import axios from 'axios';

import {getDateYesterday,isLogin} from './wealthutil.js';
dotenv.config();


async function dummyUnitHolder( amcCode, accountId, unitholderType, callback ){
    const URL = process.env['URL_UNITHOLDER_DUMMY'];
    let token = process.env['ROOT_TOKEN'];
    var delay = 1000; // 1 sec delay.
    if (token == undefined || token == 'nokey'){
            delay = 10000; // 10 sec delay.          
    }
    const dataTxt = '{"amcCode":"ABC","accountId":"A001","unitholderType": "SEG"}';
    const dataX = JSON.parse(dataTxt);
    
    if(amcCode != undefined && accountId != undefined && unitholderType != undefined){
        dataX.amcCode = amcCode;
        dataX.accountId = accountId;
        dataX.unitholderType = unitholderType;
        try{
            isLogin();
            setTimeout(function () {
                let cur_token = process.env['ROOT_TOKEN'];
                axios({
                    method: 'post',
                    url: URL,      
                    headers : {
                        'Content-Type': 'application/json', 
                        'cache-control': 'no-cache',
                        'X-Auth-Token': cur_token
                      },
                    data: dataX,
                    json: true                   
                })
                .then(res => {
                    console.log("complete job: from credentUpdateStatus");
                    //console.dir(res);
                    return callback (res.status);
                })
                .catch(error => {
                    
                    //console.log(error.response.data);
                    //console.log(error.response.status);
                    //console.log(error.response.headers);
                    return callback(error.response.data);
                         
                });
            
                    
            }, delay);

        } catch(e){
            console.log(e);
            return callback (e);
        }
    
    }


}

async function dummyUnitHolder2( amcCode, accountId, unitholderType, callback ){

    const URL = process.env['URL_UNITHOLDER_DUMMY'];
    let token = process.env['UNITHOLDER_ROOT_TOKEN'];
    var delay = 1000; // 1 sec delay.
    if (token == undefined || token == 'nokey'){
            delay = 10000; // 10 sec delay.          
    }
    const dataTxt = '{"amcCode":"{ABC}","accountId":"A001","unitholderType": "SEG"}';
    const dataX = JSON.parse(dataTxt);
    // console.log(dataTxt);
    let cur_token = process.env['UNITHOLDER_ROOT_TOKEN'];
    if(amcCode != undefined && accountId != undefined && unitholderType != undefined){
        dataX.amcCode = amcCode;
        dataX.accountId = accountId;
        dataX.unitholderType = unitholderType;
    }
    try{
        isLogin();
        let cur_token = process.env['ROOT_TOKEN'];
        const response = await axios({
            method: 'POST',
            url:  URL,
            headers : {
                'Content-Type': 'application/json', 
                'cache-control': 'no-cache',
                'X-Auth-Token': cur_token
              },
            body: dataX,
            data: dataX,
            json: true  
           
          });
          string1 = response.data;
          return callback(string1);

    }catch(e){
        console.log(e);
        return callback (e);
    }
    return callback(dataTxt);

}


export {
    dummyUnitHolder,
    dummyUnitHolder2

}