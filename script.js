const charReplacements = {
  ē: 'ee',
  ë: 'ee',
  ā: 'ei',
  ū: 'u',
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
    const res = await fetch(`dictionary/${file}`);
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

async function joinContractions(tokens) {
  const contractions = await fetch('dictionary/contractions.json').then((res) =>
    res.json()
  );

  const result = [];
  let i = 0;
  while (i < tokens.length) {
    let matched = false;
    for (let len = 5; len >= 3; len -= 2) {
      const slice = tokens.slice(i, i + len);
      const key = slice.map((t) => t.toLowerCase()).join(' ');
      if (contractions[key]) {
        result.push(contractions[key]);
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.push(tokens[i]);
      i++;
    }
  }
  return result;
}

async function transliterate() {
  if (Object.keys(wordReplacements).length === 0) {
    wordReplacements = await loadWordReplacements();
  }

  let text = document.getElementById('input').value;

  for (let char in charReplacements) {
    text = text.replaceAll(char, charReplacements[char]);
  }

  let parts =
    text.match(/[\p{L}\p{M}\p{N}]+|\s+|[^\s\p{L}\p{M}\p{N}]+/gu) || [];

  parts = await joinContractions(parts);

  parts = parts.map((part) => {
    const lowercase = part.toLowerCase();
    if (wordReplacements[lowercase]) {
      return preserveCase(part, wordReplacements[lowercase]);
    }
    return part;
  });

  document.getElementById('output').textContent = parts.join('');
}

transliterate();

window.transliterate = transliterate;
