#!/bin/bash
# Fills a fresh MedChain database with fake demo data through the REST API, so every bill and report is
# also anchored on the blockchain. Usage: ADMIN_PASSWORD=<pw> ./scripts/seed-demo.sh [api-url]
# Run it once against a fresh database (the demo logins can only be created once).
set -e
API="${1:-http://localhost:8085/api}"
: "${ADMIN_PASSWORD:?set ADMIN_PASSWORD to the hospital admin password}"

json() { python3 -c "import sys,json;d=json.load(sys.stdin);print($1)"; }
call() { # method path token [body]
  local args=(-s -X "$1" -H "Content-Type: application/json" -w $'\n%{http_code}')
  [ -n "$3" ] && args+=(-H "Authorization: Bearer $3")
  [ -n "$4" ] && args+=(-d "$4")
  local out; out=$(curl "${args[@]}" "$API$2")
  local code="${out##*$'\n'}"
  if [ "${code:0:1}" != "2" ]; then echo "FAILED $1 $2 -> HTTP $code: ${out%$'\n'*}" >&2; exit 1; fi
  echo "${out%$'\n'*}"
}
login() { call POST /auth/login "" "{\"username\":\"$1\",\"password\":\"$2\"}" | json "d['token']"; }

echo "Logging in as admin..."
ADMIN=$(login admin "$ADMIN_PASSWORD")

echo "Creating pharmacies and labs..."
call POST /pharmacies "$ADMIN" '{"name":"CityCare Pharmacy","licenseNo":"PH-1001","address":"12 Market Road, Chennai","phone":"9840011111","email":"citycare@example.com","username":"pharm1","password":"pharm1pass"}' >/dev/null
call POST /pharmacies "$ADMIN" '{"name":"GreenLeaf Pharmacy","licenseNo":"PH-1002","address":"45 Lake View, Chennai","phone":"9840022222","email":"greenleaf@example.com","username":"pharm2","password":"pharm2pass"}' >/dev/null
call POST /labs "$ADMIN" '{"name":"Metro Pathology Lab","licenseNo":"LB-2001","address":"7 Hospital Street, Chennai","phone":"9840033333","email":"metro@example.com","username":"lab1","password":"lab1pass"}' >/dev/null
call POST /labs "$ADMIN" '{"name":"Precision Diagnostics","licenseNo":"LB-2002","address":"90 Anna Nagar, Chennai","phone":"9840044444","email":"precision@example.com","username":"lab2","password":"lab2pass"}' >/dev/null

echo "Creating patients..."
patient() { call POST /patients "$ADMIN" "$1" | json "d['id']"; }
P1=$(patient '{"name":"Arun Kumar","dateOfBirth":"1985-03-14","gender":"Male","bloodGroup":"B+","phone":"9000000001","email":"arun@example.com","address":"Chennai"}')
P2=$(patient '{"name":"Meena Devi","dateOfBirth":"1992-07-22","gender":"Female","bloodGroup":"O+","phone":"9000000002","email":"meena@example.com","address":"Coimbatore"}')
P3=$(patient '{"name":"Rahul Sharma","dateOfBirth":"1978-11-05","gender":"Male","bloodGroup":"A+","phone":"9000000003","email":"rahul@example.com","address":"Madurai"}')
P4=$(patient '{"name":"Priya Nair","dateOfBirth":"2001-01-30","gender":"Female","bloodGroup":"AB+","phone":"9000000004","email":"priya@example.com","address":"Trichy"}')
P5=$(patient '{"name":"Suresh Babu","dateOfBirth":"1965-09-18","gender":"Male","bloodGroup":"O-","phone":"9000000005","email":"suresh@example.com","address":"Salem"}')

