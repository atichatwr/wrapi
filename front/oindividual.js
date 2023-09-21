class Modelx {

  constructor(values) {
    this.values = values;
    //this.engine = config.engine;
  }

  toObj() {
    var data = {};
    for (var key in this.values) {
      if (this.values[key] instanceof Model) {
        data[key] = this.values[key].toObj();
      } else if (this.values[key] instanceof Array) {
        data[key] = this.values[key].map(x => x.toObj());
      } else {
        data[key] = this.values[key];
      }
    }
    return data;
  }
}

class IndividualCustomer{

    constructor( idBase ){       
        

        this.identificationCardType = idBase["identificationCardType"]; 
        this.cardNumber = idBase["cardNumber"]; 
        this.passportCountry = idBase["passportCountry"]; 
        this.cardExpiryDate = idBase["cardExpiryDate"]; 
        this.accompanyingDocument = idBase["accompanyingDocument"]; 
        this.title = idBase["title"]; 
        this.titleOther = idBase["titleOther"]; 
        this.enFirstName = idBase["enFirstName"]; 
        this.enLastName = idBase["enLastName"]; 
        this.thFirstName = idBase["thFirstName"]; 
        this.thLastName = idBase["thLastName"]; 
        this.birthDate = idBase["birthDate"]; 
        this.nationality = idBase["nationality"]; 
        this.mobileNumber = idBase["mobileNumber"]; 
        this.email = idBase["email"]; 
        this.fax = idBase["fax"]; 
        this.phone = idBase["phone"]; 
        this.maritalStatus = idBase["maritalStatus"]; 
        this.maritalStatus = idBase["maritalStatus"]; 
        this.occupationOther = idBase["occupationOther"]; 
        this.businessTypeId = idBase["businessTypeId"]; 
        this.businessTypeId = idBase["businessTypeId"]; 
        this.monthlyIncomeLevel = idBase["monthlyIncomeLevel"]; 
        this.assetValue = idBase["assetValue"]; 
        this.incomeSource = idBase["incomeSource"]; 
        this.incomeSource = idBase["incomeSource"]; 
        this.companyName = idBase["companyName"]; 
        this.workPosition = idBase["workPosition"]; 
        this.relatedPoliticalPerson = idBase["relatedPoliticalPerson"]; 
        this.relatedPoliticalPerson = idBase["relatedPoliticalPerson"]; 
        this.canAcceptFxRisk = idBase["canAcceptFxRisk"]; 
        this.canAcceptDerivativeInvestment = idBase["canAcceptDerivativeInvestment"]; 
        this.suitabilityRiskLevel = idBase["suitabilityRiskLevel"]; 
        this.suitabilityEvaluationDate = idBase["suitabilityEvaluationDate"]; 
        this.fatca = idBase["fatca"]; 
        this.fatcaDeclarationDate = idBase["fatcaDeclarationDate"]; 
        this.cddScore = idBase["cddScore"]; 
        this.cddDate = idBase["cddDate"]; 
        this.referralPerson = idBase["referralPerson"]; 
        this.applicationDate = idBase["applicationDate"]; 
        this.incomeSourceCountry = idBase["incomeSourceCountry"]; 
        this.acceptBy = idBase["acceptBy"]; 
        this.openFundConnextFormFlag = idBase["openFundConnextFormFlag"]; 
        this.approvedDate = idBase["approvedDate"]; 
        this.vulnerableFlag = idBase["vulnerableFlag"]; 
        this.vulnerableDetail = idBase["vulnerableDetail"]; 
        this.ndidFlag = idBase["ndidFlag"]; 
        this.ndidRequestI = idBase["ndidRequestI"]; 
        this.openChannel = idBase["openChannel"]; 
        this.investorClass = idBase["investorClass"]; 
        this.IdentificationDocument = idBase["identificationDocument"];
        this.current = idBase["current"];
        this.work = idBase["work"];
        this.SuitabilityForm = idBase["suitabilityForm"];
        this.incomeSourceOther = idBase["incomeSourceOther"]; 
        this.approved = idBase["approved"]; 
        
         

    }
   
