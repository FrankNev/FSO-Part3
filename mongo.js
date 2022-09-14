const mongoose = require('mongoose')

if (process.argv.length < 3) {
   console.log('Please provide the password as an argument: node mongo.js <password>')
   process.exit(1)
}

const password = process.argv[2]

const url =
   `mongodb+srv://fullstack:${ password }@mastcluster.jmyoqsj.mongodb.net/phonebook-list?retryWrites=true&w=majority`
mongoose.connect(url)

const personSchema = new mongoose.Schema({
   name: String,
   number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv[3] && process.argv[4]) {
   const newPerson = new Person({
      name: process.argv[3],
      number: process.argv[4],
   })

   newPerson.save().then(response => {
      console.log(`Added ${newPerson.name} to the phonebook`)
      mongoose.connection.close()
   })
} else {
   Person.find({}).then(result => {
      result.forEach(note => {
         console.log(note)
      })
      
      mongoose.connection.close()
   })
}