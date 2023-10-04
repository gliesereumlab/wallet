/**
 * Gliesereum Labs: A cryptocurrency utility library specialized for creating and managing wallets.
 * Developed by Pavlo Chabanov, 2023.
 *
 * This library provides a collection of functionalities that allow developers to:
 * 1. Create new cryptocurrency wallets.
 * 2. Convert public key bytes into a unique wallet address.
 * 3. Create hashes using SHA256 and RIPEMD160.
 * 4. Sign and verify messages with ECDSA.
 * 5. Validate wallet addresses.
 * 6. Generate a unique card number based on input strings.
 * 7. Import wallets using private keys.
 */

import { ec } from "elliptic";
import { Buffer } from "buffer";
import bs58 from "bs58";  // Base58 encoder/decoder, commonly used for cryptocurrency addresses
import { SHA256 } from "crypto-js";  // Cryptographic SHA256 hashing function
import { ripemd160 } from "@noble/hashes/ripemd160";  // RIPEMD160 cryptographic hash function

// Configuration constants
const CHECKSUM_SIZE = 1;  // Define the size of the checksum to validate addresses
const EC = new ec('secp256k1');  // Initializing the elliptic curve cryptography for secp256k1, which is widely used in cryptocurrencies

// Interface for a wallet structure, defining its attributes
interface Wallet {
    publicKey: string;
    privateKey: string;
    address: string;
    number: number;  // A unique number associated with the wallet (could be used for card representation, etc.)
}

/**
 * Generates a unique wallet address from given public key bytes.
 * It combines versioning, hashing, and Base58 encoding to create an address.
 */

function getAddress(bytes: Buffer): string {
    const pubKeyHash = createHash(bytes);  // Create a hash of the public key
    const versionAndHash = Buffer.concat([Buffer.from([0x90]), pubKeyHash]);  // Prefix the hash with a version byte
    const checksum = createChecksum(versionAndHash);  // Create a checksum for error detection
    const fullPayload = Buffer.concat([versionAndHash, checksum]);  // Concatenate version, hash, and checksum
    return bs58.encode(fullPayload);  // Convert the byte sequence into a Base58 encoded string
}

/**
 * Creates a new cryptocurrency wallet.
 * The function generates a public-private key pair, constructs an address, and computes a unique number for the wallet.
 */

function createWallet(): Wallet {
    const pair = EC.genKeyPair();  // Generate a key pair using ECDSA
    const publicKey = pair.getPublic('hex');  // Extract the public key
    const privateKey = pair.getPrivate('hex');  // Extract the private key
    const concatenatedPubKey = Buffer.from(pair.getPublic().encode('array', true));  // Convert the public key into a buffer
    const address = getAddress(concatenatedPubKey);  // Generate the wallet address using the public key
    return {
        publicKey,
        privateKey,
        address,
        number: cardNumber(address)  // Generate a unique card number for the wallet
    };
}

/**
 * Produces a hash from given bytes.
 * It first applies SHA256 and then RIPEMD160 for better uniqueness and shorter hashes.
 */

function createHash(bytes: Buffer): Buffer {
    const sha256Hash = SHA256(bytes.toString('utf8')).toString();  // Create a SHA256 hash
    return Buffer.from(ripemd160.create().update(Buffer.from(sha256Hash, 'utf8')).digest());  // Apply RIPEMD160 and return
}

/**
 * Computes a checksum for data integrity verification.
 * It's generated by hashing the input bytes twice and taking a subset of the resulting hash.
 */

function createChecksum(bytes: Buffer): Buffer {
    return createHash(createHash(bytes)).slice(0, CHECKSUM_SIZE);
}

/**
 * Attempts to recover the original public key used to sign a message.
 * It uses ECDSA's recover method with the provided signature and data.
 */

function recover(data: string, sig: ec.Signature): string {
    try {
        if (typeof sig.recoveryParam === "number") {
            const recovered = EC.recoverPubKey(data, sig, sig.recoveryParam, "hex");  // Recover the public key
            return recovered.encodeCompressed("hex");
        }
    } catch (error) {
        console.error("Failed to recover the public key:", error);
    }
    return "invalid";  // Default return value in case of failure
}

/**
 * Uses ECDSA to sign a piece of data with a given private key.
 * This proves the authenticity and integrity of the message.
 */

function sign(data: string, key: string): ec.Signature {
    return EC.sign(data, Buffer.from(key, 'hex'), "hex", { canonical: true });
}

/**
 * Validates the correctness and authenticity of a cryptocurrency address.
 * It decodes the Base58 address, verifies its version, and checks its checksum for integrity.
 */

function validateAddress(address: string): boolean {
    const decodedKey = bs58.decode(address);  // Decode the Base58 encoded address
    const version = decodedKey[0];  // Extract the version byte
    const payload = decodedKey.slice(1, -CHECKSUM_SIZE);  // Get the main payload (excluding version and checksum)
    const actualChecksum = decodedKey.slice(-CHECKSUM_SIZE);  // Extract the checksum
    const targetChecksum = createChecksum(Buffer.concat([Buffer.from([version]), payload]));  // Calculate the expected checksum
    return Buffer.compare(targetChecksum, actualChecksum) === 0;  // Verify the checksum's correctness
}

/**
 * Validates the authenticity of a signed message against a given public key.
 * It ensures the message hasn't been tampered with and originated from the holder of the private key corresponding to the given public key.
 */

function verify(data: string, sig: ec.Signature, publicKey: string): boolean {
    return EC.verify(data, sig, Buffer.from(publicKey, "hex"), "hex");
}

/**
 * Generates a unique number based on an input (typically an address).
 * This can be useful for card representations of wallets or other unique identifiers.
 */

function cardNumber(input: string): number {
    const hash = SHA256(input);
    const num = parseInt(hash.toString().substr(0, 16), 16);  // Convert the first 16 characters of the hash to a number
    return 1000000000000000 + (num % 9000000000000000);  // Ensure the result is a 16-digit number
}

/**
 * Generates a wallet's details (public key, address, etc.) from a given private key.
 * This allows for the recovery or import of an existing wallet.
 */

function importFromPrivateKey(pKeyHex: string): Wallet {
    const keyPair = EC.keyFromPrivate(pKeyHex);  // Get the key pair from the provided private key
    const concatenatedPubKey = Buffer.from(keyPair.getPublic().encode('array', true));
    const address = getAddress(concatenatedPubKey);
    return {
        publicKey: keyPair.getPublic("hex"),
        privateKey: keyPair.getPrivate("hex"),
        address,
        number: cardNumber(address)
    };
}

// Public API exposing the library's main functionalities
const Gliesereum = {
    createWallet,
    validateAddress,
    sign,
    verify,
    recover,
    cardNumber,
    importFromPrivateKey
};

export default Gliesereum;
