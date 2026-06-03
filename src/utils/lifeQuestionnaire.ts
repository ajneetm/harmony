// Reversed positions (0-indexed): 2, 4, 6, 11, 13, 15, 20, 22, 25
// These are negatively-worded; scoring applies 6 - answer for reversed: true

export const LIFE_QUESTIONNAIRE_AR = {
  category: "في الحياة",
  questions: [
    { id: 1,  reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "شعوري",  text: "أشعر بالطمأنينة حتى عندما أستقبل أحداثًا غير متوقعة." },
    { id: 2,  reversed: false, dimension: "البعد النفسي",   element: "الجاهزية",  type: "معرفي",  text: "أعرف تمامًا ما أحتاجه لكي أكون مستعدًا للتغيير." },
    { id: 3,  reversed: true,  dimension: "البعد الفيزيائي",element: "التفاعل",   type: "سلوكي",  text: "أجد صعوبة في التكيف مع المواقف الصعبة والتفاعل معها بإيجابية." },
    { id: 4,  reversed: false, dimension: "البعد السلوكي",  element: "التطور",    type: "معرفي",  text: "أعرف كيف أتطور فكريًا ونفسيًا عبر تجاربي اليومية." },
    { id: 5,  reversed: true,  dimension: "البعد النفسي",   element: "الإدراك",   type: "سلوكي",  text: "لا أترجم إدراكي لمشكلاتي إلى خطوات عملية لتعديل حياتي." },
    { id: 6,  reversed: false, dimension: "البعد الفيزيائي",element: "الفعل",     type: "شعوري",  text: "أشعر بالرضا عن أفعالي اليومية تجاه أهدافي." },
    { id: 7,  reversed: true,  dimension: "البعد السلوكي",  element: "الأثر",     type: "سلوكي",  text: "لا أستطيع تحسين صورتي وسلوكي بشكل منتظم بما يعكس حقيقتي." },
    { id: 8,  reversed: false, dimension: "البعد النفسي",   element: "النية",     type: "شعوري",  text: "أشعر بإخلاص وصِدق في نواياي تجاه مستقبلي." },
    { id: 9,  reversed: false, dimension: "البعد الفيزيائي",element: "الاستجابة", type: "معرفي",  text: "أتعلم من نتائج أفعالي وأستخلص الدروس." },
    { id: 10, reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "معرفي",  text: "أفهم كيف أستقبل الأحداث والمواقف في حياتي وأفسرها." },
    { id: 11, reversed: false, dimension: "البعد النفسي",   element: "الجاهزية",  type: "سلوكي",  text: "أهيئ نفسي ومحيطي لاتخاذ قرارات تحسن حياتي." },
    { id: 12, reversed: true,  dimension: "البعد الفيزيائي",element: "التفاعل",   type: "معرفي",  text: "أجد صعوبة في فهم أثر أفعالي وقراراتي على من حولي." },
    { id: 13, reversed: false, dimension: "البعد السلوكي",  element: "الأثر",     type: "شعوري",  text: "أشعر بالرضا عن صورتي في عيون نفسي والآخرين." },
    { id: 14, reversed: true,  dimension: "البعد النفسي",   element: "الإدراك",   type: "معرفي",  text: "لا أستطيع تحديد ما ينقصني بوضوح لأعيش حياة أفضل." },
    { id: 15, reversed: false, dimension: "البعد الفيزيائي",element: "الفعل",     type: "سلوكي",  text: "أتحرك بانتظام بخطوات مدروسة نحو حياة أفضل." },
    { id: 16, reversed: true,  dimension: "البعد السلوكي",  element: "التطور",    type: "سلوكي",  text: "لا أستطيع توظيف خبراتي السابقة لتغيير سلوكياتي وتطوير مهاراتي." },
    { id: 17, reversed: false, dimension: "البعد النفسي",   element: "النية",     type: "معرفي",  text: "أحدد بوعي نواياي تجاه ما أريد أن أكونه وأعيشه." },
    { id: 18, reversed: false, dimension: "البعد الفيزيائي",element: "الاستجابة", type: "شعوري",  text: "أشعر بالفخر عندما أرى أثر جهودي على حياتي." },
    { id: 19, reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "سلوكي",  text: "أتعامل مع ما أستقبله من مواقف بوعي وحكمة." },
    { id: 20, reversed: false, dimension: "البعد النفسي",   element: "الجاهزية",  type: "شعوري",  text: "أشعر بالقوة والحماس لبدء خطوات التغيير." },
    { id: 21, reversed: true,  dimension: "البعد الفيزيائي",element: "التفاعل",   type: "شعوري",  text: "أشعر بصعوبة في الانسجام والتواصل الفعلي مع الآخرين." },
    { id: 22, reversed: false, dimension: "البعد السلوكي",  element: "الأثر",     type: "معرفي",  text: "لدي صورة ذهنية واضحة عن نفسي وحياتي كما أريدها أن تكون." },
    { id: 23, reversed: true,  dimension: "البعد النفسي",   element: "الإدراك",   type: "شعوري",  text: "لا أنتبه لمتى أفقد توازني النفسي إلا بعد أن يؤثر على حياتي." },
    { id: 24, reversed: false, dimension: "البعد الفيزيائي",element: "الفعل",     type: "معرفي",  text: "أعرف ما عليّ فعله لأقترب مما أريد." },
    { id: 25, reversed: false, dimension: "البعد السلوكي",  element: "التطور",    type: "شعوري",  text: "أشعر بالفخر عندما أرى نفسي أتحسن وأتطور مع الوقت." },
    { id: 26, reversed: true,  dimension: "البعد النفسي",   element: "النية",     type: "سلوكي",  text: "أجد صعوبة في ترجمة نواياي إلى أفعال ملموسة تحقق لي التوازن." },
    { id: 27, reversed: false, dimension: "البعد الفيزيائي",element: "الاستجابة", type: "سلوكي",  text: "أغير استراتيجياتي عندما أرى أن حياتي تحتاج تعديلاً." }
  ]
};

