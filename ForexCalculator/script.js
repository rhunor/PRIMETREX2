const form = document.getElementById('forexForm')
const riskToggle = document.getElementById('riskToggle')
const riskTypeDisplay = document.getElementById('riskTypeDisplay')
const riskValueInput = document.getElementById('riskValue')
const accountSizeInput = document.getElementById('accountSize')
const resultContainer = document.getElementById('resultContainer')
const lotSizeDisplay = document.getElementById('lotSize')
const instrumentBadge = document.getElementById('instrumentBadge')
const tradingPairSelect = document.getElementById('tradingPair')

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

  const tradingPair = tradingPairSelect.value
  const accountSize = parseFloat(accountSizeInput.value)
  const isFixedAmount = riskToggle.checked
  const riskValue = parseFloat(riskValueInput.value)
  const slPips = parseFloat(document.getElementById('slPips').value)

  // Calculate actual risk in dollars
  let riskInDollars
  if (isFixedAmount) {
    riskInDollars = riskValue
  } else {
    riskInDollars = (accountSize * riskValue) / 100
  }

  // Calculate lot size based on instrument type
  let lotSize

  switch (tradingPair) {
    case 'GOLD':
      // GOLD: RISK / SL PIPS
      lotSize = riskInDollars / slPips
      break

    case 'CURRENCY':
      // CURRENCY: RISK / (SL PIPS × 10)
      lotSize = riskInDollars / (slPips * 10)
      break

    case 'BTC':
      // BTC: RISK / SL PIPS
      lotSize = riskInDollars / slPips
      break

    case 'ETH':
      // ETH: RISK / (SL PIPS × 0.1)
      lotSize = riskInDollars / (slPips * 0.1)
      break

    case 'NAS100':
      // NAS100: RISK / (SL PIPS × 10)
      lotSize = riskInDollars / slPips
      break

    case 'US30':
      // US30: RISK / (SL PIPS × 10)
      lotSize = riskInDollars / (slPips * 10)
      break

    case 'GER40':
      // GER40: RISK / (SL PIPS × 10)
      lotSize = riskInDollars / (slPips * 10)
      break

    case 'OIL':
      // OIL: RISK / (SL PIPS × 10)
      lotSize = riskInDollars / (slPips * 10)
      break

    default:
      lotSize = 0
  }

  // Update instrument badge
  const instrumentNames = {
    GOLD: 'GOLD',
    CURRENCY: 'CURRENCY',
    BTC: 'BITCOIN',
    ETH: 'ETHEREUM',
    NAS100: 'NASDAQ 100',
    US30: 'US30',
    GER40: 'GER40',
    OIL: 'OIL',
  }
  instrumentBadge.textContent = instrumentNames[tradingPair]

  // Display result
  lotSizeDisplay.textContent = lotSize.toFixed(2)
  resultContainer.classList.add('show')

  // Smooth scroll to result
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})

// Reset result when inputs change
const inputs = form.querySelectorAll('input, select')
inputs.forEach((input) => {
  input.addEventListener('input', function () {
    resultContainer.classList.remove('show')
  })
})
