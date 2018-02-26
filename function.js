

const _ = require("lodash")
const MyClient = require('./MyClient').MyClient;
const inquirer = require('inquirer');
const fs = require("fs")
const log = require("./logBdd")

function sendMessage(pathFile)
{
	let myClient = MyClient.getInstance();
	myClient.onReady().then(async() =>
	{
		let file = await myClient.createAttachement(pathFile);

		let channels = myClient.GetTextChannels();

		let choices = [];

		let currentServer = null;
		for (let chan of channels)
		{
			if (chan.guild.id != currentServer)
			{
				currentServer = chan.guild.id;
				choices.push(new inquirer.Separator("Serveur : " + chan.guild.name));
			}

			choices.push(
			{
				name: chan.name,
				value: chan
			});
		}

		let answer = await inquirer.prompt([
		{
			type: 'checkbox',
			message: 'Sélectionnez les channels auxquels envoyer le message',
			name: 'selectedChannels',
			choices: choices
		},
		{
			type: 'input',
			message: 'Entrer votre message',
			name: 'message'
		}]);

		let promiseSend = [];
		for (let chan of answer.selectedChannels)
		{
			promiseSend.push(chan.send(answer.message, file));
		}

		Promise.all(promiseSend).then(() =>
		{
			console.log('Messages sent !');

		});

		let loggedString = ""
		if (file != null)
		{
			loggedString += "send message from sendMessage : " + answer.message + " with a file"
		}
		else
		{
			loggedString += "send message from sendMessage : " + answer.message
		}
		log.sendLog(loggedString).then(() =>
			{
				endProcess()
			}).catch(()=>
			{
				console.log("Une erreur s'est produite lors de l'envoi des logs.")	
				endProcess()
			})
	});
}

function msgToManyChan(msg, withCommand, path)
{

	myClient.onReady().then(async() =>
		{
			let file = await myClient.createAttachement(path);
			let splittedUserInput = withCommand.split(",")
			let chanToSend = []
			let error = []
			splittedUserInput.forEach(function (dataFromUser)
			{ // iterate though the input of the user , we split it with the split(",") if all is ok splittedUserInput[0] is the name of the server
				let compteur = 0 // if this var stay to 0 , there is no server who match with the name of the server in the user input 
				let actualServ = dataFromUser.trim().split(" ")
				myClient.client.guilds.forEach(function (data)
				{

					if (checkServerExist(data.name, actualServ[0]))
					{
						compteur++ // server exist

						for (let i = 1; i < actualServ.length; i++)
						{ // foreach chan passed in user input we check if he exist with the .find function

							let de = data.channels.find(function (channelObject)
							{
								return channelObject.name === actualServ[i]
							})

							if (de != null) // if the chan exist we push it on the list of the chan where to send the message , else we create a new error and push it in error array
							{
								chanToSend.push(de)
							}
							else
							{
								error.push(new ErrorNameChan(data.name, actualServ[i]))
							}
						}
					}

				})
				if (compteur == 0)
				{
					error.push(new ErrorNameServer(actualServ[0]))
				}

			})

			chanToSend = _.uniq(chanToSend)
			let textPrompt = ""

			if (error.length == 0)
			{
				textPrompt += "Souhaitez vous envoyer le message sur tout les channels ?  O: oui , N : non"
			}
			else
			{
				textPrompt += "Nous avons trouvé les erreurs suivantes : \n"
				error.forEach(function (donn)
				{
					textPrompt += donn.toString() + "\n"
				})
				textPrompt += "Voulez vous envoyez le message sur channel tout de même ? O : Oui , N : Non"
			}

			let promiseSend = []
			let answer = await inquirer.prompt([
				{
					type: "input",
					message: textPrompt,
					name: "reponse"

				}]).then((reponse) =>
				{

					if (reponse.reponse.toLowerCase().search("o") != -1)
					{
						chanToSend.forEach(function (c, index, array)
						{
							promiseSend.push(c.send(msg, file))
						})

					}
					else
					{
						endProcess()
					}
				})
				.catch((err) =>
				{
					console.log(err)
				})

			Promise.all(promiseSend).then(() =>
			{
				console.log('Messages sent !');
			}).catch((e) =>
			{
				console.log("Erreur lors de l'envoi : ", e)
			})

			let loggedString = ""
			if (file != null)
			{
				loggedString += "sendMessage from msgtomanychan : " + msg + "With a file"
			}
			else
			{
				loggedString += "sendMessage from msgtomanychan : " + msg
			}

			log.sendLog(loggedString).then(() =>
			{

				endProcess()
			}).catch(()=>
			{
				console.log("Une erreur s'est produite lors de l'envoi des logs.")	
				endProcess()
			})


		}

	)

}

function getList(server)
{
	myClient.onReady().then(async() =>
	{
		if (server == undefined || server == true) // no server name in user input
		{
			generateList(myClient.client.guilds)
		}
		else
		{
			let compteur = 0
			let dummyArray = []

			myClient.client.guilds.forEach((data) =>
			{
				{
					if (checkServerExist(data.name, server))
					{
						compteur++
						dummyArray.push(data)
					}
				}
			})
			if (compteur == 0)
			{
				console.log("Aucun serveur avec le nom : ", server, " n'a été trouvé !")
				endProcess()
			}
			else
			{
				generateList(dummyArray)
			}

		}


		function generateList(listOfServer)
		{

			listOfServer.forEach((data) =>
			{
				console.log("Serveur : ", data.name)
				data.channels.forEach((chan) =>
				{
					if (chan.type == "text")
					{
						console.log("   Nom du channel : ", chan.name)
					}
				})
			})
			log.sendLog("Asked list ").then(() =>
			{
				endProcess()
			}).catch(()=>
			{
				console.log("Une erreur s'est produite lors de l'envoi des logs.")	
				endProcess()
			})

		}
	})
}


module.exports.sendMessage = sendMessage;
module.exports.msgToManyChan = msgToManyChan;
module.exports.getList = getList;

// function/object that dont need to be exported 
function deleteAccent(pString)
{
	return pString.replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function checkServerExist(serverObject, serverName)
{
	if (deleteAccent(serverObject) == deleteAccent(serverName))
	{
		return true
	}
	return false

}

function endProcess()
{
	process.exit()
}

function createAttachementObject(path)
{
	console.log(path)
	if (path != null || path != undefined)
	{
		return myClient.createAttachement(path)
	}
	else
	{
		return null
	}
}

class ErrorNameServer
{
	constructor(name)
	{
		this.name = name

	}
	toString()
	{

		return "Nous n'avons pas trouv� le serveur : " + this.name
	}
}


class ErrorNameChan extends ErrorNameServer
{
	constructor(server, name)
	{
		super(name)
		this.server = server
	}
	toString()
	{

		return "Nous n'avons pas trouv� le chan : " + this.name + " sur le serveur : " + this.server
	}
}

