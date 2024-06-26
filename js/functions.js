

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


function eliminarEspacios(linea) {
  let arreglo = [];
  let palabra = "";
  let estado = true;
  for (let letra of linea) {
    if (letra == ' ') {
      if (estado) {
        arreglo.push(palabra);
        palabra = '';
      }
      estado = false;
    } else {
      palabra += letra;
      estado = true;
    }
  }



  let objeto = {
    nombre: arreglo[0].substring(2, arreglo[0].length),
    x: arreglo[1],
    y: arreglo[2],
    z: arreglo[3],
    tipo: arreglo[4]
  }


  return objeto;
}


function eliminarEspacios2(linea) {
  let p = linea.split();
  let o = p[0].split(' ');
  let arreglo3 = [];



  for (let i of o) {
    arreglo3 = arreglo3.concat(i.split('\t'));
  }


  let latDd = dmsToDd(arreglo3[2], arreglo3[3], arreglo3[4], arreglo3[5]);
  let lonDd = dmsToDd(arreglo3[6], arreglo3[7], arreglo3[8], arreglo3[9]);

  // Radio de la Tierra en metros
  let R = 6371000;

  let altWithComa = arreglo3[10].split('\r')[0]
  let alt = parseFloat(altWithComa.replace(',', '.'));  // Altura en metros


  // Convertir coordenadas geodésicas a cartesianas
  let x = (R + alt) * Math.cos(degreesToRadians(latDd)) * Math.cos(degreesToRadians(lonDd));
  let y = (R + alt) * Math.cos(degreesToRadians(latDd)) * Math.sin(degreesToRadians(lonDd));
  let z = (R + alt) * Math.sin(degreesToRadians(latDd));


  let tipo = '';
  if (arreglo3[1] === 'Control') {
    tipo = 'CTRL';
  }
  if (arreglo3[1] === 'Averaged') {
    tipo = 'MEAN';
  }

  let objeto = {
    nombre: arreglo3[0],
    x: x,
    y: y,
    z: z,
    tipo: tipo
  }

  return objeto;
}

function eliminarEspacios3(linea) {

  let arreglo = linea.split('\t');

  let tipo = '';
  if (arreglo[4].split('\r')[0] === 'Control') {
    tipo = 'CTRL';
  }
  if (arreglo[4].split('\r')[0] === 'Averaged') {
    tipo = 'MEAN';
  }

  let objeto = {
    nombre: arreglo[0],
    x: arreglo[1],
    y: arreglo[2],
    z: arreglo[3],
    tipo: tipo
  }

  return objeto;
}




// Función para convertir coordenadas de grados, minutos, segundos a grados decimales
function dmsToDd(degrees, minutes, seconds, direction) {
  let dd = parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / (60 * 60);
  if (direction === 'S' || direction === 'O') {
    dd *= -1;
  }
  return dd;
}



// Función para convertir grados a radianes
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}


// Función para buscar la fecha de una coordenada
function buscarAnoDeCoordenada(coordenada, logsArray) {

  for (let i = 0; i < logsArray.length; i++) {
    if (logsArray[i].name.indexOf(coordenada.nombre) !== -1) {
      return logsArray[i].anoEpoca;
    }
  }

}

function espacioEstasdar(cadena) {

  for (let i = cadena.length; i < 6; i++) {
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
    for (let i = 3; i < vertices.length; i++) {

      if (vertices[i].length > 0) {
        verticesArray.push(eliminarEspacios(vertices[i]));
      }
    }

    let datosTabla = `${vertices[0]}\n${vertices[1]}\n${vertices[2]}\n`;

    for (let coordenadas of verticesArray) {

      if (coordenadas.tipo != 'CTRL') {
        let coordenadaAjustada = convertirCoordenadasITRF2020aITRF2014(coordenadas.x, coordenadas.y, coordenadas.z);

        datosTabla += `@#${coordenadas.nombre} \t ${coordenadaAjustada[0].toFixed(5)} \t ${coordenadaAjustada[1].toFixed(5)} \t ${coordenadaAjustada[2].toFixed(5)} \t ${coordenadas.tipo} \n`;

      } else {
        let nombreAjustado = espacioEstasdar(coordenadas.nombre);
        datosTabla += `@#${nombreAjustado} \t  ${coordenadas.x} \t  ${coordenadas.y} \t  ${coordenadas.z} \t ${coordenadas.tipo} \n`;
      }
    }


    var blob = new Blob([datosTabla], {
      type: 'text/txt'
    });

    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = archivoPlano.name.replace("20", "14");
    document.body.appendChild(link);
    link.click();
  };
  reader.readAsText(archivoPlano);





}