export const LIFE_QUESTIONNAIRE_EN = {
  category: "In Life",
  questions: [
    { id: 1,  reversed: false, dimension: "Existential Dimension",  element: "Reception",  type: "Emotional",  text: "I feel calm even when I receive unexpected events." },
    { id: 2,  reversed: false, dimension: "Psychological Dimension", element: "Readiness",  type: "Cognitive",  text: "I know exactly what I need to be ready for change." },
    { id: 3,  reversed: true,  dimension: "Physical Dimension",      element: "Interaction",type: "Behavioral", text: "I find it difficult to adapt to challenging situations and respond in a positive way." },
    { id: 4,  reversed: false, dimension: "Existential Dimension",   element: "Evolution",  type: "Cognitive",  text: "I know how I develop intellectually and psychologically through my daily experiences." },
    { id: 5,  reversed: true,  dimension: "Psychological Dimension", element: "Awareness",  type: "Behavioral", text: "I fail to turn my awareness of problems into practical steps to change my life." },
    { id: 6,  reversed: false, dimension: "Physical Dimension",      element: "Action",     type: "Emotional",  text: "I feel satisfied with my daily actions toward my goals." },
    { id: 7,  reversed: true,  dimension: "Existential Dimension",   element: "Impact",     type: "Behavioral", text: "I struggle to consistently improve my behavior and image to reflect who I truly am." },
    { id: 8,  reversed: false, dimension: "Psychological Dimension", element: "Intention",  type: "Emotional",  text: "I feel sincerity and honesty in my intentions toward my future." },
    { id: 9,  reversed: false, dimension: "Physical Dimension",      element: "Response",   type: "Cognitive",  text: "I learn from the results of my actions and extract lessons." },
    { id: 10, reversed: false, dimension: "Existential Dimension",   element: "Reception",  type: "Cognitive",  text: "I understand how I receive and interpret events and situations in my life." },
    { id: 11, reversed: false, dimension: "Psychological Dimension", element: "Readiness",  type: "Behavioral", text: "I prepare myself and my environment to make decisions that improve my life." },
    { id: 12, reversed: true,  dimension: "Physical Dimension",      element: "Interaction",type: "Cognitive",  text: "I find it difficult to understand the impact my actions and decisions have on those around me." },
    { id: 13, reversed: false, dimension: "Existential Dimension",   element: "Impact",     type: "Emotional",  text: "I feel satisfied with my image in my own eyes and those of others." },
    { id: 14, reversed: true,  dimension: "Psychological Dimension", element: "Awareness",  type: "Cognitive",  text: "I am unable to clearly identify what I need to live a better life." },
    { id: 15, reversed: false, dimension: "Physical Dimension",      element: "Action",     type: "Behavioral", text: "I move regularly with calculated steps toward a better life." },
    { id: 16, reversed: true,  dimension: "Existential Dimension",   element: "Evolution",  type: "Behavioral", text: "I am unable to use my past experiences to change my behaviors and develop my skills." },
    { id: 17, reversed: false, dimension: "Psychological Dimension", element: "Intention",  type: "Cognitive",  text: "I consciously define my intentions toward what I want to be and experience." },
    { id: 18, reversed: false, dimension: "Physical Dimension",      element: "Response",   type: "Emotional",  text: "I feel proud when I see the impact of my efforts on my life." },
    { id: 19, reversed: false, dimension: "Existential Dimension",   element: "Reception",  type: "Behavioral", text: "I deal with situations I receive with awareness and wisdom." },
    { id: 20, reversed: false, dimension: "Psychological Dimension", element: "Readiness",  type: "Emotional",  text: "I feel strength and enthusiasm to start taking steps for change." },
    { id: 21, reversed: true,  dimension: "Physical Dimension",      element: "Interaction",type: "Emotional",  text: "I find it difficult to feel harmony and genuine connection in my communication with others." },
    { id: 22, reversed: false, dimension: "Existential Dimension",   element: "Impact",     type: "Cognitive",  text: "I have a clear mental image of myself and my life as I want it to be." },
    { id: 23, reversed: true,  dimension: "Psychological Dimension", element: "Awareness",  type: "Emotional",  text: "I fail to notice when I have lost my psychological balance until it has already affected my life." },
    { id: 24, reversed: false, dimension: "Physical Dimension",      element: "Action",     type: "Cognitive",  text: "I know what I need to do to get closer to what I want." },
    { id: 25, reversed: false, dimension: "Existential Dimension",   element: "Evolution",  type: "Emotional",  text: "I feel proud when I see myself improving and developing over time." },
    { id: 26, reversed: true,  dimension: "Psychological Dimension", element: "Intention",  type: "Behavioral", text: "I find it difficult to translate my intentions into concrete actions that bring balance to my life." },
    { id: 27, reversed: false, dimension: "Physical Dimension",      element: "Response",   type: "Behavioral", text: "I change my strategies when I see that my life needs adjustment." }
  ]
};

export const FAMILY_QUESTIONNAIRE_AR = {
  category: "في الأسرة",
  questions: [
    { id: 1,  reversed: false, dimension: "البعد السلوكي",  element: "التطور",    type: "شعوري",  text: "أشعر بالفخر حين أرى أسرتي تنمو وتتحسن مع الوقت." },
    { id: 2,  reversed: false, dimension: "البعد النفسي",   element: "الجاهزية",  type: "معرفي",  text: "أعرف تمامًا ما يلزم أسرتي لتكون مستعدة لتغيير إيجابي." },
    { id: 3,  reversed: true,  dimension: "البعد الفيزيائي",element: "التفاعل",   type: "سلوكي",  text: "أجد صعوبة في التكيف مع المواقف الأسرية الصعبة والتعامل معها بإيجابية." },
    { id: 4,  reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "معرفي",  text: "أفهم كيف أستقبل الأحداث الأسرية وأفسرها بوعي." },
    { id: 5,  reversed: true,  dimension: "البعد النفسي",   element: "النية",     type: "سلوكي",  text: "لا أستطيع تحويل نواياي الجيدة تجاه الأسرة إلى أفعال تقوي روابطنا." },
    { id: 6,  reversed: false, dimension: "البعد الفيزيائي",element: "الفعل",     type: "شعوري",  text: "أشعر بالرضا عن أفعالي اليومية تجاه أفراد الأسرة." },
    { id: 7,  reversed: true,  dimension: "البعد السلوكي",  element: "الأثر",     type: "سلوكي",  text: "لا أستطيع تحسين صورة أسرتي بشكل منتظم بما يعكس قيمنا الحقيقية." },
    { id: 8,  reversed: false, dimension: "البعد النفسي",   element: "الإدراك",   type: "شعوري",  text: "أشعر متى أكون أنا أو أحد أفراد الأسرة خارج التوازن الحسي." },
    { id: 9,  reversed: false, dimension: "البعد الفيزيائي",element: "الاستجابة", type: "معرفي",  text: "أتعلم من نتائج أفعالي الأسرية وأستخلص الدروس لتحسينها." },
    { id: 10, reversed: false, dimension: "البعد السلوكي",  element: "التطور",    type: "معرفي",  text: "أعرف كيف أتطور أنا وأسرتي فكريًا وعاطفيًا عبر تجاربنا." },
    { id: 11, reversed: false, dimension: "البعد النفسي",   element: "الجاهزية",  type: "سلوكي",  text: "أهيئ نفسي وأفراد أسرتي لاتخاذ قرارات تحسن حياتنا معًا." },
    { id: 12, reversed: true,  dimension: "البعد الفيزيائي",element: "التفاعل",   type: "معرفي",  text: "أجد صعوبة في فهم كيف تؤثر أفعالي على مشاعر وسلوك أفراد الأسرة." },
    { id: 13, reversed: false, dimension: "البعد السلوكي",  element: "الأثر",     type: "شعوري",  text: "أشعر بالرضا عن صورة أسرتي في نظري ونظر الآخرين." },
    { id: 14, reversed: true,  dimension: "البعد النفسي",   element: "الإدراك",   type: "معرفي",  text: "لا أنتبه بسرعة لما تحتاجه أسرتي لتكون أكثر سعادة وانسجامًا." },
    { id: 15, reversed: false, dimension: "البعد الفيزيائي",element: "الفعل",     type: "سلوكي",  text: "أتحرك بخطوات مدروسة لبناء بيئة أسرية أفضل." },
    { id: 16, reversed: true,  dimension: "البعد السلوكي",  element: "الاستقبال", type: "سلوكي",  text: "أتعامل مع ما يصلني من أسرتي بردود فعل فورية دون وعي أو تأمل كافٍ." },
    { id: 17, reversed: false, dimension: "البعد النفسي",   element: "النية",     type: "معرفي",  text: "أحدد بوعي نواياي تجاه دوري في سعادة واستقرار الأسرة." },
    { id: 18, reversed: false, dimension: "البعد الفيزيائي",element: "الاستجابة", type: "شعوري",  text: "أشعر بالفخر عندما أرى أثر جهودي الإيجابية على أسرتي." },
    { id: 19, reversed: false, dimension: "البعد السلوكي",  element: "التطور",    type: "سلوكي",  text: "أغيّر سلوكياتي وأطوّر عاداتنا الأسرية بناءً على تجاربنا." },
    { id: 20, reversed: false, dimension: "البعد النفسي",   element: "الجاهزية",  type: "شعوري",  text: "أشعر بالقوة والحماس لتحسين حياتنا الأسرية." },
    { id: 21, reversed: true,  dimension: "البعد الفيزيائي",element: "التفاعل",   type: "شعوري",  text: "أشعر بتوتر أو عدم انسجام في كثير من تواصلي مع أفراد أسرتي." },
    { id: 22, reversed: false, dimension: "البعد السلوكي",  element: "الأثر",     type: "معرفي",  text: "لدي صورة ذهنية واضحة عن أسرتي كما أريد أن تكون." },
    { id: 23, reversed: true,  dimension: "البعد النفسي",   element: "الإدراك",   type: "سلوكي",  text: "أجد صعوبة في اتخاذ خطوات فعلية لتعديل الأجواء الأسرية حتى حين أدرك وجود مشكلة." },
    { id: 24, reversed: false, dimension: "البعد الفيزيائي",element: "الفعل",     type: "معرفي",  text: "أعرف ما يجب عليّ فعله لأجعل أسرتي أقرب وأكثر تماسكًا." },
    { id: 25, reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "شعوري",  text: "أشعر بالطمأنينة حتى في مواجهة مواقف أسرية مفاجئة." },
    { id: 26, reversed: true,  dimension: "البعد النفسي",   element: "النية",     type: "شعوري",  text: "أجد صعوبة في الشعور بصدق حقيقي في رغبتي لتحسين علاقتي بأسرتي." },
    { id: 27, reversed: false, dimension: "البعد الفيزيائي",element: "الاستجابة", type: "سلوكي",  text: "أغير استراتيجياتي إذا لاحظت أن أسرتي تحتاج توجهًا آخر." }
  ]
};

