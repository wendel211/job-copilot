export class FakeEmailStrategy {
  async send(params: {
    toEmail: string;
    subject: string;
    bodyText: string;
  }): Promise<{ success: boolean; error?: string }> {
    console.log("\n📨 [FAKE EMAIL] Simulando envio...");
    console.log("Para:", params.toEmail);
    console.log("Assunto:", params.subject);
    console.log("Corpo:\n", params.bodyText);
    console.log("Email enviado (simulado).");

    return { success: true };
  }
}
