"""
Seed Supabase tables with demo data.
Run once after creating the tables:  python seed.py
"""
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

sb.table("suspects").insert([
    {
        "name": "R. Mehta", "full_name": "Rajesh Kumar Mehta",
        "risk_level": "HIGH", "status": "AT LARGE", "cluster": "Cluster K-7",
        "confidence": 91, "associates": 7, "arrests": 3,
        "last_seen": "Whitefield, Bengaluru", "last_seen_date": "18 Dec 2024",
        "prison_from": "Mar 2021", "prison_to": "Sep 2022", "prison_months": 18,
        "prison_reason": "Money Laundering (PoCA)", "role": "Broker",
        "crimes": ["Drug trafficking", "Money laundering", "Financial fraud"],
    },
    {
        "name": "D. Nair", "full_name": "Dev Nair",
        "risk_level": "HIGH", "status": "WANTED", "cluster": "Cluster K-7",
        "confidence": 97, "associates": 12, "arrests": 0,
        "last_seen": "Unknown", "last_seen_date": "Unknown",
        "prison_months": 0, "prison_reason": "None (evaded arrest)", "role": "Kingpin",
        "crimes": ["Drug trafficking", "Murder", "Extortion"],
    },
    {
        "name": "S. Khan", "full_name": "Salim Khan",
        "risk_level": "HIGH", "status": "IN CUSTODY", "cluster": "Cluster K-7",
        "confidence": 84, "associates": 5, "arrests": 3,
        "last_seen": "Central Prison", "last_seen_date": "Nov 2024",
        "prison_months": 0, "prison_reason": "Current custody", "role": "Operative",
        "crimes": ["Drug logistics", "Money laundering"],
    },
]).execute()

sb.table("cases").insert([
    {
        "case_id": "KS1207", "crime": "Money Laundering", "status": "Active",
        "date_filed": "12 Aug 2024", "officer": "Insp. R. Sharma",
        "court_status": "Pending Hearing", "location": "Whitefield",
        "summary": "Hawala network linked to Cluster K-7. R. Mehta identified as primary conduit.",
    },
    {
        "case_id": "KS1189", "crime": "Drug Trafficking", "status": "Under Review",
        "date_filed": "03 Jun 2024", "officer": "SI A. Naidu",
        "court_status": "Investigation", "location": "Electronic City",
        "summary": "Drug cache recovered near Electronic City. Phone records link to S. Khan.",
    },
]).execute()

sb.table("evidence").insert([
    {
        "title": "CCTV Footage", "type": "VISUAL", "confidence": 87,
        "timestamp": "Warehouse 17 · 02:14 AM, 08 Aug 2023", "officer": "R. Nair",
        "description": "Three frames showing vehicle KA01AB1234 entering warehouse.",
        "reasoning": "Anchor node. Timestamp matches phone tower data for R. Mehta.",
    },
    {
        "title": "Bank Transfer", "type": "FINANCIAL", "confidence": 95,
        "timestamp": "FinCEN alert · 09 Nov 2023", "officer": "Financial Crimes Unit",
        "description": "Rs4.2 lakh to Shri Nair Associates via sub-transfers.",
        "reasoning": "Structuring pattern is classic laundering. Name overlap with D. Nair.",
    },
]).execute()

sb.table("suspect_cases").insert([
    {"suspect_name": "R. Mehta", "case_id": "KS1207"},
    {"suspect_name": "R. Mehta", "case_id": "KS1189"},
    {"suspect_name": "S. Khan", "case_id": "KS1207"},
]).execute()

sb.table("evidence_suspects").insert([
    {"evidence_title": "CCTV Footage", "suspect_name": "R. Mehta"},
    {"evidence_title": "CCTV Footage", "suspect_name": "S. Khan"},
    {"evidence_title": "Bank Transfer", "suspect_name": "R. Mehta"},
]).execute()

sb.table("gang_members").insert([
    {"name": "D. Nair", "role": "Kingpin", "cluster": "Cluster K-7", "risk": "HIGH", "status": "WANTED", "level": 0},
    {"name": "R. Mehta", "role": "Broker", "cluster": "Cluster K-7", "risk": "HIGH", "status": "AT LARGE", "level": 1},
    {"name": "S. Khan", "role": "Operative", "cluster": "Cluster K-7", "risk": "HIGH", "status": "IN CUSTODY", "level": 1},
    {"name": "P. Reddy", "role": "Operative", "cluster": "Cluster K-7", "risk": "MEDIUM", "status": "AT LARGE", "level": 1},
    {"name": "T. Kumar", "role": "Associate", "cluster": "Cluster K-7", "risk": "LOW", "status": "MONITORING", "level": 2},
]).execute()

sb.table("hotspots").insert([
    {"name": "Whitefield", "incidents": 47, "crime_type": "Drug Trafficking",
     "risk_score": 9.2, "emerging": True, "latitude": 12.9698, "longitude": 77.7500},
    {"name": "Shivajinagar", "incidents": 32, "crime_type": "Financial Fraud",
     "risk_score": 7.8, "emerging": False, "latitude": 12.9850, "longitude": 77.5967},
    {"name": "Electronic City", "incidents": 28, "crime_type": "Cybercrime",
     "risk_score": 7.1, "emerging": False, "latitude": 12.8399, "longitude": 77.6770},
]).execute()

sb.table("arrests").insert([
    {
        "suspect_name": "S. Khan", "case_id": "KS1207", "charge": "Money Laundering",
        "arrest_date": "18 Nov 2023", "location": "Kempegowda Bus Stand",
        "officer": "SIT Team Alpha",
        "narrative": "Apprehended during SIT operation. Found with second SIM matching KIRA-flagged swap pattern.",
    },
    {
        "suspect_name": "Anil Kumar", "case_id": "KS1310", "charge": "Chain Snatching",
        "arrest_date": "12 Dec 2024", "location": "Jayanagar 4th Block",
        "officer": "SI Manjunath",
        "narrative": "Partial plate from CCTV led to ID within 18 hours.",
    },
]).execute()

print("All seed data inserted into Supabase.")
