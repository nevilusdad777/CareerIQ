
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from Backend directory
dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const mongoURI = process.env.MONGO_URI || "mongodb+srv://mkasw:Vicky123@careeriq-cluster.x1ifxl0.mongodb.net/careeriq";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  completedRoadmaps: [{
    roadmapId: mongoose.Schema.Types.ObjectId,
    competencyName: String,
    completedAt: { type: Date, default: Date.now }
  }]
});

const RoadmapSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  competencyName: String,
  modules: [{ title: String, link: String, completed: Boolean }],
  progress: { type: Number, default: 0 }
});

// Reuse the pre-save hook logic
RoadmapSchema.pre('save', async function(next) {
  const wasCompleted = this.progress === 100;
  
  if (this.modules && this.modules.length > 0) {
    const completedCount = this.modules.filter(m => m.completed).length;
    this.progress = Math.round((completedCount / this.modules.length) * 100);
  } else {
    this.progress = 0;
  }

  if (this.progress === 100 && !wasCompleted) {
    try {
      const User = mongoose.model("User");
      await User.findByIdAndUpdate(this.userId, {
        $addToSet: { 
          completedRoadmaps: { 
            roadmapId: this._id, 
            competencyName: this.competencyName,
            completedAt: new Date()
          } 
        }
      });
      console.log("Successfully updated user record with completed roadmap!");
    } catch (error) {
      console.error("Error updating user completed roadmaps:", error);
    }
  }
  next();
});

// Check if models exist before defining them
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);

async function verify() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected.");

    // 1. Find a test user
    let user = await User.findOne({ email: 'test@test.com' });
    if (!user) {
        user = new User({ name: 'Verification User', email: 'test@test.com' });
        await user.save();
        console.log("Created test user:", user._id);
    } else {
        console.log("Found test user:", user._id);
    }

    // 2. Clear previous completions for this test
    await User.findByIdAndUpdate(user._id, { $set: { completedRoadmaps: [] } });

    // 3. Create a roadmap that is almost complete
    const roadmap = new Roadmap({
      userId: user._id,
      competencyName: 'Cloud Architect Mastery',
      modules: [
        { title: 'Intro', link: 'http://example.com/1', completed: true },
        { title: 'Advanced', link: 'http://example.com/2', completed: false }
      ]
    });
    await roadmap.save();
    console.log("Created roadmap. Initial progress:", roadmap.progress);

    // 4. Update it to 100% completion
    console.log("Completing the roadmap...");
    roadmap.modules[1].completed = true;
    await roadmap.save();
    console.log("Updated roadmap. Final progress:", roadmap.progress);

    // 5. Verify User Record
    const updatedUser = await User.findById(user._id);
    console.log("User's completed roadmaps count:", updatedUser.completedRoadmaps.length);
    if (updatedUser.completedRoadmaps.length > 0) {
      console.log("SUCCESS: Roadmap completion tracked in User record.");
      console.log("Completed Role:", updatedUser.completedRoadmaps[0].competencyName);
    } else {
      console.log("FAILURE: Roadmap completion NOT found in User record.");
    }

  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    await mongoose.connection.close();
  }
}

verify();
