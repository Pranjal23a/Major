const Admin = require('../models/admin');
const Inventory = require('../models/inventory');

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
    if (req.body.password != req.body.confirm_password && req.body.key != 'abcd') {
        return res.redirect('back');
    }
    try {
        const user = await Admin.findOne({ email: req.body.email });
        if (!user) {
            await Admin.create(req.body);
            return res.redirect("/admin/sign-in");
        } else {
            throw new Error("User already exists");
        }
    } catch (err) {
        console.log("Error in signing up:", err);
        return res.redirect("back");
    }
}

// sign in and create a session for the user
module.exports.createSession = async function (req, res) {
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
        return res.redirect("/");
    });
};