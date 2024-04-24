var TileMapInfo = { 
    "x1": -94621.8047,
    "x2": 79370.14,
    "y1": -80209.17,
    "y2": 93782.77,
    "minZoom": 0,
    "maxZoom": 8
  }


  let following = false;

  const tsProjection = new ol.proj.Projection({
    code: 'ZOOMIFY',
    units: 'pixels',
    extent: [
      TileMapInfo.x1, -TileMapInfo.y2, TileMapInfo.x2, -TileMapInfo.y1
    ]
  })

  const mousePosition = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(0),
  });

  var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'images/Tiles/{z}/{x}/{y}.png',
          projection: tsProjection
        }),
      }),
    ],
    view: new ol.View({
      center: [0, 0],
      zoom: 0,
      minZoom: 3,
      maxZoom: TileMapInfo.maxZoom,
      projection: tsProjection,
      extent: tsProjection.getExtent(),
    }),
  });

  const markers = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0, 0],
        src: 'images/cabin.png',
        scale: 0.02
      })
    })
  });
  
  // Add the vector layer to the map
  map.addLayer(markers);


const speedGraph = $('#speedGraph');
const damageGraph = $('#damageGraph');
var labelsSpeed = []
var SpeedLimitData = []
var TruckSpeedData = []
var CruiseSpeedData = []
var dmgData = []
Chart.defaults.color = '#fff';

let speedDataGraph = new Chart(speedGraph, {
    type: 'line',
    data: {
        labels: labelsSpeed,
        datasets: [
            {label: 'Speed km/h',
                borderColor: "#fff",
                data: TruckSpeedData,
                pointRadius: 0 
            },
            {label: 'Speed Limit',
                borderColor: "#F08080",
                data: SpeedLimitData,
                pointRadius: 0 
            },
            {label: 'Cruise Speed',
                borderColor: "#53C2CF",
                data: CruiseSpeedData,
                pointRadius: 0 
            }
        ]},
    options: {
        plugins: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        family: "poppins, sans-serif",
                    }
                }
            }
        },
        scales: {
            y: {
                type: 'linear',
                min: 0,
                max: 140,
                ticks: {
                    stepSize: 20
                }
                
            }
        },
        animation: {
            duration: 0
        },
        maintainAspectRatio: false
    }
});

let damageDataGraph = new Chart(damageGraph, {
    type: 'radar',
    data: {
        labels: ['cabin','chassis','engine','transmisson','wheels','total'],
        datasets: [{
            label: 'Damage Report',
            data: dmgData,
            backgroundColor: 'rgba(82, 194, 206, 0.5)',
            borderColor: '#fff',
            pointBackgroundColor: 'rgba(82, 194, 206, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#fff'
        }
        ]},
    options: {
        plugins: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        family: "poppins"
                    }
                }
            }
        },
        scales:{
            r: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 25,
                    backdropColor: 'rgba(255,255,255,0)',
                },
                grid: {
                    color: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.5)', 'rgba(255, 234, 0,0.5)', 'rgb(255, 191, 0,0.5)', 'rgba(255,0,0,0.5)']
                }
            },
        },
        elements: {
            line: {
                borderWidth: 1
            }
        },
        animation: {
            duration: 0
        },
        maintainAspectRatio: false
    }
});

const speedgaugeElement = document.querySelector(".speedgauge");

function setSpeedGaugeValue(speedgauge, speedvalue, gearvalue) {
  if (speedvalue < 0 || speedvalue > 180) {
    return;
  }
  let new_value = speedvalue / 180

  speedgauge.querySelector(".gauge__fill").style.transform = `rotate(${
    new_value / 2
  }turn)`;
  speedgauge.querySelector(".gauge__cover .gauge__font #speed").textContent = `${Math.round(speedvalue)} kph`;
  speedgauge.querySelector(".gauge__cover .gauge__font #gear").textContent = `${gearvalue}`;
}



const fuelgaugeElement = document.querySelector(".fuelgauge");

