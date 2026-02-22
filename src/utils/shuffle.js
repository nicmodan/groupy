/** Fisher-Yates cryptographic shuffle */
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle students and assign group numbers */
export function assignGroups(students, groupSize) {
  const shuffled = shuffleArray(students);
  return shuffled.map((s, i) => ({
    ...s,
    groupNumber: Math.floor(i / groupSize) + 1,
  }));
}

/** Group students by their groupNumber */
export function groupByNumber(students) {
  return students.reduce((acc, s) => {
    const g = s.groupNumber || 0;
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {});
}
