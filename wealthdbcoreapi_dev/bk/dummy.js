import { fixZero } from "../dbutils";

	table.columns.add('EFFECTIVE_DATE', sql.VarChar(10) , {nullable: true});	
	table.columns.add('FUND_CODE', sql.VarChar(30) , {nullable: true});
	table.columns.add('FEE_TYPE', sql.VarChar(1) , {nullable: true});
	table.columns.add('FEE_UNIT', sql.VarChar(1) , {nullable: true});		
	table.columns.add('MAXIMUM_FEE', sql.VarChar(20) , {nullable: true});
	table.columns.add('ACTUAL_FEE', sql.VarChar(20) , {nullable: true});	
	table.columns.add('MINIMUM_FEE', sql.VarChar(20) , {nullable: true});
	table.columns.add('REMARK	', sql.VarChar(250) , {nullable: true});
	table.columns.add('MAXIMUM_VALUE', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER01', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER02', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER03', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER04', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER05', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER06', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER07', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER08', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER09', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER10', sql.VarChar(20) , {nullable: true});
	table.columns.add('FILLER11', sql.VarChar(20) , {nullable: true});



	

	UPDATE FundExc_Individual_FIX SET  Passport_Country = N'' WHERE  (Passport_Country IS NULL)
	UPDATE FundExc_Individual_FIX SET  Card_Number = N'' WHERE  (Card_Number IS NULL)
	UPDATE FundExc_Individual_FIX SET  Card_Expiry_Date = N'' WHERE   (Card_Expiry_Date IS NULL) 
	UPDATE FundExc_Individual_FIX SET  accompanyingDocument = N'' WHERE  (accompanyingDocument IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Title = N'' WHERE  (Title IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Title_Other = N'' WHERE  (Title_Other IS NULL) 
	UPDATE FundExc_Individual_FIX SET  First_Name_En = N'' WHERE  (First_Name_En IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Last_Name_En = N'' WHERE  (Last_Name_En IS NULL) 
	UPDATE FundExc_Individual_FIX SET  First_Name_Th = N'' WHERE  (First_Name_Th IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Last_Name_Th = N'' WHERE  (Last_Name_Th IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Birth_Date = N'' WHERE  (Birth_Date IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Nationality = N'' WHERE  (Nationality IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Mobile_Number = N'' WHERE  (Mobile_Number IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Email = N'' WHERE  (Email IS NULL) 
	UPDATE FundExc_Individual_FIX SET  phone = N'' WHERE  (phone IS NULL) 
	UPDATE FundExc_Individual_FIX SET  fax = N'' WHERE  (fax IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Marital_Status = N'' WHERE  (Marital_Status IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Spouse_First_Name_TH = N'' WHERE  (Spouse_First_Name_TH IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Spouse_Last_Name_TH = N'' WHERE  (Spouse_Last_Name_TH IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Spouse_First_Name_EN = N'' WHERE  (Spouse_First_Name_EN IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Spouse_Last_Name_EN = N'' WHERE  (Spouse_Last_Name_EN IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Occupation_ID = N'' WHERE  (Occupation_ID IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Occupation_Other = N'' WHERE  (Occupation_Other IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Business_Type_ID = N'' WHERE  (Business_Type_ID IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Business_Type_Other = N'' WHERE  (Business_Type_Other IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Monthly_Income_Level = N'' WHERE  (Monthly_Income_Level IS NULL) 
	UPDATE FundExc_Individual_FIX SET  assetValue = N'' WHERE  (assetValue IS NULL)
	UPDATE FundExc_Individual_FIX SET  Income_Source = N'' WHERE  (Income_Source IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Income_Source_Other = N'' WHERE  (Income_Source_Other IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_No = N'' WHERE  (IdDocument_Address_No IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Floor = N'' WHERE  (IdDocument_Address_Floor IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Buliding = N'' WHERE  (IdDocument_Address_Buliding IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Room_No = N'' WHERE  (IdDocument_Address_Room_No IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Soi = N'' WHERE  (IdDocument_Address_Soi IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Road = N'' WHERE  (IdDocument_Address_Road IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Moo = N'' WHERE  (IdDocument_Address_Moo IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Sub_Dist = N'' WHERE  (IdDocument_Address_Sub_Dist IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_District = N'' WHERE  (IdDocument_Address_District IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Province = N'' WHERE  (IdDocument_Address_Province IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Postal_Code = N'' WHERE  (IdDocument_Address_Postal_Code IS NULL) 
	UPDATE FundExc_Individual_FIX SET  IdDocument_Address_Country = N'' WHERE  (IdDocument_Address_Country IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Same_AS_Flag = N'' WHERE  (Current_Address_Same_AS_Flag IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_No = N'' WHERE  (Current_Address_No IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Floor = N'' WHERE  (Current_Address_Floor IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Buliding = N'' WHERE  (Current_Address_Buliding IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Room_No = N'' WHERE  (Current_Address_Room_No IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Soi = N'' WHERE  (Current_Address_Soi IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Road = N'' WHERE  (Current_Address_Road IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Moo = N'' WHERE  (Current_Address_Moo IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Subdistrict = N'' WHERE  (Current_Address_Subdistrict IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_District = N'' WHERE  (Current_Address_District IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Province = N'' WHERE  (Current_Address_Province IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Postal_Code = N'' WHERE  (Current_Address_Postal_Code IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Current_Address_Country = N'' WHERE  (Current_Address_Country IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Company_name = N'' WHERE  (Company_name IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_No = N'' WHERE  (Work_Address_No IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Floor = N'' WHERE  (Work_Address_Floor IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Buliding = N'' WHERE  (Work_Address_Buliding IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Room_No = N'' WHERE  (Work_Address_Room_No IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Soi = N'' WHERE  (Work_Address_Soi IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Road = N'' WHERE  (Work_Address_Road IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Moo = N'' WHERE  (Work_Address_Moo IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Sub_Dist = N'' WHERE  (Work_Address_Sub_Dist IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_District = N'' WHERE  (Work_Address_District IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Province = N'' WHERE  (Work_Address_Province IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Postal_Code = N'' WHERE  (Work_Address_Postal_Code IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Work_Address_Country = N'' WHERE  (Work_Address_Country IS NULL) 
	UPDATE FundExc_Individual_FIX SET  workPosition = N'' WHERE  (workPosition IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Political_Related_Person = N'' WHERE  (Political_Related_Person IS NULL) 
	UPDATE FundExc_Individual_FIX SET  politicalRelatedPersonPosition = N'' WHERE  (politicalRelatedPersonPosition IS NULL)
	UPDATE FundExc_Individual_FIX SET  Can_Accept_FX_Risk = N'' WHERE  (Can_Accept_FX_Risk IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Can_Accept_Derivative_Investment = N'' WHERE  (Can_Accept_Derivative_Investment IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Risk_Level_Suitability = N'' WHERE  (Risk_Level_Suitability IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Suitability_Evaluation_Date = N'' WHERE  (Suitability_Evaluation_Date IS NULL) 
	UPDATE FundExc_Individual_FIX SET  FATCA = N'' WHERE  (FATCA IS NULL) 
	UPDATE FundExc_Individual_FIX SET  FATCA_Declaration_Date = N'' WHERE  (FATCA_Declaration_Date IS NULL) 
	UPDATE FundExc_Individual_FIX SET  CDD_Score = N'' WHERE  (CDD_Score IS NULL)
	UPDATE FundExc_Individual_FIX SET  CDD_Date = N'' WHERE  (CDD_Date IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Referal_Person = N'' WHERE  (Referal_Person IS NULL)
	UPDATE FundExc_Individual_FIX SET  Application_Date = N'' WHERE  (Application_Date IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Income_Source_Country = N'' WHERE  (Income_Source_Country IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Accept_By = N'' WHERE  (Accept_By IS NULL)
	UPDATE FundExc_Individual_FIX SET  FundConnext_Flag = N'' WHERE  (FundConnext_Flag IS NULL) 
	UPDATE FundExc_Individual_FIX SET  Vulnerable_Flag = N'' WHERE  (Vulnerable_Flag IS NULL)
	UPDATE FundExc_Individual_FIX SET  vulnerableDetail = N'' WHERE  (vulnerableDetail IS NULL)
	UPDATE FundExc_Individual_FIX SET  NDID_Flag = N'' WHERE  (NDID_Flag IS NULL)
	UPDATE FundExc_Individual_FIX SET  ndidRequestId = N'' WHERE  (ndidRequestId IS NULL)
	UPDATE FundExc_Individual_FIX SET  openChannel = N'' WHERE  (openChannel IS NULL) 
	UPDATE FundExc_Individual_FIX SET  investorClass = N'' WHERE  (investorClass IS NULL)
	
UPDATE FundExc_Individual_FIX SET  
[StatusAPI] = N'',
[LoopAPI] = N'',
[StatusFundConn] = N''
  FROM [MFTSDEVELOP2022].[dbo].[FundExc_Individual_FIX]
  
 
  UPDATE FundExc_Individual_FIX 
  SET Company_name = 'ไม่ระบุ'
  WHERE Company_name = ''



3100500210806
0107556000159
1349900190993
0105548094245
3101400557112
3100202943392
3100502388670
3102401082321
0107539000201
3100902587394-2
3100603031904
3450500993034
3101400954707-2
3100602189822-2
3600700357148
3100901004590
3100400014941
3200700137753
3100500210806
3250600207750
0107556000159
3101501138841
3100400712061
0105548094245
0105555067436
0107539000201
0107556000159
3100900647179
3100901004590
3100901083287
3100901790331
3100904518403-2
3101200143136
3101400440843
3101400557112
3102401082321
3200700137753
3250600207750
3400500851868
3450500993034
3700400396694
3929800004889
4760500001312

3100500210806
0107556000159
1349900190993
0105548094245
3101400557112
3100202943392
3100502388670
3102401082321
0107539000201
3100902587394-2
3100603031904
3450500993034
3101400954707-2
3100602189822-2
3600700357148
3100901004590
3100400014941
3200700137753
3100500210806
3250600207750
0107556000159
3101501138841
3100400712061
3100400712061


Address:identificationDocument
{
  no: '233/369',
  roomNo: ' ',
  floors: ' ',
  building: ' ',
  soi: ' ',
  road: ' ศรีนครินทร์',
  moo: '6',
  postalCode: '10270',
  subDistrict: 'บางเมือง',
  district: 'เมืองสมุทรปราการ',
  province: 'สมุทรปราการ',
  country: 'TH'
}
Address:current
{
  no: '',
  roomNo: '',
  floors: ' ',
  building: ' ',
  soi: ' ',
  road: ' ',
  moo: ' ',
  postalCode: '',
  subDistrict: ' ',
  district: ' ',
  province: ' ',
  country: ' '
}
Address:work
{
  no: '13',
  roomNo: ' ',
  floors: ' ',
  building: ' ',
  soi: 'บางนา-ตราด30',
  road: 'เทพรัฒน',
  moo: ' ',
  postalCode: '10260',
  subDistrict: 'บางนา',
  district: 'บางนา',
  province: 'กรุงเทพมหานคร',
  country: 'TH'
}
1
1
1
1
1
1
1
1
1
1
1
1
sutibility:
{
  suitNo1: 1,
  suitNo2: 1,
  suitNo3: 1,
  suitNo4: 1,
  suitNo5: 1,
  suitNo6: 1,
  suitNo7: 1,
  suitNo8: 1,
  suitNo9: 1,
  suitNo10: 1,
  suitNo11: 1,
  suitNo12: 1
}
currentAddressSameAsFlag is IdDocument
openFundConnextFormFlag is N
Middleware:WealthDB
{
  recordsets: [],
  recordset: undefined,
  output: {},
  rowsAffected: [ 1 ]
}
Middleware:WealthDB
Address:identificationDocument
{
  no: '1105/69',
  roomNo: '',
  floors: '',
  building: '',
  soi: '',
  road: 'เพชรบุรี 31',
  moo: '',
  postalCode: '10400',
  subDistrict: 'มักกะสัน',
  district: 'ราชเทวี',
  province: 'กรุงเทพมหานคร',
  country: 'TH'
}
Address:current
{
  no: '18',
  roomNo: '',
  floors: '',
  building: '',
  soi: '',
  road: '',
  moo: '',
  postalCode: '18000',
  subDistrict: 'ปากเพรียว',
  district: 'เมืองสระบุรี',
  province: 'สระบุรี',
  country: 'TH'
}
Address:work
{
  no: '18',
  roomNo: '',
  floors: '',
  building: '',
  soi: '',
  road: '',
  moo: '',
  postalCode: '18000',
  subDistrict: 'ปากเพรียว',
  district: 'เมืองสระบุรี',
  province: 'สระบุรี',
  country: 'TH'
}
1
1
1
1
1
1
1
1
1
1
1
1
sutibility:
{
  suitNo1: 1,
  suitNo2: 1,
  suitNo3: 1,
  suitNo4: 1,
  suitNo5: 1,
  suitNo6: 1,
  suitNo7: 1,
  suitNo8: 1,
  suitNo9: 1,
  suitNo10: 1,
  suitNo11: 1,
  suitNo12: 1
}
currentAddressSameAsFlag is empty
openFundConnextFormFlag is N
Middleware:WealthDB
{
  recordsets: [],
  recordset: undefined,
  output: {},
  rowsAffected: [ 1 ]
}
Middleware:WealthDB
Address:identificationDocument
{
  no: '85/1',
  roomNo: '',
  floors: '',
  building: 'สหคลินิครวมแพทย์',
  soi: '',
  road: 'เศรษฐสัมพันธ์',
  moo: '',
  postalCode: '18140',
  subDistrict: 'หนองแค',
  district: 'หนองแค',
  province: 'สระบุรี',
  country: 'TH'
}
Address:current
{
  no: '',
  roomNo: '',
  floors: '',
  building: '',
  soi: '',
  road: '',
  moo: '',
  postalCode: '',
  subDistrict: '',
  district: '',
  province: '',
  country: 'TH'
}
Address:work
{
  no: '18',
  roomNo: '',
  floors: '2',
  building: 'ผู้ป่วยนอก',
  soi: '',
  road: 'เทศบาล 4',
  moo: '',
  postalCode: '18000',
  subDistrict: 'ปากเพรียว',
  district: 'เมืองสระบุรี',
  province: 'สระบุรี',
  country: 'TH'
}
1
1
1
1
1
1
1
1
1
1
1
1
sutibility:
{
  suitNo1: 1,
  suitNo2: 1,
  suitNo3: 1,
  suitNo4: 1,
  suitNo5: 1,
  suitNo6: 1,
  suitNo7: 1,
  suitNo8: 1,
  suitNo9: 1,
  suitNo10: 1,
  suitNo11: 1,
  suitNo12: 1
}
currentAddressSameAsFlag is IdDocument
openFundConnextFormFlag is N
Middleware:WealthDB
{
  recordsets: [],
  recordset: undefined,
  output: {},
  rowsAffected: [ 1 ]
}



Email

Error :

response: {
    status: 422,
    statusText: 'Unprocessable Entity',

Step ที่ 1 ดึงข้อมูล Individual 1 record ผล สำเร็จ
=============================================
async function getFundConnIndividualResponse(cardNumber, callback){
	try{           
	  isLogin();
	  
	  let cur_token = process.env['ROOT_TOKEN'];
	  const URL = process.env['URL_PROF_INDIV_V4']+"?cardNumber="+cardNumber;
	  //console.log("URL:"+URL);
	  await axios({
			  method: 'get',
		url: URL,
		
		headers : {
			'content-type': 'application/json',
			'cache-control': 'no-cache',
			'x-auth-token': cur_token
		  },
		responseType: 'json'  
		  })
	  .then(function (response) {
		// handle success
		//console.log("==================================");
		//console.log("status: "+response.status);
		//console.dir(response.data);
		return callback(response.data, response.status);
	  })
	  .catch(function (error) {
		// handle error
		console.log(error);
		return callback(error, error.response.status);
	  });
		  
  
	} catch (error) {
	  console.log('Error', error.message);
	  return callback(error,error.message);  
	  
	}
  
  }
  

[ดึงข้อมูลได้สำเร็จ]

retrieve Individual status: 200
Individual has accounts data:for update
{
  identificationCardType: 'CITIZEN_CARD',
  cardNumber: '1100900394924',
  accountId: '1100900394924',
  icLicense: '005371',
  accountOpenDate: '20211116',
  investmentObjective: 'Investment',
  investmentObjectiveOther: null,
  approvedDate: '20220326',
  mailingAddressSameAsFlag: 'Work',
  mailing: {
    no: '599/88',
    floor: null,
    building: null,
    soi: null,
    road: 'พระราม 3',
    moo: null,
    district: 'ยานนาวา',
    province: 'กรุงเทพมหานคร',
    postalCode: '10120',
    country: 'TH',
    roomNo: null,
    subDistrict: 'บางโพงพาง'
  },
  subscriptionBankAccounts: [],
  redemptionBankAccounts: [
    {
      bankCode: '004',
      bankBranchCode: '0001',
      bankAccountNo: '0073695112',
      default: true
    }
  ],
  openOmnibusFormFlag: null,
  mailingMethod: 'Post',
  investmentOther: ''
}
URL: https://www.fundconnext.com/api/customer/individual/v4
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjEzMSwidXNlcm5hbWUiOiJBUElfV1IwMiIsInNlbGxpbmdBZ2VudElkIjoxNDEsInNlbGxpbmdBZ2VudENvZGUiOiJXUiIsImlzUGFzc3Rocm91Z2giOmZhbHNlLCJyb2xlcyI6WzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyXSwiaWF0IjoxNjQ5NjQ4NjU0LCJleHAiOjE2NDk2NTA0NTR9.SibdSdcKDODTRJEvAK_L0Ox5GT5h2vdTWXTb6EnQq50
json data
{
  identificationCardType: 'CITIZEN_CARD',
  cardNumber: '1100900394924',
  cardExpiryDate: '20290114',
  accompanyingDocument: 'CITIZEN_CARD',
  title: 'MISS',
  enFirstName: 'Nutchanok',
  enLastName: 'Vongswat',
  thFirstName: 'ณัฐชนก',
  thLastName: 'วงษ์สวัสดิ์',
  birthDate: '19880115',
  nationality: 'TH',
  mobileNumber: '0877050944',
  email: 'suvarat@carabao.co.th',
  fax: '',
  maritalStatus: 'Single',
  occupationId: 40,
  occupationOther: '',
  businessTypeId: 180,
  businessTypeOther: 'เครื่องดื่ม',
  monthlyIncomeLevel: 'LEVEL3',
  assetValue: null,
  incomeSource: 'SALARY',
  incomeSourceOther: '',
  identificationDocument: {
    no: '98/2',
    floor: null,
    building: '',
    roomNo: '',
    soi: '',
    road: '',
    moo: '2',
    subDistrict: 'บางพลับ',
    district: 'ปากเกร็ด',
    province: 'นนทบุรี',
    postalCode: '11120',
    country: 'TH'
  },
  companyName: 'บมจ.คาราบาวกรุ๊ป',
  current: {
    no: '599/88',
    floor: null,
    building: '',
    roomNo: '',
    soi: '',
    road: 'พระราม 3',
    moo: '',
    subDistrict: 'บางโพงพาง',
    district: 'ยานนาวา',
    province: 'กรุงเทพมหานคร',
    postalCode: '10120',
    country: 'TH'
  },
  work: {
    no: '393',
    floor: null,
    building: '393 สีลม',
    roomNo: '',
    soi: '',
    road: '',
    moo: '',
    subDistrict: 'สีลม',
    district: 'บางรัก',
    province: 'กรุงเทพมหานคร',
    postalCode: '10500',
    country: 'TH'
  },
  workPosition: 'กรรมการบริหาร',
  relatedPoliticalPerson: false,
  politicalRelatedPersonPosition: '',
  canAcceptFxRisk: true,
  canAcceptDerivativeInvestment: true,
  suitabilityRiskLevel: '3',
  suitabilityEvaluationDate: '20211115',
  suitabilityForm: {
    suitNo1: '1',
    suitNo2: '1',
    suitNo3: '1',
    suitNo4: '1',
    suitNo5: '1',
    suitNo6: '1',
    suitNo7: '1',
    suitNo8: '1',
    suitNo9: '1',
    suitNo10: '1',
    suitNo11: '1',
    suitNo12: '1'
  },
  fatca: false,
  fatcaDeclarationDate: '20211115',
  cddScore: null,
  cddDate: '20211115',
  referralPerson: '',
  applicationDate: '20211115',
  incomeSourceCountry: 'TH',
  acceptedBy: '',
  openFundConnextFormFlag: 'N',
  accounts: [
    {
      identificationCardType: 'CITIZEN_CARD',
      cardNumber: '1100900394924',
      accountId: '1100900394924',
      icLicense: '005371',
      accountOpenDate: '20211116',
      investmentObjective: 'Investment',
      investmentObjectiveOther: null,
      approvedDate: '20220326',
      mailingAddressSameAsFlag: 'Work',
      mailing: [Object],
      subscriptionBankAccounts: [],
      redemptionBankAccounts: [Array],
      openOmnibusFormFlag: null,
      mailingMethod: 'Post',
      investmentOther: ''
    }
  ],
  approvedDate: '20220321',
  openChannel: '2',
  investorClass: '',
  vulnerableFlag: false,
  vulnerableDetail: '',
  ndidFlag: false,
  ndidRequestId: '',
  investorType: 'INDIVIDUAL'
}

Step ที 2 update ข้อมูล สถานที่ติดต่อใน Accounts JSON
================================================
if (jdata.hasOwnProperty('accounts')){
	if (statusxx == 200){
		jdata.accounts[0].mailingAddressSameAsFlag = accountData.Mailing_Address_Same_as_Flag;
		jdata.accounts[0].mailingMethod = accountData.Mailing_Method;
		jdata.accounts[0].investmentObjective = accountData.InvestmentObjetive;
		jdata.accounts[0].investmentOther = accountData.InvestmentOther;
		//console.log("------------------------");                
		console.log("Individual has accounts data:for update");
		console.dir(jdata.accounts[0]);

Step ที่ 3 update ข้อมูล กลับ fundConnex ด้วย method PUT
================================================
async function updateIndividualProfile( jdata, callback ){
    try{
        isLogin();
        const URL = process.env['URL_CUST_INDIV_V4'];
        let cur_token = process.env['ROOT_TOKEN'];
        console.log("URL: "+URL);
        console.log("Token: "+cur_token);
        console.log("json data");
        console.dir(jdata);
        await axios({
			method: 'PUT',
            url: URL,      
            headers : {
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'x-auth-token': cur_token
            },
            data: jdata,
            responseType: 'json'  
		})
        .then(function (response) {
        return callback(response.status);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            return callback(error);
        });
        //return callback("finish job");
    } catch (error) {
        console.error(error);
    }            
   
}





Full Erro Detail ใน Step ที่ 3
=============================
response: {
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {
      server: 's',
      date: 'Mon, 11 Apr 2022 03:44:25 GMT',
      'content-type': 'application/json; charset=utf-8',
      'content-length': '66',
      connection: 'close',
      'x-powered-by': 'Express',
      'access-control-allow-origin': '*',
      'access-control-expose-headers': 'Content-disposition, Content-disposition',
      etag: 'W/"42-W0gVOjrcNRNuy5jFzeY0Vy21KYg"',
      vary: 'Accept-Encoding',
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'GET, POST, OPTIONS, PATCH, PUT',
      'access-control-allow-headers': 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,X-Auth-Token,Content-disposition'
    },
    
	//[Step ที่ 3]
	config: {
      url: 'https://www.fundconnext.com/api/customer/individual/v4',
      method: 'put',
      data: '{"identificationCardType":"CITIZEN_CARD","cardNumber":"1100900394924","cardExpiryDate":"20290114","accompanyingDocument":"CITIZEN_CARD","title":"MISS","enFirstName":"Nutchanok","enLastName":"Vongswat","thFirstName":"ณัฐ
ชนก","thLastName":"วงษ์สวัสดิ์","birthDate":"19880115","nationality":"TH","mobileNumber":"0877050944","email":"suvar
at@carabao.co.th","fax":"","maritalStatus":"Single","occupationId":40,"occupationOther":"","businessTypeId":180,"businessTypeOther":"เครื่องดื่ม","monthlyIncomeLevel":"LEVEL3","assetValue":null,"incomeSource":"SALARY","incomeSourceO
ther":"","identificationDocument":{"no":"98/2","floor":null,"building":"","roomNo":"","soi":"","road":"","moo":"2","subDistrict":"บางพลับ","district":"ปากเกร็ด","province":"นนทบุรี","postalCode":"11120","country":"TH"},"companyName"
:"บมจ.คาราบาวกรุ๊ป","current":{"no":"599/88","floor":null,"building":"","roomNo":"","soi":"","road":"พระราม 3","moo"
:"","subDistrict":"บางโพงพาง","district":"ยานนาวา","province":"กรุงเทพมหานคร","postalCode":"10120","country":"TH"},"
work":{"no":"393","floor":null,"building":"393 สีลม","roomNo":"","soi":"","road":"","moo":"","subDistrict":"สีลม","d
istrict":"บางรัก","province":"กรุงเทพมหานคร","postalCode":"10500","country":"TH"},"workPosition":"กรรมการบริหาร","re
latedPoliticalPerson":false,"politicalRelatedPersonPosition":"","canAcceptFxRisk":true,"canAcceptDerivativeInvestment":true,"suitabilityRiskLevel":"3","suitabilityEvaluationDate":"20211115","suitabilityForm":{"suitNo1":"1","suitNo2":"1","suitNo3":"1","suitNo4":"1","suitNo5":"1","suitNo6":"1","suitNo7":"1","suitNo8":"1","suitNo9":"1","suitNo10":"1","suitNo11":"1","suitNo12":"1"},"fatca":false,"fatcaDeclarationDate":"20211115","cddScore":null,"cddDate":"20211115","referralPerson":"","applicationDate":"20211115","incomeSourceCountry":"TH","acceptedBy":"","openFundConnextFormFlag":"N","accounts":[{"identificationCardType":"CITIZEN_CARD","cardNumber":"1100900394924","accountId":"1100900394924","icLicense":"005371","accountOpenDate":"20211116","investmentObjective":"Investment","investmentObjectiveOther":null,"approvedDate":"20220326","mailingAddressSameAsFlag":"Work","mailing":{"no":"599/88","floor":null,"building":null,"soi":null,"road":"พระราม 3","moo":null,"district":"ยานนาวา","province":"กรุงเทพมหานคร","postalCode":"10120","count
ry":"TH","roomNo":null,"subDistrict":"บางโพงพาง"},"subscriptionBankAccounts":[],"redemptionBankAccounts":[{"bankCode":"004","bankBranchCode":"0001","bankAccountNo":"0073695112","default":true}],"openOmnibusFormFlag":null,"mailingMethod":"Post","investmentOther":""}],"approvedDate":"20220321","openChannel":"2","investorClass":"","vulnerableFlag":false,"vulnerableDetail":"","ndidFlag":false,"ndidRequestId":"","investorType":"INDIVIDUAL"}',
      headers: [Object],
      transformRequest: [Array],
      transformResponse: [Array],
      timeout: 0,
      adapter: [Function: httpAdapter],
      responseType: 'json',
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
      maxBodyLength: -1,
      validateStatus: [Function: validateStatus],
      transitional: [Object]
    },
    request: <ref *1> ClientRequest {
      _events: [Object: null prototype],
      _eventsCount: 7,
      _maxListeners: undefined,
      outputData: [],
      outputSize: 0,
      writable: true,
      destroyed: false,
      _last: true,
      chunkedEncoding: false,
      shouldKeepAlive: false,
      maxRequestsOnConnectionReached: false,
      _defaultKeepAlive: true,
      useChunkedEncodingByDefault: true,
      sendDate: false,
      _removedConnection: false,
      _removedContLen: false,
      _removedTE: false,
      _contentLength: null,
      _hasBody: true,
      _trailer: '',
      finished: true,
      _headerSent: true,
      _closed: false,
      socket: [TLSSocket],
      _header: 'PUT /api/customer/individual/v4 HTTP/1.1\r\n' +
        'Accept: application/json, text/plain, */*\r\n' +
        'Content-Type: application/json\r\n' +
        'cache-control: no-cache\r\n' +
        'x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjEzMSwidXNlcm5hbWUiOiJBUElfV1IwMiIsInNlbGxpbmdBZ2VudElkIjoxNDEsInNlbGxpbmdBZ2VudENvZGUiOiJXUiIsImlzUGFzc3Rocm91Z2giOmZhbHNlLCJyb2xlcyI6WzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyXSwiaWF0IjoxNjQ5NjQ4NjU0LCJleHAiOjE2NDk2NTA0NTR9.SibdSdcKDODTRJEvAK_L0Ox5GT5h2vdTWXTb6EnQq50\r\n' +
        'User-Agent: axios/0.21.4\r\n' +
        'Content-Length: 3096\r\n' +
        'Host: www.fundconnext.com\r\n' +
        'Connection: close\r\n' +
        '\r\n',
      _keepAliveTimeout: 0,
      _onPendingData: [Function: nop],
      agent: [Agent],
      socketPath: undefined,
      method: 'PUT',
      maxHeaderSize: undefined,
      insecureHTTPParser: undefined,
      path: '/api/customer/individual/v4',
      _ended: true,
      res: [IncomingMessage],
      aborted: false,
      timeoutCb: null,
      upgradeOrConnect: false,
      parser: null,
      maxHeadersCount: null,
      reusedSocket: false,
      host: 'www.fundconnext.com',
      protocol: 'https:',
      _redirectable: [Writable],
      [Symbol(kCapture)]: false,
      [Symbol(kNeedDrain)]: false,
      [Symbol(corked)]: 0,
      [Symbol(kOutHeaders)]: [Object: null prototype]
    },
    data: { errMsg: [Object] }
  },
  isAxiosError: true,
  toJSON: [Function: toJSON]
}


