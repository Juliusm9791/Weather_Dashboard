let APIKey = "b929c0e3026118ea0292882110d701a8";
let cityNameEl = $("#citySearch");
let forecastWeather = $("#forecastWeather");
let todayWeather = $("#todayWeather");
let cityArrayButtons = $("#arrayButtons");
let clearHistory = $("#clearHistory");

let city = null;
let checkCityInput = false;
let metricUnitsArray = [" °C", " m/s", " %"];
let imperialUnitsArray = [" °F", " MPH", " %"];
let unitsArray = imperialUnitsArray;
let units = "imperial"; // metric
let cityArray = [];

// clearHistory.css({"display": "none"});

$(document).ready(getDataFromMemory);
    
function getDataFromMemory() {
    cityArray = JSON.parse(localStorage.getItem("cityArray"));
    if (cityArray === null) {
        cityArray = [];
        clearHistory.css({"display": "none"});
    }
    showCityButtons()
}

function showCityButtons(){
    cityArrayButtons.empty();
    for (i = cityArray.length -1; i >= 0; i--) {
        let cityButton = $('<button type="button" class="cityArrayButton">' + cityArray[i] + '</button>');
        cityArrayButtons.append(cityButton);
    }
}
    
cityArrayButtons.on("click", citySelected);

function citySelected(event){
    city = $(event.target).text();
    checkCityInput = true;
    inputCity();
}

function checkCityArray(){
    let maxArayLength = 10;
    if (cityArray.includes(city)){
        let cityIndex = cityArray.indexOf(city);
        cityArray.splice(cityIndex, 1);
        cityArray.push(city);
    } else if(cityArray.length >= maxArayLength){
        cityArray.splice(0, 1);
        cityArray.push(city);
    } else {
        cityArray.push(city);
    }
    localStorage.setItem("cityArray", JSON.stringify(cityArray))
    clearHistory.css({"display": "block"});  
}

$('input[type=radio][name=units]').change(function() {
    if (this.value === 'metric') {
        units = $("#metric").val()
        unitsArray = [];
        unitsArray = metricUnitsArray;
    }
    else if (this.value === 'imperial') {
        units = $("#imperial").val()
        unitsArray = [];
        unitsArray = imperialUnitsArray;
    }
});

$("#cityButton").on("click", inputCity);

function inputCity(){
    if (!checkCityInput){
        fixCityName();
        cityNameEl.val("");
        if (city === "") {
            errorMessage('<h1> Enter City Name</h1>')
            return;
        }
    }
    checkCityInput = false;
    let queryURLCity = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey;
    fetchWeather(queryURLCity);
}

function fetchWeather(queryURLCity) {
    fetch(queryURLCity)
    .then(function (response) {
        if (response.status === 404) {
            errorMessage('<h1> No City Found Load Failed</h1>')
        } else {
            return response.json();
        }
    })
    .then(function (data) {
        if (data.length === 0){
            errorMessage('<h1> No City Found</h1>')
        } else {
            // console.log(data);
            let lat = data[0].lat;
            let lon = data[0].lon;
            let cityName = data[0].name + ", " + data[0].country;
            let queryURLToday = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=" + units + "&exclude=minutely,hourly,alerts&appid=" + APIKey;
                
            fetch(queryURLToday)
            .then(function (response) {
                if (response.status === 404) {
                    errorMessage('<h1> Bad Citi Cordiantes Load Failed</h1>')
                } else {
                return response.json();
                }
            })
            .then(function (data) {
                createToday(data, cityName)
                forecastWeather.empty();
                for (i = 0; i < 5; i++) {
                    createForecast(data, i+1)
                }
                checkCityArray();
                showCityButtons();
            }); 
        }
    }); 
}

function createToday(data, cityName){
    todayWeather.empty();
    let weathericonLink = "http://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png";
    let cityAndIcon = $('<div></div>');
    let cityToday = $('<h1>' + cityName + ' ' + moment.tz(data.timezone).format("(MM/DD/YYYY)") + '</h1>');
    let weathericon = $('<div class="icon"><img src="' + weathericonLink + '" alt="Weather icon"></div>');
    let todayTemp = $('<p>' + "Temp: " + Math.round(data.current.temp) + unitsArray[0] + '</p>');
    let todayWind = $('<p>' +  "Wind: " + data.current.wind_speed +  unitsArray[1] +'</p>');
    let todayHumidity = $('<p>' +  "Humidity: " + data.current.humidity +  unitsArray[2] +'</p>');
    let todayUV = $('<p>' +  "UV Index: " + "<span id='uviColor'>" + data.current.uvi + "</span></p>" );
    todayWeather.append(cityAndIcon);
    todayWeather.children().append(cityToday);
    todayWeather.children().append(weathericon);
    todayWeather.append(todayTemp);
    todayWeather.append(todayWind);
    todayWeather.append(todayHumidity);
    todayWeather.append(todayUV);
    if (data.current.uvi < 3) {
        $("#uviColor").css({"background-color": "green", "color": "white"});
    }  else if (data.current.uvi >= 3 && data.current.uvi < 6){
        $("#uviColor").css({"background-color": "yellow", "color": "black"});
    } else if (data.current.uvi >= 6 && data.current.uvi < 8) {
        $("#uviColor").css({"background-color": "orange", "color": "white"});
    } else if (data.current.uvi >= 8 && data.current.uvi < 11){
        $("#uviColor").css({"background-color": "red", "color": "white"});
    } else {
        $("#uviColor").css({"background-color": "violet", "color": "black"});
    }
 }

function createForecast(data, i){
    forecastWeather.append($('<div class="forecastCard"></div>'))
    let forecastTime = $('<h1>'+ moment.unix(data.daily[i].dt).format("MM/DD/YYYY") + '</h1>');
    let weathericonLink = "http://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png";
    let weathericon = $('<div class="icon"><img src="' + weathericonLink + '" alt="Weather icon"></div>');
    let forecastTempDay = $('<p>' +  "Day Temp: " + Math.round(data.daily[i].temp.day) + unitsArray[0] + '</p>');
    let forecastTempNight = $('<p>' +  "Night Temp: " + Math.round(data.daily[i].temp.night) +  unitsArray[0] +'</p>');
    let forecastWind = $('<p>' +  "Wind: " + data.daily[i].wind_speed +  unitsArray[1] +'</p>');
    let forecastHumidity = $('<p>' +  "Humidity: " + data.daily[i].humidity +  unitsArray[2] +'</p>');
    forecastWeather.children().eq(i-1).append(forecastTime);
    forecastWeather.children().eq(i-1).append(weathericon);
    forecastWeather.children().eq(i-1).append(forecastTempDay);
    forecastWeather.children().eq(i-1).append(forecastTempNight);
    forecastWeather.children().eq(i-1).append(forecastWind);
    forecastWeather.children().eq(i-1).append(forecastHumidity);
}

function errorMessage(msg){
    todayWeather.empty();
    forecastWeather.empty();
    let message = $(msg);
    todayWeather.append(message);
}

function fixCityName(){
    city = cityNameEl.val().trim()
    city = city.toLowerCase()
    city = city.charAt(0).toUpperCase() + city.slice(1);
}

clearHistory.on("click", function(){
    cityArrayButtons.empty()
    cityArray = [];
    localStorage.removeItem("cityArray");
    clearHistory.css({"display": "none"});
});


