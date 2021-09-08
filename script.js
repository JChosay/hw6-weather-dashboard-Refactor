var userinput
var today = new Date();
var date = (today.getMonth()+1)+"/"+today.getDate()+"/"+today.getFullYear();
var latitude;
var longitude;
var tempCall;
var windCall;
var humidityCall;
var uvindexCall;
var main = $('#main');
var header = $('#header');
var searcharea = $('#searcharea');
var citysearch = $('#citysearch');
var inputfield = $('#inputfield');
var searchbtn = $('#searchbtn');
    searchbtn.on("click", submitCity);
var searchhistory = $('#searchhistory');
var citydayinfo = $('#citydayinfo');
var cityfivedayinfo = $('#cityfivedayinfo');
var forecastcards = $('#forecastcards');
var count = 8;
var dayIndex = [0, count, 2*count, 3*count, 4*count];
var forecastcontainer = $('#forecastcontainer');
var searchTrack = JSON.parse(window.localStorage.getItem('searchTrack'));

function loadScreen() {
    if (searchTrack == null) {
        return;
    } else if (searchTrack.length > 0) {
        searcharea.css('border-bottom', 'solid');
        for(var i=0; i<searchTrack.length+1; i++){
        
            if (searchTrack[i] == null){
                break;
            }else{
                var historyItem = $('<input>');
                    historyItem.attr('type','button');
                    historyItem.attr('value', searchTrack[i].cityname);
                    historyItem.attr('class','historybuttons');
                    searchhistory.append(historyItem);
                    historyItem.on("click",recallsearch);
            }
        }
    }

    for (var i = 0; i < searchTrack.length + 1; i++) {
        if (searchTrack[i] == null) {
            return;
        } else {
            var historyItem = $('#input');
                historyItem.attr('type', 'button');
                historyItem.text(searchTrack[i].cityname);
                historyItem.attr('class', 'historybuttons');
                searchhistory.append(historyItem);
        }
    }
}

function submitCity(event){
    event.preventDefault();
    citydayinfo.empty();
    userinput = inputfield.val();
    inputfield.empty();
    searcharea.css('border-bottom','solid');
    citydayinfo.css('display','inline');

    let locationURL = `https://us1.locationiq.com/v1/search.php?key=pk.21d85371f816e7abc29eac9fe2f539f3&q=${userinput}&format=json`;
    fetch(locationURL)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        latitude = data[0].lat;
        longitude = data[0].lon;
    
        var h1Tag = $('<h1>');
        h1Tag.text(userinput);
        citydayinfo.append(h1Tag);
        
        var dateTag = $('<h3>');
        dateTag.text(date);
        citydayinfo.append(dateTag);

        let queryUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,daily&appid=c422aee9ed9f77364f533d6d1dbe4ba9&units=imperial`

    fetch(queryUrl)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            console.log(data);
            tempCallConv = data.current.temp;
            windCallConv = data.current.wind_speed;
            humidityCall = data.current.humidity;
            uvindexCall = data.current.uvi;
            tempIcon = data.current.weather[0].icon;
            tempCall = tempCallConv.toFixed(0);
            windCall = windCallConv.toFixed(2);
        
            var results1Tag = $('<h4>');
                results1Tag.text("Temperature: " + tempCall + "°F" );
                citydayinfo.append(results1Tag);

            var results2Tag = $('<h4>');
                results2Tag.text("Wind Speed: " + windCall + " MPH" );
                citydayinfo.append(results2Tag);
        
            var results3Tag = $('<h4>');
                results3Tag.text("Humidity: " + humidityCall + "%" );
                citydayinfo.append(results3Tag);
            
            var results4Tag = $('<h4>');
                results4Tag.text("UV Index: "+uvindexCall);
                citydayinfo.append(results4Tag);
                citydayinfo.attr('display','flex');
            
            var iconTag = $('<img>');
                iconTag.attr('id','dayIcon');
                iconTag.attr('src',`https://openweathermap.org/img/wn/${tempIcon}@2x.png`);
                citydayinfo.append(iconTag);

            var searchTrack = localStorage.getItem('searchTrack');

            if(searchTrack===null){
                searchTrack = [
                    {
                    cityname: userinput,
                    temp: tempCall,
                    wind: windCall,
                    humidity: humidityCall,
                    uvi: uvindexCall
                    }
                ]
                window.localStorage.setItem('searchTrack',JSON.stringify(searchTrack));
                displaySearches();
            }else{
                var newSearch = [
                    {
                    cityname: userinput,
                    temp: tempCall,
                    wind: windCall,
                    humidity: humidityCall,
                    uvi: uvindexCall
                    }
                ]

                var searchMem = JSON.parse(localStorage.getItem('searchTrack'));
                searchTrack = searchMem.concat(newSearch);
                localStorage.setItem('searchTrack', JSON.stringify(searchTrack));
                displaySearches();
            }
        })
    })
    cityfivedayinfo.css('display','flex');    
}

