//****************[ Created Date 2023 07 04  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/ 
import sql  from 'mssql';
import dotenv from 'dotenv';
import PDFDocument  from'pdfkit';
import nodemailer from 'nodemailer'; 
import fs from 'fs'
import { config,config_NCL } from './dbconfig.js'; 
dotenv.config();

const cardNO = process.argv[2]; 
const edate  = process.argv[3];
const sdate  = process.argv[4];
const Email =  process.argv[5];
// console.log(process.argv[4])

let birthDate = "" ,thName =""  , thFirstName="", thLastName="",title_Name="",email="",bankAcc="",bankName="",mobile="",tel=""
let Addr_No = "" ,address2="" , address=""    ,bulider = "",soi = "",street ="",Tambon="",Amphur="",Province='',Zip_Code=""

let Sarabun                 ='fonts/Sarabun-Light.ttf'
let Sarabun_Italic          ='fonts/Sarabun-Italic.ttf'
let Sarabun_Regular         = 'fonts/Sarabun-Regular.ttf'
let Sarabun_LightItalic     = 'fonts/Sarabun-LightItalic.ttf'
let Sarabun_Bold            = 'fonts/Sarabun-SemiBoldItalic.ttf'

let Report_name = 'Transaction Report'
let DATA_TEX_SAVING
await GetDataTransaction(cardNO,edate,sdate ,(datas)=>{
    DATA_TEX_SAVING = datas
})
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
let timestampx = year +  month  + date
let timefull        = hours.toString() + minutes.toString() + second.toString() + msecond.toString()
//**** E Date */
let eDate               = new Date(edate)
let eDate_date          = ("0"+eDate.getDate()).slice(-2);
let eDate_year_TH          = (eDate.getFullYear())+543;
let eDate_year_Eng          = eDate.getFullYear();
let eDate_mount_TH , eDate_mount_Eng

let sDate               = new Date(sdate)
let sDate_date          = ("0"+sDate.getDate()).slice(-2);
let sDate_year_TH          = (sDate.getFullYear())+543;
let sDate_year_Eng          = sDate.getFullYear();
let sDate_mount_TH , sDate_mount_Eng


const currentDate = new Date();
// console.log(currentDate)
// console.log(eDate)
const optionss = { month: 'long', locale: 'th-TH' };
const thaiMonth = currentDate.toLocaleString('th-TH', optionss);
eDate_mount_TH        = eDate.toLocaleString('th-TH', optionss)
sDate_mount_TH        = sDate.toLocaleString('th-TH', optionss)
// console.log(`Thai Month: ${eDate_mount_TH}`);
// const currentDate = new Date();
const optionsss = { month: 'long', locale: 'en-US' };
const englishMonth = currentDate.toLocaleString('en-US', optionsss);
eDate_mount_Eng = eDate.toLocaleString('en-US', optionsss);
sDate_mount_Eng = sDate.toLocaleString('en-US', optionsss);

var options = { 
    margin: 30,
    size: 'A4'  
    //, userPassword: birthDate
}
var dir = `C:\\WR\\fundcon\\${Report_name}\\`+timestampx; 
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true }); 
    }


const doc = new PDFDocument(options);
// doc.registerFont('fonts/Sarabun-Italic.TTF'); 
let filename = thName + "_" + timestampx + "_" + timefull 
const outputStream = doc.pipe(fs.createWriteStream(dir+'\\'+filename+'.pdf'));


doc.image('image/WR_DocBackground02.jpg', 0, 0, {width: 600,height:800})
doc.font(Sarabun_Regular).fontSize(10).text('ประวัติการทำรายการ'  ,25,54)
doc.font(Sarabun_Regular).fontSize(8).text('Transaction Report - By Date'  ,25,70)

doc.font(Sarabun).fontSize(8).text(`จากวันที่ ${eDate_date} ${eDate_mount_TH} ${eDate_year_TH} ถึงวันที่  ${sDate_date} ${sDate_mount_TH} ${sDate_year_TH}  `  ,25,90)
doc.font(Sarabun).fontSize(8).text(`For period from ${eDate_date} ${eDate_mount_Eng} ${eDate_year_Eng} To ${sDate_date} ${sDate_mount_Eng} ${sDate_year_Eng}  `  ,25,105)
doc.font(Sarabun_Regular).fontSize(10).text(`${title_Name }${thFirstName} ${thLastName} `  ,25,125)

