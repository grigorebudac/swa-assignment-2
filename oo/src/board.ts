import Utils from "./utils";

export type Generator<T> = { next: () => T };

export type Position = {
  row: number;
  col: number;
};

export type Match<T> = {
  matched: T;
  positions: Position[];
};

export type BoardEvent<T> = {
  kind: string;
  match: Match<T>;
};

export type BoardListener<T> = (args: BoardEvent<T>) => void;

const dx = [-1, 1, 0, 0, -1, -1, 1, 1];
const dy = [0, 0, -1, 1, -1, 1, -1, 1];

export class Board<T> {
  #generator: Generator<T>;
  #height: number;
  #width: number;
  #board: T[][];
  #listener: BoardListener<T>;

  constructor(generator: Generator<T>, width: number, height: number) {
    this.#generator = generator;
    this.#height = height;
    this.#width = width;
    this.#board = [];

    this.initializeBoard();
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  addListener(listener: BoardListener<T>) {
    this.#listener = listener;
  }

  private emitEvent(event: BoardEvent<T>) {
    if (this.#listener == null) {
      return;
    }

    this.#listener(event);
  }

  private createMatchEvent(matched: T, positions: Position[]) {
    return {
      kind: "Match",
      match: {
        matched,
        positions,
      },
    };
  }

  piece(p: Position): T | undefined {
    return this.#board?.[p.row]?.[p.col];
  }

  canMove(first: Position, second: Position): boolean {
    const sameRow = first.row === second.row;
    const sameColumn = first.col === second.col;

    if (
      !this.isValidRowIndex(first.row) ||
      !this.isValidColumnIndex(first.col) ||
      !this.isValidRowIndex(second.row) ||
      !this.isValidColumnIndex(second.col)
    ) {
      return false;
    }

    return (sameRow && !sameColumn) || (!sameRow && sameColumn);
  }

  move(first: Position, second: Position) {
    this.swap(first, second);
  }

  test(first: Position) {
    const matched = this.piece(first);
    const firstPositions = this.search(first);

    this.emitEvent(this.createMatchEvent(matched, firstPositions));
  }

  foo() {
    let mat = this.#board;
    var m = this.#height,
      n = this.#width;
    let positions: Position[] = [];
    if (mat == null || m == 0 || n == 0) return 0;
    var count = 0;
    var visited = []; //as memo
    for (let i = 0; i < m; i++) {
      visited[i] = new Array(n);
    }
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (mat[i][j] == "A") {
          count++;
          positions.push({
            row: i,
            col: j,
          });
          this.dfs(mat, i, j, visited);
        }
      }
    }

    console.log({ positions });
    return count;
  }

  dfs(mat, i, j, visited) {
    const value = "A";
    const placeholder = "VISITED";

    var m = this.#height,
      n = this.#width;

    if (i < 0 || j < 0 || i > m - 1 || j > n - 1 || visited[i][j]) return;
    if (mat[i][j] != "A") return;
    mat[i][j] = "NOT A";
    visited[i][j] = true;
    this.dfs(mat, i - 1, j, visited); //left
    this.dfs(mat, i + 1, j, visited); //right
    this.dfs(mat, i, j - 1, visited); //upper
    this.dfs(mat, i, j + 1, visited); //lower
  }

  search(pos: Position, matches: Position[] = []) {
    const value = this.piece(pos);

    const leftPosition: Position = {
      row: pos.row,
      col: pos.col - 1,
    };

    const left = this.piece(leftPosition);

    console.log({ left });

    if (left === value) {
      matches.push(leftPosition);
    }

    matches.push(pos);

    const rightPosition: Position = {
      row: pos.row,
      col: pos.col + 1,
    };

    const right = this.piece(rightPosition);

    console.log({ right });
    if (right === value) {
      matches.push(rightPosition);
    }

    return matches;
  }

  private swap(first: Position, second: Position) {
    if (!this.canMove(first, second)) {
      return;
    }

    const temp = this.piece(first);
    this.setPiece(first, this.piece(second));
    this.setPiece(second, temp);
  }

  private setPiece(pos: Position, value: T) {
    this.#board[pos.row][pos.col] = value;
  }

  private isValidRowIndex(index: number) {
    return index >= 0 && index < this.#height;
  }

  private isValidColumnIndex(index: number) {
    return index >= 0 && index < this.#width;
  }

  private initializeBoard() {
    this.#board = Utils.createDimensionalArray(this.#width, this.#height, () =>
      this.#generator.next()
    );

    Utils.printDimensionalArray(this.#board);
  }

  print() {
    Utils.printDimensionalArray(this.#board);
  }
}
