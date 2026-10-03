import express from 'express'
import 'dotenv/config'
import {createClient} from 'redis'

const app = express()
const port = 3000
const client = createClient({url: process.env.REDIS_URL})
client.on('error', err=> console.log('Redis client error',err))
await client.connect()


const api =  process.env.WEATHER_API_KEY
const baseUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/'

app.get('/weather', async(req,res)=>{
    try {
        const cityQuery = req.query.city
        const location = cityQuery.toLocaleLowerCase().trim()
        const value = await client.get(location)
        if(!value){

            const response = await fetch(`${baseUrl}${location}?key=${api}`)
            if(!response.ok){
                return res.status(response.status).json({
                    error: 'failed to fetch weather data'
                })
            }
            const data = await response.json()
            client.setEx(location,43200,JSON.stringify(data))
           return res.json(data)
        }
        return res.json(JSON.parse(value))
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });

    }
})

app.listen(port, ()=>{
    console.log(`Server running on port: ${port}`)
})