const imageFolder = 'images/arv/'; // Folder where PNG images are stored

async function fetchImageListFromServer() {
  const response = await fetch(`${imageFolder}list.json`);
  if (!response.ok) {
    throw new Error('Failed to load image list');
  }
  const files = await response.json();
  return files.filter(file => file.toLowerCase().endsWith('.png'));
}

async function loadImageFilenames(count) {
  const availableImages = await fetchImageListFromServer();
  const shuffled = availableImages.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count).map((filename, index) => ({
    src: imageFolder + filename,
    index: index + 1
  }));
  return selected.sort(() => 0.5 - Math.random()); // shuffle again for display order
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

// Set up listener

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loadImages').addEventListener('click', async () => {
    const count = parseInt(document.getElementById('imageCount').value, 10);
    try {
      const images = await loadImageFilenames(count);
      createImageGrid(images);
    } catch (err) {
      alert('Error loading images: ' + err.message);
    }
  });
});