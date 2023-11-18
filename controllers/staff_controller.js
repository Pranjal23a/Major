const Staff = require('../models/staff');
const Inventory = require('../models/inventory');
const Patient = require('../models/patient');
const Admin = require('../models/admin');
const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const mailer = require('../mailers/mailer');
// Staff Profile 
module.exports.update = async function (req, res) {
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
    try {
        // Get today's date
        const today = moment().startOf('day'); // Start of today

        // Find patients created before to day and delete them
        await Patient.deleteMany({ createdAt: { $lt: today } });
    } catch (error) {
        console.error('Error removing patients:', error);
    }
    const patient = await Patient.find({}).sort({ createdAt: -1 });
    const User = await Staff.findOne({ _id: req.user.id });
    // Check for admin login
    if (patient && User) {
        return res.render('staff_view_patient', {
            title: 'Staff Profile',
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
        req.flash('error', 'Password does not match!!');
        return res.redirect('back');
    }
    try {
        const user = await Staff.findOne({ email: req.body.email });
        if (!user) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
            await Staff.create(req.body);
            req.flash('success', 'Staff ID Created Successfully!!');
            return res.redirect("/admin/add-inventory");
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
module.exports.signUp = async function (req, res) {
    const User = await Admin.findOne({ _id: req.user.id });
    if (User) {
        let staff = await Staff.find({});
        return res.render('staff_sign_up', {
            title: "Staff SignUp",
            staff: staff,
        })
    }
    else {
        return res.redirect('back');
    }
}




// forgot Password
module.exports.forgotPasswordGet = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/staff/update');
    }
    return res.render('staff_forgot_password', {
        title: "Forgot Password"
    })
}

module.exports.forgotPasswordPost = async function (req, res) {
    try {
        const email = req.body.email;
        const User = await Staff.findOne({ email: email });
        if (User) {
            const secret = env.JWT_SECRET + User.password;
            const payload = {
                email: User.email,
                id: User._id
            }
            const token = jwt.sign(payload, secret, { expiresIn: '15m' });
            const link = `http://localhost:8000/staff/reset-password/${User._id}/${token}`;
            const data = {
                name: User.name,
                email: User.email,
                link: link
            };
            mailer.sendForgotPassword(data);
            req.flash('success', 'Reset Password Email has been sent to you!');
            return res.redirect('back');

        }
        else {
            req.flash('error', 'No User found with this email ID');
            return res.redirect('/staff/sign-in');
        }

    } catch (err) {
        console.log("Error in reset password:", err);
        req.flash('error', 'Unable to reset password');
        return res.redirect("back");
    }
}


// Reset Password
module.exports.resetPasswordGet = async function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/staff/update');
    }
    const { id, token } = req.params;
    const User = await Staff.findOne({ _id: id });
    if (User) {
        const secret = env.JWT_SECRET + User.password;
        try {
            const payload = jwt.verify(token, secret);
            return res.render('staff_reset_password', {
                title: "Reset Password",
                email: User.email
            })
        } catch (err) {
            req.flash('error', 'Password Reset Link is no More active');
            return res.redirect("/staff/sign-in");
        }
    }
    else {
        req.flash('error', 'No User found with this ID');
        return res.redirect('/staff/sign-in');
    }
}
module.exports.resetPasswordPost = async function (req, res) {

    try {
        const { id, token } = req.params;
        const { password, confirm_password } = req.body;
        const User = await Staff.findOne({ _id: id });
        if (User) {
            const secret = env.JWT_SECRET + User.password;
            const payload = jwt.verify(token, secret);
            if (password === confirm_password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                User.password = hashedPassword;
                await User.save();
                req.flash('success', 'Password Successfully Reset!');
                return res.redirect('/staff/sign-in');
            }
            else {
                req.flash('success', 'Password And Confirm Password Does not match!');
                return res.redirect('/staff/sign-in');
            }
        }
        else {
            req.flash('error', 'No User found with this ID');
            return res.redirect('/staff/sign-in');
        }

    } catch (err) {
        console.log("Error in reset password:", err);
        req.flash('error', 'Unable to reset password4');
        return res.redirect("/staff/sign-in");
    }
}




module.exports.destroyStaff = async function (req, res) {
    try {
        const staff = await Staff.findById(req.params.id);
        if (staff) {
            staff.deleteOne();
            req.flash('success', 'Deleted Successfully!!');
            res.redirect('back');
        }
        else {
            req.flash('error', 'No such staff exists!!')
            return res.redirect('back');
        }
    } catch (err) {
        req.flash('error', err)
        return res.redirect('back');
    }
}


// staff update password
module.exports.updateProfile = async function (req, res) {
    try {
        const { id, name, email } = req.body; // Get the new password from the form

        // Find the user by email
        const user = await Staff.findOne({ _id: id });

        if (!user) {
            req.flash('error', 'No Staff Exists!!');
            return res.redirect('back');
        }
        user.email = email;
        user.name = name;

        // Save the updated user
        await user.save();

        // Redirect or send a success response
        req.flash('success', 'Staff Profile Updated Successfully!!');
        res.redirect('back');

    } catch (error) {
        req.flash('error', 'Some Problem there in updating profile!!');
        return res.redirect('back');
    }

}


// staff Signin page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/staff/update');
    }
    return res.render('staff_sign_in', {
        title: "Staff SignIn"
    })
}

// creating session for staff on signin
module.exports.createSession = async function (req, res) {
    req.flash('success', 'You Have SignIn Successfully!!');
    return res.redirect('/staff/update');
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