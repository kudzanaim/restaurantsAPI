const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const cors = require('cors')();
const DistCalc = require('./distanceCalc');
const template = require('./template')

// Data Store:
const DB = require('./store');

// App Init:
const app = express();

// Set Cors:
app.use(cors);

// Repeated Codes:
const distanceAndBlacklistFunc = ({restaurant, data, key, userid, location})=>{
    const {longitude, latitude} = location.data;
    const distance = DistCalc({lng : longitude, lat: latitude}, {lat:restaurant.latitude, lng :restaurant.longitude});
    const blacklisted = (data.users[userid]['blacklisted'][key])? true : false;
    return {distance, blacklisted}
};
// Set New State & Update Database:
const databaseUpdate = async ({res, data, userid, user, restaurant, type})=>{
    // Define New State:
    const newState = {...data, users:{...data.users, [userid]:user }};
    // Update Database:
    await DB.update(data);
    
    return res.send(template.blacklistFavourite(restaurant.name, type))
}

// List All Restaurants:
app.get('/', async(req,res)=>{
    return res.status(200).send(`
    <div style="width:100%; padding-top:150px; text-align:center">
        <h1 style="font-size:60px">Welcome to my Restaurants API</h1>
        <br/> 
        <p style="font-size: 20px;font-family: monospace;">This is a NodeJS API for helps member to decide where to dine.</p>
    </div>
`)
});
// List All Restaurants:
app.get('/:userid', async(req,res)=>{
    const userid = req.params.userid;
    const location = await axios.get(`http://api.ipstack.com/${req.ip}?access_key=c33afbf8f98d873b6f3cc3104af4726b`).then(response => response).catch(error => error);
    const data = await DB.get();
    let restaurantList = ``;

    // Map thru restaurants, calculate distances:
    for(key in data.restaurants){
        const r =  data.restaurants[key];
         // Calculate distance and Check if Blacklisted:
         const D = distanceAndBlacklistFunc({restaurant:r, data, key, userid, location});
        // Filter blacklisted Restaurants:
        if(!D.blacklisted){
            restaurantList += template.item(r, D.distance);
        }
    }
    
    return res.send(template.container(restaurantList, 'All Restaurants'))
});

// Filter by Distance:
app.get('/:userid/distance/:milesToFilterBy', async(req,res)=>{
    const {userid, milesToFilterBy} = req.params;
    const data = await DB.get();
    const location = await axios.get(`http://api.ipstack.com/${req.ip}?access_key=c33afbf8f98d873b6f3cc3104af4726b`).then(response => response).catch(error => error);
    let restaurantList = ``;
    
    // Map thru restaurants:
    for(key in data.restaurants){
        const r =  data.restaurants[key];
        // Filter items within the distance limit:
        if(distance <= milesToFilterBy){
            // Calculate distance and Check if Blacklisted:
            const D = distanceAndBlacklistFunc({restaurant:r, data, key, userid, location});
            // Filter blacklisted Restaurant:
            if(! D.blacklisted){
                restaurantList += template.item(r,  D.distance);
            }
        }
    }

    return res.send(  template.container(restaurantList, `Restaurants within ${milesToFilterBy} miles`) )

});

// Blacklist restaurant:
app.get('/:userid/blacklist/:restaurant_id', async(req,res)=>{
    const {userid, restaurant_id} = req.params;
    const data = await DB.get();
    const user = data.users[userid];
    const restaurant = data.restaurants[restaurant_id];
    let type;

    // If User & Restaurant record exists
    if(user && restaurant){
        // Remove from blacklist if already blacklisted:
        (user.blacklisted[restaurant_id])? delete user.blacklisted[ restaurant_id ] : user.blacklisted = {...user.blacklisted, [restaurant_id]:restaurant_id} ;
        (user.blacklisted[restaurant_id])? type = 'unblacklisted' : type = 'blacklisted' ;
        // Define New State & update DB:
        return databaseUpdate({res, data, userid, user, restaurant, type})
    }
    else{
        res.send('User & Restaurant not found!')
    }
    
});

// Favourite restaurant:
app.get('/:userid/favourite/:restaurant_id', async(req,res)=>{
    const {userid, restaurant_id} = req.params;
    const data = await DB.get();
    const user = data.users[userid];
    const restaurant = data.restaurants[restaurant_id];
    let type;
    
    // If User & Restaurant record exists
    if(user && restaurant){
        // Remove from blacklist if already blacklisted:
        (user.favourites[restaurant_id])? delete user.favourites[ restaurant_id ]  :  user.favourites = {...user.favourites, [restaurant_id]:restaurant_id} ;
        (user.favourites[restaurant_id])? type = 'favourited' : type = 'unfavourited'
        // Define New State & update DB:
        return databaseUpdate({res, data, userid, user, restaurant, type})
    }
    else return res.send('User & Restaurant not found!')

});

// Filter by City / Post Code 
app.get('/:userid/f', async(req,res)=>{
    const {userid} = req.params;
    const {city, postcode} = req.query;
    const location = await axios.get(`http://api.ipstack.com/${req.ip}?access_key=c33afbf8f98d873b6f3cc3104af4726b`).then(response => response).catch(error => error);
    const {longitude, latitude} = location.data;
    const data = await DB.get();
    let restaurantToFilter;

    try{
        // Find city by city name or postcode :
        (city)? restaurantToFilter = _.find(data.restaurants, {city: city}) : (postcode)? restaurantToFilter = _.find(data.restaurants, {postCode: postcode}) : ({});
        // Calculate Distance:
        const distance = DistCalc({lng : longitude, lat: latitude}, {lat:restaurantToFilter.latitude, lng :restaurantToFilter.longitude}); 
        // If Blacklisted:
        const blacklisted = (data.users[userid]['blacklisted'][restaurantToFilter.id])? true : false;
            
        if(!blacklisted) return res.send( template.container(template.item(restaurantToFilter, distance), `Filter by City: ${city}`))
        else return res.send(`No restaurants match this Post Code Query!`)
    }
    catch(e){
        return res.send(`No restaurants match this Post Code Query!`)
    }
});

app.listen(process.env.PORT || 5555, (err) => {
    if (err) {
        console.error(err)
        process.exit(1)
    } else {
        console.log(`Running on ${process.env.PORT || 5555}`)
    }
});

// Handle 404
app.use(function(req, res) {
    res.status(404).send(`
        <div style="width:100%; padding-top:150px; text-align:center">
            <h1 style="font-size:60px">404</h1>
            <br/> 
            <p style="font-size: 20px;font-family: monospace;">Invalid Route Request</p>
        </div>
    `);
});
