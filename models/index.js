require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const mysql = require('mysql2');

const basename = path.basename(__filename);
// eslint-disable-next-line import/no-dynamic-require
const config = require(`${__dirname}/../config/sequelizeConfig`);
const db = {};
let sequelize = {};
const OPERATIONAL_DB_NAME = process.env.OPERATIONAL_DB_NAME || 'operationaldb';

const connection = mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
});
connection.query(`CREATE DATABASE IF NOT EXISTS \`${OPERATIONAL_DB_NAME}\`;`);

if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(OPERATIONAL_DB_NAME, config.username, config.password, config);
}

fs
    .readdirSync(__dirname)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
    .forEach((file) => {
        // eslint-disable-next-line global-require,import/no-dynamic-require
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
