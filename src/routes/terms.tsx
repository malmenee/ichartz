import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, LegalPage, legalHead } from "@/components/legal";

export const Route = createFileRoute("/terms")({
  head: () => legalHead("Terms of Service", "The terms that apply when you use iChart, ChartSeer and ICT Pulse."),
  component: () => (
    <LegalPage title="Terms of Service" updated="October 7, 2026">
      <p>By creating an account or using iChart (including ChartSeer and ICT Pulse) you agree to these terms.</p>
      <h2>Educational service</h2>
      <p>iChart provides educational tools and AI-generated chart commentary. Nothing on the site is investment, financial, tax or legal advice, and no content is a recommendation to buy or sell any instrument. You are solely responsible for your trading decisions.</p>
      <h2>Accounts</h2>
      <p>You must provide accurate details and keep your login secure. You may only upload charts you have the right to use. We may suspend accounts that abuse the service.</p>
      <h2>Credits and subscriptions</h2>
      <p>Credits are used for chart analyses and trade ideas, have no cash value and are non-transferable. Subscriptions renew automatically until cancelled; you keep access until the end of the paid period. Refunds are handled case by case and as required by law.</p>
      <h2>No warranty</h2>
      <p>The service is provided "as is". AI output can be inaccurate, incomplete or delayed, and third-party data (such as economic calendars and prices) may be wrong or unavailable.</p>
      <h2>Limitation of liability</h2>
      <p>To the maximum extent permitted by law, we are not liable for trading losses or any indirect or consequential damages arising from your use of the service.</p>
      <h2>Changes and contact</h2>
      <p>We may update these terms and will post the new date above. Questions: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </LegalPage>
  ),
});
