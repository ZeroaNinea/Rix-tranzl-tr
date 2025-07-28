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

async function transliterate() {
  if (Object.keys(wordReplacements).length === 0) {
    wordReplacements = await loadWordReplacements();
  }

  let text = document.getElementById('input').value;

  let words =
    text.match(/[\p{L}\p{M}\p{N}']+|\s+|[^\s\p{L}\p{M}\p{N}']+/gu) || [];
  words = words.map((w) => wordReplacements[w] || w);
  text = words.join('');

  for (let char in charReplacements) {
    text = text.replaceAll(char, charReplacements[char]);
  }

  document.getElementById('output').textContent = text;
}

transliterate();

window.transliterate = transliterate;
