import express from 'express';
import sql  from 'mssql';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
//import cors from 'cors';

import { parse } from 'csv-parse';
import unzipper from 'unzipper';
import { config,config_NCL } from './dbconfig.js';
import poolPromise from './db.js';
import nodemailer from 'nodemailer'; 
import {
    insertFund_Cen_Accounts,
    insertFund_Cen_Suitibility,
    insertFund_Cen_Individual,
    updateFund_Cen_Individual,
    insertFund_Cen_Address,
    insertFund_Cen_BankAccounts
} from './dbsql.js';
import { AllottedTransactions } from './impsql.js';
import { constants } from 'buffer';
import { resolve } from 'path';
import { exit } from 'process';
import { getFundConnIndividualProfile } from '../fundconn/funconPipe.js';
import {selctDataOrderQuery ,impoertOrderQuery ,checkDataOrderInquiry} from './orderquery.js'
import {getDataTransaction ,importDataTransaction} from './transaction.js'
import {selectDataHoliday,checkDataHoliday, importDataHoliday, selectDataTrandCalendar ,selectREFHoliday} from './fundholiday.js'
import { setTimeout } from 'timers';
import { SelectFundProfile,ImportFund} from './FundProfile.js'

// import { json } from 'body-parser';

//import {isEmptyObject,StatusUpdate,setErrorLog,fixCardExpiryDate,fixZero,getExpireNextYear,fixLastYear} from './dbutils.js';
//const geoAutocomplete = require('./db.js');
//import  { utf8 }  from 'utf8';
dotenv.config();
//const utf8 = require('utf8');

/*
sql.on('error' , err => {
  console.log("dbIndividual:sql.on error");
  console.log( err);
})
*/


async function setIndividualProfile(jdata, callback) {
    var Banks = [];
    try {

        await setIndividualData(jdata, function(x0) {
            console.log("setIndividualData:" + jdata.cardNumber + x0);
        });
        var xcardNumber = jdata.cardNumber;
        var AddressIdDoc = jdata.identificationDocument;
        var AddressCurrent = jdata.current;
        var AddressWork = jdata.work;
        var Suitability = jdata.suitabilityForm;
        var Accounts = jdata.accounts;


        if (AddressIdDoc !== undefined) {
            AddressIdDoc["type"] = "identificationDocument";
            AddressIdDoc["cardNumber"] = xcardNumber;
            await setAddressData(AddressIdDoc, function(x1) {
                console.log("setIdDocumentAddress:" + x1);
            });
        }

        if (AddressCurrent !== undefined) {
            AddressCurrent["type"] = "current";
            AddressCurrent["cardNumber"] = xcardNumber;
            await setAddressData(AddressCurrent, function(x2) {
                console.log("setCurrentAddress:" + x2);
            });
        }

        if (AddressWork !== undefined) {
            AddressWork["type"] = "work";
            AddressWork["cardNumber"] = xcardNumber;
            await setAddressData(AddressWork, function(x2) {
                console.log("setWorkAddress:" + x2);
            });
        }

        if (Suitability !== undefined) {
            Suitability["cardNumber"] = xcardNumber;
            await setSuitabilityData(Suitability, function(x3) {
                console.log("setSuitabilityData:" + xcardNumber + ": ") + x3;
            });
        }

        if (Accounts !== undefined) {
            let cCout = Accounts.length;
            if (cCout > 0) {
                for (let i = 0; i < cCout; i++) {
                    await setAccountsData(Accounts[i], function(x4) {
                        console.log("setAccountsData:" + Accounts[i].accountId + ":" + x4);
                    });

                    Banks[i] = setBankData(Accounts[i]);
                    if (Banks[i].length > 0) {
                        for (let k = 0; k < Banks[i].length; k++) {
                            await setBankAccountslData(Banks[i][k], function(x5) {
                                console.log("setBankAccountslData:" + Accounts[i].accountId + ":" + x5);
                            });

                        }
                    }

                }
            }

        }

        return callback("ok");
    } catch (error) {
        console.log(error);
        return callback(error);
    }
}


async function setIndividualData(data, callback) {

    try {
        //console.log("----setIndividualData:data---")
        //console.log(data) 
        var hasSpore = data.spouse;
        var sp_thFirstName = "";
        var sp_thLastName = "";
        var sp_enFirstName = ""; 
        var sp_enLastName = "";

        if (data.hasOwnProperty('spouse')) {
            sp_thFirstName = data.spouse.thFirstName;
            sp_thLastName = data.spouse.thLastName;
            sp_enFirstName = data.spouse.enFirstName;
            sp_enLastName = data.spouse.enLastName;
        }


        var statement = '';
        //await new sql.ConnectionPool(config).connect().then(pool => {


        await poolPromise.then(pool => {
                return pool.request()
                    .input('icardNumber', sql.VarChar, data.cardNumber)
                    .query(`SELECT cardNumber FROM Fund_Cen_Individual
            WHERE Fund_Cen_Individual.cardNumber = @icardNumber `)
            })
            .then(result => {
                if (result.rowsAffected >= 1) {
                    statement = updateFund_Cen_Individual;
                } else {
                    statement = insertFund_Cen_Individual;
                }
                //sql.close();
            }).catch(err => {
                console.log(err);
                //sql.close();
            });

        //await new sql.ConnectionPool(config).connect().then(pool => {
        await poolPromise.then(pool => {
            return pool.request()
                .input("idate", sql.DateTime, new Date())
                .input("icardNumber", sql.NVarChar, data.cardNumber)
                .input("iidentificationCardType", sql.NVarChar, data.identificationCardType)
                .input("icardExpiryDate", sql.NVarChar, data.cardExpiryDate)
                .input("iaccompanyingDocument", sql.NVarChar, data.accompanyingDocument)
                .input("ititle", sql.NVarChar, data.title)
                .input("ienFirstName", sql.NVarChar, data.enFirstName)
                .input("ienLastName", sql.NVarChar, data.enLastName)
                .input("ithFirstName", sql.NVarChar, data.thFirstName)
                .input("ithLastName", sql.NVarChar, data.thLastName)
                .input("ibirthDate", sql.NVarChar, data.birthDate)
                .input("inationality", sql.NVarChar, data.nationality)
                .input("imobileNumber", sql.NVarChar, data.mobileNumber)
                .input("iemail", sql.NVarChar, data.email)
                .input("ifax", sql.NVarChar, data.fax)
                .input("imaritalStatus", sql.NVarChar, data.maritalStatus)
                .input("isp_thFirstName", sql.NVarChar, sp_thFirstName)
                .input("isp_thLastName", sql.NVarChar, sp_thLastName)
                .input("isp_enFirstName", sql.NVarChar, sp_enFirstName)
                .input("isp_enLastName", sql.NVarChar, sp_enLastName)
                .input("ioccupationId", sql.Int, data.occupationId)
                .input("ioccupationOther", sql.NVarChar, data.occupationOther)
                .input("icompanyName", sql.NVarChar, data.companyName)
                .input("icurrentAddressSameAsFlag", sql.NVarChar, data.currentAddressSameAsFlag)
                .input("ibusinessTypeId", sql.Int, data.businessTypeId)
                .input("ibusinessTypeOther", sql.NVarChar, data.businessTypeOther)
                .input("imonthlyIncomeLevel", sql.NVarChar, data.monthlyIncomeLevel)
                .input("iassetValue", sql.Numeric(18, 2), data.assetValue)
                .input("iincomeSource", sql.NVarChar, data.incomeSource)
                .input("iincomeSourceOther", sql.NVarChar, data.incomeSourceOther)
                .input("iworkPosition", sql.NVarChar, data.workPosition)
                .input("irelatedPoliticalPerson", sql.Bit, data.relatedPoliticalPerson)
                .input("ipoliticalRelatedPersonPosition", sql.NVarChar, data.politicalRelatedPersonPosition)
                .input("icanAcceptFxRisk", sql.Bit, data.canAcceptFxRisk)
                .input("icanAcceptDerivativeInvestment", sql.Bit, data.canAcceptDerivativeInvestment)
                .input("isuitabilityRiskLevel", sql.NVarChar, data.suitabilityRiskLevel)
                .input("isuitabilityEvaluationDate", sql.NVarChar, data.suitabilityEvaluationDate)
                .input("ifatca", sql.Bit, data.fatca)
                .input("ifatcaDeclarationDate", sql.NVarChar, data.fatcaDeclarationDate)
                .input("icddScore", sql.NVarChar, data.cddScore)
                .input("icddDate", sql.NVarChar, data.cddDate)
                .input("ireferralPerson", sql.NVarChar, data.referralPerson)
                .input("iapplicationDate", sql.NVarChar, data.applicationDate)
                .input("iincomeSourceCountry", sql.NVarChar, data.incomeSourceCountry)
                .input("iacceptedBy", sql.NVarChar, data.acceptedBy)
                .input("iopenFundConnextFormFlag", sql.NVarChar, data.openFundConnextFormFlag)
                .input("iapprovedDate", sql.NVarChar, data.approvedDate)
                .input("iopenChannel", sql.NVarChar, data.openChannel)
                .input("iinvestorClass", sql.NVarChar, data.investorClass)
                .input("ivulnerableFlag", sql.Bit, data.vulnerableFlag)
                .input("ivulnerableDetail", sql.NVarChar, data.vulnerableDetail)
                .input("indidFlag", sql.Bit, data.ndidFlag)
                .input("indidRequestId", sql.NVarChar, data.ndidRequestId)
                .query(statement)
        }).then(result => {
            let respx = " Fund_Cen_Individual update:" + result.rowsAffected + " record(s)";
            //console.log(respx);
            //sql.close();           
            return callback(respx);

        }).catch(err => {
            console.log(err);
            //sql.close();
            return callback(err);
        });


    } catch (error) {
        console.log(error);
        return callback(error);
    }

}

function setBankData(jdata) {

    var subscription = jdata.subscriptionBankAccounts;
    var redemption = jdata.redemptionBankAccounts;
    var bankdata = [];
    var cSub = 0;
    var cRed = 0;
    try {
        if (subscription !== undefined) {
            cSub = subscription.length;
            if (cSub > 0) {
                for (let i = 0; i < cSub; i++) {
                    subscription[i].type = "SUB";
                    subscription[i].cardNumber = jdata.cardNumber;
                    subscription[i].accountId = jdata.accountId;
                    bankdata.push(subscription[i]);
                }
            }
        }

        if (redemption !== undefined) {
            cRed = redemption.length;
            if (cRed > 0) {
                for (let j = 0; j < cRed; j++) {
                    redemption[j].type = "RED";
                    redemption[j].cardNumber = jdata.cardNumber;
                    redemption[j].accountId = jdata.accountId;
                    redemption[j].finnetCustomerNo = "";
                    bankdata.push(redemption[j]);
                }
            }
        }
        //console.log("--chk bankdata");
        //console.log(bankdata);
        return bankdata;
    } catch (error) {
        console.log(error);
        return null;
    }

}


async function setBankAccountslData(jdata, callback) {

    try {

        //var statement  ='';
        //await sql.connect(config).then( pool => {
        await poolPromise.then(pool => {
            return pool.request()
                .input("icardNumber", sql.NVarChar, jdata.cardNumber)
                .input("iaccountId", sql.NVarChar, jdata.accountId)
                .input("itype", sql.NVarChar, jdata.type)
                .query(`DELETE from Fund_Cen_BankAccounts 
                WHERE Fund_Cen_BankAccounts.cardNumber = @icardNumber AND
                      Fund_Cen_BankAccounts.accountId = @iaccountId AND
                      Fund_Cen_BankAccounts.type = @itype  `)
        }).then(result => {
            //console.log(result);
            //sql.close();

        }).catch(err => {
            console.log(err);
            //sql.close();
        });

        //await sql.connect(config).then( pool => {
        //const pool = await poolPromise;
        await poolPromise.then(pool => {
            return pool.request()
                .input("icardNumber", sql.NVarChar, jdata.cardNumber)
                .input("iaccountId", sql.NVarChar, jdata.accountId)
                .input("ibankCode", sql.NVarChar, jdata.bankCode)
                .input("ibankBranchCode", sql.NVarChar, jdata.bankBranchCode)
                .input("ibankAccountNo", sql.NVarChar, jdata.bankAccountNo)
                .input("idefault", sql.Bit, jdata.default)
                .input("itype", sql.NVarChar, jdata.type)
                .input("ifinnetCustomerNo", sql.NVarChar, jdata.finnetCustomerNo)
                .query(insertFund_Cen_BankAccounts)

        }).then(result => {
            //console.log(result);
            //sql.close();
            return callback(result);

        }).catch(err => {
            console.log(err);
            //sql.close();
            return callback(err);
        });

    } catch (error) {
        console.log(error);
        return callback(error);
    }

}

async function setSuitabilityData(jdata, callback) {

    try {
        //var statement  ='';
        //await new sql.ConnectionPool(config).connect().then(pool => {
        await poolPromise.then(pool => {
                return pool.request()
                    .input("icardNumber", sql.NVarChar, jdata.cardNumber)
                    .query(`DELETE from Fund_Cen_Suitability 
                WHERE Fund_Cen_Suitability.cardNumber = @icardNumber `)
            })
            .then(result => {
                //console.log(result);
                //sql.close();

            }).catch(err => {
                console.log(err);
                //sql.close();

            });
        //await new sql.ConnectionPool(config).connect().then(pool => {
        //const pool = await poolPromise;
        await poolPromise.then(pool => {
            return pool.request()
                .input("icardNumber", sql.NVarChar, jdata.cardNumber)
                .input("isuitNo1", sql.NVarChar, jdata.suitNo1)
                .input("isuitNo2", sql.NVarChar, jdata.suitNo2)
                .input("isuitNo3", sql.NVarChar, jdata.suitNo3)
                .input("isuitNo4", sql.NVarChar, jdata.suitNo4)
                .input("isuitNo5", sql.NVarChar, jdata.suitNo5)
                .input("isuitNo6", sql.NVarChar, jdata.suitNo6)
                .input("isuitNo7", sql.NVarChar, jdata.suitNo7)
                .input("isuitNo8", sql.NVarChar, jdata.suitNo8)
                .input("isuitNo9", sql.NVarChar, jdata.suitNo9)
                .input("isuitNo10", sql.NVarChar, jdata.suitNo10)
                .input("isuitNo11", sql.NVarChar, jdata.suitNo11)
                .input("isuitNo12", sql.NVarChar, jdata.suitNo12)
                .query(insertFund_Cen_Suitibility)
        }).then(result => {
            //console.log(result);
            //sql.close();
            return callback(result);
        }).catch(err => {
            console.log(err);
            //sql.close();
            return callback(err);
        });

    } catch (error) {
        console.log(error);
        return callback(error);
    }

}

async function setAccountsData(jdata, callback) {

    try {
        //var statement  ='';
        //await new sql.ConnectionPool(config).connect().then(pool => {
        await poolPromise.then(pool => {
            return pool.request()
                .input("icardNumber", sql.NVarChar, jdata.cardNumber)
                .input("iaccountId", sql.NVarChar, jdata.accountId)
                .query(`DELETE from Fund_Cen_Accounts 
                WHERE Fund_Cen_Accounts.cardNumber = @icardNumber AND 
                      Fund_Cen_Accounts.accountId = @iaccountId `)
        }).then(result => {
            //console.log(result);
            //sql.close();
        }).catch(err => {
            console.log(err);
            //sql.close();
        });

        //await new sql.ConnectionPool(config).connect().then(pool => {
        //const pool = await poolPromise;
        await poolPromise.then(pool => {
            return pool.request()
                .input("icardNumber", sql.NVarChar, jdata.cardNumber)
                .input("iaccountId", sql.NVarChar, jdata.accountId)
                .input("iidentificationCardType", sql.NVarChar, jdata.identificationCardType)
                .input("iicLicense", sql.NVarChar, jdata.icLicense)
                .input("iaccountOpenDate", sql.NVarChar, jdata.accountOpenDate)
                .input("iinvestmentObjective", sql.NVarChar, jdata.investmentObjective)
                .input("iinvestmentObjectiveOther", sql.NVarChar, jdata.investmentObjective)
                .input("iapprovedDate", sql.NVarChar, jdata.approvedDate)
                .input("imailingAddressSameAsFlag", sql.NVarChar, jdata.mailingAddressSameAsFlag)
                .input("iopenOmnibusFormFlag", sql.Bit, jdata.openOmnibusFormFlag)
                .input("imailingMethod", sql.NVarChar, jdata.mailingMethod)
                .query(insertFund_Cen_Accounts)


        }).then(result => {
            //console.log(result);
            //sql.close();
            return callback(result);

        }).catch(err => {
            console.log(err);
            //sql.close();
            return callback(err);

        });

    } catch (error) {
        console.log(error);
        return callback(error);
    }

}

async function setAddressData(jdata, callback) {


    try {

        //await new sql.ConnectionPool(config).connect().then(pool => {
        await poolPromise.then(pool => {
            return pool.request()
                .input("icardNumber", sql.NVarChar, jdata.cardNumber)
                .input("iaddress_type", sql.NVarChar, jdata.type)
                .query(`DELETE from Fund_Cen_Address WHERE Fund_Cen_Address.cardNumber = @icardNumber 
                  AND Fund_Cen_Address.address_type = @iaddress_type `)
        }).then(result => {
            console.log(result);

        }).catch(err => {
            console.log(err);
        });

        //let data = await new sql.ConnectionPool(config).connect().then(pool => {

        //--- fix null data
        if (jdata.floor === null) {
            jdata.floor = "";
        }

        //await new sql.ConnectionPool(config).connect().then(pool => {
        //const pool = await poolPromise;
        await poolPromise.then(pool => {
            return pool.request()
                .input("idate", sql.DateTime, new Date())
                .input("icardNumber", sql.NVarChar, jdata.cardNumber)
                .input("iaddress_type", sql.NVarChar, jdata.type)
                .input("ino", sql.NVarChar, jdata.no)
                .input("ifloor", sql.NVarChar, jdata.floor)
                .input("ibuilding", sql.NVarChar, jdata.building)
                .input("iroomNo", sql.NVarChar, jdata.roomNo)
                .input("isoi", sql.NVarChar, jdata.soi)
                .input("iroad", sql.NVarChar, jdata.road)
                .input("imoo", sql.NVarChar, jdata.moo)
                .input("isubDistrict", sql.NVarChar, jdata.subDistrict)
                .input("idistrict", sql.NVarChar, jdata.district)
                .input("iprovince", sql.NVarChar, jdata.province)
                .input("ipostalCode", sql.NVarChar, jdata.postalCode)
                .input("icountry", sql.NVarChar, jdata.country)
                .query(insertFund_Cen_Address)

        }).then(result => {
            //console.log(result);
            //sql.close();
            return callback(result);
        }).catch(err => {
            console.log(err);
            //sql.close();
            return callback(err);
        });

    } catch (error) {
        console.log(error);
        return callback(error);
    }

}

async function readCsvtoArray(aFileInput, callback) {
    console.log("file" + aFileInput);
    try {
        fs.readFile(aFileInput, function(err, fileData) {
            parse(fileData, { columns: false, trim: true, delimiter: '|', from_line: 2 }, function(err, rows) {
                if (err) {
                    console.log("error: ", err);
                    return callback();
                }
                return callback(rows);
            });
        });

    } catch (error) {
        console.log(error);
        return callback(error);
    }


}

async function callImportQueryOrder(datajs, callback) {
    try {

        return callback("ok");
    } catch (error) {
        console.log(error);
        return callback(error);
    }
}

//------
async function callImportQueryOrder2(datajs, callback) {
    try {

        return callback("ok");
    } catch (error) {
        console.log(error);
        return callback(error);
    }
}


async function callImportJobs(jobName, aFileData, callback) {
    //console.log(jobName);
    console.log("FileData:->" + aFileData);
    let resultx = "";
    try {
        
        await readCsvtoArray(aFileData, function(rows) {
            //console.log('row :'+ rows)
            if (rows.length > 0) {
                
                switch (jobName) {
                    case "AllottedTransactions":
                        importAllottedTransactions(rows, function(x) {
                            resultx = x;
                        });
                        break;

                    case "FundMapping":
                        importFundMapping(rows, function(x) {
                            resultx = x;
                        })
                        break;

                    case "FundProfile":
                        importFundProfile(rows, function(x) {

                            resultx = x;
                        });
                        break;

                    case "Nav":
                        importFundNAV(rows, function(x) {
                            resultx = x;
                        })

                        break;

                    case "UnitholderBalance":
                        // importUnitholderBalance(rows, function(x) {
                        //     resultx = x;
                        // });
                        Report_Unitbalance_Daily(rows)
                        break;

                    case "FundHoliday":
                        importFundHoliday(rows, function(x) {
                            resultx = x;
                        });
                        break;
                    case "SwitchingMatrix":
                        importSwitchingMatrix(rows, function(x) {
                            resultx = x;
                        });
                        break;
                    case "OrderInquiry":
                        importOrderInquiry(rows, function(x) {
                            resultx = x;
                        });
                        break;
                    case "OrderInquiryCustom":
                        importcustomer(rows, function(x) {
                            resultx = x;
                        });
                        break;
                        //   importcustomer
                    case "TradeCalendar":
                        importTradeCalendar(rows, function(x) {
                            resultx = x;
                        });
                        break;

                    case "UnitholderMapping":

                        importUnitholderMapping(rows, function(x) {
                            resultx = x;
                        });
                        break;

                    case "BankAccountUnitholder":

                        importBankAccountUnitholder(rows, function(x) {
                            resultx = x;
                        });

                        break;
                    case "DividendTransactions":
                        importDividendTransactions(rows, function(x) {
                            resultx = x;
                        });
                        break;
                    case "DividendNews":
                        importDividendNews(rows, function(x) {
                            resultx = x;
                        });
                        break;
                    case "Fee":
                        importFee(rows, function(x) {
                            resultx = x;
                        });

                    case "CloneAllottedTransactions":
                        CloneAllottedTransactions(rows, function(x) {
                            resultx = x;
                        });
                        break;

                    default:
                        console.log("No Job name...");
                        break;

                }
            } else {
                resultx = "No data";
                console.log("No data");
                
            }
        });


        // console.log("Data x :" )
       
    } catch (error) {
        console.log(error);
       return callback(error);
    }
    
    return callback(resultx);
}

//-------------------------------------------------------------------------------------------------------
async function callImportJobs2(jobName, aFileData, callback) {
    //console.log(jobName);
    console.log("FileData:->" + aFileData);
    try {
        let resultx = "";
        // await readCsvtoArray(aFileData,function(rows){
        const rows = aFileData;
        if (rows.length > 0) {


            switch (jobName) {
                case "AllottedTransactions":
                    importAllottedTransactions(rows, function(x) {
                        resultx = x;
                    });
                    break;

                case "FundMapping":
                    importFundMapping(rows, function(x) {
                        resultx = x;
                    })
                    break;

                case "FundProfile":
                    importFundProfile(rows, function(x) {

                        resultx = x;
                    });
                    break;

                case "Nav":
                    importFundNAV(rows, function(x) {
                        resultx = x;
                    })

                    break;

                case "UnitholderBalance":
                    importUnitholderBalance(rows, function(x) {
                        resultx = x;
                    });
                    break;

                case "FundHoliday":
                    importFundHoliday(rows, function(x) {
                        resultx = x;
                    });
                    break;
                case "SwitchingMatrix":
                    importSwitchingMatrix(rows, function(x) {
                        resultx = x;
                    });
                    break;
                case "OrderInquiry":
                    importOrderInquiry(rows, function(x) {
                        resultx = x;
                    });
                    break;
                case "OrderInquiryCustom":
                    importcustomer(rows, function(x) {
                        resultx = x;
                    });
                    break;
                    //   importcustomer
                case "TradeCalendar":
                    importTradeCalendar(rows, function(x) {
                        resultx = x;
                    });
                    break;

                case "UnitholderMapping":

                    importUnitholderMapping(rows, function(x) {
                        resultx = x;
                    });
                    break;

                case "BankAccountUnitholder":

                    importBankAccountUnitholder(rows, function(x) {
                        resultx = x;
                    });

                    break;


                case "DividendNewsX":
                    importDividendNews(rows, function(x) {
                        resultx = x;
                    });
                case "Fee":
                    importFee(rows, function(x) {
                        resultx = x;
                    });



                default:
                    console.log("No Job name...");
                    break;

            }
        } else {
            resultx = "No data";
            console.log("No data");
        }
        // });



        return callback(resultx);
    } catch (error) {
        console.log(error);
        return callback(error);
    }
}

