//****************[ Created Date 2022 07 08  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/
// Branch ขาด  อัพเดท Branch  Bank Code  20220-09-12
import express from 'express'
import sql  from 'mssql';
import dotenv from 'dotenv';
import { config } from './dbconfig.js';
import path from 'path';
import { fileURLToPath } from 'url';
import poolPromise from './db.js';
import { accessSync } from 'fs';
import {getdate } from './tranwait.js'
import nodemailer from 'nodemailer'
// import { json } from 'body-parser';
import {selectaccountsToPdf , genpdf} from './genpdf.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app= express.Router()
app.use('/image',express.static(__dirname+ '/image'))
const today = new Date()
let date_ob = new Date(today);
let date = ("0"+date_ob.getDate()).slice(-2); 
let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let date_present = year +  month  + date
app.use('/img',express.static('C:/WR/fundcon/'+date_present))
dotenv.config();

async function ImportDataAccount(datarows){
    // console.log(datarows)
    for ( let key in datarows) {
        try{

            let cardNumber                                      = datarows[key].cardNumber
            let passsport                                       = datarows[key].passportCountry
            let identificationCardType                          = datarows[key].identificationCardType.trim()
            let cardExpiryDate                                  = datarows[key].cardExpiryDate
            let title                                           = datarows[key].title.trim()
            let titleOther                                      = datarows[key].titleOther
            let enFirstName                                     = datarows[key].enFirstName.trim()
            let enLastName                                      = datarows[key].enLastName.trim()
            let thFirstName                                     = datarows[key].thFirstName.trim()
            let thLastName                                      = datarows[key].thLastName.trim()
            let birthDate                                       = datarows[key].birthDate
            let nationality                                     = datarows[key].nationality
            let mobileNumber                                    = datarows[key].mobileNumber
            let email                                           = datarows[key].email.trim()
            let phone                                           = datarows[key].phone
            let fax                                             = datarows[key].fax
            let Spouse                                          = datarows[key].Spouse
            let accompanyingDocument                            = datarows[key].accompanyingDocument
            let maritalStatus                                   = datarows[key].maritalStatus
            let occupationId                                    = datarows[key].occupationId.trim()
            let occupationOther                                 = datarows[key].occupationOther.trim()
            let businessTypeId                                  = datarows[key].businessTypeId.trim()
            let businessTypeOther                               = datarows[key].businessTypeOther
            let monthlyIncomeLevel                              = datarows[key].monthlyIncomeLevel
            let assetValue                                      = datarows[key].assetValue
            let incomeSource                                    = datarows[key].incomeSource
            let identificationDocument                          = datarows[key].identificationDocument
            let address_doc                                     = datarows[key].address_doc
            let address_current                                 = datarows[key].address_current
            let address_work                                    = datarows[key].address_work
            let approvedDate                                    = datarows[key].approvedDate
            let openChannel                                     = datarows[key].openChannel
            let investorClass                                   = datarows[key].investorClass
            let vulnerableFlag                                  = datarows[key].vulnerableFlag
            let vulnerableDetail                                = datarows[key].vulnerableDetail
            let ndidFlag                                        = datarows[key].ndidFlag
            let investorType                                    = datarows[key].investorType
            let suitabilityForm                                 = datarows[key].suitabilityForm
            let workPosition                                    = datarows[key].workPosition
            let relatedPoliticalPerson                          = datarows[key].relatedPoliticalPerson
            let politicalRelatedPersonPosition                  = datarows[key].politicalRelatedPersonPosition
            let canAcceptFxRisk                                 = datarows[key].canAcceptFxRisk
            let canAcceptDerivativeInvestment                   = datarows[key].canAcceptDerivativeInvestment
            let suitabilityRiskLevel                            = datarows[key].suitabilityRiskLevel
            let accounts                                        = datarows[key].accounts
            let companyName                                     = datarows[key].companyName
            let suitabilityEvaluationDate                       = datarows[key].suitabilityEvaluationDate
            let fatca                                           = datarows[key].fatca
            let fatcaDeclarationDate                            = datarows[key].fatcaDeclarationDate
            let cddScore                                        = datarows[key].cddScore
            let cddDate                                         = datarows[key].cddDate
            let referralPerson                                  = datarows[key].referralPerson
            let applicationDate                                 = datarows[key].applicationDate
            let incomeSourceCountry                             = datarows[key].incomeSourceCountry
            let acceptedBy                                      = datarows[key].acceptedBy
            let openFundConnextFormFlag                         = datarows[key].openFundConnextFormFlag
            let ndidRequestId                                   = datarows[key].ndidRequestId
            let bankCode                                        = datarows[key].bankCode
            let currentAddressSameAsFlag                        = datarows[key].currentAddressSameAsFlag
            let salary                                          = datarows[key].salary
            let ndid = ""                                         
            if (ndidFlag.trim()!== 'false'){ndid='X'}
            // console.log(identificationCardType)
            let table = new sql.Table('Account_Info');

            table.columns.add('Cust_Code',          sql.VarChar(30),    { nullable: false });
            table.columns.add('Card_Type',          sql.Char(1),        { nullable: true });
             table.columns.add('Group_Code',        sql.VarChar(1),     { nullable: true });
            table.columns.add('Title_Name_T',       sql.NVarChar(20),    { nullable: true });
            table.columns.add('First_Name_T',       sql.NVarChar(200),   { nullable: true });
            table.columns.add('Last_Name_T',        sql.NVarChar(200),   { nullable: true });
            table.columns.add('Title_Name_E',       sql.NVarChar(20),    { nullable: true });
            table.columns.add('First_Name_E',       sql.NVarChar(200),   { nullable: true });
            table.columns.add('Last_Name_E',        sql.NVarChar(200),   { nullable: true });
            table.columns.add('Birth_Day',          sql.Date,           { nullable: true });
            table.columns.add('Nation_Code',        sql.VarChar(3),     { nullable: true });
            table.columns.add('Sex',                sql.Char(1),        { nullable: true });
            table.columns.add('Tax_No',             sql.VarChar(20),    { nullable: true });
            table.columns.add('Mobile',             sql.VarChar(20),    { nullable: true });
            table.columns.add('Email',              sql.NVarChar(200),   { nullable: true });
            table.columns.add('MktId',              sql.Int,            { nullable: true });
            table.columns.add('Create_By',          sql.VarChar(20),    { nullable: true });
            table.columns.add('Create_Date',        sql.DateTime,       { nullable: true });
            
            table.columns.add('IT_SentRepByEmail',  sql.Char(1),        { nullable: true });
            table.columns.add('IT_SENDMAIL',        sql.Char(1),        { nullable: true });
            table.columns.add('My_wife',            sql.VarChar(20),    { nullable: true });
            table.columns.add('Id_My_wife',         sql.VarChar(30),    { nullable: true });
            table.columns.add('My_wife_birthday',   sql.Date,           { nullable: true });
            table.columns.add('Education',          sql.VarChar(2),     { nullable: true });
            table.columns.add('InvestMent',         sql.VarChar(1),     { nullable: true });
            table.columns.add('InvestMentBy',       sql.VarChar(1),     { nullable: true });
            table.columns.add('InvestMentOther',    sql.VarChar(1),     { nullable: true });
            table.columns.add('Property1',          sql.VarChar(1),     { nullable: true });
            table.columns.add('Property2',          sql.VarChar(1),     { nullable: true });
            table.columns.add('Property3',          sql.VarChar(1),     { nullable: true });
            table.columns.add('Property4',          sql.VarChar(1),     { nullable: true });
            table.columns.add('PepleUsa1',          sql.VarChar(1),     { nullable: true });
            table.columns.add('PepleUsa2',          sql.VarChar(1),     { nullable: true });
            table.columns.add('PepleUsa3',          sql.VarChar(1),     { nullable: true });
            table.columns.add('PepleUsa4',          sql.VarChar(1),     { nullable: true });
            table.columns.add('PepleUsa5',          sql.VarChar(1),     { nullable: true });
            table.columns.add('PepleUsa6',          sql.VarChar(1),     { nullable: true });
            table.columns.add('PepleUsa7',          sql.VarChar(1),     { nullable: true });
            table.columns.add('PepleUsa8',          sql.VarChar(1),     { nullable: true });
            table.columns.add('Occupation',         sql.VarChar(3),     { nullable: true });
            table.columns.add('ObjOpenAcc',         sql.VarChar(0),     { nullable: true });
            table.columns.add('Experience',         sql.VarChar(1),     { nullable: true });
            table.columns.add('Risktype',           sql.VarChar(1),     { nullable: true });
            table.columns.add('DocumentId',         sql.VarChar(1),     { nullable: true });
            table.columns.add('DocumentOther',      sql.NVarChar(100),   { nullable: true });
            table.columns.add('BusinessFor',        sql.VarChar(1),     { nullable: true });
            table.columns.add('BusinessForName',    sql.VarChar(200),   { nullable: true });
            table.columns.add('BusinessForNameId',  sql.VarChar(30),    { nullable: true });
            table.columns.add('MoneyInvetment',     sql.VarChar(1),     { nullable: true });
            table.columns.add('PersonRelationship', sql.NVarChar(100),   { nullable: true });
            table.columns.add('EducationOther',     sql.NVarChar(100),   { nullable: true });
            table.columns.add('MonnyOther',         sql.NVarChar(100),   { nullable: true });
            table.columns.add('Docmentdesc',        sql.NVarChar(100),   { nullable: true });
            table.columns.add('Occupation_Desc',    sql.NVarChar(100),   { nullable: true });
            table.columns.add('ObjectInvetMent',    sql.VarChar(1),     { nullable: true });
            table.columns.add('SalaryPerMonth',     sql.VarChar(1),     { nullable: true });
            table.columns.add('EmailForName',       sql.VarChar(50),    { nullable: true });
            table.columns.add('Education1',         sql.VarChar(3),     { nullable: true });
            table.columns.add('Occupation1',        sql.VarChar(3),     { nullable: true });
            table.columns.add('TypeBusiness1',      sql.VarChar(3),     { nullable: true });
            table.columns.add('Income1',            sql.VarChar(3),     { nullable: true });
            table.columns.add('IncomeYear1',        sql.VarChar(3),     { nullable: true });
            table.columns.add('IncomeFamily1',      sql.VarChar(3),     { nullable: true });
            table.columns.add('IncomeSource1',      sql.VarChar(3),     { nullable: true });
            table.columns.add('ObjOpenAcc1',        sql.VarChar(3),     { nullable: true });
            table.columns.add('InvestTime1',        sql.VarChar(3),     { nullable: true });
            table.columns.add('Bussinettype_Desc',  sql.NVarChar(100),   { nullable: true });
            table.columns.add('Expdatewife',        sql.Date,           { nullable: true });
            table.columns.add('ExpDateperson1',     sql.Date,           { nullable: true });
            table.columns.add('ExpDateperson2',     sql.Date,           { nullable: true });
            table.columns.add('ExpDateperson3',     sql.Date,           { nullable: true });
            table.columns.add('FirstwifeName',      sql.VarChar(1),     { nullable: true });
            table.columns.add('FirstNamePerson1',   sql.VarChar(1),     { nullable: true });
            table.columns.add('FirstNamePerson2',   sql.VarChar(1),     { nullable: true });
            table.columns.add('FirstNamePerson3',   sql.VarChar(1),     { nullable: true });
            table.columns.add('DocumentForAccNo',   sql.VarChar(1),     { nullable: true });
            table.columns.add('Bank_Id',            sql.Int,            { nullable: true });
            table.columns.add('Bank_Branch',        sql.Int,            { nullable: true });
            table.columns.add('Bank_Account',       sql.VarChar(15),    { nullable: true });
            table.columns.add('Bank_AccType',       sql.VarChar(1),     { nullable: true });
            table.columns.add('Wife_English',       sql.NVarChar(200),   { nullable: true });
            table.columns.add('Bank_IdReturn',      sql.Int,            { nullable: true });
            table.columns.add('Bank_BranchReturn',  sql.Int,            { nullable: true });
            table.columns.add('Bank_AccountReturn', sql.Char(15),       { nullable: true });
            table.columns.add('Company',            sql.NVarChar(150),   { nullable: true });
            table.columns.add('DateExp',            sql.Date(15),       { nullable: true });
            table.columns.add('Bank_Returntype',    sql.Char(1),        { nullable: true });
            table.columns.add('Datestart',          sql.DateTime,       { nullable: true });
            table.columns.add('Position',           sql.NVarChar(100),   { nullable: true });
            table.columns.add('Department',         sql.NVarChar(100),   { nullable: true });
            table.columns.add('TypeId',             sql.Char(1),        { nullable: true });
            table.columns.add('SendMail',           sql.Char(1),        { nullable: true });
            table.columns.add('isApproved',         sql.Bit,            { nullable: true });
            table.columns.add('LastUpdate',         sql.Char(1),        { nullable: true });
            table.columns.add('Introdue',           sql.Char(50),       { nullable: true });
            table.columns.add('StatusPerson',       sql.Char(1),        { nullable: true });
            table.columns.add('maritalStatus',      sql.NChar(1),       { nullable: true });
            table.columns.add('rejectDesc',         sql.NVarChar(50),   { nullable: true });
            table.columns.add('DateApi',            sql.DateTime,       { nullable: true });
            table.columns.add('LoopApi',            sql.Char(2),        { nullable: true });
            table.columns.add('StatusApi',          sql.Char(5),        { nullable: true });
            table.columns.add('ACCOUNTNO',          sql.NChar(20),      { nullable: true });
            table.columns.add('LevelMoney',         sql.Char(1),        { nullable: true });
            table.columns.add('Position_name',      sql.NVarChar(100),  { nullable: true });
            table.columns.add('Type_Business',      sql.NVarChar(100),  { nullable: true });
            table.columns.add('Occupation_Othername',sql.NVarChar(100), { nullable: true });
            table.columns.add('mailingAddressSameAsFlag',sql.Char(30),  { nullable: true });
            table.columns.add('NDID'                ,sql.Char(1),       { nullable: true });
            table.columns.add('applicationDate'     ,sql.DateTime,      { nullable: true });

            let Cardtype                            =   await  setCardType(identificationCardType)
           //console.log("Cardtype :" + Cardtype)
            let Group_Code                          =   null ; if(Cardtype ===  "C"){Group_Code = "1"} ;               //******* */
            let titleTH         = "" ;              await setTitleTH(title, (title_TH) =>{  titleTH = title_TH });
            let birth_Date                          = birthDate.substring(0,4) + "-" +birthDate.substring(4,6) + "-" + birthDate.substring(6,8)
            let nationCode      = "" ;               await setnationality(nationality, (nation_code)=>{nationCode = nation_code})  // สัญชาติ
            let sex                                 = (title === 'MR' , "M" , "F") 
            let tax_no                              ="" 
            let MktId                               =""  //******* */
            let Create_By       ="157"
            let createdate      =""; await getdate((crdate)=>{createdate = crdate})
            let IT_SentRepByEmail = ""
            let IT_SENDMAIL     = ""
            let My_wife         = ""            //******* */
            let Id_My_wife      = ""            //******* */
            let My_wife_birthday = null
            let Education         = ""          
            let InvestMent =  "" 
            let InvestMentBy =  "" 
            let InvestMentOther =  "" 
            let Property1 =  "" 
            let Property2 =  "" 
            let Property3 =  "" 
            let Property4 =  "" 
            let PepleUsa1 =  "" 
            let PepleUsa2 =  "" 
            let PepleUsa3 =  "" 
            let PepleUsa4 =  "" 
            let PepleUsa5 =  "" 
            let PepleUsa6 =  "" 
            let PepleUsa7 =  "" 
            let PepleUsa8 =  "" 
            let Occupation = "";   //await setoccupationId(+occupationId)
            let ObjOpenAcc =  "" 
            let Experience =  "" 
            let Risktype =  "" 
            let DocumentId =  "" 
            let DocumentOther =  "" 
            let BusinessFor =  "" 
            let BusinessForName =  "" 
            let BusinessForNameId =  "" 
            let MoneyInvetment =  "" 
            let PersonRelationship =  "" 
            let EducationOther =  "" 
            let MonnyOther =  "" 
            let Docmentdesc =  "" 
            let Occupation_Desc =  "" 
            let ObjectInvetMent =                   await setincomeSource(incomeSource) ;
            let SalaryPerMonth =                    await setSalaryPerMonth(monthlyIncomeLevel) ;
            let EmailForName =  "" 
            let Education1 =  "" 
            let Occupation1 = "";                   await setOccupation(+occupationId, (occuption,occuptiondesc)=>{Occupation1 = occuption; Occupation_Desc = occuptiondesc  }) 
            let TypeBusiness1 =  "" ;             //  await setTypeBusiness(+businessTypeId)
            let Income1 =  "" 
            let IncomeYear1 =  "" 
            let IncomeFamily1 =  "" 
            let IncomeSource1 =  "" 
            let ObjOpenAcc1 =  "" 
            let InvestTime1 =  "" 
            let Bussinettype_Desc =  "" 
            let Expdatewife =  null 
            let ExpDateperson1 =  null
            let ExpDateperson2 =  null 
            let Expdateperson3 =  null 
            let FirstwifeName =  "" 
            let FirstNamePerson1 =  "" 
            let FirstNamePerson2 =  "" 
            let FirstNamePerson3 =  "" 
            let DocumentForAccNo =  "" 
            let Bank_Id =  null 
            let Bank_Branch =  null 
            let Bank_Account =  "" 
            let Bank_AccType =  "" 
            let Wife_English =  "" 
            let Bank_IdReturn = null 
            let Bank_BranchReturn =  null 
            let Bank_AccountReturn =  "" 
            let Company =  companyName 
            let DateExp =  null  //วันหมดอายุบัตร ปปช
            let Bank_Returntype =  "" 
            let Datestart   = null //วันทำบัตร ปปช
            let Position =  "" 
            let Department =  "" 
            let TypeId =  "" 
            let SendMail =  "" 
            let isApproved =  "" 
            let LastUpdate =  "" 
            let Introdue =  "" 
            let StatusPerson =  "" 
            let maritalStatus_db = ""// maritalStatus 
            let rejectDesc =  "" 
            let DateApi =  null 
            let LoopApi =  "" 
            let StatusApi =  "" 
            let ACCOUNTNO =  "" 
            let LevelMoney =  "" 
            const Position_name =  await setoccupationId(+occupationId) ; //console.log(Position_name)
            let Type_Business = "";  await setbusinessTypeId(+businessTypeId,(busisnesstype,businesstypeId)=>{Type_Business =busisnesstype ; Occupation_Desc = busisnesstype ;TypeBusiness1 = businesstypeId })
            let Occupation_Othername =  occupationOther
            let currentAddressSameAsFlag1 = currentAddressSameAsFlag
            await setBankAccountslData(cardNumber ,(accountId,bankCode,bankAccountNo ,bankBranchCode)=>{
                                            Bank_Id  = bankCode        
                                            Bank_Account    =   bankBranchCode;
                                            Bank_Branch     =   bankAccountNo;
                                           console.log(bankAccountNo)
                                        })
            //console.log(maritalStatus)                            
            let dataset = [[   
                            cardNumber ,Cardtype ,Group_Code ,titleTH ,thFirstName ,thLastName ,title ,enFirstName ,enLastName
                            ,birth_Date ,nationCode ,sex ,tax_no ,mobileNumber ,email ,MktId,Create_By,createdate ,IT_SentRepByEmail
                            ,IT_SENDMAIL ,My_wife ,Id_My_wife , My_wife_birthday , Education ,InvestMent  , InvestMentBy  , InvestMentOther  
                            , Property1 , Property2  , Property3,Property4,PepleUsa1,PepleUsa2,PepleUsa3,PepleUsa4,PepleUsa5,PepleUsa6,PepleUsa7
                            ,PepleUsa8,Occupation,ObjOpenAcc,Experience,Risktype,DocumentId,DocumentOther,BusinessFor,BusinessForName,BusinessForNameId
                            ,MoneyInvetment,PersonRelationship,EducationOther,MonnyOther,Docmentdesc,Occupation_Desc,ObjectInvetMent,SalaryPerMonth
                            ,EmailForName,Education1,Occupation1,TypeBusiness1,Income1,IncomeYear1,IncomeFamily1,IncomeSource1,ObjOpenAcc1,InvestTime1
                            ,Bussinettype_Desc,Expdatewife,ExpDateperson1,ExpDateperson2,Expdateperson3,FirstwifeName,FirstNamePerson1,FirstNamePerson2
                            ,FirstNamePerson3,DocumentForAccNo,Bank_Id,Bank_Branch,Bank_Account,Bank_AccType,Wife_English,Bank_IdReturn,Bank_BranchReturn
                            ,Bank_AccountReturn,Company,DateExp,Bank_Returntype,Datestart,Position,Department,TypeId,SendMail,isApproved,LastUpdate,Introdue
                            ,StatusPerson,maritalStatus_db,rejectDesc,DateApi,LoopApi,StatusApi,ACCOUNTNO,LevelMoney,Position_name,Type_Business,Occupation_Othername
                            ,currentAddressSameAsFlag1,ndid
                        ]]
                        //console.log(dataset)
                        

                dataset.forEach(async(data) => {
                    table.rows.add.apply(table.rows, await jdatatoArray3(data));
                });

                // let pool = await sql.connect(config);
                // await pool.request().query(`DELETE FROM Account_Info WHERE Cust_Code = '${cardNumber}' `);
                // pool.request().bulk(table, function(err, result) {
                //     if (err) {
                //         console.log(err);
                //     } else {
                //         console.log(result);
                //         console.log("inserted account Info of CITIZEN CARD :" + cardNumber );

                //     }

                //     pool.close();
                //     sql.close();
                // });
                //return callback("Import ");

            } catch (error) {
                console.log(error);
                return callback(error);
            }
    }

//return callback("xx")

}
function setincomeSource(income){
    let imcomeSouceID
    switch (income) {
        case "SALARY":
            imcomeSouceID = 1 
            break;
    
        case "SAVINGS":
            imcomeSouceID = 3 
            break;
    
        case "RETIREMENT":
            imcomeSouceID = 6 
            break;
    
        case "HERITAGE":
            imcomeSouceID = 4 
            break;
    
        case "INVESTMENT":
            imcomeSouceID = 5 
            break;
    
        case "BUSINESS":
            imcomeSouceID = 2 
            break;
    
        case "OTHER":
            imcomeSouceID = 0 
            break;
    
        default:
            imcomeSouceID = 0
            break;
    }
    return imcomeSouceID;
}
function setSalaryPerMonth(Level){
    let id = 0
    switch (Level) {
        case "LEVEL1":
            id = 1
            break;
        case "LEVEL2":
            id = 2
            break;
        case "LEVEL3":
            id = 3
            break;
        case "LEVEL4":
            id = 4
            break;
        case "LEVEL5":
            id = 5
            break;
        case "LEVEL6":
            id = 6
            break;
        case "LEVEL7":
            id = 7
            break;
        case "LEVEL8":
            id = 8
            break;
        case "LEVEL9":
            id = 8
            break;
    
        default:
            id = 0
            break;
    }
    return id;
}
async function setBankAccountslData(CardNumber, callback){
    let accountId = null ,bankCode= null ,bankBranchCode = null ,bankAccountNo = null
    try{
        let statement =  `SELECT      accountId,  bankCode, bankBranchCode, bankAccountNo
                            FROM         Fund_Cen_BankAccounts
                            WHERE     (cardNumber = '${CardNumber}' AND TYPE = 'SUB') `

        //console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
        //    console.log(result.recordset[0])
            
            if (data_row > 0){
                accountId  = result.recordset[0].accountId
                bankCode  = result.recordset[0].bankCode
                bankBranchCode  = result.recordset[0].bankBranchCode
                bankAccountNo  = result.recordset[0].bankAccountNo
            } 
            sql.close();
            //ChkBankBranch(bankCode,bankBranchCode)
             
      
          }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
          });
        } catch (error) {
            result = "ERROR Catch"
            console.log(error);
            return   callback(error);
        }
        await ChkBankBranch(bankCode,bankBranchCode,(bankbranch)=>{
            bankBranchCode = bankbranch
        })
        return  callback(accountId,bankCode,bankBranchCode,bankAccountNo) 
}
async function setBankAccountslDataRED(CardNumber, callback){
    let accountId ,bankCode ,bankBranchCode ,bankAccountNo
    try{
        let statement =  `SELECT      accountId,  bankCode, bankBranchCode, bankAccountNo
                            FROM         Fund_Cen_BankAccounts
                            WHERE     (cardNumber = '${CardNumber}' AND TYPE = 'RED') `

        //console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
           let data_row = result.rowsAffected.toString();
        //    console.log(result.recordset[0])
            // let accountId ,bankCode ,bankBranchCode ,bankAccountNo
            if (data_row > 0){
                accountId  = result.recordset[0].accountId
                bankCode  = result.recordset[0].bankCode
                bankBranchCode  = result.recordset[0].bankBranchCode
                bankAccountNo  = result.recordset[0].bankAccountNo
            } 
            sql.close();
          }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
          });
    } catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }
    // console.log(bankBranchCode)
    await ChkBankBranch(bankCode,bankBranchCode,(bankbranch)=>{
        bankBranchCode = bankbranch
    })
    // console.log(bankBranchCode)
    return  callback(accountId,bankCode,bankBranchCode,bankAccountNo)      
   
}
async function ChkBankBranch(bankID, BranchID, callback){
    let flag_insert = 0 ,branchid
    try{
    if(bankID === undefined || bankID === null){return}
    let statement =`SELECT  Bank_ID, Branch_ID FROM   REF_Bank_Branchs  WHERE  ( Bank_ID  = ${bankID} AND Branch_ID  = '${BranchID}') 
                    OR (Bank_IDNew = ${bankID} AND Branch_IDNew = '${BranchID}')` //( Bank_ID  = ${bankID} AND Branch_ID  = '${BranchID}') OR (Bank_IDNew = ${bankID} AND Branch_IDNew = '${BranchID}')
    // console.log(statement)
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
      }).then(result => {
        let data_row = result.rowsAffected;
        if (data_row == 0){  flag_insert = 1 ;  }
        if (data_row > 0 ){branchid = result.recordset[0].Branch_ID  ;   } 
        sql.close(); 
        // console.log(data_row)
      }).catch(err => {
        console.log(err);
        sql.close();
       return   callback(err);
      });
    } catch (error) {
      let  result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }
    //Insert bank branch
    if(flag_insert == 1 ){await insertBankBranch(bankID, BranchID)}
    if(branchid === null){branchid = BranchID }
    
    // console.log("flag_insert  : "+flag_insert) 
    // console.log("bankID  : "+bankID) 
    // console.log("BranchID  : "+BranchID)
    return callback(branchid) 
}
// 2022-09-14 
async function insertBankBranch(bankID, BranchID ,callback){
    // if(BranchID === null || BranchID === undefined){return callback()}
    try{
        let ModifyDate ,BranchName= " "
        await getdatetime((dt=>{ ModifyDate = dt}))
        let statement =`INSERT INTO REF_Bank_Branchs (Bank_ID, Branch_ID, Branch_Name_T, Branch_Name_E, LastModifyDate, ModifiedByUser, Bank_IDNew, Branch_IDNew)
                                                    VALUES     (@Bank_ID, @Branch_ID, @Branch_Name_T, @Branch_Name_E, @LastModifyDate, @ModifiedByUser, @Bank_IDNew, @Branch_IDNew)`
        await new sql.ConnectionPool(config).connect().then(pool => {   
            return pool.request()
                .input("Bank_ID",           sql.Int,                bankID)
                .input("Branch_ID",         sql.Int,                BranchID) 
                .input("Bank_IDNew",        sql.Char(4),            bankID) 
                .input("Branch_IDNew",      sql.Char(5),            BranchID)  
                .input("LastModifyDate",    sql.DateTime,           ModifyDate)  
                .input("ModifiedByUser",    sql.VarChar(15),        "146")  
                .input("Branch_Name_T",     sql.NVarChar(100),      BranchName)  
                .input("Branch_Name_E",     sql.NVarChar(100),      BranchName)  
                .query(statement)
        }).then(result => {
            sql.close();
            let row =result.rowsAffected
            if (row > 0) {console.log("inserted REF_Bank_Branchs  : " + result.rowsAffected +"   Complete");  }

        }).catch(err => {
        console.log(err);
        sql.close();
        });   
    } catch (error) {
        result = "ERROR Catch"
        console.log(error);
    }
    return callback(BranchID)
}
function setOccupation(id , callback){
    let IdOccupation =""
    let OccupationDesc =""
    // console.log("Occupation : " +id)
    switch (id) {
        case 20: // เกษตร
            IdOccupation = "5"
            OccupationDesc = ""
            break;
        case 25: // เกษตร
            IdOccupation = "999"
            OccupationDesc ="พระภิกษุ /นักบวช"
            break;
        case 30: // เจ้าของกิจการ
            IdOccupation = "14"
            OccupationDesc =""
            break;
        case 40: // พนักงานบริษัท
            IdOccupation = "18"
            OccupationDesc =""
            break;
        case 50: // แพทย์
            IdOccupation = "21"
            OccupationDesc =""
            break;
        case 60: // เกษตร
            IdOccupation = "999"
            OccupationDesc ="กิจการครอบครัว"
            break;
        case 70: // เกษตร
            IdOccupation = "7"
            OccupationDesc =""
            break;
        case 80: // เกษตร
            IdOccupation = "20"
            OccupationDesc =""
            break;
        case 90: // เกษตร
            IdOccupation = "999"
            OccupationDesc ="นักลงทุน"
            break;
        case 110: // เกษตร
            IdOccupation = "15"
            OccupationDesc =""
            break;
        case 120: // เกษตร
            IdOccupation = "6"
            OccupationDesc =""
            break;
        case 130: // เกษตร
            IdOccupation = "19"
            OccupationDesc =""
            break;
        case 140: // เกษตร
            IdOccupation = "16"
            OccupationDesc =""
            break;
        case 150: // เกษตร
            IdOccupation = "17"
            OccupationDesc =""
            break;
        case 160: // เกษตร
            IdOccupation = "8"
            OccupationDesc =""
            break;
        case 170: // เกษตร
            IdOccupation = "999"
            OccupationDesc ="อื่นๆ โปรดระบุบ"
            break;
    
        default:
            IdOccupation = "999"
            OccupationDesc ="อื่นๆ โปรดระบุบ"
            break;
    }
    return callback(IdOccupation,OccupationDesc)
}
function setbusinessTypeId(id , callback){
    let businesstype =""
    let businesstypeId =""
    switch (id) {
        case 20:
            businesstype ="ค้าของเก่า /วัตถุโบราณ"
            businesstypeId ="6"
            break;
        case 30:
            businesstype ="การเงิน/ธนาคาร"
            businesstypeId ="1"
            break;
    
        case 40:
            businesstype ="คาสิโน/ การพนัน"
            businesstypeId ="12"
            break;
        case 60:
            businesstype ="สหกรณ์/มูลนิธิ/สมาคม/สโมสร/วัด/มัสยิด/ศาลเจ้า"
            businesstypeId ="Not"
            break;
        case 70:
            businesstype ="สถานบริการตามกฎหมายว่าด้วยสถานบริการ"
            businesstypeId ="5"
            break;
        case 80:
            businesstype ="แลกเปลี่ยนเงินตราต่างประเทศ"
            businesstypeId ="30"
            break;
        case 90:
            businesstype ="โรงแรม/ภัตตาคาร"
            businesstypeId ="29"
            break;
        case 110:
            businesstype ="ประกันภัย/ประกันชีวิต"
            businesstypeId ="21"
            break;
        case 120:
            businesstype ="ค้าอัญมณี/ทอง"
            businesstypeId ="7"
            break;
        case 130:
            businesstype ="โอนและรับโอนเงินทั้งภายในและต่างประเทศ"
            businesstypeId ="30"
            break;
        case 140:
            businesstype ="อสังหาริมทรัพย์"
            businesstypeId ="36"
            break;
        case 150:
            businesstype ="มหาวิทยาลัย/โรงเรียน/สถานศึกษา"
            businesstypeId ="28"
            break;
        case 160:
            businesstype ="ธุรกิจนำเที่ยว/บริษัททัวร์"
            businesstypeId ="3"
            break;
        case 170:
            businesstype ="อาวุธยุทธภัณฑ์"
            businesstypeId ="22"
            break;
        case 180:
            businesstype ="อื่นๆ"
            businesstypeId ="999"
            break;
    
        default:
            businesstypeId ="Not"
            break;
    }
    return callback(businesstype,businesstypeId);
}
function setoccupationId(id){
    let job =""
    switch (id) {
        case 20:
            job = "เกษตรกร"
            break;
        case 25:
            job ="พระภิกษุ /นักบวช"
            break;
        case 30:
            job = "เจ้าของกิจการ / ธุรกิจส่วนตัว"
            break;
        case 40:
            job ="พนักงานบริษัท"
            break;
        case 50:
            job ="แพทย์/พยาบาล"
            break;
        case 60:
            job ="กิจการครอบครัว"
            break;
        case 70:
            job ="ข้าราชการ"
            break;
        case 80:
            job ="แม่บ้าน/พ่อบ้าน"
            break;
        case 90:
            job ="นักลงทุน"
            break;
        case 110:
            job ="นักการเมือง"
            break;
        case 120:
            job ="เกษียณอายุ"
            break;
        case 130:
            job ="พนักงานรัฐวิสาหกิจ"
            break;
        case 140:
            job ="นักเรียน/นักศึกษา"
            break;
        case 150:
            job ="อาชีพอิสระ"
            break;
        case 160:
            job ="ครู/อาจารย์"
            break;
        case 170:
            job ="อื่นๆ"
            break;
        
        default:
            job =""
            break;
    }

    return job
}
async function setnationality(nationality , callback){

    try{
        let statement =  `SELECT  Nation_Code FROM REF_Nations   WHERE  (IT_Code = '${nationality}') `


        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            let naton 
            if (data_row = 1){
                naton  = result.recordset[0].Nation_Code
            } 
            sql.close();
            return  callback(naton)  
      
          }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
          });
        } catch (error) {
            result = "ERROR Catch"
            console.log(error);
            return   callback(error);
        }
   

}
function setCardType(identificationCardType){
    let typecard
    switch (identificationCardType) {
        case 'CITIZEN_CARD':
            typecard = "C"
            break;
        case 'ALIEN_CARD':
            typecard = "G"
            break;
        case 'ALIEN_CARD':
            typecard = "P"
            break;
    
        default:
            typecard = ""
            break;
    }
    return typecard; 
}
async function setTitleTH(title,callback){
   let statement = `SELECT  Title_Name FROM REF_Title_Thais   WHERE  (Title_fund = '${title}') `
    // console.log(statement)
   
    try{
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            let title 
            if (data_row = 1){
               title  = result.recordset[0].Title_Name
            } 
            sql.close();
            return  callback(title)  
      
          }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
          });
    } catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }
    // return callback("xx")
}

