// const express = require('express');
// const bodyParser = require('body-parser');
const app = express();
const port = 3300;
import express  from 'express';
import bodyParser from 'body-parser';

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/users/create', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    res.send([
        'Signup completed',
        `Name: ${name}`,
        `Email: ${email}`,
        `Password: ${'*'.repeat(password.length)}`
    ].join('<br>'));
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});