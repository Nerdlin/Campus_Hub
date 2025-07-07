import type { NextApiRequest, NextApiResponse } from 'next';

const fetchWeather = async (city: string) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return 'API ключ OpenWeatherMap не найден.';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ru`;
  try {
    const res = await fetch(url);
    if (!res.ok) return 'Не удалось получить погоду.';
    const data = await res.json();
    return `Погода в городе ${data.name}: ${data.weather[0].description}, температура ${data.main.temp}°C.`;
  } catch {
    return 'Ошибка при получении погоды.';
  }
};

const fetchNews = async (country: string = 'ru') => {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return 'API ключ NewsAPI не найден.';
  const url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}&pageSize=3`;
  try {
    const res = await fetch(url);
    if (!res.ok) return 'Не удалось получить новости.';
    const data = await res.json();
    type NewsArticle = { title: string };
    if (!data.articles?.length) return 'Нет свежих новостей.';
    return 'Свежие новости: ' + (data.articles as NewsArticle[]).map((a, i) => `${i+1}) ${a.title}`).join(' ');
  } catch {
    return 'Ошибка при получении новостей.';
  }
};

const fetchExchangeRate = async (from: string, to: string) => {
  const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return 'Не удалось получить курс валют.';
    const data = await res.json();
    if (!data.result) return 'Нет данных по курсу валют.';
    return `Курс ${from.toUpperCase()} к ${to.toUpperCase()}: ${data.result}`;
  } catch {
    return 'Ошибка при получении курса валют.';
  }
};

const fetchTransportSchedule = async (route: string, city: string) => {
  return `Ближайший транспорт по маршруту ${route} в городе ${city} отправляется через 15 минут.`;
};

const fetchCinemaSchedule = async (city: string) => {
  return `Сегодня в городе ${city} идут фильмы: "Дюна 2", "Человек-паук: Через вселенные", "Барби".`;
};

const fetchBellSchedule = async (school: string) => {
  return `Расписание звонков для ${school}: 1 урок — 8:00-8:45, 2 урок — 8:55-9:40, 3 урок — 9:50-10:35, 4 урок — 10:45-11:30.`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { message, history } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'No OpenAI API key' });

  try {
    let externalInfo = '';
    let promptMessage = message;
    // Погода
    const weatherMatch = message.match(/погод[аеуыи]|weather|температур[аеуыи]/i);
    const cityMatch = message.match(/в ([А-Яа-яA-Za-z\- ]+)/i);
    if (weatherMatch) {
      const city = cityMatch ? cityMatch[1].trim() : 'Алматы';
      externalInfo = await fetchWeather(city);
      promptMessage += `\n${externalInfo}`;
    }
    // Новости
    const newsMatch = message.match(/новост[ьи]/i);
    const countryMatch = message.match(/в ([А-Яа-яA-Za-z\- ]+)/i);
    if (newsMatch) {
      // Пробуем получить страну из сообщения, иначе ru
      let country = 'ru';
      if (countryMatch) {
        // Преобразуем страну в ISO-код, если нужно (можно доработать)
        country = countryMatch[1].trim().toLowerCase().slice(0,2);
      }
      externalInfo = await fetchNews(country);
      promptMessage += `\n${externalInfo}`;
    }
    // Курсы валют
    const currencyMatch = message.match(/курс|exchange|([A-Z]{3}) к ([A-Z]{3})|([а-яА-Я]{3,}) к ([а-яА-Я]{3,})/i);
    if (currencyMatch) {
      // Пробуем найти валюты в сообщении
      let from = 'USD', to = 'KZT';
      const codeMatch = message.match(/([A-Z]{3}) к ([A-Z]{3})/i);
      if (codeMatch) {
        from = codeMatch[1].toUpperCase();
        to = codeMatch[2].toUpperCase();
      } else {
        // Пробуем найти по-русски (например, доллар к тенге)
        const ruMatch = message.match(/([а-яА-Я]{3,}) к ([а-яА-Я]{3,})/i);
        if (ruMatch) {
          // Простая замена популярных валют
          const map: Record<string, string> = { 'доллар': 'USD', 'тенге': 'KZT', 'евро': 'EUR', 'рубль': 'RUB', 'рублей': 'RUB', 'руб': 'RUB' };
          from = map[ruMatch[1].toLowerCase()] || 'USD';
          to = map[ruMatch[2].toLowerCase()] || 'KZT';
        }
      }
      externalInfo = await fetchExchangeRate(from, to);
      promptMessage += `\n${externalInfo}`;
    }
    // Транспорт
    const transportMatch = message.match(/автобус|троллейбус|маршрутка|трамвай|поезд|train|bus|route|маршрут/i);
    const routeMatch = message.match(/(\d{1,3})/);
    if (transportMatch && routeMatch) {
      const route = routeMatch[1];
      const city = cityMatch ? cityMatch[1].trim() : 'Алматы';
      externalInfo = await fetchTransportSchedule(route, city);
      promptMessage += `\n${externalInfo}`;
    }
    // Киноафиша
    const cinemaMatch = message.match(/кино|фильм|афиша|cinema|movie/i);
    if (cinemaMatch) {
      const city = cityMatch ? cityMatch[1].trim() : 'Алматы';
      externalInfo = await fetchCinemaSchedule(city);
      promptMessage += `\n${externalInfo}`;
    }
    // Расписание звонков
    const bellMatch = message.match(/звонк|расписание звонков|bell|school schedule/i);
    if (bellMatch) {
      const schoolMatch = message.match(/в ([А-Яа-яA-Za-z\- ]+)/i);
      const school = schoolMatch ? schoolMatch[1].trim() : 'школа';
      externalInfo = await fetchBellSchedule(school);
      promptMessage += `\n${externalInfo}`;
    }

    const systemPrompt = {
      role: 'system',
      content: `Ты — умный, дружелюбный и максимально полезный ассистент для образовательной платформы. Отвечай на вопросы максимально подробно, понятно и корректно. Если не знаешь точного ответа или информация может быть устаревшей — честно сообщи об этом. Если вопрос касается погоды, новостей, курсов валют, транспорта, кино, расписания звонков и другой актуальной информации — используй встроенные сервисы. Если в prompt есть свежая информация, используй её для ответа.`
    };
    const userMessages = Array.isArray(history) && history.length > 0
      ? history
      : [{ role: 'user', content: promptMessage }];
    const messages = [systemPrompt, ...userMessages];
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Ошибка AI';
    res.status(200).json({ text });
  } catch {
    res.status(500).json({ error: 'Ошибка OpenAI API' });
  }
} 