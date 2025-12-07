// src/main.js
import './style.css'
import i18nInstance from './init.js'
const i18n = i18nInstance()

import { initView, initFormWatcher } from './view.js'
import { updateFeeds } from './application.js'

const state = {
  form: { url: '', status: 'filling', error: null, valid: false },
  feeds: [],
  posts: [],
  readPosts: new Set(),
  ui: { status: 'idle' }
}

const watchedState = initView(state, i18n)

initFormWatcher(document.getElementById('rssForm'), watchedState, i18n)  // <-- Передаём i18n

document.getElementById('urlInput').focus()

updateFeeds(watchedState)

console.log('RSS Aggregator initialized')