async function importOrderInquiry(datarows, callback) {
    // console.dir(datarows);
    try {
        let table = new sql.Table('Fund_Cen_OrderInquiry');
     
        // table.columns.add('transactionId', sql.VarChar(17), { nullable: true });
        // table.columns.add('saOrderReferenceNo', sql.VarChar(30), { nullable: true });
        // table.columns.add('orderType', sql.VarChar(3), { nullable: true });
        // table.columns.add('accountId', sql.VarChar(15), { nullable: true });
        // table.columns.add('unitholderId', sql.VarChar(15), { nullable: true });
        // table.columns.add('fundCode', sql.VarChar(30), { nullable: true });
        // table.columns.add('redemptionType', sql.VarChar(4), { nullable: true }); // dynamic column
        // table.columns.add('unit', sql.VarChar(20), { nullable: true });
        // table.columns.add('amount', sql.VarChar(20), { nullable: true });
        // table.columns.add('statusx', sql.VarChar(10), { nullable: true });
        // // table.columns.add('transactionDateTime', sql.VarChar(14), { nullable: true });
        // table.columns.add('transactionLastUpdated', sql.VarChar(14), { nullable: true });
        // table.columns.add('effectiveDate', sql.VarChar(8), { nullable: true });
        // table.columns.add('settlementDate', sql.VarChar(8), { nullable: true });
        // table.columns.add('amcOrderReferenceNo', sql.VarChar(30), { nullable: true });
        // table.columns.add('allottedUnit', sql.VarChar(20), { nullable: true });
        // table.columns.add('allottedAmount', sql.VarChar(20), { nullable: true });
        // table.columns.add('allottedNAV', sql.VarChar(20), { nullable: true });
        // table.columns.add('fee', sql.VarChar(20), { nullable: true });
        // table.columns.add('sellAllUnitFlag', sql.VarChar(1), { nullable: true });
        // table.columns.add('allotmentDate', sql.VarChar(20), { nullable: true });
        // table.columns.add('paymentType', sql.VarChar(8), { nullable: true });
        // table.columns.add('bankCode', sql.VarChar(4), { nullable: true });
        // table.columns.add('bankAccount', sql.VarChar(20), { nullable: true });
        // table.columns.add('crcApprovalCode', sql.VarChar(20), { nullable: true });
        // table.columns.add('channel', sql.VarChar(10), { nullable: true });
        // table.columns.add('icLicense', sql.VarChar(10), { nullable: true });
        // table.columns.add('branchNo', sql.VarChar(5), { nullable: true });
        // table.columns.add('forceEntry', sql.VarChar(1), { nullable: true });
        // table.columns.add('settlementBankCode', sql.VarChar(4), { nullable: true });
        // table.columns.add('settlementBankAccount', sql.VarChar(20), { nullable: true });
        // table.columns.add('rejectReason', sql.VarChar(50), { nullable: true });
        // table.columns.add('navDate', sql.VarChar(10), { nullable: true });
        // table.columns.add('collateralAccount ', sql.VarChar(20), { nullable: true });
        // table.columns.add('accountType', sql.VarChar(6), { nullable: true });
        // table.columns.add('recurringOrderId', sql.VarChar(20), { nullable: true });
        // table.columns.add('saRecurringOrderRefNo', sql.VarChar(30), { nullable: true });


        //table.columns.add('paymentStatus', sql.VarChar(10) , {nullable: true});
        //table.columns.add('paymentProcessingType', sql.VarChar(1) , {nullable: true});
        //table.columns.add('chqBranch', sql.VarChar(5) , {nullable: true});


        //datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));
        // if(datarows.toString().length > 0) {
        //     datarows.forEach(async(data) => {
        //         table.rows.add.apply(table.rows, await jdatatoArray(data));
        //     });

        // }else{
        //     return callback(" Not Data to Import")
        // }



        // let pool = await sql.connect(config);
        // pool.request().bulk(table, function(err, result) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(result);
        //         console.log("Number of records inserted to Fund_Cen_OrderInquiry :" + result.rowsAffected);

        //     }

        //     pool.close();
        //     sql.close();
        // });
        

        for (let index = 0; index < datarows.length; index++) {
            // const element = array[index];
            // console.log(datarows[index].transactionId)
            let transactionId               = datarows[index].transactionId ;           transactionId       = (transactionId === undefined)? null : transactionId ;
            let saOrderReferenceNo          = datarows[index].saOrderReferenceNo;       saOrderReferenceNo = (saOrderReferenceNo === undefined)? null : saOrderReferenceNo ; 
            let orderType                   = datarows[index].orderType;                orderType       = (orderType === undefined)? null : orderType ;
            let accountId                   = datarows[index].accountId;                accountId       = (accountId === undefined)? null : accountId ;
            let unitholderId                = datarows[index].unitholderId;             unitholderId       = (unitholderId === undefined)? null : unitholderId ;
            let fundCode                    = datarows[index].fundCode;                 fundCode       = (fundCode === undefined)? null : fundCode ;
            let redemptionType              = datarows[index].redemptionType;           redemptionType       = (redemptionType === undefined)? null : redemptionType ;
            let unit                        = datarows[index].unit;                     unit       = (unit === undefined)? null : unit ;
            let amount                      = datarows[index].amount;                   amount       = (amount === undefined)? null : amount ;
            let sellAllUnitFlag             = datarows[index].sellAllUnitFlag;          sellAllUnitFlag       = (sellAllUnitFlag === undefined)? null : sellAllUnitFlag ;
            let statusx                     = datarows[index].status;                   statusx       = (statusx === undefined)? null : statusx ;
            let transactionDateTime         = datarows[index].transactionDateTime;      transactionDateTime       = (transactionDateTime === undefined)? null : transactionDateTime ;
            let effectiveDate               = datarows[index].effectiveDate;            effectiveDate       = (effectiveDate === undefined)? null : effectiveDate ;
            let settlementDate              = datarows[index].settlementDate;           settlementDate       = (settlementDate === undefined)? null : settlementDate ;
            let amcOrderReferenceNo         = datarows[index].amcOrderReferenceNo;      amcOrderReferenceNo       = (amcOrderReferenceNo === undefined)? null : amcOrderReferenceNo ;
            let allottedUnit                = datarows[index].allottedUnit;             allottedUnit       = (allottedUnit === undefined)? null : allottedUnit ;
            let allottedAmount              = datarows[index].allottedAmount;           allottedAmount       = (allottedAmount === undefined)? null : allottedAmount ;
            let allottedNAV                 = datarows[index].allottedNAV;              allottedNAV       = (allottedNAV === undefined)? null : allottedNAV ;
            let allotmentDate               = datarows[index].allotmentDate;            allotmentDate       = (allotmentDate === undefined)? null : allotmentDate ;
            let fee                         = datarows[index].fee;                      fee       = (fee === undefined)? null : fee ;
            let transactionLastUpdated      = datarows[index].transactionLastUpdated;   transactionLastUpdated       = (transactionLastUpdated === undefined)? null : transactionLastUpdated ;
            let paymentType                 = datarows[index].paymentType;              paymentType       = (paymentType === undefined)? null : paymentType ;
            let bankCode                    = datarows[index].bankCode;                 bankCode       = (bankCode === undefined)? null : bankCode ;
            let bankAccount                 = datarows[index].bankAccount;              bankAccount       = (bankAccount === undefined)? null : bankAccount ;
            let channel                     = datarows[index].channel;                  channel       = (channel === undefined)? null : channel ;
            let icLicense                   = datarows[index].icLicense;                icLicense       = (icLicense === undefined)? null : icLicense ;
            let branchNo                    = datarows[index].branchNo;                 branchNo       = (branchNo === undefined)? null : branchNo ;
            let forceEntry                  = datarows[index].forceEntry;               forceEntry       = (forceEntry === undefined)? null : forceEntry ;
            let settlementBankCode          = datarows[index].settlementBankCode;       settlementBankCode       = (settlementBankCode === undefined)? null : settlementBankCode ;
            let settlementBankAccount       = datarows[index].settlementBankAccount;    settlementBankAccount       = (settlementBankAccount === undefined)? null : settlementBankAccount ;
            let chqBranch                   = datarows[index].chqBranch;                chqBranch       = (chqBranch === undefined)? null : chqBranch ;
            let rejectReason                = datarows[index].rejectReason;             rejectReason       = (rejectReason === undefined)? null : rejectReason ;
            let navDate                     = datarows[index].navDate;                  navDate       = (navDate === undefined)? null : navDate ;
            let collateralAccount           = datarows[index].collateralAccount;        collateralAccount       = (collateralAccount === undefined)? null : collateralAccount ;
            let accountType                 = datarows[index].accountType;              accountType       = (accountType === undefined)? null : accountType ;
            let recurringOrderId            = datarows[index].recurringOrderId;         recurringOrderId       = (recurringOrderId === undefined)? null : recurringOrderId ;
            let saRecurringOrderRefNo       = datarows[index].saRecurringOrderRefNo;    saRecurringOrderRefNo       = (saRecurringOrderRefNo === undefined)? null : saRecurringOrderRefNo ;
            let crcApprovalCode             = datarows[index].crcApprovalCode;          crcApprovalCode       = (crcApprovalCode === undefined)? null : crcApprovalCode ;
            // let pointCode                   = datarows[index].pointCode
            // let xwtReferenceNo              = datarows[index].xwtReferenceNo
            // let counterUnitholderId         = datarows[index].counterUnitholderId
            // let counterFundCode             = datarows[index].counterFundCode 
            let paymentProcessingType       = null
            let paymentStatus               = null




            let statement = `INSERT INTO Fund_Cen_OrderInquiry(  transactionId, saOrderReferenceNo, transactionDateTime, orderType, accountId, unitholderId, fundCode, redemptionType, amount, unit, sellAllUnitFlag, statusx, 
                                    effectiveDate, settlementDate, amcOrderReferenceNo, allottedAmount, allottedUnit, allottedNAV, allotmentDate, fee, transactionLastUpdated, paymentType, bankCode, bankAccount, channel, 
                                    icLicense, branchNo, forceEntry, settlementBankCode, settlementBankAccount, chqBranch, rejectReason, navDate, collateralAccount, accountType, recurringOrderId, paymentStatus, 
                                    paymentProcessingType, saRecurringOrderRefNo, crcApprovalCode)
                            VALUES     (@transactionId, @saOrderReferenceNo, @transactionDateTime, @orderType, @accountId, @unitholderId, @fundCode, @redemptionType, @amount, @unit, @sellAllUnitFlag, @statusx, 
                                    @effectiveDate, @settlementDate, @amcOrderReferenceNo, @allottedAmount, @allottedUnit, @allottedNAV, @allotmentDate, @fee, @transactionLastUpdated, @paymentType, @bankCode, @bankAccount, @channel, 
                                    @icLicense, @branchNo, @forceEntry, @settlementBankCode, @settlementBankAccount, @chqBranch, @rejectReason, @navDate, @collateralAccount, @accountType, @recurringOrderId, @paymentStatus, 
                                    @paymentProcessingType, @saRecurringOrderRefNo, @crcApprovalCode)`
            await poolPromise.then(pool => {
                return pool.request()
                    .input("transactionId",         sql.NVarChar(17),           transactionId)
                    .input("saOrderReferenceNo",    sql.NVarChar(30),           saOrderReferenceNo)
                    .input("transactionDateTime",   sql.NVarChar(14),           transactionDateTime)
                    .input("orderType",             sql.NVarChar(3),           orderType)
                    .input("accountId",             sql.NVarChar(15),           accountId)
                    .input("unitholderId",          sql.NVarChar(15),                unitholderId)
                    .input("fundCode",              sql.NVarChar(30),           fundCode)
                    .input("redemptionType",        sql.NVarChar(4),           redemptionType)
                    .input("amount",                sql.NVarChar(20),           amount)
                    .input("unit",                  sql.NVarChar(20),           unit)
                    .input("sellAllUnitFlag",       sql.NVarChar(1),           sellAllUnitFlag)
                    .input("statusx",               sql.NVarChar(10),           statusx)
                    .input("effectiveDate",         sql.NVarChar(8),           effectiveDate)
                    .input("settlementDate",        sql.NVarChar(8),           settlementDate)
                    .input("amcOrderReferenceNo",   sql.NVarChar(30),           amcOrderReferenceNo)
                    .input("allottedAmount",        sql.NVarChar(20),           allottedAmount)
                    .input("allottedUnit",          sql.NVarChar(20),           allottedUnit)
                    .input("allottedNAV",           sql.NVarChar(20),           allottedNAV)
                    .input("allotmentDate",         sql.NVarChar(8),           allotmentDate)
                    .input("fee",                   sql.NVarChar(20),           fee)
                    .input("transactionLastUpdated",    sql.NVarChar(14),       transactionLastUpdated)
                    .input("paymentType",           sql.NVarChar(8),           paymentType)
                    .input("bankCode",              sql.NVarChar(4),           bankCode)
                    .input("bankAccount",           sql.NVarChar(20),           bankAccount)
                    .input("channel",               sql.NVarChar(3),           channel)
                    .input("icLicense",             sql.NVarChar(10),           icLicense)
                    .input("branchNo",              sql.NVarChar(5),           branchNo)
                    .input("forceEntry",            sql.NVarChar(1),           forceEntry)
                    .input("settlementBankCode",    sql.NVarChar(4),           settlementBankCode)
                    .input("settlementBankAccount", sql.NVarChar(20),           settlementBankAccount)
                    .input("chqBranch",             sql.NVarChar(5),            chqBranch)
                    .input("rejectReason",          sql.NVarChar(50),           rejectReason)
                    .input("navDate",               sql.NVarChar(10),           navDate)
                    .input("collateralAccount",     sql.NVarChar(20),           collateralAccount)
                    .input("accountType",           sql.NVarChar(6),            accountType)
                    .input("recurringOrderId",      sql.NVarChar(20),           recurringOrderId) 
                    .input("paymentStatus",         sql.NVarChar(10),           paymentStatus)
                    .input("paymentProcessingType", sql.NVarChar(1),            paymentProcessingType)
                    .input("saRecurringOrderRefNo", sql.NVarChar(30),           saRecurringOrderRefNo)
                    .input("crcApprovalCode",       sql.NVarChar(20),           crcApprovalCode) 
                    .query(statement)
                    commit()
            }).then(result => {
                //  console.log(result);
                let row  =result.rowsAffected
                if(row > 0){console.log("Number of records inserted to Fund_Cen_OrderInquiry :" + result.rowsAffected);}
                
                sql.close();
               // return callback(result);
    
            }).catch(err => {
                console.log(err);
                sql.close();
               // return callback(err);
            });

        }

        return callback("Import data to OrderInquiry is completed.");

    } catch (error) {
        console.log(error);
        return callback(error);
    }


}
///-----------------------------------------------------------------------------------------------------------import Customer
async function importCenCustomer(datarows, callback) {
    //console.dir(datarows);
    try {
        let table = new sql.Table('Fund_cen_Customer');

        table.columns.add('cardNumber', sql.VarChar(13), { nullable: true });
        // table.columns.add('passportCountry', sql.VarChar(2) , {nullable: true});
        table.columns.add('identificationCardType', sql.VarChar(15), { nullable: true });
        table.columns.add('cardExpiryDate', sql.VarChar(8), { nullable: true });
        table.columns.add('accompanyingDocument', sql.VarChar(15), { nullable: true });
        table.columns.add('title', sql.VarChar(5), { nullable: true });
        // table.columns.add('titleOther', sql.VarChar(50) , {nullable: true});                 // dynamic column
        table.columns.add('enFirstName', sql.NVarChar(100), { nullable: true });
        table.columns.add('enLastName', sql.NVarChar(100), { nullable: true });
        table.columns.add('thFirstName', sql.NVarChar(100), { nullable: true }); //
        table.columns.add('thLastName', sql.NVarChar(100), { nullable: true });
        table.columns.add('birthDate', sql.VarChar(8), { nullable: true });
        table.columns.add('nationality', sql.VarChar(2), { nullable: true });
        table.columns.add('mobileNumber', sql.VarChar(10), { nullable: true });
        table.columns.add('email', sql.VarChar(100), { nullable: true });
        // table.columns.add('phone', sql.VarChar(20) , {nullable: true});
        // table.columns.add('fax', sql.VarChar(20) , {nullable: true});
        table.columns.add('maritalStatus', sql.VarChar(10), { nullable: true });
        table.columns.add('occupationId', sql.VarChar(10), { nullable: true });
        table.columns.add('occupationOther', sql.NVarChar(50), { nullable: true });
        table.columns.add('businessTypeId', sql.VarChar(10), { nullable: true });
        table.columns.add('businessTypeOther', sql.NVarChar(100), { nullable: true });
        table.columns.add('monthlyIncomeLevel', sql.VarChar(6), { nullable: true });
        table.columns.add('assetValue', sql.VarChar(20), { nullable: true });
        table.columns.add('incomeSource', sql.NVarChar(100), { nullable: true });
        table.columns.add('address_doc', sql.NVarChar(250), { nullable: true });
        table.columns.add('address_current', sql.NVarChar(250), { nullable: true });
        table.columns.add('address_work', sql.NVarChar(250), { nullable: true });
        // table.columns.add('investorType', sql.NVarChar(10), { nullable: true });
        // table.columns.add('suitabilityForm', sql.NVarChar(250), { nullable: true });
    //     table.columns.add('Spouse', sql.NVarChar(100), { nullable: true });
    //     table.columns.add('companyName', sql.NVarChar(250), { nullable: true });
    //    //------23052022///
    //     table.columns.add('currentAddressSameAsFlag', sql.NVarChar(50), { nullable: true });
    //     table.columns.add('workPosition', sql.NVarChar(100), { nullable: true });
    //     table.columns.add('relatedPoliticalPerson', sql.NVarChar(10), { nullable: true });
    //     table.columns.add('politicalRelatedPersonPosition', sql.NVarChar(100), { nullable: true });
    //     table.columns.add('canAcceptFxRisk', sql.NVarChar(10), { nullable: true });
    //     table.columns.add('canAcceptDerivativeInvestment', sql.NVarChar(10), { nullable: true });
    //     table.columns.add('suitabilityRiskLevel', sql.NVarChar(2), { nullable: true });
    //     table.columns.add('suitabilityEvaluationDate', sql.NVarChar(8), { nullable: true });
        // table.columns.add('fatca', sql.NVarChar(8), { nullable: true });
        // table.columns.add('fatcaDeclarationDate', sql.NVarChar(8), { nullable: true });
        // table.columns.add('cddScore', sql.NVarChar(20), { nullable: true });
        // table.columns.add('cddDate', sql.NVarChar(8), { nullable: true });
        // table.columns.add('referralPerson', sql.NVarChar(20), { nullable: true });
        // table.columns.add('applicationDate', sql.NVarChar(8), { nullable: true });
        // table.columns.add('incomeSourceCountry', sql.NVarChar(3), { nullable: true });
        // table.columns.add('acceptedBy', sql.NVarChar(50), { nullable: true });
        // table.columns.add('openFundConnextFormFlag', sql.NVarChar(3), { nullable: true });
        // table.columns.add('approvedDate', sql.VarChar(8), { nullable: true });
        // table.columns.add('openChannel', sql.VarChar(2), { nullable: true });
        // table.columns.add('investorClass', sql.VarChar(2), { nullable: true });
        // table.columns.add('vulnerableFlag', sql.VarChar(10), { nullable: true });
        // table.columns.add('vulnerableDetail', sql.VarChar(100), { nullable: true });
        // table.columns.add('ndidFlag', sql.VarChar(10), { nullable: true }); 
       
        // ภาษาไทย ใช้ sql.Nvarchar(100)
        // Keep LookUP to Example
        // a two-dimensional array
        // var myArray = [[3760500954079,22,"CITIZEN_CARD",20220519,"XXXXX"]];
        let iaccompanyingDocument   = JSON.stringify(datarows.identificationDocument);
        let work                    = JSON.stringify(datarows.work);
        let current                 = JSON.stringify(datarows.current);
        let suitabilityForms        = JSON.stringify(datarows.suitabilityForm);
        let spouses                 = JSON.stringify(datarows.spouse);
        console.log(iaccompanyingDocument)
        // var Address_work1 = JSON.parse(work); //Not Double quotes
         
        let Address_doc         = await getArraytotext(iaccompanyingDocument);
        let Address_work        = await getArraytotext(work);
        let Address_curent      = await getArraytotext(current);
        let suitabilityForm     = await getArraytotext(suitabilityForms);
        let Spouse              = ""
        if (spouses !== undefined){ await getArraytotext(spouses)}
       
        //  var Address_doc1 = JSON.parse(Address_doc); //Not Double quotes 
        let datacus = [
            [datarows.cardNumber,
                datarows.identificationCardType,
                datarows.cardExpiryDate,
                datarows.accompanyingDocument,
                datarows.title,
                datarows.enFirstName,
                datarows.enLastName,
                datarows.thFirstName,
                datarows.thLastName,
                datarows.birthDate,
                datarows.nationality,
                datarows.mobileNumber,
                datarows.email,
                datarows.maritalStatus,
                datarows.occupationId,
                datarows.occupationOther,
                datarows.businessTypeId,
                datarows.businessTypeOther,
                datarows.monthlyIncomeLevel,
                datarows.assetValue,
                datarows.incomeSource,
                Address_doc,
                Address_curent,
                Address_work
                // datarows.investorType,
                // suitabilityForm
                // datarows.companyName,
                // datarows.currentAddressSameAsFlag,
                // datarows.workPosition,
                // datarows.relatedPoliticalPerson,
                // datarows.politicalRelatedPersonPosition,
                // datarows.canAcceptFxRisk,
                // datarows.canAcceptDerivativeInvestment,
                // datarows.suitabilityRiskLevel,
                // datarows.suitabilityEvaluationDate,
                // datarows.fatca,
                // datarows.fatcaDeclarationDate,
                // datarows.cddScore,
                // datarows.cddDate ,
                // datarows.referralPerson ,
                // datarows.applicationDate ,
                // datarows.incomeSourceCountry ,
                // datarows.acceptedBy, 
                // datarows.openFundConnextFormFlag ,
                // datarows.approvedDate ,
                // datarows.openChannel ,
                // datarows.investorClass ,
                // datarows.vulnerableFlag ,
                // datarows.vulnerableDetail ,
                // datarows.ndidFlag
            ]
        ];

        datacus.forEach(async(data) => {
            table.rows.add.apply(table.rows, await jdatatoArray3(data));
        });

        //-----------------INSERT INTO Fund_Cen_Address 20052022
        let cardNum = JSON.stringify(datarows.cardNumber)
        
        await  importCenAddress_N(cardNum, "doc", iaccompanyingDocument)
        await  importCenAddress_N(cardNum, "current", current)
        await  importCenAddress_N(cardNum, "work", work)
        // setTimeout(() => {  if (typeof(datarows.identificationCardType)) {  importCenAddress(cardNum, "doc", iaccompanyingDocument) }   }, 1500);
        // setTimeout(() => {  if (typeof(datarows.current)) {  importCenAddress(cardNum, "current", current)}                             }, 1500);
        // setTimeout(() => {  if (typeof(datarows.work)) {  importCenAddress(cardNum, "work", work) }                                     }, 1500);
       
        //-----------------INSERT INTO Fund_Cen_BankAccounts 23052022
        let json = datarows.accounts
        let sub_bankcodex ,  sub_bankbranchcodex , sub_bankAccountNox,carnum,accId
        //sub
        json.forEach(function(obj) { 
            // console.log(obj.cardNumber +"   " +obj.accountId); 
            obj.subscriptionBankAccounts.forEach(function(x) {
                sub_bankcodex        = x.bankCode
                sub_bankbranchcodex  = x.bankBranchCode
                sub_bankAccountNox   = x.bankAccountNo} );

            carnum = obj.cardNumber
            accId = obj.accountId   
        });
        // setTimeout(() => { if(typeof(obj)){  importCenBank(carnum,accId,"SUB",sub_bankcodex,sub_bankbranchcodex,sub_bankAccountNox)}  }, 1500);  

        let red_bankcodex ,  red_bankbranchcodex , red_bankAccountNox
        json.forEach(function(obj) { 
            // console.log(obj.subscriptionBankAccounts); 
            obj.redemptionBankAccounts.forEach(function(x) {
                red_bankcodex        = x.bankCode
                red_bankbranchcodex  = x.bankBranchCode
                red_bankAccountNox   = x.bankAccountNo} );
            carnum = obj.cardNumber
            accId = obj.accountId         
        });
        // setTimeout(() => { if(typeof(obj)){  importCenBank(carnum,accId,"RED",red_bankcodex,red_bankbranchcodex,red_bankAccountNox)}  }, 1500);  

        //------------------- INSERT INTO Fund_Cen_Suitability
        // setTimeout(() => { if(typeof(obj)){  importSuitability(carnum,datarows.suitabilityForm)}  }, 1500); 
        await importSuitability_N(carnum,datarows.suitabilityForm)
        //********************INSERT INTO FUNCD_CEN_ACCOUNT */
        // setTimeout(() => { if(typeof(obj)){  importAccount(carnum,datarows.accounts)}  }, 1500); 
        await importAccount(carnum,datarows.accounts)
        let pool = await sql.connect(config);
        await pool.request().query(`DELETE FROM Fund_cen_Customer WHERE cardNumber = '${datarows.cardNumber}' `);
        pool.request().bulk(table, function(err, result) {
            if (err) {
               console.log(cardNum)
                console.log(err);
                pool.close();
                sql.close(); 
                // setTimeout(function () {
                //     loginsertapi("Fund_cen_Customer",cardNum)
                // }, 5000);
               
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);
                pool.close();
                sql.close();

            }

            // pool.close();
            // sql.close();
        });
        return callback("Import data to Customer is completed.");


    } catch (error) {
        //console.log(" id card no not insert : " +cardNum)
        console.log(error);
        return callback(error);
    }


}

