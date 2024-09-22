

function calcularDiaDelAno(fecha) {
  var inicioAño = new Date(fecha.getFullYear(), 0, 0);
  var tiempoTranscurrido = fecha - inicioAño;

  var milisegundosEnUnDía = 24 * 60 * 60 * 1000;

  var diaDelAño = Math.floor(tiempoTranscurrido / milisegundosEnUnDía);
  return diaDelAño;
}

function convertirCoordenadasITRF2020aITRF2014(x, y, z) {
  // Parámetros de transformación
  const T1 = -0.0014;
  const T2 = -0.0014;
  const T3 = 0.0024;
  const D = -4.2e-10;  // Ajuste del factor D a positivo
  const R1 = 0;
  const R2 = 0;
  const R3 = 0;

  // Matriz de rotación y escala
  const C = [
    [D, -R3, R2],
    [R3, D, -R1],
    [-R2, R1, D]
  ];

  // Vector original
  const d = [parseFloat(x), parseFloat(y), parseFloat(z)];

  // Producto de la matriz C y el vector d
  const Cd = [
    C[0][0] * d[0] + C[0][1] * d[1] + C[0][2] * d[2],
    C[1][0] * d[0] + C[1][1] * d[1] + C[1][2] * d[2],
    C[2][0] * d[0] + C[2][1] * d[1] + C[2][2] * d[2]
  ];

  // Vector de traslación
  const T = [T1, T2, T3];

  // Ajuste final
  const xITRF2014 = parseFloat((d[0] + T[0] + Cd[0]).toFixed(4));
  const yITRF2014 = parseFloat((d[1] + T[1] + Cd[1]).toFixed(4));
  const zITRF2014 = parseFloat((d[2] + T[2] + Cd[2]).toFixed(4));

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


  // console.log(arreglo[1], arreglo[2], arreglo[3])
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

  // console.log(x, y ,z)
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

function eliminarEspacios4(linea) {

  let arreglo = linea.split('\t');


  let tipo = '';
  if (arreglo[1] === 'Control') {
    tipo = 'CTRL';
  }
  if (arreglo[1] === 'Averaged') {
    tipo = 'MEAN';
  }

  let objeto = {
    nombre: arreglo[0],
    x: arreglo[2],
    y: arreglo[3],
    z: arreglo[4].split('\r')[0],
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
function buscarAnoDeCoordenada(coordenadas, logsArray) {
  let coincidencias = [];  // Arreglo para almacenar todas las coincidencias

  for (let i = 0; i < logsArray.length; i++) {
    if (coordenadas.nombre === logsArray[i].name.split(' - ').pop().split('.')[0].trim()) {
      coincidencias.push(logsArray[i].anoEpoca);  // Agregar cada anoEpoca al arreglo de coincidencias
    }
  }

  return coincidencias;
  // Devolver todos los anosEpoca encontrados
}
function espacioEstasdar(cadena) {

  for (let i = cadena.length; i < 6; i++) {
    cadena += ' ';
  }
  return cadena;
}

// ======== DESCARGAR ITRF 2014 =================
// ==============================================

const descargarItrf2014 = async () => {

  let archivoPlano = document.querySelector('#cargarTexto').files[0];


  if (!archivoPlano) {
    return mostrarMensaje('Cargue archivo de texto', 'warning');
  }



  let reader = new FileReader();
  reader.onload = (e) => {


    let verticesArray = [];
    let vertices = e.target.result.split('\n');
    let tipo = "";

    if (e.target.result[0] === '@') {
      // ITRF.asc
      console.log("ITRF.asc")
      tipo = 'asc';
      for (let i = 3; i < vertices.length; i++) {
        if (vertices[i].length > 0) {
          verticesArray.push(eliminarEspacios(vertices[i]));
        }
      }

    } else {

      if (vertices[0].includes("Latitud")) {
        // GEO.txt
        tipo = 'geo';
        console.log("GEO.txt")
        for (let i = 1; i < vertices.length; i++) {
          if (vertices[i].length > 0) {
            verticesArray.push(eliminarEspacios2(vertices[i]));
          }
        }

      } else {
        if (vertices[0].split('\t')[1] === "Clase de Punto") {
          // CAR2.txt
          console.log("CAR.txt 2")
          tipo = "car2";
          for (let i = 1; i < vertices.length; i++) {
            if (vertices[i].length > 0) {
              verticesArray.push(eliminarEspacios4(vertices[i]));
            }
          }



        } else {
          // CAR.txt
          console.log("CAR.txt 1")
          tipo = "car";
          for (let i = 1; i < vertices.length; i++) {
            if (vertices[i].length > 0) {
              verticesArray.push(eliminarEspacios3(vertices[i]));
            }
          }

        }

      }

    }

    //========== Orginizar txt según tipo ===========
    let datosTabla = "";
    if (tipo === 'car2') {
      const titulos = vertices[0].split('\t');
      datosTabla += `${titulos[0]}\t${titulos[2]}\t${titulos[3]}\t${titulos[4].split('\r')[0]}\t${titulos[1]}\n`;
    }
    if (tipo === 'car') {
      datosTabla += `${vertices[0]}\n`;
    }
    if (tipo === 'asc') {
      datosTabla += `${vertices[0]}\n${vertices[1]}\n${vertices[2]}\n`;
    }
    if (tipo === 'geo') {
      const titulos = vertices[0].split('\t');
      datosTabla += `${titulos[0]} \t WGS84 X \t WGS84 Y \t WGS84 Z \t ${titulos[1]}\n`;

    }



    //========== Fin Orginizar txt según tipo ===========



    //========== Escribir archivo ===========

    for (let coordenadas of verticesArray) {

      if (coordenadas.tipo != 'CTRL') {
        let coordenadaAjustada = convertirCoordenadasITRF2020aITRF2014(coordenadas.x, coordenadas.y, coordenadas.z);

        datosTabla += `@#${coordenadas.nombre} \t ${coordenadaAjustada[0].toFixed(5)} \t ${coordenadaAjustada[1].toFixed(5)}   ${coordenadaAjustada[2].toFixed(5)} \t ${coordenadas.tipo} \n`;

      } else {
        let nombreAjustado = espacioEstasdar(coordenadas.nombre);
        datosTabla += `@#${nombreAjustado} \t  ${parseFloat(coordenadas.x).toFixed(5)} ${parseFloat(coordenadas.y).toFixed(5)} \t  ${parseFloat(coordenadas.z).toFixed(5)} \t ${coordenadas.tipo} \n`;
      }
    }

    //========== Fin Escribir archivo ===========


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

  // console.log(verticesCompletos, baseVertAlt, baseVertAltmsn, baseVertAltmsn2);
  let sumatoria = 0;
  let DHG_ANTERIOR_prime = 0;
  // Crear un conjunto para rastrear los identificadores de CA ya procesados
  let nombresProcesados1 = new Set();  // Aquí está la corrección

  // PROMEDIO DHO
  for (const vert of verticesCompletos) {
    let nombreBase = vert.nombre.split('-').slice(1).join('-').trim();

    if (nombresProcesados1.has(nombreBase)) {
      continue; // Saltar este v
    }
    nombresProcesados1.add(nombreBase);
    // Realizar el cálculo para el vértice actual

    const DHI = parseFloat(vert.altelips) - parseFloat(baseVertAlt);
    const DNI = parseFloat(vert.ondula) - parseFloat(baseVertondula);
    const DHG = DHI - DNI;
    const DHO = DHG - DHG_ANTERIOR_prime;

    DHG_ANTERIOR_prime = DHG;
    sumatoria += DHO;


  }

  let diferencia = baseVertAltmsn2 - baseVertAltmsn;


  let correccion = (diferencia - sumatoria) / ((verticesCompletos.length / 2) + 0.5);


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
  let nombresProcesados = new Set();  // Aquí está la corrección
  const HGPSFINALArray = [];

  // CALCULO ORTOMETRICA
  for (const vertice of verticesCompletos) {
    // console.log(vertice)
    let nombreBase = vertice.nombre.split('-').slice(1).join('-').trim();

    if (nombresProcesados.has(nombreBase)) {
      continue; // Saltar este vértice si ya ha sido procesado
    }

    nombresProcesados.add(nombreBase);
    let DHI;
    if (vertice.hReferencia) {
      console.log(vertice.hReferencia, "hreferencia");
      DHI = parseFloat(vertice.hReferencia) - parseFloat(baseVertAlt);
    } else {
      // console.log(vertice.hReferencia, "hreferencia else");
      DHI = parseFloat(vertice.altelips) - parseFloat(baseVertAlt);
    }
    const DNI = parseFloat(vertice.ondula) - parseFloat(baseVertondula);
    const DHG = DHI - DNI;
    const HGP = parseFloat(baseVertAltmsn) + DHG;
    const DHO = DHG - parseFloat(DHG_ANTERIOR)
    const DHGC = DHO + parseFloat(correccion);
    const HGPSFINAL = parseFloat(HGPSFINAL_ANTERIOR) + DHGC;

    HGPSFINALArray.push(HGPSFINAL);

    DHG_ANTERIOR = DHG;
    HGPSFINAL_ANTERIOR = HGPSFINAL;



    tabular({ DHI, DNI, DHG, HGP, DHO, DHGC, HGPSFINAL }, vertice, tabla)
  }
  // ============ Fin calculos par tabular3 =========
  return HGPSFINALArray;
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

  let x = parseFloat(xreferencia);
  let y = parseFloat(yreferencia);
  let z = parseFloat(zreferencia);

  var a = 6378137.0; // Semieje mayor de la Tierra en metros
  var f = 1.0 / 298.257223563; // Factor de achatamiento
  var e2 = 2 * f - f * f; // Excentricidad al cuadrado
  var lon = Math.atan2(y, x);
  var latPrev = 0;
  var iterations = 0;
  var tolerance = 1e-12;
  var p = Math.sqrt(x * x + y * y);
  console.log("p", p)
  var lat = Math.atan2(z, p * (1 - e2));
  


  // Iterar hasta que la diferencia entre latitudes sucesivas sea menor que la tolerancia
  while (Math.abs(lat - latPrev) > tolerance && iterations < 1000) {
    latPrev = lat;
    var N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));    
    lat = Math.atan2(z + e2 * N * Math.sin(lat), p);
    iterations++;
  }
  console.log("N", N)
  console.log("lat", lat)
  var N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
  console.log("p / Math.cos(lat) - N", p, lat, N)
  var HDEC = p / Math.cos(lat) - N;
  console.log("HDEC", HDEC)  
  var latDec = lat * 180 / Math.PI;
  var lonDec = lon * 180 / Math.PI;
  const formattedlatDec = parseFloat(latDec.toFixed(9));
  const formattedlonDec = parseFloat(lonDec.toFixed(9));
  const formattedHDEC = parseFloat(HDEC.toFixed(5));
  const n = N;
  const u = p;
  
  return { latDec: formattedlatDec, lonDec: formattedlonDec, hReferencia: formattedHDEC }
}
// ====== FIN =========


// Función para calcular la distancia meridiana
function meridianDistance(latDec) {

  // Constantes WGS84
  const a = 6378137.0;  // Radio ecuatorial
  const f = 1 / 298.257223563;  // Aplanamiento
  const e2 = 2 * f - f * f;  // Excentricidad al cuadrado


  const e4 = e2 * e2;
  const e6 = e4 * e2;
  return a * (
    (1 - e2 / 4 - 3 * e4 / 64 - 5 * e6 / 256) * latDec
    - (3 * e2 / 8 + 3 * e4 / 32 + 45 * e6 / 1024) * Math.sin(2 * latDec)
    + (15 * e4 / 256 + 45 * e6 / 1024) * Math.sin(4 * latDec)
    - (35 * e6 / 3072) * Math.sin(6 * latDec)
  );
}


// Función para transformar coordenadas
function transformarAOrigenNac(latDec, lonDec) {

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
  latDec *= (Math.PI / 180);
  lonDec *= (Math.PI / 180);
  // Cálculo de coordenadas en la proyección Transverse Mercator
  const N = a / Math.sqrt(1 - e2 * Math.sin(latDec) * Math.sin(latDec));
  const T = Math.tan(latDec) * Math.tan(latDec);
  const C = e2 * Math.cos(latDec) * Math.cos(latDec) / (1 - e2);
  const A = (lonDec - lon_0) * Math.cos(latDec);
  const M = meridianDistance(latDec);
  const M0 = meridianDistance(lat_0);  // Distancia meridiana del origen
  const x = false_easting + k0 * N * (A + (1 - T + C) * Math.pow(A, 3) / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e2) * Math.pow(A, 5) / 120);
  const y = false_northing + k0 * (M - M0 + N * Math.tan(latDec) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 + (61 - 58 * T + T * T + 600 * C - 330 * e2) * Math.pow(A, 6) / 720));
  const formattedX = parseFloat(x.toFixed(3));
  const formattedY = parseFloat(y.toFixed(3));



  // Devolver el objeto con x y y formateados
  return { x: formattedX, y: formattedY }
}




