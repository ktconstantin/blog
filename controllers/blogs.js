const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// get all blogs
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

// get single blog by id
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

// create a blog
blogsRouter.post('/', async (request, response) => {
  if (request.body.author === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  if (request.body.title === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const blog = await new Blog(request.body).save()

  response.status(201).json(blog)
})

// delete a blog by id
blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)

  response.status(204).end()
})

// update a blog
// blogsRouter.put('/:id', (request, response, next) => {
//   console.log('to do')
// })

module.exports = blogsRouter