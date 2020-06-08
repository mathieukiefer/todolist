//jshint esversion:6


// Requires Modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Declare App.  tu use express function
const app = express();

// require our own module.
const date = require(__dirname + "/date.js");

// Define Port for server listen
const PORT = 5000;

const loggs = 0


// Define public folder to be served to nodeJS web server so it can be accessible by the browser (for CSS, images, etc...)
app.use(express.static("public"));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Use body parser urlencoded, necessary to receive element by post method from form
app.use(bodyParser.urlencoded({
  extended: true
}));

// Define mongoose DB connection
mongoose.connect("mongodb+srv://mat-dev:ETI99dfhu.@test-cluster-9yzmf.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});



// --- MONGOOSE SCHEMA ---
// Define a mongoos data Schema
const itemSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

// Define a mongoose model from our Schema
const Item = mongoose.model("Item", itemSchema); // indicate the singular version of our element with first capital letter ant then link it to our Schema.

const List = mongoose.model("List", listSchema);


// new Item:
const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit de + button to add new item"
});

const item3 = new Item({
  name: "<-- Hit this to mark an item as accomplished"
});

const defaultItems = [item1, item2, item3];

// console.log("defautl items = " + defaultItems);



// --- GET ROUTE ON ROOT ---
app.get("/", (req, res) => { // Listen to get request on root "/"

  const day = date.getDate();

  Item.find({}, (err, foundItems) => {

    // console.log(foundItems);

    if (err) {
      console.log(err);
    } else {

      if (foundItems.length === 0) {

        Item.insertMany(defaultItems, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Default items addes successfully to DB");
          }
        });
        res.redirect("/");
      } else {
        res.render('list', { // Render List.ejs view and 
          listName: "TODAY", // Pass data to list.ejs view (dayType will be passed containing day variable)
          items: foundItems // idm but passes items
        });
      }
    }
  });
});


app.get("/:listName", (req, res) => {
  const listName = req.params.listName.toUpperCase();
  if (loggs > 0) {
    console.log(listName)
  };



  List.findOne({
    name: listName
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultItems
        });

        list.save();
        if (loggs > 1) {
          console.log("Created list: " + list)
        };
        res.redirect("/" + listName);
      } else {

        if (loggs > 0) {
          console.log("List Alredy Exist")
        };
        res.render('list', {
          listName: listName,
          items: foundList.items
        });


      }
    }
  });





});







// Receive Post Method from form on root
app.post("/", (req, res) => { // Listen to post request on root "/"
  const listName = req.body.listName;
  const newItem = req.body.newItem; // store in "newItem", the element received in the body of post method from Form field name "newItem"

  if (loggs > 0) {
    console.log("ADDING NEW ITEM TO LIST: " + listName)
  };

  const item = new Item({
    name: newItem
  })

  if (listName === "TODAY") {
    item.save();
    res.redirect("/"); // Then redirect the user to root get route "/"
  } else {
    // list.item.save();
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
    })
    if (loggs > 0) {
      console.log("List Name is : " + listName)
    };

    res.redirect("/" + listName);
  }


});



app.post("/delete", (req, res) => {

  const itemId1 = req.body.checkbox;
  const itemId = itemId1.trim();
  const listName = req.body.listName;

  console.log(listName);
  console.log(itemId);
  console.log(mongoose.Types.ObjectId.isValid(itemId));

  if (listName === "TODAY") {
    Item.findByIdAndRemove(itemId, (err) => {

      if (err) {
        console.log(err)
      } else {

        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, (err) => {
      console.log(err)
      res.redirect("/" + listName);
    });

  }

});


// Start NodeJS server Listen on specified port
app.listen(PORT, () => {
  console.log("server is running on port : " + PORT);
})