const express = require('express');
const router = express.Router();
const passport = require('passport');

const doctorController = require('../controllers/doctor_controller');

router.get('/patient-diagnosis', passport.checkAuthentication, doctorController.profile);
router.get('/sign-in', doctorController.signIn);
router.get('/patient-details', doctorController.patients);

// This is to add the canvas and patient details to database
router.post('/add', doctorController.addPatient);
router.post('/create-session', passport.authenticate(
    'local',
    { failureRedirect: '/doctor/sign-in' },
), doctorController.createSession);
router.get('/sign-out', passport.checkAuthentication, doctorController.destroySession);
module.exports = router;