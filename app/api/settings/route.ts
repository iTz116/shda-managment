import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // From your Neon account
})

export async function GET() {
  try {
    const client = await pool.connect()
    const result = await client.query("SELECT * FROM settings LIMIT 1")
    client.release()

    if (result.rows.length === 0) {
      return NextResponse.json({}, { status: 200 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      companyName,
      address,
      phone,
      email,
      currency,
      language,
      darkMode,
      whatsappApiKey,
      smtpEmail,
      smtpPassword,
    } = body

    const client = await pool.connect()

    await client.query(`
      INSERT INTO settings (company_name, address, phone, email, currency, language, dark_mode, whatsapp_api_key, smtp_email, smtp_password)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (id)
      DO UPDATE SET
        company_name = EXCLUDED.company_name,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        currency = EXCLUDED.currency,
        language = EXCLUDED.language,
        dark_mode = EXCLUDED.dark_mode,
        whatsapp_api_key = EXCLUDED.whatsapp_api_key,
        smtp_email = EXCLUDED.smtp_email,
        smtp_password = EXCLUDED.smtp_password;
    `, [
      companyName,
      address,
      phone,
      email,
      currency,
      language,
      darkMode,
      whatsappApiKey,
      smtpEmail,
      smtpPassword
    ])

    client.release()
    return NextResponse.json({ message: "Settings saved successfully" })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
