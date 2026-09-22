/// <reference types="cypress" />

import {
  anonimiseerLogsOuderDan14Dagen,
  bezoeklogsVan,
  haalBezoeklog,
  laatsteBezoeklogVan,
} from "../support/db";

describe("Beheer: bezoeklogs anonimiseren", () => {
  beforeEach(() => {
    cy.task("seed");
  });

  it("TC-14 | anonimiseren maskeert oude logs met een lidnummer, logs van vandaag blijven staan", () => {
    // M1 heeft precies één log: die van 21 dagen oud (zie seed).
    bezoeklogsVan(1).then((m1Logs) => {
      expect(m1Logs).to.have.length(1);
      const oudeLog = m1Logs[0];

      laatsteBezoeklogVan(4).then((logVandaag) => {
        cy.visit("/beheer");
        cy.get('[data-testid="anonimiseren-knop"]').click();
        cy.get('[data-testid="bevestig-knop"]').click();
        cy.get('[data-testid="terug-naar-overzicht-knop"]').should(
          "be.visible",
        );

        haalBezoeklog(oudeLog.visit_id).then((na) => {
          expect(na.user_id).to.eq(null);
          expect(na.subscription_type_id).to.eq(oudeLog.subscription_type_id);
        });

        haalBezoeklog(logVandaag.visit_id).then((na) => {
          expect(na.user_id).to.eq(4);
        });
      });
    });
  });

  it("TC-15 | anonimiseerknop is disabled als er niets meer te anonimiseren is", () => {
    anonimiseerLogsOuderDan14Dagen().then(() => {
      cy.visit("/beheer");
      cy.get('[data-testid="anonimiseren-knop"]').should("be.disabled");
    });
  });
});
