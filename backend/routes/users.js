const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

// register
router.post("/register", async (req, res) => {

  console.log(req.body);

  if (req.body.phone && (req.body.code).length === 4) {
    client
        .verify
        .services(process.env.SERVICE_ID)
        .verificationChecks
        .create({
            to: `+${req.body.phone}`,
            code: req.body.code
        })
        .then(async data => {
            if (data.status === "approved") {
              try {
                // Generate new password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);
            
                // Create new user
                const newUser = new User({
                  username: req.body.username,
                  email: req.body.email,
                  password: hashedPassword,
                });
            
                // Save user and send response
                const user = await newUser.save();
                res.status(200).json(user._id);
              } catch (err) {
                res.status(500).json(err);
              }
            }
        })
} else {
    res.status(400).send({
        message: "Wrong phone number or code :(",
        phonenumber: req.body.phone,
      
    })
}


  
});

router.post("/reg",async(req,res)=>{
  console.log(req.body);
  try {
    client
    .verify
    .services(process.env.SERVICE_ID)
    .verifications
    .create({
        to: `+${req.body.phone}`,
        channel: 'sms' 
    })
    .then(data => {
        res.status(200).send({
            message: "Verification is sent!!",
            phone: req.body.phone,
            data
        })
    }) 
 } catch(err) {
    res.status(400).send({
        message: "Wrong phone number :(",
        phone: req.body.phone,
      
    })
 }
});

// login
router.post("/login", async (req, res) => {
  try {
    // find user
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(400).json("Wrong username or password!");

    // validate password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("Wrong username or password!");

    res.status(200).json({ _id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
