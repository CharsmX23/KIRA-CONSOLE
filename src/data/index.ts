export type EvidenceType = 'VISUAL' | 'PHYSICAL' | 'DIGITAL' | 'FINANCIAL' | 'TESTIMONY' | 'ANALYTICS';

export const EC: Record<EvidenceType, string> = {
  VISUAL: '#3B82F6',
  PHYSICAL: '#8B5CF6',
  DIGITAL: '#06B6D4',
  FINANCIAL: '#10B981',
  TESTIMONY: '#F59E0B',
  ANALYTICS: '#EF4444',
};

export const EVIDENCE = [
  { id: 'cctv', title: 'CCTV Footage', type: 'VISUAL' as EvidenceType, detail: 'Warehouse · 02:14 AM', confidence: 87 },
  { id: 'vehicle', title: 'Vehicle KA01AB1234', type: 'PHYSICAL' as EvidenceType, detail: 'Detected near site', confidence: 92 },
  { id: 'phone', title: 'Phone Records', type: 'DIGITAL' as EvidenceType, detail: '12 contacts — S. Khan', confidence: 78 },
  { id: 'bank', title: 'Bank Transfer', type: 'FINANCIAL' as EvidenceType, detail: '₹4.2 lakh flagged', confidence: 95 },
  { id: 'witness', title: 'Witness Statement', type: 'TESTIMONY' as EvidenceType, detail: 'Positive ID confirmed', confidence: 83 },
  { id: 'fraud', title: 'Fraud Cluster Match', type: 'ANALYTICS' as EvidenceType, detail: 'FinCrime pattern hit', confidence: 91 },
];

