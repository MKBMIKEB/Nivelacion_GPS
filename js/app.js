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















document.querySelector('#cargarTexto').addEventListener('change', (e) => {
    
    let file = e.target.files[0];
    //console.log(file);    


    let reader = new FileReader();
    reader.onload = (e) => {        
        console.log(e.target.result);
        console.log(e.target.result.split("\n")[0]);
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



