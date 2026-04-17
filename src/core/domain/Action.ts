export interface Action<I, O> {
  execute(input: I): Promise<O>;
}
