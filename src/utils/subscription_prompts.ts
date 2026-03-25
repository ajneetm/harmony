const subscription_AR_PROMPT = `

**برومبت توليد استبيان هارموني من 27 سؤالاً باللغة العربية**

**الغرض:**
بناء استبيان تشخيصي من 27 عبارة تقييمية (Statements) وفق نموذج هارموني الذي يعتمد على ثلاث عوالم (الداخلي - الخارجي - التصوري) وكل عالم يحتوي على ثلاث وظائف، ويتم تحليل كل وظيفة من خلال أضلاع الإنسان الثلاثة: الذهني، الشعوري، السلوكي.

**صيغة البرومبت:**

"أرغب في إنشاء استبيان مكوّن من 27 عبارة تقييمية تغطي جميع زوايا نموذج هارموني، حيث يتم توزيع العبارات كالتالي:

* العالم الداخلي: الإدراك، الجاهزية، النية
* العالم الخارجي: الفعل، التفاعل، الاستجابة
* العالم التصوري: الاستقبال، التطور، الصورة

ويُغَطّى كل عنصر من هذه العناصر بثلاث زوايا (أضلاع الإنسان):

* الضلع الذهني (الفكر والإدراك)
* الضلع الشعوري (العاطفة والدوافع)
* الضلع السلوكي (السلوك والقرارات)

بالتالي يكون الناتج: 3 عوالم × 3 عناصر × 3 أبعاد = 27 عبارة تقييمية.

**الشروط:**

* أن تكون العبارات واضحة وسهلة الفهم ومناسبة لمقياس ليكرت (موافق بشدة - موافق - لا أعرف - غير موافق - غير موافق بشدة)
* أن تتضمن كل عبارة عنصرًا واحدًا فقط.
* أن تتوزع العبارات على النطاقات التسعة بالتساوي.
* أن تكون مرتبطة بمشكلة سلوكية أو نمط حياة أو تحدٍّ واقعي محدد يتم تقديمه ضمن المشكلة.


**مثال كامل (Few-shot):**

تحليل هارموني كامل:

فهمك العميق لمشكلتك كقائد يدل على وعي إداري مميز، وسأقوم الآن بتحليل هذه المشكلة من خلال **نموذج هارموني** الذي يعتمد على ثلاث عوالم (الداخلي – الخارجي – التصوري)، وكل عالم يحتوي على ثلاث وظائف، لنصل إلى **تشخيص متوازن ودقيق**.


## 🟦 أولًا: العالم الداخلي (المدير)

| الوظيفة  | التحليل                                                            | النصيحة                                                                     |
| -------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| الإدراك  | المدير مدرك للفجوة بين ما يتوقعه وما يحدث.                         | تأكد من وضوح رسالتك، هل شرحت توقعاتك؟ بلغة واضحة؟                           |
| الجاهزية | جاهزيته للقيادة عالية، لكن لم يهيئ الفريق للمبادرة.                | خصص وقتًا لتدريبهم على التفكير الحر واتخاذ القرار.                          |
| النية    | لديه نية واضحة ببناء فريق مبادر لكنه لم يترجمها لسلوك واضح للفريق. | شارك نيتك معهم علنًا: "أريد من كل فرد أن يفكر ويقترح دون انتظار توجيه مني." |

---

## 🟢 ثانيًا: العالم الخارجي (سلوك الفريق)

| الوظيفة   | التحليل                                              | النصيحة                                                   |
| --------- | ---------------------------------------------------- | --------------------------------------------------------- |
| الفعل     | الفريق ينفذ فقط، لا يبادر.                           | غيّر النموذج السلوكي: اجعلهم يقودون بأنفسهم مشاريع صغيرة. |
| التفاعل   | تفاعلهم محدود بسبب خوف أو غموض أو تجارب سلبية سابقة. | ناقشهم: ما الذي يمنعهم من اقتراح الأفكار؟ استمع بلا حكم.  |
| الاستجابة | عدم وجود مبادرة يسبب إحباط للمدير.                   | لا تتدخل فورًا، امنحهم فرصة للفشل والتعلم.                |

---

## 🔴 ثالثًا: العالم التصوري (الفهم المتبادل)

| الوظيفة        | التحليل                                       | النصيحة                                                      |
| -------------- | --------------------------------------------- | ------------------------------------------------------------ |
| الاستقبال      | قد يرون القائد كـ "مسيطر" أو لا يتقبل الآراء. | غيّر هذه النظرة بجلسات مفتوحة عن الثقة وتقدير الأفكار.       |
| التطور         | العلاقة لم تتطور إلى شراكة فكرية.             | امنح كل فرد فرصة لقيادة فكرة أو مشروع صغير.                  |
| الصورة الذهنية | يرون أن القائد وحده من يمتلك الأفكار.         | أعِد تشكيل الصورة عبر الاعتراف علنًا بالحاجة لقيادات مستقلة. |




**الأسئلة المُولدة (مثال):**

{
  "problem": "أنا رئيس تنفيذي لشركة استشارية وأواجه مشكلة في أن الموظفين لا يبادرون بالأفكار والمشاريع، بل ينتظرون الأوامر، وأشعر أحيانًا أنهم لا يفهمونني.",
  "questions": [
    {"dimension": "العالم الداخلي", "element": "الإدراك", "type": "معرفي", "statement": "أفهم بوضوح لماذا يتصرف الموظفون بالطريقة التي يتصرفون بها."},
    {"dimension": "العالم الداخلي", "element": "الإدراك", "type": "شعوري", "statement": "أشعر بالإحباط عندما لا أُفهَم من قِبل الفريق."},
    {"dimension": "العالم الداخلي", "element": "الإدراك", "type": "سلوكي", "statement": "أبذل جهدًا منتظمًا لفهم سبب غياب المبادرة لدى الموظفين."},

    {"dimension": "العالم الداخلي", "element": "الجاهزية", "type": "معرفي", "statement": "أُدرك الأدوات والأساليب التي يجب أن أُفعّلها لتعزيز مبادرة الفريق."},
    {"dimension": "العالم الداخلي", "element": "الجاهزية", "type": "شعوري", "statement": "أشعر بالاستعداد لتحمل النتائج عند تفويض المهام."},
    {"dimension": "العالم الداخلي", "element": "الجاهزية", "type": "سلوكي", "statement": "أوفّر لفريقي فرصًا واضحة للتدريب على القيادة الذاتية."},

    {"dimension": "العالم الداخلي", "element": "النية", "type": "معرفي", "statement": "أُخطط لتعزيز عقلية المبادرة داخل الفريق."},
    {"dimension": "العالم الداخلي", "element": "النية", "type": "شعوري", "statement": "أشعر بالحماس عندما أضع رؤية تحفز الفريق على الإبداع."},
    {"dimension": "العالم الداخلي", "element": "النية", "type": "سلوكي", "statement": "أشارك الفريق أهدافي القيادية بوضوح وباستمرار."},

    {"dimension": "العالم الخارجي", "element": "الفعل", "type": "معرفي", "statement": "أُحلّل تصرفات الفريق لفهم أسباب غياب المبادرة."},
    {"dimension": "العالم الخارجي", "element": "الفعل", "type": "شعوري", "statement": "أشعر بالإحباط عندما ينتظر الفريق التعليمات مني."},
    {"dimension": "العالم الخارجي", "element": "الفعل", "type": "سلوكي", "statement": "أمنح أعضاء الفريق مسؤوليات واضحة لتنفيذ مشاريعهم بأنفسهم."},

    {"dimension": "العالم الخارجي", "element": "التفاعل", "type": "معرفي", "statement": "أُلاحظ استجابات الفريق عندما أطلب منهم إبداء آرائهم."},
    {"dimension": "العالم الخارجي", "element": "التفاعل", "type": "شعوري", "statement": "أشعر بالتباعد عندما لا يشاركني الفريق أفكارهم."},
    {"dimension": "العالم الخارجي", "element": "التفاعل", "type": "سلوكي", "statement": "أفتح نقاشات مفتوحة لتشجيع الأفكار مهما كانت بسيطة."},

    {"dimension": "العالم الخارجي", "element": "الاستجابة", "type": "معرفي", "statement": "أراجع مدى فعالية أسلوبي بعد كل لقاء مع الفريق."},
    {"dimension": "العالم الخارجي", "element": "الاستجابة", "type": "شعوري", "statement": "أشعر بالقلق عندما لا أرى أي مبادرة بعد الجلسات التحفيزية."},
    {"dimension": "العالم الخارجي", "element": "الاستجابة", "type": "سلوكي", "statement": "أعدّل طريقتي في القيادة بناءً على تفاعل الفريق السابق."},

    {"dimension": "العالم التصوري", "element": "الاستقبال", "type": "معرفي", "statement": "أُلاحظ كيف يستقبل الفريق أسلوبي القيادي."},
    {"dimension": "العالم التصوري", "element": "الاستقبال", "type": "شعوري", "statement": "أشعر بالانفصال أحيانًا عندما أُسيء فهم نواياي."},
    {"dimension": "العالم التصوري", "element": "الاستقبال", "type": "سلوكي", "statement": "أطلب من الفريق ملاحظاتهم لأفهم كيف يرونني."},

    {"dimension": "العالم التصوري", "element": "التطور", "type": "معرفي", "statement": "أتابع كيف تتغير علاقتي بالفريق مع الوقت."},
    {"dimension": "العالم التصوري", "element": "التطور", "type": "شعوري", "statement": "أشعر أن العلاقة مع الفريق تطورت إلى علاقة شراكة حقيقية."},
    {"dimension": "العالم التصوري", "element": "التطور", "type": "سلوكي", "statement": "أمنح أعضاء الفريق الفرص لتطوير أنفسهم من خلال المبادرات."},

    {"dimension": "العالم التصوري", "element": "الصورة", "type": "معرفي", "statement": "أفهم الصورة الذهنية التي يحملها الفريق عني كقائد."},
    {"dimension": "العالم التصوري", "element": "الصورة", "type": "شعوري", "statement": "أشعر بالفخر عندما يراني الفريق مصدر إلهام لا توجيه فقط."},
    {"dimension": "العالم التصوري", "element": "الصورة", "type": "سلوكي", "statement": "أُظهر للفريق أن أفكارهم لا تقل أهمية عن أفكاري."}
  ]
}

فقط قم بإرجاع الـ JSON object, لا تعيد أي أوامر أو تعليقات أو أي شيء آخر.
من فضلك قم بارجاع الاسئلة كاملة غير منقوصة
`


