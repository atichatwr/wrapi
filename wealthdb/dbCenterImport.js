import express from 'express';
import sql  from 'mssql';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
//import cors from 'cors';

import { parse } from 'csv-parse';
import unzipper from 'unzipper';
import { config } from './dbconfig.js';
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
    try {
        let resultx = "";
        await readCsvtoArray(aFileData, function(rows) {
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
                    case "DividendTransactions":
                        importDividendTransactions(rows, function(x) {
                            resultx = x;
                        });

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
        });



        return callback(resultx);
    } catch (error) {
        console.log(error);
        return callback(error);
    }
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
                case "DividendTransactions":
                    importDividendTransactions(rows, function(x) {
                        resultx = x;
                    });

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
    console.dir(datarows);
    try {
        let table = new sql.Table('Fund_Cen_OrderInquiry');

        table.columns.add('transactionId', sql.VarChar(17), { nullable: true });
        table.columns.add('saOrderReferenceNo', sql.VarChar(30), { nullable: true });
        table.columns.add('orderType', sql.VarChar(3), { nullable: true });
        table.columns.add('accountId', sql.VarChar(15), { nullable: true });
        table.columns.add('unitholderId', sql.VarChar(15), { nullable: true });
        table.columns.add('fundCode', sql.VarChar(30), { nullable: true });
        table.columns.add('redemptionType', sql.VarChar(4), { nullable: true }); // dynamic column
        table.columns.add('unit', sql.VarChar(20), { nullable: true });
        table.columns.add('amount', sql.VarChar(20), { nullable: true });
        table.columns.add('statusx', sql.VarChar(10), { nullable: true });
        table.columns.add('transactionDateTime', sql.VarChar(14), { nullable: true });
        table.columns.add('transactionLastUpdated', sql.VarChar(14), { nullable: true });
        table.columns.add('effectiveDate', sql.VarChar(8), { nullable: true });
        table.columns.add('settlementDate', sql.VarChar(8), { nullable: true });
        table.columns.add('amcOrderReferenceNo', sql.VarChar(30), { nullable: true });
        table.columns.add('allottedUnit', sql.VarChar(20), { nullable: true });
        table.columns.add('allottedAmount', sql.VarChar(20), { nullable: true });
        table.columns.add('allottedNAV', sql.VarChar(20), { nullable: true });
        table.columns.add('fee', sql.VarChar(20), { nullable: true });
        table.columns.add('sellAllUnitFlag', sql.VarChar(1), { nullable: true });
        table.columns.add('allotmentDate', sql.VarChar(8), { nullable: true });
        table.columns.add('paymentType', sql.VarChar(8), { nullable: true });
        table.columns.add('bankCode', sql.VarChar(4), { nullable: true });
        table.columns.add('bankAccount', sql.VarChar(20), { nullable: true });
        table.columns.add('crcApprovalCode', sql.VarChar(20), { nullable: true });
        table.columns.add('channel', sql.VarChar(3), { nullable: true });
        table.columns.add('icLicense', sql.VarChar(10), { nullable: true });
        table.columns.add('branchNo', sql.VarChar(5), { nullable: true });
        table.columns.add('forceEntry', sql.VarChar(1), { nullable: true });
        table.columns.add('settlementBankCode', sql.VarChar(4), { nullable: true });
        table.columns.add('settlementBankAccount', sql.VarChar(20), { nullable: true });
        table.columns.add('settlementBankAccount', sql.VarChar(20), { nullable: true });
        table.columns.add('rejectReason', sql.VarChar(50), { nullable: true });
        table.columns.add('navDate', sql.VarChar(10), { nullable: true });
        table.columns.add('collateralAccount ', sql.VarChar(20), { nullable: true });
        table.columns.add('accountType', sql.VarChar(6), { nullable: true });
        table.columns.add('recurringOrderId', sql.VarChar(20), { nullable: true });
        table.columns.add('saRecurringOrderRefNo', sql.VarChar(30), { nullable: true });


        //table.columns.add('paymentStatus', sql.VarChar(10) , {nullable: true});
        //table.columns.add('paymentProcessingType', sql.VarChar(1) , {nullable: true});
        //table.columns.add('chqBranch', sql.VarChar(5) , {nullable: true});


        //datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));

        datarows.forEach(async(data) => {
            table.rows.add.apply(table.rows, await jdatatoArray(data));
        });


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
        return callback("Import data to OrderInquiry is completed.");

    } catch (error) {
        console.log(error);
        return callback(error);
    }


}
///-----------------------------------------------------------------------------------------------------------import Customer
async function importOrderInquiry2(datarows, callback) {
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
        let iaccompanyingDocument = JSON.stringify(datarows.identificationDocument);
        let work = JSON.stringify(datarows.work);
        let current = JSON.stringify(datarows.current);
        let suitabilityForms = JSON.stringify(datarows.suitabilityForm);
        let spouses                 = JSON.stringify(datarows.spouse);
        // var Address_work1 = JSON.parse(work); //Not Double quotes 
        let Address_doc = await getArraytotext(iaccompanyingDocument);
        let Address_work = await getArraytotext(work);
        let Address_curent = await getArraytotext(current);
        let suitabilityForm = await getArraytotext(suitabilityForms);
        let Spouse              = await getArraytotext(spouses)
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

        //-----------------INSET INTO Fund_Cen_Accounts 20052022
        let cardNum = JSON.stringify(datarows.cardNumber)
        setTimeout(() => {  if (typeof(datarows.identificationCardType)) {  importCenAddress(cardNum, "doc", iaccompanyingDocument) }   }, 1500);
        setTimeout(() => {  if (typeof(datarows.current)) {  importCenAddress(cardNum, "current", current)}                             }, 1500);
        setTimeout(() => {  if (typeof(datarows.work)) {  importCenAddress(cardNum, "work", work) }                                     }, 1500);
       
       
       

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

        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
               // console.log(cardNum)
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

//------------------------------------------
async function importCenBank(cardNumber,accountId,typebank,bankcodex,bankbranchcodex,bankAccountNox){

if (bankcodex == null || bankcodex == "" ){ console.log("bankaccount no data insert " + bankcodex) ; return -1}
if (typeof(bankcodex) == "undefined") { console.log("bankaccount no data insert  becuase bankcode is " + bankcodex) ; return -1}
    try{
        let table = new sql.Table('Fund_Cen_BankAccounts');

        table.columns.add('cardNumber', sql.VarChar(13), { nullable: true });
        table.columns.add('accountId', sql.VarChar(20), { nullable: true });
        table.columns.add('type', sql.VarChar(10), { nullable: true });
        table.columns.add('bankCode', sql.VarChar(10), { nullable: true });
        table.columns.add('bankBranchCode', sql.VarChar(10), { nullable: true });
        table.columns.add('bankAccountNo', sql.VarChar(10), { nullable: true });
        table.columns.add('isDefault', sql.VarChar(10), { nullable: true });
        // table.columns.add('finnetCustomerNo', sql.VarChar(10), { nullable: true });
         table.columns.add('flx', sql.VarChar(1), { nullable: true });
        
        let databank=[[cardNumber, accountId, typebank, bankcodex, bankbranchcodex,bankAccountNox,true,"I"]]
        databank.forEach(async(data) => { table.rows.add.apply(table.rows, await jdatatoArray3(data));  });

        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted of Fund_Cen_BankAccounts " + typebank +" :" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        return ("INSERT Fund_Cen_BankAccounts " + typebank +" success!!")
    } catch (error) {
        console.log(error);
        return callback(error);
    }


return 1
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
            if(data.no){
               table.rows.add.apply(table.rows, await jdatatoArray3(data)); 
            }
            
        });

        let pool = await sql.connect(config);
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted of " + flag + " :" + result.rowsAffected);

            }

            pool.close();
            sql.close();
        });
        //return callback("Import ");

    } catch (error) {
        console.log(error);
        return callback(error);
    }


    //  return callback("Import ");
}