async function SelectDataAccount(callback){
    try{
        let statement = `SELECT * FROM Fund_cen_Customer  WHERE cardNumber = '1909802410632'`    //'3100200089211'  //WHERE IDNo between 501 and 1000 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
            // console.log(result.recordset);
            let data_row = result.rowsAffected.toString();
             console.log("result: "+ data_row +" row")
             console.log(result)
            sql.close();
            //if ()
            return  callback(result.recordset) 
      
          }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
          });
        } catch (error) {
          result = "ERROR Catch"
          console.log(error);
          return   callback(error);
        } 
}
async function SelectDataAccountbyID(cardno ,callback){
    try{
        let statement = `SELECT dbo.Fund_cen_Customer.* ,dbo.Fund_Cen_Accounts.icLicense FROM dbo.Fund_cen_Customer INNER JOIN
                        dbo.Fund_Cen_Accounts ON dbo.Fund_cen_Customer.cardNumber = dbo.Fund_Cen_Accounts.cardNumber    
                        WHERE dbo.Fund_cen_Customer.cardNumber = '${cardno}' `//'3100200089211'  WHERE IDNo between 501 and 1000 
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
            // console.log(result.recordset);
            let data_row = result.rowsAffected.toString();

            console.log("result: "+ data_row +" row")
            sql.close();
            //if ()
            return  callback(result.recordset) 
      
          }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
          });
        } catch (error) {
          result = "ERROR Catch"
          console.log(error);
          return   callback(error);
        } 

}
async function checkAccountinfo(datarows,callback){
    //console.log(datarows)
    let query
    let flag_console 
    for ( let key in datarows) {
            let cardNumber                                      = datarows[key].cardNumber 
           // console.log("Start : "+cardNumber)
            let identificationCardType                          = datarows[key].identificationCardType 
            let title                                           = datarows[key].title
            let titleOther                                      = datarows[key].titleOther
            let cardExpiryDate                                  = datarows[key].cardExpiryDate
            let enFirstName                                     = datarows[key].enFirstName
            let enLastName                                      = datarows[key].enLastName
            let thFirstName                                     = datarows[key].thFirstName
            let thLastName                                      = datarows[key].thLastName
            let birthDate                                       = datarows[key].birthDate
            let nationality                                     = datarows[key].nationality
            let mobileNumber                                    = datarows[key].mobileNumber
            let email                                           = datarows[key].email
            let companyName                                     = datarows[key].companyName
            let occupationId                                    = datarows[key].occupationId
            let businessTypeId                                  = datarows[key].businessTypeId
            let occupationOther                                 = datarows[key].occupationOther
            let businessTypeOther                               = datarows[key].businessTypeOther
            let workPosition                                    = datarows[key].workPosition
            let TypeBusiness1 =  "" ; 
            let incomeSource                                    = datarows[key].incomeSource
            let monthlyIncomeLevel                              = datarows[key].monthlyIncomeLevel 
            let cardExpiry 
            if(cardExpiryDate.trim() === 'N/A') {
                cardExpiry = null;
            }else{
                cardExpiry = cardExpiryDate.substring(0,4) + "-" +cardExpiryDate.substring(4,6) + "-" + cardExpiryDate.substring(6,8);
            }
            //  console.log("cardExpiry :" + cardExpiry)
            // console.log("cardExpiryDate :" + cardExpiryDate)
            let My_wife = null
            let Wife_English = null
            let spouse  = null
            let spouseArray = ''
            spouseArray = datarows[key].Spouse 
            console.log(spouseArray.trim())
            if(spouseArray !== null || spouseArray.trim().length !== 0){
                spouse                                              = JSON.parse("{"+datarows[key].Spouse + "}")  
                My_wife                                             = JSON.stringify(spouse['thFirstName']).replace("\"", '').replace(/"/g, ' ')  + " " + JSON.stringify(spouse['thLastName']).replace("\"", '').replace(/"/g, ' ')  
                Wife_English                                        = JSON.stringify(spouse['enFirstName']).replace("\"", '').replace(/"/g, ' ')  + " " + JSON.stringify(spouse['enLastName']).replace("\"", '').replace(/"/g, ' ')
            }
            if(occupationOther !== null )           { occupationOther = occupationOther.trim() ; }
            if(email !== null )                     {email = email.trim()}
            if(mobileNumber !== null )              {mobileNumber = mobileNumber.trim()}
            if(companyName !== null )               {companyName = companyName.trim()}
            if(identificationCardType !== null )    {identificationCardType = identificationCardType.trim()}
            if(title !== null )                     {title = title.trim()}
            if(occupationId !== null )              {occupationId = occupationId.trim()}
            if(businessTypeId !== null )            {businessTypeId = businessTypeId.trim()}
            if(enFirstName !== null )               {enFirstName = enFirstName.trim()}
            if(enLastName !== null )                {enLastName = enLastName.trim()}
            if(thFirstName !== null )               {thFirstName = thFirstName.trim()}
            if(thLastName !== null )                {thLastName = thLastName.trim()}

        try{
          let  statement = `Select * FROM Account_Info WHERE Cust_Code = '${cardNumber}'`
            //console.log(statement)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
              }).then(result => {
                let data_row = result.rowsAffected.toString();
                if (data_row > 0){
                    //update
                    query = ` UPDATE Account_Info SET 
                            Modify_Date             = @Modify_Date
                            ,Modify_By              = @Modify_By
                            ,Email                  = @Email
                            ,Mobile                 = @Mobile
                            ,MktId                  = @MktId
                            ,Occupation1            = @Occupation1
                            ,Occupation             = @Occupation
                            ,DateExp                = @DateExp
                            ,My_wife                = @My_wife
                            ,Wife_English           =@Wife_English
                            ,Bank_Id                = @Bank_Id
                            ,Bank_IdReturn          = @Bank_IdReturn
                            ,Bank_Branch            = @Bank_Branch
                            ,Bank_BranchReturn      = @Bank_BranchReturn
                            ,Bank_Account           = @Bank_Account
                            ,Bank_AccountReturn     = @Bank_AccountReturn
                            ,Company                = @Company
                            ,Position_name          = @Position_name
                            ,Type_Business          = @Type_Business
                            ,Occupation_Othername   = @Occupation_Othername
                            ,DateApi                =@DateApi
                            ,SalaryPerMonth         =@SalaryPerMonth
                            ,ObjectInvetMent        = @ObjectInvetMent
                            ,InvestMentBy           = @InvestMentBy
                            ,MonnyOther             = @MonnyOther
                            ,ObjOpenAcc             = @ObjOpenAcc
                            ,Bussinettype_Desc      = @Bussinettype_Desc
                            WHERE Cust_Code = @Cust_Code `
                    flag_console = "Update"
                }else{
                    //insert
                    //ImportDataAccount(datarows[key])
                    query = `INSERT INTO Account_Info (Cust_Code ,Card_Type,Group_Code ,Title_Name_T,First_Name_T,Last_Name_T
                                ,Title_Name_E ,First_Name_E ,Last_Name_E ,Birth_Day ,Nation_Code ,Sex ,Occupation
                                ,Create_Date ,Create_By ,Email  ,Mobile ,Occupation1 ,Bank_Id ,Bank_Branch ,Bank_Account ,Bank_IdReturn ,Bank_BranchReturn ,Bank_AccountReturn
                                ,Company ,Position_name ,Type_Business ,Occupation_Othername ,Occupation_Desc
                                ,ObjectInvetMent ,SalaryPerMonth ,DateApi ,MktId ,DateExp, InvestMentBy ,MonnyOther ,ObjOpenAcc ,Bussinettype_Desc ,My_wife ,Wife_English
                            )VALUES(@Cust_Code,@Card_Type,@Group_Code ,@Title_Name_T,@First_Name_T,@Last_Name_T 
                                ,@Title_Name_E ,@First_Name_E ,@Last_Name_E ,@Birth_Day ,@Nation_Code ,@Sex ,@Occupation
                                ,@Create_Date ,@Create_By ,@Email  ,@Mobile ,@Occupation1 ,@Bank_Id ,@Bank_Branch ,@Bank_Account ,@Bank_IdReturn ,@Bank_BranchReturn ,@Bank_AccountReturn
                                ,@Company ,@Position_name ,@Type_Business ,@Occupation_Othername ,@Occupation_Desc
                                ,@ObjectInvetMent ,@SalaryPerMonth ,@DateApi ,@MktId ,@DateExp ,@InvestMentBy ,@MonnyOther ,@ObjOpenAcc ,@Bussinettype_Desc ,@My_wife ,@Wife_English
                            )`
                    flag_console = "Insert"
                } 
        
            })
           //console.log(query)
                let Cardtype                            =   await  setCardType(identificationCardType)
                //console.log("Cardtype :" + Cardtype)
                let Group_Code                          =   null ; 
                if (Cardtype ===  "C" ||Cardtype ===  "P"){
                    Group_Code = "1"
                }else if (Cardtype ===  "I"){ 
                    Group_Code = "2"
                }
                let titleTH         = "" ;                  await setTitleTH(title, (title_TH) =>{  titleTH = title_TH });
                let birth_Date                              = birthDate.substring(0,4) + "-" +birthDate.substring(4,6) + "-" + birthDate.substring(6,8)
                let nationCode      = "" ;                  await setnationality(nationality, (nation_code)=>{nationCode = nation_code})  // สัญชาติ
                let sex                                     =""; 
                if (title === 'MR') {sex ="M"}else{sex = "F"}  
                if (title === 'MR') {title ="Mr."}  
                if (title === 'MISS') {title ="Miss."}  
                if (title === 'MRS') {title ="Mrs."}  

                
                let Create_Date                             = null;                     
                let Create_By                               = "157"
                let Occupation_Desc
                let Occupation = ""
                let Occupation1 = "";                  
                let Type_Business = "";
                await setOccupation(+occupationId, (occuption,occuptiondesc)=>{
                    Occupation1 = occuption; 
                    Occupation_Desc = occuptiondesc  
                    Occupation = occuption;
                })   
                let Occupation_Othername =  occupationOther 
                const Position_name =  workPosition// await setoccupationId(+occupationId)
                let Bank_Id          
                let Bank_Account    
                let Bank_Branch
                let Bank_AccountReturn
                let Bank_IdReturn
                let Bank_BranchReturn

                await getdatetime((dt=>{Create_Date = dt}))
                await setBankAccountslData(cardNumber ,(accountId,bankCode,bankAccountNo ,bankBranchCode)=>{
                    Bank_Id                 =   bankCode        
                    Bank_Account            =   bankBranchCode;
                    Bank_Branch             =   bankAccountNo;

                   //console.log(Bank_Branch)
                })
                await setBankAccountslDataRED(cardNumber ,(accountId,bankCode,bankAccountNo ,bankBranchCode)=>{

                    Bank_IdReturn           = bankCode
                    Bank_AccountReturn     =  bankBranchCode
                    Bank_BranchReturn       = bankAccountNo
                   //console.log(Bank_Branch)
                })
                let mktId                                   = datarows[key].icLicense 
                // console.log(mktId)
                // await getMarketingCode(cardNumber,(id =>{MktId = id}))
                let MktId
                await convertMKTID(mktId , (id)=>{ MktId = id })
                // console.log(MktId)
                if (MktId === null) {MktId = 94 }
                let ObjectInvetMent =                   await setincomeSource(incomeSource) ;
                let SalaryPerMonth =                    await setSalaryPerMonth(monthlyIncomeLevel) ;
                let MonnyOther = ""
                let InvestMentBy    = "";
                let investmentObjectiveOther = ""                   
                await setInvestMentBy(cardNumber , (InvestMent , investmentObjectiv) =>{
                    //InvestMentBy = InvestMent
                    if (InvestMent === 'Investment')            { InvestMentBy = "2"}
                    if (InvestMent === 'RetirementInvestment')  {InvestMentBy = "6" ; }
                    if (InvestMent === 'ForTaxBenefits')        {InvestMentBy = "5"}
                    if (InvestMent === 'PleaseSpecify')         {InvestMentBy = "6" ; }
                    investmentObjectiveOther = investmentObjectiv
                })
                let ObjOpenAcc = ""
                let Bussinettype_Desc = businessTypeOther
                //console.log("businessTypeId : "+ businessTypeId)
                await setbusinessTypeId(+businessTypeId,(busisnesstype,businesstypeId)=>{
                    Type_Business =busisnesstype ; 
                    Occupation_Desc = busisnesstype ;
                    TypeBusiness1 = businesstypeId
                    ObjOpenAcc =  businesstypeId;
                    //Bussinettype_Desc = busisnesstype ;
                })
                // console.log(Occupation1)
               // console.log("key : "+ key +" "+ "card :"+ cardNumber)
                await new sql.ConnectionPool(config).connect().then(pool => {   
                    return pool.request()                        
                    .input("Cust_Code",                sql.VarChar(30),            cardNumber)
                    .input("Card_Type",                 sql.Char(1),                Cardtype)
                    .input("Group_Code",                sql.VarChar(1),             Group_Code)
                    .input("Title_Name_T",              sql.NVarChar(20),           titleTH)
                    .input("First_Name_T",              sql.NVarChar(200),          thFirstName)
                    .input("Last_Name_T",               sql.NVarChar(200),          thLastName)
                    .input("Title_Name_E",              sql.NVarChar(20),           title)
                    .input("First_Name_E",              sql.NVarChar(200),          enFirstName)
                    .input("Last_Name_E",               sql.NVarChar(200),          enLastName)
                    .input("Birth_Day",                 sql.Date,                   birth_Date)
                    .input("Nation_Code",               sql.VarChar(3),             nationCode)
                    .input("Sex",                       sql.Char(1),                sex)
                    .input("MktId",                     sql.Int,                    MktId)
                    .input("Create_Date",               sql.DateTime,               Create_Date)
                    .input("Create_By",                 sql.VarChar(20),            Create_By)
                    .input("Modify_Date",               sql.DateTime,               Create_Date)
                    .input("DateApi",                   sql.DateTime,               Create_Date)
                    .input("Modify_By",                 sql.VarChar(20),            Create_By)
                    .input("Email",                     sql.VarChar(100),           email)
                    .input("Mobile",                    sql.VarChar(20),            mobileNumber)
                    .input("Occupation",               sql.VarChar(3),              Occupation)
                    .input("Occupation1",               sql.VarChar(3),             Occupation1)
                    .input("Occupation_Desc",           sql.NVarChar(100),          Occupation_Desc)
                    .input("ObjectInvetMent",           sql.NVarChar(1),            ObjectInvetMent)
                    .input("SalaryPerMonth",            sql.NVarChar(1),            SalaryPerMonth)
                    .input("Bank_Id",                   sql.Int,                    Bank_Id)
                    .input("Bank_IdReturn",             sql.Int,                    Bank_IdReturn)
                    .input("Bank_Branch",               sql.Int,                    Bank_Branch)
                    .input("Bank_BranchReturn",         sql.Int,                    Bank_BranchReturn)
                    .input("Bank_Account",              sql.VarChar(15),            Bank_Account)
                    .input("Bank_AccountReturn",        sql.VarChar(15),            Bank_AccountReturn)
                    .input("Company",                   sql.NVarChar(150),          companyName)
                    .input("Position_name",             sql.NVarChar(100),          Position_name)
                    .input("Type_Business",             sql.NVarChar(100),          Type_Business)
                    .input("Occupation_Othername",      sql.NVarChar(100),          Occupation_Othername )
                    .input("DateExp",                   sql.Date(100),              cardExpiry ) 
                    .input("InvestMentBy",              sql.VarChar(1),             InvestMentBy )
                    .input("MonnyOther",                sql.NVarChar(100),          investmentObjectiveOther )
                    .input("Bussinettype_Desc",         sql.NVarChar(100),          Bussinettype_Desc )
                    .input("ObjOpenAcc",                sql.VarChar(3),             ObjOpenAcc )
                    .input("My_wife",                   sql.NVarChar(200),          My_wife )
                    .input("Wife_English",              sql.NVarChar(200),          Wife_English )
                    .query(query)  
                    }).then(result => {
                    sql.close();
                    // console.log(result);
                    // console.log("Number of records inserted:" + result.rowsAffected);  

                    console.log( flag_console +" to Account Info   Citizen: " + cardNumber +"   Complete");
                    return callback(flag_console +" to Account Info   Citizen: " + cardNumber + " "+ thFirstName+ " " +thLastName+ "   Complete");  
            
                    }).catch(err => {
                    console.log(err);
                    sql.close();
                    // return callback(err);
                    }); 

            } catch (error) {
                // result = "ERROR Catch"
                console.log(error);
                return   callback(error);
            }
    }
    //return callback(flag_console +" to Account Info   Citizen: " + cardNumber +"   Complete")
}
async function setInvestMentBy(cardNumber, callback){
    let statement = ` SELECT investmentObjective ,investmentObjectiveOther FROM Fund_Cen_Accounts WHERE cardNumber = '${cardNumber}'`
    try{
        await new sql.ConnectionPool(config).connect().then(pool => {
              return pool.request()
              .query(statement);
              
          }).then(result => {
              let rowsAffected = result.rowsAffected.toString()
              let investment = null
              let investmentObjectiveOther = ""
              if (rowsAffected > 0){  investment = result.recordset[0].investmentObjective }
              if (rowsAffected > 0){  investmentObjectiveOther = result.recordset[0].investmentObjectiveOther }
              sql.close();
              return callback(investment , investmentObjectiveOther)
          }).catch(err => {
              console.log(err);
              sql.close();
              return callback(err)
          });
    
      }catch (error) {
          // result = "ERROR Catch"
           console.log(error);
          return callback(error)
      }

}
async function getMarketingCode(cid,callback){
    let statement = ` SELECT Marketing_Code FROM MFTS_Account WHERE Account_No = '${cid}'`
    try{

        
    await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          let id = null
          if (rowsAffected > 0){  id = result.recordset[0].Marketing_Code }
          sql.close();
          return callback(id)
      }).catch(err => {
          console.log(err);
          sql.close();
          return callback(err)
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      return callback(error)
  }

}
async function getdatetime(callback){
    let statement = `SELECT GETDATE() as datetime ;`  
              //console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          let datetime
          if (rowsAffected > 0){  datetime = result.recordset[0].datetime }
          sql.close();
          return callback(datetime)
      }).catch(err => {
          console.log(err);
          sql.close();
          return callback(err)
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      return callback(error)
  }
}
async function selectDataAccountaddr(callback){
    try{
        let statement = `SELECT * FROM Fund_Cen_Address WHERE ID BETWEEN 2001 AND 3000 `  //ID BETWEEN 2001 AND 3000 WHERE cardNumber  = '3100500416064' '1100600281300' WHERE cardNumber  = '3101201738958'
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement); 
          }).then(result => {
            // console.log(result.recordset);
            let data_row = result.rowsAffected.toString();
             console.log("result: "+ data_row +" row")
            sql.close();
            //if ()
            return  callback(result.recordset) 
      
          }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
          });
        } catch (error) {
          result = "ERROR Catch"
          console.log(error);
          return   callback(error);
        } 
}
async function selectDataAccountaddrbyID(cardno, callback){
    try{
        let statement = `SELECT * FROM Fund_Cen_Address WHERE cardNumber = '${cardno}' `  
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement); 
          }).then(result => {
            // console.log(result.recordset);
            let data_row = result.rowsAffected.toString();
             console.log("result: "+ data_row +" row")
            sql.close();
            //if ()
            return  callback(result.recordset) 
      
          }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
          });
        } catch (error) {
          result = "ERROR Catch"
          console.log(error);
          return   callback(error);
        } 
}
async function importDataAccountaddr (datarows ,callback){

    for (const key in datarows) {
        try{
            let cardNumber          = datarows[key].cardNumber
            let address_type        = datarows[key].address_type
            let Addr_No             = datarows[key].no
            let floor               = datarows[key].floor
            let building            = datarows[key].building
            let roomNo              = datarows[key].roomNo
            let road                = datarows[key].road
            let moo                 = datarows[key].moo
            let subDistrict         = datarows[key].subDistrict
            let district            = datarows[key].district
            let province            = datarows[key].province
            let postalCode          = datarows[key].postalCode
            let country             = datarows[key].country
            // let timestampx          = datarows[key].timestampx
            // let flx                 = datarows[key].flx
            let soi                 = datarows[key].soi
            if(soi === null){soi = ' '}
            let seqAddr
            if(address_type === "doc"){ 
                seqAddr = 1
            }else if(address_type === "work"){
                seqAddr = 3
            }else if(address_type === "current"){seqAddr = 2}
            let Place =""

            let Tambon_Id ,Amphur_Id ,Province_Id, Country_Id
            let Zip_Code = postalCode
            await getProvinceId(province , (proId =>{Province_Id = proId}))
            await getAmphurId(district ,Province_Id , (amphurId=>{Amphur_Id = amphurId}))
            await getTambonId(subDistrict , Amphur_Id , (subid=>{Tambon_Id = subid}))
            await getCountryId(country, (conuty=>{Country_Id = conuty}))
            await delAddress(cardNumber,seqAddr)
            // console.log(Tambon_Id)
            // if (Tambon_Id === undefined ){Tambon_Id = null}
            // if (Amphur_Id === undefined ){Amphur_Id = null}
            // if (Province_Id === undefined ){Province_Id = null}
            // if (Country_Id === undefined ){Country_Id = null}
 
            // หมายเหตุ  โปรดดู จากข้อมูล  
            // ถนน ใน Database Road2 
            // ซอย ใช้          Road 
            // Place          เป็นชั้น 
            // Place2         หมู่บ้าน/อาคาร
            // ดูข้อมูลของ คุณสิทธิชัย 3760500954079

            if (floor === null)         {floor = ""}
            if (building === null)      {building = ""}
            if (roomNo === null)        {roomNo = ""}
            if (road === null)          {road = ""}
            if (moo === null)           {moo = ""}
            if (subDistrict === null)   {subDistrict = ""} 
            if (district === null)      {district = ""}
            if (province === null)      {province = ""}
            if (postalCode === null)    {postalCode = ""}
            if (floor === undefined)    {floor =""}
            if (building === undefined) {building ="place2"}
            if (roomNo === undefined)   {roomNo =""}
            if (road === undefined)     {road =""}
            if (soi === undefined)      {soi =""}
            // console.log("building" + building )
            let addrno = '' , floorNo = '' ,road_P = '', building_P = '' , Subdistrict_P = '' , district_P = '' ,province_P = '' ,soi_P = ''
            let fsubDistrict  = ' ';
            if (province === "กรุงเทพมหานคร"){fsubDistrict="แขวง "}else {fsubDistrict="ตำบล " }
            // const result1 = 10 > 5 ? 'yes' : 'no';
            let fdistrict = ' ';
            if (province === "กรุงเทพมหานคร"){fdistrict="เขต "}else {fdistrict="อำเภอ " }
            if (floorNo === undefined)  {floorNo =""}
            if (Addr_No.length > 0 )    {addrno = "เลขที่ "+ Addr_No}
            if (floor.length > 0 )      {floorNo = "ชั้นที่ "+ floor}
            if (soi.length > 0 )        {soi_P = "ซอย "+ soi}
            if (road.length > 0 )       {road_P = "ถนน "+ road}
            if (building.length > 0 )   {building_P = "หมู่บ้าน/อาคาร "+ building}
            if (subDistrict.length > 0 ){Subdistrict_P =  fsubDistrict + subDistrict}
            if (district.length > 0 )   {district_P = fdistrict + district}
            if (province.length > 0 )   {province_P = "จังหวัด " + province}

            const Print_Address =  addrno + " " +floorNo + " " + building_P + " "+soi_P+ " "   + road_P+ " "   + Subdistrict_P+ " " + district+ " " + province_P+ " " + postalCode
            const Tel = null
            // console.log("cardNumber :" + cardNumber) 
            // console.log("Amphur_Id :" + Amphur_Id)
            // console.log("Tambon_Id :" + Tambon_Id)

            let statement = `INSERT INTO Account_Address (Cust_Code, Addr_Seq, Addr_No ,Place ,Road ,Tambon_Id ,Amphur_Id ,Province_Id
                                                        ,Country_Id ,Zip_Code ,Print_Address ,Tel ,MooNo ,Place2  ,Road2  )
                            VALUES(@Cust_Code, @Addr_Seq, @Addr_No ,@Place ,@Road ,@Tambon_Id ,@Amphur_Id ,@Province_Id
                                                        ,@Country_Id ,@Zip_Code ,@Print_Address ,@Tel ,@MooNo ,@Place2 ,@Road2)`

            
                 
                
                
                await new sql.ConnectionPool(config).connect().then(pool => {   
                    return pool.request()                        
                    .input("Cust_Code",             sql.VarChar(30),        cardNumber)
                    .input("Addr_Seq",              sql.Int,                seqAddr)
                    .input("Addr_No",               sql.VarChar(20),        Addr_No)
                    .input("Place",                 sql.NVarChar(100),      floor)
                    .input("Road",                  sql.NVarChar(100),      soi)
                    .input("Tambon_Id",             sql.Int,                Tambon_Id)
                    .input("Amphur_Id",             sql.Int,                Amphur_Id)
                    .input("Province_Id",           sql.Int,                Province_Id) 
                    .input("Country_Id",            sql.Int,                Country_Id)
                    .input("Zip_Code",              sql.VarChar(10),        Zip_Code)
                    .input("Print_Address",         sql.NVarChar(400),      Print_Address)
                    .input("Tel",                   sql.VarChar(100),       Tel) 
                    .input("MooNo",                 sql.NVarChar(30),       moo)
                    .input("Place2",                sql.NVarChar(100),      building)
                    .input("Road2",                 sql.NVarChar(100),      road)
                    .query(statement)  
                }).then(result => {
                sql.close();
                // console.log(result);
                // console.log("Number of records inserted:" + result.rowsAffected);  
                let row = result.rowsAffected
                if (row> 0){
                    console.log( "Insert  to Account Address  type "+address_type+"  Citizen: " + cardNumber +"   Complete");
                }
               
                // return callback(result);  
        
                }).catch(err => {
                console.log(err);
                sql.close();
                // return callback(err);
                }); 

            } catch (error) {
                // result = "ERROR Catch"
                console.log(error);
                //return   callback(error);
            }

             
    }

}
async function delAddress(cardNumber,seqAddr){
    try{
        await new sql.ConnectionPool(config).connect().then(pool => {   
            return pool.request()
                .input("icardNumber", sql.NVarChar, cardNumber)
                .input("addrSeq", sql.Int, seqAddr) 
                .query(`DELETE FROM Account_Address WHERE Cust_Code  = @icardNumber AND Addr_Seq =@addrSeq `)
        }).then(result => {
            sql.close();
        }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
        });  
    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        //return   callback(error);
    }
}
async function getAmphurId(amphur,provinceId ,callback){
    try
    { 
        let statement =  `SELECT  Amphur_ID 
                          FROM         REF_Amphurs
                          WHERE     (Province_ID = ${provinceId}) AND (Name_Thai LIKE '${amphur}%')`
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
            
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            let id
            if (rowsAffected > 0){  id = result.recordset[0].Amphur_ID }
            sql.close();
            return callback(id)
        }).catch(err => {
            console.log(err);
            sql.close();
            return callback(err)
        });
  
    }catch (error) {
        // result = "ERROR Catch"
         console.log(error);
        return callback(error)
    }
}
async function getProvinceId(provinve, callback){
    try
    { 
        if (provinve ==="กรุงเทพมหานคร"){provinve = "กรุงเทพ"}
        let statement =  `SELECT Province_ID, Name_Thai, Name_Eng, Country_ID
                            FROM         REF_Provinces
                            WHERE     (Name_Thai LIKE '${provinve}%')`
                           // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);  
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            let id
            //console.log(result)
            if (rowsAffected > 0){  id = result.recordset[0].Province_ID }
            sql.close();
            return callback(id)
        }).catch(err => {
            // console.log(err);
            sql.close();
            return callback(err)
        });
  
    }catch (error) {
        // result = "ERROR Catch"
        // console.log(error);
        return callback(error)
    }

}
async function getTambonId(tambon ,Amphur_Id , callback){
    // if (tambon=== undefined){callback(0)}
    let statement = `SELECT Tambon_ID FROM REF_Tambons WHERE Amphur_ID = ${Amphur_Id} ANd Name_Thai LIKE '${tambon}%' ;`  
            //   console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          let id = null
          if (rowsAffected > 0){  id = result.recordset[0].Tambon_ID }
          sql.close();
          return callback(id)
      }).catch(err => {
          console.log(err);
          sql.close();
          return callback(err)
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      return callback(error)
  }
}
async function getCountryId(countryID, callback){
    let statement = `SELECT Country_ID FROM REF_Countrys WHERE Country_Code = '${countryID}' `  
            //   console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          let id
          if (rowsAffected > 0){  id = result.recordset[0].Country_ID }
          sql.close();
          return callback(id)
      }).catch(err => {
          console.log(err);
          sql.close();
          return callback(err)
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      return callback(error)
  }
}
async function convertMKTID(id ,callback){
    if(id === undefined){return 94}
    id = id.toString().trim()
    let statement = `SELECT Id  FROM  MFTS_SalesCode  WHERE License_Codenew = '${id}' OR License_Code = '${id}' `  
            //   console.log(statement)
  try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .query(statement);
          
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          let mktid = 0
          if (rowsAffected > 0){  mktid = result.recordset[0].Id }
          sql.close();
          //console.log( "MKTIID = "+mktid)
          return callback(mktid)
      }).catch(err => {
          console.log(err);
          sql.close();
          return callback(err)
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      return callback(error)
  }

}
/// open account pdf  08/08
async  function getnameaccount(cardname,callback){
    let statement = `SELECT  Title_Name_T, First_Name_T, Last_Name_T  FROM Account_Info
        WHERE     (Cust_Code = '${cardname}') `  
    //   console.log(statement)
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
        
        }).then(result => {
        let rowsAffected = result.rowsAffected.toString()
        let fullname
        if (rowsAffected > 0){  fullname =  " "+ result.recordset[0].First_Name_T +"  "+ result.recordset[0].Last_Name_T }
        sql.close();
        return callback(fullname)
        }).catch(err => {
        console.log(err);
        sql.close();
        return callback(err)
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }
}
/// open account pdf  08/08
async function callsendmail(email,detail ,callback){
    let customername
    await getnameaccount(detail,(fullname)=>{
        customername = fullname
    })
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
       app.use('image',express.static('../../image'))
        // console.log(__dirname+'/image')
        let textemail = `   เรื่อง ปรับปรุงข้อมูลส่วนบุคคลของผู้ลงทุนตามแบบคำขอเปิดบัญชีฉบับใหม่ <br><br>
                            เรียน คุณ ${customername} <br><br>
                            สิ่งที่ส่งมาด้วย : 1. คำขอเปิดบัญชีฉบับใหม่ <br><br>
                            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    เนื่องจากพระราชบัญญัติป้องกันและปราบปรามการฟอกเงินและประกาศของสำนักงานคณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์ (สำนักงาน กลต.) ได้กำหนดให้สถาบันการเงินรวมถึงบริษัทหลักทรัพย์ทุกราย ต้องมีการจัดเก็บข้อมูลของลูกค้าและมีการทบทวนปรับปรุงข้อมูลส่วนบุคคล และระดับความเสี่ยงที่ยอมรับได้ของลูกค้าทุกรายให้เป็นปัจจุบัน และในปี 2565 สำนักงาน กลต. ได้มีการประกาศใช้กฎเกณฑ์เกี่ยวกับคำขอเปิดบัญชีฉบับใหม่ ที่มีผลบังคับกับบริษัท โดยแบบคำขอเปิดบัญชีฉบับใหม่ เป็นแบบที่สำนักงาน กลต. กำหนดให้ทุก บลจ. ที่บริษัทเป็นผู้สนับสนุนการขายและรับซื้อคืนใช้ร่วมกันในรูปแบบ Single form ซึ่งลูกค้าสามารถทำรายการซื้อขายกองทุนได้ทุก บลจ. ที่บริษัทเป็นผู้สนับสนุนการขายและรับซื้อคืน ผ่านบริษัทโดยไม่ต้องมีการเปิดบัญชีเพิ่มเติมกับแต่ละ บลจ. อีกครั้ง
                            ดังนั้น เพื่อให้บริษัทหลักทรัพย์นายหน้าซื้อขายหน่วยลงทุน เวลท์ รีพับบลิค  จำกัด สามารถปฏิบัติตามข้อกำหนดของกฎหมายได้อย่างถูกต้อง บริษัทฯ จึงใคร่ขอความกรุณาจากท่านผู้ลงทุนจัดทำคำขอเปิดบัญชีฉบับใหม่ ตามแบบฟอร์ม ที่ได้แนบมาด้วยนี้ <br><br>
                            1.ในกรณีที่คำขอมีข้อมูลที่ไม่ถูกต้อง ให้ ขีดฆ่าข้อมูลในคำขอและกรอกข้อมูลที่ถูกต้องแท้จริงพร้อมลงนามกำกับ และระบุข้อความที่มีการเปลี่ยนแปลง  <br>
                            2. โปรดแนบเอกสารประกอบคำขอ พร้อมลงนามรับรองสำเนาถูกต้อง <br>
                            (1) สำเนาบัตรประชาชน (2) สำเนาสมุดบัญชีเงินฝาก (3) เอกสารหลักฐานอื่น (ถ้ามี) <br>
                            3.เมื่อลงลายมือชื่อในแบบคำขอเรียบร้อยแล้ว กรุณานำส่งแบบคำขอดังกล่าว กลับมายังให้บริษัทฯ ทาง 
                            Line ID: @wealthrepublic หรือทาง Email : marketing@wealthrepublic.co.th  และ “โปรดส่งเอกสารคำขอเปิดบัญชีฉบับจริงมาที่ บลน.เวลท์ รีพับบลิค  52 อาคารธนิยะ พลาซา ชั้น 14 โซน บี ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร 10500” <br> 
                            **หากท่านประสงค์จะให้บริษัทจัดส่งเอกสารคำขอเปิดบัญชีในรูปแบบเอกสารโปรดแจ้งมายังบริษัทตามข้อมูลการติดต่อข้างต้น** <br><br>
                            ทั้งนี้ หากบริษัทฯ ไม่ได้รับเอกสารดังกล่าวนี้จากท่าน บริษัทขอสงวนสิทธิ์ในการทำรายการ ซื้อ ขาย และ สับเปลี่ยนกองทุนของท่าน หากท่านประสงค์จะทำรายการข้างต้นโปรดจัดส่งเอกสารดังกล่าวมายังบริษัท
                            บริษัทมีนโยบายคุ้มครองข้อมูลส่วนบุคคล สามารถดูรายละเอียดได้ที่ https://www.wealthrepublic.co.th/privacy.html <br><br>
                            บริษัทฯ ใคร่ขอแสดงความขอบคุณลูกค้าที่ได้ให้ความร่วมมือในการปรับปรุงข้อมูลส่วนบุคคลและข้อมูลความสามารถในการรับ
                            ความเสี่ยงในการลงทุนให้เป็นปัจจุบัน <br><br>
                            ท่านสามารถเรียกดูรายงาน โดยคลิกที่ไฟล์แนบ (PDF File) และใส่รหัสผ่าน  8  หลัก (วันเดือนปีเกิดของท่าน) 
                            ในรูปแบบ ddmmyyyy  <br><br>

                            dd : วันเกิดของท่าน ตัวเลข  2 หลัก <br>
                            mm : เดือนเกิดของท่าน ตัวเลข 2 หลัก <br>
                            yyyy : ปี ค.ศ. เกิดของท่าน 4 หลัก (เช่น ปี 1985) <br><br>

                            ตัวอย่าง : ท่านที่เกิดวันที่ 5 มีนาคม 1985 รหัสของท่านคือ  05031985 <br>
                            ท่านต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อเจ้าหน้าที่ลูกค้าสัมพันธ์  <br>
                            โทร. 02-266-6697  E-mail : marketing@wealthrepublic.co.th <br><br>

                            ขอแสดงความนับถือ  <br>
                            บริษัทหลักทรัพย์นายหน้าซื้อขายหน่วยลงทุน เวลท์ รีพับบลิค จำกัด   `;
        let filename = detail+'.pdf'
        let pathfile = 'image'
        
        // Message object
        let message = {
            from: 'cs@wealthrepublic.co.th',
            to: 'atichat@wealthrepublic.co.th', //chitchai
            subject: 'test mail',
            text: ` ${textemail}   `,
            html:  ` ${textemail}  ` 
            // ,cc: `${email}`
           , attachments : [
                {
                    filename: filename,
                    path: pathfile + '/'+ filename
                }
              ]
        };
    
        // open on sent
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                // return process.exit(1);
                return callback('Error occurred. ');
            }
    
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            return callback('success')
        });
    });

    
}
/// open account pdf  08/08
async function updatesendmail(cust_id,email,file){
    try{
       let query = ` UPDATE  Customer_send_form SET 
                            send             = @send,
                            filename         = @filename,
                            email            = @email
                            WHERE cust_code = @cust_code `
        await new sql.ConnectionPool(config).connect().then(pool => {   
            return pool.request()                        
            .input("send",                  sql.Char(1),                "1")
            .input("filename",              sql.NVarChar(150),           file)
            .input("email",                 sql.NVarChar(50),            email)
            .input("cust_code",             sql.VarChar(20),            cust_id) 
            .query(query)  
            }).then(result => {
            sql.close(); 
            console.log( " insert to Customer_send_form Info   Citizen: " + cust_id +"   Complete");
            // return callback(result);  
    
            }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
            }); 

    } catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }

}
async function updatesendmail_error(cust_id){
    try{
       let query = ` UPDATE  Customer_send_form SET 
                            send             = @send
                            WHERE cust_code = @cust_code `
        await new sql.ConnectionPool(config).connect().then(pool => {   
            return pool.request()                        
            .input("send",                  sql.Char(1),              "0")
            .input("cust_code",             sql.VarChar(20),        cust_id) 
            .query(query)  
            }).then(result => {
            sql.close(); 
            console.log( " insert to Customer_send_form Info   Citizen: " + cust_id +"   Complete");
            // return callback(result);  
    
            }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
            }); 

    } catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }

}

