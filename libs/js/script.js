// add loader gif
$(window).load(function () {
	$(".loader").fadeOut("slow");
});

// initialise map and add layer for borders and markers
var mymap = L.map("mapid").setView([0, 0], 2);
$layers = L.layerGroup().addTo(mymap);

// add tile layer
var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(mymap);

// add icons
var homeIcon = L.AwesomeMarkers.icon({
	icon: 'home',
	prefix: 'fa',
	markerColor: 'lightred'
});

var mapIcon = L.AwesomeMarkers.icon({
	icon: 'map-pin',
	prefix: 'fa',
});

// add easybuttons
$covidButton = L.easyButton(
	"<i class='fas fa-virus'></i>",
	function () {
		$("#covid").modal("show");
	}, "COVID-19 information"
).addTo(mymap);
$covidButton.disable();

$currencyButton = L.easyButton(
	"<i class='far fa-money-bill-alt'></i>",
	function () {
		$("#currency").modal("show");
	}, "Currency conversion"
).addTo(mymap);
$currencyButton.disable();

$imageGalleryButton = L.easyButton(
	"<i class='fas fa-images'></i>",
	function () {
		$("#imageGallery").modal("show");
	}, "Image gallery"
).addTo(mymap);
$imageGalleryButton.disable();

$countryNewsButton = L.easyButton(
	"<i class='far fa-newspaper'></i>",
	function () {
		$("#countryNews").modal("show");
	}, "National news stories"
).addTo(mymap);
$countryNewsButton.disable();

$weatherButton = L.easyButton(
	"<i class='fas fa-cloud-sun'></i>",
	function () {
		$("#weather").modal("show");
	}, "Weather report"
).addTo(mymap);
$weatherButton.disable();

// get current location and populate modal
$(document).ready(() => {
	navigator.geolocation.getCurrentPosition(position => {
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			var coordinates = [latitude, longitude];

			$currentLocationMarker = L.marker(coordinates, {
					icon: homeIcon
				}).addTo(mymap)
				.bindPopup('<b>Current location</b>')
				.openPopup();
			mymap.setView(coordinates, 5);

			$currentLocationMarker.on('click', () => {
				$(".loader").fadeIn("slow");
				$.ajax({
					url: "libs/php/getLatLngInfo.php",
					type: "POST",
					dataType: "json",
					data: {
						lat: latitude,
						lng: longitude
					},
					success: function (result) {
						console.log(result);

						if (result.status.name == "ok") {
							$("#currentLocation").modal("show");
							$('.cityName').html(result['data']['openWeather']['name']);
							$('#currentTemperature').html(Math.round(result['data']['openWeather']['main']['temp']));
							$('#currentHumidity').html(result['data']['openWeather']['main']['humidity']);
							$('#currentPressure').html(result['data']['openWeather']['main']['pressure']);
							$('#currentWind').html(Math.round(result['data']['openWeather']['wind']['speed']));
							$sunrise = new Date((result['data']['openWeather']['sys']['sunrise'] + result['data']['openWeather']['timezone']) * 1000).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit'
							});
							$sunset = new Date((result['data']['openWeather']['sys']['sunset'] + result['data']['openWeather']['timezone']) * 1000).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit'
							});
							$('#currentSunriseSet').html($sunrise + ' / ' + $sunset);
							$('#currentWeatherIcon').attr('src', 'http://openweathermap.org/img/wn/' + result['data']['openWeather']['weather'][0]['icon'] + '.png');
							$description = result['data']['openWeather']['weather']['0']['description'];
							$('#currentDescription').html($description[0].toUpperCase() + $description.substring(1));

							$currentWikiUrl = "https://" + result['data']['geoNamesWiki']['geonames'][0]['wikipediaUrl'];
							$('#currentWiki').html(result['data']['geoNamesWiki']['geonames'][0]['summary']);
							$('#currentWikiUrl').attr('href', $currentWikiUrl);

							if (result['data']['pixabayCurrent']['hits'][0] == undefined) {
								$('#currentImage').hide();
							}
							else {
								$('#currentImage').attr('src', result['data']['pixabayCurrent']['hits'][0]['webformatURL']);
							};

							$('#currentCountryName').html(result['data']['covidCurrent']['data'][0]['location']);
							$('#currentConfirmed').html(Number(result['data']['covidCurrent']['data'][0]['confirmed']).toLocaleString());
							$('#currentDeaths').html(Number(result['data']['covidCurrent']['data'][0]['dead']).toLocaleString());
							$('#currentRecovered').html(Number(result['data']['covidCurrent']['data'][0]['recovered']).toLocaleString());

							$(".loader").fadeOut("slow");
						};
					},
					error: function (jqXHR, textStatus, errorThrown) {
						console.log(errorThrown);
						console.log(textStatus);
						console.log(jqXHR);
						$(".loader").fadeOut("slow");
					}
				});
			});
		},
		function (error) {
			console.log(error);
			alert('Unable to find location');
		});
});

