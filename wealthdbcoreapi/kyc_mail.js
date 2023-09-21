import nodemailer from 'nodemailer'; 






async function sendemailreport(email){
    // email  = email==="info"? 'info@wealthrepublic.co.th': email
    // let namethai ,nameEng
    // await getnameth(cardNO,(nameth,name_Eng)=>{
    //     namethai = nameth;
    //     nameEng = name_Eng
    // })
    let br = '<br/>', br2 ='<br/><br/>'
    let textmail = `เรียน  ลูกค้าผู้มีอุปการะคุณ ${br}
    เรื่อง การยืนยันตัวตนสำหรับผู้ที่ยังไม่เคยทำการยืนยันตัวตนด้วยบัตรประชาชนเพื่อตรวจสอบสถานะบัตรกับกรมการปกครองทางออนไลน์ (Dip Chip) กับ บลน. เวลท์ รีพับบลิค ${br2}
    
    บริษัทหลักทรัพย์นายหน้าซื้อขายหน่วย เวลท์ รีพับบลิค จำกัด ขอเรียนแจ้งให้ลูกค้าผู้มีบัญชีซื้อขายกองทุนรวมกับทางบริษัทฯ ทราบว่า เพื่อให้เป็นไปตามเกณฑ์ยืนยันตัวตนด้วยเทคโนโลยีตามประกาศแนวปฏิบัติของสำนักงานคณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์ที่ กลต. นป.5/2563 เรื่อง แนวทางปฏิบัตอในการนำเทคโนโลยี่มาใช้ในการทำความรู้จักลูกค้า ซึ่งมีผลตั้งแต่วันที่ 1 ม.ค. 2564 เป็นต้นมานั้น${br2}
    
    บริษัทฯ ขอให้ท่านดำเนินการยืนยันตัวตนด้วยบัตรประชาชนให้เรียบร้อยเพื่อไม่ให้กระทบกับการทำธุรกรรม ผ่าน 2 ช่องทาง ดังนี้${br}
    1. ติดต่อผู้แนะนำการลงทุนของท่าน เพื่อนำบัตรประชาชนของท่านทำการยืนยันตัวตนผ่านระบบออนไลน์ (Dip Chip) เพื่อตรวจสอบสถานะบัตรประชาชนกับกรมการปกครอง หรือ${br2}
    2. ทำการยืนยันตัวตนด้วยบริการของ NDID ทางโทรศัพท์มือถือผ่านแอพพลิเคชั่น Wealth Republic ของบริษัท โดยท่านสามารถดาวโหลดแอพพลิเคชั่น Wealth Republic ได้ทั้ง IOS และ Android เมื่อติดตั้งแอพพลิเคชั่น Wealth Republic บนโทรศัพท์มือถือของท่านเรียบร้อยแล้ว ให้ทำตามขั้นตอนดังนี้${br2}
    
    2.1 กดปุ่ม”ตั้งค่า” (รูปฟันเฟือง) ที่อยู่มุมขวาล่าง ${br}
    2.2 กดปุ่ม “สมัครใช้บริการ” และกรอกเลขบัตรประชาชน เบอร์โทรศัพท์ (ต้องเป็นเบอร์ที่เคยให้ไว้กับบริษัทตอนเปิดบัญชีเท่านั้น) และกรอกวันเดือนปีเกิด แล้วให้ท่านปฏิบัติตามขั้นตอนที่ระบบกำหนดจนเสร็จ  ${br}
    โดยท่านต้องเลือกธนาคารที่ท่านเคยทำการยืนยันตัวตนด้วยบัตรประชาชนมาแล้ว เพื่อธนาคารนั้นเป็นผู้ทำการรับรองตัวตนของท่านและส่งผลยืนยันตัวตนผ่าน NDID มายังบริษัท โดยล็อกอินเข้าเข้าระบบโมบายแบ้งก์กิ้งของธนาคาร และปฏิบัติตามขั้นตอนจนเสร็จ${br2}
    
    **โดยท่านต้องเตรียมบัตรประชาชนตัวจริง และหน้าแรกสมุดบัญชีเงินฝากที่ท่านใช้เป็นบัญชีหลักในการรับเงินค่าขายคืนหน่วยลงทุน**${br2}
    สอบถามข้อมูลเพิ่มเติม กรุณาติดต่อที่ฝ่ายบริการลูกค้า โทร 02-266-6697  ในเวลาทำการ 9.00 – 17.30 น. หรือ Line ID :  @wealthrepublic${br2}
       
    ขอแสดงความนับถือ${br}
    บลน. เวลท์ รีพับบลิค${br}
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
                user: 'cs@wealthrepublic.co.th',
                pass: 'wrmf@2016'
            },
            tls:{ 
                rejectUnauthorized: false 
                }
        });
        let currentPath = process.cwd();

        // let logo = fs.readFileSync(currentPath+'\\image\\WR_Logo.jpg');
        // Message object
        let message = {
            from: 'cs@wealthrepublic.co.th',
            to: `${email}`,
            cc: 'info@wealthrepublic.co.th ', //'komkrit@wealthrepublic.co.th'
            subject: 'การทบทวน KYC ',
            text: `${textmail} `,
            html:  `${textmail}`
            //,
            // attachments: [
            //     {
            //       filename: filename,
            //       path: dir
            //     }
            //   ] 
        };
    
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + email);
                // return process.exit(1);
            }
    
            //  updateReportmail(filename,datenow)
            //console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });


}
let lineData_test = [
   
    
    
    



]
let lineData = [   
    { "mail": "psupaporn43@hotmail.com"}
    ,{ "mail": "karin@loxinfo.co.th"}
    ,{ "mail": "tipmanu@yahoo.com"}
    ,{ "mail": "Kalaya_rtb@hotmail.com"}
    ,{ "mail": "sumitchula@hotmail.com"}
    ,{ "mail": "sllynn@loxinfo.co.th"}
    ,{ "mail": "prajak15@hotmail.com"}
    ,{ "mail": "sunee_bom@hotmail.com"}
    ,{ "mail": "podssa@gmail.com"}
    ,{ "mail": "Sukporn_cha@yahoo.co.th"}
    ,{ "mail": "gooaek@gmail.com"}
    ,{ "mail": "kae.chuti@gmail.com"}
    ,{ "mail": "duangkaewung@yahoo.com"}
    ,{ "mail": "amberfieldgroup@gmail.com"}
    ,{ "mail": "Liang2505@gmail.com"}
    ,{ "mail": "veerapan.a@gmail.com"}
    ,{ "mail": "Praneedentist@hotmail.com"}
    ,{ "mail": "cthakon@ctw-es.com"}
    ,{ "mail": "iamkanyap@gmail.com"}
    ,{ "mail": "iamkanyap@gmail.com"}
    ,{ "mail": "maekaii@hotmail.com"}
    ,{ "mail": "sulee@jsr.co.th"}
    ,{ "mail": "prerspa19@hotmail.com"}
    ,{ "mail": "bundit_naothaworn@msn.com"}
    ,{ "mail": "peerasak.si.plastic@gmail.com"}
    ,{ "mail": "pattanan@apyeng.com"}
    ,{ "mail": "obunchob@yahoo.com"}
    ,{ "mail": "tongstit@gmail.com"}
    ,{ "mail": "visitsak@dhonsiridsel.co.th"}
    ,{ "mail": "maneegorn@icloud.com"}
    ,{ "mail": "pao.fin.ru@gmail.com"}
    ,{ "mail": "kiratiko@gmail.com"}
    ,{ "mail": "sirithorn.singhaphan@shell.com"}
    ,{ "mail": "oraphanassamongkol@gmail.com"}
    ,{ "mail": "natarn007@gmail.com"}
    ,{ "mail": "bmjones@loxinfo.co.th"}
    ,{ "mail": "prasnee.s@gmail.com"}
    ,{ "mail": "adul0913@hotmail.com"}
    ,{ "mail": "vanneeid@yahoo.com"}
    ,{ "mail": "yerayong@gmail.com"}
    ,{ "mail": "phanyapa45@gmial.com"}
    ,{ "mail": "hradeesri@gmail.com"}
    ,{ "mail": "ngim2001@gmail.com"}
    ,{ "mail": "thaikart@hotmail.com"}
    ,{ "mail": "ikksmom@gmail.com"}
    ,{ "mail": "suchadadd@yahoo.com"}
    ,{ "mail": "chai_onnuch@hotmail.com"}
    ,{ "mail": "panitsornpdd@gmail.com"}
    ,{ "mail": "apinyaree@yahoo.com"}
    ,{ "mail": "DRSUPACHAI@YAHOO.COM"}
    ,{ "mail": "goldbims@yahoo.com"}
    ,{ "mail": "chanchai@vivgroup.com"}
    ,{ "mail": "spochanee@yahoo.com"}
    ,{ "mail": "psangkhum@gmail.com"}
    ,{ "mail": "sunisa_thi@hotmail.com"}
    ,{ "mail": "kanpananon@yahoo.com"}
    ,{ "mail": "kampananon@yahoo.com"}
    ,{ "mail": "pkris2003@hotmail.com"}
    ,{ "mail": "soonthariya@gmail.com"}
    ,{ "mail": "drsuthasinee@hotmail.com"}
    ,{ "mail": "suchada.pinpranee@gmail.com"}
    ,{ "mail": "saisoi@hotmail.com"}
    ,{ "mail": "TG19429@gmail.com"}
    ,{ "mail": "nilly70@hotmail.com"}
    ,{ "mail": "pradit.boss"}
    ,{ "mail": "chuchaiv@hotmail.co.th"}
    ,{ "mail": "bkk2269@gmail.com"}
    ,{ "mail": "Chayapa53@hotmail.com"}
    ,{ "mail": "wst_school@hotmail.com"}
    ,{ "mail": "wst_school@hotmail.com"}
    ,{ "mail": "nattanan.luck245@gmail.com"}
    ,{ "mail": "siriprofessional@gmail.com"}
    ,{ "mail": "luchaichan@sls.co.th"}
    ,{ "mail": "supot.tangcharoen@hotmail.com"}
    ,{ "mail": "wantaneetangcharoen@gmail.com"}
    ,{ "mail": "ultralight_b@hotmail.com"}
    ,{ "mail": "Benz_shadow@hotmail.com"}
    ,{ "mail": "phathsinee@gmail.com"}
    ,{ "mail": "nualpare.kaewnuch@gmail.com"}
    ,{ "mail": "usalum@hotmail.com"}
    ,{ "mail": "bunjurdvi@gmail.com"}
    ,{ "mail": "bunjurdvi@gmail.com"}
    ,{ "mail": "sanguan.2501titi@gmail.com"}
    ,{ "mail": "ladechavas@gmail.com"}
    ,{ "mail": "wantanakalaya@gmail.com"}
    ,{ "mail": "nivatnkk@gmail.com"}
    ,{ "mail": "boonsnong.k@thaibev.com"}
    ,{ "mail": "jeab_1324@hotmail.com"}
    ,{ "mail": "sinchai@gmail.com"}
    ,{ "mail": "b_gayna@hotmail.com"}
    ,{ "mail": "phanu44dental@gmail.com"}
    ,{ "mail": "vrungtha@yahoo.com"}
    ,{ "mail": "drrwanchai@yahoo.com"}
    ,{ "mail": "KJBEST@HOTMAIL.COM"}
    ,{ "mail": "jongkonphananon@gmail.com"}
    ,{ "mail": "youi2512@gmail.com"}
    ,{ "mail": "numchokchai@yahoo.com"}
    ,{ "mail": "sutida.vichit@gmail.com"}
    ,{ "mail": "sutida.vichit@gmail.com"}
    ,{ "mail": "sutida.vichit@gmail.com"}
    ,{ "mail": "yuki@pendulum.co.th"}
    ,{ "mail": "visitwang@yahoo.com"}
    ,{ "mail": "panida403@hotmail.com"}
    ,{ "mail": "opasma7@gmail.com"}
    ,{ "mail": "anek@apyeng.com"}
    ,{ "mail": "pattanan@apyeng.com"}
    ,{ "mail": "ekaruj@gmail.com"}
    ,{ "mail": "kandabbl@gmail.com"}
    ,{ "mail": "j.ning1965@gmail.com"}
    ,{ "mail": "sesumitra@hotmail.com"}
    ,{ "mail": "sudapornw@gmail.com"}
    ,{ "mail": "angie.surangkana@gmail.com"}
    ,{ "mail": "patpongl@yahoo.com"}
    ,{ "mail": "Siriwan.fin@outlook.com"}
    ,{ "mail": "anurat.kongtoranin@gmail.com"}
    ,{ "mail": "gance@hotmail.com"}
    ,{ "mail": "PITCHAYAMON.S@DKSH.COM"}
    ,{ "mail": "nongduang007@hotmail.com"}
    ,{ "mail": "yingpuree@gmail.com"}
    ,{ "mail": "rawin168DD@gmail.com"}
    ,{ "mail": "kanokvalee@gmail.com"}
    ,{ "mail": "kku325@gmail.com"}
    ,{ "mail": "vilai60@hotmail.com"}
    ,{ "mail": "Vichienma@hotmail.com"}
    ,{ "mail": "wchumpol@gmail.com"} 
    ,{ "mail": "nutchamai@carabao.co.th"}
    ,{ "mail": "thanis_ch@hotmail.com"} 
    ,{ "mail": "zknoon@gmail.com"}
    ,{ "mail": "somsak.w999@gmail.com"}
    ,{ "mail": "ranviras@yahoo.com"}
    ,{ "mail": "sujjapun@yahoo.com"}
    ,{ "mail": "aroonsri@babygiftthailand.com"}
    ,{ "mail": "nusaraeed@yahoo.com"}
    ,{ "mail": "saengchai@urbanconcept.co.th"}
    ,{ "mail": "chantima_yee@hotmail.co.th"}
    ,{ "mail": "yokeofficemail@gmail.com"}
    ,{ "mail": "thitimatoo@gmail.com"}
    ,{ "mail": "kikutidtee@gmail.com"}
    ,{ "mail": "tukta103wealthrepublic@hotmail.com"}
    ,{ "mail": "rattanach@gmail.com"}
    ,{ "mail": "ratth@hotmail.com"}
    ,{ "mail": "patinduke@yahoo.com"}
    ,{ "mail": "kiatipong.a@gmail.com"}
    ,{ "mail": "Kulathida@hoshizaki.co.th"}
    ,{ "mail": "amazonkeng@gmail.com"}
    ,{ "mail": "doctormonnaka@gmail.com"}
    ,{ "mail": "rengboonma@hotmail.com"}
    ,{ "mail": "Somnuekcn@gmail.com"}
    ,{ "mail": "sannpat@gmail.com"}
    ,{ "mail": "julpayap@gmail.com"}
    ,{ "mail": "metapun.cha@gmail.com"}
    ,{ "mail": "praphaimoocha@gmail.com"}
    ,{ "mail": "Thanakornv@hotmail.com"}
    ,{ "mail": "Thanakornv@hotmail.com"}
    ,{ "mail": "settapramote@gmail.com"}
    ,{ "mail": "pradthana@scasset.com"}
    ,{ "mail": "aeyadd@hotmail.com"}
    ,{ "mail": "vitthink@gmail.com"}
    ,{ "mail": "patellarknee@gmail.com"}
    ,{ "mail": "yupinnt27@hotmail.com"}
    ,{ "mail": "yuttakarns@siemens.com"}
    ,{ "mail": "aodb@truemail.co.th"}
    ,{ "mail": "supang_nt14@hotmail.com"}
    ,{ "mail": "tiewlee2019@gmail.com"}
    ,{ "mail": "Lex2598@hotmail.com"}
    ,{ "mail": "Oon.spo@gmail.com"}
    ,{ "mail": "Ponds352@gmail.com"}
    ,{ "mail": "U-know_nat@hotmail.com"}
    ,{ "mail": "Noi_jan888@hotmail.com"}
    ,{ "mail": "sumitchula@gmail.com"}
    ,{ "mail": "wasanchalermchaiwat@gmail.com"}
    ,{ "mail": "witoon.taw@uob.co.th"}
    ,{ "mail": "kratanaampai@gmail.com"}
    ,{ "mail": "Opal_kaa@hotmail.com"}
    ,{ "mail": "auraciti@hotmail.com"}
    ,{ "mail": "thanetb@gmail.com"}
    ,{ "mail": "ptharn@hotmail.com"}
    ,{ "mail": "cola-2510@hotmail.com"}
    ,{ "mail": "VTK2535OH@gmail.com"}
    ,{ "mail": "Methin.k@gmail.com"}
    ,{ "mail": "Cnilkus0660@icloud.com"}
    ,{ "mail": "Kumthornr@gmail.com"}
    ,{ "mail": "Enovationthai@gmail.com"}
    ,{ "mail": "amphonaps@gmail.com"}
    ,{ "mail": "Gulpantip@gmail.com"}
    ,{ "mail": "pongsak@ananda.co.th"}
    ,{ "mail": "sorat.bee@gmail.com"}
    ,{ "mail": "numx25@gmail.com"}
    ,{ "mail": "sorat.bee@gmail.com"}
    ,{ "mail": "gormusee26@yahoo.com"}
    ,{ "mail": "linda_aia56@yahoo.com"}
    ,{ "mail": "botanybonsai@gmail.com"}
    ,{ "mail": "thanutr@gmail.com"}
    ,{ "mail": "ssavantrad@gmail.com"}
    ,{ "mail": "ssk_hippo@yahoo.co.th"}
    ,{ "mail": "sudarat@asiahotel.co.th"}
    ,{ "mail": "modduke00@gmail.com"}
    ,{ "mail": "nkoolsiri@gmail.com"}
    ,{ "mail": "kanlapak.ch@gmail.com"}
    ,{ "mail": "kwantip_s@yahoo.com"}
    ,{ "mail": "tawatchai.usn@gmail.com"}
    ,{ "mail": "watsom.567@gmail.com"}
    ,{ "mail": "anwayakorn92@gmail.com"}
    ,{ "mail": "wuthisanti.jaree@yahoo.com"}
    ,{ "mail": "sumate7777@hotmail.com"}
    ,{ "mail": "kritsda@aerofluid.com"}
    ,{ "mail": "sanya_6815@hotmail.com"}
    ,{ "mail": "prisana_mam@yahoo.com"}
    ,{ "mail": "gracekes@gmail.com"}
    ,{ "mail": "nutta.p@hotmail.com"}
    ,{ "mail": "magga241972@gmail.com"}
    ,{ "mail": "usasirith@yahoo.com"}
    ,{ "mail": "Chaninchorn@mbkgroup.co.th"}
    ,{ "mail": "streetip@hotmail.com"}
    ,{ "mail": "somkiat2547@gmail.com"}
    ,{ "mail": "thanis2009@gmail.com"}
    ,{ "mail": "yupa.siribodhi@shell.com"}
    ,{ "mail": "mui.aia@hotmail.com"}
    ,{ "mail": "vicky2507@icloud.com"}
    ,{ "mail": "katie-kade@hotmail.com"}
    ,{ "mail": "jite8078@hotmail.com"}
    ,{ "mail": "psrisuwat@yahoo.com"}
    ,{ "mail": "naruemit@hotmail.com"}
    ,{ "mail": "pimuk777@gmail.com"}
    ,{ "mail": "thavornsakt@gmail.com"}
    ,{ "mail": "nateemun@gmail.com"}
    ,{ "mail": "praphassara.p@gmail.com"}
    ,{ "mail": "vp@thai-iod.com"}
    ,{ "mail": "rchutarat@gmail.com"}
    ,{ "mail": "aunyacute@gmail.com"}
    ,{ "mail": "pathompongsster62@gmail.com"}
    ,{ "mail": "vaewmanee19@hotmail.com"}
    ,{ "mail": "vaewmanee19@hotmail.com"}
    ,{ "mail": "panpua9969@gmail.com"}
    ,{ "mail": "sodsakorn@kbmeng.com"}
    ,{ "mail": "thaweesak@kbmeng.com"}
    ,{ "mail": "matana6506@gmail.com"}
    ,{ "mail": "panumart.w@gmail.com"}
    ,{ "mail": "chalinnana@gmail.com"}
    ,{ "mail": "wiwattaptiang@gmail.com"}
    ,{ "mail": "au4111@gmail.com"}
    ,{ "mail": "shong1463@gmail.com"}
    ,{ "mail": "amarittee@gmail.com"}
    ,{ "mail": "akoonchararin@gmail.com"}
    ,{ "mail": "vinai.chalerm@gmail.com"}
    ,{ "mail": "eidmwa@gmail.com"}
    ,{ "mail": "RANGSEEPROM@GMAIL.COM"}
    ,{ "mail": "nongohm.s@gmail.com"}
    ,{ "mail": "padungsit@gmail.com"}
    ,{ "mail": "peiymsuwrrnnphnity@gmail.com"}
    ,{ "mail": "gonggang68@gmail.com"}
    ,{ "mail": "tananya2020@gmail.com"}
    ,{ "mail": "wjongsomsuk@gmail.com"}
    ,{ "mail": "jj1607@live.com"}
    ,{ "mail": "wimon1112@yahoo.com"}
]

for (let line of lineData) {
// doc.strokeColor(line.color).moveTo(line.x1, line.y1).lineTo(line.x2, line.y2).lineWidth(0.2).stroke();
  console.log(line.mail)
//sendemailreport(line.mail)
} 
