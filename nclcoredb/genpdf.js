import express from 'express';
import sql  from 'mssql';
import dotenv from 'dotenv';
import fs from 'fs'
import bodyParser from 'body-parser';
import { config } from './dbconfig.js';
import poolPromise from './db.js';
import PDFDocument  from'pdfkit';
import pdfmake from 'addthaifont-pdfmake';
import doc from 'pdfkit';
// import { cardNumber } from '../fundconn/dataTest.js';
const app = express();
app.use(bodyParser.json());
dotenv.config();

async function genpdf(datarows ,callback){ 
    // console.log(datarows)
    let filename 
    for (const key in datarows) {
        try{
        let Company                                         = datarows[key].Company
        let cardNumber                                      = datarows[key].Cust_Code
        let TypeId                                          = datarows[key].TypeId
        let cardExpiryDate                                  = datarows[key].cardExpiryDate
        let title                                           = datarows[key].Title_Name_T.trim()
        let enFirstName                                     = datarows[key].First_Name_E.trim()
        let enLastName                                      = datarows[key].Last_Name_E.trim()
        let thFirstName                                     =  datarows[key].First_Name_T.trim() // parser.parseFromString(datarows[key].First_Name_T ,'text/html') //datarows[key].First_Name_T// Buffer.from(datarows[key].First_Name_T, 'utf-8').toString(); //datarows[key].First_Name_T.trim().toString('utf-8')
        let thLastName                                      = datarows[key].Last_Name_T.trim()
        let thName                                          = thFirstName + "  " +thLastName
        let enName                                          = enFirstName + "  " +enLastName
        let birthDate                                       = datarows[key].Birth_Day
        let nationality                                     = datarows[key].Nation_Code
        
        let Modify_Date                                     = datarows[key].Modify_Date
        let createdate                                      = datarows[key].Create_Date
        let email                                           = datarows[key].Email.trim()
        let Mobile                                          = datarows[key].Mobile
        let Id_My_wife                                      = datarows[key].Id_My_wife
        let My_wife                                         = datarows[key].My_wife
        let Wife_English                                    = datarows[key].Wife_English
        let Person1                                         = datarows[key].Person1
        let Occupation                                      = datarows[key].Occupation1
        let OccupationDesc                                  = datarows[key].Occupation_Desc
        let businessTypeId                                  = datarows[key].businessTypeId
        let businessTypeOther                               = datarows[key].businessTypeOther
        let Position                                        = datarows[key].Position_name
        let Tel                                             = datarows[key].Tel
        let Fax                                             = datarows[key].Fax
        let InvestMentBy                                    = datarows[key].InvestMentBy
        let InvestMent                                      = datarows[key].InvestMent
        let InvestMentOther                                 = datarows[key].InvestMentOther
        let incomeSource                                    = datarows[key].incomeSource
        let SalaryPerMonth                                  = datarows[key].SalaryPerMonth
        let Bank_Id                                         = datarows[key].Bank_Id
        let Bank_Branch                                     = datarows[key].Bank_Branch
        let Bank_Account                                    = datarows[key].Bank_Account
        let Bank_IdReturn                                   = datarows[key].Bank_IdReturn
        let Bank_BranchReturn                               = datarows[key].Bank_BranchReturn
        let Bank_AccountReturn                              = datarows[key].Bank_AccountReturn
        let currentAddressSameAsFlag                        = datarows[key].currentAddressSameAsFlag
        let MonnyOther                                      = datarows[key].MonnyOther

        let x                       ="X"
        let accounid_1              = cardNumber.substring(0,1) + "   " + cardNumber.substring(1,2)  
        let accounid_2              = cardNumber.substring(2,3)  
        let accounid_3              = cardNumber.substring(3,4) 
        let accounid_4              = cardNumber.substring(4,5)
        let accounid_5             = cardNumber.substring(5,6)  
        let accounid_6              = cardNumber.substring(6,7)  
        let accounid_7              = cardNumber.substring(7,8)  
        let accounid_8              = cardNumber.substring(8,9) 
        let accounid_9              = cardNumber.substring(9,10) + "   " + cardNumber.substring(10,11)
        let accounid_10             = cardNumber.substring(11,12) 
        let accounid_11             = cardNumber.substring(12,13) 
        let timestampx
        let dateshow                = (Modify_Date !== null)? Modify_Date:createdate
        let DateExp                                     = datarows[key].DateExp
         
        let datexp                 = new Date(DateExp)
        datexp                     = ("0"+datexp.getDate()).slice(-2) + ("0"+ (datexp.getMonth() + 1)).slice(-2) +datexp.getFullYear()
        let datexp_day1,datexp_day2 ,datexp_month1,datexp_month2, datexp_year1, datexp_year2 ,datexp_year3, datexp_year4 //03032023
        datexp_day1 = datexp.substring(0,1)  
        datexp_day2 = datexp.substring(1,2)  
        datexp_month1 = datexp.substring(2,3)
        datexp_month2 = datexp.substring(3,4)
        datexp_year1 = datexp.toString().substring(4,5)
        datexp_year2 = datexp.toString().substring(5,6)
        datexp_year3 = datexp.toString().substring(6,7)
        datexp_year4 = datexp.toString().substring(7,8)
        if (datexp ==='01011970'){datexp_day1 = "";datexp_day2 = "";datexp_month1 = "";datexp_month2 = "";datexp_year1 = "";datexp_year2 = "";datexp_year3 = "";datexp_year4 = ""; }
        // console.log(datexp_day1+datexp_day2 + datexp_month1+datexp_month1+ datexp_year1+datexp_year2+datexp_year3+datexp_year4)
        const today                 = new Date()
        let date_ob                 = new Date(today);
        let date                    = ("0"+date_ob.getDate()).slice(-2); 
        let month                   = ("0"+ (date_ob.getMonth() + 1)).slice(-2);
        let year                    = date_ob.getFullYear();
        let hours                   = date_ob.getHours();
        let minutes                 = date_ob.getMinutes();
        let second                  = date_ob.getSeconds();
        let msecond                 = date_ob.getMilliseconds()
        let Sarabun                 ='fonts/Sarabun-Light.ttf'
  
        // timestampx = year +"-"+  month  +"-"+ date //+ "00:00:00.000"
        timestampx = year +  month  +  date //+ "00:00:00.000"
        let datetimefull = year +  month  +  date + hours + minutes + second + msecond// console.log(title)
        let timefull        = hours.toString() + minutes.toString() + second.toString() + msecond.toString()
        birthDate       =new Date(birthDate)
        birthDate       = ("0"+birthDate.getDate()).slice(-2) + ("0"+ (birthDate.getMonth() + 1)).slice(-2) +birthDate.getFullYear()
        console.log(cardNumber)
        // console.log(Position)
        
        if(cardExpiryDate.trim() !== null) {
         
            cardExpiryDate = cardExpiryDate.substring(6,8) +  cardExpiryDate.substring(4,6) + cardExpiryDate.substring(0,4) ;
        }
        let typeidx = ""
        if(TypeId == 2){typeidx = "x"}
        console.log(typeidx)
        // console.log(cardExpiryDate)
        let title_y,tille_x ,id_wife_y,id_wife_x
        if(title === "นาย"){title_y =241; tille_x =115+7;}else if(title === "นาง"){title_y =241; tille_x =183+12;}else if(title === "นางสาว"){title_y =241; tille_x =261+16;}else{title_y =241; tille_x =341+8;}  
        if(Id_My_wife !== null){
             if(Id_My_wife.toString().length > 0){id_wife_y = 333; id_wife_x=225+14;}else{id_wife_y = 333; id_wife_x=160+9;}
        }
        let identity_x   ,identity_y  
        if(currentAddressSameAsFlag !== null){
              identity_x = 44 ,identity_y = 590
        }else{
            identity_x = 346 ,identity_y = 590
        }
        
        // console.log("nationality :"+nationality)  
        let nation
        await getNation(nationality,(code)=>{ nation = code})
        let enNation = nation    
        nation = (nation === "THAI")? "ไทย": enNation
        let  addr_cus, addr_doc , addr_work , addr_current
        let  addr_seq ,addr_cus_no ,addr_cus_place ,addr_cus_road ,addr_cus_tambonId,addr_cus_tambon,addr_cus_ampphurId,addr_cus_amphur,addr_cus_provinceId,addr_cus_province
        let addr_cus_countryId ,addr_cus_country,addr_cus_Zipcode , addr_cus_Road2 ,addr_cus_Place2 ,addr_cus_MooNo
        let  addr_current_no ,addr_current_place ,addr_current_road ,addr_current_tambonId,addr_current_tambon,addr_current_ampphurId,addr_current_amphur,addr_current_provinceId,addr_current_province
        let addr_current_countryId ,addr_current_country ,addr_current_Zipcode , addr_current_Road2 ,addr_current_Place2 ,addr_current_MooNo
        let addr_work_no,addr_work_place,addr_work_road,addr_work_tambonId,addr_work_tambon,addr_work_ampphurId,addr_work_amphur,addr_work_provinceId,addr_work_province,addr_work_countryId,addr_work_country,addr_work_Zipcode,addr_work_Road2,addr_work_Place2,addr_work_MooNo     
        
        await getAddressinfo(cardNumber,(result)=>{
            for (const key in result) {
                addr_seq = result[key].Addr_Seq
                // 1 = ทะเบียนบ้าน    2= ที่ส่งเอกสาร    3= ที่ทำงาน  4 = ที่อยู่ทำธุรกรรม
                if(addr_seq ==1){
                    addr_current_no                     = result[key].Addr_No
                    addr_current_place                  = result[key].Place
                    addr_current_road                   = result[key].Road
                    addr_current_tambonId               = result[key].Tambon_Id
                    addr_current_ampphurId              = result[key].Amphur_Id
                    addr_current_provinceId             = result[key].Province_Id
                    addr_current_countryId              = result[key].Country_Id
                    addr_current_Zipcode                = result[key].Zip_Code
                    addr_current_Road2                  = result[key].Road2
                    addr_current_Place2                 = result[key].Place2
                    addr_current_MooNo                 = result[key].MooNo
                }
                if(addr_seq ==2){
                    addr_cus_no                     = result[key].Addr_No
                    addr_cus_place                  = result[key].Place
                    addr_cus_road                   = result[key].Road
                    addr_cus_tambonId               = result[key].Tambon_Id
                    addr_cus_ampphurId              = result[key].Amphur_Id
                    addr_cus_provinceId             = result[key].Province_Id
                    addr_cus_countryId              = result[key].Country_Id
                    addr_cus_Zipcode                = result[key].Zip_Code
                    addr_cus_Road2                  = result[key].Road2
                    addr_cus_Place2                 = result[key].Place2
                    addr_cus_MooNo                  = result[key].MooNo
                }
                if(addr_seq ==3){
                     addr_work_no                     = result[key].Addr_No
                     addr_work_place                  = result[key].Place
                     addr_work_road                   = result[key].Road
                     addr_work_tambonId               = result[key].Tambon_Id
                     addr_work_ampphurId              = result[key].Amphur_Id
                     addr_work_provinceId             = result[key].Province_Id
                     addr_work_countryId              = result[key].Country_Id
                     addr_work_Zipcode                = result[key].Zip_Code
                     addr_work_Road2                  = result[key].Road2
                     addr_work_Place2                 = result[key].Place2
                     addr_work_MooNo                  = result[key].MooNo
                }
                
            }
            // console.log(resllt)
        })
        
        // console.log(addr_work_Place2.length)
        // console.log(fontsizeplace)
        // fontsizeplace = (fontsizeplace.length >  15)? 9 : 9

        await gettabon(addr_cus_tambonId, (tambon )=>           {addr_cus_tambon = tambon})
        await getampphur(addr_cus_ampphurId,(amphur)=>          {addr_cus_amphur = amphur})
        await getprovince(addr_cus_provinceId ,(province)=>     {addr_cus_province = province})
        await getcountry(addr_cus_countryId ,(country)=>        {addr_cus_country = country})
        await gettabon(addr_current_tambonId, (tambon )=>       {addr_current_tambon = tambon})
        await getampphur(addr_current_ampphurId,(amphur)=>      {addr_current_amphur = amphur})
        await getprovince(addr_current_provinceId ,(province)=> {addr_current_province = province})
        await getcountry(addr_current_countryId ,(country)=>    {addr_current_country = country})
        await gettabon(addr_work_tambonId, (tambon )=>          {addr_work_tambon = tambon})
        await getampphur(addr_work_ampphurId,(amphur)=>         {addr_work_amphur = amphur})
        await getprovince(addr_work_provinceId ,(province)=>    {addr_work_province = province})
        await getcountry(addr_work_countryId ,(country)=>       {addr_work_country = country})
        let occupation, occupationX, occupationY
        // await setOccupation(+Occupation,(Occupationx,occDesc)=> {occupation = Occupationx })
        occupation = Occupation
        //เกษตรกร 20
        if(occupation === "5"){occupationX = 39+3; occupationY = 97}
         //แม่บ้าน 80
        if(occupation === "80"){occupationX = 39+3; occupationY = 114}
         //พระภิกษุ 25
        if(occupation === "20"){occupationX = 39+3; occupationY = 130+2}
         //นักลงทุน 90
        if(occupation === "14"){occupationX = 296+18; occupationY = 97+2}
         //นักเเรียน 140
        if(occupation === "16"){occupationX = 296+18; occupationY = 114}
         //เกษียณอายุ 120
        if(occupation === "6"){occupationX = 296+18; occupationY = 130+2}
         //พนักงานรัฐวิสาหกิจ  130
        if(occupation === "19"){occupationX = 39+3; occupationY = 184+2} 
         //พนักงานบริษัท 40
        if(occupation === "18"){occupationX = 296+18; occupationY = 184+2}  
         //กิจการครอบครัว 60
        if(occupation === "11"){occupationX = 39+3; occupationY = 202}  
         //แพทย์/พยาบาล  50
        if(occupation === "21"){occupationX = 296+18; occupationY = 202}
         //ครู/อาจารย์ 150
        if(occupation === "8"){occupationX = 39+3; occupationY = 220+2} 
         //นักการเมือง 110
        if(occupation === "15"){occupationX = 296+18; occupationY = 220+2}
         //ข้าราชการ 70
        if(occupation === "7"){occupationX = 39+3; occupationY = 240}
         //เจ้าของกิจการ/ธุรกิจส่วนตัว 30
        if(occupation === "11"){occupationX = 296+18; occupationY = 240}
        //อาชพีอิสระ //อื่น ๆ 170
        if(occupation === "17"){occupationX = 39+3; occupationY = 258+2} 
        //อื่น ๆ
        if(occupation === "999"){ occupationX = 296+18; occupationY = 258+2 }
        let businesstype , businessx,businessy
        
        await setbusinessTypeId(+businessTypeId,(busisnesstype,businesstId)=>{
            businesstype = busisnesstype ; 
        })
        // console.log(businesstype)
        if(businesstype ==="ค้าของเก่า /วัตถุโบราณ" )                   {businessx = 39+3; businessy = 350}  
        if(businesstype ==="อาวุธยุทธภัณฑ์" )                           {businessx = 39+3; businessy = 365}  
        if(businesstype ==="คาสิโน/ การพนัน" )                        {businessx = 39+3; businessy = 381}  
        if(businesstype ==="สหกรณ์/มูลนิธิ/สมาคม/สโมสร/วัด/มัสยิด/ศาลเจ้า" ){businessx = 39+3; businessy = 398}  
        if(businesstype ==="โอนและรับโอนเงินทั้งภายในและต่างประเทศ" )    {businessx = 39+3; businessy = 415}  
        if(businesstype ==="สถานบริการตามกฎหมายว่าด้วยสถานบริการ" )     {businessx = 39+3; businessy = 432}  
        if(businesstype ==="การเงิน/ธนาคาร" )                        {businessx = 39+3; businessy = 447}  
        if(businesstype ==="แลกเปลี่ยนเงินตราต่างประเทศ" )              {businessx = 39+3; businessy = 464}  
        if(businesstype ==="โรงแรม/ภัตตาคาร" )                       {businessx = 39+3; businessy = 480}  
        if(businesstype ==="ประกันภัย/ประกันชีวิต" )                     {businessx = 39+3; businessy = 495} 
        if(businesstype ==="ค้าอัญมณี/ทอง" )                           {businessx = 39+3; businessy = 513}   
        if(businesstype ==="อสังหาริมทรัพย์" )                          {businessx = 39+3; businessy = 528}  
        if(businesstype ==="ธุรกิจรับคนเข้ามาทำงานจากต่างประเทศหรือส่งคนไปทำงานต่างประเทศ" ){businessx = 39+3; businessy = 545}  
        if(businesstype ==="ธุรกิจนำเที่ยว/บริษัททัวร์" )                    {businessx = 39+3; businessy = 545+15}  
        if(businesstype ==="มหาวิทยาลัย/โรงเรียน/สถานศึกษา" )           {businessx = 39+3; businessy = 576}  
        if(businesstype ==="อื่นๆ" )                                  {businessx = 39+3; businessy = 592}    
        //------ Page 3   
        let InvestMentX  , InvestMentY
        
        // 1=เงินเดือน 2 ธุรกิจส่วนตัว 3 เงินปันผล ดอกเบี้ย เงินออม 4 มรดก ของขวัญ 5 ขายหลักทรัพย์ อสังหา 6 เงินเกษียณ
        if(InvestMent ==="1"){InvestMentX = 42; InvestMentY=154}
        if(InvestMent ==="2"){InvestMentX = 270; InvestMentY=170}
        if(InvestMent ==="3"){InvestMentX = 42; InvestMentY=170}
        if(InvestMent ==="4"){InvestMentX = 270; InvestMentY=154}
        if(InvestMent ==="5"){InvestMentX = 270; InvestMentY=186} 
        if(InvestMent ==="6"){InvestMentX = 42; InvestMentY=186} 

        let SalaryPerMonthX ,SalaryPerMonthY
        if(SalaryPerMonth ==="1"){SalaryPerMonthX = 42; SalaryPerMonthY=280-40} //0-15,000
        if(SalaryPerMonth ==="6"){SalaryPerMonthX = 270; SalaryPerMonthY=280-40} //15,0000-3000
        if(SalaryPerMonth ==="2"){SalaryPerMonthX = 42; SalaryPerMonthY=280-25}  //30 - 50,000
        if(SalaryPerMonth ==="7"){SalaryPerMonthX = 270; SalaryPerMonthY=280-25} // 50-100,000
        if(SalaryPerMonth ==="3"){SalaryPerMonthX = 42; SalaryPerMonthY=280-8 } // 100-500,000
        if(SalaryPerMonth ==="8"){SalaryPerMonthX = 270; SalaryPerMonthY=280-8} // 500 - 1,000,00
        if(SalaryPerMonth ==="4"){SalaryPerMonthX = 42; SalaryPerMonthY=280+7}  //1-4
        if(SalaryPerMonth ==="9"){SalaryPerMonthX = 270; SalaryPerMonthY=280+7}  //4-10
        if(SalaryPerMonth ==="5"){SalaryPerMonthX = 42; SalaryPerMonthY=280+24}  // > 10
        

        let InvestMentByX,InvestMentByY
        // 1 เพื่อออมเงิน  2เพื่อการลงทุนระยะสั้น 3 เพื่อการลงทุนระยะยยาว 4 สร้างผลตอบแทน 5 เพื่อสิทธิประโยชน์ทางภาษี 6 อื่่น ๆ
        if(InvestMentBy ==="4"){InvestMentByX =43; InvestMentByY= 102}  
        if(InvestMentBy ==="2"){InvestMentByX =270; InvestMentByY= 102}  
        if(InvestMentBy ==="3"){InvestMentByX =270; InvestMentByY= 102}  
        if(InvestMentBy ==="5"){InvestMentByX =43; InvestMentByY= 122}   
        if(InvestMentBy ==="6"){InvestMentByX =270; InvestMentByY= 122}
        let InvestMentOtherX,InvestMentOtherY
        if(InvestMentOther !== null){InvestMentOtherX= 350 ,InvestMentOtherY = 119} //350,119
        let chekBankX,checkBankY , nameBank ,nameBranch ,chekBankReturnX ,chekBankReturnY , nameBankReturn ,nameBankBranchReturn
        if(Bank_Id !== null){
            chekBankX = 127
            checkBankY = 208
            await getBankName(Bank_Id,(Bname)=>{
                    nameBank = Bname 
                    let indexOfFirst = nameBank.indexOf('จำกัด (มหาชน)'); 
                    let endname = nameBank.indexOf('จำกัด (มหาชน)', (indexOfFirst + 1))
                    nameBank = nameBank.substring(indexOfFirst,endname)
            })
            
            await getBankBranch(Bank_Id,Bank_Branch,(Brname)=>{nameBranch =Brname}) 
            // console.log(nameBranch) 
        }
        if(Bank_IdReturn !== null){
            chekBankReturnX = 127,chekBankReturnY = 386
            await getBankName(Bank_IdReturn,(Bname)=>{
                nameBankReturn = Bname 
                let indexOfFirst1 = nameBankReturn.indexOf('จำกัด (มหาชน)'); 
                let endname1 = nameBankReturn.indexOf('จำกัด (มหาชน)', (indexOfFirst1 + 1))
                nameBankReturn = nameBankReturn.substring(indexOfFirst1,endname1)
       })
       await getBankBranch(Bank_IdReturn,Bank_BranchReturn,(Brname)=>{nameBankBranchReturn =Brname})
        }
        let bankbranchX = 291 - (nameBankBranchReturn.length ) 
        let bankbranchY = 389
        let bankbranchY2 = 402
        let nameBankBranchReturn2
        if(nameBankBranchReturn.length > 20){
            //let indexOfFirst
            let nameBankBranchReturn_main = nameBankBranchReturn   
            nameBankBranchReturn =  nameBankBranchReturn.substring(0,15)
            nameBankBranchReturn2 = nameBankBranchReturn_main.substring(15,nameBankBranchReturn_main.length)
            // bankbranchY2 = 396
        }else{
            nameBankBranchReturn2=""
            bankbranchX = 291 - (nameBankBranchReturn.length *2 )
            bankbranchY = 389
            bankbranchY2 = 396
        }
        
        let singnatureX  = 426 - (thName.length *2) ,acountnamey2  ,accountname2
        let accountname = title + "  "+ thFirstName+ " " +thLastName 
        let accountnamex  ,acountnamey = 390    //426,540

        if(accountname.length  > 24){ //444 540 
            accountnamex  = 492 - (accountname.length *2 )
            acountnamey2 = 390 +12
            accountname2 = thLastName
            accountname = title + "  "+ thFirstName
        }else{
            accountnamex = 483 - ( accountname.length * 2) //
            acountnamey = 390
            acountnamey2 = 0
            accountname2 = " "
            
        }
        // console.log(accountname.length )

        if(currentAddressSameAsFlag !== null){
            addr_cus_no                     =  ""
            addr_cus_place                  =  ""
            addr_cus_road                   =  ""
            addr_cus_tambon                 = ""
            addr_cus_amphur                 = ""
            addr_cus_province               = ""
            addr_cus_country                = ""
            addr_cus_Zipcode                = ""
            addr_cus_Road2                  = ""
            addr_cus_Place2                 = ""
            addr_cus_MooNo                  = ""
        }

        var dir = 'C:\\WR\\fundcon\\'+timestampx;
        // fs.mkdir('C:\\genpdf');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true }); 
        }
        //birthDate
        var options = {
            size: 'A4',
            userPassword: '123456'
        }
        
        const doc = new PDFDocument(options);
        // doc.pipe(fs.createWriteStream('../../images/'+cardNumber+'.pdf'));
        // fs.writeFile('C:\\Users\\MyAccount\\Downloads\\test.json');
          filename = thName + "_" + timestampx + "_" + timefull
        doc.pipe(fs.createWriteStream(dir+'\\'+filename+'.pdf'));
        
        doc.image('image/Fundconnext_FormFinal_Page_01.jpg', 0, 0, {width: 600,height:800}) // 1
        .font(Sarabun)
        .fontSize(8).text(x,122,109)
        .fontSize(11)
        .text(accounid_1, 354, 105 ).text(accounid_2, 380, 105 ).text(accounid_3, 392, 105 ).text(accounid_4, 404, 105 ).text(accounid_5, 420, 105 )
        .text(accounid_6, 432, 105 ).text(accounid_7, 443, 105 ).text(accounid_8, 456, 105 )
        .text(accounid_9, 469, 105 ).text(accounid_10, 496, 105 ).text(accounid_11, 510, 105 )
        .text(datexp_day1,273+20,122)
        .text(datexp_day2,285+20,122)
        .text(datexp_month1,299+20,122)
        .text(datexp_month2,310+20,122) 
        .text(datexp_year1,325+21,122)
        .text(datexp_year2,336+22,122)
        .text(datexp_year3,347+24,122)
        .text(datexp_year4,359+24,122)
        .fontSize(8).text(typeidx,404,126)
        .fontSize(8).text(x,tille_x,title_y)
        .fontSize(11)
        .text(thName,160,258).text(enName,160+6,275)
        .text(birthDate.substring(0,1),206+13,292)
        .text(birthDate.substring(1,2),216+14,292)
        .text(birthDate.substring(2,3),230+16,292)
        .text(birthDate.substring(3,4),242+16,292)
        .text(birthDate.toString().substring(4,5),254+18,292)
        .text(birthDate.toString().substring(5,6),267+18,292)
        .text(birthDate.toString().substring(6,7),278+18,292)
        .text(birthDate.toString().substring(7,8),292+18,292)
        .text(nation,185+20,311)
        // .fontSize(8).text(x,id_wife_x,id_wife_y)
        let fontsizeplace 
        let fontsizeroad
        if(addr_current_Place2.length >10){fontsizeplace = 8}else{fontsizeplace = 11}
        if(addr_current_Road2.length >10){fontsizeroad = 8}else{fontsizeroad = 11} 
        doc.fontSize(11).text(My_wife,330+20,365).text(Wife_English,330+40,365+15)
        .text(Mobile,185,425).text(Fax,329+120,425)
        .text(Tel,105,440).text(email,329+20,440)
        .text(addr_current_no,120+10,496).text(addr_current_MooNo,230+15,496).fontSize(fontsizeplace).text(addr_current_Place2,400+20,496)  
        .fontSize(11).text(addr_current_place,212+14,514).text(addr_current_road,290+20,514).fontSize(fontsizeroad).text(addr_current_Road2,438+25,514)  
        .fontSize(11).text(addr_current_tambon,185+14,528+2).text(addr_current_amphur,408+25,528+2) 
        .text(addr_current_province,115+10,548).text(addr_current_Zipcode,315+20,548).text(addr_current_country,432+30,548) 
        .fontSize(8).text(x,identity_x,identity_y)
        .fontSize(11)
        if(addr_cus_Place2.length >10){fontsizeplace = 8}else{fontsizeplace = 11}
        if(addr_cus_Road2.length >10){fontsizeroad = 8}else{fontsizeroad = 11} 
        doc.text(addr_cus_no,120+10,612+2).text(addr_cus_MooNo,230+20,612+2).fontSize(fontsizeplace).text(addr_cus_Place2,400+20,616)  
        .fontSize(11).text(addr_cus_place,212+10,630).text(addr_cus_road,290+25,630).fontSize(fontsizeroad).text(addr_cus_Road2,438+23,630)  
        .fontSize(11).text(addr_cus_tambon,185+15,648).text(addr_cus_amphur,408+30,648) 
        .text(addr_cus_province,115+15,664).text(addr_cus_Zipcode,315+20,664).text(addr_cus_country,432+30,664)
        .rotate(40, {origin: [200, 250]}).fontSize(50).fillColor('gray').fillOpacity(0.5).text("[CONFIDENTIAL]", 150,250)
         
        doc.addPage()
        if(addr_work_Place2.length >10){fontsizeplace = 8}else{fontsizeplace = 11}
        if(addr_work_Road2.length >10){fontsizeroad = 8}else{fontsizeroad = 11} 
        doc.image('image/Fundconnext_FormFinal_Page_02.jpg', 0, 0 ,{width: 600,height:800}) //2
        .fontSize(8).text("X",occupationX,occupationY) 
        .text(OccupationDesc ,302+20,272 )
        .text(x,businessx,businessy)
        .fontSize(11).text(businessTypeOther,220+10,592-2)
        .fontSize(11).text(Company,180+10,639)
        .text(addr_work_no,120+10,655).text(addr_work_MooNo,230+20,655).fontSize(fontsizeplace).text(addr_work_Place2,400+24,657)
        .fontSize(11).text(addr_work_place,212+10,672).text(addr_work_road,290+20,672).fontSize(fontsizeroad).text(addr_work_Road2,438+30,672)
        .fontSize(11).text(addr_work_tambon,185+15,687).text(addr_work_amphur,408+30,687)
        .text(addr_work_province,115+10,704).text(addr_work_Zipcode,315+20,704).text(addr_work_country,432+30,704)
        .text(Position,135,720)
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
          
        doc.addPage()
        doc.image('image/WR_20220427-Fundconnext Form-All Form Final 3.jpg', 0, 0, {width: 600,height:800}) //3
        .fontSize(8).text(x,44,104)
        .fontSize(8).text(x,InvestMentX,InvestMentY)
        .text(x,SalaryPerMonthX ,SalaryPerMonthY)
        .fontSize(8).text(x,318,406) 
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750)
        
        // .fontSize(11).text(addr_current_no,120+10,496+14).text(addr_current_MooNo,230+15,496+14).text(addr_current_Place2,400+20,496+14)  
        // .text(addr_current_place,212+14,514+10).text(addr_current_road,290+20,514+10).text(addr_current_Road2,438+25,514+10)  
        // .text(addr_current_tambon,185+14,528+12).text(addr_current_amphur,408+25,528+12) 
        // .text(addr_current_province,115+10,548+10).text(addr_current_Zipcode,315+20,548+10).text(addr_current_country,432+30,548+10)
         
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_04.jpg', 0, 0, {width: 600,height:800}) //4
        .fontSize(8).text(x,InvestMentByX,InvestMentByY)
        .fontSize(11).text(MonnyOther,350,120) 
        // .fontSize(8).text(x,chekBankX,checkBankY)
        // .fontSize(8).text(nameBank,180,210)
        // .text(nameBranch,255,205)
        // .text(Bank_Account,350,213)
        .fontSize(8).text(x,44 ,342)
        .fontSize(8).text(x,chekBankReturnX ,chekBankReturnY)
        .text(nameBankReturn,180,390)
        .text(nameBankBranchReturn,bankbranchX,bankbranchY)
        .text(nameBankBranchReturn2,bankbranchX,bankbranchY2)
        .text(Bank_AccountReturn,350,390)
        // .text(title+ " "+ thName,accountnamex,acountnamey) //444,390
        .text(accountname,accountnamex,acountnamey)
        .text(accountname2,accountnamex,acountnamey2)
        // .fillColor('red').text(x ,340,639)
        .fillColor('black').fontSize(11).text(thName,singnatureX,658) // thName 335 - 520
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 

        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_05.jpg', 0, 0, {width: 600,height:800}) //5
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_06.jpg', 0, 0, {width: 600,height:800})  //6
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_07.jpg', 0, 0, {width: 600,height:800}) //7
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_08.jpg', 0, 0, {width: 600,height:800}) //8
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_09.jpg', 0, 0, {width: 600,height:800}) //9
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_10.jpg', 0, 0, {width: 600,height:800}) //10
        .fillColor('red').text(x ,270,688)
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_11.jpg', 0, 0, {width: 600,height:800}) //11
        .fontSize(8).text(title+ " "+ thName,140,350)
        .text(nation,428,318)
        .text(cardNumber.substring(0,1) + "   " + cardNumber.substring(1,2),132,380)
        .text(cardNumber.substring(2,3) + "    " + cardNumber.substring(3,4),155,380)
        .text(cardNumber.substring(4,5) + "    " + cardNumber.substring(5,6),179,380)
        .text(cardNumber.substring(6,7) + "    " + cardNumber.substring(7,8),205,380)
        .text(cardNumber.substring(8,9) + "    " + cardNumber.substring(9,10),230,380)
        .text(cardNumber.substring(11,12) + "    " + cardNumber.substring(12,13),255,380)
        .text(cardNumber.substring(12,13)  ,280,380)
        .text(x ,557,541)
        .text(x ,557,640)
        .text(x ,557,744)
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_12.jpg', 0, 0, {width: 600,height:800}) //12
        .fontSize(8).text(x ,558,222)
        .text(x ,562,248)
        .text(x ,566,287)
        .text(x ,568,340)
        .text(x ,568,390)
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 

        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_13.jpg', 0, 0, {width: 600,height:800}) //13
        .fontSize(8).text(title+ " "+ thName,((170+290)/2) - ((title.length+2 +thName.length) * 2) ,598)
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 

        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_14.jpg', 0, 0, {width: 600,height:800}) //14
        .fontSize(11)
        .text(title+ " "+ thName, 220,96)
        .fontSize(8).text(cardNumber , 460,100)
        .fontSize(8).text(title+ " "+ thName,((380+500)/2) - ((title.length+2 +thName.length) * 2) ,698) //15
        .fontSize(13).fillColor('red').text("[Confidential]", 440,730) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_15.jpg', 0, 0, {width: 600,height:800}) //16
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_16.jpg', 0, 0, {width: 600,height:800}) //17
        .fontSize(11)
        .text(title+ " "+ thName, 224,94)
        .fontSize(8).text(cardNumber , 469,98)
        .fontSize(8).text(title+ " "+ thName,((380+500)/2) - ((title.length+2 +thName.length) * 2) ,534)
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_17.jpg', 0, 0, {width: 600,height:800}) //18
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_18.jpg', 0, 0, {width: 600,height:800}) //19
        .fontSize(11)
        .text(title+ " "+ thName, 220,78)
        .fontSize(8).text(cardNumber , 464,132)
        .fontSize(8).text(title+ " "+ thName,((380+500)/2) - ((title.length+2 +thName.length) * 2) ,688)
        .fontSize(13).fillColor('red').text("[Confidential]",  440,730) 
        doc.addPage()
        doc.image('image/Fundconnext_FormFinal_Page_19.jpg', 0, 0, {width: 600,height:800}) //20
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750) 
        doc.addPage()
        doc.image('image/Fundconnex_Page_052.jpg', 0, 0, {width: 600,height:800}) //21
        .fontSize(8).text(x,122,109)
        .fontSize(11)
        .text(accounid_1, 354, 105 ).text(accounid_2, 380, 105 ).text(accounid_3, 392, 105 ).text(accounid_4, 404, 105 ).text(accounid_5, 420, 105 )
        .text(accounid_6, 432, 105 ).text(accounid_7, 443, 105 ).text(accounid_8, 456, 105 )
        .text(accounid_9, 469, 105 ).text(accounid_10, 496, 105 ).text(accounid_11, 510, 105 )
        .text(cardExpiryDate.substring(0,1),273+20,122)
        .text(cardExpiryDate.substring(1,2),285+20,122)
        .text(cardExpiryDate.substring(2,3),299+20,122)
        .text(cardExpiryDate.substring(3,4),310+20,122) 
        .text(cardExpiryDate.toString().substring(4,5),325+21,122)
        .text(cardExpiryDate.toString().substring(5,6),336+22,122)
        .text(cardExpiryDate.toString().substring(6,7),347+24,122)
        .text(cardExpiryDate.toString().substring(7,8),359+24,122)
        .fontSize(8).text(x,tille_x,title_y)
        .fontSize(11)
        .text(thName,160,258).text(enName,160+6,275)
        .text(birthDate.substring(0,1),206+13,292)
        .text(birthDate.substring(1,2),216+14,292)
        .text(birthDate.substring(2,3),230+16,292)
        .text(birthDate.substring(3,4),242+16,292)
        .text(birthDate.toString().substring(4,5),254+18,292)
        .text(birthDate.toString().substring(5,6),267+18,292)
        .text(birthDate.toString().substring(6,7),278+18,292)
        .text(birthDate.toString().substring(7,8),292+18,292)
        .text(nation,185+20,311)
        // .fontSize(8).text(x,id_wife_x,id_wife_y)
        .fontSize(11).text(My_wife,330+20,365).text(Wife_English,330+40,365+15)
        .text(Mobile,185,425).text(Fax,329+120,425)
        .text(Tel,105,440).text(email,329+20,440)
        // .fillColor('black').fontSize(11).text(thName,singnatureX,658) 
        .fontSize(9).text( thName,((404+524)/2) - ((thName.length) * 2) ,698)
        .fontSize(13).fillColor('red').text("[Confidential]", 300,750)
        doc.end()

        }
        catch{

        }
        // console.log("filename "+filename)
        return callback(filename)
    }    
    // console.log("filename "+filename)
    // return callback(filename)
}
 
