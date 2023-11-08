const Admin = require('../models/admin');
const Inventory = require('../models/inventory');
const Selldata = require('../models/sell');

// Admin proflie page
module.exports.profile = async function (req, res) {
    const User = await Admin.findOne({ _id: req.user.id });
    let data = await Inventory.find({});
    // Check for admin login
    if (User) {
        return res.render('admin_profile', {
            title: 'Admin Profile',
            user: User,
            data: data
        });
    }
    else {
        return res.redirect('/');
    }
}


// Admin Invetory search page
module.exports.Showsearch = async function (req, res) {
    const User = await Admin.findOne({ _id: req.user.id });
    let data = await Inventory.find({});
    // Check for admin login
    if (User) {
        return res.render('admin_search_inventory', {
            title: 'Admin Profile',
            user: User,
            data: data
        });
    }
    else {
        return res.redirect('/');
    }
}
module.exports.search = async function (req, res) {

    try {
        const searchQuery = req.params.name;
        if (searchQuery == 0) {
            const allData = await Inventory.find({});
            return res.json(allData);
        }
        else {
            const searchResults = await Inventory.find({ name: { $regex: searchQuery, $options: 'i' } });

            // In staff_controller.js
            // Send the search results as JSON
            return res.json(searchResults);
        }
    } catch (err) {
        console.error('Error in search:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports.sellData = async function (req, res) {
    const User = await Admin.findOne({ _id: req.user.id });
    let data = await Selldata.find().populate('user');
    // Check for admin login
    if (User) {
        let totalAmount = 0;
        data.forEach((sell) => {
            totalAmount += sell.amount; // Assuming 'amount' is the field to sum
        });
        return res.render('purchase_details', {
            title: ' Admin Profile',
            user: User,
            data: data,
            totalAmount: totalAmount
        });
    }
    else {
        return res.redirect('/');
    }
}
module.exports.getSellDataByDateRange = async function (req, res) {
    try {
        const startDate = new Date(req.params.startDate);
        const endDate = new Date(req.params.endDate);
        endDate.setHours(23, 59, 59, 999);
        // Fetch sell data based on the date range
        const sellData = await Selldata.find({ date: { $gte: startDate, $lte: endDate } }).populate('user');
        console.log(sellData);
        return res.json(sellData);
    } catch (error) {
        console.error('Error fetching sell data by date range:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Render Signin page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/admin/add-inventory');
    }
    return res.render('admin_sign_in', {
        title: "Admin SignIn"
    })
}
// Render SignUp page
module.exports.signUp = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/admin/add-inventory');
    }
    return res.render('admin_sign_up', {
        title: "Admin SignUp"
    })
}

// get the signup data and create admin
module.exports.create = async function (req, res) {
    if (req.body.password != req.body.confirm_password || req.body.key != 'abcd') {
        req.flash('error', 'Password or key not match!!!');
        return res.redirect('back');
    }
    try {
        const user = await Admin.findOne({ email: req.body.email });
        if (!user) {
            await Admin.create(req.body);
            req.flash('success', 'Admin created Succesfully!!');
            return res.redirect("/admin/sign-in");
        } else {
            req.flash('error', 'This Admin already exists!!');
            throw new Error("This Admin already exists");
        }
    } catch (err) {
        console.log("Error in signing up:", err);
        req.flash('error', 'Unable to sinup');
        return res.redirect("back");
    }
}

// sign in and create a session for the user
module.exports.createSession = async function (req, res) {
    req.flash('success', 'You have Logged In Successfully!!');
    return res.redirect('/admin/add-inventory');
}


// admin logout
module.exports.destroySession = async function (req, res) {
    req.logout(function (err) {
        if (err) {
            // Handle any error that occurred during logout
            return res.redirect("/"); // or handle the error in an appropriate way
        }
        req.flash('success', 'Logged Out!!');
        return res.redirect("/");
    });
};