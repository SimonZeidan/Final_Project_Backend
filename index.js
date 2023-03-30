const express = require("express");
const app = express();
const customerRouter = require('./routes/customerRoutes');
const restaurantRouter = require('./routes/restaurantRoutes');
const itemRouter = require('./routes/itemRoutes');
const cartRouter = require('./routes/cartRoutes'); 

const DB = require("./database");

DB();

app.use(express.json());

app.use('/api/customer', customerRouter);
app.use('/api/restaurant', restaurantRouter);
app.use('/api/item', itemRouter);
app.use('/api/cart', cartRouter);

app.listen(process.env.PORT, ()=>{
    console.log(`Listening on port ${process.env.PORT}`);
})