async function selectaccountToPdf (callback){
    try{
        let  statement = `Select     Account_Info.*,Fund_cen_Customer.identificationCardType ,Fund_cen_Customer.businessTypeId ,Fund_cen_Customer.businessTypeOther ,Fund_cen_Customer.currentAddressSameAsFlag , Fund_cen_Customer.cardExpiryDate
                        FROM Account_Info inner join Fund_cen_Customer on cardNumber = Cust_Code 
                        WHERE   Cust_Code ='3760500954079' 
                        order by Cust_Code   
                         `
                        // top 50 percent  WHERE   Cust_Code ='1100400563522' OR Cust_Code = '3760500954079' OR Cust_Code = '1100400369351' OR Cust_Code = '3100201578291'  OR Cust_Code = '1100800265847'

        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            if (data_row > 0){ 
                // console.log(result.recordset)
            }
            sql.close();

            return   callback(result.recordset);  
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
async function selectaccountsToPdf (cust_code,callback){
     
        try{
            let  statement = `Select     Account_Info.*,Fund_cen_Customer.identificationCardType ,Fund_cen_Customer.businessTypeId ,Fund_cen_Customer.businessTypeOther ,Fund_cen_Customer.currentAddressSameAsFlag , Fund_cen_Customer.cardExpiryDate
                                FROM Account_Info inner join Fund_cen_Customer on cardNumber = Cust_Code 
                                WHERE   Cust_Code = @account  
                            `
                            // top 50 percent  WHERE   Cust_Code ='1100400563522' OR Cust_Code = '3760500954079' OR Cust_Code = '1100400369351' OR Cust_Code = '3100201578291'  OR Cust_Code = '1100800265847'

            await new sql.ConnectionPool(config).connect().then(pool => {
                return pool.request()
                .input("account" ,sql.VarChar(20), cust_code)
                .query(statement);
            }).then(result => {
                let data_row = result.rowsAffected.toString();
                if (data_row > 0){ 
                    // console.log(result.recordset)
                }
                sql.close();

                return   callback(result.recordset);  
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
async function selectaccountToPdfbyid (cust_code,callback){
    try{
        let  statement = `Select     Account_Info.*,Fund_cen_Customer.identificationCardType ,Fund_cen_Customer.businessTypeId ,Fund_cen_Customer.businessTypeOther ,Fund_cen_Customer.currentAddressSameAsFlag , Fund_cen_Customer.cardExpiryDate
                        FROM Account_Info inner join Fund_cen_Customer on cardNumber = Cust_Code 
                        WHERE   Cust_Code = @Cust_Code  
                        order by Cust_Code   
                         `
                        // top 50 percent  WHERE   Cust_Code ='1100400563522' OR Cust_Code = '3760500954079' OR Cust_Code = '1100400369351' OR Cust_Code = '3100201578291'  OR Cust_Code = '1100800265847'

        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Cust_Code" ,sql.VarChar(20) ,cust_code) 
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            if (data_row > 0){ 
                // console.log(result.recordset)
            }
            sql.close();

            return   callback(result.recordset);  
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
async function getNation(code_nation , callback){
    // console.log(code_nation)
    try{
        let statement = "SELECT Nation_Desc    FROM REF_Nations   WHERE (Nation_Code = @nation)"
    let desc_code = ""    
    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("nation" ,   sql.VarChar(50), code_nation)
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result)
            if (data_row > 0){ 
                desc_code = result.recordset[0].Nation_Desc
            }
            sql.close();

            return   callback(desc_code);  
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
async function getAddressinfo(id_account ,callback){
    try{
        let statement = `SELECT * FROM Account_Address WHERE Cust_Code = @Cust_Code `
        // console.log(id_account)
        await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Cust_Code" ,   sql.VarChar(30), id_account)
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result.recordset[1])
            //console.log(result)
            if (data_row > 0){ 
                // desc_code = result.recordset
            }
            sql.close();

            return   callback(result.recordset);  
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
async function gettabon(tambonId, callback){
    try{
        let statement = `SELECT  Tambon_ID, Prefix, Name_Thai, Name_Eng, Amphur_ID  FROM REF_Tambons WHERE Tambon_ID =@Tambon_ID`

    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Tambon_ID" ,   sql.Int, tambonId)
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result.recordset)
            let name_tambon = null
            if (data_row > 0){ 
                // desc_code = result.recordset
                name_tambon =result.recordset[0].Name_Thai
            }
            sql.close();

            return   callback(name_tambon);  
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
async function getampphur(ampphurId,callback){
    try{
        let statement = `SELECT   Amphur_ID, Prefix, Name_Thai, Name_Eng, Province_ID, NameNew
                            FROM REF_Amphurs WHERE Amphur_ID= @Amphur_ID`

    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Amphur_ID" ,   sql.Int, ampphurId)
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result.recordset)
            if (data_row > 0){ 
                // desc_code = result.recordset
            }
            sql.close();

            return   callback(result.recordset[0].Name_Thai);  
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
 
async function getprovince(provinceId ,callback){
    try{
        let statement = `SELECT Province_ID, Name_Thai, Name_Eng, Country_ID
                         FROM REF_Provinces WHERE Province_ID = @Province_ID`

    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Province_ID" ,   sql.Int, provinceId)
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result.recordset)
            if (data_row > 0){ 
                // desc_code = result.recordset
            }
            sql.close();

            return   callback(result.recordset[0].Name_Thai);  
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
async function getcountry(countryId ,callback){
    try{
        let statement = `SELECT  Country_ID, Name_Thai, Name_Eng, Nation, Country_Code, Country_Abbrv
                         FROM REF_Countrys WHERE Country_ID =@Country_ID`

    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Country_ID" ,   sql.Int, countryId)
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result.recordset)
            if (data_row > 0){ 
                // desc_code = result.recordset
            }
            sql.close();

            return   callback(result.recordset[0].Name_Thai);  
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
async function setOccupation1(id , callback){
    let IdOccupation =""
    let OccupationDesc =""
    // console.log("Occupation : " +id)
    switch (id) {
        case 20: // เกษตร
            IdOccupation = "5"
            OccupationDesc = ""
            break;
        case 25: // พระภิกษุ
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
        case 60: // กิจการครอบครัว
            IdOccupation = "999"
            OccupationDesc ="กิจการครอบครัว"
            break;
        case 70: // ข้าราชการ
            IdOccupation = "7"
            OccupationDesc =""
            break;
        case 80: // แม่บ้าน พ่อบ้าน
            IdOccupation = "20"
            OccupationDesc =""
            break;
        case 90: // นักลงทุน
            IdOccupation = "999"
            OccupationDesc ="นักลงทุน"
            break;
        case 110: // นักการเมือง
            IdOccupation = "15"
            OccupationDesc =""
            break;
        case 120: // เกษียนอายุ
            IdOccupation = "6"
            OccupationDesc =""
            break;
        case 130: // พนักงานรัฐวิสาหกิจ
            IdOccupation = "19"
            OccupationDesc =""
            break;
        case 140: // นักเรียน นักศึกษา
            IdOccupation = "16"
            OccupationDesc =""
            break;
        case 150: // อาชีพอิสระ
            IdOccupation = "17"
            OccupationDesc =""
            break;
        case 160: // ครุู อาจารย์
            IdOccupation = "8"
            OccupationDesc =""
            break;
        case 170: // อื่น ๆ
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
async function setOccupation(id , callback){
    let IdOccupation =""
    let OccupationDesc =""
    // console.log("Occupation : " +id)
    switch (id) {
        case 18: // พนักงานบริษัท
            IdOccupation = "18"
            OccupationDesc = ""
            break;
        case 20: // เกษตร
            IdOccupation = "5"
            OccupationDesc = ""
            break;
        case 25: // พระภิกษุ
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
        case 60: // กิจการครอบครัว
            IdOccupation = "999"
            OccupationDesc ="กิจการครอบครัว"
            break;
        case 70: // ข้าราชการ
            IdOccupation = "7"
            OccupationDesc =""
            break;
        case 80: // แม่บ้าน พ่อบ้าน
            IdOccupation = "20"
            OccupationDesc =""
            break;
        case 90: // นักลงทุน
            IdOccupation = "999"
            OccupationDesc ="นักลงทุน"
            break;
        case 110: // นักการเมือง
            IdOccupation = "15"
            OccupationDesc =""
            break;
        case 120: // เกษียนอายุ
            IdOccupation = "6"
            OccupationDesc =""
            break;
        case 130: // พนักงานรัฐวิสาหกิจ
            IdOccupation = "19"
            OccupationDesc =""
            break;
        case 140: // นักเรียน นักศึกษา
            IdOccupation = "16"
            OccupationDesc =""
            break;
        case 150: // อาชีพอิสระ
            IdOccupation = "17"
            OccupationDesc =""
            break;
        case 160: // ครุู อาจารย์
            IdOccupation = "8"
            OccupationDesc =""
            break;
        case 170: // อื่น ๆ
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
        case 155:
            businesstype ="ธุรกิจรับคนเข้ามาทำงานจากต่างประเทศหรือส่งคนไปทำงานต่างประเทศ"
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
async function getDataSpouse(data ,callback){
    // console.log(data) 
    let json = JSON.parse(data)
    // console.log(json.thFirstName)
    let nameth = json.thFirstName + " " + json.thLastName
    let nameEng = json.enFirstName + " " + json.enLastName
    return callback(nameth,nameEng)

}
async function  getBankName(Bank_Id, callback){
    try{
        let statement = `SELECT     Bank_ID, Bank_Short_Name, Bank_Name_T, Bank_Name_E, LastModifyDate, ModifiedByUser, Bank_IDNew, Bank_Name_N
                        FROM         REF_Banks WHERE Bank_ID =@Bank_Id`

    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Bank_Id" ,   sql.Int, Bank_Id)
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result.recordset)
            let bankname = ""
            if (data_row > 0){ 
                bankname = result.recordset[0].Bank_Name_T
            }
            sql.close();

            return   callback(bankname);  
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
async function  getBankBranch(Bank_Id,Branch_ID , callback){
    try{
        let statement = `SELECT    Bank_ID, Branch_ID, Branch_Name_T, Branch_Name_E, LastModifyDate, ModifiedByUser, Bank_IDNew, Branch_IDNew
                            FROM         REF_Bank_Branchs
                            WHERE     (Bank_ID = @Bank_ID) AND (Branch_ID = @Branch_ID)`

    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request()
            .input("Bank_Id" ,      sql.Int, Bank_Id)
            .input("Branch_ID" ,    sql.Int, Branch_ID)
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result.recordset)
            let Branch_Name_T = ""
            if (data_row > 0){ 
                Branch_Name_T = result.recordset[0].Branch_Name_T
            }
            sql.close();

            return   callback(Branch_Name_T);  
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

async function pdfshowDataform(callback){
    try{
        let statement = `SELECT     dbo.Customer_send_form.send, dbo.Customer_send_form.cust_code, dbo.Account_Info.Title_Name_T, dbo.Account_Info.First_Name_T, dbo.Account_Info.Last_Name_T , dbo.Account_Info.Email
                        FROM         dbo.Customer_send_form INNER JOIN
                        dbo.Account_Info ON dbo.Customer_send_form.cust_code = dbo.Account_Info.Cust_Code`

    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() 
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result.recordset)
            let Cust_Code = "" ,send
            if (data_row > 0){ 
                Cust_Code = result.recordset  
                
            }
            sql.close();
            // console.log(Cust_Code)
            return   callback(Cust_Code);  
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
async function pdfgroupshowDataform(callback){
    try{
        let statement = `SELECT  top(30)   dbo.Customer_send_form.send, dbo.Customer_send_form.cust_code, dbo.Account_Info.Title_Name_T, dbo.Account_Info.First_Name_T, dbo.Account_Info.Last_Name_T , dbo.Account_Info.Email
                        FROM         dbo.Customer_send_form INNER JOIN
                        dbo.Account_Info ON dbo.Customer_send_form.cust_code = dbo.Account_Info.Cust_Code WHERE     (dbo.Customer_send_form.send IS NULL) `

    await new sql.ConnectionPool(config).connect().then(pool => {
            return pool.request() 
            .query(statement);
          }).then(result => {
            let data_row = result.rowsAffected.toString();
            // let desc_code = ""
            // console.log(result.recordset)
            let Cust_Code = "" ,send
            if (data_row > 0){ 
                Cust_Code = result.recordset  
                
            }
            sql.close();
            // console.log(Cust_Code)
            return   callback(Cust_Code);  
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
export {genpdf,selectaccountToPdf,pdfshowDataform ,pdfgroupshowDataform,selectaccountToPdfbyid,selectaccountsToPdf}
//****************[ Created Date 2022 08 29  ]********************************/
//****************[ Author   Aticht  Phungjok ]********************************/
//****************[ Version  0.0.1             ]********************************/
//****************[ Copyright Wealth Republic ] ]********************************/