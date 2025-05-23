const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/user.routes');
const adminRoutes = require("./src/routes/admin.routes");
const eventRoutes =  require("./src/routes/events.routes");
const inventoryRoutes = require("./src/routes/inventory.routes")
const app = express();
const cookieParser = require("cookie-parser")

dotenv.config();
app.use(cookieParser())
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/inventories", inventoryRoutes)

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: err.success || false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
        stack: err.stack,
    });
});
module.exports = app