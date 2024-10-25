// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {TypesLib} from "./TypesLib.sol";

/// @notice Smart contract that stores and conditionally decrypts encrypted messages / data
interface IDecryptionSender {
    /// Setters

    /// @notice Registers a Ciphertext and associated conditions for decryption
    /// @notice creation of the `Ciphertext` and `conditions` bytes will be managed by a javascript client library off-chain
    /// @dev The creation of `Ciphertext` and `conditions` bytes will be managed by the JavaScript client library
    /// @param ciphertext The encrypted data to be registered
    /// @param conditions The conditions that need to be met to decrypt the ciphertext
    /// @return requestID The unique ID assigned to the registered decryption request
    function registerCiphertext(bytes calldata ciphertext, bytes calldata conditions)
    external
    returns (uint256 requestID);

    /**
     * @notice Decrypts the given Ciphertext for the specified request ID.
     * @dev This function is intended to be called after a decryption operation has been completed off-chain.
     *      The function accepts the request ID associated with the original encryption request and the
     *      decrypted text in bytes format.
     * @param requestID The unique identifier for the encryption request. This should match the ID used
     *                  when the encryption was initially requested.
     * @param decryptedText The decrypted content in bytes format. The data should represent the original
     *                      message in its decrypted form.
     */
    function sendDecryptedCiphertext(uint256 requestID, bytes calldata decryptedText) external;

    // Getters

    /**
     * @notice Retrieves a specific request by its ID.
     * @dev This function returns the Request struct associated with the given requestId.
     * @param requestId The ID of the request to retrieve.
     * @return The Request struct corresponding to the given requestId.
     */
    function getRequest(uint256 requestId) external view returns (TypesLib.DecryptionRequest memory);

    /**
     * @notice Retrieves all requests.
     * @dev This function returns an array of all Request structs stored in the contract.
     * @return An array containing all the Request structs.
     */
    function getAllRequests() external view returns (TypesLib.DecryptionRequest[] memory);
    /**
     * @notice Generates a message from the given request.
     * @dev Creates a hash-based message using the `conditions` of the `Request` struct.
     * The resulting message is the hash of the encoded values, packed into a byte array.
     * @param r The `Request` struct containing the data for generating the message.
     * @return A byte array representing the hashed and encoded message.
     */
    function messageFrom(TypesLib.DecryptionRequest memory r) external pure returns (bytes memory);
}
