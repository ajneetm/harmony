// Question bank for interpreting low Harmony indicators
// Source: كتاب أسئلة تفسير نزول المؤشرات الحيوية في هارموني

type Q = { ar: string[]; en: string[] }

// ── Per-function questions (section رابعاً) ──────────────────────────────────

export const FUNCTION_QUESTIONS: Record<string, Q> = {
  idrak: {
    ar: [
      'ما المعنى الذي تعطيه لهذا الموقف أو الجانب من حياتك؟',
      'هل فهمك الحالي يساعدك على التقدم أم يجعلك مترددًا أو منسحبًا؟',
      'هل ترى الصورة كاملة، أم أنك تركز على جزء واحد من المشكلة؟',
      'هل هناك فكرة متكررة تجعلك تفسر الأمور بطريقة سلبية؟',
      'ما التفسير الآخر الأكثر توازنًا الذي يمكن أن يساعدك على التحسن؟',
    ],
    en: [
      'What meaning do you give to this situation or aspect of your life?',
      'Does your current understanding help you move forward, or does it make you hesitant?',
      'Do you see the full picture, or are you focusing on just one part of the problem?',
      'Is there a recurring thought that causes you to interpret things negatively?',
      'What more balanced interpretation could help you improve?',
    ],
  },
  jaahiziya: {
    ar: [
      'هل تشعر أنك تملك الطاقة الكافية للتعامل مع هذا الجانب؟',
      'هل لديك الوقت والقدرة والمهارة اللازمة للتحرك؟',
      'ما الشيء الناقص في جاهزيتك الآن: معرفة، دعم، ثقة، تنظيم، أم راحة؟',
      'هل تؤجل الفعل لأنك غير مستعد فعلًا، أم لأنك تشعر بالخوف من البداية؟',
      'ما أبسط شيء يمكن أن يزيد جاهزيتك خلال الفترة القادمة؟',
    ],
    en: [
      'Do you feel you have enough energy to deal with this aspect?',
      'Do you have the time, capability, and skills needed to move forward?',
      'What is missing in your readiness right now: knowledge, support, confidence, organization, or rest?',
      'Are you delaying action because you are genuinely unprepared, or because you fear starting?',
      'What is the simplest thing that could increase your readiness in the coming period?',
    ],
  },
  niya: {
    ar: [
      'هل نيتك واضحة ومحددة تجاه هذا الجانب؟',
      'هل ما تريده نابع من قناعة داخلية أم من ضغط خارجي؟',
      'هل لديك سبب قوي يدفعك للاستمرار رغم الصعوبة؟',
      'هل توجد نوايا متعارضة داخلك تجعلك مترددًا؟',
      'ما الهدف الصغير الواضح الذي يمكن أن تبدأ به الآن؟',
    ],
    en: [
      'Is your intention clear and specific regarding this aspect?',
      'Does what you want come from inner conviction or external pressure?',
      'Do you have a strong reason to keep going despite the difficulty?',
      'Are there conflicting intentions inside you making you hesitant?',
      'What small, clear goal could you start with right now?',
    ],
  },
  feil: {
    ar: [
      'هل تعرف ما يجب عليك فعله ولكنك لا تبدأ؟',
      'ما أكثر شيء يمنعك من التنفيذ: الخوف، الكسل، الضغط، عدم التنظيم، أم غياب الخطة؟',
      'هل تبدأ ثم تتوقف، أم لا تبدأ أصلًا؟',
      'هل أفعالك الحالية متناسبة مع ما تريده فعلًا؟',
      'ما الفعل البسيط الذي لو التزمت به سيحدث فرقًا واضحًا؟',
    ],
    en: [
      'Do you know what you should do but cannot start?',
      'What most prevents you from executing: fear, laziness, pressure, disorganization, or lack of a plan?',
      'Do you start then stop, or never start at all?',
      'Are your current actions proportionate to what you truly want?',
      'What simple action, if you committed to it, would make a clear difference?',
    ],
  },
  tafaul: {
    ar: [
      'هل طريقة تعاملك مع الآخرين تساعدك أم تزيد التوتر؟',
      'هل تعبّر عن احتياجك أو رأيك بوضوح؟',
      'هل تتأثر كثيرًا بردود فعل الآخرين؟',
      'هل تميل إلى الانسحاب أو المواجهة الزائدة عند التفاعل؟',
      'ما السلوك التفاعلي الذي تحتاج إلى تحسينه أولًا؟',
    ],
    en: [
      'Does the way you deal with others help you or increase tension?',
      'Do you express your needs or opinions clearly?',
      'Are you strongly affected by others\' reactions?',
      'Do you tend to withdraw or be overly confrontational when interacting?',
      'What interaction behavior do you need to improve first?',
    ],
  },
  istijaba: {
    ar: [
      'هل تعدّل تصرفك عندما لا تحصل على النتيجة المطلوبة؟',
      'هل تتعامل مع النتائج بهدوء أم بانفعال؟',
      'هل تكرر نفس الأسلوب رغم أنه لا يعطي نتيجة جيدة؟',
      'هل تعتبر الملاحظات والنتائج فرصة للتصحيح أم مصدرًا للإحباط؟',
      'ما التعديل العملي الذي يمكن أن تقوم به في استجابتك القادمة؟',
    ],
    en: [
      'Do you adjust your behavior when you don\'t get the desired result?',
      'Do you deal with outcomes calmly or reactively?',
      'Do you repeat the same approach even when it doesn\'t yield good results?',
      'Do you see feedback and outcomes as opportunities for correction or sources of frustration?',
      'What practical adjustment could you make in your next response?',
    ],
  },
  istiqbal: {
    ar: [
      'كيف تستقبل ما يحدث لك: كفرصة، تهديد، عبء، أم رسالة؟',
      'هل تستقبل النقد أو الملاحظات دون دفاع زائد؟',
      'هل تلاحظ أثر الأحداث عليك، أم تتجاوزها دون فهم؟',
      'هل هناك تجربة أو موقف وصل إليك ولم تستوعب أثره بعد؟',
      'ما الذي تحتاج أن تستقبله بوعي أكبر حتى تفهم نفسك بشكل أفضل؟',
    ],
    en: [
      'How do you receive what happens to you: as opportunity, threat, burden, or message?',
      'Do you receive criticism or feedback without excessive defensiveness?',
      'Do you notice the impact of events on you, or move past them without understanding?',
      'Is there an experience or situation whose impact on you you haven\'t fully absorbed yet?',
      'What do you need to receive more consciously to better understand yourself?',
    ],
  },
  tatawwur: {
    ar: [
      'هل تشعر أنك تتعلم من تجاربك؟',
      'هل يوجد تحسن ولو بسيط في هذا الجانب خلال الفترة الماضية؟',
      'هل تكرر نفس الأخطاء دون مراجعة؟',
      'هل لديك طريقة واضحة لتطوير نفسك في هذا الجانب؟',
      'ما المهارة أو الفكرة أو العادة التي لو طورتها سترفع هذا المؤشر؟',
    ],
    en: [
      'Do you feel you are learning from your experiences?',
      'Has there been even slight improvement in this aspect recently?',
      'Do you repeat the same mistakes without reflection?',
      'Do you have a clear way of developing yourself in this area?',
      'What skill, idea, or habit, if developed, would raise this indicator?',
    ],
  },
  tashakkul: {
    ar: [
      'هل أصبح هذا السلوك نمطًا متكررًا في حياتك؟',
      'هل هذا التراجع مؤقت أم تحول إلى عادة مستقرة؟',
      'ما الطبع أو النمط الذي تشعر أنه يقيّدك؟',
      'هل هذا النمط ناتج عن تجربة قديمة، أو بيئة، أو خوف، أو تكرار طويل؟',
      'ما النمط الجديد الذي تريد أن تبنيه بدلًا من النمط الحالي؟',
    ],
    en: [
      'Has this behavior become a recurring pattern in your life?',
      'Is this decline temporary, or has it turned into a stable habit?',
      'What trait or pattern do you feel is holding you back?',
      'Does this pattern come from a past experience, environment, fear, or long repetition?',
      'What new pattern do you want to build instead of the current one?',
    ],
  },
}

