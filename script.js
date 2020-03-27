// allows the entirty of the html to  load before the js code runs
$(document).ready(function() {
  // an on click event is called to listen for a click on the button with the id "search-button"
  $("#search-button").on("click", function() {
    // create a new variable searchValue which we define by calling the text entered by the user input field with the id "search-value"
    var searchValue = $("#search-value").val();

    // clear input box
    // call the id "search-value" and set its value to an empty string
    $("#search-value").val("");

    // call the searchWeather function using the argument SearchValue
    searchWeather(searchValue);
  });

  // searchWeather function is called above to enter the text of searchValue into the user history.
  // specifying the history class we reference the onclick event and create a new list item 
  $(".history").on("click", "li", function() {
    // we define the searchWeather function as localized to its argument (searchValue) and in this variable we are pulling the text
    searchWeather($(this).text());
  });

  // create a fuction called makeRow 
  function makeRow(text) {
    // define a new variable li and set it euqal to a new list item with the class "list-group-item list-group-item-action" and select its text which we set equal to the varaiable text
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    // the new li item is appended to the page by selecting the class "history" and using tha append method
    $(".history").append(li);
  }

  //creat a function called searchWeather to retrive the requested information from the API 
  function searchWeather(searchValue) {
    // utilize the ajax method to perform and async AJAX request
    $.ajax({
      type: "GET",
      // url is determined by API documentation and inputs the searchValue 
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      // this formats the imformation provided in JS Object Notation 
      dataType: "json",
      // callback function that is executed AJAX request succeeds
      success: function(data) {
        // create history link for this search
        // if statement references history object to search for past urls. IndexOf method finds the first occurencs of the specied value this time it is the searchValue variable. If the searchValue is not found indexOf() method will retun a value of -1. There for we ultilve the indexOf to search the window history for the searchValue. if it is not found(=== -1), then the function takes place 
        if (history.indexOf(searchValue) === -1) {
          // the value of the searchValue is pushed into the history object
          history.push(searchValue);
          // item is placed in local storage with the key of "history" and the value of the json string
          window.localStorage.setItem("history", JSON.stringify(history));
          // makeRow function is called with the argument searchValue
          makeRow(searchValue);
        }
        
        // clear any old content
        // id today si cleared of content as new content is prepared
        $("#today").empty();


        // create html content for current weather
        // varaibes for each of the displayed elements are created using jquery, given a corresponding class, text from the JSON object
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }

  
  // useing a function to ge the forecast
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d",
      // "&appid=7ba67ac190f85fdba2e2dc6b9d32e93c&units=imperial",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=7ba67ac190f85fdba2e2dc6b9d32e93c&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
