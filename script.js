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

const charsAtWordStart = {
  '@': 'ə',
};

const charsAtWordEnd = {
  '@': 'ə',
  '@U': 'ō',
  // U: 'w',
  aI: 'ī',
  eI: 'ā',
  // I: 'ē',
};

const vowels = ['a', 'e', 'i', 'o', 'u', '@', 'I', 'U', 'V'];
const consonants = [
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

const alphabet = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];

vowels.forEach((vowel) => {
  if (vowel !== '@') charsAtWordEnd[vowel + 'U'] = vowel + 'w';
  if (vowel !== 'a' && vowel !== 'e') charsAtWordEnd[vowel + 'I'] = vowel + 'y';
});

consonants.forEach((consonant) => {
  charsAtWordEnd[consonant + 'I'] = consonant + 'ē';
});

createApp({
  data() {
    return {
      input: '',
      outputTokens: [],
      enToRix: {},
      rixToEn: {},
      toRixespek: true,
      activeWord: null,
      menuPhonetics: [],
      menuCases: [],
    };
  },

  async mounted() {
    this.enToRix = await fetch('dictionary/English-to-Rixespek.json').then(
      (r) => r.json(),
    );
    this.rixToEn = await fetch('dictionary/Rixespek-to-English.json').then(
      (r) => r.json(),
    );

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
      if (!this.enToRix || !this.rixToEn) return;

      let tokens;

      if (this.toRixespek) {
        tokens = await transliterate(this.input, this.enToRix);
        tokens = normalizePunctuation(tokens);
        tokens = applyRixespekPunctuation(tokens);
      } else {
        tokens = await reverseTransliterate(this.input, this.rixToEn);
        tokens = normalizePunctuation(tokens);
        tokens = applyEnglishPunctuation(tokens);
        tokens = capitalizeSentence(tokens);
        // console.log(tokens);
      }

      this.outputTokens = tokens;
    },

    openOptions(token, event) {
      if (token.type !== 'word') return;
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

    openErrorOptions(token, event) {
      this.activeWord = token;

      this.menuPhonetics = [];
      this.menuCases = [];

      token.suggestions.forEach((s) => {
        this.menuCases.push(...s.cases);
        this.menuPhonetics.push(...s.phonetics);
      });

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

function normalizePunctuation(tokens) {
  const result = [];

  for (const token of tokens) {
    if (token.type === 'text' && token.value.length > 1) {
      for (const char of token.value) {
        result.push({ type: 'text', value: char });
      }
    } else {
      result.push(token);
    }
  }

  return result;
}

async function transliterate(text, dictionary) {
  text = text.replace(/([A-Za-z])`([A-Za-z])/g, "$1'$2");

  const parts = text.match(/[A-Za-z]+(?:'[A-Za-z]+)*|\s+|[^A-Za-z\s]+/g) || [];

  console.log(parts);

  return parts.map((part) => {
    if (part === "'" || part === '’') {
      return { type: 'text', value: part };
    }

    const lower = part.toLowerCase();

    if (dictionary[lower]) {
      const entry = dictionary[lower];

      let defaultOption =
        alphabet.includes(part.toLowerCase()) &&
        part.toLowerCase() !== 'a' &&
        part.toLowerCase() !== 'i'
          ? part
          : entry.phonetics[0];
      defaultOption = asciiToRixespek(defaultOption);

      console.log(part, dictionary[lower]);

      return {
        type: 'word',
        original: part,
        value: preserveCase(part, defaultOption),
        phonetics: entry.phonetics,
        cases: entry.cases,
      };
    } else if (/^[A-Za-z]+$/.test(part)) {
      const suggestions = getSuggestions(lower, dictionary);

      return {
        type: 'unknown',
        original: part,
        value: part,
        suggestions,
        phonetics: [],
        cases: [],
      };
    }

    return {
      type: 'text',
      value: part,
    };
  });
}

async function reverseTransliterate(text, dictionary) {
  const parts =
    text.match(/[\p{L}\p{M}\p{N}]+|\s+|[^\s\p{L}\p{M}\p{N}]+/gu) || [];

  return parts.map((part) => {
    const key = part.toLowerCase();

    if (dictionary[key]) {
      const entry = dictionary[key];

      const best = entry.words[0];

      return {
        type: 'word',
        original: part,
        value: preserveCase(part, best.value),
        cases: entry.words.map((w) => w.value),
        phonetics: entry.phonetics,
      };
    }

    if (/^[\p{L}]+$/u.test(part)) {
      const suggestions = getSuggestions(key, dictionary);

      return {
        type: 'unknown',
        value: part,
        suggestions: suggestions,
        phonetics: [],
        cases: [],
      };
    }

    return { type: 'text', value: part };
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
    // if (text === 'eI') {
    //   continue;
    // }

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

function splitSentences(tokens) {
  const sentences = [];
  let current = [];

  for (const token of tokens) {
    current.push(token);

    if (token.type === 'text' && /[.!?]/.test(token.value)) {
      sentences.push(current);
      current = [];
    }
  }

  if (current.length) sentences.push(current);

  return sentences;
}

function splitSentencesRix(tokens) {
  const sentences = [];
  let current = [];

  for (const token of tokens) {
    // Start of a new sentence if we see "!" or "?"
    if (token.type === 'text' && (token.value === '!' || token.value === '?')) {
      if (current.length) {
        sentences.push(current);
        current = [];
      }
    }

    current.push(token);

    // End of sentence ONLY on "."
    if (token.type === 'text' && token.value === '.') {
      sentences.push(current);
      current = [];
    }
  }

  if (current.length) sentences.push(current);

  return sentences;
}

function applyRixespekPunctuation(tokens) {
  const sentences = splitSentences(tokens);
  const isSingleSentence = sentences.length === 1;

  const result = [];

  console.log('sentences', sentences);

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    let mark = null;

    // Detect "!" or "?".
    for (const token of sentence) {
      if (
        token.type === 'text' &&
        (token.value === '!' || token.value === '?')
      ) {
        mark = token.value;
        break;
      }
    }

    const prev = sentences[i - 1];
    const prevHadStrongMark = prev?.some(
      (t) => t.type === 'text' && (t.value === '!' || t.value === '?'),
    );

    // Clean sentence.
    let cleaned = sentence.filter((t) => {
      if (t.type !== 'text') return true;

      // remove ALL sentence-ending punctuation.
      if (t.value === '.' || t.value === '!' || t.value === '?') return false;

      if (isSingleSentence && t.value === ',') {
        return false;
      }

      return true;
    });

    // detect if original sentence ended with "."
    const hadDot = sentence.some((t) => t.type === 'text' && t.value === '.');

    // Add punctuation at start.
    if (mark) {
      result.push({ type: 'text', value: mark });

      if (hadDot) {
        result.push({ type: 'text', value: '.' });
      }
    } else if (prevHadStrongMark) {
      if (hadDot) {
        result.push({ type: 'text', value: '.' });
      }
    }

    result.push(...cleaned);
  }

  return result;
}

function applyEnglishPunctuation(tokens) {
  const sentences = splitSentencesRix(tokens);
  const result = [];

  console.log('sentences', sentences);

  for (const sentence of sentences) {
    let mark = null;

    // Step 1: remove leading dot (if exists).
    if (
      sentence.length &&
      sentence[0].type === 'text' &&
      sentence[0].value === '.'
    ) {
      sentence.shift();
    }

    // Step 2: check for "!" or "?" at start.
    if (
      sentence.length &&
      sentence[0].type === 'text' &&
      (sentence[0].value === '!' || sentence[0].value === '?')
    ) {
      mark = sentence.shift().value;
    }

    result.push(...sentence);

    // Step 3: restore punctuation.
    if (mark) {
      result.push({ type: 'text', value: mark });
    } else {
      const last = sentence[sentence.length - 1];

      if (!last || !(last.type === 'text' && /[.!?]/.test(last.value))) {
        result.push({ type: 'text', value: '.' });
      }
    }
  }

  return result;
}

function capitalizeSentence(tokens) {
  console.log(tokens);
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'word') {
      tokens[i].value =
        tokens[i].value[0].toUpperCase() + tokens[i].value.slice(1);
      break;
    }
  }

  return tokens;
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
}

function getSuggestions(word, dictionary) {
  const results = [];

  for (const key in dictionary) {
    const dist = levenshtein(word, key);

    if (dist <= 2) {
      results.push({ word: key, dist });
    }
  }

  return results
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5)
    .map((r) => {
      const entry = dictionary[r.word];

      console.log('entry', entry);

      const cases = entry?.cases || entry?.words || [];
      const phonetics = (entry.phonetics || []).map((p) => asciiToRixespek(p));

      console.log('cases', cases[0].value);

      if (Array.isArray(cases) && cases.every((c) => typeof c === 'object')) {
        cases.map((c, i) => {
          if (!(cases[i].value === c.value.toUpperCase()))
            cases.push({
              value: c.value.toUpperCase(),
              frequency: cases[i].frequency,
            });
          if (!(cases[i].value === c.value[0].toUpperCase() + c.value.slice(1)))
            cases.push({
              value: c.value[0].toUpperCase() + c.value.slice(1),
              frequency: cases[i].frequency,
            });
        });

        phonetics.map((p, i) => {
          console.log('p', p);
          if (!(cases[i].value === p.toUpperCase()))
            cases.push({ value: p.toUpperCase(), frequency: 0 });
          if (!(cases[i].value === p[0].toUpperCase() + p.slice(1)))
            cases.push({
              value: p[0].toUpperCase() + p.slice(1),
              frequency: 0,
            });
        });

        return {
          word: r.word,
          cases: cases.map((c) => c.value) || [],
          phonetics: phonetics || [],
        };
      }

      cases.map((c) => {
        if (!entry.cases.includes(c.toUpperCase()))
          entry.cases.push(c.toUpperCase());
        if (!entry.cases.includes(c[0].toUpperCase() + c.slice(1)))
          entry.cases.push(c[0].toUpperCase() + c.slice(1));
      });

      phonetics.map((p) => {
        if (!entry.cases.includes(p.toUpperCase()))
          entry.cases.push(p.toUpperCase());
        if (!entry.cases.includes(p[0].toUpperCase() + p.slice(1)))
          entry.cases.push(p[0].toUpperCase() + p.slice(1));
      });

      return {
        word: r.word,
        cases: cases || [],
        phonetics: phonetics || [],
      };
    });
}