let startX = 25;
let startY = 146;
let rowHeight = 15;
let columnWidth = 55;
let y ;  
 
await PdfHeader(startX,startY,columnWidth,rowHeight,(xx,yy,co,row)=>{
        startX=xx;
        y=yy;
        rowHeight=row;
        columnWidth=co;
})
let  textWidth ,   rightAlignedX ,centerAligned ,match4 ,sumBuy = 0 ,sumSell = 0 ,sumCost=0 ,sumGainLoss = 0 ,sumGainLossPercent = 0.00
if(DATA_TEX_SAVING.length  > 0){
    // y=y+15
    // let  textWidth ,   rightAlignedX ,centerAligned
    for (const key in DATA_TEX_SAVING) {
        if(y >= 630 ){
            // doc.text("*หากพบว่าข้อมูลในรายการนี้ไม่ถูกต้อง หรือมีข้อสงสัยประการใด โปรดติดต่อฝ่ายบริการลูกค้าที่หมายเลข 02 677-6697-8 หรือ email : marketing@wealthrepublic.co.th", 40,y+50)
            // doc.text("In case any errors found or having any queries, please contact client service team at 02 677-6697-8 or email : marketing@wealthrepublic.co.th", 40,y+65)
            await pdfNewPage(25,146,55,15)
            startX = 25;
            y = 166;
            rowHeight = 15;
            columnWidth = 55;  
         }
        y += 20
        let ExecuteDate         = DATA_TEX_SAVING[key].ExecuteDate
        let Fund_Code           = DATA_TEX_SAVING[key].Fund_Code
        let Amc_Code            = DATA_TEX_SAVING[key].Amc_Code
        let TranType_Code       = DATA_TEX_SAVING[key].TranType_Code
        let Nav_Price           = DATA_TEX_SAVING[key].Nav_Price
        let Amount_Unit         = DATA_TEX_SAVING[key].Amount_Unit
        let Amount_Baht         = DATA_TEX_SAVING[key].Amount_Baht
        let Avg_Cost            = DATA_TEX_SAVING[key].Avg_Cost
        let Ref_No              = DATA_TEX_SAVING[key].Ref_No
        let Fund_Id             = DATA_TEX_SAVING[key].Fund_Id
        let rgl                 = DATA_TEX_SAVING[key].rgl
        let tran_Code           ="" ,Cost , last_cost
        const edate = new Date(ExecuteDate);
        const eday = edate.getDate().toString().padStart(2, '0');
        const emonth = (edate.getMonth() + 1).toString().padStart(2, '0');
        const eyear = edate.getFullYear().toString();
        ExecuteDate = `${eday}-${emonth}-${eyear}`;
        let execute_date = `${eyear}-${emonth}-${eday}`;
        // console.log('ExecuteDate  '+ExecuteDate);
        
        switch (TranType_Code) {
            case 'B':
                tran_Code ="Buy"
                break;
            case 'S':
                tran_Code ="Sell"
                break;
            case 'SO':
                tran_Code ="Switch out"
                break;
            case 'SI':
                tran_Code ="Switch in"
                break;
            case 'TI':
                tran_Code ="Tran in"
                break;
            case 'TO':
                tran_Code ="Tran out"
                break;

        
            default:
                break;
        }
        doc.save().moveTo(25,y-10).lineTo(25,y+10).stroke();
        doc.fontSize(7).text(ExecuteDate,28, y);
        doc.save().moveTo(65,y-10).lineTo(65,y+10).stroke();
        doc.fontSize(7).text(Fund_Code,67, y);
        doc.save().moveTo(135,y-10).lineTo(135,y+10).stroke();
        doc.fontSize(7).text(Amc_Code,137, y);
        doc.save().moveTo(185,y-10).lineTo(185,y+10).stroke();
        textWidth = doc.widthOfString(tran_Code);
        centerAligned = 204 - (textWidth/2)
        doc.fontSize(7).text(tran_Code,centerAligned, y);
        doc.save().moveTo(225,y-10).lineTo(225,y+10).stroke(); 
        textWidth = doc.widthOfString(Nav_Price.toString());
        rightAlignedX = 255 - textWidth
        doc.fontSize(7).text(Nav_Price.toString(),rightAlignedX, y);
        doc.save().moveTo(260,y-10).lineTo(260,y+10).stroke();
        await matchceil4(Amount_Unit,(x)=>{
            match4=x
        })
        textWidth = doc.widthOfString(matchlocal(match4));
        rightAlignedX = 310 - textWidth
        doc.fontSize(7).text(matchlocal(match4),rightAlignedX, y);
        doc.save().moveTo(315,y-10).lineTo(315,y+10).stroke();
        // await matchceil4(Amount_Unit,(x)=>{
        //     match4=x
        // })
        doc.save().moveTo(375,y-10).lineTo(375,y+10).stroke();
        doc.save().moveTo(435,y-10).lineTo(435,y+10).stroke();
        doc.save().moveTo(493,y-10).lineTo(493,y+10).stroke();
        doc.save().moveTo(544,y-10).lineTo(544,y+10).stroke();
        doc.save().moveTo(570,y-10).lineTo(570,y+10).stroke();

         

        if(TranType_Code==="B" ||TranType_Code==="SI" ||TranType_Code==="TI"){
            textWidth = doc.widthOfString(matchlocal(Amount_Baht)); // buy amount
            rightAlignedX = 372 - textWidth
            doc.fontSize(7).text(matchlocal(Amount_Baht),rightAlignedX, y);
            sumBuy +=  Amount_Baht;
           
        }
        
        if(TranType_Code==="S" ||TranType_Code==="SO"||TranType_Code==="TO" ){
            
            textWidth = doc.widthOfString(matchlocal(Amount_Baht)); // sell amount
            rightAlignedX = 430 - textWidth
            doc.fontSize(7).text(matchlocal(Amount_Baht),rightAlignedX, y);
            
            //if (last_cost = Avg_Cost
            
            await dataCost(Ref_No,Fund_Id,sdate,(Costx)=>{Cost =Costx})  
            Cost = Amount_Unit * Avg_Cost
            await matchceil4(Cost,(x)=>{
                match4=x
            })
            textWidth = doc.widthOfString(matchlocal(Cost)); // cost
            rightAlignedX = 490 - textWidth
            doc.fontSize(7).text(matchlocal(Cost),rightAlignedX, y);
           
            let gainLost = rgl
            textWidth = doc.widthOfString(matchlocal(gainLost)); //gain (Loss)
            rightAlignedX = 540 - textWidth
            doc.fontSize(7).text(matchlocal(gainLost),rightAlignedX, y);
            
    
            let gainLostPercent = 0.00;   gainLostPercent = (gainLost *100)/ Cost
            // console.log(gainLostPercent)
            textWidth = doc.widthOfString(matchlocal(gainLostPercent)); //%
            rightAlignedX = 565 - textWidth
            doc.fontSize(7).text(matchlocal(gainLostPercent),rightAlignedX, y);
            
            sumSell +=  Amount_Baht;
            sumCost +=  Cost;
            sumGainLoss += gainLost
        }
        
        doc.strokeColor('#000000').moveTo(25, y+10).lineTo(570, y+10).lineWidth(0.1).stroke();    
        
    }
    
    //Total 
    y=y+16
    doc.rect(25, y-5, 545, 15).fill('#EBF5FB');
    doc.strokeColor('#000000').moveTo(25, y+12).lineTo(570, y+12).lineWidth(0.1).stroke();
    doc.save().moveTo(25,y-6).lineTo(25,y+12).stroke();
    doc.save().moveTo(315,y-6).lineTo(315,y+12).stroke();
    doc.save().moveTo(375,y-6).lineTo(375,y+12).stroke();
    doc.save().moveTo(435,y-6).lineTo(435,y+12).stroke();
    doc.save().moveTo(493,y-6).lineTo(493,y+12).stroke();
    doc.save().moveTo(544,y-6).lineTo(544,y+12).stroke();
    doc.save().moveTo(570,y-6).lineTo(570,y+12).stroke();
    // y=y+13
    doc.fontSize(8);
    doc.fillColor('#000000');
    doc.font(Sarabun_Regular).fontSize(8).text("รวม/Total",27,y)
    textWidth = doc.widthOfString(matchlocal(sumBuy)); // buy amount
    rightAlignedX = 376 - textWidth
    doc.fontSize(7).text(matchlocal(sumBuy),rightAlignedX, y);
    textWidth = doc.widthOfString(matchlocal(sumSell)); // sell amount
    rightAlignedX = 430 - textWidth
    doc.fontSize(7).text(matchlocal(sumSell),rightAlignedX, y);
    textWidth = doc.widthOfString(matchlocal(sumCost)); // cost
    rightAlignedX = 490 - textWidth
    doc.fontSize(7).text(matchlocal(sumCost),rightAlignedX, y);
    textWidth = doc.widthOfString(matchlocal(sumGainLoss)); //gain (Loss)
    rightAlignedX = 540 - textWidth
    doc.fontSize(7).text(matchlocal(sumGainLoss),rightAlignedX, y);
    sumGainLossPercent = ( sumGainLoss * 100  ) / sumCost
    textWidth = doc.widthOfString(matchlocal(sumGainLossPercent)); //%
    rightAlignedX = 565 - textWidth
    doc.fontSize(7).text(matchlocal(sumGainLossPercent),rightAlignedX, y);

}

