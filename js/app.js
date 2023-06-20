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
  // Parámetros de transformación
  var dx = -0.0100;
  var dy = -0.0040;
  var dz = -0.0060;

  // Aplicar la transformación
  var xITRF2014 = parseFloat(x) + dx;
  var yITRF2014 = parseFloat(y) + dy;
  var zITRF2014 = parseFloat(z) + dz;

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
        console.log(e.target.result);
        const lineaVertice = e.target.result.split('\n')[3];
        // const cordenadas = lineaVertice.split('      ');
        //console.log(cordenadas);
        const coordenadas = eliminarEspacios(lineaVertice);
        console.log(convertirCoordenadasITRF2020aITRF2014(coordenadas.x, coordenadas.y, coordenadas.z));
    };
    reader.readAsText(file);
    
    
});


document.querySelector('#cargarHtml').addEventListener('change', (e) => {
    
    let file = e.target.files[0];    
    //console.log(file);   

    let reader = new FileReader();
    reader.onload = (e) => {                


        // arreglo con <tr>
        //console.log(e.target.result.split("<tr>"));
        for(let element of e.target.result.split("</tr>")){
          
          if(element.indexOf("Intervalo de observación:") !== -1){
            // console.log(element)
            // console.log(element.substring(85, 96));

            
            
            const fecha = element.substring(85, 96);
            const ano = fecha.substring(6,10);
            const mes = fecha.substring(3,5);
            const dia = fecha.substring(0,2);
            console.log(ano, mes, dia);
            

            // Ejemplo de uso:
            var fechaEjemplo = new Date(ano, mes-1, dia);
            var diaDelAno = calcularDiaDelAno(fechaEjemplo);
            console.log(ano)
            let anoEpoca = parseInt(ano) + (diaDelAno/365);
            console.log(diaDelAno, anoEpoca);
            
            
            break;
          }
        }        
        
    };
    reader.readAsText(file);
    
    
});



document.getElementById("cargarCarpeta").addEventListener("change",function(ev){
  //console.log(ev.target.files);

  for(let i of ev.target.files){
    if(i.name.indexOf("html") !== -1){
      console.log(i.name);
    }
  }
//   for (i = 0; i < ev.target.files.length; i++) {
//       let file = ev.files[i];
//       console.log(file.name, file.webkitRelativePath, file.size);
//   }

});



