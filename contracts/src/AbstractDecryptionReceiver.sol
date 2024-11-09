// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IDecryptionReceiver} from "./IDecryptionReceiver.sol";

abstract contract AbstractDecryptionReceiver {
    address public immutable DECRYPTION_PROVIDER = 0x11045878ed62ec3acc91ce36a46f4ef61d4616e1;

    error NotAuthorizedDecryptionProvider();

    modifier onlyDecryptionProvider(){
        if (msg.sender != DECRYPTION_PROVIDER) revert NotAuthorizedDecryptionProvider();
        _;
    }
}
