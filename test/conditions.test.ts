import {describe, expect, it} from "@jest/globals"
import {AbiCoder} from "ethers"
import {ConditionExpression, encodeConditions} from "../src/conditions"

describe("conditions", () => {
    it("should serialise to JSON as strings", () => {
        const conditions: ConditionExpression = {
            type: "and",
            left: {
                type: "time",
                chainHeight: 1n,
                chainID: 1337n
            },
            right: {
                type: "contract_param",
                address: "0x43d9c5f314D241fBD7f4bEfd351Bcb28811e6F07",
                field: "count(uint256)",
                operator: "gte",
                value: AbiCoder.defaultAbiCoder().encode(["uint256"], [1n])
            }
        }
        expect(() => encodeConditions(conditions)).not.toThrow()
    })
})