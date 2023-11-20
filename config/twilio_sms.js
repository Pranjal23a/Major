const env = require('../config/environment');
const client = require('twilio')(env.account_SID, env.auth_Token);

module.exports.tokenSms = async function (name, number, token) {
    const messageBody = `
Dear ${name},

Your token number is: ${token}

Dr. Goel's Dental And Maxillofacial Diagnostics
Thank you!!
    `;

    client.messages.create({
        body: messageBody,
        to: `+91${number}`,
        from: env.twilio_phone_number
    }).then(message => {
        console.log(`Message sent: ${message.sid}`);
    }).catch(error => {
        console.error(`Error sending message: ${error.message}`);
    });
}


module.exports.smsConfirmAppointment = async function (name, number, time) {
    const currentDate = new Date();
    const date = currentDate.toLocaleDateString();
    const messageBody = `
Dear ${name},

Your Appointment has been confirmed!


Date : ${date}
Time : ${time}
Please arrive 10 minutes prior to your scheduled time.


Dr. Goel's Dental And Maxillofacial Diagnostics
Thank you!!
    `;

    client.messages.create({
        body: messageBody,
        to: `+91${number}`,
        from: env.twilio_phone_number
    }).then(message => {
        console.log(`Message sent: ${message.sid}`);
    }).catch(error => {
        console.error(`Error sending message: ${error.message}`);
    });
}



module.exports.smsDeclineAppointment = async function (name, number, text) {
    const messageBody = `
Dear ${name},

We regret to inform you that,
Your Appointment has been cancelled!

${text}

Dr. Goel's Dental And Maxillofacial Diagnostics
Thank you!!
    `;

    client.messages.create({
        body: messageBody,
        to: `+91${number}`,
        from: env.twilio_phone_number
    }).then(message => {
        console.log(`Message sent: ${message.sid}`);
    }).catch(error => {
        console.error(`Error sending message: ${error.message}`);
    });
}

module.exports.smsModifyAppointment = async function (name, number, text, time) {
    const currentDate = new Date();
    const date = currentDate.toLocaleDateString();
    const messageBody = `
Dear ${name},

Your Appointment timings are changed!

${text}

Date : ${date}
New Time : ${time}
Please arrive 10 minutes prior to your scheduled time.

Dr. Goel's Dental And Maxillofacial Diagnostics
Thank you!!
    `;

    client.messages.create({
        body: messageBody,
        to: `+91${number}`,
        from: env.twilio_phone_number
    }).then(message => {
        console.log(`Message sent: ${message.sid}`);
    }).catch(error => {
        console.error(`Error sending message: ${error.message}`);
    });
}



