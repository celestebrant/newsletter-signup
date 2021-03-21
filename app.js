const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const https = require('https');

const app = express();


// Display local images and css when loading webpage
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Display HTML when fetching on localhost
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/signup.html');
});


// Route for user subscription sign up
app.post('/', function (req, res) {
    // Gather the subscribers personal details. Ensure HTML form's attributes method and action are populated.
    const firstName = req.body.fName;   // name attribute in signup.html
    const lastName = req.body.lName;
    const email = req.body.email;

    // Prep the request body with user data
    const data = {
        members: [
            {
                email_address: email,
                status: 'subscribed',
                merge_fields: {
                    // Mailchimp Audience fields and *|MERGE|*
                    FNAME: firstName,
                    LNAME: lastName,
                }
            },
        ]
    };
    const jsonData = JSON.stringify(data);

    // Send the data to the Mailchimp server
    const listID = '031310931a';
    const url = 'https://us1.api.mailchimp.com/3.0/lists/' + listID;
    const options = {
        method: 'POST',
        auth: 'abc:362b11d08d683bb775def180bbc17e57-us1',    // 'anything:apikey'
    };
    const request = https.request(url, options, function (response) {
        // Subscription confirmation
        if (response.statusCode === 200) {
            res.sendFile(__dirname + '/success.html');
        } else {
            res.sendFile(__dirname + '/failure.html');
        }

        // Log the response
        response.on('data', function (data) {
            console.log(JSON.parse(data));
        });
    });
    request.write(jsonData);
    request.end();
});


// Route for go back on success page
app.post('/success', function (req, res) {
    res.redirect('/');
});


// Route for go back on failure page
app.post('/failure', function (req, res) {
    res.redirect('/');
});


// Host the web page on a dynamic port that Heroku will choose.
app.listen(process.env.PORT || 3000, function () {
    console.log("Server is now running on either a dynamic port or port 3000.");
});
