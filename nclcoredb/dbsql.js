export const qrFundExc_Individual = ` SELECT Card_Number  AS cardNumber  FROM FundExc_Individual  ORDER BY Card_Number `;

export const qrFundExc_Account_CODE = ` SELECT 
Card_Number, 
Account_ID, 
IC_License, 
Account_Open_Date, 
Mailing_Address_Same_as_Flag, 
Mailing_Method, 
InvestmentObjetive, 
InvestmentOther, 
Omibus
FROM    FundExc_Account_CODE
WHERE   MARK = 'X'
ORDER BY Card_Number`;
//WHERE   (StatusFundConn IS NULL) OR StatusFundConn <> '200'
//WHERE   MARK = 'X'`;

//WHERE   (MARK IS NULL) `;
//export const qrAPIExcel = `SELECT Card_Number  AS cardNumber  FROM FundExc_Individual_FIX WHERE LoopAPI = 'X'`;
export const qrAPIExcel = `SELECT Card_Number  AS cardNumber  FROM FundExc_Individual_FIX WHERE StatusAPI = '422' ORDER BY Card_Number`;
//export const qrAPIExcel = `SELECT Card_Number  AS cardNumber  FROM FundExc_Individual_FIX  ORDER BY Card_Number`;


export const qrAPILoop = `SELECT Account_Info.Cust_Code  AS cardNumber  FROM Account_Info WHERE Account_Info.LoopApi = 'T'`  ;

export const qrAPILoopNull = `SELECT Account_Info.Cust_Code  AS cardNumber , Account_Info.StatusApi  FROM Account_Info WHERE Account_Info.LoopApi = 'T' AND StatusApi IS NULL`

export const excelIndividual4 = `
SELECT
[Identification_Card_Type]	AS identificationCardType , 
[Passport_Country]	AS passportCountry,
[Card_Number]	AS cardNumber,
[Card_Expiry_Date]	AS cardExpiryDate ,
[accompanyingDocument]	AS accompanyingDocument, 
[Title]	AS title, 
[Title_Other]	AS titleOther, 
[First_Name_En]	 AS enFirstName, 
[Last_Name_En]	AS enLastName, 
[First_Name_Th]	AS thFirstName, 
[Last_Name_Th]	AS thLastName, 
[Birth_Date]	AS birthDate, 
[Nationality]	AS nationality, 
[Mobile_Number]	AS mobileNumber,
[Email]	AS email, 
[phone]	AS phone, 
[fax]	AS fax, 
[Marital_Status]	AS maritalStatus, 
[Spouse_First_Name_TH]	AS sp_thFirstName,
[Spouse_Last_Name_TH]	AS sp_thLastName, 
[Spouse_First_Name_EN]	AS sp_enFirstName, 
[Spouse_Last_Name_EN]	AS sp_enLastName, 
[Occupation_ID]	AS occupationId, 
[Occupation_Other]	AS occupationOther, 
[Business_Type_ID]	AS businessTypeId, 
[Business_Type_Other]	AS businessTypeOther, 
[Monthly_Income_Level]	AS monthlyIncomeLevel, 
[assetValue]	AS assetValue, 
[Income_Source]	AS incomeSource, 
[Income_Source_Other]	AS incomeSourceOther, 
[IdDocument_Address_No]	AS noA,
[IdDocument_Address_Floor]	AS floorsA, 
[IdDocument_Address_Buliding]	AS buildingA, 
[IdDocument_Address_Room_No]	AS roomNoA, 
[IdDocument_Address_Soi]	AS soiA, 
[IdDocument_Address_Road]	AS roadA, 
[IdDocument_Address_Moo]	AS mooA, 
[IdDocument_Address_Sub_Dist]	AS subDistrictA, 
[IdDocument_Address_District]	AS districtA, 
[IdDocument_Address_Province]	AS provinceA, 
[IdDocument_Address_Postal_Code]	AS postalCodeA, 
[IdDocument_Address_Country]	AS countryA, 
[Current_Address_Same_AS_Flag]	AS currentAddressSameAsFlag, 
[Current_Address_No]	AS noB, 
[Current_Address_Floor]	AS floorsB, 
[Current_Address_Buliding]	AS buildingB, 
[Current_Address_Room_No]	AS rooNoB, 
[Current_Address_Soi]	AS soiB, 
[Current_Address_Road]	AS roadB, 
[Current_Address_Moo]	AS mooB, 
[Current_Address_Subdistrict]	AS subDistrictB, 
[Current_Address_District]	AS districtB, 
[Current_Address_Province]	AS provinceB, 
[Current_Address_Postal_Code]	AS postalCodeB, 
[Current_Address_Country]	AS countryB, 
[Company_name]	AS companyName, 
[Work_Address_No]	AS noC,
[Work_Address_Floor]	AS floorsC, 
[Work_Address_Buliding]	AS buildingC, 
[Work_Address_Room_No]	AS roomNoC, 
[Work_Address_Soi]	AS soiC, 
[Work_Address_Road]	AS roadC, 
[Work_Address_Moo]	AS mooC, 
[Work_Address_Sub_Dist]	 AS subDistrictC, 
[Work_Address_District]	AS districtC, 
[Work_Address_Province]	AS provinceC, 
[Work_Address_Postal_Code]	AS postalCodeC, 
[Work_Address_Country]	AS countryC, 
[workPosition]	AS workPosition, 
[Political_Related_Person]	AS relatedPoliticalPerson, 
[politicalRelatedPersonPosition]	AS politicalRelatedPersonPosition, 
[Can_Accept_FX_Risk]	AS canAcceptFxRisk, 
[Can_Accept_Derivative_Investment]	AS canAcceptDerivativeInvestment, 
[Risk_Level_Suitability]	AS suitabilityRiskLevel, 
[Suitability_Evaluation_Date]	AS suitabilityEvaluationDate, 
[FATCA]	AS fatca, 
[FATCA_Declaration_Date]	AS fatcaDeclarationDate, 
[CDD_Score]	AS cddScore, 
[CDD_Date]	AS cddDate, 
[Referal_Person]	AS referralPerson, 
[Application_Date]	AS applicationDate, 
[Income_Source_Country]	AS incomeSourceCountry, 
[Accept_By]	 AS acceptBy, 
[FundConnext_Flag]	AS openFundConnextFormFlag, 
[Vulnerable_Flag]	 AS vulnerableFlag, 
[vulnerableDetail]	AS vulnerableDetail, 
[NDID_Flag]	AS ndidFlag, 
[ndidRequestId]	AS ndidRequestId, 
[openChannel]	AS openChannel, 
[investorClass]	AS investorClass
FROM FundExc_Individual_FIX AS a
WHERE a.[Card_Number] = @input_cardNumber		
	  `;

