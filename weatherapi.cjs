const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Replace with your WeatherAPI key
const API_KEY = 'f5340892f72f42a281c53948251501';

// Function to fetch weather data from WeatherAPI
function getWeather(city, callback) {
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`;

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

// Create the HTTP server
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

        getWeather(city, (error, weatherData) => {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error fetching weather data.' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    location: weatherData.location.name,
                    region: weatherData.location.region,
                    country: weatherData.location.country,
                    temperature: weatherData.current.temp_c,
                    condition: weatherData.current.condition.text
                }));
            }
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
