import { GoogleGenAI, Type } from "@google/genai";
import { LipstickAPIResponse } from '../types';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    lipsticks: {
      type: Type.ARRAY,
      description: "A list of lipstick products.",
      items: {
        type: Type.OBJECT,
        properties: {
          brand: {
            type: Type.STRING,
            description: "The brand name of the lipstick."
          },
          shadeName: {
            type: Type.STRING,
            description: "The shade name of the lipstick."
          }
        },
        required: ["brand", "shadeName"]
      }
    }
  },
  required: ["lipsticks"]
};


export const findLipsticksByHex = async (hexCode: string, apiKey: string): Promise<LipstickAPIResponse> => {
  if (!apiKey) {
    throw new Error("Google Gemini API Key is required. Please enter it above.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `You are a beauty expert. Find 6 popular lipstick products that closely match the color with the hex code ${hexCode}. For each lipstick, provide the brand name and the specific shade name.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text;
    
    // Basic check for valid JSON structure
    if (!jsonText.trim().startsWith('{')) {
       throw new Error("Invalid JSON response from API. The model may have returned an unexpected format.");
    }

    const parsedResponse = JSON.parse(jsonText) as LipstickAPIResponse;

    if (!parsedResponse.lipsticks || !Array.isArray(parsedResponse.lipsticks)) {
        throw new Error("Malformed lipstick data in API response");
    }

    return parsedResponse;
  } catch (error) {
    console.error("Error fetching lipstick data from Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided API key is invalid. Please check your key and try again.");
    }
    throw new Error("Failed to fetch lipstick recommendations. Please check your API key and network connection.");
  }
};