import {museumLoans, museumLoanURL} from '../assets/museum-loans.mjs'

const symbols = `<svg width="0" height="0" aria-hidden="true" style="position:absolute">
  <defs>
    <symbol id="shell-print" viewBox="0 0 96 70"><g fill="#d9a88b" stroke="#613e34" stroke-width="1.6">
      <path d="M43 59C30 55 9 40 10 29Q12 21 19 23Q18 15 26 17Q27 9 35 13Q40 5 47 11Q54 5 60 12Q69 9 71 17Q80 14 81 24Q91 23 88 34Q82 46 54 59L55 64H41Z"/>
      <path fill="none" d="M46 58L17 28M47 58L27 19M48 58L36 15M49 58L47 14M50 58L59 15M51 58L69 19M52 58L79 25M53 58L84 33"/></g></symbol>
    <symbol id="lamp-print" viewBox="0 0 96 70"><g stroke="#57452c" stroke-width="2" stroke-linejoin="round">
      <path d="M35 21C31 0 65 0 61 21" fill="none"/><path d="M30 24L37 18H59L66 24L61 28H35Z" fill="#a98b59"/>
      <path d="M35 28H61L58 56H38Z" fill="#dacba7"/><path d="M37 28L57 55M59 28L40 55" fill="none"/>
      <path d="M34 57H62L65 63H31Z" fill="#957644"/><path d="M46 48Q43 44 48 35Q56 46 50 50Z" fill="#a9653c"/></g></symbol>
    <symbol id="chart-print" viewBox="0 0 96 70"><g stroke="#283a42" stroke-width="1.5">
      <path d="M13 14L77 9L83 56L20 62Z" fill="#465b64"/><path d="M24 46L37 32L48 39L60 19L70 30" fill="none" stroke="#d8c69a"/>
      <g fill="#f0dfb5" stroke="none"><circle cx="24" cy="46" r="2.8"/><circle cx="37" cy="32" r="2"/><circle cx="48" cy="39" r="2.5"/><circle cx="60" cy="19" r="2.5"/><circle cx="70" cy="30" r="2"/><circle cx="32" cy="21" r="1"/><circle cx="67" cy="48" r="1.5"/></g></g></symbol>
    <symbol id="vacant-print" viewBox="0 0 96 70"><path d="M30 43v10h36V43M48 53v7m-13 1h26" fill="none" stroke="#839589" stroke-width="2"/></symbol>
  </defs></svg>`

export function museumExample() {
  const rows = museumLoans.cards.map(card => `<li><svg viewBox="0 0 96 70" aria-hidden="true"><use href="#${card.id}-print"></use></svg><span>${card.label}</span><button type="button" data-card="${card.id}" disabled>Mount</button></li>`)
  const mounts = Array.from({length:museumLoans.lanes[1].capacity}, () => '<div data-mount><svg viewBox="0 0 96 70" aria-hidden="true"><use href="#vacant-print"></use></svg><span>Vacant mount</span></div>')
  return `<section class="museum-loans" data-museum-loans aria-label="Museum loans workshop">
    ${symbols}<h2>${museumLoans.title}</h2><div class="loan-layout">
      <div><h3>Collection objects</h3><ul>${rows.join('')}</ul></div>
      <div class="loan-case"><h3>Loan case</h3><div class="mounts">${mounts.join('')}</div><output aria-live="polite">2 mounts free</output></div>
    </div><a class="loan-open" data-open-workshop href="${museumLoanURL(museumLoans)}">Open this slate in Slatebox ↗</a>
    <script type="module" src="/assets/museum-loans.mjs"></script></section>`
}
