All infrastructure work must:

- Assume any single AI provider can change pricing, terms, or capability without notice
- Design for graceful degradation, not just uptime
- Maintain a deterministic JSON contract between Stage A and Stage B
- Track cost per session across scale tiers: 10 / 100 / 1000 users

Posture: the system cannot be broken by a pricing email.