async function importCenCustomerId(datarows, callback) {
    //console.dir(datarows);
    try {
        let table = new sql.Table('Fund_cen_Customer');

        table.columns.add('cardNumber', sql.VarChar(13), { nullable: true });
        // table.columns.add('passportCountry', sql.VarChar(2) , {nullable: true});
        table.columns.add('identificationCardType', sql.VarChar(15), { nullable: true });
        table.columns.add('cardExpiryDate', sql.VarChar(8), { nullable: true });
        table.columns.add('accompanyingDocument', sql.VarChar(15), { nullable: true });
        table.columns.add('title', sql.VarChar(5), { nullable: true });
        // table.columns.add('titleOther', sql.VarChar(50) , {nullable: true});                 // dynamic column
        table.columns.add('enFirstName', sql.NVarChar(100), { nullable: true });
        table.columns.add('enLastName', sql.NVarChar(100), { nullable: true });
        table.columns.add('thFirstName', sql.NVarChar(100), { nullable: true }); //
        table.columns.add('thLastName', sql.NVarChar(100), { nullable: true });
        table.columns.add('birthDate', sql.VarChar(8), { nullable: true });
        table.columns.add('nationality', sql.VarChar(2), { nullable: true });
        table.columns.add('mobileNumber', sql.VarChar(10), { nullable: true });
        table.columns.add('email', sql.VarChar(100), { nullable: true });
        // table.columns.add('phone', sql.VarChar(20) , {nullable: true});
        // table.columns.add('fax', sql.VarChar(20) , {nullable: true});
        table.columns.add('maritalStatus', sql.VarChar(10), { nullable: true });
        table.columns.add('occupationId', sql.VarChar(10), { nullable: true });
        table.columns.add('occupationOther', sql.NVarChar(50), { nullable: true });
        table.columns.add('businessTypeId', sql.VarChar(10), { nullable: true });
        table.columns.add('businessTypeOther', sql.NVarChar(100), { nullable: true });
        table.columns.add('monthlyIncomeLevel', sql.VarChar(6), { nullable: true });
        table.columns.add('assetValue', sql.VarChar(20), { nullable: true });
        table.columns.add('incomeSource', sql.NVarChar(100), { nullable: true });
        table.columns.add('address_doc', sql.NVarChar(250), { nullable: true });
        table.columns.add('address_current', sql.NVarChar(250), { nullable: true });
        table.columns.add('address_work', sql.NVarChar(250), { nullable: true });
        table.columns.add('investorType', sql.NVarChar(10), { nullable: true });
       table.columns.add('suitabilityForm', sql.NVarChar(250), { nullable: true });
       table.columns.add('Spouse', sql.NVarChar(100), { nullable: true });
        table.columns.add('companyName', sql.NVarChar(250), { nullable: true });
       //------23052022///
        table.columns.add('currentAddressSameAsFlag', sql.NVarChar(50), { nullable: true });
        table.columns.add('workPosition', sql.NVarChar(100), { nullable: true });
        table.columns.add('relatedPoliticalPerson', sql.NVarChar(10), { nullable: true });
        table.columns.add('politicalRelatedPersonPosition', sql.NVarChar(100), { nullable: true });
        table.columns.add('canAcceptFxRisk', sql.NVarChar(10), { nullable: true });
        table.columns.add('canAcceptDerivativeInvestment', sql.NVarChar(10), { nullable: true });
        table.columns.add('suitabilityRiskLevel', sql.NVarChar(2), { nullable: true });
        table.columns.add('suitabilityEvaluationDate', sql.NVarChar(8), { nullable: true });
        table.columns.add('fatca', sql.NVarChar(8), { nullable: true });
        table.columns.add('fatcaDeclarationDate', sql.NVarChar(8), { nullable: true });
        table.columns.add('cddScore', sql.NVarChar(20), { nullable: true });
        table.columns.add('cddDate', sql.NVarChar(8), { nullable: true });
        table.columns.add('referralPerson', sql.NVarChar(20), { nullable: true });
        table.columns.add('applicationDate', sql.NVarChar(8), { nullable: true });
        table.columns.add('incomeSourceCountry', sql.NVarChar(3), { nullable: true });
        table.columns.add('acceptedBy', sql.NVarChar(50), { nullable: true });
        table.columns.add('openFundConnextFormFlag', sql.NVarChar(3), { nullable: true });
        table.columns.add('approvedDate', sql.VarChar(8), { nullable: true });
        table.columns.add('openChannel', sql.VarChar(2), { nullable: true });
        table.columns.add('investorClass', sql.VarChar(2), { nullable: true });
        table.columns.add('vulnerableFlag', sql.VarChar(10), { nullable: true });
        table.columns.add('vulnerableDetail', sql.VarChar(100), { nullable: true });
        table.columns.add('ndidFlag', sql.VarChar(10), { nullable: true }); 
       
        // ภาษาไทย ใช้ sql.Nvarchar(100)
        // Keep LookUP to Example
        // a two-dimensional array
        // var myArray = [[3760500954079,22,"CITIZEN_CARD",20220519,"XXXXX"]];
        let iaccompanyingDocument   = JSON.stringify(datarows.identificationDocument);
        let work                    = JSON.stringify(datarows.work);
        let current                 = JSON.stringify(datarows.current);
        let suitabilityForms        = JSON.stringify(datarows.suitabilityForm);
        let spouses                 = JSON.stringify(datarows.spouse);
        // var Address_work1 = JSON.parse(work); //Not Double quotes
        let Address_doc   = ''      
        if(iaccompanyingDocument !== undefined || iaccompanyingDocument !== null){
            Address_doc         = await getArraytotext(iaccompanyingDocument);
            // console.log(Address_doc)
        }
        let Address_work    = ''    
        if(work !== undefined || work !== null){
            Address_work        = await getArraytotext(work);
        }
        
        let Address_curent   = ''  // = await getArraytotext(current);
        if(current !== undefined || current !== null){
            Address_curent        = await getArraytotext(current);
        }
        let suitabilityForm     = await getArraytotext(suitabilityForms);
        let Spouse     = ''          
        if (spouses !== undefined ){
             console.log('spouses ' +spouses)
             Spouse =  await getArraytotext(spouses)
        }
         
        //  var Address_doc1 = JSON.parse(Address_doc); //Not Double quotes 
        let datacus = [
            [datarows.cardNumber,
                datarows.identificationCardType,
                datarows.cardExpiryDate,
                datarows.accompanyingDocument,
                datarows.title,
                datarows.enFirstName,
                datarows.enLastName,
                datarows.thFirstName,
                datarows.thLastName,
                datarows.birthDate,
                datarows.nationality,
                datarows.mobileNumber,
                datarows.email,
                datarows.maritalStatus,
                datarows.occupationId,
                datarows.occupationOther,
                datarows.businessTypeId,
                datarows.businessTypeOther,
                datarows.monthlyIncomeLevel,
                datarows.assetValue,
                datarows.incomeSource,
                Address_doc,
                Address_curent,
                Address_work,
                datarows.investorType,
                suitabilityForm,
                Spouse,
                datarows.companyName,
                datarows.currentAddressSameAsFlag,
                datarows.workPosition,
                datarows.relatedPoliticalPerson,
                datarows.politicalRelatedPersonPosition,
                datarows.canAcceptFxRisk,
                datarows.canAcceptDerivativeInvestment,
                datarows.suitabilityRiskLevel,
                datarows.suitabilityEvaluationDate,
                datarows.fatca,
                datarows.fatcaDeclarationDate,
                datarows.cddScore,
                datarows.cddDate ,
                datarows.referralPerson ,
                datarows.applicationDate ,
                datarows.incomeSourceCountry ,
                datarows.acceptedBy, 
                datarows.openFundConnextFormFlag ,
                datarows.approvedDate ,
                datarows.openChannel ,
                datarows.investorClass ,
                datarows.vulnerableFlag ,
                datarows.vulnerableDetail ,
                datarows.ndidFlag
            ]
        ];

        datacus.forEach(async(data) => {
            table.rows.add.apply(table.rows, await jdatatoArray3(data));
        });

        //-----------------INSERT INTO Fund_Cen_Address 20052022
        let cardNum = JSON.stringify(datarows.cardNumber)
        
        await  importCenAddress_N(cardNum, "doc", iaccompanyingDocument)
        await  importCenAddress_N(cardNum, "current", current)
        await  importCenAddress_N(cardNum, "work", work)
        // setTimeout(() => {  if (typeof(datarows.identificationCardType)) {  importCenAddress(cardNum, "doc", iaccompanyingDocument) }   }, 1500);
        // setTimeout(() => {  if (typeof(datarows.current)) {  importCenAddress(cardNum, "current", current)}                             }, 1500);
        // setTimeout(() => {  if (typeof(datarows.work)) {  importCenAddress(cardNum, "work", work) }                                     }, 1500);
       
        //-----------------INSERT INTO Fund_Cen_BankAccounts 23052022
        let json = datarows.accounts
        let sub_bankcodex ,  sub_bankbranchcodex , sub_bankAccountNox,carnum,accId
        //sub
        json.forEach(function(obj) { 
            // console.log(obj.cardNumber +"   " +obj.accountId); 
            obj.subscriptionBankAccounts.forEach(function(x) {
                sub_bankcodex        = x.bankCode
                sub_bankbranchcodex  = x.bankBranchCode
                sub_bankAccountNox   = x.bankAccountNo} );

            carnum = obj.cardNumber
            accId = obj.accountId   
        });
        setTimeout(() => { if(typeof(obj)){  importCenBank(carnum,accId,"SUB",sub_bankcodex,sub_bankbranchcodex,sub_bankAccountNox)}  }, 1500);  

        let red_bankcodex ,  red_bankbranchcodex , red_bankAccountNox
        json.forEach(function(obj) { 
            // console.log(obj.subscriptionBankAccounts); 
            obj.redemptionBankAccounts.forEach(function(x) {
                red_bankcodex        = x.bankCode
                red_bankbranchcodex  = x.bankBranchCode
                red_bankAccountNox   = x.bankAccountNo} );
                carnum = obj.cardNumber
                accId = obj.accountId         
        });
        setTimeout(() => { if(typeof(obj)){  importCenBank(carnum,accId,"RED",red_bankcodex,red_bankbranchcodex,red_bankAccountNox)}  }, 1500);  

        //------------------- INSERT INTO Fund_Cen_Suitability
        // setTimeout(() => { if(typeof(obj)){  importSuitability(carnum,datarows.suitabilityForm)}  }, 1500); 
        await importSuitability_N(carnum,datarows.suitabilityForm)
        //********************INSERT INTO FUNCD_CEN_ACCOUNT */
        // setTimeout(() => { if(typeof(obj)){  importAccount(carnum,datarows.accounts)}  }, 1500); 
        await importAccount(carnum,datarows.accounts)
        let pool = await sql.connect(config);
        await pool.request().query(`DELETE FROM Fund_cen_Customer WHERE cardNumber = '${datarows.cardNumber}' `);
        pool.request().bulk(table, function(err, result) {
            if (err) {
               // console.log(cardNum)
                // console.log(err);
                pool.close();
                sql.close(); 
                // setTimeout(function () {
                //     loginsertapi("Fund_cen_Customer",cardNum)
                // }, 5000);
               
            } else {
                // console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);
                pool.close();
                sql.close();

            }

            // pool.close();
            // sql.close();
        });
        return callback("Import data to Customer "+datarows.cardNumber+" K."+ datarows.thFirstName +" "+datarows.thLastName +" is completed." , datarows.cardNumber );


    } catch (error) {
        //console.log(" id card no not insert : " +cardNum)
        console.log(error);
        return callback("error Import data to Customer "+datarows.cardNumber+" K."+ datarows.thFirstName +" "+datarows.thLastName);
    }


}
//----------[Best 2020 07 11]
async function importAccount(cardNumber, dataAccount){
    //  console.log(dataAccount)
     let timestampx
     await getdatetime( (dt) =>{timestampx = dt  })
     //console.log(timestampx)

    try{
        let statement = `INSERT INTO Fund_Cen_Accounts(
                            cardNumber ,identificationCardType ,accountId ,icLicense ,accountOpenDate
                            ,investmentObjective ,investmentObjectiveOther  ,approvedDate
                            ,mailingAddressSameAsFlag ,openOmnibusFormFlag ,mailingMethod  , timestampx
                            )
                            VALUES(
                                @cardNumber,@identificationCardType  ,@accountId ,@icLicense
                                ,@accountOpenDate ,@investmentObjective ,@investmentObjectiveOther
                                ,@approvedDate ,@mailingAddressSameAsFlag ,@openOmnibusFormFlag
                                ,@mailingMethod , @timestampx)`

        await poolPromise.then(pool => {
            return pool.request()
                .input("icardNumber", sql.NVarChar, cardNumber)
                .query(`DELETE from Fund_Cen_Accounts WHERE cardNumber = @icardNumber `)
        })   
        await new sql.ConnectionPool(config).connect().then(pool => {   
        return pool.request()                        
        .input("cardNumber",                sql.Char(13),       cardNumber)
        .input("identificationCardType",    sql.VarChar(20),    dataAccount[0].identificationCardType)
        .input("accountId",                 sql.VarChar(20),    dataAccount[0].accountId)
        .input("icLicense",                 sql.VarChar(50),    dataAccount[0].icLicense)
        .input("accountOpenDate",           sql.VarChar(50),    dataAccount[0].accountOpenDate)
        .input("investmentObjective",       sql.NVarChar(200),  dataAccount[0].investmentObjective)
        .input("investmentObjectiveOther",  sql.NVarChar(200),  dataAccount[0].investmentObjectiveOther)
        .input("approvedDate",              sql.VarChar(20),    dataAccount[0].approvedDate)
        .input("mailingAddressSameAsFlag",  sql.VarChar(20),    dataAccount[0].mailingAddressSameAsFlag)
        .input("openOmnibusFormFlag",       sql.Bit,            dataAccount[0].openOmnibusFormFlag)
        .input("mailingMethod",             sql.VarChar(20),    dataAccount[0].mailingMethod)
        .input("timestampx",                sql.DateTime,       timestampx )
        .query(statement)  
        }).then(result => {
        sql.close();
        // console.log(result);
        // console.log("Number of records inserted:" + result.rowsAffected);  
        console.log("inserted Fund_cen_account  : " + result.rowsAffected +" Insert Complete");  
        // return callback(result);  

        }).catch(err => {
        console.log(err);
        sql.close();
        // return callback(err);
        });   

    } catch (error) {
        console.log(error);
        return callback(error);
    }

}
async function importSuitability_N(cardNumber,Suitability){
    // console.log(cardNumber)
    if (Suitability == null || Suitability == "" ){ console.log("Suitability no data insert. Citizen ID : " + cardNumber) ; return -1}
    if (typeof(Suitability) == "undefined")     { console.log("Suitability no data insert. Citizen ID : " + cardNumber) ; return -1}
    try{
        let statement = `INSERT Fund_Cen_Suitability(cardNumber, suitNo1, suitNo2, suitNo3, suitNo4, suitNo5, suitNo6, suitNo7, suitNo8, suitNo9, suitNo10, suitNo11, suitNo12)
                        VALUES (@cardNumber, @suitNo1, @suitNo2, @suitNo3, @suitNo4, @suitNo5, @suitNo6, @suitNo7, @suitNo8, @suitNo9, @suitNo10, @suitNo11, @suitNo12 )`
        
        await poolPromise.then(pool => {
            return pool.request()
                .input("icardNumber", sql.NVarChar, cardNumber)
                .query(`DELETE FROM Fund_Cen_Suitability WHERE cardNumber = '${cardNumber}' `)
        })   
        await new sql.ConnectionPool(config).connect().then(pool => {   
        return pool.request()                        
        .input("cardNumber",                sql.Char(13),       cardNumber)
        .input("suitNo1",                   sql.VarChar(10),    Suitability['suitNo1'])
        .input("suitNo2",                   sql.VarChar(10),    Suitability['suitNo2'])
        .input("suitNo3",                   sql.VarChar(10),    Suitability['suitNo3'])
        .input("suitNo4",                   sql.VarChar(10),    Suitability['suitNo4'])
        .input("suitNo5",                   sql.VarChar(10),    Suitability['suitNo5'])
        .input("suitNo6",                   sql.VarChar(10),    Suitability['suitNo6'])
        .input("suitNo7",                   sql.VarChar(10),    Suitability['suitNo7'])
        .input("suitNo8",                   sql.VarChar(10),    Suitability['suitNo8'])
        .input("suitNo9",                   sql.VarChar(10),    Suitability['suitNo9'])
        .input("suitNo10",                  sql.VarChar(10),    Suitability['suitNo10'])
        .input("suitNo11",                  sql.VarChar(10),    Suitability['suitNo11'])
        .input("suitNo12",                  sql.VarChar(10),    Suitability['suitNo12'] )
        .query(statement)  
        }).then(result => {
        sql.close();
        // console.log(result);
        // console.log("Number of records inserted:" + result.rowsAffected);  
        console.log("inserted Fund_Cen_Suitability  : " + result.rowsAffected +" Insert Complete");  
        // return callback(result);  

        }).catch(err => {
        console.log(err);
        sql.close();
        // return callback(err);
        });   

    } catch (error) {
        console.log(error);
        return callback(error);
    }

    
}
//----------[Best 2020 06 17]
async function importSuitability(cardNumber,Suitability){
    if (Suitability == null || Suitability == "" ){ console.log("Suitability no data insert. Citizen ID : " + cardNumber) ; return -1}
    if (typeof(Suitability) == "undefined")     { console.log("Suitability no data insert. Citizen ID : " + cardNumber) ; return -1}
    try{
        let table = new sql.Table('Fund_Cen_Suitability');

        table.columns.add('cardNumber', sql.Char(13), { nullable: false });
        table.columns.add('suitNo1', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo2', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo3', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo4', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo5', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo6', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo7', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo8', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo9', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo10', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo11', sql.VarChar(10), { nullable: true });
        table.columns.add('suitNo12', sql.VarChar(10), { nullable: true });
        // table.columns.add('timestampx', sql.DateTime, { nullable: true });
        
        let timestampx
        const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        timestampx = year +"-"+  month  +"-"+ date //+ "00:00:00.000"
        

        let datajson = Suitability 
        let datasuit=[[ cardNumber,
                        datajson.suitNo1, 
                        datajson.suitNo2, 
                        datajson.suitNo3, 
                        datajson.suitNo4,
                        datajson.suitNo5,
                        datajson.suitNo6,
                        datajson.suitNo7,
                        datajson.suitNo8,
                        datajson.suitNo9,
                        datajson.suitNo10,
                        datajson.suitNo11,
                        datajson.suitNo12
                        //  timestampx
                    ]]
         datasuit.forEach(async(data) => { table.rows.add.apply(table.rows, await jdatatoArray3(data));  });

        let pool = await sql.connect(config);
        await pool.request().query(`DELETE FROM Fund_Cen_Suitability WHERE cardNumber = '${cardNumber}' `);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted of Fund_Cen_Suitability  :" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return ("INSERT Fund_Cen_Suitability   success!!")
    } catch (error) {
        console.log(error);
        return callback(error);
    }


}
//------------------------------------------
async function importCenBank(cardNumber,accountId,typebank,bankcodex,bankbranchcodex,bankAccountNox){

// if (bankcodex === null || bankcodex === "" ){ console.log("bankaccount no data insert " + cardNumber) ; return -1}
// if (typeof(bankcodex) === "undefined") { console.log("bankaccount no data insert  becuase bankcode is " + cardNumber) ; return -1}
    try{
        let table = new sql.Table('Fund_Cen_BankAccounts');

        table.columns.add('cardNumber', sql.VarChar(13), { nullable: true });
        table.columns.add('accountId', sql.VarChar(20), { nullable: true });
        table.columns.add('type', sql.VarChar(10), { nullable: true });
        table.columns.add('bankCode', sql.VarChar(10), { nullable: true });
        table.columns.add('bankBranchCode', sql.VarChar(10), { nullable: true });
        table.columns.add('bankAccountNo', sql.VarChar(20), { nullable: true });
        table.columns.add('isDefault', sql.VarChar(10), { nullable: true });
        // table.columns.add('finnetCustomerNo', sql.VarChar(10), { nullable: true });
         table.columns.add('flx', sql.VarChar(1), { nullable: true });
        
        let databank=[[cardNumber, accountId, typebank, bankcodex, bankbranchcodex,bankAccountNox,true,"I"]]
        databank.forEach(async(data) => { table.rows.add.apply(table.rows, await jdatatoArray3(data));  });

        let pool = await sql.connect(config);
        await pool.request().query(`DELETE FROM Fund_Cen_BankAccounts WHERE cardNumber = '${cardNumber}' AND type = '${typebank}' `);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                // console.log(result);
                console.log("Number of records inserted of Fund_Cen_BankAccounts " + typebank +" :" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return ("INSERT Fund_Cen_BankAccounts " + typebank +" success!!")
    } catch (error) {
        console.log(error);
        // return callback(error);
    }


return 1
}
//------------
async function importCenAddress_N(idcard, flag, datarows, callback) {
    try{
        // console.log(datarows)
        idcard = idcard.replace(/['"]+/g, '') // clear doble cod
        // let no = await jdatatoArray2(datarows.no) 
        // var t = JSON.parse('{"name": "", "skills": "", "jobtitel": "Entwickler", "res_linkedin": "GwebSearch"}');
        // alert(t['jobtitel'])
        let datarow = JSON.parse(datarows)
        let no = datarow['no']
        // console.log(" xxxxx NO " +no)
        await poolPromise.then(pool => {
            return pool.request() 
            .query(`DELETE FROM Fund_Cen_Address WHERE cardNumber = '${idcard}' AND address_type = '${flag}'  `)
        }) 
                let  statement = `INSERT INTO  Fund_Cen_Address(cardNumber, address_type, no, floor, building, roomNo, road, moo, subDistrict, district, province, postalCode, country, flx, soi)
                          VALUES  (@cardNumber, @address_type, @no, @floor, @building, @roomNo, @road, @moo, @subDistrict, @district, @province, @postalCode, @country, @flx, @soi)`
                          
                            await new sql.ConnectionPool(config).connect().then(pool => {
                            return pool.request()
                            .input("cardNumber",            sql.VarChar(13),        idcard)
                            .input("address_type",          sql.VarChar(40),        flag)
                            .input("no",                    sql.NVarChar(20),       datarow['no']) 
                            .input("floor",                 sql.NVarChar(20),       datarow['floor'])
                            .input("building",              sql.NVarChar(100),      datarow['building'])
                            .input("roomNo",                sql.NVarChar(20),       datarow['roomNo'])
                            .input("road",                  sql.NVarChar(100),      datarow['road'])
                            .input("soi",                   sql.NVarChar(50),       datarow['soi'])
                            .input("moo",                   sql.NVarChar(20),       datarow['moo'])
                            .input("subDistrict",           sql.NVarChar(50),       datarow['subDistrict'])
                            .input("district",              sql.NVarChar(50),       datarow['district'])
                            .input("province",              sql.NVarChar(50),       datarow['province'])
                            .input("postalCode",            sql.VarChar(10),        datarow['postalCode'])
                            .input("country",               sql.VarChar(3),         datarow['country'])
                            .input("flx",                   sql.VarChar(3),         "I")
                            .query(statement);
                            
                        }).then(result => {
                            let rowsAffected = result.rowsAffected.toString()
                            // let datetime
                            if (rowsAffected > 0){ console.log("INSERT MFTS_BUY "+ rowsAffected +" row  is complete") }
                            sql.close();
                             //console.log("INSERT MFTS_BUY "+ rowsAffected +" row  is complete")
                            //return callback("Buy Suceess")
                        }).catch(err => {
                            console.log(err);
                            sql.close();
                            //return callback(err)
                        });
                    
                    }catch (error) {
                        // result = "ERROR Catch"
                            console.log(error);
                        return callback(error)
                    }
                

}
//----------------------------
async function importCenAddress(idcard, flag, datarows, callback) {
    //console.log(datarows)
    try {
        let table = new sql.Table('Fund_Cen_Address');
               
        table.columns.add('cardNumber', sql.VarChar(13), { nullable: true });
        table.columns.add('address_type', sql.VarChar(40), { nullable: true });
        table.columns.add('no', sql.NVarChar(20), { nullable: true });
        table.columns.add('floor', sql.NVarChar(20), { nullable: true });
        table.columns.add('building', sql.NVarChar(100), { nullable: true });
        table.columns.add('roomNo', sql.NVarChar(20), { nullable: true });
        table.columns.add('road', sql.NVarChar(100), { nullable: true });
        table.columns.add('soi', sql.NVarChar(50), { nullable: true });
        table.columns.add('moo', sql.NVarChar(20), { nullable: true });
        table.columns.add('subDistrict', sql.NVarChar(50), { nullable: true });
        table.columns.add('district', sql.NVarChar(50), { nullable: true });
        table.columns.add('province', sql.NVarChar(50), { nullable: true });
        table.columns.add('postalCode', sql.VarChar(10), { nullable: true });
        table.columns.add('country', sql.VarChar(3), { nullable: true });
        table.columns.add('flx', sql.VarChar(3), { nullable: true });

        //JSON PUSH 
        idcard = idcard.replace(/['"]+/g, '') // clear doble cod
        var myObj = { "cardNumber": idcard, "address_type": flag };
        let datajson = JSON.parse(datarows);
        let dataparam = Object.assign(myObj, datajson)

        //console.log(idcard + "<><>" + flag)
        let dataaddress = [
            [dataparam.cardNumber,
                dataparam.address_type,
                dataparam.no,
                dataparam.floor,
                dataparam.building,
                dataparam.roomNo,
                dataparam.road,
                dataparam.soi,
                dataparam.moo,
                dataparam.subDistrict,
                dataparam.district,
                dataparam.province,
                dataparam.postalCode,
                dataparam.country,
                "I"
            ]
        ];

        dataaddress.forEach(async(data) => {
            table.rows.add.apply(table.rows, await jdatatoArray3(data));
        });

        let pool = await sql.connect(config);
        await pool.request().query(`DELETE FROM Fund_Cen_Address WHERE cardNumber = '${dataparam.cardNumber}' AND address_type = '${dataparam.address_type}' `);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                // console.log(result);
                console.log("Number of records inserted Fund_Cen_Address of " + flag + " :" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        //return callback("Import ");

    } catch (error) {
        console.log(error);
        return callback(error);
    }


    //   return callback("Import ");
}

//-----------------------------------------Function Object Data
async function getArraytotext(data) {
    // console.log(data);
    let txt1 = data.substring(1);
    let txtsub = txt1.substring(0, txt1.length - 1)
    let txt = txtsub.split(',')
    let str = txt.join('|');
    // console.log(txt);

    return txt;
}

//-----------------------------------------------------------------
async function jdatatoArray2(datax) {
    var res = [];
    let redtype = " ";
    let xx = 0;
    let yy = true;


    for (var i in datax) {
        if (xx == 1 && yy) {
            res.push(redtype); // add dummy redemptionType in column 7
        }
        res.push(datax[i]);
        xx++;
    }
    // res.push(redtype);
    res.push(datax);
    console.log(datax)
    console.log(res);
    return res;
}
async function jdatatoArray3(datax) {
    var res = [];
    let redtype = " ";
    let xx = 0;
    let yy = true;
    if (datax.hasOwnProperty('redemptionType')) {
        //redtype = datax.redemptionType;
        yy = false; // not need to check redemptionType

    }

    for (var i in datax) {

        res.push(datax[i]);
    }
    console.log(res);
    return res;
}

async function importcustomer(datarows, callback) {
    console.dir(datarows);
    try {
        let table = new sql.Table('Fund_cen_Customer');

        table.columns.add('identificationCardType', sql.VarChar(15), { nullable: true });
        table.columns.add('cardNumber', sql.VarChar(13), { nullable: true });


        //datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));

        // datarows.forEach(async (data) => {
        //     table.rows.add.apply(table.rows, await jdatatoArray(data));
        // });    


        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return callback("Import data to Customer is completed.");

    } catch (error) {
        console.log(error);
        return callback(error);
    }


}


//-------------------------------------------------------------------------------------
async function jdatatoArray(datax) {
    var res = [];
    let redtype = " ";
    let xx = 0;
    let yy = true;
    if (datax.hasOwnProperty('redemptionType')) {
        //redtype = datax.redemptionType;
        yy = false; // not need to check redemptionType

    }

    for (var i in datax) {
        if (xx == 6 && yy) {
            res.push(redtype); // add dummy redemptionType in column 7
        }
        res.push(datax[i]);
        xx++;
    }
    console.log(res);
    return res;
}

async function importFee(datarows, callback) {
    try {


        let table = new sql.Table('Fund_Cen_Fee');

        table.columns.add('EFFECTIVE_DATE', sql.VarChar(10), { nullable: true });
        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('FEE_TYPE', sql.VarChar(1), { nullable: true });
        table.columns.add('FEE_UNIT', sql.VarChar(1), { nullable: true });
        table.columns.add('MAXIMUM_FEE', sql.VarChar(20), { nullable: true });
        table.columns.add('ACTUAL_FEE', sql.VarChar(20), { nullable: true });
        table.columns.add('MINIMUM_FEE', sql.VarChar(20), { nullable: true });
        table.columns.add('REMARK', sql.NVarChar(250), { nullable: true });
        table.columns.add('MAXIMUM_VALUE', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER01', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER02', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER03', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER04', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER05', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER06', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER07', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER08', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER09', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER10', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER11', sql.VarChar(20), { nullable: true });


        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));


        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return callback("Import data to FundMapping is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }
}


async function importDividendNews(datarows, callback) {
    try {

        console.log('DividendNewsX')

        let table = new sql.Table('Fund_Cen_DividendNews');
        table.columns.add('FUND_TAX_ID', sql.VarChar(13), { nullable: true });
        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('ANNOUNCE_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('ANNOUNCE_TYPE', sql.VarChar(1), { nullable: true });
        table.columns.add('BOOK_CLOSED_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('PAYMENT_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('DIVIDEND_RATE', sql.VarChar(20), { nullable: true });
        table.columns.add('BEG_SUSPEND_DATE_SUB', sql.VarChar(8), { nullable: true });
        table.columns.add('END_SUSPEND_DATE_SUB', sql.VarChar(8), { nullable: true });
        table.columns.add('BEG_SUSPEND_DATE_RED', sql.VarChar(8), { nullable: true });
        table.columns.add('END_SUSPEND_DATE_RED', sql.VarChar(8), { nullable: true });
        table.columns.add('BEG_SUSPEND_DATE_SWI', sql.VarChar(8), { nullable: true });
        table.columns.add('END_SUSPEND_DATE_SWI', sql.VarChar(8), { nullable: true });
        table.columns.add('BEG_SUSPEND_DATE_SWO', sql.VarChar(8), { nullable: true });
        table.columns.add('END_SUSPEND_DATE_SWO', sql.VarChar(8), { nullable: true });
        table.columns.add('ACCT_PERIOD_FROM', sql.VarChar(8), { nullable: true });
        table.columns.add('ACCT_PERIOD_TO', sql.VarChar(8), { nullable: true });
        table.columns.add('CANCEL_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('UPDATE_DATE', sql.VarChar(8), { nullable: true });


        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));


        let pool = await sql.connect(config);
        await pool.request().query("DELETE FROM Fund_Cen_DividendNews");
        pool.request().bulk(table, function(err, result) {  
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return callback("Import data to DividenNews is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }
}



async function importDividendTransactions(datarows, callback) {
    try {

        let table = new sql.Table('Fund_Cen_DividendTransactions');

        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('BOOK_CLOSED_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table.columns.add('ACCOUNT_ID', sql.VarChar(20), { nullable: true });
        table.columns.add('UNITHOLDER_ID', sql.VarChar(15), { nullable: true });
        table.columns.add('UNIT', sql.VarChar(18), { nullable: true });
        table.columns.add('DIVIDEND_AMOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('WITHOLDING_TAX', sql.VarChar(20), { nullable: true });
        table.columns.add('DIVIDEND_AMOUNT_NET', sql.VarChar(20), { nullable: true });
        table.columns.add('PAYMENT_TYPE', sql.VarChar(1), { nullable: true });
        table.columns.add('BANK_CODE', sql.VarChar(4), { nullable: true });
        table.columns.add('BANK_ACCOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('CHEQUE_NO', sql.VarChar(10), { nullable: true });
        table.columns.add('REINVEST_FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('REINVEST_AMC_ORDER_REFERENCE', sql.VarChar(30), { nullable: true });
        table.columns.add('AGENT_PAY_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('FUND_TAX_ID', sql.VarChar(13), { nullable: true });
        table.columns.add('PAYMENT_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('DIVIDEND_RATE', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER01', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER02', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER03', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER04', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER05', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER06', sql.VarChar(20), { nullable: true });


        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));


        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return callback("Import data to DividendTransactions is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }
}




async function importBankAccountUnitholder(datarows, callback) {
    try {


        let table = new sql.Table('Fund_Cen_BankAccountUnitholder');

        table.columns.add('ACCOUNT_ID', sql.VarChar(15), { nullable: true });
        table.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table.columns.add('UNITHOLDER_ID', sql.VarChar(15), { nullable: true });
        table.columns.add('TRANSACTION_CODE', sql.VarChar(3), { nullable: true });
        table.columns.add('BANK_CODE', sql.VarChar(4), { nullable: true });
        table.columns.add('BANK_ACCOUNT_NO', sql.VarChar(20), { nullable: true });


        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));


        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return callback("Import data to FundMapping is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }
}


async function importUnitholderMapping(datarows, callback) {
    try {


        let table = new sql.Table('Fund_Cen_UnitholderMapping');

        table.columns.add('ACCOUNT_ID', sql.VarChar(15), { nullable: true });
        table.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table.columns.add('UNITHOLDER_ID', sql.VarChar(15), { nullable: true });


        table.columns.add('ACCOUNT_TYPE', sql.VarChar(6), { nullable: true });

        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));


        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return callback("Import data to FundMapping is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }
}


async function importSwitchingMatrix(datarows, callback) {
    try {


        let table = new sql.Table('Fund_Cen_SwitchingMatrix');

        table.columns.add('FUND_CODE_OUT', sql.VarChar(30), { nullable: true });
        table.columns.add('FUND_CODE_IN', sql.VarChar(30), { nullable: true });
        table.columns.add('SWITCH_SETTLEMENT_DAY', sql.VarChar(8), { nullable: true });
        table.columns.add('SWITCHING_TYPE', sql.VarChar(4), { nullable: true });

        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));


        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return callback("Import data to FundMapping is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }
}



async function importFundHoliday(datarows, callback) {
    try {
        let string_return = null
        let table = new sql.Table('Fund_Cen_Fund_Holiday_Date');

        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('FUND_HOLIDAY_DATE', sql.VarChar(8), { nullable: true });

        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));

        let pool = await sql.connect(config);
        await pool.request().query("DELETE FROM Fund_Cen_Fund_Holiday_Date");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                // console.log(result);
                // console.log("Number of records inserted:" + result.rowsAffected);
            console.log("Number of records inserted:" + result.rowsAffected);
            // return callback("Import data to Fund_Holiday is completed.");   
            }
            
            pool.close();
            sql.close();
            
        });
         //**  */
        let sle_data
        await selectDataHoliday((result)=>{  sle_data = result })
            //res.json(result)
        let chk_data    
        await checkDataHoliday(sle_data , (x)=>{chk_data = x  })
               //  string_return = x
        console.log(chk_data)     
           
    } catch (error) {

        console.log(error);
        return callback(error);
    }
    
        return callback("chk_data");
}

async function importFundProfile(datarows, callback) {
    try {


        let table = new sql.Table('Fund_Cen_FundProfile');
        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table.columns.add('FUND_NAME_TH', sql.NVarChar(200), { nullable: true });
        table.columns.add('FUND_NAME_EN', sql.VarChar(200), { nullable: true });
        table.columns.add('FUND_POLICY', sql.VarChar(1), { nullable: true });
        table.columns.add('TAX_TYPE', sql.VarChar(4), { nullable: true });
        table.columns.add('FIF_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('DIVIDEND_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('REGISTRATION_DATE', sql.VarChar(10), { nullable: true });
        table.columns.add('FUND_RISK_LEVEL', sql.VarChar(2), { nullable: true });
        table.columns.add('FX_RISK_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('FATCA_ALLOW_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('BUY_CUT_OFF_TIME', sql.VarChar(4), { nullable: true });
        table.columns.add('FST_LOWBUY_VAL', sql.VarChar(20), { nullable: true });
        table.columns.add('NXT_LOWBUY_VAL', sql.VarChar(20), { nullable: true });
        table.columns.add('SELL_CUT_OFF_TIME', sql.VarChar(4), { nullable: true });
        table.columns.add('LOWSELL_VAL', sql.VarChar(20), { nullable: true });
        table.columns.add('LOWSELL_UNIT', sql.VarChar(20), { nullable: true });
        table.columns.add('LOWBAL_VAL', sql.VarChar(20), { nullable: true });
        table.columns.add('LOWBAL_UNIT', sql.VarChar(20), { nullable: true });
        table.columns.add('SELL_SETTLEMENT_DAY', sql.VarChar(8), { nullable: true });
        table.columns.add('SWITCHING_SETTLEMENT_DAY', sql.VarChar(20), { nullable: true });
        table.columns.add('SWITCH_OUT_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('SWITCH_IN_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('FUND_CLASS', sql.VarChar(30), { nullable: true });

        table.columns.add('BUY_PERIOD_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('SELL_PERIOD_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('SWITCH_IN_PERIOD_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('SWITCH_OUT_PERIOD_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('BUY_PRE_ORDER_DAY', sql.VarChar(8), { nullable: true });
        table.columns.add('SELL_PRE_ORDER_DAY', sql.VarChar(8), { nullable: true });
        table.columns.add('SWITCH_PRE_ORDER_DAY', sql.VarChar(8), { nullable: true });
        table.columns.add('AUTO_REDEEM_FUND', sql.VarChar(300), { nullable: true });
        table.columns.add('BEG_IPO_DATE', sql.VarChar(10), { nullable: true });
        table.columns.add('END_IPO_DATE', sql.VarChar(10), { nullable: true });
        table.columns.add('PLAIN_COMPLEX_FUND', sql.VarChar(1), { nullable: true });
        table.columns.add('DERIVATIVES_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('LAG_ALLOCATION_DAY', sql.VarChar(8), { nullable: true });
        table.columns.add('SETTLEMENT_HOLIDAY_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('HEALTH_INSURANCE', sql.VarChar(1), { nullable: true });
        table.columns.add('PREVIOUS_FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('INVESTOR_ALERT', sql.VarChar(20), { nullable: true });
        table.columns.add('ISIN', sql.VarChar(15), { nullable: true });
        table.columns.add('LOWBAL_CONDITION', sql.VarChar(1), { nullable: true });
        table.columns.add('Project_Retail_Type', sql.VarChar(5), { nullable: true });
        // table.columns.add('FILTER01', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER02', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER03', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER04', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER05', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER06', sql.VarChar(20), { nullable: true });


        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));
        //console.dir(table);

        let pool = await sql.connect(config);
        await pool.request().query("DELETE FROM Fund_Cen_FundProfile");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);
                
            }

            pool.close();
            sql.close();
        });
        return callback("Import data to Fund_Cen_FundProfile is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }


}

async function importAllottedTransactions(datarows, callback) {
    console.log(datarows);
    try {


        let table = new sql.Table('Fund_Cen_AllottedTransactions');

        table.columns.add('SA_ORDER_REF', sql.VarChar(30), { nullable: true });
        table.columns.add('TRANS_DATE', sql.VarChar(14), { nullable: true });
        table.columns.add('FILTER01', sql.VarChar(20), { nullable: true });
        table.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table.columns.add('UNITHOLDER_ID', sql.VarChar(15), { nullable: true });
        table.columns.add('NET_UNITHOLDER_REF_NO', sql.VarChar(20), { nullable: true });
        table.columns.add('TRANS_CODE', sql.VarChar(3), { nullable: true });
        table.columns.add('FUND_CODE', sql.VarChar(20), { nullable: true });
        table.columns.add('OVERRIDE_RISK_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('OVERRIDE_FX_RISK_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('REDEMPTION_TYPE', sql.VarChar(5), { nullable: true });
        table.columns.add('AMOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('UNIT', sql.VarChar(20), { nullable: true });
        table.columns.add('EFFECTIVE_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('FILTER02', sql.VarChar(20), { nullable: true });
        table.columns.add('FILTER03', sql.VarChar(20), { nullable: true });
        table.columns.add('PAYMENT_TYPE', sql.VarChar(8), { nullable: true });
        table.columns.add('BANK_CODE', sql.VarChar(4), { nullable: true });
        table.columns.add('BANK_ACCOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('CHEQUE_NO', sql.VarChar(10), { nullable: true });
        table.columns.add('CHEQUE_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('IC_LICENSE', sql.VarChar(10), { nullable: true });
        table.columns.add('BRANCH_NO', sql.VarChar(5), { nullable: true });
        table.columns.add('CHANNEL', sql.VarChar(3), { nullable: true });
        table.columns.add('FORCE_ENTRY', sql.VarChar(1), { nullable: true });
        table.columns.add('LTF_CONDITION', sql.VarChar(1), { nullable: true });
        table.columns.add('REASON_TOSELL_LTF_RMF', sql.VarChar(1), { nullable: true });
        table.columns.add('RMF_CAPITAL_WHTAX_CHOICE', sql.VarChar(1), { nullable: true });
        table.columns.add('RMF_CAPITAL_REDEEM_CHOICE', sql.VarChar(1), { nullable: true });
        table.columns.add('AUTO_REDEEM_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('TRANSACTION_ID', sql.VarChar(17), { nullable: true });
        table.columns.add('STATUS', sql.VarChar(10), { nullable: true });
        table.columns.add('AMC_ORDER_REF', sql.VarChar(30), { nullable: true });
        table.columns.add('ALLOTMENT_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('ALLOTED_NAV', sql.VarChar(13), { nullable: true });
        table.columns.add('ALLOTED_AMOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('ALLOTED_UNIT', sql.VarChar(20), { nullable: true });
        table.columns.add('FEE', sql.VarChar(20), { nullable: true });
        table.columns.add('WH_TAX', sql.VarChar(20), { nullable: true });
        table.columns.add('VAT', sql.VarChar(20), { nullable: true });
        table.columns.add('BROKERAGE_FEE', sql.VarChar(20), { nullable: true });
        table.columns.add('WH_TAX_LTF_RTF', sql.VarChar(20), { nullable: true });
        table.columns.add('AMC_PAY_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('REGISTER_TRANS_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('SALE_ALL_UNIT_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('SETTLE_BANK_CODE', sql.VarChar(4), { nullable: true });
        table.columns.add('SETTLE_BANK_ACCOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('REJECT_REASON', sql.VarChar(50), { nullable: true });
        table.columns.add('CHQ_BRANCH', sql.VarChar(5), { nullable: true });
        table.columns.add('TAX_INVOICE_NO', sql.VarChar(50), { nullable: true });
        table.columns.add('AMC_SWITCHING_ORDER_NO', sql.VarChar(30), { nullable: true });
        table.columns.add('IC_CODE', sql.VarChar(10), { nullable: true });
        table.columns.add('BROKERAGE_FEE_VAT', sql.VarChar(20), { nullable: true });
        table.columns.add('APPROVAL_CODE', sql.VarChar(20), { nullable: true });
        table.columns.add('NAV_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('COLLATERAL_AMT', sql.VarChar(20), { nullable: true });
        table.columns.add('CREDIT_CARD_ISSUER', sql.VarChar(20), { nullable: true });
        table.columns.add('FILTER04', sql.VarChar(20), { nullable: true });
        table.columns.add('FILTER05', sql.VarChar(20), { nullable: true });
        table.columns.add('FILTER06', sql.VarChar(20), { nullable: true });

        datarows.forEach(datarow => {
            //  console.log(datarow);
            table.rows.add.apply(table.rows, datarow)
        });

        //console.dir(table);


        let pool = await sql.connect(config);
        //await pool.request().query("delete from Fund_Cen_AllottedTransactions");
        await pool.request().query("DELETE FROM Fund_Cen_AllottedTransactions");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);


            } else {
                // console.log(result);
                //** Best */
                // getDataTransaction((result)=>{
                //     //res.json(result)
                //     importDataTransaction(result)
                // })
                //2023-01-13 // update/ insert unitholder balance

            }

            console.log("Number of records inserted:" + result.rowsAffected);
            pool.close();
            sql.close();
        });

        return callback("Import data to AllottedTransactions is completed.");
    } catch (error) {
        console.log(error);
        return
        callback(error);
    }

}

async function importFundMapping(datarows, callback) {

    try {


        let table1 = new sql.Table('Fund_Cen_FundMapping');

        table1.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table1.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });

        datarows.forEach(datarow => table1.rows.add.apply(table1.rows, datarow));

        //console.dir(table1);
        let pool = await sql.connect(config);
        pool.request().bulk(table1, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return callback("Import data to FundMapping is completed.");
    } catch (error) {
        console.log(error);
        return callback(error);
    }
}

async function importUnitholderBalance(datarows, callback) {
    try {

        let table = new sql.Table('Fund_Cen_UnitholderBalance');

        table.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table.columns.add('ACCOUNT_ID', sql.VarChar(20), { nullable: true });
        table.columns.add('UNITHOLDER_ID', sql.VarChar(15), { nullable: true });
        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('UNIT_BALANCE', sql.VarChar(20), { nullable: true });
        table.columns.add('AMOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('AVAILABLE_UNIT_BALANCE', sql.VarChar(20), { nullable: true });
        table.columns.add('AVAILABLE_AMOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('PENDING_UNIT', sql.VarChar(20), { nullable: true });
        table.columns.add('PENDING_AMOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('PLEDGE_UNIT', sql.VarChar(20), { nullable: true });
        table.columns.add('AVERAGE_COST', sql.VarChar(20), { nullable: true });
        table.columns.add('NAV', sql.VarChar(15), { nullable: true });
        table.columns.add('NAV_DATE', sql.VarChar(8), { nullable: true });

        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));


        let pool = await sql.connect(config);
        await pool.request().query("DELETE FROM Fund_Cen_UnitholderBalance");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

                SelectUnitBalance( (result)=>{
                    // console.log(result)
                    compairUnitBalance(result ,function(flag_unibalance){
                        if(flag_unibalance == 1){
                            insertflagunitbalaneallot()
                            // return callback("Import data to UnitholderBalance is completed.");
                        }

                    })
                })
                // return callback("Import data to UnitholderBalance is completed.");
            }

            pool.close();
            sql.close();
        });
        return callback("Import data to FundMapping is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }
}
async function SelectUnitBalance(callback){
    try{
            let statement =`SELECT   MFTS_Account.Ref_No, Fund_Cen_UnitholderBalance.ACCOUNT_ID, MFTS_Fund.Fund_Id, Fund_Cen_UnitholderBalance.UNITHOLDER_ID, 
                            Fund_Cen_UnitholderBalance.FUND_CODE, Fund_Cen_UnitholderBalance.UNIT_BALANCE,
                            (SELECT     Confirm_Unit
                            FROM          MFTS_UnitBalance
                            WHERE      (Ref_No = MFTS_Account.Ref_No) AND (Fund_Id = MFTS_Fund.Fund_Id)) AS Confrim_unit
                            FROM         MFTS_Account INNER JOIN
                            Fund_Cen_UnitholderBalance ON MFTS_Account.Account_No = Fund_Cen_UnitholderBalance.ACCOUNT_ID AND 
                            MFTS_Account.Holder_Id = Fund_Cen_UnitholderBalance.UNITHOLDER_ID INNER JOIN
                            MFTS_Fund ON Fund_Cen_UnitholderBalance.FUND_CODE = MFTS_Fund.Fund_Code 
                            ORDER BY MFTS_Fund.Fund_Id
            `  //WHERE dbo.MFTS_UnitBalance.Fund_Id between 1 and 300
            //AND  ( Fund_Cen_UnitholderBalance.ACCOUNT_ID = '3199700070488' AND MFTS_Account.Ref_No = 'M00000004240')
    
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .query(statement);
      
          }).then(result => {
            //  console.log("DATA NAV " +result.rowsAffected);
            // data_nav = result.recordset;
            sql.close();
             
            return   callback(result.recordset);  
      
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
    
    }
async function compairUnitBalance(datarows,callback){
    
        let datetimelog
        let flag_unibalance = 1
        await getdatetime((dt)=>{datetimelog = dt})
        for ( let key in datarows) {
            //try{
                let fundId          = datarows[key].Fund_Id 
                let ConfirmUnit     = datarows[key].Confrim_unit
                let Account_No      = datarows[key].ACCOUNT_ID
                let Amc_Id          = datarows[key].Amc_Id
                let Holder_Id       = datarows[key].UNITHOLDER_ID
                let Amc_Code        = datarows[key].Amc_Code
                let Fund_Code       = datarows[key].FUND_CODE
                let Ref_No          = datarows[key].Ref_No
                let UNIT_BALANCE    = datarows[key].UNIT_BALANCE
                // console.log(Ref_No)
                if (Holder_Id.length == 0 || Holder_Id === ""){continue;}
                if (UNIT_BALANCE === null){continue;}
                let total_sum = UNIT_BALANCE - ConfirmUnit
                 //-- move function to prepare unintbalance 
                if(total_sum != 0 ){ 
                //     await updateMFTSUnitBalance(Ref_No,fundId ,UNIT_BALANCE ,ConfirmUnit ,"U",Fund_Code , Holder_Id ,Account_No ,Amc_Code) 
                //     console.log("----------------------- ")
                //     console.log("Result Untibalance : "+ total_sum)
                //    flag_unibalance = 1               
                }
                if(ConfirmUnit !== null){continue;}
                try{
    
                    let  statement = `INSERT INTO  MFTS_UnitBalance (Fund_Id, Ref_No, Submit_Unit, Confirm_Unit, NotClearing_Unit, Pledge_Unit, Modify_Date, IT_UPDATE, APIstatus, FUNDCODEI, UNITHOLDERI) 
                                       VALUES (@Fund_Id, @Ref_No, @Submit_Unit, @Confirm_Unit, @NotClearing_Unit, @Pledge_Unit, @Modify_Date, @IT_UPDATE, @APIstatus, @FUNDCODEI, @UNITHOLDERI) ` 
                //    console.log(statement)
                //     await new sql.ConnectionPool(config).connect().then(pool => {
                //     return pool.request()
                //     .input("Fund_Id"                , sql.Int,              fundId)
                //     .input("Ref_No"                 , sql.VarChar(12),      Ref_No )
                //     .input("Submit_Unit"            , sql.Numeric(18,4),    null)
                //     .input("Confirm_Unit"           , sql.Numeric(18,4),    UNIT_BALANCE)
                //     .input("NotClearing_Unit"       , sql.Numeric(18,4),    null)
                //     .input("Pledge_Unit"            , sql.Numeric(18,4),    null)
                //     .input("Modify_Date"            , sql.DateTime,         datetimelog) 
                //     .input("IT_UPDATE"              , sql.DateTime,         null)
                //     .input("APIstatus"              , sql.NChar(10),        "I") 
                //     .input("FUNDCODEI"              , sql.NChar(50),        Fund_Code)
                //     .input("UNITHOLDERI"            , sql.NChar(30),        Holder_Id)
                //     .query(statement);
                //     }).then(result => { 
                //       let data_row = result.rowsAffected.toString();
      
                //     if (data_row > 0){  console.log("Insert  MFTS_UnitBalance  Fund id : " + fundId + " SUCEESS AND Ref No "+ Ref_No) } 
                //     sql.close(); 
              
                //   }).catch(err => {
                //     console.log(err);
                //     sql.close();
                   
                //   });
                // // }, 30000);    
            }catch (error) {
               let result = "ERROR Catch"
               console.log(error);
                return   callback(error);  
             }
        }
        let console_time = new Date(Date.now() );  
        console.log("=== END Process Unitholder Balance at " + console_time  +" ==="  )
        return   callback(flag_unibalance); 
}
async function insertflagunitbalaneallot(callback){
    try{
    
        let  statement = `INSERT INTO  MFTS_UnitBalance_logApi (flag_update) 
                           VALUES (@flag_update) ` 
    //    console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .input("flag_update"                , sql.Int,              1)
        .query(statement);
        }).then(result => { 
          let data_row = result.rowsAffected.toString();

        if (data_row > 0){  console.log("Insert  MFTS_UnitBalance_logApi  SUCEESS") } 
        sql.close(); 
  
      }).catch(err => {
        console.log(err);
        sql.close();
       // return   callback(err);  
      });   
    }catch (error) {
        let result = "ERROR Catch"
        console.log(error);
         return   callback(error);  
    }

}
async function updateMFTSUnitBalance(Ref_No,fundId ,unitbalance ,unitbalance_old,APIstatus,Fund_Code , Holder_Id ,Account_No ,Amc_Code){
        let timestampx
         await getdatetime( (dt) =>{timestampx = dt  })
        try{
            let query =   ` UPDATE  MFTS_UnitBalance SET 
                                    ,APIstatus          = @APIstatus
                                    ,FUNDCODEI          = @FUNDCODEI
                                    ,UNITHOLDERI        = @UNITHOLDERI
                                    ,Modify_Date        = @Modify_Date
                                    ,UNIT_BALANCE       =@UNIT_BALANCE
                            WHERE Ref_No = @Ref_No  AND Fund_Id =@Fund_Id
                             `
                await new sql.ConnectionPool(config).connect().then(pool => {   
                        return pool.request()                        
                        .input("UNIT_BALANCE",          sql.VarChar(20),      unitbalance)
                        .input("APIstatus",             sql.NChar(10),          APIstatus)
                        .input("FUNDCODEI",             sql.NChar(50),          Fund_Code)
                        .input("UNITHOLDERI",           sql.NChar(30),          Holder_Id)
                        .input("Modify_Date",           sql.DateTime,           timestampx) 
                        .input("Ref_No",                sql.VarChar(12),        Ref_No) 
                        .input("Fund_Id",               sql.Int,                fundId) 
                        .query(query)  
                        }).then(result => {
                        sql.close();
                        // console.log(result);
                        console.log("Number of Update MFTS_UnitBalance records inserted:" + result.rowsAffected);  
                        let row =  result.rowsAffected
                        if(row > 0 ){ 
                           logMFTSUnitBalance(Account_No ,Holder_Id,Fund_Code,Amc_Code,unitbalance_old,unitbalance ) 
                        }
                        //return callback(flag_console +" to Account Info   Citizen: " + cardNumber + " "+ thFirstName+ " " +thLastName+ "   Complete");  
                
                        }).catch(err => {
                        console.log(err);
                        sql.close();
                        // return callback(err);
                        }); 
    
                } catch (error) {
                    // result = "ERROR Catch"
                    console.log(error);
                    // return   callback(error);
                }
        
    }
    async function logMFTSUnitBalance(Account_No ,Holder_Id,Fund_Code,Amc_Code,unitbalance_old,unitbalance){
        try{
          let  query = `INSERT INTO   Ref_unitbalancelog(  AccountId, UnitHolder, Fundcode, Amc_code, Unitbalance_old, Unitbalance_new )
                     VALUES     (  @AccountId, @UnitHolder, @Fundcode, @Amc_code, @Unitbalance_old, @Unitbalance_new)`
                     await new sql.ConnectionPool(config).connect().then(pool => {   
                        return pool.request()                        
                        .input("AccountId",             sql.Char(15),               Account_No)
                        .input("UnitHolder",            sql.VarChar(15),            Holder_Id)
                        .input("Fundcode",              sql.VarChar(50),            Fund_Code)
                        .input("Amc_code",              sql.NVarChar(50),           Amc_Code)  
                        .input("Unitbalance_old",       sql.Decimal(18,9),          unitbalance_old) 
                        .input("Unitbalance_new",       sql.Decimal(18,9),          unitbalance) 
                        .query(query)  
                        }).then(result => {
                        sql.close();
                        let row =  result.rowsAffected
                        if(row > 0 ){  
                            console.log("Insert log Unitholder balance " + row + " row")
                        } 
                
                        }).catch(err => {
                        console.log(err);
                        sql.close();
                        }); 
    
                } catch (error) {
                    console.log(error);
                }
    }
async function importFundNAV(datarows, callback) {
    console.log(datarows)
    try {


        let table = new sql.Table('Fund_Cen_NAV');


        table.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('AUM', sql.VarChar(20), { nullable: true });
        table.columns.add('NAV', sql.VarChar(15), { nullable: true });
        table.columns.add('OFFER_NAV', sql.VarChar(15), { nullable: true });
        table.columns.add('BID_NAV', sql.VarChar(20), { nullable: true });
        table.columns.add('SWITCH_OUT', sql.VarChar(20), { nullable: true });
        table.columns.add('SWITCH_IN', sql.VarChar(20), { nullable: true });
        table.columns.add('NAV_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('SA_CODE_UNIT_LINK', sql.VarChar(15), { nullable: true });
        table.columns.add('TOTAL_UNIT', sql.VarChar(18), { nullable: true });
        table.columns.add('TOTAL_AUM_ALL', sql.VarChar(18), { nullable: true });
        table.columns.add('TOTAL_UNIT_ALL', sql.VarChar(18), { nullable: true });
        table.columns.add('FILLER01', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER02', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER03', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER04', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER05', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER06', sql.VarChar(20), { nullable: true });
        table.columns.add('FILLER07', sql.VarChar(20), { NULLABLE: true });


        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));

        
        let pool = await sql.connect(config);
        await pool.request().query("DELETE FROM Fund_Cen_NAV");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);
                //*[BEST  ]****** */
                selectNavTable(function(result){ 
                    CheckNavTable(result , function(datarows){

                        });     
                });
            }

            pool.close();
            sql.close();
        });
        return callback("Import data to FundMapping is completed.");
    } catch (error) {
        console.log(error);
        return callback(error);
    }
}


/*

async function importOrderInquiry( datarows , callback ){
    
    try{
            
            
            let table = new sql.Table('Fund_Cen_OrderInquiry');
            
            table.columns.add('transactionId', sql.VarChar(16) , {nullable: true});
	        table.columns.add('saOrderReferenceNo', sql.VarChar(30) , {nullable: true});
	        table.columns.add('orderType', sql.VarChar(3) , {nullable: true}); 
	        table.columns.add('accountId', sql.VarChar(15) , {nullable: true});
	        table.columns.add('unitholderId', sql.VarChar(15) , {nullable: true}); 
	        table.columns.add('fundCode', sql.VarChar(30) , {nullable: true});
	        table.columns.add('redemptionType', sql.VarChar(4) , {nullable: true});
	        table.columns.add('unit', sql.VarChar(20) , {nullable: true});
	        table.columns.add('amount', sql.VarChar(20) , {nullable: true}); 
	        table.columns.add('sellAllUnitFlag', sql.VarChar(1) , {nullable: true}); 
	        table.columns.add('statusx', sql.VarChar(10) , {nullable: true});
	        table.columns.add('transactionDateTime', sql.VarChar(14) , {nullable: true}); 
	        table.columns.add('effectiveDate', sql.VarChar(8) , {nullable: true});
	        table.columns.add('settlementDate', sql.VarChar(8) , {nullable: true}); 
	        table.columns.add('amcOrderReferenceNo', sql.VarChar(30) , {nullable: true});
	        table.columns.add('allottedUnit', sql.VarChar(20) , {nullable: true}); 
	        table.columns.add('allottedAmount', sql.VarChar(20) , {nullable: true});
	        table.columns.add('allottedNAV', sql.VarChar(20) , {nullable: true});
	        table.columns.add('allotmentDate', sql.VarChar(8) , {nullable: true});
            table.columns.add('fee', sql.VarChar(20) , {nullable: true});
            table.columns.add('transactionLastUpdated', sql.VarChar(14) , {nullable: true}); 
            table.columns.add('paymentType', sql.VarChar(8) , {nullable: true});
            table.columns.add('bankCode', sql.VarChar(4) , {nullable: true});
            table.columns.add('bankAccount', sql.VarChar(20) , {nullable: true}); 
            table.columns.add('channel', sql.VarChar(3) , {nullable: true});
            table.columns.add('icLicense', sql.VarChar(10) , {nullable: true}); 
            table.columns.add('branchNo', sql.VarChar(5) , {nullable: true});
            table.columns.add('forceEntry', sql.VarChar(1) , {nullable: true}); 
            table.columns.add('settlementBankCode', sql.VarChar(4) , {nullable: true});
            table.columns.add('settlementBankAccount', sql.VarChar(20) , {nullable: true});
            table.columns.add('chqBranch', sql.VarChar(5) , {nullable: true});
            table.columns.add('rejectReason', sql.VarChar(50) , {nullable: true});
            table.columns.add('navDate', sql.VarChar(10) , {nullable: true});
            table.columns.add('collateralAccount', sql.VarChar(20) , {nullable: true});
            table.columns.add('accountType', sql.VarChar(6) , {nullable: true});
            table.columns.add('recurringOrderId', sql.VarChar(20) , {nullable: true});
            table.columns.add('paymentStatus', sql.VarChar(10) , {nullable: true});
            table.columns.add('paymentProcessingType', sql.VarChar(1) , {nullable: true});
            table.columns.add('saRecurringOrderRefNo', sql.VarChar(30) , {nullable: true});
            table.columns.add('code', sql.VarChar(4) , {nullable: true});
            table.columns.add('message', sql.VarChar(100) , {nullable: true});


            datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));

            //console.dir(table1);
            let pool = await sql.connect(config);
            pool.request().bulk(table,function (err,result){
                if(err){
                    console.log(err) ;
                } else {
                    console.log(result);
                    console.log("Number of records inserted:"+result.rowsAffected);

                }
            
                pool.close();
                sql.close();
            });
            return callback("Import data to Fund_Cen_OrderInquiry is completed.");  
        }
    catch(error) {
        console.log(error);
        return callback(error);
    }
}
*/

async function importTradeCalendar(datarows, callback) {
    //TradeCalendar
    try {


        let table = new sql.Table('Fund_Cen_Trade_Calendar');

        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('TRANSACTION_CODE', sql.VarChar(3), { nullable: true });
        table.columns.add('TRADE_TYPE', sql.VarChar(), { nullable: true });
        table.columns.add('TRADE_DATE', sql.VarChar(8), { nullable: true });

        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));

        //console.dir(table1);
        let pool = await sql.connect(config);
        // await pool.request().query("DELETE FROM Fund_Cen_Trade_Calendar");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return callback("Import data to Fund_Cen_Trade_Calendar is completed.");
    } catch (error) {
        console.log(error);
        return callback(error);
    }
}

async function selectNavTable(callback){
    
    let statement = `SELECT     MFTS_Fund.Fund_Id, Fund_Cen_NAV.AMC_CODE, Fund_Cen_NAV.FUND_CODE, Fund_Cen_NAV.AUM, Fund_Cen_NAV.NAV, Fund_Cen_NAV.OFFER_NAV, Fund_Cen_NAV.BID_NAV, 
                                Fund_Cen_NAV.SWITCH_OUT, Fund_Cen_NAV.SWITCH_IN, Fund_Cen_NAV.NAV_DATE, Fund_Cen_NAV.SA_CODE_UNIT_LINK, Fund_Cen_NAV.TOTAL_UNIT, Fund_Cen_NAV.TOTAL_AUM_ALL, 
                                Fund_Cen_NAV.TOTAL_UNIT_ALL
                            FROM         Fund_Cen_NAV INNER JOIN
                                MFTS_Fund ON Fund_Cen_NAV.FUND_CODE = MFTS_Fund.Fund_Code
                            ORDER BY MFTS_Fund.Fund_Id, Fund_Cen_NAV.AMC_CODE, Fund_Cen_NAV.FUND_CODE `
                 //   WHERE nav_date >= @yesterday  AND  nav_date <= @today`
    try 
    {
    let data_nav
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
  
      }).then(result => {
         console.log("DATA NAV " +result.rowsAffected);
        data_nav = result.recordset;
        sql.close();
         
        return   callback(data_nav);  
  
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
async function SelectFundId(datas ,callback){ 

     //   console.log(datas)
   // let jdata =[]
    for ( let key in datas  ) {

        try 
        {
        let fundCode =  datas[key].fund_code
        // let data_row = 0
        let statement = `SELECT Fund_Id  FROM MFTS_Fund  WHERE Fund_Code = '${fundCode}' `
        //console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
    
        }).then(result => {
            //   console.log(result);
            let rowsAffected = result.rowsAffected.toString()
            sql.close();
            if(rowsAffected > 0){
                 //JSON PUSH 
                //idcard = idcard.replace(/['"]+/g, '') // clear doble cod
                let fund_id = result.recordset[0].Fund_Id
               // console.log("fund id :"+fund_id) 
                //CheckNavTable(fund_id , datas)  
                //let close_date = datas[0][key].nav_date
                // var myObj = { "state": rowsAffected,  "Fund_Id": fund_id };
                // let datarowsx = datas[0][key]
                // let dataparam = Object.assign(myObj, datarowsx)
                // jdata.push(dataparam) 
 
            }
        }).catch(err => {
            console.log(err);
            sql.close();
           // callback(err)
            // return   err;
        });
        } catch (error) {
        result = "ERROR Catch"
        console.log(error);
        // return   error;
       // callback(error)
        }
        // if (fundCode === "LHFL"){  return console.log("LHFL")} 
   }

   callback(datas) 
}
async function CheckNavTable(datarows ,callback){ 
    //let jdata =[]
    // console.log(datarows)
    console.time()
       for ( let key in datarows   ) {  
        try
        {
            // console.log(datarows[key])
    // //         //setTimeout(function () {
                let fund_id                  = datarows[key].Fund_Id
                let Close_Day               = datarows[key].NAV_DATE.substring(0,4)
                let Close_month             = datarows[key].NAV_DATE.substring(4,6)
                let Close_year              = datarows[key].NAV_DATE.substring(6,8)
                let Close_Date              = Close_Day +"-"+ Close_month +"-"+ Close_year// new Date(Close_Day +"/"+ Close_month +"/"+ Close_year)
                let statement = `SELECT Fund_Id  FROM MFTS_NavTable  WHERE Fund_ID = ${fund_id} AND Close_Date ='${Close_Date}'` // AND Close_Date ='${Close_Date}'
                // console.log(statement) 
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
                 
            }).then(result => {
                let rowsAffected = result.rowsAffected.toString()
                if (rowsAffected > 0){
                    //UPdate
                     updateTableNav(datarows[key]) 

                }else{
                    //Insert
                   insertTableNavNew(datarows[key])
  
                }

             }).catch(err => {
            console.log(err);
            sql.close();
            return   err;
            });
        
 
        }catch (error) {
            result = "ERROR Catch"
            console.log(error);

        }
       }
    // DataFundPerformance()
    console.timeEnd()
// return   callback("") 
}
async function CheckNavTable2(fundId,datarows,callback){ 
    try 
    {
    let fundCode =  fundId
    //let data_row = 0
    let Close_Day               = datarows.nav_date.substring(0,4)
    let Close_month             = datarows.nav_date.substring(4,6)
    let Close_year              = datarows.nav_date.substring(6,8)
    let Close_Date              = Close_Day +"/"+ Close_month +"/"+ Close_year// new Date(Close_Day +"/"+ Close_month +"/"+ Close_year)
    let statement = `SELECT Fund_Id  FROM MFTS_NavTable  WHERE Fund_ID = '${fundCode}'  AND Close_Date ='${Close_Date}'`
    //console.log(statement);
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);

    }).then(result => {
        // data_row = result.rowsAffected.toString()
        // let datarowsx = datas[0][key] 
        // console.log("result: "+ JSON.stringify(result.rowsAffected[0]))
         let rowsAffected = JSON.stringify(result.rowsAffected[0])
        // console.log(rowsAffected)
        sql.close();
        //callback(rowsAffected,datarows)
        // sql.close(); 
    }).catch(err => {
       // console.log(err);
        sql.close();
        //callback(-1,datarows) 
        // return   err; 
    });
    } catch (error) {
    result = "ERROR Catch"
    console.log(error);
    // return   error;
    }

    // push data

    callback('ttttt')

}

async function insertTableNav(datarows){

    try 
    {
        let Fund_Id                 = datarows.Fund_Id  
        let Close_year              = datarows.nav_date.substring(0,4)
        let Close_month             = datarows.nav_date.substring(4,6)
        let Close_Day               = datarows.nav_date.substring(6,8)
        let Close_Date              = Close_year+"-"+ Close_month +"-"+ Close_Day //new Date(Close_Day +"-"+ Close_month +"-"+ Close_year)
        let Nav_Price               = datarows.nav
        let Asset_Size              = datarows.aum
        let APIstatus               = "I"
        const to_Date               = new Date()
        let Create_Date             =  to_Date.getFullYear()+"-"+ (to_Date.getMonth()+1)  +"-"+ to_Date.getDate()//new Date(to_Date.getDate() +"-"+ (to_Date.getMonth()+1) +"-"+ to_Date.getFullYear())
        let Create_By               = "157"
        let Offer_Price             = datarows.offer_nav
        let Bid_Price               = datarows.bid_nav
        let OfferSwitch_Price       = datarows.switch_out
        let BidSwitch_Price         = datarows.switch_in
        // let Modify_By               = "999"
        let FUNDCODEI               = datarows.fund_code 
 
        if(Nav_Price === undefined || Nav_Price ===""){Nav_Price = 0.0000}
        if(Asset_Size === undefined || Asset_Size ===""){Asset_Size = 0.00}
        if(Offer_Price === undefined || Offer_Price ===""){Offer_Price = 0.0000}
        if(OfferSwitch_Price === undefined || OfferSwitch_Price ===""){OfferSwitch_Price = 0.0000}
        if(BidSwitch_Price === undefined || BidSwitch_Price ===""){BidSwitch_Price = 0.0000}
        if(Bid_Price === undefined || Bid_Price ===""){Bid_Price = 0.0000}
        //var statement = `INSERT INTO MFTS_NavTable (Fund_Id, Close_Date,    Nav_Price,      Asset_Size, APIstatus, Create_Date, Create_By, Offer_Price, Bid_Price, OfferSwitch_Price, BidSwitch_Price, Modify_By, FUNDCODEI ) 
        //                              VALUES (@Fund_Id, @Close_Date , @Nav_Price,       @Asset_Size, @APIstatus, @Create_Date, @Create_By, @Offer_Price, @Bid_Price, @OfferSwitch_Price, @BidSwitch_Price, @Modify_By  ,@FUNDCODEI );`
        // var statement = `INSERT INTO MFTS_Fund (Fund_Id,   APIstatus, Create_Date, Create_By,   Modify_By ) 
        //                               VALUES (@Fund_Id,   @APIstatus, @Create_Date, @Create_By, @Modify_By   );`
        //console.log( datarows);

        let table = new sql.Table('MFTS_NavTable');
        table.columns.add('Fund_Id', sql.Int, { nullable: false });
        table.columns.add('Close_Date', sql.DateTime, { nullable: false }); 
        table.columns.add('Nav_Price', sql.Numeric(18,4), { nullable: true });
        table.columns.add('Offer_Price', sql.Numeric(18,4), { nullable: true });
        table.columns.add('Bid_Price', sql.Numeric(18,4), { nullable: true });
        table.columns.add('OfferSwitch_Price', sql.Numeric(18,4), { nullable: true });
        table.columns.add('BidSwitch_Price', sql.Numeric(18,4), { nullable: true });
        table.columns.add('Asset_Size', sql.Numeric(25,2), { nullable: true });
        table.columns.add('APIstatus', sql.NChar(10), { nullable: true });
        table.columns.add('FUNDCODEI', sql.NChar(50), { nullable: true });
        table.columns.add('Create_Date', sql.DateTime, { nullable: true });
        table.columns.add('Create_By', sql.VarChar(20), { nullable: true });

 
        let datas = [
                    [   Fund_Id,
                        Close_Date,
                        Nav_Price,
                        Offer_Price,
                        Bid_Price,
                        OfferSwitch_Price,
                        BidSwitch_Price,
                        Asset_Size,
                        APIstatus,
                        FUNDCODEI,
                        Create_Date,
                        Create_By
                    ]
        ];
  
        datas.forEach(async(data) => {
            table.rows.add.apply(table.rows, await jdatatoArray3(data));
        });

        let pool = await sql.connect(config); 
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                //console.log("Number of records inserted:" + result.rowsAffected);  
                console.log("Fund ID : " +Fund_Id +" Insert  Complete");  
            }

            pool.close();
            sql.close();
        });

     
    } catch (error) { 
      console.log(error);
      sql.close();
     // return callback(error);
    }

}
async function insertTableNavNew(datarows){
        let Fund_Id                 = datarows.Fund_Id
        let Close_year              = datarows.NAV_DATE.substring(0,4)
        let Close_month             = datarows.NAV_DATE.substring(4,6)
        let Close_Day               = datarows.NAV_DATE.substring(6,8)
        let Close_Date              = Close_year+"-"+ Close_month +"-"+ Close_Day //new Date(Close_Day +"-"+ Close_month +"-"+ Close_year)
        let Nav_Price               = datarows.NAV
        let Asset_Size              = datarows.AUM
        let APIstatus               = "I"
        const to_Date               = new Date()
        let Create_Date             =  to_Date.getFullYear()+"-"+ (to_Date.getMonth()+1)  +"-"+ to_Date.getDate()//new Date(to_Date.getDate() +"-"+ (to_Date.getMonth()+1) +"-"+ to_Date.getFullYear())
        let Create_By               = "157"
        let Offer_Price             = datarows.OFFER_NAV
        let Bid_Price               = datarows.BID_NAV
        let OfferSwitch_Price       = datarows.SWITCH_OUT
        let BidSwitch_Price         = datarows.SWITCH_IN
        // let Modify_By               = "999"
        let FUNDCODEI               = datarows.FUND_CODE 
 
        if(Nav_Price === undefined || Nav_Price ===""){Nav_Price = 0.0000} 
        if(Asset_Size === undefined || Asset_Size ===""){Asset_Size = 0.00}
        if(Offer_Price === undefined || Offer_Price ===""){Offer_Price = 0.0000}
        if(OfferSwitch_Price === undefined || OfferSwitch_Price ===""){OfferSwitch_Price = 0.0000}
        if(BidSwitch_Price === undefined || BidSwitch_Price ===""){BidSwitch_Price = 0.0000}
        if(Bid_Price === undefined || Bid_Price ===""){Bid_Price = 0.0000}
        try{

            let statement = `INSERT INTO  MFTS_NavTable (Fund_Id,Close_Date,Nav_Price,Offer_Price,Bid_Price,OfferSwitch_Price,
                                                        BidSwitch_Price,Asset_Size,APIstatus,FUNDCODEI,Create_Date, Create_By)
                                                        VALUES(
                                                        @Fund_Id,@Close_Date,@Nav_Price,@Offer_Price,@Bid_Price,@OfferSwitch_Price,
                                                        @BidSwitch_Price,@Asset_Size,@APIstatus,@FUNDCODEI,@Create_Date,@Create_By)  `



        await new sql.ConnectionPool(config).connect().then(pool => {   
            return pool.request()
            .input("Fund_Id"            , sql.NVarChar, Fund_Id)
            .input("Close_Date"         , sql.DateTime, Close_Date)
            .input("Nav_Price"          , sql.Numeric(18,4), Nav_Price)
            .input("Asset_Size"          , sql.Numeric(25,2), Asset_Size)
            .input("Offer_Price"        , sql.Numeric(18,4), Offer_Price)
            .input("Bid_Price"          , sql.Numeric(18,4), Bid_Price)
            .input("OfferSwitch_Price"  , sql.Numeric(18,4), OfferSwitch_Price)
            .input("BidSwitch_Price"    , sql.Numeric(18,4), BidSwitch_Price)
            .input("APIstatus"          , sql.NVarChar, APIstatus)
            .input("Create_Date"        , sql.DateTime, Create_Date)
            .input("Create_By"          , sql.NVarChar, Create_By)
            .input("FUNDCODEI"          , sql.NVarChar, FUNDCODEI)
            .query(statement); 
  
        }).then(result => {
            sql.close();
           // console.log(result);
            // console.log("Number of records inserted:" + result.rowsAffected);  
            console.log("Fund ID : " +Fund_Id +" Insert Complete");  
            // return callback(result);  
  
        }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
        }); 
    } catch (error) {
    //   result = "nook" 
      console.log(error);
    //  return callback(error);
    }
}
async function updateTableNav(datarows){

    try 
    {   //
        const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2);
        // if (date.toString().length = 1) {date = "0"+ date ;}
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let date_present = year +"-"+  month  +"-"+ date
       //console.log("xxxxxxx")
        let Fund_Id                 = datarows.Fund_Id
        let Close_year              = datarows.NAV_DATE.substring(0,4)
        let Close_month             = datarows.NAV_DATE.substring(4,6)
        let Close_Day               = datarows.NAV_DATE.substring(6,8)
        let Close_Date              = Close_year +"-"+ Close_month +"-"+ Close_Day // new DateTime(Close_year +"-"+ Close_month +"-"+ Close_Day)
        let Nav_Price               = datarows.NAV
        let Asset_Size              = datarows.AUM 
        let APIstatus               = "U" 
        // const to_Date               = new DateTime() 
        let Modify_Date             = date_present //to_Date.getDate() +"-"+ (to_Date.getMonth()+1) +"-"+ to_Date.getFullYear()
        // let Create_By               = "999"
        let Offer_Price             = datarows.OFFER_NAV
        let Bid_Price               = datarows.BID_NAV
        let OfferSwitch_Price       = datarows.SWITCH_OUT
        let BidSwitch_Price         = datarows.SWITCH_IN
        let Modify_By               = "157"
        let FUNDCODEI               = datarows.FUND_CODE  
        
        if(Nav_Price === undefined || Nav_Price ===""){Nav_Price = 0.0000}
        if(Asset_Size === undefined || Asset_Size ===""){Asset_Size = 0.00}
        if(Offer_Price === undefined || Offer_Price ===""){Offer_Price = 0.0000}
        if(OfferSwitch_Price === undefined || OfferSwitch_Price ===""){OfferSwitch_Price = 0.0000}
        if(BidSwitch_Price === undefined || BidSwitch_Price ===""){BidSwitch_Price = 0.0000}
        if(Bid_Price === undefined || Bid_Price ===""){Bid_Price = 0.0000}

        let statement = `UPDATE MFTS_NavTable 
                                        SET Nav_Price           = @Nav_Price,
                                            Offer_Price         = @Offer_Price,
                                            Bid_Price           = @Bid_Price,
                                            Asset_Size          = @Asset_Size,
                                            OfferSwitch_Price   = @OfferSwitch_Price,
                                            BidSwitch_Price     = @BidSwitch_Price,
                                            APIstatus           = @APIstatus,
                                            Modify_Date         = @Modify_Date,
                                            Modify_By           = @Modify_By,
                                            FUNDCODEI           = @FUNDCODEI 
                                        WHERE  Fund_Id= @Fund_Id And Close_Date = @Close_Date ` 
        // console.log(statement) 
        await new sql.ConnectionPool(config).connect().then(pool => {   
            return pool.request()
            .input("Fund_Id"            , sql.NVarChar,      Fund_Id)
            .input("Close_Date"         , sql.DateTime,      Close_Date)
            .input("Nav_Price"          , sql.Numeric(18,4), Nav_Price)
            .input("Asset_Size"          , sql.Numeric(25,2), Asset_Size)
            .input("Offer_Price"        , sql.Numeric(18,4), Offer_Price)
            .input("Bid_Price"          , sql.Numeric(18,4), Bid_Price)
            .input("OfferSwitch_Price"  , sql.Numeric(18,4), OfferSwitch_Price)
            .input("BidSwitch_Price"    , sql.Numeric(18,4), BidSwitch_Price)
            .input("APIstatus"          , sql.NVarChar,      APIstatus)
            .input("Modify_Date"        , sql.DateTime,      Modify_Date)
            .input("Modify_By"          , sql.NVarChar,      Modify_By)
            .input("FUNDCODEI"          , sql.NVarChar,      FUNDCODEI)
            .query(statement);
  
        }).then(result => {
            sql.close();
           // console.log(result);
            // console.log("Number of records inserted:" + result.rowsAffected);  
            console.log("Fund ID : " +Fund_Id +" Update Complete");  
            // return callback(result);  
  
        }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
        }); 
    } catch (error) {
    //   result = "nook" 
      console.log(error);
    //  return callback(error);
    }


}
async function importNavTable(datarwos ,callback){
    
    try {
        let statement
        let data_row = datarwos.length;
         console.log(data_row)
        if (data_row > 0) {
            for (let i = 0; i < data_row; i++) {
                //setTimeout(function () {
                if (datarwos[i].dbFlag === 'insert'){
                   await insertTableNavNew(datarwos[i] ,(x)=>{})
                   // console.log(datarwos[i].Fund_Id)

                }
                if (datarwos[i].dbFlag === 'update'){
                   await updateTableNav(datarwos[i],(x)=>{})
                 //   console.log(datarwos[i].Fund_Id)  

                } 
               
               // },i* 1500);   
            }
            //console.timeStamp() 
        }
        
         // return callback("Import data to Navtable "+ data_row+" row is completed.");
    } catch (error) {
        console.log(error);
      //  return callback(error);
      
    }
}

async function getIdFund(fundCode ){

   // console.log(fundCode)
     
    try 
    {
    let data_row = 0
    let statement = `SELECT Fund_Id  FROM MFTS_Fund  WHERE Fund_Code = '${fundCode}' `
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
  
      }).then(result => {
        console.log(result);
        data_row = result.rowsAffected.toString();
        console.log("result: "+ data_row)
        sql.close();

        return  data_row;
  
      }).catch(err => {
        console.log(err);
        sql.close();
        return   err;
      });
    } catch (error) {
      result = "ERROR Catch"
      console.log(error);
      return   error;
    }

   // return data_row ;
}
async function importError(db,detail,jobName){
    try {
        let desc        
        switch (jobName) {
            case "AccountInfo":
                desc            = "database = "+ db +" | ID Cardnumber = "+ detail

                break;

            default:
                console.log("No db error name...");
                break;

        }

        let to_Date         = new DateTime()
        let datenow         = new DateTime(to_Date.getDate() +"-"+ (to_Date.getMonth()+1) +"-"+ to_Date.getFullYear())
        let table           = new sql.Table('Fund_Errlog_TransferData');
        table.columns.add('Descriptions', sql.NChar(100), { nullable: false });
        table.columns.add('TimeLines', sql.DateTime, { nullable: false }); 
        table.columns.add('Status', sql.NChar(10), { nullable: true });
        
        let datas = [
                    [   desc,
                        datenow,
                        "API" 
                    ]
        ];
  
        datas.forEach(async(data) => {
            table.rows.add.apply(table.rows, await jdatatoArray3(data));
        });

        let pool = await sql.connect(config); 
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log(" inserted: Error" + result.rowsAffected);  
                
            }

            pool.close();
            sql.close();
        });
       
    } catch (error) {
            result = "ERROR Catch"
            console.log(error);
            return   error;
           
    }

}
async function truncateTable(dbname ,callback){
    let statement = `truncate table  ${dbname} `
    try 
    {
    //let data_nav
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
    
        }).then(result => {
            console.log("truncateTable " + dbname + "Success");
            //data_nav = result.recordsets;
            sql.close();
            return   callback(1);  
    
        }).catch(err => {
            console.log(err);
        sql.close();
        return   callback(0);
        });
    } catch (error) {
      result = "ERROR Catch"
      console.log(error);
      //return   callback(error);
    }
}

