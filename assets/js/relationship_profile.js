(function (root, factory) {
  const profile = factory();
  if (typeof module === 'object' && module.exports) module.exports = profile;
  if (root) root.RelationshipProfile = profile;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  function calculate(config, answers) {
    if (answers.length !== config.questionCount || !answers.length) {
      throw new Error('Incomplete profile answers');
    }
    const totals = Object.fromEntries(config.axisOrder.map(axis => [axis, 0]));
    for (const answer of answers) {
      if (!answer.scores || Object.keys(answer.scores).length !== 2) {
        throw new Error('Invalid profile answer');
      }
      for (const [axis, value] of Object.entries(answer.scores)) {
        if (!Object.prototype.hasOwnProperty.call(totals, axis) ||
            !Number.isFinite(value)) throw new Error('Invalid profile score');
        totals[axis] += value;
      }
    }
    if (Object.values(totals).some(value => value === 0)) {
      throw new Error('Unresolved profile');
    }
    const code = config.axisOrder.map(axis => totals[axis] > 0 ? '1' : '0').join('');
    const slug = config.resultMap[code];
    if (!slug) throw new Error('Unknown profile');
    return { code, totals, slug };
  }

  return { calculate };
});