// Función para transformar coordenadas
function gaussKrugger(latDec, lonDec) {
  // console.log(latDec, lonDec);
  // Constantes WGS84
  const a = 6378137.0;  // Radio ecuatorial
  const f = 1 / 298.257223563;  // Aplanamiento
  const e2 = 2 * f - f * f;  // Excentricidad al cuadrado

  // Convertir latitud y longitud a radianes
  latDec *= (Math.PI / 180);
  lonDec *= (Math.PI / 180);
  // Identificar el origen adecuado
  const origin = identifyOrigin(lonDec);
  // Cálculo de coordenadas en la proyección Transverse Mercator
  const N = a / Math.sqrt(1 - e2 * Math.sin(latDec) * Math.sin(latDec));
  const T = Math.tan(latDec) * Math.tan(latDec);
  const C = e2 * Math.cos(latDec) * Math.cos(latDec) / (1 - e2);
  const A = (lonDec - origin.lon_0) * Math.cos(latDec);
  const M = meridianDistance(latDec);
  const M0 = meridianDistance(origin.lat_0);  // Distancia meridiana del origen
  const x = origin.false_easting + origin.k0 * N * (A + (1 - T + C) * Math.pow(A, 3) / 6 + (5 - 18 * T + T * T + 72 * C - 58 * e2) * Math.pow(A, 5) / 120);
  const y = origin.false_northing + origin.k0 * (M - M0 + N * Math.tan(latDec) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24 + (61 - 58 * T + T * T + 600 * C - 330 * e2) * Math.pow(A, 6) / 720));

  const originName = origin.name;
  return { x, y, originName };
}