export const FAMILY_QUESTIONNAIRE_EN = {
  category: "In Family",
  questions: [
    { id: 1,  reversed: false, dimension: "Existential Dimension",  element: "Evolution",  type: "Emotional",  text: "I feel proud when I see my family growing and improving over time." },
    { id: 2,  reversed: false, dimension: "Psychological Dimension", element: "Readiness",  type: "Cognitive",  text: "I know exactly what my family needs to be ready for positive change." },
    { id: 3,  reversed: true,  dimension: "Physical Dimension",      element: "Interaction",type: "Behavioral", text: "I find it difficult to adapt to challenging family situations and respond positively." },
    { id: 4,  reversed: false, dimension: "Existential Dimension",   element: "Reception",  type: "Cognitive",  text: "I understand how I receive and consciously interpret family events." },
    { id: 5,  reversed: true,  dimension: "Psychological Dimension", element: "Intention",  type: "Behavioral", text: "I fail to translate my good intentions toward my family into actions that strengthen our bonds." },
    { id: 6,  reversed: false, dimension: "Physical Dimension",      element: "Action",     type: "Emotional",  text: "I feel satisfied with my daily actions toward family members." },
    { id: 7,  reversed: true,  dimension: "Existential Dimension",   element: "Impact",     type: "Behavioral", text: "I struggle to consistently improve my family's image in a way that reflects our true values." },
    { id: 8,  reversed: false, dimension: "Psychological Dimension", element: "Awareness",  type: "Emotional",  text: "I feel when I or a family member is out of emotional balance." },
    { id: 9,  reversed: false, dimension: "Physical Dimension",      element: "Response",   type: "Cognitive",  text: "I learn from the results of my family actions and extract lessons to improve them." },
    { id: 10, reversed: false, dimension: "Existential Dimension",   element: "Evolution",  type: "Cognitive",  text: "I know how my family and I develop intellectually and emotionally through our experiences." },
    { id: 11, reversed: false, dimension: "Psychological Dimension", element: "Readiness",  type: "Behavioral", text: "I prepare myself and my family members to make decisions that improve our life together." },
    { id: 12, reversed: true,  dimension: "Physical Dimension",      element: "Interaction",type: "Cognitive",  text: "I find it difficult to understand how my actions affect the feelings and behavior of family members." },
    { id: 13, reversed: false, dimension: "Existential Dimension",   element: "Impact",     type: "Emotional",  text: "I feel satisfied with my family's image in my eyes and others' eyes." },
    { id: 14, reversed: true,  dimension: "Psychological Dimension", element: "Awareness",  type: "Cognitive",  text: "I fail to quickly notice what my family needs to be happier and more harmonious." },
    { id: 15, reversed: false, dimension: "Physical Dimension",      element: "Action",     type: "Behavioral", text: "I move with calculated steps to build a better family environment." },
    { id: 16, reversed: true,  dimension: "Existential Dimension",   element: "Reception",  type: "Behavioral", text: "I tend to react impulsively to what comes from my family without enough awareness or reflection." },
    { id: 17, reversed: false, dimension: "Psychological Dimension", element: "Intention",  type: "Cognitive",  text: "I consciously define my intentions regarding my role in family happiness and stability." },
    { id: 18, reversed: false, dimension: "Physical Dimension",      element: "Response",   type: "Emotional",  text: "I feel proud when I see the positive impact of my efforts on my family." },
    { id: 19, reversed: false, dimension: "Existential Dimension",   element: "Evolution",  type: "Behavioral", text: "I change my behaviors and develop our family habits based on our experiences." },
    { id: 20, reversed: false, dimension: "Psychological Dimension", element: "Readiness",  type: "Emotional",  text: "I feel strength and enthusiasm for improving our family life." },
    { id: 21, reversed: true,  dimension: "Physical Dimension",      element: "Interaction",type: "Emotional",  text: "I often feel tension or disconnection in my communication with family members." },
    { id: 22, reversed: false, dimension: "Existential Dimension",   element: "Impact",     type: "Cognitive",  text: "I have a clear mental image of my family as I want it to be." },
    { id: 23, reversed: true,  dimension: "Psychological Dimension", element: "Awareness",  type: "Behavioral", text: "I find it difficult to take concrete steps to improve the family atmosphere even when I recognize a problem." },
    { id: 24, reversed: false, dimension: "Physical Dimension",      element: "Action",     type: "Cognitive",  text: "I know what I should do to make my family closer and more cohesive." },
    { id: 25, reversed: false, dimension: "Existential Dimension",   element: "Reception",  type: "Emotional",  text: "I feel calm even when facing unexpected family situations." },
    { id: 26, reversed: true,  dimension: "Psychological Dimension", element: "Intention",  type: "Emotional",  text: "I find it difficult to feel genuine sincerity in my desire to improve my relationship with my family." },
    { id: 27, reversed: false, dimension: "Physical Dimension",      element: "Response",   type: "Behavioral", text: "I change my strategies if I notice that my family needs a different approach." }
  ]
};