export const excelIndividual = `
SELECT  
[Identification Card Type]	AS identificationCardType , 
''			                    AS passportCountry, 
[Card Number]				        AS cardNumber , 
[Card Expiry Date]			    AS cardExpiryDate, 
accompanyingDocument, 
Title                       AS title, 
[Title Other]				        AS titleOther, 
[First Name (En)]			      AS enFirstName, 
[Last Name (En)]			      AS enLastName, 
[First Name (Th)]			      AS thFirstName, 
[Last Name (Th)]			      AS thLastName, 
[Birth Date]				        AS birthDate, 
Nationality					        AS nationality, 
[Mobile Number]				      AS mobileNumber,	
Email						            AS email, 
phone						            AS phone, 
fax							            AS fax, 
[Marital Status]			      AS maritalStatus, 
[Spouse First Name TH]      AS sp_thFirstName,
[Spouse Last Name TH]       AS sp_thLastName,      
[Spouse First Name EN]      AS sp_enFirstName, 
[Spouse Last Name EN]       AS sp_enLastName, 
[Occupation ID]				      AS occupationId, 
[Occupation Other]			    AS occupationOther, 
[Business Type ID]			    AS businessTypeId, 
[Business Type Other]		    AS businessTypeOther, 
[Monthly Income Level]		  AS monthlyIncomeLevel, 
assetValue, 
[Income Source]				      AS incomeSource, 
[Income Source Other]		    AS incomeSourceOther, 
[IdDocument Address No]			AS noA,
[IdDocument Address Floor]		AS floorsA, 
[IdDocument Address Buliding]	AS buildingA, 
[IdDocument Address Room No]    AS roomNoA, 
[IdDocument Address Soi]		    AS soiA, 
[IdDocument Address Road]		    AS roadA, 
[IdDocument Address Moo]        AS mooA, 
[IdDocument Address Sub Dist]	  AS subDistrictA, 
[IdDocument Address District]   AS districtA, 
[IdDocument Address Province]	   AS provinceA, 
[IdDocument Address Postal Code] AS postalCodeA, 
[IdDocument Address Country]      AS countryA, 
[Current Address Same AS Flag]		AS currentAddressSameAsFlag, 
[Current Address No]			        AS noB, 
[Current Address Floor]			      AS floorsB, 
[Current Address Buliding]		    AS buildingB, 
[Current Address Room No]		      AS rooNoB, 
[Current Address Soi]			        AS soiB, 
[Current Address Road]			      AS roadB, 
[Current Address Moo]			        AS mooB, 
[Current Address Subdistrict]	    AS subDistrictB, 
[Current Address District]		    AS districtB, 
[Current Address Province]		    AS provinceB, 
[Current Address Postal Code]	    AS postalCodeB, 
[Current Address Country]		      AS countryB, 
[Company name]						        AS companyName, 
[Work Address No]				          AS noC,	
[Work Address Floor]			        AS floorsC, 
[Work Address Buliding]			      AS buildingC, 
[Work Address Room No]			      AS roomNoC, 
[Work Address Soi]				        AS soiC, 
[Work Address Road]				        AS roadC, 
[Work Address Moo]				        AS mooC, 
[Work Address Sub Dist]			      AS subDistrictC, 
[Work Address District]				        AS districtC, 
[Work Address Province]			      AS provinceC, 
[Work Address Postal Code]		    AS postalCodeC, 
[Work Address Country]			      AS countryC, 
workPosition, 
[Political Related Person]			  AS relatedPoliticalPerson, 
politicalRelatedPersonPosition, 
[Can Accept FX Risk]				      AS canAcceptFxRisk, 
[Can Accept Derivative Investment]	AS canAcceptDerivativeInvestment, 
[Risk Level (Suitability)]			  AS suitabilityRiskLevel, 
[Suitability Evaluation Date]		  AS suitabilityEvaluationDate, 
FATCA								              AS fatca, 
[FATCA Declaration Date]			    AS fatcaDeclarationDate, 
[CDD Score]							          AS cddScore, 
[CDD Date]							          AS cddDate, 
[Referal Person]					        AS referralPerson, 
[Application Date]					      AS applicationDate, 
[Income Source Country]				    AS incomeSourceCountry, 
[Accept By]							          AS acceptBy, 
[FundConnext Flag]					      AS openFundConnextFormFlag, 
[Vulnerable Flag]					        AS vulnerableFlag, 
vulnerableDetail, 
[NDID Flag]							          AS ndidFlag, 
ndidRequestId, 
openChannel, 
investorClass
FROM  FundExc_Individual AS a
WHERE a.[Card Number] = @input_cardNumber
`;