// ── Per-driver questions (section ثانياً) ────────────────────────────────────

export const DRIVER_QUESTIONS: Record<'cognitive' | 'emotional' | 'behavioral', Q> = {
  cognitive: {
    ar: [
      'هل لديك وضوح كافٍ حول هذا الجانب من حياتك؟',
      'هل تشعر أنك تفهم ما يحدث، أم أن الأمور متداخلة وغير واضحة؟',
      'هل لديك قناعة حقيقية بما تقوم به؟',
      'هل هناك أفكار متكررة تمنعك من التقدم؟',
      'هل تبالغ في التفكير قبل أن تتصرف؟',
      'هل ترى أن المشكلة أكبر من قدرتك على التعامل معها؟',
      'هل لديك تصور واضح للنتيجة التي تريد الوصول إليها؟',
      'ما الفكرة الأساسية التي تضعفك في هذا الجانب؟',
    ],
    en: [
      'Do you have enough clarity about this aspect of your life?',
      'Do you feel you understand what is happening, or are things mixed up and unclear?',
      'Do you have genuine conviction in what you are doing?',
      'Are there recurring thoughts preventing you from progressing?',
      'Do you overthink before acting?',
      'Do you see the problem as larger than your ability to handle it?',
      'Do you have a clear vision of the result you want to reach?',
      'What core belief is weakening you in this area?',
    ],
  },
  emotional: {
    ar: [
      'ما الشعور الغالب عليك عند التعامل مع هذا الجانب؟',
      'هل تشعر بالخوف، أو القلق، أو الإحباط، أو الغضب، أو الاستنزاف؟',
      'هل هناك موقف أو علاقة أثّرت على مشاعرك تجاه هذا الأمر؟',
      'هل لديك رغبة داخلية في التحسن، أم تشعر بفقدان الحماس؟',
      'هل تشعر أنك تبذل أكثر مما تتحمل؟',
      'هل تشعر أنك غير مقدّر أو غير مفهوم؟',
      'هل مشاعرك تمنعك من اتخاذ خطوة تعرف أنها صحيحة؟',
      'ما الشعور الذي لو خفّ تأثيره عليك سيتحسن أداؤك؟',
    ],
    en: [
      'What emotion is dominant when you deal with this aspect?',
      'Do you feel fear, anxiety, frustration, anger, or exhaustion?',
      'Is there a situation or relationship that has affected your feelings about this matter?',
      'Do you have an inner desire to improve, or do you feel loss of motivation?',
      'Do you feel you are giving more than you can handle?',
      'Do you feel unappreciated or misunderstood?',
      'Do your feelings prevent you from taking a step you know is right?',
      'What emotion, if reduced, would improve your performance?',
    ],
  },
  behavioral: {
    ar: [
      'هل تعرف ما يجب عليك فعله ولكنك لا تلتزم به؟',
      'ما أكثر سلوك يتكرر ويؤثر سلبًا على هذا الجانب؟',
      'هل تؤجل الفعل بسبب ضغط، أو تعب، أو خوف، أو عدم تنظيم؟',
      'هل لديك خطة واضحة للتصرف؟',
      'هل تملك الوقت والطاقة والمهارة اللازمة للتنفيذ؟',
      'هل البيئة المحيطة تساعدك أم تعيقك؟',
      'هل تبدأ ثم تتوقف، أم لا تبدأ أصلًا؟',
      'ما السلوك البسيط الذي لو التزمت به سيحسن هذا المؤشر؟',
    ],
    en: [
      'Do you know what you should do but don\'t commit to it?',
      'What recurring behavior is negatively affecting this aspect?',
      'Do you postpone action due to pressure, fatigue, fear, or disorganization?',
      'Do you have a clear plan for action?',
      'Do you have the time, energy, and skills needed for execution?',
      'Does your environment help or hinder you?',
      'Do you start then stop, or never start at all?',
      'What simple behavior, if you committed to it, would improve this indicator?',
    ],
  },
}

