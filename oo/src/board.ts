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
  match?: Match<T>;
};

export type BoardListener<T> = (args: BoardEvent<T>) => void;

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

  private createRefillEvent(): BoardEvent<T> {
    return {
      kind: "Refill",
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
    if (!this.canMove(first, second)) {
      return;
    }

    if (!this.isLegalMove(first, second)) return;

    this.swap(first, second);
    this.print();

    this.checkMatchesRecursive();
  }

  private checkMatchesRecursive(hasMatches = true) {
    if (!hasMatches) {
      return;
    }

    for (const match of this.getMatches()) {
      const matchEvent = this.createMatchEvent(match);
      const refillEvent = this.createRefillEvent();

      this.emitEvent(matchEvent);
      this.emitEvent(refillEvent);

      this.deleteMatch(match);
    }

    this.movePiecesDown();
    this.replaceEmptyPieces();

    const newMatches = this.getMatches();
    this.checkMatchesRecursive(newMatches.length > 0);
  }

  private replaceEmptyPieces() {
    for (let y = this.#height - 1; y >= 0; y--) {
      for (let x = 0; x < this.#width; x++) {
        const piece = this.#board[y][x];

        if (piece == null) {
          this.#board[y][x] = this.#generator.next();
        }
      }
    }
  }

  private movePiecesDown() {
    for (let x = 0; x < this.#width; x++) {
      let spanY = 0;

      let y = this.#height - 1;

      while (y >= 0) {
        let piece = this.#board[y][x];

        if (spanY > 0) {
          if (piece != null) {
            this.#board[spanY][x] = piece;
            this.#board[y][x] = null;

            y = spanY;

            spanY = 0;
          }
        } else if (piece == null) {
          if (spanY == 0) {
            spanY = y;
          }
        }

        y = y - 1;
      }
    }
  }

  private getMatches() {
    const horizontalMatches = this.getMatchesHorizontally();
    const verticalMatches = this.getMatchesVertically();
    return [...horizontalMatches, ...verticalMatches];
  }

  private deleteMatch(match: Match<T>) {
    for (const position of match.positions) {
      this.setPiece(position, null);
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
          matchesCount++;
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
            positions: positions,
          });
        }
      }
    }

    return matches;
  }

  private getMatchesVertically() {
    let matches: Match<T>[] = [];
    let matchesCount = 1;

    for (let x = 0; x < this.#width; x++) {
      let piece = this.#board[0][x];

      matchesCount = 1;

      // from 1 because the first position is stored in piece
      for (let y = 1; y < this.#height; y++) {
        if (this.#board[y][x] == piece) {
          matchesCount++;
        } else {
          piece = this.#board[y][x];
          matchesCount = 1;
        }

        if (matchesCount >= 3) {
          let positions: Position[] = [];

          for (let y2 = y - matchesCount + 1; y2 <= y; y2++) {
            positions.push({ col: x, row: y2 });
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
    this.#board = this.createDimensionalArray(this.#width, this.#height, () =>
      this.#generator.next()
    );

    this.printDimensionalArray(this.#board);
  }

  print() {
    this.printDimensionalArray(this.#board);
  }

  private createDimensionalArray<T>(
    width: number,
    height: number,
    getValue: () => T
  ) {
    return [...Array(height)].map(() => {
      return [...Array(width)].map(() => getValue());
    });
  }

  private printDimensionalArray<T>(arr: T[][]) {
    console.table(arr);
  }

  /**
   * Checks if the intended move is a legal one. A move is legal if the two
   * tiles are in the same row or the same column and the swap result in a
   * match.
   *
   * @param selectedPosition - The selected position of the tile
   * @param dropPosition - The drop position of the tile
   *
   * @returns Either the move is legal or not
   */
  private isLegalMove(selectedPosition: Position, dropPosition): boolean {
    this.swap(selectedPosition, dropPosition);

    // Check if the swap caused matches
    const hasMatches = !!this.getMatches().length;

    // Restore positions to initial state
    this.swap(dropPosition, selectedPosition);

    return hasMatches;
  }
}
