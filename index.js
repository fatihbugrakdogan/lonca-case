const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 5000;

// For json's act as a database a read function
function readDataFromFile(file_name) {
  const data = fs.readFileSync(`${file_name}.json`);
  return JSON.parse(data);
}

module.exports = readDataFromFile;

app.use(cors());

// API 

app.listen(port, () => {
  console.log(`Server ${port} portunda çxwalışıyor.`);
});


app.get('/vendor/orders', (req, res) => {
  try {
    // Get JSON's 
    const orders = readDataFromFile('orders');
    const products = readDataFromFile('parent_products');

    // Products for given Store
    let vendorProducts = [];
    for (let product of products) {
      if (product.vendor && product.vendor.$oid == req.query.vendorID) {
        vendorProducts.push(product._id.$oid);
      }
    }

    // Every Order From Given Store
    let newOrder = [];
    for (let order of orders) {
      if (order.cart_item) {
        for (let item_cart of order.cart_item) {
          if (
            item_cart.product &&
            vendorProducts.includes(item_cart.product.$oid)
          ) {
            item_cart['date'] = order.payment_at.$date.$numberLong;
            const name = products.filter(
              (product) => product._id.$oid == item_cart.product.$oid,
            );
            item_cart['product_name'] = name[0].name;
            newOrder.push(item_cart);
          }
        }
      }
    }

    res.json(newOrder);
  } catch (error) {
    console.error('Siparişler Oluşturulurken Hata Oluştu', error);
    res.status(500).json({ error: 'Siparişler Oluşturulurken Hata Oluştu' });
  }
});
