
const MyClient = require('./MyClient').MyClient;
const inquirer = require("inquirer")
const discord = require("discord.js")
const log = require("./logBdd")
let client = null
let objActualServer = null
let loggedAccount

/*
* Create the connexion , set loggedaccount to account used to connect to the api 
* Initiate the object actualServer
*/

function gestionServer()
{
	let myClient = MyClient.getInstance()
	myClient.onReady().then(async() =>
	{
		client = myClient.client
		loggedAccount = client.user
		objActualServer = new actualServer()
		chooseServer()
		
	})
}



/*======================================== Choose the server to handle and what to do on it , IT'S MANDATORY TO PASS BY THESE FUNCTION ================================================================ */

/*
* Check right , only the owner ( TODO : check if administrator)
* Display List of server 
*/
async function chooseServer()
{
	let txt = "Listes des serveurs : "
	let choice = []
	await client.guilds.forEach((data) =>
	{
		if (data.ownerID == loggedAccount.id)
		{
			choice.push(
			{
				name: data.name,
				value: data
			})
		}
	})
	if (choice.length == 0)
	{
		console.log("Il n'y a aucun serveur ou vous possèdez les droits suffisants pour effectuer les actions proposé")
		endProcess()
	}
	else
	{
		let data = await ask([
		{
			type: "list",
			message: txt,
			name: "selectServer",
			choices: choice
		}])
		objActualServer.server = await data.selectServer
		chooseWhatToHandle(data.selectServer)
	}
}

/*
* Choose what to handle on the server
* The selected Server is on the object objActualServer
* Dont call this function without calling chooseServer first !
*/
async function chooseWhatToHandle() 
{

	let txt = "Que voulez vous gèrer ? : "
	let choice = [
	{
		name: "Gestions des droits utilisateurs.",
		value: 0
	},
	{
		name: "Gestions des channel",
		value: 1
	},
	{
		name: "Retour à la liste des serveurs",
		value: -1
	}]

	let response = await ask([
	{
		type: "list",
		message: txt,
		name: "selected",
		choices: choice
	}])

	if (response.selected == -1)
	{
		chooseServer()
		return true
	}
	else if (response.selected == 0)
	{
		manageUser()
	}
	else if (response.selected == 1)
	{
		askWhatToDoChan()
	}
}


/*============================================================================End of mandatory function=========================================================================================== */


/*======================================== Function to handle channel ================================================================ */

/*
* ask the user what he want to do on the channel of the server selected previously
* Dont call this function without asking the user to choose a server
*/

async function askWhatToDoChan()
{
	let choice = []
	choice.push(
		{
			name:"Supprimer un channels",
			value:"delete"
		},
		{
			name:"Créer un channel",
			value:"create"
		},
		{
			name:"Retournez à la liste précédente",
			value:-1
		},
		returnObjectLeave()
	)

	let response = await ask(
		{
			type:"list",
			message:"Qulle channels voulez vous gèrer ?",
			name:"response",
			choices:choice
		}
	)

	if(response.response == -1)
	{
		chooseWhatToHandle()
	}
	else if(response.response == -2)
	{
		endProcess()
	}
	else if(response.response == "delete")
	{
		ChooseChanForDelete()
	}
	else if(response.response == "create")
	{
		createChan()
	}


}


/*--------------------------Function to create channel ------------------------------------------------*/

/*
* Ask the type of channel and the name of the channel that we want to create
*/
async function createChan()
{
	let choice = [
		{
			name:"vocal",
			value:"vocal"
		},
		{
			name:"text",
			value:"text"
		},
		{
			name:"Retourner au menu précédent !",
			value:-1
		},
		returnObjectLeave()
	]
	let response = await ask
	(
		{
			type:"list",
			message:"Quelle type de channel voulez vous créer ?",
			name:"chanType",
			choices:choice
		}
	)
	if(response.chanType == -1)
	{
		askWhatToDoChan()
	}
	else if(response.chanType == -2)
	{
		endProcess()
	}
	else
	{
		let responseName = await ask
		(
			{
				type:"input",
				message:"Quelle nom souhaitez vous donner a ce chan ?",
				name:"chanName"
			}
		)
		doCreateChan(responseName.chanName , response.chanType)
		askWhatToDoChan()

	}

}

/*
* @param name name of the channel we want to create
* @param type type of the channel we want to create
* Create the channel and log it. We create the channel on the base category for the moment 
* TODO: let the possibility to change the category
*/
async function doCreateChan(name,type)
{
	console.log(objActualServer.server.systemChannel.parent.name)
	objActualServer.server.createChannel(name,type ).then((data)=>
	{
		data.setParent(objActualServer.server.systemChannel.parent)
		log.sendLog(loggedAccount.username , "Création du chan : "+name+" sur le serveur : "+objActualServer.name)
	})
}

