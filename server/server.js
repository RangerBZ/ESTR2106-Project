//servers-side processing for fetching the data
const express = require('express');
const cors  = require('cors');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: '../.env' });
const app = express();
const mongoose = require('mongoose');
const corsOptions = {
    origin: 'http://localhost:3000', // Specify the exact origin
    credentials: true // Enable credentials support
  };
  
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
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

const qualifySet = [];
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

    const UserSchema = mongoose.Schema({
        username: {
            type: String,
            requried: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        admin: {
            type: Boolean,
            required: true
        }
    });

    UserSchema.pre('save', async function (next) {
        if (!this.isModified('password')) return next();
    
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error); // Pass errors to Express error handler
        }
    });

    UserSchema.methods.matchPassword = async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    };
    
    const Event = mongoose.model('Event', EventSchema);
    const Location = mongoose.model('Location', LocationSchema);
    const User = mongoose.model('User', UserSchema);

async function userSetup(){
    try{
    await User.deleteMany({});
    await User.create({
        username: process.env.ADMIN_NAME,
        password: process.env.ADMIN_PASSWORD,
        admin: true
    });
    await User.create({
        username: 'wocBin',
        password: 'Bilibili_cheers_qwq',
        admin: false
    });
}catch(error){
        console.log(error);
    }
}

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
        partial_events = eventData.events.event.slice(0, 550);
        const eventsPromises = [];

    for (const element of partial_events) {

            const eId = Number(element['$'].id);
            const eTitle = String(element.titlee);
            const lId = Number(element.venueid);
            const date = String(element.predateE);
            let presenter = "";
            if(element.presenterorge)
                presenter = String(element.presenterorge);

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
                    presenter: presenter,
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
        if(longitude != 0 && latitude != 0){
        let display;
        display = true;
        if(!locSet[String(vId)] || locSet[String(vId)] < 3){
            display = false;
        }
        if(display){
            for(item of qualifySet){
                //console.log(Math.abs(vId-item.locId));
                if(Math.abs(vId-item.locId) < 10000)
                    display = false;
            }
            qualifySet.push({
                locId: vId,
                name: name,
                longitude: longitude,
                latitude: latitude,
            });
            if(display){
                cnt ++;
            }
        }
        locationPromises.push(
            Location.create({
                locId: vId,
                name: name,
                longitude: longitude,
                latitude: latitude,
                shown: display
            })
        );}
    }
    await Promise.all(locationPromises);
    //console.log(locSet);
    console.log(cnt);
    } catch(error){
        console.log(error);
    }
}

clearData();
processData();
userSetup();

// if login as new user, then is the same as the register
app.post('/login', async (req, res) => {
    try{
        const { username, password } = req.body;
        //console.log(username);
        const existing = await User.findOne({username: {$eq: username}});
        if(!existing){
            res.status(400).send('Invalid user');
        }else{
            if(!existing.matchPassword(password))
                res.status(400).send('Incorrect password');
            const token = jwt.sign({id: existing._id, admin: existing.admin}, process.env.JWT_SECRET, { expiresIn: '2h'});
            //console.log(token);
            //clearData();
            //processData();
            res.cookie('jwt', token, {
                //httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7200000,
                path: '/'
            });
            res.status(202).json({message: 'Login successful', user: { username: existing.username, admin: existing.admin}});
        }
    }catch(error){
        res.status(500).send(error);
    }
});

app.post('/register', async (req, res) => {
    try{
    const { username, password } = req.body;
    const existing = await User.findOne({username: {$eq: username}});
    if(!existing)
        res.status(400).send('Duplicate username');
    else{
        const newUser = new User({ username: username, password: password, admin: false});
        await newUser.save();
        res.status(201).send('User resgistered successfully');
    }}catch(error){
        res.status(500).send(error);
    }
});

app.post('/logout', (req, res) => {
    // Clear the JWT cookie
    res.clearCookie('jwt');
    res.json({ message: 'Logged out successfully' });
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        next();
    });
};

// Apply middleware to protected routes

app.get('/events/all',  async (req, res) => {
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

app.get('/locations/:locationID', async(req, res) => {
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

app.post('/admin/newEvent', authenticateToken, async(req, res) => {
    try{
    const eventID = Number(req.body.eventID);
    const title = req.body.eventTitle;
    const locID = Number(req.body.locationID);
    const date = req.body.date;
    const description = req.body.description;
    const presenter = req.body.presenter;
    const price = Number(req.body.price);
    const check = await Event.findOne({ eventId: eventID });
    if(check){
        res.status(400).send('Duplicate eventID, please use a valid one');
    }
    else{
        await Event.create({
            eventId: eventID,
            title: title,
            locId: locID,
            date: date,
            description: description,
            presenter: presenter,
            price: price
        });
        res.status(200).send('Event created successfully');
    }
}catch(error){
    console.log(error);
}
});

app.post('/admin/modifyEvent', authenticateToken, async(req, res)=>{
    try{
        const eventID = Number(req.body.eventID);
    const title = req.body.eventTitle;
    const locID = Number(req.body.locationID);
    const date = req.body.date;
    const description = req.body.description;
    const presenter = req.body.presenter;
    const price = Number(req.body.price);
    const result = await Event.findOneAndUpdate(
        {eventId:{$eq: eventID}},
        {title: title},
        {locId: locID},
        {date: date},
        {description: description},
        {presenter: presenter},
        {price: price}
    );
    if(!result)
        res.status(404).send('Event not found!');
    res.status(200).send('Event modified successfully');
    }catch(error){
        console.log(error);
    }
});

app.delete('/admin/events/:eventID', authenticateToken, async(req, res) => {
    try{
        const eventID = Number(req.params.eventID);
        // there could be cases when title is the same, and it is not convenient for String to compare
        const result = await Event.findOneAndDelete({ eventId: {$eq: eventID}});
        if(!result)
            res.status(404).send('Event not found!');
        res.status(200).send('Event deleted');
    }catch(err){
        console.log(err);
    }
});

app.post('/admin/modifyUser', authenticateToken, async(req, res) => {
    try{
        const username = req.body.name;
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const result = await User.findOneAndUpdate(
            {username: username},
            {password: hashedPassword}
        ); // should auto-finding any matching value...
        if(!result)
            res.status(404).send('User not found!');
        res.status(200).send('User modified successfully');
    }catch(err){
        console.log(err);
    }
});

app.post('admin/loadUser', authenticateToken, async (req, res) =>{
    try{
        const username = req.body.name;
        const result = await User.findOne({ username: { $eq: username} });
        if(!result) res.status(404).send('User not found!');
        res.status(200).json(result);
    }catch(err){
        console.log(err);
    }
});// could only send the hashed version of the data

app.post('admin/createUser',authenticateToken, async(req, res) => {
    try{
        const username = req.body.name;
        const password = req.body.password;
        const admin = req.body.admin;
        await User.create({
            username: username,
            password: password,
            admin: admin
        });
        res.status(200).send('User created');
    }catch(error){
        res.status(500).send(error);
    }
});

app.delete('admin/users/:username',authenticateToken, async(req, res)=>{
    try{
        const username = req.params.username;
        const result = User.findOneAndDelete({username: {$eq: username}});
        if(!result)
            res.status(404).send('User not found!');
        res.status(200).send('User deleted successfully');
    }catch(error){
        console.log(err);
    }
});

});
const PORT = process.env.PORT;
const server = app.listen(PORT);