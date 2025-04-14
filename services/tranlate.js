
const deepl = require('deepl-node');

exports.translateText = async (text, targetLang, apiKey = process.env.DEEPL_API_KEY) => {
    if (!apiKey) throw new Error('DeepL API Key no proporcionada.');
    if (!text || !targetLang) throw new Error('Faltan parámetros requeridos: text o targetLang.');

    const translator = new deepl.Translator(apiKey);
    
    try {
        const result = await translator.translateText(
            text,
            null, // DeepL detecta automáticamente el idioma origen
            targetLang,
            {
                formality: 'default', // Opciones: 'more', 'less', 'default'
                preserveFormatting: true,
            }
        );
        return result.text;
    } catch (error) {
        console.error('Error en DeepL:', error.message);
        throw new Error(`Error al traducir: ${error.message}`); // Mensaje más descriptivo
    }
};