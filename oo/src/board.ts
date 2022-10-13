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
    return true;
  }

  move(first: Position, second: Position) {}

  private initializeBoard() {
    this.#board = Utils.createDimensionalArray(this.#width, this.#height, () =>
      this.#generator.next()
    );

    Utils.printDimensionalArray(this.#board);
  }
}
