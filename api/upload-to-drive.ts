import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'
import { Readable } from 'stream'

const FOLDER_ID = '116yDKGZaiVGM1TiCGM9MvJy3m-V8LyjL'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { fileName, fileBase64, mimeType } = req.body as {
    fileName: string
    fileBase64: string
    mimeType: string
  }

  if (!fileName || !fileBase64) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(500).json({ error: 'Google OAuth credentials not configured' })
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
    oauth2Client.setCredentials({ refresh_token: refreshToken })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    const fileBuffer = Buffer.from(fileBase64, 'base64')
    const stream = Readable.from(fileBuffer)

    const uploaded = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: mimeType || 'application/pdf',
        body: stream,
      },
      fields: 'id',
    })

    const fileId = uploaded.data.id!

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })

    return res.status(200).json({
      url: `https://drive.google.com/file/d/${fileId}/view`,
    })
  } catch (err) {
    console.error('Drive upload error:', err)
    return res.status(500).json({ error: 'Failed to upload to Google Drive' })
  }
}
