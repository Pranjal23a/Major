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
        const searchResults = await Inventory.find({ name: { $regex: searchQuery, $options: 'i' } });

        // In staff_controller.js
        // Send the search results as JSON
        return res.json(searchResults);
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
        return res.render('purchase_details', {
            title: ' Purchase details',
            user: User,
            data: data
        });
    }
    else {
        return res.redirect('/');
    }
}

// Render Signin page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/admin/profile');
    }
    return res.render('admin_sign_in', {
        title: "SignIn"
    })
}
// Render SignUp page
module.exports.signUp = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/admin/profile');
    }
    return res.render('admin_sign_up', {
        title: "SignUp"
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
            req.flash('success', 'User created Succesfully!!');
            return res.redirect("/admin/sign-in");
        } else {
            req.flash('error', 'User already exists!!');
            throw new Error("User already exists");
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
    return res.redirect('/admin/profile');
}


// admin logout
module.exports.destroySession = async function (req, res) {
    req.logout(function (err) {
        if (err) {
            // Handle any error that occurred during logout
            console.log(err);
            return res.redirect("/"); // or handle the error in an appropriate way
        }
        req.flash('success', 'Logged Out!!');
        return res.redirect("/");
    });
};