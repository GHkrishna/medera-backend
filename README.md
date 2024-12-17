# Medera Backend

![Medera Logo](./public/medera.png)  
**Medera** - Backend Service for the Hedera Hackathon

This repository contains the backend service for the **Medera** project, a healthcare solution built using the [Hedera Hashgraph](https://hedera.com/) platform. The application is developed using [NestJS](https://nestjs.com/), providing a scalable, efficient, and modular backend framework.

## Project Overview
**Medera** aims to revolutionize healthcare by leveraging the power of distributed ledger technology (DLT). Using the Hedera network, we ensure secure, transparent, and decentralized healthcare solutions.

This project was built for the **Hedera Hackathon**, showcasing the integration of cutting-edge technologies for a transformative healthcare application.

## Features
- **DLT Integration**: Secure and transparent data storage on Hedera.
- **Modular Architecture**: Built with NestJS for maintainability and scalability.
- **API-First Approach**: Provides robust and documented RESTful APIs.
- **Enhanced Security**: Uses Hedera for tamper-proof data integrity.

## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## Getting Started

### Prerequisites
Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Hedera testnet/mainnet account ([Get one here](https://portal.hedera.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GHkrishna/medera-backend.git
   cd medera-backend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Run the application:
   ```bash
   yarn start
   ```

4. For development mode with hot-reloading:
   ```bash
   yarn start:dev
   ```

### Environment Variables
Create a `.env` file in the root directory and add the following variables:

```env
# Agent Configuration
AgentLabel=medera
AgentWalletID=medera
AgentWalletKey=medera
AGENT_PROTOCOL=http
AGENT_ENDPOINT=https://medera-backend.onrender.com
SHORT_URL_DOMAIN=https://medera-backend.onrender.com

# Doctor Tenant and Schema
DOCTOR_TENANT_ID=
DOCTOR_DID=
PRESCRIPTION_SCHEMA=https://ghkrishna.github.io/schemas/Prescription.json

# Medera Neon DB
NEON_DB_PASS=
NEON_DB=medera
NEON_DB_ROLE=
NEON_DB_URL=
NEON_DB_HOST=

# Pharmacy Configuration
PHARMACY_RECEIPT_SCHEMA=https://ghkrishna.github.io/schemas/PharmacyReceipt.json
PRARMACY_TENANT_ID=
PHARMACY_DID=

# Hedera Account
PRIVATE_KEY=
ACCOUNT_ID=
```

Replace placeholders with the respective values:
- **Hedera credentials**: `PRIVATE_KEY` and `ACCOUNT_ID`.
- **Database details**: `NEON_DB_PASS`, `NEON_DB_ROLE`, and `NEON_DB_URL`.
- **Tenant-specific IDs**: `DOCTOR_TENANT_ID`, `PHARMACY_TENANT_ID`, and `DOCTOR_DID`.

---

## API Documentation
The API endpoints are documented using Swagger.

1. Start the application.
2. Navigate to the API docs at: `http://localhost:3000/api`

Explore and test the endpoints directly from the Swagger UI.

---

## Project Structure
```
medera-backend/
├── src/
│   ├── modules/         # Feature-based modules
│   ├── controllers/     # API controllers
│   ├── services/        # Business logic
│   ├── entities/        # Database entities (if applicable)
│   ├── utils/           # Utility functions
│   ├── main.ts          # Entry point of the application
├── test/                # Unit and integration tests
├── .env                 # Environment configuration
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

---

## Contributing
We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

---

## Acknowledgments
- **Hedera**: For providing a secure and efficient DLT platform.
- **NestJS**: For the robust backend framework.
- **Hackathon Team**: Sai Ranjit, Tipu Singh, Pranali Dhanavade

---

**Project Links:**
- [Frontend Repo Clinic](https://github.com/pranalidhanavade/medera-clinic-frontend)
- [Frontend Repo Pharmacy](https://github.com/pranalidhanavade/medera-pharmacy-frontend)
- [Live Demo](https://github.com/GHkrishna/medera-backend/api)

---

**Contact:**  
For queries or support, reach out to us at: [waskekrishna@gmail.com]

### Thank you,
![Hedera Logo](./public/hedera.png) 