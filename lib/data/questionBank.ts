import { histologyData, TissueSection } from "./histologyData";

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  rationale: string;
  focusHint: string;
  imageUrl?: string;
  difficulty: "beginner" | "advanced";
};

// Flatten the tree to get all concrete tissues
const getAllTissues = (): TissueSection[] => {
  const tissues: TissueSection[] = [];
  const traverse = (nodes: TissueSection[]) => {
    for (const node of nodes) {
      if (!node.subSections || node.subSections.length === 0) {
        tissues.push(node);
      } else {
        traverse(node.subSections);
      }
    }
  };
  traverse(histologyData);
  return tissues;
};

const tissues = getAllTissues();

// Utility to get random items
const getRandomItems = <T>(arr: T[], count: number, exclude?: T): T[] => {
  const filtered = exclude ? arr.filter(i => i !== exclude) : arr;
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateInfiniteQuestions = (count: number, difficulty: "beginner" | "advanced" | "all"): Question[] => {
  const questions: Question[] = [];
  let idCounter = 1;

  // Filter tissues that have required fields to avoid generation errors
  const validTissues = tissues.filter(t => t.imageUrl && t.practicalTips && t.practicalTips.length > 0);

  for (let i = 0; i < count; i++) {
    const targetTissue = getRandomItems(validTissues, 1)[0];
    const qType = Math.random();

    let question: Question;

    // Advanced Level: Visual Identification & Comparisons
    if (difficulty === "advanced" || (difficulty === "all" && qType > 0.5)) {
      if (Math.random() > 0.5 && targetTissue.confusionWarning) {
        // Confusion / Differentiation Question
        const distractors = getRandomItems(validTissues, 3, targetTissue).map(t => t.title);
        const options = [...distractors, targetTissue.title].sort(() => 0.5 - Math.random());
        
        question = {
          id: `gen_adv_${idCounter++}`,
          text: `You are looking at a microscopic slide. ${targetTissue.confusionWarning} Based on this distinction, which tissue are you most likely observing?`,
          options,
          correctAnswer: targetTissue.title,
          rationale: `The unique characteristic mentioned distinguishes it clearly. ${targetTissue.practicalTips[0]}`,
          focusHint: "Focus on the differentiating factors mentioned in the 'Common Confusion' notes.",
          difficulty: "advanced"
        };
      } else {
        // Pure Practical Image Identification
        const distractors = getRandomItems(validTissues, 3, targetTissue).map(t => t.title);
        const options = [...distractors, targetTissue.title].sort(() => 0.5 - Math.random());
        
        // Filter for micro images only as requested
        const microImages = (targetTissue.imageUrls || []).filter(url => url.toLowerCase().includes('micro'));
        const selectedImage = microImages.length > 0 
          ? microImages[Math.floor(Math.random() * microImages.length)]
          : targetTissue.imageUrl; // Fallback if no micro, but target is to use micro

        question = {
          id: `gen_img_${idCounter++}`,
          text: "Identify the exact tissue shown in this microscopic slide. Look closely at the cell shapes, matrix, and specific structures.",
          imageUrl: selectedImage,
          options,
          correctAnswer: targetTissue.title,
          rationale: `This is ${targetTissue.title}. Key identifier: ${targetTissue.practicalTips[0]}`,
          focusHint: `Train your eye to spot: ${targetTissue.practicalTips[0]}`,
          difficulty: "advanced"
        };
      }
    } 
    // Beginner Level: Features and Locations
    else {
      if (Math.random() > 0.5) {
        // Feature to Tissue
        const distractors = getRandomItems(validTissues, 3, targetTissue).map(t => t.title);
        const options = [...distractors, targetTissue.title].sort(() => 0.5 - Math.random());
        
        question = {
          id: `gen_beg_${idCounter++}`,
          text: `Under the microscope, you observe the following feature: "${targetTissue.practicalTips[0]}". What tissue is this?`,
          options,
          correctAnswer: targetTissue.title,
          rationale: `The feature "${targetTissue.practicalTips[0]}" is the hallmark of ${targetTissue.title}.`,
          focusHint: "Memorize the core defining feature of each tissue type.",
          difficulty: "beginner"
        };
      } else {
        // Tissue to Feature
        const correctFeature = targetTissue.practicalTips[0];
        const distractors = getRandomItems(validTissues, 3, targetTissue).map(t => t.practicalTips[0]);
        const options = [...distractors, correctFeature].sort(() => 0.5 - Math.random());
        
        question = {
          id: `gen_beg2_${idCounter++}`,
          text: `Which of the following is the defining microscopic characteristic of ${targetTissue.title}?`,
          options,
          correctAnswer: correctFeature,
          rationale: `${correctFeature} is what you must look for to identify ${targetTissue.title}.`,
          focusHint: "Associate the name of the tissue directly with its visual microscopic appearance.",
          difficulty: "beginner"
        };
      }
    }

    questions.push(question);
  }

  return questions;
};
