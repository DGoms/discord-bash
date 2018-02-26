const fs = require('fs')
const isNullOrUndefined = require('util').isNullOrUndefined;

const pathFile = __dirname + "/config.json";

class ConfigManager{ 

    static async getToken(){
        let config = await this.getConfig();
        return config.token;
    }

    static async getLogServer(){
        let config = await this.getConfig();
        return config.logServer;
    }

    /**
	 * Set the token in file
	 * @param {string} token 
	 * @returns {Promise} Resolve true if token setted, else false
	 */
    static async setToken(token){
        let config = await ConfigManager.getConfig();
        config.token = token;
        return this.save(config);
    }

    static async setLogServer(ip, db, user, password){
        let config = await ConfigManager.getConfig();

        config.logServer.ip = ip;
        config.logServer.db = db;
        config.logServer.user = user;
        config.logServer.password = password;

        return this.save(config);
    }

    static async getConfig(){
        return new Promise((resolve, reject) => {
            fs.readFile(pathFile, "utf8", (err, data) => {
                if(err)
                    resolve({});
                else
                    resolve(JSON.parse(data));
            });
        });
    }

    static async save(config){
        return new Promise((resolve, reject) => {
            fs.writeFile(pathFile, JSON.stringify(config, null, 4), "utf8", (err) => {
                if (err)
                    resolve(false);
                
                resolve(true);
            })
        });
    }
}

module.exports.ConfigManager = ConfigManager;