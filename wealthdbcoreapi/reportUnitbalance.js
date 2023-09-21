//****************[ Created Date 2023 06 15  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/
//****************2023-06-15*************************************************** */
 
import sql  from 'mssql';
import dotenv from 'dotenv';
import PDFDocument  from'pdfkit';
import nodemailer from 'nodemailer';
import  plotly   from 'plotly' ;
import canvas from 'canvas';
const { createCanvas } = canvas;
// import {Chart}  from 'chart.js';
// import {createCanvas} from 'canvas';
// import PieChart from 'svg-charts'; 
// import PDFtable from'pdfkit-table';

// import axios from 'axios';
import fs from 'fs'
import { config,config_NCL } from './dbconfig.js'; 
 
dotenv.config();

const cardNO = process.argv[2];
const emailSend = process.argv[3] ;
// console.log('cardNO')
 
let birthDate = "" ,thName ="" ,timefull="", thFirstName="", thLastName="",title_Name="",email="",bankAcc="",bankName="",mobile="",tel=""
let Addr_No = "" ,address2="" , address=""    ,bulider = "",soi = "",street ="",Tambon="",Amphur="",Province='',Zip_Code=""
let filename 
let DATA_MAIN ,DATA_MUTUAL_FUND,DATA_LTF,DATA_RMF,DATA_SSFX,DATA_SSF,DATA_TRANSACTION,DATA_EQ,DATA_FI,DATA_FIF_EQ,DATA_FIF_FI,DATA_FIF_GOLD,DATA_FIF_MIX,DATA_FIF_OIL,DATA_FIF_PF_REIT,DATA_MIX,DATA_MMF,DATA_PF_REIT ,DATA_FIF_GOLD_OIL,DATA_Alternative
let DATA_MUTUAL_FUND_Y = 1,DATA_LTF_Y = 1,DATA_RMF_Y = 1 ,DATA_SSFX_Y = 1 ,DATA_SSF_Y = 1 
                                //DATA_MUTUAL_FUND,DATA_LTF,DATA_RMF,DATA_SSFX,DATA_SSF,DATA_EQ,DATA_FI,DATA_FIF_EQ,DATA_FIF_FI,DATA_FIF_GOLD,DATA_FIF_MIX,DATA_FIF_OIL,DATA_FIF_PF_REIT,DATA_MIX,DATA_MMF,DATA_PF_REIT,DATA_FIF_GOLD_OIL,DATA_Alternative
await dataHoldingReport(cardNO,(DATA_MUTUAL_FUNDX,DATA_LTFX,DATA_RMFX,DATA_SSFXX,DATA_SSFXD,DATA_EQX,DATA_FIX,DATA_FIF_EQX,DATA_FIF_FIX,DATA_FIF_GOLDX,DATA_FIF_MIXX,DATA_FIF_OILX,DATA_FIF_PF_REITX,DATA_MIXX,DATA_MMFX,DATA_PF_REITX,DATA_FIF_GOLD_OILX,DATA_AlternativeX)=>{
    DATA_MUTUAL_FUND    = DATA_MUTUAL_FUNDX
    DATA_LTF            = DATA_LTFX
    DATA_RMF            = DATA_RMFX
    DATA_SSFX           = DATA_SSFXX
    DATA_SSF            = DATA_SSFXD
    DATA_EQ             = DATA_EQX
    DATA_FI             = DATA_FIX
    DATA_FIF_EQ         = DATA_FIF_EQX
    DATA_FIF_FI         = DATA_FIF_FIX
    DATA_FIF_GOLD       = DATA_FIF_GOLDX
    DATA_FIF_MIX        = DATA_FIF_MIXX
    DATA_FIF_OIL        = DATA_FIF_OILX
    DATA_FIF_PF_REIT    = DATA_FIF_PF_REITX
    DATA_MIX            = DATA_MIXX
    DATA_PF_REIT        = DATA_PF_REITX
    DATA_MMF            = DATA_MMFX
    DATA_FIF_GOLD_OIL   = DATA_FIF_GOLD_OILX
    DATA_Alternative    = DATA_AlternativeX
})
await datatransaction (cardNO,(DATA_TRANSACTIONX)=>{DATA_TRANSACTION=DATA_TRANSACTIONX})
try{ await new sql.ConnectionPool(config).connect().then(pool => {
        return pool.request() .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  .query(`
                    SELECT a.Birth_Day,a.Title_Name_T,a.First_Name_T,a.Last_Name_T ,a.Email,a.Mobile ,a.Bank_AccountReturn ,c.Bank_Short_Name ,b.Addr_No as Addr_No,  Place2 as bulider, Road as soi, Road2 as street  ,(SELECT Name_Thai FROM REF_Tambons WHERE Tambon_ID = b.Tambon_Id ) as Tambon
                    ,(SELECT Name_Thai FROM REF_Amphurs WHERE Amphur_ID=b.Amphur_Id) as Amphur ,(SELECT Name_Thai FROM REF_Provinces WHERE Province_ID = b.Province_Id ) as Province , Zip_Code ,b.Tel  
                    FROM Account_Info a left join dbo.Account_Address b On a.Cust_Code =b.Cust_Code
                    left join REF_Banks c ON a.Bank_IdReturn = c.Bank_ID
                    WHERE a.Cust_Code = @Cust_Code AND b.Addr_Seq = 2`);
    }).then(result => {   
        if ( result.rowsAffected > 0){    
            birthDate           =  result.recordset[0].Birth_Day
            title_Name          = result.recordset[0].Title_Name_T
            thFirstName         =  result.recordset[0].First_Name_T.trim() // parser.parseFromString(datarows[key].First_Name_T ,'text/html') //datarows[key].First_Name_T// Buffer.from(datarows[key].First_Name_T, 'utf-8').toString(); //datarows[key].First_Name_T.trim().toString('utf-8')
            thLastName          = result.recordset[0].Last_Name_T.trim()
            thName              = title_Name+"_"+thFirstName + "_" +thLastName
            Addr_No             = result.recordset[0].Addr_No
            email                = result.recordset[0].Email
            bankAcc             = result.recordset[0].Bank_AccountReturn
            bankName            = result.recordset[0].Bank_Short_Name
            mobile              = result.recordset[0].Mobile
            tel                  = result.recordset[0].Tel
            if(result.recordset[0].bulider){bulider = "หมู่บ้าน/อาคาร"+result.recordset[0].bulider}
            if(result.recordset[0].soi){soi = "ซอย"+result.recordset[0].soi}
            if(result.recordset[0].street ){street = "ถนน"+result.recordset[0].street }
            if(result.recordset[0].Tambon ){Tambon = "ต."+result.recordset[0].Tambon }
            if(result.recordset[0].Amphur ){Amphur = "อ."+result.recordset[0].Amphur }
            if(result.recordset[0].Province ){Province =  result.recordset[0].Province }
            if(result.recordset[0].Zip_Code ){Zip_Code = result.recordset[0].Zip_Code }
            
            //console.log
        }  
        sql.close();  
});    
}catch (error) { }

    const today                 = new Date()
    let date_ob                 = new Date(today);
    let date                    = ("0"+date_ob.getDate()).slice(-2); 
    let month                   = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year                    = date_ob.getFullYear();
    let hours                   = date_ob.getHours();
    let minutes                 = date_ob.getMinutes();
    let second                  = date_ob.getSeconds();
    let msecond                 = date_ob.getMilliseconds()
    const currentDate = new Date();
    const optionss = { month: 'long', locale: 'th-TH' };
    const thaiMonth = currentDate.toLocaleString('th-TH', optionss);
    // const currentDate = new Date();
    const optionsss = { month: 'long', locale: 'en-US' };
    const englishMonth = currentDate.toLocaleString('en-US', optionsss);

    

    let Sarabun                 ='fonts/Sarabun-Light.ttf'
    let Sarabun_Italic          ='fonts/Sarabun-Italic.ttf'
    let Sarabun_Regular         = 'fonts/Sarabun-Regular.ttf'
    let Sarabun_LightItalic     = 'fonts/Sarabun-LightItalic.ttf'
    let Sarabun_Bold            = 'fonts/Sarabun-SemiBoldItalic.ttf'

    let timestampx = year +  month  + date
    let fullday         = date + month + year
    // if (datexp < fullday){datexp_day1 = "";datexp_day2 = "";datexp_month1 = "";datexp_month2 = "";datexp_year1 = "";datexp_year2 = "";datexp_year3 = "";datexp_year4 = ""; }
    let datetimefull    = year +  month  +  date + hours + minutes + second + msecond// console.log(title)
    timefull        = hours.toString() + minutes.toString() + second.toString() + msecond.toString()
    address     = Addr_No + " "+bulider.trim()+ " "+ soi+ " "+street+ " "+Tambon //+ " "+Amphur+ " "+Province+ " "+Zip_Code
    // console.log("address "+address.length)
    if (address.length < 70){
        address     = Addr_No + " "+bulider.trim()+ " "+ soi+ " "+street+ " "+Tambon  + " "+Amphur+ " "+Province+ " "+Zip_Code
    }else{
        address2    = Amphur+ " "+Province+ " "+Zip_Code
    }
    //console.log('xxxxxwww'+birthDate+'eeeeee')
    if(birthDate.length == 0 ){ process.exit(0)  }
    
    // console.log(birthDate)
    const bdate = new Date(birthDate);
    const bday = bdate.getDate().toString().padStart(2, '0');
    const bmonth = (bdate.getMonth() + 1).toString().padStart(2, '0');
    const byear = bdate.getFullYear().toString();
    birthDate = `${bday}${bmonth}${byear}`;
    console.log('birth Date ='+birthDate); // Output: 27-09-1969

    console.log(birthDate)
    var options = { 
        margin: 30,
        size: 'A4'  
        //, userPassword: birthDate
    }
    var dir = 'C:\\WR\\fundcon\\'+timestampx; 
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true }); 
        }
    

    const doc = new PDFDocument(options);
    // doc.registerFont('fonts/Sarabun-Italic.TTF'); 
    filename = thName + "_" + timestampx + "_" + timefull 
    const outputStream = doc.pipe(fs.createWriteStream(dir+'\\'+filename+'.pdf'));

    doc.image('image/WR_DocBackground02.jpg', 0, 0, {width: 600,height:800}) // 1
    

doc.font(Sarabun).fontSize(7).text('บัญชีเลขที่ Account #XXXXXXXXX'+cardNO.substring(12,9)+'X'  ,25,104)
doc.fontSize(10).text(title_Name+" "+thFirstName + " " +thLastName ,25,115+3)
doc.fontSize(8).text(address ,25,131+3)
doc.fontSize(8).text(address2 ,25,143+3)

doc.font(Sarabun_Regular).fontSize(10).text('รายงานยอดเงินคงเหลือ',440,104)            
doc.fontSize(10).text('Investment Holding Report',440,118)            
doc.font(Sarabun).fontSize(8).text(`ณ วันที่ ${date} ${thaiMonth} ${year+543}`,440,134)            
doc.fontSize(8).text(`As of ${date} ${englishMonth} ${year}`,440,146) 

let startX = 25;
let startY = 165;
let rowHeight = 15;
let columnWidth = 55;
let y ;  
 
