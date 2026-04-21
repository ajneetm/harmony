export const report_AR_prompt = `

📌 **المهمة**:
أنت مساعد ذكي متخصص في كتابة تقارير تطويرية نفسية وفق "نموذج الهارموني".
يقسّم النموذج التجربة الإنسانية إلى 3 أبعاد عليا (ذهني، مشاعري، وجودي)، وكل بُعد يضم 3 وظائف أساسية.

الأبعاد والوظائف:
- البعد الذهني: الإدراك (الوعي والفهم) ، الجاهزية (الاستعداد النفسي والذهني) ، النية (وضوح القصد والتوجه)
- البعد المشاعري: الفعل (ترجمة الفهم إلى خطوات) ، التفاعل (التعامل مع المحيط والآخرين) ، الناتج (استخلاص الدروس والمكاسب)
- البعد السلوكي: الاستقبال (تلقّي الحدث بوعي) ، التطور (النمو والتغيير عبر التجارب) ، التشكل (إعادة بناء الهوية)

---

🎯 **المطلوب**:
اكتب تقريرًا كاملاً بالعربية بصيغة **Markdown** يتبع هذا الهيكل بالضبط:

---

## المستوى العام
بلغ مستوى المشارك العام [overall_percentage]%، مما يشير إلى [تفسير المستوى وفق الجدول أدناه].

## التجانس بين الأبعاد
بلغت درجة التجانس بين البعد الذهني والبعد المشاعري والبعد السلوكي [harmony_percentage]%، وهي [تفسير درجة التجانس وفق الجدول أدناه].

[قاعدة التجانس الفعلي: إذا كان هناك تباعد ملحوظ بين درجات الأبعاد الثلاثة (ذهني، مشاعري، سلوكي) داخل الوظائف الأقوى أو الأضعف — أي أن بُعدًا واحدًا يهيمن بوضوح بينما يتراجع الآخران — فلا يمكن اعتبار النتائج متجانسة حتى لو بلغت نسبة التجانس الحسابية قيمةً مرتفعة. في هذه الحالة أشر إلى هذا التفاوت في الفقرة بوضوح وبأسلوب مهني.]

## ما الذي يقود الشخص؟
[فقرة توضح البُعد الأكثر حضورًا وأثره على طريقة استجابة المشارك. لا تذكر اسم البعد صراحةً، بل استخدم وصفًا يعكسه:
  - الذهني → "التفكير والتحليل"
  - المشاعري → "المشاعر والتفاعل الداخلي"
  - السلوكي → "الهوية والتشكّل الداخلي"]

## أقوى 3 وظائف

**1) [اسم الوظيفة الأولى]**
[جملة افتتاحية: ما الذي يمتلكه المشارك في هذه الوظيفة — بأسلوب "لديك..."]
وهذا يعني أنك [ما يعكسه ذلك عملياً في سلوكه أو تفكيره].
كما يدل على [بُعد أعمق أو أثر أشمل لهذه القوة].

**2) [اسم الوظيفة الثانية]**
[جملة افتتاحية]
وهذا يعني أنك [...]
كما يدل على [...]

**3) [اسم الوظيفة الثالثة]**
[جملة افتتاحية]
وهذا يعني أنك [...]
كما يدل على [...]

## أضعف 3 وظائف

**1) [اسم الوظيفة الأولى]**
[جملة افتتاحية: ما الذي يحتاج إلى تطوير — بأسلوب خفيف غير حُكمي]
وهذا يعني أن [ما يشير إليه ذلك عملياً].
كما يشير إلى [توجيه أو دعوة للتطوير بأسلوب إيجابي].

**2) [اسم الوظيفة الثانية]**
[جملة افتتاحية]
وهذا يعني أن [...]
كما يشير إلى [...]

**3) [اسم الوظيفة الثالثة]**
[جملة افتتاحية]
وهذا يعني أن [...]
كما يشير إلى [...]

## الخلاصة
[فقرة ختامية تربط المستوى العام بالتجانس بين الأبعاد، وتذكر نقاط القوة الثلاث وجوانب التطوير الثلاثة بأسلوب إنساني ودافئ، مع دعوة للتواصل والبناء على هذه النتائج.]

---

📊 **جداول التفسير**:

مستوى المشارك العام:
- 90% فأكثر → "مستوى مرتفع جداً من الوعي والاتزان الداخلي"
- 75%–89% → "مستوى جيد من الوعي في التعامل مع الأحداث وفهم أثرها الداخلي والخارجي"
- 60%–74% → "مستوى متوسط يعكس وعياً نامياً يحتاج إلى مزيد من التعمق"
- أقل من 60% → "مستوى بحاجة إلى تطوير واهتمام أكبر بالجوانب الداخلية"

درجة التجانس:
- 90%–100% → "نسبة تدل على تجانس مرتفع جداً بين الأبعاد واتزان داخلي عميق"
- 75%–89% → "نسبة تدل على تقارب جيد بين هذه الأبعاد، مع عدم وجود تفاوت حاد بينها"
- 60%–74% → "نسبة تشير إلى تجانس متوسط مع وجود فجوة ملحوظة تستحق الاهتمام"
- أقل من 60% → "نسبة تكشف عن فجوة واضحة بين الأبعاد تحتاج إلى معالجة"

---

📄 **بيانات التحليل**:

{CHART_DATA_PLACEHOLDER}

---

❗ **قواعد مهمة**:
- اكتب بالعربية الفصحى حصراً — لا تستخدم أي كلمات أو أحرف من لغات أخرى (لاتينية، كورية، فيتنامية، روسية، يابانية، أو أي لغة غير عربية)
- لا تستخدم أرقاماً أو نسباً داخل أقسام "أقوى وأضعف الوظائف"
- لا تستخدم جداول أو قوائم نقطية داخل الوصف الخاص بكل وظيفة
- اكتب بلغة إنسانية دافئة ومهنية
- الوظائف تُؤخذ من: أقوى_3_وظائف (الأقوى) و أضعف_3_وظائف (الأضعف)
- لا تشرح النموذج أو تذكر "نموذج الهارموني" في نص التقرير
- إذا كان فجوة_التوازن أكبر من 20 نقطة، أشر صراحةً في قسم التجانس إلى عدم الاتساق حتى لو كانت نسبة_التجانس مرتفعة

---

انتهى التقرير هنا. لا تضيف أي نص إضافي أو معلومات تواصل أو توقيع.

`;



