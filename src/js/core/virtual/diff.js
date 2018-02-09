let diff = function (array1, array2) {
    let moves = [];

    if (array1.length != 0 && array2.length != 0) { // if array1 or array2 is empty, that means in this dom tree was empty or going to set empty
        let matrix = [];
        let length = generateMatrix(array1, array2, matrix);

        let subArray = [];
        for (let i = 0; i <= array1.length; i++) {
            subArray.push(i);
        }
        for (let i = 1; i <= array2.length; i++) {
            matrix[i - 1].unshift(i);
        }
        matrix.unshift(subArray);
        findMoves(array1, array2, moves, matrix, length);
    } else {
        let method, source, index;
        if (array1.length == 0) { // if old tree was empty that means it needs to copy elements from new tree
            method = "add";
            source = array2;
        } else { // else new tree was empty and it needs to delete all element from old tree
            method = "delete";
            source = array1;
        }
        source.forEach(key => {
            index = source.length - source.indexOf(key) - 1;
            if (method == "add") {
                index = source.indexOf(key);
            }
            moves.push({
                method,
                index,
                target: key
            })
        });
    }

    return moves;
};

let generateMatrix = function (cols, rows, matrix, rinx, cinx) {
    if (rinx == undefined && cinx == undefined) {
        rinx = cinx = 0;
    }
    let row = matrix[cinx];
    if (row == undefined) {
        row = matrix[cinx] = [];
    } else {
        row = matrix[cinx];
    }

    let rowVal = rows[cinx];
    let colVal = cols[rinx];
    let prevRow = matrix[cinx - 1];

    let prevVal = row !== undefined && row.length > 0 ? row[rinx - 1] : cinx + rinx + 1;
    let topVal = prevRow !== undefined ? prevRow[rinx] : rinx + 1;
    let upVal = prevRow !== undefined ? (function () {
        return prevRow[rinx - 1] == undefined ? cinx : prevRow[rinx - 1];
    })() : rinx;

    if (rowVal == colVal) {
        row.push(upVal);
    } else {
        row.push(Math.min(topVal, prevVal, upVal) + 1);
    }

    if (rinx == cols.length - 1) {
        rinx = 0;
        cinx += 1;

        if (cinx == rows.length) {
            return row[cols.length - 1];
        }
    } else {
        rinx += 1;
    }

    return generateMatrix(cols, rows, matrix, rinx, cinx);
};

let findMoves = function (cols, rows, moves, matrix, length) {
    let coordinate = {
        row: rows.length,
        col: cols.length
    };

    while (moves.length < length) {
        let preVal, upVal, topVal, rowVal, colVal, minVal;

        if (coordinate.col == 0) {
            rowVal = rows[coordinate.row - 1];
            moves.push({
                method: "add",
                index: cols.indexOf(colVal),
                target: rowVal
            });
            coordinate.row -= 1;
            continue;
        } else if (coordinate.row == 0) {
            colVal = cols[coordinate.col - 1];
            moves.push({
                method: "delete",
                index: cols.indexOf(colVal),
                target: colVal
            });
            coordinate.col -= 1;
            continue;
        }

        preVal = matrix[coordinate.row][coordinate.col - 1];
        upVal = matrix[coordinate.row - 1][coordinate.col - 1];
        topVal = matrix[coordinate.row - 1][coordinate.col];
        rowVal = rows[coordinate.row - 1];
        colVal = cols[coordinate.col - 1];

        if (rowVal == colVal) {
            coordinate.row -= 1;
            coordinate.col -= 1;
        } else {
            minVal = Math.min(preVal, upVal, topVal);
            if (minVal == topVal) {
                moves.push({
                    method: "add",
                    index: cols.indexOf(colVal),
                    target: rowVal
                });
                coordinate.row -= 1;
            } else if (minVal == upVal) {
                moves.push({
                    method: "replace",
                    index: cols.indexOf(colVal),
                    target: rowVal
                });
                coordinate.row -= 1;
                coordinate.col -= 1;
            } else if (minVal == preVal) {
                moves.push({
                    method: "delete",
                    index: cols.indexOf(colVal),
                    target: colVal
                });
                coordinate.col -= 1;
            }
        }
    }
};

export default diff;