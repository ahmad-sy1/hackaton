/// <reference types="cypress" />

import {
  formatteerDatumNl,
  verwachteEinddatumOpzeggen,
} from "../support/datum";
import { ankerDagVan, haalLid } from "../support/db";

function login(lidnummer: string, pincode = "1234") {
  cy.visit("/abonnement");
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

describe("Abonnement opzeggen", () => {
  beforeEach(() => {
    cy.task("seed");
  });

  it("TC-08 | M1 zegt op: toegang loopt door tot de dag vóór de eerstvolgende 5e", () => {
    haalLid(1).then((lid) => {
      const verwacht = verwachteEinddatumOpzeggen(
        ankerDagVan(lid.subscription_start),
        new Date(),
      );

      login("1");
      cy.get('[data-testid="opzeggen-knop"]').click();
      cy.get('[data-testid="bevestig-tekst"]').should(
        "contain.text",
        "Er wordt nog niets gewijzigd totdat je hieronder bevestigt.",
      );
      cy.get('[data-testid="bevestig-knop"]').click();
      cy.get('[data-testid="opgezegd-bericht"]').should(
        "contain.text",
        formatteerDatumNl(verwacht),
      );

      haalLid(1).then((na) => {
        expect(na.subscription_end).to.eq(verwacht);
      });
    });
  });

  it('TC-09 | M1 kiest "Nee, terug": abonnement blijft actief en einddatum blijft leeg', () => {
    login("1");
    cy.get('[data-testid="opzeggen-knop"]').click();
    cy.get('[data-testid="annuleer-knop"]').click();
    cy.get('[data-testid="opzeggen-knop"]').should("be.visible");

    haalLid(1).then((na) => {
      expect(na.subscription_end).to.eq(null);
    });
  });

  it("TC-10 | M8 zegt op: toegang loopt door tot de dag vóór dezelfde dag volgende maand", () => {
    haalLid(8).then((lid) => {
      const verwacht = verwachteEinddatumOpzeggen(
        ankerDagVan(lid.subscription_start),
        new Date(),
      );

      login("8");
      cy.get('[data-testid="opzeggen-knop"]').click();
      cy.get('[data-testid="bevestig-knop"]').click();
      // Wacht op het opgezegd-scherm: garandeert dat de server action (en dus
      // de database-schrijving) klaar is vóór we de database bevragen.
      cy.get('[data-testid="opgezegd-bericht"]').should(
        "contain.text",
        formatteerDatumNl(verwacht),
      );

      haalLid(8).then((na) => {
        expect(na.subscription_end).to.eq(verwacht);
      });
    });
  });

  it("TC-11 | M6 (al opgezegd) heeft geen opzegknop en de einddatum blijft ongewijzigd", () => {
    haalLid(6).then((oorspronkelijk) => {
      login("6");
      cy.get('[data-testid="opzeggen-knop"]').should("not.exist");
      cy.get('[data-testid="abonnement-status"]').should(
        "contain.text",
        formatteerDatumNl(oorspronkelijk.subscription_end as string),
      );

      haalLid(6).then((na) => {
        expect(na.subscription_end).to.eq(oorspronkelijk.subscription_end);
      });
    });
  });
});