/*--------------------------  end of Function to create channel ------------------------------------------------*/



/*-------------------------- Function to delete channel ------------------------------------------------*/

/*
* display a list of the server
* the selected server will be deleted
*/
async function ChooseChanForDelete()
{
	let choice = []
	await objActualServer.server.channels.forEach((channel)=>
	{
		if(channel.type == "text")
		{
			choice.push(
				{
					name:channel.name,
					value:channel
				}
			)
		}
	})
	choice.push(
		{
			name:"Retournez au choix des actions",
			value:-1
		},
		returnObjectLeave()
	)

	let response = await ask(
		{
			type:"list",
			message:"Choissisez le serveur à supprimer DISCLAIMER !!!!! Cette action est irréversible  !!!! DISCLAIMER",
			choices: choice,
			name:"selectedChan"
		}
	)
	if (response.selectedChan == -1)
	{
		askWhatToDoChan()
	}
	else if (response.selectedChan == -2)
	{
		endProcess()
	}
	else
	{
		doDeleteChannel(response.selectedChan)
	}


}

/*
* @param channel the object of the channel that we want to delete
* Delete the channel , log it, then we go back to the choice of handle for the channels of the server
*/
async function doDeleteChannel(channel)
{
	channel.delete().then(deleted =>
	{
		log.sendLog(loggedAccount.username , "Suppression du chan : "+deleted.name+" sur le serveur : "+objActualServer.name)
	})
	askWhatToDoChan()
}

/*-------------------------- end of function to delete channel ------------------------------------------------*/

/*======================================== end of function to handle channel ================================================================ */



/*======================================== Function to handle user ================================================================ */

/*
* Display the list of all the member of the server
*/
async function manageUser()
{
	let server = objActualServer.server
	let txt = "Choissisez la personne que vous souhaitez manager : "

	let choice = [
	{
		name: "Retournez au menu précédent",
		value: -1
	}]
	choice.push(returnObjectLeave())
	server.members.forEach((usr) =>
	{
		let actualUser = usr.user
		choice.unshift(
		{
			name: actualUser.username,
			value: actualUser
		})
	})

	let data = await ask(
	{
		type: "list",
		name: "selectedUser",
		message: txt,
		choices: choice,
	})

	if (data.selectedUser == -1)
	{
		chooseWhatToHandle(data)
	}
	else if (data.selectedUser == -2)
	{
		endProcess()
	}
	else
	{
		manageSingleUser(data.selectedUser)
	}

}

/*
* @param user object of the user we want to handle
* display the list of possible handling for the user
*/

async function manageSingleUser(user)
{
    let choice = 
    [
	{
		name: "Révoquer des droits",
		value: "revokRight"
	},
	{
		name: "Ajouter des droits",
		value: "addRight"
	},
	{
		name: "Bannir",
		value: "ban"
	},
	{
		name: "Retournez à la liste des membres.",
		value: -1
    },
    returnObjectLeave()
    ]
	

	let data = await ask(
	{
		message: "Choissisez une action pour l'utilisateur : " + user.username,
		type: "list",
		choices: choice,
		name: "selectedChoices"
	})
	if (data.selectedChoices == -1)
	{
		manageUser()
	}
	else if (data.selectedChoices == -2)
	{
		endProcess()
	}
	else if (data.selectedChoices == "ban")
	{
		banUsr(user)
	}
	else if (data.selectedChoices == "revokRight")
	{
		revokRights(user)
	}
	else if (data.selectedChoices == "addRight")
	{
		addRights(user)
	}

}

/*-------------------------- Function to add right to user ------------------------------------------------*/

/*
* @param user object of the user that we want to handle
* display the list of role , filter the role that the user already have
*/
async function addRights(user)
{
	let choice = []
	let member = await objActualServer.server.fetchMember(user)
	
	let serverListRole =  objActualServer.server.roles
	await member._roles.forEach((data)=>
	{
		serverListRole = serverListRole.filter(function(e) 
		{
			 return e.id != data && e.name != "@everyone" 
		})
	})
	await serverListRole.forEach((data)=>
	{
		choice.push(
			{
				name:data.name,
				value:data.id
			}
		)
	})
	choice.push(
	{
		name: "Retour aux actions pour l'utilisateur : " + user.username,
		value: -1
	})
	choice.push(returnObjectLeave())
	let data = await ask(
	{
		message: "Sélectionner des rôles à ajouter pour l'utilisateur : " + user.username,
		type: "list",
		choices: choice,
		name: "selectedChoices"
	})
	if (data.selectedChoices == -1)
	{
		manageSingleUser(user)
	}
	else if (data.selectedChoices == -2)
	{
		endProcess()
	}
	else
	{
		addRole(member, data.selectedChoices)
		manageSingleUser(user)
	}

}