// populate select country field
$.ajax({
	url: "libs/php/getCountry.php",
	type: 'POST',
	dataType: 'json',
	success: function (result) {
		console.log(result);
		$.each(result.data, i => {
			$('#select').append($("<option>", {
				text: result.data[i].name,
				value: result.data[i].isoCode
			}));
		});
	},
	error: function (jqXHR, textStatus, errorThrown) {
		console.log(errorThrown);
		console.log(textStatus);
		console.log(jqXHR);
	}
});

// get country borders
$("#select").on('change', () => {
	$.ajax({
		url: "libs/php/getCountry.php",
		type: "POST",
		dataType: "json",
		success: function (result) {
			console.log(result);
			if ($layers) {
				$layers.clearLayers();
			}
			$filterFeature = result.data.borders.features.filter(feature => (feature.properties.iso_a3 == $("#select").val()));
			$border = L.geoJSON($filterFeature, {
				style: function () {
					return {
						color: '#e0fe77'
					};
				}
			}).addTo($layers);
			mymap.fitBounds($border.getBounds());
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(errorThrown);
			console.log(textStatus);
			console.log(jqXHR);
		},
	});
});

// get data and populate country information modals
$clickedMarker = null;
$("select").on('change', () => {
	$(".loader").fadeIn("slow");
	$.ajax({
		url: "libs/php/getCountryInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			code: $('#select').val()
		},
		success: function (result) {

			console.log(result);

			if (result.status.name == "ok") {

				if (result['data']['covid']['data'][0] === undefined) {
					$covidButton.disable();
					alert('Covid rates currently unavailable.');
					$(".loader").fadeOut("slow");
				};

				$covidButton.enable();
				$('.countryName').html(result['data']['geoNames']['geonames'][0]['countryName']);
				$('#confirmed').html(Number(result['data']['covid']['data'][0]['confirmed']).toLocaleString());
				$('#deaths').html(Number(result['data']['covid']['data'][0]['dead']).toLocaleString());
				$('#recovered').html(Number(result['data']['covid']['data'][0]['recovered']).toLocaleString());

				if (result['data']['news']['articles'] == 0) {
					$(".loader").fadeOut("slow");
					alert('No news currently available.');
					$countryNewsButton.disable();
				}
				else {
					$countryNewsButton.enable();
					$countryNewsUrl1 = result['data']['news']['articles'][0]['url'];
					$countryNewsUrl2 = result['data']['news']['articles'][1]['url'];
					$countryNewsUrl3 = result['data']['news']['articles'][2]['url'];
					$('#countryNewsUrl1').attr('href', $countryNewsUrl1);
					$('#countryNewsUrl2').attr('href', $countryNewsUrl2);
					$('#countryNewsUrl3').attr('href', $countryNewsUrl3);
					$('#countryNewsImg1').attr('src', result['data']['news']['articles'][0]['urlToImage']);
					$('#countryNewsTitle1').html(result['data']['news']['articles'][0]['title']);
					$('#countryNews1').html(result['data']['news']['articles'][0]['description']);
					$('#countryNewsImg2').attr('src', result['data']['news']['articles'][1]['urlToImage']);
					$('#countryNewsTitle2').html(result['data']['news']['articles'][1]['title']);
					$('#countryNews2').html(result['data']['news']['articles'][1]['description']);
					$('#countryNewsImg3').attr('src', result['data']['news']['articles'][2]['urlToImage']);
					$('#countryNewsTitle3').html(result['data']['news']['articles'][2]['title']);
					$('#countryNews3').html(result['data']['news']['articles'][2]['description']);
				};

				$imageGalleryButton.enable();
				$('#imageGallery1').attr('src', result['data']['pixabay']['hits'][0]['webformatURL']);
				$('#imageGallery2').attr('src', result['data']['pixabay']['hits'][1]['webformatURL']);
				$('#imageGallery3').attr('src', result['data']['pixabay']['hits'][2]['webformatURL']);
				$('#imageGallery4').attr('src', result['data']['pixabay']['hits'][3]['webformatURL']);
				$('#imageGallery5').attr('src', result['data']['pixabay']['hits'][4]['webformatURL']);
				$('#imageGallery6').attr('src', result['data']['pixabay']['hits'][5]['webformatURL']);
				$('#imageGallery7').attr('src', result['data']['pixabay']['hits'][6]['webformatURL']);
				$('#imageGallery8').attr('src', result['data']['pixabay']['hits'][7]['webformatURL']);
				$('#imageGallery9').attr('src', result['data']['pixabay']['hits'][8]['webformatURL']);

				$rates = result['data']['openExchange']['rates'];

				$currencyButton.enable();

				if ($rates === undefined) {
					alert('Currency rates currently unavailable.');
					$currencyButton.disable();
					$(".loader").fadeOut("slow");
				};

				$('#baseCurrency').html(result['data']['openExchange']['base']);

				$.each($rates, function (base, rate) {
					$('<option>', {
						text: base,
						value: rate
					}).appendTo('#selectRate');
					$('#selectRate').on('change', () => {
						$('#conversion').html($('#selectRate').val());
					});
				});

				// find top 10 cities in country
				var cities = result['data']['cities']['geonames'];

				if (cities === undefined) {
					alert('City data currently unavailable.');
					$(".loader").fadeOut("slow");
				};

				var citiesArray = [];

				for (var i = 0; i < cities.length; i++) {
					if (cities[i].countrycode == result['data']['restCountries']['alpha2Code']) {
						citiesArray.push(cities[i]);
					};
				};

				if (citiesArray.length > 10) {
					citiesArray.length = 10;
				};

				var locationList = [];
				citiesArray.forEach(city => {
					locationList.push({
						lat: city.lat,
						lng: city.lng,
						cityName: city.toponymName,
						population: city.population
					});
				});

				// add top 10 cities onto map
				console.log(locationList);
				for (var i = 0; i < locationList.length; i++) {
					$cityMarker = L.marker(new L.latLng([locationList[i]['lat'], locationList[i]['lng']]), {
							icon: mapIcon
						})
						.addTo($layers)
						.bindPopup('<b>Name:</b> ' + locationList[i]['cityName'] + '<br><b>Population:</b> ' + Number(locationList[i]['population']).toLocaleString());
					$(".loader").fadeOut("slow");
					
					// get city data and populate modals when marker is clicked
					$($cityMarker).on('click', (event) => {
						$(".loader").fadeIn("slow");
						var marker = event.target;
						$clickedMarker = marker;
						$.ajax({
							url: "libs/php/getLatLngInfo.php",
							type: 'POST',
							data: {
								lat: marker.getLatLng().lat,
								lng: marker.getLatLng().lng
							},
							success: function (result) {

								console.log(result);
								
								$weatherButton.enable();
								$wikiButton.enable();
								$('#weather').modal('show');
								$('.cityName').html(result['data']['openWeather']['name']);
								$('#temperature').html(Math.round(result['data']['openWeather']['main']['temp']));
								$('#humidity').html(result['data']['openWeather']['main']['humidity']);
								$('#pressure').html(result['data']['openWeather']['main']['pressure']);
								$('#wind').html(Math.round(result['data']['openWeather']['wind']['speed']));
								$sunrise = new Date((result['data']['openWeather']['sys']['sunrise'] + result['data']['openWeather']['timezone']) * 1000).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								});
								$sunset = new Date((result['data']['openWeather']['sys']['sunset'] + result['data']['openWeather']['timezone']) * 1000).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								});
								$('#sunriseSet').html($sunrise + ' / ' + $sunset);
								$('#weatherIcon').attr('src', 'http://openweathermap.org/img/wn/' + result['data']['openWeather']['weather'][0]['icon'] + '.png');
								$description = result['data']['openWeather']['weather']['0']['description'];
								$('#description').html($description[0].toUpperCase() + $description.substring(1));

								$(".loader").fadeOut("slow");
							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.log(errorThrown);
								console.log(textStatus);
								console.log(jqXHR);
								$(".loader").fadeOut("slow");
							}
						});
					});
				};
			};
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(errorThrown);
			console.log(textStatus);
			console.log(jqXHR);
		}
	});
});