// Definir los parámetros de los orígenes de Gauss-Krüger en Colombia
const origins = [
  {
    name: "Central-MAGNA",
    lat_0: 4.5962004167 * (Math.PI / 180), // Convertir grados a radianes
    lon_0: -74.0775079167 * (Math.PI / 180), // Convertir grados a radianes
    false_northing: 1000000,
    false_easting: 1000000,
    k0: 1.0
  },
  {
    name: "Este - MAGNA",
    lat_0: 4.5962004167 * (Math.PI / 180), // Convertir grados a radianes
    lon_0: -71.0775079167 * (Math.PI / 180), // Convertir grados a radianes
    false_northing: 1000000,
    false_easting: 1000000,
    k0: 1.0
  },
  {
    name: "Este-Este - MAGNA",
    lat_0: 4.5962004167 * (Math.PI / 180), // Convertir grados a radianes
    lon_0: -68.0775079167 * (Math.PI / 180), // Convertir grados a radianes
    false_northing: 1000000,
    false_easting: 1000000,
    k0: 1.0
  },
  {
    name: "Oeste - MAGNA",
    lat_0: 4.5962004167 * (Math.PI / 180), // Convertir grados a radianes
    lon_0: -77.0775079167 * (Math.PI / 180), // Convertir grados a radianes
    false_northing: 1000000,
    false_easting: 1000000,
    k0: 1.0
  },
  {
    name: "Oeste Oeste - MAGNA",
    lat_0: 4.5962004167 * (Math.PI / 180), // Convertir grados a radianes
    lon_0: -80.0775079167 * (Math.PI / 180), // Convertir grados a radianes
    false_northing: 1000000,
    false_easting: 1000000,
    k0: 1.0
  }
];

