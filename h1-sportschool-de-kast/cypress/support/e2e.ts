/// <reference types="cypress" />

// Elke spec seedt zelf al vóór een test (beforeEach). Dit ruimt ná elke test
// ook op, zodat de testdatabase nooit vervuild achterblijft — ook niet na de
// laatste test van de laatste spec, voor een latere handmatige rerun.
afterEach(() => {
  cy.task("seed");
});
