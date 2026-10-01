/**
 * Mailer utility for generating personalized emails and direct Gmail compose URLs.
 */

export const DEFAULT_TEMPLATE = {
  subject: "Application for AI/ML, SWE, or FDE Intern Roles - Rohit Yadav (NIT Jalandhar)",
  roles: [
    "AI/ML & Agentic AI Intern",
    "Software Engineering (SWE) Intern",
    "Forward Deployed Engineer (FDE) Intern"
  ]
};

export function generateEmailContent(contact, customHonorific = null) {
  const honorific = customHonorific || contact.honorific || (contact.gender === 'female' ? "Ma'am" : "Sir");
  const firstName = contact.firstName || contact.name.split(' ')[0] || 'Sir/Ma\'am';
  const company = contact.company || 'your team';

  const subject = `Application for AI/ML, SWE, or FDE Intern Roles - Rohit Yadav (NIT Jalandhar)`;

  const body = `Hi ${firstName} ${honorific},

I hope this email finds you well. I am reaching out to express my strong interest in internship and full-time opportunities at ${company}, specifically across AI/ML & Agentic AI Intern, Software Engineering (SWE) Intern, and Forward Deployed Engineer (FDE) Intern roles.

I am a final-year B.Tech IT student at NIT Jalandhar with hands-on production experience spanning AI agents, LLM infrastructure, distributed backend systems, and full-stack engineering.

Key highlights from my background:
• Google TRC Grantee: Led AutonomousX, pre-training 25 LLMs (124M–1.4B parameters) from scratch across 500B+ tokens using JAX/Flax on TPU v4/v6e clusters, open-sourcing models and code.
• Amazon ML Summer School 2026: Selected among top 3,000 candidates from 134,000+ applicants nationwide.
• Full-Stack Intern at StudentVerse (Dubai): Building scalable web/mobile features and containerized backend services deployed on Azure with Docker.
• AI Research Intern at Molsys: Deployed and fine-tuned open-source LLMs (Qwen) on 2x NVIDIA H200 GPUs with vLLM, llama.cpp, and agentic workflows.
• Full-Stack Production Systems (GiniVibe): Architected an end-to-end web & mobile social discovery platform with Next.js, React Native, Node.js, PostgreSQL, Redis, Kafka, WebSockets/WebRTC, and Docker, featuring a hybrid monolith/microservice backend and intent-driven matching algorithms.
• Autonomous AI Agents (RAGE-BORN): Built an autonomous developer agent with planner-execution feedback loops, terminal execution, browser automation, filesystem access, and 25+ integrated CLI tools.
• Competitive Programming: LeetCode Knight (Rating 2013, 600+ problems solved), CodeChef 4-Star (1818).

My institute permits a full-time 6-month internship, and I am keen to commit full-time with the objective of delivering immediate high-impact engineering work and converting to a full-time FTE role.

Resume: https://rohit-portfolio-yadav1825.vercel.app/Resume_rohit_yadav.pdf
Portfolio: https://rohit-portfolio-yadav1825.vercel.app/
GitHub: https://github.com/YADAV1825
LinkedIn: https://linkedin.com/in/rohit-yadav-25535b256

Thank you very much for your time and consideration, ${honorific}.

Best regards,
Rohit Yadav
+91 8849994303 | yrohit1825@gmail.com`;

  return { subject, body, honorific, firstName, company };
}

/**
 * Builds the direct Gmail Web compose URL.
 * When clicked, this immediately opens Gmail in the browser with prefilled To, Subject, and Body.
 */
export function buildGmailComposeUrl(email, subject, body) {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: email,
    su: subject,
    body: body
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Fallback native mailto link
 */
export function buildMailtoUrl(email, subject, body) {
  const params = new URLSearchParams({
    subject: subject,
    body: body
  });
  return `mailto:${email}?${params.toString()}`;
}