const mostrarMensaje = (mensaje, tipo) => {

  toastr.options = {
    "closeButton": true,
    "progressBar": true,
    // "positionClass":"toast-bottom-left"
  };

  if (tipo === 'success') {
    toastr.success("Hola, bienvenido al sistema!", "Sistema Web");
  } else if (tipo === 'info') {
    toastr.clear();
    toastr.info(mensaje);
  } else if (tipo === 'warning') {
    toastr.clear();
    toastr.warning(mensaje);
  }

}



function calculoPorTabular(verticesCompletos, baseVertNomen, baseVertAlt, baseVertondula, baseVertAltmsn, baseVertAltmsn2, tabla) {
  // console.log(verticesCompletos, tabla)

  let sumatoria = 0;
  let DHG_ANTERIOR_prime = 0;

  // PROMEDIO DHO
  for (const vert of verticesCompletos) {


    const DHI = parseFloat(vert.altelips) - parseFloat(baseVertAlt);
    const DNI = parseFloat(vert.ondula) - parseFloat(baseVertondula);
    const DHG = DHI - DNI;
    const DHO = DHG - DHG_ANTERIOR_prime;

    DHG_ANTERIOR_prime = DHG;
    sumatoria += DHO
  }

  let diferencia = baseVertAltmsn - baseVertAltmsn2;
  // console.log("sumatoria", sumatoria)
  // console.log("diferencia", diferencia)

  let correccion = (diferencia - sumatoria) / (verticesCompletos.length);
  // console.log("correcion", correccion)


  // Inicializar tabla resultados
  let texto = `
   <tr>
     <th scope="row">${baseVertNomen}</th>
     <td>${baseVertAlt}</td>
     <td>${baseVertondula}</td>
     <td>${baseVertAltmsn}</td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td></td>
     <td>${baseVertAltmsn}</td>         
   </tr>
   `;
  document.querySelector(`#${tabla}`).innerHTML += texto;

  let DHG_ANTERIOR = 0;
  let HGPSFINAL_ANTERIOR = baseVertAltmsn;

  // CALCULO ORTOMETRICA
  for (const vertice of verticesCompletos) {

    // console.log(vertice.altelips, vertice.ondula, baseVertAlt, baseVertondula, baseVertAltmsn, correccion)

    const DHI = parseFloat(vertice.altelips) - parseFloat(baseVertAlt);
    const DNI = parseFloat(vertice.ondula) - parseFloat(baseVertondula);
    const DHG = DHI - DNI;
    const HGP = parseFloat(baseVertAltmsn) + DHG;
    const DHO = DHG - parseFloat(DHG_ANTERIOR)
    const DHGC = DHO + parseFloat(correccion);
    const HGPSFINAL = parseFloat(HGPSFINAL_ANTERIOR) + DHGC;

    DHG_ANTERIOR = DHG;
    HGPSFINAL_ANTERIOR = HGPSFINAL;

    // console.log(DHI, DNI, DHG, HGP, DHO, DHGC, HGPSFINAL)   

    tabular({ DHI, DNI, DHG, HGP, DHO, DHGC, HGPSFINAL }, vertice, tabla)
  }
  // ============ Fin calculos par tabular3 =========
}



