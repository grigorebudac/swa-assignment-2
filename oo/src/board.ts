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
  generator: Generator<T>;
  height: number;
  width: number;

  constructor(generator: Generator<T>, height: number, width: number) {
    this.generator = generator;
    this.height = height;
    this.width = width;
  }

  addListener(listener: BoardListener<T>) {}

  piece(p: Position): T | undefined {
    return undefined;
  }

  canMove(first: Position, second: Position): boolean {
    return true;
  }

  move(first: Position, second: Position) {}
}
