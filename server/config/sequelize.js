const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize = null;
try {
    // Initialize Sequelize with SQLite
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../database.sqlite'),
        logging: false
    });
} catch (error) {
    console.warn('\n[Warning] Unable to initialize Sequelize: ' + error.message);
    console.warn('[Warning] Running app without Sequelize features.\n');
}

const connectSequelize = async () => {
    if (!sequelize) return;
    try {
        await sequelize.authenticate();
        console.log('Sequelize connected to SQLite successfully.');
        // Sync models
        await sequelize.sync();
    } catch (error) {
        console.error('Unable to connect to the SQL database:', error);
    }
};

module.exports = { sequelize, connectSequelize };
