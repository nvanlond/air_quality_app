# Air Quality Dashboard

## Project Description
This dashboard is a web application that allows users to look up PM2.5 air quality data
for cities using the OpenAQ API. Users can visit the AQ lookup page to submit a city and
optionally a date to view historic air quality data. Users can also post and view comments
below each city to discuss observations.

Vercel Link: https://air-quality-app-eta.vercel.app/

## Target Browsers
- Google Chrome v90+
- Mozilla Firefox v85+
- Safari macOS Catalina+

Interface not optimized for mobile use

## Installation and Setup

### 0. Project Dependencies

- Node.js (v16+)

### 1. Clone the Repository

*in terminal*
git clone https://github.com/nvanlond/air_quality_app
cd  air-quality-dashboard

### 2. Install Dependencies
*in terminal*
npm install

### 3. Create .env file in root directory
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_api_key
OPENAQ_KEY=your_openaq_api_key

### 4. Running the Application

npm start

## API Information
### "GET /openaq/pm25"
#### Query Parameters
- bbox: bounding box for coordinates (Lon1, Lat1, Lon2, Lat2)
- start: start date string (YYYY-MM-DD)
- end: end date string (YYYY-MM-DD) 
Returns monthly average PM2.5 values grouped by timestamp

The app limits OpenAQ sensor queries to the first 10 sensors to improve performance.
bbox is calculated by converting city input to coordinates using OpenStreetMap geocoding API. 

### "GET /comments"
#### Query Parameters
- city: city name (required)
Returns array from SupaBase table of user comments tied to that city

### "POST /comments"
Expects JSON body containing:
"username": "string",
"comment": "string",
"city": "string",

## Known  Bugs
- Comments are case-sensitive ("New York" will return different comments from "new york")
- Chart will fail if no data is received with no feedback
- Comments table may duplicate upon double click of "Get PM2.5 Data"
- Spam Clicking "Get PM2.5 Data" slows down performance with excessive API calls
- No ability to create account so username doesnt really mean anything
- Research user more datapoints and sensors for aq data

## Road Map for Future Development
- Add ability to fetch other air quality indicators besides PM2.5 Level
- Potenital dual chart overlay capability to allow for aq data comparison between cities
- Optimize for mobile functionality
- Potentially improve slider functionality
- Fix Known Bugs

Author: Niels van Londen
Questions?
Contact: nielsvlonden@gmail.com