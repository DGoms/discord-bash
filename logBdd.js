

const Sequelize = require("sequelize")
const path = require("path")

class bddCon
{
	constructor()
	{
		try
		{
			this.sequelize = new Sequelize('node', 'root', 'root',
			{
				host: '52.2.252.99',
				dialect: 'mysql',
				logging: false,

				pool:
				{
					max: 5,
					min: 0,
					acquire: 30000,
					idle: 10000
				},


				// http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
				operatorsAliases: false
			});

			this.log = this.sequelize.define('logs',
			{
				id:
				{
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true
				},
				name: Sequelize.STRING,
				action: Sequelize.STRING
			});

			return true;
		}
		catch (e)
		{
			return false
			
		}
	}

	async addLog(msg)
	{
		try
		{
			return await this.sequelize.sync()
				.then(() =>
				{
					this.log.create(
					{
						name: process.env['USERPROFILE'].split(path.sep)[2],
						action: msg
					})
				})
		}
		catch (e)
		{
			console.log(e)
		}
	}


}
 function sendLog(msg)
{
	let bdd = new bddCon()
	if(bdd == false)
	{
		throw new error(0)
	}
	return bdd.addLog(msg)
	
	

}

module.exports.sendLog = sendLog;