function displaySearches(){  
    var searchTrack = JSON.parse(window.localStorage.getItem('searchTrack'));
    var searchTrackIndex = searchTrack.length;

    searchhistory.empty();
    for(var i=0; i<searchTrack.length+1; i++){
        
        if (searchTrack[i] == null){
            break;
        }else{
            var historyItem = $('<input>');
            historyItem.attr('type','button');
            historyItem.attr('value', searchTrack[i].cityname);
            historyItem.attr('class','historybuttons');
            searchhistory.append(historyItem);
            historyItem.on("click", recallsearch);
        }
    }
    displayFiveDay();     
}

function displayFiveDay(){
    cityfivedayinfo.css('display','flex');
    
    let fiveDayRequestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=c422aee9ed9f77364f533d6d1dbe4ba9&units=imperial`

    fetch(fiveDayRequestUrl)
        .then(function(response) {
            forecastcontainer.empty();
            return response.json();
        })
        .then(function(data){
            for(let i = 0; i < dayIndex.length; i++) {
                var tempWeather = data.list[dayIndex[i]];
                var tempDate = tempWeather.dt;
                var unixTimeStamp = tempDate*1000;
                var dateObject = new Date(unixTimeStamp);
                var humanDateFormat = dateObject.toLocaleString();
                var dateWeekday = dateObject.toLocaleString("en-US",{weekday:"long"});
                var dateMonth = dateObject.toLocaleString("en-US",{month:"long"});
                var dateDay = dateObject.toLocaleString("en-US",{day:"numeric"});
                var dateYear = dateObject.toLocaleString("en-US",{year:"numeric"});
                var dateDisplay = dateMonth+" "+dateDay+", "+dateYear
                var tempIcon = tempWeather.weather[0].icon;
                var tempPlace = tempWeather.main.temp;
                var tempFeelz = tempWeather.main.feels_like;
                var tempWind = tempWeather.wind.speed+" MPH"
                var tempHumidity = tempWeather.main.humidity
                var forecastcard = $('<div>');
                    forecastcard.attr('class','forecastcard');
                var dateWeekdayTag = $('<h3>');
                    dateWeekdayTag.text(dateWeekday);
                var iconTag = $('<img>');
                    iconTag.attr('src',`https://openweathermap.org/img/wn/${tempIcon}@2x.png`);
                var dateDateTag = $('<h4>');
                    dateDateTag.text(dateDisplay);
                var tempTag = $('<p>');
                    tempTag.text("Temp: " + tempPlace + "°F" );
                var feelzTag = $('<p>');
                    feelzTag.text("Feels like: " + tempFeelz + "°F" );
                var windTag = $('<p>');
                    windTag.text("Wind: "+tempWind);
                var humidTag = $('<p>');
                    humidTag.text("Humidity: "+tempHumidity+"%");

                forecastcard.append(dateWeekdayTag);
                forecastcard.append(iconTag);
                forecastcard.append(dateDateTag);
                forecastcard.append(tempTag);
                forecastcard.append(feelzTag);
                forecastcard.append(windTag);
                forecastcard.append(humidTag);
                forecastcontainer.append(forecastcard);
            }
        })
}

function recallsearch(){
    console.log(this.value);
    event.preventDefault();
    citydayinfo.empty();
    userinput = this.value;
    inputfield.empty();
    searcharea.css('border-bottom','solid');
    citydayinfo.css('display','inline');

    let locationURL = `https://us1.locationiq.com/v1/search.php?key=pk.21d85371f816e7abc29eac9fe2f539f3&q=${userinput}&format=json`;
    fetch(locationURL)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        latitude = data[0].lat;
        longitude = data[0].lon;
    
        var h1Tag = $('<h1>');
        h1Tag.text(userinput);
        citydayinfo.append(h1Tag);
        
        var dateTag = $('<h3>');
        dateTag.text(date);
        citydayinfo.append(dateTag);

        let queryUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,daily&appid=c422aee9ed9f77364f533d6d1dbe4ba9&units=imperial`

    fetch(queryUrl)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            console.log(data);
            tempCallConv = data.current.temp;
            windCallConv = data.current.wind_speed;
            humidityCall = data.current.humidity;
            uvindexCall = data.current.uvi;
            tempIcon = data.current.weather[0].icon;
            tempCall = tempCallConv.toFixed(0);
            windCall = windCallConv.toFixed(2);
        
            var results1Tag = $('<h4>');
                results1Tag.text("Temperature: " + tempCall + "°F" );
                citydayinfo.append(results1Tag);

            var results2Tag = $('<h4>');
                results2Tag.text("Wind Speed: " + windCall + " MPH" );
                citydayinfo.append(results2Tag);
        
            var results3Tag = $('<h4>');
                results3Tag.text("Humidity: " + humidityCall + "%" );
                citydayinfo.append(results3Tag);
            
            var results4Tag = $('<h4>');
                results4Tag.text("UV Index: "+uvindexCall);
                citydayinfo.append(results4Tag);
                citydayinfo.attr('display','flex');
            
            var iconTag = $('<img>');
                iconTag.attr('id','dayIcon');
                iconTag.attr('src',`https://openweathermap.org/img/wn/${tempIcon}@2x.png`);
                citydayinfo.append(iconTag);

                displaySearches();            
        })
    })
    cityfivedayinfo.css('display','flex');
}

console.log('OHIO STATE MUST BE DESTROYED.');
loadScreen();