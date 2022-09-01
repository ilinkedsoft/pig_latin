const VOWELS = ['a', 'e', 'i', 'o', 'u'];

const CONSONANT_SUFFIX = 'ay';
const NO_MODIFICATION_SUFFIX = 'way';
const VOWEL_SUFFIX = 'way';

const DELIMITER_PATTERN = /([-.,:;?!\s]+\s*)/g;

function isVowel(letter) {
  return VOWELS.includes(letter.toLowerCase());
}

function isLetterUpperCase(letter) {
  return !"'`_".includes(letter) && letter === letter.toUpperCase();
}

function getPunctuation(word) {
  const punctuations = word.match(/[^`'_a-zA-Z0-9]/g); // get non-alphanumeric characters from the word

  if (punctuations === null) {
    return null;
  }

  if (punctuations.length > 1) {
    throw Error(`Word ${word} contains more than one punctuations (${punctuations.join(', ')})`);
  }

  return punctuations[0];
}

// get relative index of punctuation from the end of the word
function getPunctuationIndexFromTheEndOfWord(word, punctuation) {
  const punctuationIndexFromTheBeginning = word.indexOf(punctuation);

  return punctuation !== null && punctuationIndexFromTheBeginning !== -1
    ? word.length - punctuationIndexFromTheBeginning - 1
    : -1;
}

// remove punctuation from the word
function getWordWithoutPunctuation(word, punctuationIndexFromTheEnd) {
  if (punctuationIndexFromTheEnd === -1) {
    return word;
  }

  const indexFromTheBeginning = word.length - punctuationIndexFromTheEnd - 1;

  return word.substring(0, indexFromTheBeginning)
    + word.substring(indexFromTheBeginning + 1, word.length);
}

function addPunctuationIntoWord(word, punctuation, punctuationIndexFromTheEnd) {
  if (punctuation === null || punctuationIndexFromTheEnd === -1) {
    return word;
  }

  const indexFromTheBeginning = word.length - punctuationIndexFromTheEnd;

  return word.substr(0, indexFromTheBeginning)
    + punctuation + word.substr(indexFromTheBeginning);
}

// add suffix to the word based on the first letter of the word
function handleFirstLetter(word) {
  let i;
  for (i = 0; i < word.length; i += 1) {
    if (isVowel(word[i])) break;
  }

  return i === 0
    ? word + VOWEL_SUFFIX
    : word.substring(i) + word.substring(0, i).toLowerCase() + CONSONANT_SUFFIX;
}

// ensure capitalization in transformed word on the same places as it was in original word
function handleCapitalization(origWord, transformedWord) {
  const origWordArr = origWord.split('');
  const transformedWordArr = transformedWord.split('');

  const reducer = (acc, currTransformedWordLetter, currIndex) => {
    const currOrigWordLetter = origWordArr[currIndex];

    return currOrigWordLetter && isLetterUpperCase(currOrigWordLetter)
      ? acc + currTransformedWordLetter.toUpperCase()
      : acc + currTransformedWordLetter.toLowerCase();
  };

  return transformedWordArr.reduce(reducer, '');
}

function splitStringIntoWordsAndDelimiters(str) {
  const result = {
    words: [],
    delimiters: [],
  };

  str.split(DELIMITER_PATTERN).forEach((token) => {
    if (DELIMITER_PATTERN.test(token)) {
      result.delimiters.push(token);
    } else {
      result.words.push(token);
    }
  });

  return result;
}

function getNumOfTranslationIterations(words) {
  const numOfWords = words.length;

  return words[numOfWords - 1] === '' // input ends with delimiter (the last word is empty string)
    ? numOfWords - 1
    : numOfWords;
}

function translateWordIntoPigLatin(origWord) {
  if (origWord.endsWith(NO_MODIFICATION_SUFFIX)) {
    return origWord;
  }

  const punctuation = getPunctuation(origWord);
  const origWordPunctuationIndex = getPunctuationIndexFromTheEndOfWord(origWord, punctuation);
  const wordWithoutPunctuation = getWordWithoutPunctuation(origWord, origWordPunctuationIndex);

  const handledFirstLetter = handleFirstLetter(wordWithoutPunctuation);
  const handledCapitalization = handleCapitalization(wordWithoutPunctuation, handledFirstLetter);

  return addPunctuationIntoWord(handledCapitalization, punctuation, origWordPunctuationIndex);
}

// translate input string into pig-latin
function translate(inputString) {
  if (inputString === '') {
    throw Error('Input must be non-empty string');
  }

  const { words, delimiters } = splitStringIntoWordsAndDelimiters(inputString);

  const numOfIterations = getNumOfTranslationIterations(words);
  let result = '';

  for (let i = 0; i < numOfIterations; i += 1) {
    result += translateWordIntoPigLatin(words[i]);
    if (delimiters[i]) {
      result += delimiters[i];
    }
  }

  return result;
}

module.exports = {
  translate,
};
