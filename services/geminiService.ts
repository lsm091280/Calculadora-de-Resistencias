import { GoogleGenAI, Type } from '@google/genai';

// API_KEY is automatically provided by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const analyzeResistorImage = async (base64Image: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { 
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Analyze the provided image of a resistor. Identify the color bands from left to right.
            Return ONLY a JSON object with a single key "colors" containing an array of the identified color names in English.
            The color names must be one of the following: "Black", "Brown", "Red", "Orange", "Yellow", "Green", "Blue", "Violet", "Grey", "White", "Gold", "Silver".
            Example for a 4-band resistor: {"colors": ["Brown", "Black", "Orange", "Gold"]}.
            If you cannot identify the colors, return {"colors": []}.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['colors'],
        },
      },
    });

    let jsonString = response.text.trim();
    // Clean up potential markdown code blocks
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.slice(7, -3);
    } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.slice(3, -3);
    }

    const result = JSON.parse(jsonString.trim());


    if (result.colors && Array.isArray(result.colors)) {
        const allowedColors = ["Black", "Brown", "Red", "Orange", "Yellow", "Green", "Blue", "Violet", "Grey", "White", "Gold", "Silver", "None"];
        const validColors = result.colors.filter((color: string) => allowedColors.includes(color));
        if(validColors.length !== result.colors.length) {
            console.warn("Gemini returned invalid color names, filtering them out.", result.colors);
        }
        return validColors;
    } else {
      throw new Error('Invalid JSON response from Gemini API');
    }
  } catch (error) {
    console.error('Error analyzing resistor image:', error);
    throw new Error('No se pudo analizar la imagen. Por favor, intente de nuevo con una foto más clara y bien iluminada.');
  }
};