//import sequelize from "sequelize";
import { Sequelize } from "sequelize";

const sequelize=new Sequelize({
    username:'postgres',
    host:'localhost',
    database:"weatherDB",
    password:"yourPass",
    port:5432,
    dialect:"postgres",
});

sequelize.authenticate().then(()=>{
    console.log('database connection established successfully.');
})
.catch((err:any)=>{
    console.error('unable to connect to database:', err)
});

sequelize.sync()
.then(()=>{
    console.log('Models synchronized with the database.');
})
.catch((err:any)=>{
    console.error('Unable to synchronize models with the database:', err);
});

export default sequelize; 