//-----------------------------------------Function Object Data
async function getArraytotext(data) {
    let txt1 = data.substring(1);
    let txtsub = txt1.substring(0, txt1.length - 1)
    let txt = txtsub.split(',')
    let str = txt.join('|');
    // console.log(str);

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


        let table = new sql.Table('Fund_Cen_Fund_Holiday_Date');

        table.columns.add('FUND_CODE', sql.VarChar(30), { nullable: true });
        table.columns.add('FUND_HOLIDAY_DATE', sql.VarChar(8), { nullable: true });



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
        return callback("Import data to FundHoliday is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }
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
        // table.columns.add('FILTER01', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER02', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER03', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER04', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER05', sql.VarChar(20), { nullable: true });
        // table.columns.add('FILTER06', sql.VarChar(20), { nullable: true });


        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));
        //console.dir(table);

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
        return callback("Import data to Fund_Cen_FundProfile is completed.");
    } catch (error) {

        console.log(error);
        return callback(error);
    }


}

async function importAllottedTransactions(datarows, callback) {
    //console.log(datarows);
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

        datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));

        //console.dir(table);


        let pool = await sql.connect(config);
        //await pool.request().query("delete from Fund_Cen_AllottedTransactions");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);


            } else {
                console.log(result);
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

async function importFundNAV(datarows, callback) {

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
        await pool.request() //.query("DELETE FROM Fund_Cen_NAV");
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                console.log("Number of records inserted:" + result.rowsAffected);
                //******* [Best] Insert MFTS_NavTable*/
                    selectNavTable(function(result){
                        // res.json(result);
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
//--------------------------------------------------------------17-06-2022
//--------------------------------------------------------------Modify 06-JUL-2022
//--------------------------------------------------------------Nav Update
async function selectNavTable(callback){
    let statement = `SELECT     MFTS_Fund.Fund_Id, Fund_Cen_NAV.AMC_CODE, Fund_Cen_NAV.FUND_CODE, Fund_Cen_NAV.AUM, Fund_Cen_NAV.NAV, Fund_Cen_NAV.OFFER_NAV, Fund_Cen_NAV.BID_NAV, 
                                Fund_Cen_NAV.SWITCH_OUT, Fund_Cen_NAV.SWITCH_IN, Fund_Cen_NAV.NAV_DATE, Fund_Cen_NAV.SA_CODE_UNIT_LINK, Fund_Cen_NAV.TOTAL_UNIT, Fund_Cen_NAV.TOTAL_AUM_ALL, 
                                Fund_Cen_NAV.TOTAL_UNIT_ALL
                                FROM         Fund_Cen_NAV INNER JOIN
                                MFTS_Fund ON Fund_Cen_NAV.FUND_CODE = MFTS_Fund.Fund_Code
                                ORDER BY MFTS_Fund.Fund_Id, Fund_Cen_NAV.AMC_CODE, Fund_Cen_NAV.FUND_CODE `
                    // WHERE nav_date >= @yesterday  AND  nav_date <= @today`
    try 
    {
    let data_nav
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
  
      }).then(result => {
        //console.log(result.recordset);
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

    //  console.log(datas[0][1].fund_code)
    let jdata =[]
    for ( let key in datas[0]  ) {

        try 
        {
        let fundCode =  datas[0][key].fund_code
        // let data_row = 0
        let statement = `SELECT Fund_Id  FROM MFTS_Fund  WHERE Fund_Code = '${fundCode}' order by Fund_Id  `
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
    
        }).then(result => {
            //  console.log(result);
            let rowsAffected = result.rowsAffected.toString()
            sql.close();
            if(rowsAffected > 0){
                 //JSON PUSH 
                //idcard = idcard.replace(/['"]+/g, '') // clear doble cod
                let fund_id = result.recordset[0].Fund_Id.toString()
                //let close_date = datas[0][key].nav_date
                var myObj = { "state": rowsAffected,  "Fund_Id": fund_id };
                let datarowsx = datas[0][key]
                let dataparam = Object.assign(myObj, datarowsx)
                jdata.push(dataparam)
 
            }
        }).catch(err => {
            console.log(err);
            sql.close();
            callback(err)
            // return   err;
        });
        } catch (error) {
        result = "ERROR Catch"
        console.log(error);
        // return   error;
        callback(error)
        }
        // if (fundCode === "LHFL"){  return console.log("LHFL")}
   }

   callback(jdata) 
}
async function CheckNavTable(datarows ,callback){ 

       for ( let key in datarows   ) {  
        try
        {
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
// return   callback("") 
let console_time = new Date(Date.now() );  
console.log("================================= Data Process  End :" + console_time)
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
       let Fund_Id                      = datarows.Fund_Id  
        let Close_year               = datarows.nav_date.substring(0,4)
        let Close_month             = datarows.nav_date.substring(4,6)
        let Close_Day              = datarows.nav_date.substring(6,8)
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
    let Close_Day              = datarows.NAV_DATE.substring(6,8)
    let Close_Date              = Close_year+"-"+ Close_month +"-"+ Close_Day //new Date(Close_Day +"-"+ Close_month +"-"+ Close_year)
    let Nav_Price               = datarows.NAV
    let Asset_Size              = datarows.AUM
    let APIstatus               = "I"
    const to_Date               = new Date()
    let Create_Date             =  to_Date.getFullYear()+"-"+ (to_Date.getMonth()+1)  +"-"+ to_Date.getDate()//new Date(to_Date.getDate() +"-"+ (to_Date.getMonth()+1) +"-"+ to_Date.getFullYear())
    let Create_By               = "146"
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
        .input("Fund_Id"            , sql.NVarChar,     Fund_Id)
        .input("Close_Date"         , sql.DateTime,     Close_Date)
        .input("Nav_Price"          , sql.Numeric(18,4), Nav_Price)
        .input("Asset_Size"          , sql.Numeric(25,2), Asset_Size)
        .input("Offer_Price"        , sql.Numeric(18,4), Offer_Price)
        .input("Bid_Price"          , sql.Numeric(18,4), Bid_Price)
        .input("OfferSwitch_Price"  , sql.Numeric(18,4), OfferSwitch_Price)
        .input("BidSwitch_Price"    , sql.Numeric(18,4), BidSwitch_Price)
        .input("APIstatus"          , sql.NVarChar,      APIstatus)
        .input("Create_Date"        , sql.Date,          Create_Date)
        .input("Create_By"          , sql.NVarChar,      Create_By)
        .input("FUNDCODEI"          , sql.NVarChar,      FUNDCODEI)
        .query(statement); 

    }).then(result => {
        sql.close();
       // console.log(result);
        // console.log("Number of records inserted:" + result.rowsAffected);  
        console.log("Fund ID : " +Fund_Id +" Insert Complete");  
        // return callback(result);  

    }).catch(err => {
        // console.log(err);
        sql.close();
        insertErrorlogNav(Fund_Id, Close_Date, Nav_Price ,Asset_Size,Offer_Price,Bid_Price,OfferSwitch_Price,BidSwitch_Price,APIstatus,Create_Date,Create_By,FUNDCODEI)
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
        let Close_year               = datarows.NAV_DATE.substring(0,4)
        let Close_month             = datarows.NAV_DATE.substring(4,6)
        let Close_Day              = datarows.NAV_DATE.substring(6,8)
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
        let Modify_By               = "146"
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
                                            Asset_Size          = @Asset_Size,
                                            Bid_Price           = @Bid_Price,
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
            .input("Fund_Id"            , sql.NVarChar, Fund_Id)
            .input("Close_Date"         , sql.DateTime, Close_Date)
            .input("Nav_Price"          , sql.Numeric(18,4), Nav_Price)
            .input("Asset_Size"          , sql.Numeric(25,2), Asset_Size)
            .input("Offer_Price"        , sql.Numeric(18,4), Offer_Price)
            .input("Bid_Price"          , sql.Numeric(18,4), Bid_Price)
            .input("OfferSwitch_Price"  , sql.Numeric(18,4), OfferSwitch_Price)
            .input("BidSwitch_Price"    , sql.Numeric(18,4), BidSwitch_Price)
            .input("APIstatus"          , sql.NVarChar, APIstatus)
            .input("Modify_Date"        , sql.DateTime, Modify_Date)
            .input("Modify_By"          , sql.NVarChar, Modify_By)
            .input("FUNDCODEI"          , sql.NVarChar, FUNDCODEI)
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
        //console.log(data_row)
        if (data_row > 0) {
            for (let i = 0; i < data_row; i++) {
                setTimeout(function () {
                if (datarwos[i].dbFlag === 'insert'){
                    insertTableNav(datarwos[i])
                   // console.log(datarwos[i].Fund_Id)

                }
                if (datarwos[i].dbFlag === 'update'){
                     updateTableNav(datarwos[i])
                 //   console.log(datarwos[i].Fund_Id)  

                } 
               
                },i* 1500);   
            }
        }
        // let table = new sql.Table('MFTS_NavTable');


        // table.columns.add('Fund_Id', sql.VarChar(15), { nullable: true });
        // table.columns.add('Close_Date', sql.VarChar(30), { nullable: true });
        // table.columns.add('Nav_Price', sql.VarChar(20), { nullable: true });
        // table.columns.add('Asset_Size', sql.VarChar(15), { nullable: true });
        // table.columns.add('APIstatus', sql.VarChar(15), { nullable: true });
        // table.columns.add('Create_Date', sql.VarChar(20), { nullable: true });
        // table.columns.add('Create_By', sql.VarChar(20), { nullable: true });
        // table.columns.add('Offer_Price', sql.VarChar(20), { nullable: true });
        // table.columns.add('Bid_Price', sql.VarChar(8), { nullable: true });
        // table.columns.add('OfferSwitch_Price', sql.VarChar(15), { nullable: true });
        // table.columns.add('BidSwitch_Price', sql.VarChar(18), { nullable: true });
        // table.columns.add('Modify_By', sql.VarChar(18), { nullable: true });
        // table.columns.add('FUNDCODEI', sql.VarChar(18), { nullable: true });
  
        // datarows.forEach(datarow => table.rows.add.apply(table.rows, datarow));

        //console.dir(table1);
        // await new sql.ConnectionPool(config).connect().then(pool => {   
        //     return pool.request()
        //     .input("Fund_Id"            , sql.NVarChar, Fund_Id)
        //     .input("Close_Date"         , sql.DateTime, Close_Date)
        //     .input("Nav_Price"          , sql.Numeric, Nav_Price)
        //     .input("APIstatus"          , sql.NVarChar, APIstatus)
        //     .input("Modify_Date"        , sql.DateTime, Modify_Date)
        //     .input("Modify_By"          , sql.NVarChar, Modify_By)
        //     .input("FUNDCODEI"          , sql.NVarChar, FUNDCODEI)
        //     .query(statement);
  
        // }).then(result => {
        //     sql.close();
        //     console.log(result);
        //     // return callback(result);  
  
        // }).catch(err => {
        //     console.log(err);
        //     sql.close();
        //     // return callback(err);
        // });
          return callback("Import data to Navtable "+ data_row+" row is completed.");
    } catch (error) {
        console.log(error);
        return callback(error);
      
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
                console.log("No Job name...");
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
                console.log("Number of records inserted:" + result.rowsAffected);  
                
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
    if (dbname !== 'Fund_Cen_NAV'){
        return
    }
    let statement = `truncate table  ${dbname} `
    try 
    {
    //let data_nav
    await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request()
        .query(statement);
  
      }).then(result => {
        console.log("truncateTable " + dbname + "Success");
        sql.close();
        return callback(1)
  
      }).catch(err => {
        console.log(err);
        sql.close();
        return callback(0)
      });
    } catch (error) {
      result = "ERROR Catch"
      console.log(error);
      //return   callback(error);
    }
}
async function getFundPerformanceGroup(datarows, callback){
    // console.log(datarows)
    let resutla = []
    for (let index = 0; index < datarows.length; index++) { 
        // const element = array[index];
        // console.log(datarows[index].Fund_Id)
        if(index > 200){continue;}
        let fundid        =   datarows[index].Fund_Id
        const AMCID         = datarows[index].Amc_Id
        const FGroup_Code   = datarows[index].FGroup_Code
        const datenow       = new Date(Date.now() );
        const Fund_Code     = datarows[index].Fund_Code
        let close_date
        await getNavCloseDate(fundid ,(date_C)=>{
            close_date = date_C
        })  
        try{

            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .input('date'       ,sql.DateTime,      close_date)
                .input('amc_id'     ,sql.Int,           AMCID)
                .input('fund_id'    ,sql.VarChar(200),  fundid)
                .input('fundtype'   ,sql.VarChar(50),   FGroup_Code)
                .execute(`[dbo].[USP_MFTS_Query_Rpt_FundPerformance]`);
            }).then(result => {
                let rowsAffected = result.rowsAffected.toString()
                // if (rowsAffected > 0){   tranNo = result.returnValue  }
                sql.close();
            //    console.log("<========================>")
            //    console.log(result.recordset[0])

                resutla.push(result.recordset[0])// resutla.push(result.recordset)
                // return callback(result.recordset)
            }).catch(err => {
                console.log(err);
                sql.close();
                return  callback(err)
            });
        }catch (error) {
            // result = "ERROR Catch"
            console.log(error);
            return callback(error)
        }
    }
    
    // console.dir(resutla)
    return callback(resutla)

}
async function getFundPerformance(datarows, callback){
    // for (const key of datarows) {
        try{
            const fundid        = datarows[0].Fund_Id
            const AMCID         = datarows[0].Amc_Id
            const FGroup_Code   = datarows[0].FGroup_Code
            const datenow       = new Date(Date.now() );
            const Fund_Code     = datarows[0].Fund_Code  
            let close_date
            await getNavCloseDate(fundid ,(date_C)=>{
                close_date = date_C
            })
            // console.log(close_date)
            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .input('date'       ,sql.DateTime,      close_date)
                .input('amc_id'     ,sql.Int,           AMCID)
                .input('fund_id'    ,sql.VarChar(200),  fundid)
                .input('fundtype'   ,sql.VarChar(50),   FGroup_Code)
                .execute(`[dbo].[USP_MFTS_Query_Rpt_FundPerformance]`);
            }).then(result => {
                let rowsAffected = result.rowsAffected.toString()
                // if (rowsAffected > 0){   tranNo = result.returnValue  }
                sql.close();
            //    console.log(result)
                return callback(result.recordset)
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

        
    // }
    
  
}
async function  getNavCloseDate(fundid ,callback){
    try{
       let statement = `select MAX(close_date) as close_date from MFTS_NavTable Where Fund_Id = ${fundid} `
        // console.log(statement)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement)
        }).then(result => {
            let closeDate
            let rowsAffected = result.rowsAffected.toString()
            if (rowsAffected > 0){   closeDate = result.recordset[0].close_date   }
            sql.close();
        //    console.log(result)
            return callback(closeDate)
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
async function selectParmFundcode(fund_code,Amccode , callback ){
    try{
        // let statement = "SELECT MFTS_Fund.Fund_Id, MFTS_AMC.Amc_Id,  MFTS_Fund.FGroup_Code, MFTS_Fund.Fund_Type, MFTS_Fund.Fund_Code \
        //                  FROM MFTS_Fund inner join MFTS_Amc ON MFTS_FUND.Amc_Id = MFTS_AMC.Amc_Id \
        //                  WHERE MFTS_Fund.Fund_Code = @Fund_Code AND MFTS_AMC.Amc_Code = @Amccode"
        let statement = `BEGIN
        DECLARE @FGroup_Code [varchar](20) ; 
        DECLARE @FUND_ID int;
        DECLARE @AMCID  int;
      
      DECLARE @FGroupCode [varchar](15);
      DECLARE @toDate [date] = getdate();
      DECLARE @Fund_Type [varchar](15);
      DECLARE @Fund_Code [varchar](30) = '${fund_code}';
      DECLARE @Close_Date [date];
      DECLARE @fund_name [varchar](100);
      DECLARE @start_date [date] ;
      DECLARE @dividend [varchar](30);
      DECLARE @amc_Id [int]
      DECLARE @amc_code [varchar](30);
      DECLARE @amc_name [varchar](150);
      DECLARE @asset_size[decimal](25,4);;
      DECLARE @onedays [decimal](25,4);
      DECLARE @sevendays[decimal](25, 4) ;
      DECLARE @fifdays [decimal](25,4);
      DECLARE @onemonths [decimal](25,4);
      DECLARE @threemonths [decimal](25,4);
      DECLARE @sixmonths [decimal](25,4);
      DECLARE @ninemonths [decimal](25,4);
      DECLARE @oneyrs [decimal](25,4);
      DECLARE @twoyrs [decimal](25,4);
      DECLARE @threeyrs [decimal](25,4);
      DECLARE @fiveyrs [decimal](25,4);
      DECLARE @ytd [decimal](25,4);
      DECLARE @since_inception[decimal](25,4);
      DECLARE @navDate [date]
      DECLARE @navonedays [decimal](25,4);
      DECLARE @navyesterday[decimal](25,4);
      DECLARE @navpercent[decimal](25,4);
      DECLARE @navdip[decimal](25,4);
      DECLARE @fgroup__code [varchar](30)
      DECLARE @fgroup_desc [varchar](100)

      declare @temp table(
      fund_id  [int]
      ,fund_code [varchar](30)
      ,fund_name [varchar](100)
      ,fgroup__code [varchar](30)
      ,fgroup_desc [varchar](100)
      ,start_date [date]
      ,dividend [varchar](30)
      ,amc_code [varchar](30)
      ,amc_name [varchar](150)
      ,amc_Id [int]
      ,asset_size[decimal](25,4)
      ,onedays [decimal](25,4)
      ,sevendays[decimal](25,4)  
      ,fifdays [decimal](25,4)
      ,onemonths [decimal](25,4)
      ,threemonths [decimal](25,4)
      ,sixmonths [decimal](25,4)
      ,ninemonths [decimal](25,4)
      ,oneyrs [decimal](25,4)
      ,twoyrs [decimal](25,4)
      ,threeyrs [decimal](25,4)
      ,fiveyrs [decimal](25,4)
      ,ytd [decimal](25,4)
      ,since_inception[decimal](25,4)
      ,navDate [date]
      ,navonedays [decimal](25,4)
      ,navyesterday[decimal](25,4)
      ,navpercent[decimal](25,4)
      ,navdip[decimal](25,4)
      )
      
      DECLARE MFTS_FUNDGROUP_cursor CURSOR LOCAL FOR
      
      SELECT TOP(20) MFTS_Fund.Fund_Id
              , MFTS_Fund.Amc_Id
              ,  MFTS_Fund.FGroup_Code
              , MFTS_Fund.Fund_Type
              , MFTS_Fund.Fund_Code  
              FROM MFTS_Fund    
              WHERE MFTS_Fund.Fund_Code = @Fund_Code
      
      OPEN MFTS_FUNDGROUP_cursor
          
          FETCH NEXT FROM MFTS_FUNDGROUP_cursor  INTO @FUND_ID,@AMCID,@FGroupCode,@Fund_Type,@Fund_Code
      
          WHILE @@FETCH_STATUS = 0
          BEGIN
              set @Close_Date = (select MAX(close_date) as close_date from MFTS_NavTable Where Fund_Id = @FUND_ID)
              
                  INSERT INTO @temp
                   exec USP_MFTS_Query_Rpt_FundPerformance @Close_Date,@AMCID,@FUND_ID,@FGroup_Code
                  FETCH NEXT FROM MFTS_FUNDGROUP_cursor INTO @FUND_ID, @AMCID, @FGroupCode, @Fund_Type, @Fund_Code
          
          END;
      
          CLOSE MFTS_FUNDGROUP_cursor
          DEALLOCATE MFTS_FUNDGROUP_cursor
      
          SELECT * FROM @temp
      
      END`
        await poolPromise.then(pool => {
            return pool.request()
                // .input("Fund_Code", sql.NVarChar, fund_code) 
                // .input("Amccode",   sql.NVarChar, Amccode) 
                .query(statement)
        }).then(result => {
            // console.log(result);
            
            return callback(result.recordset)
        }).catch(err => {
            console.log(err);
            return callback(err)
        });
    }
    catch (error) {
        result = "ERROR Catch"
        console.log(error);
    }
}
async function selectParmFundcodeGroup(fundGroup , callback ){
    try{
        // let statement = "SELECT TOP(20) MFTS_Fund.Fund_Id, MFTS_Fund.Amc_Id,  MFTS_Fund.FGroup_Code, MFTS_Fund.Fund_Type, MFTS_Fund.Fund_Code \
        //                  FROM MFTS_Fund   \
        //                  WHERE MFTS_Fund.FGroup_Code = @FGroup_Code "
        let statement = `BEGIN
        DECLARE @FGroup_Code [varchar](20)  = '${fundGroup}'; 
        DECLARE @FUND_ID int;
        DECLARE @AMCID  int;
      
      DECLARE @FGroupCode [varchar](15);
      DECLARE @toDate [date] = getdate();
      DECLARE @Fund_Type [varchar](15);
      DECLARE @Fund_Code [varchar](30);
      DECLARE @Close_Date [date];
      DECLARE @fund_name [varchar](100);
      DECLARE @start_date [date] ;
      DECLARE @dividend [varchar](30);
      DECLARE @amc_Id [int]
      DECLARE @amc_code [varchar](30);
      DECLARE @amc_name [varchar](150);
      DECLARE @asset_size[decimal](25,4);;
      DECLARE @onedays [decimal](25,4);
      DECLARE @sevendays[decimal](25, 4) ;
      DECLARE @fifdays [decimal](25,4);
      DECLARE @onemonths [decimal](25,4);
      DECLARE @threemonths [decimal](25,4);
      DECLARE @sixmonths [decimal](25,4);
      DECLARE @ninemonths [decimal](25,4);
      DECLARE @oneyrs [decimal](25,4);
      DECLARE @twoyrs [decimal](25,4);
      DECLARE @threeyrs [decimal](25,4);
      DECLARE @fiveyrs [decimal](25,4);
      DECLARE @ytd [decimal](25,4);
      DECLARE @since_inception[decimal](25,4);
      DECLARE @navDate [date]
      DECLARE @navonedays [decimal](25,4);
      DECLARE @navyesterday[decimal](25,4);
      DECLARE @navpercent[decimal](25,4);
      DECLARE @navdip[decimal](25,4);
      DECLARE @fgroup__code [varchar](30)
      DECLARE @fgroup_desc [varchar](100)

      declare @temp table(
      fund_id  [int]
      ,fund_code [varchar](30)
      ,fund_name [varchar](100)
      ,fgroup__code [varchar](30)
      ,fgroup_desc [varchar](100)
      ,start_date [date]
      ,dividend [varchar](30)
      ,amc_code [varchar](30)
      ,amc_name [varchar](150)
      ,amc_Id [int]
      ,asset_size[decimal](25,4)
      ,onedays [decimal](25,4)
      ,sevendays[decimal](25,4)  
      ,fifdays [decimal](25,4)
      ,onemonths [decimal](25,4)
      ,threemonths [decimal](25,4)
      ,sixmonths [decimal](25,4)
      ,ninemonths [decimal](25,4)
      ,oneyrs [decimal](25,4)
      ,twoyrs [decimal](25,4)
      ,threeyrs [decimal](25,4)
      ,fiveyrs [decimal](25,4)
      ,ytd [decimal](25,4)
      ,since_inception[decimal](25,4)
      ,navDate [date]
      ,navonedays [decimal](25,4)
      ,navyesterday[decimal](25,4)
      ,navpercent[decimal](25,4)
      ,navdip[decimal](25,4)
      )
      
      DECLARE MFTS_FUNDGROUP_cursor CURSOR LOCAL FOR
      
      SELECT   MFTS_Fund.Fund_Id
              , MFTS_Fund.Amc_Id
              ,  MFTS_Fund.FGroup_Code
              , MFTS_Fund.Fund_Type
              , MFTS_Fund.Fund_Code  
              FROM MFTS_Fund    
              WHERE MFTS_Fund.FGroup_Code = @FGroup_Code
      
      OPEN MFTS_FUNDGROUP_cursor
          
          FETCH NEXT FROM MFTS_FUNDGROUP_cursor  INTO @FUND_ID,@AMCID,@FGroupCode,@Fund_Type,@Fund_Code
      
          WHILE @@FETCH_STATUS = 0
          BEGIN
              set @Close_Date = (select MAX(close_date) as close_date from MFTS_NavTable Where Fund_Id = @FUND_ID)
              
                  INSERT INTO @temp
                   exec USP_MFTS_Query_Rpt_FundPerformance @Close_Date,@AMCID,@FUND_ID,@FGroup_Code
                  FETCH NEXT FROM MFTS_FUNDGROUP_cursor INTO @FUND_ID, @AMCID, @FGroupCode, @Fund_Type, @Fund_Code
          
          END;
      
          CLOSE MFTS_FUNDGROUP_cursor
          DEALLOCATE MFTS_FUNDGROUP_cursor
      
          SELECT * FROM @temp
      
      END`
        await poolPromise.then(pool => {
            return pool.request()
                .input("FGroup_Code", sql.NVarChar, fundGroup) 
                .query(statement)
        }).then(result => {
            // console.log(result);
            
            return callback(result.recordset)
        }).catch(err => {
            console.log(err);
            return callback(err)
        });
    }
    catch (error) {
        result = "ERROR Catch"
        console.log(error);
    }
}
async function selectFundidtoNav(fundCode,Amccode , callback ){
    try{
        // let statement =  `SELECT     dbo.MFTS_Fund.Fund_Id, dbo.MFTS_Amc.Amc_Id
        //                   FROM      dbo.MFTS_Fund INNER JOIN
        //                             dbo.MFTS_Amc ON dbo.MFTS_Fund.Amc_Id = dbo.MFTS_Amc.Amc_Id  
        //                    WHERE MFTS_Fund.Fund_Code = @Fund_Code AND  dbo.MFTS_Amc.Amc_Code =@Amccode`

        let statement =`BEGIN
        DECLARE @FGroup_Code [varchar](20)  ; 
        DECLARE @AMCID  int;
        DECLARE @toDate [date] = getdate();
        DECLARE @Fund_Type [varchar](15);
        DECLARE @Close_Date [date];
        
        DECLARE @Fund_Code [varchar](30) =='${fundCode}' ;
        DECLARE @amc_code [varchar](30);
        DECLARE @navDate [date]
        DECLARE @FUND_ID [int]
        DECLARE @amc_Id [int]
        DECLARE @Risk_Level [int]
        DECLARE @fund_name [varchar](100);
        DECLARE @amc_name [varchar](150);
        DECLARE @FGroupCode [varchar](15);
        DECLARE @NavPrice [decimal](25,4);

        declare @temp table(
        fund_code [varchar](30)
        ,amc_code [varchar](30)
        ,navDate [date]
        ,NavPrice [decimal](25,4)
        ,fund_id  [int]
        ,amc_Id [int]
        ,Risk_Level [int]
        ,fund_name [varchar](100)
        ,amc_name [varchar](150)
        ,FGroupCode [varchar](30)
      )
      
      DECLARE MFTS_FUNDGROUP_cursor CURSOR LOCAL FOR
      
      SELECT   MFTS_Fund.Fund_Id
              , MFTS_Fund.Amc_Id
              ,  MFTS_Fund.FGroup_Code
              , MFTS_Fund.Fund_Type
              , MFTS_Fund.Fund_Code  
              FROM MFTS_Fund    
              WHERE MFTS_Fund.Fund_Code = @Fund_Code
      
      OPEN MFTS_FUNDGROUP_cursor
          
          FETCH NEXT FROM MFTS_FUNDGROUP_cursor  INTO @FUND_ID,@AMCID,@FGroupCode,@Fund_Type,@Fund_Code
      
          WHILE @@FETCH_STATUS = 0
          BEGIN
              set @Close_Date = (select MAX(close_date) as close_date from MFTS_NavTable Where Fund_Id = @FUND_ID)
              
                  INSERT INTO @temp
                   exec USP_API_NLC_NAV @FUND_ID,@AMCID
                   
                  FETCH NEXT FROM MFTS_FUNDGROUP_cursor INTO @FUND_ID, @AMCID, @FGroupCode, @Fund_Type, @Fund_Code
          
          END;
      
          CLOSE MFTS_FUNDGROUP_cursor
          DEALLOCATE MFTS_FUNDGROUP_cursor
      
          SELECT * FROM @temp
      
      END`
        await poolPromise.then(pool => {
            return pool.request()
                // .input("Fund_Code", sql.NVarChar(30), fundCode) 
                // .input("Amccode",   sql.NVarChar(15), Amccode) 
                .query(statement)
        }).then(result => {
            // console.log(result.recordset[0]);
            return callback(result.recordset)
            //return callback(result.recordset[0].Fund_Id ,result.recordset[0].Amc_Id )
        }).catch(err => {
            console.log(err);
            return callback(err)
        });
    }
    catch (error) {
        result = "ERROR Catch"
        console.log(error);
    }

}

async function getAPIDataNav(fundId,AmcId , callback ){
    try{
        // const fundid        = datarows[0].fundCode
        // const AMCID         = datarows[0].Amc_Id
        // const FGroup_Code   = datarows[0].FGroup_Code
        // const datenow       = new Date(Date.now() );
        // const Fund_Code     = datarows[0].Fund_Code  
        // console.log(datenow)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            // .input('fund_id'    ,sql.Int,   fundId) 
            // .input('amc_id'     ,sql.Int,   AmcId)
            .execute(`[dbo].[USP_API_NLC_NAV]`);
        }).then(result => {
            let rowsAffected = result.rowsAffected.toString()
            // if (rowsAffected > 0){   tranNo = result.returnValue  }
            sql.close();
        //    console.log(result)
            return callback(result.recordset)
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
async function insertErrorlogNav(Fund_Id, Close_Date, Nav_Price ,Asset_Size,Offer_Price,Bid_Price,OfferSwitch_Price,BidSwitch_Price,APIstatus,Create_Date,Create_By,FUNDCODEI){
    try{

        let statement = `INSERT INTO  MFTS_NavTable_Error (Fund_Id,Close_Date,Nav_Price,Offer_Price,Bid_Price,OfferSwitch_Price,
                                                    BidSwitch_Price,Asset_Size,APIstatus,FUNDCODEI,Create_Date, Create_By)
                                                    VALUES(
                                                    @Fund_Id,@Close_Date,@Nav_Price,@Offer_Price,@Bid_Price,@OfferSwitch_Price,
                                                    @BidSwitch_Price,@Asset_Size,@APIstatus,@FUNDCODEI,@Create_Date,@Create_By)  `



        await new sql.ConnectionPool(config).connect().then(pool => {    
            return pool.request()
            .input("Fund_Id"            , sql.NVarChar,     Fund_Id)
            .input("Close_Date"         , sql.DateTime,     Close_Date)
            .input("Nav_Price"          , sql.Numeric(18,4), Nav_Price)
            .input("Asset_Size"          , sql.Numeric(25,2), Asset_Size)
            .input("Offer_Price"        , sql.Numeric(18,4), Offer_Price)
            .input("Bid_Price"          , sql.Numeric(18,4), Bid_Price)
            .input("OfferSwitch_Price"  , sql.Numeric(18,4), OfferSwitch_Price)
            .input("BidSwitch_Price"    , sql.Numeric(18,4), BidSwitch_Price)
            .input("APIstatus"          , sql.NVarChar,      APIstatus)///
            .input("Create_Date"        , sql.Date,          Create_Date)
            .input("Create_By"          , sql.NVarChar,      Create_By)
            .input("FUNDCODEI"          , sql.NVarChar,      FUNDCODEI)
            .query(statement); 

        }).then(result => {
            sql.close();
        // console.log(result);
            // console.log("Number of records inserted:" + result.rowsAffected);  
            console.log("Error Fund ID : " +Fund_Id +" Insert Complete");  
            // return callback(result);  

        }).catch(err => {
            // console.log(err);
            sql.close();
            //insertErrorlogNav(Fund_Id, Close_Date, Nav_Price ,Asset_Size,Offer_Price,Bid_Price,OfferSwitch_Price,BidSwitch_Price,APIstatus,Create_Date,Create_By,FUNDCODEI)
            // return callback(err);
        }); 
    } catch (error) {
    //   result = "nook" 
    console.log(error);
    //  return callback(error);
    }
}
// IT Request 230204
async function DataNavLog(callback){
    const to_Date               = new Date()
    let Create_Date             =  to_Date.getFullYear()+"-"+ (to_Date.getMonth()+1)  +"-"+ to_Date.getDate()
    let data_NAV_LOG
    let data_row
    try{
        let statement = `SELECT * FROM MFTS_NavTable_Error WHERE CreateDate >='${Create_Date}'`
        
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
      
          }).then(result => {
            // console.log(result.recordset);
              data_row = result.rowsAffected.toString();
            if(data_row > 0 ){
                data_NAV_LOG = result.recordset
            }
            sql.close();
    
            // return  data_row;
      
          }).catch(err => {
            console.log(err);
            sql.close();
            // return   err;
          });
        } catch (error) {
          result = "ERROR Catch"
          console.log(error);
        //   return   error;
        }
        // console.log(data_NAV_LOG)
    if(data_row> 0){
        let txtapi = ""
        let fund_id, close_date ,Nav_Price ,i = 1
        for (const key in data_NAV_LOG) {
            fund_id         = data_NAV_LOG[key].Fund_Id
            close_date      = data_NAV_LOG[key].Close_Date
            Nav_Price       = data_NAV_LOG[key].Nav_Price

            txtapi = `<tr>
                          <td>${i} </td> 
                          <td align="right"> ${data_NAV_LOG[key].Fund_Id} </td>
                          <td align="right"> ${data_NAV_LOG[key].Close_Date} </td>
                          <td align="right"> ${data_NAV_LOG[key].Nav_Price} </td> 
                      </tr>
                            `
            i ++;
        }

        let table =`    <h1> รายการ Nav ไม่เข้าระบบ </h1><br>
                    <table border="1">
                    <tr>
                    <td> No. </td>
                    <td> Fund  ID </td>
                    <td> Close_Date </td>
                    <td> Nav_Price </td>
                    
                    </tr>
                    ${txtapi}
                </table>`
        const today = new Date()
        let date_ob = new Date(today)
        let date = ("0"+date_ob.getDate()).slice(-2); 
        let month = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let datenow = year +"-"+  month +"-"+  date
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
                user: 'it@wealthrepublic.co.th',
                pass: 'Wealth@2023'
            },
            tls:{ 
                rejectUnauthorized: false 
                }
        });
    
        // Message object
        let message = {
            from: 'it@wealthrepublic.co.th',
            to: 'atichat@wealthrepublic.co.th',
            //cc: 'komkrit@wealthrepublic.co.th ,sittichai@wealthrepublic.co.th,janjira@wealthrepublic.co.th', //'komkrit@wealthrepublic.co.th'
            subject: 'Auto mail Nav Log '+ datenow,
            text: `${table} `,
            html:  `${table}` 
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
}
async function DataFundPerformance(callback){
    // try {
    //     await poolPromise.then(pool => {
    //         return pool.request().query(' Truncate table [dbo].[MFTS_FundPerformancedaily]')
    //     }) 
    //     .then(result => {
    //         sql.close();
    //     }).catch(err => {
    //         console.log(err);
    //         sql.close();
    //     });   
    // } catch (error) {
        
    // }
    let DATA_DataFundPerformance ,DATA_NCL  
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
            DATA_NCL                 = result.recordsets
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
        if(since_inception === null || since_inception === undefined){since_inception = 0.00}
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
        set_datarows.push(ytd)        
        set_datarows.push(since_inception)
        set_datarows.push(navDate )       
        set_datarows.push(navonedays)     
        set_datarows.push(navyesterday)   
        set_datarows.push(navpercent)     
        set_datarows.push(navdip)         
     datarows.push(set_datarows)
}
        
    //  console.log(DATA_DataFundPerformance)
    let table = new sql.Table('MFTS_FundPerformancedaily');

    table.columns.add('fund_id', sql.Int, { nullable: false });
    table.columns.add('fund_code', sql.VarChar(30), { nullable: true });
    table.columns.add('fund_name', sql.VarChar(100), { nullable: true });
    table.columns.add('fgroup__code', sql.VarChar(30), { nullable: true });
    table.columns.add('fgroup_desc', sql.VarChar(100), { nullable: true });
    table.columns.add('start_date', sql.Date, { nullable: true });
    table.columns.add('dividend', sql.NVarChar(30), { nullable: true });
    table.columns.add('amc_code', sql.VarChar(30), { nullable: true });
    table.columns.add('amc_name', sql.NVarChar(150), { nullable: true });
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
        await pool.request().query("DELETE FROM MFTS_FundPerformancedaily");  
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);

            } else {
                
            }

            pool.close();
            sql.close();
        });

    // await dataNCLFundPerformance(datarows ,(x)=>{})
    return callback(datarows)
}
async function DataStandardDeviation(callback){
    
    // }
    let DATA_StandardDeviation ,DATA_NCL  
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
            .execute(`USP_MFTS_Query_Rpt_Standard_Deviation`)
        }) 
        .then(result => {
             
            DATA_StandardDeviation   = result.recordset
            DATA_NCL                 = result.recordsets
            sql.close();
        }).catch(err => {
            console.log(err);
           // sql.close();
        });    
    } catch (error) {
        sql.close();
    }

    let datarows =[]
      for (const key in DATA_StandardDeviation) {
       
        let fund_id             = DATA_StandardDeviation[key].fund_id //: '3102002137483',
        let fund_code           = DATA_StandardDeviation[key].fund_code
        let fund_name           = DATA_StandardDeviation[key].fund_name
        let fgroup_code         = DATA_StandardDeviation[key].fgroup_code
        let fgroup_desc         = DATA_StandardDeviation[key].fgroup_desc
        let start_date          = DATA_StandardDeviation[key].start_date
        let dividend            = DATA_StandardDeviation[key].dividend
        let amc_code            = DATA_StandardDeviation[key].amc_code
        let amc_name            = DATA_StandardDeviation[key].amc_name
        let amc_Id              = DATA_StandardDeviation[key].amc_Id
        let asset_size          = DATA_StandardDeviation[key].asset_size
        let onedays             = DATA_StandardDeviation[key].onedays.toString()
        let sevendays           = DATA_StandardDeviation[key].sevendays.toString()
        let fifdays             = DATA_StandardDeviation[key].fifdays.toString()
        let onemonths           = DATA_StandardDeviation[key].onemonths.toString()
        let threemonths         = DATA_StandardDeviation[key].threemonths.toString()
        let sixmonths           = DATA_StandardDeviation[key].sixmonths.toString()
        let ninemonths          = DATA_StandardDeviation[key].ninemonths.toString()
        let oneyrs              = DATA_StandardDeviation[key].oneyrs.toString()
        let twoyrs              = DATA_StandardDeviation[key].twoyrs.toString()
        let threeyrs            = DATA_StandardDeviation[key].threeyrs.toString()
        let fiveyrs             = DATA_StandardDeviation[key].fiveyrs.toString()
        let sevenyrs            = DATA_StandardDeviation[key].sevenyrs.toString()
        let tenyrs              = DATA_StandardDeviation[key].tenyrs.toString()
        let ytd                 = DATA_StandardDeviation[key].ytd.toString()
        let since_inception     = DATA_StandardDeviation[key].since_inception    
        let navDate             = DATA_StandardDeviation[key].navDate
        let navonedays          = DATA_StandardDeviation[key].navonedays
        let navyesterday        = DATA_StandardDeviation[key].navyesterday
        let navpercent          = DATA_StandardDeviation[key].navpercent
        let navdip              = DATA_StandardDeviation[key].navdip
        if(since_inception === null || since_inception === undefined){since_inception = 0.00}
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
        set_datarows.push(ytd)        
        set_datarows.push(since_inception)
        set_datarows.push(navDate )       
        set_datarows.push(navonedays)     
        set_datarows.push(navyesterday)   
        set_datarows.push(navpercent)     
        set_datarows.push(navdip)         
     datarows.push(set_datarows)
}
        
    //  console.log(DATA_DataFundPerformance)
    let table = new sql.Table('MFTS_SDFundPerformancedaily');

    table.columns.add('fund_id', sql.Int, { nullable: false });
    table.columns.add('fund_code', sql.VarChar(30), { nullable: true });
    table.columns.add('fund_name', sql.VarChar(100), { nullable: true });
    table.columns.add('fgroup__code', sql.VarChar(30), { nullable: true });
    table.columns.add('fgroup_desc', sql.VarChar(100), { nullable: true });
    table.columns.add('start_date', sql.Date, { nullable: true });
    table.columns.add('dividend', sql.NVarChar(30), { nullable: true });
    table.columns.add('amc_code', sql.VarChar(30), { nullable: true });
    table.columns.add('amc_name', sql.NVarChar(150), { nullable: true });
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
        await pool.request().query("DELETE FROM MFTS_SDFundPerformancedaily");  
        pool.request().bulk(table, function(err, result) {
            if (err) {
                console.log(err);

            } else {
                
            }

            pool.close();
            sql.close();
        });

    // await dataNCLFundPerformance(datarows ,(x)=>{})
    return callback(datarows)
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
    importOrderInquiry2,
    importCenAddress,
    selectNavTable,
    SelectFundId,
    importError,
    CheckNavTable,
    importNavTable,
    insertTableNav,
    updateTableNav,
    truncateTable,
    selectParmFundcode,
    selectParmFundcodeGroup,
    getFundPerformanceGroup,
    getFundPerformance,
    selectFundidtoNav,
    getAPIDataNav
    ,DataNavLog 
    ,DataStandardDeviation
}



