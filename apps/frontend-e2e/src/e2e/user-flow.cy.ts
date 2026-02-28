
describe('User Flow Verification', () => {
    beforeEach(() => {
        // Cypress starts with a clean slate for cookies/localStorage usually
        cy.visit('/');
    });

    it('should allow a new user to sign up, see dashboard, and sign out', () => {
        // 1. Visit Home
        cy.contains('Welcome to FOSMS').should('be.visible');

        // 2. Click Sign Up
        cy.get('button').contains('Sign Up').click();
        cy.url().should('include', '/sign-up');

        // 3. Fill Form
        // Using a random suffix to ensure uniqueness
        const randomId = Math.floor(Math.random() * 10000);
        const email = `admin_test_${randomId}@fosms.com`;
        const employeeId = `ADMIN_TEST_${randomId}`;

        cy.get('input#name').type('Admin User');
        cy.get('input#employeeId').type(employeeId);
        cy.get('input#email').type(email);
        cy.get('input#password').type('password123'); // Length > 6

        // 4. Submit
        cy.get('button[type="submit"]').click();

        // 5. Verify Redirect to Login (Sign Up successful -> Login Page)
        // Wait, the SignUpCard code says: navigate('/login') on success.
        // So we should be redirected to /login first.
        cy.url().should('include', '/login');
        cy.contains('Sign in to your account').should('be.visible');

        // 6. Sign In with new credentials
        cy.get('input#email').type(email);
        cy.get('input#password').type('password123');
        cy.get('button[type="submit"]').click();

        // 7. Verify Redirect to Dashboard
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.contains('Welcome back, Admin User!').should('be.visible');

        // 8. Verify Role (Default is Staff)
        cy.contains('You are currently logged in as Staff').should('be.visible');

        // 9. Sign Out
        // AuthHeader uses Menu
        cy.get('button').contains('Admin User').click(); // Avatar/Name in header
        cy.contains('Sign out').click();

        // 10. Verify Signed Out state
        cy.contains('Welcome to FOSMS').should('be.visible');
        cy.contains('Sign In').should('be.visible');
    });
});