export const expIndevidual = `
SELECT 
null AS Identification Card Type,
null AS Passport Country,
null AS Card Number,
null AS Card Expiry Date,
null AS accompanyingDocument,
null AS Title,
null AS Title Other,
null AS First Name (En),
null AS Last Name (En),
null AS First Name (Th),
null AS Last Name (Th),
null AS Birth Date,
null AS Nationality,
null AS Mobile Number,
null AS Email,
null AS phone,
null AS fax,
null AS Marital Status
null AS Spouse First Name TH
null AS Spouse Last Name TH
null AS Spouse First Name EN
null AS Spouse Last Name EN
null AS Occupation ID
null AS Occupation Other
null AS Business Type ID
null AS Business Type Other
null AS Monthly Income Level
null AS assetValue
null AS Income Source
null AS Income Source Other
null AS IdDocument Address No
null AS IdDocument Address Floor
null AS IdDocument Address Buliding
null AS IdDocument Address Room No
null AS IdDocument Address Soi
null AS IdDocument Address Road
null AS IdDocument Address Moo
null AS IdDocument Address Sub Dist
null AS IdDocument Address District
null AS IdDocument Address Province
null AS IdDocument Address Postal Code
null AS IdDocument Address Country
null AS Current Address Same as Flag
null AS Current  Address No
null AS Current Address Floor
null AS Current Address Buliding
null AS Current Address Room No
null AS Current Address Soi
null AS Current Address Road
null AS Current Address Moo
null AS Current Address Subdistrict
null AS Current Address District
null AS Current Address Province
null AS Current Address Postal Code
null AS Current Address Country
null AS Company name
null AS Work Address No
null AS Work Address Floor
null AS Work Address Buliding
null AS Work Address Room No
null AS Work Address Soi
null AS Work Address Road
null AS Work Address Moo
null AS Work Address Sub Dist
null AS Work Address District
null AS Work Address Province
null AS Work Address Postal Code
null AS Work Address Country
null AS workPosition
null AS Political Related Person
null AS politicalRelatedPersonPosition
null AS Can Accept FX Risk
null AS Can Accept Derivative Investment
null AS Risk Level (Suitability)
null AS Suitability Evaluation Date
null AS FATCA
null AS FATCA Declaration Date
null AS CDD Score
null AS CDD Date
null AS Referal Person
null AS Application Date
null AS Income Source Country
null AS Accept By
null AS FundConnext Flag
null AS Vulnerable Flag 
null AS vulnerableDetail
null AS NDID Flag
null AS ndidRequestId
null AS openChannel
null AS investorClass
FROM Account_Info AS a
WHERE a.Cust_Code = @input_cardNumber
`;


