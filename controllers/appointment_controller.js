const Doctor = require('../models/doctor');

module.exports.appointment = async function (req, res) {
    const doctor = await Doctor.find({});
    return res.render('book_appointment', {
        title: 'Book Appointment',
        doctor: doctor
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