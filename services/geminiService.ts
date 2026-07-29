
import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

export class GeminiService {
  // Lazily instantiate the GenAI client using the Vite env variable
  private static getAI() {
    return new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  }

  static async refinePrompt(prompt: string): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert prompt engineer for cinematic AI image generators. 
      Refine the following user prompt into a highly detailed, professional, cinematic prompt that includes lighting, camera settings (lens, f-stop), atmosphere, and rendering style (Unreal Engine 5, Octane, etc.).
      
      User Prompt: "${prompt}"
      
      Return ONLY the refined prompt text. No introductory remarks.`,
    });
    
    // Access the .text property directly (not a method)
    return response.text || prompt;
  }

  static async generateImage(
    prompt: string, 
    model: string, 
    aspectRatio: AspectRatio, 
    imageSize?: ImageSize
  ): Promise<string> {
    const ai = this.getAI();
    
    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio,
      }
    };

    // imageSize option is only available for gemini-3-pro-image-preview
    if (model === "gemini-3-pro-image-preview" && imageSize) {
      config.imageConfig.imageSize = imageSize;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: config
    });

    // Iterate through candidates and parts to find the inlineData image part
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image was returned from the model.");
  }
}
