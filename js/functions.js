

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
  console.log(verticesCompletos, tabla)

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
  console.log("sumatoria", sumatoria)
  console.log("diferencia", diferencia)

  let correccion = (diferencia - sumatoria) / (verticesCompletos.length);
  console.log("correcion", correccion)


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
  console.log(listaVertices)

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