export const EVIDENCE_DETAIL: Record<string, {
  type: string;
  confidence: number;
  timestamp: string;
  officer: string;
  casesLinked: string[];
  suspectsLinked: string[];
  description: string;
  reasoning: string;
}> = {
  'CCTV Footage': {
    type: 'VISUAL EVIDENCE',
    confidence: 87,
    timestamp: 'Warehouse 17 · 02:14 AM, 08 Aug 2023',
    officer: 'R. Nair',
    casesLinked: ['KS1207', 'KS1189'],
    suspectsLinked: ['R. Mehta', 'S. Khan'],
    description: 'Three frames recovered from warehouse perimeter camera. Footage shows vehicle KA01AB1234 entering premises at 02:14 AM, followed by two individuals matching suspect descriptions. Forensic lab reference FL-2024-441.',
    reasoning: 'Timestamp and location correlate with phone tower data for both suspects in the same window. Vehicle plate matches DMT registration linked to R. Mehta. This is the anchor node — all subsequent evidence traces back to this sighting.',
  },
  'Vehicle KA01AB1234': {
    type: 'PHYSICAL EVIDENCE',
    confidence: 92,
    timestamp: 'Registered owner record · checked 09 Aug 2023',
    officer: 'Traffic Intelligence Unit',
    casesLinked: ['KS1207', 'KS0934', 'KS1176'],
    suspectsLinked: ['R. Mehta'],
    description: 'Vehicle registered to Mehta Exports Pvt Ltd, a shell company linked to R. Mehta. Movement history shows repeated visits to Whitefield, Electronic City, and Indiranagar over a 6-week period — all areas with elevated fraud/trafficking activity.',
    reasoning: 'Same vehicle appears in 3 separate case files, none previously cross-referenced. This single vehicle record connects 3 cases that were treated as unrelated — a pattern only visible once evidence is linked across case silos.',
  },
  'Phone Records': {
    type: 'DIGITAL EVIDENCE',
    confidence: 78,
    timestamp: 'Airtel subpoena · 6-8 Nov 2023',
    officer: 'Cybercrime Cell',
    casesLinked: ['KS1207'],
    suspectsLinked: ['R. Mehta', 'S. Khan'],
    description: "12 calls exchanged between R. Mehta's registered number and S. Khan over a 3-day window. Tower triangulation places both numbers within 800m of the Whitefield warehouse during call times. One SIM swap detected for R. Mehta's number on 7 Nov.",
    reasoning: "Call frequency spike (12 calls in 72 hours, vs. baseline of 1-2/week) immediately preceded the financial transfer. SIM swap timing suggests an attempt to avoid surveillance — itself a behavioral indicator the AI flags as evasion.",
  },
  'Bank Transfer': {
    type: 'FINANCIAL EVIDENCE',
    confidence: 95,
    timestamp: 'FinCEN alert · 09 Nov 2023',
    officer: 'Financial Crimes Unit',
    casesLinked: ['KS1207'],
    suspectsLinked: ['R. Mehta', 'D. Nair'],
    description: '₹4.2 lakh transferred from an unregistered hawala account to "Shri Nair Associates" — an entity with no verifiable business registration. Transaction structured as 3 sub-transfers of ₹1.4 lakh each, just under the ₹2 lakh automatic reporting threshold.',
    reasoning: 'Structuring pattern (splitting into sub-threshold amounts) is a classic money-laundering signature — the AI flags this independently of the suspect link. "Shri Nair Associates" name overlap with gang kingpin D. Nair raised this from MEDIUM to HIGH confidence.',
  },
  'Witness Statement': {
    type: 'TESTIMONIAL EVIDENCE',
    confidence: 83,
    timestamp: 'Recorded 20 Nov 2023',
    officer: 'Inspector D. Krishnamurthy',
    casesLinked: ['KS1207'],
    suspectsLinked: ['R. Mehta'],
    description: 'Protected witness W-07 positively identified R. Mehta from a photo array as the individual seen exiting the warehouse on the night in question. Statement recorded under Section 164 CrPC — legally admissible.',
    reasoning: "Witness identification independently corroborates the CCTV timeline without relying on the same data source — this is treated as a separate evidence vector, not a duplicate, which is why it strengthens overall confidence rather than just repeating the CCTV finding.",
  },
  'Fraud Cluster Match': {
    type: 'ANALYTICAL EVIDENCE',
    confidence: 91,
    timestamp: 'Pattern analysis · generated by KIRA',
    officer: 'KIRA Console (AI-generated)',
    casesLinked: ['KS1207', 'KS1189', 'KS0934'],
    suspectsLinked: ['R. Mehta', 'S. Khan', 'P. Reddy'],
    description: 'Transaction signature (structuring pattern, timing, recipient entity naming convention) matches 3 other flagged transfers within Cluster K-7 over the past 8 months. All 3 other matches involve at least one suspect already linked to R. Mehta.',
    reasoning: 'This is the synthesis node — it did not come from a single document or record, but from KIRA cross-referencing the financial database against known cluster members. This is the step that elevates individual evidence items into a cluster-level finding.',
  },
};

export const GANG_MEMBERS = [
  { initials: 'DN', name: 'D. Nair', role: 'Kingpin', status: 'WANTED', level: 0, ring: '#EF4444' },
  { initials: 'RM', name: 'R. Mehta', role: 'Broker', status: 'AT LARGE', level: 1, ring: '#F59E0B', isTarget: true },
  { initials: 'SK', name: 'S. Khan', role: 'Operative', status: 'IN CUSTODY', level: 1, ring: '#EF4444' },
  { initials: 'PR', name: 'P. Reddy', role: 'Operative', status: 'AT LARGE', level: 1, ring: '#F59E0B' },
  { initials: 'TK', name: 'T. Kumar', role: 'Associate', status: 'MONITORING', level: 2, ring: '#F59E0B' },
  { initials: 'MA', name: 'M. Ali', role: 'Associate', status: 'MONITORING', level: 2, ring: '#F59E0B' },
  { initials: 'BS', name: 'B. Singh', role: 'Runner', status: 'UNKNOWN', level: 2, ring: '#475569' },
];

