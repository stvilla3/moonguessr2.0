let data = []; // Stores the JSON data
let usedIndices = []; // Tracks used images
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
  if (usedIndices.length === data.length) {
    document.getElementById('image-container').innerHTML = `<p>Game Over! Your final score: ${score}</p>`;
    return;
  }

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * data.length);
  } while (usedIndices.includes(randomIndex)); // Ensure no duplicate images

  usedIndices.push(randomIndex); // Mark this index as used
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

  // Add map click event listener (ensure it's only added once)
  const map = document.getElementById('lunar-map');
  if (!map.dataset.clickListener) {
    map.addEventListener('click', handleMapClick);
    map.dataset.clickListener = 'true'; // Track that the listener is added
  }

  document.getElementById('guess').disabled = false;
}

// Handle map click
function handleMapClick(event) {
  const map = document.getElementById('lunar-map');
  const rect = map.getBoundingClientRect();

  // Get click position relative to the image
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // Map the click to latitude and longitude
  const mapWidth = map.offsetWidth;
  const mapHeight = map.offsetHeight;

  userLon = (clickX / mapWidth) * 360 - 180; // Longitude: -180 to 180
  userLat = 90 - (clickY / mapHeight) * 180; // Latitude: 90 to -90

  console.log(`User guessed: Latitude ${userLat.toFixed(2)}, Longitude ${userLon.toFixed(2)}`);

  // Add or update the user marker
  if (userMarker) {
    userMarker.style.left = `${clickX}px`;
    userMarker.style.top = `${clickY}px`;
  } else {
    userMarker = document.createElement('div');
    userMarker.className = 'marker user';
    userMarker.style.left = `${clickX}px`;
    userMarker.style.top = `${clickY}px`;
    map.parentElement.appendChild(userMarker);
  }
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
  document.getElementById('guess').disabled = true;
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
