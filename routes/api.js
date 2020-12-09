'use strict';

const expect = require('chai').expect;
const mongodb = require('mongodb')
const mongoose = require('mongoose');


module.exports = function (app) {
  mongoose.connect(process.env.MONOGO_URI || 'mongodb://localhost/personal-library', { useNewUrlParser: true }, { useUnifiedTopology: true } );
  
  let bookSchema = new mongoose.Schema({
    title: {type: String, required: true},
    comments: [String]
  });
  
  const Book = mongoose.model('Book', bookSchema);
  
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
       let bookArr = [];
      Book.find(
      {},
        (err, results)=>{
          if(!err && results){
            results.forEach((result) => {
              let bookEntry = result.toJSON();
              bookEntry['commentcount'] = bookEntry.comments.length
              bookArr.push(bookEntry)
            })
            return res.json(bookArr)
          }
        }
      
      )
  })
    
    .post(function (req, res){
      var title = req.body.title;
    if(!title){
      return res.json('missing title');
    }
    
    let newBook = new Book({
      title: title,
      comments: []
    });
    
    newBook.save((err, saved) =>{
      if(!err && saved){
        res.json(saved);
      }
    })
   
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
     Book.remove(
      {},
       (err, status) => {
         if(!err && status){
           return res.json('complete delete successful')
         }
       }
     ) 
  });


app.route('/api/books/:id')
.get(function (req, res){
  var bookid = req.params.id;
  Book.findById( 
    bookid,
        (error, result) => {
            if(!error && result){
                return res.json(result)
              }else if(!result){
            return res.json('No Book Exists')
              }
            }
          )
        })

    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      Book.findByIdAndUpdate(
        bookid,
        {$push: {comments: comment}},
        {new: true},
        (err, update) => {
          if(!err && update){
            return res.json(update);
          } else if(!update){
            return res.json('No Book Exists')
          }
        }
        
      )
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      Book.findByIdAndRemove(
      bookid,
        (err, removed) =>{
          if(!err && removed){
            return res.json('delete successful')
          }else if(!removed){
            return res.json('No Book Exists')
          }
        }
      )//if successful response will be 'delete successful'
    });
  
};
