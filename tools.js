const inquirer = require('inquirer');
const request = require('request');
const fs = require('fs')

module.exports.login = async function () {
    let answers = await inquirer.prompt([
        {
            type: 'input',
            message: 'Entrer votre email',
            name: 'email'
        },
        {
            type: 'password',
            message: 'Entrer votre mot de pass',
            name: 'password'
        }
    ]);

    return getToken(answers.email, answers.password);
}

getToken = function (email, password) {
    // Configure the request
    var options = {
        url: 'https://discordapp.com/api/v6/auth/login',
        method: 'POST',
        json: { 'email': email, 'password': password }
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('Your token login: ' + body.token);
            setToken(body.token)
                .then(() => {
                    console.log('You are logged !');

                    process.exit();
                }).catch((err) => {
                    console.error('Login failed');
                    console.error(err);

                    process.exit();
                });
        }
        else {
            for (let key in body) {
                console.log(body[key]);
            }

            process.exit();
        }
    })
}

function setToken(token) {
    return new Promise((resolve, reject) => {
        if (token.length != 59) {
            reject('Bad token');
        }
        else {
            let data = "token: " + token;
            fs.writeFile("properties.properties", data, "utf8", (err) => {
                if (err)
                    reject(err);

                resolve();
            })
        }
    });
}

module.exports.setToken = setToken;