const mongoose = require("mongoose");

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  competencyName: {
    type: String,
    required: true,
    trim: true
  },
  overview: {
    type: String,
    trim: true
  },
  modules: [
    {
      title: { type: String, required: true },
      link: { type: String, required: true },
      type: { type: String, enum: ["video", "article", "course", "documentation"], default: "video" },
      completed: { type: Boolean, default: false }
    }
  ],
  progress: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to calculate progress before saving
RoadmapSchema.pre('save', async function() {
  const oldProgress = this.progress;
  const wasCompleted = oldProgress === 100;
  
  if (this.modules && this.modules.length > 0) {
    const completedCount = this.modules.filter(m => m.completed).length;
    this.progress = Math.round((completedCount / this.modules.length) * 100);
  } else {
    this.progress = 0;
  }

  console.log(`📊 Roadmap Hook: ${this.competencyName} | Progress: ${oldProgress}% -> ${this.progress}%`);

  // If newly completed, update the User record
  if (this.progress === 100 && !wasCompleted) {
    console.log(`🎯 Roadmap COMPLETED! Updating User: ${this.userId}`);
    try {
      const User = mongoose.model("User");
      const updatedUser = await User.findByIdAndUpdate(this.userId, {
        $addToSet: { 
          completedRoadmaps: { 
            roadmapId: this._id, 
            competencyName: this.competencyName,
            completedAt: new Date()
          } 
        }
      }, { new: true });
      
      if (updatedUser) {
        console.log(`✅ User ${this.userId} updated successfully with ${this.competencyName}`);
      } else {
        console.log(`❌ Failed to find User ${this.userId} to update`);
      }
    } catch (error) {
      console.error("Error updating user completed roadmaps:", error);
    }
  }
});

module.exports = mongoose.model("Roadmap", RoadmapSchema);
