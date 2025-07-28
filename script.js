function transliterate() {
  const charReplacements = {
    ē: 'ee',
    ā: 'ey',
    ū: 'yu',
    ō: 'oh',
    ī: 'eye',
    ł: 'oo',
    œ: 'oo',
    q: 'sh',
    c: 'ch',
  };

  const wordReplacements = {
    bē: 'be',
    mā: 'may',
    thu: 'the',
    kawnslz: 'councils',
    wrkrz: 'workers',
    prsn: 'person',
    pawr: 'power',
  };

  let text = document.getElementById('input').value;

  for (let char in charReplacements) {
    text = text.replaceAll(char, charReplacements[char]);
  }

  let words = text.split(/\b/);
  words = words.map((w) => wordReplacements[w] || w);

  document.getElementById('output').textContent = words.join('');
}
