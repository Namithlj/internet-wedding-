const express = require("express");
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose");
const Photo = require("../db/schema"); // Corrected import

const uri = "mongodb+srv://namithnamith370:E4BZO63gIZA8DMcK@project-db.ic1yc.mongodb.net/?retryWrites=true&w=majority&appName=project-db";

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express(); 
const port = process.env.PORT || 5600;

app.use(express.static(path.join(__dirname, '../../public')));
app.set('view engine', 'hbs'); 
app.set('views', path.join(__dirname, '../../views'));

hbs.registerPartials(path.join(__dirname,'../../views/partials'));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index"); 
});

app.get("/photo.hbs", (req, res) => {
    res.render("photo"); 
});

app.get("/photologin.hbs", (req, res) => {
    res.render("photologin");
});

app.post("/photologin", async (req, res) => {
          console.log(req.body);
    const { email, password } = req.body; // Fixed typo from 'passward' to 'password'

    try {
        const user = await Photo.findOne({ email }); // Fixed method name to 'findOne'
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await user.comparePassword(password); // Assuming 'comparePassword' method exists

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.render("photoprofile");
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error });
    }
});

app.get("/photoregister.hbs", (req, res) => {
    res.render("photoregister"); 
});


app.post("/photoregister", async (req, res) => {
          console.log(req.body);
          const { name,mobile, email, password,confirm_password} = req.body;
      
          // Validate input
          if (!name || !mobile || !email || !password) {
              return res.status(400).json({ error: 'All fields are required' });
          }
      
          // Check if password meets minimum length
          if (password.length < 6) {
              return res.status(400).json({ error: 'Password must be at least 6 characters long' });
          }
      
          try {
              // Create a new user
              const user = new Photo({ name,mobile, email, password });
              await user.save();
              // Render the profile view after successful registration
              res.render("photoprofile", { user });
          } catch (error) {
              res.status(400).json({ error: 'Error creating user', details: error });
          }
      });
      
                

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
