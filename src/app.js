import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import view from './viewer.js';
import resources from './locales/index.js';
import parseMechanism from './parse.js';

function validate(fields, feeds) {
  const schema = yup.object({
    url: yup.string().required().url().notOneOf(feeds),
  });
  return schema.validate(fields);
}

const fullUrl = (rssUrl) => {
  const url = new URL('/get', 'https://allorigins.hexlet.app');
  const { searchParams } = url;
  searchParams.set('url', rssUrl);
  searchParams.set('disableCache', 'true');
  return url.toString();
};

function upDatingPosts(stateData) {
  const promise = stateData.feeds.map((feed) => axios.get(fullUrl(feed.url))
    .then((response) => {
      const newData = parseMechanism(response.data.contents);
      const filteredData = stateData.posts.flat(Infinity).map((item) => item.title);

      newData.items.forEach((item) => {
        if (!filteredData.includes(item.title)) {
          stateData.posts.unshift(item);
        }
      });
    })
    .catch((error) => {
      console.error(error);
    }));

  Promise.all([promise])
    .then(() => setTimeout(upDatingPosts, 5000, stateData));
}

export default function app() {
  const state = {
    form: {
      status: null,
      errors: null,
    },
    feeds: [],
    posts: [],
    event: {
      openModal: null,
    },
  };

  const selectors = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    btnClose: document.querySelector('.btn-close'),
    btnSecondary: document.querySelector('.btn-secondary'),
    modal: document.querySelector('.modal'),
    body: document.querySelector('body'),
  };

  const defLang = 'ru';

  const i18nxt = i18next.createInstance();
  i18nxt.init({
    debug: false,
    lng: defLang,
    resources,
  })
    .then(() => {
      yup.setLocale({
        mixed: {
          required: i18nxt.t('errors.required'),
          notOneOf: i18nxt.t('errors.alreadyExists'),
        },
        string: {
          url: i18nxt.t('errors.invalidURL'),
        },
      });

      const watchedState = view(state, selectors, i18nxt);

      upDatingPosts(watchedState);

      selectors.form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const out = formData.get('url');

        validate({ url: out }, state.feeds.map((item) => item.url))
          .then(() => {
            axios.get(fullUrl(out))
              .then((response) => {
                watchedState.form.errors = null;
                const parseData = parseMechanism(response.data.contents);
                state.posts.unshift(parseData.items);
                watchedState.feeds.unshift({
                  title: parseData.title,
                  description: parseData.description,
                  url: out,
                });
                watchedState.form.status = i18nxt.t('errors.addRSS');
              })
              .catch((error) => {
                if (error.isParsingError) {
                  watchedState.form.errors = i18nxt.t('errors.invalidRSS');
                } else if (error.message === 'Network Error') {
                  watchedState.form.errors = i18nxt.t('errors.netError');
                } else {
                  watchedState.form.errors = i18nxt.t('errors.unknownError');
                }
              });

            selectors.input.focus();
            selectors.form.reset();
          })
          .catch((errorReact) => {
            watchedState.form.status = null;
            watchedState.form.errors = errorReact.message;
          });
      });

      selectors.posts.addEventListener('click', (event) => {
        const { target } = event;
        if (target.tagName === 'BUTTON') {
          const allPost = [state.posts].flat(Infinity);
          const titleSelector = target.parentNode.querySelector('a');
          const titleText = titleSelector.textContent;
          const post = allPost.find((searchPost) => searchPost.title === titleText);

          watchedState.event.openModal = [titleSelector, post];
        }
      });

      selectors.btnClose.addEventListener('click', () => {
        watchedState.event.openModal = null;
      });

      selectors.btnSecondary.addEventListener('click', () => {
        watchedState.event.openModal = null;
      });
    });
}
