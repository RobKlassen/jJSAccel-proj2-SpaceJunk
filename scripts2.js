//---------------------------------------------------------------------------
//-----------------------READ ME --------------------------------------------
//
//  ALRIGHT.  SO I HAD SOME TROUBLE FINDING AN API I REALLY LIKED, AND ULTIMATELY
//  I'M NOT 100% HAPPY WITH THE ONES I CHOSE, I FEEL LIKE THEY'RE ALL A LITTLE
//  BIT SIMPLE, AND PARTICULARLY, I'M NOT USING AN API TO FEED INFORMATION INTO
//  ANOTHER API.  MY ORIGINAL PLAN WAS TO HAVE AN ISS TACKING API FEED INFORMATION
//  INTO ANOTHER NASA API THAT COULD PRODUCE SATELLITE IMAGERY FROM THE ISS' LOCATION
//  BUT IT TURNS OUT INSERTING COORDINATE INFORMATION RELIABLY IS VERY DIFFICULT...
//
//  SO, WHAT I SETTLED ON IS A COLLECTION OF SPACE THEMED APIs THAT I THINK I'M 
//  USING IN VARIOUS WAYS. THE PROGRAM IS SPLIT INTO 3 PARTS:
//  
//  1. THE FIRST SECTION IS TAKING INFORMATION FROM AN API THAT IS A COLLECTION
//      OF SOLAR SYSTEM OBJECT DATA.  I THOUGHT IT WOULD BE KIND OF NEAT TO 
//      USE THE SIZE INFORMATION OF THOSE OBJECTS TO RENDER -TO SCALE- VERSIONS
//      OF THOSE CELESTIAL BODIES.  SOMEHOW I THINK I ACTUALLY MADE THAT WORK, 
//      THE ONLY THING I COULDN'T FIGURE OUT IS HOW TO CALCULATE THE SCALE ON
//      THE FLY.  FOR THE FIRST 'SCALE TO LARGEST' OR 'SCALE TO SMALLEST' HOWEVER, 
//      IT IS 100% ACCURATE IN CALCULATING THE PIXEL / KILOMETER RATIO.  AND,
//      THE ACTUAL VISUAL SCALE OF THE OBJECTS IS CORRECT WITHIN THE ACCURACY OF
//      JAVASCRIPTS TERRIBLE FLOATING POINTS.  
//
//      THE 5 BUTTONS ON THE APP LET YOU GENERATE NEW CELESTIAL BODIES, SCALE THEM 
//      BOTH UP OR DOWN PROPORTIONALLY BY A SET PERCENTAGE, AND THEN THE LAST 
//      TWO SCALE BOTH OBJECTS PROPORTIONALLY TO EITHER THE LARGER OR SMALLER ONE. 
//      
//      IT ALSO GENERATES SOME OTHER INFORMATION ABOUT THE PLANETS, BECAUSE THAT
//      PART IS EASY COMPARED TO ACTUALLY RENDERING SIZES PROPERLY.
//      
//      I DIDN'T HAVE TIME TO ACTUALLY BUILD SORTS SO BORING OBJECTS GET FILTERED 
//      OUT... SO ABOUT 75% OF THE OBJECTS GENERATED ARE JUST BIG ASTEROIDS. ALSO,
//      IT TURNS OUT THAT THE SIZE DIFFERENCE BETWEEN BODIES (WHEN RENDERED TO SCALE)
//      IS ACTUALLY HILARIOUSLY FAR OFF IN ORDER OF MAGNITUDE, SO A LOT OF THE
//      TIME THE OBJECTS SEEM TO BE FLAT SURFACES OR SINGLE PIXELS UNTIL SCALED.
//      
//  2.  THE SECOND MODULE IS VERY SIMPLE, IT ACCESSES NASA'S AWESOME "ASTRONOMY      
//      PICTURE OF THE DAY" API THAT IS VERY SIMPLE AND STRAIGHTFORWARD.  IT EVEN
//      HAS A BUILT IN RANDOM FUNCTION.  IT'S HONESTLY SO SIMPLE THAT I FELT BAD
//      USING IT, WHICH WAS MY VERY FIRST ATTEMPT AT AN API FOR PROJECT 2.  
//      
//      IT ALSO SETS THE IMAGE TO GRAYSCALE TO LINE UP THE VISUAL AESTHETIC OF MY
//      PROGRAM.  
//      
//  3.  THE THIRD MODULE IS HALF THE PROTOTYPE I MADE FOR MY FIRST 'BETTER' ATTEMPT 
//      AT AN API PROJECT.  I MANAGED TO FIGURE OUT THE MATH AND CONVERSIONS TO TAKE
//      THE ISS' LONGITUDE AND LATITUDE AND PROJECT IT ONTO A MAP AS A DOT.   
//      
//      AS FAR AS API USAGE IS CONCERNED, IT'S ALSO QUITE SIMPLE, SO I WANTED TO
//      APPLY IT IN AN INTERESTING WAY.  CURRENTLY IT UPDATES EVERY 2 SECONDS.
//      
//      FEEL FREE TO CHECK OUT HOW CLOSE MY MATH IS TO THE REAL DEAL:
//          https://spotthestation.nasa.gov/tracking_map.cfm
//      
//  CREDITS/THANKS/SOURCES:
//      -   https://api.le-systeme-solaire.net/en/      
//              THE SOLAR SYSTEM OPENDATA API (IN FRENCH MOSTLY)
//      -   https://wheretheiss.at/w/developer
//              THE OPEN ISS LOCATION API 
//      -   https://api.nasa.gov/
//              THE APOD API (AND HEAPS OF OTHER COOL NASA APIs)
//      -   https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg
//              THE IMAGE I USED FOR THE BACKGROUND MAP, WHICH I CROPPED MYSELF A BIT
//      -   https://www.programmableweb.com/news/10-top-astronomy-apis/brief/2020/02/17
//              FOR HELPING ME FIND SOME OF THE SPACE-Y APIs
//      -   https://spotthestation.nasa.gov/tracking_map.cfm
//              FOR COMPARING MY MATH WITH THE ACTUAL ISS LOCATION
//      -   https://fonts.google.com/
//              BECAUSE I USED SOME GOOGLE FONTS
//
//  IM OVERALL FAILY HAPPY WITH THIS, CONSIDERING HOW MUCH PRACTICE IT GAVE ME
//  WORKING WITH DIFFERENT APIs AND DIFFERENT WAYS TO USE THEIR INFORMATION.
//  THERE ARE, OF COURSE, A BILLION KINKS, MOSTLY IN USING CSS WITH JS, AND JUST  
//  TIME RESTRICTIONS LIMITING HOW MUCH FLAIR AND FUN I CAN HAVE WITH SOME OF
//  THESE FEATURES.
//
//---------------------------------------------------------------------------
// https://api.le-systeme-solaire.net/rest/bodies/

