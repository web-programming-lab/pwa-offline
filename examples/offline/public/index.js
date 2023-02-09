const setStatusElement = (status) => {
  const statusEl = document.querySelector('#status');
  statusEl.innerHTML = status
    ? `<span style="color:green">Online</span>`
    : `<span style="color:red">Offline</span>`;
};

// Listen to online / offline event
window.addEventListener('online', async () => {
  setStatusElement(navigator.onLine);
  document
    .querySelector('.container')
    .insertAdjacentHTML(
      'afterbegin',
      `<button id="sync" aria-busy="true" class="secondary">Sync…</progress>`
    );

  await syncTechnologies();

  setTimeout(async () => {
    await renderTechnologies();
    document.querySelector('#sync').remove();
  }, 500); // Wait for the sync to finish
});

window.addEventListener('offline', () => {
  setStatusElement(navigator.onLine);
});

// Get form element
const form = document.querySelector('form');

/**
 * Listen to the submit event
 */
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const result = await saveTechnology(form);

  if (result && navigator.onLine) {
    renderTechnologies();
  }

  form.reset();
});

/**
 * Fetch technologies from API and render it in the DOM
 */
const renderTechnologies = async () => {
  const technologies = await getTechnologies();
  addTechnologies(technologies);
  form.reset();
};

/**
 * Add technology elements in the DOM
 * @param {*} technologies
 */
const addTechnologies = (technologies) => {
  document.querySelector('.technologies').innerHTML = '';
  for (const technology of technologies) {
    addTechnology(technology);
  }
};

/**
 * Add technology element in the DOM
 * @param {*} technology
 */
const addTechnology = (technology) => {
  const techElement = document.createElement('article');

  techElement.innerHTML = `
    <header>
      <mark>${technology.ring}</mark>
    </header>  
    <hgroup>
      <h2>${technology.name}</h2>
      <h3>${technology.description}</h3>
    </hgroup>
    <footer>
      <strong>${technology.category}</strong>
    </footer>  
  `;
  document.querySelector('.technologies').appendChild(techElement);
};

// GET
async function getTechnologies() {
  const response = await fetch('/technologies');
  return response.json();
}

// POST
async function saveTechnology(form) {
  const formData = new FormData(form);
  const result = {};
  for (const entry of formData.entries()) {
    result[entry[0]] = entry[1];
  }

  if (navigator.onLine) {
    // API Call
    return postTechnology(result);
  } else {
    // Persist offline in Indexed DB
    addTechnology(result);
    return await db.technologies.add({
      name: result.name,
      category: result.category,
      ring: result.ring,
      description: result.description,
      synch: false,
    });
  }
}

async function postTechnology(technology) {
  const response = await fetch('/technologies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(technology),
  });
  return response;
}

let db = null;

function openDatabase() {
  db = new Dexie('technologies');

  db.version(1).stores({
    technologies: '++id, name, category, ring, description',
  });
}

function bootstrap() {
  if (!window.indexedDB) {
    console.warn('Your browser has not any IndexedDB Support!');
  } else {
    openDatabase();
  }
  renderTechnologies();
}

/**
 * Synchronize offline created technologies with the backend
 * @returns
 */
function syncTechnologies() {
  return db.transaction('rw', db.technologies, async () => {
    await db.technologies.each((technology) => {
      postTechnology(technology);
      deleteTechnologyInSynchDb(technology);
    });
  });
}

/**
 * Delete synchronized technology in IndexedDB
 * @param {*} technology
 */
function deleteTechnologyInSynchDb(technology) {
  db.transaction('rw', db.technologies, async () => {
    await db.technologies.where('name').equals(technology.name).delete();
  })
    .then(() => {
      console.log('Transaction committed.');
    })
    .catch((err) => {
      console.error(err.stack);
    });
}

bootstrap();
