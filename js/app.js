localStorage.setItem('verticesOndula', JSON.stringify([]));
localStorage.setItem('anosPorHtml', JSON.stringify([]));

function crearDropdownParaVertice(vertice) {
  const container = document.getElementById('verticesContainer');

  const div = document.createElement('div');
  div.classList.add('vertice-item');

  const label = document.createElement('label');
  label.innerText = `Tipo de Punto para ${vertice.nombre}:`;

  const select = document.createElement('select');
  select.classList.add('form-control');
  select.setAttribute('data-vertice', vertice.nombre);

  const opciones = ['', 'Fotocontrol', 'Geodésico', 'Auxiliar'];  // Añadir una opción vacía por defecto
  opciones.forEach(opcion => {
      const optionElement = document.createElement('option');
      optionElement.value = opcion;
      optionElement.text = opcion === '' ? 'Seleccione un tipo de punto' : opcion;
      select.appendChild(optionElement);
  });

 
  div.appendChild(label);
  div.appendChild(select);
  container.appendChild(div);
}
function validarSeleccionDePuntos() {
  let valid = true;
  document.querySelectorAll('select[data-vertice]').forEach(select => {
      console.log(`Verificando selección para: ${select.dataset.vertice}, valor seleccionado: ${select.value}`);
      if (select.value === '') {
          valid = false;
          console.log(`Valor no seleccionado para: ${select.dataset.vertice}`);
          select.classList.add('error');
      } else {
          console.log(`Valor correctamente seleccionado para: ${select.dataset.vertice}`);
          select.classList.remove('error');
      }
  });
  console.log(`Resultado de la validación: ${valid}`);
  return valid;
}

