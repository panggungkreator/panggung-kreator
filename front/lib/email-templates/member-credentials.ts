export function getMemberCredentialsEmailHtml({
  memberName = "Kreator",
  email = "bentokawan@gmail.com",
  username = "bentokawan973",
  password = "PK-9754!",
  appUrl = "http://localhost:3000",
}: {
  memberName?: string;
  email?: string;
  username?: string;
  password?: string;
  appUrl?: string;
}) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kredensial Akses Akun Member</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid #27272a; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 28px 24px 28px; text-align: center; border-bottom: 1px solid #27272a; background: linear-gradient(180deg, #27272a 0%, #18181b 100%);">
              <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                PANGGUNG KREATOR
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #a1a1aa; letter-spacing: 0.5px;">
                Kredensial Akses Akun Member Panggung Kreator
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px 28px 28px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #f4f4f5;">
                Halo <strong style="color: #ffffff;">${memberName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #d4d4d8;">
                Selamat! Pendaftaran Anda sebagai <strong style="color: #ffffff;">Member Panggung Kreator</strong> telah berhasil dikonfirmasi. Berikut adalah informasi kredensial untuk login ke platform:
              </p>

              <!-- Credentials Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #27272a; border-radius: 12px; border: 1px solid #3f3f46; margin: 0 0 28px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <!-- Badge Header -->
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #fbbf24; margin-bottom: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      🔑 KREDENSIAL LOGIN ANDA
                    </div>

                    <!-- Credential Item: Email -->
                    <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #3f3f46;">
                      <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px;">
                        Email
                      </div>
                      <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 14px; font-weight: 700; color: #60a5fa; word-break: break-all; word-wrap: break-word; overflow-wrap: break-word;">
                        ${email}
                      </div>
                    </div>

                    <!-- Credential Item: Username -->
                    <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #3f3f46;">
                      <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px;">
                        Username
                      </div>
                      <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 14px; font-weight: 700; color: #ffffff; word-break: break-all; word-wrap: break-word; overflow-wrap: break-word;">
                        ${username}
                      </div>
                    </div>

                    <!-- Credential Item: Password -->
                    <div>
                      <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px;">
                        Password
                      </div>
                      <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 14px; font-weight: 700; color: #ffffff; word-break: break-all; word-wrap: break-word; overflow-wrap: break-word;">
                        ${password}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/login" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #ffffff; color: #09090b; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-align: center; transition: all 0.2s ease;">
                      Login ke Dashboard Member
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice Alert -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #271f1b; border-radius: 10px; border: 1px solid #7c2d12; margin: 0 0 28px 0;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #fdba74;">
                      💡 <strong style="color: #fed7aa;">Tips Keamanan:</strong> Demi keamanan akun Anda, silakan ubah password sementara ini melalui halaman profil setelah pertama kali berhasil login.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer Sign-off -->
              <div style="border-top: 1px solid #27272a; padding-top: 20px; font-size: 12px; color: #71717a; line-height: 1.6;">
                Salam hangat,<br />
                <strong style="color: #d4d4d8;">Tim Panggung Kreator</strong><br />
                <span style="font-size: 11px; color: #52525b;">#OneStageOneProgress</span>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
