/// <reference types="cypress" />

export {};

function incheck(lidnummer: string, pincode = "1234") {
  cy.visit("/check-in");
  // React hydrateert de pagina kort na het laden; typen vóór die hydratatie
  // klaar is, wordt door de controlled input weer teruggezet naar de state
  // (leeg). Deze wachttijd voorkomt die race in de dev-server.
  cy.wait(300);
  cy.get('[data-testid="lidnummer-input"]')
    .type(lidnummer)
    .should("have.value", lidnummer);
  cy.get('[data-testid="pincode-input"]')
    .type(pincode)
    .should("have.value", pincode);
  cy.get('[data-testid="submit-knop"]').click();
}

describe("Integratie: opzeggen en inchecken", () => {
  beforeEach(() => {
    cy.task("seed");
  });

  it("TC-12 | M6 (opgezegd, einddatum nog niet gepasseerd) krijgt toegang", () => {
    incheck("6");
    cy.get('[data-testid="welkomst-paneel"]').should("be.visible");
  });

  it('TC-13 | M7 (opgezegd, einddatum gepasseerd) wordt geweigerd met kop "Abonnement verlopen"', () => {
    incheck("7");
    cy.get('[data-testid="weigering-paneel"]').should("be.visible");
    cy.get('[data-testid="weiger-kop"]').should(
      "have.text",
      "Abonnement verlopen",
    );
  });
});
