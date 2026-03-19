const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, 'Backend', '.env') });

const Event = require('./Backend/models/Event');

async function checkEvents() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/careeriq');
        console.log('Connected.');

        const events = await Event.find({}).lean();
        console.log('\n--- ALL EVENTS ---');
        console.log(JSON.stringify(events, null, 2));

        const globalEvents = await Event.find({ isGlobal: true }).lean();
        console.log('\n--- GLOBAL EVENTS ---');
        console.log(JSON.stringify(globalEvents, null, 2));

        const futureGlobalEvents = await Event.find({ 
            isGlobal: true, 
            date: { $gt: new Date() } 
        }).lean();
        console.log('\n--- FUTURE GLOBAL EVENTS ---');
        console.log(JSON.stringify(futureGlobalEvents, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkEvents();
