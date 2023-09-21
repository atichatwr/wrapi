import sql from  'mssql';
import {config}  from './dbconfig.js';



const poolPromise = new sql.ConnectionPool(config).connect().then(pool => {
    console.log('Connected to MSSQL')
    return pool
}).catch(err => console.log('Database Connection Failed! Bad Config: ', err));

export default poolPromise;
//module.exports = poolPromise;
