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

  private createMatchEvent(match: Match<T>): BoardEvent<T> {
    return {
      kind: "Match",
      match,
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

    this.print();

    const horizontalMatches = this.getMatchesHorizontally();

    for (const match of horizontalMatches) {
      const matchEvent = this.createMatchEvent(match);
      console.log({ positions: matchEvent.match.positions });
      this.emitEvent(matchEvent);
    }
  }

  private getMatchesHorizontally() {
    let matches: Match<T>[] = [];
    let matchesCount = 1;

    for (let y = 0; y < this.#height; y++) {
      let piece = this.#board[y][0];

      matchesCount = 1;

      // from 1 because the first position is stored in piece
      for (let x = 1; x < this.#width; x++) {
        if (this.#board[y][x] == piece) {
          matchesCount = matchesCount + 1;
        } else {
          piece = this.#board[y][x];
          matchesCount = 1;
        }

        if (matchesCount >= 3) {
          let positions: Position[] = [];

          for (let x2 = x - matchesCount + 1; x2 <= x; x2++) {
            positions.push({ col: x2, row: y });
          }

          matches.push({
            matched: piece,
            positions,
          });
        }
      }
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
