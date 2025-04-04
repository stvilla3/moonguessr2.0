let data = [];
let usedIndices = []; 
let userLat, userLon; 
let actualLat, actualLon; 
let score = 0; 
let userMarker, actualMarker;


fetch('data.json')
  .then((response) => response.json())
  .then((json) => {
    data = json;
    console.log('Data loaded:', data);
  })
  .catch((error) => console.error('Error loading JSON:', error));


document.getElementById('start-game').addEventListener('click', () => {
  loadNewImage();
});


function loadNewImage() {
  if (usedIndices.length === data.length) {
    document.getElementById('image-container').innerHTML = `<p>Game Over! Your final score: ${score}</p>`;
    return;
  }

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * data.length);
  } while (usedIndices.includes(randomIndex)); 

  usedIndices.push(randomIndex); 
  const imageData = data[randomIndex];

  actualLat = imageData.latitude;
  actualLon = imageData.longitude;

  document.getElementById('image-container').innerHTML = `
    <img src="${imageData.image}" alt="Lunar Image">
    <p>Where do you think this image was taken?</p>
  `;


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


  const map = document.getElementById('lunar-map');
  if (!map.dataset.clickListener) {
    map.addEventListener('click', handleMapClick);
    map.dataset.clickListener = 'true'; 
  }

  document.getElementById('guess').disabled = false;
}


function handleMapClick(event) {
  const map = document.getElementById('lunar-map');
  const rect = map.getBoundingClientRect();


  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;


  const mapWidth = map.offsetWidth;
  const mapHeight = map.offsetHeight;

  userLon = (clickX / mapWidth) * 360 - 180; 
  userLat = 90 - (clickY / mapHeight) * 180;

  console.log(`User guessed: Latitude ${userLat.toFixed(2)}, Longitude ${userLon.toFixed(2)}`);

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

document.getElementById('guess').addEventListener('click', () => {
  if (userLat === undefined || userLon === undefined) {
    alert('Please click on the map to make a guess!');
    return;
  }


  const distance = calculateDistance(userLat, userLon, actualLat, actualLon);
  let resultText = `You were ${distance.toFixed(2)} km away. `;

  // changed scoring mechanics in the following two lines
  score = 5000*5400/distance^2
  resultText = score

  document.getElementById('score-container').innerHTML = `<p>${resultText} Total Score: ${score}</p>`;


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

  
  document.getElementById('guess').disabled = true;
});


function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 1737.4; 
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
