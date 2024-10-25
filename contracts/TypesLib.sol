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
}