function setFuelGaugeValue(fuelgauge, value, valueCap, valueRange) {
  if (value < 0) {
    return;
  }
  let percentage = Math.round(value * 100 / valueCap)
  let new_value = percentage/100
  

  fuelgauge.querySelector(".gauge__fill").style.transform = `rotate(${
    new_value / 2
  }turn)`;

  fuelgauge.querySelector(".gauge__cover .gauge__font #FuelRange").textContent = `${Math.round(valueRange)} km`;
  fuelgauge.querySelector(".gauge__cover .gauge__font #FuelPercent").textContent = `Fuel: ${percentage} %`;
}






$("#playerId").on("change", function(){
    $('#job-list').empty();
    $('#job-list-info').empty();
    $('#eventList').empty();
    SpeedLimitData.length = 0
    TruckSpeedData.length = 0
    CruiseSpeedData.length = 0
    labelsSpeed.length = 0

  
})



const markerMap = new Map();
const socket = io('http://www.trucklinkvtc.co.uk', { auth: { token: 'TRUCKLINK_BACKEND' } });
socket.on('dashboard', (res) => {

    if(!$(`#playerId option[value='${res.id}']`).length > 0){
        $('#playerId').append(`<option value="${res.id}">${res.id}</option>`)
        alert(res.id, "Connected!")

        const marker = new ol.Feature(
            new ol.geom.Point(ol.proj.fromLonLat([0, 0]))
        );

        markerMap.set(res.id, marker)
        markers.getSource().addFeature(marker);
        
    }
    var marker = markerMap.get(res.id)
    const geometry = marker.getGeometry();
    var label = res.id;

    var style = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            rotation: (res.truckPosition.heading * -360) * (Math.PI/180), // rotate the icon by 90 degrees
            src: 'images/cabin.png',
            scale: 0.035
        }),
        text: new ol.style.Text({
            text: label,
            font: '15px poppins,sans-serif',
            fill: new ol.style.Fill({
              color: '#000'
            }),
            stroke: new ol.style.Stroke({
              color: '#fff',
              width: 7
            }),
            offsetY: -17
          })
    });
    
    marker.setStyle(style);

    geometry.setCoordinates([res.truckPosition.pos.x,-res.truckPosition.pos.y]);

    if(following){
        var followMarker = markerMap.get($("#playerId option:selected").val())
        var point = followMarker.getGeometry().getCoordinates();
        map.getView().setCenter(point);
    }
    
    if (!$('#playerId').has('option').length >= 1) {
        $("#allOffline").css('display', 'inline-flex');
    }
    else{
        $("#allOffline").css('display', 'none');
    }

    if($("#playerId option:selected").val() == res.id){
        
        
        

        setFuelGaugeValue(fuelgaugeElement, res.fuel.current, res.fuel.capacity, res.fuel.range); //jquery elem , current fuel value, fuel capacity, fuel range

        setSpeedGaugeValue(speedgaugeElement, res.truck.speed, res.controls.gear);

        $("#wheel_img").css('rotate', `${-450 * res.controls.steering}deg`)

        $("#accelerate").css('opacity', `${res.controls.throttle}`)
        $("#brake").css('opacity', `${res.controls.brake}`)
        $("#clutch").css('opacity', `${res.controls.clutch}`)

        if(res.lights.blinkers.left){
            $("#leftIndic_img").css("animation", "blink 1s infinite");
            $("#leftIndic_img").css('opacity', `1`)
        }else{
            $("#leftIndic_img").css("animation", "none");
            $("#leftIndic_img").css('opacity', `0.5`)
        }

        if(res.lights.blinkers.right){
            $("#rightIndic_img").css("animation", "blink 1s infinite");
            $("#rightIndic_img").css('opacity', `1`)
        }else{
            $("#rightIndic_img").css("animation", "none");
            $("#rightIndic_img").css('opacity', `0.5`)
        }

        if(res.lights.blinkers.hazards){
            $("#hazard_img").css("animation", "blink 1s infinite");
            $("#hazard_img").css('opacity', `1`)
        }else{
            $("#hazard_img").css("animation", "none");
            $("#hazard_img").css('opacity', `0.5`)
        }

        if(res.event == "updateVitalsToDashboard") {
            labelsSpeed.push('\u200b')
            TruckSpeedData.push(res.truck.speed)
            SpeedLimitData.push(res.speedLimit)
            CruiseSpeedData.push(res.truck.cruise)

            if(CruiseSpeedData.length > 20){
                CruiseSpeedData.shift()
                TruckSpeedData.shift()
                SpeedLimitData.shift()
                labelsSpeed.shift()
            }
            
            dmgData.push(res.damage.cabin*100, res.damage.chassis*100, res.damage.engine*100, res.damage.transmission*100, res.damage.wheels*100, res.damage.total*100)
            
            speedDataGraph.update();
            damageDataGraph.update();

            
            dmgData.length=0

        }
    }

}); 