// Function to get life questions in fixed pre-randomized order
export const getRandomizedLifeQuestions = (language: 'ar' | 'en' = 'ar') => {
  const questionnaire = language === 'ar' ? LIFE_QUESTIONNAIRE_AR : LIFE_QUESTIONNAIRE_EN;
  return questionnaire.questions.map((question, index) => ({
    id: index + 1,
    text: question.text,
    reversed: question.reversed,
    originalId: question.id,
    dimension: question.dimension,
    element: question.element,
    type: question.type
  }));
};

export const ROMANTIC_QUESTIONNAIRE_AR = {
  category: "في العلاقات العاطفية",
  questions: [
    { id: 1,  reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "سلوكي",  text: "أتعامل مع ما يصلني من شريكي بلباقة وحكمة." },
    { id: 2,  reversed: false, dimension: "البعد النفسي",   element: "النية",     type: "معرفي",  text: "أرسم بوضوح ما أريد أن تكون عليه هذه العلاقة وأحدد مقصدي." },
    { id: 3,  reversed: true,  dimension: "البعد الفيزيائي",element: "التفاعل",   type: "شعوري",  text: "أجد صعوبة في الشعور بالانسجام الحقيقي عند تبادل الحب مع شريكي." },
    { id: 4,  reversed: false, dimension: "البعد السلوكي",  element: "التطور",    type: "معرفي",  text: "أرى كيف أنضج وأتطور أنا وعلاقتي مع مرور التجارب." },
    { id: 5,  reversed: true,  dimension: "البعد النفسي",   element: "الجاهزية",  type: "سلوكي",  text: "لا أجهز نفسي أو ظروفي لتهيئة أجواء صحية ومريحة مع شريكي." },
    { id: 6,  reversed: false, dimension: "البعد الفيزيائي",element: "الفعل",     type: "شعوري",  text: "يرضيني ما أفعله يوميًا للحفاظ على الحب والود بيننا." },
    { id: 7,  reversed: true,  dimension: "البعد السلوكي",  element: "الأثر",     type: "سلوكي",  text: "لا أحافظ على جهد منتظم لتحسين صورة علاقتي والعناية بها." },
    { id: 8,  reversed: false, dimension: "البعد النفسي",   element: "الإدراك",   type: "شعوري",  text: "ألتقط إحساسي حين أبتعد عن حالة الطمأنينة مع شريكي." },
    { id: 9,  reversed: false, dimension: "البعد الفيزيائي",element: "الاستجابة", type: "معرفي",  text: "أتعلم من المواقف السابقة لأتفادى الأخطاء وأحسن الاختيارات." },
    { id: 10, reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "معرفي",  text: "أعي جيدًا كيف أتلقى مواقف الحب والخذلان وأفسرها بوعي." },
    { id: 11, reversed: false, dimension: "البعد النفسي",   element: "النية",     type: "سلوكي",  text: "أترجم نواياي إلى مواقف وأفعال تجعلنا أقرب وأكثر انسجامًا." },
    { id: 12, reversed: true,  dimension: "البعد الفيزيائي",element: "التفاعل",   type: "معرفي",  text: "أجد صعوبة في تحويل نواياي الجيدة تجاه شريكي إلى أفعال ملموسة تقربنا." },
    { id: 13, reversed: false, dimension: "البعد السلوكي",  element: "الأثر",     type: "شعوري",  text: "أشعر بالرضا عن نفسي وعن صورتنا معًا أمام أنفسنا والآخرين." },
    { id: 14, reversed: true,  dimension: "البعد النفسي",   element: "الإدراك",   type: "معرفي",  text: "لا أنتبه إلى ما يفتقده قلبي وعلاقتي لأشعر بالرضا الحقيقي." },
    { id: 15, reversed: false, dimension: "البعد الفيزيائي",element: "الفعل",     type: "سلوكي",  text: "ألتزم بخطوات عملية ومنتظمة لتحسين علاقتنا وتطويرها." },
    { id: 16, reversed: true,  dimension: "البعد السلوكي",  element: "التطور",    type: "شعوري",  text: "أجد صعوبة في الشعور بالاعتزاز بعلاقتي أو برؤية النمو الحقيقي بيننا." },
    { id: 17, reversed: false, dimension: "البعد النفسي",   element: "الجاهزية",  type: "معرفي",  text: "لدي وعي بما يجب أن أفعله لأكون حاضرًا ومستعدًا لدعم علاقتنا." },
    { id: 18, reversed: false, dimension: "البعد الفيزيائي",element: "الاستجابة", type: "شعوري",  text: "يغمرني الفخر عندما أرى أثر جهودي في سعادة شريكي." },
    { id: 19, reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "شعوري",  text: "أشعر بالهدوء حتى في مواجهة مواقف عاطفية غير متوقعة." },
    { id: 20, reversed: false, dimension: "البعد النفسي",   element: "النية",     type: "شعوري",  text: "أشعر بصدق وعمق في رغبتي بإنجاح العلاقة والاعتناء بها." },
    { id: 21, reversed: true,  dimension: "البعد الفيزيائي",element: "التفاعل",   type: "سلوكي",  text: "أشك أحيانًا في صدق ومدى عمق رغبتي في العناية بعلاقتي وإنجاحها." },
    { id: 22, reversed: false, dimension: "البعد السلوكي",  element: "الأثر",     type: "معرفي",  text: "لدي رؤية واضحة لما أريد أن تبدو عليه هذه العلاقة في المستقبل." },
    { id: 23, reversed: true,  dimension: "البعد النفسي",   element: "الإدراك",   type: "سلوكي",  text: "أفتقر إلى رؤية واضحة لما أريده من هذه العلاقة في المستقبل." },
    { id: 24, reversed: false, dimension: "البعد الفيزيائي",element: "الفعل",     type: "معرفي",  text: "أعلم ما هي الخطوات التي تقرّبني من بناء علاقة قوية ودافئة." },
    { id: 25, reversed: false, dimension: "البعد السلوكي",  element: "التطور",    type: "سلوكي",  text: "أطوّر تصرفاتي وأعدل أسلوبي بما يخدم حبنا ويقويه." },
    { id: 26, reversed: true,  dimension: "البعد النفسي",   element: "الجاهزية",  type: "شعوري",  text: "أجد صعوبة في تحريك الحماس والشجاعة لإحداث فرق إيجابي حقيقي في علاقتي." },
    { id: 27, reversed: false, dimension: "البعد الفيزيائي",element: "الاستجابة", type: "سلوكي",  text: "أغير نهجي وأسلوبي عند الحاجة للحفاظ على صحة العلاقة." }
  ]
};

