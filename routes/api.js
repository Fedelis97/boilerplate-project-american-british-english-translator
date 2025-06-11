'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  
  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {

   const { text, locale } = req.body;
       // missing fields
      if (text === undefined || locale === undefined) {
        return res.json({ error: 'Required field(s) missing' });
      }
      
      // empty text
      if (text === '') {
        return res.json({ error: 'No text to translate' });
      }
      
      // Validate locale
      if (locale !== 'american-to-british' && locale !== 'british-to-american') {
        return res.json({ error: 'Invalid value for locale field' });
      }
      
      const translation = translator.translate(text, locale);
      
      // If no translation needed
      if (!translation) {
        return res.json({
          text: text,
          translation: "Everything looks good to me!"
        });
      }
      
      res.json({
        text: text,
        translation: translation
      });
    });
};
