const { google } = require('googleapis');
const prisma = require('../../lib/prisma');

/**
 * GoogleCalendarService
 * Handles OAuth2 flow and bi-directional sync between App and Google Calendar.
 */
class GoogleCalendarService {
    constructor() {
        this.clientId = process.env.GOOGLE_CLIENT_ID;
        this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        this.redirectUri = process.env.GOOGLE_REDIRECT_URI;
    }

    /**
     * Creates a configured OAuth2 client for a specific user.
     * Attaches a listener to save refreshed tokens automatically.
     */
    async getClient(userId, initialTokens) {
        if (!userId || !initialTokens) return null;

        const auth = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );

        auth.setCredentials(initialTokens);

        // --- TOKEN REFRESH PERSISTENCE ---
        // When the library automatically refreshes the access_token using the refresh_token,
        // it emits a 'tokens' event. we MUST save this back to the database.
        auth.on('tokens', async (newTokens) => {
            try {
                // Merge new tokens with old tokens (refresh_token is often only in the first one)
                const updatedTokens = {
                    ...initialTokens,
                    ...newTokens
                };

                await prisma.user.update({
                    where: { id: userId },
                    data: { googleTokens: updatedTokens }
                });
                console.log(`[GoogleCalendar] ♻️ Tokens automatically rotated and saved for User ${userId}`);
            } catch (err) {
                console.error(`[GoogleCalendar] ❌ Failed to save rotated tokens for User ${userId}:`, err.message);
            }
        });

        return auth;
    }

    /**
     * Generates an Auth URL for the professional to connect their account.
     */
    generateAuthUrl(professionalId) {
        const auth = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );

        return auth.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent', // Force consent to ensure refresh_token is returned
            scope: [
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/calendar.readonly'
            ],
            state: professionalId
        });
    }

    /**
     * Exchanges auth code for tokens and saves them in the database.
     */
    async handleCallback(code, professionalId) {
        const auth = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri
        );

        const { tokens } = await auth.getToken(code);

        if (professionalId) {
            const professional = await prisma.professional.findUnique({
                where: { id: professionalId }
            });

            if (professional && professional.userId) {
                await prisma.user.update({
                    where: { id: professional.userId },
                    data: { googleTokens: tokens }
                });
                console.log(`[GoogleCalendar] ✅ Tokens successfully initialized and saved for User ${professional.userId}`);
            }
        }

        return tokens;
    }

    /**
     * Syncs an appointment to Google Calendar.
     */
    async syncAppointmentToGoogle(appointmentId) {
        try {
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                include: { professional: true, client: true, service: true, barbershop: true }
            });

            if (!appointment || !appointment.professional.googleTokens) {
                console.log(`[GoogleCalendar] skipping sync for App ${appointmentId}: No tokens found.`);
                return null;
            }

            const client = await this.getClient(appointment.professional.id, appointment.professional.googleTokens);
            if (!client) return null;

            const calendar = google.calendar({ version: 'v3', auth: client });

            const event = {
                summary: `${appointment.service.name} - ${appointment.client.name}`,
                location: appointment.barbershop.address,
                description: `Agendamento via Barbe-On\nProfissional: ${appointment.professional.name}\nStatus: ${appointment.status}`,
                start: {
                    dateTime: appointment.date.toISOString(),
                    timeZone: 'America/Sao_Paulo',
                },
                end: {
                    dateTime: new Date(appointment.date.getTime() + appointment.service.duration * 60000).toISOString(),
                    timeZone: 'America/Sao_Paulo',
                },
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            console.log(`[GoogleCalendar] 🚀 Event created: ${response.data.htmlLink}`);
            return response.data;
        } catch (error) {
            // Re-throw or return structured error to be handled by controller
            console.error('[GoogleCalendar] 🛑 Sync Error:', error.message);
            throw error; 
        }
    }

    /**
     * Placeholder for status check
     */
    async checkConnectionStatus(userId) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user?.googleTokens) return { connected: false };
            
            const client = await this.getClient(userId, user.googleTokens);
            // Attempt a tiny API call to verify
            const calendar = google.calendar({ version: 'v3', auth: client });
            await calendar.calendarList.list({ maxResults: 1 });
            
            return { connected: true, email: user.email };
        } catch (err) {
            return { connected: false, error: err.message };
        }
    }

    async blockSlotsFromGoogle(professionalId) {
        // Future implementation
    }
}

module.exports = new GoogleCalendarService();
