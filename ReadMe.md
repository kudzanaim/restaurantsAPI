## Description
API Accessible here: https://restaurants-5y2rgpn7la-uc.a.run.app

This is a NodeJS API for helps member to decide where to dine. The API service allows for the following operations:
- List All restaurants
- Filter by City, Postcode or Distance in Miles
- Un/Blacklist & Un/Favoriting restaurants 
- Once blacklisted, a restaurant is listed ONLY in the user’s blacklist and won't show up anywhere else to the user

All the above functionality is accessible through the following RESTful Endpoints:
- Show All Restaurants: `/?user=USER_ID`
- Filter by City or Postcode: `/:userid/f? city=CITY_NAME postcode=POSTCODE`  e.g. filter by city, `/1/f?city=Hamilton`
- Show All Distance: `/USER_ID/distance/:milesToFilterBy` e.g. userid 1 wants filters restaurants within 55 miles => `/1/distance/55`
- Favourite a restaurant: `/:userid/favourite/:restaurant_id`, use the same endpoint to unfavourire
- Blacklist a restaurant: `/:userid/blacklist/:restaurant_id`, use the same endpoint to unblacklist

Application is contanirized in docker, deployed to Google Cloud Build, then served from Google Cloud Run. Continuous Intergration trigger setup to sync, containerize and deploy new commits to GitHub Master. 

### `Instructions`
Test the API in a browser. Endpoints return data in HTML/CSS format for testing/viewing purpose. The return data can be easily changed to be return as JSON format for further consumption.

### `Datastore`
The app uses Firebase realtime database, a NoSql datastore. Its simple to setup and free. 

### `Technologies Used`
- NodeJS
- Docker
- Google Cloud Build & Cloud Run
- api.ipstack.com for getting client geolocation from Ip address. (On Free plan)

### `NPM Packages`
- Lodash
- Axios
- Express
- Jquery
- Cors