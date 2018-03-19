#!/usr/bin/env node

const program = require('commander')
const theFunction = require("./function")
const MyClient = require("./MyClient").MyClient;
const admin = require("./serverAdministrator")


program
	.version('1.0.0')
	.option('-d, --direct', 'Direct message (private message to an user)')
	.option('-l --list [value]', "List all server and chan , optional parameter \"server\" to search only in this server case insensitive")
	.option('-w, --with <items>', 'Show hello world')
	.option('-a, --admin', 'admin administrator server')
	.option('-m --message [value]', 'set message')
	.option('-s --sendmessage', 'send message , need -m and -w like( -w \"servername chan1 chan2, servername2 chan1 chan2')
	.option('-p --prompt', 'show prompt to send message')
	.option('-f --file [value]', 'attach file to the message (use with -p or -s)')
	.option('--token [value]', 'set the token account to use')
	.option('--login', 'set the account to use')
	.parse(process.argv)

startTestCommand();

async function startTestCommand() {
	//if a --login option, do the login action fist
	if(program.login){
		if(await MyClient.login()){
			console.log('You are logged');
		}
		else{
			console.log('Login failed');
			process.exit();
		}

		if(process.argv.length <= 3){
			process.exit();
		}
	}

	if (program.sendmessage && program.message != null && program.with != null) {
		theFunction.msgToManyChan(program.message, program.with, program.file)
	}
	else if(program.admin)
	{
		admin.administate()
	}
	else if (program.list) {
		theFunction.getList(program.with)
	}
	else if (program.prompt) {
		theFunction.sendMessage(program.file)
	}
	else if(program.direct){
		theFunction.privateMessage();
	}
	else if (program.token) {
		if (typeof program.token === "boolean") {
			console.log("No token passed");
		}
		else {
			if (await MyClient.setToken(program.token)) {
				console.log("Token setted !");
			}
			else {
				console.log('Bad token !');
			};
		}

		process.exit();
	}
	else {
		program.help();
	}
}


