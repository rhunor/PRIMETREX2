/* =============================================
   PRIMETREX FOREX CALCULATOR — script.js
   ============================================= */

/*
  ══════════════════════════════════════════════════════════════════
  PIPS MODE  (original logic — untouched)
  ──────────────────────────────────────────────────────────────────
  User enters stop loss directly in pips.
  lotSize = riskInDollars / (slPips × pipMultiplier)

    GOLD        pipMultiplier = 1      → risk / slPips
    CURRENCY    pipMultiplier = 10     → risk / (slPips × 10)
    BTC         pipMultiplier = 1      → risk / slPips
    ETH         pipMultiplier = 0.1    → risk / (slPips × 0.1)
    NAS100      pipMultiplier = 1      → risk / slPips
    US30        pipMultiplier = 10     → risk / (slPips × 10)
    GER40       pipMultiplier = 10     → risk / (slPips × 10)
    OIL         pipMultiplier = 10     → risk / (slPips × 10)

  ══════════════════════════════════════════════════════════════════
  PRICE MODE  (new logic — price mode only)
  ──────────────────────────────────────────────────────────────────
  User enters entry price + stop loss price.
  Step 1: priceDiff = |entry − stopLoss|
  Step 2: slPips = priceDiff × pipsPerPriceUnit
  Step 3: lotSize = riskInDollars / (slPips × pricePipMultiplier)

  GOLD (XAU/USD):
    • User rule: price diff of 1 = 10 pips  →  pipsPerPriceUnit = 10
    • pricePipMultiplier = 1  (same formula as pips mode)
    • e.g. entry 3300, SL 3290 → diff=10, slPips=100, lot = risk/100

  USD Currency Pairs (EUR/USD, GBP/USD, AUD/USD, etc.):
    • 1 pip = 0.0001  →  price diff of 1 = 10,000 pips
    • pipsPerPriceUnit = 10,000
    • pricePipMultiplier = 10
    • e.g. entry 1.1050, SL 1.1000 → diff=0.005, slPips=50, lot = risk/(50×10)

  JPY Currency Pairs (USD/JPY, EUR/JPY, GBP/JPY, etc.):
    • 1 pip = 0.01  →  price diff of 1 = 100 pips
    • pipsPerPriceUnit = 100
    • pricePipMultiplier = 10
    • e.g. entry 155.00, SL 154.50 → diff=0.50, slPips=50, lot = risk/(50×10)

  BTC (Bitcoin):
    • Confirmed correct: 1 price unit = 1 pip
    • pipsPerPriceUnit = 1, pricePipMultiplier = 1
    • e.g. entry 95000, SL 94000 → diff=1000, slPips=1000, lot = risk/1000

  ETH, NAS100, US30, GER40, OIL:
    • Same pipsPerPriceUnit = 1 (1 price unit = 1 pip)
    • pricePipMultiplier matches their pips-mode pipMultiplier
  ══════════════════════════════════════════════════════════════════
*/

const INSTRUMENT_CONFIG = {
    // key: {
    //   name, 
    //   pipMultiplier       ← used in PIPS MODE only
    //   pipsPerPriceUnit    ← used in PRICE MODE only (price diff → pips)
    //   pricePipMultiplier  ← used in PRICE MODE only (lot size divisor)
    // }
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
let isPriceMode = false;

// ── DOM References ────────────────────────────────────────────────────────────
const form               = document.getElementById('forexForm');
const riskToggle         = document.getElementById('riskToggle');
const riskTypeDisplay    = document.getElementById('riskTypeDisplay');
const riskValueInput     = document.getElementById('riskValue');
const accountSizeInput   = document.getElementById('accountSize');
const resultContainer    = document.getElementById('resultContainer');
const tradingPairSelect  = document.getElementById('tradingPair');
const instrumentBadge    = document.getElementById('instrumentBadge');

const modeSwitchTrack    = document.getElementById('modeSwitchTrack');
const modeLabelPips      = document.getElementById('modeLabelPips');
const modeLabelPrice     = document.getElementById('modeLabelPrice');
const modeDescription    = document.getElementById('modeDescription');

const pipsModeFields     = document.getElementById('pipsModeFields');
const priceModeFields    = document.getElementById('priceModeFields');
const priceResultRows    = document.getElementById('priceResultRows');

const slPipsInput        = document.getElementById('slPips');
const entryPriceInput    = document.getElementById('entryPrice');
const stopLossPriceInput = document.getElementById('stopLossPrice');

// ── Mode Switch ───────────────────────────────────────────────────────────────
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

// ── Risk Type Toggle ──────────────────────────────────────────────────────────
riskToggle.addEventListener('change', function () {
    riskTypeDisplay.textContent = this.checked ? '$' : '%';
    riskValueInput.placeholder  = this.checked
        ? 'Enter fixed dollar amount'
        : 'Enter percentage (e.g., 2)';
    riskValueInput.value = '';
    hideResult();
});

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
    const isFixed     = riskToggle.checked;
    const riskValue   = parseFloat(riskValueInput.value);

    // ── Risk in dollars ───────────────────────────────────────────────────────
    const riskInDollars = isFixed
        ? riskValue
        : (accountSize * riskValue) / 100;

    if (isNaN(riskInDollars) || riskInDollars <= 0) {
        alert('Please enter a valid risk amount.');
        return;
    }

    let slPips, priceDiff, lotSize;

    if (isPriceMode) {
        // ── PRICE MODE ────────────────────────────────────────────────────────
        // Uses pipsPerPriceUnit + pricePipMultiplier (separate from pips mode)
        const entry = parseFloat(entryPriceInput.value);
        const sl    = parseFloat(stopLossPriceInput.value);

        if (isNaN(entry) || isNaN(sl) || entry === sl) {
            alert('Please enter valid and different entry and stop loss prices.');
            return;
        }

        priceDiff = Math.abs(entry - sl);

        // Convert price difference to pips
        slPips = priceDiff * config.pipsPerPriceUnit;

        // Lot size using price-mode multiplier
        lotSize = riskInDollars / (slPips * config.pricePipMultiplier);

    } else {
        // ── PIPS MODE (original logic — unchanged) ────────────────────────────
        slPips = parseFloat(slPipsInput.value);
        if (isNaN(slPips) || slPips <= 0) {
            alert('Please enter a valid stop loss in pips (greater than 0).');
            return;
        }
        priceDiff = null;

        // Original formula: risk / (slPips × pipMultiplier)
        lotSize = riskInDollars / (slPips * config.pipMultiplier);
    }

    // ── Display results ───────────────────────────────────────────────────────
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

// ── Reset result on any input change ─────────────────────────────────────────
form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', hideResult);
});
