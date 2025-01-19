import 'dotenv/config'
import weather from 'openweather-apis'

export class WeatherClient {
    constructor() {
        weather.setLang('en')
        weather.setUnits('metric')
        weather.setCity('Bangalore')
        weather.setAPPID(process.env['OPEN_WEATHER_API_KEY'])
    }

    /**
     * Fetches the current weather temperature from the OpenWeather API
     * @param {string} city - Name of the city to get Temperature for
     * @returns {Promise<string>} Temperature in °C or null if error
     */
    async getTemperature(city = 'Bangalore') {
        weather.setCity(city)
        return new Promise((resolve, reject) => {
            weather.getTemperature(function(err, temp){
                if (err) {
                    reject(err)
                } else {
                    resolve(`${temp}°C`)
                }
            })
        })
    }
}
