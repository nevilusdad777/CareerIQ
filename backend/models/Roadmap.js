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
  if (this.modules && this.modules.length > 0) {
    const completedCount = this.modules.filter(m => m.completed).length;
    this.progress = Math.round((completedCount / this.modules.length) * 100);
  } else {
    this.progress = 0;
  }
});

module.exports = mongoose.model("Roadmap", RoadmapSchema);
