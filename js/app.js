localStorage.setItem('verticesOndula', JSON.stringify([]));
localStorage.setItem('anosPorHtml', JSON.stringify([]));

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


  function cambiosVisualesCarga(e){
    document.querySelector('#progress').style.visibility = 'visible';
      setInterval(() => {
        document.querySelector('.progress-bar').style.width = '100%';
      }, 2000);
      setTimeout(() => {
        document.querySelector('#progress').style.visibility = 'hidden';
      }, 3000);      
  }

  function cambiosVisualesCarga2(e){    
    document.querySelector('#progress2').style.visibility = 'visible';
      setInterval(() => {
        document.querySelector('.progress-bar2').style.width = '100%';
      }, 2000);
      setTimeout(() => {
        document.querySelector('#progress2').style.visibility = 'hidden';
      }, 3000);
      
  }

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

const mostrarMensaje = (mensaje, tipo) => {

  toastr.options = {
    "closeButton":true,
    "progressBar": true,
    // "positionClass":"toast-bottom-left"
  };

  if(tipo === 'success'){
    toastr.success("Hola, bienvenido al sistema!","Sistema Web");
  }else if(tipo === 'info'){
    toastr.clear();
    toastr.info(mensaje);
  } 
  
}

document.querySelector('#calcular').addEventListener('click',async function(){  
  
  
        if(JSON.parse( localStorage.getItem('verticesOndula') ).length == 0 || JSON.parse( localStorage.getItem('anosPorHtml') ).length == 0){          
          mostrarMensaje('Debe ingresar el archivo .asc y la carpeta logfiles','info');
          return
        }            
        
                    
        let verticesCompletos = [];
        
        let arrTexto = JSON.parse( localStorage.getItem('verticesOndula') ) 
        let arr = JSON.parse( localStorage.getItem('anosPorHtml') )    
        console.log(arrTexto, arr);


        // ===== OBTENER VELOCIDADES =======
        let velx= "";
        let vely="";
        let velz="";
        for(let vel of arrTexto){
          if(vel.velx != undefined){
            console.log("enroll")
            velx = parseFloat(vel.velx.replace(",","."));
            vely = parseFloat(vel.vely.replace(",","."));
            velz = parseFloat(vel.velz.replace(",","."));
            break;
          }
        }
        console.log(velx, vely, velz);
        // ===== FIN =======

        
        for(let coordenadas of arrTexto) {          
          let anoEpocaInicial = buscarAnoDeCoordenada(coordenadas, arr); // ejem: 2023.3424
            
          let deltaDeTiempo = 2018 - anoEpocaInicial;  // ejem: -5.27 
          
          for(let coordenada of arr){
            //console.log(coordenada.name.split(' - ')[1].split('.')[0])
            if(coordenadas.nombre === coordenada.name.split(' - ')[1].split('.')[0].trim()){
              // console.log(coordenada.altelips)
              //console.log(coordenadas)
              let coordenadaAjustada = convertirCoordenadasITRF2020aITRF2014(coordenadas.x, coordenadas.y, coordenadas.z);
              verticesCompletos.push(
                {lat:coordenadas.lat, long:coordenadas.long, nombre:coordenadas.nombre, ondula:coordenadas.ondula,
                tipo:coordenadas.tipo, x:coordenadas.x, y:coordenadas.y, z:coordenadas.z, altelips: coordenada.altelips,
                xreferencia:coordenadaAjustada[0] + (velx * deltaDeTiempo),
                yreferencia:coordenadaAjustada[1] + (vely * deltaDeTiempo),
                zreferencia:coordenadaAjustada[2] + (velz * deltaDeTiempo)}
                );
              break;
            }
          }
          
        }
        
        console.log(verticesCompletos);

        let datosXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                          <Proyecto>
                            <Nombre>XML</Nombre>
                            <Calculista>IGAC</Calculista>
                            <Versión>1.0 BETA</Versión>`
                          ;

        datosXml += `<Puntos_Calculados>
                        <Punto Nombre="T-2258">
                        </Punto>          
                    </Puntos_Calculados>`;

        datosXml += `</Proyecto>`;


        // ======== DESCARGAR XML =========
        var blob = new Blob([datosXml], {
          type: 'text/xml'
        });
    
        var link = document.createElement("a");    
        link.href = window.URL.createObjectURL(blob);        
        // link.download = archivoPlano.name.replace("20","14");
        link.download = "xml";
        document.body.appendChild(link);
        link.click();

        // ======== FIN =========
        
        //document.getElementById('tablaEntrada').innerHTML = datosTabla;
    
});




document.querySelector('#descargar').addEventListener('click', function(e) {
  descargarItrf2014('hollaaaa');
} );






document.querySelector('#cargarTexto').addEventListener('change', (e) => {      


  if(e.target.files.length)  {
    document.getElementById('icono-archivo').className = 'bi bi-file-check-fill';
    document.getElementById('texto-archivo').innerText = `${e.target.files[0].name}`;  
    cambiosVisualesCarga(e);
  }

  
  let arregloVerticesOndulacion = [];
  localStorage.setItem('verticesOndula', JSON.stringify(arregloVerticesOndulacion));

  let archivoPlano = document.querySelector('#cargarTexto').files[0];   
  
  
  let reader = new FileReader();
  reader.onload = async (e) => {      
    
    
    
    
    let vertices = e.target.result.split('\n');
    
    let verticesArray = [];
    for(let i=3; i < vertices.length; i++) {
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

    
    // ====== BUSCAR Y AGREGAR LA ONDULACIÓN =========
    let verticeConOndulacion = [];
    
 
    for(let vertice of result){
      // console.log(vertice)
      if(vertice.ondula === undefined){
        const lat = vertice.lat;
        const lon = vertice.long;

        try {
          const resultado = await fetch('./../json/ondulacion.json');
          const arregloOndula = await resultado.json();
          for(let i of arregloOndula){
            if((lat <= (i.lat+0.033) && lat >= (i.lat-0.0033)) && lon <= (i.lon+0.033) && lon >= (i.lon-0.0033)){
                //console.log(i)
                verticeConOndulacion.push({
                  nombre: vertice.nombre, lat: vertice.lat, long: vertice.long, x:vertice.x, y:vertice.y, z:vertice.z,
                  tipo: vertice.tipo, ondula: i.alt
                });
            }                    
        }

        } catch (error) {
          console.log('error', error);
        }

      }else{
        verticeConOndulacion.push({
          nombre: vertice.nombre, lat: vertice.lat, long: vertice.long, x:vertice.x, y:vertice.y, z:vertice.z,
          tipo: vertice.tipo, ondula: vertice.ondula, velx: vertice.velx, vely: vertice.vely, velz: vertice.velz
        });
      }
      
    }

    // ====== FIN =========



    //console.log('verticeConOndulacion', verticeConOndulacion);

    let verticeConOndulacionClean = [];
    
    for(let resul of result){
      for(let vertice of verticeConOndulacion){
        if(resul.nombre === vertice.nombre){
          verticeConOndulacionClean.push(vertice);
          break;
        }
      }
    }
    console.log(verticeConOndulacionClean)
    


    //let arre = JSON.parse( localStorage.getItem('verticesOndula'))            
    //arre.push(obj)
    localStorage.setItem('verticesOndula', JSON.stringify(verticeConOndulacionClean));

    // ====== OBTENER EL PROMEDIO DE LOS VERTICES =========
    let promedio = {latitude:0, longitude:0};
    let contador = 0;
    for(let vertice of verticeConOndulacionClean){
     
      if(vertice.tipo != 'CTRL'){
        promedio.latitude += parseFloat( vertice.lat );
        promedio.longitude += parseFloat( vertice.long );      
        contador++;
      }
    }
    promedio.latitude = promedio.latitude / contador;
    promedio.longitude = promedio.longitude / contador;  
    

    // ====== FIN =========

    

    cargarMapa(promedio.longitude, promedio.latitude);

    // document.querySelector('#btnCargarExcel').disabled = false;
    // console.log('respuesta el servidor');    
    // document.querySelector('#btnCargarExcel').innerHTML = `Cargar`;
    
    
    
        
    };
    reader.readAsText(archivoPlano);
    
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
            //console.log("entro: " + element);
            
            for(let elemento of e.target.result.split("</tr>")){
              
              if(elemento.indexOf("Alt Elip.:") !== -1){
                console.log(elemento.split("</td>")[3].substring(4,14));
                obj.altelips = elemento.split("</td>")[3].substring(4,13); 
               }

              if(elemento.indexOf("Intervalo de observación:") !== -1){
                //console.log("entro: " + elemento);
                const fecha = elemento.substring(85, 96);
                const ano = fecha.substring(6,10);
                const mes = fecha.substring(3,5);
                const dia = fecha.substring(0,2);
          
    
                
                var fechaEjemplo = new Date(ano, mes-1, dia);
                var diaDelAno = calcularDiaDelAno(fechaEjemplo);
          
                let anoEpoca = parseInt(ano) + (diaDelAno/365);
          
                obj.anoEpoca = anoEpoca;   
                
                break;
               }                
                
            }

            let arre = JSON.parse( localStorage.getItem('anosPorHtml') )            
                arre.push(obj)
                localStorage.setItem('anosPorHtml', JSON.stringify(arre));
            
            break;
            
            
          }

          if(element.indexOf("Hora Inicio - Hora Fin:") !== -1){  
            
            for(let elemento of e.target.result.split("</tr>")){

              if(elemento.indexOf("Hora Inicio - Hora Fin:") !== -1){  
                const fecha = elemento.substring(90, 100);
            
                const ano = fecha.substring(6,10);
                const mes = fecha.substring(3,5);
                const dia = fecha.substring(0,2);
                
                

                
                var fechaEjemplo = new Date(ano, mes-1, dia);
                var diaDelAno = calcularDiaDelAno(fechaEjemplo);
                
                let anoEpoca = parseInt(ano) + (diaDelAno/365);
                
                obj.anoEpoca = anoEpoca;     
                
                // console.log('anoEpoca', obj.anoEpoca);

                
              }

                  //          console.log(element);
              if(elemento.indexOf("Altura Elip WGS84:") !== -1){ 
                // console.log(elemento.split("<td>"));
                obj.altelips = elemento.substring(77, 85);  
              }

              
              
            }
            
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
    cambiosVisualesCarga2(ev);
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
      url: "https://mapas.igac.gov.co/server/rest/services/geodesia/redpasiva/MapServer/",
          sublayers: [
            {
              id: 0,
               visible: true,
              //  definitionExpression: "es_pasiva_gnss=0",
               popupTemplate: {
                   //title: "Atributos",
                   outFields: ["*"],
                   content:  [
                    {
                      "type": "fields",
                      "fieldInfos": [
                        {
                          "fieldName": "OBJECTID",
                          "label": "OBJECTID"
                        },
                        {
                          "fieldName": "SHAPE",
                          "label": "SHAPE"
                        },    
                        {
                          "fieldName": "Nomenc",
                          "label": "Nomenclatura"
                        }, 
                        {
                          "fieldName": "Lat",
                          "label": "Latitud"
                        }, 
                        {
                          "fieldName": "Long",
                          "label": "Longitud"
                        }, 
                        {
                          "fieldName": "AltElips",
                          "label": "Altura Elipsoidal"
                        }, 
                        {
                          "fieldName": "CoordX",
                          "label": "Coordenada X"
                        },    
                        {
                          "fieldName": "CoordY",
                          "label": "Coordenada Y"
                        },
                        {
                          "fieldName": "CoordZ",
                          "label": "Coordenada Z"
                        },
                        {
                          "fieldName": "VelX",
                          "label": "Velocidad X"
                        },
                        {
                          "fieldName": "VelY",
                          "label": "Velocidad Y"
                        },
                        {
                          "fieldName": "VelZ",
                          "label": "Velocidad Z"
                        },
                        {
                          "fieldName": "Ondula",
                          "label": "Ondulación"
                        },
                        {
                          "fieldName": "ConcMpio",
                          "label": "Código Municipio"
                        },        
                        {
                          "fieldName": "NomMpio",
                          "label": "Nombre Municipio"
                        },
                        {
                          "fieldName": "NomDpto",
                          "label": "Nombre Departamento"
                        },
                        {
                          "fieldName": "EstPunto",
                          "label": "Estado Punto"
                        },
                        {
                          "fieldName": "DatITRFRef",
                          "label": "Datum / ITRF / Epoca Referencia"
                        },
                        {
                          "fieldName": "Obs",
                          "label": "Observación"
                        }, 
                        {
                          "fieldName": "Tipo_Mat",
                          "label": "Tipo materialización"
                        }, 
                        {
                          "fieldName": "Fech_Mat",
                          "label": "Fecha materilización"
                        }
                      ]
                    }
                  ]               
                
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
  if(e.target.tagName === 'TD' && e.target.parentNode.firstChild.textContent === 'Nomenclatura' ){        
      console.log(e.target.tagName, e.target.textContent, e.target.parentNode.firstChild)        
  }
});

