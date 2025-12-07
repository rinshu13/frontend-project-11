import onChange from 'on-change'
import * as bootstrap from 'bootstrap'
import { validateUrl, loadFeed } from './application.js'

const renderError = (element, message) => {
  element.classList.add('is-invalid')
  element.nextElementSibling.textContent = message
}

const clearError = (element) => {
  element.classList.remove('is-invalid')
  element.nextElementSibling.textContent = ''
}

const renderFeeds = (container, feeds, __i18n) => {
  container.innerHTML = feeds.map(feed =>
    `<li><h3>${feed.title}</h3><p>${feed.description}</p></li>`,
  ).join('')
}

const renderPosts = (container, posts, readPosts, i18n) => {
  const counter = document.getElementById('postsCounter')
  counter.textContent = posts.length

  container.innerHTML = posts.map((post) => {
    const isRead = readPosts.has(post.id)
    return `
      <li class="post-item">
        <a href="${post.link}" class="${isRead ? 'fw-normal' : 'fw-bold'}" target="_blank">${post.title}</a>
        <button class="btn btn-primary btn-sm" data-post-id="${post.id}">${i18n.t('view')}</button>
      </li>
    `
  }).join('')

  container.querySelectorAll('button[data-post-id]').forEach((btn) => {
    btn.removeEventListener('click', handlePreview)
    btn.addEventListener('click', handlePreview)
  })

  function handlePreview(e) {
    const postId = e.target.dataset.postId
    const post = posts.find(p => p.id === postId)
    if (post) {
      showModal(post, i18n)
      readPosts.add(postId)
      setTimeout(() => {
        const postLink = e.target.closest('.post-item').querySelector('a')
        postLink.classList.remove('fw-bold')
        postLink.classList.add('fw-normal')
      }, 100)
    }
  }
}

const showModal = (post, __i18n) => {
  const modal = new bootstrap.Modal(document.getElementById('previewModal'))
  document.getElementById('modalTitle').textContent = post.title
  document.getElementById('modalBody').innerHTML = `<p>${post.description}</p>`
  modal.show()
}

export const initView = (state, i18n) => {
  const watchedState = onChange(state, (path, value) => {
    if (path.startsWith('form.') && path !== 'form.status') {
      const input = document.getElementById('urlInput')
      if (watchedState.form.valid) {
        clearError(input)
      } else if (watchedState.form.error) {
        renderError(input, i18n.t(watchedState.form.error))
      }
    } else if (path === 'feeds') {
      renderFeeds(document.getElementById('feeds'), value, i18n)
    } else if (path === 'posts') {
      renderPosts(document.getElementById('posts'), value, state.readPosts, i18n)
    } else if (path === 'ui.status' && value === 'success') {
      const badge = document.querySelector('.badge')
      badge.textContent = i18n.t('rss-success')
      badge.style.display = 'block'
      setTimeout(() => badge.style.display = 'none', 3000)
    }
  })

  return watchedState
}

export const initFormWatcher = (form, state, __i18n) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const input = document.getElementById('urlInput')
    const url = input.value.trim()
    if (!url) return
    state.form.url = url
    state.form.status = 'validating'
    validateUrl(url, state.feeds)
      .then(() => {
        state.form.valid = true
        state.form.error = null
        return loadFeed(url)
      })
      .then((data) => {
        const newFeed = { url, ...data, id: `feed-${Date.now()}` }
        state.feeds.push(newFeed)
        state.posts.push(...data.items.map((post) => ({ ...post, feedId: newFeed.id })))
        state.ui.status = 'success'
        state.form.url = ''
        state.form.status = 'filling'
        input.value = ''
        input.focus()
      })
      .catch((err) => {
        state.form.valid = false
        state.form.error = err.message || (err.errors && err.errors[0] && err.errors[0].message) || 'Unknown error'
        state.form.status = 'filling'
        input.focus()
      })
  })

  document.getElementById('urlInput').addEventListener('input', e => {
    state.form.url = e.target.value.trim()
    state.form.status = 'filling'
    if (state.form.error) state.form.error = null
  })
}