echo "Pharmacy bills (anchored on the blockchain)..."
PH1=$(login pharm1 pharm1pass); PH2=$(login pharm2 pharm2pass)
bill() { call POST /bills "$1" "$2" | json "'  bill  ' + d['id'][:8] + '  total ' + str(d['total']) + '  block #' + str(d['blockNumber'])"; }
bill "$PH1" "{\"patientId\":$P1,\"items\":[{\"medicine\":\"Paracetamol 500mg\",\"quantity\":2,\"unitPrice\":12.50},{\"medicine\":\"Cough Syrup\",\"quantity\":1,\"unitPrice\":85}]}"
bill "$PH1" "{\"patientId\":$P2,\"items\":[{\"medicine\":\"Amoxicillin 250mg\",\"quantity\":3,\"unitPrice\":42.80}]}"
bill "$PH1" "{\"patientId\":$P3,\"items\":[{\"medicine\":\"Metformin 500mg\",\"quantity\":6,\"unitPrice\":9.75},{\"medicine\":\"Vitamin D3\",\"quantity\":1,\"unitPrice\":150}]}"
bill "$PH2" "{\"patientId\":$P4,\"items\":[{\"medicine\":\"Cetirizine 10mg\",\"quantity\":2,\"unitPrice\":18}]}"
bill "$PH2" "{\"patientId\":$P5,\"items\":[{\"medicine\":\"Atorvastatin 10mg\",\"quantity\":4,\"unitPrice\":32.40},{\"medicine\":\"Aspirin 75mg\",\"quantity\":2,\"unitPrice\":6.20}]}"
bill "$PH2" "{\"patientId\":$P1,\"items\":[{\"medicine\":\"ORS Sachet\",\"quantity\":5,\"unitPrice\":22}]}"

echo "Lab reports (anchored on the blockchain)..."
L1=$(login lab1 lab1pass); L2=$(login lab2 lab2pass)
report() { call POST /reports "$1" "$2" | json "'  report ' + d['id'][:8] + '  ' + d['reportType'] + '  block #' + str(d['blockNumber'])"; }
report "$L1" "{\"patientId\":$P1,\"reportType\":\"Blood Test\",\"values\":[{\"name\":\"Hemoglobin\",\"value\":\"13.8\",\"unit\":\"g/dL\",\"referenceRange\":\"13.0-17.0\"},{\"name\":\"WBC Count\",\"value\":\"7200\",\"unit\":\"/uL\",\"referenceRange\":\"4000-11000\"},{\"name\":\"Platelets\",\"value\":\"250000\",\"unit\":\"/uL\",\"referenceRange\":\"150000-450000\"}]}"
report "$L1" "{\"patientId\":$P2,\"reportType\":\"Lipid Profile\",\"values\":[{\"name\":\"Total Cholesterol\",\"value\":\"192\",\"unit\":\"mg/dL\",\"referenceRange\":\"<200\"},{\"name\":\"LDL\",\"value\":\"118\",\"unit\":\"mg/dL\",\"referenceRange\":\"<130\"},{\"name\":\"HDL\",\"value\":\"52\",\"unit\":\"mg/dL\",\"referenceRange\":\">40\"}]}"
report "$L1" "{\"patientId\":$P3,\"reportType\":\"Blood Sugar\",\"values\":[{\"name\":\"Fasting Glucose\",\"value\":\"128\",\"unit\":\"mg/dL\",\"referenceRange\":\"70-100\"},{\"name\":\"HbA1c\",\"value\":\"6.9\",\"unit\":\"%\",\"referenceRange\":\"<5.7\"}]}"
report "$L2" "{\"patientId\":$P4,\"reportType\":\"Thyroid Panel\",\"values\":[{\"name\":\"TSH\",\"value\":\"2.4\",\"unit\":\"mIU/L\",\"referenceRange\":\"0.4-4.0\"},{\"name\":\"T4\",\"value\":\"8.1\",\"unit\":\"ug/dL\",\"referenceRange\":\"5.0-12.0\"}]}"
report "$L2" "{\"patientId\":$P5,\"reportType\":\"Urine Test\",\"values\":[{\"name\":\"Protein\",\"value\":\"Negative\",\"unit\":\"\",\"referenceRange\":\"Negative\"},{\"name\":\"pH\",\"value\":\"6.0\",\"unit\":\"\",\"referenceRange\":\"4.5-8.0\"}]}"

echo
echo "Done. 2 pharmacies, 2 labs, 5 patients, 6 bills, 5 reports."
