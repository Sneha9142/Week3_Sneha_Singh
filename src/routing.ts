import { Router } from 'express';
import { fetchCoordinates, fetchWeather, saveWeatherData, getWeatherData } from './weatherService';
import nodemailer from 'nodemailer';

const router = Router();

router.post('/SaveWeatherMapping', async (req, res) => {
  const cities = req.body;

  try {
    for (const cityInfo of cities) {
      const { city, country } = cityInfo;

      // Get coordinates
      const { latitude, longitude } = await fetchCoordinates(city, country);

      // Get weather
      const weatherData = await fetchWeather(latitude, longitude);
      const weather = weatherData.condition.text;

      // Save to database
      await saveWeatherData(city, country, weather, longitude, latitude);
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
    const weatherData = await getWeatherData(city as string);
    res.json(weatherData);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the weather dashboard.');
  }
});

router.post('/MailWeatherData', async (req, res) => {
  try {
    const weatherData = await getWeatherData();
    let id=1;

    let emailContent = '<table border="1"><tr><th>ID</th><th>City</th><th>Country</th><th>Weather</th><th>Time</th><th>Longitude</th><th>Latitude</th></tr>';
    weatherData.forEach((data) => {
      emailContent += `<tr><td>${id++}</td><td>${data.city}</td><td>${data.country}</td><td>${data.weather}</td><td>${data.time}</td><td>${data.longitude}</td><td>${data.latitude}</td></tr>`;
    });
    emailContent += '</table>';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'snehasinghrajput0206@gmail.com',
        pass: 'lvlexzfwqpwnssyr',
      },
    });

    const mailOptions = {
      from: 'snehasinghrajput0206@gmail.com',
      to: 'snehasinghrajput0206@gmail.com',
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

