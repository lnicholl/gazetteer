<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true) / 1000;

    $decode = json_decode(file_get_contents("../json/countryBorders.geo.json"), true);

    $countryArray = [];

    // loop through features in large geo.json file to get name and iso code - push into array

    foreach ($decode['features'] as $feature) {
        $data['name'] = $feature['properties']['name'];
        $data['isoCode'] = $feature['properties']['iso_a3'];
        array_push($countryArray, $data);
    };

    // sort country names into alphabetical order
    
    usort($countryArray, function ($a, $b) {
        return $a['name'] <=> $b['name'];
    });

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "mission saved";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $countryArray;
    $output['data']['borders'] = $decode;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>