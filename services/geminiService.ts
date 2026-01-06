import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Gemini AI client failed to initialize", error);
}

export const polishContent = async (text: string, type: 'progress' | 'request'): Promise<string> => {
  if (!ai) {
    console.warn("API_KEY not found. Returning original text.");
    return text;
  }

  try {
    const model = 'gemini-3-flash-preview';
    let prompt = "";
    
    if (type === 'progress') {
      prompt = `
        你是一个志愿者服务平台的智能助手。
        请将以下志愿者服务记录润色得更加专业、温暖且简洁。
        保留关键事实（做了什么，观察到了什么）。
        
        输入内容: "${text}"
      `;
    } else {
      prompt = `
        你是一个智能助手。
        请将以下正式申请（如资金申请、请假、调班）润色得礼貌、清晰且专业。
        
        输入内容: "${text}"
      `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text;
  }
};