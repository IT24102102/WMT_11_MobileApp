# API Endpoint Table

| Module | HTTP Method | Endpoint | Description | Access Level |
|---|---|---|---|---|
| **Auth** | POST | `/api/auth/register` | Register a new user | Public |
| **Auth** | POST | `/api/auth/login` | Authenticate user and get token | Public |
| **Auth** | GET | `/api/auth/me` | Get current user profile | Protected |
| **Auth** | PUT | `/api/auth/profile` | Update user profile | Protected |
| **Auth** | POST | `/api/auth/forgot-password` | Request password reset | Public |
| **Auth** | POST | `/api/auth/reset-password` | Reset password | Public |
| **Products** | GET | `/api/products/available` | Get available agriculture products | Protected |
| **Products** | POST | `/api/products/` | Create a new product listing | FARMER / PRODUCT_MANAGER |
| **Products** | GET | `/api/products/my-listings` | Get user's product listings | FARMER / PRODUCT_MANAGER |
| **Products** | GET | `/api/products/pending` | Get pending products for review | ADMIN |
| **Products** | PUT | `/api/products/:id/review` | Approve/Reject product listing | ADMIN |
| **Products** | DELETE | `/api/products/:id` | Delete a product listing | FARMER / PRODUCT_MANAGER |
| **Purchases**| POST | `/api/purchases/` | Create a purchase | PRODUCT_MANAGER |
| **Purchases**| GET | `/api/purchases/my-purchases`| Get manager's purchases | PRODUCT_MANAGER |
| **Purchases**| GET | `/api/purchases/my-sales` | Get farmer's sales | FARMER |
| **Machinery**| GET | `/api/machinery/available` | Browse available machineries | Protected |
| **Machinery**| POST | `/api/machinery/requests` | Request machinery for rent | FARMER |
| **Machinery**| POST | `/api/machinery/services` | Request machinery service | FARMER |
| **Machinery**| POST | `/api/machinery/rent-out` | Rent out machinery (Farmer) | FARMER |
| **Machinery**| GET | `/api/machinery/regional-data`| View regional machinery stats| OFFICER |
| **Loans** | POST | `/api/loans/apply` | Apply for an agriculture loan | FARMER |
| **Loans** | GET | `/api/loans/` | Get all loans (admin) or user's loans | Protected |
| **Loans** | PATCH| `/api/loans/:id/status` | Update loan approval status | FINANCE_OFFICER / ADMIN |
| **Loans** | POST | `/api/loans/repayments` | Submit loan repayment | FARMER |
| **Crops** | POST | `/api/crops/` | Register a new crop | FARMER |
| **Crops** | GET | `/api/crops/` | Get user crops / all crops | Protected |
| **Compensation**| POST | `/api/compensation/` | Apply for crop compensation | FARMER |
| **Compensation**| GET | `/api/compensation/` | View compensation claims | Protected |
| **Compensation**| PATCH| `/api/compensation/:id` | Verify/Update claim status | FINANCE_OFFICER / ASC_OFFICER |
| **ASC Centers**| GET | `/api/asc/` | Get all ASC centers | Public/Protected |
| **ASC Centers**| GET | `/api/asc/:id` | Get ASC center by ID | Public/Protected |
| **AI** | POST | `/api/ai/predict` | AI based prediction | Protected |
| **Analytics**| GET | `/api/analytics/dashboard` | Get analytics data | ADMIN / OFFICER |
