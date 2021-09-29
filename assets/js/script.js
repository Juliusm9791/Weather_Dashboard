let APIKey = "b929c0e3026118ea0292882110d701a8";
let cityNameEl = $("#city");
let forecastWeather = $("#forecastWeather");
let todayWeather = $("#todayWeather");
let cityArrayButtons = $("#ArrayButtons");

let city = null;
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
    console.log(cityArray)
// show data in html
    for (i = 0; i < cityArray.length; i++) {
        let cityButton = $('<button type="button" class="cityArrayButtons">' + cityArray[i] + '</button>');
        cityArrayButtons.append(cityButton);
    }
}
    
$(".cityArrayButtons").on("click", citySelected);

function citySelected(event){
    console.log("ppppppp")
    console.log($(event.target));
}


$('input[type=radio][name=units]').change(function() {
    if (this.value === 'metric') {
        units = $("#metric").val()
        console.log(units)
    }
    else if (this.value === 'imperial') {
        units = $("#imperial").val()
        console.log(units)
    }
});

$("#cityButton").on("click", function(){
    city = cityNameEl.val();
    cityArray.push(city);
    localStorage.setItem("cityArray", JSON.stringify(cityArray))
    let queryURLCity = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey;
    fetchWeather(queryURLCity);
});


function fetchWeather(queryURLCity) {
    fetch(queryURLCity)
    .then(function (response) {
        if (response.status === 404) {
            console.log("No city");
        } else {
            return response.json();
        }
    })
    .then(function (data) {
        console.log(data);
        lat = data[0].lat;
        lon = data[0].lon;
        let cityName = data[0].name + ", " + data[0].country;

        let queryURLToday = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=" + units + "&exclude=minutely,hourly,alerts&appid=" + APIKey;

        fetch(queryURLToday)
        .then(function (response) {
            if (response.status === 404) {
               console.log("No data found");
            } else {
             return response.json();
            }
        })
        .then(function (data) {
            console.log(data);
            createToday(data, cityName)
            forecastWeather.empty();
            for (i = 1; i < 6; i++) {
                console.log(i)
                createForecast(data, i)
            }
        }); 
    }); 
}

function createToday(data, cityName){
    console.log(todayWeather)
    todayWeather.empty();
    let cityToday = $('<h1>' + cityName + ' ' + moment.unix(data.current.dt).format("(MM/DD/YYYY)") + '</h1>');
    let todayTemp = $('<p>' + data.current.temp + '</p>');
    let todayWind = $('<p>' + data.current.wind_speed + '</p>');
    let todayHumidity = $('<p>' + data.current.humidity + '</p>');
    let todayUV = $('<p>' + data.current.uvi + '</p>');
    todayWeather.append(cityToday);
    todayWeather.append(todayTemp);
    todayWeather.append(todayWind);
    todayWeather.append(todayHumidity);
    todayWeather.append(todayUV);
}

function createForecast(data, i){
    forecastWeather.append($('<div class="forecastCard"></div>'))
    let forecastTime = $('<h1>'+ moment.unix(data.daily[i].dt).format("MM/DD/YYYY") + '</h1>');
    let forecastTempDay = $('<p>' + data.daily[i].temp.day + '</p>');
    let forecastTempNight = $('<p>' + data.daily[i].temp.night + '</p>');
    let forecastWind = $('<p>' + data.daily[i].wind_speed + '</p>');
    let forecastHumidity = $('<p>' + data.daily[i].humidity + '</p>');
    forecastWeather.children().eq(i-1).append(forecastTime);
    forecastWeather.children().eq(i-1).append(forecastTempDay);
    forecastWeather.children().eq(i-1).append(forecastTempNight);
    forecastWeather.children().eq(i-1).append(forecastWind);
    forecastWeather.children().eq(i-1).append(forecastHumidity);
}


