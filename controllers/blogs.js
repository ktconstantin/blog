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

  if (request.body.url === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  if (request.body.likes === undefined) {
    request.body.likes = 0
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
blogsRouter.put('/:id', async (request, response) => {
  const blogs = await Blog.find({})
  const blogToUpdate = blogs.find(blog => blog.id === request.params.id)

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    {...blogToUpdate, likes: request.body.likes},
    { new: true }
  )

  response.status(204).json(updatedBlog)
})

module.exports = blogsRouter