// Importing Required Modules
const express = require("express");
const path = require("path");
const hbs = require("hbs");

const multer = require("multer");
const mongoose = require("mongoose");
const Photo = require("../db/schema");
const Photoimage = require("../db/schema");
const storage = multer.memoryStorage(); // Store files in memory for easy processing
const upload = multer({ storage });


// MongoDB Connection String
const uri = 'mongodb+srv://namith:Namith@namith.qdi8kjj.mongodb.net/?retryWrites=true&w=majority&appName=namith'; // Make sure to replace 'myDatabase' with your actual database name

// Connect to MongoDB
mongoose.connect(uri)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Initialize Express App
const app = express(); 
const port = process.env.PORT || 5600;

// Set Up Static Files and View Engine
app.use(express.static(path.join(__dirname, '../../public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'hbs'); 
app.set('views', path.join(__dirname, '../../views'));
hbs.registerPartials(path.join(__dirname, '../../views/partials'));

// Middleware to Parse JSON and URL-encoded Data 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

// Home Page
app.get("/", (req, res) => {
    res.render("index"); 
});

// Photo Page
app.get("/photo.hbs", (req, res) => {
    res.render("photo"); 
});

// Login Page
app.get("/photologin.hbs", (req, res) => {
    res.render("photologin");
});

// Login Handler
app.post("/photologin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Photo.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await user.comparePassword(password); // Ensure 'comparePassword' method exists in your schema

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.render("photoprofile", { user }); // Pass user data to the profile view
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error });
    }
});

// Registration Page
app.get("/photoregister.hbs", (req, res) => {
    res.render("photoregister"); 
});

// Registration Handler
app.post("/photoregister", async (req, res) => {
    const { name, mobile, email, password, confirm_password } = req.body;

    // Validate Input
    if (!name || !mobile || !email || !password || !confirm_password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if Password Meets Minimum Length
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if Passwords Match
    if (password !== confirm_password) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        // Create a New User
        const user = new Photo({ name, mobile, email, password });
        await user.save();
        res.render("photoprofile", { user });
    } catch (error) {
        res.status(400).json({ error: 'Error creating user', details: error });
    }
});
app.post('/upload', upload.array('files'),(req, res) => {
    console.log(req.files);

    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }
    const promises = req.files.map(file => {
        const newPhotoimage = new Photoimage({
            image: file.buffer,
            contentType: file.mimetype,
        });
        return newPhotoimage.save();
        res.render("photo", { user });
    });

    Promise.all(promises)
        .then(() => res.status(200).send('Files uploaded successfully!') )
        .catch(err => res.status(500).send(err.message));
});
app.get('/photo/:email', async (req, res) => {
    try {
        const userPhoto = await Photoimage.findById(req.params.id);
        if (Photoimage) {
            res.contentType(Photoimage.contentType);
            res.send(Photoimage.image);
        } else {
            res.status(404).send('Photo not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});
app.get('/image/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const photos = await Photoimage.find({ email }); // Adjust based on how your schema is set
        if (!photos.length) {
            return res.status(404).send('No images found for this email.');
        }
        res.json(photos);
    } catch (error) {
        res.status(500).send('Server error.');
    }
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
