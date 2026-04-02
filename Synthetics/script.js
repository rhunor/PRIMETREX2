// Instrument configurations
const instruments = {
  V10: { minLot: 0.5, unitsPerPip: 10 },
  V10_1S: { minLot: 0.5, unitsPerPip: 10 },
  V100: { minLot: 1, unitsPerPip: 10 },
  V100_1S: { minLot: 1, unitsPerPip: 10 },
  V25: { minLot: 0.5, unitsPerPip: 10 },
  V25_1S: { minLot: 0.005, unitsPerPip: 10 },
  V75: { minLot: 0.001, unitsPerPip: 10 },
  V75_1S: { minLot: 0.05, unitsPerPip: 10 },
  V50: { minLot: 4, unitsPerPip: 1 },
  V50_1S: { minLot: 0.005, unitsPerPip: 10 },
  V5: { minLot: 0.05, unitsPerPip: 10 },
  V5_1S: { minLot: 0.05, unitsPerPip: 10 },
  JUMP_10: { minLot: 0.01, unitsPerPip: 10 },
  JUMP_100: { minLot: 0.1, unitsPerPip: 10 },
  JUMP_75: { minLot: 0.01, unitsPerPip: 10 },
  JUMP_50: { minLot: 0.01, unitsPerPip: 10 },
  JUMP_25: { minLot: 0.01, unitsPerPip: 10 },
  STEP_INDEX: { minLot: 0.1, unitsPerPip: 1 },
  STEP_200: { minLot: 0.1, unitsPerPip: 1 },
  STEP_300: { minLot: 0.1, unitsPerPip: 1 },
  STEP_400: { minLot: 0.1, unitsPerPip: 1 },
  STEP_500: { minLot: 0.1, unitsPerPip: 1 },
}

const form = document.getElementById('syntheticForm')
const riskToggle = document.getElementById('riskToggle')
const riskTypeDisplay = document.getElementById('riskTypeDisplay')
const riskValueInput = document.getElementById('riskValue')
const accountSizeInput = document.getElementById('accountSize')
const resultContainer = document.getElementById('resultContainer')
const instrumentSelect = document.getElementById('instrument')
const instrumentInfo = document.getElementById('instrumentInfo')

// Show instrument info when selected
instrumentSelect.addEventListener('change', function () {
  const selectedInstrument = this.value
  if (selectedInstrument && instruments[selectedInstrument]) {
    const config = instruments[selectedInstrument]
    document.getElementById('minLotSize').textContent = config.minLot
    document.getElementById('pipCalc').textContent =
      `${config.unitsPerPip} unit${config.unitsPerPip > 1 ? 's' : ''} = 1 pip`
    instrumentInfo.classList.add('show')
  } else {
    instrumentInfo.classList.remove('show')
  }
  resultContainer.classList.remove('show')
})

// Update risk type display
riskToggle.addEventListener('change', function () {
  if (this.checked) {
    riskTypeDisplay.textContent = '$'
    riskValueInput.placeholder = 'Enter fixed dollar amount'
  } else {
    riskTypeDisplay.textContent = '%'
    riskValueInput.placeholder = 'Enter percentage (e.g., 2)'
  }
  riskValueInput.value = ''
})

// Form submission
form.addEventListener('submit', function (e) {
  e.preventDefault()

  const selectedInstrument = instrumentSelect.value
  const instrumentConfig = instruments[selectedInstrument]
  const accountSize = parseFloat(accountSizeInput.value)
  const isFixedAmount = riskToggle.checked
  const riskValue = parseFloat(riskValueInput.value)
  const entryPrice = parseFloat(document.getElementById('entryPrice').value)
  const stopLossPrice = parseFloat(
    document.getElementById('stopLossPrice').value,
  )

  // Calculate UNIT (absolute difference between entry and stop loss)
  const unitDiff = Math.abs(entryPrice - stopLossPrice)

  // Convert UNIT to SL PIPS based on instrument
  const slPips = unitDiff / instrumentConfig.unitsPerPip

  // Calculate actual risk in dollars
  let riskInDollars
  if (isFixedAmount) {
    riskInDollars = riskValue
  } else {
    riskInDollars = (accountSize * riskValue) / 100
  }

  // Calculate lot size: RISK / (SL PIPS × 10)
  const lotSize = riskInDollars / (slPips * 10)

  // Display results
  document.getElementById('unitDiff').textContent = unitDiff.toFixed(2)
  document.getElementById('slPips').textContent = slPips.toFixed(2)
  document.getElementById('riskAmount').textContent =
    '$' + riskInDollars.toFixed(2)
  document.getElementById('lotSize').textContent = lotSize.toFixed(3)

  resultContainer.classList.add('show')

  // Smooth scroll to result
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})

// Reset result when inputs change
const inputs = form.querySelectorAll('input, select')
inputs.forEach((input) => {
  input.addEventListener('input', function () {
    if (this.id !== 'instrument') {
      resultContainer.classList.remove('show')
    }
  })
})