await PdfHeader(startX,startY,columnWidth,rowHeight,(xx,yy,co,row)=>{
        startX=xx;
        y=yy;
        rowHeight=row;
        columnWidth=co;
})
//---DATA_MUTUAL_FUND
let  textWidth ,sumTotalCost = 0,sumMKV= 0,sumUrL= 0 ,sumPercentUrl = 0,sumTotalCostAll =0 ,sumMKVAll = 0,sumUrLAll =0 ,sumPercentUrlAll=0
let  rightAlignedX 
let match4,   match2
let sumtotal_mutual_fund ,sumtotal_ltf,sumtotal_rmf,sumtotal_ssfx,sumtotal_ssf 
if (DATA_MUTUAL_FUND.length  > 0){
    y = y+13
    doc.font(Sarabun_Regular).fontSize(8).text('กองทุนรวมทั่วไป / General Mutual Fund', 25, y);
    doc.font(Sarabun).fontSize(8)
    for (let row = 0; row < DATA_MUTUAL_FUND.length; row++) {
        y += rowHeight;
        for (let col = 0; col < DATA_MUTUAL_FUND[row].length; col++) {
            switch (col) {
                case 0:
                    doc.fontSize(8).text(DATA_MUTUAL_FUND[row][col],25, y);
                    break;
                case 1: //RISK
                    doc.fontSize(7).text(DATA_MUTUAL_FUND[row][col],110, y);
                    break;
                case 2: //AMC
                    textWidth =doc.widthOfString(DATA_MUTUAL_FUND[row][col]);
                    rightAlignedX = 165 - textWidth ; 
                    doc.fontSize(8).text(DATA_MUTUAL_FUND[row][col],rightAlignedX, y);
                    break;
                case 3: //Unit Holding
                    textWidth =doc.widthOfString(DATA_MUTUAL_FUND[row][col].toString());
                    rightAlignedX = 250 - textWidth ; 
                    doc.fontSize(7).text(DATA_MUTUAL_FUND[row][col],rightAlignedX, y);
                    break;
                case 4: //avg cost
                    
                    await matchceil4(DATA_MUTUAL_FUND[row][col],(x)=>{
                        match4=x
                    })
                    textWidth =doc.widthOfString(match4.toString());
                    
                    rightAlignedX = 281 - textWidth ; 
                    doc.fontSize(7).text(match4,rightAlignedX, y);
                    break;
                case 5: //NAV
                    textWidth =doc.widthOfString(DATA_MUTUAL_FUND[row][col].toString());
                    rightAlignedX = 315 - textWidth ; 
                    doc.fontSize(7).text(DATA_MUTUAL_FUND[row][col],rightAlignedX, y);
                    break;
                case 6: //NAV AS AT
                    doc.fontSize(7).text(DATA_MUTUAL_FUND[row][col],324, y);
                    break;
                case 7: //total cost
                    await matchceil2(DATA_MUTUAL_FUND[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 418 - textWidth ;
                    sumTotalCost = sumTotalCost+ parseFloat(DATA_MUTUAL_FUND[row][col]);
                    //  console.log(match2)
                    // positionTotalCost = rightAlignedX;
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 8: //market valu
                    await matchceil2(DATA_MUTUAL_FUND[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 473 - textWidth ;
                    sumMKV = sumMKV + parseFloat(DATA_MUTUAL_FUND[row][col]);
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 9:
                    await matchceil2(DATA_MUTUAL_FUND[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 534 - textWidth ;
                    sumUrL = sumUrL + parseFloat(DATA_MUTUAL_FUND[row][col])
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 10:
                    await matchceil2(DATA_MUTUAL_FUND[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 557 - textWidth ;
                    sumPercentUrl = sumPercentUrl + parseFloat(DATA_MUTUAL_FUND[row][col])
                    doc.fontSize(7).text(match2+" %",rightAlignedX, y);
                    break;
            
                default:
                    break;
                
            }
           
        }
    }
//--- SUM MUTUAL_FUND
    y= y+15
    doc.font(Sarabun_Regular).fontSize(8).text("ยอดรวม / Total",25,y+2)
    //-- total Cost 
    textWidth = doc.widthOfString(matchlocal(sumTotalCost)); sumTotalCostAll = sumTotalCostAll+sumTotalCost; sumtotal_mutual_fund = sumTotalCost;
    rightAlignedX = 423.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumTotalCost),rightAlignedX,y+2)
    //-- Market value
    textWidth = doc.widthOfString(matchlocal(sumMKV)); sumMKVAll = sumMKVAll+ sumMKV;
    rightAlignedX = 473.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumMKV),rightAlignedX,y+2)
    //-- Unreealized Gain
    textWidth = doc.widthOfString(matchlocal(sumUrL)); sumUrLAll = sumUrLAll + sumUrL
    rightAlignedX = 534.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumUrL),rightAlignedX,y+2)
    //-- PERCEN Unreealized Gain   sumPercentUrl
    sumPercentUrl = (sumUrL *100)/ sumTotalCost 
    textWidth = doc.widthOfString(matchlocal(sumPercentUrl));sumPercentUrlAll = sumPercentUrlAll +sumPercentUrl
    rightAlignedX = 558.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumPercentUrl)+'%',rightAlignedX,y+2)

    let lineData = [
    { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
    { x1: 25, y1: y+15, x2: 575, y2: y+15, color: '#000000' }   // Line 3 with blue color
];
for (let line of lineData) {
    doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();
}
y= y+15  
//-- SUM  MUTUAL_FUND
} //-- MUTUAL_FUND


if(DATA_LTF.length  > 0){
    y = y+5
    sumTotalCost= 0,sumMKV=0,sumUrL=0 ,sumPercentUrl = 0
    doc.font(Sarabun_Regular).fontSize(8).text('กองทุนรวมหุ้นระยะยาว / Long Term Equity Fund', 25, y);
    doc.font(Sarabun).fontSize(8)
    for (let row = 0; row < DATA_LTF.length; row++) {
        y += rowHeight;
        for (let col = 0; col < DATA_LTF[row].length; col++) {
            //-- chack Y
            if(y >= 630 && DATA_LTF_Y == 1){
                doc.text("*หากพบว่าข้อมูลในรายการนี้ไม่ถูกต้อง หรือมีข้อสงสัยประการใด โปรดติดต่อฝ่ายบริการลูกค้าที่หมายเลข 02 677-6697-8 หรือ email : marketing@wealthrepublic.co.th", 40,y+50)
                doc.text("In case any errors found or having any queries, please contact client service team at 02 677-6697-8 or email : marketing@wealthrepublic.co.th", 40,y+65)
                await pdfNewPage(25,104,55,15)
                startX = 25;
                y = 104+40;
                rowHeight = 15;
                columnWidth = 55; 
                DATA_LTF_Y = DATA_LTF_Y+1;
             }
            switch (col) {
                case 0:
                    doc.fontSize(8).text(DATA_LTF[row][col],25, y);
                    break;
                case 1: //RISK
                    doc.fontSize(7).text(DATA_LTF[row][col],110, y);
                    break;
                case 2: //AMC
                    textWidth =doc.widthOfString(DATA_LTF[row][col]);
                    rightAlignedX = 165 - textWidth ; 
                    doc.fontSize(8).text(DATA_LTF[row][col],rightAlignedX, y);
                    break;
                case 3: //Unit Holding
                    textWidth =doc.widthOfString(DATA_LTF[row][col].toString());
                    rightAlignedX = 250 - textWidth ; 
                    doc.fontSize(7).text(DATA_LTF[row][col],rightAlignedX, y);
                    break;
                case 4: //avg cost
                    
                    await matchceil4(DATA_LTF[row][col],(x)=>{
                        match4=x
                    })
                    textWidth =doc.widthOfString(match4.toString());
                    
                    rightAlignedX = 281 - textWidth ; 
                    doc.fontSize(7).text(match4,rightAlignedX, y);
                    break;
                case 5: //NAV
                    textWidth =doc.widthOfString(DATA_LTF[row][col].toString());
                    rightAlignedX = 315 - textWidth ; 
                    doc.fontSize(7).text(DATA_LTF[row][col],rightAlignedX, y);
                    break;
                case 6: //NAV AS AT
                    doc.fontSize(7).text(DATA_LTF[row][col],324, y);
                    break;
                case 7: //total cost
                    await matchceil2(DATA_LTF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 418 - textWidth ;
                    sumTotalCost = sumTotalCost+ parseFloat(DATA_LTF[row][col]);
                    //  console.log(match2)
                    // positionTotalCost = rightAlignedX;
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 8: //market valu
                    await matchceil2(DATA_LTF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 473 - textWidth ;
                    sumMKV = sumMKV + parseFloat(DATA_LTF[row][col]);
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 9:
                    await matchceil2(DATA_LTF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 534 - textWidth ;
                    sumUrL = sumUrL + parseFloat(DATA_LTF[row][col])
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 10:
                    await matchceil2(DATA_LTF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 557 - textWidth ; 
                    sumPercentUrl = sumPercentUrl + parseFloat(DATA_LTF[row][col])
                    doc.fontSize(7).text(match2+" %",rightAlignedX, y);
                    break;
            
                default:
                    break;
                
            }
           
        }
    }
//--- SUM LTF
    y= y+15
    doc.font(Sarabun_Regular).fontSize(8).text("ยอดรวม / Total",25,y+2)
    //-- total Cost 
    textWidth = doc.widthOfString(matchlocal(sumTotalCost)); sumTotalCostAll = sumTotalCostAll+sumTotalCost;sumtotal_ltf = sumTotalCost   ;
    rightAlignedX = 423.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumTotalCost),rightAlignedX,y+2)
    //-- Market value
    textWidth = doc.widthOfString(matchlocal(sumMKV)); sumMKVAll = sumMKVAll+ sumMKV;
    rightAlignedX = 473.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumMKV),rightAlignedX,y+2)
    //-- Unreealized Gain
    textWidth = doc.widthOfString(matchlocal(sumUrL));sumUrLAll = sumUrLAll+ sumUrL;
    rightAlignedX = 534.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumUrL),rightAlignedX,y+2)
    //-- PERCEN Unreealized Gain   sumPercentUrl
    sumPercentUrl = (sumUrL *100)/ sumTotalCost 
    textWidth = doc.widthOfString(matchlocal(sumPercentUrl));sumPercentUrlAll = sumPercentUrlAll +sumPercentUrl
    rightAlignedX = 558.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumPercentUrl)+'%',rightAlignedX,y+2)

    let lineData = [
    { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
    { x1: 25, y1: y+15, x2: 575, y2: y+15, color: '#000000' }   // Line 3 with blue color
    ];
    for (let line of lineData) {
        doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();
    }
    y= y+15  
}
// console.log('LTF'+y)

