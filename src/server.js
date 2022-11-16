require("dotenv").config();
const express = require("express")
let axios = require("axios")
const app = express();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../secret/pengolin-0c25464fd62e.json')
const _ = require('lodash');


let options = {
    method: 'get',
    url: `https://${process.env.API_KEY}:${process.env.API_SECRET_KEY_WITH_TOKEN}@${process.env.STORE_NAME}/admin/api/${process.env.API_VERSION}/orders.json?status=any&created_at_min='.$01-09-2022.'T00:00:00+05:30&created_at_max='.$30-09-2022.'T23:59:59+05:30`
}

app.get('/check', async (req, res) => {
    let result = await axios(options)
    let data = result.data.orders
    let jsonToCsv = []

    let jsonData = () => {

        for (let item of data) {
            for (let i = 0; i < item.line_items.length; i++) {
                jsonToCsv.push(
                    {
                        "ID": item.name,
                        "Order Time (DD/MMM/YYYY)": item.processed_at,
                        "Customer Name": item.customer.default_address.name,
                        "Customer Email": item.customer.email,
                        "Currency": item.customer.currency,
                        "Price": item.line_items[i].price,
                        "Quantity": item.line_items[i].quantity,
                        "Item Name": item.line_items[i].title,
                        "Item SKU": item.line_items[i].sku,
                        "Variant Type": item.line_items[i].variant_title,
                        "Fulfillment Status": item.line_items[i].fulfillment_status ? item.fulfillment_status : 'unfulfilled',
                        "Payment Status": item.financial_status ? item.financial_status : "Pending",
                        "Cancelled": item.cancelled_at ? item.cancelled_at : null,
                        "City": item.customer.default_address.city,
                        "Fullfiment Date": item.updated_at,
                        // "Delivery Type": item.fulfillments ,
                        // "Delivered Date": item.fulfillments ,
                        "Fullfiment QTY": item.line_items[i].fulfillable_quantity,
                        "Remarks (Reason for cancellation/ delay)  ": item.cancel_reason,
                    }
                )
            }
        }

    }
    jsonData()
    const doc = new GoogleSpreadsheet('1UKHQJuZPgzWw6nhGn3p5XIw5aloQr1pVFnE1E46rW0c');
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    console.log(doc.title);


    await doc.updateProperties({ title: 'Pengolin Order Data' });
    const sheet = doc.sheetsByIndex[0];
    
    
    const HEADERS = ["ID",
        "Order Time (DD/MMM/YYYY)",
        "Customer Name",
        "Customer Email",
        "Currency",
        "Price",
        "Quantity",
        "Item Name",
        "Item SKU",
        "Variant Type",
        "Fulfillment Status",
        "Payment Status",
        "Cancelled",
        "City",
        "Fullfiment Date",
        "Delivery Type",
        "Delivered Date",
        "Fullfiment QTY",
        "Remarks (Reason for cancellation/ delay)"
    ]
    await sheet.setHeaderRow(HEADERS);
    
    
    const getRows = await sheet.getRows();
  
    let newData=[]



    // Google spreadsheet rows
    let spreadsheetRows = [];
    let alreadyExists = [];
    console.log( getRows.length );
    if(getRows.length > 0){
    for (let i = 0; i < getRows.length; i++) {
        let obj = {
            'ID': getRows[i].ID,
            'Item SKU': getRows[i]['Item SKU']
        };

        spreadsheetRows.push(obj);

        let findInCsv = _.find( jsonToCsv,  obj );
        if ( findInCsv ) {
            // this means we already found it
            alreadyExists[findInCsv];

            // Now update it accordingly
            getRows[i]["Payment Status"] = findInCsv["Payment Status"];

            // save the data
            await getRows[i].save();

            console.log('Found in CSV: ', findInCsv);
            
        } else {
            // not found
            newData.push(jsonToCsv[i]);
        }
    }
}else{
    await sheet.addRows(jsonToCsv)
}

    console.log(newData)
    await sheet.addRows(newData)



    let status = {
        success: 'ok', data: data
    }
    return res.send(status)
})




app.listen(process.env.PORT, function () {
    console.log('Express app running on port ' + (process.env.PORT))
});