export const qrIndividualFix = `
SELECT TOP 1
a.Card_Type    AS identificationCardType ,
null           AS passportCountry,
a.Cust_Code    AS cardNumber,
convert(varchar,a.DateExp,112)   AS cardExpiryDate,
a.group_code   AS accompanyingDocument,
null           AS title,
null           AS titleOther,
c.Title_Name   AS titlex,
c.Title_fund   AS titlexOther,
a.First_Name_E AS enFirstName,
a.Last_Name_E  AS enLastName,
a.First_Name_T AS thFirstName,
a.Last_Name_T  AS thLastName,
convert(varchar,a.Birth_Day,112)  AS birthDate,
null           AS nationality,
a.Mobile       AS mobileNumber,
a.Email        AS email,  
null		       AS fax,
null		       AS phone,
a.maritalStatus       AS maritalStatus,
a.Occupation          AS occupationId,
null                  AS occupationOther,
d.DescirbFundID       AS occupationIdx,
d.Describe			  AS occupationOtherx,
f.Fundcon_ID      AS businessTypeId,
null                  AS businessTypeOther,
f.Code				  AS businessTypeIdx,
f.Fundcon_ID		  AS businessType_Descx,
f.Describe			  AS businessTypeName,
a.SalaryPerMonth      AS monthlyIncomeLevel,
g.CondFund            AS monthlyIncomeLevelx,
null                  AS assetValue,
a.ObjectInvetMent     AS incomeSource,
e.CodeFund	          AS incomeSourcex,
null                  AS incomeSourceOther,
null                  AS currentAddressSameAsFlag,
a.Company             AS companyName,
null                  AS workPosition,
null                  AS relatedPoliticalPerson,
null                  AS politicalRelatedPersonPosition,
null                  AS canAcceptFxRisk,
a.SalaryPerMonth      AS canAcceptDerivativeInvestment,
a.Risktype            AS suitabilityRiskLevel,
convert(varchar,a.Modify_Date,112)      AS suitabilityEvaluationDate,
null                  AS fatca,
convert(varchar,a.Modify_Date,112)      AS fatcaDeclarationDate,
null                  AS cddScore,
null                  AS cddDate, --convert(varchar,a.Modify_Date,112)
null                  AS referralPerson,
convert(varchar,a.Modify_Date,112)      AS applicationDate,
null                  AS incomeSourceCountry,
null                  AS acceptBy,
null                  AS openFundConnextFormFlag,
convert(varchar,a.Modify_Date,112)      AS approvedDate,
dbo.FindAge(a.Birth_Day)  AS currentAge,
null	                  AS vulnerableFlag,  
null                  AS vulnerableDetail,
null                  AS ndidFlag,
null                  AS ndidRequest,
null                  AS openChannel,
null                  AS investorClass

FROM Account_Info AS a 
INNER JOIN  REF_Title_Thais AS c ON c.Title_Name = a.Title_Name_T
INNER JOIN  REF_Occupation  AS d ON d.Code = a.Occupation
INNER JOIN  REF_Income2Source AS e ON e.CodeNew = a.ObjectInvetMent
INNER JOIN  REF_Business_Type AS f ON f.Code = a.TypeBusiness1
INNER JOIN  REF_IncomeFamily AS g ON g.Code = a.SalaryPerMonth
WHERE a.Cust_Code = @input_cardNumber  
`;

export const qrIndividualAddress = `
SELECT                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
b.Addr_No		AS no,
b.addr_no		AS roomNo,
b.place		  AS floors,
b.place2		AS building,
b.road		  AS soi,
b.road2		  AS road,
b.MooNo     AS moo,
b.Zip_Code  AS postalCode,
p.Name_Thai  AS subDistrict, 
y.Name_Thai  AS district,
x.Name_Thai  AS province,
z.Name_Thai  AS country

FROM Account_Info AS a  
 INNER JOIN  Account_address AS b ON b.Cust_Code = a.Cust_Code
 INNER JOIN  REF_Tambons AS p ON p.Tambon_Id = b.Tambon_Id
 INNER JOIN  REF_Amphurs AS y ON y.Amphur_Id = b.Amphur_Id
 INNER JOIN  REF_Provinces AS x ON x.Province_ID = b.Province_ID
 INNER JOIN  REF_Countrys AS z ON z.Country_id = b.Country_id
 WHERE a.cust_Code = @input_cardNumber 
`;

export const qrSuitability = `
SELECT       dbo.MFTS_Suit_Question_Choice.Score AS suitNo
FROM         dbo.V_GROUB_SUIT INNER JOIN
                      dbo.MFTS_Suit_Detail ON dbo.V_GROUB_SUIT.Suit_Id = dbo.MFTS_Suit_Detail.Suit_Id INNER JOIN
                      dbo.MFTS_Suit_Question ON dbo.MFTS_Suit_Detail.QId = dbo.MFTS_Suit_Question.QId INNER JOIN
                      dbo.MFTS_Suit_Question_Choice ON dbo.MFTS_Suit_Question.QId = dbo.MFTS_Suit_Question_Choice.QId AND dbo.MFTS_Suit_Detail.CId = dbo.MFTS_Suit_Question_Choice.CId
WHERE     (dbo.V_GROUB_SUIT.Account_No = @input_cardNumber )
 `;