if(DATA_RMF.length  > 0){
    y = y+5
    sumTotalCost= 0,sumMKV=0,sumUrL=0 ,sumPercentUrl = 0
    doc.font(Sarabun_Regular).fontSize(8).text('กองทุนรวมเพื่อการเลี้ยงชีพ / Retirement Mutual Fund', 25, y);
    doc.font(Sarabun).fontSize(8)
    for (let row = 0; row < DATA_RMF.length; row++) {
        y += rowHeight;
        for (let col = 0; col < DATA_RMF[row].length; col++) {
            //-- chack Y
            if(y >= 630 && DATA_RMF_Y == 1){
                doc.text("*หากพบว่าข้อมูลในรายการนี้ไม่ถูกต้อง หรือมีข้อสงสัยประการใด โปรดติดต่อฝ่ายบริการลูกค้าที่หมายเลข 02 677-6697-8 หรือ email : marketing@wealthrepublic.co.th", 40,y+50)
                doc.text("In case any errors found or having any queries, please contact client service team at 02 677-6697-8 or email : marketing@wealthrepublic.co.th", 40,y+65)
                await pdfNewPage(25,104,55,15)
                startX = 25;
                y = 104+40;
                rowHeight = 15;
                columnWidth = 55; 
                DATA_RMF_Y = DATA_RMF_Y+1;
             }
            switch (col) {
                case 0:
                    doc.fontSize(8).text(DATA_RMF[row][col],25, y);
                    break;
                case 1: //RISK
                    doc.fontSize(7).text(DATA_RMF[row][col],110, y);
                    break;
                case 2: //AMC
                    textWidth =doc.widthOfString(DATA_RMF[row][col]);
                    rightAlignedX = 165 - textWidth ; 
                    doc.fontSize(8).text(DATA_RMF[row][col],rightAlignedX, y);
                    break;
                case 3: //Unit Holding
                    textWidth =doc.widthOfString(DATA_RMF[row][col].toString());
                    rightAlignedX = 250 - textWidth ; 
                    doc.fontSize(7).text(DATA_RMF[row][col],rightAlignedX, y);
                    break;
                case 4: //avg cost
                    
                    await matchceil4(DATA_RMF[row][col],(x)=>{
                        match4=x
                    })
                    textWidth =doc.widthOfString(match4.toString());
                    
                    rightAlignedX = 281 - textWidth ; 
                    doc.fontSize(7).text(match4,rightAlignedX, y);
                    break;
                case 5: //NAV
                    textWidth =doc.widthOfString(DATA_RMF[row][col].toString());
                    rightAlignedX = 315 - textWidth ; 
                    doc.fontSize(7).text(DATA_RMF[row][col],rightAlignedX, y);
                    break;
                case 6: //NAV AS AT
                    doc.fontSize(7).text(DATA_RMF[row][col],324, y);
                    break;
                case 7: //total cost
                    await matchceil2(DATA_RMF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 418 - textWidth ;
                    sumTotalCost = sumTotalCost+ parseFloat(DATA_RMF[row][col]);
                    //  console.log(match2)
                    // positionTotalCost = rightAlignedX;
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 8: //market valu
                    await matchceil2(DATA_RMF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 473 - textWidth ;
                    sumMKV = sumMKV + parseFloat(DATA_RMF[row][col]);
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 9:
                    await matchceil2(DATA_RMF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 534 - textWidth ;
                    sumUrL = sumUrL + parseFloat(DATA_RMF[row][col])
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 10:
                    await matchceil2(DATA_RMF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 557 - textWidth ;
                    sumPercentUrl = sumPercentUrl + parseFloat(DATA_RMF[row][col])
                    doc.fontSize(7).text(match2+" %",rightAlignedX, y);
                    break;
            
                default:
                    break;
                
            }
            
        }
    }
//--- SUM RMF
    y= y+15
    doc.font(Sarabun_Regular).fontSize(8).text("ยอดรวม / Total",25,y+2)
    //-- total Cost 
    textWidth = doc.widthOfString(matchlocal(sumTotalCost)); sumTotalCostAll = sumTotalCostAll + sumTotalCost; sumtotal_rmf = sumTotalCost; 
    rightAlignedX = 423.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumTotalCost),rightAlignedX,y+2)
    //-- Market value
    textWidth = doc.widthOfString(matchlocal(sumMKV)); sumMKVAll = sumMKVAll+ sumMKV;
    rightAlignedX = 473.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumMKV),rightAlignedX,y+2)
    //-- Unreealized Gain
    textWidth = doc.widthOfString(matchlocal(sumUrL)); sumUrLAll = sumUrLAll+ sumUrL;
    rightAlignedX = 534.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumUrL),rightAlignedX,y+2)
    //-- PERCEN Unreealized Gain   sumPercentUrl
    sumPercentUrl = (sumUrL *100)/ sumTotalCost 
    textWidth = doc.widthOfString(matchlocal(sumPercentUrl));sumPercentUrlAll = sumPercentUrlAll +sumPercentUrl
    rightAlignedX = 558.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumPercentUrl)+'%',rightAlignedX,y+2)

    let lineData = [
    { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
    { x1: 25, y1: y+15, x2: 575, y2: y+15, color: '#000000' }   // Line 3 with blue color
    ];
    for (let line of lineData) {
        doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();
    }
    y= y+15
    // console.log('RMF '+y)
}
if(DATA_SSFX.length  > 0){
    y = y+5
    sumTotalCost= 0,sumMKV=0,sumUrL=0 ,sumPercentUrl = 0
    doc.font(Sarabun_Regular).fontSize(8).text('กองทุนรวมเพื่อการออมพิเศษ / Super Saving Fund Extra : SSFX', 25, y);
    doc.font(Sarabun).fontSize(8)
    for (let row = 0; row < DATA_SSFX.length; row++) {
        y += rowHeight;
        for (let col = 0; col < DATA_SSFX[row].length; col++) {
            //-- chack Y
            if(y >= 630 && DATA_SSFX_Y == 1){
                doc.text("*หากพบว่าข้อมูลในรายการนี้ไม่ถูกต้อง หรือมีข้อสงสัยประการใด โปรดติดต่อฝ่ายบริการลูกค้าที่หมายเลข 02 677-6697-8 หรือ email : marketing@wealthrepublic.co.th", 40,y+50)
                doc.text("In case any errors found or having any queries, please contact client service team at 02 677-6697-8 or email : marketing@wealthrepublic.co.th", 40,y+65)
                await pdfNewPage(25,104,55,15)
                startX = 25;
                y = 104+40;
                rowHeight = 15;
                columnWidth = 55; 
                DATA_SSFX_Y = DATA_SSFX_Y+1;
             }
            switch (col) {
                case 0:
                    doc.fontSize(8).text(DATA_SSFX[row][col],25, y);
                    break;
                case 1: //RISK
                    doc.fontSize(7).text(DATA_SSFX[row][col],110, y);
                    break;
                case 2: //AMC
                    textWidth =doc.widthOfString(DATA_SSFX[row][col]);
                    rightAlignedX = 165 - textWidth ; 
                    doc.fontSize(8).text(DATA_SSFX[row][col],rightAlignedX, y);
                    break;
                case 3: //Unit Holding
                    textWidth =doc.widthOfString(DATA_SSFX[row][col].toString());
                    rightAlignedX = 250 - textWidth ; 
                    doc.fontSize(7).text(DATA_SSFX[row][col],rightAlignedX, y);
                    break;
                case 4: //avg cost
                    
                    await matchceil4(DATA_SSFX[row][col],(x)=>{
                        match4=x
                    })
                    textWidth =doc.widthOfString(match4.toString());
                    
                    rightAlignedX = 281 - textWidth ; 
                    doc.fontSize(7).text(match4,rightAlignedX, y);
                    break;
                case 5: //NAV
                    textWidth =doc.widthOfString(DATA_SSFX[row][col].toString());
                    rightAlignedX = 315 - textWidth ; 
                    doc.fontSize(7).text(DATA_SSFX[row][col],rightAlignedX, y);
                    break;
                case 6: //NAV AS AT
                    doc.fontSize(7).text(DATA_SSFX[row][col],324, y);
                    break;
                case 7: //total cost
                    await matchceil2(DATA_SSFX[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 418 - textWidth ;
                    sumTotalCost = sumTotalCost+ parseFloat(DATA_SSFX[row][col]);
                    //  console.log(match2)
                    // positionTotalCost = rightAlignedX;
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 8: //market valu
                    await matchceil2(DATA_SSFX[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 473 - textWidth ;
                    sumMKV = sumMKV + parseFloat(DATA_SSFX[row][col]);
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 9:
                    await matchceil2(DATA_SSFX[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 534 - textWidth ;
                    sumUrL = sumUrL + parseFloat(DATA_SSFX[row][col])
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 10:
                    await matchceil2(DATA_SSFX[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 557 - textWidth ;
                    sumPercentUrl = sumPercentUrl + parseFloat(DATA_SSFX[row][col])
                    doc.fontSize(7).text(match2+" %",rightAlignedX, y);
                    break;
            
                default:
                    break;
                
            }
            
        }
    }
//--- SUM SSFX
    y= y+15
    doc.font(Sarabun_Regular).fontSize(8).text("ยอดรวม / Total",25,y+2)
    //-- total Cost 
    textWidth = doc.widthOfString(matchlocal(sumTotalCost)); sumTotalCostAll = sumTotalCostAll+sumTotalCost; sumtotal_ssfx= sumTotalCost ;
    rightAlignedX = 423.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumTotalCost),rightAlignedX,y+2)
    //-- Market value
    textWidth = doc.widthOfString(matchlocal(sumMKV)); sumMKVAll = sumMKVAll+ sumMKV;
    rightAlignedX = 473.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumMKV),rightAlignedX,y+2)
    //-- Unreealized Gain
    textWidth = doc.widthOfString(matchlocal(sumUrL)); sumUrLAll = sumUrLAll+ sumUrL;
    rightAlignedX = 534.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumUrL),rightAlignedX,y+2)
    //-- PERCEN Unreealized Gain   sumPercentUrl
    sumPercentUrl = (sumUrL *100)/ sumTotalCost 
    textWidth = doc.widthOfString(matchlocal(sumPercentUrl));sumPercentUrlAll = sumPercentUrlAll +sumPercentUrl
    rightAlignedX = 558.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumPercentUrl)+'%',rightAlignedX,y+2)

    let lineData = [
    { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
    { x1: 25, y1: y+15, x2: 575, y2: y+15, color: '#000000' }   // Line 3 with blue color
    ];
    for (let line of lineData) {
        doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();
    }
    y= y+15
    // console.log('SSFX '+y)
}

if(DATA_SSF.length  > 0){
    y = y+5
    sumTotalCost= 0,sumMKV=0,sumUrL=0 ,sumPercentUrl = 0
    doc.font(Sarabun_Regular).fontSize(8).text('กองทุนรวมเพื่อการออม / Super Saving Fund : SSF', 25, y);
    doc.font(Sarabun).fontSize(8)
    for (let row = 0; row < DATA_SSF.length; row++) {
        y += rowHeight;
        for (let col = 0; col < DATA_SSF[row].length; col++) {
            //-- chack Y
            if(y >= 630 && DATA_SSF_Y == 1){
                doc.text("*หากพบว่าข้อมูลในรายการนี้ไม่ถูกต้อง หรือมีข้อสงสัยประการใด โปรดติดต่อฝ่ายบริการลูกค้าที่หมายเลข 02 677-6697-8 หรือ email : marketing@wealthrepublic.co.th", 40,y+50)
                doc.text("In case any errors found or having any queries, please contact client service team at 02 677-6697-8 or email : marketing@wealthrepublic.co.th", 40,y+65)
                await pdfNewPage(25,104,55,15)
                startX = 25;
                y = 104+40;
                rowHeight = 15;
                columnWidth = 55; 
                DATA_SSF_Y = DATA_SSF_Y+1;
             }
            switch (col) {
                case 0:
                    doc.fontSize(8).text(DATA_SSF[row][col],25, y);
                    break;
                case 1: //RISK
                    doc.fontSize(7).text(DATA_SSF[row][col],110, y);
                    break;
                case 2: //AMC
                    textWidth =doc.widthOfString(DATA_SSF[row][col]);
                    rightAlignedX = 165 - textWidth ; 
                    doc.fontSize(8).text(DATA_SSF[row][col],rightAlignedX, y);
                    break;
                case 3: //Unit Holding
                    textWidth =doc.widthOfString(DATA_SSF[row][col].toString());
                    rightAlignedX = 250 - textWidth ; 
                    doc.fontSize(7).text(DATA_SSF[row][col],rightAlignedX, y);
                    break;
                case 4: //avg cost
                    
                    await matchceil4(DATA_SSF[row][col],(x)=>{
                        match4=x
                    })
                    textWidth =doc.widthOfString(match4.toString());
                    
                    rightAlignedX = 281 - textWidth ; 
                    doc.fontSize(7).text(match4,rightAlignedX, y);
                    break;
                case 5: //NAV
                    textWidth =doc.widthOfString(DATA_SSF[row][col].toString());
                    rightAlignedX = 315 - textWidth ; 
                    doc.fontSize(7).text(DATA_SSF[row][col],rightAlignedX, y);
                    break;
                case 6: //NAV AS AT
                    doc.fontSize(7).text(DATA_SSF[row][col],324, y);
                    break;
                case 7: //total cost
                    await matchceil2(DATA_SSF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 418 - textWidth ;
                    sumTotalCost = sumTotalCost+ parseFloat(DATA_SSF[row][col]);
                    //  console.log(match2)
                    // positionTotalCost = rightAlignedX;
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 8: //market valu
                    await matchceil2(DATA_SSF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 473 - textWidth ;
                    sumMKV = sumMKV + parseFloat(DATA_SSF[row][col]);
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 9:
                    await matchceil2(DATA_SSF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 534 - textWidth ;
                    sumUrL = sumUrL + parseFloat(DATA_SSF[row][col])
                    doc.fontSize(7).text(match2,rightAlignedX, y);
                    break;
                case 10://= sumTotalCostAll 
                    await matchceil2(DATA_SSF[row][col],(x)=>{
                        match2 = x
                    })
                    textWidth =doc.widthOfString(match2.toString());
                    rightAlignedX = 557 - textWidth ;
                    sumPercentUrl = sumPercentUrl + parseFloat(DATA_SSF[row][col])
                    doc.fontSize(7).text(match2+" %",rightAlignedX, y);
                    break;
            
                default:
                    break;
                
            }
            
        }
    }
//--- SUM SSF
    y= y+15
    doc.font(Sarabun_Regular).fontSize(8).text("ยอดรวม / Total",25,y+2)
    //-- total Cost 
    textWidth = doc.widthOfString(matchlocal(sumTotalCost)); sumTotalCostAll = sumTotalCostAll + sumTotalCost;  sumtotal_ssf = sumTotalCostAll
    rightAlignedX = 423.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumTotalCost),rightAlignedX,y+2)
    //-- Market value
    textWidth = doc.widthOfString(matchlocal(sumMKV)); sumMKVAll = sumMKVAll+ sumMKV;
    rightAlignedX = 473.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumMKV),rightAlignedX,y+2)
    //-- Unreealized Gain
    textWidth = doc.widthOfString(matchlocal(sumUrL)); sumUrLAll = sumUrLAll+ sumUrL;
    rightAlignedX = 534.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumUrL),rightAlignedX,y+2)
    //-- PERCEN Unreealized Gain   sumPercentUrl
    sumPercentUrl = (sumUrL *100)/ sumTotalCost 
    textWidth = doc.widthOfString(matchlocal(sumPercentUrl));sumPercentUrlAll = sumPercentUrlAll +sumPercentUrl
    rightAlignedX = 558.5 - textWidth
    doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumPercentUrl)+'%',rightAlignedX,y+2)

    let lineData = [
    { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
    { x1: 25, y1: y+15, x2: 575, y2: y+15, color: '#000000' }   // Line 3 with blue color
    ];
    for (let line of lineData) {
        doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();
    }
    y= y+15
    // console.log('SSFX '+y)
}

