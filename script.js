const { createApp } = Vue;

const rixespekReplacements = {
  // IPA
  // 0: 'ɒ',
  // '@': 'ə',
  // '&': 'æ',
  // '.': 'ˌ',
  // U: 'ʊ',
  // S: 'ʃ',
  // R: 'r',
  // O: 'ɔː',
  // Z: 'd͡ʒ',
  // V: 'ʌ',
  // N: 'ŋ',
  // u: 'uː',
  // T: 'θ',
  // D: 'ð',
  // aI: 'iː',
  // A: 'ɑː',
  // i: 'iː',
  // eI: 'iː',
  // I: 'iː',
  // 3: '3ː',
  // Rexēspēk
  aI: 'ī',
  '@U': 'ō',
  '&': 'a',
  U: 'œ',
  S: 'q',
  3: 'r',
  R: 'r',
  rr: 'r',
  0: 'o',
  O: 'o',
  ju: 'ū',
  j: 'y',
  dZ: 'j',
  tq: 'c',
  Z: 'q',
  N: 'ng',
  u: 'ł',
  V: 'u',
  T: 'th',
  D: 'th',
  A: 'a',
  i: 'ē',
  eI: 'ā',
  I: 'i',
  '@': '',
  "'": '',
  ˌ: '',
  '.': '',
  ks: 'x',
  ə: 'u',
};

charsAtWordStart = {
  '@': 'ə',
};

charsAtWordEnd = {
  '@U': 'ō',
  // U: 'w',
  aI: 'ī',
  eI: 'ā',
  // I: 'ē',
};

vowels = ['a', 'e', 'i', 'o', 'u', '@', 'I', 'U', 'V'];
consonants = [
  'b',
  'c',
  'd',
  'f',
  'g',
  'h',
  'j',
  'k',
  'l',
  'm',
  'n',
  'p',
  'q',
  'r',
  's',
  't',
  'v',
  'w',
  'x',
  'y',
  'Z',
  'z',
  'S',
  'T',
  'D',
];

vowels.forEach((vowel) => {
  if (vowel !== '@') charsAtWordEnd[vowel + 'U'] = vowel + 'w';
  charsAtWordEnd[vowel + 'I'] = vowel + 'y';
});

consonants.forEach((consonant) => {
  charsAtWordEnd[consonant + 'I'] = consonant + 'ē';
});

createApp({
  data() {
    return {
      input: '',
      output: '',
      wordReplacements: {},
    };
  },

  async mounted() {
    this.wordReplacements = await loadWordReplacements();
  },

  methods: {
    async convert() {
      this.output = await transliterate(this.input, this.wordReplacements);
    },
  },
}).mount('#app');

async function loadWordReplacements() {
  const res = await fetch('dictionary/English-phonetic-transcription.json');
  const data = await res.json();
  return data;
}

async function transliterate(text, dictionary) {
  const parts =
    text.match(/[\p{L}\p{M}\p{N}]+|\s+|[^\s\p{L}\p{M}\p{N}]+/gu) || [];

  const result = parts.map((part) => {
    const lower = part.toLowerCase();

    if (dictionary[lower]) {
      let phonetic = dictionary[lower];

      phonetic = asciiToRixespek(phonetic);

      console.log(dictionary[lower], phonetic);

      return preserveCase(part, phonetic);
    }

    return part;
  });

  return result.join('');
}

function preserveCase(original, replacement) {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function asciiToRixespek(text) {
  for (const key in charsAtWordStart) {
    const regex = new RegExp('^' + escapeRegex(key), 'i');
    text = text.replace(regex, charsAtWordStart[key]);
  }

  for (const key in charsAtWordEnd) {
    if (text.endsWith('tu') || text.length <= 2) {
      continue;
    }

    const regex = new RegExp(escapeRegex(key) + '$', 'i');
    text = text.replace(regex, charsAtWordEnd[key]);
  }

  for (const key in rixespekReplacements) {
    if (text.endsWith('tu')) {
      continue;
    }

    const regex = new RegExp(escapeRegex(key), 'g');
    text = text.replace(regex, rixespekReplacements[key]);
  }

  return text;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

window.transliterate = transliterate;