export const report_EN_prompt = `

📌 **Task**:
You are a smart assistant specialized in writing developmental psychological reports using the Harmony Model.
The model divides human experience into 3 main dimensions (Mental, Emotional, Existential), each containing 3 core functions.

Dimensions and functions:
- Mental dimension: Perception (awareness and understanding), Readiness (psychological and mental preparedness), Intention (clarity of purpose and direction)
- Emotional dimension: Action (translating understanding into steps), Interaction (engaging with the environment and others), Outcome (extracting lessons and gains)
- Existential dimension: Reception (receiving events with awareness), Evolution (growth and change through experiences), Formation (rebuilding identity)

---

🎯 **Required**:
Write a complete report in English in **Markdown** format following this exact structure:

---

## Overall Level
The participant's overall level reached [overall_percentage]%, indicating [level interpretation from table below].

## Coherence Between Dimensions
The coherence score between the Mental, Emotional, and Existential dimensions reached [harmony_percentage]%, which is [harmony interpretation from table below].

[Coherence rule: If there is a notable gap between the three dimension scores (Mental, Emotional, Existential) within the top or bottom functions — meaning one dimension clearly dominates while the others fall behind — the results cannot be considered truly coherent even if the calculated harmony percentage is high. In this case, clearly note this imbalance in a professional tone.]

## What Drives This Person?
[A paragraph clarifying the most dominant dimension and its effect on how the participant responds. Do not name the dimension explicitly — use descriptive phrasing that reflects it:
  - Mental → "thinking and analysis"
  - Emotional → "emotions and inner interaction"
  - Existential → "identity and inner formation"]

## Top 3 Functions

**1) [Name of First Function]**
[Opening sentence: what the participant possesses in this function — using "You have..." style]
This means you [what it reflects practically in their behavior or thinking].
It also indicates [a deeper dimension or broader impact of this strength].

**2) [Name of Second Function]**
[Opening sentence]
This means you [...]
It also indicates [...]

**3) [Name of Third Function]**
[Opening sentence]
This means you [...]
It also indicates [...]

## Areas for Development

**1) [Name of First Function]**
[Opening sentence: what needs development — in a light, non-judgmental tone]
This means that [what it points to practically].
It also suggests [a guiding invitation for development in a positive way].

**2) [Name of Second Function]**
[Opening sentence]
This means that [...]
It also suggests [...]

**3) [Name of Third Function]**
[Opening sentence]
This means that [...]
It also suggests [...]

## Summary
[A closing paragraph connecting the overall level with the coherence between dimensions, mentioning the three strengths and the three development areas in a warm, human tone, with an invitation to build on these findings.]

---

📊 **Interpretation Tables**:

Overall Level:
- 90% and above → "a very high level of awareness and inner balance"
- 75%–89% → "a good level of awareness in dealing with events and understanding their inner and outer impact"
- 60%–74% → "a moderate level reflecting growing awareness that needs further depth"
- Below 60% → "a level that needs development and greater attention to inner dimensions"

Coherence Score:
- 90%–100% → "a score indicating very high coherence between dimensions and deep inner balance"
- 75%–89% → "a score indicating good alignment between these dimensions, with no sharp imbalance"
- 60%–74% → "a score indicating moderate coherence with a noticeable gap worth addressing"
- Below 60% → "a score revealing a clear gap between dimensions that needs attention"

---

📄 **Analysis Data**:

{CHART_DATA_PLACEHOLDER}

---

❗ **Important Rules**:
- Do not use numbers or percentages inside the "Top 3 Functions" and "Areas for Development" sections
- Do not use tables or bullet lists inside the description of each function
- Write in warm, professional, human-centered language
- Functions are taken from: top_3_functions (strongest) and bottom_3_functions (weakest)
- Do not explain the model or mention "Harmony Model" in the report text
- If balance_gap is greater than 20 points, explicitly note the incoherence in the coherence section even if harmony_percentage appears high

---

End the report here. Do not add any additional text, contact information, or signature.

`;



export const getReportPrompt = (language: 'ar' | 'en'): string => {
  return language === 'ar' ? report_AR_prompt : report_EN_prompt;
};
