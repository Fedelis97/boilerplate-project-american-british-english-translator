const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');
const britishOnly = require('./british-only.js');

class Translator {
  
  americanToBritish(text) {
    let translatedText = text;
    let hasTranslation = false;
    
    // Translate American-only terms first (longest terms first)
    const americanOnlyEntries = Object.entries(americanOnly).sort((a, b) => b[0].length - a[0].length);
    for (let [american, british] of americanOnlyEntries) {
      const regex = new RegExp(`\\b${this.escapeRegex(american)}\\b`, 'gi');
      if (regex.test(translatedText) && !this.isInHighlight(translatedText, american)) {
        translatedText = translatedText.replace(regex, `<span class="highlight">${british}</span>`);
        hasTranslation = true;
      }
    }
    
    // Translate American to British spelling
    for (let [american, british] of Object.entries(americanToBritishSpelling)) {
      const regex = new RegExp(`\\b${this.escapeRegex(american)}\\b`, 'gi');
      if (regex.test(translatedText) && !this.isInHighlight(translatedText, american)) {
        translatedText = translatedText.replace(regex, `<span class="highlight">${british}</span>`);
        hasTranslation = true;
      }
    }
    
    // Translate American titles to British (longest first)
    const americanTitleEntries = Object.entries(americanToBritishTitles).sort((a, b) => b[0].length - a[0].length);
    for (let [american, british] of americanTitleEntries) {
      const regex = new RegExp(`\\b${this.escapeRegex(american)}`, 'gi');
      if (regex.test(translatedText) && !this.isInHighlight(translatedText, american)) {
        translatedText = translatedText.replace(regex, (match) => {
          // Preserve original case
          const isCapitalized = match[0] === match[0].toUpperCase();
          let result = isCapitalized ? british.charAt(0).toUpperCase() + british.slice(1) : british;
          return `<span class="highlight">${result}</span>`;
        });
        hasTranslation = true;
      }
    }
    
    // Handle time format: American (10:30) to British (10.30)
    const americanTimeRegex = /\b(\d{1,2}):(\d{2})\b/g;
    if (americanTimeRegex.test(translatedText)) {
      translatedText = translatedText.replace(americanTimeRegex, '<span class="highlight">$1.$2</span>');
      hasTranslation = true;
    }
    
    return hasTranslation ? translatedText : null;
  }
  
  britishToAmerican(text) {
    let translatedText = text;
    let hasTranslation = false;
    
    // Create reverse mappings
    const britishToAmericanSpelling = this.reverseObject(americanToBritishSpelling);
    const britishToAmericanTitles = this.reverseObject(americanToBritishTitles);
    
    // Translate British-only terms first (longest terms first)
    const britishOnlyEntries = Object.entries(britishOnly).sort((a, b) => b[0].length - a[0].length);
    for (let [british, american] of britishOnlyEntries) {
      const regex = new RegExp(`\\b${this.escapeRegex(british)}\\b`, 'gi');
      if (regex.test(translatedText) && !this.isInHighlight(translatedText, british)) {
        translatedText = translatedText.replace(regex, `<span class="highlight">${american}</span>`);
        hasTranslation = true;
      }
    }
    
    // Translate British to American spelling
    for (let [british, american] of Object.entries(britishToAmericanSpelling)) {
      const regex = new RegExp(`\\b${this.escapeRegex(british)}\\b`, 'gi');
      if (regex.test(translatedText) && !this.isInHighlight(translatedText, british)) {
        translatedText = translatedText.replace(regex, `<span class="highlight">${american}</span>`);
        hasTranslation = true;
      }
    }
    
    // Translate British titles to American (longest first)
    const britishTitleEntries = Object.entries(britishToAmericanTitles).sort((a, b) => b[0].length - a[0].length);
    for (let [british, american] of britishTitleEntries) {
      const regex = new RegExp(`\\b${this.escapeRegex(british)}`, 'gi');
      if (regex.test(translatedText) && !this.isInHighlight(translatedText, british)) {
        translatedText = translatedText.replace(regex, (match) => {
          // Preserve original case
          const isCapitalized = match[0] === match[0].toUpperCase();
          let result = isCapitalized ? american.charAt(0).toUpperCase() + american.slice(1) : american;
          return `<span class="highlight">${result}</span>`;
        });
        hasTranslation = true;
      }
    }
    
    // Handle time format: British (10.30) to American (10:30)
    const britishTimeRegex = /\b(\d{1,2})\.(\d{2})\b/g;
    if (britishTimeRegex.test(translatedText)) {
      translatedText = translatedText.replace(britishTimeRegex, '<span class="highlight">$1:$2</span>');
      hasTranslation = true;
    }
    
    return hasTranslation ? translatedText : null;
  }
  
  translate(text, locale) {
    if (locale === 'american-to-british') {
      return this.americanToBritish(text);
    } else if (locale === 'british-to-american') {
      return this.britishToAmerican(text);
    }
    return null;
  }
  
  reverseObject(obj) {
    const reversed = {};
    for (let [key, value] of Object.entries(obj)) {
      reversed[value] = key;
    }
    return reversed;
  }
  
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  isInHighlight(text, term) {
    const regex = new RegExp(`<span class="highlight">[^<]*${this.escapeRegex(term)}[^<]*</span>`, 'gi');
    return regex.test(text);
  }
}

module.exports = Translator;