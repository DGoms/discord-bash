const isNullOrUndefined = require('util').isNullOrUndefined;
const MyClient = require('./MyClient');
const inquirer = require("inquirer")

module.exports = class Question {

    /**
     * Ask the user, wich server he want
     */
    static async chooseServer(servers) {
        let txt = "Listes des serveurs : "
        let choices = []

        for(let server of servers){
            if(server[1])
                server = server[1];

            choices.push({
                name: server.name,
                value: server
            });
        }

        let answer = await inquirer.prompt({
            type: 'list',
            message: txt,
            name: 'selectedServer',
            choices: choices
        });

        return answer.selectedServer;
    }

    static async chooseUser(users){
        let txt = "Listes des utilisateurs : "
        let choices = []

        for(let user of users){
            choices.push({
                name: user.username,
                value: user
            });
        }

        if(choices.length == 0){
            console.log("Aucun utilisateur ! Forever alone");
            return null;
        }

        let answer = await inquirer.prompt({
            type: 'list',
            message: txt,
            name: 'selected',
            choices: choices
        });

        return answer.selected;
    }
}