const form = document.querySelector('form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const result = await saveTechnology(form);
  if (result) {
    renderTechnologies();
  }
});

const renderTechnologies = async () => {
  const technologies = await getTechnologies();
  addTechnologies(technologies);
  form.reset();
};

const addTechnologies = (technologies) => {
  document.querySelector('.technologies').innerHTML = '';
  for (const technology of technologies) {
    addTechnology(technology);
  }
};

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

const url = '/technologies';

// GET
async function getTechnologies() {
  const response = await fetch(url);
  return response.json();
}

// POST
async function saveTechnology(form) {
  const formData = new FormData(form);
  const result = {};
  for (const entry of formData.entries()) {
    result[entry[0]] = entry[1];
  }

  // Access the form element...
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  });

  return response;
}

renderTechnologies();