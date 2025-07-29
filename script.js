const charReplacements = {
  ē: 'ee',
  ë: 'ee',
  ā: 'ei',
  ū: 'yu',
  ō: 'ou',
  õ: 'ou',
  ố: 'ou',
  ī: 'ai',
  ł: 'oo',
  œ: 'oo',
  æ: 'oo',
};

const wordFiles = [
  'verbs.json',
  'nouns.json',
  'basic-grammar.json',
  'adjectives.json',
];
let wordReplacements = {};

async function loadWordReplacements() {
  let combined = {};
  for (const file of wordFiles) {
    const res = await fetch(file);
    const data = await res.json();
    Object.assign(combined, data);
  }
  return combined;
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

async function transliterate() {
  if (Object.keys(wordReplacements).length === 0) {
    wordReplacements = await loadWordReplacements();
  }

  let text = document.getElementById('input').value.replaceAll("'", '`');

  let parts = text.match(/[\p{L}\p{M}\p{N}']+|\s+|[^\s\p{L}\p{M}\p{N}]+/gu);

  parts = parts.map((part) => {
    const lowercase = part.toLowerCase();
    if (wordReplacements[lowercase]) {
      return preserveCase(part, wordReplacements[lowercase]);
    }
    return part;
  });

  let transformed = parts.join('');
  console.log(transformed);

  for (let char in charReplacements) {
    transformed = transformed.replaceAll(char, charReplacements[char]);
    console.log(transformed);
  }

  document.getElementById('output').textContent = transformed;
}

transliterate();

window.transliterate = transliterate;
