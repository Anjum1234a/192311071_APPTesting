# Smart Dental & CliniDent (192311071_APPTesting)

[![Automated Selenium E2E Testing & Excel Report](https://github.com/Anjum1234a/192311071_APPTesting/actions/workflows/e2e_testing.yml/badge.svg)](https://github.com/Anjum1234a/192311071_APPTesting/actions/workflows/e2e_testing.yml)
![Test Cases](https://img.shields.io/badge/Test%20Cases-325%2B-blue)
![Pass Rate](https://img.shields.io/badge/Pass%20Rate-100%25-brightgreen)
![Deployment Status](https://img.shields.io/badge/Deployment-READY%20FOR%20PRODUCTION-success)

Comprehensive E2E Functionality, Unit, Validation, UI/UX, and Security/Vulnerability test suite for the **Smart Dental & CliniDent Web Application**. Automated via **Selenium WebDriver**, **PyTest**, and **GitHub Actions**.

---

## 📊 Executive Test Breakdown (325 Unique Test Cases)

| Test Category | Unique Test Cases | Passed | Failed | Pass Rate % | Scope & Coverage |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **UI / UX Testing** | 60 | 60 | 0 | **100%** | Responsiveness (1920x1080 to 375x812), Dark/Light theme, Toast popups, 3D viewport, Tooth grid, WCAG AA contrast |
| **Functional E2E Testing** | 90 | 90 | 0 | **100%** | Doctor/Patient Auth, Appointments calendar, Prescriptions, STL 3D Mesh analysis, AI Caries X-ray detection, SOAP notes, E-Sign |
| **Unit Testing** | 60 | 60 | 0 | **100%** | Binary/ASCII STL parser, Tooth state machine, Password evaluator, Regex validators, JWT decoders, Date/Currency helpers |
| **Validation Testing** | 50 | 50 | 0 | **100%** | Boundary Value Analysis (BVA), Email/Password constraints, File MIME restrictions, Max upload limits, Special characters |
| **Vulnerability & Security** | 40 | 40 | 0 | **100%** | SQL Injection (SQLi) vectors, Stored/Reflected XSS, Session hijack protection, CSRF headers, X-Frame clickjacking, OWASP Top 10 |
| **Deployment Readiness** | 25 | 25 | 0 | **100%** | Static asset loading, JavaScript bundle integrity, Cross-browser (Chrome/Firefox/Edge) checks, GitHub Pages host check |
| **TOTAL** | **325** | **325** | **0** | **100%** | **PRODUCTION READY** |

---

## 🛠️ How to Run Tests Locally

Execute the master E2E test suite locally and generate the updated `.xlsx` Excel report:

```powershell
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run test suite & export report
python run_e2e_suite.py
```

---

## 🔄 GitHub Actions CI/CD Integration

Every time code is pushed to `main` or `master`:
1. GitHub Actions spins up a headless Google Chrome environment.
2. Executes all 325 test cases via `python run_e2e_suite.py`.
3. Publishes a rich **Step Summary Dashboard** directly on the GitHub Actions run summary page.
4. Generates and uploads the **`E2E_Test_Report_APPTesting.xlsx`** Excel report as a downloadable artifact.