// Función para identificar el origen adecuado basado en la longitud

function identifyOrigin(lonDec) {
  // console.log("Valor de longitud recibido:", lonDec);

  // Convertir la longitud de grados a radianes
  const lonRad = lonDec;
  // console.log("Longitud en radianes:", lonRad);

  // Mostrar el resultado de la conversión de todos los límites de los rangos a radianes
  const radOesteOeste = -81.575283333 * (Math.PI / 180);
  const radOeste = -78.575283333 * (Math.PI / 180);
  const radCentral = -75.575283333 * (Math.PI / 180);
  const radEste = -72.575283333 * (Math.PI / 180);
  const radEsteEste = -69.575283333 * (Math.PI / 180);



  if (lonRad > radOesteOeste && lonRad <= radOeste) {

    return origins[4]; // Oeste-Oeste MAGNA
  } else if (lonRad > radOeste && lonRad <= radCentral) {

    return origins[3]; // Oeste MAGNA
  } else if (lonRad > radCentral && lonRad <= radEste) {

    return origins[0]; // Central MAGNA
  } else if (lonRad > radEste && lonRad <= radEsteEste) {

    return origins[1]; // Este MAGNA
  } else if (lonRad > radEsteEste && lonRad <= (-66.575283333 * (Math.PI / 180))) {

    return origins[2]; // Este-Este MAGNA
  } else {
    console.error("Error: Longitud fuera del rango de los orígenes definidos.");
    throw new Error("Longitud fuera del rango de los orígenes definidos.");
  }
}


