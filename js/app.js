// (async () => {
//     try {
//         const datos = await fetch('./../json/estaciones.json');
//         const res = await datos.json();
//         console.log(res);
//     } catch (error) {
//         console.log(error);
//     }
// })();



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


function leerArchivoPlano(file){

    let verticesArrayObjetos = [];
    let reader = new FileReader();
    reader.onload = (e) => {        

        let vertices = e.target.result.split('\n');
        
        //console.log(e.target.result);
        for(let i=3; i < vertices.length; i++) {
          if(vertices[i].length > 0){
            verticesArrayObjetos.push(eliminarEspacios(vertices[i]));    
          }
        }       
        let datosTabla = "";
        for(let coordenadas of verticesArrayObjetos) {
          if(coordenadas.tipo != 'CTRL'){                      
        
            datosTabla += `
              <tr>
                <th scope="row">${coordenadas.nombre}</th>
                <td>${coordenadas.x}</td>
                <td>${coordenadas.y}</td>
                <td>${coordenadas.z}</td>
              </tr> 
            `;
            
          }
        }
        document.getElementById('tablaEntrada').innerHTML = datosTabla;
    };
    reader.readAsText(file);
    
    return verticesArrayObjetos;
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
            
            datosTabla += `
              <tr>
                <th scope="row">${coordenadas.nombre}</th>
                <td>${coordenadaAjustada[0] + (0.00460 * deltaDeTiempo)}</td>
                <td>${coordenadaAjustada[1] + (0.00313 * deltaDeTiempo)}</td>
                <td>${coordenadaAjustada[2] + (0.01348 * deltaDeTiempo)}</td>
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
});





document.getElementById("cargarCarpeta").addEventListener("change",function(ev){
  // === css styles ====
  if(ev.target.files.length)  {
    document.getElementById('icono-carpeta').className = 'bi bi-folder-fill';
    document.getElementById('texto-carpeta').innerText = ` Carpeta de LOGFILES cargada.`;
  }
  // ===================
  

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
    
  return anosPorHtml;
  


});