export const qrBankAccount = `
SELECT TOP (1) 
  a.Cust_Code, 
  a.MktId, 
  a.Bank_Id, 
  a.Bank_Branch, 
  a.Bank_Account, 
  a.Bank_IdReturn, 
  a.Bank_BranchReturn, 
  a.Bank_AccountReturn, 
  convert(varchar,a.Create_Date,112) AS CreateDate, 
 	a.My_wife, 
  a.Wife_English, 
  a.Id_My_wife, 
  a.My_wife_birthday
 FROM  Account_Info AS a 
 WHERE        (a.Cust_Code = @input_cardNumber )
`;


 export const qrBankAccountFIX = `
 SELECT TOP (1) a.Cust_Code, 
        a.MktId, 
        a.Bank_Id, 
        a.Bank_Branch, 
        a.Bank_Account, 
        a.Bank_IdReturn, 
        a.Bank_BranchReturn, 
        a.Bank_AccountReturn, 
        convert(varchar,a.Create_Date,112) AS CreateDate, 
        b.License_Code  AS LicenseCode,
        c.DescriptionFund AS investmentObjective 
 FROM  Account_Info AS a 
 INNER JOIN MFTS_SalesCode    AS b ON a.MktId = b.Id
 INNER JOIN REF_InvestmentObj AS c ON a.ObjectInvetMent = c.code
 WHERE (a.Cust_Code = @input_cardNumber )
 `;
 
 export const qrBankAccountHeader = `
 SELECT TOP (1) a.Cust_Code, 
        a.MktId,  
        convert(varchar,a.Create_Date,112) AS CreateDate, 
        b.License_Code  AS LicenseCode,
        c.DescriptionFund AS investmentObjective 
 FROM  Account_Info AS a 
 INNER JOIN MFTS_SalesCode    AS b ON a.MktId = b.Id
 INNER JOIN REF_InvestmentObj AS c ON a.ObjectInvetMent = c.code
 WHERE (a.Cust_Code = @input_cardNumber )
 `;





 export const qrBankAccountItems = `
 SELECT  Cust_Code, 
		Purpose, 
		bankaccountindex, 
		Bank_Id, 
		Bank_Branch, 
		Bank_Account, 
		Is_Default_Account
FROM    FundConnex_BankAccount_Excel20
WHERE   (Cust_Code = @input_cardNumber)
ORDER BY Purpose DESC, bankaccountindex
 
`;
 
 export const AccountObjHeader = `
 {


  "identificationCardType" : "CITIZEN_CARD",
  "passportCountry" : "",
  "cardNumber" : "",
  "accountId" : "",
  "icLicense" : "",
  "accountOpenDate" : "",
  "mailingAddressSameAsFlag" : "IdDocument",
  "mailing" : "",
  "mailingMethod" : "Email",
  "investmentObjective" : "Investment,RetirementInvestment,ForTaxBenefits",
  "investmentObjectiveOther" : "",
  "approved": true,
  "openOmnibusFormFlag": false
  
}
 `;

 export const AccountObjItems = `
 {
  "bankCode": null,
  "bankBranchCode": null,
  "bankAccountNo": null,
  "default": false,
  "finnetCustomerNo": false
}
 `;

 export const AccountObj = `
 {
    "identificationCardType" : "CITIZEN_CARD",
    "passportCountry" : "",
    "cardNumber" : "",
    "accountId" : "",
    "icLicense" : "",
    "accountOpenDate" : "",
    "mailingAddressSameAsFlag" : "IdDocument",
    "mailing" : "",
    "mailingMethod" : "Email",
    "investmentObjective" : "Investment,RetirementInvestment,ForTaxBenefits",
    "investmentObjectiveOther" : "",
    "redemptionBankAccounts" : [
        {
          "bankCode": null,
          "bankBranchCode": null,
          "bankAccountNo": null,
          "default": true,
          "finnetCustomerNo": null
        }
      ],
    "subscriptionBankAccounts" : [
        {
          "bankCode": null,
          "bankBranchCode": null,
          "bankAccountNo": null,
          "default": true,
          "finnetCustomerNo": null
        }
      ],
    "approved": true,
    "openOmnibusFormFlag": false
    
 }
 `;
 

 export const AddressObj = `
 {
  "no": "",
  "roomNo": "",
  "floors": "",
  "building": "",
  "soi": "",
  "road": "",
  "moo": "",
  "postalCode": "",
  "subDistrict": "",
  "district": "",
  "province": "",
  "country": "TH"
}
 `;

 export const spouseObj = `
 {
  "thFirstName": "",
  "thLastName": "",
  "enFirstName": "",
  "enLastName": ""
}`;

