const express = require('express');
const router = express.Router();
const mail = require('nodemailer');


const ouremail='union.do.not.reply@gmail.com';
const password='whwqabezlwdytswx';
const Transporter = mail.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: ouremail,
        pass: password,
    }
});


router.post('/sendEmail', (req, res) => {
    const {
        name,
        email,
        message
    } = req.body;
    const mailOptions = {
        from: email,
        to: ouremail,
        subject: `Message from ${name}`,
        text: message
    }
    const ReplyMailOptions = {
        from: ouremail,
        to: email,
        subject: `Thank you for contacting us`,
        text: `your message is ${message}`
        //`Hello ${name},\n\nThank you for contacting us. This is an automated response so please do not reply to it. \nWe take requests very seriously and will reach out to you as soon as possible. A representative should reach out to you in 5-10 business days.\n\nBest Regards,\n\nThe Capstone Team`
    }
    try {
        Transporter.sendMail(mailOptions, (err, info) => {
            
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: 'fail',
                    message: err
                });
            }
            Transporter.sendMail(ReplyMailOptions, (err, info) => {
                if (err) {
                    return res.status(500).json({
                        status: 'fail',
                        message: err
                    })
                }
            });
            res.status(200).json({
                status: 'success',
                message: 'Email sent'
            })
        });
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err
        })
    }

});

module.exports = router;