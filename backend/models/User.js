import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullname:{
        type: String,
    },
    username: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    bio: {
        type: String,
    },
    address: {
      type: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String }
      },
      default: null
    },
    profilePhoto:{
        type : String,
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    verificationCode: String,
    
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    }, 
},{timestamps: true});

// Query: get verified or unverified users (for admin dashboards)
userSchema.index({ isVerified: 1 });

// Query: sort or fetch latest registered users
userSchema.index({ createdAt: -1 });

const User = mongoose.model('user', userSchema);

export default User;