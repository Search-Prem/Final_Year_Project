# Next-Gen Cloud Security Using Pell-Based RSA

A complete full-stack web application implementing a custom RSA cryptosystem where private keys are derived from the Pell equation ($x^2 - Dy^2 = 1$). The system features multiplicative homomorphic encryption, allowing an untrusted cloud to process encrypted data without decryption.

## Features

- **Pell-Based Key Generation**: Uses fundamental solutions of Pell's equation to derive private exponents.
- **Homomorphic Encryption**: Supports multiplicative operations on encrypted data (Cloud Simulation).
- **CRT Optimization**: Uses Chinese Remainder Theorem for efficient decryption.
- **Modern UI**: Built with React, Vite, and TailwindCSS features glassmorphism and rich aesthetics.
- **Secure Architecture**: Separation of concerns between Client, API, and Crypto Engine.

## Tech Stack

- **Frontend**: React, main logic in `client/`
- **Backend**: Node.js/Express, logic in `server/`
- **Database**: MySQL (via Docker)
- **Crypto**: Pure JavaScript `BigInt` implementation (No external crypto libs).

## Requirements fulfilled

- [x] Pell-Based RSA (Recursion, Wiener check)
- [x] Multiplicative Homomorphic Encryption
- [x] CRT Decryption
- [x] React Frontend with specific panels
- [x] Admin Log & Performance Analytics
- [x] Dockerized

## Setup & Run

### Prerequisites
- Docker & Docker Compose
- Node.js (for local dev)

### Quick Start (Docker)

```bash
docker-compose up --build
```
*Note: If `docker-compose` fails, try `docker compose up --build`.*

Access the application at `http://localhost:3000`.

### Local Development

**Server:**
```bash
cd server
npm install
npm start
```

**Client:**
```bash
cd client
npm install
npm run dev
```

## Testing

Run the built-in crypto engine verification:
```bash
node test_crypto.js
```