const subscription_EN_PROMPT = `

**Prompt for Generating a Harmony Diagnostic Questionnaire of 27 Statements in Arabic**

**Purpose:**
To build a diagnostic questionnaire of 27 evaluative statements based on the Harmony Model, which is built on three domains (Internal – External – Perceptual). Each domain contains three functions, and each function is analyzed through the human triangle: cognitive, emotional, and behavioral.

**Prompt Format:**

"I want to create a questionnaire consisting of 27 evaluative statements that cover all angles of the Harmony Model, distributed as follows:

* Internal World: Perception, Readiness, Intention
* External World: Action, Interaction, Response
* Perceptual World: Reception, Evolution, Mental Image

Each of these elements should be covered from the three human dimensions:

* Cognitive Side (Thought & Awareness)
* Emotional Side (Emotions & Motivations)
* Behavioral Side (Behavior & Decisions)

Thus, the result will be: 3 Worlds × 3 Elements × 3 Dimensions = 27 Evaluative Statements.

**Conditions:**

* The statements must be clear, easy to understand, and suitable for a Likert scale (Strongly Agree – Agree – Neutral – Disagree – Strongly Disagree)
* Each statement should include only **one** element.
* The 27 statements must be evenly distributed across the nine domains.
* The statements must be relevant to a specific behavioral issue, lifestyle challenge, or real-life situation presented in the "problem" input.

**Few-shot Example (Full):**

Complete Harmony Analysis:

Your deep understanding of your problem as a leader indicates distinguished managerial awareness. I will now analyze this issue using the **Harmony Model**, which includes three worlds (Internal – External – Perceptual). Each world contains three functions, leading to a **balanced and accurate diagnosis**.

## 🟦 First: Internal World (Leader)

| Function    | Analysis                                                         | Advice                                                                            |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Perception  | The leader is aware of the gap between expectations and actions. | Ensure your message is clear: Have you explained your expectations transparently? |
| Readiness   | Readiness is high, but the team is not empowered to take initiative. | Allocate time to train them on autonomy and decision-making.                   |
| Intention   | The leader has a clear intention but hasn't turned it into action. | Share your intention openly: "I want everyone to think and suggest proactively." |

---

## 🟢 Second: External World (Team Behavior)

| Function   | Analysis                                                      | Advice                                                           |
| ---------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| Action     | The team only executes, without initiative.                   | Change the behavior model: Let them lead small projects.          |
| Interaction| Interaction is limited due to fear, confusion, or bad past experiences. | Ask: What’s holding you back from proposing ideas? Listen openly. |
| Response   | Lack of initiative frustrates the leader.                     | Don’t intervene instantly. Let them fail and learn.               |

---

## 🔴 Third: Perceptual World (Mutual Understanding)

| Function        | Analysis                                                     | Advice                                                             |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| Reception       | The team may see the leader as controlling or unreceptive.   | Shift that perception with open sessions about trust and value.    |
| Evolution       | The relationship hasn’t matured into a thought partnership.  | Give each member the chance to lead a small project or idea.       |
| Mental Image    | The team thinks only the leader has ideas.                   | Reframe this image by publicly acknowledging the need for leaders. |

**Generated Questions (Example):**

{
  "problem": "I’m a CEO of a consulting firm, and I face a problem where employees do not initiate ideas or projects—they just wait for orders. Sometimes I feel misunderstood.",
  "questions": [
    {"dimension": "Internal World", "element": "Perception", "type": "Cognitive", "statement": "I clearly understand why my employees behave the way they do."},
    {"dimension": "Internal World", "element": "Perception", "type": "Emotional", "statement": "I feel frustrated when my team doesn’t understand me."},
    {"dimension": "Internal World", "element": "Perception", "type": "Behavioral", "statement": "I make a regular effort to understand why employees lack initiative."},

    {"dimension": "Internal World", "element": "Readiness", "type": "Cognitive", "statement": "I know the tools and methods I need to activate to enhance team initiative."},
    {"dimension": "Internal World", "element": "Readiness", "type": "Emotional", "statement": "I feel ready to accept the outcomes of delegating tasks."},
    {"dimension": "Internal World", "element": "Readiness", "type": "Behavioral", "statement": "I provide my team with clear opportunities to train for self-leadership."},

    {"dimension": "Internal World", "element": "Intention", "type": "Cognitive", "statement": "I plan to promote a proactive mindset within the team."},
    {"dimension": "Internal World", "element": "Intention", "type": "Emotional", "statement": "I feel excited when I set a vision that inspires creativity."},
    {"dimension": "Internal World", "element": "Intention", "type": "Behavioral", "statement": "I consistently and clearly share my leadership goals with the team."},

    {"dimension": "External World", "element": "Action", "type": "Cognitive", "statement": "I analyze team behaviors to understand the reasons behind passivity."},
    {"dimension": "External World", "element": "Action", "type": "Emotional", "statement": "I feel frustrated when the team waits for instructions."},
    {"dimension": "External World", "element": "Action", "type": "Behavioral", "statement": "I assign clear responsibilities to the team to lead their own projects."},

    {"dimension": "External World", "element": "Interaction", "type": "Cognitive", "statement": "I observe how the team responds when I ask for input."},
    {"dimension": "External World", "element": "Interaction", "type": "Emotional", "statement": "I feel distant when the team doesn’t share ideas with me."},
    {"dimension": "External World", "element": "Interaction", "type": "Behavioral", "statement": "I open inclusive discussions to encourage even the smallest ideas."},

    {"dimension": "External World", "element": "Response", "type": "Cognitive", "statement": "I assess how effective my approach is after each team meeting."},
    {"dimension": "External World", "element": "Response", "type": "Emotional", "statement": "I feel concerned when I see no initiative after motivational talks."},
    {"dimension": "External World", "element": "Response", "type": "Behavioral", "statement": "I adapt my leadership style based on past team reactions."},

    {"dimension": "Perceptual World", "element": "Reception", "type": "Cognitive", "statement": "I notice how the team perceives my leadership style."},
    {"dimension": "Perceptual World", "element": "Reception", "type": "Emotional", "statement": "I feel disconnected when my intentions are misunderstood."},
    {"dimension": "Perceptual World", "element": "Reception", "type": "Behavioral", "statement": "I ask for feedback from the team to understand how they see me."},

    {"dimension": "Perceptual World", "element": "Evolution", "type": "Cognitive", "statement": "I track how my relationship with the team evolves over time."},
    {"dimension": "Perceptual World", "element": "Evolution", "type": "Emotional", "statement": "I feel that the relationship has evolved into a real partnership."},
    {"dimension": "Perceptual World", "element": "Evolution", "type": "Behavioral", "statement": "I give the team chances to grow through leading initiatives."},

    {"dimension": "Perceptual World", "element": "Mental Image", "type": "Cognitive", "statement": "I understand the mental image the team has of me as a leader."},
    {"dimension": "Perceptual World", "element": "Mental Image", "type": "Emotional", "statement": "I feel proud when the team sees me as a source of inspiration, not just direction."},
    {"dimension": "Perceptual World", "element": "Mental Image", "type": "Behavioral", "statement": "I show the team that their ideas are as valuable as mine."}
  ]
}

# Only return the JSON object, no other text or comments.
# Please return the questions in full, not truncated.
`

// Export the prompts
export { subscription_AR_PROMPT, subscription_EN_PROMPT }