const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())

  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('all blogs are returned', async () => {
  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog title is returned', async () => {
  const response = await api.get('/api/blogs')
  const titles = response.body.map(blog => blog.title)

  expect(titles).toContain('React patterns')
})

test('a valid blog can be created', async () => {
  const newBlog = {
    title: 'My precious',
    author: 'Smeagol',
    url: 'http://www.myprecious.net/precious',
    likes: 420,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(blog => blog.title)
  const authors = blogsAtEnd.map(blog => blog.author)

  expect(titles).toContain('My precious')
  expect(authors).toContain('Smeagol')
})

test('blog without author and title is not created', async () => {
  const invalidBlog = {
    likes: 420,
    url: "http://www.myprecious.net/precious"
  }

  await api
    .post('/api/blogs')
    .send(invalidBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

afterAll(() => {
  mongoose.connection.close()
})