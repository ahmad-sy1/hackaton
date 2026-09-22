/// <reference types="cypress" />

import { queryRows, type VisitLogRij } from "../support/db";

describe("Beheer: bezoeklogs anonimiseren", () => {
  beforeEach(() => {
    cy.task("seed");
  });

  it("TC-14 | anonimiseren maskeert oude logs met een lidnummer, logs van vandaag blijven staan", () => {
    // M1 heeft precies één log: die van 21 dagen oud (zie seed).
    queryRows<VisitLogRij>(
      "SELECT visit_id, user_id, subscription_type_id FROM visit_logs WHERE user_id = 1",
    ).then((m1Logs) => {
      expect(m1Logs).to.have.length(1);
      const oudeLog = m1Logs[0];

      queryRows<VisitLogRij>(
        "SELECT visit_id, user_id, subscription_type_id FROM visit_logs WHERE user_id = 4 ORDER BY visit_date DESC LIMIT 1",
      ).then(([logVandaag]) => {
        cy.visit("/beheer");
        cy.get('[data-testid="anonimiseren-knop"]').click();
        cy.get('[data-testid="bevestig-knop"]').click();
        cy.get('[data-testid="terug-naar-overzicht-knop"]').should(
          "be.visible",
        );

        queryRows<VisitLogRij>(
          "SELECT visit_id, user_id, subscription_type_id FROM visit_logs WHERE visit_id = $1",
          [oudeLog.visit_id],
        ).then(([na]) => {
          expect(na.user_id).to.eq(null);
          expect(na.subscription_type_id).to.eq(oudeLog.subscription_type_id);
        });

        queryRows<Pick<VisitLogRij, "user_id">>(
          "SELECT user_id FROM visit_logs WHERE visit_id = $1",
          [logVandaag.visit_id],
        ).then(([na]) => {
          expect(na.user_id).to.eq(4);
        });
      });
    });
  });

  it("TC-15 | anonimiseerknop is disabled als er niets meer te anonimiseren is", () => {
    queryRows(
      "UPDATE visit_logs SET user_id = NULL WHERE visit_date < now() - interval '14 days'",
    ).then(() => {
      cy.visit("/beheer");
      cy.get('[data-testid="anonimiseren-knop"]').should("be.disabled");
    });
  });
});