function tipoPunto(duracion) {

  if (duracion !== undefined) {

    let tiempo = duracion.substring(0, 2);
    tiempo = parseInt(tiempo);

    if (tiempo < 5) {
      return "Fotocontrol";
    } else if (tiempo >= 5 && tiempo <= 6) {
      return "Auxiliar";
    } else {
      return "Geodésico";
    }

  } else {
    return "";
  }
}

function tipoPunto(duracion) {

  if (duracion !== undefined) {

    let tiempo = duracion.substring(0, 2);
    tiempo = parseInt(tiempo);

    if (tiempo < 5) {
      return "Fotocontrol";
    } else if (tiempo >= 5 && tiempo <= 6) {
      return "Auxiliar";
    } else {
      return "Geodésico";
    }

  } else {
    return "";
  }
}

// Clase para coordenadas 3D cartesiana
class Cartesian3DCoordinate {
  constructor(x, y, z) {
    this.X = x;
    this.Y = y;
    this.Z = z;
  }

  toString() {
    return `{X=${this.X} Y=${this.Y} Z=${this.Z}}`;
  }
}

// Clase para coordenadas elipsoidales
class EllipsoidalCoordinate {
  constructor(latitude, longitude, ellipsoidalHeight) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.ellipsoidalHeight = ellipsoidalHeight;
  }
}

// Clase para velocidades
class Velocities {
  constructor() {
    this.velocitySN = 0;
    this.velocityWE = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityZ = 0;
  }

  setVelocitySN(velocity) {
    this.velocitySN = velocity;
  }

  setVelocityWE(velocity) {
    this.velocityWE = velocity;
  }

  setVelocityX(velocity) {
    this.velocityX = velocity;
  }

  setVelocityY(velocity) {
    this.velocityY = velocity;
  }

  setVelocityZ(velocity) {
    this.velocityZ = velocity;
  }

  getVelocitySN() {
    return this.velocitySN;
  }

  getVelocityWE() {
    return this.velocityWE;
  }

  getVelocityX() {
    return this.velocityX;
  }

  getVelocityY() {
    return this.velocityY;
  }

  getVelocityZ() {
    return this.velocityZ;
  }
}

// Clase para leer y procesar el archivo de texto Velogrid2017.txt
// Clase para leer y procesar el archivo de texto Velogrid2017.txt
class VelocitiesReader {
  constructor(lines) {
    this.lines = lines;
  }

  getMatrix(latitude, longitude) {
    const matrix = [];

    this.lines.forEach(line => {
      const parts = line.split(';');
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (lat < latitude + 1.0 && lat > latitude - 1.0 &&
        lon < longitude + 1.0 && lon > longitude - 1.0) {
        const coordinate2 = new EllipsoidalCoordinate(lat, lon, null);
        const x = parseFloat(parts[2]);
        const y = parseFloat(parts[3]);
        const dist = calculateInverse(new EllipsoidalCoordinate(latitude, longitude, null), coordinate2)[0];
        matrix.push([x, y, dist]);
      }
    });

    return matrix;
  }
}