async function serverdatex(callback){
    const today                 = new Date()
    let date_ob                 = new Date(today);
    let date                    = ("0"+date_ob.getDate()).slice(-2); 
    let month                   = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year                    = date_ob.getFullYear();
    let date_now                = year +"/"+  month  +"/"+ date
    return callback(date_now)
}
async function putDataFileApi(datas, callback){
    try{

        let table     = new sql.Table('Fund_Cen_DatafileApi');
        table.columns.add('Descriptions', sql.NChar(100), { nullable: false });
        table.columns.add('TimeLines', sql.DateTime, { nullable: false }); 
        table.columns.add('Status', sql.NChar(10), { nullable: true });

        datas.forEach(async(data) => {
            table.rows.add.apply(table.rows, await jdatatoArray3(data));
        });

        let pool = await sql.connect(config); 
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log(" inserted: Error" + result.rowsAffected);  
                
            }

            pool.close();
            sql.close();
        });


    }catch{

    }
    return callback("xxx")
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
          //console.log( "MKTIID = "+mktid)
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
async function checkunibalanceupdate(callback){
    let statement = `SELECT top(1)*  FROM MFTS_UnitBalance_logApi  order by log_id desc   ;`  
    let datanow
    await getdatetime((dt)=>{datanow = dt})
    //console.log(statement)
    try
    { 
    await new sql.ConnectionPool(config).connect().then(pool => {
    return pool.request()
    .query(statement);

    }).then(result => {
    let rowsAffected = result.rowsAffected.toString()
    let dateupdate = null
    if (rowsAffected > 0){  dateupdate = result.recordset[0].Create_Date }
    sql.close();
    
    let today = new Date(datanow)
    let dateapi = new Date(dateupdate)

    let date_ob = new Date(datanow);
    let date = ("0"+date_ob.getDate()).slice(-2);
    // if (date.toString().length = 1) {date = "0"+ date ;}
    let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let date_present = year +  month  + date

    let date_upd = new Date(dateupdate);
    let date_up = ("0"+date_upd.getDate()).slice(-2);
    // if (date.toString().length = 1) {date = "0"+ date ;}
    let month_up = ("0"+ (date_upd.getMonth() + 1)).slice(-2);
    let year_up = date_upd.getFullYear();
    let date__up = year_up +  month_up  + date_up

    console.log(date__up)
    console.log(date_present)
    let returnflag = 0
    if (date__up === date_present){
        returnflag = 1
    }
    if(dateupdate === null){return callback(0)}
    return callback(returnflag)
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
async function updateDipchipForAccount(datarwos ,callback){
    try {
        let statement
        // console.log(datarwos)
        let data_row = datarwos.length;
            // console.log(data_row)
        if (data_row > 0) {
            for (let i = 0; i < data_row; i++) {
                let statement = `UPDATE   Account_Info
                                SET Dipchip = @dipchip
                                WHERE  Cust_Code= @Cust_Code   `  
                await new sql.ConnectionPool(config).connect().then(pool => {   
                    return pool.request()
                    .input("dipchip"            , sql.NVarChar(1),      'X')
                    .input("Cust_Code"         , sql.NVarChar(15),      datarwos[i].IDCard)
                    .query(statement);
        
                }).then(result => {
                    sql.close();
                // console.log(result);
                    // console.log("Number of records inserted:" + result.rowsAffected);  
                    console.log("Dipchip : " +datarwos[i].IDCard +" Update Complete");  
                    // return callback(result);  
        
                }).catch(err => {
                    console.log(err);
                    sql.close();
                    // return callback(err);
                }); 
    
            }
            //console.timeStamp() 
        }
        
          
    } catch (error) {
        console.log(error);
      //  return callback(error);
      
    }
    return callback("success")
}
async function selectdataprepareunitbalance (callback){
    let statement = `SELECT dbo.V_PREPARE_UNITBALANCE.TRANSACTION_ID, 
                        dbo.V_PREPARE_UNITBALANCE.STATUS, 
                        dbo.V_PREPARE_UNITBALANCE.UNIT_BALANCE, 
                        dbo.V_PREPARE_UNITBALANCE.TRANS_CODE, 
                        dbo.V_PREPARE_UNITBALANCE.FUND_CODE, 
                        dbo.V_PREPARE_UNITBALANCE.UNITHOLDER_ID, 
                        dbo.V_PREPARE_UNITBALANCE.ACCOUNT_ID, 
                        dbo.V_PREPARE_UNITBALANCE.Fund_Id, 
                        dbo.V_PREPARE_UNITBALANCE.Amc_Id, 
                        dbo.V_PREPARE_UNITBALANCE.Ref_no, 
                        dbo.MFTS_UnitBalance.Confirm_Unit
                    FROM dbo.V_PREPARE_UNITBALANCE LEFT OUTER JOIN
                        dbo.MFTS_UnitBalance ON 
                        dbo.V_PREPARE_UNITBALANCE.Fund_Id = dbo.MFTS_UnitBalance.Fund_Id
                        AND 
                        dbo.V_PREPARE_UNITBALANCE.Ref_no = dbo.MFTS_UnitBalance.Ref_No
                    WHERE (dbo.V_PREPARE_UNITBALANCE.STATUS = 'ALLOTTED') AND dbo.V_PREPARE_UNITBALANCE.TRANSACTION_ID = '1412302150014130' `  
              //console.log(statement) AND dbo.V_PREPARE_UNITBALANCE.TRANSACTION_ID = '1412301190002076'
  try
  { 
    await new sql.ConnectionPool(config).connect().then(pool => { 
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //  console.log("DATA NAV " +result.rowsAffected);
        // data_nav = result.recordset;
        sql.close();
         
        return   callback(result.recordset);  
  
      }).catch(err => {
        console.log(err);
       sql.close();
        return   callback(err);
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      return callback(error)
  }
}
async function setdataprepareunitbalance(datarows ,callback){
    // let statement
    let count_row = datarows.length;
    console.log("result prapare : " +count_row)
    for (const key in datarows) {
        try{
            
            let RefNo                       = datarows[key].Ref_no
            let Fund_Id                     = datarows[key].Fund_Id
            let UNIT_BALANCE                = datarows[key].UNIT_BALANCE
            let FUND_CODE                   = datarows[key].FUND_CODE
            let UNITHOLDER_ID               = datarows[key].UNITHOLDER_ID
            let Confirm_Unit                = datarows[key].Confirm_Unit
            let TRANSACTION_ID              = datarows[key].TRANSACTION_ID
            let TRANS_CODE                  = datarows[key].TRANS_CODE
            
            if(Confirm_Unit == UNIT_BALANCE && Confirm_Unit > 0 ){continue;}
            if(Fund_Id === undefined || Fund_Id === null){  continue;  }
            if(RefNo === undefined || RefNo === null) { 
                // setdatapreparmftsaccount(datarows[key])
                continue;
            } // insert mfts_account /update ?
           
            let  statement = `SELECT   Fund_Id, Ref_No, Submit_Unit, Confirm_Unit, NotClearing_Unit, Pledge_Unit, Modify_Date, IT_UPDATE, APIstatus, FUNDCODEI, UNITHOLDERI
                            FROM MFTS_UnitBalance  WHERE Fund_Id =${Fund_Id} AND Ref_No = '${RefNo}' `
            // console.log(statement) 
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
            
                }).then(result => {
                
                let data_row = result.rowsAffected.toString();
                
                if(data_row == 0 ){

                    //INSERT
                     setmftsunitbalance(RefNo,Fund_Id,UNIT_BALANCE,1,FUND_CODE,UNITHOLDER_ID)  
                }else{
                    //UPDATE 
                   setmftsunitbalance(RefNo,Fund_Id,UNIT_BALANCE,0,FUND_CODE,UNITHOLDER_ID) // update Unitbalance
                //   updattranscationunibalace(TRANSACTION_ID,TRANS_CODE,UNIT_BALANCE) //transaction
                }
                
                sql.close();
                // console.log(result.recordset)
                // return  callback(result.recordset) 
            
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
    return callback("Prapared : " + count_row +" rows")
}
async function updattranscationunibalace(TRANSACTION_ID,TRANS_CODE,UNIT_BALANCE,callback){
    try{
      let  statement = `UPDATE MFTS_Transaction SET Unit_Balance=@UNIT_BALANCE WHERE transactionId= @TRANSACTION_ID AND TRANTYPECODEX = @TRANS_CODE `
        await new sql.ConnectionPool(config).connect().then(pool => {   
            return pool.request()
            .input("TRANSACTION_ID"         , sql.NVarChar(20),             TRANSACTION_ID)
            .input("TRANS_CODE"            , sql.NChar(5),                   TRANS_CODE)
            .input("UNIT_BALANCE"           , sql.Decimal(18,4),             UNIT_BALANCE)
            .query(statement);

        }).then(result => {
            sql.close();
        // console.log(result);
            // console.log("Number of records inserted:" + result.rowsAffected);  
            console.log("MFTS_Transaction : TRANSACTION_ID :" +TRANSACTION_ID +' UNIT_BALANCE :'+ UNIT_BALANCE+"   Complete");  
            // return callback(result);  

        }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
        }); 

    } catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }
}
async function setmftsunitbalance(RefNo,Fund_Id,UNIT_BALANCE,flag_unit,FUND_CODE,UNITHOLDER_ID,callback){
    let statement = null
    let APIstatus = null
    let modify_date = null
    // try{
    // console.log(flag_unit)
    if(flag_unit == 1){
        APIstatus = "I"
        statement = `INSERT INTO MFTS_UnitBalance (Ref_No,Fund_Id,Confirm_Unit,Modify_Date,APIstatus,FUNDCODEI,UNITHOLDERI,UNIT_BALANCE)
                     VALUES (@RefNo,@Fund_Id,@UNIT_BALANCE,@Modify_Date,@APIstatus,@FUNDCODEI,@UNITHOLDERI,@UNIT_BALANCE)`
    }else{
        APIstatus = "U"
        statement = `UPDATE MFTS_UnitBalance SET UNIT_BALANCE=@UNIT_BALANCE ,Confirm_Unit=@UNIT_BALANCE ,APIstatus=@APIstatus ,FUNDCODEI=@FUNDCODEI ,UNITHOLDERI=@UNITHOLDERI  WHERE Ref_No= @RefNo AND Fund_Id = @Fund_Id`
        //,Confirm_Unit=@UNIT_BALANCE
    }
    await getdatetime( (dt) =>{modify_date = dt  })
    // console.log(statement)
    try{
        await new sql.ConnectionPool(config).connect().then(pool => {   
            return pool.request()
            .input("RefNo"              , sql.NVarChar(12),          RefNo)
            .input("Fund_Id"            , sql.Int,                   Fund_Id)
            // .input("Confirm_Unit"       , sql.Decimal(18,4),         UNIT_BALANCE)
            .input("UNIT_BALANCE"       , sql.NVarChar(30),          UNIT_BALANCE)
            .input("Modify_Date"        , sql.DateTime,              modify_date)
            .input("APIstatus"         , sql.NVarChar(10),           APIstatus)
            .input("FUNDCODEI"         , sql.NVarChar(50),           FUND_CODE)
            .input("UNITHOLDERI"        , sql.NVarChar(30),          UNITHOLDER_ID) 
            .query(statement);

        }).then(result => {
            sql.close();
        // console.log(result);
            // console.log("Number of records inserted:" + result.rowsAffected);  
            console.log(flag_unit +"MFTS_UnitBalance : ref_no :" +RefNo +' fund id :'+ Fund_Id+"   Complete");  
            // return callback(result);  

        }).catch(err => {
            console.log(err);
            sql.close();
            // return callback(err);
        }); 

    } catch (error) {
        result = "ERROR Catch"
        console.log(error);
        return   callback(error);
    }
        
    // return callback("done")
}
async function setmtfsaccountamcnull (callback){
    let statement = `UPDATE MFTS_Account SET Amc_Id = 0 WHERE (Amc_Id IS NULL) `  
              //console.log(statement)
  try
  { 
    await new sql.ConnectionPool(config).connect().then(pool => { 
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //  console.log("DATA NAV " +result.rowsAffected);
        // data_nav = result.recordset;
        sql.close();
         
        return   callback(result.recordset);  
  
      }).catch(err => {
        console.log(err);
       sql.close();
        return   callback(err);
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
      return callback(error)
  }
}

 
async function setdatapreparmftsaccount(datarows,callback){
    for (const key in datarows) {
            try{
                
                let RefNo                       = datarows[key].Ref_No
                let Fund_Id                     = datarows[key].Fund_Id
                let UNIT_BALANCE                = datarows[key].UNIT_BALANCE
                let FUND_CODE                   = datarows[key].FUND_CODE
                let UNITHOLDER_ID               = datarows[key].UNITHOLDER_ID
                let Confirm_Unit               = datarows[key].Confirm_Unit
                let accountno                   = datarows[key].ACCOUNT_ID
                let amc_id                   = datarows[key].Amc_Id
            let statement = `SELECT * FROM MFTS_ACCOUNT  WHERE Ref_No=@ref_no AND ACCOUNT_NO=@account_no AND AMC_ID=@amc_id`
        await new sql.ConnectionPool(config).connect().then(pool => { 
            return pool.request()
            .input("ref_no"           ,sql.NVarChar(12)           ,RefNo)
            .input("account_no"           ,sql.NVarChar(20)       ,accountno)
            .input("amc_id"           ,sql.Int                    ,amc_id)
            .query(statement);
        
            }).then(result => {
                let data_row = result.rowsAffected.toString();
                if(data_row > 0 ){
                        //update
                        if(result.recordset[0].Holder_Id ===null){
                            updateHolderIdToMftsUnitholder(RefNo,accountno,amc_id,UNITHOLDER_ID)
                        }
                }else{
                    if(UNITHOLDER_ID !==null && RefNo === null){
                        //updateHolderIdToMftsUnitholder(RefNo,accountno,amc_id,UNITHOLDER_ID)
                        checkMftsAccount(RefNo,accountno,amc_id,UNITHOLDER_ID)
                    }else{
                        //insert
                        insertMFtsAcccount(accountno, UNITHOLDER_ID ,amc_id, RefNo)
                    }
                        
                }
            sql.close();
            
            return   callback(result.recordset);  
        
            }).catch(err => {
            console.log(err);
            sql.close();
            return   callback(err);
            });
    
        }catch (error) {
            // result = "ERROR Catch"
            console.log(error);
            return callback(error)
        }
    }
        
}
async function updateHolderIdToMftsUnitholder(RefNo,accountno,amc_id,UNITHOLDER_ID){
    let statement = null
    if(RefNo === null){
        statement = `UPDATE MFTS_Account SET Holder_Id = '${UNITHOLDER_ID}' WHERE  Account_No = '${accountno}' AND Amc_Id=${amc_id} AND Holder_Id is null`
    }else{
         statement = `UPDATE MFTS_Account SET Holder_Id = '${UNITHOLDER_ID}' WHERE Ref_No= '${RefNo}' AND Account_No = '${accountno}' AND Amc_Id=${amc_id}` 
    }
      
            //   console.log(statement)
  try
  { 
    await new sql.ConnectionPool(config).connect().then(pool => { 
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //  console.log("DATA NAV " +result.rowsAffected);
        // data_nav = result.recordset;
        sql.close();
         
        // return   callback(result.recordset);  
  
      }).catch(err => {
        console.log(err);
       sql.close();
        // return   callback(err);
      });

  }catch (error) {
      // result = "ERROR Catch"
       console.log(error);
    //   return callback(error)
  }

}
async function insertMFtsAcccount(accountno, unitholder ,Amc_Id, ref_no){
    if(ref_no === null){  await getRefx("Ref_No",1 , (ref)=>{ref_no = ref })}
    console.log(ref_no)  
    let  statement = `SELECT * FROM  Account_Info WHERE Cust_Code ='${accountno}'  ` //AND Amc_Id = '${Amc_Id}'
    let datenow 
    await getdatetime( (dt) =>{datenow = dt  })
    let usercreated = "146"
    
    if(unitholder.substring(0,2)=== "DM"){unitholder = null}
    
try
    { 
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
           let rowsAffected = result.rowsAffected
              console.log("result mtfs  Account :"+ rowsAffected)
            console.log(result)
            if (rowsAffected > 0){
                let Title_Name_T            = result.recordset[0].Title_Name_T
                let First_Name_T            = result.recordset[0].First_Name_T
                let Last_Name_T             = result.recordset[0].Last_Name_T
                let Birth_Day               = result.recordset[0].Birth_Day
                let Title_Name_E            = result.recordset[0].Title_Name_E
                let First_Name_E            = result.recordset[0].First_Name_E
                let Last_Name_E             = result.recordset[0].Last_Name_E
                let Nation_Code             = result.recordset[0].Nation_Code
                let Sex                     = result.recordset[0].Sex
                let Mobile_no               = result.recordset[0].Mobile
                let Email                   = result.recordset[0].Email
                let Married_Status          = null
                let OpenDate                = result.recordset[0].Create_Date
                let Create_By               = "146"
                let typeaccount             = "" //"RED"
                // แก้ไข หน้า คอนเน็ก  customer report  marketing code  is parichart 2022-09-22
                let MktId                   = result.recordset[0].MktId

                let insertMFtsAcccount = `INSERT INTO MFTS_ACCOUNT(Ref_No, Account_No ,First_Name_T, Last_Name_T, Birth_Day, Holder_Id ,Create_By
                                            ,Create_Date ,Modify_By, Modify_Date, Amc_Id, Open_Date	,Title_Name_E, First_Name_E
                                            ,Last_Name_E, Nation_Code, Title_Name_T, Sex, Mobile_no, Email, Married_Status
                                            ,PID_Type, PID_No, Tax_No, PayRedemption_Type, Detuct_Tax, PresentAddr_Flag, OfficeAddr_Flag
                                            ,HaveFixedIncome, HaveEquity, HaveFund, Corp_Type_Id, Marketing_Code, Client_Acc_Type
                                            ,Status_Id, Submit_By, Submit_Date, Completed_By, Completed_Date, FeeRate_Group, Input_Type
                                            ,Status_API, Occupation_Code)
                                            VALUES(@Ref_No, @Account_No, @First_Name_T, @Last_Name_T, @Birth_Day, @Holder_Id ,@Create_By
                                            ,@Create_Date ,@Modify_By, @Modify_Date, @Amc_Id, @Open_Date ,@Title_Name_E, @First_Name_E,
                                            @Last_Name_E, @Nation_Code, @Title_Name_T, @Sex, @Mobile_no, @Email, @Married_Status
                                            ,@PID_Type, @PID_No, @Tax_No, @PayRedemption_Type ,@Detuct_Tax, @PresentAddr_Flag, @OfficeAddr_Flag
                                            ,@HaveFixedIncome, @HaveEquity, @HaveFund, @Corp_Type_Id, @Marketing_Code, @Client_Acc_Type
                                            ,@Status_Id, @Submit_By, @Submit_Date, @Completed_By, @Completed_Date, @FeeRate_Group, @Input_Type
                                            ,@Status_API, @Occupation_Code)`
                new sql.ConnectionPool(config).connect().then(pool => {
                    return pool.request()
                    .input("Ref_No",                            sql.VarChar(12),                ref_no)
                    .input("Account_No",                        sql.VarChar(20),                accountno)
                    .input("Title_Name_T",                      sql.NVarChar(20),                Title_Name_T)
                    .input("First_Name_T",                      sql.NVarChar(200),              First_Name_T)
                    .input("Last_Name_T",                      sql.NVarChar(200),              Last_Name_T)
                    .input("Birth_Day",                         sql.DateTime,                   Birth_Day)
                    .input("Holder_Id",                         sql.VarChar(30),                unitholder)
                    .input("Create_By",                         sql.VarChar(20),                Create_By)
                    .input("Modify_By",                         sql.VarChar(20),                Create_By)
                    .input("Create_Date",                       sql.DateTime,                   datenow)
                    .input("Modify_Date",                       sql.DateTime,                   datenow)
                    .input("Amc_Id",                            sql.Int,                        Amc_Id)
                    .input("Open_Date",                         sql.DateTime,                   OpenDate)
                    .input("Title_Name_E",                      sql.VarChar(20),                Title_Name_E)
                    .input("First_Name_E",                      sql.NVarChar(200),              First_Name_E)
                    .input("Last_Name_E",                       sql.NVarChar(200),              Last_Name_E)
                    .input("Nation_Code",                       sql.NVarChar(200),              Nation_Code)
                    .input("Sex",                               sql.Char(1),                    Sex)
                    .input("Mobile_No",                         sql.VarChar(20),                Mobile_no)
                    .input("Email",                             sql.NVarChar(100),              Email)
                    .input("Married_Status",                    sql.Char(1),                    Married_Status)
                    .input("PID_Type",                          sql.Char(1),                    "C")
                    .input("PID_No",                            sql.VarChar(20),                accountno)
                    .input("Tax_No",                            sql.VarChar(20),                accountno)
                    .input("PayRedemption_Type",                sql.Char(1),                    "A")
                    .input("Detuct_Tax",                        sql.Char(1),                    "1")
                    .input("PresentAddr_Flag",                  sql.Char(1),                    "P")
                    .input("OfficeAddr_Flag",                   sql.Char(1),                    "O")
                    .input("HaveFixedIncome",                   sql.Char(1),                    "0")
                    .input("HaveEquity",                        sql.Char(1),                    "0")
                    .input("HaveFund",                          sql.Char(1),                    "0")
                    .input("Corp_Type_Id",                      sql.Char(1),                    "0")
                    .input("Marketing_Code",                    sql.Int,                        MktId)
                    .input("Client_Acc_Type",                   sql.Char(1),                    "1")
                    .input("Status_Id",                         sql.Int,                          7)
                    .input("Submit_By",                         sql.VarChar(20),                 MktId)
                    .input("Submit_Date",                       sql.DateTime,                   datenow)
                    .input("Completed_By",                      sql.VarChar(20),                MktId)
                    .input("Completed_Date",                    sql.DateTime,                   datenow)
                    .input("FeeRate_Group",                     sql.Int,                        1)
                    .input("Input_Type",                        sql.VarChar(10),                "key")
                    .input("Status_API",                        sql.NChar(10),                  "I")
                    .input("Occupation_Code",                   sql.NChar(10),                  null)
                    .query(insertMFtsAcccount);
                }).then(result =>{
                    if(result.rowsAffected > 0 ){
                        console.log("****Insert MFTS_ACCOUNT ref_no  :" + ref_no)
                        // return callback(ref_no)
                    }
                }).catch(err => {
                    console.log(err);
                    sql.close();
                    //return  callback(err)
                });
            }
            sql.close();
            // console.log(ref_no)
            // return callback(ref_no)
        }).catch(err => {
            console.log("insert error")
            console.log(err);
            sql.close();
            // return  callback(err)
        });
    }catch (error) {
        result = "ERROR Catch"
        console.log(error);
        // return callback(error)
    }
    // return callback(ref_no)
}
async function getRefx(typeno,flag , callback){
    let refno ,turnRef
    await getrefnumber(typeno,flag, (x)=>{refno = x})
   
    return callback(refno)
}
async function getrefnumber(refcode,segno, callback){
    let RefNo
    try
  { 
      await new sql.ConnectionPool(config).connect().then(pool => {
          return pool.request()
          .input('Amc_Id' ,sql.Int, 1)
          .input('GRef_No' , sql.Char(12), refcode)
          .execute(`[dbo].[USP_MFTS_Gen_Ref_No_2]`);
      }).then(result => {
          let rowsAffected = result.rowsAffected.toString()
          sql.close();
         console.log(result.recordsets )
         return callback(result.recordset[0].Ref_No)
        //   return callback(result.returnValue)
      }).catch(err => {
          console.log(err);
          sql.close();
          return  callback(err)
      });
  }catch (error) {
      // result = "ERROR Catch"
      // console.log(error);
      return callback(error)
  }


}
async function findRefNoToAdd(datarows, callback){
    let flag_db = 0
    let flag_con = 0
    // console.log(datarows)
    for (const key in datarows) {
            let ref_no                      = datarows[key].Ref_no
            let accountno                   = datarows[key].ACCOUNT_ID  
            let unitholder                  = datarows[key].UNITHOLDER_ID
            let Amc_Id                      = datarows[key].Amc_Id
            let Fund_Id                      = datarows[key].Fund_Id
            if(ref_no !== null ){continue}
            console.log("findRefNoToAdd  " )
            // console.log("ref_no " +ref_no)
            // console.log("unitholder " +unitholder)
            if(accountno === null){
                //insert log
                continue;
            }
            if(ref_no === null ){
                //select mfts_account -> 
                dataAccountUnitholdernull(accountno,Fund_Id,Amc_Id,unitholder , function(result ){
                    //insert mfts_account 
                    // update mfts_account -> unitbalace id
                    flag_con = result
                })
            }
        flag_db = 1
   }

   return callback(flag_db)
}
async function dataAccountUnitholdernull(Account_No, Fund_id , Amc_Id ,unitholder, callback){
    let flag_res = 0
    try{
            let statement =`SELECT Ref_No, Holder_Id FROM MFTS_ACCOUNT WHERE Account_no = '${Account_No}' AND Amc_Id = '${Amc_Id}'`

            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .query(statement);
            }).then(result => {
                let rowsAffected = result.rowsAffected.toString()
                sql.close();
              //  console.log(result )
           if(rowsAffected > 0){
                if(result.recordset[0].Holder_Id === null){
                    // update mfts_account
                    updateHolderIdToMftsUnitholder(null,Account_No,Amc_Id,unitholder)
                    return callback(1)
                }
                
           }else{
                //insert
                // console.log(Account_No +" " +unitholder +" " +Amc_Id)
                insertMFtsAcccount(Account_No, unitholder ,Amc_Id, null)
                return callback(1)
           }
           

            }).catch(err => {
                console.log(err);
                sql.close();
                return  callback(err)
            });
        }catch (error) {
            // result = "ERROR Catch"
            // console.log(error);
            return callback(error)
        }
        return callback(0)
}
async function CloneAllottedTransactions(datarows, callback) {
    //console.log(datarows);
    try {


        let table = new sql.Table('Dup_Fund_Cen_AllottedTransactions');

        table.columns.add('SA_ORDER_REF', sql.VarChar(30), { nullable: true });
        table.columns.add('TRANS_DATE', sql.VarChar(14), { nullable: true });
        table.columns.add('FILTER01', sql.VarChar(20), { nullable: true });
        table.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table.columns.add('UNITHOLDER_ID', sql.VarChar(15), { nullable: true });
        table.columns.add('NET_UNITHOLDER_REF_NO', sql.VarChar(20), { nullable: true });
        table.columns.add('TRANS_CODE', sql.VarChar(3), { nullable: true });
        table.columns.add('FUND_CODE', sql.VarChar(20), { nullable: true });
        table.columns.add('OVERRIDE_RISK_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('OVERRIDE_FX_RISK_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('REDEMPTION_TYPE', sql.VarChar(5), { nullable: true });
        table.columns.add('AMOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('UNIT', sql.VarChar(20), { nullable: true });
        table.columns.add('EFFECTIVE_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('FILTER02', sql.VarChar(20), { nullable: true });
        table.columns.add('FILTER03', sql.VarChar(20), { nullable: true });
        table.columns.add('PAYMENT_TYPE', sql.VarChar(8), { nullable: true });
        table.columns.add('BANK_CODE', sql.VarChar(4), { nullable: true });
        table.columns.add('BANK_ACCOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('CHEQUE_NO', sql.VarChar(10), { nullable: true });
        table.columns.add('CHEQUE_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('IC_LICENSE', sql.VarChar(10), { nullable: true });
        table.columns.add('BRANCH_NO', sql.VarChar(5), { nullable: true });
        table.columns.add('CHANNEL', sql.VarChar(3), { nullable: true });
        table.columns.add('FORCE_ENTRY', sql.VarChar(1), { nullable: true });
        table.columns.add('LTF_CONDITION', sql.VarChar(1), { nullable: true });
        table.columns.add('REASON_TOSELL_LTF_RMF', sql.VarChar(1), { nullable: true });
        table.columns.add('RMF_CAPITAL_WHTAX_CHOICE', sql.VarChar(1), { nullable: true });
        table.columns.add('RMF_CAPITAL_REDEEM_CHOICE', sql.VarChar(1), { nullable: true });
        table.columns.add('AUTO_REDEEM_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('TRANSACTION_ID', sql.VarChar(17), { nullable: true });
        table.columns.add('STATUS', sql.VarChar(10), { nullable: true });
        table.columns.add('AMC_ORDER_REF', sql.VarChar(30), { nullable: true });
        table.columns.add('ALLOTMENT_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('ALLOTED_NAV', sql.VarChar(13), { nullable: true });
        table.columns.add('ALLOTED_AMOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('ALLOTED_UNIT', sql.VarChar(20), { nullable: true });
        table.columns.add('FEE', sql.VarChar(20), { nullable: true });
        table.columns.add('WH_TAX', sql.VarChar(20), { nullable: true });
        table.columns.add('VAT', sql.VarChar(20), { nullable: true });
        table.columns.add('BROKERAGE_FEE', sql.VarChar(20), { nullable: true });
        table.columns.add('WH_TAX_LTF_RTF', sql.VarChar(20), { nullable: true });
        table.columns.add('AMC_PAY_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('REGISTER_TRANS_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('SALE_ALL_UNIT_FLAG', sql.VarChar(1), { nullable: true });
        table.columns.add('SETTLE_BANK_CODE', sql.VarChar(4), { nullable: true });
        table.columns.add('SETTLE_BANK_ACCOUNT', sql.VarChar(20), { nullable: true });
        table.columns.add('REJECT_REASON', sql.VarChar(50), { nullable: true });
        table.columns.add('CHQ_BRANCH', sql.VarChar(5), { nullable: true });
        table.columns.add('TAX_INVOICE_NO', sql.VarChar(50), { nullable: true });
        table.columns.add('AMC_SWITCHING_ORDER_NO', sql.VarChar(30), { nullable: true });
        table.columns.add('IC_CODE', sql.VarChar(10), { nullable: true });
        table.columns.add('BROKERAGE_FEE_VAT', sql.VarChar(20), { nullable: true });
        table.columns.add('APPROVAL_CODE', sql.VarChar(20), { nullable: true });
        table.columns.add('NAV_DATE', sql.VarChar(8), { nullable: true });
        table.columns.add('COLLATERAL_AMT', sql.VarChar(20), { nullable: true });
        table.columns.add('CREDIT_CARD_ISSUER', sql.VarChar(20), { nullable: true });
        table.columns.add('FILTER04', sql.VarChar(20), { nullable: true });
        table.columns.add('FILTER05', sql.VarChar(20), { nullable: true });
        table.columns.add('FILTER06', sql.VarChar(20), { nullable: true });

        datarows.forEach(datarow => {
            if(datarow[31] === "ALLOTTED" ){ 
                // console.log(datarow[31])
                table.rows.add.apply(table.rows, datarow)  
            }
        });

        //console.dir(table);


        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);


            } else {
                // console.log(result);
                //** Best */
                // getDataTransaction((result)=>{
                //     //res.json(result)
                //     importDataTransaction(result)
                // })
                //2023-01-13 // update/ insert unitholder balance

            }

            // console.log("Number of records inserted Dup :" + result.rowsAffected);
            pool.close();
            sql.close();
        });

        return callback("Import data to Clone AllottedTransactions is completed.");
    } catch (error) {
        console.log(error);
        return
        callback(error);
    }

}
async function reportOutstanding(callback){
    let DATA_OUTSTANDING
    const today = new Date()
        let date_ob = new Date(today);
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let daynow = year +"-"+  month  +"-"+ date 
    try{
        let statement = `exec USP_MFTS_Query_Rpt_Outstanding '${daynow}',null,null,null,null,null,null,null,116  `
        // let statement = `exec USP_MFTS_Query_Rpt_Outstanding '${daynow}',null,null,null,'3102200318689,1101401708444,3102002137483',null,null,null,116  `
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            sql.close();
          //  console.log(result )
          DATA_OUTSTANDING = result.recordset
      
        }).catch(err => {
            console.log(err);
            sql.close();
            return  callback(err)
        });
    }catch (error) {
        // result = "ERROR Catch"
        // console.log(error);
        // return callback(error)
    }
    //console.log(DATA_OUTSTANDING)
    let datarows =[]
    for (const key in DATA_OUTSTANDING) {
       
        let account_no      = DATA_OUTSTANDING[key].account_no //: '3102002137483',
        let ref_no          = DATA_OUTSTANDING[key].ref_no   
        let holder_id       = DATA_OUTSTANDING[key].holder_id    
        let holder_name_t   = DATA_OUTSTANDING[key].holder_name_t    
        let amc_id          = DATA_OUTSTANDING[key].amc_id    
        let amc_code        = DATA_OUTSTANDING[key].amc_code    
        let fund_id         = DATA_OUTSTANDING[key].fund_id    
        let fund_code       = DATA_OUTSTANDING[key].fund_code    
        let fund_desc       = DATA_OUTSTANDING[key].fund_desc    
        let fgroup_code     = DATA_OUTSTANDING[key].fgroup_code    
        let fgroup_desc     = DATA_OUTSTANDING[key].fgroup_desc    
        let unitbalance     = DATA_OUTSTANDING[key].unitbalance    
        let avgcost         = DATA_OUTSTANDING[key].avgcost    
        let nav_price       = DATA_OUTSTANDING[key].nav_price    
        let total_cost      = DATA_OUTSTANDING[key].total_cost    
        let mkvalue         = DATA_OUTSTANDING[key].mkvalue    
        let unrgl           = DATA_OUTSTANDING[key].unrgl    
        let team_name       = DATA_OUTSTANDING[key].team_name    
        let marketing_name  = DATA_OUTSTANDING[key].marketing_name    
         
        // bankdata.push(subscription[i]); 
        let set_datarows =   []
        
        set_datarows.push(account_no)
        set_datarows.push(ref_no)
        set_datarows.push(holder_id)
        set_datarows.push(holder_name_t)
        set_datarows.push(amc_id)
        set_datarows.push(amc_code)
        set_datarows.push(fund_id)
        set_datarows.push(fund_code)
        set_datarows.push(fund_desc)
        set_datarows.push(fgroup_code)
        set_datarows.push(fgroup_desc)
        set_datarows.push(unitbalance)
        set_datarows.push(avgcost)
        set_datarows.push(nav_price)
        set_datarows.push(total_cost)
        set_datarows.push(mkvalue)
        set_datarows.push(unrgl)
        set_datarows.push(team_name)
        set_datarows.push(marketing_name)
         datarows.push(set_datarows)
    }
    // console.log(datarows)
    let table = new sql.Table('Report_Outstanding_Daily');

    table.columns.add('account_no', sql.VarChar(15), { nullable: true });
    table.columns.add('ref_no', sql.VarChar(20), { nullable: true });
    table.columns.add('holder_id', sql.VarChar(30), { nullable: true });
    table.columns.add('holder_name_t', sql.NVarChar(200), { nullable: true });
    table.columns.add('amc_id', sql.Int, { nullable: true });
    table.columns.add('amc_code', sql.VarChar(50), { nullable: true });
    table.columns.add('fund_id', sql.Int, { nullable: true });
    table.columns.add('fund_code', sql.NVarChar(150), { nullable: true });
    table.columns.add('fund_desc', sql.NVarChar(200), { nullable: true });
    table.columns.add('fgroup_code', sql.NVarChar(20), { nullable: true });
    table.columns.add('fgroup_desc', sql.NVarChar(200), { nullable: true });
    table.columns.add('unitbalance', sql.Decimal(18,4), { nullable: true });
    table.columns.add('avgcost', sql.Decimal(18,14), { nullable: true });
    table.columns.add('nav_price', sql.Decimal(18,4), { nullable: true });
    table.columns.add('total_cost', sql.Decimal(18,9), { nullable: true });
    table.columns.add('mkvalue', sql.Decimal(18,9), { nullable: true });
    table.columns.add('unrgl', sql.Float, { nullable: true });
    table.columns.add('team_name', sql.NVarChar(50), { nullable: true });
    table.columns.add('marketing_name', sql.NVarChar(150), { nullable: true });

    datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));
    let pool = await sql.connect(config);
        // await pool.request().query("DELETE FROM Report_Outstanding_Daily");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);

            } else {
                

            }

            pool.close();
            sql.close();
        });
    return callback("done")
}
async function Report_Unitbalance_Daily(datarows,callback){
    try {


        let table = new sql.Table('Report_Unitbalance_Daily');

        table.columns.add('AMC_CODE', sql.VarChar(15), { nullable: true });
        table.columns.add('ACCOUNT_ID', sql.VarChar(20), { nullable: true });
        table.columns.add('UNITHOLDER_ID', sql.VarChar(15), { nullable: true });
        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('UNIT_BALANCE', sql.Decimal(18,4), { nullable: true });
        table.columns.add('AMOUNT', sql.Decimal(18,4), { nullable: true });
        table.columns.add('AVAILABLE_UNIT_BALANCE', sql.Decimal(18,4), { nullable: true });
        table.columns.add('AVAILABLE_AMOUNT', sql.Decimal(18,4), { nullable: true });
        table.columns.add('PENDING_UNIT', sql.Decimal(18,4), { nullable: true });
        table.columns.add('PENDING_AMOUNT', sql.Decimal(18,4), { nullable: true });
        table.columns.add('PLEDGE_UNIT', sql.Decimal(18,4), { nullable: true });
        table.columns.add('AVERAGE_COST', sql.Decimal(18,4), { nullable: true });
        table.columns.add('NAV', sql.Decimal(18,4), { nullable: true });
        // table.columns.add('NAV_DATE', sql.Decimal(18,4), { nullable: true });
        table.columns.add('NAV_DATE', sql.VarChar(8), { nullable: true }); 
         
        datarows.forEach(datarow => {
             
                table.rows.add.apply(table.rows, datarow)  
             
        });

        //console.dir(table);


        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);

            } else {
                // console.log(result);
                //** Best */
                 

            }

            console.log("Number of records inserted Unitblance :" + result.rowsAffected);
            pool.close();
            sql.close();
        });

        return callback("Import data to Unitblance  is completed.");
    } catch (error) {
        console.log(error);
        return
        callback(error);
    }


}
async function importMftsDividendTranSaction (callback){
    await poolPromise.then(pool => {
        return pool.request().query(`
        Begin
        
            DECLARE @XD_DATE Datetime
            DECLARE @FUND_ID Varchar(20)
            DECLARE @REF_NO Varchar(20)
            DECLARE @DivPerUnit DECIMAL(18,4)
            DECLARE @Unit    DECIMAL(18,4)
            DECLARE @Payment_Date Datetime
            DECLARE @Tax_Rate DECIMAL (18,4)
            DECLARE @Tax_Amount DECIMAL (18,2)
            DECLARE @PayBy  Varchar(20)
            DECLARE @Bank_Id Int
            DECLARE @Bank_Acc_No Varchar(20)
            DECLARE @RowCount Int
            DECLARE dividend_cursor CURSOR LOCAL FOR
            SELECT   a.BOOK_CLOSED_DATE as XD_DATE 
                    ,b.Fund_Id   
                    ,(SELECT Ref_No from MFTS_Account WHERE Account_No = a.ACCOUNT_ID AND Holder_Id = a.UNITHOLDER_ID AND Status_Id = 7 )as REF_NO
                    ,CAST(a.DIVIDEND_RATE AS DECIMAL(13, 4)) as DivPerUnit
                    ,CAST(a.Unit AS DECIMAL(13, 4)) as Unit
                    , CONVERT(DATETIME,a.PAYMENT_DATE,103) as Payment_Date
                    ,CAST(10.0000 AS DECIMAL(13, 4))as Tax_Rate
                    ,CAST((( CAST(a.DIVIDEND_RATE AS DECIMAL(13, 4)) * CAST(a.Unit AS DECIMAL(13, 4)))/10.0000)AS DECIMAL(13, 2)) as Tax_Amount
                    ,CASE WHEN a.PAYMENT_TYPE = 1 THEN  'Transfer' WHEN a.PAYMENT_TYPE = 2 THEN  'Cheque' ELSE 'Reinvest' End  as PayBy
                    ,(SELECT Bank_ID FROM dbo.REF_Banks WHERE Bank_IDNew = a.BANK_CODE) as Bank_Id
                    ,isnull(a.BANK_ACCOUNT,15) as Bank_Acc_No 
                    FROM dbo.Fund_Cen_DividendTransactions a left join MFTS_Fund b ON a.FUND_CODE = b.Fund_Code
                    
            
            OPEN dividend_cursor
            FETCH NEXT FROM dividend_cursor INTO @XD_DATE,@FUND_ID,@REF_NO,@DivPerUnit,@Unit,@Payment_Date,@Tax_Rate,@Tax_Amount,@PayBy,@Bank_Id,@Bank_Acc_No
                WHILE @@FETCH_STATUS = 0
                BEGIN
                    SET @RowCount = 0
                    SELECT @RowCount = COUNT(@FUND_ID) FROM MFTS_Dividend WHERE XD_Date=@XD_DATE AND Fund_Id =@FUND_ID AND Ref_No =@REF_NO
                    IF @RowCount = 0
                    BEGIN
                        INSERT INTO MFTS_Dividend (XD_DATE,FUND_ID,REF_NO,DivPerUnit,Unit,Payment_Date,Tax_Rate,Tax_Amount,PayBy,Bank_Id,Bank_Acc_No)VALUES(@XD_DATE,@FUND_ID,@REF_NO,@DivPerUnit,@Unit,@Payment_Date,@Tax_Rate,@Tax_Amount,@PayBy,@Bank_Id,@Bank_Acc_No)
                    END
                    
                    FETCH NEXT FROM dividend_cursor INTO @XD_DATE,@FUND_ID,@REF_NO,@DivPerUnit,@Unit,@Payment_Date,@Tax_Rate,@Tax_Amount,@PayBy,@Bank_Id,@Bank_Acc_No
            CLOSE dividend_cursor
            DEALLOCATE dividend_cursor
            END
                 
        END` )
    }) 
    .then(result => {
       
        sql.close();

        return callback("Fund Dividend transaction Success!!!")
    }).catch(err => {
        console.log(err);
        //sql.close();
    });
}
async function importMFTSDividendNews (callback){

    await poolPromise.then(pool => {
        return pool.request().query(`
        BEGIN

            DECLARE @FUND_ID INT
            DECLARE @XDDATE DATETIME
            DECLARE @Payment_Date DATETIME
            DECLARE @DivPerUnit Decimal(10,4)
            DECLARE @CDATE DATETIME =GETDATE()
            DECLARE @CUSER VARCHAR(10)= '116'
            
            DECLARE @FUND_ID_A INT
            DECLARE dividend_cursor CURSOR LOCAL FOR
            
            SELECT b.Fund_Id
                ,CONVERT(DATETIME,a.BOOK_CLOSED_DATE,103)as XD_DATE
                ,CONVERT(DATETIME,a.PAYMENT_DATE,103) as Payment_Date
                ,CAST( DIVIDEND_RATE AS DECIMAL(13, 4)) as DivPerUnit 
            FROM Fund_Cen_DividendNews a inner join MFTS_Fund b on a.FUND_CODE = b. Fund_Code
            ORDER BY b.Fund_Id ASC
            
            OPEN dividend_cursor
            FETCH NEXT FROM dividend_cursor INTO @FUND_ID,@XDDATE,@Payment_Date,@DivPerUnit 
                    WHILE @@FETCH_STATUS = 0
                        BEGIN
                            SET @FUND_ID_A = ''
                             SELECT @FUND_ID_A = Fund_Id  FROM MFTS_Fund_Dividend WHERE (Fund_Id =  @FUND_ID)AND  (XD_DATE = @XDDATE)
                            IF @FUND_ID_A = 0
                            BEGIN
                                  --print(@FUND_ID)
                                INSERT INTO MFTS_Fund_Dividend (Fund_Id, XD_Date, Payment_Date, DivPerUnit, Create_By, Create_Date, Modify_By, Modify_Date)
                                values(@FUND_ID,@XDDATE,@Payment_Date,@DivPerUnit,'116',@CDATE,'999',@CDATE )
                            END
        
                            FETCH NEXT FROM dividend_cursor INTO @FUND_ID,@XDDATE,@Payment_Date,@DivPerUnit 
                        END
            CLOSE dividend_cursor
            DEALLOCATE dividend_cursor

            SELECT COUNT(Fund_Id)as row FROM MFTS_Fund_Dividend WHERE Create_Date  >= @CDATE
        END`)
    }) 
    .then(result => {
       
        sql.close();

        return callback("Number of records inserted Fund Dividend : " +result.recordset[0]['row']+ " records")
    }).catch(err => {
        console.log(err);
        //sql.close();
    });
  
} 
async function getDivedend(callback){
    let datarows
    await poolPromise.then(pool => {
        return pool.request().query(`BEGIN
                                    DECLARE @XD_DATE Datetime
                                    DECLARE @FUND_ID Varchar(20)
                                    DECLARE @REF_NO Varchar(20)
                                    DECLARE @DivPerUnit DECIMAL(18,4)
                                    DECLARE @Unit    DECIMAL(18,4)
                                    DECLARE @Payment_Date Datetime
                                    DECLARE @Tax_Rate DECIMAL (18,4)
                                    DECLARE @Tax_Amount DECIMAL (18,2)
                                    DECLARE @PayBy  Varchar(20)
                                    DECLARE @Bank_Id Int
                                    DECLARE @Bank_Acc_No Varchar(20)
                                    DECLARE @RowCount Int

                                    DECLARE dividend_cursor CURSOR LOCAL FOR
                                    SELECT   CONVERT(DATETIME,a.BookingClosingDate,103)as XD_DATE
                                            ,b.Fund_Id 
                                            ,(Select Ref_No from MFTS_Account WHERE Account_No = a.AccountID AND Holder_Id = a.UnitholderID AND Status_Id = 7 )as REF_NO
                                            ,CAST(a.DividendRate AS DECIMAL(13, 4)) as DivPerUnit
                                            ,CAST(a.Unit AS DECIMAL(13, 4)) as Unit
                                            , CONVERT(DATETIME,a.PaymentDate,103) as Payment_Date
                                            ,CAST(10.0000 AS DECIMAL(13, 4))as Tax_Rate
                                            ,CAST((( CAST(a.DividendRate AS DECIMAL(13, 4)) * CAST(a.Unit AS DECIMAL(13, 4)))/10.0000)AS DECIMAL(13, 2)) as Tax_Amount
                                            ,CASE WHEN PaymentType = 'โอนเงินเข้าบัญชี' THEN  'Transfer' ELSE 'Cheque' End  as PayBy
                                            ,(SELECT Bank_ID FROM dbo.REF_Banks WHERE Bank_Short_Name = a.BankCode) as Bank_Id
                                            ,BankAccountNo as Bank_Acc_No 
                                    FROM   dbo.dividend_inquiry a left join 
                                        MFTS_Fund as b ON a.FundCode =b.Fund_Code left join 
                                        MFTS_Amc c ON a.AMCCode = c.Amc_Code
                                    order by b.Fund_Id asc
                                    
                                    OPEN dividend_cursor
                                    
                                    FETCH NEXT FROM dividend_cursor INTO @XD_DATE,@FUND_ID,@REF_NO,@DivPerUnit,@Unit,@Payment_Date,@Tax_Rate,@Tax_Amount,@PayBy,@Bank_Id,@Bank_Acc_No
                                        WHILE @@FETCH_STATUS = 0
                                        BEGIN
                                            SET @RowCount = 0 
                                        
                                        --	print(@FUND_ID)
                                            SELECT @RowCount = COUNT(FUND_ID) FROM MFTS_Dividend WHERE XD_Date=@XD_DATE AND Fund_Id =@FUND_ID AND Ref_No =@REF_NO
                                            IF @RowCount = 0
                                            BEGIN
                                                INSERT INTO MFTS_Dividend (XD_DATE,FUND_ID,REF_NO,DivPerUnit,Unit,Payment_Date,Tax_Rate,Tax_Amount,PayBy,Bank_Id,Bank_Acc_No,Branch_Id)VALUES(@XD_DATE,@FUND_ID,@REF_NO,@DivPerUnit,@Unit,@Payment_Date,@Tax_Rate,@Tax_Amount,@PayBy,@Bank_Id,@Bank_Acc_No,9999)
                                            END
                                            
                                        FETCH NEXT FROM dividend_cursor INTO @XD_DATE,@FUND_ID,@REF_NO,@DivPerUnit,@Unit,@Payment_Date,@Tax_Rate,@Tax_Amount,@PayBy,@Bank_Id,@Bank_Acc_No

                                        END
                                    CLOSE dividend_cursor
                                    DEALLOCATE dividend_cursor	
                                    END`)
    }) 
    .then(result => {
         
        sql.close();
    }).catch(err => {
        console.log(err);
        sql.close();
    });

    return callback('Insert Divident Transaction success!!')
}

