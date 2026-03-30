/* ── i18n.js — UZ / RU translations ─────────────────────────────
   Usage:
     <span data-i18n="key.name"></span>
     <input data-i18n-placeholder="key.name">
   I18n.set('ru') — saves to localStorage, reloads translations
   I18n.t('key')  — returns translated string
────────────────────────────────────────────────────────────────── */
const I18n = (() => {

  const DICT = {
    uz: {
      /* ── NAV ── */
      'nav.dashboard':   'Dashboard',
      'nav.analyst':     'Tahlil',
      'nav.upload':      'Yuklash',
      'nav.reports':     'Hisobotlar',
      'nav.admin':       'Admin',
      'nav.logout':      'Chiqish',

      /* ── TOPBAR ── */
      'top.title':       'Targeet Dashboard',
      'top.upload_btn':  'Yuklash',
      'top.logout_btn':  'Chiqish',
      'top.period':      '—',

      /* ── LOADING ── */
      'load.checking':   'Tekshirilmoqda...',
      'load.loading':    'Yuklanmoqda...',
      'load.data':       'Ma\'lumotlar yuklanmoqda...',
      'load.admin':      'Admin huquqlari tekshirilmoqda...',
      'load.users':      'Foydalanuvchilar yuklanmoqda...',

      /* ── EMPTY STATE ── */
      'empty.title':     'Hali ma\'lumot yo\'q',
      'empty.sub':       'Dashboardni ko\'rish uchun reklama platformasi Excel hisobotingizni yuklang',
      'empty.cta':       'Excel yuklash',

      /* ── FILTER BAR ── */
      'filter.label':    'Hisobot:',

      /* ── SECTION HEADERS ── */
      'sec.kpis':        'Asosiy ko\'rsatkichlar',
      'sec.funnel':      'Konversiya funnel',
      'sec.analysis':    'Kampaniyalar tahlili',
      'sec.heatmap':     'Performance heatmap',
      'sec.heatmap_sub': '100 = eng yaxshi · 0 = eng past (kampaniyalar bo\'yicha solishtirma ball)',
      'sec.table':       'Kampaniyalar jadvali',

      /* ── KPI LABELS ── */
      'kpi.spend':       'Umumiy xarajat',
      'kpi.results':     'Natijalar',
      'kpi.cpl':         'O\'rtacha CPL',
      'kpi.impressions': 'Impressions',
      'kpi.cpm':         'CPM',
      'kpi.reach':       'Reach',
      'kpi.best_cpl':    'Eng yaxshi CPL',
      'kpi.cr':          'Konversiya',
      'kpi.result_price':'natija narxi',
      'kpi.per_1000':    '1000 ko\'rsatish',
      'kpi.unique':      'noyob foydalanuvchi',
      'kpi.reach_res':   'reach → natija',

      /* ── CHART TITLES ── */
      'chart.cpl':       'CPL — natija narxi (arzondan qimmatlga)',
      'chart.spend':     'Xarajat — kampaniya bo\'yicha ($)',
      'chart.scatter':   'CPM vs CPL — samaradorlik matritsasi',
      'chart.scatter_sub':'Past-chap = ideal',
      'chart.channel':   'Kanal taqqoslash — eng arzon natija',
      'chart.heatmap':   'CPL · CPM · Natijalar · Impressions samaradorligi',
      'chart.channel_empty': 'Bir necha platform faylini yuklang',

      /* ── TABLE HEADERS ── */
      'tbl.campaign':    'Kampaniya',
      'tbl.result_type': 'Natija turi',
      'tbl.status':      'Holat',
      'tbl.spend':       'Xarajat',
      'tbl.results':     'Natijalar',
      'tbl.cpl':         'CPL',
      'tbl.cpm':         'CPM',
      'tbl.impressions': 'Impressions',
      'tbl.reach':       'Reach',

      /* ── ASSISTANT ── */
      'ast.name':        'Targeet Assistant',
      'ast.status':      'Ma\'lumotlarni tahlil qilaman',
      'ast.welcome':     'Marketing ma\'lumotlaringizni tahlil qilaman',
      'ast.welcome_sub': 'Savol bering yoki quyidagi variantlardan tanlang',
      'ast.placeholder': 'Savol yozing... (masalan: qaysi kanal yomoni?)',
      'ast.fab':         'AI Tahlil',
      'ast.q1':          'Qaysi kanal o\'chirilsin?',
      'ast.q2':          'Eng yaxshi kampaniya?',
      'ast.q3':          'Voronkadagi muammo?',
      'ast.q4':          'Bujetni qayta taqsimlash',
      'ast.q5':          'Podratchi uchun savollar',
      'ast.q6':          'Umumiy holat qanday?',

      /* ── INDEX / LOGIN ── */
      'login.loading':   'Tekshirilmoqda...',
      'login.title':     'MARKETING DASHBOARD',
      'login.sub':       'Multi-Platform Analytics',
      'login.tagline':   'Reklamangizni<br>nazorat qiling',
      'login.desc':      'Barcha reklamalarni bir joyda kuzating.<br>Har bir so\'m qaerga ketganini ko\'ring.',
      'login.btn':       'Google bilan kirish',

      /* ── UPLOAD ── */
      'upload.page_title': 'Hisobot yuklash',
      'upload.select':   'Platformani tanlang',
      'upload.drag':     'Excel yoki CSV faylni shu yerga tashlang',
      'upload.or':       'yoki',
      'upload.browse':   'Faylni tanlash',
      'upload.uploading':'Yuklanmoqda...',
      'upload.btn':      'Yuklash',
      'upload.back':     'Dashboardga qaytish',

      /* ── PAYWALL ── */
      'pay.channels':    'Meta Ads · Google Ads · Telegram Ads · Yandex · TikTok · myTarget',
      'pay.title':       'Barcha reklama kanallarini<br><span>bitta platformada</span> kuzating',
      'pay.logout':      'Chiqish',
      'pay.check_title': 'To\'lov qildingizmi?',
      'pay.check_sub':   'Telegramga chek yuborgach, admin 5–15 daqiqada tasdiqlaydi.',
      'pay.check_btn':   '✓ To\'lovni tekshirish',
      'pay.headline':    'Reklamangiz qayerda<br><em>pul isrof qilyapti?</em>',
      'pay.headline_sub':'Excel yuklang → 30 soniyada aniq javob.<br>Zarar beruvchi kampaniyani toping va o\'chiring.',
      'pay.popular':     'Eng ko\'p tanlangan',
      'pay.plan1_name':  '1 Oylik kirish',
      'pay.plan1_hook':  'Test qilib ko\'ring — aqlingiz ketadi',
      'pay.per_month':   'UZS / oy',
      'pay.per_day':     '≈ kuniga 6 667 UZS · bir kofe narxi',
      'pay.f1':          'Barcha 8 platform dashboardi',
      'pay.f2':          'Cheksiz Excel / CSV yuklash',
      'pay.f3':          'CPL, CPM, ROAS, Reach grafiklar',
      'pay.f4':          'Heatmap — zaif kampaniyalarni toping',
      'pay.f5':          'Google Drive avtosaqlovchi',
      'pay.f6':          'AI tahlil assistenti',
      'pay.tg_btn':      'Telegram orqali to\'lash',
      'pay.soon':        'Tez kunda',
      'pay.urgency1':    '⚡ 5 daqiqada faollashtirish · Admin 24/7 javob beradi',
      'pay.plan2_name':  '3 Oylik kirish',
      'pay.plan2_hook':  'Ko\'proq tejang — uzoqroq ishlang',
      'pay.g1':          'Oylikdagi barcha imkoniyatlar',
      'pay.g2':          '2 narxda 3 oy (1 oy gift)',
      'pay.g3':          'Yangi funksiyalarga erta kirish',
      'pay.g4':          'Ustunlik texnik qo\'llab-quvvatlash',
      'pay.g5':          'Shaxsiy onboarding sessiya',
      'pay.urgency2':    '💎 Reklamangiz samarasini 2x oshiring yoki pulni qaytaramiz',
      'pay.trust1':      'Ma\'lumotlaringiz xavfsiz',
      'pay.trust2':      '5 daqiqada faol',
      'pay.trust3':      'Google bilan tizimga kirilgan',
      'pay.chip2':       'hisobot',
      'pay.chip3':       'kerak emas',
      'pay.chip4':       'faollashadi',
      /* ── INDEX trust ── */
      'login.trust1':    'Xavfsiz',
      'login.trust2':    'Ma\'lumotlar himoyalangan',
      'login.trust3':    'Real vaqt',

      /* ── ADMIN ── */
      'admin.title':     'Admin Panel',
      'admin.users':     'Foydalanuvchilar',
      'admin.paid':      'To\'langan',
      'admin.expired':   'Muddati o\'tgan',
      'admin.free':      'Bepul',
      'admin.cancel':    'Bekor',
      'admin.confirm':   'Tasdiqlash',
      'admin.logout':    'Chiqish',

      /* ── HEALTH ── */
      'health.good':     'Yaxshi',
      'health.warn':     'Kuzatish',
      'health.bad':      'Charchagan',

      /* ── APP DYNAMIC ── */
      'kpi.n_campaigns':   'ta kampaniya',
      'kpi.total_results': 'jami natija',
      'kpi.count_ta':      'ta',
    },

    ru: {
      /* ── NAV ── */
      'nav.dashboard':   'Дашборд',
      'nav.analyst':     'Анализ',
      'nav.upload':      'Загрузка',
      'nav.reports':     'Отчёты',
      'nav.admin':       'Админ',
      'nav.logout':      'Выход',

      /* ── TOPBAR ── */
      'top.title':       'Targeet Dashboard',
      'top.upload_btn':  'Загрузить',
      'top.logout_btn':  'Выход',
      'top.period':      '—',

      /* ── LOADING ── */
      'load.checking':   'Проверка...',
      'load.loading':    'Загрузка...',
      'load.data':       'Загрузка данных...',
      'load.admin':      'Проверка прав администратора...',
      'load.users':      'Загрузка пользователей...',

      /* ── EMPTY STATE ── */
      'empty.title':     'Данных пока нет',
      'empty.sub':       'Чтобы увидеть дашборд, загрузите Excel-отчёт рекламной платформы',
      'empty.cta':       'Загрузить Excel',

      /* ── FILTER BAR ── */
      'filter.label':    'Отчёт:',

      /* ── SECTION HEADERS ── */
      'sec.kpis':        'Ключевые показатели',
      'sec.funnel':      'Воронка конверсии',
      'sec.analysis':    'Анализ кампаний',
      'sec.heatmap':     'Тепловая карта',
      'sec.heatmap_sub': '100 = лучший · 0 = худший (сравнительный балл по кампаниям)',
      'sec.table':       'Таблица кампаний',

      /* ── KPI LABELS ── */
      'kpi.spend':       'Общие расходы',
      'kpi.results':     'Результаты',
      'kpi.cpl':         'Средний CPL',
      'kpi.impressions': 'Показы',
      'kpi.cpm':         'CPM',
      'kpi.reach':       'Охват',
      'kpi.best_cpl':    'Лучший CPL',
      'kpi.cr':          'Конверсия',
      'kpi.result_price':'стоимость результата',
      'kpi.per_1000':    '1000 показов',
      'kpi.unique':      'уникальных пользователей',
      'kpi.reach_res':   'охват → результат',

      /* ── CHART TITLES ── */
      'chart.cpl':       'CPL — стоимость результата (от дешёвого к дорогому)',
      'chart.spend':     'Расходы — по кампаниям ($)',
      'chart.scatter':   'CPM vs CPL — матрица эффективности',
      'chart.scatter_sub':'Низ-лево = идеально',
      'chart.channel':   'Сравнение каналов — самый дешёвый результат',
      'chart.heatmap':   'Эффективность CPL · CPM · Результаты · Показы',
      'chart.channel_empty': 'Загрузите файлы нескольких платформ',

      /* ── TABLE HEADERS ── */
      'tbl.campaign':    'Кампания',
      'tbl.result_type': 'Тип результата',
      'tbl.status':      'Статус',
      'tbl.spend':       'Расходы',
      'tbl.results':     'Результаты',
      'tbl.cpl':         'CPL',
      'tbl.cpm':         'CPM',
      'tbl.impressions': 'Показы',
      'tbl.reach':       'Охват',

      /* ── ASSISTANT ── */
      'ast.name':        'Targeet Ассистент',
      'ast.status':      'Анализирую данные',
      'ast.welcome':     'Анализирую ваши маркетинговые данные',
      'ast.welcome_sub': 'Задайте вопрос или выберите вариант ниже',
      'ast.placeholder': 'Введите вопрос... (напр.: какой канал отключить?)',
      'ast.fab':         'AI Анализ',
      'ast.q1':          'Какой канал отключить?',
      'ast.q2':          'Лучшая кампания?',
      'ast.q3':          'Проблема в воронке?',
      'ast.q4':          'Перераспределить бюджет',
      'ast.q5':          'Вопросы для подрядчика',
      'ast.q6':          'Общая картина?',

      /* ── INDEX / LOGIN ── */
      'login.loading':   'Проверка...',
      'login.title':     'MARKETING DASHBOARD',
      'login.sub':       'Multi-Platform Analytics',
      'login.tagline':   'Управляйте<br>своей рекламой',
      'login.desc':      'Отслеживайте всю рекламу в одном месте.<br>Видьте куда уходит каждый доллар.',
      'login.btn':       'Войти через Google',

      /* ── UPLOAD ── */
      'upload.page_title': 'Загрузка отчёта',
      'upload.select':   'Выберите платформу',
      'upload.drag':     'Перетащите Excel или CSV файл сюда',
      'upload.or':       'или',
      'upload.browse':   'Выбрать файл',
      'upload.uploading':'Загрузка...',
      'upload.btn':      'Загрузить',
      'upload.back':     'Вернуться в дашборд',

      /* ── PAYWALL ── */
      'pay.channels':    'Meta Ads · Google Ads · Telegram Ads · Yandex · TikTok · myTarget',
      'pay.title':       'Отслеживайте все рекламные каналы<br><span>в одной платформе</span>',
      'pay.logout':      'Выход',
      'pay.check_title': 'Вы оплатили?',
      'pay.check_sub':   'Отправьте чек в Telegram, админ подтвердит за 5–15 минут.',
      'pay.check_btn':   '✓ Проверить оплату',
      'pay.headline':    'Где ваша реклама<br><em>сжигает деньги?</em>',
      'pay.headline_sub':'Загрузите Excel → ответ за 30 секунд.<br>Найдите убыточные кампании и отключите их.',
      'pay.popular':     'Самый популярный',
      'pay.plan1_name':  'Доступ на 1 месяц',
      'pay.plan1_hook':  'Попробуйте — будете удивлены',
      'pay.per_month':   'UZS / мес',
      'pay.per_day':     '≈ 6 667 UZS в день · цена кофе',
      'pay.f1':          'Дашборд для всех 8 платформ',
      'pay.f2':          'Безлимитная загрузка Excel / CSV',
      'pay.f3':          'Графики CPL, CPM, ROAS, Reach',
      'pay.f4':          'Heatmap — найдите слабые кампании',
      'pay.f5':          'Автосохранение в Google Drive',
      'pay.f6':          'AI-ассистент аналитики',
      'pay.tg_btn':      'Оплатить через Telegram',
      'pay.soon':        'Скоро',
      'pay.urgency1':    '⚡ Активация за 5 минут · Админ отвечает 24/7',
      'pay.plan2_name':  'Доступ на 3 месяца',
      'pay.plan2_hook':  'Экономьте больше — работайте дольше',
      'pay.g1':          'Все возможности месячного плана',
      'pay.g2':          '3 месяца по цене 2 (1 месяц в подарок)',
      'pay.g3':          'Ранний доступ к новым функциям',
      'pay.g4':          'Приоритетная техподдержка',
      'pay.g5':          'Персональная сессия онбординга',
      'pay.urgency2':    '💎 Увеличьте эффективность рекламы в 2x или вернём деньги',
      'pay.trust1':      'Ваши данные в безопасности',
      'pay.trust2':      'Активация за 5 минут',
      'pay.trust3':      'Вход через Google',
      'pay.chip2':       'отчёт',
      'pay.chip3':       'не нужен',
      'pay.chip4':       'активация',
      /* ── INDEX trust ── */
      'login.trust1':    'Безопасно',
      'login.trust2':    'Данные защищены',
      'login.trust3':    'Реальное время',

      /* ── ADMIN ── */
      'admin.title':     'Админ Панель',
      'admin.users':     'Пользователи',
      'admin.paid':      'Оплачено',
      'admin.expired':   'Истекло',
      'admin.free':      'Бесплатно',
      'admin.cancel':    'Отмена',
      'admin.confirm':   'Подтвердить',
      'admin.logout':    'Выход',

      /* ── HEALTH ── */
      'health.good':     'Хорошо',
      'health.warn':     'Наблюдение',
      'health.bad':      'Устал',

      /* ── APP DYNAMIC ── */
      'kpi.n_campaigns':   'кампаний',
      'kpi.total_results': 'всего результатов',
      'kpi.count_ta':      '',
    }
  };

  function getLang() {
    return localStorage.getItem('targeet_lang') || 'uz';
  }

  function set(lang) {
    localStorage.setItem('targeet_lang', lang);
    apply();
    _updateToggle(lang);
  }

  function t(key) {
    const lang = getLang();
    return (DICT[lang] && DICT[lang][key]) || (DICT['uz'] && DICT['uz'][key]) || key;
  }

  function apply() {
    const lang = getLang();
    // textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) el.textContent = val;
    });
    // innerHTML (for <br> etc)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = t(key);
      if (val) el.innerHTML = val;
    });
    // placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val) el.placeholder = val;
    });
    // Update html lang attr
    document.documentElement.lang = lang === 'ru' ? 'ru' : 'uz';
    _updateToggle(lang);
  }

  function _updateToggle(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const l = btn.getAttribute('data-lang');
      btn.classList.toggle('active', l === lang);
    });
  }

  // Auto-apply on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  function _addKeys(extraDict) {
    Object.keys(extraDict).forEach(lang => {
      if (!DICT[lang]) DICT[lang] = {};
      Object.assign(DICT[lang], extraDict[lang]);
    });
    apply();
  }

  return { set, t, apply, getLang, _addKeys };
})();

window.I18n = I18n;
