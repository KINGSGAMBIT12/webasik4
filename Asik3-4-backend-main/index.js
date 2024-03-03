function bookTrip() {
    const destination = document.getElementById('destinationInput').value;
    const date = document.getElementById('dateInput').value;
    const adults = document.getElementById('adultsInput').value;
    const children = document.getElementById('childrenInput').value;

    if (!destination || !date || !adults || !children) {
        alert('Please fill in all required fields.');
        return;
    }

    fetch('/booktrip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `destination=${destination}&date=${date}&adults=${adults}&children=${children}`,
    })
        .then(response => response.text())
        .then(result => {
            console.log('Server response:', result);

            const costMatch = result.match(/Cost: \$([\d,]+)/);
            const cost = costMatch ? costMatch[1] : 'unknown';

            alert(`Booking successful! Destination: ${destination}, Date: ${date}, Cost: $${cost}`);

            document.getElementById('bookingResult').innerHTML = result;

            fetch('/travelhistory')
                .then(response => response.text())
                .then(history => {
                    document.getElementById('travelHistory').innerHTML = history;
                })
                .catch(error => {
                    console.error('Error fetching travel history:', error);
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


// Update the client-side code (index.js)

// Update the client-side code (index.js)

function updateTravelHistorySection() {
    fetch('/travelhistory')
        .then(response => response.json())
        .then(history => {
            const travelHistoryContent = document.getElementById('travelHistoryContent');
            if (travelHistoryContent) {
                const formattedHistory = formatTravelHistory(history);
                travelHistoryContent.innerHTML = `<h3>Travel History:</h3>${formattedHistory}`;
            }
        })
        .catch(error => {
            console.error('Error fetching travel history:', error);
        });
}


function formatTravelHistory(history) {
    return history.map(entry => {
        const formattedDate = new Date(entry.timestamp).toLocaleString();
        return `${formattedDate}: ${entry.bookingDetails}`;
    }).join('<br>');
}



function openBookingDialog() {
    const dialogBox = document.createElement('div');
    dialogBox.className = 'booking-dialog';

    const destinationInput = document.createElement('input');
    destinationInput.type = 'text';
    destinationInput.placeholder = 'Enter destination';
    destinationInput.id = 'bookingDestination';

    const submitButton = document.createElement('button');
    submitButton.innerText = 'Book Now';
    submitButton.onclick = submitBooking;

    dialogBox.appendChild(destinationInput);
    dialogBox.appendChild(submitButton);

    document.body.appendChild(dialogBox);
}

function submitBooking() {
    const destination = document.getElementById('bookingDestination').value;

    if (!destination) {
        alert('Please enter a destination.');
        return;
    }

    console.log('Booking initiated for destination:', destination);
    closeBookingDialog();
}

function closeBookingDialog() {
    const dialogBox = document.querySelector('.booking-dialog');
    if (dialogBox) {
        dialogBox.remove();
    }
}

function redirectToPaymentForm() {
    window.location.href = 'payment.html';
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function redirectToTravelHistory() {
    window.location.href = 'travelhistory.html';
}

function redirectToServices() {
    if (window.location.pathname.includes('travelhistory.html')) {
        window.location.href = 'index.html#service-section';
    } else {
        const serviceSection = document.getElementById('service-section');
        if (serviceSection) {
            serviceSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const userDisplay = document.getElementById('userDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loggedInUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userDisplay) {
            userDisplay.textContent = `Welcome, ${loggedInUser}`;
            userDisplay.style.display = 'inline-block';
        }
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (userDisplay) userDisplay.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
});

function login(event) {
    event.preventDefault();
    const username = document.getElementById('signInUsername').value;
    const password = document.getElementById('signInPassword').value;

    if (username === 'admin' && password === 'admin') {
        sessionStorage.setItem('loggedInUser', username);
        alert('You were logged in as admin');
        window.location.href = 'admin.html';
    } else {
        alert('Invalid username or password');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const loggedInUser = sessionStorage.getItem('loggedInUser');

    if (loggedInUser) {
        const userElement = document.getElementById('loggedInUser');
        if (userElement) {
            userElement.textContent = loggedInUser;
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const userDisplay = document.getElementById('userDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loggedInUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userDisplay) {
            userDisplay.textContent = `Welcome, ${loggedInUser}`;
            userDisplay.style.display = 'inline-block';
        }
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (userDisplay) userDisplay.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
});

function logout() {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

function redirectToLogin(event) {
    event.preventDefault();
    window.location.href = 'login.html';
}

function redirectToSignup(event) {
    event.preventDefault();
    window.location.href = 'signup.html';
}

function getWeather() {
    const city = document.getElementById('cityInput').value;

    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    fetch('/getweather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: city }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then(weatherData => {
        const tableHtml = createWeatherTable(weatherData);
        document.getElementById('weatherResult').innerHTML = tableHtml;
    })
    .catch(error => {
        console.error('Error fetching weather data:', error);
        document.getElementById('weatherResult').innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
    });
}

function createWeatherTable(weatherInfo) {
    const tableHtml = `
        <style>
            table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 20px;
            }
            table, th, td {
                border: 1px solid #ddd;
            }
            th, td {
                padding: 15px;
                text-align: left;
            }
        </style>
        <h1>Weather Information</h1>
        <table>
            <tr>
                <th>City</th>
                <td>${weatherInfo.name}</td>
            </tr>
            <tr>
                <th>Temperature</th>
                <td>${weatherInfo.main.temp} °C</td>
            </tr>
            <tr>
                <th>Feels Like</th>
                <td>${weatherInfo.main.feels_like} °C</td>
            </tr>
            <tr>
                <th>Description</th>
                <td>${weatherInfo.weather[0].description}</td>
            </tr>
            <tr>
                <th>Icon</th>
                <td><img src="https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}.png" alt="Weather Icon"></td>
            </tr>
            <tr>
                <th>Coordinates</th>
                <td>${weatherInfo.coord.lat}, ${weatherInfo.coord.lon}</td>
            </tr>
            <tr>
                <th>Humidity</th>
                <td>${weatherInfo.main.humidity}%</td>
            </tr>
            <tr>
                <th>Pressure</th>
                <td>${weatherInfo.main.pressure} hPa</td>
            </tr>
            <tr>
                <th>Wind Speed</th>
                <td>${weatherInfo.wind.speed} m/s</td>
            </tr>
            <tr>
                <th>Country Code</th>
                <td>${weatherInfo.sys.country}</td>
            </tr>
            <tr>
                <th>Timezone</th>
                <td>${weatherInfo.timezone}</td>
            </tr>
        </table>
    `;

    return tableHtml;
}
function updateTravelDate() {
    const idToUpdateInput = document.getElementById('idToUpdateInput');
    const newDate = document.getElementById('newDateInput').value;

    const idToUpdate = idToUpdateInput.value.trim();

    if (!idToUpdate || !newDate) {
        alert('Invalid input. Please provide both ID and new date.');
        return;
    }

    // Send a PUT request to update the travel date
    fetch(`/updatetravelhistory/${idToUpdate}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            date: newDate,
        }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            updateTravelHistorySection();  // Update the travel history section
        })
        .catch(error => {
            console.error('Error updating travel date:', error);
            alert('Error updating travel date. Please try again.');
        });
}
