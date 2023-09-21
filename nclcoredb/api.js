// -----  CREATE DATE  13  DEC 2022 
// -----  Wealth Republic 
// -----  NCL 
import express from 'express';
import cors from 'cors'; 
import {
        StatusUpdate,
        setErrorLog,
        getDateYesterday,
        StatusUpdateExcel,
        setUpdateIndividualAccoutCODE
        }    
        from './dbutils.js';

import {
        test2json,
        getIndividualAccount,
        getIndividualBankAccount,
        getIndividualBankAccountX1,
        getCardIdLoop,
        getExcelIndividualLoop,
        getIndividualId_LoopBy
        } from './dbsrv.js';
import {getdataconfirm} from './dbncl.js'

import cron from 'node-cron' 
 

const app = express();
const router = express.Router();
 
app.use(express.json());
app.use(cors());
app.use('/api', router);

 
router.route('/getdipchipcomfirm').post( (req,res) => {
//        console.log(res)
       let confirm_date = req.body.chip_date
//       console.log(confirm_date)
     getdataconfirm(confirm_date ,(result)=>{
        console.log(result)
        res.json(result)
     })
    
});

  

app.listen(5550, () => {
    console.log ('Listening CLS DB on port 5550');
});
