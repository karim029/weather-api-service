# Weather API Wrapper Service

A lightweight Node.js + Express wrapper around the [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api/), with Redis caching to reduce redundant upstream calls.

Built as part of the [roadmap.sh Weather API Wrapper Service project](https://roadmap.sh/projects/weather-api-wrapper-service).

## How it works

1. Client requests weather for a city: `GET /weather?city=London`
2. The city name is normalized (lowercased, trimmed) and used as a Redis cache key
3. If a cached response exists, it's returned immediately — no call to the upstream API
4. If not (cache miss or expired), the server fetches fresh data from Visual Crossing, caches it in Redis with a 12-hour expiry, and returns it

Caching exists to avoid hitting Visual Crossing's rate limits and to keep response times fast, since weather data doesn't meaningfully change minute to minute.

## Stack

- Node.js + Express
- Redis (local, via WSL) for caching, using the official `redis` npm client
- Visual Crossing Weather API as the upstream data source

## Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```
2. Make sure Redis is running locally (default `redis://localhost:6379`).
3. Create a `.env` file in the project root:
   ```
   WEATHER_API_KEY=your_visual_crossing_api_key
   REDIS_URL=redis://localhost:6379
   ```
4. Start the server:
   ```
   node index.js
   ```
   Server runs on `http://localhost:3000`.

## Usage

```
GET /weather?city=London
```

Returns the Visual Crossing weather payload for the requested city as JSON.

**Example:**
```
curl "http://localhost:3000/weather?city=London"
```

## Known limitations

- Single-city lookups only (no batch requests)
- No request-level validation beyond upstream error passthrough (e.g. an invalid city name relies on Visual Crossing's own error response)
- Cache TTL is fixed at 12 hours and not configurable via environment variable yet