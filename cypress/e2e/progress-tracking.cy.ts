describe('Progress Tracking System', () => {
  beforeEach(() => {
    // This would need real auth setup or mocking
    cy.visit('/')
  })

  describe('Task Completion Tracking', () => {
    it('should preserve task completion count after task deletion', () => {
      // Navigate to tasks page
      cy.visit('/tasks')

      // Create a new task
      cy.get('[data-testid="new-task-button"]').click()
      cy.get('input[name="title"]').type('Test Task for Deletion')
      cy.get('button[type="submit"]').click()

      // Mark task as complete
      cy.contains('Test Task for Deletion')
        .parent()
        .find('input[type="checkbox"]')
        .click()

      // Wait for completion to be saved
      cy.wait(500)

      // Navigate to dashboard and record completed tasks count
      cy.visit('/dashboard')
      cy.get('[data-testid="tasks-completed"]')
        .invoke('text')
        .then((countBefore) => {
          const completedBefore = parseInt(countBefore)

          // Go back and delete the completed task
          cy.visit('/tasks')
          cy.contains('Test Task for Deletion')
            .parent()
            .find('[data-testid="delete-button"]')
            .click()

          // Confirm deletion
          cy.get('[data-testid="confirm-delete"]').click()

          // Check dashboard again
          cy.visit('/dashboard')
          cy.get('[data-testid="tasks-completed"]')
            .invoke('text')
            .then((countAfter) => {
              const completedAfter = parseInt(countAfter)
              // Count should remain the same after deletion
              expect(completedAfter).to.equal(completedBefore)
            })
        })
    })

    it('should increment and decrement when completing/uncompleting tasks', () => {
      cy.visit('/tasks')

      // Create a task
      cy.get('[data-testid="new-task-button"]').click()
      cy.get('input[name="title"]').type('Toggle Test Task')
      cy.get('button[type="submit"]').click()

      // Get initial count
      cy.visit('/dashboard')
      cy.get('[data-testid="tasks-completed"]')
        .invoke('text')
        .then((countBefore) => {
          const initial = parseInt(countBefore)

          // Complete the task
          cy.visit('/tasks')
          cy.contains('Toggle Test Task')
            .parent()
            .find('input[type="checkbox"]')
            .click()

          cy.wait(500)

          // Check count increased
          cy.visit('/dashboard')
          cy.get('[data-testid="tasks-completed"]')
            .invoke('text')
            .should((text) => {
              expect(parseInt(text)).to.equal(initial + 1)
            })

          // Uncomplete the task
          cy.visit('/tasks')
          cy.contains('Toggle Test Task')
            .parent()
            .find('input[type="checkbox"]')
            .click()

          cy.wait(500)

          // Check count decreased back
          cy.visit('/dashboard')
          cy.get('[data-testid="tasks-completed"]')
            .invoke('text')
            .should((text) => {
              expect(parseInt(text)).to.equal(initial)
            })
        })
    })
  })

  describe('Flashcard Review Tracking', () => {
    it('should preserve review count after card deletion', () => {
      // Create a deck
      cy.visit('/flashcards')
      cy.get('[data-testid="new-deck-button"]').click()
      cy.get('input[name="name"]').type('Test Deck')
      cy.get('button[type="submit"]').click()

      // Add a flashcard
      cy.contains('Test Deck').click()
      cy.get('[data-testid="add-card-button"]').click()
      cy.get('input[name="front"]').type('Test Question')
      cy.get('textarea[name="back"]').type('Test Answer')
      cy.get('button[type="submit"]').click()

      // Study the card
      cy.get('[data-testid="study-button"]').click()
      cy.get('[data-testid="show-answer"]').click()
      cy.get('[data-testid="rating-good"]').click()

      // Record cards reviewed count
      cy.visit('/dashboard')
      cy.get('[data-testid="cards-reviewed"]')
        .invoke('text')
        .then((countBefore) => {
          const reviewedBefore = parseInt(countBefore)

          // Delete the flashcard
          cy.visit('/flashcards')
          cy.contains('Test Deck').click()
          cy.get('[data-testid="card-menu"]').first().click()
          cy.get('[data-testid="delete-card"]').click()
          cy.get('[data-testid="confirm-delete"]').click()

          // Check dashboard - count should remain
          cy.visit('/dashboard')
          cy.get('[data-testid="cards-reviewed"]')
            .invoke('text')
            .then((countAfter) => {
              const reviewedAfter = parseInt(countAfter)
              expect(reviewedAfter).to.equal(reviewedBefore)
            })
        })
    })
  })

  describe('Note Activity Tracking', () => {
    it('should track note creation', () => {
      cy.visit('/dashboard')
      cy.get('[data-testid="notes-created"]')
        .invoke('text')
        .then((countBefore) => {
          const createdBefore = parseInt(countBefore)

          // Create a note
          cy.visit('/notes')
          cy.get('[data-testid="new-note-button"]').click()
          cy.get('input[name="title"]').type('Test Note')
          cy.get('[data-testid="note-editor"]').type('Test content')
          cy.get('[data-testid="save-note"]').click()

          cy.wait(500)

          // Check count increased
          cy.visit('/dashboard')
          cy.get('[data-testid="notes-created"]')
            .invoke('text')
            .should((text) => {
              expect(parseInt(text)).to.equal(createdBefore + 1)
            })
        })
    })

    it('should track note updates', () => {
      // Create a note first
      cy.visit('/notes')
      cy.get('[data-testid="new-note-button"]').click()
      cy.get('input[name="title"]').type('Note to Update')
      cy.get('[data-testid="save-note"]').click()

      cy.wait(500)

      cy.visit('/dashboard')
      cy.get('[data-testid="notes-updated"]')
        .invoke('text')
        .then((countBefore) => {
          const updatedBefore = parseInt(countBefore)

          // Update the note
          cy.visit('/notes')
          cy.contains('Note to Update').click()
          cy.get('[data-testid="note-editor"]').clear().type('Updated content')
          cy.get('[data-testid="save-note"]').click()

          cy.wait(500)

          // Check count increased
          cy.visit('/dashboard')
          cy.get('[data-testid="notes-updated"]')
            .invoke('text')
            .should((text) => {
              expect(parseInt(text)).to.equal(updatedBefore + 1)
            })
        })
    })
  })

  describe('Dashboard Display', () => {
    it('should display dashboard with focus time only', () => {
      // Complete a pomodoro session
      cy.visit('/focus')
      cy.get('[data-testid="start-focus"]').click()

      // Fast-forward or mock time for testing
      // This would need time mocking in a real test

      cy.visit('/dashboard')
      cy.get('[data-testid="focus-time"]').should('exist')
      cy.get('[data-testid="focus-time"]').should('not.contain', '0 min')
    })

    it('should show correct streak calculation', () => {
      cy.visit('/dashboard')
      cy.get('[data-testid="streak-count"]').should('exist')
      cy.get('[data-testid="streak-count"]').should('contain', 'day')
    })

    it('should display activity chart with data', () => {
      cy.visit('/dashboard')
      cy.get('[data-testid="activity-chart"]').should('exist')
      cy.get('[data-testid="activity-chart"]').should('be.visible')
    })
  })
})
