// src/api/weatherRoutes.ts
import { Router } from 'express';
import axios from 'axios';
import {fn, col } from 'sequelize';
import Weather from './userModel';
import sequelize from './pgConfig';
import nodemailer from 'nodemailer';

const router = Router();

// Replace with your actual API keys
const GEO_CODING_API_KEY = 'GS5oPDUh3MJ7emyaKwo5Bw==hOlrumnBpLPEXUdo';
const WEATHER_API_KEY = 'f9e500fa3emshb9890324b6faed0p12b3a2jsn971f1df4ced8';

router.post('/SaveWeatherMapping', async (req, res) => {
  const cities = req.body;

  try {
    for (const cityInfo of cities) {
      const { city, country } = cityInfo;

      // Get coordinates
      const geoResponse = await axios.get(`https://api.api-ninjas.com/v1/geocoding?city=${city}&country=${country}`, {
        headers: { 'X-Api-Key': GEO_CODING_API_KEY },
      });

      const { latitude, longitude } = geoResponse.data[0];

      // Debug: Log the response from geocoding API
      console.log(`GeoCoding API Response for ${city}, ${country}:`, geoResponse.data);

      // Get weather
      const weatherResponse = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`);

      const weather = weatherResponse.data.current.condition.text;
      const time = new Date();

      // Save to database
      await Weather.create({ city, country, weather, time, longitude, latitude });
    }

    res.status(201).send('Weather data saved successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while saving weather data.');
  }
});

router.get('/weatherDashboard', async (req, res) => {
  const { city } = req.query;

  try {
    if (city) {
      const weatherData = await Weather.findAll({ where: { city }, order: [['time', 'DESC']] });
      res.json(weatherData);
    } else {
      const weatherData = await Weather.findAll({
        group: ['city','country'],
        attributes: ['city', 'country', [sequelize.fn('max', sequelize.col('time')), 'time']],
        raw: true,
      });
      res.json(weatherData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the weather dashboard.');
  }
});

router.post('/MailWeatherData', async (req, res) => {
  const cities = req.body;

  try {
    let emailContent = '<table><tr><th>ID</th><th>City</th><th>Country</th><th>Weather</th><th>Time</th><th>Longitude</th><th>Latitude</th></tr>';

    for (const cityInfo of cities) {
      const { city } = cityInfo;
      const weatherData = await Weather.findAll({ where: { city }, order: [['time', 'DESC']], limit: 1 });

      weatherData.forEach((data) => {
        emailContent += `<tr><td>${data.id}</td><td>${data.city}</td><td>${data.country}</td><td>${data.weather}</td><td>${data.time}</td><td>${data.longitude}</td><td>${data.latitude}</td></tr>`;
      });
    }

    emailContent += '</table>';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'snehasinghrajput0206@gmail.com',
        pass: 'yourpassword',
      },
    });

    const mailOptions = {
      from: 'youremail@gmail.com',
      to: 'recipent@gmail.com',
      subject: 'Weather Data',
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send('Weather data emailed successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while sending weather data.');
  }
});

export default router;
