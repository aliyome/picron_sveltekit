import Puzzle from "../Puzzle";

/**
 * Draw a puzzle in ASCII art
 */
let draw = ({ rowHints, columnHints, rows }: Puzzle) => {
  let result = "";
  let maxLength = (a: string[]) =>
    a.map((x) => x.length).reduce((max, i) => (i > max ? i : max), 0);

  let joinedRowHints = rowHints.map((x) => x.join(" "));
  let maxRowHintLength = maxLength(joinedRowHints);

  let _colHints = columnHints.map((x) => x.join(" "));
  let maxColHintLength = maxLength(_colHints);
  const colHints = _colHints.map((x) => x.padStart(maxColHintLength).split(""));

  for (let i = 0; i < maxColHintLength; i++) {
    let n = colHints.map((x) => x.shift()).join("");
    result += "".padStart(maxRowHintLength);
    result += " " + n;
    result += "\n";
  }
  result += "\n";

  rows.forEach((content, i) => {
    let art = content
      .map((x) => {
        if (x === -1) {
          return "x";
        }
        return ["░", "█"][x];
      })
      .join("");
    result += `${joinedRowHints[i].padStart(maxRowHintLength)} ${art}`;
    result += "\n";
  });

  return result;
};

export default draw;