//**** */ SUM TOTAL ALL ***\\\\\
y = y+10; 
doc.rect(25, y, 550, 15).fill('#EBF5FB');

let lineData = [
    { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
    { x1: 25, y1: y+15, x2: 575, y2: y+15, color: '#000000' } ,  // Line 2 with blue color
    { x1: 25, y1: y+17, x2: 575, y2: y+17, color: '#000000' }   // Line 3 with blue color
];
for (let line of lineData) {
    doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();

}
y=y+1  
doc.font(Sarabun_Regular);
doc.fontSize(7.5);
doc.fillColor('#000000');
doc.text("รวมมูลค่าหน่วยลงทุน / Total Outstanding Value",25,y)
textWidth = doc.widthOfString(matchlocal(sumTotalCostAll)) 
rightAlignedX = 420 - textWidth 
doc.text(matchlocal(sumTotalCostAll),rightAlignedX,y)
textWidth = doc.widthOfString(matchlocal(sumMKVAll)) 
rightAlignedX = 473.5 - textWidth 
doc.text(matchlocal(sumMKVAll),rightAlignedX,y)
textWidth = doc.widthOfString(matchlocal(sumUrLAll)) 
rightAlignedX = 534.5 - textWidth 
doc.text(matchlocal(sumUrLAll),rightAlignedX,y)

sumPercentUrlAll = (sumUrLAll *100)/ sumTotalCostAll 
textWidth = doc.widthOfString(matchlocal(sumPercentUrlAll)) 
rightAlignedX = 558 - textWidth 
doc.text(matchlocal(sumPercentUrlAll)+"%",rightAlignedX,y)
//doc.fontSize(7).text("%",562,y)
// SUM TOTAL ALL


//Tranasction

y=y+25
if(y >= 560 ){
    doc.text("*หากพบว่าข้อมูลในรายการนี้ไม่ถูกต้อง หรือมีข้อสงสัยประการใด โปรดติดต่อฝ่ายบริการลูกค้าที่หมายเลข 02 677-6697-8 หรือ email : marketing@wealthrepublic.co.th", 40,y+50)
    doc.text("In case any errors found or having any queries, please contact client service team at 02 677-6697-8 or email : marketing@wealthrepublic.co.th", 40,y+65)
    doc.addPage()
    doc.image('image/WR_DocBackground02.jpg', 0, 0, {width: 600,height:800}) // 1
    startX = 25;
    y = 104+40;
    rowHeight = 15;
    columnWidth = 55;  
 }
 if(DATA_TRANSACTION.length > 0){ 
doc.font(Sarabun_Regular).fontSize(8).text("รายการรอดำเนินการ / Transaction on process",25,y)
y=y+15
doc.rect(25, y, 550, 60).fill('#EBF5FB');
lineData = [
    { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
    { x1: 190, y1: y+20, x2: 575, y2: y+20, color: '#000000' }, // Line 1 with red color
    { x1: 190, y1: y+40, x2: 575, y2: y+40, color: '#000000' }, // Line 1 with red color
    { x1: 25, y1: y+60, x2: 575, y2: y+60, color: '#000000' }   // Line 2 with blue color
];
for (let line of lineData) {
    doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();
}


    doc.font(Sarabun);
    doc.fontSize(8);
    doc.fillColor('#000000');
    doc.save().moveTo(25,y).lineTo(25,y+60).stroke();
    doc.text('รายการ / Transaction',320,y+3 )
    doc.text('วันที่ Date',28,y+20 )
    doc.save().moveTo(62,y).lineTo(62,y+60).stroke();
    doc.text('รหัสกองทุน',67,y +15)
    doc.text('Fund Code',67,y +30)
    doc.save().moveTo(116,y).lineTo(116,y+60).stroke();
    doc.text('บริษัทจัดการ',123,y+10)
    doc.text('AMC',123+4,y +30 )
    doc.save().moveTo(168,y).lineTo(168,y+60).stroke();
    doc.text('TYPE',170,y+20 )
    doc.save().moveTo(190,y).lineTo(190,y+60).stroke();
    doc.text('ซื้อ / Subscription ',210+15 ,y +23)
    doc.save().moveTo(210+104,y+20).lineTo(210+104,y+60).stroke();
    doc.text('ขาย / Redemption ',210+131 ,y +23)
    doc.save().moveTo(220+219,y+20).lineTo(220+219,y+60).stroke();
    doc.text('สับเปลี่ยน / Switching ',210+260 ,y +23)
    doc.save().moveTo(575,y).lineTo(575,y+60).stroke();
    doc.text('จำนวนเงิน (Baht)',202-10,y +43)
    doc.save().moveTo(200+50,y+40).lineTo(200+50,y+60).stroke();
    doc.text('จำนวนหน่วย (Unit)',261-10,y +43) 
    doc.text('จำนวนเงิน (Baht)',327-10,y +43)
    doc.save().moveTo(385-10,y+40).lineTo(385-10,y+60).stroke();
    doc.text('จำนวนหน่วย (Unit)',386-10,y +43) 
    doc.text('จำนวนเงิน (Baht)',442,y +43)
    doc.save().moveTo(500,y+40).lineTo(500,y+60).stroke();
    doc.text('จำนวนหน่วย (Unit)',502,y +43) 


    y=y+45

    doc.rect(25, (y+24) +(DATA_TRANSACTION.length* rowHeight) , 550 ,18 ).fill('#EBF5FB');
    doc.fillColor('#000000');
    let sumBuyBath = 0, sumBuyUnit = 0 ,sumSellBath=0,sumSellUnit =0,sumSwBath=0,sumSwUnit=0
    for (let row = 0; row < DATA_TRANSACTION.length; row++) {
        y += rowHeight;
        let tranTypeCode = "" ,CountFundCode=0
        for (let col = 0; col < DATA_TRANSACTION[row].length; col++) {
            if(y >= 630 && DATA_SSF_Y == 1){
                doc.text("*หากพบว่าข้อมูลในรายการนี้ไม่ถูกต้อง หรือมีข้อสงสัยประการใด โปรดติดต่อฝ่ายบริการลูกค้าที่หมายเลข 02 677-6697-8 หรือ email : marketing@wealthrepublic.co.th", 40,y+50)
                doc.text("In case any errors found or having any queries, please contact client service team at 02 677-6697-8 or email : marketing@wealthrepublic.co.th", 40,y+65)
                await pdfNewPage(25,104,55,15)
                startX = 25;
                y = 104+40;
                rowHeight = 15;
                columnWidth = 55; 
                DATA_SSF_Y = DATA_SSF_Y+1;
             }
            let Amount_Unitx =0 ,Amount_BahtX = 0
             switch (col) {
            case 0: //Tran DATE 
                doc.fontSize(6).text(DATA_TRANSACTION[row][col],28, y+2);
                doc.save().moveTo(25,y).lineTo(25,y+23).stroke();
                break;
            case 1: // Fund code
                doc.save().moveTo(62,y).lineTo(62,y+23).stroke();
                textWidth = doc.widthOfString(DATA_TRANSACTION[row][col]);
                rightAlignedX = 115 + textWidth
                doc.fontSize(5).text(DATA_TRANSACTION[row][col],65, y+2 ,{align:'left'});
                // console.log(rightAlignedX)
                break;
            case 2: // AMC
                textWidth = doc.widthOfString(DATA_TRANSACTION[row][col]);
                rightAlignedX = 161 - textWidth
                doc.fontSize(6).text(DATA_TRANSACTION[row][col],rightAlignedX, y+2);
                doc.save().moveTo(116,y).lineTo(116,y+23).stroke();
                
                // doc.fontSize(8).text(DATA_TRANSACTION[row][col],117, y+2);
                break;
            case 3: // Tran Type
                doc.save().moveTo(168,y).lineTo(168,y+23).stroke();
                let trantype = DATA_TRANSACTION[row][col].trim()
                if(trantype==="SUB"){trantype= "Buy";}
                if(trantype==="RED"){trantype= "Sell";}
                doc.fontSize(6).text(trantype,172, y+2 ,{align:'left'});
                doc.save().moveTo(190,y).lineTo(190,y+23).stroke();
                tranTypeCode = DATA_TRANSACTION[row][col].trim()

                break;
            case 4: //Amount Bath
                await matchceil2(DATA_TRANSACTION[row][col],(x)=>{
                    match2 = x
                })
                // tranTypeCode ="RED"
                if(DATA_TRANSACTION[row][col] === undefined || DATA_TRANSACTION[row][col]==0){Amount_BahtX= '';}else{Amount_BahtX=DATA_TRANSACTION[row][col]}
                if(tranTypeCode === "SUB"){
                    textWidth = doc.widthOfString(matchlocal(Amount_BahtX)); sumBuyBath +=  DATA_TRANSACTION[row][col]; 
                    rightAlignedX = 240 - textWidth 
                    doc.fontSize(7).text(matchlocal(Amount_BahtX),rightAlignedX, y+2);
                    // doc.fontSize(8).text(matchlocal(DATA_TRANSACTION[row][col]),rightAlignedX, y+2);
                }else if(tranTypeCode==="RED"){
                    textWidth = doc.widthOfString(matchlocal(Amount_BahtX)); sumSellBath += DATA_TRANSACTION[row][col];
                    rightAlignedX = 364 - textWidth
                    doc.fontSize(7).text(matchlocal(Amount_BahtX),rightAlignedX, y+2);
                    // doc.fontSize(8).text(match2,320, y+2);
                }else{
                    textWidth = doc.widthOfString(matchlocal(Amount_BahtX)); sumSwBath += DATA_TRANSACTION[row][col];
                    rightAlignedX = 490 - textWidth
                    doc.fontSize(7).text(matchlocal(Amount_BahtX),rightAlignedX, y+2);
                    // doc.fontSize(8).text(match2,450, y+2);
                }
                doc.save().moveTo(250,y).lineTo(250,y+23).stroke();
                doc.save().moveTo(375,y).lineTo(385-10,y+23).stroke();
                doc.save().moveTo(500,y).lineTo(500,y+23).stroke(); 
                break;
            case 5: 
                // tranTypeCode ="RED"
                if(DATA_TRANSACTION[row][col] === undefined || DATA_TRANSACTION[row][col]==0){Amount_Unitx= '';}else{Amount_Unitx=DATA_TRANSACTION[row][col]}

                if(tranTypeCode === "SUB"){
                    textWidth = doc.widthOfString(matchlocal(Amount_Unitx)); sumBuyUnit +=  DATA_TRANSACTION[row][col];  //Amount_Unitx
                    rightAlignedX = 310 - textWidth
                    doc.fontSize(7).text(matchlocal(Amount_Unitx),rightAlignedX, y+2);
                }else if(tranTypeCode==="RED"){
                    textWidth = doc.widthOfString(matchlocal(Amount_Unitx)); sumSellUnit +=  DATA_TRANSACTION[row][col]
                    rightAlignedX = 436 - textWidth
                    doc.fontSize(7).text(matchlocal(Amount_Unitx),rightAlignedX, y+2); //Amount_Unitx
                    // doc.fontSize(8).text(match2,320, y+2);
                }else{
                    textWidth = doc.widthOfString(matchlocal(Amount_Unitx)); sumSwUnit +=  DATA_TRANSACTION[row][col]
                    rightAlignedX = 560 - textWidth
                    doc.fontSize(7).text(matchlocal(Amount_Unitx),rightAlignedX, y+2);
                    // doc.fontSize(8).text(match2,450, y+2);
                }
                doc.save().moveTo(314,y).lineTo(314,y+23).stroke();
                doc.save().moveTo(439,y).lineTo(439,y+23).stroke();
                doc.save().moveTo(575,y).lineTo(575,y+23).stroke();  
                break;
           }  
        }
        
    }
    
    doc.strokeColor('#000000').moveTo(25, y+23).lineTo(575, y+23).lineWidth(0.2).stroke();
    
    //--- SUM TOTAL
    y=y+27 
    ; 
    sumBuyBath  = sumBuyBath== 0? '': sumBuyBath
    sumSellBath = sumSellBath== 0? '': sumSellBath
    sumSwBath   = sumSwBath== 0? '': sumSwBath
    sumBuyUnit  = sumBuyUnit== 0? '': sumBuyUnit
    sumSellUnit = sumSellUnit== 0? '': sumSellUnit
    sumSwUnit   = sumSwUnit== 0? '': sumSwUnit
    
    doc.save().moveTo(25,y-5).lineTo(25,y+15).stroke(); //1
    doc.font(Sarabun_Regular).fontSize(7).text(' รวมรายการรอดำเนินการ / Total transaction on process',25,y)
    doc.save().moveTo(190,y-5).lineTo(190,y+15).stroke(); //2
    textWidth = doc.widthOfString(matchlocal(sumBuyBath)) //1000000000
    rightAlignedX = 195+50 - textWidth
    doc.fontSize(7).text(matchlocal(sumBuyBath),rightAlignedX, y);
    doc.save().moveTo(250,y-5).lineTo(250,y+15).stroke(); //3

    textWidth = doc.widthOfString(matchlocal(sumSellBath)) //
    rightAlignedX = 320+50 - textWidth
    doc.fontSize(7).text(matchlocal(sumSellBath),rightAlignedX, y);
    // doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumSellBath),320,y) //sumSellBath
    // sumSellBath
    doc.save().moveTo(314,y-5).lineTo(314,y+15).stroke(); //4
    textWidth = doc.widthOfString(matchlocal(sumSwBath)) //
    rightAlignedX = 443+50 - textWidth
    doc.fontSize(7).text(matchlocal(sumSwBath),rightAlignedX, y);
    // doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumSwBath),443,y) // sumSwBath
    doc.save().moveTo(439,y-5).lineTo(439,y+15).stroke(); //5
    textWidth = doc.widthOfString(matchlocal(sumBuyUnit)) //
    rightAlignedX = 256+50 - textWidth
    doc.fontSize(7).text(matchlocal(sumBuyUnit),rightAlignedX, y);
    // doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumBuyUnit),256,y) // sumBuyUnit
    doc.save().moveTo(375,y-5).lineTo(375,y+15).stroke(); //6
    textWidth = doc.widthOfString(matchlocal(sumSellUnit)) //
    rightAlignedX = 384+50 - textWidth
    doc.fontSize(7).text(matchlocal(sumSellUnit),rightAlignedX, y);
    // doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumSellUnit),384,y) //sumSellUnit
    doc.save().moveTo(500,y-5).lineTo(500,y+15).stroke(); //7
    textWidth = doc.widthOfString(matchlocal(sumSwUnit)) //
    rightAlignedX = 510+50 - textWidth
    doc.fontSize(7).text(matchlocal(sumSwUnit),rightAlignedX, y);
    // doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumSellUnit),510,y) //sumSellUnit
    doc.save().moveTo(575,y-5).lineTo(575,y+15).stroke(); //8
    
    doc.strokeColor('#000000').moveTo(25, y+15).lineTo(575, y+15).lineWidth(0.2).stroke();
    ///--- SUM TOTAL
}
//Tranasction
// Personal Data 
if(y >= 650 ){
    doc.text("*หากพบว่าข้อมูลในรายการนี้ไม่ถูกต้อง หรือมีข้อสงสัยประการใด โปรดติดต่อฝ่ายบริการลูกค้าที่หมายเลข 02 677-6697-8 หรือ email : marketing@wealthrepublic.co.th", 40,y+50)
    doc.text("In case any errors found or having any queries, please contact client service team at 02 677-6697-8 or email : marketing@wealthrepublic.co.th", 40,y+65)
    doc.addPage()
    doc.image('image/WR_DocBackground02.jpg', 0, 0, {width: 600,height:800}) // 1
    startX = 25;
    y = 104+40;
    rowHeight = 15;
    columnWidth = 55;  
 }
 doc.font(Sarabun).fontSize(7)
 doc.text("หมายเหตุ : กรุณาตรวจสอบข้อมูลส่วนตัวของท่าน หากไม่ถูกต้องโปรดติดต่อเจ้าหน้าที่ฝ่ายการตลาด", 40,y+30) 
 doc.text(`Email Address : ${email}`, 40,y+45) 
 doc.text(`Contact Phone : ${tel}`, 40,y+60)   
 doc.text(`Mobile Phone : XXXXXX${mobile.substring(5,9)}X SWI - สับเปลี่ยนเข้า (Switch In) SWO - สับเปลี่ยนออก (Switch Out)`, 40,y+75)  
 //doc.font(Sarabun).fontSize(7).text('บัญชีเลขที่ Account #XXXXXXXXX'+cardNO.substring(12,9)+'X'  ,25,104) 
 doc.text(`Bank A/C : ${bankAcc.substring(0,6)}XXXX ${bankName}`, 40,y+90)  
 
//----- PIE CHART
doc.addPage()
doc.image('image/WR_DocBackground02.jpg', 0, 0, {width: 600,height:800}) 
// Sample data for the pie chart
let datapie = [
    // { label: 'Label 1', value: 30, color: '#FF6384' },
    // { label: 'Label 2', value: 50, color: '#36A2EB' },
    // { label: 'Label 3', value: 20, color: '#FFCE56' },
  ];
  let total = 0 
// if(DATA_MUTUAL_FUND.length >0){datapie.push({label: 'GMF', value: sumtotal_mutual_fund, color: '#BE0101'})}     
if(DATA_LTF.length >0){datapie.push({label: 'LTF', value: sumtotal_ltf, color: '#059901'})}               
if(DATA_RMF.length >0){datapie.push({label: 'RMF', value: sumtotal_rmf, color: '#FFCE56'})}             
if(DATA_SSFX.length >0){datapie.push({label: 'SSFX', value: sumtotal_ssfx, color: '#FD7924'})}              
if(DATA_SSF.length >0){datapie.push({label: 'SFX', value: sumtotal_ssf, color: '#010899'})}               
if(DATA_EQ.length >0){
    total = 0;
    for (const key in DATA_EQ) {
        
        total = total + DATA_EQ[key][7]
    }
    datapie.push({label: 'EQ', value: total, color: '#B4F51F'})
    // datapie.push({label: 'EQ', value: total, color: '#B4F51F'})
}               
if(DATA_FI.length >0){
    total = 0;
    for (const key in DATA_FI) {
        
        total = total + DATA_FI[key][7]
    }
    datapie.push({label: 'FI', value: total, color: '#F1AD05'})
    // datapie.push({label: 'FI', value: total, color: '#F1AD05'})
}       
if(DATA_FIF_EQ.length >0){
    total = 0;
    for (const key in DATA_FIF_EQ) {
        
        total = total + DATA_FIF_EQ[key][7]
    }
    datapie.push({label: 'FIF-EQ', value: total, color: '#05F1B1 '})
    // datapie.push({label: 'FIF-EQ', value: total, color: '#05F1B1 '})
}       
if(DATA_FIF_FI.length >0){
    total = 0;
    for (const key in DATA_FIF_FI) {
        
        total = total + DATA_FIF_FI[key][7]
    }
    datapie.push({label: 'FIF-FI', value: total, color: '#FF6384'})
    // datapie.push({label: 'FIF-FI', value: total, color: '#FF6384'})
}               
if(DATA_FIF_GOLD.length >0){
    total = 0;
    for (const key in DATA_FIF_GOLD) {
        
        total = total + DATA_FIF_GOLD[key][7]
    }
    datapie.push({label: 'FIF-GOLD', value: total, color: '#36A2EB'})
}               
if(DATA_FIF_MIX.length >0){
    total = 0;
    for (const key in DATA_FIF_MIX) {
        
        total = total + DATA_FIF_MIX[key][7]
    }
    datapie.push({label: 'FIF-MIX', value: total, color: '#BE0101'})}               
if(DATA_FIF_OIL.length >0){
    total = 0;
    for (const key in DATA_FIF_OIL) {
        
        total = total + DATA_FIF_OIL[key][7]
    }
    datapie.push({label: 'FIF-OIL', value: total, color: '#20D0E2'})}               
if(DATA_FIF_PF_REIT.length >0){
    // console.log(DATA_FIF_PF_REIT)
    total = 0;
    for (const key in DATA_FIF_PF_REIT) {
        
        total = total + DATA_FIF_PF_REIT[key][7]
    }
    datapie.push({label: 'FIF-PF_REIT', value: total, color: '#0A46DA'})
    // datapie.push({label: 'FIF-PF_REIT', value: total, color: '#0A46DA'})
}               
if(DATA_MIX.length >0){
    total = 0;
    for (const key in DATA_MIX) {
        
        total = total + DATA_MIX[key][7]
    }
    datapie.push({label: 'MIX', value: total, color: '#9587F1'})
    // datapie.push({label: 'MIX', value: total, color: '#9587F1'})
}               
if(DATA_PF_REIT.length >0){
    total = 0;
    for (const key in DATA_PF_REIT) {
        
        total = total + DATA_PF_REIT[key][7]
    }
    datapie.push({label: 'PF_REIT', value: total, color: '#C65FCE'})}               
if(DATA_MMF.length >0){
    total = 0;
    for (const key in DATA_MMF) {
        
        total = total + DATA_MMF[key][7]
    }
    datapie.push({label: 'MMF', value: total, color: '#E11185'})
    // datapie.push({label: 'MMF', value: total, color: '#E11185'})
}               
if(DATA_FIF_GOLD_OIL.length >0){
    total = 0;
    for (const key in DATA_FIF_GOLD_OIL) {
        
        total = total + DATA_FIF_GOLD_OIL[key][7]
    }
    datapie.push({label: 'FIF_GOLD_OIL', value: total, color: '#BA335A'})}               
if(DATA_Alternative.length >0){
    total = 0;
    for (const key in DATA_Alternative) {
        
        total = total + DATA_Alternative[key][7]
    }
    datapie.push({label: 'Alternative', value: total, color: '#E0B216'})}               


  // Set up pie chart parameters
  const centerX = 290; // X coordinate of the center of the pie chart
  const centerY = 290; // Y coordinate of the center of the pie chart
  const radius = 150; // Radius of the pie chart

  // Draw the pie chart
  doc.fontSize(10).text('Asset Allocation', 40, 420); 
  await drawPieChart(doc, centerX, centerY, radius, datapie);
  y = 450
  let xx = 150 
  let totalx = 0 
  datapie.forEach((item) =>(totalx += item.value))
  datapie.forEach((item) =>{
    if (y > 620 && xx == 150 ){xx= 320; y = 450}
    if (y > 620 && xx == 320 ){xx= 320 + 120 ; y = 450}
    let percentG = (item.value / totalx) * 100;
    // doc.fontSize(15).fillColor(item.color).text(  item.label, 40, y); 
    doc.fontSize(10).fillColor('#000000').text( percentG.toFixed(2) +' % '  , xx, y,);
    y=y+27   
    });
  // Add more content to the PDF if needed
  y = 650 
  doc.font(Sarabun).fontSize(8)
  doc.text("*หากพบว่าข้อมูลในรายการนี้ไม่ถูกต้อง หรือมีข้อสงสัยประการใด โปรดติดต่อฝ่ายบริการลูกค้าที่หมายเลข 02 677-6697-8 หรือ email : marketing@wealthrepublic.co.th", 30,y+50)
  doc.text("In case any errors found or having any queries, please contact client service team at 02 677-6697-8 or email : marketing@wealthrepublic.co.th", 40,y+65)  
 



//----- PIE CHART  fund allowcate
doc.addPage()
doc.image('image/WR_DocBackground02.jpg', 0, 0, {width: 600,height:800}) 

  datapie = [];
//   let total = 0 




  doc.end();

  

  

outputStream.on('finish',()=>{
    //save
    let Datestamp =  year +"/"+month+"/"+date
    let FilePDF     = dir+'\\'+filename+'.pdf'
    // createDataRequestLog(dir,filename+'.pdf',cardNO,Datestamp) 
    //email
    // if(email.trim()===emailSend.trim()){
    //    sendemailreport(cardNO,email.trim(),Datestamp,FilePDF,filename+'.pdf')
        // sendemailreport(cardNO,'info',Datestamp,FilePDF,filename+'.pdf')
    // }else{
      //  sendemailreport(cardNO,email.trim(),Datestamp,FilePDF,filename+'.pdf')
        //    sendemailreport(cardNO,emailSend.trim(),Datestamp,FilePDF,filename+'.pdf')
        // sendemailreport(cardNO,'info',Datestamp,FilePDF,filename+'.pdf')
    // }
    console.log("PDF generation successful.")
    //  UpdateStatusSendReportUnitBalance(cardNO,(x)=>{
    //     console.log(x)
    // })
})
outputStream.on('error',(err)=>{
    console.log('error generating PDF: '+dir+'\\'+filename+'.pdf' + ' time: '+datetimefull,err)
})
async function createDataRequestLog(dir,filename,cardNO,Datestamp){
    try {
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() 
            .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
            .input("Path" ,sql.VarChar ,dir)  
            .input("Filename" ,sql.NVarChar ,filename)  
            .input("Create_Date" ,sql.VarChar(20) ,Datestamp)  
            .query(` INSERT INTO Request_Report_log (Job_Name,Job_Desc,Ref_1,Ref_2,Ref_3,Ref_4,Ref_5,Create_Date,Create_User)
                     Values('Investment Holding Report','Request จาก mobile ให้ ref1 = พารท์ไฟล ref2= ชื่อไฟล์ ref3=สถานะส่งเมล์ ref4=สถานะลบไฟล์ ref5=รหัสบัตร'
                           ,@Path,@Filename,'false','false',@Cust_Code,@Create_Date,'999')`)
        }).then(result => {   
               
            sql.close();   
        });
    } catch (error) {
        console.log("error ",error)
    }
}
async function sendemailreport(cardNO,email,datenow ,dir,filename  ){
    // email  = email==="info"? 'info@wealthrepublic.co.th': email
    let namethai ,nameEng
    await getnameth(cardNO,(nameth,name_Eng)=>{
        namethai = nameth;
        nameEng = name_Eng
    })
    const today                 = new Date()
    let date_ob                 = new Date(today);
    let date                    = ("0"+date_ob.getDate()).slice(-2); 
    let month                   = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
    let year                    = date_ob.getFullYear();
    let date_format             = year +"-"+ month+"-"+ date
    let year_th                 = year+543
    let month_thai 
    await getMonthTh(month,(x)=>{month_thai=x})
    let date_eng
    await getMountEng(month,(x)=>{date_eng=x})              
    
    let br = '<br/>', br2 ='<br/><br/>'
    let textmail = `เรื่อง รายงานยอดเงินคงเหลือ (Investment Holding Report) ${br}
                    เรียน คุณ ${namethai} ${br2}
                    
                    บริษัทหลักทรัพย์นายหน้าซื้อขายหน่วยลงทุน เวลท์ รีพับบลิค จำกัด ขอนำส่งรายงานการลงทุน ณ วันที ${date} ${month_thai} ${year_th} ${br}
                    ท่านสามารถเรียกดูรายงาน โดยคลิกที่ไฟล์แนบ (PDF File) และใส่รหัสผ่าน 8 หลัก (วันเดือนปีเกิดของท่าน) ${br}
                    ในรูปแบบ ddmmyyyy ${br2}
                    
                    dd : วันเกิดของท่าน ตัวเลข 2 หลัก ${br}
                    mm : เดือนเกิดของท่าน ตัวเลข 2 หลัก ${br}
                    yyyy : ปี ค.ศ. เกิดของท่าน 4 หลัก (เช่น ปี 1985) ${br2}
                    
                    ตัวอย่าง : ท่านที่เกิดวันที่ 5 มีนาคม 2528 รหัสของท่านคือ 05031985 ${br}
                    ท่านต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อเจ้าหน้าที่ลูกค้าสัมพันธ์ ${br}
                    โทร. 0-2266 6697-8 E-mail : marketing@wealthrepublic.co.th ${br2}
                    
                    สำหรับนิติบุคคล ${br}
                    ท่านสามารถเรียกดูสำเนาหนังสือรับรองสิทธิอีเล็กทรอนิกส์ ${br}
                    โดยคลิกที่ไฟล์แนบ (PDF File) และใส่รหัสผ่าน 8 หลัก (วันเดือนปีจดทะเบียนของบริษัท) ${br}
                    ในรูปแบบ ddmmyyyy ${br2}
                    
                    dd : วันที่จดทะเบียนของบริษัท ตัวเลข 2 หลัก ${br}
                    mm : เดือนที่จดทะเบียนของบริษัท ตัวเลข 2 หลัก ${br}
                    yyyy : ปี ค.ศ. ที่จดทะเบียนของบริษัท 4 หลัก (เช่น ปี 1985 ) ${br2}
                    
                    ตัวอย่าง : บริษัทจดทะเบียน วันที่ 10 มีนาคม 2528 รหัสของท่านคือ 10031985 ${br2}
                    
                    หากท่านไม่มีโปรแกรม Acrobat Reader เพื่อเปิดรายงานดังกล่าว ท่านสามารถลงโปรแกรม ${br}
                    โดยไม่เสียค่าใช้จ่าย ที่ http://www.adobe.com/products/acrobat/  ${br2}
                    
                    บริษัทฯ หวังว่า ท่านจะได้รับความสะดวกสำหรับบริการนี้ ${br2}
                    
                    ขอแสดงความนับถือ ${br}
                    บริษัทหลักทรัพย์นายหน้าซื้อขายหน่วยลงทุน เวลท์ รีพับบลิค จำกัด ${br}
                    Tel: +66 2266 6697-8  ${br2}${br2}
                    
                    
                    
                    Dear ${nameEng}, ${br2}
                    
                    Your consolidated statement as of  ${date} ${date_eng} ${year} is enclosed.${br}
                    For your security, eStatement attachment will be password protected. ${br}
                    Your password is your date of birth as the following format ddmmyyyy where : ${br2}
                    
                    dd : Two digits of your birth date ${br}
                    mm : Two digits of your birth month ${br}
                    yyyy : Your birth year (A.D.) ${br2}
                    
                    For example, your birthdate is on 5 March 1985, your password would be 05031985 ${br}
                    For more information, please contact us at 0-2266 6697-8 E-mail : marketing@wealthrepublic.co.th ${br2}
                    
                    Your Sincerely, ${br2}
                    <img src="cid:logo" alt="Image"> ${br}
                    Wealth Republic Mutual Fund Brokerage Securities Co.,Ltd ${br2}
                    
                    `
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
        let currentPath = process.cwd();

        let logo = fs.readFileSync(currentPath+'\\image\\WR_Logo.jpg');
        // Message object
        let message = {
            from: 'it@wealthrepublic.co.th',
            to: 'atichat@wealthrepublic.co.th',
            //cc: 'komkrit@wealthrepublic.co.th ,sittichai@wealthrepublic.co.th,janjira@wealthrepublic.co.th', //'komkrit@wealthrepublic.co.th'
            subject: 'Auto mail Reconcile '+ datenow,
            text: `${textmail} `,
            html:  `${textmail}`,
            attachments: [
                {
                  filename: filename,
                  path: dir
                },
                {
                    filename: "WR_Logo.jpg",
                    content: logo ,
                    cid:'logo'
                  }
              ] 
        };
    
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }
    
             updateReportmail(filename,datenow)
            //console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });


}
async function updateReportmail(filename,Datestamp){
    try{
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() 
            .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
            .input("Path" ,sql.VarChar ,dir)  
            .input("Filename" ,sql.NVarChar ,filename)  
            .input("Modify_Date" ,sql.VarChar(20) ,Datestamp)  
            .query(` UPDATE  Request_Report_log  SET ref_3 = 'true' , Modify_Date = @Modify_Date ,   Modify_User = '999'  WHERE (Ref_2 = @Filename)`)
        }).then(result => {   
            
            sql.close();   
        });
    } catch (error) {
        console.log("error ",error)
    }
}
 
