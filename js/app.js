
let popup = [
    {
      "type": "fields",
      "fieldInfos": [
        {
          "fieldName": "numero_domo_iers",
          "label": "Número DOMO IERS"
        },
        {
          "fieldName": "identificador",
          "label": "Identificador"
        },
        {
          "fieldName": "codigo_departamento",
          "label": "Código departamento"
        },
        {
          "fieldName": "nombre_departamento",
          "label": "Departamento"
        },
        {
          "fieldName": "codigo_municipio",
          "label": "Código municipio"
        },
        {
          "fieldName": "codigo_municipio",
          "label": "Código municipio"
        },
        {
          "fieldName": "nombre_municipio",
          "label": "Municipio"
        },
        {
          "fieldName": "estado",
          "label": "Estado"
        },
        {
          "fieldName": "orden_precision",
          "label": "Orden presicion"
        },
        {
          "fieldName": "fecha_materializacion",
          "label": "Fecha de materialización"
        },
        {
          "fieldName": "lugar_materializacion",
          "label": "Lugar de materializacion"
        },
        {
          "fieldName": "agencia_sigla",
          "label": "Agencia"
        },
        {
          "fieldName": "redes",
          "label": "Red"
        }
      ]
    }
  ]




function calcularDiaDelAno(fecha) {
  var inicioAño = new Date(fecha.getFullYear(), 0, 0);  
  var tiempoTranscurrido = fecha - inicioAño;  
  
  var milisegundosEnUnDía = 24 * 60 * 60 * 1000;

  var diaDelAño = Math.floor(tiempoTranscurrido / milisegundosEnUnDía);
  return diaDelAño;
}

function convertirCoordenadasITRF2020aITRF2014(x, y, z) { 
    
  let xITRF2014 = parseFloat(x) * 0.00000000042
  let yITRF2014 = parseFloat(y) * 0.00000000042
  let zITRF2014 = parseFloat(z) * 0.00000000042

  xITRF2014 = xITRF2014 + 0.0014 + parseFloat(x)
  yITRF2014 = yITRF2014 + 0.0014 + parseFloat(y)
  zITRF2014 = zITRF2014 - 0.0024 + parseFloat(z)
  
  return [xITRF2014, yITRF2014, zITRF2014];
}


function eliminarEspacios(linea){
    let arreglo = [];
    let palabra = "";
    let estado = true;
    for(let letra of linea){
        if(letra == ' '){
            if(estado){
                arreglo.push(palabra);
                palabra = '';
            }
            estado = false;
        }else{
            palabra += letra;
            estado = true;            
        }
    }


    let objeto = {
        nombre:arreglo[0].substring(2, arreglo[0].length),
        x:arreglo[1],
        y:arreglo[2],
        z:arreglo[3],
        tipo:arreglo[4]
    }


    return objeto;
}


function leerCarpetaLogFiles(file){

  let anosPorHtml = [];

  for(let i of file){
    let obj = {};
    if(i.name.indexOf("html") !== -1){
      
      obj.name = i.name;

        let reader = new FileReader();
        reader.onload = (e) => {      

        
        for(let element of e.target.result.split("</tr>")){
      
          
          if(element.indexOf("Intervalo de observación:") !== -1){            
            
            const fecha = element.substring(85, 96);
            const ano = fecha.substring(6,10);
            const mes = fecha.substring(3,5);
            const dia = fecha.substring(0,2);
      

            
            var fechaEjemplo = new Date(ano, mes-1, dia);
            var diaDelAno = calcularDiaDelAno(fechaEjemplo);
      
            let anoEpoca = parseInt(ano) + (diaDelAno/365);
      
            obj.anoEpoca = anoEpoca;
      
            
            
            break;
          }

          if(element.indexOf("Hora Inicio - Hora Fin:") !== -1){            
            
            const fecha = element.substring(90, 100);
            
            const ano = fecha.substring(6,10);
            const mes = fecha.substring(3,5);
            const dia = fecha.substring(0,2);
            
            

            
            var fechaEjemplo = new Date(ano, mes-1, dia);
            var diaDelAno = calcularDiaDelAno(fechaEjemplo);
            
            let anoEpoca = parseInt(ano) + (diaDelAno/365);
            
            obj.anoEpoca = anoEpoca;     
            
            console.log('anoEpoca', obj.anoEpoca);
            
            break;
          }
        }        

        anosPorHtml.push(obj);
        
    };
    reader.readAsText(i);
    
      
    }
  }
    console.log(anosPorHtml, anosPorHtml.length)
  return anosPorHtml;
}

