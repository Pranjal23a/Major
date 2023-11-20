const nodeMailer = require('../config/nodemailer');
const path = require('path');

// This is another way of exporting a method
exports.sendReport = (data) => {
    let htmlString = nodeMailer.renderTemplate({ data: data }, '/mail_template.ejs');
    const pdf = 'sell_info_' + data.user + '.pdf';
    const pdfFilePath = path.join(__dirname, '..', pdf);
    nodeMailer.transporter.sendMail({
        from: 'pransharma011@gmail.com',
        to: data.email,
        subject: 'New Announcement: Dear Buyer PFA!!',
        html: htmlString,
        attachments: [
            {
                filename: 'bill.pdf',
                path: pdfFilePath
            }
        ]
    }, (err, info) => {
        if (err) {
            console.log('Error in sending mail', err);
            return;
        }
        // console.log('Message Sent', info);
        return;
    });
}


exports.sendForgotPassword = (data) => {
    let htmlString = nodeMailer.renderTemplate({ data: data }, '/forgot_password_template.ejs');
    // const pdf = 'sell_info_' + data.user + '.pdf';
    // const pdfFilePath = path.join(__dirname, '..', pdf);
    nodeMailer.transporter.sendMail({
        from: 'pransharma011@gmail.com',
        to: data.email,
        subject: 'Password Reset link!!',
        html: htmlString
    }, (err, info) => {
        if (err) {
            console.log('Error in sending mail', err);
            return;
        }
        // console.log('Message Sent', info);
        return;
    });
}

exports.confirmAppointment = (data) => {
    let htmlString = nodeMailer.renderTemplate({ data: data }, '/confirm_appointment_template.ejs');
    nodeMailer.transporter.sendMail({
        from: 'pransharma011@gmail.com',
        to: data.email,
        subject: 'Appointment Confirmation Mail!!',
        html: htmlString
    }, (err, info) => {
        if (err) {
            console.log('Error in sending mail', err);
            return;
        }
        // console.log('Message Sent', info);
        return;
    });
}


exports.rejectAppointment = (data) => {
    let htmlString = nodeMailer.renderTemplate({ data: data }, '/reject_appointment_template.ejs');
    nodeMailer.transporter.sendMail({
        from: 'pransharma011@gmail.com',
        to: data.email,
        subject: 'Appointment Rejected!!',
        html: htmlString
    }, (err, info) => {
        if (err) {
            console.log('Error in sending mail', err);
            return;
        }
        // console.log('Message Sent', info);
        return;
    });
}
exports.modifyAppointment = (data) => {
    let htmlString = nodeMailer.renderTemplate({ data: data }, '/modify_appointment_template.ejs');
    nodeMailer.transporter.sendMail({
        from: 'pransharma011@gmail.com',
        to: data.email,
        subject: 'Appointment Rescheduled!!',
        html: htmlString
    }, (err, info) => {
        if (err) {
            console.log('Error in sending mail', err);
            return;
        }
        // console.log('Message Sent', info);
        return;
    });
}