// ── General questions (section أولاً) ────────────────────────────────────────

export const GENERAL_QUESTIONS: Q = {
  ar: [
    'ما أكثر شيء تشعر أنه أثّر على هذا الجانب في الفترة الأخيرة؟',
    'هل هذا الانخفاض جديد عليك، أم أنه نمط متكرر في حياتك؟',
    'متى بدأت تلاحظ هذا التراجع؟',
    'هل يرتبط هذا التراجع بحدث معين، أو شخص معين، أو مرحلة معينة؟',
    'هل التراجع بسبب قلة الرغبة، أم قلة الطاقة، أم قلة الإمكانات، أم ضغط خارجي؟',
    'ما الشيء الذي لو تغيّر الآن يمكن أن يرفع هذا المؤشر بشكل واضح؟',
  ],
  en: [
    'What most do you feel has affected this aspect recently?',
    'Is this decline new to you, or is it a recurring pattern in your life?',
    'When did you start noticing this decline?',
    'Is this decline linked to a specific event, person, or phase of life?',
    'Is the decline due to lack of desire, energy, resources, or external pressure?',
    'What, if it changed now, could clearly raise this indicator?',
  ],
}

// ── Map function name → key ──────────────────────────────────────────────────

const NAME_TO_KEY: Record<string, string> = {
  الإدراك: 'idrak',     Perception:  'idrak',
  الجاهزية: 'jaahiziya', Readiness:   'jaahiziya',
  النية: 'niya',        Intention:   'niya',
  الفعل: 'feil',        Action:      'feil',
  التفاعل: 'tafaul',    Interaction: 'tafaul',
  الاستجابة: 'istijaba', Outcome:    'istijaba', Response: 'istijaba',
  الاستقبال: 'istiqbal', Reception:  'istiqbal',
  التطور: 'tatawwur',   Evolution:   'tatawwur',
  التشكل: 'tashakkul',  Formation:   'tashakkul',
}

// ── Select 5-6 questions for a given function + scores ───────────────────────

export function selectQuestions(
  functionName: string,
  cogScore: number,
  emoScore: number,
  behScore: number,
  language: 'ar' | 'en',
): string[] {
  const key    = NAME_TO_KEY[functionName] ?? ''
  const fnQ    = FUNCTION_QUESTIONS[key]?.[language] ?? []

  // Determine weakest driver
  const min    = Math.min(cogScore, emoScore, behScore)
  const driver: 'cognitive' | 'emotional' | 'behavioral' =
    cogScore === min ? 'cognitive' : emoScore === min ? 'emotional' : 'behavioral'
  const drvQ   = DRIVER_QUESTIONS[driver][language]

  // Pick 3 function-specific + 2 driver-specific + 1 general
  const result: string[] = []
  result.push(...fnQ.slice(0, 3))
  // Add driver questions not already in result
  for (const q of drvQ) {
    if (result.length >= 5) break
    if (!result.includes(q)) result.push(q)
  }
  // Fill with general if needed
  for (const q of GENERAL_QUESTIONS[language]) {
    if (result.length >= 6) break
    if (!result.includes(q)) result.push(q)
  }

  return result
}
