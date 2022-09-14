const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')


app.use(cors())
app.use(express.static('build'))
app.use(express.json())


// middleware
const unknownEndpoint = (request, response) => {
   response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
   console.error(error.message)

   if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
   }
   next(error)
}

const requestLogger = (request, response, next) => {
   console.log('Method:', request.method)
   console.log('Path:  ', request.path)
   console.log('Body:  ', request.body)
   console.log('---')
   next()
};

app.use(requestLogger)

morgan.token("body", (req) => {return JSON.stringify(req.body)})
app.use(morgan(":method :url :status - :response-time ms - :body"))


// const generateId = (min, max) => {
//    return Math.floor(Math.random() * (max - min)) + min;
// }


// routes handlers
app.get("/info", (request, response) => {
   Person.find({})
      .then(result => {
         response.send(
            `<div>
               Phonebook has info for ${ result.length } people
            </div>
            <div>
               ${ new Date() }
            </div>`
         )
      })
      .catch(error => next(error))
})

app.get("/api/persons", (request, response) => {
   Person.find({})
      .then(list => {
         response.json(list)
      })
      .catch(error => next(error))
})

app.get("/api/persons/:id", (request, response) => {
   Person.findById(request.params.id)
      .then(person => {
         if (person) {
            response.json(person)
         } else {
            response.status(404).end()
         }
      })
      .catch(error => next(error))
})

app.post("/api/persons", (request, response) => {
   const body = request.body;

   if (!body.name || !body.number) {
      return response.status(400).json({ error: 'content missing' })
   }

   const person = new Person({
      name: body.name,
      number: body.number,
   })

   person.save()
      .then(savedData => {
         response.json(savedData)
      })
      .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response) => {
   const body = request.body

   if (!body.name || !body.number) {
      return response.status(400).json({ error: 'content missing' })
   }

   const updatedPerson = {
      name: body.name,
      number: body.number
   } 

   Person.findByIdAndUpdate(request.params.id, updatedPerson, { new: true })
      .then(result => {
         response.json(result)
      })
})

app.delete("/api/persons/:id", (request, response) => {
   Person.findByIdAndRemove(request.params.id)
      .then(result => {
         response.status(204).end()
      })
})

app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})