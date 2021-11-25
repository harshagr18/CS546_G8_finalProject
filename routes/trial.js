array = [
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
];

array[0].map((_, colIndex) => array.map((row) => row[colIndex]));

console.log(array);
