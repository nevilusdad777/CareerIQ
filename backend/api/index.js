const app = require('../server');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
  await connectDB().catch(err => console.error("DB Connection error:", err));
  return app(req, res);
};
