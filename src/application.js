// src/application.js
import * as yup from 'yup';  // <-- ФИКС: * as yup вместо default
import axios from 'axios';

// Импорт i18n для переводов ошибок
import i18nInstance from './init.js';
const i18n = i18nInstance();

// Шаг 3: yup.setLocale для i18next
yup.setLocale({
  mixed: { required: 'not-empty' },
  string: {
    url: 'invalid-url',
    min: 'not-empty'
  }
});

const schema = yup.string().url().required();  // <-- Работает с * as yup

const getProxyUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const parseRSS = (response) => {
  // Чистая функция: парсит XML
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data.contents, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(i18n.t('invalid-rss'));
  }

  const title = doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('description')?.textContent || '';

  const items = [...doc.querySelectorAll('item')].map((item) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,  // Простой уникальный ID
    title: item.querySelector('title')?.textContent || '',
    link: item.querySelector('link')?.textContent || '',
    description: item.querySelector('description')?.textContent || ''
  }));

  return { title, description, items };
};

const normalizeData = (feeds, posts) => {
  // Нормализация: фиды и посты с id (если используешь — ок)
  return {
    feeds: feeds.map((feed, index) => ({ ...feed, id: `feed-${index}` })),
    posts: posts.map((post, index) => ({ ...post, id: `post-${index}`, feedId: post.feedId }))
  };
};

const validateUrl = (url, existingFeeds) => {
  // Шаг 2: валидация с yup (асинхронно, промисы)
  return schema.validate(url)
    .then(() => {
      if (existingFeeds.some((feed) => feed.url === url)) {
        throw new Error(i18n.t('rss-exists'));
      }
      return true;
    })
    .catch((err) => {
      throw err;
    });
};

const loadFeed = (url) => {
  // Шаг 4: скачивание + парсинг, промисы
  return axios.get(getProxyUrl(url))
    .then((response) => parseRSS(response))
    .catch((err) => {
      if (err.message === 'Network Error') {
        throw new Error(i18n.t('network-error'));
      }
      throw err;
    });
};

const updateFeeds = (state) => {
  // Шаг 5: рекурсивный setTimeout каждые 5 сек
  if (state.feeds.length === 0) return;

  const promises = state.feeds.map((feed) =>
    loadFeed(feed.url)
      .then((data) => {
        const newPosts = data.items.filter((item) => !state.posts.some((p) => p.link === item.link));
        state.posts.push(...newPosts.map((post) => ({ ...post, feedId: feed.id })));
      })
      .catch((err) => console.error('Update error:', err))
  );

  Promise.all(promises)
    .finally(() => {
      setTimeout(() => updateFeeds(state), 5000);
    });
};

export {
  validateUrl,
  loadFeed,
  updateFeeds,
  normalizeData,
  parseRSS
};
