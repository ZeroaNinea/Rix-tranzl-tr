function transliterate() {
  const charReplacements = {
    ē: 'ee',
    ā: 'ey',
    ū: 'yu',
    ō: 'ou',
    õ: 'ou',
    ố: 'ou',
    ī: 'eye',
    ł: 'oo',
    œ: 'oo',
    æ: 'oo',
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
    wæd: 'would',
    wœd: 'would',
    wrk: 'work',
  };

  let text = document.getElementById('input').value;

  for (let char in charReplacements) {
    text = text.replaceAll(char, charReplacements[char]);
  }

  let words = text.split(/\b/);
  words = words.map((w) => wordReplacements[w] || w);

  document.getElementById('output').textContent = words.join('');
}

window.transliterate = transliterate;
