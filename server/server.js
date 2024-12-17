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

let qualifySet = [];
let locSet = {};

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

    const CommentSchema= mongoose.Schema({
        locId: {
            type: Number,
            required: true,
        },
        name:{
            type:Array,
            required: true
        },
        context: {
            type:Array,
            required: true
        }
    })

    const BlacklistSchema=mongoose.Schema({
        username:{
            type: String,
            requried: true,
            unique: true
        },
        blockUsers:{
            type:Array,
            required:true
        }
    })

    const BookingSchema = mongoose.Schema({
        username: {
          type: String,
          required: true,
        },
        eventId: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
      });

      const LikeSchema = mongoose.Schema({
        username: {
          type: String,
          required: true,
        },
        eventId: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
      });
      LikeSchema.index({ username: 1, eventId: 1 }, { unique: true });

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
    const Comment=mongoose.model('Comment',CommentSchema);
    const Blacklist=mongoose.model('Blacklist',BlacklistSchema);
    const Booking = mongoose.model('Booking', BookingSchema);
    const Like = mongoose.model('Like', LikeSchema);

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

async function clearComment(){
    await Comment.deleteMany({});
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
        locSet={};

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
                if(Math.abs(vId-item.locId) < 10000&& vId!=item.locId){
                    display = false;
                    break;
                }
                if(vId==item.locId){
                    display=true;
                    break;
                }
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

//clearData();
//processData();
userSetup();
//commentSetup();

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
            const token = jwt.sign({id: existing._id, admin: existing.admin,username: existing.username}, process.env.JWT_SECRET, { expiresIn: '2h'});
            //console.log(token);
            await clearData();
            await processData();
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
    if(existing)
        res.status(400).send('Duplicate username');
    else{
        const newUser = new User({ username: String(username), password: String(password), admin: false});
        await newUser.save();
        res.status(201).send('User registered successfully');
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
    try{
    const token = req.cookies.jwt;
    //console.log(token);
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        //console.log(err);
        if (err) return res.sendStatus(403);
        next();
    });}catch(error){
        console.log(error);
    }
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
        console.log(locationShown);
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
    const title = req.body.title;
    const locID = Number(req.body.locID);
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
    const title = req.body.title;
    const locID = Number(req.body.locID);
    const date = req.body.date;
    const description = req.body.description;
    const presenter = req.body.presenter;
    const price = Number(req.body.price);
    //console.log(req.body);
    //const price2 = 2;
    const result = await Event.findOneAndUpdate(
        {eventId:{$eq: eventID}},
        {title: title,
        locId: locID,
        date: date,
        description: description,
        presenter: presenter,
        price: price},
        {new: true}
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
        //console.log(eventID);
        // there could be cases when title is the same, and it is not convenient for String to compare
        const result = await Event.findOneAndDelete({ eventId: {$eq: eventID}});
        if(!result)
            res.status(404).send('Event not found!');
        else res.status(200).send('Event deleted');
    }catch(err){
        console.log(err);
    }
});

app.post('/admin/modifyUser', authenticateToken, async(req, res) => {
    try{
        const username = String(req.body.username);
        const password = String(req.body.password);
        //console.log(username);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const result = await User.findOneAndUpdate(
            {username: {$eq: username}},
            {password: hashedPassword}
        ); // should auto-finding any matching value...
        if(!result)
            res.status(404).send('User not found!');
        else res.status(200).send('User modified successfully');
    }catch(err){
        console.log(err);
    }
});

app.post('/admin/loadUser', authenticateToken, async (req, res) =>{
    try{
        const username = req.body.name;
        const result = await User.findOne({ username: { $eq: username} });
        if(!result) res.status(404).send('User not found!');
        else res.status(200).json(result);
    }catch(err){
        console.log(err);
    }
});// could only send the hashed version of the data

app.post('/admin/createUser',authenticateToken, async(req, res) => {
    try{
        const username = String(req.body.username);
        const password = String(req.body.password);
        const admin = req.body.admin;
        await User.create({
            username: username,
            password: password,
            admin: admin
        });
        res.status(200).send('User created');
    }catch(error){
        res.status(500).send('Duplicate or invalid username input!');
    }
});

app.delete('/admin/users/:username',authenticateToken, async(req, res)=>{
    try{
        const username = String(req.params.username);
        //console.log(username);
        const result = User.findOneAndDelete({username: {$eq: username}});
        if(!result)
            res.status(404).send('User not found!');
        else res.status(200).send('User deleted successfully');
    }catch(error){
        console.log(err);
    }
});

