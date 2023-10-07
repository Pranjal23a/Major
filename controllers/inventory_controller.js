const Inventory = require('../models/inventory');
const SellInfo = require('../models/sell');

module.exports.addInventory = async function (req, res) {
    try {
        const medicine = await Inventory.findOne({ medicine_id: req.body.medicine_id });
        if (!medicine) {
            await Inventory.create(req.body);
            req.flash('success', 'Medicine Added to inventory!!');
            return res.redirect("/admin/profile");
        } else {
            req.flash('error', 'Medicine already exists');
            throw new Error("Medicine already exists");
        }
    } catch (err) {
        console.log("Error in Adding medicine to inventory", err);
        return res.redirect("back");
    }
}

module.exports.destroyinventory = async function (req, res) {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (inventory) {
            inventory.deleteOne();
            req.flash('success', 'Deleted Successfully!!');
            res.redirect('back');
        }
        else {
            req.flash('error', 'No data found to delete!!')
            return res.redirect('back');
        }
    } catch (err) {
        req.flash('error', err)
        return res.redirect('back');
    }
}
module.exports.removeinventory = async function (req, res) {
    try {
        let data = await Inventory.findOne({ medicine_id: req.body.medicine_id });
        if (data) {
            if (data.stock >= req.body.stock) {
                data.stock -= req.body.stock;
                let money = data.price * req.body.stock;
                await SellInfo.create({
                    medicine_id: req.body.medicine_id,
                    name: data.name,
                    unit: req.body.stock,
                    amount: money,
                    user: req.user._id
                });
                if (data.stock === 0) {
                    await Inventory.findByIdAndRemove(data.id);
                }
                else {
                    await data.save();
                }
                req.flash('success', 'Stock updated successfully!!');
                res.redirect('/staff/profile');
            }
            else {
                req.flash('error', 'Not enough stock available!!');
                res.redirect('/staff/profile');
            }
        }
        else {
            req.flash('error', 'Medicine with this ID does not exist!!');
            res.redirect('back');
        }
    } catch (err) {
        req.flash('error', err)
        return res.redirect('back');
    }
}