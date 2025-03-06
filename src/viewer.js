import onChange from 'on-change';

function postsRendering(state, selectors, i18nxt) {
  const { posts } = selectors;
  posts.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const insDiv = document.createElement('div');
  insDiv.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nxt.t('text.post');
  insDiv.append(h2);

  div.append(insDiv);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.flat(Infinity).forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    a.href = item.link;
    a.classList.add('fw-bold');
    a.textContent = item.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18nxt.t('text.button');

    li.append(a);
    li.append(button);
    ul.append(li);
  });

  div.append(ul);
  selectors.posts.append(div);
}

function feedsRendering(state, selectors, i18nxtxt) {
  const renderDiv = selectors.feeds;
  renderDiv.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const insDiv = document.createElement('div');
  insDiv.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nxtxt.t('text.feed');
  insDiv.append(h2);
  div.append(insDiv);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  state.feeds.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = item.title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = item.description;

    li.append(h3);
    li.append(p);
    ul.append(li);
  });

  div.append(ul);
  selectors.feeds.append(div);
}
function newDataRender(state, selectors, i18nxt) {
  const ul = selectors.posts.querySelector('ul');
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const a = document.createElement('a');
  a.href = state.posts[0].link;
  a.classList.add('fw-bold');
  a.textContent = state.posts[0].title;

  const button = document.createElement('button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.textContent = i18nxt.t('text.button');

  li.append(a);
  li.append(button);
  ul.prepend(li);
}

function openModal(selectors, value) {
  const {
    modalTitle, modalBody, modal, body,
  } = selectors;
  const [titleSelector, post] = value;

  titleSelector.classList.add('fw-normal', 'link-secondary');
  titleSelector.classList.remove('fw-bold');

  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  titleSelector.href = post.link;

  modal.classList.add('show');
  modal.style.cssText = `
    display: block;
    background-color: rgba(0,0,0,.5);
  `;

  body.style.cssText = ` 
    overflow: hidden; 
    padding-right: 17px;
  `;
}

function view(state, selectors, i18nxt) {
  const watched = onChange(state, (path, value) => {
    const { feedback, modal, body } = selectors;
    switch (path) {
      case 'form.errors':
        if (value) {
          selectors.input.classList.add('is-invalid');
        } else {
          selectors.input.classList.remove('is-invalid');
        }
        feedback.textContent = value;
        feedback.classList.add('text-danger');
        feedback.classList.remove('text-success');
        break;
      case 'form.status':
        feedback.textContent = value;
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
        break;
      case 'feeds':
        feedsRendering(state, selectors, i18nxt);
        postsRendering(state, selectors, i18nxt);
        break;
      case 'posts':
        newDataRender(state, selectors, i18nxt);
        break;
      case 'event.openModal':
        if (value) {
          openModal(selectors, value);
        } else {
          modal.style.cssText = 'display: none';
          body.style.cssText = '';
        }
        break;
      default:
        break;
    }
  });
  return watched;
}

export default view;
