import {availableLanes, encodeWorkshopFragment, moveWorkshopCard, validateWorkshop} from './vendor/workshop-model.mjs'

export const museumLoans = validateWorkshop({
  version: 1,
  title: 'Loans for the shoreline case',
  lanes: [
    {id:'store', label:'Available objects'},
    {id:'case', label:'Two mounts', capacity:2},
  ],
  cards: [
    {id:'shell', label:'Carved shell', laneId:'store'},
    {id:'lamp', label:'Tin lantern', laneId:'store'},
    {id:'chart', label:'Star chart', laneId:'store'},
  ],
})

export function museumLoanURL(board) {
  return 'https://app.slatebox.com/new/workshop' + encodeWorkshopFragment(board)
}

function mountExample(root) {
  let board = museumLoans
  const controls = [...root.querySelectorAll('button[data-card]')]
  const capacity = board.lanes.find(lane => lane.id === 'case').capacity
  const slots = [...root.querySelectorAll('[data-mount]')]
  const status = root.querySelector('output')
  const link = root.querySelector('[data-open-workshop]')
  function render() {
    const mounted = board.cards.filter(card => card.laneId === 'case')
    slots.forEach((slot,index) => {
      const item = mounted[index]
      slot.querySelector('use').setAttribute('href', '#' + (item?.id || 'vacant') + '-print')
      slot.querySelector('span').textContent = item?.label || 'Vacant mount'
      slot.toggleAttribute('data-occupied', Boolean(item))
    })
    controls.forEach(button => {
      const card = board.cards.find(item => item.id === button.dataset.card)
      const installed = card.laneId === 'case'
      const next = installed ? 'store' : 'case'
      const available = availableLanes(board, card).some(lane => lane.id === next)
      button.disabled = !available
      button.textContent = installed ? 'Return' : 'Mount'
      button.setAttribute('aria-label', (installed ? 'Return ' : 'Mount ') + card.label)
    })
    status.textContent = mounted.length === capacity ? 'Both mounts occupied' : (capacity - mounted.length) + (mounted.length ? ' mount free' : ' mounts free')
    link.href = museumLoanURL(board)
  }
  controls.forEach(button => button.addEventListener('click', () => {
    const card = board.cards.find(item => item.id === button.dataset.card)
    board = moveWorkshopCard(board, card.id, card.laneId === 'store' ? 'case' : 'store')
    render()
  }))
  render()
}

if (typeof document !== 'undefined') {
  const example = document.querySelector('[data-museum-loans]')
  if (example) mountExample(example)
}
