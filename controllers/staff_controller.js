const Staff = require('../models/staff');
const Inventory = require('../models/inventory');
const Patient = require('../models/patient');
// Staff Profile 
module.exports.profile = async function (req, res) {
    const User = await Staff.findOne({ _id: req.user.id });
    let data = await Inventory.find({});
    // Check for admin login
    if (User) {
        return res.render('staff_profile', {
            title: 'Staff Profile',
            user: User,
            data: data
        });
    }
    else {
        return res.redirect('/');
    }
}

//  Patient Data
module.exports.patient = async function (req, res) {
    const patient = await Patient.find({}).sort({ createdAt: -1 });
    // Check for admin login
    if (patient) {
        return res.render('staff_view_patient', {
            title: 'Patient Details',
            reports: patient,
        });
    }
    else {
        return res.redirect('/');
    }
}


module.exports.Showsearch = async function (req, res) {
    const User = await Staff.findOne({ _id: req.user.id });
    let data = await Inventory.find({});
    // Check for admin login
    if (User) {
        return res.render('staff_search_inventory', {
            title: 'Staff Profile',
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

// creating a staff
module.exports.create = async function (req, res) {
    if (req.body.password != req.body.confirm_password) {
        return res.redirect('back');
    }
    try {
        const user = await Staff.findOne({ email: req.body.email });
        if (!user) {
            await Staff.create(req.body);
            req.flash('success', 'Staff ID Created Successfully!!');
            return res.redirect("/admin/profile");
        } else {
            req.flash('error', 'Staff Already Exists!!');
            throw new Error("User already exists");
        }
    } catch (err) {
        console.log("Error in signing up:", err);
        return res.redirect("back");
    }
}


// staff signup page
module.exports.signUp = function (req, res) {
    return res.render('staff_sign_up', {
        title: "SignUp"
    })
}


// staff Signin page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/staff/profile');
    }
    return res.render('staff_sign_in', {
        title: "SignIn"
    })
}

// creating session for staff on signin
module.exports.createSession = async function (req, res) {
    req.flash('success', 'You Have SignIn Successfully!!');
    return res.redirect('/staff/profile');
}


// staff logout
module.exports.destroySession = async function (req, res) {
    req.logout(function (err) {
        if (err) {
            // Handle any error that occurred during logout
            console.log(err);
            return res.redirect("/"); // or handle the error in an appropriate way
        }
        req.flash('error', 'Logged Out Successfully!!');
        return res.redirect("/");
    });
};