socket.on('job', (res) => {
    if($("#playerId option:selected").val() == res.id){
       

        let cargo;
        if (res.cargo.name == '' || undefined){
            cargo = "no cargo"

            $("#job-list").html(
                "<li>"+
                    "<div id='job-to-from-info-null'>"+
                        "<h1>No job active</h1>"+
                    "</div>"+
                "</li>"
            );
            
        }else{
            cargo = res.cargo.name

            
            let destination_logo = new Image();
            destination_logo.id = 'job-logo-img';
            destination_logo.src = `/images/logos/${(res.destination.company).replace(/\s/g, '_')}_logo.webp`;
            destination_logo.onerror = function() {
                destination_logo.src = '/images/logos/logoNotFound.webp';
            }
            
            let origin_logo = new Image();
            origin_logo.id = 'job-logo-img';
            origin_logo.src = `/images/logos/${(res.origin.company).replace(/\s/g, '_')}_logo.webp`;
            origin_logo.onerror = function() {
                origin_logo.src = '/images/logos/logoNotFound.webp';
            }
            
            // Create the list items
            let origin_li = $("<li>").append(
                $("<div>").attr('id', 'job-to-from-info').append(
                    origin_logo,
                    $("<p>").text(res.origin.city)
                )
            );
            
            let destination_li = $("<li>").append(
                $("<div>").attr('id', 'job-to-from-info').append(
                    destination_logo,
                    $("<p>").text(res.destination.city)
                )
            );
            
            let arrow_li = $("<li>").append(
                $("<div>").append(
                    $("<img>").attr('id', 'job-arrow-img').attr('src', '/images/arrow.gif')
                )
            );
            
            // Append the list items to the job list
            $("#job-list").html("");
            $("#job-list").append(origin_li, arrow_li, destination_li);
            
            
        }

        $("#job-list-info").html(
            "<li id='job-details'>"+
                    "<img src='/images/dashboard/box.png'>"+
                    "<p>"+ cargo +"</p>"+
            "</li>"+
            "<li id='job-details'>"+
                    "<img src='/images/dashboard/weight.png'>"+
                    "<p>"+(res.cargo.mass/1000).toFixed(2)+" tons"+"</p>"+
            "</li>"+
            "<li id='job-details'>"+
                    "<img src='/images/dashboard/euro-sign.png'>"+
                    "<p>"+(res.revenue.toLocaleString())+"</p>"+
            "</li>"+
            "<li id='job-details'>"+
                    "<img src='/images/dashboard/clock.png'>"+
                    "<p>"+(humanize(res.expectedDeliveryTime))+"</p>"+
            "</li>"

        );    
    }
});
    


// CLIENT -> SERVER
socket.on('jobDelivery', (res) => {

    $.ajax({
        url: 'http://www.trucklinkvtc.co.uk/delivery',
        type: 'GET',
        success: function(data) {
          console.log('Response from server:', data);
        },
        error: function(s) {
            console.log('GET /delivery', s);
        }
      });
    
    $.ajax({
        url: `http://www.trucklinkvtc.co.uk/distance?param=${res.distance}`,
        type: 'GET',
        success: function(data) {
            console.log('Response from server:', data);
        },
        error: function(s) {
            console.log('GET /distance', s);
        }
    });

});

let expandelm = 0;

