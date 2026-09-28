/// <reference types="cypress" />

import { bezoekenVan, totaalAantalBezoeken } from "../support/db";

function incheck(lidnummer: string, pincode: string) {
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

describe("Inchecken", () => {
  beforeEach(() => {
    cy.task("seed");
  });

  it("TC-01 | M1 met juiste pin krijgt toegang en logt precies één geslaagd bezoek", () => {
    bezoekenVan(1).then((voor) => {
      incheck("1", "1234");
      cy.get('[data-testid="welkomst-paneel"]').should("be.visible");

      bezoekenVan(1).then((na) => {
        expect(na.length).to.eq(voor.length + 1);
        expect(na[na.length - 1].access_granted).to.eq(true);
      });
    });
  });

  it("TC-02 | M1 met pin 0000 wordt geweigerd en logt precies één mislukt bezoek", () => {
    bezoekenVan(1).then((voor) => {
      incheck("1", "0000");
      cy.get('[data-testid="weigering-paneel"]').should("be.visible");
      cy.get('[data-testid="weiger-melding"]').should(
        "have.text",
        "Onjuist lidnummer of onjuiste pincode.",
      );

      bezoekenVan(1).then((na) => {
        expect(na.length).to.eq(voor.length + 1);
        expect(na[na.length - 1].access_granted).to.eq(false);
      });
    });
  });

  it("TC-03 | onbekend lidnummer 999 geeft dezelfde melding en logt niets", () => {
    totaalAantalBezoeken().then((voor) => {
      incheck("999", "1234");
      cy.get('[data-testid="weigering-paneel"]').should("be.visible");
      cy.get('[data-testid="weiger-melding"]').should(
        "have.text",
        "Onjuist lidnummer of onjuiste pincode.",
      );

      totaalAantalBezoeken().then((na) => {
        expect(na).to.eq(voor);
      });
    });
  });

  it("TC-04 | M2 op de weeklimiet wordt geweigerd zonder extra geslaagd bezoek", () => {
    bezoekenVan(2).then((voor) => {
      incheck("2", "1234");
      cy.get('[data-testid="weigering-paneel"]').should("be.visible");
      cy.get('[data-testid="weiger-melding"]').should(
        "have.text",
        "Je hebt je bezoeklimiet al bereikt voor deze week",
      );
      cy.screenshot("TC-04-limiet-bereikt");

      bezoekenVan(2).then((na) => {
        expect(na.length).to.eq(voor.length + 1);
        const nieuweRijen = na.slice(voor.length);
        expect(nieuweRijen.every((rij) => rij.access_granted === false)).to.eq(
          true,
        );
      });
    });
  });

  it("TC-05 | M3 onder de weeklimiet krijgt toegang", () => {
    incheck("3", "1234");
    cy.get('[data-testid="welkomst-paneel"]').should("be.visible");
  });

  it("TC-06 | M4 (Premium, onbeperkt) krijgt toegang", () => {
    incheck("4", "1234");
    cy.get('[data-testid="welkomst-paneel"]').should("be.visible");
  });

  it("TC-07 | M5 met bezoeken van vóór afgelopen maandag krijgt toegang", () => {
    incheck("5", "1234");
    cy.get('[data-testid="welkomst-paneel"]').should("be.visible");
  });
});
