const mongoose = require("mongoose");

module.exports.ConnectToDb = async () => {
    try {
        let connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/Event_Guidance_Inventory_system`);
        console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        return true; 
    } catch (error) {
        console.log("MongoDB ERROR:- ", error)
        process.exit(1)
    }
}