export const ROMANTIC_QUESTIONNAIRE_EN = {
  category: "In Romantic Relationships",
  questions: [
    { id: 1,  reversed: false, dimension: "Existential Dimension",  element: "Reception",  type: "Behavioral", text: "I deal with what I receive from my partner with tact and wisdom." },
    { id: 2,  reversed: false, dimension: "Psychological Dimension", element: "Intention",  type: "Cognitive",  text: "I clearly draw what I want this relationship to be like and define my purpose." },
    { id: 3,  reversed: true,  dimension: "Physical Dimension",      element: "Interaction",type: "Emotional",  text: "I find it difficult to feel genuine harmony when exchanging love and appreciation with my partner." },
    { id: 4,  reversed: false, dimension: "Existential Dimension",   element: "Evolution",  type: "Cognitive",  text: "I see how I mature and develop along with my relationship through experiences." },
    { id: 5,  reversed: true,  dimension: "Psychological Dimension", element: "Readiness",  type: "Behavioral", text: "I fail to prepare myself or my environment to create a healthy and comfortable atmosphere with my partner." },
    { id: 6,  reversed: false, dimension: "Physical Dimension",      element: "Action",     type: "Emotional",  text: "I am satisfied with what I do daily to maintain love and affection between us." },
    { id: 7,  reversed: true,  dimension: "Existential Dimension",   element: "Impact",     type: "Behavioral", text: "I fail to maintain consistent effort to improve and care for the image of my relationship." },
    { id: 8,  reversed: false, dimension: "Psychological Dimension", element: "Awareness",  type: "Emotional",  text: "I catch my feeling when I move away from a state of tranquility with my partner." },
    { id: 9,  reversed: false, dimension: "Physical Dimension",      element: "Response",   type: "Cognitive",  text: "I learn from previous situations to avoid mistakes and make better choices." },
    { id: 10, reversed: false, dimension: "Existential Dimension",   element: "Reception",  type: "Cognitive",  text: "I am well aware of how I receive situations of love and disappointment and interpret them consciously." },
    { id: 11, reversed: false, dimension: "Psychological Dimension", element: "Intention",  type: "Behavioral", text: "I translate my intentions into situations and actions that make us closer and more harmonious." },
    { id: 12, reversed: true,  dimension: "Physical Dimension",      element: "Interaction",type: "Cognitive",  text: "I find it difficult to translate my good intentions toward my partner into actions that bring us closer." },
    { id: 13, reversed: false, dimension: "Existential Dimension",   element: "Impact",     type: "Emotional",  text: "I feel satisfied with myself and our image together before ourselves and others." },
    { id: 14, reversed: true,  dimension: "Psychological Dimension", element: "Awareness",  type: "Cognitive",  text: "I fail to notice what my heart and relationship lack in order to feel genuine satisfaction." },
    { id: 15, reversed: false, dimension: "Physical Dimension",      element: "Action",     type: "Behavioral", text: "I commit to practical and regular steps to improve and develop our relationship." },
    { id: 16, reversed: true,  dimension: "Existential Dimension",   element: "Evolution",  type: "Emotional",  text: "I find it difficult to feel proud of my relationship or to recognize genuine growth between us." },
    { id: 17, reversed: false, dimension: "Psychological Dimension", element: "Readiness",  type: "Cognitive",  text: "I am aware of what I should do to be present and ready to support our relationship." },
    { id: 18, reversed: false, dimension: "Physical Dimension",      element: "Response",   type: "Emotional",  text: "I am filled with pride when I see the impact of my efforts on my partner's happiness." },
    { id: 19, reversed: false, dimension: "Existential Dimension",   element: "Reception",  type: "Emotional",  text: "I feel calm even when facing unexpected emotional situations." },
    { id: 20, reversed: false, dimension: "Psychological Dimension", element: "Intention",  type: "Emotional",  text: "I feel sincerity and depth in my desire to make the relationship successful and care for it." },
    { id: 21, reversed: true,  dimension: "Physical Dimension",      element: "Interaction",type: "Behavioral", text: "I sometimes doubt the sincerity and depth of my desire to nurture and make my relationship succeed." },
    { id: 22, reversed: false, dimension: "Existential Dimension",   element: "Impact",     type: "Cognitive",  text: "I have a clear vision of what I want this relationship to look like in the future." },
    { id: 23, reversed: true,  dimension: "Psychological Dimension", element: "Awareness",  type: "Behavioral", text: "I lack a clear vision of what I want from this relationship in the future." },
    { id: 24, reversed: false, dimension: "Physical Dimension",      element: "Action",     type: "Cognitive",  text: "I know what steps bring me closer to building a strong and warm relationship." },
    { id: 25, reversed: false, dimension: "Existential Dimension",   element: "Evolution",  type: "Behavioral", text: "I develop my behaviors and adjust my style in a way that serves our love and strengthens it." },
    { id: 26, reversed: true,  dimension: "Psychological Dimension", element: "Readiness",  type: "Emotional",  text: "I find it difficult to muster the enthusiasm and courage to make a meaningful positive difference in my relationship." },
    { id: 27, reversed: false, dimension: "Physical Dimension",      element: "Response",   type: "Behavioral", text: "I change my approach and style when needed to maintain the health of the relationship." }
  ]
};


// Function to get family questions in fixed pre-randomized order
export const getRandomizedFamilyQuestions = (language: 'ar' | 'en' = 'ar') => {
  const questionnaire = language === 'ar' ? FAMILY_QUESTIONNAIRE_AR : FAMILY_QUESTIONNAIRE_EN;
  return questionnaire.questions.map((question, index) => ({
    id: index + 1,
    text: question.text,
    reversed: question.reversed,
    originalId: question.id,
    dimension: question.dimension,
    element: question.element,
    type: question.type
  }));
};

