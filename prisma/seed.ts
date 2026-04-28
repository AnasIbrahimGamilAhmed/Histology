import { DifficultyLevel, PrismaClient, QuestionType, VariationType } from "@prisma/client";

const prisma = new PrismaClient();

type SeedSample = {
  name: string;
  description: string;
  keyFeatures: string[];
  confusionTags: string[];
  variations: {}[] & {
    image: string;
    type: VariationType;
    notes?: string;
  }[];
};

const samples: SeedSample[] = [
  {
    name: "Simple squamous epithelium",
    description: "Single thin layer of flattened cells lining diffusion-friendly surfaces.",
    keyFeatures: ["Flat nuclei", "Very thin cytoplasm", "Continuous luminal border"],
    confusionTags: ["endothelium", "artifact folds"],
    variations: [
      { image: "/images/simple squamous/simple squamous.png", type: VariationType.stain_variation, notes: "H&E stain showing flattened epithelial cells." },
      { image: "/images/simple squamous/simple squamous micro.png", type: VariationType.section_variation, notes: "Oblique section view." },
      { image: "/images/simple squamous/simple squamous micro.png", type: VariationType.exam_tricky_view, notes: "Tricky field near transition area." }
    ]
  },
  {
    name: "Hyaline cartilage",
    description: "Supportive connective tissue with chondrocytes in lacunae and glassy matrix.",
    keyFeatures: ["Lacunae", "Isogenous groups", "Homogeneous matrix"],
    confusionTags: ["elastic cartilage", "processing artifact"],
    variations: [
      { image: "/images/hyaline cartilage/hyaline cartilage.png", type: VariationType.stain_variation, notes: "H&E stain showing lacunae and matrix." },
      { image: "/images/hyaline cartilage/hyaline cartilage micro.png", type: VariationType.magnification_variation, notes: "Higher magnification view." }
    ]
  },
  {
    name: "Skeletal muscle",
    description: "Multinucleated fibers with peripheral nuclei and striated appearance.",
    keyFeatures: ["Striations", "Peripheral nuclei", "Parallel fibers"],
    confusionTags: ["smooth muscle", "dense regular CT"],
    variations: [
      { image: "/images/skeletal muscle/skeletal muscle.png", type: VariationType.region_variation, notes: "Muscle fiber region view." },
      { image: "/images/skeletal muscle/skeletal muscle.png", type: VariationType.section_variation, notes: "Cross section shows polygonal fibers." },
      { image: "/images/skeletal muscle/skeletal muscle  micro.png", type: VariationType.exam_tricky_view, notes: "Exam-like striated muscle view." }
    ]
  },
  {
    name: "Compact bone",
    description: "Organized lamellar bone with osteons around central canals.",
    keyFeatures: ["Osteons", "Concentric lamellae", "Haversian canals"],
    confusionTags: ["spongy bone", "section cracks"],
    variations: [
      { image: "/images/compact bone/compact bone .png", type: VariationType.magnification_variation, notes: "Osteons visible at high magnification." },
      { image: "/images/compact bone/compact bone micro.png", type: VariationType.region_variation, notes: "Central region showing lamellae." }
    ]
  },
  {
    name: "Liver lobule",
    description: "Hepatic plates radiating from central vein with portal triads at periphery.",
    keyFeatures: ["Central vein", "Sinusoids", "Portal triad zones"],
    confusionTags: ["pancreas", "venous profiles"],
    variations: [
      { image: "/images/liver/liver.png", type: VariationType.stain_variation, notes: "Liver histology showing hepatic organization." },
      { image: "/images/liver/liver.png", type: VariationType.region_variation, notes: "Portal region view." },
      { image: "/images/liver/liver micro.png", type: VariationType.exam_tricky_view, notes: "Exam-like liver field." }
    ]
  },
  {
    name: "Nervous tissue",
    description: "Specialized tissue composed of neurons and glial cells for transmitting electrical impulses.",
    keyFeatures: ["Neurons and glia", "Axon bundles", "Synaptic networks"],
    confusionTags: ["connective tissue", "vascular profiles", "artifact folds"],
    variations: [
      { image: "/images/motor neuron/motor neuron.png", type: VariationType.stain_variation, notes: "General view of nervous tissue with neuron soma." },
      { image: "/images/spinal cord/spinal cord.png", type: VariationType.section_variation, notes: "Spinal cord section showing grey and white matter." },
      { image: "/images/sciatic nerve/motor neuron.png", type: VariationType.exam_tricky_view, notes: "Exam-style nerve bundle field." }
    ]
  },
  {
    name: "Motor neuron",
    description: "Large multipolar neuron that sends motor commands from the CNS to muscle.",
    keyFeatures: ["Large soma", "Distinct nucleolus", "Multiple dendrites"],
    confusionTags: ["glial cells", "blood vessels", "fibroblasts"],
    variations: [
      { image: "/images/motor neuron/motor neuron.png", type: VariationType.stain_variation, notes: "Motor neuron with visible soma and denderites." },
      { image: "/images/motor neuron/motor neuron.png", type: VariationType.section_variation, notes: "Large motor neuron body in section." },
      { image: "/images/motor neuron/motor neuron.png", type: VariationType.exam_tricky_view, notes: "Neuron with surrounding glial background." }
    ]
  },
  {
    name: "Neuroglia",
    description: "Support cells of the nervous system that nourish and insulate neurons.",
    keyFeatures: ["Smaller nuclei", "Supportive roles", "Often clustered around neurons"],
    confusionTags: ["lymphocytes", "endothelial cells", "artifact nuclei"],
    variations: [
      { image: "/images/motor neuron/motor neuron.png", type: VariationType.stain_variation, notes: "Glial cells as support structures." },
      { image: "/images/motor neuron/motor neuron.png", type: VariationType.section_variation, notes: "Glial cell patterns in tissue." },
      { image: "/images/motor neuron/motor neuron.png", type: VariationType.exam_tricky_view, notes: "Dense glial staining exam view." }
    ]
  },
  {
    name: "Spinal cord",
    description: "Cross section through the spinal cord showing grey and white matter.",
    keyFeatures: ["Butterfly-shaped grey matter", "Surrounding white matter", "Central canal"],
    confusionTags: ["brainstem", "nerve root", "artifact crack"],
    variations: [
      { image: "/images/spinal cord/spinal cord.png", type: VariationType.stain_variation, notes: "Spinal cord showing grey/white matter contrast." },
      { image: "/images/spinal cord/spinal cord.png", type: VariationType.section_variation, notes: "Transverse spinal cord section." },
      { image: "/images/spinal cord/spinal cord micro.png", type: VariationType.exam_tricky_view, notes: "Exam field with central butterfly pattern." }
    ]
  },
  {
    name: "Sciatic nerve",
    description: "Peripheral nerve cross-section showing bundled nerve fascicles.",
    keyFeatures: ["Fascicles", "Epineurium", "Circular axon profiles"],
    confusionTags: ["dense connective tissue", "blood vessel cross-sections", "artifact bubbles"],
    variations: [
      { image: "/images/sciatic nerve/motor neuron.png", type: VariationType.stain_variation, notes: "Nerve fascicles with connective tissue." },
      { image: "/images/sciatic nerve/motor neuron.png", type: VariationType.section_variation, notes: "Cross-section through peripheral nerve." },
      { image: "/images/sciatic nerve/motor neuron.png", type: VariationType.exam_tricky_view, notes: "Tightly packed nerve fascicles exam view." }
    ]
  }
];

