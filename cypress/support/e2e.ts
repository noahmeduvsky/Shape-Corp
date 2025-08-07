// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // for uncaught exceptions in the application
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  return true
})

// Custom commands for ERP system
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select a job by part number
       * @example cy.selectJob('PART-001')
       */
      selectJob(partNumber: string): Chainable<Element>
      
      /**
       * Custom command to create a withdrawal kanban
       * @example cy.createWithdrawalKanban('PART-001', 50, 'end_to_tpa')
       */
      createWithdrawalKanban(partNumber: string, quantity: number, withdrawalType: string): Chainable<Element>
      
      /**
       * Custom command to split a container
       * @example cy.splitContainer('CONT-001', [50, 50])
       */
      splitContainer(serialNumber: string, quantities: number[]): Chainable<Element>
      
      /**
       * Custom command to merge containers
       * @example cy.mergeContainers(['CONT-001', 'CONT-002'], 'new_number')
       */
      mergeContainers(serialNumbers: string[], strategy: string): Chainable<Element>
    }
  }
}