export const WORK_QUESTIONNAIRE_AR = {
  category: "في العمل",
  questions: [
    { id: 1,  reversed: false, dimension: "البعد السلوكي", element: "التطور",    type: "سلوكي",  text: "أطور من نفسي باستمرار بما ينسجم مع ذاتي ويحقق طموحاتي." },
    { id: 2,  reversed: false, dimension: "البعد النفسي",  element: "النية",     type: "معرفي",  text: "أضع نية واضحة لتحسين علاقتي مع نفسي في بيئة العمل." },
    { id: 3,  reversed: true,  dimension: "البعد النفسي",  element: "التفاعل",   type: "شعوري",  text: "أجد صعوبة في الشعور بالانسجام بين تصرفاتي في العمل وقيمي ومبادئي." },
    { id: 4,  reversed: false, dimension: "البعد السلوكي", element: "الاستقبال", type: "معرفي",  text: "أفهم كيف أستقبل التحديات والإنجازات وأفسرها بشكل بنّاء." },
    { id: 5,  reversed: true,  dimension: "البعد النفسي",  element: "الجاهزية",  type: "سلوكي",  text: "لا أُهيئ نفسي بشكل كافٍ لتجارب مهنية جديدة أو تحديات مقبلة." },
    { id: 6,  reversed: false, dimension: "البعد النفسي",  element: "الفعل",     type: "شعوري",  text: "أشعر بالرضا عن أفعالي اليومية التي تعكس ذاتي الحقيقية." },
    { id: 7,  reversed: true,  dimension: "البعد السلوكي", element: "الأثر",     type: "سلوكي",  text: "لا يعكس أدائي في العمل حقيقتي أو شغفي بشكل منتظم." },
    { id: 8,  reversed: false, dimension: "البعد النفسي",  element: "الإدراك",   type: "شعوري",  text: "أنتبه إلى شعوري عندما يتراجع حماسي أو يتأثر توازني النفسي." },
    { id: 9,  reversed: false, dimension: "البعد النفسي",  element: "الاستجابة", type: "معرفي",  text: "أتعلم من التجارب التي أثرت على رضاي الوظيفي وأعدل مساري." },
    { id: 10, reversed: false, dimension: "البعد السلوكي", element: "التطور",    type: "معرفي",  text: "أرى بوضوح كيف أنمو كإنسان وكموظف مع مرور الوقت." },
    { id: 11, reversed: false, dimension: "البعد النفسي",  element: "النية",     type: "سلوكي",  text: "أُعبّر عن نواياي بأفعال تجعل عملي أكثر توافقًا مع قيمي." },
    { id: 12, reversed: true,  dimension: "البعد النفسي",  element: "التفاعل",   type: "معرفي",  text: "أجد صعوبة في فهم كيف تؤثر تصرفاتي واختياراتي المهنية على تقديري لذاتي." },
    { id: 13, reversed: false, dimension: "البعد السلوكي", element: "الأثر",     type: "شعوري",  text: "أشعر بالرضا عن صورتي المهنية كما أراها في مرآة ذاتي." },
    { id: 14, reversed: true,  dimension: "البعد النفسي",  element: "الإدراك",   type: "معرفي",  text: "لا أستطيع تحديد ما يجعل عملي ذا معنى حقيقي بالنسبة لي." },
    { id: 15, reversed: false, dimension: "البعد النفسي",  element: "الفعل",     type: "سلوكي",  text: "أتحرك بخطوات مدروسة لأُحقق ذاتي داخل المؤسسة." },
    { id: 16, reversed: true,  dimension: "البعد السلوكي", element: "الاستقبال", type: "سلوكي",  text: "أجد صعوبة في التعامل مع التغذية الراجعة دون أن تهتز صورتي عن نفسي." },
    { id: 17, reversed: false, dimension: "البعد النفسي",  element: "الجاهزية",  type: "معرفي",  text: "أعرف ما أحتاج تعلّمه أو تغييره لأشعر بالإنجاز في عملي." },
    { id: 18, reversed: false, dimension: "البعد النفسي",  element: "الاستجابة", type: "شعوري",  text: "أشعر بالاعتزاز حين أرى أن قراراتي خدمت ذاتي ومهنتي." },
    { id: 19, reversed: false, dimension: "البعد السلوكي", element: "التطور",    type: "شعوري",  text: "أشعر بالفخر بنفسي كلما لاحظت تحسنًا في مهاراتي وأدائي." },
    { id: 20, reversed: false, dimension: "البعد النفسي",  element: "النية",     type: "شعوري",  text: "أشعر بصدق داخلي بأنني أستحق أن أكون راضيًا ومحققًا لذاتي." },
    { id: 21, reversed: true,  dimension: "البعد النفسي",  element: "التفاعل",   type: "سلوكي",  text: "أجد صعوبة في التكيف مع ضغوط العمل دون أن أتخلى عن جوهري ومبادئي." },
    { id: 22, reversed: false, dimension: "البعد السلوكي", element: "الأثر",     type: "معرفي",  text: "لدي رؤية واضحة للصورة التي أريد أن أظهر بها أمام نفسي والآخرين." },
    { id: 23, reversed: true,  dimension: "البعد النفسي",  element: "الإدراك",   type: "سلوكي",  text: "لا أراجع وضعي المهني بشكل كافٍ حين أشعر بابتعاد ذاتي عن عملي." },
    { id: 24, reversed: false, dimension: "البعد النفسي",  element: "الفعل",     type: "معرفي",  text: "أعرف تمامًا ما يجب عليّ فعله لأعيش تجربة عمل مُرضية." },
    { id: 25, reversed: false, dimension: "البعد السلوكي", element: "الاستقبال", type: "شعوري",  text: "أشعر بالطمأنينة حتى في مواجهة تقييمات أو ضغوط صعبة." },
    { id: 26, reversed: true,  dimension: "البعد النفسي",  element: "الجاهزية",  type: "شعوري",  text: "أجد صعوبة في استعادة شغفي وطاقتي تجاه عملي." },
    { id: 27, reversed: false, dimension: "البعد النفسي",  element: "الاستجابة", type: "سلوكي",  text: "أُغيّر مساري أو أعدل سلوكي إذا اكتشفت أنني بعيد عن ذاتي." }
  ]
};

export const WORK_QUESTIONNAIRE_EN = {
  category: "At Work",
  questions: [
    { id: 1,  reversed: false, dimension: "Existential Dimension",  element: "Evolution",  type: "Behavioral", text: "I continuously develop myself in harmony with my true self and achieving my aspirations." },
    { id: 2,  reversed: false, dimension: "Psychological Dimension", element: "Intention",  type: "Cognitive",  text: "I set a clear intention to improve my relationship with myself in the work environment." },
    { id: 3,  reversed: true,  dimension: "Psychological Dimension", element: "Interaction",type: "Emotional",  text: "I find it difficult to feel harmony between my actions at work and my true values and principles." },
    { id: 4,  reversed: false, dimension: "Existential Dimension",   element: "Reception",  type: "Cognitive",  text: "I understand how I receive challenges and achievements and interpret them constructively." },
    { id: 5,  reversed: true,  dimension: "Psychological Dimension", element: "Readiness",  type: "Behavioral", text: "I fail to adequately prepare myself for new professional experiences or upcoming challenges." },
    { id: 6,  reversed: false, dimension: "Psychological Dimension", element: "Action",     type: "Emotional",  text: "I feel satisfied with my daily actions that reflect my true self." },
    { id: 7,  reversed: true,  dimension: "Existential Dimension",   element: "Impact",     type: "Behavioral", text: "My performance at work rarely reflects my true self or passion in a consistent way." },
    { id: 8,  reversed: false, dimension: "Psychological Dimension", element: "Awareness",  type: "Emotional",  text: "I pay attention to my feelings when my enthusiasm declines or my psychological balance is affected." },
    { id: 9,  reversed: false, dimension: "Psychological Dimension", element: "Response",   type: "Cognitive",  text: "I learn from experiences that affected my job satisfaction and adjust my path." },
    { id: 10, reversed: false, dimension: "Existential Dimension",   element: "Evolution",  type: "Cognitive",  text: "I clearly see how I grow as a person and as an employee over time." },
    { id: 11, reversed: false, dimension: "Psychological Dimension", element: "Intention",  type: "Behavioral", text: "I express my intentions through actions that make my work more aligned with my values." },
    { id: 12, reversed: true,  dimension: "Psychological Dimension", element: "Interaction",type: "Cognitive",  text: "I find it difficult to understand how my professional behaviors and choices affect my self-esteem." },
    { id: 13, reversed: false, dimension: "Existential Dimension",   element: "Impact",     type: "Emotional",  text: "I feel satisfied with my professional image as I see it in the mirror of my self." },
    { id: 14, reversed: true,  dimension: "Psychological Dimension", element: "Awareness",  type: "Cognitive",  text: "I am unable to clearly identify what makes my work truly meaningful to me." },
    { id: 15, reversed: false, dimension: "Psychological Dimension", element: "Action",     type: "Behavioral", text: "I move with calculated steps to achieve my self-actualization within the organization." },
    { id: 16, reversed: true,  dimension: "Existential Dimension",   element: "Reception",  type: "Behavioral", text: "I find it difficult to receive feedback without it shaking my self-image." },
    { id: 17, reversed: false, dimension: "Psychological Dimension", element: "Readiness",  type: "Cognitive",  text: "I know what I need to learn or change to feel accomplished in my work." },
    { id: 18, reversed: false, dimension: "Psychological Dimension", element: "Response",   type: "Emotional",  text: "I feel proud when I see that my decisions have served both my self and my profession." },
    { id: 19, reversed: false, dimension: "Existential Dimension",   element: "Evolution",  type: "Emotional",  text: "I feel proud of myself whenever I notice improvement in my skills and performance." },
    { id: 20, reversed: false, dimension: "Psychological Dimension", element: "Intention",  type: "Emotional",  text: "I feel inner sincerity that I deserve to be satisfied and self-actualized." },
    { id: 21, reversed: true,  dimension: "Psychological Dimension", element: "Interaction",type: "Behavioral", text: "I find it difficult to adapt to work pressures without abandoning my essence and principles." },
    { id: 22, reversed: false, dimension: "Existential Dimension",   element: "Impact",     type: "Cognitive",  text: "I have a clear vision of the image I want to present to myself and others." },
    { id: 23, reversed: true,  dimension: "Psychological Dimension", element: "Awareness",  type: "Behavioral", text: "I fail to adequately review my professional path when I feel disconnected from my work." },
    { id: 24, reversed: false, dimension: "Psychological Dimension", element: "Action",     type: "Cognitive",  text: "I know exactly what I need to do to live a satisfying work experience." },
    { id: 25, reversed: false, dimension: "Existential Dimension",   element: "Reception",  type: "Emotional",  text: "I feel calm even when facing difficult evaluations or pressures." },
    { id: 26, reversed: true,  dimension: "Psychological Dimension", element: "Readiness",  type: "Emotional",  text: "I find it difficult to regain my passion and energy toward my work." },
    { id: 27, reversed: false, dimension: "Psychological Dimension", element: "Response",   type: "Behavioral", text: "I change my path or adjust my behavior if I discover I am far from my true self." }
  ]
};