function buscarAnoDeCoordenada(coordenada, logsArray){  
  
  for(let i=0; i<logsArray.length; i++){            
    if(logsArray[i].name.indexOf(coordenada.nombre) !== -1){                  
        return logsArray[i].anoEpoca;      
    }
  }

}


function espacioEstasdar(cadena){
  console.log(cadena.length);
  for(let i=cadena.length; i<6; i++) {
    cadena += ' ';
  }
  return cadena;
}


// ======== DESCARGAR ITRF 2014 =================
// ==============================================

const descargarItrf2014 = async (coordenada) => {        
  
  let archivoPlano = document.querySelector('#cargarTexto').files[0];   
    



    let reader = new FileReader();
    reader.onload = (e) => {        

        let vertices = e.target.result.split('\n');
        
        let verticesArray = [];
        for(let i=3; i < vertices.length; i++) {
          
          if(vertices[i].length > 0){
            verticesArray.push(eliminarEspacios(vertices[i]));
          }
        }      
        
        let datosTabla = `${vertices[0]}\n${vertices[1]}\n${vertices[2]}\n`;
        
        for(let coordenadas of verticesArray) {
          console.log(coordenadas);
          if(coordenadas.tipo != 'CTRL'){
            let coordenadaAjustada = convertirCoordenadasITRF2020aITRF2014(coordenadas.x, coordenadas.y, coordenadas.z);                         
            
            datosTabla += `@#${coordenadas.nombre} \t ${coordenadaAjustada[0].toFixed(5)} \t ${coordenadaAjustada[1].toFixed(5)} \t ${coordenadaAjustada[2].toFixed(5)} \t ${coordenadas.tipo} \n`;
            
          }else {            
            let nombreAjustado = espacioEstasdar(coordenadas.nombre);
            datosTabla += `@#${nombreAjustado} \t  ${coordenadas.x} \t  ${coordenadas.y} \t  ${coordenadas.z} \t ${coordenadas.tipo} \n`;
          }
        }
        console.log( datosTabla );

        var blob = new Blob([datosTabla], {
          type: 'text/txt'
        });
    
        var link = document.createElement("a");    
        link.href = window.URL.createObjectURL(blob);        
        link.download = archivoPlano.name.replace("20","14");
        document.body.appendChild(link);
        link.click();
    };
    reader.readAsText(archivoPlano);

    
  


}

function promedioVertices(vertices){
  let promedio = {x:0, y:0, z:0};
  let contador = 0;
  for(let vertice of vertices){
    if(vertice.tipo != 'CTRL'){
      promedio.x += parseFloat( vertice.x );
      promedio.y += parseFloat( vertice.y );
      promedio.z += parseFloat( vertice.z );
      contador++;
    }
  }
  promedio.x = promedio.x / contador;
  promedio.y = promedio.y / contador;
  promedio.z = promedio.z / contador;
  console.log(promedio, contador);
  return promedio;
}





