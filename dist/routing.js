"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/weatherRoutes.ts
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const userModel_1 = __importDefault(require("./userModel"));
const pgConfig_1 = __importDefault(require("./pgConfig"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = (0, express_1.Router)();
// Replace with your actual API keys
const GEO_CODING_API_KEY = 'GS5oPDUh3MJ7emyaKwo5Bw==hOlrumnBpLPEXUdo';
const WEATHER_API_KEY = 'f9e500fa3emshb9890324b6faed0p12b3a2jsn971f1df4ced8';
router.post('/SaveWeatherMapping', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cities = req.body;
    try {
        for (const cityInfo of cities) {
            const { city, country } = cityInfo;
            // Get coordinates
            const geoResponse = yield axios_1.default.get(`https://api.api-ninjas.com/v1/geocoding?city=${city}&country=${country}`, {
                headers: { 'X-Api-Key': GEO_CODING_API_KEY },
            });
            const { latitude, longitude } = geoResponse.data[0];
            // Debug: Log the response from geocoding API
            console.log(`GeoCoding API Response for ${city}, ${country}:`, geoResponse.data);
            // Get weather
            const weatherResponse = yield axios_1.default.get(`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`);
            const weather = weatherResponse.data.current.condition.text;
            const time = new Date();
            // Save to database
            yield userModel_1.default.create({ city, country, weather, time, longitude, latitude });
        }
        res.status(201).send('Weather data saved successfully.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while saving weather data.');
    }
}));
router.get('/weatherDashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { city } = req.query;
    try {
        if (city) {
            const weatherData = yield userModel_1.default.findAll({ where: { city }, order: [['time', 'DESC']] });
            res.json(weatherData);
        }
        else {
            const weatherData = yield userModel_1.default.findAll({
                group: ['city', 'country'],
                attributes: ['city', 'country', [pgConfig_1.default.fn('max', pgConfig_1.default.col('time')), 'time']],
                raw: true,
            });
            res.json(weatherData);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the weather dashboard.');
    }
}));
router.post('/MailWeatherData', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cities = req.body;
    try {
        let emailContent = '<table><tr><th>ID</th><th>City</th><th>Country</th><th>Weather</th><th>Time</th><th>Longitude</th><th>Latitude</th></tr>';
        for (const cityInfo of cities) {
            const { city } = cityInfo;
            const weatherData = yield userModel_1.default.findAll({ where: { city }, order: [['time', 'DESC']], limit: 1 });
            weatherData.forEach((data) => {
                emailContent += `<tr><td>${data.id}</td><td>${data.city}</td><td>${data.country}</td><td>${data.weather}</td><td>${data.time}</td><td>${data.longitude}</td><td>${data.latitude}</td></tr>`;
            });
        }
        emailContent += '</table>';
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'snehasinghrajput0206@gmail.com',
                pass: 'zrffkwikpcbgdleg',
            },
        });
        const mailOptions = {
            from: 'snehasinghrajput0206@gmail.com',
            to: 'lalkumarsanu98@gmail.com',
            subject: 'Weather Data',
            html: emailContent,
        };
        yield transporter.sendMail(mailOptions);
        res.status(200).send('Weather data emailed successfully.');
    }
    catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while sending weather data.');
    }
}));
exports.default = router;
//# sourceMappingURL=routing.js.map