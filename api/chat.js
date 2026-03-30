// api/chat.js — Vercel serverless function
// Proxies requests to OpenRouter API (supports Claude, GPT, etc).
// Set OPENROUTER_API_KEY in Vercel Environment Variables.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question, dataContext, lang, history = [] } = req.body || {};
  if (!question) return res.status(400).json({ error: 'Missing question' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI not configured' });

  const isRu = lang === 'ru';

  const systemPrompt = isRu
    ? `Ты — персональный маркетинговый аналитик. Знаешь данные этого бизнеса. Отвечаешь прямо, без воды.

Формат каждого ответа:
**ФАКТ:** [конкретная цифра из данных ниже]
**ВЫВОД:** [что это значит для бизнеса — одно предложение]
**ДЕЙСТВИЕ:** [что сделать прямо сейчас]

Правила:
- Только USD ($), никаких рублей
- Не придумывай цифры — только из данных ниже
- Если данных нет — скажи прямо
- Максимум 200 слов
- При сравнении — делай таблицу в тексте (| Канал | CPL | Расход |)
- Заканчивай каждый ответ одним действием которое можно сделать сегодня
- Никаких "возможно", "вероятно" — говори прямо

Не отвечай на вопросы про продукт, найм, юридические темы — верни к маркетингу.

ДАННЫЕ КАМПАНИЙ:
${dataContext || 'Данные не загружены.'}`
    : `Sen shaxsiy marketing analitiksan. Ushbu biznesning ma'lumotlarini bilasan. To'g'ri va qisqa javob berasan.

Har javob formati:
**FAKT:** [quyidagi ma'lumotlardagi aniq raqam]
**XULOSA:** [biznes uchun nima degani — bir gap]
**HARAKAT:** [hozir nima qilish kerak]

Qoidalar:
- Faqat USD ($), rubl emas
- Raqamlarni o'ylab topma — faqat quyidagi ma'lumotlardan
- Ma'lumot yo'q bo'lsa — to'g'ridan-to'g'ri ayt
- Maksimal 200 so'z
- Taqqoslash kerak bo'lsa — jadval qil (| Kanal | CPL | Xarajat |)
- Har javobni bugun bajariladigan bitta harakat bilan tugat
- "ehtimol", "balki" dema — to'g'ri ayt yoki ma'lumot yo'qligini ayt

Mahsulot, yollash, yuridik savollarga javob berma — marketingga qaytarasan.

KAMPANIYA MA'LUMOTLARI:
${dataContext || "Ma'lumot yuklanmagan."}`;

  const messages = [
    ...history.slice(-6),
    { role: 'user', content: question },
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://targeet.uz',
        'X-Title': 'Targeet Dashboard',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        max_tokens: 700,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return res.status(500).json({ error: 'AI API error' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
