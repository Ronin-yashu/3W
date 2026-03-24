import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text:     { type: String },
  imageUrl: { type: String },
  likes:    [{ userId: mongoose.Schema.Types.ObjectId, username: String }],
  comments: [{
    userId:    mongoose.Schema.Types.ObjectId,
    username:  String,
    text:      { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
export default mongoose.model('Post', postSchema);