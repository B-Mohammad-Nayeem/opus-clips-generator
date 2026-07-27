import { WordCaption } from '../types';

/**
 * Common STT (Speech-to-Text) misspellings, phonetic errors, and contraction typos dictionary map.
 */
const COMMON_SPELLING_DICTIONARY: Record<string, string> = {
  // Common typos & misspellings
  teh: 'the',
  taht: 'that',
  waht: 'what',
  wiht: 'with',
  recieve: 'receive',
  seperate: 'separate',
  definately: 'definitely',
  definitly: 'definitely',
  occurred: 'occurred',
  ocured: 'occurred',
  untill: 'until',
  tomorow: 'tomorrow',
  torrow: 'tomorrow',
  truely: 'truly',
  goverment: 'government',
  enviroment: 'environment',
  accross: 'across',
  alot: 'a lot',
  becuase: 'because',
  becasue: 'because',
  beautifull: 'beautiful',
  succesful: 'successful',

  // Common STT contractions & slang fixes
  im: "I'm",
  dont: "don't",
  cant: "can't",
  wont: "won't",
  isnt: "isn't",
  arent: "aren't",
  wasnt: "wasn't",
  werent: "weren't",
  hasnt: "hasn't",
  havent: "haven't",
  hadnt: "hadn't",
  couldnt: "couldn't",
  wouldnt: "wouldn't",
  shouldnt: "shouldn't",
  youre: "you're",
  theyre: "they're",
  weve: "we've",
  youve: "you've",
  theyve: "they've",
  whats: "what's",
  thats: "that's",
  theres: "there's",
  heres: "here's",
  lets: "let's",
  gonna: 'going to',
  wanna: 'want to',
  gotta: 'got to',
  kinda: 'kind of',
  sorta: 'sort of',
  i: 'I',
};

export interface AutoCorrectResult<T extends { word: string }> {
  correctedWords: T[];
  correctionsCount: number;
  correctedText: string;
  changesLog: Array<{ original: string; corrected: string; index: number }>;
}

/**
 * Compares transcript words with common dictionary patterns and STT speech-recognition errors,
 * auto-correcting spelling and punctuation while retaining precise timestamp mappings.
 */
export function autoCorrectTranscriptWords<T extends { word: string }>(
  words: T[]
): AutoCorrectResult<T> {
  if (!words || words.length === 0) {
    return {
      correctedWords: [],
      correctionsCount: 0,
      correctedText: '',
      changesLog: [],
    };
  }

  let correctionsCount = 0;
  const changesLog: Array<{ original: string; corrected: string; index: number }> = [];

  const correctedWords = words.map((item, idx) => {
    const origWord = item.word;
    if (!origWord || origWord.trim() === '') return item;

    // Strip surrounding punctuation for matching
    const match = origWord.match(/^([^\w]*)([\w'-]+)([^\w]*)$/);
    if (!match) return item;

    const prefix = match[1] || '';
    const cleanWord = match[2];
    const suffix = match[3] || '';

    const lowerClean = cleanWord.toLowerCase();

    let replacementClean: string | null = null;

    if (COMMON_SPELLING_DICTIONARY[lowerClean]) {
      replacementClean = COMMON_SPELLING_DICTIONARY[lowerClean];
      // Preserve original casing if title-cased
      if (cleanWord[0] === cleanWord[0].toUpperCase() && cleanWord[0] !== cleanWord[0].toLowerCase()) {
        replacementClean = replacementClean[0].toUpperCase() + replacementClean.slice(1);
      }
    } else if (lowerClean === 'i') {
      replacementClean = 'I';
    }

    if (replacementClean && replacementClean !== cleanWord) {
      correctionsCount++;
      const finalWord = `${prefix}${replacementClean}${suffix}`;
      changesLog.push({
        original: origWord,
        corrected: finalWord,
        index: idx,
      });

      return {
        ...item,
        word: finalWord,
      };
    }

    return item;
  });

  const correctedText = correctedWords.map((w) => w.word).join(' ');

  return {
    correctedWords,
    correctionsCount,
    correctedText,
    changesLog,
  };
}

/**
 * Auto-corrects raw text string transcript.
 */
export function autoCorrectRawTranscriptText(text: string): { correctedText: string; correctionsCount: number } {
  if (!text) return { correctedText: '', correctionsCount: 0 };

  const words = text.split(/\s+/).map((w, idx) => ({
    word: w,
    start: idx * 0.5,
    end: (idx + 1) * 0.5,
  }));
  const result = autoCorrectTranscriptWords(words);
  return {
    correctedText: result.correctedText,
    correctionsCount: result.correctionsCount,
  };
}
