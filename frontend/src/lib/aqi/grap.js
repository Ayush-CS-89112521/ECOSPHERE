const STAGES = [
  {
    stage: 0,
    label: 'Normal / Below GRAP',
    aqiMin: 0,
    aqiMax: 200,
    restrictions: ['Standard dust-control measures at construction sites.', 'Routine mechanized road sweeping.'],
    citizenActions: ['Maintain vehicle emission certificates.', 'Properly dispose of municipal solid waste.'],
  },
  {
    stage: 1,
    label: 'Stage I (Poor)',
    aqiMin: 201,
    aqiMax: 300,
    restrictions: [
      'Strict ban on open burning of biomass and municipal solid waste.',
      'Water sprinkling on unpaved roads and construction sites.',
      'Strict enforcement of PUC norms for vehicles.',
    ],
    citizenActions: [
      'Keep vehicle engines properly tuned and tyres inflated.',
      'Avoid idling engines at traffic signals.',
      'Report open burning on the 311 app.',
    ],
  },
  {
    stage: 2,
    label: 'Stage II (Very Poor)',
    aqiMin: 301,
    aqiMax: 400,
    restrictions: [
      'Restrictions on diesel generator (DG) sets, except for essential services.',
      'Higher parking fees to discourage private vehicle use.',
      'More frequent CNG/electric bus and metro services.',
      'Ban on coal and firewood for tandoors in hotels and restaurants.',
    ],
    citizenActions: [
      'Prefer metro, bus or carpooling over private cars.',
      'Avoid running DG sets; use grid power or inverters.',
    ],
  },
  {
    stage: 3,
    label: 'Stage III (Severe)',
    aqiMin: 401,
    aqiMax: 450,
    restrictions: [
      'Ban on non-essential construction and demolition activities.',
      'Strict restrictions on BS-III petrol and BS-IV diesel LMVs.',
      'Intensified mechanized road sweeping and water washing.',
      'Stone crushers and brick kilns ordered shut.',
    ],
    citizenActions: [
      'Sensitive groups should stay indoors.',
      'Work from home where feasible.',
      'Wear N95/N99 respirators when outdoors.',
    ],
  },
  {
    stage: 4,
    label: 'Stage IV (Severe+)',
    aqiMin: 451,
    aqiMax: 9999,
    restrictions: [
      'Ban on entry of non-essential trucks into Delhi.',
      'Ban on construction for public projects (highways, flyovers, power lines).',
      'Discretionary hybrid/remote instruction for educational institutions.',
      'Public, municipal, and private offices advised to operate at 50% capacity.',
    ],
    citizenActions: [
      'Children, elderly, and those with respiratory illness must remain indoors.',
      'Minimize all outdoor exertion.',
    ],
  },
];

export function determineGrapStage(aqi) {
  if (aqi == null) return null;
  const match = STAGES.find((s) => aqi >= s.aqiMin && aqi <= s.aqiMax) || STAGES[STAGES.length - 1];
  const next = STAGES.find((s) => s.stage === match.stage + 1);

  return {
    stage: match.stage,
    label: match.label,
    aqiBand: `AQI ${match.aqiMin}-${match.aqiMax > 1000 ? '+' : match.aqiMax}`,
    indicative: true,
    restrictions: match.restrictions,
    citizenActions: match.citizenActions,
    inheritsFromLowerStages: match.stage > 1,
    nextStageIn: next ? next.aqiMin - aqi : null,
    nextStageLabel: next ? next.label : null,
  };
}

export const getGrapStage = determineGrapStage;

export default { determineGrapStage, getGrapStage };