function matchlocal (number){
    const options = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      };
    return (number.toLocaleString(undefined, options)) 
}
async function matchceil2 (number,callback ){
    const options = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      };
    // console.log(number.toLocaleString(undefined, options))  
    return callback(number.toLocaleString(undefined, options))  
}
async function matchceil4 (number ,callback){
    const options = {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      };
    return callback(number.toLocaleString(undefined, options))
}
async function dataHoldingReport(cardNO ,callback){
    // cardNO = '3101202718403'
    let DATA_FUND
    try{ 
        
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
            .query(`
            DECLARE @CustID VARCHAR(20) = @Cust_Code;
            DECLARE @DataDate date = getdate();

            exec USP_MFTS_Query_Rpt_Outstanding_Acc_Mobile @DataDate,null,null,null,@Cust_Code,null,null,null,116`);
            //exec USP_MFTS_Query_Rpt_Outstanding_Acc_Mobile '2023-06-08',null,null,null,'3760500954079',null,null,'FIF-EQ,MMF,Alternative,EQ,FI,FIF-FI,FIF-Gold,FIF-GOLD&OIL,FIF-MIX,FIF-OIL,FIF-PF&REIT,MIX,PF&REIT,LTF,SSFX,SSF,RMF',116
        }).then(result => {   
            if ( result.rowsAffected[0] > 0){    
                DATA_FUND = result.recordset
            }   
            //  console.log(result)
            sql.close();   
        });     
    }catch{

    }
       
 
            const optionss = {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
            };
            const optionsx = {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            };
  
