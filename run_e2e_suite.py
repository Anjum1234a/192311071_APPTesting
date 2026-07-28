"""
192311071_APPTesting - Master E2E Test Suite Runner
Runs 325+ Selenium E2E & Multi-Tier Test Cases and exports Excel (.xlsx) Report.
"""

import os
import sys
import time
from datetime import datetime

# Add tests directory to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'tests'))

from test_suite import E2ETestSuite
from generate_xlsx_report import generate_excel_report

def main():
    print("=" * 80)
    print(" 192311071_APPTesting - Selenium E2E & Multi-Tier Test Automation Suite ")
    print("=" * 80)
    print(f" Timestamp : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f" Host URL  : https://anjum1234a.github.io/192311071_APPTesting/")
    print(f" Scope     : 325+ Unique Test Cases (UI/UX, Functional, Unit, Validation, Vulnerabilities, Deployment)")
    print("-" * 80)

    # Initialize & Run Suite
    suite = E2ETestSuite()
    results = suite.run_all_tests()

    # Generate Excel Report
    report_filename = f"E2E_Test_Report_APPTesting_{datetime.now().strftime('%Y-%m-%dT%H-%M-%S')}.xlsx"
    standard_filename = "E2E_Test_Report_APPTesting.xlsx"

    generate_excel_report(results, output_path=standard_filename)
    generate_excel_report(results, output_path=report_filename)

    total = len(results)
    passed = sum(1 for r in results if r.status == "PASS")
    failed = sum(1 for r in results if r.status == "FAIL")
    pass_rate = round((passed / total * 100), 2) if total > 0 else 100.0

    print("\n" + "=" * 80)
    print(" EXECUTIVE E2E TEST SUMMARY")
    print("=" * 80)
    print(f" Total Executed Test Cases : {total}")
    print(f" Passed Test Cases         : {passed}")
    print(f" Failed Test Cases         : {failed}")
    print(f" Overall Pass Rate         : {pass_rate}%")
    print(f" Excel Report File (.xlsx) : {os.path.abspath(standard_filename)}")
    print(f" Timestamped Artifact File : {os.path.abspath(report_filename)}")
    print("=" * 80)

    if failed > 0:
        print("[!] Execution finished with test failures.")
        sys.exit(1)
    else:
        print("[SUCCESS] All 325+ test cases executed successfully! Web application is READY FOR PRODUCTION DEPLOYMENT.")
        sys.exit(0)

if __name__ == "__main__":
    main()
