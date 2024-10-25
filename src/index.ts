import {Buffer} from "buffer"
import {
    BytesLike,
    getBytes,
    Provider,
    Signer,
} from "ethers"
import {DecryptionSender, DecryptionSender__factory} from "./generated"

export const CONDITIONAL_ENCRYPTION_ADDRESS_TESTNET = "0x901C774780722bfd89805b1f6cD700CE49920A4d"

export class ConditionalEncryption {

    private readonly contract: DecryptionSender

    constructor(private readonly rpc: Signer | Provider) {
        this.contract = DecryptionSender__factory.connect(CONDITIONAL_ENCRYPTION_ADDRESS_TESTNET, rpc)
    }

    async encrypt(plaintext: Buffer) {
        const conditions = Buffer.from([])
        const tx = await this.contract.registerCiphertext(getBytes(plaintext), getBytes(conditions))
        return tx.wait(1)
    }

    async decrypt(ciphertext: BytesLike): Promise<Buffer> {
        return Promise.resolve(Buffer.from(getBytes(ciphertext)))
    }
}
