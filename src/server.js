require("dotenv").config();
const express = require("express")
let axios = require("axios")
const app = express();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../secret/pengolin-0c25464fd62e.json')



let options = {
    method: 'get',
    url: `https://${process.env.API_KEY}:${process.env.API_SECRET_KEY_WITH_TOKEN}@${process.env.STORE_NAME}/admin/api/${process.env.API_VERSION}/orders.json?status=any&created_at_min='.$15-11-2022.'T00:00:00+05:30&created_at_max='.$15-11-2022.'T23:59:59+05:30`
}

app.get('/check', async (req, res) => {
    let result = await axios(options)
    let data = result.data.orders
    let jsonToCsv = []

    let jsonData = () => {

        for (let item of data) {
            jsonToCsv.push(
                {
                    "ID": item.name,
                    "Order Time (DD/MMM/YYYY)": item.processed_at,
                    "Customer Name": item.customer.default_address.name,
                    "Customer Email": item.customer.email,
                    "Currency": item.customer.currency,
                    "Price": item.current_total_discounts,
                    "Quantity": item.line_items[0].quantity,
                    "Item Name": item.line_items[0].title,
                    "Item SKU": item.line_items[0].sku,
                    "Variant Type": item.line_items[0].variant_title,
                    "Fulfillment Status": item.fulfillment_status ? item.fulfillment_status : null,
                    "Payment Status": item.financial_status ? item.financial_status : "Pending",
                    "Cancelled": item.cancelled_at ? item.cancelled_at : null,
                    "City": item.customer.default_address.city,
                    "Fullfiment Date": item.name,
                    "Delivery Type": item.delivery_category ? item.delivery_category : null,
                    "Delivered Date": item.delivery_category ? item.delivery_category : null,
                    "Fullfiment QTY": item.line_items[0].fulfillable_quantity,
                    "Remarks (Reason for cancellation/ delay)  ": item.cancel_reason,
                }
            )
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
    await sheet.addRows(jsonToCsv)
    let status = {
        success: 'ok'
    }
    return res.send(status)
})




app.listen(process.env.PORT, function () {
    console.log('Express app running on port ' + (process.env.PORT))
});
