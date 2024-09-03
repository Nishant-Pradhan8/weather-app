let inputElem = document.querySelector(".search__input");
let tempElem = document.querySelector(".temp");
let weatherTypeElem = document.querySelector(".weather__type");
let realfeelElem = document.querySelector(".realfeel");
let pressureElem = document.querySelector(".pressure");
let humidityElem = document.querySelector(".humidity");
let cloudcoverElem = document.querySelector(".cloudcover");
let visibilityElem = document.querySelector(".visibility");
let dateElem = document.querySelector(".date");
let sliderElem = document.querySelector(".swiper-wrapper");
let currentLocElem = document.querySelector(".current__location");
let weatherIconElem = document.querySelector(".weather__icon");
let searchElem = document.querySelector(".search__icon");
let userLocationElem = document.querySelector(".userLocation");

main();

async function latlongConv(cityName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=9c8663ae0a652aae62617589a4accaa9`
    );
    const data = await response.json();
    const { lat, lon } = data[0];
    return { lat, lon };
  } catch (error) {
    return { lat: null, lon: null };
  }
}

async function findWeather(latitude, longitude) {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=9c8663ae0a652aae62617589a4accaa9&units=metric`
  );
  let data = await response.json();
  console.log(data)

  //For weather
  let weatherObj = data.weather;
  let weatherArr = weatherObj[0];
  let main = weatherArr.main;
  let iconCode = weatherArr.icon;
  weatherIconElem.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  //For main
  const mainArr = data.main;
  let temp = mainArr.temp;
  let feels_like = mainArr.feels_like;
  let humidity = mainArr.humidity;
  let pressure = mainArr.pressure;

  //For visisbility
  const visibility = data.visibility;

  //For clouds
  const cloudsArr = data.clouds;
  const clouds = cloudsArr.all;
  const fullInfo = {
    main,
    temp,
    feels_like,
    humidity,
    pressure,
    visibility,
    clouds,
  };
  return fullInfo;
}

