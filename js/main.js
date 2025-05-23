// Prefijo obligatorio que debe contener la orden para ser aceptada (por ejemplo, "ALEXA")
const ordenPrefijo = "ALEXA";

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const outputText = document.getElementById("outputText");
  const msgText = document.getElementById("msgText");

  let recognition;
  let escuchando = false;
  let detenidoManual = false;

  if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = false;
  } else {
    alert("Tu navegador no soporta reconocimiento de voz.");
    return;
  }

  function iniciarReconocimiento() {
    const name = document.getElementById("userName").value.trim();
    if (!name) {
      alert("⚠ Ingresar un nombre");
      return;
    }

    if (escuchando) return;

    escuchando = true;
    detenidoManual = false;
    startBtn.disabled = true;
    startBtn.textContent = "🎤 Escuchando...";
    msgText.innerHTML = "";
    outputText.innerHTML = "Escuchando...";

    recognition.start();
  }

  startBtn.addEventListener("click", iniciarReconocimiento);

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toUpperCase();
    console.log("🔊 Frase reconocida:", transcript);
    outputText.innerHTML = `🗣️ Frase detectada: <strong>${transcript}</strong>`;

    if (transcript.startsWith(ordenPrefijo)) {
      enviarComando(transcript);
    } else {
      outputText.innerHTML += "<br><span class='text-warning'>Debes comenzar con 'ALEXA'.</span>";
    }
  };

  recognition.onerror = (event) => {
    console.error("❌ Error:", event.error);

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      msgText.innerHTML = "❌ Permiso denegado para usar el micrófono.";
    } else if (event.error === "network") {
      msgText.innerHTML = "❌ Error de red al usar el reconocimiento.";
    } else {
      msgText.innerHTML = "❌ Error en el reconocimiento de voz.";
    }

    if (!detenidoManual) {
      recognition.stop();
      setTimeout(() => recognition.start(), 1000);
    } else {
      reiniciarBoton();
    }
  };

  recognition.onend = () => {
    if (!detenidoManual) {
      msgText.innerHTML = "🎤 El reconocimiento se detuvo. Esperando tu voz nuevamente...";
      try {
        recognition.stop();
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.warn("⚠️ No se pudo reiniciar el reconocimiento:", e);
          }
        }, 500);
      } catch (e) {
        console.warn("⚠️ Error al detener el reconocimiento:", e);
      }
    } else {
      reiniciarBoton();
    }
  };

  function reiniciarBoton() {
    escuchando = false;
    startBtn.disabled = false;
    startBtn.textContent = "🎙️ Iniciar Reconocimiento";
  }
// Detener el reconocimiento manualmente
  function enviarComando(frase) {
    const name = document.getElementById("userName").value.trim();
 // Verificar que el nombre no esté vacío
    fetch("http://3.235.168.226/api-gpt-php/endpoints/chat.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: frase, name: name })
    })
      .then(res => res.json())
      .then(data => {
        const respuesta = data.data.reply || "No se recibió respuesta.";
        outputText.innerHTML += `<br>🤖 <strong>${respuesta}</strong>`;

        const voz = new SpeechSynthesisUtterance(respuesta);
        voz.lang = "es-ES";
        voz.rate = 1;

        speechSynthesis.cancel();
        speechSynthesis.speak(voz);

        voz.onend = () => {
          if (escuchando && !detenidoManual) {
            try {
              recognition.stop();
              setTimeout(() => recognition.start(), 500);
            } catch (e) {
              console.warn("⚠️ Error reiniciando reconocimiento tras voz:", e);
            }
          }
        };
      })
      .catch(err => {
        console.error("❌ Error al enviar a la API:", err);
        msgText.innerHTML = "No se pudo conectar con la API.";
        reiniciarBoton();
      });
  }
});
