


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




