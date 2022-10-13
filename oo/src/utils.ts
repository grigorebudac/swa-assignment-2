class Utils {
  public static createDimensionalArray<T>(
    width: number,
    height: number,
    getValue: () => T
  ) {
    return [...Array(height)].map(() => {
      return [...Array(width)].map(() => getValue());
    });
  }

  public static isBetween(value: number, min: number, max: number) {
    return value >= min && value <= max;
  }

  public static printDimensionalArray<T>(arr: T[][]) {
    console.table(arr);
  }
}

export default Utils;
