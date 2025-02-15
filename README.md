# 🚀 Synthetic Stablecoin Management Frontend

This project is a web-based management dashboard for minting and burning synthetic stablecoins on the Polygon PoS network. The frontend is built with **React** and deployed on **Vercel**, with CI/CD automation via **GitHub Actions**.

## 📂 **Project Structure**
```
synthetic-stablecoin-project/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions for CI/CD
├── backend/
│   └── trading_algorithm/
│       └── trading_algorithm.py # Python Trading Algorithm
├── contracts/
│   └── MasterControl.sol       # Solidity Smart Contract
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── utils/
    │   └── App.js
    ├── .env
    ├── package.json
    └── vercel.json             # Vercel Configuration
```

---

## 🛠️ **Step 1: Prerequisites**
- Node.js (v18+)
- Python (for trading algorithm)
- Vercel account
- GitHub repository

---

## ⚙️ **Step 2: Configure Environment Variables**
Create a `.env` file in the `frontend/` directory:
```bash
REACT_APP_MASTER_CONTROL=<Your_MasterControl_Contract_Address>
REACT_APP_ADMIN_WALLET=<Your_Admin_Wallet_Address>
REACT_APP_GA_MEASUREMENT_ID=<Your_GA4_Measurement_ID>
REACT_APP_SENTRY_DSN=<Your_Sentry_DSN>
THIRDWEB_CLIENT_ID=<Your_ThirdWeb_Client_ID>
```

---

## 🚀 **Step 3: Deploy Frontend to Vercel**
### **Option 1: Vercel CLI**
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```
### **Option 2: Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/).
2. Import your GitHub repository.
3. Set environment variables under **Settings > Environment Variables**.
4. Click **Deploy**.

---

## 🤖 **Step 4: Configure GitHub Actions for CI/CD**
### **4.1. Add Secrets to GitHub:**
Go to **Settings > Secrets and variables > Actions** in your repository and add:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `REACT_APP_MASTER_CONTROL`
- `REACT_APP_ADMIN_WALLET`
- `REACT_APP_GA_MEASUREMENT_ID`
- `REACT_APP_SENTRY_DSN`

### **4.2. Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Vercel
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
        working-directory: frontend
      - name: Build project
        run: npm run build
        working-directory: frontend
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 **Step 5: Monitor and Analyze**
### 🟡 Vercel Analytics:
- Enable from **Vercel Dashboard > Analytics**.
- View real-time traffic and performance insights.

### 🟠 Google Analytics:
- Track user behavior via `REACT_APP_GA_MEASUREMENT_ID`.

### 🐞 Sentry Error Tracking:
- Automatically logs errors via `REACT_APP_SENTRY_DSN`.

---

## 🧪 **Step 6: Test Deployment**
- ✅ Check **Vercel Preview URL** (auto-generated for pull requests).
- ✅ Verify **Google Analytics** events.
- ✅ Review **Sentry logs** for errors.
- ✅ Confirm **Smart Contract Interactions** via the dashboard.

---

## ✅ **Final Outcome:**
- 🌐 Frontend hosted on Vercel with HTTPS.
- 🚀 Automatic CI/CD via GitHub Actions.
- 📊 Analytics and 📈 error tracking configured.

---

## 📝 **Next Steps:**
- Add unit tests for smart contracts.
- Enable Discord or Slack alerts for deployment status.
- Set up Lighthouse performance audits.

---

### Author: 🧑‍💻 Synthetic Stablecoin Team
🚀 Built with ❤️, Deployed on Vercel 🌐
