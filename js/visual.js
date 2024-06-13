

function cambiosVisualesCarga(e) {
  document.querySelector('#progress').style.visibility = 'visible';
  setInterval(() => {
    document.querySelector('.progress-bar').style.width = '100%';
  }, 2000);
  setTimeout(() => {
    document.querySelector('#progress').style.visibility = 'hidden';
  }, 3000);
}

function cambiosVisualesCarga2(e) {
  document.querySelector('#progress2').style.visibility = 'visible';
  setInterval(() => {
    document.querySelector('.progress-bar2').style.width = '100%';
  }, 2000);
  setTimeout(() => {
    document.querySelector('#progress2').style.visibility = 'hidden';
  }, 3000);

}

function cambiosToggleHabilitar(estado) {

  if (estado) {

    // deshabiliar botton elegir vertice
    document.querySelector('#elegir-verticel').disabled = true;
    document.querySelector('#elegir-verticel').innerHTML = `
      <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
      </div>
      `;

    // deshabiliar botton descarga irtf
    document.querySelector('#descargar').disabled = true;
    document.querySelector('#descargar').innerHTML = `
      <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
      </div>
      `;

  } else {

    // habilitar el boton modal para elegir el vertice
    document.querySelector('#elegir-verticel').disabled = false;
    document.querySelector('#elegir-verticel').innerHTML = `
      Elegir Vertice   <i class="bi bi-globe-americas"></i> 
    `;

    // habilitar el boton para descarga del itrf
    document.querySelector('#descargar').disabled = false;
    document.querySelector('#descargar').innerHTML = `
       <i class="bi bi-cloud-arrow-down"></i>  Descargar ITRF2014
    `;

  }

}


function tabular(vertice, verticePunto) {
  console.log(verticePunto)
  let texto = `
        <tr>
          <th scope="row">${verticePunto.nombre}</th>
          <td>${verticePunto.altelips}</td>
          <td>${verticePunto.ondula}</td>
          <td></td>
          <td>${vertice.DHI.toFixed(5)}</td>
          <td>${vertice.DNI.toFixed(5)}</td>
          <td>${vertice.DHG.toFixed(5)}</td>
          <td>${vertice.HGP.toFixed(5)}</td>
          <td>${vertice.DHO.toFixed(5)}</td>
          <td>${vertice.DHGC.toFixed(5)}</td>
          <td>${vertice.HGPSFINAL.toFixed(5)}</td>         
        </tr>
        `;
  document.querySelector('#calculos').innerHTML += texto;
}

function cargarMapa(longitude, latitude) {

  require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Home",
    "esri/widgets/ScaleBar",
    "esri/widgets/LayerList",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/widgets/Compass",
    "esri/geometry/Extent",
    "esri/layers/MapImageLayer",
    "esri/layers/VectorTileLayer",
    "esri/geometry/Point",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
  ], (
    esriConfig,
    Map,
    MapView,
    Home,
    ScaleBar,
    LayerList,
    Legend,
    Expand,
    Compass,
    Extent,
    MapImageLayer,
    VectorTileLayer,
    Point,
    Graphic,
    GraphicsLayer
  ) => {
    esriConfig.apiKey =
      "AAPK2a2e861a0c794bfdb29a1b4ce47b1583OBbY7CvHSkUPhQ20FG1hZEbAl5GmTTZcs-cyoy2tw5to5j_pJiiTW6J_KRbBx-qS";

    const vtlLayer = new VectorTileLayer({
      url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_base_topografico/VectorTileServer",
    });

    const layer = new MapImageLayer({
      // url: "https://mapas.igac.gov.co/server/rest/services/geodesia/redpasiva/MapServer/",
      url: "https://mapas.igac.gov.co/server/rest/services/geodesia/redcontrolverticaldeprecision/MapServer/",
      sublayers: [
        {
          id: 0,
          visible: true,
          //  definitionExpression: "es_pasiva_gnss=0",
          popupTemplate: {
            //title: "Atributos",
            outFields: ["*"],
            content: [
              {
                "type": "fields",
                "fieldInfos": [
                  {
                    "fieldName": "FID",
                    "label": "FID"
                  },
                  {
                    "fieldName": "Nomenclatu",
                    "label": "Nomenclatura"
                  },
                  {
                    "fieldName": "Latitud",
                    "label": "Latitud"
                  },
                  {
                    "fieldName": "Longitud",
                    "label": "Longitud"
                  },
                  {
                    "fieldName": "Altura_m_s",
                    "label": "Altura"
                  },
                  {
                    "fieldName": "Línea_Niv",
                    "label": "Línea nivelada"
                  },
                  {
                    "fieldName": "Bloque_Aju",
                    "label": "Bloque ajustado"
                  },
                  {
                    "fieldName": "Año_Calcu",
                    "label": "Año calculo"
                  },
                  {
                    "fieldName": "Alt_Elipso",
                    "label": "Altura elipsoidal"
                  },
                  {
                    "fieldName": "Tipo_Coord",
                    "label": "Tipo coordenada"
                  },
                  {
                    "fieldName": "Estado_Vé",
                    "label": "Estado vértice"
                  },
                  {
                    "fieldName": "Código_De",
                    "label": "Código departamento"
                  },
                  {
                    "fieldName": "Nombre_Dep",
                    "label": "Nombre departamento"
                  },
                  {
                    "fieldName": "Concatenad",
                    "label": "Código municipio"
                  },
                  {
                    "fieldName": "Nombre_Mun",
                    "label": "Nombre municipio"
                  },

                ]
              }
            ],

          },
        },
      ],
    });
    const map = new Map({
      layers: [vtlLayer, layer],
    });

    // GRAFICAR PUNTO EN COORDENADAS CENTER

    const centerPoint = new Point({
      longitude: longitude,
      latitude: latitude
    });

    const markerSymbol = {
      type: "simple-marker",
      color: [226, 119, 40],  // Color naranja
      outline: {
        color: [255, 0, 0], // Color blanco
        width: 1
      }
    };

    const pointGraphic = new Graphic({
      geometry: centerPoint,
      symbol: markerSymbol
    });

    const graphicsLayer = new GraphicsLayer();
    graphicsLayer.add(pointGraphic);
    map.add(graphicsLayer);
    // ============================= //

    const view = new MapView({
      container: "viewDiv",
      map: map,
      // center: [-74, 4], // longitude, latitude
      zoom: 8,
      center: centerPoint,
    });
    const homeBtn = new Home({
      view: view,
    });
    const scaleBar = new ScaleBar({
      view: view,
      unit: "dual",
    });
    const layerList = new LayerList({
      view: view,
    });
    const legend = new Legend({
      view: view,
    });
    const layerListExpand = new Expand({
      view: view,
      content: layerList,
      expanded: false,
      expandTooltip: "Expand LayerList",
      mode: "floating",
    });
    const legendExpand = new Expand({
      view: view,
      content: legend,
      expandTooltip: "Expand Legend",
      expanded: false, // ===== VER EXPAND LEGEND  =====//
      mode: "floating",
    });
    const compass = new Compass({
      view: view,
      visible: false,
    });
    view.ui.add(homeBtn, "top-left");
    view.ui.add(scaleBar, "bottom-right");
    view.ui.add(layerListExpand, "top-right");
    view.ui.add(legendExpand, "bottom-left");
    view.ui.add(compass, "top-left");

    // load the Compass only when the view is rotated
    view.watch("rotation", function (rotation) {
      if (rotation && !compass.visible) {
        compass.visible = true;
      }
    });
  });
}

cargarMapa(-74, 4);