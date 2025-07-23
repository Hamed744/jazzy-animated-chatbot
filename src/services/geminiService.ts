interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export async function sendToGemini(
  messages: { role: "user" | "assistant"; content: string }[],
  model: string = "gemini-2.5-flash"
): Promise<string> {
  // Get API key from environment variables (Render.com environment variables)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("کلید API جیمینای یافت نشد. لطفاً کلید VITE_GEMINI_API_KEY را در متغیرهای محیطی Render.com اضافه کنید.");
  }

  // Convert messages to Gemini format
  const geminiMessages: GeminiMessage[] = messages.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));

  const requestBody: GeminiRequest = {
    contents: geminiMessages,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`خطا در ارتباط با جیمینای: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("پاسخ نامعتبر از جیمینای دریافت شد");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error instanceof Error 
      ? error 
      : new Error("خطای غیرمنتظره در ارتباط با جیمینای");
  }
}