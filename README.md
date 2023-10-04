# Gliesereum Labs

A cryptocurrency utility library designed to simplify the creation and management of wallets.

**Developer:** Pavlo Chabanov, 2023.

## Overview

Gliesereum offers a comprehensive range of functionalities, allowing developers to:
- Create new cryptocurrency wallets.
- Convert public key bytes to a unique wallet address.
- Produce hashes using established algorithms such as SHA256 and RIPEMD160.
- Sign messages and validate them using the ECDSA.
- Verify the validity of cryptocurrency addresses.
- Generate unique card numbers from given input strings.
- Restore or import wallets using their private keys.

## Dependencies

- Elliptic Curve library from `elliptic` module.
- Buffer module.
- Base58 encoder/decoder.
- SHA256 cryptographic hashing function.
- RIPEMD160 cryptographic hashing function.

## Core Components

### Data Structures

- **Wallet Interface**: Defines the essential attributes for a crypto wallet, including public key, private key, wallet address, and an associated unique number.

### Key Functions

- **getAddress**: Transforms public key bytes into a distinct cryptocurrency address.

- **createWallet**: Constructs a new wallet, which encompasses a pair of keys, a wallet address, and an associated unique number.

- **createHash**: Generates a hash for a given set of bytes, applying both SHA256 and RIPEMD160 for better uniqueness.

- **createChecksum**: Creates a checksum for a given set of bytes, useful for ensuring data integrity during transactions.

- **recover**: Recovers the original public key that was utilized to sign a given piece of data.

- **sign**: Uses the ECDSA to sign a piece of data, ensuring the message's authenticity and integrity.

- **validateAddress**: Validates the integrity and format of a given cryptocurrency address.

- **verify**: Checks the authenticity of a signed message against a provided public key.

- **cardNumber**: Produces a unique number from an input string. Can be used for various purposes such as card representations of wallets.

- **importFromPrivateKey**: Restores a wallet's complete details using its private key.

## Public API

`Gliesereum` object provides access to all the essential functionalities, making it easy for developers to utilize the library in their projects.

## Final Thoughts

This library aims to provide a streamlined approach for developers venturing into the cryptocurrency domain. It simplifies numerous intricate processes, ensuring that even those new to blockchain and crypto can develop secure and functional applications.
