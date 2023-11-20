const Doctor = require('../models/doctor');
const moment = require('moment');
const cron = require('node-cron');
const mailer = require('../mailers/mailer');
const sms = require('../config/twilio_sms');


// Schedule a job to run at midnight every day
cron.schedule('0 0 * * *', async () => {
    try {
        const doctors = await Doctor.find({});

        // Update the check property for each patient of each doctor
        for (const doctor of doctors) {
            for (const patient of doctor.patients) {
                // Check if the patient's date is not today
                patient.check = false;
                patient.confirm = false;
                patient.name = '';
                patient.mobile = '';
                patient.email = '';
                patient.address = '';
            }
            await doctor.save();
        }

        // Save the changes
        await Promise.all(doctors.map(doctor => doctor.save()));

        console.log('Daily update completed.');
    } catch (error) {
        console.error('Error during daily update:', error);
    }
});

module.exports.appointment = async function (req, res) {
    const doctors = await Doctor.find({});
    return res.render('book_appointment', {
        title: 'Book Appointment',
        doctor: doctors
    });
}
module.exports.details = async function (req, res) {
    const doctor = await Doctor.find({});
    return res.render('doctor_details', {
        title: 'Doctor Details',
        doctor: doctor
    });
}
module.exports.create = async function (req, res) {
    try {
        const { email, name, mobile, address, doctor, timings } = req.body;
        const selectedDoctor = await Doctor.findOne({ name: doctor });
        if (!selectedDoctor) {
            req.flash('error', 'Doctor not found');
            return res.redirect("back");
        }
        const selectedTiming = selectedDoctor.patients.find(patient => patient.timing === timings);
        if (selectedTiming) {
            selectedTiming.check = true;
            selectedTiming.confirm = false;
            selectedTiming.name = name;
            selectedTiming.email = email;
            selectedTiming.mobile = mobile;
            selectedTiming.address = address;

            // Save the changes
            await selectedDoctor.save();

            req.flash('success', 'Appointment booked successfully');
            return res.redirect("back");
        } else {
            req.flash('error', 'Selected timing not found');
            return res.redirect("back");
        }
    }
    catch (error) {
        req.flash('error', 'Unable to book, some internal error');
        return res.redirect("back");
    }
}
module.exports.getDoctorTimings = async function (req, res) {
    try {
        // Get doctor timings based on the selected doctor name
        var doctorName = req.params.doctorName;
        var doctor = await Doctor.findOne({ name: doctorName });

        if (doctor) {
            // Send the timings as JSON response
            return res.json(doctor.patients); // Assuming timings are stored as a comma-separated string
        } else {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        return;
    } catch (error) {
        console.log("Error fetching doctor timings:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


// confirm patient appointment
module.exports.confirmAppointment = async function (req, res) {
    const id = req.params.id;
    const doctor = await Doctor.findOne({ _id: req.user.id });
    const patientIndex = doctor.patients.findIndex(patient => {
        return patient.id === id;
    });
    if (patientIndex !== -1) {
        doctor.patients[patientIndex].confirm = true;
        await doctor.save();
        const name = doctor.patients[patientIndex].name;
        const email = doctor.patients[patientIndex].email;
        const number = doctor.patients[patientIndex].mobile;
        const time = doctor.patients[patientIndex].timing + " " + doctor.patients[patientIndex].am_pm;
        const data = {
            name: name,
            email: email,
            time: time
        }
        mailer.confirmAppointment(data);
        sms.smsConfirmAppointment(name, number, time);
        req.flash('success', 'Appointment Confirmed Successfully!!');
        res.redirect('back');

    } else {
        req.flash('error', 'Unable to confirm appointment!!')
        return res.redirect('back');
    }
}





// Destroy Patient 
module.exports.destroyPatient = async function (req, res) {
    try {
        const id = req.params.id;
        const doctor = await Doctor.findOne({ _id: req.user.id });
        const patientIndex = doctor.patients.findIndex(patient => {
            return patient.id === id;
        });
        if (patientIndex !== -1) {
            doctor.patients[patientIndex].check = false;
            doctor.patients[patientIndex].confirm = false;
            doctor.patients[patientIndex].name = '';
            doctor.patients[patientIndex].email = '';
            doctor.patients[patientIndex].mobile = '';
            doctor.patients[patientIndex].address = '';

            await doctor.save();
            req.flash('success', 'Patient Deleted Successfully!!');
            res.redirect('back');
        }
        else {
            req.flash('error', 'Unable to delete!!')
            return res.redirect('back');
        }
    } catch (err) {
        req.flash('error', err)
        return res.redirect('back');
    }
}