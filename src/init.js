// src/init.js
import i18next from 'i18next';

export default () => {
  i18next.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru: {
        translation: {
          'rss-success': 'RSS успешно загружен',
          'rss-exists': 'RSS уже существует',
          'not-empty': 'Не должно быть пустым',
          'invalid-url': 'Ссылка должна быть валидным URL',
          'invalid-rss': 'Ресурс не содержит валидный RSS',
          'network-error': 'Ошибка сети',
          'view': 'Просмотр',
          'feeds-title': 'Фиды',
          'posts-title': 'Посты',
          'posts-counter': '{{count}} {{count}}',
          'add-button': 'Добавить',
          'url-placeholder': 'https://example.com/rss',
          'modal-close': 'Закрыть'
        }
      }
    }
  });

  return i18next;
};
