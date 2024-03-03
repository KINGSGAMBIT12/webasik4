const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const https = require('https');
const app = express();
const port = 3000;
const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this line to parse JSON in the request body

let travelHistory = [];
let bookingCounter = 1; // Counter to generate unique booking IDs

function bookTravel(destination, date, adults, children) {
    const tourDate = moment(date, 'YYYY-MM-DD');
    const currentDate = moment();
    const daysDifference = tourDate.diff(currentDate, 'days');

    let baseCost;

    if (daysDifference < 7) {
        baseCost = 1000;
    } else if (daysDifference < 30) {
        baseCost = 700;
    } else {
        baseCost = 500;
    }

    const totalAdultsCost = baseCost * adults;
    const totalChildrenCost = (baseCost * 0.5) * children;

    const totalCost = totalAdultsCost + totalChildrenCost;

    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const bookingId = bookingCounter++; // Get and increment the booking counter

    const bookingDetails = `Booked a trip to ${destination} on ${date}. 
        Adults: ${adults}, Children: ${children}. 
        Total Cost: $${totalCost}. 
        Booking ID: ${bookingId}`;

    const bookingInfo = { id: bookingId, timestamp, bookingDetails, totalCost };

    travelHistory.push(bookingInfo);

    // Return the booking information
    return bookingInfo;
}

function renderTravelHistory() {
    if (travelHistory.length === 0) {
        return '<p>No travel history available.</p>';
    }
    return travelHistory.map(entry => `<p>${entry.timestamp}: ${entry.bookingDetails}</p>`).join('');
}

function fetchWeather(city, callback) {
    const openWeatherMapApiKey = '1440a81f89afb0a2eda2045fd09454fb';
    const openWeatherMapUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherMapApiKey}&units=metric`;

    https.get(openWeatherMapUrl, function (response) {
        let data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });

        response.on('end', function () {
            try {
                const weatherData = JSON.parse(data);

                if (weatherData.main && weatherData.weather) {
                    callback(null, weatherData);
                } else {
                    if (response.statusCode === 404) {
                        callback(new Error(`City '${city}' not found`), null);
                    } else {
                        callback(new Error('Invalid weather data'), null);
                    }
                }
            } catch (error) {
                callback(error, null);
            }
        });
    }).on('error', function (error) {
        callback(error, null);
    });
}

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/booktrip', (req, res) => {
    try {
        const { destination, date, adults, children } = req.body;

        if (!destination || !date || !adults || !children) {
            return res.status(400).send('Invalid request. Please provide all required fields.');
        }

        const bookingInfo = bookTravel(destination, date, adults, children);

        if (!bookingInfo) {
            return res.status(500).send('Error booking the trip.');
        }

        const { bookingDetails, totalCost } = bookingInfo;

        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        travelHistory.push({ timestamp, bookingDetails, totalCost });

        fetchWeather(destination, (weatherError, weatherData) => {
            if (weatherError) {
                console.error('Error fetching weather data:', weatherError.message);
                return res.status(500).send('Error fetching weather data');
            }

            res.send(`<h3>Booking Details:</h3><p>${bookingDetails}</p>
                      <h3>Weather Information:</h3><pre>${JSON.stringify(weatherData, null, 2)}</pre>`);
        });
    } catch (error) {
        console.error('Error in /booktrip route:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/getweather', (req, res) => {
    const { city } = req.body;

    // Check if the city name is provided
    if (!city) {
        return res.status(400).json({ error: 'City name is missing in the request.' });
    }

    fetchWeather(city, (weatherError, weatherData) => {
        if (weatherError) {
            console.error('Error fetching weather data:', weatherError.message);
            return res.status(500).json({ error: 'Error fetching weather data' });
        }

        res.json(weatherData); // Send the weather data as JSON
    });
});
// Update the server-side code (express.js)

app.get('/travelhistory', (req, res) => {
    res.json(travelHistory.map(entry => ({ id: entry.timestamp, ...entry })));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



// CRUD operations for booked trips (travel history)
app.get('/travelhistory', (req, res) => {
    res.json(travelHistory.map(entry => ({ id: entry.timestamp, ...entry })));
});

app.post('/addtravelhistory', (req, res) => {
    try {
        const { bookingDetails, totalCost } = req.body;

        if (!bookingDetails || !totalCost) {
            return res.status(400).send('Invalid request. Please provide all required fields.');
        }

        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        travelHistory.push({ timestamp, bookingDetails, totalCost });

        res.send(`Travel history entry added successfully. ID: ${timestamp}`);
    } catch (error) {
        console.error('Error in /addtravelhistory route:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/updatetravelhistory/:id', (req, res) => {
    const idToUpdate = parseInt(req.params.id);

    // Find the index of the travel history entry to update
    const indexToUpdate = travelHistory.findIndex(entry => entry.id === idToUpdate);

    if (indexToUpdate === -1) {
        return res.status(404).json({ error: 'Travel history entry not found.' });
    }

    // Update the date of the destination based on the provided input
    const updatedDate = req.body.date;
    if (updatedDate) {
        travelHistory[indexToUpdate].date = updatedDate;
    }

    res.json({ message: `Travel history entry updated successfully. ID: ${idToUpdate}` });
});



app.delete('/deletetravelhistory/:id', (req, res) => {
    const idToDelete = req.params.id;

    // Find the index of the travel history entry to delete
    const indexToDelete = travelHistory.findIndex(entry => entry.timestamp === idToDelete);

    if (indexToDelete === -1) {
        return res.status(404).send('Travel history entry not found.');
    }

    // Remove the entry from the array
    const deletedEntry = travelHistory.splice(indexToDelete, 1)[0];

    res.send(`Travel history entry deleted successfully. ID: ${idToDelete}`);
});
