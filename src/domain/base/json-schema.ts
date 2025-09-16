import { JSONSchema7 } from "json-schema";

export type JSONSchema = JSONSchema7 & {
  dependentRequired?: Record<string, string[]>;
};

export type RequiredJSONSchema = JSONSchema &
  Required<Pick<JSONSchema, "type" | "properties" | "required">>;
export type RequiredArrayJSONSchema = JSONSchema &
  Required<Pick<JSONSchema, "type" | "items">>;
