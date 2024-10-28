import {DecryptionSender, DecryptionSender__factory} from "./generated"
import {BytesLike, getBytes, Provider, Signer} from "ethers"
import {Buffer} from "buffer"
import {ConditionExpression, encodeConditions} from "./conditions"

/**
 * BEWARE: this is a skeleton and doesn't actually encrypt anything yet :)
 * If you call encrypt and upload private data to a public network somewhere...
 * then you're a silly sausage 🌭
 */
export const CONDITIONAL_ENCRYPTION_ADDRESS_TESTNET = "0x901C774780722bfd89805b1f6cD700CE49920A4d"
export class ConditionalEncryption {

    private readonly contract: DecryptionSender

    constructor(rpc: Signer | Provider) {
        this.contract = DecryptionSender__factory.connect(CONDITIONAL_ENCRYPTION_ADDRESS_TESTNET, rpc)
    }

    async encrypt(plaintext: Buffer, conditions: ConditionExpression) {
        const conditionBytes = encodeConditions(conditions)
        const tx = await this.contract.registerCiphertext(getBytes(plaintext), getBytes(conditionBytes))
        return tx.wait(1)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async decrypt(ciphertext: BytesLike, _signature: BytesLike): Promise<Buffer> {
        return Promise.resolve(Buffer.from(getBytes(ciphertext)))
    }
}
