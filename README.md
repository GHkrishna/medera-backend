<hr/>

# Note:
- **The main repo including all the different components**: https://github.com/GHkrishna/medera

<hr>

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
- [Getting started locally](#getting-started-locally)
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
AGENT_ENDPOINT=http://ip-address:3000
SHORT_URL_DOMAIN=http://ip-address:3000

# Doctor Tenant and Schema
DOCTOR_TENANT_ID=
DOCTOR_DID=
PRESCRIPTION_SCHEMA=https://ghkrishna.github.io/schemas/Prescription.json

# Connect to a local postgres instance or neon db(https://neon.tech):
NEON_DB_PASS=postgres
NEON_DB=medera
NEON_DB_ROLE=postgres
NEON_DB_URL=postgresql://postgres:postgres@localhost:5432/medera
NEON_DB_HOST=localhost:5432

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

## Getting started locally
Start the application initially without tenant id and DIDs. Howver, Agent details, database details and hedera account(of type `ED25519`) details created from [Hedera portal](https://portal.hedera.com/) are required.

### Database details
> Note: eventhough the variable details are `NEON_DB` specific you can connect to any postgress instance
1. Start postgres locally
2. Now, enter the appropriated details in the `.env` for your db

**Note**: In case you are connecting to a hosted DB, you'll need to create a wallet for your tenant by adding the following code in your `./src/agent/agent.ts` before `await agent.initialize()`

```typescript
      // Add this before await agent.initialize();
      await agent.wallet.create({
        id: process.env.AgentWalletID,
        key: process.env.AgentWalletKey,
        storage: {
          type: 'postgres',
          config: {
            host: process.env.NEON_DB_HOST,
            connectTimeout: 10,
            maxConnections: 1000,
            idleTimeout: 30000,
          },
          credentials: {
            account: process.env.NEON_DB_ROLE,
            password: process.env.NEON_DB_PASS,
            adminAccount: process.env.NEON_DB_ROLE,
            adminPassword: process.env.NEON_DB_PASS,
          },
        },
      });

      await agent.initialize();

```

### Tenant ID's:
To set the tenant id, 
1. Start the application initially without tenant id
2. Headover to the hosted application (http://localhost:3000) and create a tenant using the /agent/createTenant
3. Not you will need to create two tenants for Doctor and Pharmacy. After creating the tenant add them to their respective `env` variables

### Creating did:hedera
The application intends to support did creation on hedera:testnet. To create a `did:hedera:testnet` follow the following steps.
> Note: We will create a `did:hedera:testnet` for both Doctor and Pharmacy. However we won't be including them into the `env` directly(This is due to an issue with difference in resolving & signing of a created and imported DID). Instead we'll be creating a DID for each tenant and them import the created DID into alternative agents. So in our case, the doctor(tenant) will create a did, which will then be imported by the pharmacy(tenant) and vice versa.

1. Create a DID as a doctor(tenant-id) from the endpoint /agent/createHederaDid
2. Once a DID is created, copy the seed used and created did received from response. Now we will import this DID into the Pharmacy tenant/wallet
> Note: The seed must be unique 32 characters for each new DID creation
3. Import the did into pharmacy(tenant-id) from endpoint /importHederaDid
4. Once import is successful with statusCode `201`. You can save this DID into the `PHARMACY_DID`
5. We will once again repeat the same process to get a DID for Doctor.
> Note: In this case the Pharmacy will create the did and the doctor will import it. Once this is completed we will have the value for `DOCTOR_DID`

### API Documentation
Now that you have all the details required to start, you can restart your service with the updated `.env`. <Br/>
The API endpoints are documented using Swagger.

1. Start the application.
2. Navigate to the API docs at: `http://localhost:3000/api`
> Note: To ensure the demo works seamlessly, head over to the backend (http://your-ip:port/api#/) and ensure the application is up and running by observing the response for these three endpoints /agent/agentDetails(http://localhost:3000/api#/agent), /doctor/agentDetails and(http://localhost:3000/api#/doctor) /pharmacy/agentDetails(http://localhost:3000/api#/pharmacy) to ensure the backend is brought into cache by the hosting provider

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
- [Frontend Repo Clinic](https://github.com/pranalidhanavade/medera-clinic-frontend) - [Frontend Clinic Live Demo](https://medera-clinic-frontend.vercel.app/)
- [Frontend Repo Pharmacy](https://github.com/pranalidhanavade/medera-pharmacy-frontend) - [Frontend Pharmacy Live Demo](https://medera-pharmacy-frontend.vercel.app/)
- [Backend Live Demo](https://github.com/GHkrishna/medera-backend/api)
> Note: To ensure the demo works seamlessly, head over to the [hosted backend](https://medera-backend.onrender.com/api#/) and ensure the application is up and running by observing the response for these three endpoints [/agent/agentDetails](https://medera-backend.onrender.com/api#/Agent), [/doctor/agentDetails](https://medera-backend.onrender.com/api#/Doctor) and [/pharmacy/agentDetails](https://medera-backend.onrender.com/api#/Pharmacy) to ensure the backend is brought into cache by the hosting provider 

---

**Contact:**  
For queries or support, reach out to us at: [waskekrishna@gmail.com]

### Thank you,
![Hedera Logo](./public/hedera.png) 