doc.end();

outputStream.on('finish',()=>{
    //save
    let Datestamp =  year +"/"+month+"/"+date
    let FilePDF     = dir+'\\'+filename+'.pdf'
    createDataRequestLog(dir,filename+'.pdf',cardNO,Datestamp) 
    //email
    // if(email.trim()===emailSend.trim()){
        sendemailreport(cardNO,Email.trim(),Datestamp,FilePDF,filename+'.pdf')
        // sendemailreport(cardNO,'info',Datestamp,FilePDF,filename+'.pdf')
    // }else{
      //  sendemailreport(cardNO,email.trim(),Datestamp,FilePDF,filename+'.pdf')
        //    sendemailreport(cardNO,emailSend.trim(),Datestamp,FilePDF,filename+'.pdf')
        // sendemailreport(cardNO,'info',Datestamp,FilePDF,filename+'.pdf')
    // }
    console.log("PDF generation successful.")
    //  UpdateStatusSendReportTransaction(cardNO,(x)=>{
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
async function UpdateStatusSendReportTransaction(cardNO,callback){
    try {
        await new sql.ConnectionPool(config_NCL).connect().then(pool => {
            return pool.request().input("Cust_Code" ,sql.VarChar(20) ,cardNO)   
            .query(`DECLARE @useriD  int
                    DECLARE @TODATE DATE = GETDATE() 
                    select @useriD = a.userId  from Report_TaxSaving a left join Master_Member b on a.userId = b.userid WHERE accountId = @Cust_Code  AND CreateDate >= @TODATE and Status = 'WAITING'
                    UPdate Report_Transaction   set Status='SUCCESS' ,ModifyDate =getdate()   WHERE  userId = @useriD `)
         }).then(result => {
            // console.log(result)   //result.recordset[0].First_Name_T
            return callback('Update Status Report Unit Balance  SUCCESS')
            sql.close();   
        });     
    } catch (error) {
        
    }
}
// async function updateReportmail(filename,Datestamp){
//     try{
//         await new sql.ConnectionPool(config).connect().then(pool => {
//             return pool.request() 
//             .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
//             .input("Path" ,sql.VarChar ,dir)  
//             .input("Filename" ,sql.NVarChar ,filename)  
//             .input("Modify_Date" ,sql.VarChar(20) ,Datestamp)  
//             .query(` UPDATE  Request_Report_log  SET ref_3 = 'true' , Modify_Date = @Modify_Date ,   Modify_User = '999'  WHERE (Ref_2 = @Filename)`)
//         }).then(result => {   
            
//             sql.close();   
//         });
//     } catch (error) {
//         console.log("error ",error)
//     }
// }
async function PdfHeader(x ,y , columnWidth , rowHeight ,callback){
    
    // Table data
    const table = [
        ['วันที่','กองทุน', 'บริษัทจัดการ', 'รายการ',' ราคา', 'จำนวนหน่วย', 'จำนวนเงินซื้อ', 'จำนวนเงินขาย', 'ต้นทุน', 'กำไรขาดทุน','%'],
        ['Date' ,'Fund' ,'AMC', 'Tran Type', 'Price' ,'Units', 'Buy Amount',' Sell Amount' ,'Cost' ,'Gain (Loss)']
    ];

    // y = y+4;
    doc.rect(x, y, 545, table.length * rowHeight).fill('#EBF5FB');
    let lineData = [
        { x1: 25, y1: y, x2: 570, y2: y, color: '#000000' }, // Line 1 with red color
        { x1: 25, y1: y+30, x2: 570, y2: y+30, color: '#000000' }   // Line 3 with blue color
    ];
    for (let line of lineData) {
        doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();

    }  
    // Draw table headers
    doc.font(Sarabun);
    doc.fontSize(8);
    doc.fillColor('#000000');
    doc.save().moveTo(25,y).lineTo(25,y+30).stroke();
    doc.text(table[0][0], 35, y+2);     // วันที่
    doc.save().moveTo(65,y).lineTo(65,y+30).stroke();
    doc.text(table[0][1], 85, y+2); // กองทุน
    doc.save().moveTo(135,y).lineTo(135,y+30).stroke();
    doc.text(table[0][2], 139, y+2);   // บริษัทจัดการ
    doc.save().moveTo(185,y).lineTo(185,y+30).stroke();
    doc.text(table[0][3], 190, y+2);    // รายการ
    doc.save().moveTo(225,y).lineTo(225,y+30).stroke();
    doc.text(table[0][4], 235, y+2);    //ราคา
    doc.save().moveTo(260,y).lineTo(260,y+30).stroke();
    doc.text(table[0][5], 270, y+2);    // จำนวนหน่วย
    doc.save().moveTo(315,y).lineTo(315,y+30).stroke();
    doc.text(table[0][6], 322, y+2);  // จำนวนเงินซื้อ่
    doc.save().moveTo(375,y).lineTo(375,y+30).stroke();
    doc.text(table[0][7], 383, y+2);   //จำนวนเงินขาย
    doc.save().moveTo(435,y).lineTo(435,y+30).stroke();
    doc.text(table[0][8], 455, y+2);     //ต้นทุน
    doc.save().moveTo(493,y).lineTo(493,y+30).stroke();
    doc.text(table[0][9], 503, y+2);     // กำไรขาดทุน
    doc.save().moveTo(544,y).lineTo(544,y+30).stroke();
    doc.text(table[0][10], 555, y+12);     // %
    doc.save().moveTo(570,y).lineTo(570,y+30).stroke();

    y = y+20
    
    doc.text(table[1][0], 35, y-2);    //Date
    doc.text(table[1][1], 85, y-2);  // Fund
    doc.text(table[1][2], 147, y-2);    // AMC
    doc.text(table[1][3], 187, y-2);    // Tran Type
    doc.text(table[1][4], 235, y-2);    // Price
    doc.text(table[1][5], 275, y-2);    //Units
    doc.text(table[1][6], 322, y-2);     //Buy Amount
    doc.text(table[1][7], 383, y-2);     //Sell Amount
    doc.text(table[1][8], 455, y-2);     //Cost
    doc.text(table[1][9], 503, y-2);     //Gain (Loss)

    
    //--- Headerer
 return callback(x,y,columnWidth,rowHeight)
}

async function GetDataTransaction(cardNO,edate,sdate ,callback){
    let DATA_FUND
    try{ 
        //3101202718403
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
            .query(`
                    DECLARE @E_TODATE DATE = '${edate}' 
                    DECLARE @S_TODATE DATE = '${sdate}'
                    DECLARE @t table (
                        trantype_name varchar(30)
                        , tran_id bigint
                        ,tran_no varchar(30)
                        ,trantype_code varchar(3)
                        ,tran_date datetime
                        ,account_no varchar(30)
                        ,ref_no varchar(30)
                        ,holder_id varchar(30)
                        ,holder_name varchar(255)
                        ,fund_id int
                        ,amount_baht decimal(18,2)
                        ,amount_unit decimal(18,4)
                        ,nav_price decimal(18,4)
                        ,executedate datetime
                        ,avg_cost decimal(18,4)
                        ,rgl decimal(20,6)
                        ,status_id int
                        ,file_path varchar(1000)
                        ,inputsys varchar(30)
                        ,team_name varchar(100)
                        ,mkt_name varchar(255)
                        ,fund_code varchar(30)
                        ,fgroup_code varchar(30)
                        ,amc_id int
                        ,amc_code varchar(130)
                        ,ref_name varchar(130)
                        ,status_display varchar(130)
                        ,primary key (tran_id)
                        )
             
            INSERT INTO @t 
            exec USP_MFTS_Query_Rpt_Transaction  null,@E_TODATE,@S_TODATE,null,null,null,@Cust_Code,null,null,null,null,'7',116

            select ExecuteDate ,Fund_Code , Amc_Code, TranType_Code ,Nav_Price ,Amount_Unit , Amount_Baht ,Avg_Cost ,Ref_No,Fund_Id ,rgl  from @t  `);
             }).then(result => {   
            if ( result.rowsAffected[0] > 0){    
                DATA_FUND = result.recordset
                console.log(DATA_FUND)
            }   
            sql.close();   
        });     
    }catch{

    }
    return callback(DATA_FUND)
}
function matchlocal (number){
    const options = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      };
    return (number.toLocaleString(undefined, options)) 
}
async function matchceil4 (number ,callback){
    const options = {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      };
    return callback(number.toLocaleString(undefined, options))
}
async function dataCost(Ref_No,Fund_Id,edate,callback ){
    let Avg_Cost = 0.00
 
    try{ 
        //3101202718403
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() //.input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
            .query(`SELECT dbo.UFN_MFTS_AVGCOST_New2 ('${Ref_No}',${Fund_Id},'${edate}') as avg_cost `);
             }).then(result => {   
            if ( result.rowsAffected  > 0){    
                Avg_Cost = result.recordset[0].avg_cost

            }   
            // console.log(result)
            sql.close();   
        });     
    }catch{

    }
    return callback(Avg_Cost)
}
async function sendemailreport(cardNO,email,datenow ,dir,filename  ){
    // email  = email==="info"? 'info@wealthrepublic.co.th': email
    let namethai ,nameEng
    await getnameth(cardNO,(nameth,name_Eng)=>{
        namethai = nameth;
        nameEng = name_Eng
    })
    if(namethai === undefined){
        console.log("name not found")
        return "not sent - Name Not Found"
    }
    let br = '<br/>', br2 ='<br/><br/>'
    let textmail = `เรื่อง ประวัติการทำรายการ (Transaction Report Report) ${br}
                    เรียน คุณ ${namethai} ${br2}
                    
                    บริษัทหลักทรัพย์นายหน้าซื้อขายหน่วยลงทุน เวลท์ รีพับบลิค จำกัด ขอนำส่งรายงานการลงทุน ณ วันที 23 มิถุนายน 2566 ${br}
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
                    
                    Your consolidated statement as of 23 June 2023 is enclosed.${br}
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
            subject: 'Transaction Report - By Date ',
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

/* Select a.ExecuteDate ,b.Fund_Code   , c.Amc_Code  ,a.TranType_Code   ,a.Nav_Price,a.Amount_Unit,a.Amount_Baht ,a.Avg_Cost ,a.Ref_No,a.Fund_Id 
                    from MFTS_Transaction  a  With (Nolock)  
                    left join MFTS_Fund b on a.Fund_ID = b.Fund_ID  
                    left join MFTS_AMC c on b.AMC_ID = c.AMC_ID  
                    left join MFTS_FundGroup f on b.FGroup_Code = f.Groupcode  
                    where convert(char(10),a.Act_ExecDate,121)  >= @E_TODATE   
                    and convert(char(10),a.Act_ExecDate,121)  <= @S_TODATE     
                    and status_id in ('7' )  
                    and a.Ref_No in (Select Ref_No  from MFTS_Account  where Account_No = @Cust_Code   )  
                    group by  b.Fund_Code, c.AMC_Code   ,a.ExecuteDate ,a.Tran_Date   ,a.TranType_Code   ,a.Nav_Price,a.Amount_Unit,a.Amount_Baht  ,a.Avg_Cost,a.Ref_No,a.Fund_Id 
                    order by  a.Tran_Date asc ,b.Fund_Code  */