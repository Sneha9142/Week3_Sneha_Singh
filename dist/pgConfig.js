"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import sequelize from "sequelize";
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize({
    username: 'postgres',
    host: 'localhost',
    database: "weatherDB",
    password: "Sneha@123",
    port: 5432,
    dialect: "postgres",
});
sequelize.authenticate().then(() => {
    console.log('database connection established successfully.');
})
    .catch((err) => {
    console.error('unable to connect to database:', err);
});
sequelize.sync()
    .then(() => {
    console.log('Models synchronized with the database.');
})
    .catch((err) => {
    console.error('Unable to synchronize models with the database:', err);
});
exports.default = sequelize;
//# sourceMappingURL=pgConfig.js.map