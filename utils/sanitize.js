
const sanitizeHtml = require('sanitize-html');


function sanitizeCaption(caption) {
  return sanitizeHtml(caption, {
    allowedTags: [],
    allowedAttributes: {}
  });
}

module.exports = sanitizeCaption;