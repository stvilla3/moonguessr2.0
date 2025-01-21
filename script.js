let data = []; // Stores the JSON data
let currentIndex = 0; // Tracks the current image
let userLat, userLon; // User's clicked coordinates
let actualLat, actualLon; // Correct answer
let score = 0; // Total score
let userMarker, actualMarker; // Markers for map

// Load JSON data
fetch('data.json')
  .then((response) => response.json())
  .then((json) => {
    data = json;
    console.log('Data loaded:', data);
  })
  .catch((error) => console.error('Error loading JSON:', error));

// Start the game
document.getElementById('start-game').addEventListener('click', () => {
  loadNewImage();
});

// Display a random lunar image
function loadNewImage() {
  if (data.length === 0) {
    document.getElementById('image-container').innerHTML = `<p>No images available!</p>`;
    return;
  }

  // Select a random index
  const randomIndex = Math.floor(Math.random() * data.length);
  const imageData = data[randomIndex];

  actualLat = imageData.latitude;
  actualLon = imageData.longitude;

  document.getElementById('image-container').innerHTML = `
    <img src="${imageData.image}" alt="Lunar Image">
    <p>Where do you think this image was taken?</p>
  `;

  // Reset variables and clear old markers
  userLat = undefined;
  userLon = undefined;
  if (userMarker) {
    userMarker.remove();
    userMarker = null;
  }
  if (actualMarker) {
    actualMarker.remove();
    actualMarker = null;
  }

  // Disable the same image from appearing twice
  data.splice(randomIndex, 1); // Remove the selected image from the pool

  document.getElementById('lunar-map').addEventListener('click', handleMapClick);
  document.getElementById('guess').disabled = false;
}

// Submit guess
document.getElementById('guess').addEventListener('click', () => {
  if (userLat === undefined || userLon === undefined) {
    alert('Please click on the map to make a guess!');
    return;
  }

  // Calculate distance
  const distance = calculateDistance(userLat, userLon, actualLat, actualLon);
  let resultText = `You were ${distance.toFixed(2)} km away. `;

  if (distance < 50) {
    score += 100;
    resultText += '+100 points!';
  } else if (distance < 200) {
    score += 50;
    resultText += '+50 points!';
  } else {
    resultText += 'No points.';
  }

  document.getElementById('score-container').innerHTML = `<p>${resultText} Total Score: ${score}</p>`;

  // Add marker for the actual location
  const map = document.getElementById('lunar-map');
  const rect = map.getBoundingClientRect();
  const actualX = ((actualLon + 180) / 360) * map.offsetWidth;
  const actualY = ((90 - actualLat) / 180) * map.offsetHeight;

  if (actualMarker) {
    actualMarker.style.left = `${actualX}px`;
    actualMarker.style.top = `${actualY}px`;
  } else {
    actualMarker = document.createElement('div');
    actualMarker.className = 'marker actual';
    actualMarker.style.left = `${actualX}px`;
    actualMarker.style.top = `${actualY}px`;
    map.parentElement.appendChild(actualMarker);
  }

  // Move to the next image
  currentIndex++;
  document.getElementById('guess').disabled = true;
  document.getElementById('lunar-map').removeEventListener('click', handleMapClick);
});

// Calculate distance using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 1737.4; // Radius of the Moon in km
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


