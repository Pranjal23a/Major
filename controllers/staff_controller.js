const Staff = require('../models/staff');

// Staff Profile 
module.exports.profile = async function (req, res) {
    const User = await Staff.findOne({ _id: req.user.id });

    // Check for admin login
    if (User) {
        return res.render('staff_profile', {
            title: 'Staff Profile',
        });
    }
    else {
        return res.redirect('/');
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
            return res.redirect("/admin/profile");
        } else {
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
        return res.redirect("/");
    });
};