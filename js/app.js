// (async () => {
//     try {
//         const datos = await fetch('./../json/estaciones.json');
//         const res = await datos.json();
//         console.log(res);
//     } catch (error) {
//         console.log(error);
//     }
// })();

proj4.defs('EPSG:ITRF2020', '+proj=longlat +ellps=GRS80 +datum=GRS80 +no_defs');
proj4.defs('EPSG:ITRF2014', '+proj=longlat +ellps=GRS80 +datum=GRS80 +towgs84=-0.0100,-0.0040,-0.0060,0,0,0,0 +no_defs');

// function convertirCoordenadasITRF2020aITRF20142(longitud, latitud, altura) {  
//   const coordenadasITRF2020 = {
//     x: parseFloat( longitud ),
//     y: parseFloat( latitud ),
//     z: parseFloat( altura ),
//     srid: 'EPSG:ITRF2020'
//   };

//   // Realizar la conversión a ITRF 2014
//   const coordenadasITRF2014 = proj4('EPSG:ITRF2020', 'EPSG:ITRF2014', coordenadasITRF2020);

//   // Extraer las coordenadas convertidas
//   const longitudITRF2014 = coordenadasITRF2014.x;
//   const latitudITRF2014 = coordenadasITRF2014.y;
//   const alturaITRF2014 = coordenadasITRF2014.z;

//   // Retornar las coordenadas convertidas
//   return {
//     longitud: longitudITRF2014,
//     latitud: latitudITRF2014,
//     altura: alturaITRF2014
//   };
// }



function calcularDiaDelAno(fecha) {
  var inicioAño = new Date(fecha.getFullYear(), 0, 0);  
  var tiempoTranscurrido = fecha - inicioAño;  
  
  var milisegundosEnUnDía = 24 * 60 * 60 * 1000;

  var diaDelAño = Math.floor(tiempoTranscurrido / milisegundosEnUnDía);
  return diaDelAño;
}

function convertirCoordenadasITRF2020aITRF2014(x, y, z) { 
    
  let xITRF2014 = parseFloat(x) - 0.002021242273358;
  let yITRF2014 = parseFloat(y) + 0.001201393921252;
  let zITRF2014 = parseFloat(z) + 0.0022414856769;

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
        z:arreglo[3]
    }

    return objeto;
}



document.querySelector('#cargarTexto').addEventListener('change', (e) => {  
   

    let file = e.target.files[0];
        //console.log(file);    

    let reader = new FileReader();
    reader.onload = (e) => {        

        let vertices = e.target.result.split('\n');
        console.log(vertices)
        console.log(e.target.result);
        let verticesArray = [];
        for(let i=3; i < vertices.length-1; i++) {
          verticesArray.push(eliminarEspacios(vertices[i]));
        }
        // console.log(verticesArray)
        // const lineaVertice = e.target.result.split('\n')[3];        
        // const coordenadas = eliminarEspacios(lineaVertice);
        let intervaloEpoca = 2018 - parseFloat(document.getElementById('anoEpoca').innerHTML);
        console.log('ano epoca', intervaloEpoca);
        let datosTabla = "";
        for(let coordenadas of verticesArray) {
          if(coordenadas.nombre.length > 4){
            let coordenadaAjustada = convertirCoordenadasITRF2020aITRF2014(coordenadas.x, coordenadas.y, coordenadas.z);
            console.log('coordenadas itrf2014', coordenadaAjustada);            
            console.log(coordenadas.nombre);
            datosTabla += `
              <tr>
                <th scope="row">${coordenadas.nombre}</th>
                <td>${coordenadaAjustada[0] + (0.00460 * intervaloEpoca)}</td>
                <td>${coordenadaAjustada[1] + (0.00313 * intervaloEpoca)}</td>
                <td>${coordenadaAjustada[2] + (0.01348 * intervaloEpoca)}</td>
              </tr> 
            `;
            console.log();
          }
        }
        document.getElementById('tablaEntrada').innerHTML = datosTabla;
    };
    reader.readAsText(file);
    
    
    
});


document.getElementById("cargarCarpeta").addEventListener("change",function(ev){
  

  
  for(let i of ev.target.files){
    if(i.name.indexOf("html") !== -1){
      console.log(i);

        let reader = new FileReader();
        reader.onload = (e) => {      

        
        for(let element of e.target.result.split("</tr>")){
          
          if(element.indexOf("Intervalo de observación:") !== -1){            
            
            const fecha = element.substring(85, 96);
            const ano = fecha.substring(6,10);
            const mes = fecha.substring(3,5);
            const dia = fecha.substring(0,2);
            console.log(ano, mes, dia);            

            
            var fechaEjemplo = new Date(ano, mes-1, dia);
            var diaDelAno = calcularDiaDelAno(fechaEjemplo);
            console.log(ano)
            let anoEpoca = parseInt(ano) + (diaDelAno/365);
            document.getElementById('anoEpoca').innerHTML = anoEpoca;
            console.log(diaDelAno, anoEpoca);            
            
            
            break;
          }

          if(element.indexOf("Hora Inicio - Hora Fin:") !== -1){            
            
            const fecha = element.substring(90, 100);
            console.log(fecha);
            const ano = fecha.substring(6,10);
            const mes = fecha.substring(3,5);
            const dia = fecha.substring(0,2);
            console.log(ano, mes, dia);
            

            
            var fechaEjemplo = new Date(ano, mes-1, dia);
            var diaDelAno = calcularDiaDelAno(fechaEjemplo);
            console.log(ano)
            let anoEpoca = parseInt(ano) + (diaDelAno/365);
            document.getElementById('anoEpoca').innerHTML = anoEpoca;
            console.log(diaDelAno, anoEpoca);            
            
            
            break;
          }
        }        
        
    };
    reader.readAsText(i);
    break;
      
    }
  }


});




document.querySelector('#calcular').addEventListener('click', function(){
  console.log('Calcular clicked');
  console.log(document.querySelector('#cargarTexto').files);
  console.log(document.querySelector('#cargarTexto').files);
});
