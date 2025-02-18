import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import resources from './locales/index.js';
import view from './viewer.js';

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
  };

  const elem = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    errorFields: {},
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
    view(path, value);
  });

  const validate = (fields, feeds) => {
    const schema = yup.object({
      url: yup.string().required().url().notOneOf(feeds),
    });
    return schema.validate(fields);
  };

  elem.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const out = formData.get('url');

    validate({ url: out }, state.feeds)
      .then(() => {
        console.log('Ура!');
        watchState.feeds.push(out);
        watchState.form.validUrl = false;
        watchState.form.errors = null;
        elem.input.focus();
        elem.form.reset();
      })
      // eslint-disable-next-line no-shadow
      .catch((event) => {
        console.log('АЙ!!');
        watchState.form.status = null;
        watchState.form.validUrl = true;
        watchState.form.errors = event.message;
      });
  });
}
