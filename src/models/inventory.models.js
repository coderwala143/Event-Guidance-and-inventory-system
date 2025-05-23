const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Inventory item must have a name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'damaged', 'maintenance'],
    default: 'available',
  },
  assignedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null,
  },
  
}, {timestamps: true,});


const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

module.exports = Inventory
