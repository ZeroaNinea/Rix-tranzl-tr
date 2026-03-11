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
  aU: 'aw',
  aI: 'ī',
  eI: 'ā',
  '@U': 'ō',
  '&': 'a',
  ju: 'ū',
  jU: 'ū',
  U: 'œ',
  S: 'q',
  3: 'r',
  R: 'r',
  rr: 'r',
  0: 'o',
  O: 'o',
  j: 'y',
  dZ: 'j',
  tq: 'c',
  Z: 'q',
  N: 'ng',
  gg: 'g',
  u: 'ł',
  V: 'u',
  T: 'th',
  D: 'th',
  A: 'a',
  i: 'ē',
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
  '@': 'ə',
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
  if (vowel !== 'a') charsAtWordEnd[vowel + 'I'] = vowel + 'y';
});

consonants.forEach((consonant) => {
  charsAtWordEnd[consonant + 'I'] = consonant + 'ē';
});

createApp({
  data() {
    return {
      input: '',
      outputTokens: [],
      wordReplacements: {},
      activeWord: null,
      menuPhonetics: [],
      menuCases: [],
    };
  },

  async mounted() {
    this.wordReplacements = await loadWordReplacements();

    document.addEventListener('click', (e) => {
      const menu = document.getElementById('wordMenu');

      if (!menu) return;

      const clickedMenu = menu.contains(e.target);
      const clickedWord = e.target.closest('.word');

      if (!clickedMenu && !clickedWord) {
        this.closeMenu();
      }
    });
  },

  methods: {
    async convert() {
      if (!this.wordReplacements) return;

      this.outputTokens = await transliterate(
        this.input,
        this.wordReplacements,
      );
    },

    openOptions(token, event) {
      if (token.phonetics.length <= 1 && token.cases.length <= 1) return;

      this.activeWord = token;

      const phonetics = token.phonetics.map((p) => asciiToRixespek(p));
      const cases = [...token.cases];

      phonetics.map((phonetic) => {
        const capitalized = phonetic[0].toUpperCase() + phonetic.slice(1);
        const capsLk = phonetic.toUpperCase();

        if (cases.includes(capitalized) || cases.includes(capsLk)) return;

        cases.push(capitalized);
        cases.push(capsLk);
      });

      this.menuPhonetics = phonetics;
      this.menuCases = cases;

      const dropdown = document.getElementById('wordMenu');

      dropdown.style.display = 'block';
      dropdown.style.left = event.pageX + 'px';
      dropdown.style.top = event.pageY + 'px';
    },

    choosePhonetic(p) {
      this.activeWord.value = p;
      this.closeMenu();
    },

    chooseCase(c) {
      this.activeWord.value = c;
      this.closeMenu();
    },

    closeMenu() {
      const dropdown = document.getElementById('wordMenu');
      dropdown.style.display = 'none';

      this.activeWord = null;
      this.menuPhonetics = [];
      this.menuCases = [];
    },
  },
}).mount('#app');

async function loadWordReplacements() {
  const res = await fetch('dictionary/English-phonetic-transcription.json');
  const data = await res.json();
  return data;
}

async function transliterate(text, dictionary) {
  text = text.replace(/([A-Za-z])`([A-Za-z])/g, "$1'$2");

  const parts = text.match(/[A-Za-z]+(?:'[A-Za-z]+)*|\s+|[^A-Za-z\s]+/g) || [];

  return parts.map((part) => {
    if (part === "'" || part === '’') {
      return { type: 'text', value: part };
    }

    const lower = part.toLowerCase();

    if (dictionary[lower]) {
      const entry = dictionary[lower];

      let phonetic = entry.phonetics[0];
      phonetic = asciiToRixespek(phonetic);

      console.log(part, dictionary[lower]);

      return {
        type: 'word',
        original: part,
        value: preserveCase(part, phonetic),
        phonetics: entry.phonetics,
        cases: entry.cases,
      };
    }

    return {
      type: 'text',
      value: part,
    };
  });
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
    if (text === 'eI') {
      continue;
    }

    const regex = new RegExp(escapeRegex(key) + '$', 'i');
    text = text.replace(regex, charsAtWordEnd[key]);
  }

  for (const key in rixespekReplacements) {
    // if (text.endsWith('tu')) {
    //   continue;
    // }

    const regex = new RegExp(escapeRegex(key), 'g');
    text = text.replace(regex, rixespekReplacements[key]);
  }

  return text;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

window.transliterate = transliterate;
