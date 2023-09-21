
import dotenv from 'dotenv';
dotenv.config();
export const config = {
    user: process.env.WDB_USER ,
    password: process.env.WDB_PASSWORD,
    server: process.env.WDB_SERVER,
    database: process.env.WDB_DATABASE,                                                                                                                                                                       
    connectionTimeout: 10 * 60 * 1000, // 10 minutes  
    options:{
      encrypt: false,
      encoding: 'UTF-8' 
      
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 36000
    }
}


const SALT_WORK_FACTOR = 10;
const TOKEN_SECRET_STRING = 'secret_this_should_be_longer'//process.env.JWT_KEY;
const TOKEN_EXPIRES = '1h';
const UTIL_PRIVATE_CODE ='winteriscomming!';

export {SALT_WORK_FACTOR, TOKEN_SECRET_STRING, TOKEN_EXPIRES, UTIL_PRIVATE_CODE  };




