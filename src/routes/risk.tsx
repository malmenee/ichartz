import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, LegalPage, legalHead } from "@/components/legal";

export const Route = createFileRoute("/risk")({
  head: () => legalHead("Risk Disclosure", "Trading risks and the limits of AI chart analysis on iChart."),
  component: () => (
    <LegalPage title="Risk Disclosure" updated="October 7, 2026">
      <p>Trading futures, forex, stocks, crypto and other leveraged products carries a high level of risk and may not be suitable for everyone. You can lose more than your initial deposit.</p>
      <h2>Not advice</h2>
      <p>iChart is an educational tool. Analyses, trade ideas, session guides and news notes are general information, not personalised advice or signals to trade.</p>
      <h2>AI limitations</h2>
      <p>AI models can misread charts, invent levels or be confidently wrong. Confidence numbers are the model's own estimate, not a probability of profit. Always verify with your own analysis.</p>
      <h2>Past performance</h2>
      <p>Tracked accuracy, win rates and historical patterns describe the past and do not guarantee future results. Concepts in ICT Pulse are commonly taught ideas, not proven edges.</p>
      <h2>Your responsibility</h2>
      <p>Only trade money you can afford to lose and consider speaking with a licensed financial adviser. Questions: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </LegalPage>
  ),
});