socket.on('event', (res) => {
    if(res.event == "disconnected"){
        $(`#playerId option[value='${res.id}']`).remove();
        alert(res.id, "Disconnected!")
        markers.getSource().removeFeature(markerMap.get(res.id))
        if (!$('#playerId').has('option').length >= 1) {
            $("#allOffline").css('display', 'inline-flex');
        }
        else{
            $("#allOffline").css('display', 'none');
        }
    }
    if($("#playerId option:selected").val() == res.id){
        switch(res.event){
            case "disconnected":{
                $('#eventList').append( `<li class="Evn">Player Disconnected</li>`)
                break;
            }
            case "damage":{
                $('#eventList').append( `<li class="Evn">Damage total: ${Math.round(((res.current *100) * 100) / 100)}% </li>`)
                break;
            }
            case "trainJourney":{
                $('#eventList').append( `<li class="Evn expandEvent" id="expandelm${expandelm++}" value="${0}"><h2>Train<img src="/images/arrow-drop-down-line.svg"/></h2><p> From: ${res.origin}</p><p>To: ${res.destination}</p><p> Price: € ${res.cost}</p></li>`)
                break;
            }
            case "tollgatePayment":{
                $('#eventList').append( `<li class="Evn">Toll: € ${res.cost}</li>`)
                break;
            }
            case "ferryJourney":{
                $('#eventList').append( `<li class="Evn expandEvent" id="expandelm${expandelm++}" value="${0}"><h2>Ferry<img src="/images/arrow-drop-down-line.svg"/></h2><p>From: ${res.origin} </p><p> To: ${res.destination} </p><p> Price: € ${res.cost}</p></li>`)
                break;
            }
            case "finePayment":{
                $('#eventList').append( `<li class="Evn expandEvent" id="expandelm${expandelm++}" value="${0}"><h2>Fined<img src="/images/arrow-drop-down-line.svg"/></h2><p>Offence: ${res.offence}</p><p> Price: € ${res.cost}</p></li>`)
                break;
            }
            case "emergency":{
                $('#eventList').append( `<li class="Evn">Emergency: ${res.emergency}</li>`)
                break;
            }
        }
        if($('#eventList li').length > 8){
            $('#eventList li').first().remove();
        }
        
    }
})



function humanize(fractionalTime) {

    if(fractionalTime == 0){
        return('nothing to deliver');
    }

    let date = new Date(fractionalTime * 1000);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    if(hours < 10){
        hours = `0${hours}`
    }
    if(minutes < 10){
        minutes = `0${minutes}`
    }
    if(seconds < 10){
        seconds = `0${seconds}`
    }

    let humanReadableTime = `${hours}:${minutes}:${seconds}`
    return(humanReadableTime);
}

$(document).on("click", "#eventList li", function(event) { 
    event.preventDefault();
    $(event.currentTarget).toggleClass('open')
    if($(event.currentTarget).hasClass('open')){
        $(`#${event.currentTarget.id}`).css('height', 'auto');
        $(`#${event.currentTarget.id} p`).css('display', 'flex');
        $(`#${event.currentTarget.id} img`).css('transform', 'rotate(180deg)');
    }else{
        $(`#${event.currentTarget.id}`).css('height', '3vw');
        $(`#${event.currentTarget.id} p`).css('display', 'none');
        $(`#${event.currentTarget.id} img`).css('transform', 'rotate(0deg)');
    }
});

$(document).on("mouseover", "#eventList li", 
function(event) { 
    event.preventDefault();

    try{
        $(`#${event.currentTarget.id} strong`).css('color', 'grey');
    }catch{
        return
    }
    

});

$(document).on("mouseout", "#eventList li", function(event) { 
    event.preventDefault(); 

    try{
        $(`#${event.currentTarget.id} strong`).css('color', 'white');
    }catch{
        return
    }

});


async function alert(id, condtion) {
    $('#playerConnect p').html(`${id} ${condtion}!`)
    $('#playerConnect').css({'display': 'inline-flex','animation':' alert 5s ease-in-out'})
    await sleep(5000);
    $('#playerConnect').css({'display': 'none'})
}


const sleep = async (milliseconds) => {
    await new Promise(resolve => {
        return setTimeout(resolve, milliseconds)
    });
};


$('#followButton').on('click',function(e){
    following = !following;
    $('#followButton').toggleClass('active')
})

$('.homepage').on('click',function(e){
    window.location.replace('/');
})