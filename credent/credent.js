import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path  from 'path';
import nodemailer from 'nodemailer';
import ftpClient from 'ftp-client';
//import { json } from 'body-parser';
dotenv.config();

async function callFundPerformance (fund_code,Amccode , callback){
    const rettext       = '{"success": true,"error": ""}';
    const sReturn       = JSON.parse(rettext);
    const Datatxt       = '{"fund_code": "" , "Amccode" : ""}';
    const sData         = JSON.parse(Datatxt);
    sData.fund_code     = fund_code
    sData.Amccode       = Amccode
    try{
            
        await axios({
            method: 'post',
            url: 'http://localhost:5050/api/getFundPerformance',
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache'
              },
            data: sData,
            responseType: 'json'                    
        })
        .then(res => {
            console.log("complete job: Fund Performance");
            console.dir(res);
            // flag_sucess = 1
            return callback(res);
        })
        .catch(err => {
            console.log("error Fund Performance :");
            //console.log(err);
            // flag_sucess = 0            
            return callback(err);     
        });
        
        
    } catch(error) {
        console.dir(error);
        //return callback(error.response.status + " " + error.response.data);
    }


}
async function callFundDataNav (fund_code,Amccode , callback){
    const rettext       = '{"success": true,"error": ""}';
    const sReturn       = JSON.parse(rettext);
    const Datatxt       = '{"fund_code": "" , "Amccode" : ""}';
    const sData         = JSON.parse(Datatxt);
    sData.fund_code     = fund_code
    sData.Amccode       = Amccode
    try{
            
        await axios({
            method: 'post',
            url: 'http://localhost:5050/api/getFundDataNav',
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache'
              },
            data: sData,
            responseType: 'json'                    
        })
        .then(res => {
            console.log("complete job: Fund Performance");
            console.dir(res);
            // flag_sucess = 1
            return callback(res);
        })
        .catch(err => {
            console.log("error Fund Performance :");
            //console.log(err);
            // flag_sucess = 0            
            return callback(err);     
        });
        
        
    } catch(error) {
        console.dir(error);
        //return callback(error.response.status + " " + error.response.data);
    }


}
async function credentUpdateStatus(txid,new_status,email,cardno,  callback){
    const rettext       = '{"success": true,"error": ""}';
    const sReturn       = JSON.parse(rettext);
    const Datatxt       = '{"txid": "","new_status": "","email": "" ,"cardno":"" }';
    const sData         = JSON.parse(Datatxt);
    sData.txid          = txid;
    sData.new_status    = new_status;
    sData.email         = email;
    sData.cardno        = cardno;
    // sData.docno  = docno //"test";
    //const sData_json = JSON.stringify(sData);
    let flag_sucess     = 0
    // console.dir(cardno);

    // setTimeout(() => {
        if(new_status = "1")  {  await  sendmail(txid,new_status,email,cardno);} // sendmail
    // }, 4000);
  
        try{
            
            await axios({
                method: 'post',
                url: 'http://localhost:5050/api/setCredentUpdate',
                headers : {
                    'content-type': 'application/json',
                    'cache-control': 'no-cache'
                  },
                data: sData,
                responseType: 'json'                    
            })
            .then(res => {
                console.log("complete job: from credentUpdateStatus");
                //console.dir(res);
                flag_sucess = 1
                return callback(res.status);
            })
            .catch(err => {
                console.log("error from credentUpdateStatus:");
                console.log(err);
                flag_sucess = 0            
                return callback(err);     
            });
            
            
    } catch(error) {
        console.dir(error);
        //return callback(error.response.status + " " + error.response.data);
    }
//    console.log("cardno : "+cardno)
// setTimeout(() => {
//     if(new_status = "1")  {    sendmail(txidmail,new_status,email,cardno);} // sendmail
// }, 4000);
   
};
//------------------------------------------------------------by Best----------------------------------------
async function sendmail(txid,new_status,email,cardno){
    let approve 
    if (new_status == "1"){
        approve = "Approve"
    }else{
        approve = "Not Approve"
    }
    // console.log("cardno : "+cardno)
    // console.log("txid : "+txid)
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
                user: 'esign@wealthrepublic.co.th',
                pass: 'Wealth@2022'
            },
            tls:{ 
                rejectUnauthorized: false 
                }
        });
    
        // Message object
        let message = {
            from: 'cs@wealthrepublic.co.th',
            to: 'esign@wealthrepublic.co.th',
            subject: 'Auto mail Dip Chip',
            text: `Number Citizen ${cardno}  ${approve} `,
            html:  `Number Citizen ${cardno} Approve` 
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
async function sendmailCs(toemail,body,callback){
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
                user: 'esign@wealthrepublic.co.th',
                pass: 'Wealth@2022'
            },
            tls:{ 
                rejectUnauthorized: false 
                }
        });
    
        // Message object
        let message = {
            from: 'cs@wealthrepublic.co.th',
            to: `${toemail}`,
            subject: 'Request Form',
            text: ` ${body}  `,
            html:  `  ${body}  ` 
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
async function sendMailDetailx(txid,new_status,email,cardno){
    let approve 
    // if (new_status == "1"){
    //     approve = "Approve"
    // }else{
    //     approve = "Not Approve"
    // }
    // console.log("cardno : "+cardno)
    // console.log("txid : "+txid)
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
                user: 'esign@wealthrepublic.co.th',
                pass: 'Wealth@2022'
            },
            tls:{ 
                rejectUnauthorized: false 
                }
        });
        directory = path.dirname("");
        var parent = path.resolve(directory, '..');
        var uploaddir = parent + (path.sep) + 'emailprj' + (path.sep) + 'public' + (path.sep) + 'images' + (path.sep);
        var filepath = path.join(uploaddir, file[0].originalname);
        var file = req.files;
        // Message object
        let message = {
            from: 'cs@wealthrepublic.co.th',
            to: 'atichat@wealthrepublic.co.th',
            subject: 'Auto mail Dip Chip',
            text: `Number Citizen ${cardno}  ${approve} `,
            html:  `Number Citizen ${cardno} Approve` ,
            attachments : [
                            {
                                filename: file[0].originalname,
                                streamSource: fs.createReadStream(filepath)
                            }
                          ]
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
async function CredentQuestionaire(mail ,callback){

    let cur_token  = process.env['SECRET_KEY'];
    const URL = process.env['URL_GET_QUESTIONAIRE']+"?email="+mail; 
    console.log(URL)
    await axios({
       method: 'GET',
       url: URL,
       headers : {
           'apiKey': cur_token
         },
       responseType: 'json'  
     })
     .then(function (response) {
        // handle success
        //console.log("==================================");
        // console.log(response.data);
        
        return callback(response) ;
     })
     .catch(function (error) {
        // handle error
        console.log(error);
        return callback(error);
     });
     return callback("questionaire success") ;

}
async function CredentSetQuestionaire(xData ,callback){
    //    const Datatxt = '{"tmail": ""}';
     //   const sData  = JSON.parse(tdata);
    //     sData.tmail = mail;
     //  const sData_json = JSON.stringify(sData);
    // //let flag_sucess = 0
    const sParams = xData.data;
         console.log(sParams)

     try{           
      
        const response = await axios({
          method: 'POST',
          url: 'http://localhost:5050/api/setCredentupdateQuestionaire',
          headers : {
              'content-type': 'application/json',
              'cache-control': 'no-cache'
            },
          body: sParams,
          data: xData.data,
          json: true  
         
        });
        string1 = response.data;
        return callback(string1);
        
    
      } catch (error) {
        console.log("error:callImportjob");
        console.error(error);
      }  



   // console.log(Datatxt)


     return "CredentSetQuestionaire" 
}
async function sendmailx(email,detail){
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
                user: 'esign@wealthrepublic.co.th',
                pass:  'Wealth@2022'//'Wealth@2022' //cb11@4tF3
            },
            tls:{ 
                rejectUnauthorized: false 
                }
        });
    
        // Message object
        let message = {
            from: 'cs@wealthrepublic.co.th',
            to: 'esign@wealthrepublic.co.th',
            subject: 'test mail',
            text: ` ${detail}   `,
            html:  ` ${detail}  ` ,
            cc: `${email}`
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
async function sendMailDetail(email,detail,filename,pathfile){
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
                user: 'esign@wealthrepublic.co.th',
                pass:  'Wealth@2022'//'Wealth@2022' //cb11@4tF3
            },
            tls:{ 
                rejectUnauthorized: false 
                }
        });
        // directory = path.dirname("");
        // var parent = path.resolve(directory, '..');
        // var uploaddir = parent + (path.sep) + 'emailprj' + (path.sep) + 'public' + (path.sep) + 'images' + (path.sep);
        // var filepath = path.join(uploaddir, file[0].originalname);
        // var file = req.files;
        // Message object
        pathfile = "//192.168.2.26"+pathfile 
        // fs.access(filename , fs.constants.F_OK, (err)=>{

        // })

        let message = {
            from: 'cs@wealthrepublic.co.th',
            to: 'atichat@wealthrepublic.co.th',
            subject: 'test mail',
            text: ` ${detail}   `,
            html:  ` ${detail}  ` ,
            cc: `${email}`  ,
            attachments : [
                {
                    filename: filename,
                    path: pathfile 
                }
              ]
        };
        /*attachments: [
        {
            filename: 'mailtrap.png',
            path: __dirname + '/mailtrap.png',
            cid: 'uniq-mailtrap.png'
        }
    ]*/ 
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
async function callFundPerformanceGroup(fundgroup, callback){
    const rettext       = '{"success": true,"error": ""}';
    const sReturn       = JSON.parse(rettext);
    const Datatxt       = '{"fundGroup": "" }';
    const sData         = JSON.parse(Datatxt);
    sData.fundGroup     = fundgroup
    // sData.Amccode       = Amccode
    try{
            
        await axios({
            method: 'post',
            url: 'http://localhost:5050/api/getFundPerformanceGroup',
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache'
              },
            data: sData,
            responseType: 'json'                    
        })
        .then(res => {
            console.log("complete job: Fund Performance");
            console.dir(res);
            // flag_sucess = 1
            return callback(res);
        })
        .catch(err => {
            console.log("error Fund Performance :");
            //console.log(err);
            // flag_sucess = 0            
            return callback(err);     
        });
        
        
    } catch(error) {
        console.dir(error);
        //return callback(error.response.status + " " + error.response.data);
    }

}
async function FTFgetFile(filename, filepath, callback){
    //ftp-client
    let configx = {
        host: '192.168.2.26',
        port: 21,
        user: 'userpdf',
        password: 'wealth@2022'
    },
    options = {
        logging: 'basic'
    },
    client = new ftpClient(configx, options);

    client.connect(function () {
 
        // client.upload(['test/**'], '/public_html/test', {
        //     baseDir: 'test',
        //     overwrite: 'older'
        // }, function (result) {
        //     console.log(result);
        // });
        console.log("path : "+filepath)
        console.log("filename : "+filename)
        client.download(filepath, filename, {
            overwrite: 'all'
        }, function (result) {
            console.log(result);
        });
     
    });
}
async function callUniholderAll(accountId,callback){
    const Datatxt       = '{"accountId": "" }';
    const sData         = JSON.parse(Datatxt);
    sData.accountid          = accountId;
    try{
            
        await axios({
            method: 'post',
            url: 'http://localhost:5050/api/getUnitholderAll',
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache'
              },
              data: sData,                    
        })
        .then(res => {
            console.log("Complete All Unitholder ");
            // console.dir(res);
            // flag_sucess = 1
            console.log(res.data)
            return callback(res.data);
        })
        .catch(err => {
            console.log("error All Unitholder :");
            //console.log(err);
            // flag_sucess = 0            
            return callback(err);     
        });
        
        
    } catch(error) {
        console.dir(error);
        //return callback(error.response.status + " " + error.response.data);
    }

     
}
async function calldatadipchip(calldate ,callback){
    const rettext       = '{"success": true,"error": ""}';
    const sReturn       = JSON.parse(rettext);
    const Datatxt       = '{"chip_date": ""  }';
    const sData         = JSON.parse(Datatxt);
    sData.chip_date     = calldate 
    try{
            
        await axios({
            method: 'post',
            url: 'http://localhost:5550/api/getdipchipcomfirm',
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache'
              },
            data: sData, 
            responseType: 'json'                    
        })
        .then(res => {
            // console.log("complete job: get data dipchip");
            // console.dir(res);
            // flag_sucess = 1
            return callback(res.data);
        })
        .catch(err => {
            console.log("error Fund Performance :");
            //console.log(err);
            // flag_sucess = 0            
            return callback(err);     
        });
        
        
    } catch(error) {
        console.dir(error);
        //return callback(error.response.status + " " + error.response.data);
    }

}
async function callupdatedipchip(data,callback){
    //  console.log('callupdata')
    //  console.log(data)
    try{
            
        await axios({
            method: 'post',
            url: 'http://localhost:5055/api/callupdatedipchip',
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache'
              },
            data: data,
            body: data,
            // params : data, 
            responseType: 'json'                    
        })
        .then(res => {
            console.log("complete job: get data dipchip");
            // console.dir(res);
            // flag_sucess = 1
            return callback(res.data);
        })
        .catch(err => {
            console.log("error Fund Performance :");
            //console.log(err);
            // flag_sucess = 0            
            return callback(err);     
        });
        
        
    } catch(error) {
        console.dir(error);
        //return callback(error.response.status + " " + error.response.data);
    }

 
} 
export {
    credentUpdateStatus,
    CredentQuestionaire,
    CredentSetQuestionaire,
    sendmailx,
    callFundPerformanceGroup,
    callFundPerformance,
    callFundDataNav,
    sendMailDetail,
    FTFgetFile,
    callUniholderAll,
    calldatadipchip ,
    callupdatedipchip,
    sendmailCs
}