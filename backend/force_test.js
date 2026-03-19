
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Roadmap = require('./models/Roadmap');

async function forceCreate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB:", mongoose.connection.name);

    let user = await User.findOne({ email: 'test@test.com' });
    if (!user) {
      user = new User({ name: 'Verification User', email: 'test@test.com' });
      await user.save();
    }
    console.log("User ID:", user._id);

    // Delete existing roadmaps for this user to start clean
    await Roadmap.deleteMany({ userId: user._id });

    const roadmap = new Roadmap({
      userId: user._id,
      competencyName: 'DevOps Master Path',
      overview: 'Master the art of DevOps',
      modules: [
        { title: 'Docker', link: 'http://example.com/docker', type: 'video', completed: true },
        { title: 'Kubernetes', link: 'http://example.com/k8s', type: 'video', completed: false }
      ]
    });
    
    await roadmap.save();
    console.log("Roadmap created. Progress:", roadmap.progress);

    // Now complete it
    console.log("Completing last module...");
    roadmap.modules[1].completed = true;
    await roadmap.save();

    const finalizedUser = await User.findById(user._id);
    console.log("Completed Roadmaps length:", finalizedUser.completedRoadmaps.length);
    if (finalizedUser.completedRoadmaps.length > 0) {
        console.log("Found:", finalizedUser.completedRoadmaps[0].competencyName);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

forceCreate();
