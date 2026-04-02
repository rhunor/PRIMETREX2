/* =============================================
   PRIMETREX INDICES CALCULATOR — script.js
   ============================================= */

// ── Instrument configurations (original logic preserved) ─────────────────────
const instruments = {
    'V10':        { minLot: 0.5,   unitsPerPip: 10 },
    'V10_1S':     { minLot: 0.5,   unitsPerPip: 10 },
    'V100':       { minLot: 1,     unitsPerPip: 10 },
    'V100_1S':    { minLot: 1,     unitsPerPip: 10 },
    'V25':        { minLot: 0.5,   unitsPerPip: 10 },
    'V25_1S':     { minLot: 0.005, unitsPerPip: 10 },
    'V75':        { minLot: 0.001, unitsPerPip: 10 },
    'V75_1S':     { minLot: 0.05,  unitsPerPip: 10 },
    'V50':        { minLot: 4,     unitsPerPip: 1  },
    'V50_1S':     { minLot: 0.005, unitsPerPip: 10 },
    'V5':         { minLot: 0.05,  unitsPerPip: 10 },
    'V5_1S':      { minLot: 0.05,  unitsPerPip: 10 },
    'JUMP_10':    { minLot: 0.01,  unitsPerPip: 10 },
    'JUMP_100':   { minLot: 0.1,   unitsPerPip: 10 },
    'JUMP_75':    { minLot: 0.01,  unitsPerPip: 10 },
    'JUMP_50':    { minLot: 0.01,  unitsPerPip: 10 },
    'JUMP_25':    { minLot: 0.01,  unitsPerPip: 10 },
    'STEP_INDEX': { minLot: 0.1,   unitsPerPip: 1  },
    'STEP_200':   { minLot: 0.1,   unitsPerPip: 1  },
    'STEP_300':   { minLot: 0.1,   unitsPerPip: 1  },
    'STEP_400':   { minLot: 0.1,   unitsPerPip: 1  },
    'STEP_500':   { minLot: 0.1,   unitsPerPip: 1  },
};

// ── State ─────────────────────────────────────────────────────────────────────
let isFixedAmount = false; // false = percentage, true = fixed dollar

// ── DOM References ────────────────────────────────────────────────────────────
const form             = document.getElementById('syntheticForm');
const instrumentSelect = document.getElementById('instrument');
const instrumentInfo   = document.getElementById('instrumentInfo');
const accountSizeInput = document.getElementById('accountSize');
const riskValueInput   = document.getElementById('riskValue');
const riskTypeDisplay  = document.getElementById('riskTypeDisplay');
const resultContainer  = document.getElementById('resultContainer');

// Risk toggle (new style — same as forex mode switch)
const riskSwitchTrack  = document.getElementById('riskSwitchTrack');
const riskLabelPct     = document.getElementById('riskLabelPct');
const riskLabelFixed   = document.getElementById('riskLabelFixed');

// ── Instrument info on select ─────────────────────────────────────────────────
instrumentSelect.addEventListener('change', function () {
    const key = this.value;
    if (key && instruments[key]) {
        const cfg = instruments[key];
        document.getElementById('minLotSize').textContent = cfg.minLot;
        document.getElementById('pipCalc').textContent    =
            `${cfg.unitsPerPip} unit${cfg.unitsPerPip > 1 ? 's' : ''} = 1 pip`;
        instrumentInfo.classList.add('show');
    } else {
        instrumentInfo.classList.remove('show');
    }
    hideResult();
});

// ── Risk Type Toggle ──────────────────────────────────────────────────────────
function setRiskMode(fixedMode) {
    isFixedAmount = fixedMode;
    hideResult();

    if (isFixedAmount) {
        riskSwitchTrack.classList.add('toggled');
        riskLabelFixed.classList.add('active');
        riskLabelPct.classList.remove('active');
        riskTypeDisplay.textContent  = '$';
        riskValueInput.placeholder   = 'Enter fixed dollar amount';
    } else {
        riskSwitchTrack.classList.remove('toggled');
        riskLabelPct.classList.add('active');
        riskLabelFixed.classList.remove('active');
        riskTypeDisplay.textContent  = '%';
        riskValueInput.placeholder   = 'Enter percentage (e.g., 2)';
    }
    riskValueInput.value = '';
}

riskSwitchTrack.addEventListener('click', () => setRiskMode(!isFixedAmount));
riskLabelPct.addEventListener('click',    () => setRiskMode(false));
riskLabelFixed.addEventListener('click',  () => setRiskMode(true));
setRiskMode(false); // initialise

// ── Helper ────────────────────────────────────────────────────────────────────
function hideResult() {
    resultContainer.classList.remove('show');
}

// ── Form Submission (original calculation logic preserved) ────────────────────
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const selectedKey = instrumentSelect.value;
    if (!selectedKey) { alert('Please select an instrument.'); return; }

    const cfg         = instruments[selectedKey];
    const accountSize = parseFloat(accountSizeInput.value);
    const riskValue   = parseFloat(riskValueInput.value);
    const entryPrice  = parseFloat(document.getElementById('entryPrice').value);
    const stopLoss    = parseFloat(document.getElementById('stopLossPrice').value);

    if (isNaN(entryPrice) || isNaN(stopLoss) || entryPrice === stopLoss) {
        alert('Please enter valid and different entry and stop loss prices.');
        return;
    }

    // Risk in dollars
    const riskInDollars = isFixedAmount
        ? riskValue
        : (accountSize * riskValue) / 100;

    if (isNaN(riskInDollars) || riskInDollars <= 0) {
        alert('Please enter a valid risk amount.');
        return;
    }

    // UNIT = absolute price difference
    const unitDiff = Math.abs(entryPrice - stopLoss);

    // Convert UNIT to SL PIPS based on instrument
    const slPips = unitDiff / cfg.unitsPerPip;

    // Lot size: RISK / (SL PIPS × 10)  — original formula
    const lotSize = riskInDollars / (slPips * 10);

    // Display
    document.getElementById('instrumentBadge').textContent = selectedKey.replace('_', ' ');
    document.getElementById('unitDiff').textContent        = unitDiff.toFixed(2);
    document.getElementById('slPips').textContent          = slPips.toFixed(2);
    document.getElementById('riskAmount').textContent      = '$' + riskInDollars.toFixed(2);
    document.getElementById('lotSize').textContent         = lotSize.toFixed(3);

    resultContainer.classList.add('show');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ── Reset result on any input change ─────────────────────────────────────────
form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', function () {
        if (this.id !== 'instrument') hideResult();
    });
});
