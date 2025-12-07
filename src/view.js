// src/view.js
import onChange from 'on-change';
import * as bootstrap from 'bootstrap';
import { validateUrl, loadFeed } from './application.js';

const renderError = (element, message) => {
  element.classList.add('is-invalid');
  element.nextElementSibling.textContent = message;
};

const clearError = (element) => {
  element.classList.remove('is-invalid');
  element.nextElementSibling.textContent = '';
};

const renderFeeds = (container, feeds, i18n) => {
  container.innerHTML = feeds.map((feed) =>
    `<li><h3>${feed.title}</h3><p>${feed.description}</p></li>`
  ).join('');
};

const renderPosts = (container, posts, readPosts, i18n) => {
  const counter = document.getElementById('postsCounter');
  counter.textContent = posts.length;

  container.innerHTML = posts.map((post) => {
    const isRead = readPosts.has(post.id);
    return `
      <li class="post-item">
        <a href="${post.link}" class="${isRead ? 'fw-normal' : 'fw-bold'}" target="_blank">${post.title}</a> <!-- Убрали text-body -->
        <button class="btn btn-primary btn-sm" data-post-id="${post.id}">${i18n.t('view')}</button>
      </li>
    `;
  }).join('');

  // Вотчер для кнопок предпросмотра
  container.querySelectorAll('button[data-post-id]').forEach((btn) => {
    btn.removeEventListener('click', handlePreview);
    btn.addEventListener('click', handlePreview);
  });

  function handlePreview(e) {
    const postId = e.target.dataset.postId;
    const post = posts.find((p) => p.id === postId);
    if (post) {
      showModal(post, i18n);
      readPosts.add(postId);
    }
  }
};

const showModal = (post, i18n) => {
  const modal = new bootstrap.Modal(document.getElementById('previewModal'));
  document.getElementById('modalTitle').textContent = post.title;
  document.getElementById('modalBody').innerHTML = `<p>${post.description}</p>`;
  modal.show();
};

export const initView = (state, i18n) => {
  const watchedState = onChange(state, (path, value) => {
    console.log('onChange:', path, value);  // ДЕБАГ (удали после тестов)
    if (path.startsWith('form.') && path !== 'form.status') {  // Рендер для form (кроме status)
      const input = document.getElementById('urlInput');
      if (watchedState.form.valid) {
        clearError(input);
      } else if (watchedState.form.error) {
        renderError(input, i18n.t(watchedState.form.error));
      }
    } else if (path === 'feeds') {
      renderFeeds(document.getElementById('feeds'), value, i18n);
    } else if (path === 'posts') {
      renderPosts(document.getElementById('posts'), value, state.readPosts, i18n);
    } else if (path === 'ui.status' && value === 'success') {
      const badge = document.querySelector('.badge');
      badge.textContent = i18n.t('rss-success');
      badge.style.display = 'block';
      setTimeout(() => badge.style.display = 'none', 3000);
    }
  });

  return watchedState;
};

export const initFormWatcher = (form, state, i18n) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('urlInput');
    const url = input.value.trim();
    if (!url) return;
    console.log('Submit URL:', url);  // ДЕБАГ (удали после тестов)
    state.form.url = url;
    state.form.status = 'validating';
    console.log('Validating URL:', url);
    validateUrl(url, state.feeds)
      .then(() => {
        console.log('URL valid');
        state.form.valid = true;
        state.form.error = null;
        return loadFeed(url);
      })
      .then((data) => {
        console.log('Loaded data:', data);
        const newFeed = { url, ...data, id: `feed-${Date.now()}` };
        state.feeds.push(newFeed);
        state.posts.push(...data.items.map((post) => ({ ...post, feedId: newFeed.id })));
        state.ui.status = 'success';
        state.form.url = '';
        state.form.status = 'filling';
        input.value = '';
        input.focus();
      })
      .catch((err) => {
        console.error('Error:', err);
        state.form.valid = false;
        state.form.error = err.message || (err.errors && err.errors[0] && err.errors[0].message) || 'Unknown error';
        state.form.status = 'filling';
        input.focus();
      });
  });

  document.getElementById('urlInput').addEventListener('input', (e) => {
    state.form.url = e.target.value.trim();
    state.form.status = 'filling';
    if (state.form.error) state.form.error = null;
  });
};
