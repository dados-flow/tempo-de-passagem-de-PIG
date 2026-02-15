// === Constantes ===
const ATM_TO_PSI = 14.695948775513449; // 1 atm em psi
const KELVIN_NORMAL = 293.15;          // 20°C em K
const Z_NORMAL = 0.99714;               // Z da planilha
const KGF_CM2_TO_PSI = 14.2233;         // kgf/cm² -> psi
const PSI_TO_PA = 6894.757293168;       // psi -> Pa
const PI = 3.14159;                     // valor de PI usado na planilha
const F_E_RO = 18.4324;
const R_UNIVERSAL = 8314.5;
const DENS_REF = 15.7654;
const MPS_TO_FTPS = 3.28084;

function zFactorFromKgfcm2(p_kgf_cm2){
  const p_psi = p_kgf_cm2 * KGF_CM2_TO_PSI; // E13
  return -0.000125844027431883 * p_psi + 0.999888984628099; // C17/C18
}

function calcular(){
  const inputs = ['C14','E17','E18','I11','K20','L11','M11'].reduce((o,id)=>{o[id]=parseFloat(document.getElementById(id).value);return o;},{});

  const errs = [];
  if(!(inputs.C14>-273.15)) errs.push('Temperatura inválida.');
  if(!(inputs.E17>0)) errs.push('Pressão de entrada (E17) deve ser > 0.');
  if(!(inputs.E18>0)) errs.push('Pressão de saída (E18) deve ser > 0.');
  if(!(inputs.I11>0)) errs.push('Vazão (I11) deve ser > 0.');
  if(!(inputs.K20>0)) errs.push('Comprimento (K20) deve ser > 0.');
  if(!(inputs.L11>0)) errs.push('Diâmetro externo (L11) deve ser > 0.');
  if(!(inputs.M11>0)) errs.push('Espessura (M11) deve ser > 0.');

  const diam_int_m = (inputs.L11 * 0.0254) - 2 * inputs.M11 / 1000.0;
  if(!(diam_int_m>0)) errs.push('O diâmetro interno ficaria ≤ 0. Ajuste L11/M11.');

  const resBox = document.getElementById('res');
  if(errs.length){
    alert(errs.join('\n'));
    resBox.hidden = false;
    document.getElementById('tempoFmt').textContent = '--h--m';
    return;
  }

  const C15 = inputs.C14 + 273.15;              // K
  const E13_in = inputs.E17 * KGF_CM2_TO_PSI;   // psi
  const E13_out = inputs.E18 * KGF_CM2_TO_PSI;  // psi

  const C17 = zFactorFromKgfcm2(inputs.E17);
  const C18 = zFactorFromKgfcm2(inputs.E18);

  // Vazões reais (MMm3/d)
  const J11 = (ATM_TO_PSI * inputs.I11 * C15 * C17) / (E13_in * KELVIN_NORMAL * Z_NORMAL);
  const K11 = (ATM_TO_PSI * inputs.I11 * C15 * C18) / (E13_out * KELVIN_NORMAL * Z_NORMAL);

  // Área e velocidades (m/s)
  const area_m2 = ((inputs.L11 * 0.0254 - 2 * inputs.M11 / 1000.0) ** 2) * PI / 4.0;
  const J15 = ((J11/86400.0) * 1_000_000.0) / area_m2;
  const K15 = ((K11/86400.0) * 1_000_000.0) / area_m2;

  // Tempo (h) usando velocidade média
  const v_med = (J15 + K15) / 2.0;
  const time_h = inputs.K20 / v_med / 3.6;

  // K19 (horas inteiras) e L19 (minutos) -> formato xxhxxm
  const K19 = Math.trunc(time_h);
  const L19 = (time_h - K19) * 60.0;
  const mRound = Math.round(L19);
  const hh = K19 + Math.floor(mRound / 60);
  const mm = mRound % 60;
  const mm2d = String(mm).padStart(2, '0');

  document.getElementById('tempoFmt').textContent = `${hh}h${mm2d}m`;
  resBox.hidden = false;
}

document.getElementById('btn').addEventListener('click', calcular);
