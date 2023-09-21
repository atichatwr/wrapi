USE [MFTS]
GO

/****** Object:  Table [dbo].[Fund_Cen_BankAccounts]    Script Date: 1/7/2022 8:30:14 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Fund_Cen_BankAccounts](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[cardNumber] [char](13) NULL,
	[accountId] [varchar](20) NULL,
	[type] [varchar](10) NULL,
	[bankCode] [varchar](10) NULL,
	[bankBranchCode] [varchar](10) NULL,
	[bankAccountNo] [varchar](20) NULL,
	[isDefault] [bit] NULL,
	[finnetCustomerNo] [varchar](30) NULL,
	[timestampx] [datetime] NOT NULL,
	[flx] [char](1) NULL,
 CONSTRAINT [PK_Fund_BankAccounts] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Fund_Cen_BankAccounts] ADD  CONSTRAINT [DF_Fund_Cen_BankAccounts_timestempx]  DEFAULT (getdate()) FOR [timestampx]
GO

CREATE NONCLUSTERED INDEX [NonClusteredIndex-20220107-202827] ON [dbo].[Fund_Cen_BankAccounts]
(
	[cardNumber] ASC,
	[accountId] ASC,
	[type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


CREATE TABLE [dbo].[Fund_Cen_Address](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[cardNumber] [char](13) NULL,
	[address_type] [varchar](40) NULL,
	[no] [varchar](20) NULL,
	[floor] [varchar](20) NULL,
	[building] [varchar](100) NULL,
	[roomNo] [varchar](20) NULL,
	[road] [varchar](100) NULL,
	[moo] [varchar](20) NULL,
	[subDistrict] [varchar](50) NULL,
	[district] [varchar](50) NULL,
	[province] [varchar](50) NULL,
	[postalCode] [varchar](10) NULL,
	[country] [varchar](10) NULL,
	[timestampx] [datetime] NOT NULL,
	[flx] [char](1) NULL,
 CONSTRAINT [PK_Fund_Cen_Address] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Fund_Cen_Address] ADD  CONSTRAINT [DF_Fund_Cen_add_timestempx]  DEFAULT (getdate()) FOR [timestampx]
GO

CREATE NONCLUSTERED INDEX [NonClusteredIndex-20220107-203703] ON [dbo].[Fund_Cen_Address]
(
	[cardNumber] ASC,
	[address_type] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Fund_Cen_Accounts](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[cardNumber] [char](13) NULL,
	[identificationCardType] [varchar](20) NULL,
	[accountId] [varchar](20) NULL,
	[icLicense] [varchar](50) NULL,
	[accountOpenDate] [varchar](20) NULL,
	[investmentObjective] [varchar](200) NULL,
	[investmentObjectiveOther] [varchar](200) NULL,
	[approvedDate] [varchar](20) NULL,
	[mailingAddressSameAsFlag] [varchar](20) NULL,
	[openOmnibusFormFlag] [bit] NULL,
	[mailingMethod] [varchar](20) NULL,
	[timestampx] [datetime] NOT NULL,
	[flx] [char](1) NULL,
 CONSTRAINT [PK_Fund_Accounts] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Fund_Cen_Accounts] ADD  CONSTRAINT [DF_Fund_Cen_Accounts_timestempx]  DEFAULT (getdate()) FOR [timestampx]
GO

CREATE NONCLUSTERED INDEX [NonClusteredIndex-20220107-204029] ON [dbo].[Fund_Cen_Accounts]
(
	[cardNumber] ASC,
	[accountId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Fund_Cen_Suitability](
	[cardNumber] [char](13) NOT NULL,
	[suitNo1] [varchar](10) NULL,
	[suitNo2] [varchar](10) NULL,
	[suitNo3] [varchar](10) NULL,
	[suitNo4] [varchar](20) NULL,
	[suitNo5] [varchar](10) NULL,
	[suitNo6] [varchar](10) NULL,
	[suitNo7] [varchar](10) NULL,
	[suitNo8] [varchar](10) NULL,
	[suitNo9] [varchar](10) NULL,
	[suitNo10] [varchar](10) NULL,
	[suitNo11] [varchar](10) NULL,
	[suitNo12] [varchar](10) NULL,
	[timestampx] [datetime] NOT NULL,
	[flx] [char](1) NULL,
 CONSTRAINT [PK_Fund_Suitabilit] PRIMARY KEY CLUSTERED 
(
	[cardNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Fund_Cen_Suitability] ADD  CONSTRAINT [DF_Fund_Cen_Suitabilit_timestempx]  DEFAULT (getdate()) FOR [timestampx]
GO

CREATE TABLE [dbo].[Fund_Cen_Individual](
	[cardNumber] [char](13) NOT NULL,
	[identificationCardType] [varchar](20) NULL,
	[cardExpiryDate] [varchar](20) NULL,
	[accompanyingDocument] [varchar](20) NULL,
	[title] [varchar](50) NULL,
	[enFirstName] [varchar](100) NULL,
	[enLastName] [varchar](100) NULL,
	[thFirstName] [varchar](100) NULL,
	[thLastName] [varchar](100) NULL,
	[birthDate] [varchar](10) NULL,
	[nationality] [varchar](10) NULL,
	[mobileNumber] [varchar](100) NULL,
	[email] [varchar](100) NULL,
	[fax] [varchar](100) NULL,
	[maritalStatus] [varchar](20) NULL,
	[sp_thFirstName] [varchar](100) NULL,
	[sp_thLastName] [varchar](100) NULL,
	[sp_enFirstName] [varchar](100) NULL,
	[sp_enLastName] [varchar](100) NULL,
	[occupationId] [int] NULL,
	[occupationOther] [varchar](200) NULL,
	[companyName] [varchar](200) NULL,
	[currentAddressSameAsFlag] [varchar](20) NULL,
	[businessTypeId] [int] NULL,
	[businessTypeOther] [varchar](200) NULL,
	[monthlyIncomeLevel] [varchar](10) NULL,
	[assetValue] [numeric](18, 2) NULL,
	[incomeSource] [varchar](200) NULL,
	[incomeSourceOther] [varchar](200) NULL,
	[workPosition] [varchar](100) NULL,
	[relatedPoliticalPerson] [bit] NULL,
	[politicalRelatedPersonPosition] [varchar](200) NULL,
	[canAcceptFxRisk] [bit] NULL,
	[canAcceptDerivativeInvestment] [bit] NULL,
	[suitabilityRiskLevel] [varchar](10) NULL,
	[suitabilityEvaluationDate] [varchar](20) NULL,
	[fatca] [bit] NULL,
	[fatcaDeclarationDate] [varchar](20) NULL,
	[cddScore] [varchar](10) NULL,
	[cddDate] [varchar](20) NULL,
	[referralPerson] [varchar](100) NULL,
	[applicationDate] [varchar](20) NULL,
	[incomeSourceCountry] [varchar](10) NULL,
	[acceptedBy] [varchar](100) NULL,
	[openFundConnextFormFlag] [varchar](10) NULL,
	[approvedDate] [varchar](20) NULL,
	[openChannel] [varchar](10) NULL,
	[investorClass] [varchar](10) NULL,
	[vulnerableFlag] [bit] NULL,
	[vulnerableDetail] [varchar](100) NULL,
	[ndidFlag] [bit] NULL,
	[ndidRequestId] [varchar](10) NULL,
	[timestampx] [datetime] NOT NULL,
	[flx] [char](1) NULL,
PRIMARY KEY CLUSTERED 
(
	[cardNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Fund_Cen_Individual] ADD  CONSTRAINT [DF_Fund_Cen_timestempx]  DEFAULT (getdate()) FOR [timestampx]
GO


