import sql  from 'mssql';
import dotenv from 'dotenv';
import PDFDocument  from'pdfkit';
// import PDFtable from'pdfkit-table';

// import axios from 'axios';
import fs from 'fs'
import { config } from './dbconfig.js';
dotenv.config();

const cardNO = process.argv[2];
const email = process.argv[3] ;

console.log(myVariable ,myVariable2)

await genPdfTransactionReport('3760500954079',(birthDay)=>{
    //console.log(birthDay)
});
async function genPdfTransactionReport ( cardNO   ,callback){

    cardNO = "3760500954079";  //1100702637421
    let birthDate = "" ,thName ="" ,timefull="", thFirstName="", thLastName="",title_Name=""
    let Addr_No = "" ,address2="" , address=""    ,bulider = "",soi = "",street ="",Tambon="",Amphur="",Province='',Zip_Code=""
    let filename 
    let DATA_MAIN ,DATA_MUTUAL_FUND,DATA_LTF,DATA_RMF,DATA_SSFX,DATA_SSF
    await dataHoldingReport(cardNO,(DATA_MUTUAL_FUNDX,DATA_LTFX,DATA_RMFX,DATA_SSFXX,DATA_SSFXD)=>{
        DATA_MUTUAL_FUND    = DATA_MUTUAL_FUNDX
        DATA_LTF            = DATA_LTFX
        DATA_RMF            = DATA_RMFX
        DATA_SSFX           = DATA_SSFXX
        DATA_SSF            = DATA_SSFXD

    })
    try{ await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  .query(`
            SELECT a.Birth_Day,a.Title_Name_T,a.First_Name_T,a.Last_Name_T  ,b.Addr_No as Addr_No,  Place2 as bulider, Road as soi, Road2 as street  ,(SELECT Name_Thai FROM REF_Tambons WHERE Tambon_ID = b.Tambon_Id ) as Tambon
                    ,(SELECT Name_Thai FROM REF_Amphurs WHERE Amphur_ID=b.Amphur_Id) as Amphur ,(SELECT Name_Thai FROM REF_Provinces WHERE Province_ID = b.Province_Id ) as Province , Zip_Code
            FROM Account_Info a left join dbo.Account_Address b On a.Cust_Code =b.Cust_Code
            WHERE a.Cust_Code = @Cust_Code AND b.Addr_Seq = 2`);
        }).then(result => {   
            if ( result.rowsAffected > 0){    
                birthDate           =  result.recordset[0].Birth_Day
                title_Name          = result.recordset[0].Title_Name_T
                thFirstName         =  result.recordset[0].First_Name_T.trim() // parser.parseFromString(datarows[key].First_Name_T ,'text/html') //datarows[key].First_Name_T// Buffer.from(datarows[key].First_Name_T, 'utf-8').toString(); //datarows[key].First_Name_T.trim().toString('utf-8')
                thLastName          = result.recordset[0].Last_Name_T.trim()
                thName              = title_Name+" "+thFirstName + "_" +thLastName
                Addr_No             = result.recordset[0].Addr_No
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

        var options = { 
            margin: 30,
            size: 'A4' //, userPassword: '123456'//birthDate
        }
        var dir = 'C:\\WR\\fundcon\\'+timestampx; 
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true }); 
            }
        

        const doc = new PDFDocument(options);
        // doc.registerFont('fonts/Sarabun-Italic.TTF'); 
        filename = thName + "_" + timestampx + "_" + timefull 
        doc.pipe(fs.createWriteStream(dir+'\\'+filename+'.pdf'));
        doc.image('image/WR_Original_backgroundImage.jpg', 0, 0, {width: 600,height:800}) // 1
         

       doc.font(Sarabun).fontSize(7).text('บัญชีเลขที่ Account #XXXXXXXXX'+cardNO.substring(12,9)+'X'  ,25,104)
       doc.fontSize(10).text(thName ,25,115+3)
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
    let y = startY+4;  
        // -- HEADDER 
        //  exampleFunction(); 
        // doc.text('This is the second line.',startX,y);
    // await PdfHeader(startX,startY,rowHeight,columnWidth,(xx,yy,row,co)=>{
    //         startX=xx;
    //         y=yy;
    //         rowHeight=row;
    //         columnWidth=co;
    //         console.log(startX)
    //         console.log(y)
    //         console.log(rowHeight)
    //         console.log(columnWidth)
    // })
    // console.log("yyy")
   // Table data
    const table = [
        ['รหัสกองทุน','Risk', 'บลจ.', 'จำนวนหน่วย',' ต้นทุนเฉลี่ย', 'NAV', 'NAV ณ วันที', 'มูลค่าต้นทุน', 'มูลค่าตลาด', 'กำไร(ขาดทุน)ที่ยังไม่รับรู้'],
        ['Fund Code' ,'Level' ,'AMC', 'Units Holding', 'Average Cost' ,'NAV', 'NAV as at',' Total Cost' ,'Market Value' ,'Unrealized Gain (Loss)']
    ];
  
    const backgroundColor = '#EBF5FB'; // Replace with desired color
    // let y = startY+4; 
    doc.rect(startX, y, table[0].length * columnWidth, table.length * rowHeight).fill(backgroundColor);
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
     
    y = y+13
    //--- Headerer
    let  textWidth ,sumTotalCost = 0,sumMKV= 0,sumUrL= 0,sumPercentURL= 0
    let  rightAlignedX ,positionTotalCost , positionMKV,positionURL,positionPercentURL
    let match4,   match2
    if (DATA_MUTUAL_FUND){
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
                        rightAlignedX = 555 - textWidth ;
                        doc.fontSize(7).text(match2+" %",rightAlignedX, y);
                        break;
                
                    default:
                        break;
                    
                }
                //-- chack Y
                if(y >= 750){
                   // console.log(' >>> '+y)
                }else{
                   // console.log(' <<< '+y)
                }
            }
        }
      //--- SUM MUTUAL_FUND
        y= y+15
        doc.font(Sarabun_Regular).fontSize(8).text("ยอดรวม / Total",25,y)
        //-- total Cost 
        textWidth = doc.widthOfString(matchlocal(sumTotalCost));
        rightAlignedX = 423.5 - textWidth
        doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumTotalCost),rightAlignedX,y)
        //-- Market value
        textWidth = doc.widthOfString(matchlocal(sumMKV));
        rightAlignedX = 473.5 - textWidth
        doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumMKV),rightAlignedX,y)
        //-- Unreealized Gain
        textWidth = doc.widthOfString(matchlocal(sumUrL));
        rightAlignedX = 534.5 - textWidth
        doc.font(Sarabun_Regular).fontSize(7).text(matchlocal(sumUrL),rightAlignedX,y)

        lineData = [
        { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
         { x1: 25, y1: y+15, x2: 575, y2: y+15, color: '#000000' }   // Line 3 with blue color
      ];
      for (let line of lineData) {
        doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();
      }
      y= y+15  
      //-- SUM  MUTUAL_FUND
    } //-- MUTUAL_FUND
     console.log(y)

    if(DATA_LTF){
        //console.log(DATA_LTF)
    }
    //

  
      doc.end();
   
    
    return callback(filename)
}
// Function to calculate the maximum width for each column
// async function calculateColumnWidths() {
//     const columnWidths = [];
  