// create  consent mail  2 - 11 - 2022 
async function getdataaccoutngroup(callback){
    let statement = `SELECT     TOP (50)  dbo.RP_ACCOUNT_INFO.Cust_Code, dbo.RP_ACCOUNT_INFO.Title_Name_T, dbo.RP_ACCOUNT_INFO.First_Name_T, dbo.RP_ACCOUNT_INFO.Last_Name_T, 
                                dbo.Consent_mail.send ,dbo.RP_ACCOUNT_INFO.Email
                                FROM         dbo.RP_ACCOUNT_INFO INNER JOIN
                                dbo.Consent_mail ON dbo.RP_ACCOUNT_INFO.Cust_Code = dbo.Consent_mail.cust_code
                                WHERE     (dbo.RP_ACCOUNT_INFO.Card_Type <> 'I') AND (dbo.Consent_mail.send IS NULL) 
                                AND (dbo.RP_ACCOUNT_INFO.Email <> '')  
                                `  
    //   console.log(statement) AND  dbo.RP_ACCOUNT_INFO.Cust_Code = '3760500954079'
    try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
        
        }).then(result => {
        let rowsAffected = result.rowsAffected.toString()
        let fullname
        if (rowsAffected > 0){  fullname =  " "+ result.recordset[0].First_Name_T +"  "+ result.recordset[0].Last_Name_T }
        sql.close();
        return callback(result.recordset)
        }).catch(err => {
        console.log(err);
        sql.close();
        return callback(err)
        });

    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        return callback(error)
    }
}
// create  conset mail  2 - 11 - 2022 
async function selectaccouttomail(datarows){
    for ( let key in datarows) {
        let cardNumber   = datarows[key].Cust_Code 
        let email   = datarows[key].Email
        let fullname = datarows[key].Title_Name_T + " " + datarows[key].First_Name_T + " " + datarows[key].Last_Name_T
        // console.log(cardNumber)
        let datas
        try{
            let statement = `SELECT     TOP (100) PERCENT dbo.MFTS_Account.Account_No, dbo.MFTS_Amc.Amc_Code,  dbo.MFTS_Account.Marketing_Code, dbo.MFTS_Account.Status_Id, 
                                        dbo.MFTS_Amc.Amc_Name, dbo.MFTS_Account.Holder_Id, dbo.MFTS_Account.Title_Name_T, dbo.MFTS_Account.First_Name_T, dbo.MFTS_Account.Last_Name_T, dbo.MFTS_Account.Title_Name_E,
                                        dbo.MFTS_Account.First_Name_E, dbo.MFTS_Account.Last_Name_E
                            FROM         dbo.MFTS_Account INNER JOIN
                                        dbo.MFTS_Amc ON dbo.MFTS_Account.Amc_Id = dbo.MFTS_Amc.Amc_Id
                            WHERE     (dbo.MFTS_Account.Holder_Id <> '') AND (Account_No = @Account_No )
                            ORDER BY dbo.MFTS_Account.Account_No, dbo.MFTS_Account.Holder_Id` 
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .input("Account_No", sql.VarChar(20) , cardNumber) 
                .query(statement);
                
                }).then(result => {
                let rowsAffected = result.rowsAffected.toString()
                // let fullname
                // if (rowsAffected == 0){  continue; }
                // if (rowsAffected > 0){  console.log(rowsAffected); }
                sql.close();
                // return callback(result.recordset)
                datas = result.recordset
                // console.log(result.recordset)
                }).catch(err => {
                console.log(err);
                sql.close();
                // return callback(err)
                }); 
        
            }catch (error) {
                // result = "ERROR Catch"
                console.log(error);
                // return callback(error)
            }
            // console.log(datas)
            let flag = 0
            if(datas.length == 0 ){ 
                console.log( "data = 0" ) ;  
                updatconsentmail(cardNumber)
                 continue;
            } 
                await settextmailaccount(datas ,fullname  , (textmail)=>{
                //  console.log(email)
                    // nodemailer.createTestAccount((err, account) => {
                    //     if (err) {
                    //         console.error('Failed to create a testing account. ' + err.message);
                    //         return process.exit(1);
                    //     }
                    // })      
                        console.log('Credentials obtained, sending message...');
                    
                        // Create a SMTP transporter object
                        let transporter = nodemailer.createTransport({
                            host: 'smtp.wealthrepublic.co.th',
                            port: 25,
                            secure: false, //use SSL
                            auth: {
                                user: 'cs@wealthrepublic.co.th', // esign@wealthrepublic.co.th
                                pass:  'wrmf@2016'//'Wealth@2022' //cb11@4tF3 wrmf@2016
                            },
                            tls:{ 
                                rejectUnauthorized: false 
                                }
                        }); 
                        // console.log(__dirname+'/image')
                        // let  textemail = textmail;
                        // Message object
                        let message = {
                            from: 'cs@wealthrepublic.co.th',
                            to: `${email}`, //chitchai 'atichat@wealthrepublic.co.th'  `${email}`
                            subject: 'นำส่งข้อมูลการลงทุนในกองทุนประเภท SSF และ RMF เพื่อใช้สิทธิ์ในการลดหย่อนภาษีเงินได้จากการลงทุนในปี 2565 ',
                            text: ` ${textmail}   `,
                            html:  ` ${textmail} ` ,
                            attachments: [{
                                filename: 'logo.bmp',
                                path: 'logo.bmp',
                                cid: 'logo' //same cid value as in the html img src
                            }]
                            , cc: `cs@wealthrepublic.co.th`  //komkritnew <komkrit@wealthrepublic.co.th> `cs@wealthrepublic.co.th`
                        };

                        // open on sent
                        transporter.sendMail(message, (err, info) => {
                            if (err) {
                                console.log('Error occurred. ' + err.message);
                                flag = 0
                                return process.exit(1);
                                // return callback('Error occurred. ');
                            }
                            flag = 1
                            updatconsentmail(datas[0].Account_No)
                            console.log('Message sent: %s', info.messageId);
                            // Preview only available when sending through an Ethereal account
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                            // return callback(flag)
                        });
                    });
                
    }

}

