const { google } = require('googleapis');
const prisma = require('../../lib/prisma');

/**
 * GoogleCalendarService
 * Handles OAuth2 flow and bi-directional sync between App and Google Calendar.
 */
class GoogleCalendarService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    /**
     * Generates an Auth URL for the professional to connect their account.
     */
    generateAuthUrl(professionalId) {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/calendar.readonly'
            ],
            state: professionalId
        });
    }

    /**
     * Exchanges auth code for tokens and saves them in the database.
     * Note: Requires a field in the User/Professional model to store tokens.
     */
    async handleCallback(code, professionalId) {
        const { tokens } = await this.oauth2Client.getToken(code);

        // Save tokens to User via Professional
        // professionalId is passed as 'state'
        if (professionalId) {
            const professional = await prisma.professional.findUnique({
                where: { id: professionalId }
            });

            if (professional && professional.userId) {
                await prisma.user.update({
                    where: { id: professional.userId },
                    data: { googleTokens: tokens } // JSON field
                });
                console.log(`[GoogleCalendar] Tokens saved for User ${professional.userId}`);
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

            if (!appointment || !appointment.professional.googleTokens) return;

            this.oauth2Client.setCredentials(appointment.professional.googleTokens);
            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

            const event = {
                summary: `${appointment.service.name} - ${appointment.client.name}`,
                location: appointment.barbershop.address,
                description: `Agendamento via Barbe-On\nProfissional: ${appointment.professional.name}`,
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

            console.log(`[GoogleCalendar] Event created: ${response.data.htmlLink}`);
            return response.data;
        } catch (error) {
            console.error('[GoogleCalendar] Sync Error:', error.message);
        }
    }

    /**
     * Blocks slots in the App based on Google Calendar busy periods.
     */
    async blockSlotsFromGoogle(professionalId) {
        // Implementation:
        // 1. Fetch freebusy or list events from Google
        // 2. Identify external events (not created by our App)
        // 3. Create 'SQUEEZE_IN' or 'BLOCK' records in our system
    }
}

module.exports = new GoogleCalendarService();