//     for (let col = 0; col < table[0].length; col++) {
//       let maxContentWidth = table.reduce((maxWidth, row) => {
//         const contentWidth = doc.widthOfString(row[col]);
//         return Math.max(maxWidth, contentWidth);
//       }, 0);
//       columnWidths.push(maxContentWidth);
//     }
  
//     return columnWidths;
//   }
  
//   // Function to draw the table
//  async function drawTable() {
//     const columnWidths = calculateColumnWidths();
//     let x = startX;
//     let y = startY;
  
//     // Draw table headers
//     doc.font('Helvetica-Bold');
//     doc.fontSize(12);
//     for (let i = 0; i < table[0].length; i++) {
//       doc.text(table[0][i], x, y);
//       x += columnWidths[i];
//     }
// }
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
    let DATA_FUND
    try{ 
        
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() .input("Cust_Code" ,sql.VarChar(20) ,cardNO)  
            .query(`
            DECLARE @CustID VARCHAR(20) = @Cust_Code;
            DECLARE @DataDate date;

            SELECT TOP 1  @DataDate = DataDate
            FROM [IT_CustPortValueEndDay]
            WHERE CustID= @CustID AND Status ='A'
            ORDER BY DataDate DESC;
            --ORDER BY MarketPriceDate DESC;
            

            exec USP_MFTS_Query_Rpt_Outstanding_Acc_Mobile @DataDate,null,null,null,@Cust_Code,null,null,'FIF-EQ,MMF,Alternative,EQ,FI,FIF-FI,FIF-Gold,FIF-GOLD&OIL,FIF-MIX,FIF-OIL,FIF-PF&REIT,MIX,PF&REIT,LTF,SSFX,SSF,RMF',116`);
            //exec USP_MFTS_Query_Rpt_Outstanding_Acc_Mobile '2023-06-08',null,null,null,'3760500954079',null,null,'FIF-EQ,MMF,Alternative,EQ,FI,FIF-FI,FIF-Gold,FIF-GOLD&OIL,FIF-MIX,FIF-OIL,FIF-PF&REIT,MIX,PF&REIT,LTF,SSFX,SSF,RMF',116
        }).then(result => {   
            if ( result.rowsAffected[0] > 0){    
                DATA_FUND = result.recordset
            }   
            sql.close();   
        });     
    }catch{

    }
    //  console.log(DATA_FUND)
 
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

    let DATA_JSON =[],DATA_MUTUAL_FUND=[],DATA_LTF=[],DATA_RMF=[],DATA_SSFX=[],DATA_SSF=[]
    for (const key in DATA_FUND) {
        let DATA_ROW =[]
        const date = new Date(DATA_FUND[key].close_date); // Replace this with your actual date object
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
       
// console.log(formattedDate); // Output: dd-mm-yy

        DATA_ROW.push(DATA_FUND[key].fund_code)
        DATA_ROW.push(DATA_FUND[key].RiskLevel)
        DATA_ROW.push(DATA_FUND[key].amc_code)
        DATA_ROW.push(DATA_FUND[key].unitbalance.toLocaleString(undefined, optionss))
        // DATA_ROW.push('1,000,000,000.0000')
        DATA_ROW.push(DATA_FUND[key].avgcost)
        // console.log(DATA_FUND[key].avgcost)
        DATA_ROW.push(DATA_FUND[key].nav_price)
        DATA_ROW.push(formattedDate)
        DATA_ROW.push(DATA_FUND[key].total_cost)
        // console.log(DATA_FUND[key].total_cost)
        // DATA_ROW.push('1,000,000,000.00') 
        // DATA_ROW.push('-1,000,000,000.00') 
        DATA_ROW.push(DATA_FUND[key].mkvalue)

        DATA_ROW.push(DATA_FUND[key].unrgl)
        DATA_ROW.push(DATA_FUND[key].yield)
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
        }
       
    }
    // console.log(DATA_JSON)
    return callback(DATA_MUTUAL_FUND,DATA_LTF,DATA_RMF,DATA_SSFX,DATA_SSF)
}
//WR_DocBackground.jpg
async function PdfHeader(x ,y , columnWidth , rowHeight ,callback){
    
    // Table data
    const table = [
        ['รหัสกองทุน','Risk', 'บลจ.', 'จำนวนหน่วย',' ต้นทุนเฉลี่ย', 'NAV', 'NAV ณ วันที', 'มูลค่าต้นทุน', 'มูลค่าตลาด', 'กำไร(ขาดทุน)ที่ยังไม่รับรู้'],
        ['Fund Code' ,'Level' ,'AMC', 'Units Holding', 'Average Cost' ,'NAV', 'NAV as at',' Total Cost' ,'Market Value' ,'Unrealized Gain (Loss)']
    ];
    // const doc = new PDFDocument()
    const backgroundColor = '#EBF5FB'; // Replace with desired color
     y = y+4; 
    doc.rect(x, y, table[0].length * columnWidth, table.length * rowHeight).fill(backgroundColor);
    let lineData = [
        { x1: 25, y1: y, x2: 575, y2: y, color: '#000000' }, // Line 1 with red color
        { x1: 25, y1: y+30, x2: 575, y2: y+30, color: '#000000' }   // Line 3 with blue color
    ];
    for (let line of lineData) {
        doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();
    }  
    // Draw table headers
    // doc.font(Sarabun);
    // doc.fontSize(8);
    // doc.fillColor('#000000');
    // doc.text(table[0][0], 25, y+2);     // รหัสกองทุน
    // doc.text(table[0][1], 80+27, y+2); // Risk
    // doc.text(table[0][2], 145, y+2);   // บลจ
    // doc.text(table[0][3], 199, y+2);    // จำนวนหน่วย
    // doc.text(table[0][4], 248, y+2);    //ต้นทุนเฉลี่ย
    // doc.text(table[0][5], 300, y+2);    // NAV
    // doc.text(table[0][6], 328, y+2);  // NAV ณ วันที่
    // doc.text(table[0][7], 410-25, y+2);   //มูลค่าาต้นทุน
    // doc.text(table[0][8], 465-35, y+2);     //มูลค่าตลาด
    // doc.text(table[0][9], 520-35, y+2);     // กำไรขาดทุนที่ยังไม่รับรู้


    // // Draw table rows
    // doc.font(Sarabun);
    // doc.fontSize(8);
    // y = y+20
    // doc.text(table[1][0], 25, y-2);    //Fund Code
    // doc.text(table[1][1], 80+27, y-2);  // Levvel
    // doc.text(table[1][2], 145, y-2);    // AMC
    // doc.text(table[1][3], 199, y-2);    // Units Holding
    // doc.text(table[1][4], 248, y-2);    // Average Cost
    // doc.text(table[1][5], 300, y-2);    //NAV
    // doc.text(table[1][6], 328, y-2);     //NAV as at
    // doc.text(table[1][7], 410-25, y-2);     //Total Cost
    // doc.text(table[1][8], 465-35, y-2);     //Market Value
    // doc.text(table[1][9], 520-35, y-2);     //Unrealized Gain(Loss)
    
    y = y+13
    //--- Headerer
 return callback(x,y,columnWidth,rowHeight)
}

// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// const doc = new PDFDocument();

// doc.text('This is the first line.');

// // เรียกใช้ฟังก์ชั่นที่แยกออกมา
// exampleFunction();

// doc.text('This is the third line.');

// doc.pipe(fs.createWriteStream('output.pdf'));
// doc.end();

// ฟังก์ชั่นที่แยกออกมา
  function exampleFunction() {
    doc.text('This is the second line.',25,400)
}
 
