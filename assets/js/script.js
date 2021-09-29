let today = moment();
let APIKey = "b929c0e3026118ea0292882110d701a8";
let cityNameEl = $("#city");
let city = null;
let units = "imperial"; // metric
let weatherTodayAndF = null;

let lat;
let lon;

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

    
    let queryURLCity = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey;
    
    fetchWeather(queryURLCity);
    // fetchWeather(queryURLToday, false);
    // createToday(data);
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
        let cityName = data[0].name;

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
            for (i = 1; i < 6; i++) {
                console.log(i)
                createForecast(data, i)
            }
        }); 
    }); 
}

function createToday(data, cityName){
    // console.log(cityName)
    let todayWeather = $("#todayWeather");
    let cityToday = $('<h1>' + cityName + ' ' + moment.unix(data.current.dt).format("MM/DD/YYYY") + '</h1>');
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
    let forecastWeather = $("#forecastWeather");
    let forecastTime = $('<h1>'+ moment.unix(data.daily[i].dt).format("MM/DD/YYYY") + '</h1>');
    let forecastTempDay = $('<p>' + data.daily[i].temp.day + '</p>');
    let forecastTempNight = $('<p>' + data.daily[i].temp.night + '</p>');
    let forecastWind = $('<p>' + data.daily[i].wind_speed + '</p>');
    let forecastHumidity = $('<p>' + data.daily[i].humidity + '</p>');
    forecastWeather.append(forecastTime);
    forecastWeather.append(forecastTempDay);
    forecastWeather.append(forecastTempNight);
    forecastWeather.append(forecastWind);
    forecastWeather.append(forecastHumidity);
    
}




// console.log(cityData)
