//servers-side processing for fetching the data
const express = require('express');
const cors  = require('cors');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
require('dotenv').config({ path: '../.env' });
const app = express();
const mongoose = require('mongoose');
app.use(cors());
//console.log(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL);


async function fetchAndParse(url){
    try {
        const response = await fetch(url);
        if(!response.ok)
            throw new Error('HTTP error');
        const xmlData = await response.text();
        //console.log(xmlData);
        // return a json
        return new Promise((resolve, reject) => {
            parser.parseString(xmlData, (err, result) => {
                if(err) return reject(err);
                resolve(result);
            });
        });
    }catch(error){
        console.log("Error fetching or parsing XML.");
        console.log(error);
        throw error;
    }
}


const locSet = {};

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    const EventSchema = mongoose.Schema({
        eventId:{
            type: Number,
            required: true,
            unique: true
        },
        title: {
            type: String,
            required: true
        },
        locId:{
            type: Number,
            required: true
        },
        date:{
            type: String,
            required: true
        },
        description: {
            type: String
        },
        presenter: {
            type: String
        },
        price: {
            type: Number,
            required: false
        }// hk dollar
    });
    
    const LocationSchema = mongoose.Schema({
        locId: {
            type: Number,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        latitude: {
            type: Number,
            required: true,
            min: 0
        },
        longitude: {
            type: Number,
            required: true,
            min: 0
        },
        shown:{
            type: Boolean
        }// true or false
    });
    
    const Event = mongoose.model('Event', EventSchema);
    const Location = mongoose.model('Location', LocationSchema);

async function clearData(){
        await Event.deleteMany({});
        await Location.deleteMany({});
    }

// in total 1024 events, so not all of it?
async function processData(){
    try{
        // if its return is a promise, then use await and async
        eventData = await fetchAndParse('https://www.lcsd.gov.hk/datagovhk/event/events.xml');
        venueData = await fetchAndParse('https://www.lcsd.gov.hk/datagovhk/event/venues.xml');
        //console.log(eventData);
        partial_events = eventData.events.event.slice(0, 200);
        const eventsPromises = [];

    for (const element of partial_events) {

            const eId = Number(element['$'].id);
            const eTitle = String(element.titlee);
            const lId = Number(element.venueid);
            const date = String(element.predateE);

            // Increment locSet.lId safely
            if (!(String(lId) in locSet)) {
                locSet[String(lId)] = 1;
            } else {
                locSet[String(lId)] += 1;
            }

            let description = element.desce ? String(element.desce) : '';
            let price = element.pricee ? parseFloat(String(element.pricee).replace('$', '')) : undefined;

            // Create event and push the promise to the array
            eventsPromises.push(
                Event.create({
                    eventId: eId,
                    title: eTitle,
                    locId: lId,
                    date: date,
                    description: description,
                    price: typeof price === 'number' && !isNaN(price) ? price : undefined
                })
            );
    }

    // Wait for all events to be created
    await Promise.all(eventsPromises);

    let cnt = 0;
    const locationPromises = [];
    for(element of venueData.venues.venue){
        const vId = Number(element['$'].id);
        const name = String(element.venuee);
        let longitude; let latitude;
        if(element.longitude && element.latitude)
        {
            longitude = Number(element.longitude);
            latitude = Number(element.latitude);
        }
        let display = false;
        if(locSet[String(vId)] && locSet[String(vId)] >= 3)
            display = true;
        if(display)
            cnt ++;
        locationPromises.push(
            Location.create({
                locId: vId,
                name: name,
                longitude: longitude,
                latitude: latitude,
                shown: display
            })
        );
    }
    await Promise.all(locationPromises);
    console.log(locSet);
    console.log(cnt);
    } catch(error){
        console.log(error);
    }
}

clearData();
processData();

app.get('/events/all', async (req, res) => {
    try{
        const partialEvents = await Event.find({});
        res.status(200).json(partialEvents);
    }catch(error){
        res.status(500).send("Failed to get events");
    }
});

app.get('/events/:eventID', async (req, res) => {
    try{
    const eventID = Number(req.params.eventID);
    const result = await Event.findOne({ eventId: { $eq: eventID }});
    res.status(200).json(result);
    if(!result)
        res.status(404).send("Event not found");
}catch(error){
    res.status(404).send("Event not found");
}
});

app.get('/locations/show', async (req, res) => {
    try{
        const locationShown = await Location.find({ shown: { $eq: true} });
        res.status(200).json(locationShown);
    }catch(err){
        res.status(404).send(err);
    }
});

app.get('/location/:locationID', async(req, res) => {
    try{
        const id = req.params.locationID;
        const locationGet = await Location.findOne({ locId: {$eq: id} });
        res.status(200).json(locationGet);
        if(!locationGet)
            res.status(404).send('location not found');
    }catch(err){
        res.send(err);
    }
});

});
const PORT = process.env.PORT;
const server = app.listen(PORT);