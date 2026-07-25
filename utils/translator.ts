import { supabase } from '@/constants/supabase';

const translationCache: Record<string, Record<string, string>> = {
  en: {},
  ru: {},
  uz: {}
};

export const translateFoodNames = async (foodNames: string[], targetLang: string): Promise<Record<string, string>> => {
  if (foodNames.length === 0) return {};
  
  if (!translationCache[targetLang]) {
    translationCache[targetLang] = {};
  }
  
  const toTranslate = foodNames.filter(name => name && !translationCache[targetLang][name]);
  
  if (toTranslate.length === 0) {
    const result: Record<string, string> = {};
    foodNames.forEach(name => {
      if (name) result[name] = translationCache[targetLang][name];
    });
    return result;
  }

  try {
    const { data: secretData } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'OPENAI_API_KEY')
      .single();

    if (!secretData?.value) return {};

    const prompt = `Translate the following list of food names into the language with code '${targetLang}' (e.g., 'uz' for Uzbek, 'ru' for Russian, 'en' for English). Return ONLY a JSON object where keys are the original names and values are the translations. If a name is already in the target language, just return it as is. Do not include markdown formatting.\n\nNames:\n${JSON.stringify(toTranslate)}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretData.value}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      const resultObj = JSON.parse(data.choices[0].message.content);
      
      for (const [original, translated] of Object.entries(resultObj)) {
        translationCache[targetLang][original] = translated as string;
      }
    }

    const finalResult: Record<string, string> = {};
    foodNames.forEach(name => {
      if (name) finalResult[name] = translationCache[targetLang][name] || name;
    });

    return finalResult;
  } catch (e) {
    console.error("Translation error:", e);
    return {};
  }
};
