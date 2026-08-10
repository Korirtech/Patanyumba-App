import { beforeAll, describe, expect, it, vi } from "vitest";

const sendMail = vi.hoisted(() => vi.fn());

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail })),
  },
}));

describe("verification email payload", () => {
  let initializeEmailService: typeof import("./email.js").initializeEmailService;
  let sendVerificationEmail: typeof import("./email.js").sendVerificationEmail;

  beforeAll(async () => {
    vi.resetModules();
    process.env.SMTP_HOST = "smtp.test.local";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "sender@example.com";
    process.env.SMTP_PASS = "test-password";
    process.env.SMTP_FROM = "sender@example.com";
    process.env.APP_URL = "https://patanyumba.example";

    ({ initializeEmailService, sendVerificationEmail } = await import("./email.js"));
    initializeEmailService();
    sendMail.mockResolvedValue({ messageId: "verification-message-id" });
  });

  it("includes the code in the HTML and plain-text email bodies", async () => {
    const result = await sendVerificationEmail("recipient@example.com", "123456");

    expect(result).toEqual({ success: true });
    expect(sendMail).toHaveBeenCalledOnce();

    const message = sendMail.mock.calls[0][0];
    expect(message.to).toBe("recipient@example.com");
    expect(message.html).toContain('<div class="code">123456</div>');
    expect(message.text).toContain("Your PataNyumba verification code is: 123456");
    expect(message.html).toContain("https://patanyumba.example/verify-email");
  });
});
