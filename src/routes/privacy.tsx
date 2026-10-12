import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, LegalPage, legalHead } from "@/components/legal";

export const Route = createFileRoute("/privacy")({
  head: () => legalHead("Privacy Policy", "What data iChart collects, why, and how you can control it."),
  component: () => (
    <LegalPage title="Privacy Policy" updated="October 7, 2026">
      <h2>What we collect</h2>
      <p>Your email address and login details; chart images you upload; the analyses, trade ideas, notes and outcomes saved to your account; credit and subscription records; and basic technical logs needed to run the service.</p>
      <h2>Why we use it</h2>
      <p>To provide your account and workspace, generate analyses, track accuracy, process payments and prevent abuse. Uploaded charts are sent to our AI provider solely to produce your analysis.</p>
      <h2>Sharing</h2>
      <p>We do not sell your data. We share it only with service providers that host the app, run AI models and process payments, under their own data protection terms. Aggregated, anonymous pattern statistics may be used to improve the analysis for all users.</p>
      <h2>Storage and retention</h2>
      <p>Uploaded charts are stored privately and are only accessible to your account. We keep your data while your account is active and delete it on request.</p>
      <h2>Your rights</h2>
      <p>You can request access to, correction of, or deletion of your data, or object to processing, by emailing <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. You may also complain to your local data protection authority.</p>
    </LegalPage>
  ),
});