    toJJ() {
      return {
        
        "identificationCardType" : this.identificationCardType,
        "cardNumber" : this.cardNumber, 
        "passportCountry" : this.passportCountry, 
        "cardExpiryDate" : this.cardExpiryDate, 
        "accompanyingDocument" : this.accompanyingDocument, 
        "title" : this.title, 
        "titleOther" : this.titleOther, 
        "enFirstName" : this.enFirstName, 
        "enLastName" : this.enLastName, 
        "thFirstName" : this.thFirstName, 
        "thLastName" : this.thLastName, 
        "birthDate" : this.birthDate, 
        "nationality" : this.nationality, 
        "mobileNumber" : this.mobileNumber, 
        "email" : this.email, 
        "fax" : this.fax, 
        "phone" : this.phone, 
        "maritalStatus" : this.maritalStatus, 
        "maritalStatus" : this.maritalStatus, 
        "occupationOther" : this.occupationOther, 
        "businessTypeId" : this.businessTypeId, 
        "businessTypeId" : this.businessTypeId, 
        "monthlyIncomeLevel" : this.monthlyIncomeLevel, 
        "assetValue" : this.assetValue, 
        "incomeSource" : this.incomeSource, 
        "incomeSource" : this.incomeSource, 
        "companyName" : this.companyName, 
        "workPosition" : this.workPosition, 
        "relatedPoliticalPerson" : this.relatedPoliticalPerson, 
        "relatedPoliticalPerson" : this.relatedPoliticalPerson, 
        "canAcceptFxRisk" : this.canAcceptFxRisk, 
        "canAcceptDerivativeInvestment" : this.canAcceptDerivativeInvestment, 
        "suitabilityRiskLevel" : this.suitabilityRiskLevel, 
        "suitabilityEvaluationDate" : this.suitabilityEvaluationDate, 
        "fatca" : this.fatca, 
        "fatcaDeclarationDate" : this.fatcaDeclarationDate, 
        "cddScore" : this.cddScore, 
        "cddDate" : this.cddDate, 
        "referralPerson" : this.referralPerson, 
        "applicationDate" : this.applicationDate, 
        "incomeSourceCountry" : this.incomeSourceCountry, 
        "acceptBy" : this.acceptBy, 
        "openFundConnextFormFlag" : this.openFundConnextFormFlag, 
        "approvedDate" : this.approvedDate, 
        "vulnerableFlag" : this.vulnerableFlag, 
        "vulnerableDetail" : this.vulnerableDetail, 
        "ndidFlag" : this.ndidFlag, 
        "ndidRequestI" : this.ndidRequestI, 
        "openChannel" : this.openChannel, 
        "investorClass" : this.investorClass,
        "incomeSourceOther" : this.incomeSourceOther, 
        "approved" : this.approved,
      };
    }
    
    
    toJSON() {
        
        console.log(this.length);
        if (this.length > 0) {
            const data = new Array(this.length);
            for (var i = 0; i < this.length; ++i)
              data[i] = this[i];
            return { type: 'Buffer', data };
          } else {

            return { type: 'Buffer', data: [] };
          }
        
      }

      toObj() {
        var data = {};
        for (var key in this.values) {
          if (this.values[key] instanceof Model) {
            data[key] = this.values[key].toObj();
            console.log("propertiy "+this.values[key]+" is model");
          } else if (this.values[key] instanceof Array) {
            data[key] = this.values[key].map(x => x.toObj());
            console.log("propertiy "+this.values[key]+" is araay");
          } else {
            data[key] = this.values[key];
            console.log("propertiy "+this.values[key]+" is nothing");
          }
        }
        return data;
      }
    
}

export { IndividualCustomer, Modelx } ;