const app = {};
app.nasaKey = "gXfzlsVi2FdBGWdrvWfFfHdxo9tK5p2J5GxNBdfh";

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXX           CELESTIAL OBJECT JAVASCRIPT CODE        XXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

//Prints information to the two info boxes about the random objects from ajax call
app.adjustPlanetInfo = function(planetInfoBox, objectEngName, objectRadius, objectOrbitsAround, objectGravity, objectMass, objectIsPlanet){
    $(planetInfoBox + ' .planetNameText').text(objectEngName);
    $(planetInfoBox + ' .planetRadiusText').text(objectRadius);
    $(planetInfoBox + ' .planetOrbitsText').text(objectOrbitsAround);
    $(planetInfoBox + ' .planetGravityText').text(objectGravity);
    $(planetInfoBox + ' .planetMassText').text(objectMass);
    //checks boolean state to print specific text (instead of true and false)
    if (objectIsPlanet == true){
        $(planetInfoBox + ' .planetIsPlanet').text("This is a planet");  
    }
    else{
        $(planetInfoBox + ' .planetIsPlanet').text("This is not a planet");  
    }
}

//This specifically adjusts the CSS for the two objects, called twice in the function below, also called by the initial object constructor directly
app.adjustPlanetVisuals = function(planet, radius, scaleFactor){
    $(planet).css('width', ((radius * 2) * scaleFactor) + "px");
    $(planet).css('height', ((radius * 2) * scaleFactor) + "px");
    // console.log(scaleFactor);
}

//This calls the object visual adjustor with values, and runs it once for each planet 
app.rescalePlanetSize = function(planet1Width, planet2Width, newScaleFactor){
    app.adjustPlanetVisuals('.planet1',planet1Width,newScaleFactor);
    app.adjustPlanetVisuals('.planet2',planet2Width,newScaleFactor);
}

app.chooseRandomObject= function(array){
    const randomIndex = Math.floor(Math.random()*array.length);
    return array[randomIndex];
}

//the main JQuery AJAX call, that also assigns a ton of variables and adjusts some information for use by other functions.  
app.getStellarObjectInfo = function(planetInfoBox, planetVisuals, scaleFactor){
    $.ajax({
        url:'https://api.le-systeme-solaire.net/rest/bodies/',
        method:'GET',
        dataType:'JSON'
    }).then(function(res){
        // console.log(res);

        //the assignment of all the randomly chosen object traits to variables
        const randomObject = app.chooseRandomObject(res.bodies);
        objectRadius = randomObject.meanRadius;
        objectEngName = randomObject.englishName;
        objectOrbitsAround = randomObject.aroundPlanet;
        objectGravity = parseFloat(randomObject.gravity);
        //catches a weird and rare potential value in the API, also puts two together to make a useful value.
        if(randomObject.mass == null){
            objectMass = "unknown";
        }
        else{
            objectMass= (randomObject.mass.massValue + " x 10^"+randomObject.mass.massExponent);
        }
        objectIsPlanet= randomObject.isPlanet;
        
        //catches non-planet objects in strict solar orbit, which otherwise throw error... unfortunately doesn't filter out the french name - didn't bother adding in conditionals to search the API again to extract the english name.  
        if (objectOrbitsAround == null){
            objectOrbitsAround = "The Sun";
        }
        else{
            objectOrbitsAround = objectOrbitsAround.planet;
        }
        
        //feeds all the information it acquires into the functions that will render / update info.
        app.adjustPlanetVisuals(planetVisuals, objectRadius, scaleFactor);
        app.adjustPlanetInfo(planetInfoBox, objectEngName, objectRadius, objectOrbitsAround, objectGravity, objectMass, objectIsPlanet);
    })
};