// Function to get romantic relationship questions in fixed pre-randomized order
export const getRandomizedRomanticQuestions = (language: 'ar' | 'en' = 'ar') => {
  const questionnaire = language === 'ar' ? ROMANTIC_QUESTIONNAIRE_AR : ROMANTIC_QUESTIONNAIRE_EN;
  return questionnaire.questions.map((question, index) => ({
    id: index + 1,
    text: question.text,
    reversed: question.reversed,
    originalId: question.id,
    dimension: question.dimension,
    element: question.element,
    type: question.type
  }));
};

// Function to get work questions in fixed pre-randomized order
export const getRandomizedWorkQuestions = (language: 'ar' | 'en' = 'ar') => {
  const questionnaire = language === 'ar' ? WORK_QUESTIONNAIRE_AR : WORK_QUESTIONNAIRE_EN;
  return questionnaire.questions.map((question, index) => ({
    id: index + 1,
    text: question.text,
    reversed: question.reversed,
    originalId: question.id,
    dimension: question.dimension,
    element: question.element,
    type: question.type
  }));
};

// --- استبيان إدارة الأحداث الكبرى (Crisis Management) ---

export const CRISIS_MANAGEMENT_AR = {
  category: "التعامل مع الأحداث الكبرى",
  questions: [
    { id: 24, reversed: false, dimension: "البعد السلوكي",  element: "التطور",    type: "سلوكي",  text: "أرى في الأزمات فرصة لإعادة بناء نفسي على مستوى أفضل." },
    { id: 7,  reversed: false, dimension: "البعد الداخلي",  element: "النية",     type: "معرفي",  text: "أحرص أن يكون موقفي من الأحداث الكبرى قائمًا على وعي لا على اندفاع." },
    { id: 13, reversed: true,  dimension: "البعد الخارجي",  element: "التفاعل",   type: "سلوكي",  text: "أجد صعوبة في الحفاظ على وعيي ومسؤوليتي تجاه من حولي وقت الأزمات." },
    { id: 1,  reversed: false, dimension: "البعد الداخلي",  element: "الإدراك",   type: "معرفي",  text: "أدرك أن الأحداث الكبرى لا تغيّر الواقع من حولي فقط، بل تغيّر طريقة فهمي للحياة." },
    { id: 18, reversed: true,  dimension: "البعد الخارجي",  element: "الناتج",    type: "سلوكي",  text: "أخرج من الأحداث الكبرى دون أن أستخلص منها نتيجة أو درسًا واضحًا." },
    { id: 9,  reversed: false, dimension: "البعد الداخلي",  element: "النية",     type: "شعوري",  text: "أنوي الاستفادة من الأحداث الكبرى في مراجعة نفسي وتحسين مساري." },
    { id: 21, reversed: true,  dimension: "البعد السلوكي",  element: "الاستقبال", type: "سلوكي",  text: "أجد صعوبة في تحديد طبيعة ردود أفعالي الداخلية عند استقبال الأحداث." },
    { id: 4,  reversed: false, dimension: "البعد الداخلي",  element: "الجاهزية",  type: "شعوري",  text: "أمتلك استعدادًا داخليًا للتعامل مع التحولات المفاجئة بدلًا من إنكارها." },
    { id: 15, reversed: false, dimension: "البعد الخارجي",  element: "التفاعل",   type: "شعوري",  text: "أستطيع التفاعل مع الحدث دون أن أفقد توازني أو أندفع بلا وعي." },
    { id: 2,  reversed: false, dimension: "البعد الداخلي",  element: "الإدراك",   type: "معرفي",  text: "ألاحظ بسرعة الأثر الفكري والنفسي الذي تتركه الأحداث الكبرى داخلي." },
    { id: 11, reversed: false, dimension: "البعد الخارجي",  element: "الفعل",     type: "سلوكي",  text: "أغيّر بعض سلوكياتي عندما أكتشف أنها لم تعد مناسبة للواقع الجديد." },
    { id: 27, reversed: true,  dimension: "البعد السلوكي",  element: "التشكيل",   type: "سلوكي",  text: "أجد صعوبة في رؤية كيف يمكن للتجارب الصعبة أن تجعلني أقوى وأكثر وعيًا." },
    { id: 6,  reversed: false, dimension: "البعد الداخلي",  element: "الجاهزية",  type: "سلوكي",  text: "أستطيع تهدئة نفسي قبل أن أبني موقفي من الحدث." },
    { id: 14, reversed: true,  dimension: "البعد الخارجي",  element: "التفاعل",   type: "معرفي",  text: "لا أنتبه كثيرًا إلى تأثير المحيط من حولي على طريقة استجابتي للأحداث." },
    { id: 22, reversed: false, dimension: "البعد السلوكي",  element: "التطور",    type: "شعوري",  text: "أشعر أنني أنضج عندما أحسن فهم الأحداث الكبرى التي أمر بها." },
    { id: 8,  reversed: true,  dimension: "البعد الداخلي",  element: "النية",     type: "معرفي",  text: "أفقد البوصلة القيمية أحيانًا ولا أستطيع تحديد ما أتمسك به في وقت الأزمات." },
    { id: 20, reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "شعوري",  text: "ألاحظ مشاعري الأولى عند استقبال الحدث الكبير." },
    { id: 12, reversed: false, dimension: "البعد الخارجي",  element: "الفعل",     type: "معرفي",  text: "أترجم فهمي للأحداث إلى قرارات واضحة في حياتي اليومية." },
    { id: 25, reversed: false, dimension: "البعد السلوكي",  element: "التشكيل",   type: "شعوري",  text: "أشعر أن الأحداث الكبرى تسهم في إعادة تشكيل هويتي." },
    { id: 3,  reversed: false, dimension: "البعد الداخلي",  element: "الإدراك",   type: "سلوكي",  text: "أستطيع التمييز بين الحدث نفسه وبين تفسيري الشخصي له." },
    { id: 17, reversed: true,  dimension: "البعد الخارجي",  element: "الناتج",    type: "شعوري",  text: "لا أرى رابطًا واضحًا بين أسلوب تعاملي مع الأحداث وجودة حياتي." },
    { id: 10, reversed: false, dimension: "البعد الخارجي",  element: "الفعل",     type: "سلوكي",  text: "أتخذ خطوات عملية تساعدني على الحفاظ على اتزاني وقت الأحداث الكبرى." },
    { id: 23, reversed: true,  dimension: "البعد السلوكي",  element: "التطور",    type: "معرفي",  text: "لا أستطيع توظيف التجارب الكبيرة التي مررت بها لتطوير تفكيري وقراراتي." },
    { id: 5,  reversed: false, dimension: "البعد الداخلي",  element: "الجاهزية",  type: "معرفي",  text: "أكون مهيأً نفسيًا لمراجعة بعض قناعاتي عندما يتغير الواقع من حولي." },
    { id: 19, reversed: false, dimension: "البعد السلوكي",  element: "الاستقبال", type: "معرفي",  text: "أعي الطريقة التي أستقبل بها الأحداث الكبرى في داخلي." },
    { id: 16, reversed: true,  dimension: "البعد الخارجي",  element: "الناتج",    type: "معرفي",  text: "لا تكشف لي الأحداث الكبرى شيئًا جديدًا عن جوانب قوتي أو ضعفي كشخص." },
    { id: 26, reversed: false, dimension: "البعد السلوكي",  element: "التشكيل",   type: "معرفي",  text: "أصبحت أكثر وضوحًا في معرفة من أكون وما الذي أؤمن به بعد التجارب الكبرى." }
  ]
};

