declare module "@convex/_generated/dataModel" {
  export type Id<TableName extends string = string> = string & {
    readonly __tableName?: TableName;
  };

  export type Doc<TableName extends string = string> = Record<string, unknown> & {
    readonly _id: Id<TableName>;
  };
}