export const insertFund_Cen_Suitibility = `
INSERT INTO Fund_Cen_Suitability (
  cardNumber,
  suitNo1,
  suitNo2,
  suitNo3,
  suitNo4,
  suitNo5,
  suitNo6,
  suitNo7,
  suitNo8,
  suitNo9,
  suitNo10,



  
  suitNo11,
  suitNo12
) VALUES (
  @icardNumber,
  @isuitNo1,
  @isuitNo2,
  @isuitNo3,
  @isuitNo4,
  @isuitNo5,
  @isuitNo6,
  @isuitNo7,
  @isuitNo8,
  @isuitNo9,
  @isuitNo10,
  @isuitNo11,
  @isuitNo12
)
`;

export const insertFund_Cen_Accounts = `
INSERT INTO Fund_Cen_Accounts (
  cardNumber,
  accountId,
  identificationCardType,
  icLicense,
  accountOpenDate,
  investmentObjective,
  investmentObjectiveOther,
  approvedDate,
  mailingAddressSameAsFlag,
  openOmnibusFormFlag,
  mailingMethod
) VALUES (
  @icardNumber,
  @iaccountId,
  @iidentificationCardType,
  @iicLicense,
  @iaccountOpenDate,
  @iinvestmentObjective,
  @iinvestmentObjectiveOther,
  @iapprovedDate,
  @imailingAddressSameAsFlag,
  @iopenOmnibusFormFlag,
  @imailingMethod
)
`;

export const insertFund_Cen_BankAccounts = `
INSERT INTO Fund_Cen_BankAccounts (
  cardNumber,
  accountId,
  bankCode,
  bankBranchCode,
  bankAccountNo,
  isDefault,
  type,
  finnetCustomerNo
) VALUES (
  @icardNumber,
  @iaccountId,
  @ibankCode,
  @ibankBranchCode,
  @ibankAccountNo,
  @idefault,
  @itype,
  @ifinnetCustomerNo
)
`;

export const insertFund_Cen_Address = `
INSERT INTO Fund_Cen_Address (
  cardNumber,
	address_type,
	no,
	floor,
	building,
	roomNo,
	road,
	moo,
	subDistrict,
	district,
	province,
	postalCode,
	country
) VALUES (
  @icardNumber,
	@iaddress_type,
	@ino,
	@ifloor,
	@ibuilding,
	@iroomNo,
	@iroad,
	@imoo,
	@isubDistrict,
	@idistrict,
	@iprovince,
	@ipostalCode,
	@icountry
)
`;

export const insertFund_Cen_Individual = `
INSERT INTO Fund_Cen_Individual (
  cardNumber ,
  identificationCardType,
	cardExpiryDate,
	accompanyingDocument,
	title ,
	enFirstName,
	enLastName,
	thFirstName ,
	thLastName,
	birthDate,
	nationality,
	mobileNumber ,
	email,
	fax,
	maritalStatus,
	sp_thFirstName , 
	sp_thLastName, 
	sp_enFirstName ,
	sp_enLastName,
	occupationId , 
	occupationOther, 
	companyName, 
	currentAddressSameAsFlag,
	businessTypeId,
	businessTypeOther , 
	monthlyIncomeLevel ,
	assetValue ,  
	incomeSource ,  
	incomeSourceOther,
	workPosition , 
	relatedPoliticalPerson, 
	politicalRelatedPersonPosition ,
	canAcceptFxRisk, 
	canAcceptDerivativeInvestment,
	suitabilityRiskLevel , 
	suitabilityEvaluationDate, 
	fatca ,  
	fatcaDeclarationDate, 
	cddScore, 
	cddDate , 
	referralPerson , 
	applicationDate ,  
	incomeSourceCountry ,
	acceptedBy ,  
	openFundConnextFormFlag , 
	approvedDate ,   
	openChannel ,   
	investorClass ,   
	vulnerableFlag ,   
	vulnerableDetail ,  
	ndidFlag ,   
	ndidRequestId )
VALUES(
  @icardNumber ,
  @iidentificationCardType,
	@icardExpiryDate,
	@iaccompanyingDocument,
	@ititle ,
	@ienFirstName,
	@ienLastName,
	@ithFirstName ,
	@ithLastName,
	@ibirthDate,
	@inationality,
	@imobileNumber ,
	@iemail,
	@ifax,
	@imaritalStatus,
	@isp_thFirstName , 
	@isp_thLastName, 
	@isp_enFirstName ,
	@isp_enLastName,
	@ioccupationId , 
	@ioccupationOther, 
	@icompanyName, 
	@icurrentAddressSameAsFlag,
	@ibusinessTypeId,
	@ibusinessTypeOther , 
	@imonthlyIncomeLevel ,
	@iassetValue ,  
	@iincomeSource ,  
	@iincomeSourceOther,
	@iworkPosition , 
	@irelatedPoliticalPerson, 
	@ipoliticalRelatedPersonPosition ,
	@icanAcceptFxRisk, 
	@icanAcceptDerivativeInvestment,
	@isuitabilityRiskLevel , 
	@isuitabilityEvaluationDate, 
	@ifatca ,  
	@ifatcaDeclarationDate, 
	@icddScore, 
	@icddDate , 
	@ireferralPerson , 
	@iapplicationDate ,  
	@iincomeSourceCountry ,
	@iacceptedBy ,  
	@iopenFundConnextFormFlag , 
	@iapprovedDate ,   
	@iopenChannel ,   
	@iinvestorClass ,   
	@ivulnerableFlag ,   
	@ivulnerableDetail ,  
	@indidFlag ,   
	@indidRequestId )
`;