function tabularDiferencias() {
  // Obtén la tabla
  const table1 = document.querySelector('#calculos');
  const table2 = document.querySelector('#calculos2');
  const table3 = document.querySelector('#calculos3');


  const rows1 = table1.querySelectorAll('tr');
  const rows2 = table2.querySelectorAll('tr');
  const rows3 = table3.querySelectorAll('tr');

  let listaVertices = [];

  for (let i = 0; i < rows1.length; i++) {

    const vertice = rows1[i].querySelector('th').textContent;
    const listaTdUno = rows1[i].querySelectorAll('td');
    const niveladaUno = listaTdUno[listaTdUno.length - 1].textContent;

    const listaTdDos = rows2[i].querySelectorAll('td');
    const niveladaDos = listaTdDos[listaTdDos.length - 1].textContent;

    const listaTdTres = rows3[i].querySelectorAll('td');
    const niveladaTres = listaTdTres[listaTdTres.length - 1].textContent;

    const diferenciaUno = parseFloat(niveladaUno) - parseFloat(niveladaDos)
    const diferenciaDos = parseFloat(niveladaDos) - parseFloat(niveladaTres)
    const diferenciaTres = parseFloat(niveladaUno) - parseFloat(niveladaTres)

    listaVertices.push({
      vertice,
      niveladaUno,
      niveladaDos,
      niveladaTres,
      diferenciaUno,
      diferenciaDos,
      diferenciaTres
    });




  }
  listaVertices = listaVertices.slice(1, listaVertices.length - 1);
  // console.log(listaVertices)

  let texto = '';
  for (let ver of listaVertices) {
    texto += `
    <tr>
      <th scope="row">${ver.vertice}</th>      
      <td>${ver.niveladaUno}</td>
      <td>${ver.niveladaDos}</td>
      <td>${ver.niveladaTres}</td>      
      <td>${ver.diferenciaUno}</td>
      <td>${ver.diferenciaDos}</td>
      <td>${ver.diferenciaTres}</td>
    </tr>
    `;
  }

  document.querySelector('#bodyResultados').innerHTML = texto;


}


// ====== CONVERTIR CORDENADAS GEOCENTRICAS A LAT Y LONG =========
function geocentricas_elipsoidales(xreferencia, yreferencia, zreferencia) {
  // console.log(xreferencia, yreferencia, zreferencia);
  let x = parseFloat(xreferencia);
  let y = parseFloat(yreferencia);
  let z = parseFloat(zreferencia);

  var a = 6378137.0; // Semieje mayor de la Tierra en metros
  var f = 1.0 / 298.257223563; // Factor de achatamiento
  var e2 = 2 * f - f * f; // Excentricidad al cuadrado

  var lon = Math.atan2(y, x);
  var p = Math.sqrt(x * x + y * y);
  var lat = Math.atan2(z, p * (1 - e2));
  var v = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));

  var latDec = lat * 180 / Math.PI;
  var lonDec = lon * 180 / Math.PI;

  // console.log(latDec, lonDec);
  return { latDec, lonDec };

}
// ====== FIN =========


// Función para calcular la distancia meridiana
function meridianDistance(lat) {

  // Constantes WGS84
  const a = 6378137.0;  // Radio ecuatorial
  const f = 1 / 298.257223563;  // Aplanamiento
  const e2 = 2 * f - f * f;  // Excentricidad al cuadrado


  const e4 = e2 * e2;
  const e6 = e4 * e2;
  return a * (
    (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * lat
    - (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * lat)
    + (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * lat)
    - (35 * e6 / 3072) * Math.sin(6 * lat)
  );
}


// Función para transformar coordenadas
function transformarAOrigenNac(lat, lon) {

  // Definir constantes de la proyección
  const lat_0 = 4.0 * (Math.PI / 180);  // Convertir grados a radianes
  const lon_0 = -73.0 * (Math.PI / 180); // Convertir grados a radianes
  const false_northing = 2000000;
  const false_easting = 5000000;
  const k0 = 0.9992;
  // Constantes WGS84
  const a = 6378137.0;  // Radio ecuatorial
  const f = 1 / 298.257223563;  // Aplanamiento
  const e2 = 2 * f - f * f;  // Excentricidad al cuadrado


  // Convertir latitud y longitud a radianes
  lat = lat * (Math.PI / 180);
  lon = lon * (Math.PI / 180);
  // Cálculo de coordenadas en la proyección Transverse Mercator
  const N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
  const T = Math.tan(lat) * Math.tan(lat);
  const C = e2 * Math.cos(lat) * Math.cos(lat) / (1 - e2);
  const A = (lon - lon_0) * Math.cos(lat);
  const M = meridianDistance(lat);
  const M0 = meridianDistance(lat_0);  // Distancia meridiana del origen
  const x = false_easting + k0 * N * (A + (1 - T + C) * Math.pow(A, 3) / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e2) * Math.pow(A, 5) / 120);
  const y = false_northing + k0 * (M - M0 + N * Math.tan(lat) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 + (61 - 58 * T + T * T + 600 * C - 330 * e2) * Math.pow(A, 6) / 720));
  return { x, y };
}



