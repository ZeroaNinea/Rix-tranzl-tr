const charReplacements = {
  ē: 'ee',
  ë: 'ee',
  ā: 'ey',
  ū: 'yu',
  ō: 'ou',
  õ: 'ou',
  ố: 'ou',
  ī: 'ay',
  ł: 'oo',
  œ: 'oo',
  æ: 'oo',
  q: 'sh',
  c: 'ch',
};

const wordFiles = ['verbs.json', 'nouns.json', 'basic-grammar.json'];
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

  for (let char in charReplacements) {
    text = text.replaceAll(char, charReplacements[char]);
  }

  let words = text.split(/\b/);
  words = words.map((w) => wordReplacements[w] || w);

  document.getElementById('output').textContent = words.join('');
}

window.transliterate = transliterate;
