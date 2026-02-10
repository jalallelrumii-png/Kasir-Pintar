
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Product } from "./types";

export const analyzeBusiness = async (transactions: Transaction[], products: Product[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const summary = {
    totalSales: transactions.reduce((acc, t) => acc + t.total, 0),
    count: transactions.length,
    lowStock: products.filter(p => p.stock < 5).map(p => p.name),
    topSelling: "Based on data provided below",
  };

  const prompt = `
    Context: You are a business analyst for a retail shop using LuminaPOS.
    Data Summary:
    - Total Revenue: Rp ${summary.totalSales}
    - Total Transactions: ${summary.count}
    - Products low on stock: ${summary.lowStock.join(', ') || 'None'}
    
    Recent Transactions:
    ${JSON.stringify(transactions.slice(0, 10), null, 2)}

    Task: Provide a concise (max 200 words) strategic insight in Indonesian. 
    Focus on: What is selling well, what to restock, and one creative promotion idea.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Gagal mendapatkan analisis AI. Pastikan koneksi internet tersedia dan API Key valid.";
  }
};
