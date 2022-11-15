require("dotenv").config();
const express = require("express")
const bodyParser = require('body-parser');
let axios = require("axios")
const app = express();
const { Parser } = require('json2csv')
const fs = require('fs')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// console.log(process.env.API_KEY)

let options = {
    method: 'get',
    url: `https://${process.env.API_KEY}:${process.env.API_SECRET_KEY_WITH_TOKEN}@${process.env.STORE_NAME}/admin/api/${process.env.API_VERSION}/orders.json?status=any&created_at_min='.$01-11-2022.'T00:00:00+05:30&created_at_max='.$14-11-2022.'T23:59:59+05:30`
  

}
let result
let data


app.get('/check', async (req, res) => {
    result = await axios(options)
     data = result.data.orders

   
     const  parserObj = new Parser();
     const csv = parserObj.parse(data)
     
     fs.writeFileSync('./data2.csv',csv)

    return res.send(data) 

})    





app.listen(process.env.PORT, function () {
    console.log('Express app running on port ' + (process.env.PORT))
});
