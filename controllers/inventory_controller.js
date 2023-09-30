const Inventory = require('../models/inventory');

module.exports.addInventory = async function (req, res) {
    try {
        const medicine = await Inventory.findOne({ medicine_id: req.body.medicine_id });
        if (!medicine) {
            await Inventory.create(req.body);
            return res.redirect("/admin/profile");
        } else {
            throw new Error("Medicine already exists");
        }
    } catch (err) {
        console.log("Error in Adding medicine to inventory", err);
        return res.redirect("back");
    }
}