// Función para transformar coordenadas
function gaussKrugger(lat, lon) {

    // Constantes WGS84
    const a = 6378137.0;  // Radio ecuatorial
    const f = 1 / 298.257223563;  // Aplanamiento
    const e2 = 2 * f - f * f;  // Excentricidad al cuadrado
 
  // Convertir latitud y longitud a radianes
  lat = lat * (Math.PI / 180);
  lon = lon * (Math.PI / 180);
  // Identificar el origen adecuado
  const origin = identifyOrigin(lon * (180 / Math.PI));
  // Cálculo de coordenadas en la proyección Transverse Mercator
  const N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
  const T = Math.tan(lat) * Math.tan(lat);
  const C = e2 * Math.cos(lat) * Math.cos(lat) / (1 - e2);
  const A = (lon - origin.lon_0) * Math.cos(lat);
  const M = meridianDistance(lat);
  const M0 = meridianDistance(origin.lat_0);  // Distancia meridiana del origen
  const x = origin.false_easting + origin.k0 * N * (A + (1 - T + C) * Math.pow(A, 3) / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e2) * Math.pow(A, 5) / 120);
  const y = origin.false_northing + origin.k0 * (M - M0 + N * Math.tan(lat) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 + (61 - 58 * T + T * T + 600 * C - 330 * e2) * Math.pow(A, 6) / 720));
  // console.log('Origen identificado: ' + origin.name);
  const originName = origin.name;
  return {x, y, originName};
}

// Definir los parámetros de los orígenes de Gauss-Krüger en Colombia
const origins = [
  {
      name: "Central-MAGNA",
      lat_0: 4.59620041667 * (Math.PI / 180), // Convertir grados a radianes
      lon_0: -74.07750791667 * (Math.PI / 180), // Convertir grados a radianes
      false_northing: 1000000,
      false_easting: 1000000,
      k0: 1.0
  },
  {
      name: "Este-MAGNA",
      lat_0: 4.59620041667 * (Math.PI / 180), // Convertir grados a radianes
      lon_0: -71.07750791667 * (Math.PI / 180), // Convertir grados a radianes
      false_northing: 1000000,
      false_easting: 1000000,
      k0: 1.0
  },
  {
      name: "Este Este - MAGNA",
      lat_0: 4.596200417 * (Math.PI / 180), // Convertir grados a radianes
      lon_0: -68.07750791667 * (Math.PI / 180), // Convertir grados a radianes
      false_northing: 1000000,
      false_easting: 1000000,
      k0: 1.0
  },
  {
      name: "Oeste - MAGNA",
      lat_0: 4.59620041667 * (Math.PI / 180), // Convertir grados a radianes
      lon_0: -77.07750791667 * (Math.PI / 180), // Convertir grados a radianes
      false_northing: 1000000,
      false_easting: 1000000,
      k0: 1.0
  },
  {
      name: "Oeste Oeste - MAGNA",
      lat_0: 4.59620041667 * (Math.PI / 180), // Convertir grados a radianes
      lon_0: -80.07750791667 * (Math.PI / 180), // Convertir grados a radianes
      false_northing: 1000000,
      false_easting: 1000000,
      k0: 1.0
  }
];

// Función para identificar el origen adecuado basado en la longitud
function identifyOrigin(lon) {
  if (lon >= -75 && lon < -71) {
      return origins[0]; // Bogotá-MAGNA
  } else if (lon >= -71 && lon < -68) {
      return origins[1]; // Este Central - MAGNA
  } else if (lon >= -68 && lon < -65) {
      return origins[2]; // Este Este - MAGNA
  } else if (lon >= -77 && lon < -75) {
      return origins[3]; // Oeste - MAGNA
  } else if (lon >= -80 && lon < -77) {
      return origins[4]; // Oeste Oeste - MAGNA
  } else {
      throw new Error("Longitud fuera del rango de los orígenes definidos.");
  }
}

function tipoPunto(duracion){
  
  if(duracion !== undefined){

    let tiempo = duracion.substring(0, 2);
    tiempo = parseInt(tiempo);

    if(tiempo < 5){
      return "Fotocontrol";
    }else if(tiempo >= 5 && tiempo <= 6){
      return "Auxiliar";
    }else {
      return "Geodésico";
    }    

  }else {
    return "";
  }
}



