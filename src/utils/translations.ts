export const translations = {
  en: {
    newChat: 'New Chat',
    describeProblem: 'Define your problem',
    chooseTopic: 'Define your relationship with...',
    placeholder: "Write here...",
    instruction: 'Please describe any challenge you\'re facing in life. Mr. Harmony will help analyze it using the Harmony Model to find the best understanding and solution.',
    welcomeSubtitle: 'We accompany you on your journey of self-discovery toward a more balanced and impactful life.',
    // أضيفت Major Events في نهاية المصفوفة
    topics: ['Life', 'Family', 'Emotions', 'Work', 'Major Events'],
    thinking: 'Mr. Harmony is thinking...',
    hero: {
      whoWeAre: 'Who are we?',
      whoWeAreContent: 'Harmony is an advanced platform dedicated to self-leadership through a practical methodology that helps understand the individual, diagnose imbalances, and redirect behavior and decision-making toward more mature and effective outcomes.',
      ourVision: 'What is our vision?',
      ourVisionContent: 'For Harmony to be a leading platform in self-leadership, empowering individuals to understand and develop themselves through a rigorous scientific methodology — contributing to building a better, more stable, and impactful life.',
      ourMission: 'What is our mission?',
      ourMissionContent: 'Our mission is to empower individuals to understand what drives their thinking, decisions, and behavior — equipping them with practical tools that reinforce strengths, address weaknesses, and elevate the quality of their lives.',
      aboutPlatform: 'About the platform',
      aboutPlatformContent: 'Harmony brings together direct exploration, intelligent assessments, and the ability to create a personalized questionnaire for any challenge — leveraging artificial intelligence to enhance analysis, with full commitment to the privacy and confidentiality of all information.',
      whyChooseUs: 'Why choose us?',
      whyChooseUsContent: 'Because Harmony doesn\'t offer fleeting motivational solutions. Instead, it provides an integrated system for self-understanding, measuring inner coherence, and guiding behavior with precision, high privacy, and solid professional reliability.',
      ourServices: 'What are our services?',
      ourServicesContent: 'We offer direct and customized assessments, certified consultations, and advanced applied workshops — supported by programs and events linked to international CPD professional accreditations, enhancing both training value and professional credibility.',
      aboutShort: 'Harmony is an advanced platform dedicated to self-leadership through a practical methodology that helps understand the individual, diagnose imbalances, and redirect behavior toward more mature and effective outcomes.',
      mainHeading: 'Understand yourself. Lead your decisions. Build a more impactful life.',
      talkToHarmony: 'Talk to Mr. Harmony'
    }
  },
  ar: {
    newChat: 'دردشة جديدة',
    describeProblem: 'حدد مشكلتك',
    chooseTopic: 'حدد موقفك من...',
    placeholder: 'اكتب هنا...',
    instruction: 'حدد أي مشكلة تواجهها في الحياة، وسيساعدك السيد هارموني في تحليلها باستخدام نموذج هارموني للوصول إلى أفضل فهم وحل ممكن.',
    welcomeSubtitle: 'نرافقك في رحلة الذات لحياة أكثر توازنًا وأثرًا.',
    // أضيفت الأحداث الكبرى في نهاية المصفوفة
    topics: ['الأحداث الكبرى', 'الحياة العامة', 'الشؤون الأسرية', 'العلاقات العاطفية', 'المسار المهني'],
    thinking: 'السيد هارموني يفكر...',
    hero: {
      whoWeAre: 'من نحن؟',
      whoWeAreContent: 'هارموني منصة متقدمة تُعنى بقيادة الذات عبر منهج عملي يساعد على فهم الإنسان، وتشخيص الخلل، وإعادة توجيه السلوك والقرار نحو نتائج أكثر نضجًا وفاعلية.',
      ourVision: 'ما هي رؤيتنا؟',
      ourVisionContent: 'أن تكون هارموني منصة رائدة في قيادة الذات، تمكّن الأفراد من فهم ذواتهم وتطويرها بمنهجية علمية رصينة، بما يسهم في بناء حياة أفضل وأكثر استقرارًا وأثرًا.',
      ourMission: 'ما هي رسالتنا؟',
      ourMissionContent: 'تتمثل رسالتنا في تمكين الإنسان من فهم ما يقود تفكيره وقراراته وسلوكه، وتزويده بأدوات تطبيقية تعزز القوة، وتعالج الضعف، وترتقي بجودة حياته.',
      aboutPlatform: 'عن المنصة',
      aboutPlatformContent: 'تجمع هارموني بين التصفح المباشر، والاستبيانات الذكية، وإمكانية إنشاء استبيان تفاعلي ، مع توظيف الذكاء الاصطناعي لتعزيز التحليل، دون حفظ معلومات المتصفح.',
      whyChooseUs: 'لماذا تختارنا؟',
      whyChooseUsContent: 'لأن هارموني لا يقدم حلولًا تحفيزية عابرة، بل يوفّر نظامًا متكاملًا لفهم الذات، وقياس التجانس الداخلي، وتوجيه السلوك بمنهجية ، وموثوقية مهنية راسخة.',
      ourServices: 'ما هي خدماتنا؟',
      ourServicesContent: 'نقدّم تحليل للذات بنقاط قوته وضعفه، ونقدم استشارات، وورشًا تطبيقية معتمدة لتطوير الذات وتوجيه مسار حياة أفضل، عبر وكلائنا في مختلف دول العالم',
      aboutShort: 'هارموني منصة متقدمة تُعنى بقيادة الذات عبر منهج عملي يساعد على فهم الإنسان، وتشخيص الخلل، وإعادة توجيه السلوك والقرار نحو نتائج أكثر نضجًا وفاعلية.',
      mainHeading: 'افهم ذاتك. قُد قراراتك. ابنِ حياة أكثر أثرًا.',
      talkToHarmony: 'تحدث مع السيد هارموني'
    }
  }
} as const;

export type SupportedLang = keyof typeof translations;