// Función de interpolación de distancia inversa (IDW) basada en StatisticsCalculate.java
function idwCalculate(matrix, posData) {
  let r = 0.0;
  if (matrix[0][2] === 0.0) {
    r = matrix[0][posData];
    return r;
  }
  let one = 0.0;
  let two = 0.0;
  for (let i = 0; i < matrix.length; i++) {
    let value = matrix[i][posData] / matrix[i][2];
    one += value;
    value = 1.0 / matrix[i][2];
    two += value;
  }
  r = one / two;
  return r;
}

// Clase para manejar matrices y sus operaciones
class Matrix {
  constructor(data) {
    this.data = data;
  }

  getElementAt(row, col) {
    return this.data[row][col];
  }

  getRows() {
    return this.data.length;
  }

  multiplication(matrix) {
    const result = new Array(this.data.length).fill(0).map(() => new Array(matrix.data[0].length).fill(0));
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < matrix.data[0].length; j++) {
        for (let k = 0; k < this.data[0].length; k++) {
          result[i][j] += this.data[i][k] * matrix.data[k][j];
        }
      }
    }
    return new Matrix(result);
  }

  subtraction(matrix) {
    const result = new Array(this.data.length).fill(0).map(() => new Array(this.data[0].length).fill(0));
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[0].length; j++) {
        result[i][j] = this.data[i][j] - matrix.data[i][j];
      }
    }
    return new Matrix(result);
  }

  transpose() {
    const result = new Array(this.data[0].length).fill(0).map(() => new Array(this.data.length).fill(0));
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[0].length; j++) {
        result[j][i] = this.data[i][j];
      }
    }
    return new Matrix(result);
  }

  getInverse() {
    const inverse = math.inv(this.data);  // Usando math.js
    return new Matrix(inverse);
  }

  addition(matrix) {
    const result = new Array(this.data.length).fill(0).map(() => new Array(this.data[0].length).fill(0));
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[0].length; j++) {
        result[i][j] = this.data[i][j] + matrix.data[i][j];
      }
    }
    return new Matrix(result);
  }
}

// Función para convertir a coordenadas cartesianas 3D
function cartesian3DConversion(coordinate) {
  const phi = coordinate.latitude * (Math.PI / 180); // Convertir grados a radianes
  const lambda = coordinate.longitude * (Math.PI / 180); // Convertir grados a radianes
  const h = coordinate.ellipsoidalHeight || 0.0;

  const a = 6378137.0; // Radio ecuatorial de la Tierra en metros
  const f = 1 / 298.257223563; // Aplanamiento de la Tierra
  const e2 = 2 * f - Math.pow(f, 2); // Excentricidad cuadrada

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const cosLambda = Math.cos(lambda);
  const sinLambda = Math.sin(lambda);

  // Radio del curvatura en la vertical prime
  const N = a / Math.sqrt(1 - e2 * Math.pow(sinPhi, 2));

  const X = (N + h) * cosPhi * cosLambda;
  const Y = (N + h) * cosPhi * sinLambda;
  const Z = ((1 - e2) * N + h) * sinPhi;


  return new Cartesian3DCoordinate(X, Y, Z);
}

