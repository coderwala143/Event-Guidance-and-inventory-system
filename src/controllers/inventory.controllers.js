const Inventory = require("../models/inventory.models");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

module.exports.createInventory = asyncHandler(async(req, res) => {
    const {name, description, quantity} = req.body

    if(!name.trim() || !quantity){
        throw new ApiError(400, "All field Required!");
    }

    if(quantity < 0 ){
        throw new ApiError(400, "Quantity cannot be negative.")
    }

    const inventory = new Inventory({
        name: name, 
        description: description?.trim() || '',
        quantity,
    })

    await inventory.save();
    res.status(201).json(new ApiResponse(200, inventory, "Inventory item created!"))
}) 

module.exports.getAllInventory = asyncHandler(async(req, res) => {
    let inventory = await Inventory.find().populate("assignedEvent", 'title date');
    if(req.user.role === 'admin'){
        res.status(200).json(new ApiResponse(200, inventory, "Fetched Inventory By Id!"))
    } else if(req.user.role === 'organizer'){
        const events =  await Event.find({organizer: req.user._id}).select("_id");

        if(events.length === 0){
            throw new ApiError(404, "No events found!")
        }

        const eventIds = events.map((event) => event._id);

        inventory = await Inventory.find({assignedEvent: {$in: eventIds}}).populate('assignedEvent', 'title date')
    } else {
        throw new ApiError(403, "Access denied")
    }

    res.status(200).json(new ApiResponse(200, inventory, "Fetched Inventory!"))
})

module.exports.getEventoryById = asyncHandler(async(req, res) => {
    const inventoryId = req.params.id;
    let inventory;
    if(req.user.role === 'admin'){
        inventory = await Inventory.findById(inventoryId).populate("assignedEvent", 'title date')
        if(!inventory){
            throw new ApiError(404, "Inventory item not found!");
        }
    } else if(req.user.role === 'organizer'){
        const events =  await Event.find({organizer: req.user._id}).select("_id");
        const assignedEvent = inventory.assignedEvent


        if(events.length === 0){
            throw new ApiError(404, "No events found!")
        }

        inventory = await Inventory.findById(inventoryId).populate("assignedEvent", 'title date')
        if(!inventory){
            throw new ApiError(404, "Inventory item not found!");
        }
    }
})