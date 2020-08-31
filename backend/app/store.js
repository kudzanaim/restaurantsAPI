const axios = require('axios');

const DB = {
    get: async()=>{
        const data = await axios.get(`https://serverless-33cc5.firebaseio.com/.json`).then(response => response).catch(error => error);
        
        return data.data
    },
    update: async function(data){
        await axios.put(`https://serverless-33cc5.firebaseio.com/.json`, data);
        return {status:'sucess'}
    }
};

module.exports = DB;