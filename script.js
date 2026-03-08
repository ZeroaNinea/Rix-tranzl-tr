// const charReplacements = {
//   ē: 'y',
//   ë: 'y',
//   ā: 'ei',
//   ū: 'u',
//   ō: 'ou',
//   õ: 'ou',
//   ố: 'ou',
//   ī: 'ai',
//   ł: 'oo',
//   œ: 'oo',
//   æ: 'oo',
// };

// const wordFiles = [
//   'verbs.json',
//   'nouns.json',
//   'basic-grammar.json',
//   'adjectives.json',
//   'abbreviations.json',
//   'names.json',
// ];
// let wordReplacements = {};

// async function loadWordReplacements() {
//   let combined = {};
//   for (const file of wordFiles) {
//     const res = await fetch(`dictionary/${file}`);
//     const data = await res.json();
//     Object.assign(combined, data);
//   }
//   return combined;
// }

// function preserveCase(original, replacement) {
//   if (original === original.toUpperCase()) {
//     return replacement.toUpperCase();
//   }
//   if (original[0] === original[0].toUpperCase()) {
//     return replacement[0].toUpperCase() + replacement.slice(1);
//   }
//   return replacement;
// }

// async function joinContractions(tokens) {
//   const contractions = await fetch('dictionary/contractions.json').then((res) =>
//     res.json()
//   );

//   const result = [];
//   let i = 0;
//   while (i < tokens.length) {
//     let matched = false;
//     for (let len = 5; len >= 3; len -= 2) {
//       const slice = tokens.slice(i, i + len);
//       const key = slice.map((t) => t.toLowerCase()).join(' ');
//       if (contractions[key]) {
//         result.push(contractions[key]);
//         i += len;
//         matched = true;
//         break;
//       }
//     }
//     if (!matched) {
//       result.push(tokens[i]);
//       i++;
//     }
//   }
//   return result;
// }

// async function transliterate() {
//   if (Object.keys(wordReplacements).length === 0) {
//     wordReplacements = await loadWordReplacements();
//   }

//   let text = document.getElementById('input').value;

//   let parts = text.match(/[\p{L}\p{M}\p{N}]+|\s+|[^\s\p{L}\p{M}\p{N}]+/gu);

//   pats = await joinContractions(parts);

//   parts = parts.map((part) => {
//     const lowercase = part.toLowerCase();
//     if (wordReplacements[lowercase]) {
//       return preserveCase(part, wordReplacements[lowercase]);
//     }
//     return part;
//   });

//   let transformed = parts.join('');

//   // for (let char in charReplacements) {
//   //   transformed = transformed.replaceAll(char, charReplacements[char]);
//   // }

//   document.getElementById('output').textContent = transformed;
// }

// transliterate();

// window.transliterate = transliterate;
const { createApp } = Vue;

const ipaReplacements = {
  '&': 'æ',
  '.': 'ˌ',
  U: 'ʊ',
  S: 'ʃ',
  R: 'r',
  O: 'ɔː',
  Z: 'ʒ',
  V: 'ʌ',
  N: 'ŋ',
  u: 'uː',
  T: 'θ',
  D: 'ð',
  i: 'iː',
  A: 'ɑː',
};

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

      phonetic = asciiToIPA(phonetic);

      console.log('lower phonetic', lower, phonetic);

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

function asciiToIPA(text) {
  // for (const key in ipaReplacements) {
  //   const regex = new RegExp(key, 'g');
  //   text = text.replace(regex, ipaReplacements[key]);
  // }

  // return text;

  return text
    .replace(/&/g, 'æ')
    .replace(/\./g, 'ˌ')
    .replace(/U/g, 'ʊ')
    .replace(/S/g, 'ʃ')
    .replace(/R/g, 'r')
    .replace(/O/g, 'ɔː')
    .replace(/Z/g, 'ʒ')
    .replace(/V/g, 'ʌ')
    .replace(/N/g, 'ŋ')
    .replace(/u/g, 'uː')
    .replace(/T/g, 'θ')
    .replace(/D/g, 'ð')
    .replace(/i/g, 'iː')
    .replace(/A/g, 'ɑː');
}

window.transliterate = transliterate;
