/* =============================================
   PRIMETREX FOREX CALCULATOR — script.js
   ============================================= */

/*
  ══════════════════════════════════════════════════════════════════
  PIPS MODE  (original logic — untouched)
  ──────────────────────────────────────────────────────────────────
    GOLD        pipMultiplier = 1      → risk / slPips
    CURRENCY    pipMultiplier = 10     → risk / (slPips × 10)
    BTC         pipMultiplier = 1      → risk / slPips
    ETH         pipMultiplier = 0.1    → risk / (slPips × 0.1)
    NAS100      pipMultiplier = 1      → risk / slPips
    US30        pipMultiplier = 10     → risk / (slPips × 10)
    GER40       pipMultiplier = 10     → risk / (slPips × 10)
    OIL         pipMultiplier = 10     → risk / (slPips × 10)

  ══════════════════════════════════════════════════════════════════
  PRICE MODE  (price mode only)
  ──────────────────────────────────────────────────────────────────
  GOLD:         price diff 1 = 10 pips   pipsPerPriceUnit=10,    pricePipMultiplier=1
  USD Pairs:    1 pip = 0.0001           pipsPerPriceUnit=10000, pricePipMultiplier=10
  JPY Pairs:    1 pip = 0.01             pipsPerPriceUnit=100,   pricePipMultiplier=10
  BTC:          1 price unit = 1 pip     pipsPerPriceUnit=1,     pricePipMultiplier=1
  ══════════════════════════════════════════════════════════════════
*/

const INSTRUMENT_CONFIG = {
    GOLD:         { name: 'GOLD',       pipMultiplier: 1,    pipsPerPriceUnit: 10,    pricePipMultiplier: 1    },
    CURRENCY_USD: { name: 'USD PAIR',   pipMultiplier: 10,   pipsPerPriceUnit: 10000, pricePipMultiplier: 10   },
    CURRENCY_JPY: { name: 'JPY PAIR',   pipMultiplier: 10,   pipsPerPriceUnit: 100,   pricePipMultiplier: 10   },
    BTC:          { name: 'BITCOIN',    pipMultiplier: 1,    pipsPerPriceUnit: 1,     pricePipMultiplier: 1    },
    ETH:          { name: 'ETHEREUM',   pipMultiplier: 0.1,  pipsPerPriceUnit: 1,     pricePipMultiplier: 0.1  },
    NAS100:       { name: 'NASDAQ 100', pipMultiplier: 1,    pipsPerPriceUnit: 1,     pricePipMultiplier: 1    },
    US30:         { name: 'US30',       pipMultiplier: 10,   pipsPerPriceUnit: 1,     pricePipMultiplier: 10   },
    GER40:        { name: 'GER40',      pipMultiplier: 10,   pipsPerPriceUnit: 1,     pricePipMultiplier: 10   },
    OIL:          { name: 'OIL',        pipMultiplier: 10,   pipsPerPriceUnit: 1,     pricePipMultiplier: 10   },
};

// ── State ─────────────────────────────────────────────────────────────────────
let isPriceMode   = false;
let isFixedAmount = false;

// ── DOM References ────────────────────────────────────────────────────────────
const form               = document.getElementById('forexForm');
const riskTypeDisplay    = document.getElementById('riskTypeDisplay');
const riskValueInput     = document.getElementById('riskValue');
const accountSizeInput   = document.getElementById('accountSize');
const resultContainer    = document.getElementById('resultContainer');
const tradingPairSelect  = document.getElementById('tradingPair');
const instrumentBadge    = document.getElementById('instrumentBadge');

// Pips/Price mode switch
const modeSwitchTrack    = document.getElementById('modeSwitchTrack');
const modeLabelPips      = document.getElementById('modeLabelPips');
const modeLabelPrice     = document.getElementById('modeLabelPrice');
const modeDescription    = document.getElementById('modeDescription');

// Risk type switch
const riskSwitchTrack    = document.getElementById('riskSwitchTrack');
const riskLabelPct       = document.getElementById('riskLabelPct');
const riskLabelFixed     = document.getElementById('riskLabelFixed');

// Field groups
const pipsModeFields     = document.getElementById('pipsModeFields');
const priceModeFields    = document.getElementById('priceModeFields');
const priceResultRows    = document.getElementById('priceResultRows');

const slPipsInput        = document.getElementById('slPips');
const entryPriceInput    = document.getElementById('entryPrice');
const stopLossPriceInput = document.getElementById('stopLossPrice');

