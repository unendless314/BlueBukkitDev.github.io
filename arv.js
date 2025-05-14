const imageFolder = 'images/arv/'; // Folder where PNG images are stored

let availableImagesCache = [];

async function fetchImageListFromServer() {
  const response = await fetch(`${imageFolder}list.json`);
  if (!response.ok) {
    throw new Error('Failed to load image list');
  }
  const files = await response.json();
  availableImagesCache = files.filter(file => file.filename.toLowerCase().endsWith('.png'));
  return availableImagesCache;
}

function populateTagDropdown(tags) {
    const tagDropdown = document.getElementById('tagDropdown');
    const tagToggle = document.getElementById('tagDropdownToggle');
    const tagOptions = document.getElementById('tagOptions');
  
    tagOptions.innerHTML = '';
    tags.sort().forEach(tag => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'tagFilter';
      checkbox.value = tag;
      checkbox.addEventListener('change', () => {
        loadImageFilenames(parseInt(document.getElementById('imageCount').value, 10));
      });
      label.appendChild(checkbox);
      label.append(` ${tag}`);
      tagOptions.appendChild(label);
    });
  
    // Attach toggle
    tagToggle.onclick = (e) => {
      e.stopPropagation(); // prevent document click from closing it instantly
      tagDropdown.classList.toggle('open');
    };
  
    // Close dropdown if clicking outside
    document.addEventListener('click', (e) => {
      if (!tagDropdown.contains(e.target)) {
        tagDropdown.classList.remove('open');
      }
    });
  }   

  function getSelectedTags() {
    const checkboxes = document.querySelectorAll('input[name="tagFilter"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
  }

function updatePoolSizeDisplay(filteredImages) {
  const poolSizeDisplay = document.getElementById('poolSize');
  poolSizeDisplay.textContent = `Target pool size: ${filteredImages.length}`;
}

async function loadImageFilenames(count) {
  const availableImages = availableImagesCache.length ? availableImagesCache : await fetchImageListFromServer();
  const selectedTags = getSelectedTags();
  const filteredImages = selectedTags.length === 0 ? availableImages : availableImages.filter(img => {
    return img.tags && img.tags.some(tag => selectedTags.includes(tag));
  });

  updatePoolSizeDisplay(filteredImages);

  const shuffled = filteredImages.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count).map((image, index) => ({
    src: imageFolder + image.filename,
    index: index + 1
  }));
  return selected.sort(() => 0.5 - Math.random());
}

function createImageGrid(images) {
  const container = document.getElementById('imageGrid');
  container.innerHTML = '';

  images.forEach(({ src, index }, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'imageWrapper';
    wrapper.dataset.index = index;

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Remote Viewing Option`;

    const flipContainer = document.createElement('div');
    flipContainer.className = 'flip-container';

    const flipper = document.createElement('div');
    flipper.className = 'flipper';

    const front = document.createElement('div');
    front.className = 'front';

    const back = document.createElement('div');
    back.className = 'back';
    back.innerHTML = `<span style=\"color: gold; font-size: 1.5em;\">${index}</span>`;

    const button = document.createElement('button');
    button.textContent = 'Select';
    button.className = 'selectButton';
    button.onclick = () => {
      flipper.classList.add('flipped');

      const wrappers = document.querySelectorAll('.imageWrapper');
      wrappers.forEach(w => {
        if (w !== wrapper) {
          w.classList.add('blurred');
          const otherButton = w.querySelector('button.selectButton');
          if (otherButton) otherButton.style.display = 'none';
        }
      });
    };

    front.appendChild(button);
    flipper.appendChild(front);
    flipper.appendChild(back);
    flipContainer.appendChild(flipper);

    wrapper.appendChild(img);
    wrapper.appendChild(flipContainer);
    container.appendChild(wrapper);
  });
}

window.addEventListener('DOMContentLoaded', async () => {

  document.getElementById('loadImages').addEventListener('click', async () => {
    const count = parseInt(document.getElementById('imageCount').value, 10);
    try {
      const images = await loadImageFilenames(count);
      createImageGrid(images);
    } catch (err) {
      alert('Error loading images: ' + err.message);
    }
  });

  try {
    const images = await fetchImageListFromServer();
    const allTags = new Set();
    images.forEach(img => img.tags && img.tags.forEach(tag => allTags.add(tag)));
    populateTagDropdown(Array.from(allTags));
    updatePoolSizeDisplay(images);
  } catch (err) {
    console.error(err);
  }
});