//saving users' comments
app.post('/locations/comments',async(req,res)=>{
    try{
        let id=req.body.locId;
        let username=req.body.username;
        let context=req.body.context;

        let test=await Comment.findOne({locId:{$eq:id}});
        if(!test){
            let arr1=[];
            arr1.push(username);
            let arr2=[];
            arr2.push(context);

            Comment.create({
                locId:id,
                name:arr1,
                context:arr2
            })
        }else{
            let info=await Comment.findOne({locId:{$eq:id}});
            let arr1=info.name;
            arr1.push(username);

            let arr2=info.context;
            arr2.push(context);
            let result=await Comment.findOneAndUpdate({locId:{$eq:id}},{name:arr1,context:arr2})

            console.log(result);

        }

        res.status(200).send("ok!");
        
    }catch(error){
        console.log(error);
    }
})

//acquiring users' comments
app.post('/locations/acquire',async(req,res)=>{
    try{
        let id=req.body.locId;       
        let info=await Comment.findOne({locId:{$eq:id}});
        
        if(info!=null){
            let comments={
                username:info.name,
                context:info.context
            }

            res.status(200).send(comments);
        }else{           
            res.status(200).send({});
        }

    }catch(error){
        console.log(error);
    }
})

//block comments
app.post('/block/save',async(req,res)=>{
    try{
        let username=req.body.username;
        let blockUser=req.body.blockUser;

        let test=await Blacklist.findOne({username:{$eq:username}});
        if(!test){
            let arr=[];
            arr.push(blockUser);

            Blacklist.create({
                username:username,
                blockUsers:arr
            })
        }else{
            let info=await Blacklist.findOne({username:{$eq:username}});
            let arr=info.blockUsers;
            arr.push(blockUser);

            let result=await Blacklist.findOneAndUpdate({username:{$eq:username}},{blockUsers:arr})

            console.log(result);

        }
        
        res.send("ok");

    }catch(error){
        console.log(error);
    }
})

//acquiring users' blacklists
app.post('/block/acquire',async(req,res)=>{
    try{
        let username=req.body.username;       
        let info=await Blacklist.findOne({username:{$eq:username}});
        
        if(info!=null){
            let blacklist={
                blockUsers:info.blockUsers
            }

            res.status(200).send(blacklist);
        }else{           
            res.status(200).send({});
        }

    }catch(error){
        console.log(error);
    }
})

app.post('/bookings', async (req, res) => {
    try {
      const { username, eventId, title } = req.body;

      // Check if the booking already exists
      const existingBooking = await Booking.findOne({
        username: username,
        eventId: eventId,
      });

      if (existingBooking) {
        return res.status(400).json({ message: 'Event already booked' });
      }

      const newBooking = new Booking({ username, eventId, title });
      await newBooking.save();
      res.status(201).json({ message: 'Booking successful' });
    } catch (error) {
      console.error('Error handling booking:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // GET route to retrieve bookings for a user
  app.get('/bookings/:username', async (req, res) => {
    try {
      const username = req.params.username;
      const bookings = await Booking.find({ username: username });

      const eventIds = bookings.map(booking => booking.eventId);
      const events = await Event.find({ eventId: { $in: eventIds } }).lean();
      
      // 合并 booking 和 event 信息
      const bookedEvents = bookings.map(booking => {
        const event = events.find(e => e.eventId === booking.eventId);
        return {
          ...booking,
          ...event, 
        };
      });

      res.status(200).json({ bookedEvents});
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // POST route to handle booking cancellation
  app.post('/cancelBooking', async (req, res) => {
    try {
      const { username, eventId } = req.body;

      // Find and delete the booking
      const booking = await Booking.findOneAndDelete({
        username: username,
        eventId: eventId,
      });

      if (booking) {
        res.status(200).json({ message: 'Booking cancelled' });
      } else {
        res.status(404).json({ message: 'Booking not found' });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/currentUser', (req, res) => {
    try {
      const token = req.cookies.jwt;
      if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid token' });
        }

        // Assuming the decoded token contains username
        res.status(200).json({ username: decodedToken.username });
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // POST route to handle likes/unlikes
  app.post('/likes', async (req, res) => {
    try {
      const { username, eventId, title } = req.body;

      // Check if the like already exists
      const existingLike = await Like.findOne({
        username: username,
        eventId: eventId,
      });

      if (existingLike) {
        // Unlike the event (delete the like)
        await Like.deleteOne({ _id: existingLike._id });
        res.status(200).json({ message: 'Event unliked' });
      } else {
        // Like the event
        const newLike = new Like({ username, eventId, title });
        await newLike.save();
        res.status(201).json({ message: 'Event liked' });
      }
    } catch (error) {
      console.error('Error handling like:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // GET route to retrieve liked events for a user
  app.get('/likes/:username', async (req, res) => {
    try {
      const username = req.params.username;
      const likes = await Like.find({ username: username }).lean();
  
      const eventIds = likes.map((like) => like.eventId);
      const events = await Event.find({ eventId: { $in: eventIds } }).lean();
  
      res.status(200).json({ likedEvents: events });
    } catch (error) {
      console.error('Error fetching likes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
});
const PORT = process.env.PORT;
const server = app.listen(PORT);