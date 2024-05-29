// src/api/weatherService.ts
import axios from "axios";
import { Weather } from "./userModel";
import sequelize from "./pgConfig";

const geoCodingAPI = "https://api.api-ninjas.com/v1/geocoding";
const weatherAPI = "https://weatherapi-com.p.rapidapi.com/current.json";
const weatherAPIKey = "f9e500fa3emshb9890324b6faed0p12b3a2jsn971f1df4ced8";
const geoCodingAPIKey = "GS5oPDUh3MJ7emyaKwo5Bw==hOlrumnBpLPEXUdo";

async function fetchCoordinates(city: string, country: string) {
  const response = await axios.get(geoCodingAPI, {
    params: { city, country },
    headers: { "X-Api-Key": geoCodingAPIKey }  // Correct header key for API Ninjas
  });
  return response.data[0];
}

async function fetchWeather(latitude: number, longitude: number) {
  const response = await axios.get(weatherAPI, {
    params: { q: `${latitude},${longitude}` },
    headers: {
      "X-RapidAPI-Key": weatherAPIKey,  // Correct header key for RapidAPI
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com"  // Host header as specified by RapidAPI
    }
  });
  return response.data.current;
}

async function saveWeatherData(
  city: string,
  country: string,
  weather: string,
  longitude: number,
  latitude: number
) {
  const weatherData = await Weather.create({
    city,
    country,
    weather,
    time: new Date(),
    longitude,
    latitude
  });
  return weatherData;
}

async function getWeatherData(city?: string) {
  if (city) {
    return await Weather.findAll({ where: { city } });
  }
  const latestWeather = await Weather.findAll({
    attributes: [
      'city',
      'country',
      [sequelize.fn('MAX', sequelize.col('time')), 'time'],
      'weather',
      'longitude',
      'latitude'
    ],
    group: ['city', 'country', 'weather', 'longitude', 'latitude']
  });
  return latestWeather;
}

export { fetchCoordinates, fetchWeather, saveWeatherData, getWeatherData };
