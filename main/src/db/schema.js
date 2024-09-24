const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, 'Please enter a valid phone number'], // Example validation for a 10-digit number
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,  // Ensure emails are unique
        lowercase: true, // Convert email to lowercase
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'], // Basic email validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Minimum length of password
    },
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// Define the photo schema
const photoSchema = new mongoose.Schema({
    image: Buffer,
    contentType: String,
});

// Create models
const Photo = mongoose.model('Photo', userSchema);
const Photoimage = mongoose.model('Photoimage', photoSchema);

// Export models
module.exports = {
    Photo,
    Photoimage,
};
