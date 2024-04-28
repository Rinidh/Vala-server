// const dateStringRegex = new RegExp(
//   "^(?P<month>\b[A-Z][a-z]{2,10}\b)s+(?P<day>d{1,2}),s+(?P<year>d{4})$"
// ); //valid but fails to work, an error about "invalid regex" is seen

const dateStringRegex_onlyMonth =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/;

module.exports = { dateStringRegex_onlyMonth };
