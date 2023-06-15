// (async () => {
//     try {
//         const datos = await fetch('./../json/estaciones.json');
//         const res = await datos.json();
//         console.log(res);
//     } catch (error) {
//         console.log(error);
//     }
// })();


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
        console.log(e.target.result.split("<tr>"));
    };
    reader.readAsText(file);
    
    
});



document.getElementById("cargarCarpeta").addEventListener("change",function(ev){
  //console.log(ev.target.files);

  for(let i of ev.target.files){
    console.log(i);
  }
//   for (i = 0; i < ev.target.files.length; i++) {
//       let file = ev.files[i];
//       console.log(file.name, file.webkitRelativePath, file.size);
//   }

});



