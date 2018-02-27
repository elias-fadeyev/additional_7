module.exports = function solveSudoku(matrix) {
  // your solution
let possibleValue = new Map();
let zerosCount = 0;

matrix.forEach((coordRow, i) => {
  let missingElem = [];
  for (let num = 1; num <= 9; num++) {
    if (coordRow.indexOf(num) === -1) missingElem.push(num);
  }
   coordRow.forEach((element, j) => {
     if (element === 0) possibleValue.set([i, j], missingElem);
   });
});

for (let j = 0; j < 9; j++) {
  let missingElem = [];
  outer:
  for (let num = 1; num <= 9; num++) {
    for (let i = 0; i < 9; i++) {
      if (matrix[i][j] === num) continue outer;
    }
    missingElem.push(num);
  }
  for (let coord of possibleValue.keys()) {
    if (coord[1] === j) {
      let modArr = possibleValue.get(coord).filter((element => (missingElem.indexOf(element) !== -1))); 
      possibleValue.set(coord, modArr);         
    }
  }
}

for (let m = 0; m < 3; m++) {
  for (let n = 0; n < 3; n++) {
    let missingElem = [];
    outer:
    for (let num = 1; num <= 9; num++) {
      for (let i = 3 * m; i < 3 * (m + 1); i++) {
        for (let j = 3 * n; j < 3 * (n + 1); j++) {
          if (num === matrix[i][j]) continue outer;
        }          
      }
    missingElem.push(num);
    }
    for (let coord of possibleValue.keys()) {
      if (coord[0] >= 3 * m && coord[0] < 3 * (m + 1) && coord[1] >= 3 * n && coord[1] < 3 * (n + 1)) {
        let modArr = possibleValue.get(coord).filter((element => (missingElem.indexOf(element) !== -1))); 
        possibleValue.set(coord, modArr);           
      }
    }
  }
}

function catchSingle() {
  for (let entry of possibleValue) {
    if (entry[1].length === 1) {
      changed = true;
      const coordRow = entry[0][0];
      const coordCol = entry[0][1];
      const rowSegm = coordRow - coordRow % 3;
      const colSegm = coordCol - coordCol % 3;
      let value = entry[1][0];
      matrix[coordRow][coordCol] = +value;

      for (let coord of possibleValue.keys()) {
        if (coord[0] === coordRow || coord[1] === coordCol) {
          let newVal = possibleValue.get(coord).join('').replace(value,'').split('');
          possibleValue.set(coord, newVal);
        }
        else if ((coord[0] >= rowSegm) && (coord[0] < rowSegm + 3) && (coord[1] >= colSegm) && (coord[1] < colSegm + 3)) {
          let newVal = possibleValue.get(coord).join('').replace(value,'').split('');
          possibleValue.set(coord, newVal);
        } 
      }
    }
    else if (entry[1].length === 0) possibleValue.delete(entry[0]); 
  }
}

function orderSolving() {
  for (let i = 0; i < 9; i++) {
    let rowElem = [];
    let colElem = [];
    for (let coord of possibleValue.keys()) {
      if (coord[0] === i) rowElem.push(coord);
      if (coord[1] === i) colElem.push(coord);
    }
    catchSingleFromExisting(rowElem);
    catchSingleFromExisting(colElem);
    samePair(rowElem);
    samePair(colElem);
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let segmElem = [];
      for (let coord of possibleValue.keys()) {
        if (coord[0] < 3 * (i + 1) && coord[0] >= 3 * i && coord[1] < 3 * (j + 1) && coord[1] >= 3 * j) {
          segmElem.push(coord);
        }
      }
      catchSingleFromExisting(segmElem);
      samePair(segmElem);
    }
  }
}

function catchSingleFromExisting(order) {
  for (let num = 1; num <= 9; num++) {
    let countVal = 0;
    let currentElement;
    let currentVal;
    order.forEach(element => {
      currentVal = possibleValue.get(element);
      if (currentVal.indexOf(num) !== -1 || currentVal.indexOf(num + '') !== -1) {
        countVal++;
        currentElement = element;
      }
    });
    if (countVal === 1) {
      possibleValue.set(currentElement, [num]);
      changed = true;
    }
  }
}



function samePair(order) {
  order.forEach(element => {
    let value = possibleValue.get(element).join('');
    let currentElement = element;
    sameElem = [currentElement];
    order.forEach(othElement => {
      if (othElement !== currentElement && value === possibleValue.get(othElement).join('')) {
        sameElem.push(othElement);
      }
    });
    if (sameElem.length > 1 && sameElem.length === value.length) {
      order.forEach(elem => {
        let newVal = possibleValue.get(elem).join('').replace(value,'').split('');
        if (newVal.join('') !== possibleValue.get(elem).join('') && newVal.join('') !== '') {
          changed = true;
        }
        possibleValue.set(elem, newVal);
      });
      sameElem.forEach(elem => {
        possibleValue.set(elem, value.split(''));
      });
    }
  });
}

function insertPossible() {
  let minPossibleVariety;
  let possibleCoord;
  let matrixClone = [];
  let possibleValueClone = new Map();
  possibleValue.forEach((value, key, map) => {
    if (!minPossibleVariety || minPossibleVariety.length > value.length) {
      minPossibleVariety = value;
      possibleCoord = key;
    }
  });
  matrix.forEach(row => {
    matrixClone.push(row.slice());
  });
  possibleValue.forEach((value, key, map) => {
    possibleValueClone.set(key, value.slice());
  });

  for (let i = 0; i < minPossibleVariety.length; i++) {
    possibleValue.set(possibleCoord, [minPossibleVariety[i]]);

    do {
    changed = false;
    catchSingle();
    orderSolving();
    } while (changed);

    zerosCount = 0;
    matrix.forEach(row => {
      row.forEach(element => {
        if (element === 0) zerosCount++;
      });
    });

    if (zerosCount !== 0 && zerosCount === possibleValue.size) {
      insertPossible();
    }

    if (zerosCount === 0) return;
    else {
      matrix = [];
      possibleValue = new Map();
      matrixClone.forEach(row => {
        matrix.push(row.slice());
      });
      possibleValueClone.forEach((value, key, map) => {
        possibleValue.set(key, value.slice());
      });    
    }
  }
}

let changed;
do {
  changed = false;
  catchSingle();
  orderSolving();
} while (changed);

if (possibleValue.size !== 0) insertPossible();

return matrix;
}