const app = {};
app.nasaKey = "gXfzlsVi2FdBGWdrvWfFfHdxo9tK5p2J5GxNBdfh";

app.adjustPlanetInfo = function(planetInfoBox, objectEngName, objectRadius, objectOrbitsAround, objectGravity, objectMass, objectIsPlanet){
    $(planetInfoBox + ' .planetNameText').text(objectEngName);
    $(planetInfoBox + ' .planetRadiusText').text(objectRadius);
    $(planetInfoBox + ' .planetOrbitsText').text(objectOrbitsAround);
    $(planetInfoBox + ' .planetGravityText').text(objectGravity);
    $(planetInfoBox + ' .planetMassText').text(objectMass);
    if (objectIsPlanet == true){
        $(planetInfoBox + ' .planetIsPlanet').text("This is a planet");  
    }
    else{
        $(planetInfoBox + ' .planetIsPlanet').text("This is not a planet");  
    }
}

app.adjustPlanetVisuals = function(planet, radius, scaleFactor){
    $(planet).css('width', ((radius * 2) * scaleFactor) + "px");
    $(planet).css('height', ((radius * 2) * scaleFactor) + "px");
}

app.rescalePlanetSize = function(planet1Width, planet2Width, newScaleFactor){
    app.adjustPlanetVisuals('.planet1',planet1Width,newScaleFactor);
    app.adjustPlanetVisuals('.planet2',planet2Width,newScaleFactor);
}

app.chooseRandomObject= function(array){
    const randomIndex = Math.floor(Math.random()*array.length);
    return array[randomIndex];
}


app.getStellarObjectInfo = function(planetInfoBox, planetVisuals, scaleFactor){
    $.ajax({
        url:'https://api.le-systeme-solaire.net/rest/bodies/',
        method:'GET',
        dataType:'JSON'
    }).then(function(res){
        const randomObject = app.chooseRandomObject(res.bodies);
        objectRadius = randomObject.meanRadius;
        objectEngName = randomObject.englishName;
        objectOrbitsAround = randomObject.aroundPlanet;
        objectGravity = parseFloat(randomObject.gravity);
        if(randomObject.mass == null){
            objectMass = "unknown";
        }
        else{
            objectMass= (randomObject.mass.massValue + " x 10^"+randomObject.mass.massExponent);
        }
        objectIsPlanet= randomObject.isPlanet;
        if (objectOrbitsAround == null){
            objectOrbitsAround = "The Sun";
        }
        else{
            objectOrbitsAround = objectOrbitsAround.planet;
        }

        app.adjustPlanetVisuals(planetVisuals, objectRadius, scaleFactor);
        app.adjustPlanetInfo(planetInfoBox, objectEngName, objectRadius, objectOrbitsAround, objectGravity, objectMass, objectIsPlanet);
    })
};

app.generatePlanets = function(){

    const planet1InfoBox = '.planet1InfoBox';
    const planet2InfoBox = '.planet2InfoBox';
    const planet1Visuals = '.planet1';
    const planet2Visuals = '.planet2';

    app.getStellarObjectInfo(planet1InfoBox, planet1Visuals, 1);
    app.getStellarObjectInfo(planet2InfoBox, planet2Visuals, 1);
}

app.scaleFunction = function(scaleType, scaleDirection, scaleInt1, scaleInt2){
    $('.currentScale').css('color', 'black');
    let planet1Width = parseFloat($('.planet1').css('width'));
    let planet2Width = parseFloat($('.planet2').css('width'));
    
    if (scaleType == "scaleToSize"){
        if (eval(scaleDirection)){
            let newScaleFactor = (scaleInt1 / parseFloat(planet2Width));
            app.rescalePlanetSize(planet1Width, planet2Width, newScaleFactor)
            $('.currentScale').text("Scale: 1px = " + (planet2Width/scaleInt2) + "km");
        }  
        else{
            let newScaleFactor = (scaleInt1 / parseFloat(planet1Width));
            app.rescalePlanetSize(planet1Width, planet2Width, newScaleFactor)
            $('.currentScale').text("Scale: 1px = " + (planet1Width/scaleInt2) + "km");
        }
    }
    else if(scaleType == "scaleProportion"){
        let newScaleFactor = 1;
        newScaleFactor = newScaleFactor * scaleInt1;
        app.rescalePlanetSize((planet1Width/2), (planet2Width/2), newScaleFactor)
        $('.currentScale').text("Scale: 1px = _ km");
        $('.currentScale').css('color', 'white');
    }
    else{
        alert("ya busted it");
    }
}

$('#scaleUpSize').on('click', function(){
    app.scaleFunction('scaleProportion', '', 1.15, '')
});

$('#scaleDownSize').on('click', function(){
    app.scaleFunction('scaleProportion', '', 0.87, '')
});

$('#scaleToLargerButton').on('click',function(){
    app.scaleFunction("scaleToSize", 'planet2Width > planet1Width', 115, 230)
});

$('#scaleToSmallerButton').on('click',function(){
    app.scaleFunction("scaleToSize", 'planet2Width < planet1Width', 25, 50)
});

$('#GeneratePlanets').on('click',function(){
    app.generatePlanets();
});


//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXX           ASTRONOMY PICTURE OF THE DAY JS CODE        XXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

app.getAPODSpacePic = function(){
    $.ajax({
        url: 'https://api.nasa.gov/planetary/apod',
        method: 'GET',
        dataType: 'json',
        data: {
            api_key: app.nasaKey,
            count:1
          }
    }).then( function(res){
        $('#APODimg').attr('src', res[0].url);
        $('#APODtitleText').text(res[0].title);
        $('#APODdate').text(res[0].date);
        $('#APODexplanation').text(res[0].explanation);
        $('#APODcopyright').text(res[0].copyright);
    })
}

$('#APODnewPic').on('click',function(event){
    event.preventDefault();
    app.getAPODSpacePic();
})

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXX           ISS LIVE POSITION TRACKER        XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

app.startISStracker = function(){
    const updateISS = window.setInterval(function(){
        $.ajax({
            url: 'https://api.wheretheiss.at/v1/satellites/25544',
            method: 'GET',
            dataType: 'json',
        }).then( (res) => {
 
            issLatitude = (res.latitude);
            issLongitude = (res.longitude);
            issVelocity = (res.velocity);
            issAltitude = (res.altitude);

            issLatitudeConvert = (100/360) * ((-1*issLatitude)+225);
            issLongitudeConvert = (100 /360) * (issLongitude+180);
            
            $('.ISSmarker').css('left', issLongitudeConvert+"%");
            $('.ISSmarker').css('top', issLatitudeConvert+"%");
            $('.ISSlongitudeCoordinate').text(issLatitude)
            $('.ISSlatitudeCoordinate').text(issLongitude),
            $('.ISSvelocity').text(issVelocity)
            $('.ISSaltitude').text(issAltitude)
        });
    },2000);
}

app.init = function (){    
    app.generatePlanets();
    app.getAPODSpacePic();
    app.startISStracker();
}

$(document).ready(function(){ 
    app.init();
});