export const CRISIS_MANAGEMENT_EN = {
  category: "Dealing with Major Events",
  questions: [
    { id: 15, reversed: false, dimension: "External Dimension",     element: "Interaction",type: "Emotional",  text: "I can interact with the event without losing my balance or acting impulsively." },
    { id: 3,  reversed: false, dimension: "Internal Dimension",     element: "Awareness",  type: "Behavioral", text: "I can distinguish between the event itself and my personal interpretation of it." },
    { id: 22, reversed: true,  dimension: "Existential Dimension",  element: "Evolution",  type: "Emotional",  text: "I find it difficult to maintain awareness and responsibility toward those around me during crises." },
    { id: 8,  reversed: false, dimension: "Internal Dimension",     element: "Intention",  type: "Cognitive",  text: "I clearly define the values I want to hold onto during times of crisis." },
    { id: 18, reversed: true,  dimension: "External Dimension",     element: "Outcome",    type: "Behavioral", text: "I emerge from major events without extracting any clear result or useful lesson." },
    { id: 5,  reversed: false, dimension: "Internal Dimension",     element: "Readiness",  type: "Cognitive",  text: "I am psychologically prepared to review some of my convictions when the reality around me changes." },
    { id: 27, reversed: true,  dimension: "Existential Dimension",  element: "Forming",    type: "Behavioral", text: "I find it difficult to identify the nature of my internal reactions when receiving major events." },
    { id: 12, reversed: false, dimension: "External Dimension",     element: "Action",     type: "Cognitive",  text: "I translate my understanding of events into clear decisions in my daily life." },
    { id: 1,  reversed: false, dimension: "Internal Dimension",     element: "Awareness",  type: "Cognitive",  text: "I realize that major events do not only change the reality around me, but also change my understanding of life." },
    { id: 24, reversed: false, dimension: "Existential Dimension",  element: "Evolution",  type: "Behavioral", text: "I see in crises an opportunity to rebuild myself at a better level." },
    { id: 10, reversed: false, dimension: "External Dimension",     element: "Action",     type: "Behavioral", text: "I take practical steps that help me maintain my balance during major events." },
    { id: 19, reversed: true,  dimension: "Existential Dimension",  element: "Reception",  type: "Cognitive",  text: "I struggle to see how difficult experiences can make me stronger or more self-aware." },
    { id: 6,  reversed: false, dimension: "Internal Dimension",     element: "Readiness",  type: "Behavioral", text: "I can calm myself before forming my stance toward an event." },
    { id: 14, reversed: true,  dimension: "External Dimension",     element: "Interaction",type: "Cognitive",  text: "I rarely notice how the people and media around me influence my responses to events." },
    { id: 2,  reversed: false, dimension: "Internal Dimension",     element: "Awareness",  type: "Cognitive",  text: "I quickly notice the intellectual and psychological impact that major events leave within me." },
    { id: 26, reversed: true,  dimension: "Existential Dimension",  element: "Forming",    type: "Cognitive",  text: "I lose my sense of values and struggle to know what to hold onto during times of crisis." },
    { id: 17, reversed: false, dimension: "External Dimension",     element: "Outcome",    type: "Emotional",  text: "I notice that my way of handling the event directly affects my quality of life." },
    { id: 9,  reversed: false, dimension: "Internal Dimension",     element: "Intention",  type: "Emotional",  text: "I intend to use major events to review myself and improve my path." },
    { id: 21, reversed: false, dimension: "Existential Dimension",  element: "Reception",  type: "Behavioral", text: "I can identify whether my reception of the event is characterized by calmness, fear, or caution." },
    { id: 4,  reversed: false, dimension: "Internal Dimension",     element: "Readiness",  type: "Emotional",  text: "I possess an internal readiness to deal with sudden shifts instead of denying them." },
    { id: 13, reversed: true,  dimension: "External Dimension",     element: "Interaction",type: "Behavioral", text: "I do not see a clear connection between how I handle events and the quality of my life." },
    { id: 25, reversed: false, dimension: "Existential Dimension",  element: "Forming",    type: "Emotional",  text: "I feel that major events contribute to reshaping my identity." },
    { id: 7,  reversed: true,  dimension: "Internal Dimension",     element: "Intention",  type: "Cognitive",  text: "I am unable to use major experiences I've been through to develop my thinking or decisions." },
    { id: 20, reversed: false, dimension: "Existential Dimension",  element: "Reception",  type: "Emotional",  text: "I observe my initial feelings upon receiving a major event." },
    { id: 11, reversed: false, dimension: "External Dimension",     element: "Action",     type: "Behavioral", text: "I change some of my behaviors when I discover they are no longer suitable for the new reality." },
    { id: 23, reversed: true,  dimension: "Existential Dimension",  element: "Evolution",  type: "Cognitive",  text: "Major events do not reveal anything new about my strengths or weaknesses as a person." },
    { id: 16, reversed: false, dimension: "External Dimension",     element: "Outcome",    type: "Cognitive",  text: "Major events reveal strengths and weaknesses in my character that I hadn't noticed before." }
  ]
};

// الدالة الموحدة لجلب الأسئلة
export const getRandomizedCrisisQuestions = (language: 'ar' | 'en' = 'ar') => {
  const questionnaire = language === 'ar' ? CRISIS_MANAGEMENT_AR : CRISIS_MANAGEMENT_EN;
  return questionnaire.questions.map((question, index) => ({
    id: index + 1,
    text: question.text,
    reversed: question.reversed,
    originalId: question.id,
    dimension: question.dimension,
    element: question.element,
    type: question.type
  }));
};
