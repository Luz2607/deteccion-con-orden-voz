// Prefijo que se usará como palabra clave para activar comandos
let ordenPrefijo = "ALEXA";
// Descripción: Este script maneja el reconocimiento de voz en un navegador web, permitiendo a los usuarios interactuar con una aplicación mediante comandos de voz. Utiliza la API de reconocimiento de voz de Webkit y se comunica con un servidor PHP para procesar las solicitudes.
// Espera a que el contenido del DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
  // Obtención de referencias a los elementos del DOM
  const startBtn = document.getElementById("startBtn"); // Botón para iniciar el reconocimiento de voz
  const outputText = document.getElementById("outputText"); // Área donde se mostrará el mensaje detectado
  const msgText = document.getElementById("msgText"); // Mensaje de estado del reconocimiento de voz

  // Mensaje inicial que se mostrará en la interfaz
  outputText.innerHTML = `Di ${ordenPrefijo} para ver el mensaje`;

  let recognition; // Objeto para manejar el reconocimiento de voz
  let stoppedManually = false; // Bandera para determinar si la detención fue manual

  // Verificar si el navegador soporta reconocimiento de voz
  if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition(); // Inicialización del reconocimiento de voz
    recognition.continuous = true; // Permite que la escucha continúe indefinidamente
    recognition.lang = "es-MX"; // Configuración del idioma a español de España
  } else {
    alert("Tu navegador no soporta reconocimiento de voz.");
    return; // Salir del script si el navegador no es compatible
  }

  // Evento de clic en el botón para iniciar el reconocimiento de voz
  startBtn.addEventListener("click", () => {

   
   //MODIFICACION PARA EXAMEN 
    //Añadi la validadción del nombre
 const name = document.getElementById("userName").value.trim();
 // Si no hay nombre, evita iniciar el reconocimiento
 if (!name) {
  alert("⚠️ Debes ingresar un nombre antes de iniciar el micrófono.");
  return;
}


    ordenPrefijo = "ALEXA"; // prefijo fijo
    stoppedManually = false; // Restablece la bandera de detención manual
    recognition.start(); // Inicia el reconocimiento de voz
    startBtn.disabled = true; // Deshabilita el botón mientras se está escuchando
    outputText.textContent = `Escuchando... Di ${ordenPrefijo} para interactuar.`;
    msgText.innerHTML = ""; // Limpia mensajes anteriores
  });

  // Evento que maneja los resultados del reconocimiento de voz
  recognition.onresult = (event) => {
    let transcript = event.results[event.results.length - 1][0].transcript.trim().toUpperCase(); // Obtiene y formatea el texto reconocido
    console.log("Texto reconocido:", transcript);

    // Si el usuario dice "ALEXA DETENTE", se detiene el reconocimiento
    if (transcript.includes(ordenPrefijo + " SALIR")) {
      stoppedManually = true; // Marca que la detención fue manual
      recognition.stop(); // Detiene el reconocimiento
      startBtn.disabled = false; // Habilita nuevamente el botón de inicio
      outputText.textContent = "Detenido. Presiona el botón para comenzar nuevamente.";
      msgText.innerHTML = ""; // Limpia mensajes anteriores
    } 

    //MODIFICACION 

    // Si la frase reconocida contiene la palabra clave "ALEXA", se ejecuta este bloque de código
else if (transcript.includes(ordenPrefijo)) {  
  // Muestra en la interfaz el mensaje detectado, resaltándolo en negritas y cursivas
  outputText.innerHTML = `Mensaje detectado: "<strong><em>${transcript}</em></strong>"`;  
const name = document.getElementById("userName").value || "Anonimo";
  // Envía el mensaje capturado al servidor PHP para obtener una respuesta de la API de OpenAI
  fetch('https://34.232.51.34/api-gpt-php/endpoints/chat.php', {  
      method: 'POST', // Especifica que se está enviando una solicitud POST
      headers: {  
          'Content-Type': 'application/json' // Define el tipo de contenido como JSON
      },
      
      body: JSON.stringify({ message: transcript, name: name }) // Convierte el mensaje en formato JSON antes de enviarlo
  })  
  .then(response => response.json()) // Espera la respuesta del servidor y la convierte en un objeto JSON
  .then(data => {  
      // Verifica si el servidor respondió con un estado 200 (éxito)
      if (data.status === 200) {  
          // Muestra la respuesta de la API en la interfaz (puede ser "avanzar", "detente", "retrocede", etc.)
          msgText.innerHTML = `<strong>${data.data.reply}</strong>`;  
      } else {  
          // Si hubo un error en la respuesta, muestra el mensaje de error recibido del servidor
          msgText.innerHTML = `<strong>Error:</strong> ${data.message}`;  
      }
  })  
  .catch(error => {  
      // Captura cualquier error en la comunicación con el servidor y lo muestra en la interfaz
      console.error("Error:", error);  
      outputText.innerHTML += `<br><strong>Error en la comunicación con el servidor.</strong>`;  
  });

  // Borra cualquier mensaje previo en msgText mientras se procesa la nueva solicitud
  msgText.innerHTML = "";  
}
  };

  // FIN DE LA MODIFICACION 
  
  // Evento que maneja errores en el reconocimiento de voz
  recognition.onerror = (event) => {
    console.error("Error en el reconocimiento:", event.error);
    
    // Manejo de errores específicos
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      alert("Error: El micrófono no tiene permisos o fue bloqueado.");
    } else if (event.error === "network") {
      alert("Error: Problema de conexión con el servicio de reconocimiento de voz.");
    }
    
    recognition.stop(); // Detiene el reconocimiento en caso de error
    startBtn.disabled = false; // Habilita nuevamente el botón
  };

  // Evento que se activa cuando el reconocimiento de voz finaliza
  recognition.onend = () => {
    if (!stoppedManually) {
      // Mensaje indicando que el reconocimiento se detuvo inesperadamente
      msgText.innerHTML = "El reconocimiento de voz se detuvo inesperadamente<br>Habla nuevamente para continuar...";
      recognition.start(); // Reinicia automáticamente el reconocimiento
    }
  };
});
