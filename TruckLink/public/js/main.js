import {map,markers}from '/js/map.js';


let following = false;
$( document ).ready(function() {
    $('#login').on("click",function(){
        $('.LoginPrompt').css('display', 'block');
        $('.BGdim').css('display', 'block');
           
    })
    $('#closeOut').on("click",function(){
       $('.LoginPrompt').css('display', 'none');
       $('.BGdim').css('display', 'none');
    });


    $('#loginSubmit').on("click", function(){

        let uname = $('#username').val();
        let pword = $('#password').val();
        
        var data;

        data = {"username": uname, "password": pword}

    
        $.ajax({
            url: "/api/auth",
            data: data,
            type: 'POST',
            success: function(response) {
                window.location.replace('/dash');

            },
            error: function(xhr, textStatus, errorThrown) {
                $('#invalid').css('display', 'inline-flex');
                $('#username').val('');
                $('#password').val('');
            }
        })
    })

    
  
    
})


let speed;

const markerMap = new Map();

// Move token to ENV file ~ IlluminatiFish 19/09/2023
const socket = io('http://www.trucklinkvtc.co.uk', { auth: { token: 'TRUCKLINK_BACKEND' } });
socket.on('dashboard', (res) => {
  speed = res.truck.speed


    if(!$(`#playerId option[value='${res.id}']`).length > 0){
      $('#playerId').append(`<option value="${res.id}">${res.id}</option>`)
      

      const marker = new ol.Feature(
          new ol.geom.Point(ol.proj.fromLonLat([0, 0]))
      );

      markerMap.set(res.id, marker)
      markers.getSource().addFeature(marker);
      alert(res.id, "Connected!")
    }
    var marker = markerMap.get(res.id)
    const geometry = marker.getGeometry();
    var label = res.id;

    var style = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            rotation: (res.truckPosition.heading * -360) * (Math.PI/180), 
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

   

    
})

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
})

async function alert(id, condtion) {
  $('#playerConnect p').html(`${id} ${condtion}!`)
  $('#playerConnect').css({'display': 'inline-flex','animation':' alert 5s ease-in-out'})
  await sleep(5000);
  $('#playerConnect').css({'display': 'none'})
}

socket.on('event', (res) => {
  if(res.event == 'timeChange'){
    //get speed and convert to kpm then edit database
  }
})


const sleep = async (milliseconds) => {
  await new Promise(resolve => {
      return setTimeout(resolve, milliseconds)
  });
};

$('#followButton').on('click',function(e){
  following = !following;
  $('#followButton').toggleClass('active')
})


function allOffline() {
  if ($('#playerId').has('option').length == 0) {
    $("#allOffline").css('display', 'inline-flex');
  }
  else{
      $("#allOffline").css('display', 'none');
  }
  
};


setInterval( allOffline, 1000 );

fetch('/frontstats?param=1')
    .then(response => response.json())
    .then(data => {
      $("#DeliveryValue").html(data);
    });

fetch('/frontstats?param=0')
  .then(response => response.json())
  .then(data => {
    $("#KilometersValue").html(`${data} km`);
  });


setInterval(function() {
  fetch('/frontstats?param=1')
    .then(response => response.json())
    .then(data => {
      $("#DeliveryValue").html(data);
    });

  fetch('/frontstats?param=0')
    .then(response => response.json())
    .then(data => {
      $("#KilometersValue").html(`${data} km`);
    });
}, 5000);

$("#KilometersValue").fitText();
$("#DeliveryValue").fitText();




const deliveryGraph = $('#deliveryGraphCanvas');

var deliveryData = []


let deliveryDataGraph = new Chart(deliveryGraph, {
    type: 'line',
    data: {
        labels: deliveryData ,
        datasets: [
            {label: 'Deliveries',
                borderColor: "#fff",
                data: TruckSpeedData,
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
                ticks: {
                    stepSize: 1
                }
                
            }
        },
        animation: {
            duration: 0
        },
        maintainAspectRatio: false
    }
});