document.querySelector('#calcular').addEventListener('click', async function () {
  // Crear los dropdowns solo si no han sido creados antes
  let arrTexto2 = JSON.parse(localStorage.getItem('verticesOndula'));
  arrTexto2.forEach(vertice => {
      if (!document.querySelector(`select[data-vertice="${vertice.nombre}"]`)) {
          crearDropdownParaVertice(vertice);
      }
  });

  // Validar si todos los tipos de punto han sido seleccionados
  if (!validarSeleccionDePuntos()) {
      alert('Debe seleccionar un tipo de punto para cada vértice antes de proceder.');
      return;  // Detener el proceso si no se han seleccionado todos los tipos de punto
  }

  // Validaciones iniciales
  if (!document.querySelector("#verticeFuente")) {
      mostrarMensaje('Debe elegir un vertice valido primero', 'info');
      return;
  }

  if (JSON.parse(localStorage.getItem('verticesOndula')).length == 0 || JSON.parse(localStorage.getItem('anosPorHtml')).length == 0) {
      mostrarMensaje('Debe ingresar el archivo .asc y la carpeta logfiles', 'info');
      return;
  }

  // Preparar datos para procesamiento
  let verticesCompletos = [];
  let arrTexto = JSON.parse(localStorage.getItem('verticesOndula'));
  let arr = JSON.parse(localStorage.getItem('anosPorHtml'));

  const nombreCalculista = document.querySelector('#nombreCalculista').value;
  const nombreProyecto = document.querySelector('#nombreProyecto').value;

  let datosXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                            <Proyecto>
                                <Nombre>${nombreProyecto === '' ? 'XML' : nombreProyecto}</Nombre>
                                <Calculista>${nombreCalculista === '' ? 'IGAC' : nombreCalculista}</Calculista>
                                <Versión>1.0 BETA</Versión>`;

  // Agregar estaciones permanentes
  datosXml += "<Estaciones_Permanentes>";
  for (let ver of arrTexto) {
      if (ver.tipo == 'CTRL') {
          datosXml += `
              <Punto Nombre="${ver.nombre}">
                  <Tipo_Punto>Estación</Tipo_Punto>
                  <Set_de_Coordenadas>
                      <Cartesiana3d_rastreo>
                          <Datum>MAGNA-SIRGAS</Datum>
                          <X>${ver.x}</X>
                          <Y>${ver.y}</Y>
                          <Z>${ver.z}</Z>
                      </Cartesiana3d_rastreo>
                      <Elipsoidal_rastreo>
                          <Datum>MAGNA-SIRGAS</Datum>
                          <Latitud>${typeof ver.lat == 'number' ? ver.lat.toFixed(6) : ver.lat}</Latitud>
                          <Longitud>${typeof ver.long == 'number' ? ver.long.toFixed(6) : ver.long}</Longitud>
                          <Ondula>${ver.ondula}</Ondula>
                      </Elipsoidal_rastreo>
                  </Set_de_Coordenadas>
              </Punto>`;
      }
  }
  datosXml += "</Estaciones_Permanentes>";

  // ===== OBTENER VELOCIDADES =======
  let velx = "";
  let vely = "";
  let velz = "";
  for (let vel of arrTexto) {
      if (vel.velx != undefined) {
          velx = parseFloat(typeof vel.velx == 'string' ? vel.velx.replace(",", ".") : vel.velx);
          vely = parseFloat(typeof vel.vely == 'string' ? vel.vely.replace(",", ".") : vel.vely);
          velz = parseFloat(typeof vel.velz == 'string' ? vel.velz.replace(",", ".") : vel.velz);
          break;
      }
  }
  // ===== FIN =======

  // Procesar vértices
  let contadorVertices = new Map();
  for (let coordenadas of arrTexto) {
      let anosEpoca = buscarAnoDeCoordenada(coordenadas, arr); // Devuelve un arreglo con todos los anosEpoca encontrados

      if (anosEpoca.length > 0) {
          anosEpoca.forEach(anoEpocaInicial => {
              let deltaDeTiempo = 2018 - anoEpocaInicial;

              for (let coordenada of arr) {
                  let nombreVertice = coordenadas.nombre.trim();

                  // Obtener el número de veces que este vértice ha sido procesado
                  let count = contadorVertices.get(nombreVertice) || 0;

                  if (coordenadas.nombre === coordenada.name.split(' - ').pop().split('.')[0].trim()) {
                      if (count < 2) {
                          // Incrementar el contador
                          contadorVertices.set(nombreVertice, count + 1);
                          const tipoPuntoSeleccionado = document.querySelector(`select[data-vertice="${coordenadas.nombre}"]`).value;

                          // Realizar el procesamiento
                          let coordenadaAjustada = convertirCoordenadasITRF2020aITRF2014(coordenadas.x, coordenadas.y, coordenadas.z);
                          let xreferencia = (coordenadaAjustada[0] + (coordenadas.velx * deltaDeTiempo)).toFixed(5);
                          let yreferencia = (coordenadaAjustada[1] + (coordenadas.vely * deltaDeTiempo)).toFixed(5);
                          let zreferencia = (coordenadaAjustada[2] + (coordenadas.velz * deltaDeTiempo)).toFixed(5);

                          let latlonreferencia = geocentricas_elipsoidales(xreferencia, yreferencia, zreferencia);
                          let origenNac = transformarAOrigenNac(latlonreferencia.latDec, latlonreferencia.lonDec);
                          let gauss = gaussKrugger(latlonreferencia.latDec, latlonreferencia.lonDec);

                          verticesCompletos.push({
                              lat: coordenadas.lat,
                              long: coordenadas.long,
                              nombre: coordenadas.nombre,
                              ondula: coordenadas.ondula,
                              tipo: tipoPuntoSeleccionado,
                              x: coordenadas.x,
                              y: coordenadas.y,
                              z: coordenadas.z,
                              altelips: coordenada.altelips.replace(",", "."),
                              xreferencia: xreferencia,
                              yreferencia: yreferencia,
                              zreferencia: zreferencia,
                              xITRF2014: coordenadaAjustada[0],
                              yITRF2014: coordenadaAjustada[1],
                              zITRF2014: coordenadaAjustada[2],
                              latReferencia: latlonreferencia.latDec,
                              lonReferencia: latlonreferencia.lonDec,
                              hReferencia: latlonreferencia.hReferencia,
                              anoEpoca: anoEpocaInicial,
                              velx: coordenadas.velx,
                              vely: coordenadas.vely,
                              velz: coordenadas.velz,
                              fecha: coordenada.fecha,
                              este: origenNac.x,
                              norte: origenNac.y,
                              esteKrugger: gauss.x,
                              norteKrugger: gauss.y,
                              originName: gauss.originName,
                              mascara: coordenada.mascara,
                              satelites: coordenada.satelites,
                              lecturaAltura: coordenada.lecturaAltura,
                              alturaAntena: coordenada.alturaAntena,
                              tipoSolucion: coordenada.tipoSolucion,
                              m0: coordenada.m0,
                              gdop: coordenada.gdop,
                              duracion: coordenada.duracion,
                              name: coordenada.name,
                              frecuencia: coordenada.frecuencia,
                              efemerides: coordenada.efemerides,
                              inicioFin: coordenada.inicioFin,
                              nombreAntena: coordenada.nombreAntena,
                              cq1d: coordenada.cq1d,
                              cq2d: coordenada.cq2d,
                              cq3d: coordenada.cq3d,
                              saltos: coordenada.saltos
                          });
                      }
                  }
              }
          });
      }
  }
  let baseVertNomen = document.querySelector("#verticeFuente").dataset.nomenclatura;
  let baseVertAlt = document.querySelector("#verticeFuente").dataset.altelips;
  let baseVertondula = document.querySelector("#verticeFuente").dataset.ondula;
  let baseVertAltmsn = document.querySelector("#verticeFuente").dataset.altmsnmm;

  let baseLatitud = document.querySelector("#verticeFuente").dataset.latitud;
  let baseLongitud = document.querySelector("#verticeFuente").dataset.longitud;
  let baseAno = document.querySelector("#verticeFuente").dataset.ano;

  let baseVertNomen2 = document.querySelector("#verticeFuente2").dataset.nomenclatura2;
  let baseVertAlt2 = document.querySelector("#verticeFuente2").dataset.altelips2;
  let baseVertondula2 = document.querySelector("#verticeFuente2").dataset.ondula2;
  let baseVertAltmsn2 = document.querySelector("#verticeFuente2").dataset.altmsnmm2;

  
  let baseLatitud2 = document.querySelector("#verticeFuente2").dataset.latitud2;
  let baseLongitud2 = document.querySelector("#verticeFuente2").dataset.longitud2;
  let baseAno2 = document.querySelector("#verticeFuente2").dataset.ano2;




  // PUNTO BASE DE NIVELACIÓN
  datosXml += "<Puntos_Base_Nivelación>";
  datosXml += `
        
          <Punto Nombre="${baseVertNomen}">
              <Tipo_Punto>Geodesico</Tipo_Punto>              
              <Altura_Ortométrica>
                  <Valor>${baseVertAltmsn}</Valor>
                  <Año>${baseAno}</Año>
                  <Metodo_Determinación>Geometrica</Metodo_Determinación>
              </Altura_Ortométrica>
              <Ondulación_Geoidal>
                  <Valor>${baseVertondula}</Valor>
                  <Modelo_Geoidal />
              </Ondulación_Geoidal>              
              <Set_de_Coordenadas>
                  <Ellipsoidal>
                      <Datum>MAGNA-SIRGAS</Datum>
                      <Latitud>${typeof baseLatitud  == 'string' ? parseFloat( baseLatitud ).toFixed(5) : baseLatitud.toFixed(5)}</Latitud>
                      <Longitud>${typeof baseLongitud == 'string' ? parseFloat( baseLongitud ).toFixed(5) : baseLongitud.toFixed(5)}</Longitud>
                      <Altura_Elipsoidal>${baseVertAlt}</Altura_Elipsoidal>
                  </Ellipsoidal>
              </Set_de_Coordenadas>
          </Punto>

           <Punto Nombre="${baseVertNomen2}">
              <Tipo_Punto>Geodesico</Tipo_Punto>              
              <Altura_Ortométrica>
                  <Valor>${baseVertAltmsn2}</Valor>
                  <Año>${baseAno2}</Año>
                  <Metodo_Determinación>Geometrica</Metodo_Determinación>
              </Altura_Ortométrica>
              <Ondulación_Geoidal>
                  <Valor>${baseVertondula2}</Valor>
                  <Modelo_Geoidal />
              </Ondulación_Geoidal>              
              <Set_de_Coordenadas>
                  <Ellipsoidal>
                      <Datum>MAGNA-SIRGAS</Datum>
                      <Latitud>${typeof baseLatitud2  == 'string' ? parseFloat( baseLatitud2 ).toFixed(5) : baseLatitud2.toFixed(5)}</Latitud>
                      <Longitud>${typeof baseLongitud2 == 'string' ? parseFloat( baseLongitud2 ).toFixed(5) : baseLongitud2.toFixed(5)}</Longitud>
                      <Altura_Elipsoidal>${baseVertAlt2}</Altura_Elipsoidal>
                  </Ellipsoidal>
              </Set_de_Coordenadas>
          </Punto>
        
        `;
  datosXml += "</Puntos_Base_Nivelación>";
  // ===== INICIO LOGICA DE TABULACION ========
  let verticesCompletosTemp = [];
  for (let vertice of verticesCompletos) {
      verticesCompletosTemp.push(ajustarDecimales(vertice));
  }

  verticesCompletos = [];

  // ============ Cálculos para tabular =========
  verticesCompletos = [...verticesCompletosTemp];
  let verticesCompletos2 = [...verticesCompletos];
  let verticesCompletos3 = [...verticesCompletos];

  console.log(verticesCompletos);

  // ============ Cálculos para tabular 1,2,3 =========
  verticesCompletos.push({ nombre: baseVertNomen, altelips: baseVertAlt, ondula: baseVertondula });
  const HGPSFINALArray1 = calculoPorTabular(verticesCompletos, baseVertNomen, baseVertAlt, baseVertondula, baseVertAltmsn, baseVertAltmsn, "calculos");

  verticesCompletos2.push({ nombre: baseVertNomen2, altelips: baseVertAlt2, ondula: baseVertondula2 });
  const HGPSFINALArray2 = calculoPorTabular(verticesCompletos2, baseVertNomen2, baseVertAlt2, baseVertondula2, baseVertAltmsn2, baseVertAltmsn2, "calculos2");

  verticesCompletos3.push({ nombre: baseVertNomen2, altelips: baseVertAlt2, ondula: baseVertondula2 });
  const HGPSFINALArray3 = calculoPorTabular(verticesCompletos3, baseVertNomen, baseVertAlt, baseVertondula, baseVertAltmsn, baseVertAltmsn2, "calculos3");

  // ============ Fin cálculos para tabular 2,3 =========

  // ============ Tabular diferencias =========
  tabularDiferencias();
  // ============ Fin tabular diferencias =========

  // CUERPO DEL DOCUMENTO
  datosXml += "<Puntos_Calculados>";

  for (let i = 0; i < verticesCompletos.length - 1; i++) {
      datosXml += `
          <Punto Nombre="${verticesCompletos[i].nombre}">
          <Tipo_Punto>${tipoPunto(verticesCompletos[i].duracion)}</Tipo_Punto>      
          <Epoca_Punto>Época 2018</Epoca_Punto>
          <Altura_Ortométrica>
              <Valor1>${HGPSFINALArray1[i]}</Valor1>          
              <Valor2>${HGPSFINALArray2[i]}</Valor2>
              <Valor3>${HGPSFINALArray3[i]}</Valor3>
              <Metodo_Determinación>Geocol</Metodo_Determinación>
          </Altura_Ortométrica>
          <Ondulación_Geoidal>
              <Valor>${verticesCompletos[i].ondula}</Valor>
              <Modelo_Geoidal>GEOCOL</Modelo_Geoidal>
          </Ondulación_Geoidal>
          <Fecha_de_Captura>
              <Fecha>${verticesCompletos[i].fecha}</Fecha>          
          </Fecha_de_Captura>
          <Velocidades>          
              <X>${verticesCompletos[i].velx != undefined ? verticesCompletos[i].velx.toString().replace('.', ',') : verticesCompletos[i].velx}</X>
              <Y>${verticesCompletos[i].vely != undefined ? verticesCompletos[i].vely.toString().replace('.', ',') : verticesCompletos[i].vely}</Y>
              <Z>${verticesCompletos[i].velz != undefined ? verticesCompletos[i].velz.toString().replace('.', ',') : verticesCompletos[i].velz}</Z>
          </Velocidades>
          <Set_de_Coordenadas>
              <Cartesiana3d_referencia>
                  <Datum>MAGNA-SIRGAS</Datum>
                  <X>${verticesCompletos[i].xreferencia != undefined ? verticesCompletos[i].xreferencia.toString().replace('.', ',') : verticesCompletos[i].xreferencia}</X>
                  <Y>${verticesCompletos[i].yreferencia != undefined ? verticesCompletos[i].yreferencia.toString().replace('.', ',') : verticesCompletos[i].yreferencia}</Y>
                  <Z>${verticesCompletos[i].zreferencia != undefined ? verticesCompletos[i].zreferencia.toString().replace('.', ',') : verticesCompletos[i].zreferencia}</Z>
              </Cartesiana3d_referencia>
              <Cartesiana3d_rastreo>
                  <Datum>MAGNA-SIRGAS</Datum>
                  <X>${verticesCompletos[i].xITRF2014 != undefined ? verticesCompletos[i].xITRF2014.toString().replace('.', ',') : verticesCompletos[i].xITRF2014}</X>
                  <Y>${verticesCompletos[i].yITRF2014 != undefined ? verticesCompletos[i].yITRF2014.toString().replace('.', ',') : verticesCompletos[i].yITRF2014}</Y>
                  <Z>${verticesCompletos[i].zITRF2014 != undefined ? verticesCompletos[i].zITRF2014.toString().replace('.', ',') : verticesCompletos[i].zITRF2014}</Z>
              </Cartesiana3d_rastreo>
              <Elipsoidal_rastreo>
                  <Datum>MAGNA-SIRGAS</Datum>
                  <Latitud>${verticesCompletos[i].lat != undefined ? verticesCompletos[i].lat.toString().replace('.', ',') : verticesCompletos[i].lat}</Latitud>
                  <Longitud>${verticesCompletos[i].long != undefined ? verticesCompletos[i].long.toString().replace('.', ',') : verticesCompletos[i].long}</Longitud>
                  <Altura_Elipsoidal>${verticesCompletos[i].hReferencia != undefined ? verticesCompletos[i].hReferencia.toString().replace('.', ',') : verticesCompletos[i].hReferencia}</Altura_Elipsoidal>
              </Elipsoidal_rastreo>
              <Elipsoidal_referencia>
                  <Datum>MAGNA-SIRGAS</Datum>
                  <Latitud>${verticesCompletos[i].latReferencia != undefined ? verticesCompletos[i].latReferencia.toString().replace('.', ',') : verticesCompletos[i].latReferencia}</Latitud>
                  <Longitud>${verticesCompletos[i].lonReferencia != undefined ? verticesCompletos[i].lonReferencia.toString().replace('.', ',') : verticesCompletos[i].lonReferencia}</Longitud>            
                  <Altura_Elipsoidal>${verticesCompletos[i].hReferencia != undefined ? verticesCompletos[i].hReferencia.toString().replace('.', ',') : verticesCompletos[i].hReferencia}</Altura_Elipsoidal>
                  </Elipsoidal_referencia>
              <Gauss_referencia>
                  <Datum>MAGNA-SIRGAS</Datum>
                  <Norte>${verticesCompletos[i].norteKrugger != undefined ? verticesCompletos[i].norteKrugger.toString().replace('.', ',') : verticesCompletos[i].norteKrugger}</Norte>
                  <Este>${verticesCompletos[i].esteKrugger != undefined ? verticesCompletos[i].esteKrugger.toString().replace('.', ',') : verticesCompletos[i].esteKrugger}</Este>
                  <Origen>${verticesCompletos[i].originName}</Origen>
              </Gauss_referencia>
              <Origen>
                  <Datum>MAGNA-SIRGAS</Datum>
                  <Norte>${verticesCompletos[i].norte != undefined ? verticesCompletos[i].norte.toString().replace('.', ',') : verticesCompletos[i].norte}</Norte>
                  <Este>${verticesCompletos[i].este != undefined ? verticesCompletos[i].este.toString().replace('.', ',') : verticesCompletos[i].este}</Este>            
              </Origen>
              <Informacion Vectores>
                <Mascara>${verticesCompletos[i]?.mascara}</Mascara>
                <Satelites>${verticesCompletos[i]?.satelites}</Satelites>
                <LecturaAltura>${verticesCompletos[i]?.lecturaAltura}</LecturaAltura>
                <LecturaAntena>${verticesCompletos[i]?.alturaAntena}</LecturaAntena>
                <TipoSolucion>${verticesCompletos[i]?.tipoSolucion}</TipoSolucion>
                <M0>${verticesCompletos[i]?.m0}</M0>
                <Gdop>${verticesCompletos[i]?.gdop}</Gdop>
    
                <Frecuencia>${verticesCompletos[i]?.frecuencia}</Frecuencia>
                <Efemerides>${verticesCompletos[i]?.efemerides}</Efemerides>
                <InicioFin>${verticesCompletos[i]?.inicioFin}</InicioFin>
                <NombreAntena>${verticesCompletos[i]?.nombreAntena}</NombreAntena>
                <Cq1d>${verticesCompletos[i]?.cq1d}</Cq1d>
                <Cq2d>${verticesCompletos[i]?.cq2d}</Cq2d>
                <Cq3d>${verticesCompletos[i]?.cq3d}</Cq3d>
                <Saltos>${verticesCompletos[i]?.saltos}</Saltos>
              </Informacion_Vectores>
            </Set_de_Coordenadas>
          </Punto>`;
  }

  datosXml += "</Puntos_Calculados>";
  datosXml += "</Proyecto>";
  // Descargar el XML
  descargarXML(datosXml);
});

function descargarXML(datosXml) {
  var blob = new Blob([datosXml], {
      type: 'text/xml'
  });

  var link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = "proyecto.xml";
  document.body.appendChild(link);
  link.click();
}






document.querySelector('#descargar').addEventListener('click', function (e) {
  descargarItrf2014();
});




/**
 * Carga el archivo de texto, lee las coordenadas y las almacena localmente.
 * @param {file} e - Texto plano con coordenadas. 
 */
document.querySelector('#cargarTexto').addEventListener('change', (e) => {

  // deshabilitar botones
  cambiosToggleHabilitar(true);


  if (e.target.files.length) {
    document.getElementById('icono-archivo').className = 'bi bi-file-check-fill';
    document.getElementById('texto-archivo').innerText = `${e.target.files[0].name}`;
    cambiosVisualesCarga(e);
  }


  let arregloVerticesOndulacion = [];
  localStorage.setItem('verticesOndula', JSON.stringify(arregloVerticesOndulacion));




  let archivoPlano = document.querySelector('#cargarTexto').files[0];



  let reader = new FileReader();
  reader.onload = async (e) => {

    // console.log(e.target.result[0])

    // valido si el primer caracter es @ o no, para saber
    // que version de archivo es y que función aplicarle

    let verticesArray = [];
    let vertices = e.target.result.split('\n');


    if (e.target.result[0] === '@') {
      // ITRF.asc
      console.log("ITRF.asc")
      for (let i = 3; i < vertices.length; i++) {
        if (vertices[i].length > 0) {
          verticesArray.push(eliminarEspacios(vertices[i]));
        }
      }

    } else {

      if (vertices[0].includes("Latitud")) {
        // GEO.txt
        console.log("GEO.txt")
        for (let i = 1; i < vertices.length; i++) {
          if (vertices[i].length > 0) {
            verticesArray.push(eliminarEspacios2(vertices[i]));
          }
        }

      } else {
        if (vertices[0].split('\t')[1] === "Clase de Punto") {
          // CAR.txt
          console.log("CAR.txt 2")
          for (let i = 1; i < vertices.length; i++) {
            if (vertices[i].length > 0) {
              verticesArray.push(eliminarEspacios4(vertices[i]));
            }
          }



        } else {
          console.log("CAR.txt 1")
          for (let i = 1; i < vertices.length; i++) {
            if (vertices[i].length > 0) {
              verticesArray.push(eliminarEspacios3(vertices[i]));
            }
          }

        }



      }

    }




    // espacio para traer velocidades
    // let velocidades = obtenerVelocidades();
    let arregloRedPasiva = [];
    try {
      const res = await fetch('./../json/Red pasiva GNSS.json');
      arregloRedPasiva = await res.json();

    } catch (error) {
      console.error(error)
    }


    let result = [];
    for (let vertice of verticesArray) {
      let res = arregloRedPasiva.find((verArry) => verArry.Nomenc.toString() === vertice.nombre);
      if (res) {
        result.push({
          nombre: vertice.nombre, x: vertice.x, y: vertice.y, z: vertice.z, tipo: vertice.tipo,
          velx: res.VelX, vely: res.VelY, velz: res.VelZ, altelips: res.AltElips, ondula: res.Ondula,
          lat: res.Lat, long: res.Long
        });

      } else {

        // ====== CONVERTIR CORDENADAS GEOCENTRICAS A LAT Y LONG =========        
        let x = parseFloat(vertice.x);
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
          nombre: vertice.nombre, x: vertice.x, y: vertice.y, z: vertice.z, tipo: vertice.tipo,
          lat: latDec, long: lonDec
        });


      }
    }


    // ====== BUSCAR Y AGREGAR LA ONDULACIÓN =========
    async function fetchGeocol2004() {
      console.log("fetchGeocol2004 disparado.");
      const response = await fetch('../json/Geocol2004.txt');
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo Geocol2004.txt');
      }
      const text = await response.text();
      console.log("Contenido de Geocol2004.txt obtenido.");
      return text;
    }
    
    async function cabecero() {
      console.log("cabecero disparado.");
      const data = await fetchGeocol2004();
      const lines = data.split("\n");
      if (lines.length < 1) throw new Error("El archivo Geocol2004.txt está vacío o tiene un formato incorrecto.");
      
      const primera_linea = lines[0].trim().split(" ");
      if (primera_linea.length < 6) throw new Error("La primera línea del archivo Geocol2004.txt tiene un formato incorrecto.");
    
      return {
        minLatitud: parseFloat(primera_linea[0]),
        maxLatitud: parseFloat(primera_linea[1]),
        minLongitud: parseFloat(primera_linea[2]),
        maxLongitud: parseFloat(primera_linea[3]),
        incrementoLat: parseFloat(primera_linea[4]),
        incrementoLon: parseFloat(primera_linea[5]),
        norteOeste: null,
        norteEste: null,
        surOeste: null,
        surEste: null
      };
    }
    
    async function ondulacion_geoidal(latitud, longitud) {
      console.log("ondulacion_geoidal disparado para latitud:", latitud, "y longitud:", longitud);
      const datos = await cabecero();
    
      if (latitud < (datos.minLatitud + datos.incrementoLat) || latitud > (datos.maxLatitud - datos.incrementoLat)) {
        console.log("latitud fuera del rango");
        return null;
      }
      if (longitud < (datos.minLongitud + datos.incrementoLon) || longitud > (datos.maxLongitud - datos.incrementoLon)) {
        console.log("longitud fuera del rango");
        return null;
      }
    
      const i = parseInt((datos.maxLatitud - latitud) / datos.incrementoLat);
      const j = parseInt((longitud - datos.minLongitud) / datos.incrementoLon);
    
      const lat = parseFloat(datos.maxLatitud - i * datos.incrementoLat);
      const lon = parseFloat(datos.minLongitud + j * datos.incrementoLon);
    
      const data = await fetchGeocol2004();
      const lines = data.split("\n");
      if (i + 2 >= lines.length) throw new Error("El archivo Geocol2004.txt no tiene suficientes datos para la interpolación.");
    
      const primera_linea = lines[i + 1]?.trim().split(" ");
      const segunda_linea = lines[i + 2]?.trim().split(" ");
      if (!primera_linea || !segunda_linea || primera_linea.length <= j + 1 || segunda_linea.length <= j + 1) {
        throw new Error("El archivo Geocol2004.txt no tiene suficientes columnas para la interpolación.");
      }
    
      datos.norteOeste = parseFloat(primera_linea[j]);
      datos.norteEste = parseFloat(primera_linea[j + 1]);
      datos.surOeste = parseFloat(segunda_linea[j]);
      datos.surEste = parseFloat(segunda_linea[j + 1]);
    
      const ondulacion = interpolacion_bilineal(datos, lat, lon, latitud, longitud);
      console.log("Ondulación geoidal calculada:", ondulacion);
      return ondulacion.toFixed(2);
    }
    
    function interpolacion_bilineal(datos, maxLatitud, minLongitud, latitud, longitud) {
      const v = parseFloat((maxLatitud - latitud) / datos.incrementoLat);
      const u = parseFloat((longitud - minLongitud) / datos.incrementoLon);
      const q = ((1 - u) * (1 - v) * datos.norteOeste) + (v * (1 - u) * datos.surOeste) + (u * v * datos.surEste) + ((1 - v) * u * datos.norteEste);
      console.log('El valor de la ondulacion es: ', q);
      console.log('El valor de la ondulacion es: ', q.toFixed(2));
      
      return q;
    }
     // ====== BUSCAR Y AGREGAR LA ONDULACIÓN =========
     let verticeConOndulacion = [];

     for (let vertice of result) {
       if (vertice.ondula === undefined) {
         const lat = vertice.lat;
         const lon = vertice.long;

         try {
           const ondula = await ondulacion_geoidal(lat, lon);
           verticeConOndulacion.push({
             nombre: vertice.nombre,
             lat: vertice.lat,
             long: vertice.long,
             x: vertice.x,
             y: vertice.y,
             z: vertice.z,
             tipo: vertice.tipo,
             ondula: ondula
           });
         } catch (error) {
           console.log('error', error);
         }

       } else {
         verticeConOndulacion.push({
           nombre: vertice.nombre,
           lat: vertice.lat,
           long: vertice.long,
           x: vertice.x,
           y: vertice.y,
           z: vertice.z,
           tipo: vertice.tipo,
           ondula: vertice.ondula,
           velx: vertice.velx,
           vely: vertice.vely,
           velz: vertice.velz
         });
       }
     }
     // ====== FIN =========
    
     let verticeConOndulacionClean = [];

     for (let resul of result) {
       for (let vertice of verticeConOndulacion) {
         if (resul.nombre === vertice.nombre) {
           verticeConOndulacionClean.push(vertice);
           break;
         }
       }
     }

     
     
    // habilitar botones
    cambiosToggleHabilitar(false);


    localStorage.setItem('verticesOndula', JSON.stringify(verticeConOndulacionClean));

    guardarVelocidades();

    // ====== OBTENER EL PROMEDIO DE LOS VERTICES =========
    let promedio = { latitude: 0, longitude: 0 };
    let contador = 0;
    for (let vertice of verticeConOndulacionClean) {

      if (vertice.tipo != 'CTRL') {

        promedio.latitude += typeof vertice.lat === "number" ? vertice.lat : parseFloat(vertice.lat.replace(',', '.'));
        promedio.longitude += typeof vertice.long === "number" ? vertice.long : parseFloat(vertice.long.replace(',', '.'));
        contador++;
      }
    }
    promedio.latitude = promedio.latitude / contador;
    promedio.longitude = promedio.longitude / contador;



    // ====== FIN =========



    cargarMapa(promedio.longitude, promedio.latitude);


  };
  reader.readAsText(archivoPlano);

});



document.getElementById("cargarCarpeta").addEventListener("change", function (ev) {



  let file = ev.target.files;


  let anosPorHtml = [];
  localStorage.setItem('anosPorHtml', JSON.stringify(anosPorHtml));

  for (let i of file) {

    let obj = {};

    if (i.name.indexOf("html") !== -1) {

      obj.name = i.name;

      let reader = new FileReader();
      reader.onload = (e) => {


        for (let element of e.target.result.split("</tr>")) {


          if (element.indexOf("Intervalo de observación:") !== -1) {


            for (let elemento of e.target.result.split("</tr>")) {

              if (elemento.indexOf("Alt Elip.:") !== -1) {
                console.log(elemento.split("</td>")[3].substring(4, 13))
                obj.altelips = elemento.split("</td>")[3].substring(4, 13);
              }


              if (elemento.indexOf("Altura de antena:") !== -1) {
                obj.alturaAntena = elemento.split('<td>')[2].split('</td>')[0];
              }

              if (elemento.indexOf("Tipo de solución:") !== -1) {
                console.log(elemento.split("</td>"));
              }

              if (elemento.indexOf("Intervalo de observación:") !== -1) {

                const fecha = elemento.substring(85, 96);
                const ano = fecha.substring(6, 10);
                const mes = fecha.substring(3, 5);
                const dia = fecha.substring(0, 2);



                var fechaEjemplo = new Date(ano, mes - 1, dia);
                var diaDelAno = calcularDiaDelAno(fechaEjemplo);

                let anoEpoca = parseInt(ano) + (diaDelAno / 365);

                obj.anoEpoca = anoEpoca;
                obj.fecha = `${ano}/${mes}/${dia}`;

                break;
              }



            }

            let arre = JSON.parse(localStorage.getItem('anosPorHtml'))
            arre.push(obj)
            localStorage.setItem('anosPorHtml', JSON.stringify(arre));

            break;


          }

          if (element.indexOf("Hora Inicio - Hora Fin:") !== -1) {

            for (let elemento of e.target.result.split("</tr>")) {

              if (elemento.indexOf("Hora Inicio - Hora Fin:") !== -1) {
                
                const fecha = elemento.substring(90, 100);

                const ano = fecha.substring(6, 10);
                const mes = fecha.substring(3, 5);
                const dia = fecha.substring(0, 2);




                var fechaEjemplo = new Date(ano, mes - 1, dia);
                var diaDelAno = calcularDiaDelAno(fechaEjemplo);

                let anoEpoca = parseInt(ano) + (diaDelAno / 365);

                obj.anoEpoca = anoEpoca;
                obj.fecha = `${ano}/${mes}/${dia}`;
                obj.inicioFin = elemento.split('<td>')[1].split('</td>')[1].split('>')[1];                

              }


              if (elemento.indexOf("Altura Elip WGS84:") !== -1) {
                // obj.altelips = elemento.substring(77, 85).replace('.', '');
                // console.log(elemento.split('<td>')[3].split('</td>')[0].split(' ')[0].replace('.', ''))
                obj.altelips = elemento.split('<td>')[3].split('</td>')[0].split(' ')[0].replace('.', '');
              }

              if (elemento.indexOf("M&#225;scara de Elevaci&#243;n:") !== -1) {
                obj.mascara = elemento.substring(98, 106).split('&#176;')[0] + '°';
              }

              if (elemento.indexOf("Sistema de Sat&#233;lites:") !== -1) {
                obj.satelites = elemento.split('<td>')[2].split('</td>')[0];
              }
              
              if (elemento.indexOf("Lectura de la Altura:") !== -1) {                         
                obj.lecturaAltura = elemento.split('<td>')[3].split('</td>')[0];
              }

              if (elemento.indexOf("Altura de Antena:") !== -1) {                
                obj.alturaAntena = elemento.split('<td>')[3].split('</td>')[0];
              }
              if (elemento.indexOf("Tipo de Soluci&#243;n:") !== -1) {
                obj.tipoSolucion = elemento.split('<td>')[2].split('</td>')[0];
              }
              if (elemento.indexOf("M0:") !== -1) {                
                obj.cq1d = elemento.split('<td>')[4].split('</td>')[0];
                obj.m0 = elemento.split('<td>')[2].split('</td>')[0];
              }
              if (elemento.indexOf("Q11:") !== -1) {                
                obj.cq2d = elemento.split('<td>')[4].split('</td>')[0];                
              }
              if (elemento.indexOf("Q12:") !== -1) {                
                obj.cq3d = elemento.split('<td>')[4].split('</td>')[0];
              }
              if (elemento.indexOf("GDOP:") !== -1) {
                obj.gdop = elemento.split('<td>')[4].split('</td>')[0];
              }
              if (elemento.indexOf("Duraci&#243;n:") !== -1) {
                obj.duracion = elemento.split('<td>')[2].split('</td>')[0];
              }
              
              if (elemento.indexOf("Tipo de Efem&#233;rides:") !== -1) {
                if(elemento.split('<td>').length == 4){                  
                  obj.efemerides = elemento.split('<td>')[3].split('</td>')[0];
                }
              } 
              if (elemento.indexOf("Frecuencia:") !== -1) {                                            
                if(elemento.split('<td>').length == 4){                  
                  obj.frecuencia = elemento.split('<td>')[3].split('</td>')[0];
                }else{                  
                  obj.frecuencia = elemento.split('<td>')[2].split('</td>')[0];
                }
              }           
              if (elemento.indexOf("Frecuencias:") !== -1) {                
                if(elemento.split('<td>').length == 4){                  
                  obj.frecuencia = elemento.split('<td>')[3].split('</td>')[0];
                }else{                  
                  obj.frecuencia = elemento.split('<td>')[2].split('</td>')[0];
                }                        
              }                            
              if (elemento.indexOf("Nombre de Antena / SN:") !== -1) {                
                obj.nombreAntena = elemento.split('<td>')[3].split('</td>')[0];                
              }
              if (elemento.indexOf("Cuenta de Saltos de Ciclo:") !== -1) {                      
                obj.saltos = elemento.split('<td>')[2].split('</td>')[0];                
              }
                           

            }

            let arre = JSON.parse(localStorage.getItem('anosPorHtml'))
            arre.push(obj)
            localStorage.setItem('anosPorHtml', JSON.stringify(arre));

            break;
          }


          if (element.indexOf("Start Time - End Time:") !== -1) {
            for (let elemento of e.target.result.split("</tr>")) {

              if (elemento.indexOf("Start Time - End Time:") !== -1) {
                
                const fecha = elemento.substring(89, 100);

                const ano = fecha.substring(6, 10);
                const mes = fecha.substring(3, 5);
                const dia = fecha.substring(0, 2);




                var fechaEjemplo = new Date(ano, mes - 1, dia);
                var diaDelAno = calcularDiaDelAno(fechaEjemplo);

                let anoEpoca = parseInt(ano) + (diaDelAno / 365);

                obj.anoEpoca = anoEpoca;
                obj.fecha = `${ano}/${mes}/${dia}`;
                obj.inicioFin = elemento.split('<td>')[1].split('</td>')[1].split('>')[1];                     

              }


              if (elemento.indexOf("WGS84 Ellip. Height:") !== -1) {                
                obj.altelips = elemento.split('<td>')[3].split('</td>')[0].split(' ')[0].replace('.', '');
              }

              if (elemento.indexOf("Cut-Off Angle:") !== -1) {
                obj.mascara = elemento.split('<td>')[2].split('&#176;')[0] + '°';
              }

              if (elemento.indexOf("Satellite System:") !== -1) {
                obj.satelites = elemento.split('<td>')[2].split('</td>')[0];
              }

              if (elemento.indexOf("Height Reading:") !== -1) {
                obj.lecturaAltura = elemento.split('<td>')[2].split('</td>')[0];
              }

              if (elemento.indexOf("Antenna Height:") !== -1) {
                obj.alturaAntena = elemento.split('<td>')[2].split('</td>')[0];
              }
              if (elemento.indexOf("Solution Type:") !== -1) {
                obj.tipoSolucion = elemento.split('<td>')[2].split('</td>')[0];
              }
              if (elemento.indexOf("M0:") !== -1) {                
                obj.cq1d = elemento.split('<td>')[4].split('</td>')[0];
                obj.m0 = elemento.split('<td>')[2].split('</td>')[0];
              }
              if (elemento.indexOf("Q11:") !== -1) {                
                obj.cq2d = elemento.split('<td>')[4].split('</td>')[0];                
              }
              if (elemento.indexOf("Q12:") !== -1) {                
                obj.cq3d = elemento.split('<td>')[4].split('</td>')[0];
              }
              if (elemento.indexOf("GDOP:") !== -1) {
                obj.gdop = elemento.split('<td>')[4].split('</td>')[0];
              }
              if (elemento.indexOf("Duration:") !== -1) {
                obj.duracion = elemento.split('<td>')[2].split('</td>')[0];
              }
              if (elemento.indexOf("Ephemeris Type:") !== -1) {                
                if(elemento.split('<td>').length == 4){                  
                  obj.efemerides = elemento.split('<td>')[3].split('</td>')[0];
                }
              } 
              if (elemento.indexOf("Frequency:") !== -1) {                                                       
                if(elemento.split('<td>').length == 4){                  
                  obj.frecuencia = elemento.split('<td>')[3].split('</td>')[0];
                }else{                  
                  obj.frecuencia = elemento.split('<td>')[2].split('</td>')[0];
                }
              }     
              if (elemento.indexOf("Antenna Name / SN:") !== -1) {                       
                obj.nombreAntena = elemento.split('<td>')[3].split('</td>')[0];                
              }  
              if (elemento.indexOf("Common Epochs:") !== -1) {                      
                obj.saltos = elemento.split('<td>')[2].split('</td>')[0];                
              }

              // if (elemento.indexOf("Frecuencias:") !== -1) {                
              //   if(elemento.split('<td>').length == 4){                  
              //     obj.frecuencia = elemento.split('<td>')[3].split('</td>')[0];
              //   }else{                  
              //     obj.frecuencia = elemento.split('<td>')[2].split('</td>')[0];
              //   }                        
              // }                            
              



            }

            let arre = JSON.parse(localStorage.getItem('anosPorHtml'))
            arre.push(obj)
            localStorage.setItem('anosPorHtml', JSON.stringify(arre));

            break;
          }



        }

        anosPorHtml.push(obj);

      };
      reader.readAsText(i);
    }
  }

  // === css styles ====
  if (ev.target.files.length) {
    document.getElementById('icono-carpeta').className = 'bi bi-folder-fill';
    document.getElementById('texto-carpeta').innerText = ` Carpeta de LOGFILES cargada.`;
    cambiosVisualesCarga2(ev);
  }
  // ===================

  return anosPorHtml;



});











// cargar los vertices a la tabla 

document.querySelector('#viewDiv').addEventListener('click', async function (e) {
  if (e.target.tagName === 'TD' && e.target.parentNode.firstChild.textContent === 'Nomenclatura') {

    let verticeElegido = {};
    verticeElegido.nombenclatura = e.target.textContent;
    verticeElegido.altura_msnmm = parseFloat(e.target.parentNode.parentNode.children[4].children[1].textContent.replace(/[^\d.-]/g, ''));
    verticeElegido.ondula = parseFloat(e.target.parentNode.parentNode.children[3].children[1].textContent.replace(/[^\d.-]/g, ''));
    verticeElegido.altelips = parseFloat(e.target.parentNode.parentNode.children[2].children[1].textContent.replace(/[^\d.-]/g, ''));

    verticeElegido.latitud = e.target.parentNode.parentNode.children[5].children[1].innerText.replace(/[^\d.-]/g, '');
    verticeElegido.longitud = e.target.parentNode.parentNode.children[6].children[1].innerText.replace(/[^\d.-]/g, '');
    verticeElegido.ano = e.target.parentNode.parentNode.children[9].children[1].innerText.replace(/[^\d.-]/g, '').substring(0, 4);
    console.log("vertice elegido", verticeElegido);

    let datosTabla = "";

    try {

      const tablaVertices = document.getElementById('tablaEntrada');

      // console.log(tablaVertices?.childNodes.length);
      if (tablaVertices?.childNodes.length > 3) {
        return mostrarMensaje('Ya se eligieron los vertices', 'warning');
      }

      mostrarMensaje('El vértice agregado correctamente', 'info');

      const primerVertice = document.getElementById('verticeFuente');

      if (primerVertice) {

        const datosTabla2 = `
        <tr id= "verticeFuente2" 
          data-nomenclatura2="${verticeElegido.nombenclatura}" 
          data-altelips2="${verticeElegido.altelips}"
          data-ondula2="${verticeElegido.ondula}"
          data-altmsnmm2="${verticeElegido.altura_msnmm}"        
          data-latitud2="${verticeElegido.latitud}"
          data-longitud2="${verticeElegido.longitud}"
          data-ano2="${verticeElegido.ano}"
        >
          <th scope="row">${verticeElegido.nombenclatura}</th>
          <td>${verticeElegido.altelips}</td>
          <td>${verticeElegido.ondula}</td>
          <td>${verticeElegido.altura_msnmm}</td>          
          <td>${verticeElegido.latitud}</td>      
          <td>${verticeElegido.longitud}</td>      
          <td>${verticeElegido.ano}</td>      
        </tr>
        `;
        document.getElementById('tablaEntrada').innerHTML += datosTabla2;

      } else {

        datosTabla = `
        <tr id= "verticeFuente" 
          data-nomenclatura="${verticeElegido.nombenclatura}" 
          data-altelips="${verticeElegido.altelips}"
          data-ondula="${verticeElegido.ondula}"
          data-altmsnmm="${verticeElegido.altura_msnmm}"
          data-latitud="${verticeElegido.latitud}"
          data-longitud="${verticeElegido.longitud}"
          data-ano="${verticeElegido.ano}"        
        >
          <th scope="row">${verticeElegido.nombenclatura}</th>
          <td>${verticeElegido.altelips}</td>
          <td>${verticeElegido.ondula}</td>
          <td>${verticeElegido.altura_msnmm}</td>      
           <td>${verticeElegido.latitud}</td>      
          <td>${verticeElegido.longitud}</td>      
          <td>${verticeElegido.ano}</td>        
        </tr>
        `;
        document.getElementById('tablaEntrada').innerHTML = datosTabla;

      }




    } catch (error) {
      console.error(error)
      mostrarMensaje('Error de red, el servidor no responde', 'warning');
    }
  }







});



