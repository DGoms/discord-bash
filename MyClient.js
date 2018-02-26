
const isNullOrUndefined = require('util').isNullOrUndefined;
const discord = require('discord.js');
const fs = require('fs')
const inquirer = require('inquirer');
const request = require('request');
const ConfigManager = require('./ConfigManager').ConfigManager;

class MyClient {
	static getInstance() {
		if (isNullOrUndefined(MyClient.instance)) {
			MyClient.instance = new MyClient();
		}

		return MyClient.instance;
	}

	constructor() {
		this.client = new discord.Client();

		ConfigManager.getToken().then((token) => {
			this.client.login(token).catch((err) => {
				console.log("No token setted ! Please login with the option --login or --token", err);
				process.exit();
			});
		})
	}

	onReady() {
		return new Promise((resolve, reject) => {
			this.client.on('ready', () => {
				this.client.syncGuilds();
				resolve();
			});
		});
	}

	GetTextChannels() {
		let chanList = [];
		for (let item of this.client.channels) {
			let channel = item[1];
			if (channel.type == "text") {
				chanList.push(channel);
			}
		}
		return chanList;
	}

	createAttachement(path) {
		return new Promise((resolve, reject) => {

			if (isNullOrUndefined(path)) {
				resolve(null);
			}
			else {
				fs.stat(path, (err, result) => {
					if (result) {
						resolve(new discord.Attachment(path));
					}
					else {
						console.log("Le fichier n'existe pas ")
						resolve(null);
						process.exit()
					}
				})
			}
		});
	}
	isAdmin() {
		return new discord.Permission(discord.Permissions.FLAGS.ADMINISTRATOR)
	}

	//Static

	/** 
	 * @returns {boolean} true | false if login successful or not
	 */
	static async login() {
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

		let token = await MyClient.getTokenFromDiscord(answers.email, answers.password);

		if (!isNullOrUndefined(token)) {
			if (await ConfigManager.setToken(token)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get a token from Discord for this account
	 * @param {string} email 
	 * @param {string} password
	 * @returns {Promise} The token or null if auth failed
	 */
	static getTokenFromDiscord(email, password) {
		return new Promise((resolve, reject) => {
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
					resolve(body.token);
				}
				else {
					for (let key in body) {
						console.log(body[key]);
					}

					resolve(null);
				}
			})
		});
	}
}

module.exports.MyClient = MyClient;