// ── Pips / Price Mode Switch ──────────────────────────────────────────────────
function setMode(priceMode) {
    isPriceMode = priceMode;
    hideResult();
    if (isPriceMode) {
        modeSwitchTrack.classList.add('price-active');
        modeLabelPrice.classList.add('active');
        modeLabelPips.classList.remove('active');
        modeDescription.textContent = 'Enter entry & stop loss prices';
        pipsModeFields.classList.add('hidden');
        priceModeFields.classList.remove('hidden');
        slPipsInput.removeAttribute('required');
        entryPriceInput.setAttribute('required', 'required');
        stopLossPriceInput.setAttribute('required', 'required');
    } else {
        modeSwitchTrack.classList.remove('price-active');
        modeLabelPips.classList.add('active');
        modeLabelPrice.classList.remove('active');
        modeDescription.textContent = 'Enter stop loss in pips';
        priceModeFields.classList.add('hidden');
        pipsModeFields.classList.remove('hidden');
        entryPriceInput.removeAttribute('required');
        stopLossPriceInput.removeAttribute('required');
        slPipsInput.setAttribute('required', 'required');
    }
}

modeSwitchTrack.addEventListener('click', () => setMode(!isPriceMode));
modeLabelPips.addEventListener('click',   () => setMode(false));
modeLabelPrice.addEventListener('click',  () => setMode(true));
setMode(false);

// ── Risk Type Switch ──────────────────────────────────────────────────────────
function setRiskMode(fixedMode) {
    isFixedAmount = fixedMode;
    hideResult();
    if (isFixedAmount) {
        riskSwitchTrack.classList.add('toggled');
        riskLabelFixed.classList.add('active');
        riskLabelPct.classList.remove('active');
        riskTypeDisplay.textContent = '$';
        riskValueInput.placeholder  = 'Enter fixed dollar amount';
    } else {
        riskSwitchTrack.classList.remove('toggled');
        riskLabelPct.classList.add('active');
        riskLabelFixed.classList.remove('active');
        riskTypeDisplay.textContent = '%';
        riskValueInput.placeholder  = 'Enter percentage (e.g., 2)';
    }
    riskValueInput.value = '';
}

riskSwitchTrack.addEventListener('click', () => setRiskMode(!isFixedAmount));
riskLabelPct.addEventListener('click',    () => setRiskMode(false));
riskLabelFixed.addEventListener('click',  () => setRiskMode(true));
setRiskMode(false);

// ── Helper ────────────────────────────────────────────────────────────────────
function hideResult() {
    resultContainer.classList.remove('show');
}

// ── Form Submission ───────────────────────────────────────────────────────────
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const tradingPair = tradingPairSelect.value;
    if (!tradingPair) { alert('Please select a trading instrument.'); return; }

    const config      = INSTRUMENT_CONFIG[tradingPair];
    const accountSize = parseFloat(accountSizeInput.value);
    const riskValue   = parseFloat(riskValueInput.value);

    // Risk in dollars
    const riskInDollars = isFixedAmount
        ? riskValue
        : (accountSize * riskValue) / 100;

    if (isNaN(riskInDollars) || riskInDollars <= 0) {
        alert('Please enter a valid risk amount.');
        return;
    }

    let slPips, priceDiff, lotSize;

    if (isPriceMode) {
        // ── PRICE MODE ────────────────────────────────────────────────────────
        const entry = parseFloat(entryPriceInput.value);
        const sl    = parseFloat(stopLossPriceInput.value);

        if (isNaN(entry) || isNaN(sl) || entry === sl) {
            alert('Please enter valid and different entry and stop loss prices.');
            return;
        }

        priceDiff = Math.abs(entry - sl);
        slPips    = priceDiff * config.pipsPerPriceUnit;
        lotSize   = riskInDollars / (slPips * config.pricePipMultiplier);

    } else {
        // ── PIPS MODE (original logic — unchanged) ────────────────────────────
        slPips = parseFloat(slPipsInput.value);
        if (isNaN(slPips) || slPips <= 0) {
            alert('Please enter a valid stop loss in pips (greater than 0).');
            return;
        }
        priceDiff = null;
        lotSize   = riskInDollars / (slPips * config.pipMultiplier);
    }

    // Display
    instrumentBadge.textContent = config.name;
    document.getElementById('riskAmountDisplay').textContent = '$' + riskInDollars.toFixed(2);
    document.getElementById('lotSize').textContent           = lotSize.toFixed(2);

    if (isPriceMode) {
        const diffDecimals = (tradingPair === 'CURRENCY_USD') ? 5
                           : (tradingPair === 'CURRENCY_JPY') ? 3
                           : 2;
        document.getElementById('priceDiff').textContent   = priceDiff.toFixed(diffDecimals);
        document.getElementById('derivedPips').textContent = slPips.toFixed(2);
        priceResultRows.classList.remove('hidden');
    } else {
        priceResultRows.classList.add('hidden');
    }

    resultContainer.classList.add('show');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Reset result on any input change
form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', hideResult);
});
