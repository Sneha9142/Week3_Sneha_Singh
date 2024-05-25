// src/app.ts
import express from 'express';
//import bodyParser from 'body-parser';
import sequelize from './pgConfig';
import weatherRoutes from './routing';

const app = express();

app.use(express.json());

app.use('/api', weatherRoutes);

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

export default app;