import {BaseContract, BytesLike, getBytes, LogDescription, Provider, Signer, TransactionReceipt} from "ethers"
import {ConditionExpression, EmptyCondition, encodeConditions} from "./conditions"
import {DecryptionSender, DecryptionSender__factory} from "./generated"

/**
 * BEWARE: this is a skeleton and doesn't actually encrypt anything yet :)
 * If you call encrypt and upload private data to a public network somewhere...
 * then you're a silly sausage 🌭
 */
export const CONDITIONAL_ENCRYPTION_ADDRESS_TESTNET = "0x901C774780722bfd89805b1f6cD700CE49920A4d"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function encrypt(plaintext: Uint8Array, _conditions: Uint8Array): Uint8Array {
    return plaintext
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function decrypt(ciphertext: Uint8Array, _signature: Uint8Array): Uint8Array {
    return ciphertext
}

type DecryptionResponse = {
    requestID: bigint,
    plaintext: BytesLike,
    signature: BytesLike,
}

export class ConditionalEncryption {
    private readonly contract: DecryptionSender

    constructor(rpc: Signer | Provider) {
        this.contract = DecryptionSender__factory.connect(CONDITIONAL_ENCRYPTION_ADDRESS_TESTNET, rpc)
    }

    /**
     * encryptAndRequestDecryption is a convenience method for encrypting and registering for encryption
     * @param plaintext a byte buffer containing whatever you wish to encrypt. It should be encoded for on-chain use if being used in a smart contract.
     * @param conditions a set of condition expressions or an empty expression representing when the ciphertext should be decryptable
     */
    async encryptAndRequestDecryption(plaintext: Uint8Array, conditions: ConditionExpression = EmptyCondition): Promise<bigint> {
        const encodedConditions = encodeConditions(conditions)
        const ciphertext = encrypt(plaintext, encodedConditions)
        return this.requestDecryption(ciphertext, encodedConditions)
    }

    /**
     * requestDecryption takes a ciphertext and its corresponding conditions, and registers it for decryption
     * @param ciphertext a ciphertext that's been encrypted using the `encrypt` function of this library
     * @param conditions conditions that have been encoded using the `encodeConditions` functions of this library
     */
    async requestDecryption(ciphertext: Uint8Array, conditions: Uint8Array): Promise<bigint> {
        const tx = await this.contract.registerCiphertext(getBytes(ciphertext), getBytes(conditions))
        const receipt = await tx.wait(1)
        if (!receipt) {
            throw Error("no receipt because confirmations were 0")
        }

        // we parse the `requestID` from the tx receipt, because the tx doesn't get it for some godforsaken reason
        const logs = parseLogs(receipt, this.contract, "CipherTextRegistered")
        if (logs.length === 0) {
            throw Error("`registerCiphertext` didn't emit the expected log")
        }
        const [requestID] = logs[0].args
        return requestID
    }

    /**
     * waitForDecryption listens for a ciphertext to be decrypted on-chain when conditions have been met
     * @param requestID the ID corresponding to the ciphertext in the signature contract
     * @param blockLookback how many blocks in the past to query in case the ciphertext has already been decrypted
     * @param timeoutMs how long to wait for decryption before erroring. 0 waits forever.
     */
    async waitForDecryption(requestID: bigint, blockLookback = 3, timeoutMs = 30_000): Promise<DecryptionResponse> {
        return new Promise((resolve, reject) => {
            // then we have to both check the past and listen to the future for emitted events
            // lest we miss our fulfilled ciphertext. We set the listeners first... in case
            // by some magic our request is fulfilled _between_ the lines
            const resolveWithRequestState = () =>
                this.contract.getRequest(requestID).then(([, , decryptedText, , signature]) =>
                    resolve({requestID, plaintext: decryptedText, signature})
                )
            const successFilter = this.contract.filters.DecryptionReceiverCallbackFailed(requestID)
            const failureFilter = this.contract.filters.DecryptionReceiverCallbackSuccess(requestID)
            this.contract.once(successFilter, (rID) => {
                console.log(`received requestID ${rID}`)
                resolveWithRequestState()
            })
            this.contract.once(failureFilter, (rID) => {
                console.log(`received requestID ${rID}`)
                resolveWithRequestState()
            })

            this.contract.queryFilter(this.contract.filters.DecryptionReceiverCallbackSuccess(requestID), -blockLookback).then(() =>
                resolveWithRequestState()
            )

            if (timeoutMs > 0) {
                setTimeout(() => {
                    this.contract.off(successFilter)
                    this.contract.off(failureFilter)
                    reject(new Error("timed out requesting randomness"))
                }, timeoutMs)
            }
        })
    }
}

function parseLogs(receipt: TransactionReceipt, contract: BaseContract, eventName: string): Array<LogDescription> {
    return receipt.logs
        .map(log => {
            try {
                return contract.interface.parseLog(log)
            } catch {
                return null
            }
        })
        .filter(log => log !== null)
        .filter(log => log?.name === eventName)
}
