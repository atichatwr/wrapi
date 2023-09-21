import express from 'express';
import sql from  'mssql';
import {config}  from './dbconfig.js';
import poolPromise from './db.js';


async function setCredentUpdate(  txid, new_status, xemail,cardId, callback ) {
    let result = "ok";
    let approvel = "DipChip"
    let statusSendMail = "U";
    try 
    {
      var statement = `INSERT INTO Fund_Credent_Update ( txid, new_status, xemail, approvel, statusSendMail,remark ) 
      VALUES (@itxid, @inew_status , @iemail, @approvel, @statusSendMail ,@remark);`
      
      await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .input("itxid"          , sql.NVarChar, cardId)
        .input("inew_status"    , sql.NVarChar, new_status)
        .input("iemail"         , sql.NVarChar, xemail)
        .input("approvel"       , sql.NVarChar, approvel)
        .input("statusSendMail" , sql.NVarChar, statusSendMail)
        .input("remark"         , sql.NVarChar, txid)
        .query(statement);
  
      }).then(result => {
        sql.close();
        return callback(result);  
  
      }).catch(err => {
        console.log(err);
        sql.close();
        return callback(err);
      });
    } catch (error) {
      result = "nook"
      console.log(error);
      return callback(error);
    }
    
}

//-----------------------best 
async function setCredentQuestionaire(data){
  //console.log(data.section1)
    let datasec1 =  data.section1
    var querysec1 = [];
    let text 
    const keys = Object.keys(datasec1);
    for (let i = 0; i < keys.length; i++) {
      text = ""
      const key = keys[i];
     // console.log(key, datasec1[key].answer);
      //console.log(data.answer)
      if (key == 11 || key == 18 || key == 10 || key == 9 ){
         // not do 
        continue;
      }else{
        text      = await getarraytotext(datasec1[key].order, datasec1[key].answer )
       // let question  = await getHeadquestion(key,datasec1[key].question)
      }
        querysec1.push(text);
    }
     console.log(querysec1);

    try {
      let table = new sql.Table('Fund_cen_Customer');

      table.columns.add('title', sql.VarChar(5), { nullable: true });
      table.columns.add('thFirstName', sql.NVarChar(100), { nullable: true }); //
      table.columns.add('thLastName', sql.NVarChar(100), { nullable: true });
      table.columns.add('enFirstName', sql.VarChar(100), { nullable: true });
      table.columns.add('enLastName', sql.VarChar(100), { nullable: true });
      table.columns.add('incomeSourceCountry', sql.NVarChar(3), { nullable: true });
      table.columns.add('maritalStatus', sql.VarChar(10), { nullable: true });
      table.columns.add('birthDate', sql.VarChar(8), { nullable: true });
      table.columns.add('identificationCardType', sql.VarChar(15), { nullable: true });
      table.columns.add('job', sql.NVarChar(100), { nullable: true });
      table.columns.add('salary', sql.NVarChar(50), { nullable: true });
     
      //--------------------------------
      table.columns.add('cardNumber', sql.VarChar(13), { nullable: true });


    }catch{

    }


}


async function getarraytotext(order,data){
    let result
      // console.log(order)
  switch(order) {
        case 1:
          if(data === "นาย"){
            result = "MR."
          }else if(data === "นาง"){
            result = "MRS."
          }else if(data === "นางสาว"){
            result = "MISS."
          }
          break;
        case 6:
            if(data === "ไทย"){
              result = "TH"}
            else{
              result = data
            }
          break; 
          case 7:
            if(data === "โสด"){
              result = "Single"
            }else{
              result = "Married"
            }
            break;  
        case 8:
        result = await convertbirthdate(data);
          break;
        case 9:
          if(data ==="บัตรประชาชน"){result= "CITIZEN_CARD"}else{result = data}
          break;

        default:
          result = data
  }
  //console.log(order)
 return result;
}

async function convertbirthdate(data){
  let birthdate
  let year, month , day 

  if (data.year > 2500){ year = data.year -543 }else { year = data.year}
  month       = data.month
  day         = data.date
  birthdate = year + month +day
  
  return birthdate  
}

export{
  setCredentUpdate,
  setCredentQuestionaire
}

  