document.querySelector('#calcular').addEventListener('click',async function(){
  
  let archivoPlano = document.querySelector('#cargarTexto').files[0];   
  
  
  let reader = new FileReader();
  reader.onload = async (e) => {       
    
    
    let vertices = e.target.result.split('\n');
    //console.log(e.target.result);
    let verticesArray = [];
    for(let i=3; i < vertices.length-1; i++) {
      if(vertices[i].length > 0){
         verticesArray.push(eliminarEspacios(vertices[i]));
      }
    }         

        
        
        let datosTabla = "";
        console.log('vertices a recorrer', verticesArray)

        promedioVertices(verticesArray);





        for(let coordenadas of verticesArray) {          
          let arr = JSON.parse( localStorage.getItem('anosPorHtml') )    
          
          let anoEpocaInicial = buscarAnoDeCoordenada(coordenadas, arr); // ejem: 2023.3424
          
          let deltaDeTiempo = 2018 - anoEpocaInicial;  // ejem: -5.27
          
          
          if(coordenadas.tipo != 'CTRL'){
            
            let coordenadaAjustada = convertirCoordenadasITRF2020aITRF2014(coordenadas.x, coordenadas.y, coordenadas.z);
            
            
            // datosTabla += `
            //   <tr>
            //     <th scope="row">${coordenadas.nombre}</th>
            //     <td>${coordenadaAjustada[0] + (0.00460 * deltaDeTiempo)}</td>
            //     <td>${coordenadaAjustada[1] + (0.00313 * deltaDeTiempo)}</td>
            //     <td>${coordenadaAjustada[2] + (0.01348 * deltaDeTiempo)}</td>
            //     <td>${deltaDeTiempo}</td>
            //   </tr> 
            // `;
            console.log(coordenadas)
            datosTabla += `
              <tr>
                <th scope="row">${coordenadas.nombre}</th>
                <td>${coordenadaAjustada[0] + (0.00880 * deltaDeTiempo)}</td>
                <td>${coordenadaAjustada[1] + (0.00440 * deltaDeTiempo)}</td>
                <td>${coordenadaAjustada[2] + (0.01290 * deltaDeTiempo)}</td>
                <td>${deltaDeTiempo}</td>
              </tr> 
            `;
            console.log();
          }
        }
        
        document.getElementById('tablaEntrada').innerHTML = datosTabla;
    };
    reader.readAsText(archivoPlano);
});




document.querySelector('#descargar').addEventListener('click', function(e) {
  descargarItrf2014('hollaaaa');
} );






document.querySelector('#cargarTexto').addEventListener('change', (e) => {    
  if(e.target.files.length)  {
    document.getElementById('icono-archivo').className = 'bi bi-file-check-fill';
    document.getElementById('texto-archivo').innerText = `${e.target.files[0].name}`;  
  }

  

  let archivoPlano = document.querySelector('#cargarTexto').files[0];   
  
  
  let reader = new FileReader();
  reader.onload = async (e) => {       
    
    
    let vertices = e.target.result.split('\n');
    //console.log(e.target.result);
    let verticesArray = [];
    for(let i=3; i < vertices.length-1; i++) {
      if(vertices[i].length > 0){
         verticesArray.push(eliminarEspacios(vertices[i]));
      }
    }      
    
    
    // espacio para traer velocidades
    // let velocidades = obtenerVelocidades();
    let arregloRedPasiva = [];
    try {
      const res = await fetch('./../json/Red pasiva GNSS.json');
      arregloRedPasiva = await res.json();
      //console.log(arregloRedPasiva)
    } catch (error) {
      console.error(error)
    }
      
    let result = [];
    for(let vertice of verticesArray){
       let res = arregloRedPasiva.find((verArry) => verArry.Nomenc.toString() === vertice.nombre );  
       if(res){
         result.push({
          nombre: vertice.nombre, x: vertice.x, y:vertice.y, z:vertice.z, tipo:vertice.tipo, 
          velx:res.VelX, vely:res.VelY, velz:res.VelZ, altelips:res.AltElips, ondula:res.Ondula,
          lat:res.Lat, long: res.Long
        });
         //console.log(res)
       }else{

        // ====== CONVERTIR CORDENADAS GEOCENTRICAS A LAT Y LONG =========

        let x  = parseFloat(vertice.x);
        let y = parseFloat(vertice.y);
        let z = parseFloat(vertice.z);

        var a = 6378137.0; // Semieje mayor de la Tierra en metros
        var f = 1.0 / 298.257223563; // Factor de achatamiento
        var e2 = 2 * f - f * f; // Excentricidad al cuadrado

        var lon = Math.atan2(y, x);
        var p = Math.sqrt(x * x + y * y);
        var lat = Math.atan2(z, p * (1 - e2));
        var v = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));

        var latDec = lat * 180 / Math.PI;
        var lonDec = lon * 180 / Math.PI;

        // ====== FIN =========

        result.push({
          nombre: vertice.nombre, x: vertice.x, y:vertice.y, z:vertice.z, tipo:vertice.tipo,
          lat: latDec, long:lonDec
        });


       }  
    }

    
    console.log('filter', result)   
        
    };
    reader.readAsText(archivoPlano);
    
    cargarMapa(-74, 6);
});





