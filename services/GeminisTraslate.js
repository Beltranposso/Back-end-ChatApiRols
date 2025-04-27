const { GoogleGenerativeAI } = require("@google/generative-ai");

// Traductor con Gemini que devuelve idioma detectado y contenido traducido
exports.traducirMensajeGemini = async (mensaje, idiomaObjetivo, rol, apikey = process.env.GOOGLE_API_KEY) => {
  const genAI = new GoogleGenerativeAI(apikey); // reemplaza por tu API key
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Eres un asistente de traducción automática para un sistema de chat entre clientes y asesores.
Recibes mensajes en cualquier idioma y debes traducirlos correctamente, detectando el idioma original.

Debes responder únicamente en formato JSON, con dos claves:
- "idiomaDetectado": el idioma original del mensaje en formato ISO 639-1 (ej: "es", "en", "fr").
- "contenidoTraducido": el mensaje traducido al idioma destino.

No uses comillas triples ni bloques de código (como \`\`\`json).

Ejemplo de salida válida:
{
  "idiomaDetectado": "es",
  "contenidoTraducido": "Hello, how are you?"
}

Rol del emisor: ${rol}
Idioma destino: ${idiomaObjetivo}
Mensaje original:
"""${mensaje}"""
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const output = response.text().trim();


    const cleanOutput = output.replace(/```json|```/g, "").trim();
    console.log("💬 Respuesta de Geminiiiiiiiiiiiiiiiiii:", output);
    return JSON.parse(cleanOutput);
  } catch (e) {
    console.error("❌ Error al parsear la respuesta de Gemini:", e.message);
    throw new Error("Respuesta inesperada de Gemini");
  }
};
