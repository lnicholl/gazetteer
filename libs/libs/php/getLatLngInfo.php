<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true) / 1000;

    // lat and lng set to values of clicked marker

    $lat = $_POST['lat'];
    $lng = $_POST['lng'];

    // openWeather

    $openWeatherUrl='api.openweathermap.org/data/2.5/weather?lat=' . $lat . '&lon='  . $lng  . '&lang=en&units=metric&appid=5ab7ee7d6d6bf96d60e6508a81178c3e';
    
    $openWeatherch = curl_init();
    curl_setopt($openWeatherch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($openWeatherch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($openWeatherch, CURLOPT_URL,$openWeatherUrl);
    
    $openWeatherResult = curl_exec($openWeatherch);
    
    curl_close($openWeatherch);
    
    $openWeather = json_decode($openWeatherResult, true);

    // geoNames wikipedia

    $geoNamesWikiUrl='http://api.geonames.org/findNearbyWikipediaJSON?lat=' . $lat . '&lng=' . $lng . '&username=lnicholl';
    
    $geoNamesWikich = curl_init();
    curl_setopt($geoNamesWikich, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($geoNamesWikich, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($geoNamesWikich, CURLOPT_URL,$geoNamesWikiUrl);
    
    $geoNamesWikiResult = curl_exec($geoNamesWikich);
    
    curl_close($geoNamesWikich);
    
    $geoNamesWiki = json_decode($geoNamesWikiResult, true);

    // pixabay for image of current location

    $pixabayCurrentUrl = 'https://pixabay.com/api/?key=16964052-894cd943696ee2e893dcff227' . '&q=' . $openWeather['name'] . '&safesearch=true&image_type=photo';

    $pixabayCurrentch = curl_init();
    curl_setopt($pixabayCurrentch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($pixabayCurrentch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($pixabayCurrentch, CURLOPT_URL,$pixabayCurrentUrl);

    $pixabayCurrentResult = curl_exec($pixabayCurrentch);

    curl_close($pixabayCurrentch);

    $pixabayCurrent = json_decode($pixabayCurrentResult, true);

    // covid using country code of current location

    $covidCurrentUrl = 'https://www.trackcorona.live/api/countries/' . $openWeather['sys']['country'];

    $covidCurrentch = curl_init();
    curl_setopt($covidCurrentch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($covidCurrentch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($covidCurrentch, CURLOPT_URL,$covidCurrentUrl);

    $covidCurrentResult = curl_exec($covidCurrentch);

    curl_close($covidCurrentch);

    $covidCurrent = json_decode($covidCurrentResult, true);

    // geonames country code from current lat lng

    $openCageUrl = 'https://api.opencagedata.com/geocode/v1/json?q=' . $lat . '%2C+' . $lng . '&key=eb5b203502854374aafad3dc529dc622&pretty=1';

    $openCagech = curl_init();
    curl_setopt($openCagech, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($openCagech, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($openCagech, CURLOPT_URL,$openCageUrl);

    $openCageResult = curl_exec($openCagech);

    curl_close($openCagech);

    $openCage = json_decode($openCageResult, true);
    
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "mission saved";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data']['openWeather'] = $openWeather;
    $output['data']['geoNamesWiki'] = $geoNamesWiki;
    $output['data']['pixabayCurrent'] = $pixabayCurrent;
    $output['data']['covidCurrent'] = $covidCurrent;
    $output['data']['openCage'] = $openCage;
    
    header('Content-Type: application/json; charset=UTF-8');
    
    echo json_encode($output);

?>