import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import { view, newPostRender } from './viewer.js';
import parseMechanism from './parse.js';

export default function app() {
  const defaultLanguage = 'ru';

  const state = {
    form: {
      status: null,
      validUrl: false,
      errors: null,
    },
    feeds: [],
    data: [],
    dataUpdate: [],
  };

  const elem = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
  };

  const i18nxt = i18next.createInstance();
  i18nxt.init({
    debug: false,
    lng: defaultLanguage,
    resources,
  });

  yup.setLocale({
    mixed: {
      required: i18nxt.t('errors.required'),
      notOneOf: i18nxt.t('errors.alreadyExists'),
    },
    string: {
      url: i18nxt.t('errors.invalidURL'),
    },
  });

  const watchState = onChange(state, (path, value) => {
    view(state, path, value);
  });

  const validate = (fields, feeds) => {
    const schema = yup.object({
      url: yup.string().required().url().notOneOf(feeds),
    });
    return schema.validate(fields);
  };

  const fullUrl = (rssUrl) => {
    const url = new URL('/get', 'https://allorigins.hexlet.app');
    const { searchParams } = url;
    searchParams.set('url', rssUrl);
    searchParams.set('disableCache', 'true');
    return url.toString();
  };

  function dataUpdate(stateData) {
    stateData.feeds.forEach((feed) => {
      axios.get(fullUrl(feed))
        .then((response) => {
          const newData = parseMechanism(response);
          const filtData = [[stateData.dataUpdate.map((item) => item.title)]].flat(Infinity);
          stateData.data.forEach((oldItem) => {
            oldItem.items.forEach((item) => {
              filtData.push(item.title);
            });
          });

          newData.items.forEach((item) => {
            if (!filtData.includes(item.title)) {
              stateData.upData.push(item);
              newPostRender(item, stateData);
            }
          });

          setTimeout(dataUpdate, 5000, stateData);
        })
        .catch();
    });
  }

  elem.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const out = formData.get('url');

    validate({ url: out }, state.feeds)
      .then(() => {
        axios.get(fullUrl(out))
          .then((response) => {
            watchState.feeds.unshift(out);
            watchState.form.validUrl = false;
            watchState.form.errors = null;
            axios.get(`https://allorigins.hexlet.app/get?url=${out}`);
            watchState.data.unshift(parseMechanism(response));
            watchState.form.status = i18nxt.t('errors.addRSS');
            dataUpdate(state);
          })
          .catch((e) => {
            if (e.isParsingError) {
              watchState.form.errors = i18nxt.t('errors.invalidRSS');
            } else if (e.message === 'Network Error') {
              watchState.form.errors = i18nxt.t('errors.netError');
            } else {
              watchState.form.errors = i18nxt.t('errors.unknownError');
            }
          });

        elem.input.focus();
        elem.form.reset();
      })
      .catch((errorResponse) => {
        watchState.form.status = null;
        watchState.form.validUrl = true;
        watchState.form.errors = errorResponse.message;
      });
  });
}
