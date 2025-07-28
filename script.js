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

let wordReplacements = {};

async function transliterate() {
  if (Object.keys(wordReplacements).length === 0) {
    const res = await fetch('words.json');
    wordReplacements = await res.json();
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
