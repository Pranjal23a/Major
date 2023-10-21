const Staff = require('../models/staff');
const Inventory = require('../models/inventory');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const Admin = require('../models/admin');
const client = require('twilio')('AC3cac2f780654d7f7f67303bbbebbf85e', 'cf54357a0d2dfd154e0e4e4866e6d4c6');

// Doctor Profile 
module.exports.profile = async function (req, res) {
    const User = await Doctor.findOne({ _id: req.user.id });
    let data = await Inventory.find({});
    // Check for doctor login
    if (User) {
        return res.render('doctor_profile', {
            title: 'Doctor Profile',
            user: User,
            data: data
        });
    }
    else {
        return res.redirect('/');
    }
}


// doctor signup page
module.exports.signUp = async function (req, res) {
    const User = await Admin.findOne({ _id: req.user.id });
    if (User) {
        return res.render('doctor_sign_up', {
            title: "SignUp"
        })
    }
    else {
        return res.redirect('back');
    }
}


// doctor Signin page
module.exports.signIn = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/doctor/profile');
    }
    return res.render('doctor_sign_in', {
        title: "SignIn"
    })
}


// creating a Doctor
module.exports.create = async function (req, res) {
    if (req.body.password != req.body.confirm_password) {
        req.flash('error', 'Password does not match!!');
        return res.redirect('back');
    }
    try {
        const user = await Doctor.findOne({ email: req.body.email });
        if (!user) {
            await Doctor.create(req.body);
            req.flash('success', 'Doctor ID Created Successfully!!');
            return res.redirect("/doctor/profile");
        } else {
            req.flash('error', 'Doctor Already Exists!!');
            throw new Error("User already exists");
        }
    } catch (err) {
        console.log("Error in signing up:", err);
        return res.redirect("back");
    }
}

// send sms function
function sendSMS(name, number, token) {
    client.messages.create({
        body: `Dear ${name} your token number is ${token}, Thankyou!!`,
        to: `+91${number}`,
        from: '+14693522747'
    }).then(message => console.log(message))
        .catch(error => console.log(error))
}
module.exports.addPatient = async function (req, res) {
    try {
        let token;
        let isTokenUnique = false;

        // Function to generate a random token of varying length
        const generateRandomToken = () => {
            const length = Math.floor(Math.random() * 9) + 1; // Random length between 1 and 9
            let result = '';
            const characters = '0123456789'; // Characters to include in the token

            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            return result;
        };

        // Keep generating a random token until a unique one is found
        while (!isTokenUnique) {
            token = generateRandomToken();

            // Check if the token already exists in the database
            const existingPatient = await Patient.findOne({ token: token });

            if (!existingPatient) {
                isTokenUnique = true; // Unique token found
            }
        }

        const { name, number } = req.body;
        let canvasImage = req.body.canvasImage || '';

        // sending sms to user
        sendSMS(name, number, token);
        // Create the patient with the unique token
        Patient.create({ token, name, number, canvasImage });

        req.flash('success', 'Patient Report created Successfully!!');
        return res.redirect("/doctor/profile");
    } catch (err) {
        console.error("Error:", err);
        req.flash('error', 'Failed to add patient report.');
        return res.redirect('back');
    }
}




// creating session for doctor on signin
module.exports.createSession = async function (req, res) {
    req.flash('success', 'You Have SignIn Successfully!!');
    return res.redirect('/doctor/profile');
}


// doctor logout
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