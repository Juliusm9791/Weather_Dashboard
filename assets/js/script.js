let APIKey = "b929c0e3026118ea0292882110d701a8";
let cityNameEl = $("#citySearch");
let forecastWeather = $("#forecastWeather");
let todayWeather = $("#todayWeather");
let cityArrayButtons = $("#arrayButtons");

let city = null;
let checkCityInput = false;
let metricUnitsArray = [" °C", " m/s", " %"];
let imperialUnitsArray = [" °F", " MPH", " %"];
let unitsArray = imperialUnitsArray;
let units = "imperial"; // metric
let weatherTodayAndF = null;

let lat;
let lon;

let cityArray = [];
$(document).ready(getDataFromMemory);
    
function getDataFromMemory() {
    cityArray = JSON.parse(localStorage.getItem("cityArray"));
    if (cityArray === null) {
        cityArray = [];
    }
    showCityButtons()
}

function showCityButtons(){
    $("#arrayButtons").empty();
    for (i = cityArray.length -1; i >= 0; i--) {
        let cityButton = $('<button type="button" class="cityArrayButton">' + cityArray[i] + '</button>');
        cityArrayButtons.append(cityButton);
    }
}
    
$("#arrayButtons").on("click", citySelected);

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
    
}

$('input[type=radio][name=units]').change(function() {
    if (this.value === 'metric') {
        units = $("#metric").val()
        console.log(units)
        unitsArray = [];
        unitsArray = metricUnitsArray;
        console.log(unitsArray)
    }
    else if (this.value === 'imperial') {
        units = $("#imperial").val()
        console.log(units)
        unitsArray = [];
        unitsArray = imperialUnitsArray;
        console.log(unitsArray)
    }
});

$("#cityButton").on("click", inputCity);

function inputCity(){
    if (!checkCityInput){
        city = cityNameEl.val();
        cityNameEl.val("");
        if (city === "")
        console.log("EMPTY no city")
    }
    checkCityInput = false;
    let queryURLCity = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey;
    fetchWeather(queryURLCity);
    checkCityArray();
    showCityButtons();
}

function fetchWeather(queryURLCity) {
    fetch(queryURLCity)
    .then(function (response) {
        console.log(response)
        if (response.status === 404) {
                // todayWeather.empty();
                // let message = $('<h1> No Data found </h1>');
                // todayWeather.append(message);
            console.log("No city");

        } else {
            return response.json();
        }
    })
    .then(function (data) {
        if (data.length === 0){
            console.log(cityArray.length)
            cityArray.splice((cityArray.length-1), 1);
            todayWeather.empty();
            forecastWeather.empty();
            let message = $('<h1> No City found </h1>');
            todayWeather.append(message);
        } else {
            console.log(data);
            lat = data[0].lat;
            lon = data[0].lon;
            let cityName = data[0].name + ", " + data[0].country;
            let queryURLToday = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=" + units + "&exclude=minutely,hourly,alerts&appid=" + APIKey;
                
            fetch(queryURLToday)
            .then(function (response) {
                if (response.status === 404) {
                //     todayWeather.empty();
                //     let message = $('<h1> No Data found </h1>');
                //     todayWeather.append(message);
                //    console.log("No data found");
                } else {
                return response.json();
                }
            })
            .then(function (data) {
                console.log(data);
                createToday(data, cityName)
                forecastWeather.empty();
                for (i = 0; i < 5; i++) {
                    createForecast(data, i+1)
                }
            }); 
        }
    }); 
}

function createToday(data, cityName){
    todayWeather.empty();
    let weathericonLink = "http://openweathermap.org/img/w/" + data.current.weather[0].icon + ".png";

    console.log(moment.tz(data.timezone).format("(MM/DD/YYYY) h m "), "TZ")

    let cityToday = $('<h1>' + cityName + ' ' + moment.tz(data.timezone).format("(MM/DD/YYYY)") + '</h1>');
    let weathericon = $('<div class="icon"><img src="' + weathericonLink + '" alt="Weather icon"></div>');
    let todayTemp = $('<p>' + "Temp: " + Math.round(data.current.temp) + unitsArray[0] + '</p>');
    let todayWind = $('<p>' +  "Wind: " + data.current.wind_speed +  unitsArray[1] +'</p>');
    let todayHumidity = $('<p>' +  "Humidity: " + data.current.humidity +  unitsArray[2] +'</p>');
    let todayUV = $('<p>' +  "UV Index: " + "<span id='uviColor'>" + data.current.uvi + "</span></p>" );
    todayWeather.append(cityToday);
    todayWeather.append(weathericon);
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


