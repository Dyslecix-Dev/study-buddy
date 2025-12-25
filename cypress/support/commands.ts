/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with Supabase
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>

      /**
       * Custom command to create a test task
       * @example cy.createTask('My Task', { priority: 1 })
       */
      createTask(title: string, options?: { priority?: number; completed?: boolean }): Chainable<void>

      /**
       * Custom command to create a test flashcard
       * @example cy.createFlashcard('Front', 'Back', 'deck-id')
       */
      createFlashcard(front: string, back: string, deckId: string): Chainable<void>

      /**
       * Custom command to create a test note
       * @example cy.createNote('My Note', 'Note content', 'folder-id')
       */
      createNote(title: string, content: string, folderId?: string): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Create task command
Cypress.Commands.add('createTask', (title: string, options = {}) => {
  cy.request({
    method: 'POST',
    url: '/api/tasks',
    body: {
      title,
      priority: options.priority || 0,
      completed: options.completed || false,
    },
  })
})

// Create flashcard command
Cypress.Commands.add('createFlashcard', (front: string, back: string, deckId: string) => {
  cy.request({
    method: 'POST',
    url: `/api/decks/${deckId}/flashcards`,
    body: {
      front,
      back,
    },
  })
})

// Create note command
Cypress.Commands.add('createNote', (title: string, content: string, folderId?: string) => {
  cy.request({
    method: 'POST',
    url: '/api/notes',
    body: {
      title,
      content,
      folderId,
    },
  })
})

export {}