// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IDecryptionReceiver} from "./IDecryptionReceiver.sol";

abstract contract AbstractDecryptionReceiver {
    address public immutable DECRYPTION_PROVIDER = 0x4633bbdb16153B325bbcef4Baa770d718Eb552b8;

    error NotAuthorizedDecryptionProvider();

    modifier onlyDecryptionProvider(){
        if (msg.sender != DECRYPTION_PROVIDER) revert NotAuthorizedDecryptionProvider();
        _;
    }
}
