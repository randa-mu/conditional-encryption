// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library TypesLib {
     // Decryption request stores details for each decryption request
    struct DecryptionRequest {
        bytes Ciphertext;
        bytes conditions;
        bytes decryptedText;
        bytes messageToSign;
        bytes signature;
        address callback;
    }

    // Blocklock request stores details needed to generate blocklock decryption keys
    struct BlocklockRequest {
        uint256 signatureRequestID;
        uint256 blockHeight;
        bytes ciphertext;
        bytes signature;
        address callback;
    }
}
