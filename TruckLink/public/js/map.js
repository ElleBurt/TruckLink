
var TileMapInfo = {
  "x1": -94621.8047,
  "x2": 79370.14,
  "y1": -80209.17,
  "y2": 93782.77,
  "minZoom": 0,
  "maxZoom": 8
}

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

  var markers = new ol.layer.Vector({
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
  


  export {
    map,
    markers
  }