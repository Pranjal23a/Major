const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointment_controller');

router.get('/patient', appointmentController.appointment);
router.get('/doctor-details', appointmentController.details);
router.post('/create', appointmentController.create);
router.get('/getDoctorTimings/:doctorName', appointmentController.getDoctorTimings);
router.get('/destroy-patient/:id', appointmentController.destroyPatient);
module.exports = router;