export const updateFund_Cen_Individual = `
UPDATE Fund_Cen_Individual SET
  timestampx = @idate ,
  identificationCardType = @iidentificationCardType,
  cardExpiryDate = @icardExpiryDate,
	accompanyingDocument = @iaccompanyingDocument,
	title = @ititle ,
	enFirstName = @ienFirstName,
	enLastName = @ienLastName,
	thFirstName = @ithFirstName ,
	thLastName = @ithLastName,
	birthDate = @ibirthDate,
	nationality = @inationality,
	mobileNumber = @imobileNumber ,
	email = @iemail,
	fax = @ifax,
	maritalStatus = @imaritalStatus,
	sp_thFirstName = @isp_thFirstName , 
	sp_thLastName = @isp_thLastName, 
	sp_enFirstName = @isp_enFirstName ,
	sp_enLastName = @isp_enLastName,
	occupationId = @ioccupationId , 
	occupationOther = @ioccupationOther, 
	companyName = @icompanyName, 
	currentAddressSameAsFlag = @icurrentAddressSameAsFlag,
	businessTypeId = @ibusinessTypeId,
	businessTypeOther = @ibusinessTypeOther , 
	monthlyIncomeLevel = @imonthlyIncomeLevel ,
	assetValue = @iassetValue ,  
	incomeSource = @iincomeSource ,  
	incomeSourceOther = @iincomeSourceOther,
	workPosition = @iworkPosition , 
	relatedPoliticalPerson = @irelatedPoliticalPerson, 
	politicalRelatedPersonPosition = @ipoliticalRelatedPersonPosition ,
	canAcceptFxRisk = @icanAcceptFxRisk, 
	canAcceptDerivativeInvestment = @icanAcceptDerivativeInvestment,
	suitabilityRiskLevel = @isuitabilityRiskLevel , 
	suitabilityEvaluationDate = @isuitabilityEvaluationDate, 
	fatca = @ifatca ,  
	fatcaDeclarationDate = @ifatcaDeclarationDate, 
	cddScore = @icddScore, 
	cddDate = @icddDate , 
	referralPerson = @ireferralPerson , 
	applicationDate = @iapplicationDate ,  
	incomeSourceCountry = @iincomeSourceCountry ,
	acceptedBy = @iacceptedBy ,  
	openFundConnextFormFlag = @iopenFundConnextFormFlag , 
	approvedDate = @iapprovedDate ,   
	openChannel = @iopenChannel ,   
	investorClass = @iinvestorClass ,   
	vulnerableFlag = @ivulnerableFlag ,   
	vulnerableDetail = @ivulnerableDetail ,  
	ndidFlag = @indidFlag ,   
	ndidRequestId = @indidRequestId    
WHERE Fund_Cen_Individual.cardNumber = @icardNumber 
`;

