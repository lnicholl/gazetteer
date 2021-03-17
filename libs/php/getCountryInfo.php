<?php

    // restcountries routine to get initial response info for use in other routines

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true) / 1000;

    $url='https://restcountries.eu/rest/v2/alpha/' . $_REQUEST['countryCode'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result = curl_exec($ch);

    curl_close($ch);

    $restCountries = json_decode($result, true);

    // openweather routine

    $openWeatherUrl='api.openweathermap.org/data/2.5/weather?lat=' . $restCountries['latlng'][0] . '&lon='  . $restCountries['latlng'][1]  . '&units=metric&appid=5ab7ee7d6d6bf96d60e6508a81178c3e';

    $openWeatherch = curl_init();
    curl_setopt($openWeatherch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($openWeatherch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($openWeatherch, CURLOPT_URL,$openWeatherUrl);

    $openWeatherResult = curl_exec($openWeatherch);

    curl_close($openWeatherch);

    $openWeather = json_decode($openWeatherResult, true);

    // geonames routine

    $geoNamesUrl='http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $restCountries['alpha2Code'] . '&username=lnicholl&style=full';

    $geoNamesch = curl_init();
    curl_setopt($geoNamesch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($geoNamesch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($geoNamesch, CURLOPT_URL,$geoNamesUrl);

    $geoNamesResult = curl_exec($geoNamesch);

    curl_close($geoNamesch);

    $geoNames = json_decode($geoNamesResult, true);

    // wikipedia routine
    
    $wikipediaUrl='http://api.geonames.org/wikipediaBoundingBoxJSON?north=' . $geoNames['geonames'][0]['north'] . '&south=' . $geoNames['geonames'][0]['south'] . '&east=' . $geoNames['geonames'][0]['east'] . '&west=' . $geoNames['geonames'][0]['west'] . '&username=lnicholl&style=full';

    $wikipediach = curl_init();
    curl_setopt($wikipediach, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($wikipediach, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($wikipediach, CURLOPT_URL,$wikipediaUrl);

    $wikipediaResult = curl_exec($wikipediach);

    curl_close($wikipediach);

    $wikipedia = json_decode($wikipediaResult, true);

    // geonames cities routine

    $citiesUrl='http://api.geonames.org/citiesJSON?north=' . $geoNames['geonames'][0]['north'] . '&south=' . $geoNames['geonames'][0]['south'] . '&east=' . $geoNames['geonames'][0]['east'] . '&west=' . $geoNames['geonames'][0]['west'] . '&maxRows=50&username=lnicholl&style=full';

    $citiesch = curl_init();
    curl_setopt($citiesch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($citiesch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($citiesch, CURLOPT_URL,$citiesUrl);

    $citiesResult = curl_exec($citiesch);

    curl_close($citiesch);

    $cities = json_decode($citiesResult, true);

    // openexchange routine

    $openExchangeUrl = 'https://api.exchangeratesapi.io/latest?base=' . $restCountries['currencies'][0]['code'];

    $openExchangech = curl_init();
    curl_setopt($openExchangech, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($openExchangech, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($openExchangech, CURLOPT_URL,$openExchangeUrl);

    $openExchangeResult = curl_exec($openExchangech);

    curl_close($openExchangech);

    $openExchange = json_decode($openExchangeResult, true);

    // pixabay routine

    $pixabayUrl = 'https://pixabay.com/api/?key=16964052-894cd943696ee2e893dcff227' . '&q=' . $geoNames['geonames'][0]['countryName'] . '&safesearch=true&image_type=photo';

    $pixabaych = curl_init();
    curl_setopt($pixabaych, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($pixabaych, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($pixabaych, CURLOPT_URL,$pixabayUrl);

    $pixabayResult = curl_exec($pixabaych);

    curl_close($pixabaych);

    $pixabay = json_decode($pixabayResult, true);

    // coronavirus routine

    $covidUrl = 'https://www.trackcorona.live/api/countries/' . $restCountries['alpha2Code'];

    $covidch = curl_init();
    curl_setopt($covidch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($covidch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($covidch, CURLOPT_URL,$covidUrl);

    $covidResult = curl_exec($covidch);

    curl_close($covidch);

    $covid = json_decode($covidResult, true);

    // news routine

    $newsUrl = 'http://newsapi.org/v2/top-headlines?country=' . $restCountries['alpha2Code'] . '&language=en&apiKey=1714027ca1e34afcbbde173225b6c85e';

    $newsch = curl_init();
    curl_setopt($newsch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($newsch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($newsch, CURLOPT_URL,$newsUrl);

    $newsResult = curl_exec($newsch);

    curl_close($newsch);

    $news = json_decode($newsResult, true);

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "mission saved";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data']['restCountries'] = $restCountries;
    $output['data']['openWeather'] = $openWeather;
    $output['data']['geoNames'] = $geoNames;
    $output['data']['wikipedia'] = $wikipedia;
    $output['data']['cities'] = $cities;
    $output['data']['openExchange'] = $openExchange;
    $output['data']['pixabay'] = $pixabay;
    $output['data']['covid'] = $covid;
    $output['data']['news'] = $news;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>