export const RECENT_ARRESTS = [
  {
    name: 'S. Khan', case: 'KS1207', charge: 'Money Laundering (Logistics)',
    date: '18 Nov 2023', location: 'Kempegowda Bus Stand, Whitefield',
    officer: 'SIT Team Alpha',
    evidence: ['12 phone records linking to R. Mehta', 'CCTV match at warehouse 17', 'Bank transfer trail (₹4.2L)'],
    narrative: "Apprehended during a coordinated SIT operation following 3 days of surveillance. Found in possession of a second SIM card matching the swap pattern flagged by KIRA's digital trail analysis.",
    category: 'financial',
  },
  {
    name: 'Anil Kumar', case: 'KS1310', charge: 'Chain Snatching (Theft)',
    date: '12 Dec 2024', location: 'Jayanagar 4th Block',
    officer: 'SI Manjunath',
    evidence: ['CCTV footage from 3 nearby shops', 'Victim identification', 'Recovered gold chain'],
    narrative: 'Suspect snatched a gold chain from a pedestrian near a bus stop and fled on a two-wheeler. Partial plate number captured on CCTV led to identification within 18 hours.',
    category: 'theft',
  },
  {
    name: 'Faisal Ahmed', case: 'KS1322', charge: 'House Burglary',
    date: '13 Dec 2024', location: 'HSR Layout, Sector 2',
    officer: 'ASI Lokesh',
    evidence: ['Fingerprint match at scene', 'Recovered stolen electronics', 'Pawn shop transaction record'],
    narrative: 'Entered an unoccupied residence via the rear balcony while the family was traveling. Stolen items were traced to a pawn shop in Madiwala within 24 hours of the complaint.',
    category: 'theft',
  },
  {
    name: 'Priya Sharma', case: 'KS1298', charge: 'Cyber Fraud (OTP Scam)',
    date: '11 Dec 2024', location: 'Electronic City',
    officer: 'Cybercrime Cell',
    evidence: ['Bank transaction trail', 'Phone records (12 victims)', 'Mule account linkage to Cluster K-7'],
    narrative: 'Operated a phishing SMS scheme impersonating bank security alerts. Funds were routed through a mule account previously flagged in the Cluster K-7 financial network.',
    category: 'cyber',
  },
  {
    name: 'Ravi Gowda', case: 'KS1276', charge: 'Vehicle Theft',
    date: '09 Dec 2024', location: 'Yeshwanthpur',
    officer: 'SI Deepa',
    evidence: ['ANPR logs across 4 checkpoints', 'Recovered vehicle (KA05XY9871)', 'Workshop owner statement'],
    narrative: "Stole a two-wheeler from a residential complex and attempted to repaint and resell it through an unlicensed workshop. ANPR logs tracked the vehicle's movement across the city over 5 days.",
    category: 'theft',
  },
  {
    name: 'M. Ali', case: 'KS1012', charge: 'Financial Fraud (Hawala)',
    date: '08 Dec 2024', location: 'Yeshwanthpur',
    officer: 'Financial Crimes Unit',
    evidence: ['Bank account flagged by FinCEN', 'Hawala network linkage', 'Call records with D. Nair'],
    narrative: "Identified as a financial conduit for Cluster K-7 operations. Account activity matched the structuring pattern seen in the R. Mehta investigation, confirming cross-case evidence reuse.",
    category: 'financial',
  },
];

