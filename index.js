const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

 
let persons = [
   {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-31235234"
   },
   {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
   },
   {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345"
   },
   {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-6423122"
   }
]

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

const generateId = (min, max) => {
   return Math.floor(Math.random() * (max - min)) + min;
}


app.get("/info", (request, response) => {
   const receivedDate = new Date();

   response.send(
      `<p>
         Phonebook has info for ${ persons.length } people
      </p>
      <p>
         ${ receivedDate }
      </p>`
   )
})

app.get("/api/persons", (request, response) => {
   response.json(persons)
})

app.get("/api/persons/:id", (request, response) => {
   const id = Number(request.params.id)
   const person = persons.find(person => person.id === id)

   if (person) {
      response.json(person)
   } else {
      response.status(404).end()
   }
})

app.delete("/api/persons/:id", (request, response) => {
   const id = Number(request.params.id)
   persons = persons.filter(person => person.id !== id)

   response.status(204).end()
})

app.post("/api/persons", (request, response) => {
   const body = request.body;

   if (!body.name || !body.number) {
      return response.status(400).json({ error: 'content missing' })
   }

   if (!persons.find(person => person.name === body.name)) {
      const newPerson = {
         id: generateId(5, 10e4),
         name: body.name,
         number: body.number
      };
   
      persons = persons.concat(newPerson);
      response.json(newPerson);
   } else {
      return response.status(400).json({ error: 'name must be unique' })
   }
})

const unknownEndpoint = (request, response) => {
   response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})