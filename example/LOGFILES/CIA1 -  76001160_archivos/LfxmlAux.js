function lfxmlBodyStart( strAdditionalAttribute ) {
   document.write('<body background="');
   lfxmlFilepath();
   document.write('bg.gif"');
   if(strAdditionalAttribute) document.write(' ' + strAdditionalAttribute);
   document.write('>');
}

function lfxmlBodyEnd() {
   document.write('</body>');
}

function lfxmlFilepath() {
   document.write('.\\CIA1 -  76001160_archivos\\');
}

function lfxmlInsertImage( img, alt ) {
   document.write('<img src="');
   lfxmlFilepath();
   document.write(img + '" alt="'+alt+'"/>');
}

function lfxmlInsertHr() {
   document.write('<img src="');
   lfxmlFilepath();
   document.write('Hr.gif" height="2" width="100%"/>');
}