// create  conset mail  2 - 11 - 2022 
async function settextmailaccount(datarows ,fullname  ,callback){
    let text =""
    
    // console.log(datarows)
    for ( let key in datarows) {
        text = text+  `<tr>
                        <td>${datarows[key].Amc_Name}</td>
                        <td>${datarows[key].Holder_Id}</td> 
                        </tr>
                      `
        fullname = datarows[key].Title_Name_T + " " + datarows[key].First_Name_T + " " + datarows[key].Last_Name_T
    } 
    // console.log(fullname)
    // console.log(text)
    // for (let index = 0; index < datarows.length; index++) {
    //     // const element = datarows[index];
    //     console.log(datarows[index].Holder_Id)
    // }
    let content = `<!DOCTYPE html>
                    <html>
                    <style>
                    table, th, td {
                    border:1px solid black;
                     font-size: 14.0pt; 
                     font-family: 'BrowalliaUPC',sans-serif;
                    }
                    </style>
    <body>
    <img src="cid:logo" alt="G" width="50" height="50"><br> <br>
    เรียน  ${fullname} <br> <br>   
    เรื่อง 	การแจ้งความประสงค์และยินยอมให้ บลจ. นำส่งข้อมูลการลงทุน ในกองทุน SSF และ RMF ให้กรมสรรพากร 
    เพื่อใช้สิทธิลดหย่อนภาษีเงินได้จากการลงทุนในปี 2565 <br><br>
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;ตามที่กรมสรรพากรได้มีประกาศเกี่ยวกับภาษีเงินได้ (ฉบับที่ 414 และ 415)  เรื่องการขอลดหย่อนภาษี กรณีที่ผู้มีเงินได้มีการลงทุนในกองทุน SSF และ RMF ผู้มีเงินได้ มีหน้าที่ต้องแจ้งความประสงค์ ที่จะใช้สิทธิ์ลดหย่อนภาษีเงินได้ จากการลงทุนดังกล่าว ไปยัง บริษัทหลักทรัพย์จัดการกองทุน (บลจ.) เพื่อเปิดเผยข้อมูลการลงทุนในกองทุน SSF และ RMF ต่อกรมสรรพากร ตามหลักเกณฑ์และวิธีการที่กรมสรรพากรกำหนด
    <br><br>
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;ลูกค้าที่ซื้อกองทุน SSF และ RMF ตั้งแต่วันที่ 1 ม.ค.65 เป็นต้นไป  สามารถแจ้งความประสงค์ผ่านช่องทางออนไลน์ของแต่ละ บลจ. ได้ภายในวันที่ 30 ธ.ค. 65 โดยลูกค้าสามารถดำเนินการเพียงครั้งเดียว และจะใช้ได้ตลอดไป <b>จนกว่าจะมีการแจ้งเปลี่ยนแปลง กรณีลูกค้าไม่แจ้งความประสงค์ หรือ แจ้งความประสงค์ไม่ยินยอมให้เปิดเผยข้อมูล จะไม่สามารถใช้สิทธิลดหย่อนภาษีได้ </b>
    <br><br>
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;โดยบางบลจ.ลูกค้าจะต้องกรอกข้อมูลเลขผู้ถือหน่วยลงทุนเพิ่มเติมจากเลขบัตรประชาชน ดังนั้นบริษัทจึงขอแจ้งเลขผู้ถือหน่วยที่ท่านมีกับแต่ละ บลจ. ดังนี้ <br><br>
    
    <table width=600>
    <tr>
        <th>บลจ.</th>
        <th>เลขผู้ถือหน่วยลงทุน</th> 
    </tr>
        ${text}
    </table>
    <br> <br>   
    แจ้งความประสงค์ผ่านช่องทางออนไลน์ของแต่ละ บลจ. ดังนี้  <br> <br>   
    1. บลจ.แอสเซทพลัส <br>
    https://www.assetfund.co.th/portal/tax-consent   <br> <br>   
    2. บลจ.กรุงศรี <br>
    https://www.krungsriassetonline.com/TaxRequest/?Lang=T   <br> <br>   
    3. บลจ.แลนด์ แอนด์ เฮ้าส์ <br>
     https://online.lhfund.co.th/#/consentrmf    <br> <br>   
    
    4. บลจ.อีสท์สปริง (เริ่มลงทะเบียน 8 พ.ย.65 เป็นต้นไป) <br>
     https://order.eastspring.co.th/login/request-consent/index.jsp  <br> <br>   
    5. บลจ.วรรณ  <br>
    https://www.one-asset.com/th/Benefit/detail/30 <br> <br>   
    6. บลจ.ไทยพาณิชย์ (เริ่มลงทะเบียน 28 พ.ย.65 เป็นต้นไป) <br>
    https://e-service.scbam.com  <br> <br>   
    7. บลจ.ดาโอ <br>
    https://onepeace.daolsecurities.co.th/otp-gateway?from=daolinv&reques=consentrmf <br> <br>   
    8. บลจ.กรุงไทย <br>
    https://www.ktam.co.th/tax-request.aspx   <br> <br>   
    9. บลจ.พรินซิเพิล  <br>
    https://easyinvest.principal.th/click/OnlineConsent_RMF_SSF_About.aspx <br><br>
    
    ทั้งนี้หากมีข้อสงสัย สอบถามรายละเอียดได้ที่ 02 266 6697 หรือ Line: @Wealthrepublic	<br><br>
    ขอแสดงความนับถือ<br> <br>   
   
    *** email ฉบับนี้ถูกส่งด้วยระบบอัตโนมัติ ไม่สามารถตอบได้ <br><br> 
    บริษัทหลักทรัพย์นายหน้าซื้อขายหน่วยลงทุนเวลท์ รีพับบลิค  จำกัด	<br>
    52 Thaniya Plaza Building 14/F Zone B, Silom Road, <br>
    Suriyawong, Bangrak, Bangkok 10500 <br>
    TEL      :      02 266-6697  <br>
    Mobile  :      081-825-3444 <br>
    www.wealthrepublic.co.th  <br>
    
     
    </body>
    `
    // console.log(content)
    return callback(content)
    
}
 
