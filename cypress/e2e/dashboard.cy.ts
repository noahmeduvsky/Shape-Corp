describe('ERP Dashboard', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the dashboard with mock data indicator', () => {
    cy.get('h1').should('contain', 'PLEX ERP Automation System')
    cy.get('[data-testid="mock-data-indicator"]').should('be.visible')
  })

  it('should display all main sections', () => {
    // Check that all tabs are present
    cy.get('[role="tab"]').should('have.length', 6)
    cy.get('[role="tab"]').should('contain', 'Leveling Board')
    cy.get('[role="tab"]').should('contain', 'Kanbans')
    cy.get('[role="tab"]').should('contain', 'Inventory')
    cy.get('[role="tab"]').should('contain', 'Orders')
    cy.get('[role="tab"]').should('contain', 'Containers')
    cy.get('[role="tab"]').should('contain', 'Scheduler')
  })

  it('should load and display jobs data', () => {
    cy.get('[role="tab"]').contains('Scheduler').click()
    cy.get('[data-testid="job-item"]').should('have.length.at.least', 1)
    cy.get('[data-testid="job-item"]').first().should('contain', 'PART-001')
  })

  it('should allow job priority changes', () => {
    cy.get('[role="tab"]').contains('Scheduler').click()
    cy.get('[data-testid="job-item"]').first().within(() => {
      cy.get('select[data-testid="priority-select"]').select('5')
      cy.get('select[data-testid="priority-select"]').should('have.value', '5')
    })
  })

  it('should allow work center changes', () => {
    cy.get('[role="tab"]').contains('Scheduler').click()
    cy.get('[data-testid="job-item"]').first().within(() => {
      cy.get('select[data-testid="work-center-select"]').select('WC-02')
      cy.get('select[data-testid="work-center-select"]').should('have.value', 'WC-02')
    })
  })

  it('should display inventory data', () => {
    cy.get('[role="tab"]').contains('Inventory').click()
    cy.get('[data-testid="inventory-item"]').should('have.length.at.least', 1)
    cy.get('[data-testid="inventory-item"]').first().should('contain', 'Steel Bracket Assembly')
  })

  it('should display customer orders', () => {
    cy.get('[role="tab"]').contains('Orders').click()
    cy.get('[data-testid="order-item"]').should('have.length.at.least', 1)
    cy.get('[data-testid="order-item"]').first().should('contain', 'CUST-001')
  })

  it('should display containers', () => {
    cy.get('[role="tab"]').contains('Containers').click()
    cy.get('[data-testid="container-item"]').should('have.length.at.least', 1)
    cy.get('[data-testid="container-item"]').first().should('contain', 'CONT-001')
  })

  it('should allow container selection for operations', () => {
    cy.get('[role="tab"]').contains('Containers').click()
    cy.get('[data-testid="container-checkbox"]').first().check()
    cy.get('[data-testid="container-checkbox"]').first().should('be.checked')
  })

  it('should create withdrawal kanban', () => {
    cy.get('[role="tab"]').contains('Kanbans').click()
    cy.get('[data-testid="create-withdrawal-btn"]').click()
    cy.get('[data-testid="part-number-input"]').type('PART-001')
    cy.get('[data-testid="quantity-input"]').type('50')
    cy.get('[data-testid="withdrawal-type-select"]').select('end_to_tpa')
    cy.get('[data-testid="create-kanban-btn"]').click()
    cy.get('[data-testid="kanban-item"]').should('have.length.at.least', 1)
  })

  it('should refresh data when refresh button is clicked', () => {
    cy.get('[data-testid="refresh-btn"]').click()
    cy.get('[data-testid="loading-indicator"]').should('be.visible')
    // Wait for data to reload
    cy.get('[data-testid="job-item"]').should('be.visible')
  })

  it('should handle navigation between tabs smoothly', () => {
    const tabs = ['Leveling Board', 'Kanbans', 'Inventory', 'Orders', 'Containers', 'Scheduler']
    
    tabs.forEach(tabName => {
      cy.get('[role="tab"]').contains(tabName).click()
      cy.get('[role="tabpanel"]').should('be.visible')
      cy.url().should('include', tabName.toLowerCase().replace(' ', '-'))
    })
  })

  it('should display loading states appropriately', () => {
    // Force a slow network request to see loading state
    cy.intercept('GET', '**/jobs', { delay: 1000 }).as('slowJobs')
    cy.get('[role="tab"]').contains('Scheduler').click()
    cy.get('[data-testid="loading-indicator"]').should('be.visible')
    cy.wait('@slowJobs')
    cy.get('[data-testid="job-item"]').should('be.visible')
  })

  it('should handle error states gracefully', () => {
    // Force an error response
    cy.intercept('GET', '**/jobs', { statusCode: 500 }).as('errorJobs')
    cy.get('[role="tab"]').contains('Scheduler').click()
    cy.get('[data-testid="error-message"]').should('be.visible')
  })
})
