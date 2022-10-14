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

export class Board<T> {
  #generator: Generator<T>;
  #height: number;
  #width: number;
  #board: T[][];

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

  addListener(listener: BoardListener<T>) {}

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

  move(first: Position, second: Position) {}

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
}