// Función de cálculo inverso
function calculateInverse(coordinate1, coordinate2) {
  const result = [0.0, 0.0, 0.0];

  const a = 6378137.0; // Radio ecuatorial de la Tierra en metros
  const f = 1 / 298.257223563; // Aplanamiento de la Tierra
  const b = a * (1 - f);

  const lat1 = coordinate1.latitude * (Math.PI / 180);
  const lon1 = coordinate1.longitude * (Math.PI / 180);
  const lat2 = coordinate2.latitude * (Math.PI / 180);
  const lon2 = coordinate2.longitude * (Math.PI / 180);

  const U1 = Math.atan((1 - f) * Math.tan(lat1));
  const U2 = Math.atan((1 - f) * Math.tan(lat2));
  const L = lon2 - lon1;
  let lambda = L;
  let lambdaP;
  const iterLimit = 100;
  let sinSigma, cosSigma, sigma, sinAlpha, cos2SigmaM, cosSqAlpha;
  let cosLambda, sinLambda;
  let i = 0;

  do {
    sinLambda = Math.sin(lambda);
    cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt(
      (Math.cos(U2) * sinLambda) * (Math.cos(U2) * sinLambda) +
      (Math.cos(U1) * Math.sin(U2) - Math.sin(U1) * Math.cos(U2) * cosLambda) *
      (Math.cos(U1) * Math.sin(U2) - Math.sin(U1) * Math.cos(U2) * cosLambda)
    );
    if (sinSigma === 0) return result; // coincident points
    cosSigma = Math.sin(U1) * Math.sin(U2) + Math.cos(U1) * Math.cos(U2) * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    sinAlpha = Math.cos(U1) * Math.cos(U2) * sinLambda / sinSigma;
    cosSqAlpha = 1 - sinAlpha * sinAlpha;
    cos2SigmaM = cosSigma - 2 * Math.sin(U1) * Math.sin(U2) / cosSqAlpha;
    if (isNaN(cos2SigmaM)) cos2SigmaM = 0; // equatorial line: cosSqAlpha=0 (§6)
    const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    lambdaP = lambda;
    lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    i++;
  } while (Math.abs(lambda - lambdaP) > 1e-12 && i < iterLimit);

  if (i >= iterLimit) return NaN; // formula failed to converge

  const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
  const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
    B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));

  const s = (b * A * (sigma - deltaSigma)).toFixed(4);

  const fwdAz = (Math.atan2(Math.cos(U2) * Math.sin(lambda), Math.cos(U1) * Math.sin(U2) - Math.sin(U1) * Math.cos(U2) * cosLambda) * (180 / Math.PI)).toFixed(4);
  const revAz = (Math.atan2(Math.cos(U1) * Math.sin(lambda), -Math.sin(U1) * Math.cos(U2) + Math.cos(U1) * Math.sin(U2) * cosLambda) * (180 / Math.PI)).toFixed(4);

  result[0] = parseFloat(s);
  result[1] = parseFloat(fwdAz) < 0 ? parseFloat(fwdAz) + 360 : parseFloat(fwdAz);
  result[2] = parseFloat(revAz) < 0 ? parseFloat(revAz) + 360 : parseFloat(revAz);

  return result;
}

// Función para calcular las velocidades y convertirlas a coordenadas XYZ
function calculateXYZ(vel, coordinate) {
  let sn = vel.getVelocitySN();
  let we = vel.getVelocityWE();
  let h = coordinate.ellipsoidalHeight || 0.0;

  // Ajuste de longitud
  const adjustedLongitude = coordinate.longitude + 2.777777777777777E-4;
  const dist = calculateInverse(new EllipsoidalCoordinate(coordinate.latitude, adjustedLongitude, h), coordinate)[0];

  // Ajuste de las velocidades basado en la distancia
  sn = Math.abs(sn / dist / 3600.0);
  we = Math.abs(we / dist * Math.cos(coordinate.latitude * (Math.PI / 180)) / 3600.0);



  // Nuevas coordenadas elipsoidales ajustadas
  const adjustedLatitude = coordinate.latitude + sn;
  const finalLongitude = coordinate.longitude + we;

  const ellipsoidal = new EllipsoidalCoordinate(adjustedLatitude, finalLongitude, h);

  // Convertir ambas coordenadas a cartesianas
  const cartesian3D1 = cartesian3DConversion(coordinate);
  const cartesian3D2 = cartesian3DConversion(ellipsoidal);

  // Calcular las diferencias en coordenadas XYZ
  const x = Math.abs(cartesian3D2.X - cartesian3D1.X).toFixed(5);
  const y = Math.abs(cartesian3D2.Y - cartesian3D1.Y).toFixed(5);
  const z = Math.abs(cartesian3D2.Z - cartesian3D1.Z).toFixed(5);



  vel.setVelocityX(parseFloat(x));
  vel.setVelocityY(parseFloat(y));
  vel.setVelocityZ(parseFloat(z));

  return vel;
}
// ======== funciones para la velocidad ====================
// Función para calcular las velocidades
async function calculateVelocities(lat, lon, matrix) {
  const velocitySN = Math.abs(idwCalculate(matrix, 0)); // Posición de velX
  const velocityWE = Math.abs(idwCalculate(matrix, 1)); // Posición de velY



  const vel = new Velocities();
  vel.setVelocitySN(velocitySN);
  vel.setVelocityWE(velocityWE);

  return calculateXYZ(vel, new EllipsoidalCoordinate(lat, lon, null));
}

