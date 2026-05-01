export type TissueSection = {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  practicalTips: string[];
  practicalTipsAr?: string[];
  confusionWarning?: string;
  confusionWarningAr?: string;
  imageUrl?: string;
  imageUrls?: string[]; 
  subSections?: TissueSection[];
  extraStudy?: {
    title: string;
    titleAr?: string;
    content: string;
    contentAr?: string;
    imageUrl: string;
    buttonLabel: string;
    buttonLabelAr?: string;
  };
};

const proxyUrl = (url: string) => `/api/image?url=${encodeURIComponent(url)}`;

export const histologyData: TissueSection[] = [
  {
    id: "epithelial",
    title: "Epithelial Tissue",
    titleAr: "الأنسجة الطلائية",
    description: "Tissue that covers surfaces, lines cavities, and forms glands.",
    descriptionAr: "الأنسجة التي تغطي الأسطح، تبطن التجويفات، وتكون الغدد.",
    practicalTips: [
      "Look for cells tightly packed together with almost no intercellular matrix.",
      "Always has a free (apical) surface and rests on a basement membrane."
    ],
    practicalTipsAr: [
      "ابحث عن خلايا متراصة بجانب بعضها مع عدم وجود مادة بين خلوية.",
      "دائماً لها سطح حر وتستقر على غشاء قاعدي (Basement Membrane)."
    ],
    subSections: [
      {
        id: "simple-squamous",
        title: "Simple Squamous",
        titleAr: "حرشفية بسيطة",
        description: "Single layer of flat, scale-like cells.",
        descriptionAr: "طبقة واحدة من الخلايا المسطحة التي تشبه القشور.",
        practicalTips: ["Nuclei are flat/bulging.", "Found in blood vessels (endothelium) and lung alveoli."],
        practicalTipsAr: ["الأنوية مسطحة أو بارزة قليلاً.", "توجد في الأوعية الدموية وحويصلات الرئة."],
        confusionWarning: "Do not confuse with Simple Cuboidal. Look at the nucleus: if it's flat/squashed, it's squamous. If it's perfectly round, it's cuboidal.",
        confusionWarningAr: "لا تخلط بينها وبين المكعبية البسيطة. انظر للنواة: إذا كانت مسطحة فهي حرشفية، وإذا كانت مستديرة تماماً فهي مكعبية.",
        imageUrl: "/images/simple squamous/simple squamous.png",
        imageUrls: ["/images/simple squamous/simple squamous.png", "/images/simple squamous/simple squamous micro.png"]
      },
      {
        id: "simple-cuboidal",
        title: "Simple Cuboidal",
        titleAr: "مكعبية بسيطة",
        description: "Single layer of cube-shaped cells.",
        descriptionAr: "طبقة واحدة من الخلايا مكعبة الشكل.",
        practicalTips: ["Nuclei are round and centrally located.", "Found in kidney tubules and thyroid follicles."],
        practicalTipsAr: ["الأنوية مستديرة وتقع في المركز.", "توجد في أنابيب الكلى وحويصلات الغدة الدرقية."],
        confusionWarning: "Do not confuse with Simple Columnar. Cuboidal cells are as wide as they are tall. Columnar cells are distinctly taller.",
        confusionWarningAr: "لا تخلط بينها وبين العمودية البسيطة. الخلايا المكعبية عرضها يساوي طولها تقريباً.",
        imageUrl: "/images/simple cubodial/simple cubodial.png",
        imageUrls: ["/images/simple cubodial/simple cubodial.png", "/images/simple cubodial/simple cubodial micro.png"]
      },
      {
        id: "simple-columnar",
        title: "Simple Columnar",
        titleAr: "عمودية بسيطة",
        description: "Single layer of tall, column-like cells.",
        descriptionAr: "طبقة واحدة من الخلايا الطويلة التي تشبه الأعمدة.",
        practicalTips: ["Nuclei are oval and basal (near the bottom).", "Found lining the stomach and intestines. Often has goblet cells."],
        practicalTipsAr: ["الأنوية بيضاوية وتقع في القاعدة.", "تبطن المعدة والأمعاء، وغالباً تحتوي على خلايا كأسية (Goblet cells)."],
        confusionWarning: "Do not confuse with Pseudostratified Columnar. Simple columnar has nuclei neatly lined up in one single row at the base.",
        confusionWarningAr: "في العمودية البسيطة، الأنوية مرتبة في صف واحد منتظم عند القاعدة.",
        imageUrl: "/images/simple columnar/simple columnar.png",
        imageUrls: ["/images/simple columnar/simple columnar.png", "/images/simple columnar/simple columnar micro.png"]
      },
      {
        id: "pseudostratified",
        title: "Pseudostratified Columnar",
        titleAr: "عمودية طبقية كاذبة",
        description: "Looks like multiple layers but is actually one. Not all cells reach the surface, but all touch the basement membrane.",
        descriptionAr: "تبدو كعدة طبقات ولكنها طبقة واحدة؛ الأنوية في مستويات مختلفة.",
        practicalTips: ["Nuclei are at different levels.", "Usually ciliated. Found in the trachea."],
        practicalTipsAr: ["الأنوية في مستويات مختلفة.", "غالباً تحتوي على أهداب (Cilia)، وتوجد في القصبة الهوائية."],
        confusionWarning: "Very often confused with Stratified Columnar or Stratified Squamous. The key is the cilia on top; true stratified squamous almost never has cilia.",
        confusionWarningAr: "السر في الأهداب الموجودة بالأعلى؛ الحرشفية الطبقية لا تحتوي على أهداب.",
        imageUrl: "/images/pseudostratified columnar/pseudostratified columnar.png",
        imageUrls: ["/images/pseudostratified columnar/pseudostratified columnar.png", "/images/pseudostratified columnar/pseudostratified columnar micro.png"]
      },
      {
        id: "non-keratinized-stratified-squamous",
        title: "Non-Keratinized Stratified Squamous",
        titleAr: "حرشفية طبقية غير متقرنة",
        description: "Multiple layers of cells, where the top layers are flat and retain their nuclei.",
        practicalTips: ["Top layers have visible nuclei (alive cells).", "Lining of wet surfaces like the esophagus and vagina."],
        practicalTipsAr: ["الطبقات السطحية تحتوي على أنوية واضحة.", "تبطن الأسطح الرطبة مثل المريء والمهبل."],
        confusionWarning: "Unlike keratinized epithelium, the surface cells here are alive and have nuclei. Look for dark dots at the very top.",
        imageUrl: "/images/non keratinized stratified/non keratinized.png",
        imageUrls: [
          "/images/non keratinized stratified/non keratinized.png", 
          "/images/non keratinized stratified/non keratinized micro.png"
        ]
      },
      {
        id: "keratinized-stratified-squamous",
        title: "Keratinized Stratified Squamous",
        titleAr: "حرشفية طبقية متقرنة",
        description: "Multiple layers where the surface cells are dead, flat, and filled with keratin (no nuclei).",
        practicalTips: ["Surface layers are dead and have no nuclei.", "Contains a thick layer of keratin on top for protection.", "Forms the epidermis of the skin."],
        practicalTipsAr: ["الطبقات السطحية ميتة ولا تحتوي على أنوية.", "تحتوي على طبقة سميكة من الكيراتين للحماية.", "تكون طبقة البشرة في الجلد."],
        confusionWarning: "Look for the flaky, pink/red keratin layer on top with no nuclei. This distinguishes it from the non-keratinized type.",
        imageUrl: "/images/keratized stratified/keratized .png",
        imageUrls: [
          "/images/keratized stratified/keratized .png", 
          "/images/keratized stratified/kertaized micro.png",
          "/images/keratized stratified/layers.png"
        ],
        extraStudy: {
          title: "Epidermal Layer Analysis",
          titleAr: "تحليل طبقات البشرة",
          buttonLabel: "Layers Analysis",
          buttonLabelAr: "تحليل الطبقات",
          imageUrl: "/images/keratized stratified/layers.png",
          content: "The epidermis of thick skin (keratinized) consists of five distinct layers: 1. Stratum Basale, 2. Stratum Spinosum, 3. Stratum Granulosum, 4. Stratum Lucidum, 5. Stratum Corneum.",
          contentAr: "تتكون البشرة في الجلد السميك من خمس طبقات: 1. الطبقة القاعدة، 2. الطبقة الشائكة، 3. الطبقة الحبيبية، 4. الطبقة الشفافة، 5. الطبقة القرنية."
        }
      },
      {
        id: "transitional",
        title: "Transitional Epithelium",
        description: "Specialized to stretch.",
        practicalTips: ["Top cells are large and dome-shaped (umbrella cells) when empty, flattened when stretched.", "Found in the urinary bladder and ureter."],
        confusionWarning: "Often confused with Non-keratinized Stratified Squamous. Look at the topmost cells: if they are big, puffy, and dome-like (umbrella cells), it's transitional.",
        imageUrl: "/images/transitional epithelem/transitional.png",
        imageUrls: ["/images/transitional epithelem/transitional.png", "/images/transitional epithelem/transitional micro.png"]
      }
    ]
  },
  {
    id: "connective",
    title: "Connective Tissue",
    titleAr: "الأنسجة الضامة",
    description: "Supports, binds, and protects other tissues. Made of cells, fibers, and ground substance (matrix).",
    descriptionAr: "تدعم وتربط وتحمي الأنسجة الأخرى. تتكون من خلايا وألياف ومادة بين خلوية.",
    practicalTips: [
      "Cells are widely separated by an abundant extracellular matrix."
    ],
    practicalTipsAr: [
      "الخلايا متباعدة عن بعضها وتفصلها كمية كبيرة من المادة بين الخلوية (Matrix)."
    ],
    subSections: [
      {
        id: "mucous-ct",
        title: "Mucous Connective Tissue",
        titleAr: "نسيج ضام مخاطي",
        description: "Jelly-like ground substance rich in hyaluronic acid.",
        descriptionAr: "مادة بين خلوية هلامية غنية بحمض الهيالورونيك.",
        practicalTips: ["Star-shaped fibroblasts.", "Found exclusively in the umbilical cord (Wharton's Jelly)."],
        practicalTipsAr: ["خلايا ليفية (Fibroblasts) نجمية الشكل.", "يوجد حصرياً في الحبل السري (Wharton's Jelly)."],
        confusionWarning: "Looks extremely pale and empty due to the massive amount of ground substance.",
        imageUrl: "/images/mucos connective/mucous connective.png",
        imageUrls: ["/images/mucos connective/mucous connective.png", "/images/mucos connective/mucos connective micro.png"]
      },
      {
        id: "loose-ct",
        title: "Loose (Areolar) CT",
        titleAr: "نسيج ضام فجوي (Areolar)",
        description: "More cells and ground substance, fewer fibers.",
        descriptionAr: "أكثر أنواع الأنسجة الضامة انتشاراً؛ خلايا كثيرة وألياف قليلة.",
        practicalTips: ["Messy appearance with randomly arranged fibers (collagen thick, elastic thin)."],
        practicalTipsAr: ["مظهر غير منتظم؛ ألياف كولاجين سميكة وألياف مرنة رفيعة مرتبة عشوائياً."],
        confusionWarning: "Can look like a total mess. Differentiate it from dense irregular CT by noting the high amount of white empty space (ground substance).",
        imageUrl: "/images/loose areolar/loose areolar.png",
        imageUrls: ["/images/loose areolar/loose areolar.png", "/images/loose areolar/areolar micro.png"],
      },
      {
        id: "adipose-ct",
        title: "Adipose Tissue (Fat)",
        titleAr: "نسيج دهني",
        description: "Stores energy, insulates.",
        descriptionAr: "مخصص لتخزين الطاقة والعزل الحراري.",
        practicalTips: ["Cells look like empty rings (signet ring appearance) because fat is washed out.", "Nucleus is pushed to the edge."],
        practicalTipsAr: ["الخلايا تشبه 'خاتم الفص' لأن الدهون تذوب أثناء التحضير.", "النواة منضغطة في طرف الخلية."],
        confusionWarning: "Might be confused with Simple Squamous forming lung alveoli. Adipose cells are generally uniform bubbles, whereas lung alveoli have varying sizes and many blood vessels.",
        imageUrl: "/images/adipose tissue/adipose tissue.png",
        imageUrls: ["/images/adipose tissue/adipose tissue.png", "/images/adipose tissue/adipose tissue micro.png"]
      },
      {
        id: "reticular-ct",
        title: "Reticular Tissue",
        description: "Network of reticular fibers forming a scaffold for organs.",
        practicalTips: ["Branching dark reticular fibers resembling a cherry tree.", "Found in spleen, lymph nodes."],
        confusionWarning: "Requires special silver stains to see the fibers clearly, which makes them look black.",
        imageUrl: "/images/reticular tissue/reticular tissue.png",
        imageUrls: ["/images/reticular tissue/reticular tissue.png", "/images/reticular tissue/reticular tissue micro.png"]
      },
      {
        id: "dense-regular",
        title: "Dense Regular CT",
        description: "Mainly collagen fibers running in parallel.",
        practicalTips: ["Collagen fibers are parallel (Tendons/Ligaments).", "Fibroblast nuclei are squashed between fibers."],
        confusionWarning: "Often confused with Smooth Muscle! Dense Regular CT has wavy, glassy collagen fibers and the nuclei are very thin/dark and outside the fibers. Smooth muscle cells are the fibers themselves, and nuclei are inside.",
        imageUrl: "/images/dense ct/dense ct.png",
        imageUrls: ["/images/dense ct/dense ct.png", "/images/dense ct/dense ct micro.png"],
      },
      {
        id: "elastic-ct",
        title: "Elastic Connective Tissue",
        titleAr: "نسيج ضام مرن",
        description: "High concentration of elastic (yellow) fibers allowing significant stretch and recoil.",
        descriptionAr: "يحتوي على تركيز عالٍ من الألياف المرنة (الصفراء) التي تسمح بالتمدد والارتداد.",
        practicalTips: [
          "Yellow Fibers (Elastic): Look for thin, delicate, branching fibers that form a network. They are often stained dark (black/purple).",
          "White Fibers (Collagen): These are thick, wavy bundles. They are stronger but less flexible than yellow fibers.",
          "In the Aorta: Look for thick, wavy, parallel 'lamellae' of elastic tissue."
        ],
        practicalTipsAr: [
          "الألياف الصفراء (Elastic): ألياف رفيعة، رقيقة، ومتفرعة مكونة شبكة. غالباً تظهر بلون داكن.",
          "الألياف البيضاء (Collagen): حزم سميكة ومموجة. أقوى ولكن أقل مرونة من الصفراء.",
          "في الأورطى: ابحث عن 'رقائق' سميكة ومموجة ومتوازية من النسيج المرن."
        ],
        confusionWarning: "Differentiate White vs Yellow: White fibers (Collagen) are thick bundles and don't branch. Yellow fibers (Elastic) are much thinner, branch frequently, and have a 'snappy' wavy appearance. Also, don't confuse Elastic CT with Dense Regular CT; Elastic CT is much darker and more 'crinkly'.",
        confusionWarningAr: "الفرق بين البيضاء والصفراء: الألياف البيضاء (كولاجين) تكون في حزم سميكة ولا تتفرع. الألياف الصفراء (مرنة) أرفع بكثير وتتفرع بكثرة ولها مظهر 'زجزاجي' حاد.",
        imageUrl: "/images/elastic connective tissue/elastic connective.png",
        imageUrls: ["/images/elastic connective tissue/elastic connective.png", "/images/elastic connective tissue/elastic connective micro.png"]
      },
      {
        id: "hyaline-cartilage",
        title: "Hyaline Cartilage",
        description: "Most common. Glassy matrix.",
        practicalTips: ["Matrix looks smooth and uniform (fibers are invisible).", "Found in trachea rings and joint surfaces."],
        practicalTipsAr: ["المادة الخلالية تبدو ناعمة ومنتظمة (الألياف غير مرئية).", "توجد في حلقات القصبة الهوائية وأسطح المفاصل."],
        confusionWarning: "Don't confuse with Elastic Cartilage. Hyaline has a clear 'glassy' pink/purple background.",
        confusionWarningAr: "لا تخلط بينه وبين الغضروف المرن. الغضروف الزجاجي له خلفية 'زجاجية' صافية.",
        imageUrl: "/images/hyaline cartilage/hyaline cartilage.png",
        imageUrls: ["/images/hyaline cartilage/hyaline cartilage.png", "/images/hyaline cartilage/hyaline cartilage micro.png"]
      },
      {
        id: "elastic-cartilage",
        title: "Elastic Cartilage",
        description: "Contains prominent elastic fibers.",
        practicalTips: ["Dark, branching elastic fibers visible in the matrix.", "Found in the ear pinna and epiglottis."],
        practicalTipsAr: ["ألياف مرنة داكنة ومتفرعة مرئية في المادة الخلالية.", "يوجد في صيوان الأذن ولسان المزمار."],
        confusionWarning: "Looks like hyaline but with a dirty/hairy background due to the dark elastic fibers. Compare with Hyaline Cartilage.",
        confusionWarningAr: "يشبه الزجاجي لكن بخلفية 'متسخة' بسبب الألياف الداكنة. قارنه مع الغضروف الزجاجي.",
        imageUrl: "/images/elastic cartilage/elastic cartilage.png",
        imageUrls: ["/images/elastic cartilage/elastic cartilage.png", "/images/elastic cartilage/elastic cartilage micro.png"]
      },
      {
        id: "fibrocartilage",
        title: "Fibrocartilage",
        description: "Tough cartilage with thick collagen bundles.",
        practicalTips: ["Chondrocytes often arranged in distinct rows between thick collagen bundles.", "NO perichondrium.", "Found in intervertebral discs."],
        confusionWarning: "Can be confused with Dense Regular CT. The key difference: Fibrocartilage has chondrocytes trapped in distinct rounded lacunae (bubbles), whereas Dense Regular CT has squashed flat fibroblasts.",
        imageUrl: "/images/fibrocartilage/fibrocartilage.png",
        imageUrls: ["/images/fibrocartilage/fibrocartilage.png"]
      },
      {
        id: "compact-bone",
        title: "Compact Bone",
        description: "Dense outer layer.",
        practicalTips: ["Arranged in distinct cylindrical structures called Osteons (Haversian systems).", "Look for central canals surrounded by concentric lamellae."],
        confusionWarning: "Almost impossible to confuse if cut in a cross-section (looks like tree rings).",
        imageUrl: "/images/compact bone/compact bone .png",
        imageUrls: ["/images/compact bone/compact bone .png", "/images/compact bone/compact bone micro.png"]
      },
      {
        id: "spongy-bone",
        title: "Spongy (Cancellous) Bone",
        description: "Inner meshwork.",
        practicalTips: ["No osteons.", "Consists of irregular bony trabeculae with large bone marrow cavities in between."],
        confusionWarning: "Confused with compact bone. Spongy bone lacks the distinct organized 'tree ring' osteons and instead looks like a random pink sponge filled with red/purple marrow.",
        imageUrl: "/images/spongy bone/spongy bone.png",
        imageUrls: ["/images/spongy bone/spongy bone.png", "/images/spongy bone/spongy bone micro.png"]
      }
    ]
  },
  {
    id: "nervous",
    title: "Nervous Tissue",
    titleAr: "الأنسجة العصبية",
    description: "Transmits electrical signals and forms the brain, spinal cord, and nerves.",
    descriptionAr: "تنقل الإشارات الكهربائية وتكون الدماغ والنخاع الشوكي والأعصاب.",
    practicalTips: [
      "Always look for the giant star-shaped multipolar neurons or distinct bundles of nerve fibers."
    ],
    practicalTipsAr: [
      "دائماً ابحث عن الخلايا العصبية النجمية العملاقة أو حزم الألياف العصبية الواضحة."
    ],
    subSections: [
      {
        id: "motor-neuron",
        title: "Motor Neuron",
        titleAr: "عصبون حركي",
        description: "Large, multipolar neuron responsible for sending motor signals.",
        descriptionAr: "خلية عصبية كبيرة متعددة الأقطاب مسؤولة عن إرسال الإشارات الحركية.",
        practicalTips: [
          "Look for the giant star-shaped cell body (soma).",
          "Contains a large pale nucleus with a very distinct dark nucleolus (owl's eye appearance).",
          "Multiple dendrites branching out, and one long axon."
        ],
        practicalTipsAr: [
          "ابحث عن جسم الخلية النجمي العملاق.",
          "تحتوي على نواة فاتحة بداخلها نوية غامقة واضحة (تشبه عين البومة).",
          "زوائد شجرية متعددة ومحور عصبي واحد طويل."
        ],
        confusionWarning: "Do not confuse the large neuron cell bodies with anything else; they are the largest cells you will see.",
        imageUrl: "/images/motor neuron/motor neuron.png",
        imageUrls: ["/images/motor neuron/motor neuron.png"]
      },
      {
        id: "spinal-cord",
        title: "Spinal Cord (T.S.)",
        description: "Transverse section of the spinal cord.",
        practicalTips: [
          "Distinct 'H' or butterfly-shaped grey matter in the center.",
          "White matter surrounds the grey matter.",
          "Central canal in the exact middle of the grey matter."
        ],
        practicalTipsAr: [
          "مادة رمادية مركزية على شكل حرف 'H' أو فراشة.",
          "المادة البيضاء تحيط بالمادة الرمادية.",
          "قناة مركزية في منتصف المادة الرمادية تماماً."
        ],
        confusionWarning: "Look specifically for the internal butterfly shape (grey matter). Compare with Sciatic Nerve.",
        confusionWarningAr: "ابحث عن شكل الفراشة الداخلي. قارنه مع العصب الوركي.",
        imageUrl: "/images/spinal cord/spinal cord.png",
        imageUrls: ["/images/spinal cord/spinal cord.png", "/images/spinal cord/spinal cord micro.png"],
      },
      {
        id: "sciatic-nerve",
        title: "Sciatic Nerve (Peripheral Nerve T.S.)",
        description: "Transverse section of a large peripheral nerve bundle.",
        practicalTips: [
          "Nerve fibers are grouped into distinct bundles (fascicles).",
          "Outer protective layer called Epineurium.",
          "Looks like a collection of tiny circles (axons surrounded by myelin)."
        ],
        practicalTipsAr: [
          "الألياف العصبية مجمعة في حزم واضحة (Fascicles).",
          "طبقة حماية خارجية تسمى Epineurium.",
          "تشبه مجموعة من الدوائر الصغيرة (المحاور محاطة بالمايلين)."
        ],
        confusionWarning: "In cross section, it looks like bundles of tiny bubbles/circles clustered together. Don't confuse with Smooth Muscle in T.S.",
        imageUrl: "/images/sciatic nerve/sciatic micro.png",
        imageUrls: ["/images/sciatic nerve/sciatic micro.png", "/images/sciatic nerve/sciatic outer micro.png"],
      }
    ]
  },
  {
    id: "muscular",
    title: "Muscular Tissue",
    description: "Specialized for contraction.",
    practicalTips: ["Cells are elongated (called fibers)."],
    subSections: [
      {
        id: "skeletal-muscle",
        title: "Skeletal Muscle",
        description: "Voluntary, attached to bones.",
        practicalTips: [
          "Fibers are very long, cylindrical, and unbranched.",
          "Multinucleated, with nuclei pushed to the periphery.",
          "Distinct transverse striations."
        ],
        practicalTipsAr: [
          "ألياف طويلة جداً، أسطوانية، وغير متفرعة.",
          "متعددة الأنوية، والأنوية مدفوعة نحو الأطراف.",
          "تخطيطات عرضية واضحة (Striations)."
        ],
        confusionWarning: "Skeletal fibers NEVER branch and have multiple peripheral nuclei. Compare with Cardiac Muscle.",
        confusionWarningAr: "الألياف الهيكلية لا تتفرع أبداً ولها أنوية طرفية. قارنها مع العضلة القلبية.",
        imageUrl: "/images/skeletal muscle/skeletal muscle.png",
        imageUrls: ["/images/skeletal muscle/skeletal muscle.png", "/images/skeletal muscle/skeletal muscle  micro.png"],
      },
      {
        id: "cardiac-muscle",
        title: "Cardiac Muscle",
        description: "Involuntary, heart.",
        practicalTips: [
          "Fibers are cylindrical but branched.",
          "Usually have a single, centrally located nucleus.",
          "Key feature: Intercalated discs."
        ],
        practicalTipsAr: [
          "ألياف أسطوانية ولكنها متفرعة.",
          "عادة تحتوي على نواة واحدة مركزية الموقع.",
          "الميزة الأساسية: الأقراص البينية (Intercalated discs)."
        ],
        confusionWarning: "Look specifically for the dark vertical lines (Intercalated discs). Compare with Smooth Muscle.",
        confusionWarningAr: "ابحث عن الخطوط الرأسية الداكنة (الأقراص البينية). قارنها مع العضلة الملساء.",
        imageUrl: "/images/cardiac muscle structre/cardiac muscular tissue.png",
        imageUrls: ["/images/cardiac muscle structre/cardiac muscular tissue.png", "/images/cardiac muscle structre/cardiac micro.png"],
      },
      {
        id: "smooth-muscle",
        title: "Smooth Muscle",
        description: "Involuntary, walls of hollow organs.",
        practicalTips: [
          "Fibers are spindle-shaped (tapered at ends).",
          "Single, centrally located oval/cigar-shaped nucleus.",
          "No striations."
        ],
        practicalTipsAr: [
          "ألياف مغزلية الشكل (مدببة عند الأطراف).",
          "نواة واحدة مركزية بيضاوية تشبه 'السيجار'.",
          "لا توجد تخطيطات."
        ],
        confusionWarning: "Smooth muscle has nuclei INSIDE the pink fibers. Compare with Dense Regular CT.",
        confusionWarningAr: "العضلات الملساء لها أنوية داخل الألياف الوردية. قارنها مع النسيج الضام الكثيف.",
        imageUrl: "/images/smooth muscle/muscular muscle.png",
        imageUrls: ["/images/smooth muscle/muscular muscle.png", "/images/smooth muscle/smooth micro.png"]
      }
    ]
  },
  {
    id: "organ-samples",
    title: "Histological Organ Samples",
    description: "Complex organs composed of multiple tissue types working together.",
    practicalTips: [
      "Look for layers (e.g., mucosa, submucosa, muscularis).",
      "Identify functional units."
    ],
    subSections: [
      {
        id: "pancreas",
        title: "Pancreas",
        titleAr: "البنكرياس",
        description: "Mixed exocrine and endocrine gland.",
        descriptionAr: "غدة مختلطة (قنوية ولا قنوية).",
        practicalTips: [
          "Look for pale-staining patches called Islets of Langerhans."
        ],
        practicalTipsAr: [
          "ابحث عن بقع فاتحة اللون تسمى جزر لانجر هانز (Islets of Langerhans)."
        ],
        confusionWarning: "Presence of pale Islets of Langerhans specifically confirms it is the pancreas.",
        confusionWarningAr: "وجود جزر لانجر هانز الفاتحة يؤكد تماماً أنه البنكرياس.",
        imageUrl: "/images/pancreas/pancreas.png",
        imageUrls: ["/images/pancreas/pancreas.png", "/images/pancreas/pancreas micro.png"]
      },
      {
        id: "ileum",
        title: "Ileum (Small Intestine)",
        titleAr: "اللفائفي (الأمعاء الدقيقة)",
        description: "Part of the small intestine specialized for absorption.",
        descriptionAr: "جزء من الأمعاء الدقيقة مخصص لامتصاص الغذاء.",
        practicalTips: [
          "Prominent finger-like projections called Villi.",
          "Many Goblet cells."
        ],
        practicalTipsAr: [
          "بروزات تشبه الأصابع تسمى خملات (Villi).",
          "كثرة الخلايا الكأسية (Goblet cells)."
        ],
        confusionWarning: "Ileum has distinct outward-projecting villi and many goblet cells.",
        confusionWarningAr: "يتميز اللفائفي بالخملات البارزة للخارج وكثرة الخلايا الكأسية.",
        imageUrl: "/images/ileum/ileum.png",
        imageUrls: ["/images/ileum/ileum.png", "/images/ileum/ileum micro.png"]
      },
      {
        id: "kidney",
        title: "Kidney",
        titleAr: "الكلية",
        description: "Organ for filtration.",
        descriptionAr: "عضو مخصص لترشيح الدم وتكوين البول.",
        practicalTips: [
          "Cortex contains round structures called Glomeruli."
        ],
        practicalTipsAr: [
          "القشرة تحتوي على تراكيب مستديرة تسمى كبيبات (Glomeruli)."
        ],
        confusionWarning: "Look specifically for the Glomeruli (a ball of capillaries inside a capsule).",
        confusionWarningAr: "ابحث خصيصاً عن الكبيبات (كرة من الشعيرات الدموية داخل محفظة).",
        imageUrl: "/images/kidney/kidney.png",
        imageUrls: ["/images/kidney/kidney.png", "/images/kidney/kidney micro.png"],
      },
      {
        id: "esophagus",
        title: "Esophagus",
        titleAr: "المريء",
        description: "Muscular tube.",
        descriptionAr: "أنبوب عضلي لنقل الطعام.",
        practicalTips: [
          "Lined by a very thick Non-keratinized Stratified Squamous Epithelium."
        ],
        practicalTipsAr: [
          "مبطن بنسيج طلائي حرشفي طبقي غير متقرن سميك جداً."
        ],
        confusionWarning: "Distinct thick muscularis layer and folded mucosa.",
        confusionWarningAr: "يتميز بطبقة عضلية سميكة وغشاء مخاطي مطوي.",
        imageUrl: "/images/esophagus/esophagus.png",
        imageUrls: ["/images/esophagus/esophagus.png", "/images/esophagus/esophagus micro.png"]
      },
      {
        id: "skin",
        title: "Skin (V.S.)",
        description: "Integumentary system.",
        practicalTips: [
          "Thick Keratinized Stratified Squamous Epithelium.",
          "Hair Follicles and Sebaceous glands."
        ],
        confusionWarning: "Dead, flaky top keratin layer.",
        imageUrl: "/images/skin/skin.png",
        imageUrls: ["/images/skin/skin.png", "/images/skin/skin micro.png"]
      },
      {
        id: "testis",
        title: "Testis",
        description: "Male reproductive organ.",
        practicalTips: [
          "Composed of many circular Seminiferous Tubules."
        ],
        confusionWarning: "Testis tubules contain multiple layers of maturing sperm cells.",
        imageUrl: "/images/testis/testis.png",
        imageUrls: ["/images/testis/testis.png", "/images/testis/testis micro.png"]
      },
      {
        id: "liver",
        title: "Liver",
        titleAr: "الكبد",
        description: "Large metabolic organ.",
        descriptionAr: "عضو تمثيل غذائي كبير.",
        practicalTips: [
          "Arranged in distinct hexagonal Hepatic Lobules.",
          "Central Vein in the middle."
        ],
        practicalTipsAr: [
          "مرتب في فصيصات كبدية سداسية الشكل.",
          "وجود وريد مركزي (Central Vein) في المنتصف."
        ],
        confusionWarning: "Highly distinctive repeating hexagonal lobules.",
        confusionWarningAr: "يتميز بالفصيصات السداسية المتكررة.",
        imageUrl: "/images/liver/liver.png",
        imageUrls: ["/images/liver/liver.png", "/images/liver/liver micro.png"],
      },
      {
        id: "trachea",
        title: "Trachea",
        description: "Windpipe.",
        practicalTips: [
          "Pseudostratified Ciliated Columnar Epithelium.",
          "Distinct C-shaped ring of Hyaline Cartilage."
        ],
        confusionWarning: "Combination of ciliated epithelium and hyaline cartilage ring.",
        imageUrl: "/images/trachea/trachea.png",
        imageUrls: ["/images/trachea/trachea.png", "/images/trachea/trachea micro.png"]
      },
      {
        id: "stomach",
        title: "Stomach",
        description: "Digestion organ.",
        practicalTips: [
          "Surface has deep Gastric pits.",
          "NO goblet cells."
        ],
        confusionWarning: "Inward pits (gastric glands) and no goblet cells.",
        imageUrl: "/images/stomach/stomach.png",
        imageUrls: ["/images/stomach/stomach.png", "/images/stomach/stomach micro.png"],
      }
    ]
  },
  {
    id: "blood",
    title: "Blood",
    description: "Specialized connective tissue.",
    practicalTips: [
      "RBCs are the most numerous cells."
    ],
    subSections: [
      {
        id: "rabbit-blood",
        title: "Rabbit Blood",
        titleAr: "دم الأرنب",
        description: "Mammalian blood film.",
        descriptionAr: "فيلم دم ثدييات.",
        practicalTips: [
          "RBCs are non-nucleated biconcave discs."
        ],
        practicalTipsAr: [
          "خلايا الدم الحمراء غير منواة (لا تحتوي على أنوية) ومقعرة الوجهين."
        ],
        confusionWarning: "Rabbit (mammal) RBCs lack nuclei.",
        confusionWarningAr: "خلايا دم الأرنب (الثدييات) تفتقر للأنوية.",
        imageUrl: "/images/blood film of rabbit/blood film of rabbit.png",
        imageUrls: ["/images/blood film of rabbit/blood film of rabbit.png", "/images/blood film of rabbit/blood film of rabbit micro.png"]
      },
      {
        id: "toad-blood",
        title: "Toad Blood",
        titleAr: "دم الضفدع",
        description: "Amphibian blood film.",
        descriptionAr: "فيلم دم برمائيات.",
        practicalTips: [
          "RBCs are large, oval, and nucleated."
        ],
        practicalTipsAr: [
          "خلايا الدم الحمراء كبيرة، بيضاوية، وتحتوي على أنوية."
        ],
        confusionWarning: "Large nuclei in every RBC.",
        confusionWarningAr: "وجود أنوية كبيرة في كل خلية دم حمراء.",
        imageUrl: "/images/blood film of toad/blood film toad.png",
        imageUrls: ["/images/blood film of toad/blood film toad.png", "/images/blood film of toad/blood film of toad micro.png"]
      }
    ]
  }
];