async function DataFundPerformance(callback){
    try {
        await poolPromise.then(pool => {
            return pool.request().query(' Truncate table [dbo].[MFTS_FundPerformancedaily]')
        }) 
        .then(result => {
             
            sql.close();
        }).catch(err => {
            console.log(err);
            sql.close();
        });   
    } catch (error) {
        
    }
    let DATA_DataFundPerformance
    try {
         //let DATA_DataFundPerformance
    const today = new Date()
    const yesterday = new Date(today)
    let yt
    //---- if today = monday must get File of Friday     
    var chek_day = today.getDay();
    if (chek_day === 1){ 
        yt = yesterday.setDate(yesterday.getDate()-3) 
    }else{
        yt = yesterday.setDate(yesterday.getDate()-1) 
    }   

    let date_yt = new Date(yt)
    let dateyt = ("0"+date_yt.getDate()).slice(-2);
    let month_yt = ("0"+ (date_yt.getMonth() + 1)).slice(-2);
    let year_yt = date_yt.getFullYear();

    // let date_yesterday = year_yt  + month_yt  + dateyt
    let timestampx = year_yt +"-"+  month_yt  +"-"+ dateyt 

        await poolPromise.then(pool => {
            return pool.request()
            .input('date' ,sql.DateTime, timestampx)
            .input('amc_id' , sql.Int, null)
            .input('fund_id' , sql.VarChar(20), null)
            .input('fundtype' , sql.VarChar, null)
            .execute(`USP_MFTS_Query_Rpt_FundPerformance`)
        }) 
        .then(result => {
             
            DATA_DataFundPerformance = result.recordset
            sql.close();
        }).catch(err => {
            console.log(err);
           // sql.close();
        });    
    } catch (error) {
        sql.close();
    }

    let datarows =[]
      for (const key in DATA_DataFundPerformance) {
       
        let fund_id             = DATA_DataFundPerformance[key].fund_id //: '3102002137483',
        let fund_code           = DATA_DataFundPerformance[key].fund_code   
        let fund_name           = DATA_DataFundPerformance[key].fund_name    
        let fgroup_code         = DATA_DataFundPerformance[key].fgroup_code    
        let fgroup_desc         = DATA_DataFundPerformance[key].fgroup_desc    
        let start_date          = DATA_DataFundPerformance[key].start_date    
        let dividend            = DATA_DataFundPerformance[key].dividend    
        let amc_code            = DATA_DataFundPerformance[key].amc_code    
        let amc_name            = DATA_DataFundPerformance[key].amc_name    
        let amc_Id              = DATA_DataFundPerformance[key].amc_Id    
        let asset_size          = DATA_DataFundPerformance[key].asset_size    
        let onedays             = DATA_DataFundPerformance[key].onedays.toString()    
        let sevendays           = DATA_DataFundPerformance[key].sevendays.toString()    
        let fifdays             = DATA_DataFundPerformance[key].fifdays.toString()    
        let onemonths           = DATA_DataFundPerformance[key].onemonths.toString()    
        let threemonths         = DATA_DataFundPerformance[key].threemonths.toString()    
        let sixmonths           = DATA_DataFundPerformance[key].sixmonths.toString()    
        let ninemonths          = DATA_DataFundPerformance[key].ninemonths.toString()    
        let oneyrs              = DATA_DataFundPerformance[key].oneyrs.toString()    
        let twoyrs              = DATA_DataFundPerformance[key].twoyrs.toString()    
        let threeyrs            = DATA_DataFundPerformance[key].threeyrs.toString()    
        let fiveyrs             = DATA_DataFundPerformance[key].fiveyrs.toString()    
        let sevenyrs            = DATA_DataFundPerformance[key].sevenyrs.toString()    
        let tenyrs              = DATA_DataFundPerformance[key].tenyrs.toString()    
        let ytd                 = DATA_DataFundPerformance[key].ytd.toString()    
        let since_inception     = DATA_DataFundPerformance[key].since_inception    
        let navDate             = DATA_DataFundPerformance[key].navDate    
        let navonedays          = DATA_DataFundPerformance[key].navonedays    
        let navyesterday        = DATA_DataFundPerformance[key].navyesterday    
        let navpercent          = DATA_DataFundPerformance[key].navpercent    
        let navdip              = DATA_DataFundPerformance[key].navdip    
         
    let set_datarows =   []
        
    set_datarows.push(fund_id )       
        set_datarows.push(fund_code )     
        set_datarows.push(fund_name )     
        set_datarows.push(fgroup_code)    
        set_datarows.push(fgroup_desc)    
        set_datarows.push(start_date )    
        set_datarows.push(dividend)       
        set_datarows.push(amc_code)       
        set_datarows.push(amc_name)       
        set_datarows.push(amc_Id )        
        set_datarows.push(asset_size )    
        set_datarows.push(onedays)        
        set_datarows.push(sevendays )     
        set_datarows.push(fifdays )       
        set_datarows.push(onemonths )     
        set_datarows.push(threemonths)    
        set_datarows.push(sixmonths )     
        set_datarows.push(ninemonths )    
        set_datarows.push(oneyrs )        
        set_datarows.push(twoyrs )        
        set_datarows.push(threeyrs)       
        set_datarows.push(fiveyrs )       
        set_datarows.push(sevenyrs )      
        set_datarows.push(tenyrs)         
        set_datarows.push(ytd    )        
        set_datarows.push(since_inception)
        set_datarows.push(navDate )       
        set_datarows.push(navonedays)     
        set_datarows.push(navyesterday)   
        set_datarows.push(navpercent)     
        set_datarows.push(navdip)         
     datarows.push(set_datarows)
}
        
    // console.log(DATA_DataFundPerformance)
    let table = new sql.Table('MFTS_FundPerformancedaily');

    table.columns.add('fund_id', sql.Int, { nullable: false });
    table.columns.add('fund_code', sql.VarChar(30), { nullable: true });
    table.columns.add('fund_name', sql.VarChar(100), { nullable: true });
    table.columns.add('fgroup__code', sql.VarChar(30), { nullable: true });
    table.columns.add('fgroup_desc', sql.VarChar(100), { nullable: true });
    table.columns.add('start_date', sql.Date, { nullable: true });
    table.columns.add('dividend', sql.VarChar(30), { nullable: true });
    table.columns.add('amc_code', sql.VarChar(30), { nullable: true });
    table.columns.add('amc_name', sql.VarChar(150), { nullable: true });
    table.columns.add('amc_Id', sql.Int, { nullable: true });
    table.columns.add('asset_size', sql.Decimal(25,4), { nullable: true });
    table.columns.add('onedays', sql.VarChar(20), { nullable: true });
    table.columns.add('sevendays', sql.VarChar(20), { nullable: true });
    table.columns.add('fifdays', sql.VarChar(20), { nullable: true });
    table.columns.add('onemonths', sql.VarChar(20), { nullable: true });
    table.columns.add('threemonths', sql.VarChar(20), { nullable: true });
    table.columns.add('sixmonths', sql.VarChar(20), { nullable: true });
    table.columns.add('ninemonths', sql.VarChar(20), { nullable: true });
    table.columns.add('oneyrs', sql.VarChar(20), { nullable: true });
    table.columns.add('twoyrs', sql.VarChar(20), { nullable: true });
    table.columns.add('threeyrs', sql.VarChar(20), { nullable: true });
    table.columns.add('fiveyrs', sql.VarChar(20), { nullable: true });
    table.columns.add('sevenyrs', sql.VarChar(20), { nullable: true });
    table.columns.add('tenyrs', sql.VarChar(20), { nullable: true });
    table.columns.add('ytd', sql.VarChar(20), { nullable: true });
    table.columns.add('since_inception', sql.Decimal(25,4), { nullable: true });
    table.columns.add('navDate', sql.Date, { nullable: true });
    table.columns.add('navonedays', sql.Decimal(25,4), { nullable: true });
    table.columns.add('navyesterday', sql.Decimal(25,4), { nullable: true });
    table.columns.add('navpercent', sql.Decimal(25,4), { nullable: true });
    table.columns.add('navdip', sql.Decimal(25,4), { nullable: true }); 

    datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));
    let pool = await sql.connect(config);
        // await pool.request().query("DELETE FROM Report_Outstanding_Daily");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);

            } else {
                

            }

            pool.close();
            sql.close();
        });

    return callback("done")
}
async function dataNCLFundPerformance (){
    try {
        let statement =`SELECT top 1 * FROM Master_NAV ` //Master_NAV   MFTS_FundPerformancedaily

            await new sql.ConnectionPool(config_NCL).connect().then(pool => {
                return pool.request()
                .query(statement);
            }).then(result => {
                let rowsAffected = result.rowsAffected.toString()
                
                console.log(result.recordset)
                sql.close();
        }).catch(err => {
            console.log(err);
            sql.close();
            return  callback(err)
        });
    } catch (error) {
        
    }
}
async function getDataSentReportTexSaving(callback){
    let DATA_ROW
    try {
        await new sql.ConnectionPool(config_NCL).connect().then(pool => {
            return pool.request()  
            .query(`    DECLARE @TODATE2 DATE = GETDATE() ;
                        select b.accountId, a.Email from Report_TaxSaving a left join Master_Member b on a.userId = b.userid 
                        WHERE not( accountId is null) and Status = 'WAITING' AND CreateDate >= @TODATE2 `)
         }).then(result => {
            // console.log(result)   //result.recordset[0].First_Name_T
            if ( result.rowsAffected[0] > 0){   
 
                 DATA_ROW =     result.recordset;  
                 
            }   
            sql.close();   
        });     
    } catch (error) {
        
    }
    return callback(DATA_ROW)
}
async function getDataSentReportUnitBalance(callback){
    // let accountId
    // let Email
    let DATA_ROW
    try {
        await new sql.ConnectionPool(config_NCL).connect().then(pool => {
            return pool.request()  
            .query(`    DECLARE @TODATE2 DATE = GETDATE() ;
                        select b.accountId, a.Email from Report_Holding a left join Master_Member b on a.userId = b.userid 
                        WHERE not( accountId is null) and Status = 'WAITING' AND CreateDate >= @TODATE2 `)
         }).then(result => {
            // console.log(result)   //result.recordset[0].First_Name_T
            if ( result.rowsAffected[0] > 0){   
 
                 DATA_ROW =     result.recordset;  
                 
            }   
            sql.close();   
        });     
    } catch (error) {
        
    }
    return callback(DATA_ROW)
}
async function updateStatusSendReportTexSaving(callback){
    try {
        await new sql.ConnectionPool(config_NCL).connect().then(pool => {
            return pool.request()   
            .query(`DECLARE @useriD int
                    DECLARE @TODATE DATE = GETDATE();
                    DECLARE REPORT_HOLDING_CURSOR CURSOR LOCAL FOR
                    select a.userId  from Report_TaxSaving a left join Master_Member b on a.userId = b.userid WHERE  a.CreateDate >= @TODATE  -- and Status = 'WAITING'
            
                    OPEN REPORT_HOLDING_CURSOR  
                    FETCH NEXT FROM REPORT_HOLDING_CURSOR INTO @useriD
                        WHILE @@FETCH_STATUS = 0
                            BEGIN
                                UPDATE Report_TaxSaving   set Status='SUCCESS' ,ModifyDate =GETDATE()   WHERE  userId = @useriD  AND  CreateDate  >= @TODATE

                                FETCH NEXT FROM REPORT_HOLDING_CURSOR INTO @useriD
                            END
                    
                    CLOSE REPORT_HOLDING_CURSOR
                    DEALLOCATE REPORT_HOLDING_CURSOR `)
         }).then(result => {
            // console.log(result)   //result.recordset[0].First_Name_T
            return callback('Update Status Report Tex Saving  SUCCESS')
            sql.close();   
        });     
    } catch (error) {
        
    }
}
async function UpdateStatusSendReportUnitBalance(callback){
    try {
        await new sql.ConnectionPool(config_NCL).connect().then(pool => {
            return pool.request()   
            .query(`DECLARE @useriD int
                    DECLARE @TODATE DATE = GETDATE()
                    DECLARE REPORT_HOLDING_CURSOR CURSOR LOCAL FOR
                    select a.userId  from Report_Holding a left join Master_Member b on a.userId = b.userid WHERE  a.CreateDate >= @TODATE  -- and Status = 'WAITING'
            
                    OPEN REPORT_HOLDING_CURSOR  
                    FETCH NEXT FROM REPORT_HOLDING_CURSOR INTO @useriD
                        WHILE @@FETCH_STATUS = 0
                            BEGIN
                                UPDATE Report_Holding   set Status='SUCCESS' ,ModifyDate =GETDATE()   WHERE  userId = @useriD  AND  CreateDate  >= @TODATE

                                FETCH NEXT FROM REPORT_HOLDING_CURSOR INTO @useriD
                            END
                    
                    CLOSE REPORT_HOLDING_CURSOR
                    DEALLOCATE REPORT_HOLDING_CURSOR `)
         }).then(result => {
            // console.log(result)   //result.recordset[0].First_Name_T
            return callback('Update Status Report Unit Balance  SUCCESS')
            sql.close();   
        });     
    } catch (error) {
        
    }
}
async function getDataTexSaving(callback){
    
    let  DATA_ROW
    try {
        await new sql.ConnectionPool(config_NCL).connect().then(pool => {
            return pool.request()  
            .query(`DECLARE @TODATE DATE = GETDATE() ;
                    SELECT b.accountId, a.Email ,  a.EndDate ,a.StartDate from Report_TaxSaving a left join Master_Member b on a.userId = b.userid 
                    WHERE not( accountId is null) and Status = 'WAITING' AND CreateDate >= @TODATE`)
         }).then(result => {
            // console.log(result)   //result.recordset[0].First_Name_T
            if ( result.rowsAffected[0] > 0){    
                DATA_ROW =     result.recordset; 
                 
            }   
            sql.close();   
        });     
    } catch (error) {
        
    }
    return callback(DATA_ROW)
}
export {
    setIndividualProfile,
    setIndividualData,
    setBankAccountslData,
    setSuitabilityData,
    setAccountsData,
    setAddressData,
    callImportJobs,
    callImportQueryOrder,
    importOrderInquiry,
    importcustomer,
    callImportJobs2,
    callImportQueryOrder2,
    importCenCustomer,
    importCenAddress,
    truncateTable,
    selectNavTable,
    SelectFundId,
    importError,
    CheckNavTable,
    importNavTable,
    insertTableNav,
    updateTableNav,
    putDataFileApi,
    importCenCustomerId,
    checkunibalanceupdate,
    updateDipchipForAccount
    ,selectdataprepareunitbalance
    ,setdataprepareunitbalance
    ,setmtfsaccountamcnull
    ,findRefNoToAdd
    ,insertTableNavNew
    ,reportOutstanding
    ,importMFTSDividendNews
    ,getDivedend
    ,importMftsDividendTranSaction
    ,DataFundPerformance
    ,dataNCLFundPerformance
    ,getDataSentReportUnitBalance
    ,UpdateStatusSendReportUnitBalance
    ,getDataSentReportTexSaving
    ,updateStatusSendReportTexSaving
    ,getDataTexSaving
}