export const TODAY_CASES = [
  {
    id: 'KS1401', crime: 'Burglary', filedBy: 'R. Iyer (Complainant)', officer: 'SI Manjunath',
    location: 'Koramangala 5th Block', time: '06:42 AM',
    summary: 'Residential burglary reported at 6 AM. Entry via rear window. Jewelry and electronics worth ₹2.1 lakh missing. Neighbours report no suspicious activity overnight — possible inside knowledge of household routine.',
    category: 'theft',
  },
  {
    id: 'KS1402', crime: 'Theft — Chain Snatching', filedBy: 'Lakshmi N. (Complainant)', officer: 'ASI Lokesh',
    location: 'Jayanagar 4th Block', time: '08:15 AM',
    summary: 'Gold chain snatched from a pedestrian near a bus stop. Suspect fled on a motorcycle, partial registration plate captured by a nearby shop CCTV. Similar MO reported twice this month in adjacent wards.',
    category: 'theft',
  },
  {
    id: 'KS1403', crime: 'Cybercrime — Phishing', filedBy: 'Cybercrime Portal', officer: 'Cybercrime Cell',
    location: 'Whitefield', time: '09:30 AM',
    summary: 'Victim lost ₹85,000 via a fraudulent banking SMS link. Funds traced to a mule account already flagged in the Cluster K-7 financial network — possible link to ongoing investigation KS1207.',
    category: 'cyber',
  },
  {
    id: 'KS1404', crime: 'Financial Fraud — Investment Scam', filedBy: 'V. Rao (Complainant)', officer: 'Financial Crimes Unit',
    location: 'Indiranagar', time: '10:05 AM',
    summary: 'Victim transferred ₹3.4 lakh to a fraudulent investment app promising guaranteed returns. App server traced to an overseas host; similar complaints received from 4 other victims this week.',
    category: 'financial',
  },
  {
    id: 'KS1405', crime: 'Robbery — Armed', filedBy: 'Shopkeeper Complaint', officer: 'SI Deepa',
    location: 'Shivajinagar', time: '11:20 AM',
    summary: 'Armed robbery at an electronics shop by two suspects. CCTV captured partial footage of both individuals. Cash and 6 mobile phones taken. One suspect matches a description from a prior Shivajinagar robbery.',
    category: 'robbery',
  },
  {
    id: 'KS1406', crime: 'Drug Possession', filedBy: 'Patrol Report', officer: 'SIT Team Alpha',
    location: 'Electronic City', time: '12:50 PM',
    summary: 'Suspect detained during a routine patrol check with a small quantity of narcotics. Phone records show contact with numbers already under surveillance as part of the Cluster K-7 investigation.',
    category: 'drug',
  },
];

export const OFFENDER_FOOTPRINT = [
  { caseId: 'KS0978', crime: 'Illegal Arms Supply', status: 'CONVICTED' },
  { caseId: 'KS1094', crime: 'Financial Fraud', status: 'CLOSED' },
  { caseId: 'KS1189', crime: 'Drug Trafficking', status: 'UNDER REVIEW' },
  { caseId: 'KS1207', crime: 'Money Laundering', status: 'ACTIVE' },
];

export const INITIAL_CHAT = [
  { role: 'officer' as const, text: 'Tell me about R. Mehta' },
  { role: 'ai' as const, text: "R. Mehta is a high-risk suspect linked to Cluster K-7. Cross-referencing 3 active FIRs, CCTV footage, and financial records reveals a 91% confidence association with narcotics and money laundering operations." },
  { role: 'officer' as const, text: 'Show me the evidence chain' },
  { role: 'ai' as const, text: 'Evidence chain reconstructed. 6 nodes linked from CCTV footage to financial fraud cluster. Displaying in investigation workspace.' },
];

export function generateTrendData() {
  const data = [];
  let cyber = 60, fraud = 45, drug = 80, rob = 100;
  for (let i = 1; i <= 30; i++) {
    cyber += Math.random() * 8 - 2;
    fraud += Math.random() * 7 - 1;
    drug += Math.random() * 6 - 3;
    rob -= Math.random() * 5 - 1;
    data.push({
      day: i === 1 ? '1' : i === 10 ? '10' : i === 20 ? '20' : i === 30 ? '30' : '',
      cybercrime: Math.round(Math.max(20, Math.min(200, cyber))),
      financialFraud: Math.round(Math.max(20, Math.min(200, fraud))),
      drugTrafficking: Math.round(Math.max(20, Math.min(200, drug))),
      robbery: Math.round(Math.max(20, Math.min(200, rob))),
    });
  }
  return data;
}