//the function that intitializes the API request, and seeds classes as variables just to be more helpful. Called on startup and by the 'generate new planets' button
app.generatePlanets = function(){

    const planet1InfoBox = '.planet1InfoBox';
    const planet2InfoBox = '.planet2InfoBox';
    const planet1Visuals = '.planet1';
    const planet2Visuals = '.planet2';

    //the 1 is seeded to reset the scale when generating new objects
    app.getStellarObjectInfo(planet1InfoBox, planet1Visuals, 1);
    app.getStellarObjectInfo(planet2InfoBox, planet2Visuals, 1);
}

//This goofy function is handling all the math and heavy lifting for CHANGING the relative scale when called by the buttons
app.scaleFunction = function(scaleType, scaleDirection, scaleInt1, scaleInt2){
    //this makes the scale visible when using the "scale to" buttons, this is an unsolved issue, see below / readme
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
    //note that this sets the scale text to white, that's because it's actually wrong when the scaleup/down buttons are used.  This is a more complicated issue than I have the mental energy to fix at this point.  
    else if(scaleType == "scaleProportion"){
        let newScaleFactor = 1;
        newScaleFactor = newScaleFactor * scaleInt1;
        app.rescalePlanetSize((planet1Width/2), (planet2Width/2), newScaleFactor)
        $('.currentScale').text("Scale: 1px = _ km");
        $('.currentScale').css('color', 'white');
    }
    //this never came up, I think the program should catch most things but this is probably the hard failpoint considering how many variables it takes how they're used.
    else{
        alert("ya busted it");
    }
}

//These are the event listeners that feed information about scaling into the above functions.
    //NOTE: So this was a very late change to my program, I previously had these all handling the scaling internally, which was VERY good at adjusting the actual scale text to the correct scale.  By generalizing all these functions into one, I made this chunk of code very simple and pretty, but it made the math that runs the scaling break a bit.  Not happy about it, I built in a quick fix noted above; it is what it is...
$('#scaleUpSize').on('click', function(){
    app.scaleFunction('scaleProportion', '', 1.15, '')
});

$('#scaleDownSize').on('click', function(){
    app.scaleFunction('scaleProportion', '', 0.87, '')
});

//note: feeds in string that is read as code through eval() function, SUPER COOL... Favourite thing I learned in this project.
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

//AJAX call for APOD API
app.getAPODSpacePic = function(){
    $.ajax({
        url: 'https://api.nasa.gov/planetary/apod',
        method: 'GET',
        dataType: 'json',
        data: {
            api_key: app.nasaKey,
            //this count:1 specifically sets the result to random, it's such a nice feature and I feel bad for using it.
            count:1
            //otherwise, I could use the below (commented out) code to call specific dates, and while I don't want to think about writing code for a random date in a range, I think it's conceivable.
            // date:        "2015-03-01"
            // DATE FORMAT: "YYYY-MM-DD"
          }
    }).then( function(res){
        // console.log(res);
        // console.log(res[0].title);
        // console.log(res[0].url);
        $('#APODimg').attr('src', res[0].url);
        $('#APODtitleText').text(res[0].title);
        $('#APODdate').text(res[0].date);
        $('#APODexplanation').text(res[0].explanation);
        $('#APODcopyright').text(res[0].copyright);
    })
}

//When you click on the apod section it generated a new picture.  
$('#APODnewPic').on('click',function(event){
    event.preventDefault();
    app.getAPODSpacePic();
})

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXX           ISS LIVE POSITION TRACKER        XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

//AJAX call for ISS info API
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

            // This conversion is setting the lat/long into a proportion of a percentage, where the centre of the map is 0,0.  The other math here "calibrates" that proportion.  
            issLatitudeConvert = (100/360) * ((-1*issLatitude)+225);
            issLongitudeConvert = (100 /360) * (issLongitude+180);
            
            // This whole code is a miracle, I can't believe how simple it actually is for how much work it's doing.  
            $('.ISSmarker').css('left', issLongitudeConvert+"%");
            $('.ISSmarker').css('top', issLatitudeConvert+"%");
            $('.ISSlongitudeCoordinate').text(issLatitude)
            $('.ISSlatitudeCoordinate').text(issLongitude),
            $('.ISSvelocity').text(issVelocity)
            $('.ISSaltitude').text(issAltitude)
        });
        // console.log("timer tick");
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


