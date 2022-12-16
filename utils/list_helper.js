const _ = require('lodash')

const mostLikes = blogs => {
  if (blogs.length === 0) {
    return null
  } else if (blogs.length === 1) {
    return {
      author: blogs[0].author,
      likes: blogs[0].likes
    }
  }

  const likeCounts = {}

  blogs.forEach(blog => {
    if (!likeCounts[blog.author]) {
      likeCounts[blog.author] = blog.likes
    } else {
      likeCounts[blog.author] += blog.likes
    }
  })

  const mostLiked = _.maxBy(Object.entries(likeCounts), item => item[1])

  return {
    author: mostLiked[0],
    likes: mostLiked[1]
  }
}

const mostBlogs = blogs => {
  if (blogs.length === 0) {
    return null
  } else if (blogs.length === 1) {
    return {
      author: blogs[0].author,
      count: 1
    }
  }

  const blogCounts = _.countBy(blogs.map(blog => blog.author))
  const result = _.maxBy(Object.entries(blogCounts), item => item[1])

  return { 
    author: result[0], 
    count: result[1] 
  }
}

const totalLikes = blogs => {
  const likes = blogs.map(blog => blog.likes)

  const total = likes.reduce((accumulator, currentValue) => {
    return accumulator + currentValue
  }, 0)

  return total
}

const favoriteBlog = blogs => {
  if (blogs.length === 0) {
    return null
  } else if (blogs.length === 1) {
    return blogs[0]
  }

  const sortedBlogs = [...blogs].sort((a, b) => {
    return b.likes - a.likes
  })

  return sortedBlogs[0]
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}