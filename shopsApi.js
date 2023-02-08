let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH,DELETE,HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
var port = process.env.PORT||2410;
app.listen(port, () => console.log(`Node app listening on port jai~ ${port}!`));
const { data} = require("./shopsData");
let fs = require("fs");
const { json } = require("express");
let fname="shops.json";
app.get("/resetData",function(req,res){
    let dataShop=JSON.stringify(data);
    fs.writeFile(fname, dataShop, function (err) {
        if (err) res.status(404).send(err);
        else res.send("Data in file is reset");
      });
})
app.get("/shops", function (req, res) {
    fs.readFile(fname, "utf-8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
          let data2 = JSON.parse(data);
        //   console.log(data2.shops);
          res.send(data2.shops);
        }
      });
});
app.post("/shops", function (req, res) {
    let body = req.body;
    fs.readFile(fname, "utf-8", function (err, data) {
      if (err) res.status(404).send(err);
      else {
        let data2 = JSON.parse(data);
        let maxid = data2.shops.reduce(
          (acc, curr) => (acc > curr.shopid ? acc : curr.shopid),
          0
        );
        console.log(maxid);
        let newid = maxid + 1;
        let newshops = { ...body, id: newid };
        data2.shops.push(newshops);
        let data1 = JSON.stringify(data2);
        fs.writeFile(fname, data1, function (err) {
          if (err) res.status(404).send(err);
          else {
            res.send(newshops);
          }
        });
      }
    });
});
app.get("/products", function (req, res) {
    fs.readFile(fname, "utf-8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
          let data2 = JSON.parse(data);
        //   console.log(data2.shops);
          res.send(data2.products);
        }
      });
});
app.get("/products/:id", function (req, res) {
    let id = +req.params.id;
  fs.readFile(fname, "utf-8", function (err, data) {
    if (err) res.status(404).send(err);
    else {
      let data2 = JSON.parse(data);
      let product = data2.products.filter((e) => e.productid === id);
      res.send(product);
    }
  });
});
app.post("/products", function (req, res) {
    console.log("Inside post of products")
    let body = req.body;
    fs.readFile(fname, "utf-8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            let data2 = JSON.parse(data);
            // console.log(data2.products);
            let maxid = data2.products.reduce(
              (acc, curr) => (acc > curr.productid ? acc : curr.productid),
              0
            );
            console.log(maxid);
            let newid = maxid + 1;
            let newproduct = {  productid:newid ,...body};
            console.log(newproduct);
            data2.products.push(newproduct);
            let data1 = JSON.stringify(data2);
            fs.writeFile(fname, data1, function (err) {
              if (err) res.status(404).send(err);
              else {
                res.send(newproduct);
              }
          });
        }
      });
});
app.put("/products/:id", function (req, res) {
    let body = req.body;
  let id = +req.params.id;
  fs.readFile(fname, "utf-8", function (err, data) {
    if (err) res.status(404).send(err);
    else {
      let data2 = JSON.parse(data);
      let index = data2.products.findIndex((st) => st.productid === id);
      if (index >= 0) {
        let updateProducts = { ...data2.products[index], ...body };
        data2.products[index] = updateProducts;
        console.log(data2);
        let data1 = JSON.stringify(data2);
        fs.writeFile(fname, data1, function (err) {
          if (err) res.status(404).send(err);
          else {
            res.send(updateProducts);
          }
        });
      } else res.status(404).send("NO products found");
    }
  });
});
app.get("/purchases", function (req, res) {
    let shopStr = req.query.shop;
    let productStr = req.query.product;
    let sortStr = req.query.sort;
    console.log(shopStr);
    let productArr = productStr ? productStr.split(",") : [];
    fs.readFile(fname, "utf-8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
          let data2 = JSON.parse(data);
          if (shopStr) {
            let shopId = shopStr.charAt(shopStr.length - 1);
            console.log(shopId);
            data2.purchases = data2.purchases.filter((e) => e.shopid === +shopId);
        }
        if (productStr) {
            // let productId = productStr.charAt(productStr.length - 1);
            data2.purchases = data2.purchases.filter((e) => (productArr.find(m => +(m.charAt(m.length-1)) ===e.productid)));
            // console.log(data2.purchases);
        }
        if (sortStr === "QtyAsc") {
            data2.purchases.sort((p1, p2) => +p1.quantity - +p2.quantity);
        }
        if (sortStr === "QtyDsc") {
            data2.purchases.sort((p1, p2) => +p2.quantity - +p1.quantity);
            // console.log(data2.purchases);
        }
        if (sortStr === "ValueAsc") {
            data2.purchases.sort((p1, p2) => +p1.quantity * +p1.price - +p2.quantity * +p2.price);
        }
        if (sortStr === "ValueDsc") {
            data2.purchases.sort((p1, p2) => +p2.quantity * +p2.price - +p1.quantity * +p1.price);
        }
        res.send(data2.purchases)
        }
      });
});
app.get("/purchases/shops/:id", function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname, "utf-8", function (err, data) {
      if (err) res.status(404).send(err);
      else {
        let data2 = JSON.parse(data);
        let product = data2.purchases.filter((e) => e.shopid === id);
        res.send(product);
      }
    });
});
app.get("/purchases/products/:id", function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname, "utf-8", function (err, data) {
      if (err) res.status(404).send(err);
      else {
        let data2 = JSON.parse(data);
        let product = data2.purchases.filter((e) => e.productid === id);
        res.send(product);
      }
    });
});

app.get("/totalPurchase/shop/:id", function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname, "utf-8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
          let data2 = JSON.parse(data);
          let shop = data2.purchases.filter((e) => e.shopid === id);
          let totalPurchase = shop.reduce(
            (acc, cur) => (acc + (cur.price * cur.quantity)), 0
        );
          res.send(totalPurchase.toString());
        }
      });
});
app.get("/totalPurchase/product/:id", function (req, res) {
    let id = +req.params.id;
    fs.readFile(fname, "utf-8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
          let data2 = JSON.parse(data);
          let product = data2.purchases.filter((e) => e.productid === id);
          let totalPurchase = product.reduce(
            (acc, cur) => (acc + (cur.price * cur.quantity)), 0
        );
          res.send(totalPurchase.toString());
        }
      });
});

app.post("/purchases", function (req, res) {
    let body = req.body;
  let id = +req.params.id;
  fs.readFile(fname, "utf-8", function (err, data) {
    if (err) res.status(404).send(err);
    else {
      let data2 = JSON.parse(data);
      let index = data2.purchases.findIndex((st) => st.id === id);
      if (index >= 0) {
        let updatepurchases = { ...data2.purchases[index], ...body };
        data2.purchases[index] = updatepurchases;
        let data1 = JSON.stringify(data2);
        fs.writeFile(fname, data1, function (err) {
          if (err) res.status(404).send(err);
          else {
            res.send(updatepurchases);
          }
        });
      } else res.status(404).send("NO purchases found");
    }
  });
});