// wikipedia button and modal
$wikiButton = L.easyButton(
	"<i class='fab fa-wikipedia-w'></i>",
	function () {
		var marker = $clickedMarker;
		$.ajax({
			url: "libs/php/getLatLngInfo.php",
			type: 'POST',
			data: {
				lat: marker.getLatLng().lat,
				lng: marker.getLatLng().lng
			},
			success: function (result) {
				$('#wiki').modal('show');
				$cityWikiUrl1 = "https://" + result['data']['geoNamesWiki']['geonames'][0]['wikipediaUrl'];
				$cityWikiUrl2 = "https://" + result['data']['geoNamesWiki']['geonames'][1]['wikipediaUrl'];
				$cityWikiUrl3 = "https://" + result['data']['geoNamesWiki']['geonames'][2]['wikipediaUrl'];

				$('#cityWikiTitle1').html(result['data']['geoNamesWiki']['geonames'][0]['title']);
				$('#cityWiki1').html(result['data']['geoNamesWiki']['geonames'][0]['summary']);
				$('#cityWikiUrl1').attr('href', $cityWikiUrl1);
				$('#cityWikiTitle2').html(result['data']['geoNamesWiki']['geonames'][1]['title']);
				$('#cityWiki2').html(result['data']['geoNamesWiki']['geonames'][1]['summary']);
				$('#cityWikiUrl2').attr('href', $cityWikiUrl2);
				$('#cityWikiTitle3').html(result['data']['geoNamesWiki']['geonames'][2]['title']);
				$('#cityWiki3').html(result['data']['geoNamesWiki']['geonames'][2]['summary']);
				$('#cityWikiUrl3').attr('href', $cityWikiUrl3);


			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(errorThrown);
				console.log(textStatus);
				console.log(jqXHR);
			}
		});
	}, "Wikipedia entries"
).addTo(mymap);
$wikiButton.disable();

// close all modals
$('.close').on('click', () => {
	$('#currentLocation').modal('hide');
	$('#covid').modal('hide');
	$('#currency').modal('hide');
	$('#imageGallery').modal('hide');
	$('#countryNews').modal('hide');
	$('#weather').modal('hide');
	$('#wiki').modal('hide');
});