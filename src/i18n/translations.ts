export type Lang = 'en' | 'kn';

export const T = {
  // Header
  supervisionMode: { en: 'SUPERVISION MODE', kn: 'ಮೇಲ್ವಿಚಾರಣಾ ಮೋಡ್' },
  investigationMode: { en: 'INVESTIGATION MODE', kn: 'ತನಿಖಾ ಮೋಡ್' },
  karnatakaSP: { en: 'Karnataka State Police', kn: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್' },
  supervision: { en: 'Supervision', kn: 'ಮೇಲ್ವಿಚಾರಣೆ' },
  fullFile: { en: 'Full File', kn: 'ಪೂರ್ಣ ಫೈಲ್' },
  exportReport: { en: 'Export Report', kn: 'ವರದಿ ರಫ್ತು' },
  backToSupervision: { en: 'BACK TO SUPERVISION', kn: 'ಮೇಲ್ವಿಚಾರಣೆಗೆ ಹಿಂದೆ' },
  suspect: { en: 'Suspect', kn: 'ಶಂಕಿತ' },

  // KPI Cards
  totalCases: { en: 'TOTAL CASES', kn: 'ಒಟ್ಟು ಪ್ರಕರಣಗಳು' },
  activeInvestigations: { en: 'ACTIVE INVESTIGATIONS', kn: 'ಸಕ್ರಿಯ ತನಿಖೆಗಳು' },
  highRiskSuspects: { en: 'HIGH RISK SUSPECTS', kn: 'ಅಧಿಕ ಅಪಾಯ ಶಂಕಿತರು' },
  repeatOffenders: { en: 'REPEAT OFFENDERS', kn: 'ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳು' },
  thisWeek: { en: '+12 this week', kn: '+12 ಈ ವಾರ' },
  escalatedToday: { en: '23 escalated today', kn: '23 ಇಂದು ಉಲ್ಬಣಗೊಂಡಿದೆ' },
  atLargeCount: { en: '7 at large', kn: '7 ಓಡಿಹೋಗಿರುವರು' },
  releasedMonth: { en: '12 released this month', kn: '12 ಈ ತಿಂಗಳು ಬಿಡುಗಡೆ' },

  // Map
  crimeHotspotsTitle: { en: 'CRIME HOTSPOTS — BENGALURU', kn: 'ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು — ಬೆಂಗಳೂರು' },
  mapsIntegration: { en: 'Google Maps integration point', kn: 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ಏಕೀಕರಣ ಬಿಂದು' },

  // Crime Trends
  crimeTrendsTitle: { en: 'CRIME TRENDS — LAST 30 DAYS', kn: 'ಅಪರಾಧ ಪ್ರವೃತ್ತಿ — ಕಳೆದ 30 ದಿನಗಳು' },
  cybercrime: { en: 'Cybercrime', kn: 'ಸೈಬರ್ ಅಪರಾಧ' },
  financialFraud: { en: 'Financial Fraud', kn: 'ಆರ್ಥಿಕ ವಂಚನೆ' },
  drugTrafficking: { en: 'Drug Trafficking', kn: 'ಮಾದಕ ವಸ್ತು ಕಳ್ಳಸಾಗಣೆ' },
  robbery: { en: 'Robbery', kn: 'ದರೋಡೆ' },

  // Alerts
  proactiveAlerts: { en: 'PROACTIVE ALERTS', kn: 'ಪ್ರಾಕ್ಟಿವ್ ಎಚ್ಚರಿಕೆಗಳು' },
  alert1Title: { en: 'EMERGING THREAT — Whitefield cluster showing 34% increase in financial fraud. 3 new suspects identified.', kn: 'ಉದಯೋನ್ಮುಖ ಬೆದರಿಕೆ — ವೈಟ್‌ಫೀಲ್ಡ್ ಕ್ಲಸ್ಟರ್ ಆರ್ಥಿಕ ವಂಚನೆಯಲ್ಲಿ 34% ಹೆಚ್ಚಳ. 3 ಹೊಸ ಶಂಕಿತರು ಗುರುತಿಸಲಾಗಿದೆ.' },
  alert2Title: { en: 'REPEAT OFFENDER — R. Mehta (KS1207) last seen Whitefield. Released 8 months ago.', kn: 'ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ — R. ಮೆಹ್ತಾ (KS1207) ಕೊನೆಯದಾಗಿ ವೈಟ್‌ಫೀಲ್ಡ್‌ನಲ್ಲಿ ಕಂಡಿದ್ದಾರೆ. 8 ತಿಂಗಳ ಹಿಂದೆ ಬಿಡುಗಡೆ.' },
  alert3Title: { en: 'PATTERN DETECTED — 12 cybercrime complaints from Koramangala in 48 hours. Possible coordinated attack.', kn: 'ಮಾದರಿ ಪತ್ತೆ — 48 ಗಂಟೆಗಳಲ್ಲಿ ಕೋರಮಂಗಲದಿಂದ 12 ಸೈಬರ್ ಅಪರಾಧ ದೂರುಗಳು. ಸಂಘಟಿತ ದಾಳಿ ಸಾಧ್ಯತೆ.' },

  // Investigation Summary
  caseConfidence: { en: 'CASE CONFIDENCE', kn: 'ಪ್ರಕರಣ ವಿಶ್ವಾಸ' },
  evidenceNodes: { en: 'EVIDENCE NODES', kn: 'ಸಾಕ್ಷ್ಯ ನೋಡ್‌ಗಳು' },
  riskLevel: { en: 'RISK LEVEL', kn: 'ಅಪಾಯ ಮಟ್ಟ' },
  associates: { en: 'ASSOCIATES', kn: 'ಸಹಚರರು' },
  recommendedAction: { en: 'RECOMMENDED ACTION', kn: 'ಶಿಫಾರಸು ಕ್ರಮ' },
  monitorTransactions: { en: 'Monitor Transactions', kn: 'ವಹಿವಾಟು ಮೇಲ್ವಿಚಾರಣೆ' },
  high: { en: 'HIGH', kn: 'ಹೆಚ್ಚು' },

  // Evidence Chain
  evidenceChain: { en: 'EVIDENCE CHAIN', kn: 'ಸಾಕ್ಷ್ಯ ಸರಣಿ' },
  evidenceItems: { en: 'items · avg 88% confidence', kn: 'ಐಟಂಗಳು · ಸರಾಸರಿ 88% ವಿಶ್ವಾಸ' },

  // Gang
  gangStructure: { en: 'GANG STRUCTURE', kn: 'ಗ್ಯಾಂಗ್ ರಚನೆ' },
  members: { en: 'members', kn: 'ಸದಸ್ಯರು' },
  clickForFile: { en: 'Click any member to open their full intelligence file', kn: 'ಯಾವುದೇ ಸದಸ್ಯರ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಅವರ ಸಂಪೂರ್ಣ ಗುಪ್ತಚರ ಫೈಲ್ ತೆರೆಯಿರಿ' },

  // AI Recommendation
  aiRecommendation: { en: 'AI RECOMMENDATION', kn: 'AI ಶಿಫಾರಸು' },
  aiRecommendationText: { en: 'Monitor financial transactions immediately. Cross-reference CCTV from Indiranagar node with phone records. Coordinate with Cybercrime Cell for digital money trail. High-probability next contact: S. Khan (IN CUSTODY — opportunity to extract further intelligence).', kn: 'ತಕ್ಷಣ ಹಣಕಾಸು ವಹಿವಾಟು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ. ಇಂದಿರಾನಗರ ನೋಡ್‌ನಿಂದ CCTV ಅನ್ನು ಫೋನ್ ದಾಖಲೆಗಳೊಂದಿಗೆ ಸರ್ಕ್ರಾಸ್-ಉಲ್ಲೇಖಿಸಿ. ಡಿಜಿಟಲ್ ಹಣ ಪ್ರದೇಶಕ್ಕಾಗಿ ಸೈಬರ್ ಅಪರಾಧ ಕೋಶದೊಂದಿಗೆ ಸಮನ್ವಯ ಮಾಡಿ. ಹೆಚ್ಚಿನ ಸಂಭಾವ್ಯ ಮುಂದಿನ ಸಂಪರ್ಕ: S. ಖಾನ್ (ಬಂಧನದಲ್ಲಿ — ಹೆಚ್ಚಿನ ಗುಪ್ತಚರ ಸಂಗ್ರಹಿಸಲು ಅವಕಾಶ).' },
  assignPatrol: { en: 'Assign Patrol Unit', kn: 'ಗಸ್ತು ತಂಡ ನಿಯೋಜಿಸಿ' },
  flagHighRisk: { en: 'Flag High-Risk', kn: 'ಅಧಿಕ ಅಪಾಯ ಫ್ಲ್ಯಾಗ್' },
  notifyCybercrime: { en: 'Notify Cybercrime Cell', kn: 'ಸೈಬರ್ ಅಪರಾಧ ಕೋಶಕ್ಕೆ ತಿಳಿಸಿ' },
  generateReport: { en: 'Generate Report', kn: 'ವರದಿ ರಚಿಸಿ' },

  // Status badges
  highRisk: { en: 'HIGH RISK', kn: 'ಅಧಿಕ ಅಪಾಯ' },
  atLarge: { en: 'AT LARGE', kn: 'ಪರಾರಿ' },
  inCustody: { en: 'IN CUSTODY', kn: 'ಬಂಧನದಲ್ಲಿ' },
  monitoring: { en: 'MONITORING', kn: 'ಮೇಲ್ವಿಚಾರಣೆ' },
  unknown: { en: 'UNKNOWN', kn: 'ಅಜ್ಞಾತ' },
  wanted: { en: 'WANTED', kn: 'ಬೇಕಾಗಿದೆ' },
  active: { en: 'ACTIVE', kn: 'ಸಕ್ರಿಯ' },
  underReview: { en: 'UNDER REVIEW', kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿ' },
  convicted: { en: 'CONVICTED', kn: 'ದೋಷಿ' },
  closed: { en: 'CLOSED', kn: 'ಮುಚ್ಚಲಾಗಿದೆ' },

  // Profile
  knownAssociates: { en: 'KNOWN ASSOCIATES', kn: 'ತಿಳಿದ ಸಹಚರರು' },
  priorArrests: { en: 'PRIOR ARRESTS', kn: 'ಹಿಂದಿನ ಬಂಧನಗಳು' },
  activeCases: { en: 'ACTIVE CASES', kn: 'ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು' },
  linkedCases: { en: 'LINKED CASES', kn: 'ಸಂಪರ್ಕಿತ ಪ್ರಕರಣಗಳು' },
  lastSeen: { en: 'Last seen:', kn: 'ಕೊನೆಯದಾಗಿ ಕಂಡದ್ದು:' },
  connectedCrimes: { en: 'CONNECTED CRIMES', kn: 'ಸಂಪರ್ಕಿತ ಅಪರಾಧಗಳು' },
  detentionTimeline: { en: 'DETENTION TIMELINE', kn: 'ಬಂಧನ ಸಮಯರೇಖೆ' },
  offenderFootprint: { en: 'OFFENDER FOOTPRINT', kn: 'ಅಪರಾಧಿ ಹೆಜ್ಜೆ ಗುರುತು' },
  syntheticId: { en: 'SYNTHETIC ID', kn: 'ಸಿಂಥೆಟಿಕ್ ID' },
  imprisonedLabel: { en: '18mo imprisoned', kn: '18 ತಿಂಗಳು ಕಾರಾಗೃಹ' },
  freeLabel: { en: 'Free 27mo+', kn: '27+ ತಿಂಗಳು ಮುಕ್ತ' },
  releasedOn: { en: 'Released on: Money Laundering (PoCA) charge — completed sentence', kn: 'ಬಿಡುಗಡೆ: ಹಣ ಅಕ್ರಮ ಚಲಾವಣೆ (PoCA) ಆಪಾದನೆ — ಶಿಕ್ಷೆ ಪೂರ್ಣ' },

  // Agent names
  routerAgent: { en: 'Router Agent', kn: 'ರೂಟರ್ ಏಜೆಂಟ್' },
  suspectAgent: { en: 'Suspect Agent', kn: 'ಶಂಕಿತ ಏಜೆಂಟ್' },
  caseAgent: { en: 'Case Agent', kn: 'ಪ್ರಕರಣ ಏಜೆಂಟ್' },
  evidenceAgent: { en: 'Evidence Agent', kn: 'ಸಾಕ್ಷ್ಯ ಏಜೆಂಟ್' },
  networkAgent: { en: 'Network Agent', kn: 'ನೆಟ್‌ವರ್ಕ್ ಏಜೆಂಟ್' },
  recommendationAgent: { en: 'Recommendation Agent', kn: 'ಶಿಫಾರಸು ಏಜೆಂಟ್' },

  // Right panel
  conversationalAI: { en: 'CONVERSATIONAL AI', kn: 'ಸಂವಾದ AI' },
  policeIntelligence: { en: 'Police Intelligence Analysis', kn: 'ಪೊಲೀಸ್ ಗುಪ್ತಚರ ವಿಶ್ಲೇಷಣೆ' },
  online: { en: 'ONLINE', kn: 'ಆನ್‌ಲೈನ್' },
  quickPrompts: { en: 'QUICK PROMPTS', kn: 'ತ್ವರಿತ ಪ್ರಾಂಪ್ಟ್‌ಗಳು' },
  showEmergingThreats: { en: 'Show emerging threats', kn: 'ಉದಯೋನ್ಮುಖ ಬೆದರಿಕೆಗಳು' },
  activeCasesToday: { en: 'Active cases today', kn: 'ಇಂದಿನ ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು' },
  whitefieldHotspots: { en: 'Whitefield hotspots', kn: 'ವೈಟ್‌ಫೀಲ್ಡ್ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು' },
  recentArrests: { en: 'Recent arrests', kn: 'ಇತ್ತೀಚಿನ ಬಂಧನಗಳು' },
  inputPlaceholder: { en: 'Ask anything about a suspect, case, or crime pattern...', kn: 'ಶಂಕಿತ, ಪ್ರಕರಣ ಅಥವಾ ಅಪರಾಧ ಮಾದರಿಯ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ...' },
  analyze: { en: 'Analyze', kn: 'ವಿಶ್ಲೇಷಿಸಿ' },
  voice: { en: 'Voice', kn: 'ಧ್ವನಿ' },

  // Investigation Mode Activated
  investigationModeActivated: { en: 'INVESTIGATION MODE ACTIVATED', kn: 'ತನಿಖಾ ಮೋಡ್ ಸಕ್ರಿಯಗೊಂಡಿದೆ' },
  voiceInvestigationMode: { en: 'VOICE INVESTIGATION MODE', kn: 'ಧ್ವನಿ ತನಿಖಾ ಮೋಡ್' },

  // Voice
  listenGreeting: { en: "Yes, Officer. I'm listening — go ahead.", kn: 'ಹೌದು ಸರ್, ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ — ಮುಂದುವರಿಸಿ.' },
  listeningStatus: { en: 'Listening... Speak now', kn: 'ಕೇಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ' },
  transcribing: { en: 'Transcribing...', kn: 'ಲಿಪ್ಯಂತರಣ...' },
  processing: { en: 'Processing...', kn: 'ಪ್ರಕ್ರಿಯೆ...' },

  // Drawers
  openFullInvestigation: { en: 'Open Full Investigation', kn: 'ಸಂಪೂರ್ಣ ತನಿಖೆ ತೆರೆಯಿರಿ' },
  flagReexamination: { en: 'Flag for Re-examination', kn: 'ಮರು-ಪರೀಕ್ಷೆಗಾಗಿ ಫ್ಲ್ಯಾಗ್' },
  whyThisMatters: { en: 'WHY THIS MATTERS', kn: 'ಇದು ಏಕೆ ಮುಖ್ಯ' },
  description: { en: 'DESCRIPTION', kn: 'ವಿವರಣೆ' },
  officerHandling: { en: 'Officer handling', kn: 'ನಿರ್ವಹಿಸುವ ಅಧಿಕಾರಿ' },
  casesLinked: { en: 'Cases linked', kn: 'ಸಂಪರ್ಕಿತ ಪ್ರಕರಣಗಳು' },
  suspectsLinked: { en: 'Suspects linked', kn: 'ಸಂಪರ್ಕಿತ ಶಂಕಿತರು' },

  // Workspaces
  recentArrestsTitle: { en: 'RECENT ARRESTS', kn: 'ಇತ್ತೀಚಿನ ಬಂಧನಗಳು' },
  casesFiledToday: { en: 'CASES FILED TODAY', kn: 'ಇಂದು ದಾಖಲಾದ ಪ್ರಕರಣಗಳು' },
  casesFiledHeader: { en: '6 CASES FILED TODAY — 13:00 to current', kn: 'ಇಂದು 6 ಪ್ರಕರಣಗಳು ದಾಖಲಾಗಿದೆ — 13:00 ರಿಂದ ಈಗ' },

  // Buttons
  commandSent: { en: 'Command sent to field unit', kn: 'ಕ್ಷೇತ್ರ ತಂಡಕ್ಕೆ ಆದೇಶ ಕಳುಹಿಸಲಾಗಿದೆ' },
  flagged: { en: 'Case flagged as high-risk', kn: 'ಪ್ರಕರಣ ಅಧಿಕ ಅಪಾಯ ಎಂದು ಫ್ಲ್ಯಾಗ್ ಮಾಡಲಾಗಿದೆ' },
  notified: { en: 'Cybercrime Cell notified', kn: 'ಸೈಬರ್ ಅಪರಾಧ ಕೋಶಕ್ಕೆ ತಿಳಿಸಲಾಗಿದೆ' },
  reportGenerated: { en: 'Report generated', kn: 'ವರದಿ ರಚಿಸಲಾಗಿದೆ' },
  fileNotLoaded: { en: 'Full file not yet loaded. Click to request intelligence.', kn: 'ಸಂಪೂರ್ಣ ಫೈಲ್ ಇನ್ನೂ ಲೋಡ್ ಆಗಿಲ್ಲ. ಗುಪ್ತಚರ ವಿನಂತಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ.' },

  // Roles
  kingpin: { en: 'Kingpin', kn: 'ಕಿಂಗ್‌ಪಿನ್' },
  broker: { en: 'Broker', kn: 'ದಲ್ಲಾಳಿ' },
  operative: { en: 'Operative', kn: 'ಕಾರ್ಯಕರ್ತ' },
  associate: { en: 'Associate', kn: 'ಸಹಚರ' },
  runner: { en: 'Runner', kn: 'ರನ್ನರ್' },
  target: { en: 'TARGET', kn: 'ಗುರಿ' },
  officer: { en: 'Officer', kn: 'ಅಧಿಕಾರಿ' },

  // Case workspace
  caseWorkspace: { en: 'CASE WORKSPACE', kn: 'ಪ್ರಕರಣ ಕಾರ್ಯಕ್ಷೇತ್ರ' },
  evidenceReview: { en: 'EVIDENCE REVIEW', kn: 'ಸಾಕ್ಷ್ಯ ಪರಿಶೀಲನೆ' },
  networkWorkspace: { en: 'NETWORK WORKSPACE', kn: 'ನೆಟ್‌ವರ್ಕ್ ಕಾರ್ಯಕ್ಷೇತ್ರ' },
  trendWorkspace: { en: 'TREND WORKSPACE', kn: 'ಪ್ರವೃತ್ತಿ ಕಾರ್ಯಕ್ಷೇತ್ರ' },
};

export function t(key: keyof typeof T, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}
