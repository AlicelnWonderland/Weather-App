const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const WEATHER_API_KEY = 'f5340892f72f42a281c53948251501';
const GEOCODING_API_KEY = '35c705134487442db28399ccb409bfbf';
const AIR_QUALITY_API_KEY = 'ea9062db-fc1c-4578-aead-02988f55d886';

function getWeather(city, callback) {
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}`;
    https.get(apiUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            try {
                const weatherData = JSON.parse(data);
                callback(null, weatherData);
            } catch (error) {
                callback(error);
            }
        });
    }).on('error', (error) => {
        callback(error);
    });
}

// OpenCage API
function getCoordinates(city, callback) {
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${GEOCODING_API_KEY}`;
    https.get(apiUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            try {
                const geoData = JSON.parse(data);
                if (geoData.results && geoData.results.length > 0) {
                    const { lat, lng } = geoData.results[0].geometry;
                    callback(null, { lat, lng });
                } else {
                    callback(new Error('No coordinates found.'));
                }
            } catch (error) {
                callback(error);
            }
        });
    }).on('error', (error) => {
        callback(error);
    });
}

// IQAir API
function getAirQuality(lat, lng, callback) {
    const apiUrl = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lng}&key=${AIR_QUALITY_API_KEY}`;
    https.get(apiUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            try {
                const airQualityData = JSON.parse(data);
                callback(null, airQualityData);
            } catch (error) {
                callback(error);
            }
        });
    }).on('error', (error) => {
        callback(error);
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/weather') {
        const city = parsedUrl.query.city;

        if (!city) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Please provide a city using the "city" query parameter.' }));
            return;
        }

        getCoordinates(city, (geoError, coordinates) => {
            if (geoError) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error fetching coordinates.' }));
                return;
            }

            const { lat, lng } = coordinates;

            getWeather(city, (weatherError, weatherData) => {
                if (weatherError) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error fetching weather data.' }));
                    return;
                }

                getAirQuality(lat, lng, (airQualityError, airQualityData) => {
                    if (airQualityError) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error fetching air quality data.' }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        weather: {
                            location: weatherData.location.name,
                            region: weatherData.location.region,
                            country: weatherData.location.country,
                            temperature: weatherData.current.temp_c,
                            feels_like: weatherData.current.feelslike_c,
                            condition: weatherData.current.condition.text,
                            icon: weatherData.current.condition.icon,
                            humidity: weatherData.current.humidity,
                            pressure: weatherData.current.pressure_mb,
                            wind_speed: weatherData.current.wind_kph,
                            rain: weatherData.current.precip_mm || 0,
                        },
                        coordinates: { lat, lng },
                        air_quality: {
                            city: airQualityData.data.city,
                            state: airQualityData.data.state,
                            country: airQualityData.data.country,
                            aqi: airQualityData.data.current.pollution.aqius,
                            main_pollutant: airQualityData.data.current.pollution.mainus,
                        }
                    }));
                });
            });
        });
    } else if (pathname === '/') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
