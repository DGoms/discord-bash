const myClient = require('./MyClient').myClient;
const inquirer = require("inquirer")
const discord = require("discord.js")
const log = require("./logBdd")
let client = null
let objActualServer = null
let loggedAccount
function gestionServer()
{
    myClient.onReady().then(async() =>
    {
        client = myClient.client
        loggedAccount = client.user
        objActualServer = new actualServer()
        chooseServer()
    })
}



async function chooseServer()
{
    let txt = "Listes des serveurs : "
    let choice = []
    await client.guilds.forEach((data)=>
    {
        if( data.ownerID  == loggedAccount.id )
        {
            choice.push({
                name: data.name,
                value:data
            })
        }
    })
        if(choice.length == 0)
        {
        console.log("Il n'y a aucun serveur ou vous possèdez les droits suffisants pour effectuer les actions proposé")
        endProcess()
        }
        else
        {
            await ask([{
                type: "list",
                message: txt,
                name: "selectServer",
                choices : choice
            }])
        
            .then((chanSelected)=>
            {
                objActualServer.server = chanSelected.selectServer
                chooseWhatToHandle(chanSelected.selectServer)
            
            }).catch((e)=>{console.log(e)})
        }
}


async function chooseWhatToHandle() // this function take a server as parameter and return what the user whant to do (user management , or channel management)
{
    let txt = "Que voulez vous gèrer ? : "
    let choice = [
        {
            name: "Gestions des droits utilisateurs.",
            value:0
        },
        {
            name: "Gestions des channel",
            value:1
        },
        {
            name:"Retour à la liste des serveurs",
            value: -1
        }
    ]

    await ask([{
        type: "list",
        message: txt,
        name: "selected",
        choices : choice
    }])
    .then((response)=>
    {
        if(response.selected == -1)
        {
            chooseServer()
            return true
        }
        else if(response.selected == 0)
        {
            manageUser()
        }
        else if(response.selected == 1)
        {
            //gestion chan
        }
    })
}

async function manageUser()
{
    let server = objActualServer.server
    let txt = "Choissisez le membres que vous souhaitez manager : "

    let choice = [{
        name:"Retournez au menu précédent",
        value:-1
    }]
    choice.push(returnObjectLeave())
    server.members.forEach((usr)=>
    {
        let actualUser = usr.user
        choice.unshift({
            name: actualUser.username,
            value:actualUser
        })   
    })
    
    await ask({
        type:"list",
        name:"selectedUser",
        message:txt,
        choices: choice,
    }).then((data)=>
    {
        if(data.selectedUser == -1)
        {
            chooseWhatToHandle(data)
        }
        else if(data.selectedUser == -2)
        {
            endProcess()
        }
        else
        {
            manageSingleUser(data.selectedUser)
        }
        
    })

}

async function manageSingleUser(user)
{
    let choice = [
        {
            
        },
        {
            name: "Bannir",
            value:"ban"    
        },
        {
            name: "Révoquer des droits",
            value:"revokRight"    
        },
        {
            name: "Ajouter des droits",
            value:"addRight"    
        },
        {
            name:"Retournez à la liste des membres.",
            value:-1
        }
    ]
    choice.push(returnObjectLeave())

    await ask(
        {
            message:"Choissisez une action pour l'utilisateur : " + user.username,
            type:"list",
            choices:choice,
            name:"selectedChoices"
        }
    ).then((data)=>
    {
        if(data.selectedChoices == -1)
        {
            manageUser()
        }
        else if(data.selectedChoices == -2)
        {
            endProcess()
        }
        else if(data.selectedChoices == "ban")
        {
            banUsr(user)
        }
        else if(data.selectedChoices == "revokRight")
        {
            revokRights(user)
        }
        else if(data.selectedChoices == "addRight")
        {
            //todo add rights
        }
    })
}

async function banUsr(user)
{
    
    await ask(
        {
            type:"confirm",
            message: "Voulez vous vraiment bannir l'utilisateur : " + user.username ,
            name:"do"
        }).then((data)=>
        {
            console.log("a tester taleur")
            manageSingleUser(user)
            //user.ban()
        }).catch((e)=>{console.log(e)})
    
}
async function revokRights(user)
{
    let txt = ""
    let choice = []
    let member = objActualServer.server.fetchMember(user)
    await member.then((data)=>
    {
        member = data
        data._roles.forEach((role)=>
        {
            getRolebYiD(role).then((test)=>
            {
                if(test != undefined)
                {
                    choice.push(
                        {
                            name:test.name,
                            value:test.id
                        }
                    )
                }
            })
        })
    })
    if(choice.length == 0)
        {
            txt += "L'utilisateur : " +user.username+" ne possède aucun rôle sur ce serveur."
            choice.push
            (
                {
                    name:"Retournez a l'écran des choix pour l'utilisateur : "+user.username,
                    value: -1
                }
            )
            choice.push(returnObjectLeave())
        }
        else
        {
            txt += "Quelle droit voulez vous supprimer pour l'utilisateur : " +user.username
        }

        await ask(
            {
                type:"list",
                message:txt,
                name:"answer",
                choices:choice
            })
            .then((answer)=>
            {
                if(answer.answer == -1)
                {
                    manageSingleUser(user)
                }
                else if(answer.answer == -2)
                {
                    endProcess()
                }
                else
                {
                    doRevokRighs(member , answer.answer)
                    manageSingleUser(user)
                }
            }).catch((e)=>{console.log("error ask revokerights : "+e)})
        
    
}
    
async function getRolebYiD(id)
{
    return role = objActualServer.server.roles.find((roles)=>
    {
        return roles.id == id
    })
    return await role
    
        
}
async function doRevokRighs(user , role)
{
    user.removeRole(role).then(()=>
    {
        log.sendLog(loggedAccount.username , "Suppression du Rôle : " + role + " Pour l'utilisateur : " + user.nickname )
    })
}
async function ask(obj)
{
  return await inquirer.prompt(obj)
}

function returnObjectLeave()
{
    return { name: "Arreter le programme" , value: -2}
}

function endProcess()
{
    process.exit()
}
class actualServer
{
    constructor()
    {
        this.server = null
    }
}

module.exports.test = gestionServer;