document.getElementById("cargarCarpeta").addEventListener("change",function(ev){
  
  

  let file = ev.target.files;
  
  
  let anosPorHtml = [];
  localStorage.setItem('anosPorHtml', JSON.stringify(anosPorHtml));

  for(let i of file){
    let obj = {};
    if(i.name.indexOf("html") !== -1){
      
      obj.name = i.name;

        let reader = new FileReader();
        reader.onload = (e) => {      

        
        for(let element of e.target.result.split("</tr>")){
      
          
          if(element.indexOf("Intervalo de observación:") !== -1){            
            
            const fecha = element.substring(85, 96);
            const ano = fecha.substring(6,10);
            const mes = fecha.substring(3,5);
            const dia = fecha.substring(0,2);
      

            
            var fechaEjemplo = new Date(ano, mes-1, dia);
            var diaDelAno = calcularDiaDelAno(fechaEjemplo);
      
            let anoEpoca = parseInt(ano) + (diaDelAno/365);
      
            obj.anoEpoca = anoEpoca;

            let arre = JSON.parse( localStorage.getItem('anosPorHtml') )            
            arre.push(obj)
            localStorage.setItem('anosPorHtml', JSON.stringify(arre));
            
            
            break;
          }

          if(element.indexOf("Hora Inicio - Hora Fin:") !== -1){            
            
            const fecha = element.substring(90, 100);
            
            const ano = fecha.substring(6,10);
            const mes = fecha.substring(3,5);
            const dia = fecha.substring(0,2);
            
            

            
            var fechaEjemplo = new Date(ano, mes-1, dia);
            var diaDelAno = calcularDiaDelAno(fechaEjemplo);
            
            let anoEpoca = parseInt(ano) + (diaDelAno/365);
            
            obj.anoEpoca = anoEpoca;     
            
            // console.log('anoEpoca', obj.anoEpoca);

            let arre = JSON.parse( localStorage.getItem('anosPorHtml') )            
            arre.push(obj)
            localStorage.setItem('anosPorHtml', JSON.stringify(arre));
            
            break;
          }
        }        

        anosPorHtml.push(obj);
        
    };
    reader.readAsText(i);
    // console.log(anosPorHtml, anosPorHtml.length)
    
      
    }
  }

  // === css styles ====
  if(ev.target.files.length)  {
    document.getElementById('icono-carpeta').className = 'bi bi-folder-fill';
    document.getElementById('texto-carpeta').innerText = ` Carpeta de LOGFILES cargada.`;
  }
  // ===================
    
  return anosPorHtml;
  


});







function cargarMapa(longitude, latitude){

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
      url: "https://mapas.igac.gov.co/server/rest/services/centrocontrol/EstacionesGeodesicas/MapServer",
      sublayers: [
        {
          id: 1,
          visible: true,
          definitionExpression: "es_pasiva_gnss=1",
          popupTemplate: {
            title: "Atributos",
            outFields: ["*"],
            content: popup,                
          },
        },
      ]
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
      zoom: 5.4,
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





document.querySelector('#viewDiv').addEventListener('click', function(e){
  if(e.target.tagName === 'TD' && e.target.parentNode.firstChild.textContent === 'Identificador' ){        
      console.log(e.target.tagName, e.target.textContent, e.target.parentNode.firstChild)        
  }
});

