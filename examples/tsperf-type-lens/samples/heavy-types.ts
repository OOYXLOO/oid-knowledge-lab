type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type DeepReadonly<T> =
  T extends Primitive
    ? T
    : T extends (...args: infer Args) => infer Result
      ? (...args: Args) => DeepReadonly<Result>
      : T extends readonly [infer Head, ...infer Tail]
        ? readonly [DeepReadonly<Head>, ...DeepReadonly<Tail>]
        : T extends readonly (infer Item)[]
          ? readonly DeepReadonly<Item>[]
          : {
              readonly [Key in keyof T as Key extends string ? `readonly_${Key}` : Key]:
                DeepReadonly<T[Key]>;
            };

export type RouteRecord<TName extends string, TValue> = {
  id: `${TName}:${string}`;
  name: TName;
  value: TValue;
  evidence: DeepReadonly<{
    source: "devpost" | "algora" | "github";
    amountUsd: number;
    humanGates: Array<"captcha" | "oauth" | "api-key" | "payout">;
  }>;
};

export interface PrizeRouteIndex<T extends readonly RouteRecord<string, unknown>[]> {
  routes: T;
  byName: {
    [Item in T[number] as Item["name"]]: Extract<T[number], { name: Item["name"] }>;
  };
  highValue: T[number] extends infer Item
    ? Item extends RouteRecord<string, infer Value>
      ? Value extends { amountUsd: infer Amount }
        ? Amount extends number
          ? Item
          : never
        : Item
      : never
    : never;
}

export type UnionToIntersection<T> =
  (T extends unknown ? (value: T) => void : never) extends (value: infer Result) => void
    ? Result
    : never;

export type NestedTuple<T, Depth extends number, Acc extends readonly unknown[] = []> =
  Acc["length"] extends Depth ? T : NestedTuple<[T, Acc["length"]], Depth, [...Acc, unknown]>;

export class RouteStore<T extends readonly RouteRecord<string, unknown>[]> {
  constructor(readonly index: PrizeRouteIndex<T>) {}
  get<Name extends T[number]["name"]>(name: Name): PrizeRouteIndex<T>["byName"][Name] {
    return this.index.byName[name];
  }
}