async function updatconsentmail(cust_id){ 
    try{
       let query = ` UPDATE  Consent_mail SET 
                            send             = @send
                            WHERE cust_code = @cust_code `
        await new sql.ConnectionPool(config).connect().then(pool => {   
            return pool.request()                        
            .input("send",                  sql.Char(1),              "2")
            .input("cust_code",             sql.VarChar(20),        cust_id) 
            .query(query)  
            }).then(result => {
            sql.close(); 
            console.log( " insert to Consent_mail Info   Citizen: " + cust_id +"   Complete");
            // return callback(result);  
    
            }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
            }); 

    } catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }

}
async function callgroupsendmail(datarows,callback){
    // console.log(datalrows)
    let email = null ,  sucess , datas ,file 
    for (const key in datarows) {
         let cust_code   = datarows[key] 
        // check send
        let sented
        await checksendform(cust_code ,(send)=> { 
            sented = send
            
        })
        
        if(sented > 0){continue;}
        await selectaccountsToPdf(cust_code,(result)=>{  datas = result   })
        email = datas[0].Email.trim()
        // console.log(email) 
        // continue    ;
         await genpdf(datas ,(filename)=>{   file = filename  })
        //  console.log(file)
        if(file === undefined){updatesendmail_error(cust_code); continue;  }
        

        await callsendsmail(email,cust_code,file ,(x)=>{
            sucess = x
            if(x === 'success'){
                updatesendmail(cust_code,email,file)     
            } 
        })        
    }
    return callback('success')

}
async function callsendsmail(email,detail ,file_name ,callback){
    let customername
    await getnameaccount(detail,(fullname,mail)=>{
        customername = fullname
        if(email === undefined || email === null){
            email = mail
        }
    })
    if(customername === undefined){return callback('Error Fullname')}
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            return callback(process.exit(1));
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
        app.use('image',express.static('image'))
        // console.log(__dirname+'/image')
        let textemail = `   เรื่อง ปรับปรุงข้อมูลส่วนบุคคลของผู้ลงทุนตามแบบคำขอเปิดบัญชีฉบับใหม่ <br><br>
                            เรียน คุณ ${customername} <br><br>
                            สิ่งที่ส่งมาด้วย : 1. คำขอเปิดบัญชีฉบับใหม่ <br><br>
                            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;    เนื่องจากพระราชบัญญัติป้องกันและปราบปรามการฟอกเงินและประกาศของสำนักงานคณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์ (สำนักงาน กลต.) ได้กำหนดให้สถาบันการเงินรวมถึงบริษัทหลักทรัพย์ทุกราย ต้องมีการจัดเก็บข้อมูลของลูกค้าและมีการทบทวนปรับปรุงข้อมูลส่วนบุคคล และระดับความเสี่ยงที่ยอมรับได้ของลูกค้าทุกรายให้เป็นปัจจุบัน และในปี 2565 สำนักงาน กลต. ได้มีการประกาศใช้กฎเกณฑ์เกี่ยวกับคำขอเปิดบัญชีฉบับใหม่ ที่มีผลบังคับกับบริษัท โดยแบบคำขอเปิดบัญชีฉบับใหม่ เป็นแบบที่สำนักงาน กลต. กำหนดให้ทุก บลจ. ที่บริษัทเป็นผู้สนับสนุนการขายและรับซื้อคืนใช้ร่วมกันในรูปแบบ Single form ซึ่งลูกค้าสามารถทำรายการซื้อขายกองทุนได้ทุก บลจ. ที่บริษัทเป็นผู้สนับสนุนการขายและรับซื้อคืน ผ่านบริษัทโดยไม่ต้องมีการเปิดบัญชีเพิ่มเติมกับแต่ละ บลจ. อีกครั้ง
                            ดังนั้น เพื่อให้บริษัทหลักทรัพย์นายหน้าซื้อขายหน่วยลงทุน เวลท์ รีพับบลิค  จำกัด สามารถปฏิบัติตามข้อกำหนดของกฎหมายได้อย่างถูกต้อง บริษัทฯ จึงใคร่ขอความกรุณาจากท่านผู้ลงทุนจัดทำคำขอเปิดบัญชีฉบับใหม่ ตามแบบฟอร์ม ที่ได้แนบมาด้วยนี้ <br><br>
                            1.ในกรณีที่คำขอมีข้อมูลที่ไม่ถูกต้อง ให้ ขีดฆ่าข้อมูลในคำขอและกรอกข้อมูลที่ถูกต้องแท้จริงพร้อมลงนามกำกับ และระบุข้อความที่มีการเปลี่ยนแปลง  <br>
                            2. โปรดแนบเอกสารประกอบคำขอ พร้อมลงนามรับรองสำเนาถูกต้อง <br>
                            (1) สำเนาบัตรประชาชน (2) สำเนาสมุดบัญชีเงินฝาก (3) เอกสารหลักฐานอื่น (ถ้ามี) <br>
                            3.เมื่อลงลายมือชื่อในแบบคำขอเรียบร้อยแล้ว กรุณานำส่งแบบคำขอดังกล่าว กลับมายังให้บริษัทฯ ทาง 
                            Line ID: @wealthrepublic หรือทาง Email : marketing@wealthrepublic.co.th  และ “โปรดส่งเอกสารคำขอเปิดบัญชีฉบับจริงมาที่ บลน.เวลท์ รีพับบลิค  52 อาคารธนิยะ พลาซา ชั้น 14 โซน บี ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร 10500” <br> 
                            **หากท่านประสงค์จะให้บริษัทจัดส่งเอกสารคำขอเปิดบัญชีในรูปแบบเอกสารโปรดแจ้งมายังบริษัทตามข้อมูลการติดต่อข้างต้น** <br><br>
                            ทั้งนี้ หากบริษัทฯ ไม่ได้รับเอกสารดังกล่าวนี้จากท่าน บริษัทขอสงวนสิทธิ์ในการทำรายการ ซื้อ ขาย และ สับเปลี่ยนกองทุนของท่าน หากท่านประสงค์จะทำรายการข้างต้นโปรดจัดส่งเอกสารดังกล่าวมายังบริษัท
                            บริษัทมีนโยบายคุ้มครองข้อมูลส่วนบุคคล สามารถดูรายละเอียดได้ที่ https://www.wealthrepublic.co.th/privacy.html <br><br>
                            บริษัทฯ ใคร่ขอแสดงความขอบคุณลูกค้าที่ได้ให้ความร่วมมือในการปรับปรุงข้อมูลส่วนบุคคลและข้อมูลความสามารถในการรับ
                            ความเสี่ยงในการลงทุนให้เป็นปัจจุบัน <br><br>
                            ท่านสามารถเรียกดูรายงาน โดยคลิกที่ไฟล์แนบ (PDF File) และใส่รหัสผ่าน  8  หลัก (วันเดือนปีเกิดของท่าน) 
                            ในรูปแบบ ddmmyyyy  <br><br>

                            dd : วันเกิดของท่าน ตัวเลข  2 หลัก <br>
                            mm : เดือนเกิดของท่าน ตัวเลข 2 หลัก <br>
                            yyyy : ปี ค.ศ. เกิดของท่าน 4 หลัก (เช่น ปี 1985) <br><br>

                            ตัวอย่าง : ท่านที่เกิดวันที่ 5 มีนาคม 1985 รหัสของท่านคือ  05031985 <br>
                            ท่านต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อเจ้าหน้าที่ลูกค้าสัมพันธ์  <br>
                            โทร. 02-266-6697  E-mail : marketing@wealthrepublic.co.th <br><br>

                            ขอแสดงความนับถือ  <br>
                            บริษัทหลักทรัพย์นายหน้าซื้อขายหน่วยลงทุน เวลท์ รีพับบลิค จำกัด   `;
        let filename = file_name+'.pdf'
        const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let date_present = year +  month  + date 
        
        // Message object
        let message = {
            from: 'cs@wealthrepublic.co.th',
            to: 'atichat@wealthrepublic.co.th', //chitchai  sittichai atichat janjira
            subject: 'ปรับปรุงข้อมูลส่วนบุคคลของผู้ลงทุนตามแบบคำขอเปิดบัญชีฉบับใหม่ (ทดสอบ)',
            text: ` ${textemail}   `,
            html:  ` ${textemail}  ` 
            // ,cc: `${email}`
            // ,cc: `atichat@wealthrepublic.co.th`
           , attachments : [
                {
                    filename: filename,
                    path: 'C:/WR/fundcon/'+date_present + '/'+ filename
                }
              ]
        };
    
        // open on sent
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                  return process.exit(1);
                // return callback('Error occurred. ');
            }
    
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            return callback('success')
        });
    });

    
}
async function checksendform(cust_code ,callback){
    try{
        let statement = `SELECT     dbo.Customer_send_form.send, dbo.Customer_send_form.cust_code, dbo.Account_Info.Title_Name_T, dbo.Account_Info.First_Name_T, dbo.Account_Info.Last_Name_T , dbo.Account_Info.Email
                        FROM         dbo.Customer_send_form INNER JOIN
                        dbo.Account_Info ON dbo.Customer_send_form.cust_code = dbo.Account_Info.Cust_Code WHERE  (dbo.Customer_send_form.send IS NOT NULL) 
                        AND  dbo.Customer_send_form.cust_code = @cust_code ` 
    await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .input('cust_code' , sql.VarChar(15) ,cust_code) 
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
             
            sql.close();
            // console.log(data_row)
            return   callback(data_row);  
        }).catch(err => {
            console.log(err);
            sql.close();
            return callback(err);
            });
    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }
}
async function migrateAccountNdid(callback){
    let DATA_CUSTOMER  
    try{
        let statement =`SELECT TOP (100) PERCENT dbo.Account_Info.Cust_Code, 
                            dbo.Fund_cen_Customer.ndidFlag
                        FROM dbo.Fund_cen_Customer INNER JOIN
                            dbo.Account_Info ON 
                            dbo.Fund_cen_Customer.cardNumber = dbo.Account_Info.Cust_Code
                        GROUP BY dbo.Account_Info.Cust_Code, 
                            dbo.Fund_cen_Customer.ndidFlag
                        HAVING (NOT (dbo.Fund_cen_Customer.ndidFlag IS NULL))
                        ORDER BY dbo.Fund_cen_Customer.ndidFlag`


        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request() 
            .query(statement);
            }).then(result => {
            let data_row = result.rowsAffected.toString();
            DATA_CUSTOMER = result.recordset    
            sql.close();
           
        }).catch(err => {
            console.log(err);
            sql.close();
            //return callback(err);
            });
    }catch (error) {
        // result = "ERROR Catch"
        console.log(error);
        //return   callback(error);
    }
    for (const key in DATA_CUSTOMER) {
        // console.log(DATA_CUSTOMER[key].Cust_Code)//Cust_Code
        // console.log(DATA_CUSTOMER[key].ndidFlag)//ndidFlag
        try{
            let Cust_Code       = DATA_CUSTOMER[key].Cust_Code
            let ndidFlag        = DATA_CUSTOMER[key].ndidFlag.trim()
            let ndid            = ''
            if(ndidFlag === true){ndid ='X'}
            // if(ndidFlag === true){ console.log(ndid +' <> '+ Cust_Code)}
           
            let statement = `UPDATE TOP (1) Account_Info SET NDID = @NDID  WHERE Cust_Code = @Cust_Code `
            await new sql.ConnectionPool(config).connect().then(pool => { 
                return pool.request()
                .input('NDID'           ,sql.Char(1),       ndid)
                .input('Cust_Code'      , sql.VarChar,      Cust_Code) 
                .query(statement);
                }).then(result => {

                sql.close();
               
            }).catch(err => {
                console.log(err);
                sql.close();
                //return callback(err);
                });

        }catch{

        }

    }

}
export {SelectDataAccount ,selectDataAccountaddr ,checkAccountinfo, importDataAccountaddr ,SelectDataAccountbyID , selectDataAccountaddrbyID ,getdataaccoutngroup,selectaccouttomail,callsendmail,updatesendmail,callgroupsendmail ,updatesendmail_error,migrateAccountNdid}