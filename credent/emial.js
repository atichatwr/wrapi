const nodemailer = require('nodemailer');

// Generate SMTP service account from ethereal.email
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    console.log('Credentials obtained, sending message...');

    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
        host: 'smtp.wealthrepublic.co.th',
        port: 25,
        secure: false, //use SSL
        auth: {
            user: 'esign@wealthrepublic.co.th',
            pass: 'Wealth@2022'
        },
        tls:{ 
            rejectUnauthorized: false 
            }
    });

    // Message object
    let message = {
        from: 'cs@wealthrepublic.co.th',
        to: 'atichat@wealthrepublic.co.th',
        subject: 'Nodemailer is unicode friendly ✔',
        text: 'Hello to myself!',
        html: '<p><b>Hello</b> to myself!</p>'
    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
});

