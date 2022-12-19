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
    title: 'my precious',
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

  expect(titles).toContain('my precious')
  expect(authors).toContain('Smeagol')
})

test('blog without author, title, or url is not created', async () => {
  const noUrlBlog = {
    author: 'Smeagol',
    title: 'my precious'
  }

  await api
    .post('/api/blogs')
    .send(noUrlBlog)
    .expect(400)

  const noTitleBlog = {
    author: 'Smeagol',
    url: 'http://www.myprecious.net/precious'
  }

  await api
    .post('/api/blogs')
    .send(noTitleBlog)
    .expect(400)

  const noAuthorBlog = {
    title: 'my precious',
    url: 'http://www.myprecious.net/precious'
  }

  await api
    .post('/api/blogs')
    .send(noAuthorBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('id property is defined correctly', async () => {
  const blogs = await helper.blogsInDb()

  expect(blogs[0].id).toBeDefined()
})

test('if likes prop is missing when blog is created, default to 0', async () => {
  const noLikesBlog = {
    title: 'My precious',
    author: 'Smeagol',
    url: 'http://www.myprecious.net/precious'
  }

  await api
    .post('/api/blogs')
    .send(noLikesBlog)
    .expect(201)

  const blogsAtEnd = await helper.blogsInDb()

  const blogToTest = blogsAtEnd.find(blog => {
    return blog.title === 'My precious' && blog.author === 'Smeagol'
  })

  expect(blogToTest.likes).toBe(0)
})

test('a blog can be deleted successfully', async () => {
  const newBlog = {
    title: 'my precious',
    author: 'Smeagol',
    url: 'http://www.myprecious.net/precious',
    likes: 420,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)

  const blogsAfterAdd = await helper.blogsInDb()
  expect(blogsAfterAdd).toHaveLength(helper.initialBlogs.length + 1)

  const id = blogsAfterAdd.find(blog => {
    return blog.title === 'my precious' && blog.author === 'Smeagol'
  }).id

  await api
    .delete(`/api/blogs/${id}`)
    .expect(204)

  const blogsAfterDelete = await helper.blogsInDb()
  expect(blogsAfterDelete).toHaveLength(helper.initialBlogs.length)
})

test('able to update a blog', async () => {
  const id = '5a422a851b54a676234d17f7'
  const blogs = await helper.blogsInDb()
  const blogToUpdate = blogs.find(blog => blog.id === id)
  const updatedBlog = { ...blogToUpdate, likes: 99 }
  console.log('updated blog', updatedBlog)

  await api
    .put(`/api/blogs/${id}`)
    .send(updatedBlog)
    .expect(204)

  const updatedBlogs = await helper.blogsInDb()
  console.log('updated list', updatedBlogs)
  expect(updatedBlogs.find(blog => blog.id === id).likes).toBe(99)
})

afterAll(() => {
  mongoose.connection.close()
})