# MedChain - Medical Report Management & Distribution System on Blockchain

| Folder | Stack | Purpose |
|---|---|---|
| `frontend/` | Angular 21 | UI (design ported from `doctor-channeling-system`) |
| `backend/` | Spring Boot 3.3, Java 21, PostgreSQL, web3j | REST API, JWT auth, blockchain integration |
| `blockchain/` | Solidity + Hardhat (Ethereum, chain id 1337) | `MedicalRecordRegistry` smart contract + local network |

**Roles:** Hospital admin (manage pharmacies/labs/patients, view and verify bills & reports), Pharmacy (add/view bills),
Pathology Lab (add/view reports). Every bill/report is SHA-256 hashed and the hash is written to the smart contract;
*Verify* recomputes the hash from PostgreSQL and compares it with the chain (`VERIFIED` / `TAMPERED` / `NOT_ANCHORED`).

## Run locally
Needs JDK 21, Node 20+, PostgreSQL. (If `mvn` picks another JDK: `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`.)

1. **Chain key** - `cd blockchain && npm install && npm run keygen`. Copy the `CHAIN_PRIVATE_KEY=...` line and
   `export` it in every terminal below that needs it (blockchain node, deploy, backend). Never commit it.
2. **Blockchain** - `npx hardhat node` (keep running; it funds only your key). In another terminal, with the key exported,
   `npm run deploy` and copy the printed `CHAIN_CONTRACT_ADDRESS=...`.
   Restarting the node wipes the chain - redeploy and reset the DB too, otherwise old records show NOT_ANCHORED.
3. **Database** - create a PostgreSQL database `medchain`.
4. **Backend** - `cd backend`, then
   `DB_USER=postgres DB_PASSWORD=<pw> CHAIN_PRIVATE_KEY=<key> CHAIN_CONTRACT_ADDRESS=<addr> ADMIN_PASSWORD=<choose one> mvn spring-boot:run`
   -> http://localhost:8085. `CHAIN_PRIVATE_KEY` and `CHAIN_CONTRACT_ADDRESS` are required (no defaults).
   Optional overrides: `DB_URL`, `JWT_SECRET`, `CHAIN_RPC_URL`, `SERVER_PORT`, `CORS_ORIGIN`.
5. **Frontend** - `cd frontend && npm install && npx ng serve` -> http://localhost:4200

The hospital login is `admin` / the `ADMIN_PASSWORD` you set. If you leave it unset, a random password is generated and
logged once (`Created hospital admin 'admin' with generated password: ...`) the first time the account is created.
Changing `ADMIN_PASSWORD` later does not change an existing account.

## Demo data
On a fresh database (backend running): `ADMIN_PASSWORD=<pw> ./scripts/seed-demo.sh` creates 2 pharmacies, 2 labs,
5 patients, 6 bills and 5 reports through the API, so all of them are anchored on the chain.
Logins: `pharm1`/`pharm1pass`, `pharm2`/`pharm2pass`, `lab1`/`lab1pass`, `lab2`/`lab2pass`.

## Tests
- `cd blockchain && npm test` - contract tests (anchor once, immutability, verify) on an in-process Hardhat network.
- `cd backend && mvn test` - hashing (determinism, tamper sensitivity), verify statuses, patient-delete guard.

## Demo the tamper detection
Create a bill as a pharmacy, then change it directly in PostgreSQL
(`update bill_items set quantity = 20;`) and press **Verify** as the hospital -> `Tampered`.

## Docs
`docs/Project-Report.docx` covers the life cycle, advantages, limitations and requirements asked for in the project brief.
