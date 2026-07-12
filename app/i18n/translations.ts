export type LangCode = "en" | "fr" | "de" | "fa" | "ar" | "es" | "zh" | "ja";

export interface Strings {
  heroT1: string;
  heroT2: string;
  tagline: string;
  founderHeading: string;
  founderLine0: string;
  founderLine1: string;
  founderLine2: string;
  builtForHeading: string;
  builtForBody: string;
  problemLabel: string;
  problemText: string;
  solutionLabel: string;
  solutionText: string;
  proofQuote: string;
  ctaButton: string;
  iosNotify: string;
  emailPlaceholder: string;
  successMsg: string;
  footerNote: string;
  scrollHint: string;
}

export const RTL_LANGS: LangCode[] = ["fa", "ar"];

export const LANGUAGES: { code: LangCode; flag: string; label: string }[] = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "de", flag: "🇩🇪", label: "DE" },
  { code: "fa", flag: "🇮🇷", label: "FA" },
  { code: "ar", flag: "🇸🇦", label: "AR" },
  { code: "es", flag: "🇲🇽", label: "ES" },
  { code: "zh", flag: "🇨🇳", label: "ZH" },
  { code: "ja", flag: "🇯🇵", label: "JA" },
];

export const translations: Record<LangCode, Strings> = {
  en: {
    heroT1: "Stop deciding.",
    heroT2: "just start.",
    tagline: "TimeBud is an app that decides what to work on next.",
    founderHeading: "me.",
    founderLine0: "I have ADHD.",
    founderLine1: "Choosing what to work on was harder than doing it.",
    founderLine2: "So I built TimeBud — AI plans my sessions so I just start.",
    builtForHeading: "Built for:",
    builtForBody: "Students who can't start tasks. ADHD, undiagnosed focus issues, or just decision-fatigued.",
    problemLabel: "Core problem",
    problemText: "Decision fatigue. Mental energy spent choosing leaves nothing for doing.",
    solutionLabel: "Core solution",
    solutionText: "You tell it how much time you have. AI picks your tasks in order. You just start.",
    proofQuote: "I use TimeBud daily for university finals and building this app. Cut my decision fatigue to zero.",
    ctaButton: "TRY IT FREE →",
    iosNotify: "iOS coming soon. Get notified:",
    emailPlaceholder: "your@email.com",
    successMsg: "you're in. we'll ping you.",
    footerNote: "Free to try. Web version live, iOS coming soon.",
    scrollHint: "Scroll to continue",
  },

  fr: {
    heroT1: "Stop de choisir.",
    heroT2: "Lance-toi.",
    tagline: "TimeBud est une app qui décide sur quoi travailler ensuite.",
    founderHeading: "moi.",
    founderLine0: "J'ai un TDAH.",
    founderLine1: "Choisir sur quoi travailler était plus dur que de le faire.",
    founderLine2: "Alors j'ai créé TimeBud — l'IA planifie mes sessions, je n'ai plus qu'à commencer.",
    builtForHeading: "Fait pour :",
    builtForBody: "Les étudiants qui ne savent pas par où commencer. TDAH, troubles de concentration, ou surcharge de choix.",
    problemLabel: "Le problème",
    problemText: "La fatigue décisionnelle. L'énergie mentale gaspillée à choisir ne laisse rien pour agir.",
    solutionLabel: "La solution",
    solutionText: "Tu lui dis combien de temps tu as. L'IA choisit tes tâches dans l'ordre. Tu commences.",
    proofQuote: "J'utilise TimeBud chaque jour pour mes examens et ce projet. Ma fatigue décisionnelle est tombée à zéro.",
    ctaButton: "ESSAYER GRATUITEMENT →",
    iosNotify: "iOS arrive bientôt. Sois notifié :",
    emailPlaceholder: "ton@email.com",
    successMsg: "c'est dans la boîte. on te ping.",
    footerNote: "Gratuit. Version web disponible, iOS bientôt.",
    scrollHint: "Défile pour continuer",
  },

  de: {
    heroT1: "Hör auf zu wählen.",
    heroT2: "Fang einfach an.",
    tagline: "TimeBud ist eine App, die entscheidet, woran du als nächstes arbeitest.",
    founderHeading: "ich.",
    founderLine0: "Ich habe ADHS.",
    founderLine1: "Aufgaben auszuwählen war schwieriger als sie zu erledigen.",
    founderLine2: "Deshalb habe ich TimeBud gebaut — KI plant meine Sessions, ich fange einfach an.",
    builtForHeading: "Gemacht für:",
    builtForBody: "Studierende, die keine Aufgaben starten können. ADHS, Konzentrationsprobleme oder Entscheidungsmüdigkeit.",
    problemLabel: "Das Problem",
    problemText: "Entscheidungsmüdigkeit. Mentale Energie fürs Wählen lässt nichts fürs Tun übrig.",
    solutionLabel: "Die Lösung",
    solutionText: "Du sagst ihr, wie viel Zeit du hast. Die KI wählt deine Aufgaben. Du fängst einfach an.",
    proofQuote: "Ich nutze TimeBud täglich für Prüfungen und dieses Projekt. Meine Entscheidungsmüdigkeit ist auf null.",
    ctaButton: "KOSTENLOS TESTEN →",
    iosNotify: "iOS kommt bald. Benachrichtigt werden:",
    emailPlaceholder: "deine@email.de",
    successMsg: "du bist dabei. wir melden uns.",
    footerNote: "Kostenlos testen. Web-Version live, iOS bald.",
    scrollHint: "Scrollen zum Fortfahren",
  },

  fa: {
    heroT1: "تصمیم‌گیری را رها کن.",
    heroT2: "فقط شروع کن.",
    tagline: "TimeBud برنامه‌ای است که تصمیم می‌گیرد بعدی روی چه کاری تمرکز کنی.",
    founderHeading: "من.",
    founderLine0: "من ADHD دارم.",
    founderLine1: "انتخاب کار بعدی سخت‌تر از انجام آن بود.",
    founderLine2: "برای همین TimeBud را ساختم — هوش مصنوعی برنامه‌ریزی می‌کند و من فقط شروع می‌کنم.",
    builtForHeading: "ساخته شده برای:",
    builtForBody: "دانشجویانی که نمی‌توانند شروع کنند. ADHD، مشکلات تمرکز یا خستگی از تصمیم‌گیری.",
    problemLabel: "مشکل اصلی",
    problemText: "خستگی از تصمیم‌گیری. انرژی ذهنی که صرف انتخاب می‌شود، چیزی برای انجام کار نمی‌گذارد.",
    solutionLabel: "راه‌حل اصلی",
    solutionText: "می‌گویی چقدر وقت داری. هوش مصنوعی وظایفت را به ترتیب انتخاب می‌کند. فقط شروع می‌کنی.",
    proofQuote: "هر روز برای امتحانات دانشگاه و ساختن این اپ از TimeBud استفاده می‌کنم. خستگی از تصمیم‌گیری‌ام به صفر رسید.",
    ctaButton: "← رایگان امتحان کن",
    iosNotify: "iOS به زودی می‌آید. آگاه شو:",
    emailPlaceholder: "ایمیل@شما.com",
    successMsg: "ثبت شدی. خبرت می‌دیم.",
    footerNote: "رایگان. نسخه وب آنلاین است، iOS به زودی.",
    scrollHint: "برای ادامه اسکرول کن",
  },

  ar: {
    heroT1: "توقف عن الاختيار.",
    heroT2: "ابدأ فقط.",
    tagline: "TimeBud تطبيق يقرر ما الذي ستعمل عليه بعد ذلك.",
    founderHeading: "أنا.",
    founderLine0: "لديّ اضطراب ADHD.",
    founderLine1: "اختيار ما أعمل عليه كان أصعب من العمل نفسه.",
    founderLine2: "لذلك بنيت TimeBud — الذكاء الاصطناعي يخطط جلساتي وأنا أبدأ فقط.",
    builtForHeading: "مصمم لـ:",
    builtForBody: "الطلاب الذين لا يستطيعون البدء. ADHD أو مشاكل تركيز أو إرهاق القرارات.",
    problemLabel: "المشكلة الأساسية",
    problemText: "إرهاق القرارات. الطاقة الذهنية المُصرفة على الاختيار لا تترك شيئاً للعمل.",
    solutionLabel: "الحل الأساسي",
    solutionText: "تخبره بالوقت المتاح. الذكاء الاصطناعي يختار مهامك بالترتيب. تبدأ فقط.",
    proofQuote: "أستخدم TimeBud يومياً للامتحانات وبناء هذا التطبيق. أصبح إرهاق قراراتي صفراً.",
    ctaButton: "← جرب مجاناً",
    iosNotify: "iOS قادم قريباً. احصل على إشعار:",
    emailPlaceholder: "بريدك@الإلكتروني.com",
    successMsg: "سُجّلت. سنُعلمك.",
    footerNote: "مجاني للتجربة. النسخة الإلكترونية متاحة، iOS قريباً.",
    scrollHint: "مرر للأسفل للمتابعة",
  },

  es: {
    heroT1: "Para de decidir.",
    heroT2: "Sólo empieza.",
    tagline: "TimeBud es una app que decide en qué trabajar después.",
    founderHeading: "yo.",
    founderLine0: "Tengo TDAH.",
    founderLine1: "Elegir en qué trabajar era más difícil que hacerlo.",
    founderLine2: "Por eso creé TimeBud — la IA planea mis sesiones y yo sólo empiezo.",
    builtForHeading: "Hecho para:",
    builtForBody: "Estudiantes que no pueden empezar. TDAH, problemas de concentración sin diagnóstico o fatiga de decisiones.",
    problemLabel: "El problema",
    problemText: "Fatiga de decisiones. La energía mental en elegir no deja nada para hacer.",
    solutionLabel: "La solución",
    solutionText: "Le dices cuánto tiempo tienes. La IA elige tus tareas en orden. Sólo empiezas.",
    proofQuote: "Uso TimeBud a diario para finales y para construir esta app. Eliminé mi fatiga de decisiones.",
    ctaButton: "PRUÉBALO GRATIS →",
    iosNotify: "iOS próximamente. Recibe aviso:",
    emailPlaceholder: "tu@correo.com",
    successMsg: "ya estás. te avisamos.",
    footerNote: "Gratis para probar. Web disponible, iOS próximamente.",
    scrollHint: "Desplázate para continuar",
  },

  zh: {
    heroT1: "停止纠结。",
    heroT2: "直接开始。",
    tagline: "TimeBud 是一款帮你决定下一步做什么的应用。",
    founderHeading: "我。",
    founderLine0: "我有 ADHD。",
    founderLine1: "选择做什么比做本身更难。",
    founderLine2: "所以我做了 TimeBud — AI 规划我的时间，我只需要开始。",
    builtForHeading: "为谁而做：",
    builtForBody: "无法开始任务的学生。ADHD、注意力问题，或只是选择疲劳。",
    problemLabel: "核心问题",
    problemText: "决策疲劳。用于选择的精神能量让你无力去做。",
    solutionLabel: "核心解决方案",
    solutionText: "告诉它你有多少时间。AI 按顺序选择你的任务。你只需开始。",
    proofQuote: "我每天用 TimeBud 应对期末考试和开发这个应用。决策疲劳降到了零。",
    ctaButton: "免费试用 →",
    iosNotify: "iOS 即将上线。获取通知：",
    emailPlaceholder: "your@email.com",
    successMsg: "已记录。我们会通知你。",
    footerNote: "免费试用。网页版已上线，iOS 即将推出。",
    scrollHint: "向下滑动继续",
  },

  ja: {
    heroT1: "迷うのをやめよう。",
    heroT2: "とにかく始めよう。",
    tagline: "TimeBud は、次に何をすべきか決めてくれるアプリです。",
    founderHeading: "わたし。",
    founderLine0: "ADHD があります。",
    founderLine1: "何をするか選ぶことが、実際にするよりも難しかった。",
    founderLine2: "だから TimeBud を作りました — AI がセッションを計画してくれる。あとは始めるだけ。",
    builtForHeading: "こんな人のために：",
    builtForBody: "タスクを始められない学生。ADHD、未診断の集中力の問題、または意思決定疲れ。",
    problemLabel: "核心的な問題",
    problemText: "決断疲れ。選ぶことに費やすメンタルエネルギーが、実行する余力を残さない。",
    solutionLabel: "核心的な解決策",
    solutionText: "使える時間を伝えるだけ。AI がタスクを順番に選んでくれる。あとは始めるだけ。",
    proofQuote: "大学の期末試験とこのアプリ開発のために毎日 TimeBud を使っています。決断疲れがゼロになりました。",
    ctaButton: "無料で試す →",
    iosNotify: "iOS は近日公開。通知を受け取る：",
    emailPlaceholder: "your@email.com",
    successMsg: "登録しました。お知らせします。",
    footerNote: "無料でお試し。ウェブ版提供中、iOS 近日公開。",
    scrollHint: "スクロールして続ける",
  },
};
