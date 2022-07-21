const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};
const Item = mongoose.model('Item', itemsSchema);

const categorySchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model('List', categorySchema);


Item.find({name:'Welcome to your todolist'}, function(err, results) {
  if(err) {
    console.log(err);
  } else {
    if(!(results.length > 0)) {

    }
  }

});



const item1 = new Item({name: 'Welcome to your todolist'});
const item2 = new Item({name: 'Hit the + button to add a new item'});
const item3 = new Item({name: '<-- Hit this to delete an item'});
let defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {
  Item.find(function(err, results) {
    if(err) {
      console.log(err);
    } else {
      if(results.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log('Inserted succesfully');
          }
        });
        res.render("list", {listTitle: 'Today', newListItems: defaultItems});
      } else {
        res.render("list", {listTitle: 'Today', newListItems: results});

      }
    }
  });

});

app.post("/", function(req, res){
  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({name: item});

  if(listName == 'Today') {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect('/'+ listName);
    });
  }



});

app.post('/delete', function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == 'Today') {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if(err){
        console.log(err);
      } else {
        console.log('Deleted succesfully');
        res.redirect('/');
      }
    })
  } else {
    List.findOneAndUpdate({name:listName}, {$pull:{items: {_id: checkedItemId}}}, function(err,foundList){
      if(!err) {
        res.redirect('/'+ listName);
      }
    });
  }


});


app.get('/:category', function(req, res) {
  const categoryName = req.params.category;
  List.find({name: categoryName}, function(err, result){
    if(err){
      console.log(err);
    } else {
      if(!(result.length > 0)) {
        const list  = new List({
        name: categoryName,
        items: defaultItems
        });
        list.save();
        res.redirect('/'+ categoryName);
      } else {
        res.render('list', {listTitle: result[0].name, newListItems:result[0].items});
      }
    }
  });


});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
