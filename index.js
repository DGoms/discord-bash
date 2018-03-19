#!/usr/bin/env node

const program = require('commander')
const theFunction = require("./function")
const MyClient = require("./MyClient");
const admin = require("./serverAdministrator")


program
	.version('1.0.0')
	.option('-f --file [value]', 'attach file to the message (use with -p or -s)')
	.option('--login', 'set the account to use')
	

program
	.command('list')
	.description('List all server and chan')
	.option('-s, --server', "to search only in this server (case insensitive)")
	.action((options) => {
		theFunction.getList(options.server)
	});

program
	.command('send <channels> <message>')
	.description('send message to multiple channels')
	.action((channels, message, options) => {
		theFunction.msgToManyChan(message, channels, program.file)
	}).on('--help', () => {
		console.log('  Examples:');
		console.log();
		console.log('    $ send \"servername chan1 chan2, servername2 chan1 chan2\" "Hello world"');
		console.log();
	});

program
	.command('message')
	.description('send messages to channels or user')
	.action((options) => {
		theFunction.sendMessage(program.file)
	}).on('--help', () => {
		console.log('  Examples:');
		console.log();
		console.log('    $ send \"servername chan1 chan2, servername2 chan1 chan2\" "Hello world"');
		console.log();
	});

program
	.command('admin')
	.description('admin administrator server')
	.action((options) => {
		admin.administate();
	});

program
	.command('set-token <token>')
	.description('set the token account to use')
	.option('-c, --no-check', "disable token check")
	.action(async (token, options) => {
		if (await MyClient.setToken(token, options.check)) {
			console.log("Token setted !");
		}
		else {
			console.log('Bad token !');
		};

		process.exit();
	});

program
	.command('*')
	.action((options) => {
		console.log('toto');
		program.help();
	});

checkNoArgs();

program
	.parseOptions(process.argv);

startOptions();
async function startOptions() {
	//if a --login option, do the login action fist
	if (program.login) {
		if (await MyClient.login()) {
			console.log('You are logged');
			if (process.argv.length <= 3) {
				process.exit();
			}
		}
		else {
			console.log('Login failed');
			process.exit();
		}
	}

	program.parse(process.argv);
}

function checkNoArgs(){
	let index = 1;
	if(process.argv0 == 'node'){
		index++;
	}

	if(process.argv[index] == undefined)
		program.help();
}


