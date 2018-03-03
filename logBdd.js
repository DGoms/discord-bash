const isNullOrUndefined = require('util').isNullOrUndefined;
const ConfigManager = require("./ConfigManager").ConfigManager;
const Sequelize = require("sequelize")
const path = require("path")

class bddCon {
	static async getInstance(){
		if(isNullOrUndefined(bddCon.instance)){
			bddCon.instance = await bddCon.init();
		}
		return bddCon.instance;
	}

	static async init(){
		let bdd = new bddCon();
		try {
			let config = await ConfigManager.getLogServer()
				bdd.sequelize = new Sequelize("node", "root", "root",
					{
						host: "52.24.252.99",
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

					bdd.log = bdd.sequelize.define('logs',
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

				return bdd;
		}
		catch (e) {
			return false;

		}
	}

	constructor() {
		
	}

	async addLog(user, msg) {
		try {
			return await this.sequelize.sync()
				.then(() => {
					this.log.create(
						{
							name: user,
							action: msg
						})
				})
		}
		catch (e) {
			console.log(e)
		}
	}


}
async function sendLog(user, msg) {
	let bdd = await bddCon.getInstance();
	if (bdd == false) {
		throw new error(0)
	}
	return bdd.addLog(user, msg)



}

module.exports.sendLog = sendLog;

