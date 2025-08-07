// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to select a job by part number
Cypress.Commands.add('selectJob', (partNumber: string) => {
  cy.get('[role="tab"]').contains('Scheduler').click()
  cy.get('[data-testid="job-item"]').contains(partNumber).click()
})

// Custom command to create a withdrawal kanban
Cypress.Commands.add('createWithdrawalKanban', (partNumber: string, quantity: number, withdrawalType: string) => {
  cy.get('[role="tab"]').contains('Kanbans').click()
  cy.get('[data-testid="create-withdrawal-btn"]').click()
  cy.get('[data-testid="part-number-input"]').type(partNumber)
  cy.get('[data-testid="quantity-input"]').type(quantity.toString())
  cy.get('[data-testid="withdrawal-type-select"]').select(withdrawalType)
  cy.get('[data-testid="create-kanban-btn"]').click()
})

// Custom command to split a container
Cypress.Commands.add('splitContainer', (serialNumber: string, quantities: number[]) => {
  cy.get('[role="tab"]').contains('Containers').click()
  cy.get(`[data-testid="container-${serialNumber}"]`).click()
  cy.get('[data-testid="split-container-btn"]').click()
  
  quantities.forEach((quantity, index) => {
    cy.get(`[data-testid="split-quantity-${index}"]`).type(quantity.toString())
  })
  
  cy.get('[data-testid="confirm-split-btn"]').click()
})

// Custom command to merge containers
Cypress.Commands.add('mergeContainers', (serialNumbers: string[], strategy: string) => {
  cy.get('[role="tab"]').contains('Containers').click()
  
  serialNumbers.forEach(serialNumber => {
    cy.get(`[data-testid="container-${serialNumber}-checkbox"]`).check()
  })
  
  cy.get('[data-testid="merge-strategy-select"]').select(strategy)
  cy.get('[data-testid="merge-containers-btn"]').click()
})

// Custom command to wait for data loading
Cypress.Commands.add('waitForData', () => {
  cy.get('[data-testid="loading-indicator"]').should('not.exist')
  cy.get('[data-testid="job-item"], [data-testid="inventory-item"], [data-testid="order-item"]').should('be.visible')
})

// Custom command to navigate to tab
Cypress.Commands.add('navigateToTab', (tabName: string) => {
  cy.get('[role="tab"]').contains(tabName).click()
  cy.get('[role="tabpanel"]').should('be.visible')
})

// Custom command to check mock data indicator
Cypress.Commands.add('checkMockDataIndicator', () => {
  cy.get('[data-testid="mock-data-indicator"]').should('be.visible')
  cy.get('[data-testid="mock-data-indicator"]').should('contain', 'Using Mock Data')
})

// Override visit to always check for mock data indicator
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  return originalFn(url, options).then(() => {
    // Wait for the page to load and check for mock data indicator
    cy.get('body').should('be.visible')
    cy.checkMockDataIndicator()
  })
})