async function main() {
  // await prisma.studentAccount.deleteMany(); // Preserve user accounts
  await prisma.examQuestionInstance.deleteMany();
  await prisma.examInstance.deleteMany();
  await prisma.attemptHistory.deleteMany();
  await prisma.reviewSchedule.deleteMany();
  await prisma.confusionPair.deleteMany();
  await prisma.samplePerformance.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.variation.deleteMany();
  await prisma.sample.deleteMany();

  for (const sample of samples) {
    await prisma.sample.create({
      data: {
        name: sample.name,
        description: sample.description,
        keyFeatures: sample.keyFeatures,
        confusionTags: sample.confusionTags,
        variations: {
          create: sample.variations
        }
      }
    });
  }

  const createdSamples = await prisma.sample.findMany({
    include: { variations: true }
  });

  for (const sample of createdSamples) {
    const variationForQuestion =
      sample.variations.find((variation: any) => variation.type === VariationType.exam_tricky_view) ?? sample.variations[0];

    if (!variationForQuestion) {
      continue;
    }

    const distractors = createdSamples
      .filter((candidate: any) => candidate.id !== sample.id)
      .map((candidate: any) => candidate.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const identifyChoices = [...distractors, sample.name].sort(() => Math.random() - 0.5);

    await prisma.question.create({
      data: {
        sampleId: sample.id,
        variationId: variationForQuestion.id,
        type: QuestionType.identify_sample,
        difficulty:
          variationForQuestion.type === VariationType.exam_tricky_view ? DifficultyLevel.hard : DifficultyLevel.medium,
        prompt: "Identify this histology sample.",
        image: variationForQuestion.image,
        choices: identifyChoices,
        acceptedAnswers: JSON.parse(JSON.stringify([sample.name])),
      }
    });

    await prisma.question.create({
      data: {
        sampleId: sample.id,
        variationId: variationForQuestion.id,
        type: QuestionType.list_features,
        difficulty: DifficultyLevel.easy,
        prompt: "List one key feature that supports your diagnosis for this sample.",
        image: variationForQuestion.image,
        acceptedAnswers: JSON.parse(JSON.stringify(sample.keyFeatures)),
      }
    });
  }

  const testAccounts = [
    {
      universityId: "ASU-1001",
      name: "Student One",
      email: "student1@asu.edu.eg",
      password: "password123"
    },
    {
      universityId: "ASU-2002",
      name: "Test User",
      email: "test@example.com",
      password: "123456"
    }
  ];

  for (const acc of testAccounts) {
    await prisma.studentAccount.upsert({
      where: { universityId: acc.universityId },
      update: {},
      create: acc
    });
  }

  console.log(`Seeded ${samples.length} samples and ${createdSamples.length * 2} exam questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