export const InsertMFTS_TRANSACTION =`
insert INTO MFTS_Transaction(
	Tran_No
	,Ref_No
	,TranType_Code
	,Fund_Id
	,Tran_Date
  ,Status_Id
  ,Source_Flag
   ,Amount_Baht
   ,Amount_Unit
   ,APIstatus
   ,NAV_PRICE
   ,ExecuteDate
   ,Act_ExecDate
   ,Seq_No
   ,Mktid
   ,Create_by
   ,Create_date
   ,Unit_Balance
   ,AVG_Cost
   ,Total_Cost
   ,Modify_By
   ,FeeRate_Group
   ,Modify_Date
   ,RGL
   ,FUNDCODEI
   ,UNITHOLDERI
   ,IDACCOUNTI,
   AMCCODEI,
   TranSaction_Date,
   TRANTYPECODEX,
   TranTypeFLAG,
   CustomerInput)
VALUES(
	@Tran_No
	,@Ref_No
	,@TranType_Code
	,@Fund_Id
	,@Tran_Date
  	,@Status_Id
   ,@Source_Flag
   ,@Amount_Baht
   ,@Amount_Unit
   ,@APIstatus
   ,@NAV_PRICE
   ,@ExecuteDate
   ,@Act_ExecDate
   ,@Seq_No
   ,@Mktid
   ,@Create_by
   ,@Create_date
   ,@Unit_Balance
   ,@AVG_Cost
   ,@Total_Cost
   ,@Modify_By
   ,@FeeRate_Group
   ,@Modify_Date
   ,@RGL
   ,@FUNDCODEI
   ,@UNITHOLDERI
   ,@IDACCOUNTI
   ,@AMCCODEI
   ,@TranSaction_Date
   ,@TRANTYPECODEX
   ,@TranTypeFLAG
   ,@CustomerInput)`;

   export const update_MFTS_TRANSACTION =`
    UPDATE MFTS_Transaction
    SET APIstatus        =@APIstatus,
       RGL              =@RGL,
       Amount_Unit      =@Amount_Unit,
       Amount_Baht      =@Amount_Baht,
       Unit_balance     =@Unit_balance,
       NAV_PRICE        =@NAV_PRICE,
       Status_Id        =@Status_Id,
       Modify_Date      =@Modify_Date
    WHERE MFTS_Transaction.FUNDCODEI =@FUNDCODEI  AND UNITHOLDERI  =@UNITHOLDERI  
   `;

   export const Insert_MFTS_SUIT =`insert INTO MFTS_Suit
                                    (
                                      Account_No
                                      ,Document_Date
                                      ,Series_Id
                                      ,Score
                                      ,Risk_Level
                                      ,Risk_Level_Desc
                                      ,File_Path
                                      ,Active_Flag
                                      ,Create_By
                                      ,Create_Date
                                      ,Modify_By
                                      ,Modify_Date)
                                    VALUES( 
                                      @Account_No
                                      ,@Document_Date
                                      ,@Series_Id
                                      ,@Score
                                      ,@Risk_Level
                                      ,@Risk_Level_Desc
                                      ,@File_Path
                                      ,@Active_Flag
                                      ,@Create_By
                                      ,@Create_Date
                                      ,@Modify_By
                                      ,@Modify_Date
                                    )`
export const Update_MFTS_SUIT =` UPDATE MFTS_Suit
                                  Score = @Score
                                  ,Risk_Level = @Risk_Level
                                  ,Risk_Level_Desc = @Risk_Level_Desc
                                  ,Modify_By = @Modify_By
                                  ,Modify_Date = @Modify_Date
                                  WHERE  Suit_Id= @Suit_Id`
export const Update_MFTS_FUND =`UPDATE MFTS_Fund
                                SET APIstatus = @APIstatus
                                    ,Start_Date = @Start_Date
                                    ,Modify_By = @Modify_By
                                    ,Modify_Date = @Modify_Date
                                WHERE MFTS_Fund.Fund_Code =@Fund_Code and Amc_Id =@Amc_Id`

export const  Insert_MFTS_FUND = `insert INTO MFTS_Fund ( Fund_Id
                                  ,Amc_Id
                                  ,Fund_Code
                                  ,Thai_Name	
                                  ,Eng_Name
                                  ,Fund_Type
                                  ,Start_Date
                                  ,Create_By
                                  ,Create_Date
                                  ,Modify_By
                                  ,Modify_Date
                                  ,Cutoff_Buy
                                  ,Cutoff_Sell
                                  ,Cutoff_SwitchOut
                                  ,Cutoff_SwitchIn
                                  ,Cutoff_Transfer
                                  ,APIstatus
                                  ,FGroup_Code
                                  ,FundRisk
                                  ,amccodex 
                                  ,End_Date_Flag  
                                  ,Settlement_Code 
                                  ,NavPeriod_Id )
                                  VALUES( @Fund_Id
                                  ,@Amc_Id
                                  ,@Fund_Code
                                  ,@Thai_Name	
                                  ,@Eng_Name
                                  ,@Fund_Type
                                  ,@Start_Date
                                  ,@Create_By
                                  ,@Create_Date
                                  ,@Modify_By
                                  ,@Modify_Date
                                  ,@Cutoff_Buy
                                  ,@Cutoff_Sell
                                  ,@Cutoff_SwitchOut
                                  ,@Cutoff_SwitchIn
                                  ,@Cutoff_Transfer
                                  ,@APIstatus
                                  ,@FGroup_Code
                                  ,@FundRisk
                                  ,@amccodex 
                                  ,@End_Date_Flag  
                                  ,@Settlement_Code 
                                  ,@NavPeriod_Id )`