/*
* @param member  CARE member is not user object , you have to get it by yourServer.fetchMember(user)
* add the role and log it
*/
async function addRole(member, role)
{
    member.addRole(role).then(()=>
    {
         getRolebYiD(role).then((data)=>
            {
                
                if (data != undefined)
                {
                    log.sendLog(loggedAccount.username, "Ajout du rôle : " + data.name + " Pour l'utilisateur : " + member.nickname)
                }
                else
                {
                    log.sendLog(loggedAccount.username, "Suppression d'un Rôle pour l'utilisateur : " + member.nickname)
                }
            })
    })

}

/*-------------------------- end of function to add right to user ------------------------------------------------*/



/*-------------------------- Function to ban user ------------------------------------------------*/

/*
* @param user , object of the user that we want to ban
* ban the user
* TODO: Test the ban and log it in a then
*/
async function banUsr(user)
{

	let data = await ask(
	{
		type: "confirm",
		message: "Voulez vous vraiment bannir l'utilisateur : " + user.username,
		name: "do"
	})
	console.log("a tester taleur")
	manageSingleUser(user)
	//user.ban()


}

/*-------------------------- end of function to ban user ------------------------------------------------*/

/*-------------------------- Function to revoke right to user ------------------------------------------------*/

/*
* @pram user , Object of the user that we want to revoke role
* Display a list of the role of the user selected
*/
async function revokRights(user)
{
	let txt = ""
	let choice = []
	let member = await objActualServer.server.fetchMember(user)

	function populateChoice(members)
	{
		members._roles.forEach((role) =>
		{
			getRolebYiD(role).then((test) => // pas réussi à faire autrement , le foreach c'est naze
			{
				if (test != undefined)
				{
					choice.push(
					{
						name: test.name,
						value: test.id
					})
				}
			})
		})
	}
	await populateChoice(member)
	if (choice.length == 0)
	{
		txt += "L'utilisateur : " + user.username + " ne possède aucun rôle sur ce serveur."
		choice.push(
		{
			name: "Retournez a l'écran des choix pour l'utilisateur : " + user.username,
			value: -1
		})
		choice.push(returnObjectLeave())
	}
	else
	{
		txt += "Quelle droit voulez vous supprimer pour l'utilisateur : " + user.username
	}

	let answer = await ask(
	{
		type: "list",
		message: txt,
		name: "answer",
		choices: choice
	})

	if (answer.answer == -1)
	{
		manageSingleUser(user)
	}
	else if (answer.answer == -2)
	{
		endProcess()
	}
	else
	{
		doRevokRighs(member, answer.answer)
		manageSingleUser(user)
	}


}

/*
* @param user , Object of the user for who we want to remove a role
* @param role , id of the role that we want to remove from the user
* Remove the role and log it 
*/

async function doRevokRighs(user, role)
{
        user.removeRole(role).then(()=>
        {
            getRolebYiD(role).then((data)=>
            {
                if (data != undefined)
                {
                    log.sendLog(loggedAccount.username, "Suppression du Rôle : " + data.name + " Pour l'utilisateur : " + user.nickname)
                }
                else
                {
                    log.sendLog(loggedAccount.username, "Suppression d'un Rôle pour l'utilisateur : " + user.nickname)
                }
            })
        })
	
	
}

/*-------------------------- end of function to revoke right to user ------------------------------------------------*/


/*======================================== end of function to handle user ================================================================ */


/* =================================== external function and class to make it work ===================================== */

/*
* @param id : id of the role we want the object
* return the role from the server from the ID
*/

async function getRolebYiD(id)
{

	return role = objActualServer.server.roles.find((roles) =>
	{
		return roles.id == id
	})
}
 /*
 * @param obj : object with the parameter for inquirer
 * Not sure its mandatory , but its cool. 
 */
async function ask(obj)
{
	return await inquirer.prompt(obj)
}

/*
* I'm lazy , i'm a programmer , thats why , thats all , i love pizza and beer , bring me some
*/
function returnObjectLeave()
{
	return {
		name: "Arreter le programme",
		value: -2
	}
}

/*
* end process
* possible evolution add error code
*/
function endProcess()
{
	process.exit()
}

/*
* Not useful for the moment , but cool for future feature
* store the server that we work on 
*/
class actualServer
{
	constructor()
	{
		this.server = null
	}
}


module.exports.administate = gestionServer