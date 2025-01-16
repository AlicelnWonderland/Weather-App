**Group: SE-2303**
**Yerniyaz Balgabev**
This Node.js application retrieves weather data, geolocation coordinates, and air quality information based on the city provided through an API. It uses three main APIs:
![alt text](https://github.com/AlicelnWonderland/Weather-App/blob/main/Pic1.jpg?raw=true)
WeatherAPI for current weather information.
OpenCage for geocoding (getting coordinates from a city name).
IQAir for air quality data.
![alt text](https://github.com/AlicelnWonderland/Weather-App/blob/main/Pic2.jpg?raw=true)
API keys:

WEATHER_API_KEY for accessing WeatherAPI.
GEOCODING_API_KEY for accessing OpenCage to get coordinates.
AIR_QUALITY_API_KEY for accessing IQAir to fetch air quality data.

Functions:
getWeather(city, callback): Fetches the current weather for a given city using the WeatherAPI. It returns details like temperature, humidity, wind speed, etc.
getCoordinates(city, callback): Uses OpenCage API to retrieve the latitude and longitude of the given city.
getAirQuality(lat, lng, callback): Uses IQAir to get air quality information based on latitude and longitude (including AQI, main pollutant, etc.).
Server Setup
The server is created using the http module. When a user accesses the /weather endpoint with a city query parameter, the server:

Retrieves the city coordinates using getCoordinates.
Fetches weather data with getWeather.
Retrieves air quality data using getAirQuality.
If any error occurs during these API requests (e.g., no city or failed API responses), appropriate error messages are sent back in JSON format.

Serving HTML Page

The server also serves an index.html file when accessing the root URL
Server Response:

The server responds with a JSON object containing:
Weather data (temperature, humidity, wind speed, etc.)
Coordinates (latitude and longitude)
Air quality data (AQI, main pollutant)