// const number = 849999.3292548;
// // let formattedNumber = number.toLocaleString(undefined, optionsx);
// let formattedNumber = Math.floor(number.toFixed(2)) 

// console.log(formattedNumber); // Output: "1,234,567.8912"

    let DATA_JSON =[],DATA_MUTUAL_FUND=[],DATA_RMF=[] ,DATA_SSF=[] ,DATA_SSFX=[],DATA_LTF=[] 
        ,DATA_EQ=[] ,DATA_FI=[] ,DATA_FIF_EQ=[] ,DATA_FIF_FI=[] ,DATA_FIF_GOLD=[] ,DATA_FIF_MIX=[] ,DATA_FIF_OIL=[] ,DATA_FIF_PF_REIT=[] 
        ,DATA_MIX=[] ,DATA_MMF=[] ,DATA_PF_REIT=[] ,DATA_Alternative=[] ,DATA_FIF_GOLD_OIL=[]

    for (const key in DATA_FUND) {
        let DATA_ROW =[]
        // const date = new Date(DATA_FUND[key].close_date); // Replace this with your actual date object
        // const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        // const formattedDate = date.toLocaleDateString('en-US', options);
        let date_ob                 = new Date(DATA_FUND[key].close_date);
        let date                    = ("0"+date_ob.getDate()).slice(-2); 
        let month                   = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year                    = date_ob.getFullYear();
        let close_date                =date +'/'+month +'/'+year
       
// console.log(formattedDate); // Output: dd-mm-yy

        DATA_ROW.push(DATA_FUND[key].fund_code)
        DATA_ROW.push(DATA_FUND[key].RiskLevel)
        DATA_ROW.push(DATA_FUND[key].amc_code)
        DATA_ROW.push(DATA_FUND[key].unitbalance.toLocaleString(undefined, optionss))
        // DATA_ROW.push('1,000,000,000.0000')
        DATA_ROW.push(DATA_FUND[key].avgcost)
        // console.log(DATA_FUND[key].avgcost)
        DATA_ROW.push(DATA_FUND[key].nav_price)
        DATA_ROW.push(close_date)
        DATA_ROW.push(DATA_FUND[key].total_cost)
        // console.log(DATA_FUND[key].total_cost)
        // DATA_ROW.push('1,000,000,000.00') 
        // DATA_ROW.push('-1,000,000,000.00') 
        DATA_ROW.push(DATA_FUND[key].mkvalue)

        DATA_ROW.push(DATA_FUND[key].unrgl)
        DATA_ROW.push(DATA_FUND[key].yield)
        DATA_ROW.push(DATA_FUND[key].fgroup_code)

        // if(DATA_FUND[key].FGroup_Code ==='LTF'){}
        // elseif(DATA_FUND[key].FGroup_Code ==='RMF'){}
        // elseif(DATA_FUND[key].FGroup_Code ==='SSFX'){}
        // else{}
        if (DATA_FUND[key].fgroup_code ==='LTF') {
            DATA_LTF.push(DATA_ROW)
        } else if (DATA_FUND[key].fgroup_code ==='RMF') {
            DATA_RMF.push(DATA_ROW)
        } else if (DATA_FUND[key].fgroup_code ==='SSFX'){
            DATA_SSFX.push(DATA_ROW)
        } else if (DATA_FUND[key].fgroup_code ==='SSF'){
            DATA_SSF.push(DATA_ROW)
        }else {
            DATA_MUTUAL_FUND.push(DATA_ROW)
            // console.log(DATA_FUND[key].fund_id) 
            // console.log(DATA_FUND[key].fgroup_code) 
        }
        if(DATA_FUND[key].fgroup_code ==='EQ')          {DATA_EQ.push(DATA_ROW)  } //	FI	FIF-EQ	FIF-FI	FIF-GOLD	FIF-MIX	FIF-OIL	FIF-PF_REIT	LTF	MIX	MMF	PF_REIT	RMF	SSF	SSFX
        if(DATA_FUND[key].fgroup_code ==='FI')          {DATA_FI.push(DATA_ROW) } 
        if(DATA_FUND[key].fgroup_code ==='FIF-EQ')      {DATA_FIF_EQ.push(DATA_ROW) } 
        if(DATA_FUND[key].fgroup_code ==='FIF-FI')      {DATA_FIF_FI.push(DATA_ROW) }
        if(DATA_FUND[key].fgroup_code ==='FIF-GOLD')    {DATA_FIF_GOLD.push(DATA_ROW) } 
        if(DATA_FUND[key].fgroup_code ==='FIF-MIX')     {DATA_FIF_MIX.push(DATA_ROW) } 
        if(DATA_FUND[key].fgroup_code ==='FIF-OIL')     {DATA_FIF_OIL.push(DATA_ROW) } 
        if(DATA_FUND[key].fgroup_code ==='FIF-PF_REIT') {DATA_FIF_PF_REIT.push(DATA_ROW)} 
        if(DATA_FUND[key].fgroup_code ==='MIX')         {DATA_MIX.push(DATA_ROW) } 
        if(DATA_FUND[key].fgroup_code ==='MMF')         {DATA_MMF.push(DATA_ROW) } 
        if(DATA_FUND[key].fgroup_code ==='PF_REIT')     {DATA_PF_REIT.push(DATA_ROW) } 
        if(DATA_FUND[key].fgroup_code ==='FIF-GOLD_OIL')     {DATA_FIF_GOLD_OIL.push(DATA_ROW) } 
        if(DATA_FUND[key].fgroup_code ==='Alternative')     {DATA_Alternative.push(DATA_ROW) } 

        // console.log(DATA_FUND[key].fund_id) 
        // console.log(DATA_FUND[key].fgroup_code) 
    }
    // console.log(DATA_JSON)
    return callback(DATA_MUTUAL_FUND,DATA_LTF,DATA_RMF,DATA_SSFX,DATA_SSF,DATA_EQ,DATA_FI,DATA_FIF_EQ,DATA_FIF_FI,DATA_FIF_GOLD,DATA_FIF_MIX,DATA_FIF_OIL,DATA_FIF_PF_REIT,DATA_MIX,DATA_MMF,DATA_PF_REIT,DATA_FIF_GOLD_OIL,DATA_Alternative)
}
async function datatransaction(CardNo, callback){
    let DATA_FUND
    try{ 
        //3101202718403
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
            .query(`
            DECLARE @CustID VARCHAR(20) = @Cust_Code;
            exec USP_REPORT_DATA_PENDING_TRANSACTION @Cust_Code`);//3100700638338 3101202718403
            //exec USP_MFTS_Query_Rpt_Outstanding_Acc_Mobile '2023-06-08',null,null,null,'3760500954079',null,null,'FIF-EQ,MMF,Alternative,EQ,FI,FIF-FI,FIF-Gold,FIF-GOLD&OIL,FIF-MIX,FIF-OIL,FIF-PF&REIT,MIX,PF&REIT,LTF,SSFX,SSF,RMF',116
        }).then(result => {   
            if ( result.rowsAffected[0] > 0){    
                DATA_FUND = result.recordset
            }   
            sql.close();   
        });     
    }catch{

    }
    let DATA_JSON =[] 
    for (const key in DATA_FUND) {
        let DATA_ROW =[]
        let date_ob                 = new Date(DATA_FUND[key].Tran_Date);
        let date                    = ("0"+date_ob.getDate()).slice(-2); 
        let month                   = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year                    = date_ob.getFullYear();
        let trandate                =date +'/'+month +'/'+year
        let DESCTRANCODE            = DATA_FUND[key].DESCTRANCODE
        let CODE            
        switch (DESCTRANCODE.trim()) {
            case 'SUB':
                CODE    ="Buy";
                break;
            case 'RED':
                CODE    ="Sell";
                break;
            case 'SWO':
                CODE    ="Switch Out";
                break;
            case 'SWI':
                CODE    ="Switch In";
                break;
            case 'XSI':
                CODE    ="Switch In";
                break;
            case 'XSO':
                CODE    ="Switch Out";
                break;
        }
        DATA_ROW.push(trandate)
        DATA_ROW.push(DATA_FUND[key].Fund_Code)
        DATA_ROW.push(DATA_FUND[key].Amc_Code)
        DATA_ROW.push(DESCTRANCODE)
        // DATA_ROW.push(DATA_FUND[key].TranType_Code)
        DATA_ROW.push(DATA_FUND[key].Amount_Baht)
        DATA_ROW.push(DATA_FUND[key].Amount_Unit)
        
        DATA_JSON.push(DATA_ROW)
    }
    // console.log(DATA_JSON)
    return callback(DATA_JSON)
}
//WR_DocBackground.jpg
async function PdfHeader(x ,y , columnWidth , rowHeight ,callback){
    
    // Table data
    const table = [
        ['รหัสกองทุน','Risk', 'บลจ.', 'จำนวนหน่วย',' ต้นทุนเฉลี่ย', 'NAV', 'NAV ณ วันที', 'มูลค่าต้นทุน', 'มูลค่าตลาด', 'กำไร(ขาดทุน)ที่ยังไม่รับรู้'],
        ['Fund Code' ,'Level' ,'AMC', 'Units Holding', 'Average Cost' ,'NAV', 'NAV as at',' Total Cost' ,'Market Value' ,'Unrealized Gain (Loss)']
    ];

    y = y+4;
    doc.rect(x, y, table[0].length * columnWidth, table.length * rowHeight).fill('#EBF5FB');
    let lineData = [
        { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
        { x1: 25, y1: y+30, x2: 575, y2: y+30, color: '#000000' }   // Line 3 with blue color
    ];
    for (let line of lineData) {
        doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();

    }  
    // Draw table headers
    doc.font(Sarabun);
    doc.fontSize(8);
    doc.fillColor('#000000');
    doc.text(table[0][0], 25, y+2);     // รหัสกองทุน
    doc.text(table[0][1], 80+27, y+2); // Risk
    doc.text(table[0][2], 145, y+2);   // บลจ
    doc.text(table[0][3], 199, y+2);    // จำนวนหน่วย
    doc.text(table[0][4], 248, y+2);    //ต้นทุนเฉลี่ย
    doc.text(table[0][5], 300, y+2);    // NAV
    doc.text(table[0][6], 328, y+2);  // NAV ณ วันที่
    doc.text(table[0][7], 410-25, y+2);   //มูลค่าาต้นทุน
    doc.text(table[0][8], 465-35, y+2);     //มูลค่าตลาด
    doc.text(table[0][9], 520-35, y+2);     // กำไรขาดทุนที่ยังไม่รับรู้


    // Draw table rows
    doc.font(Sarabun);
    doc.fontSize(8);
    y = y+20
    doc.text(table[1][0], 25, y-2);    //Fund Code
    doc.text(table[1][1], 80+27, y-2);  // Levvel
    doc.text(table[1][2], 145, y-2);    // AMC
    doc.text(table[1][3], 199, y-2);    // Units Holding
    doc.text(table[1][4], 248, y-2);    // Average Cost
    doc.text(table[1][5], 300, y-2);    //NAV
    doc.text(table[1][6], 328, y-2);     //NAV as at
    doc.text(table[1][7], 410-25, y-2);     //Total Cost
    doc.text(table[1][8], 465-35, y-2);     //Market Value
    doc.text(table[1][9], 520-35, y-2);     //Unrealized Gain(Loss)
    
    //--- Headerer
 return callback(x,y,columnWidth,rowHeight)
}
async function pdfNewPage(startX,y,columnWidth,rowHeight){

    // footer

    doc.addPage()
    doc.image('image/WR_DocBackground02.jpg', 0, 0, {width: 600,height:800}) // 1

    await PdfHeader(startX,y,columnWidth,rowHeight,(xx,yy,co,row)=>{
        startX=xx;
        y=yy;
        rowHeight=row;
        columnWidth=co;
    })
    return ("xx")
}
async function getnameth (cardNO,callback){
    let namethai = " ลูกค้า " ,nameTh,lastNameTh , name_eng=" Customer ",titleEng ,nameEng,LastNameEng
    try {
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
            .query(`SELECT First_Name_T ,Last_Name_T,Title_Name_E ,First_Name_E , Last_Name_E FROM Account_Info WHERE Cust_Code =@Cust_Code`)
         }).then(result => {
            // console.log(result)   //result.recordset[0].First_Name_T
            if ( result.rowsAffected > 0){    
                nameTh      = result.recordset[0].First_Name_T
                lastNameTh  = result.recordset[0].Last_Name_T
                name_eng     = result.recordset[0].First_Name_E
                LastNameEng  = result.recordset[0].Last_Name_E
                titleEng    = result.recordset[0].Title_Name_E
                namethai    = nameTh + " "+lastNameTh
                nameEng     = titleEng+ " "+ name_eng + " "+LastNameEng
            }   
            sql.close();   
        });     
    } catch (error) {
        
    }

    return callback(namethai,nameEng)
}
async function getDataSentReportUnitBalance(callback){
    let accountId
    let Email
    try {
        await new sql.ConnectionPool(config_NCL).connect().then(pool => {
            return pool.request()  
            .query(`select b.accountId, a.Email from Report_Holding a left join Master_Member b on a.userId = b.userid WHERE not( accountId is null) and Status = 'WAITING' AND CreateDate >= '2023-06-27'`)
         }).then(result => {
            // console.log(result)   //result.recordset[0].First_Name_T
            if ( result.rowsAffected > 0){    
                 accountId      = result.recordset[0].accountId
                 Email           = result.recordset[0].Email
                 
            }   
            sql.close();   
        });     
    } catch (error) {
        
    }
    return callback(accountId,Email)
}
async function UpdateStatusSendReportUnitBalance(cardNO,callback){
    try {
        await new sql.ConnectionPool(config_NCL).connect().then(pool => {
            return pool.request().input("Cust_Code" ,sql.VarChar(20) ,cardNO)   
            .query(`DECLARE @useriD  int
                    DECLARE @TODATE DATE = GETDATE() 
                    select @useriD = a.userId  from Report_Holding a left join Master_Member b on a.userId = b.userid WHERE accountId = @Cust_Code  AND CreateDate >= @TODATE and Status = 'WAITING'
                    UPdate Report_Holding   set Status='SUCCESS' ,ModifyDate =getdate()   WHERE  userId = @useriD `)
         }).then(result => {
            // console.log(result)   //result.recordset[0].First_Name_T
            return callback('Update Status Report Unit Balance  SUCCESS')
            sql.close();   
        });     
    } catch (error) {
        
    }
}
async function  getMonthTh(month,callback){ 
const monthsThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
return callback(monthsThai[month])
}
async function getMountEng(month,callback){ 
const monthsEnglish = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
return callback(monthsEnglish[month])
}

