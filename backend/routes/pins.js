const router = require("express").Router();
const Pin = require("../models/Pin");

// Create a pin
router.post("/", async (req, res) => {
  const newPin = new Pin(req.body);
  try {
    const savedPin = await newPin.save();
    res.status(200).json(savedPin);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get all pins
router.get("/", async (req, res) => {
  try {
    const pins = await Pin.find();
    
    res.status(200).json(pins);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// delete pin
router.delete("/:id", async (req, res) => {
  var id = req.params.id;
  try {
    console.log("backend request : ", req.params.id);
    console.log(id);
    const PinDeleted = await Pin.findByIdAndDelete(id);
    if (!PinDeleted) {
      return res.status(404).json({ message: "No such pin" })}
    const pins = await Pin.find();
    res.status(200).json(pins);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
}
});

//like pin
router.put("/like/:pinid/:user_id",async (req,res)=>{
  console.log("liked");
    Pin.findByIdAndUpdate(req.params.pinid,{
      $push:{likes:req.params.user_id}
    },{
      new : true
    }).exec(async (err,result)=>{
      if(err){
        res.status(500).json(err);
      }else{
        const pins = await Pin.find();
        res.status(200).json(pins);
      }
    })
});

router.put("/dislike/:pinid/:user_id",async (req,res)=>{
  Pin.findByIdAndUpdate(req.params.pinid,{
    $pull:{likes:req.params.user_id}
  },{
    new : true
  }).exec(async (err,result)=>{
    if(err){
      res.status(500).json(err);
    }else{
      const pins = await Pin.find();
      res.status(200).json(pins);
    }
  })
});


module.exports = router;
