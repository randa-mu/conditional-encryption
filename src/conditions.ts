import {BytesLike, isHexString, ParamType} from "ethers"

export type ConditionExpression = Condition | CompoundCondition
export type CompoundCondition = And | Or
export type And = { type: "and", left: ConditionExpression, right: ConditionExpression }
export type Or = { type: "or", left: ConditionExpression, right: ConditionExpression }
export type Condition = TimeCondition | ContractFieldCondition

export type TimeCondition = {
    type: "time",
    chainHeight: bigint,
    chainID: bigint
}

export type ContractFieldCondition = {
    type: "contract_param",
    address: string,
    field: string | ParamType
    operator: Operator
    value: BytesLike
}

export type Operator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte"

export function encodeConditions(conditions: ConditionExpression): string {
    return JSON.stringify(conditions, (key, value) => {
            if (key === "address" && !isHexString(value)) {
                throw Error("you must pass addresses as hex values")
            }

            if (key === "field" && value instanceof ParamType) {
                return value.format("json")
            }

            return typeof value === "bigint" ? value.toString() : value
        }
    )
}