function drawPieChart(doc, centerX, centerY, radius, data) {
    let total = 0;
    data.forEach((item) => (total += item.value));
    // console.log(total)
    let startAngle = -Math.PI / 2;
    let endAngle;
  
    data.forEach((item) => {
        // console.log(item.value)
        endAngle = startAngle + (item.value / total) * Math.PI * 2;

        doc.moveTo(centerX, centerY);
        doc.lineTo(centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius);
        doc.arc(centerX, centerY, radius, startAngle, endAngle);
        doc.lineTo(centerX, centerY);
        doc.fillAndStroke(item.color || '#007BFF', 'black');
    
    // Calculate the position of the text label
    // const labelAngle = startAngle + (endAngle - startAngle) / 2;
    // const labelX = centerX + Math.cos(labelAngle) * (radius / 2);
    // const labelY = centerY + Math.sin(labelAngle) * (radius / 2);

    // doc.fontSize(6).fillColor('black').text(item.label, labelX-50, labelY, {
    //     width: radius * 0.7,
    //     align: 'center',
    // });

        startAngle = endAngle;
    });
    let y = 450
    let x = 70
    let c = 40
    data.forEach((item) => {
        if (y > 630&& x == 70){x= 250; y = 450; c = 220}
        if (y > 630 && x == 250){x= 250 +160; y = 450; c = 220 +160}
        endAngle = startAngle + (item.value / total) * Math.PI * 2;
        // Calculate the position of the text label
        const labelAngle = startAngle + (endAngle - startAngle) / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius / 2);
        const labelY = centerY + Math.sin(labelAngle) * (radius / 2);

        doc.rect(c,y,20,20).fill(item.color)
        doc.fontSize(10).fillColor('black').text(item.label , x,y)   
        // doc.fontSize(10).fillColor('black').text(item.label, labelX-50, labelY, {
        //     width: radius * 0.7,
        //     align: 'center',
        // });

        startAngle = endAngle;
        y = y+27
     });
  }
 

 
  
// async function deleteFDF (file_name ,callback){
//     try {
//         let statement = ``
//     } catch (error) {
        
//     }

// }
// async function DeleteFilePDF(callback){
//     let DATA_FUND
//     try {
//         let statement = `SELECT * FROM Request_Report_log WHERE ref_4='false'`
//         await new sql.ConnectionPool(config).connect().then(pool => {
//             return pool.request() .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
//             .query(statement);
//         }).then(result => {   
//             if ( result.rowsAffected > 0){    
//                 DATA_FUND = result.recordset
//             }   
//             sql.close();   
//         });     
//     } catch (error) {
        
//     }
//     console.log(DATA_FUND)


// }
//   export  {getDataSentReportUnitBalance,UpdateStatusSendReportUnitBalance}
 
 

