const app = require("./app");
const {ConnectToDb} = require("./src/config/db");

ConnectToDb().then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`)
    })
}).catch((err) => {
    console.log("Error In Mongo Connection - ", err)
})