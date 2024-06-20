localStorage.setItem('verticesOndula', JSON.stringify([]));
localStorage.setItem('anosPorHtml', JSON.stringify([]));



document.querySelector('#calcular').addEventListener('click', async function () {

  if (!document.querySelector("#verticeFuente")) {
    mostrarMensaje('Debe elegir un vertice valido primero', 'info');
    return
  }


  if (JSON.parse(localStorage.getItem('verticesOndula')).length == 0 || JSON.parse(localStorage.getItem('anosPorHtml')).length == 0) {
    mostrarMensaje('Debe ingresar el archivo .asc y la carpeta logfiles', 'info');
    return
  }


  let verticesCompletos = [];

  let arrTexto = JSON.parse(localStorage.getItem('verticesOndula'))
  let arr = JSON.parse(localStorage.getItem('anosPorHtml'))

  let datosXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                          <Proyecto>
                            <Nombre>XML</Nombre>
                            <Calculista>IGAC</Calculista>
                            <Versión>1.0 BETA</Versión>`
    ;

  // AGREGAR ESTACIONES CORS
  datosXml += "<Estaciones_Permanentes>";

  for (let ver of arrTexto) {

    if (ver.tipo == 'CTRL') {
      datosXml += `
          <Punto Nombre="${ver.nombre}">
                <Tipo_Punto>Estación</Tipo_Punto>
                <SubTipo_Punto />
                <Epoca_Punto />
                <Velocidades>
                    <Latitud>0</Latitud>
                    <Longitud>0</Longitud>
                    <X>0</X>
                    <Y>0</Y>
                    <Z>0</Z>
                </Velocidades>
                <Set_de_Coordenadas>
                    <Cartesiana3d_rastreo>
                        <Datum>MAGNA-SIRGAS</Datum>
                        <X>${ver.x}</X>
                        <Y>${ver.y}</Y>
                        <Z>${ver.z}</Z>
                    </Cartesiana3d_rastreo>
                    <Elipsoidal_rastreo>
                        <Datum>MAGNA-SIRGAS</Datum>
                        <Latitud>${ver.lat}</Latitud>
                        <Longitud>${ver.long}</Longitud>
                        <Ondula>${ver.ondula}</Ondula>
                    </Elipsoidal_rastreo>
                </Set_de_Coordenadas>
            </Punto>
          `;
    }

  }

  datosXml += "</Estaciones_Permanentes>";
  // ========= FIN ==============


  // ===== OBTENER VELOCIDADES =======
  let velx = "";
  let vely = "";
  let velz = "";
  for (let vel of arrTexto) {
    if (vel.velx != undefined) {
      velx = parseFloat(vel.velx.replace(",", "."));
      vely = parseFloat(vel.vely.replace(",", "."));
      velz = parseFloat(vel.velz.replace(",", "."));
      break;
    }
  }
  // ===== FIN =======


  for (let coordenadas of arrTexto) {
    let anoEpocaInicial = buscarAnoDeCoordenada(coordenadas, arr); // ejem: 2023.3424

    let deltaDeTiempo = 2020 - anoEpocaInicial;  // ejem: -5.27 

    for (let coordenada of arr) {

      if (coordenadas.nombre === coordenada.name.split(' - ')[1].split('.')[0].trim()) {

        let coordenadaAjustada = convertirCoordenadasITRF2020aITRF2014(coordenadas.x, coordenadas.y, coordenadas.z);
        verticesCompletos.push(
          {
            lat: coordenadas.lat, long: coordenadas.long, nombre: coordenadas.nombre, ondula: coordenadas.ondula,
            tipo: coordenadas.tipo, x: coordenadas.x, y: coordenadas.y, z: coordenadas.z, altelips: coordenada.altelips.replace(",", "."),
            xreferencia: coordenadaAjustada[0] + (velx * deltaDeTiempo),
            yreferencia: coordenadaAjustada[1] + (vely * deltaDeTiempo),
            zreferencia: coordenadaAjustada[2] + (velz * deltaDeTiempo),
            anoEpoca: coordenada.anoEpoca,
            velx: coordenadas.velx,
            vely: coordenadas.vely,
            velz: coordenadas.velz
          }
        );
        break;
      }
    }

  }

  // INICIO XML CABEZERA       

  let baseVertNomen = document.querySelector("#verticeFuente").dataset.nomenclatura;
  let baseVertAlt = document.querySelector("#verticeFuente").dataset.altelips;
  let baseVertondula = document.querySelector("#verticeFuente").dataset.ondula;
  let baseVertAltmsn = document.querySelector("#verticeFuente").dataset.altmsnmm;

  let baseVertNomen2 = document.querySelector("#verticeFuente2").dataset.nomenclatura2;
  let baseVertAlt2 = document.querySelector("#verticeFuente2").dataset.altelips2;
  let baseVertondula2 = document.querySelector("#verticeFuente2").dataset.ondula2;
  let baseVertAltmsn2 = document.querySelector("#verticeFuente2").dataset.altmsnmm2;




  // PUNTO BASE DE NIVELACIÓN
  datosXml += "<Puntos_Base_Nivelación>";
  datosXml += `
        
          <Punto Nombre="${baseVertNomen}">
              <Tipo_Punto>Geodesico</Tipo_Punto>
              <SubTipo_Punto />
              <Epoca_Punto />
              <Altura_Ortométrica>
                  <Valor>${baseVertAltmsn}</Valor>
                  <Año>0.0</Año>
                  <Metodo_Determinación>Geometrica</Metodo_Determinación>
              </Altura_Ortométrica>
              <Ondulación_Geoidal>
                  <Valor>${baseVertondula}</Valor>
                  <Modelo_Geoidal />
              </Ondulación_Geoidal>
              <Velocidades>
                  <Latitud>0</Latitud>
                  <Longitud>0</Longitud>
                  <X>0</X>
                  <Y>0</Y>
                  <Z>0</Z>
              </Velocidades>
              <Set_de_Coordenadas>
                  <Ellipsoidal>
                      <Datum>MAGNA-SIRGAS</Datum>
                      <Latitud>0.0</Latitud>
                      <Longitud>0.0</Longitud>
                      <Altura_Elipsoidal>${baseVertAlt}</Altura_Elipsoidal>
                  </Ellipsoidal>
              </Set_de_Coordenadas>
          </Punto>
        
        `;
  datosXml += "</Puntos_Base_Nivelación>";
  // ====== FIN ============


  // ============ calculos par tabular =========
  let sumatoria = 0;
  let DHG_ANTERIOR_prime = 0;
  let verticesCompletos2 = [...verticesCompletos];
  let verticesCompletos3 = [...verticesCompletos];
  verticesCompletos.push({ nombre: baseVertNomen, altelips: baseVertAlt, ondula: baseVertondula })

  // PROMEDIO DHO
  for (const vert of verticesCompletos) {


    const DHI = parseFloat(vert.altelips) - parseFloat(baseVertAlt);
    const DNI = parseFloat(vert.ondula) - parseFloat(baseVertondula);
    const DHG = DHI - DNI;
    const DHO = DHG - DHG_ANTERIOR_prime;

    DHG_ANTERIOR_prime = DHG;
    sumatoria += DHO
  }

  let diferencia = baseVertAltmsn - baseVertAltmsn;
  console.log("sumatoria", sumatoria)

  let correccion = (diferencia - sumatoria) / (verticesCompletos.length);
  console.log("correcion", correccion)


  // Inicializar resultados
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
  document.querySelector('#calculos').innerHTML += texto;


  // CUERPO DEL DOCUMENTO
  datosXml += "<Puntos_Calculados>";


  console.log(verticesCompletos);

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

    tabular({ DHI, DNI, DHG, HGP, DHO, DHGC, HGPSFINAL }, vertice, 'calculos')

    datosXml += `
    <Punto Nombre="${vertice.nombre}">
    <Tipo_Punto>Recuperado</Tipo_Punto>
      <SubTipo_Punto />
      <Epoca_Punto>Época 2018</Epoca_Punto>
      <Altura_Ortométrica>
          <Valor>${HGPSFINAL}</Valor>
          <Año>2023.0</Año>
          <Metodo_Determinación>Geocol</Metodo_Determinación>
      </Altura_Ortométrica>
      <Ondulación_Geoidal>
          <Valor>${vertice.ondula}</Valor>
          <Modelo_Geoidal>GEOCOL</Modelo_Geoidal>
      </Ondulación_Geoidal>
      <Fecha_de_Captura>
          <Fecha>02/05/2023</Fecha>
          <Hora>00:00:00</Hora>
      </Fecha_de_Captura>
      <Velocidades>
          <Latitud>0.0137</Latitud>
          <Longitud>0.00276</Longitud>
          <X>${vertice.velx}</X>
          <Y>${vertice.vely}</Y>
          <Z>${vertice.velz}</Z>
      </Velocidades>
      <Set_de_Coordenadas>
        <Cartesiana3d_referencia>
            <Datum>MAGNA-SIRGAS</Datum>
            <X>${vertice.xreferencia}</X>
            <Y>${vertice.yreferencia}</Y>
            <Z>${vertice.zreferencia}</Z>
        </Cartesiana3d_referencia>
        <Cartesiana3d_rastreo>
            <Datum>MAGNA-SIRGAS</Datum>
            <X>${vertice.x}</X>
            <Y>${vertice.y}</Y>
            <Z>${vertice.z}</Z>
        </Cartesiana3d_rastreo>
        <Elipsoidal_rastreo>
            <Datum>MAGNA-SIRGAS</Datum>
            <Latitud>4.151332407273033</Latitud>
            <Longitud>-74.8906323223225</Longitud>
            <Altura_Elipsoidal>339.88394</Altura_Elipsoidal>
        </Elipsoidal_rastreo>
        <Elipsoidal_referencia>
            <Datum>MAGNA-SIRGAS</Datum>
            <Latitud>4.151331748518632</Latitud>
            <Longitud>-74.89063245517487</Longitud>
            <Altura_Elipsoidal>${vertice.altelips}</Altura_Elipsoidal>
        </Elipsoidal_referencia>
        <Gauss_referencia>
            <Datum>MAGNA-SIRGAS</Datum>
            <Norte>950852.4727</Norte>
            <Este>909716.27366</Este>
            <Origen>Central</Origen>
        </Gauss_referencia>
      </Set_de_Coordenadas>
    </Punto>          
`;

  }

  // ============ Fin calculos par tabular =========


  // ============ calculos par tabular 2,3 =========
  verticesCompletos2.push({ nombre: baseVertNomen2, altelips: baseVertAlt2, ondula: baseVertondula2 })
  calculoPorTabular(verticesCompletos2, baseVertNomen2, baseVertAlt2, baseVertondula2, baseVertAltmsn2, baseVertAltmsn2, "calculos2");

  verticesCompletos3.push({ nombre: baseVertNomen2, altelips: baseVertAlt2, ondula: baseVertondula2 })
  calculoPorTabular(verticesCompletos3, baseVertNomen, baseVertAlt, baseVertondula, baseVertAltmsn2, baseVertAltmsn, "calculos3");
  // ============ Fin calculos par tabular 2,3 =========

  // ============ Tabular diferencias =========
  tabularDiferencias();
  // ============ Fin tabular diferencias =========




  datosXml += "</Puntos_Calculados>";

  // ETIQUETA DE CIERRE        
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


});




document.querySelector('#descargar').addEventListener('click', function (e) {
  descargarItrf2014('hollaaaa');
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
      for (let i = 3; i < vertices.length; i++) {
        if (vertices[i].length > 0) {
          verticesArray.push(eliminarEspacios(vertices[i]));
        }
      }

    } else {

      if (vertices[0].includes("Latitud")) {
        // GEO.txt
        for (let i = 1; i < vertices.length; i++) {
          if (vertices[i].length > 0) {
            verticesArray.push(eliminarEspacios2(vertices[i]));
          }
        }

      } else {
        // CAR.txt

        for (let i = 1; i < vertices.length; i++) {
          if (vertices[i].length > 0) {
            verticesArray.push(eliminarEspacios3(vertices[i]));
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
    let verticeConOndulacion = [];


    for (let vertice of result) {

      if (vertice.ondula === undefined) {
        const lat = vertice.lat;
        const lon = vertice.long;

        try {
          const resultado = await fetch('./../json/ondulacion.json');
          const arregloOndula = await resultado.json();
          for (let i of arregloOndula) {
            if ((lat <= (i.lat + 0.033) && lat >= (i.lat - 0.0033)) && lon <= (i.lon + 0.033) && lon >= (i.lon - 0.0033)) {

              verticeConOndulacion.push({
                nombre: vertice.nombre, lat: vertice.lat, long: vertice.long, x: vertice.x, y: vertice.y, z: vertice.z,
                tipo: vertice.tipo, ondula: i.alt
              });
            }
          }

        } catch (error) {
          console.log('error', error);
        }

      } else {
        verticeConOndulacion.push({
          nombre: vertice.nombre, lat: vertice.lat, long: vertice.long, x: vertice.x, y: vertice.y, z: vertice.z,
          tipo: vertice.tipo, ondula: vertice.ondula, velx: vertice.velx, vely: vertice.vely, velz: vertice.velz
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
                obj.altelips = elemento.split("</td>")[3].substring(4, 13);
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

              }


              if (elemento.indexOf("Altura Elip WGS84:") !== -1) {
                obj.altelips = elemento.substring(77, 85);
              }



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
    // verticeElegido.altelips = e.target.parentNode.parentNode.children[4].children[1].textContent;
    // verticeElegido.ondula = parseFloat(e.target.parentNode.parentNode.children[11].children[1].textContent.replace(',', '.'));  

    let datosTabla = "";

    try {
      const res = await fetch(`https://redgeodesica-cg.igac.gov.co:8080/api/pasiva/ondulacion/${verticeElegido.nombenclatura}`);
      const datos = await res.json();

      if (!datos.ondula) {
        document.getElementById('tablaEntrada').innerHTML = "";
        return mostrarMensaje('El vértice no tiene infromación de Ondulación', 'warning');
      }

      mostrarMensaje('El vértice agregado correctamente', 'info');

      verticeElegido.altura_msnmm = datos.altura_msnmm;
      verticeElegido.altelips = datos.altura_elipsoidal;
      verticeElegido.ondula = datos.ondula;


      const tablaVertices = document.getElementById('tablaEntrada');

      console.log(tablaVertices?.childNodes.length);
      if (tablaVertices?.childNodes.length > 3) {
        return mostrarMensaje('Ya se eligieron los vertices', 'warning');
      }


      const primerVertice = document.getElementById('verticeFuente');

      if (primerVertice) {

        const datosTabla2 = `
        <tr id= "verticeFuente2" 
          data-nomenclatura2="${verticeElegido.nombenclatura}" 
          data-altelips2="${verticeElegido.altelips}"
          data-ondula2="${verticeElegido.ondula}"
          data-altmsnmm2="${verticeElegido.altura_msnmm}"        
        >
          <th scope="row">${verticeElegido.nombenclatura}</th>
          <td>${verticeElegido.altelips}</td>
          <td>${verticeElegido.ondula}</td>
          <td>${verticeElegido.altura_msnmm}</td>          
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
        
        >
          <th scope="row">${verticeElegido.nombenclatura}</th>
          <td>${verticeElegido.altelips}</td>
          <td>${verticeElegido.ondula}</td>
          <td>${verticeElegido.altura_msnmm}</td>          
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