async function dailyWeather(latitude, longitude) {
  try {
    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=9c8663ae0a652aae62617589a4accaa9&units=metric&cnt=40`
    );
    let data = await response.json();
    let forcast = [];
    let list = data.list;
    list.forEach((day) => {
      let temp = day.main.temp;
      let mainObj = day.weather;
      let main = mainObj[0].main;
      let iconCode = mainObj[0].icon;
      let date = day.dt_txt;
      forcast.push({ temp, main, date, iconCode });
    });
    let dayInfoHtml = "";
    let daysCount = 1;
    let todaysDate = new Date();
    let formattedDate = todaysDate.toLocaleDateString("en-CA");
    forcast.forEach((day) => {
      let date = day.date;
      let wordArray = date.split(" ");
      if (wordArray.includes("12:00:00") && wordArray[0] !== formattedDate) {
        let displayingDate = UpcommingDateConverter(daysCount);
        daysCount++;
        let HTML = `
          <div class="card swiper-slide">
            <h1 class="daily__temp temp">${day.temp}&deg</h1>
            <div class="daily__card__second--div card__second--div">
               <div class="daily__weather__type-div weather__type-div">
                  <h1 class="daily__weather__type weather__type">${day.main}</h1>
                  <img class="weather__icon" src="https://openweathermap.org/img/wn/${day.iconCode}@2x.png">
               </div>
               <p class="date daily__date">${displayingDate}</p>
             </div>
          </div>`;
        dayInfoHtml += HTML;
      }
    });

    sliderElem.innerHTML = dayInfoHtml;
  } catch (error) {
    console.log(error);
  }
}

function todayDate() {
  const today = new Date();
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const formattedDate = today.toLocaleDateString("en-US", options);
  return formattedDate;
}

function UpcommingDateConverter(i) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + i);
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const formattedDate = tomorrow.toLocaleDateString("en-US", options);
  return formattedDate;
}

async function main() {
  inputElem.classList.remove("locationNotFound");
  inputElem.placeholder = "Enter Location";
  let cityName = inputElem.value || localStorage.getItem("city") || "Paris";
  await latlongConv(cityName).then(({ lat, lon }) => {
    latitude = lat;
    longitude = lon;
  });
  if (latitude === null || longitude === null) {
    inputElem.classList.add("locationNotFound");
    inputElem.value = "";
    inputElem.placeholder = "Location not found!";
  } else {
    localStorage.setItem("city", cityName);
    let main = "";
    let temp = "";
    let feels_like = "";
    let humidity = "";
    let pressure = "";
    let visibility = "";
    let clouds = "";
    await findWeather(latitude, longitude).then((fullInfo) => {
      main = fullInfo.main;
      temp = fullInfo.temp;
      feels_like = fullInfo.feels_like;
      humidity = fullInfo.humidity;
      pressure = fullInfo.pressure;
      visibility = fullInfo.visibility;
      clouds = fullInfo.clouds;
    });

    tempElem.innerHTML = `${temp}&deg`;
    weatherTypeElem.innerHTML = main;
    realfeelElem.innerHTML = `RealFeel: ${feels_like}&deg`;
    pressureElem.innerHTML = `Pressure: ${pressure} hPa`;
    humidityElem.innerHTML = `Humididty: ${humidity}%`;
    cloudcoverElem.innerHTML = `Cloud Cover: ${clouds}%`;
    visibilityElem.innerHTML = `Visibility: ${visibility / 1000} km`;
    let upperCase = cityName[0].toUpperCase() + cityName.slice(1);
    currentLocElem.innerHTML = upperCase;

    dateElem.innerHTML = todayDate();
    dailyWeather(latitude, longitude);
  }
}

inputElem.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    main();
  }
});

searchElem.addEventListener("click", () => {
  main();
});

userLocationElem.addEventListener("click", async () => {
  inputElem.classList.remove("locationNotFound");
  inputElem.placeholder = "Enter Location";
  let { latitude, longitude } = await getLocation();
  let cityName = await cordToName(latitude, longitude);
  let main = "";
  let temp = "";
  let feels_like = "";
  let humidity = "";
  let pressure = "";
  let visibility = "";
  let clouds = "";
  await findWeather(latitude, longitude).then((fullInfo) => {
    main = fullInfo.main;
    temp = fullInfo.temp;
    feels_like = fullInfo.feels_like;
    humidity = fullInfo.humidity;
    pressure = fullInfo.pressure;
    visibility = fullInfo.visibility;
    clouds = fullInfo.clouds;
  });
  tempElem.innerHTML = `${temp}&deg`;
  weatherTypeElem.innerHTML = main;
  realfeelElem.innerHTML = `RealFeel: ${feels_like}&deg`;
  pressureElem.innerHTML = `Pressure: ${pressure} hPa`;
  humidityElem.innerHTML = `Humididty: ${humidity}%`;
  cloudcoverElem.innerHTML = `Cloud Cover: ${clouds}%`;
  visibilityElem.innerHTML = `Visibility: ${visibility / 1000} km`;
  let upperCase = cityName[0].toUpperCase() + cityName.slice(1);
  currentLocElem.innerHTML = upperCase;

  dateElem.innerHTML = todayDate();
  dailyWeather(latitude, longitude);
});

async function cordToName(latitude, longitude) {
  let response = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=9c8663ae0a652aae62617589a4accaa9`
  );
  let data = await response.json();
  let cityObj = data[0];
  let cityName = cityObj.name;
  return cityName;
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(console.log(error));
        }
      );
    } else {
      reject(alert("Your Device does not support this feature."));
    }
  });
}

var swiper = new Swiper(".mySwiper", {
  slidesPerView: 3,
  spaceBetween: 30,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    320: {
      slidesPerView: 2,
    },
    425: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 2,
    },
    1280: {
      slidesPerView: 3,
    },
    1440: {
      slidesPerView: 3,
    },
  },
});
