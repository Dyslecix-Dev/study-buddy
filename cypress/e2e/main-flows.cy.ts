describe('Main User Flows', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Task Management Flow', () => {
    it('should create, edit, complete, and delete a task', () => {
      cy.visit('/tasks')

      // Create task
      cy.get('[data-testid="new-task-button"]').click()
      cy.get('input[name="title"]').type('Complete Project Documentation')
      cy.get('textarea[name="description"]').type('Write comprehensive docs')
      cy.get('select[name="priority"]').select('High')
      cy.get('button[type="submit"]').click()

      // Verify task appears
      cy.contains('Complete Project Documentation').should('exist')

      // Edit task
      cy.contains('Complete Project Documentation')
        .parent()
        .find('[data-testid="edit-button"]')
        .click()

      cy.get('input[name="title"]').clear().type('Update Project Documentation')
      cy.get('button[type="submit"]').click()

      cy.contains('Update Project Documentation').should('exist')

      // Complete task
      cy.contains('Update Project Documentation')
        .parent()
        .find('input[type="checkbox"]')
        .click()

      // Verify completion
      cy.contains('Update Project Documentation')
        .parent()
        .should('have.class', 'completed')

      // Delete task
      cy.contains('Update Project Documentation')
        .parent()
        .find('[data-testid="delete-button"]')
        .click()

      cy.get('[data-testid="confirm-delete"]').click()

      // Verify deletion
      cy.contains('Update Project Documentation').should('not.exist')
    })

    it('should filter tasks by status', () => {
      cy.visit('/tasks')

      // Create completed and pending tasks
      cy.createTask('Completed Task', { completed: true })
      cy.createTask('Pending Task', { completed: false })

      cy.reload()

      // Filter by completed
      cy.get('[data-testid="filter-status"]').select('Completed')
      cy.contains('Completed Task').should('exist')
      cy.contains('Pending Task').should('not.exist')

      // Filter by pending
      cy.get('[data-testid="filter-status"]').select('Pending')
      cy.contains('Pending Task').should('exist')
      cy.contains('Completed Task').should('not.exist')
    })
  })

  describe('Flashcard Study Flow', () => {
    it('should create deck, add cards, and study', () => {
      cy.visit('/flashcards')

      // Create deck
      cy.get('[data-testid="new-deck-button"]').click()
      cy.get('input[name="name"]').type('Spanish Vocabulary')
      cy.get('textarea[name="description"]').type('Basic Spanish words')
      cy.get('button[type="submit"]').click()

      // Add flashcards
      cy.contains('Spanish Vocabulary').click()

      const cards = [
        { front: 'Hello', back: 'Hola' },
        { front: 'Goodbye', back: 'Adiós' },
        { front: 'Thank you', back: 'Gracias' },
      ]

      cards.forEach((card) => {
        cy.get('[data-testid="add-card-button"]').click()
        cy.get('input[name="front"]').type(card.front)
        cy.get('textarea[name="back"]').type(card.back)
        cy.get('button[type="submit"]').click()
      })

      // Start study session
      cy.get('[data-testid="study-button"]').click()

      // Study first card
      cy.get('[data-testid="card-front"]').should('contain', cards[0].front)
      cy.get('[data-testid="show-answer"]').click()
      cy.get('[data-testid="card-back"]').should('contain', cards[0].back)
      cy.get('[data-testid="rating-good"]').click()

      // Verify next card
      cy.get('[data-testid="card-front"]').should('contain', cards[1].front)
    })

    it('should track review statistics', () => {
      cy.visit('/flashcards')

      // Assuming deck already exists
      cy.contains('Spanish Vocabulary').click()
      cy.get('[data-testid="study-button"]').click()

      // Review multiple cards
      for (let i = 0; i < 3; i++) {
        cy.get('[data-testid="show-answer"]').click()
        cy.get('[data-testid="rating-good"]').click()
      }

      // Check statistics
      cy.visit('/dashboard')
      cy.get('[data-testid="cards-reviewed"]')
        .invoke('text')
        .then((count) => {
          expect(parseInt(count)).to.be.greaterThan(0)
        })
    })
  })

  describe('Note Management Flow', () => {
    it('should create, edit, and organize notes', () => {
      cy.visit('/notes')

      // Create folder
      cy.get('[data-testid="new-folder-button"]').click()
      cy.get('input[name="name"]').type('Study Notes')
      cy.get('button[type="submit"]').click()

      // Create note in folder
      cy.get('[data-testid="new-note-button"]').click()
      cy.get('input[name="title"]').type('Chapter 1 Summary')
      cy.get('select[name="folderId"]').select('Study Notes')
      cy.get('[data-testid="note-editor"]').type('This chapter covers...')
      cy.get('[data-testid="save-note"]').click()

      // Verify note appears in folder
      cy.contains('Study Notes').click()
      cy.contains('Chapter 1 Summary').should('exist')

      // Edit note
      cy.contains('Chapter 1 Summary').click()
      cy.get('[data-testid="note-editor"]').clear().type('Updated summary content')
      cy.get('[data-testid="save-note"]').click()

      // Verify update
      cy.contains('Chapter 1 Summary').click()
      cy.get('[data-testid="note-editor"]').should('contain', 'Updated summary')
    })

    it('should create note links', () => {
      cy.visit('/notes')

      // Create two notes
      cy.createNote('Note A', 'Content A')
      cy.createNote('Note B', 'Content B')

      // Link them
      cy.contains('Note A').click()
      cy.get('[data-testid="link-notes-button"]').click()
      cy.get('[data-testid="note-search"]').type('Note B')
      cy.contains('Note B').click()
      cy.get('[data-testid="save-links"]').click()

      // Verify link appears
      cy.get('[data-testid="linked-notes"]').should('contain', 'Note B')

      // Navigate via link
      cy.get('[data-testid="linked-notes"]').contains('Note B').click()
      cy.get('input[name="title"]').should('have.value', 'Note B')
    })
  })

  describe('Focus Timer Flow', () => {
    it('should start and complete a focus session', () => {
      cy.visit('/focus')

      // Select mode
      cy.get('[data-testid="mode-pomodoro"]').click()

      // Start session
      cy.get('[data-testid="start-focus"]').click()

      // Verify timer is running
      cy.get('[data-testid="timer-display"]').should('exist')
      cy.get('[data-testid="timer-status"]').should('contain', 'Focus')

      // Stop session
      cy.get('[data-testid="stop-focus"]').click()

      // Verify session was recorded
      cy.visit('/dashboard')
      cy.get('[data-testid="focus-time"]')
        .invoke('text')
        .then((time) => {
          expect(time).to.not.equal('0 min')
        })
    })
  })

  describe('Dashboard Overview', () => {
    it('should display comprehensive statistics', () => {
      cy.visit('/dashboard')

      // Verify all stat cards exist
      cy.get('[data-testid="focus-time"]').should('exist')
      cy.get('[data-testid="tasks-completed"]').should('exist')
      cy.get('[data-testid="cards-reviewed"]').should('exist')
      cy.get('[data-testid="streak-count"]').should('exist')

      // Verify charts
      cy.get('[data-testid="activity-chart"]').should('exist')

      // Verify recent activity
      cy.get('[data-testid="recent-activity"]').should('exist')
    })

    it('should allow switching time periods', () => {
      cy.visit('/dashboard')

      // Switch to day view
      cy.contains('button', 'Day').click()
      cy.url().should('include', 'period=day')

      // Switch to month view
      cy.contains('button', 'Month').click()
      cy.url().should('include', 'period=month')

      // Verify data updates
      cy.get('[data-testid="activity-chart"]').should('exist')
    })
  })

  describe('Search Functionality', () => {
    it('should search across notes and tasks', () => {
      cy.visit('/')

      // Open search
      cy.get('[data-testid="search-button"]').click()

      // Search for term
      cy.get('[data-testid="search-input"]').type('documentation')

      // Verify results
      cy.get('[data-testid="search-results"]').should('exist')
      cy.get('[data-testid="search-results"]').should('contain', 'documentation')

      // Click result
      cy.get('[data-testid="search-results"]').first().click()

      // Verify navigation
      cy.url().should('match', /(notes|tasks)/)
    })
  })
})