// Función principal para leer el archivo de texto, calcular las velocidades y convertirlas a XYZ

// Función principal para leer el archivo de texto, calcular las velocidades y convertirlas a XYZ
async function getVelocitiesFromFile(lat, lon) {
  // Ajusta la ruta al archivo Velogrid2017.txt
  const filePath = 'json/Velogrid2017.txt';  // Asegúrate de que la ruta sea correcta y accesible desde el servidor

  // Leer el archivo Velogrid2017.txt usando fetch
  const response = await fetch(filePath);
  const textData = await response.text();
  const lines = textData.trim().split('\n');

  // Procesar las líneas del archivo
  const reader = new VelocitiesReader(lines);

  // Obtener la matriz de datos
  const matrix = reader.getMatrix(lat, lon);

  // Calcular las velocidades y coordenadas XYZ
  const velocities = await calculateVelocities(lat, lon, matrix);

  return velocities;
}
async function guardarVelocidades() {
  let arrTexto = JSON.parse(localStorage.getItem('verticesOndula'));
  let arrTexto2 = [];
  console.log(arrTexto);

  for (let vertice of arrTexto) {
    if (vertice.velx) {
      arrTexto2.push(vertice);
    } else {
      let velocidades = await getVelocitiesFromFile(vertice.lat, vertice.long);
      vertice.velx = velocidades.getVelocityX();
      vertice.vely = velocidades.getVelocityY();
      vertice.velz = velocidades.getVelocityZ();
      arrTexto2.push(vertice);
    }
  }

  localStorage.setItem('verticesOndula', JSON.stringify(arrTexto2));
}



function ajustarDecimales(vertice) {
  if (typeof vertice.anoEpoca == 'number') {
    vertice.anoEpoca = vertice.anoEpoca.toFixed(2);
  }
  if (typeof vertice.este == 'number') {
    vertice.este = vertice.este.toFixed(5);
  }
  if (typeof vertice.esteKrugger == 'number') {
    vertice.esteKrugger = vertice.esteKrugger.toFixed(5);
  }
  if (typeof vertice.lat == 'number') {
    vertice.lat = vertice.lat.toFixed(9);
  }
  if (typeof vertice.latReferencia == 'number') {
    vertice.latReferencia = vertice.latReferencia.toFixed(9);
  }
  if (typeof vertice.lonReferencia == 'number') {
    vertice.lonReferencia = vertice.lonReferencia.toFixed(9);
  }
  if (typeof vertice.long == 'number') {
    vertice.long = vertice.long.toFixed(9);
  }
  if (typeof vertice.norte == 'number') {
    vertice.norte = vertice.norte.toFixed(5);
  }
  if (typeof vertice.norteKrugger == 'number') {
    vertice.norteKrugger = vertice.norteKrugger.toFixed(5);
  }
  if (typeof vertice.xreferencia == 'number') {
    vertice.xreferencia = vertice.xreferencia.toFixed(5);
  }
  if (typeof vertice.yreferencia == 'number') {
    vertice.yreferencia = vertice.yreferencia.toFixed(5);
  }
  if (typeof vertice.zreferencia == 'number') {
    vertice.zreferencia = vertice.zreferencia.toFixed(5);
  }
  return vertice;
}


const validarOrden = (arreglo) => {
  let newArreglo = [];
  let contador = 0;
  const longitud = (arreglo.length) * 2;
  for (let i = 0; i < longitud; i++) {
    if (i % 2 === 0) {
      newArreglo.push(arreglo[contador]);
      contador++;
    } else {
      newArreglo.push('');
    }
  }
  return newArreglo;
}